#!/usr/bin/env node
/**
 * Install Prompt Sensei hooks for opt-in auto observe.
 *
 * Usage:
 *   setup-hooks.js auto-observe user
 *   setup-hooks.js auto-observe folder
 *   setup-hooks.js auto-observe off
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { homedir } from "os";
import { dirname, join, resolve } from "path";
import { detectHostFromSkillRoot } from "./lib/host";
import {
  loadSettings,
  saveSettings,
  setAutoObserve as setAutoObserveSetting,
} from "./lib/settings";

type HookScope = "user" | "folder";

interface CommandHook {
  type: "command";
  command: string;
  timeout?: number;
  async?: boolean;
}

interface HookGroup {
  matcher?: string;
  hooks?: CommandHook[];
}

interface HookSettings {
  hooks?: Record<string, HookGroup[]>;
  [key: string]: unknown;
}

const SKILL_ROOT = resolve(__dirname, "..", "..");
const HOST = detectHostFromSkillRoot(SKILL_ROOT);

function usage(): void {
  console.log(`Prompt Sensei Hook Setup

Commands:
  setup-hooks auto-observe user     Install auto observe hooks for this host at user scope
  setup-hooks auto-observe folder   Install auto observe hooks for this host at folder scope
  setup-hooks auto-observe off      Turn auto observe off; installed hooks stay inert`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function shellQuote(path: string): string {
  return `"${path.replace(/(["\\$`])/g, "\\$1")}"`;
}

function hookCommand(script: string, args = ""): string {
  return `node ${shellQuote(join(SKILL_ROOT, "dist", "scripts", script))}${args ? ` ${args}` : ""}`;
}

function settingsPath(scope: HookScope): string {
  if (HOST === "codex") {
    if (scope === "user") return join(homedir(), ".codex", "hooks.json");
    return join(process.cwd(), ".codex", "hooks.json");
  }
  if (scope === "user") return join(homedir(), ".claude", "settings.json");
  return join(process.cwd(), ".claude", "settings.local.json");
}

function loadHookSettings(path: string): HookSettings {
  if (!existsSync(path)) return {};
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as unknown;
    return isRecord(parsed) ? (parsed as HookSettings) : {};
  } catch {
    process.stderr.write(`Could not parse ${path}. Fix the JSON before running hook setup.\n`);
    process.exit(1);
  }
}

function ensureHook(settings: HookSettings, event: string, matcher: string, hook: CommandHook): void {
  settings.hooks ??= {};
  const groups = settings.hooks[event] ?? [];
  let group = groups.find((candidate) => candidate.matcher === matcher);
  if (!group) {
    group = { matcher, hooks: [] };
    groups.push(group);
  }
  group.hooks ??= [];

  const existing = group.hooks.find((candidate) => candidate.command === hook.command);
  if (existing) {
    existing.type = hook.type;
    existing.timeout = hook.timeout;
    existing.async = hook.async;
    return;
  }

  group.hooks.push(hook);
  settings.hooks[event] = groups;
}

function removeGeneratedHook(settings: HookSettings, event: string, matcher: string, command: string): void {
  const groups = settings.hooks?.[event];
  if (!groups) return;

  settings.hooks![event] = groups
    .map((group) => {
      if (group.matcher !== matcher || !group.hooks) return group;
      return {
        ...group,
        hooks: group.hooks.filter((hook) => hook.command !== command),
      };
    })
    .filter((group) => (group.hooks?.length ?? 0) > 0);
}

function removeGeneratedHookFromMatchers(settings: HookSettings, event: string, matchers: string[], command: string): void {
  for (const matcher of matchers) {
    removeGeneratedHook(settings, event, matcher, command);
  }
}

function installClaudeHooks(settings: HookSettings): void {
  const sessionStartCommand = hookCommand("session-start.js");

  removeGeneratedHookFromMatchers(settings, "SessionStart", ["startup|resume|compact"], sessionStartCommand);
  ensureHook(settings, "SessionStart", "*", {
    type: "command",
    command: sessionStartCommand,
    timeout: 10,
  });
  ensureHook(settings, "UserPromptSubmit", "", {
    type: "command",
    command: hookCommand("observe.js", "--hash-only"),
    async: true,
    timeout: 10,
  });
  ensureHook(settings, "Stop", "", {
    type: "command",
    command: hookCommand("stop.js"),
    timeout: 10,
  });
  ensureHook(settings, "PreCompact", "manual|auto", {
    type: "command",
    command: hookCommand("pre-compact.js"),
    timeout: 10,
  });
}

function installCodexHooks(settings: HookSettings): void {
  const sessionStartCommand = hookCommand("session-start.js");
  const userPromptSubmitCommand = hookCommand("observe.js", "--hash-only");
  const stopCommand = hookCommand("stop.js");

  removeGeneratedHookFromMatchers(settings, "SessionStart", ["*", "startup|resume|clear"], sessionStartCommand);
  removeGeneratedHookFromMatchers(settings, "UserPromptSubmit", ["", "*"], userPromptSubmitCommand);
  removeGeneratedHookFromMatchers(settings, "Stop", ["", "*"], stopCommand);

  ensureHook(settings, "SessionStart", "startup|resume|clear", {
    type: "command",
    command: sessionStartCommand,
    timeout: 10,
  });
  ensureHook(settings, "UserPromptSubmit", "", {
    type: "command",
    command: userPromptSubmitCommand,
    timeout: 10,
  });
  ensureHook(settings, "Stop", "", {
    type: "command",
    command: stopCommand,
    timeout: 10,
  });
}

function installHooks(scope: HookScope): string {
  const target = settingsPath(scope);
  const settings = loadHookSettings(target);

  if (HOST === "codex") {
    installCodexHooks(settings);
  } else {
    installClaudeHooks(settings);
  }

  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, JSON.stringify(settings, null, 2) + "\n", "utf8");
  return target;
}

function updateAutoObserve(enabled: boolean): void {
  saveSettings(setAutoObserveSetting(loadSettings(), enabled));
}

function main(): void {
  const command = process.argv[2];
  const value = process.argv[3];

  if (command !== "auto-observe") {
    usage();
    process.exit(command ? 1 : 0);
  }

  if (value === "off" || value === "none" || value === "no") {
    updateAutoObserve(false);
    console.log("Auto observe: off");
    console.log("Installed hooks, if any, will stay quiet while auto observe is off.");
    return;
  }

  const scope = value === "system" ? "user" : value;
  if (scope !== "user" && scope !== "folder") {
    usage();
    process.exit(1);
  }

  const target = installHooks(scope);
  updateAutoObserve(true);
  console.log("Auto observe: on");
  console.log(`Hook host: ${HOST === "codex" ? "Codex" : "Claude Code"}`);
  console.log(`Hook scope: ${scope}`);
  console.log(`Updated: ${target}`);
  if (HOST === "codex") {
    console.log("Review new or changed Codex hooks with `/hooks` if Codex asks for trust.");
  }
}

main();
