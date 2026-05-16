#!/usr/bin/env node
/**
 * Manage local Prompt Sensei settings.
 *
 * Usage:
 *   settings.js
 *   settings.js auto-observe on|off
 *   settings.js auto-observe user|folder
 *   settings.js save-redacted-prompts on|off
 *   settings.js auto-observe=off save-redacted-prompts=on
 */

import { spawnSync } from "child_process";
import { join } from "path";
import { detectHostFromSkillRoot, hostLabel } from "./lib/host";
import {
  ensureSettings,
  loadSettings,
  saveSettings,
  setAutoObserve,
  setSaveRedactedPrompts,
} from "./lib/settings";

function onOff(value: boolean): string {
  return value ? "on" : "off";
}

function granted(value: boolean): string {
  return value ? "granted" : "not granted";
}

function printSettings(): void {
  const settings = ensureSettings();
  const host = detectHostFromSkillRoot();
  console.log("Prompt Sensei Settings");
  console.log(`- Host: ${hostLabel(host)}`);
  console.log(`- Auto observe: ${onOff(settings.autoObserve)}`);
  if (host === "codex") {
    console.log("- Codex auto-start: supported with Codex hooks; use `settings auto-observe user|folder` to install.");
  }
  console.log(`- Save redacted prompts: ${onOff(settings.saveRedactedPrompts)}`);
  console.log(`- Save redacted prompts consent: ${granted(settings.consent.saveRedactedPrompts.granted)}`);
  console.log(`- Observe consent: ${granted(settings.consent.observe.granted)}`);
  console.log(`- Lookback consent: ${granted(settings.consent.lookback.granted)}`);
  if (settings.consent.lookback.granted && settings.consent.lookback.scope) {
    console.log(`- Lookback scope: ${settings.consent.lookback.scope}`);
  }
  console.log("- Storage: ~/.prompt-sensei/");
}

function parseToggle(value: string | undefined): boolean | null {
  const normalized = value?.toLowerCase();
  const enabledValues = ["on", "enable", "enabled", "true", "yes", "y", "1"];
  const disabledValues = ["off", "disable", "disabled", "false", "no", "n", "0"];
  if (normalized && enabledValues.includes(normalized)) {
    return true;
  }
  if (normalized && disabledValues.includes(normalized)) {
    return false;
  }
  return null;
}

type SettingName = "auto-observe" | "save-redacted-prompts";
type HookScope = "user" | "folder" | "system";

type SettingsOperation =
  | { kind: "auto-observe-toggle"; enabled: boolean }
  | { kind: "auto-observe-scope"; scope: HookScope }
  | { kind: "save-redacted-prompts-toggle"; enabled: boolean };

function normalizeToken(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replaceAll("_", "-");
}

function normalizeSettingName(value: string): SettingName | null {
  const normalized = normalizeToken(value);
  if (["auto", "auto-observe", "autoobserve", "auto-start", "autostart"].includes(normalized)) {
    return "auto-observe";
  }
  if (
    [
      "save-redacted-prompts",
      "save-redacted-prompt",
      "save-redacted",
      "redacted-prompts",
      "redacted-prompt",
      "redacted",
      "prompt-previews",
      "prompt-preview",
      "previews",
      "preview",
      "save-previews",
      "saveredactedprompts",
    ].includes(normalized)
  ) {
    return "save-redacted-prompts";
  }
  return null;
}

function readSettingName(args: string[], index: number): { name: SettingName; nextIndex: number } | null {
  for (let length = Math.min(3, args.length - index); length >= 1; length -= 1) {
    const joined = args.slice(index, index + length).join("-");
    const name = normalizeSettingName(joined);
    if (name) return { name, nextIndex: index + length };
  }
  return null;
}

function parseScope(value: string | undefined): HookScope | null {
  const normalized = normalizeToken(value ?? "");
  if (normalized === "user" || normalized === "global" || normalized === "machine" || normalized === "all") {
    return "user";
  }
  if (normalized === "folder" || normalized === "local" || normalized === "project" || normalized === "workspace") {
    return "folder";
  }
  if (normalized === "system") return "system";
  return null;
}

function operationFor(name: SettingName, rawValue: string | undefined): SettingsOperation | string {
  if (!rawValue) return `Missing value for ${name}.`;

  if (name === "auto-observe") {
    const scope = parseScope(rawValue);
    if (scope) return { kind: "auto-observe-scope", scope };
  }

  const enabled = parseToggle(rawValue);
  if (enabled === null) {
    return `Unknown value "${rawValue}" for ${name}. Use on/off, true/false, yes/no, or enable/disable.`;
  }

  if (name === "auto-observe") {
    return { kind: "auto-observe-toggle", enabled };
  }

  return { kind: "save-redacted-prompts-toggle", enabled };
}

function parseOperations(args: string[]): SettingsOperation[] | string {
  const operations: SettingsOperation[] = [];
  let index = args[0] === "set" ? 1 : 0;

  while (index < args.length) {
    const token = args[index];
    if (token.includes("=")) {
      const [rawName, ...rawValueParts] = token.split("=");
      const name = normalizeSettingName(rawName);
      const rawValue = rawValueParts.join("=");
      if (!name) return `Unknown setting "${rawName}".`;
      const operation = operationFor(name, rawValue);
      if (typeof operation === "string") return operation;
      operations.push(operation);
      index += 1;
      continue;
    }

    const valueFirst = parseToggle(token) !== null;
    if (valueFirst) {
      const setting = readSettingName(args, index + 1);
      if (!setting) return `Unknown setting after "${token}".`;
      const operation = operationFor(setting.name, token);
      if (typeof operation === "string") return operation;
      operations.push(operation);
      index = setting.nextIndex;
      continue;
    }

    const setting = readSettingName(args, index);
    if (!setting) return `Unknown setting "${token}".`;
    const operation = operationFor(setting.name, args[setting.nextIndex]);
    if (typeof operation === "string") return operation;
    operations.push(operation);
    index = setting.nextIndex + 1;
  }

  return operations;
}

function usage(): void {
  console.log(`Prompt Sensei Settings

Commands:
  settings
  settings auto-observe on
  settings auto-observe off
  settings auto-observe user
  settings auto-observe folder
  settings save-redacted-prompts on
  settings save-redacted-prompts off
  settings auto-observe=off save-redacted-prompts=on

Friendly aliases:
  on/off, enable/disable, true/false, yes/no
  redacted, previews, auto-start`);
}

function runHookSetup(scope: string): void {
  const script = join(__dirname, "setup-hooks.js");
  const result = spawnSync(process.execPath, [script, "auto-observe", scope], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function main(): void {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === "show") {
    printSettings();
    return;
  }

  if (command === "help" || command === "--help") {
    usage();
    return;
  }

  const operations = parseOperations(args);
  if (typeof operations === "string") {
    console.error(operations);
    usage();
    process.exit(1);
  }
  if (operations.length === 0) {
    usage();
    process.exit(1);
  }
  const scopeOperations = operations.filter((operation) => operation.kind === "auto-observe-scope");
  if (scopeOperations.length > 1) {
    console.error("Choose only one auto-observe hook scope per command.");
    usage();
    process.exit(1);
  }

  // Hook setup can fail on invalid external JSON. Run it before local settings
  // writes so a multi-setting command does not partially change preferences.
  for (const operation of scopeOperations) {
    runHookSetup(operation.scope);
  }

  for (const operation of operations) {
    if (operation.kind === "auto-observe-scope") continue;
    if (operation.kind === "auto-observe-toggle") {
      const host = detectHostFromSkillRoot();
      const settings = setAutoObserve(loadSettings(), operation.enabled);
      saveSettings(settings);
      console.log(`Auto observe: ${onOff(settings.autoObserve)}`);
      if (host === "codex" && settings.autoObserve) {
        console.log("Note: install Codex hooks with `settings auto-observe user` or `settings auto-observe folder` if you have not already.");
      }
      if (settings.autoObserve && !settings.consent.observe.granted) {
        console.log("Run `/prompt-sensei observe` once to grant observe consent before auto-start can begin.");
      }
      continue;
    }

    const settings = setSaveRedactedPrompts(loadSettings(), operation.enabled);
    saveSettings(settings);
    console.log(`Save redacted prompts: ${onOff(settings.saveRedactedPrompts)}`);
    if (settings.saveRedactedPrompts) {
      console.log("Only redacted prompt previews are stored. Raw prompt text is never stored.");
    }
  }
}

main();
