#!/usr/bin/env node
/**
 * Local smoke tests for release-critical settings and hook behavior.
 *
 * These tests use temporary HOME and project directories. They do not touch the
 * user's real Claude Code, Codex, or Prompt Sensei settings.
 */

import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "fs";
import { tmpdir } from "os";
import { basename, join, resolve } from "path";
import { spawnSync } from "child_process";

interface CommandResult {
  status: number | null;
  stdout: string;
  stderr: string;
}

interface CommandHook {
  type?: string;
  command?: string;
  timeout?: number;
  async?: boolean;
}

interface HookGroup {
  matcher?: string;
  hooks?: CommandHook[];
}

interface HookSettings {
  hooks?: Record<string, HookGroup[]>;
}

const SOURCE_ROOT = resolve(__dirname, "..", "..");
const DIST_ROOT = join(SOURCE_ROOT, "dist", "scripts");
const OBSERVE_JS = join(DIST_ROOT, "observe.js");
const SETTINGS_JS = join(DIST_ROOT, "settings.js");
const SETUP_HOOKS_JS = join(DIST_ROOT, "setup-hooks.js");
const CODEX_TITLE_PROMPT = [
  "You are a helpful assistant. You will be presented with a user prompt, and your job is to provide a short title for a task that will be created from that prompt.",
  "The tasks typically have to do with coding-related tasks, for example requests for bug fixes or questions about a codebase. The title you generate will be shown in the UI to represent the prompt.",
  "Generate a concise UI title (up to 36 characters) for this task.",
  "Fill the structured title field with plain text.",
  "Do not include quotes, markdown, formatting characters, or trailing punctuation in the title value.",
].join("\n");

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function run(
  script: string,
  args: string[],
  options: { home: string; cwd?: string; expectFailure?: boolean; input?: string }
): CommandResult {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: options.cwd ?? SOURCE_ROOT,
    env: {
      ...process.env,
      HOME: options.home,
      PROMPT_SENSEI_DISABLE_UPDATE_CHECK: "1",
    },
    encoding: "utf8",
    input: options.input,
    stdio: ["pipe", "pipe", "pipe"],
  });

  const failed = (result.status ?? 1) !== 0;
  if (failed !== Boolean(options.expectFailure)) {
    throw new Error(
      [
        `Unexpected command ${failed ? "failure" : "success"}: node ${script} ${args.join(" ")}`,
        result.stdout.trim(),
        result.stderr.trim(),
      ]
        .filter(Boolean)
        .join("\n")
    );
  }

  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function eventHooks(settings: HookSettings, event: string): CommandHook[] {
  return settings.hooks?.[event]?.flatMap((group) => group.hooks ?? []) ?? [];
}

function copyCodexInstall(target: string): void {
  cpSync(SOURCE_ROOT, target, {
    recursive: true,
    filter: (path) => ![".git", "node_modules"].includes(basename(path)),
  });
}

function testSettingsAliases(root: string): void {
  const home = join(root, "settings-home");
  run(SETTINGS_JS, ["auto-observe=off", "save-redacted-prompts=on"], { home });
  const output = run(SETTINGS_JS, [], { home }).stdout;
  assert(output.includes("- Auto observe: off"), "settings alias smoke: auto observe should be off");
  assert(output.includes("- Save redacted prompts: on"), "settings alias smoke: redacted previews should be on");
  assert(output.includes("- Save redacted prompts consent: granted"), "settings alias smoke: redacted consent should be granted");
}

function testRejectsMultipleScopes(root: string): void {
  const home = join(root, "multiple-scopes-home");
  const result = run(SETTINGS_JS, ["auto-observe", "user", "auto-observe", "folder"], {
    home,
    expectFailure: true,
  });
  assert(result.stderr.includes("Choose only one auto-observe hook scope"), "multiple scope smoke: expected scope error");
}

function testClaudeHooks(root: string): void {
  const home = join(root, "claude-home");
  run(SETUP_HOOKS_JS, ["auto-observe", "user"], { home });
  const settings = readJson<HookSettings>(join(home, ".claude", "settings.json"));

  assert(eventHooks(settings, "SessionStart").length === 1, "Claude hook smoke: missing SessionStart");
  assert(eventHooks(settings, "UserPromptSubmit").some((hook) => hook.async === true), "Claude hook smoke: UserPromptSubmit should be async");
  assert(eventHooks(settings, "Stop").length === 1, "Claude hook smoke: missing Stop");
  assert(eventHooks(settings, "PreCompact").length === 1, "Claude hook smoke: missing PreCompact");
}

function testCodexHooks(root: string): void {
  const codexRoot = join(root, ".codex", "skills", "prompt-sensei");
  copyCodexInstall(codexRoot);

  const userHome = join(root, "codex-user-home");
  run(join(codexRoot, "dist", "scripts", "setup-hooks.js"), ["auto-observe", "user"], { home: userHome });
  const userSettings = readJson<HookSettings>(join(userHome, ".codex", "hooks.json"));
  const userPromptHooks = eventHooks(userSettings, "UserPromptSubmit");
  assert(eventHooks(userSettings, "SessionStart").length === 1, "Codex user hook smoke: missing SessionStart");
  assert(userPromptHooks.length === 1, "Codex user hook smoke: missing UserPromptSubmit");
  assert(userPromptHooks.every((hook) => hook.async === undefined), "Codex user hook smoke: command hooks must not be async");
  assert(eventHooks(userSettings, "Stop").length === 1, "Codex user hook smoke: missing Stop");
  assert(eventHooks(userSettings, "PreCompact").length === 0, "Codex user hook smoke: should not install PreCompact");

  const folderHome = join(root, "codex-folder-home");
  const project = join(root, "project");
  mkdirSync(project, { recursive: true });
  run(join(codexRoot, "dist", "scripts", "setup-hooks.js"), ["auto-observe", "folder"], {
    home: folderHome,
    cwd: project,
  });
  assert(existsSync(join(project, ".codex", "hooks.json")), "Codex folder hook smoke: missing project hooks.json");
}

function testIgnoresCodexTitlePrompt(root: string): void {
  const home = join(root, "title-prompt-home");
  run(OBSERVE_JS, ["--init"], { home });
  run(OBSERVE_JS, ["--hash-only"], {
    home,
    input: JSON.stringify({ prompt: CODEX_TITLE_PROMPT }),
  });

  const events = readFileSync(join(home, ".prompt-sensei", "events.jsonl"), "utf8")
    .trimEnd()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as { type?: string });

  assert(
    events.every((event) => event.type !== "prompt-hashed"),
    "title prompt smoke: host-generated Codex title prompt should not be hashed"
  );
}

function main(): void {
  assert(existsSync(SETTINGS_JS), "Run `npm run build` before `npm run smoke`.");
  const root = mkdtempSync(join(tmpdir(), "prompt-sensei-smoke-"));

  try {
    testSettingsAliases(root);
    testRejectsMultipleScopes(root);
    testClaudeHooks(root);
    testCodexHooks(root);
    testIgnoresCodexTitlePrompt(root);
    console.log("Prompt Sensei smoke tests passed.");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

main();
