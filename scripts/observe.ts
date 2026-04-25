#!/usr/bin/env node
/**
 * Record a prompt observation to the local session store.
 *
 * Usage:
 *   observe.js --init
 *   observe.js --hash-only
 *   observe.js --stage execution --score 3.8 --task-type debugging --flags missing-context,no-constraints
 *
 * Raw prompt text is never stored. Only metadata: timestamp, stage, task type,
 * score, and lightweight flags. A SHA-256 hash of the prompt may be stored
 * if the prompt text is provided via stdin and hashing is enabled.
 *
 * Storage: ~/.prompt-sensei/events.jsonl
 */

import { createHash } from "crypto";
import { mkdirSync, appendFileSync, writeFileSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import * as readline from "readline";

const DATA_DIR = join(homedir(), ".prompt-sensei");
const EVENTS_FILE = join(DATA_DIR, "events.jsonl");
const CONFIG_FILE = join(DATA_DIR, "config.json");

// Patterns for redacting sensitive data before hashing
const REDACT_PATTERNS: Array<[RegExp, string]> = [
  [/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, "[EMAIL]"],
  [/\b(sk-|sk-ant-|ghp_|github_pat_|xox[baprs]-)[A-Za-z0-9\-_]{10,}/g, "[API_KEY]"],
  [/\b(password|passwd|secret|token|api_?key)\s*[:=]\s*\S+/gi, "[CREDENTIAL]"],
  [/-----BEGIN [A-Z ]+-----[\s\S]+?-----END [A-Z ]+-----/g, "[PRIVATE_KEY]"],
  [/https?:\/\/[^\s]+\?[^\s]+/g, "[URL_WITH_PARAMS]"],
];

function redact(text: string): string {
  let result = text;
  for (const [pattern, replacement] of REDACT_PATTERNS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

function hashPrompt(text: string): string {
  const redacted = redact(text);
  return createHash("sha256").update(redacted).digest("hex").slice(0, 16);
}

function ensureDataDir(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

function parseArgs(argv: string[]): Record<string, string | boolean> {
  const result: Record<string, string | boolean> = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith("--")) {
        result[key] = next;
        i++;
      } else {
        result[key] = true;
      }
    }
  }
  return result;
}

interface Config {
  v: number;
  consentGiven: boolean;
  consentAt: string;
  storeRaw?: boolean;
}

function loadConfig(): Config | null {
  if (!existsSync(CONFIG_FILE)) return null;
  try {
    return JSON.parse(readFileSync(CONFIG_FILE, "utf8")) as Config;
  } catch {
    return null;
  }
}

function saveConfig(config: Config): void {
  ensureDataDir();
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + "\n", "utf8");
}

interface PromptEvent {
  v: 1;
  ts: string;
  type: "session-start" | "prompt-observed" | "prompt-hashed";
  stage?: string;
  taskType?: string;
  score?: number;
  flags?: string[];
  promptHash?: string;
}

function appendEvent(event: PromptEvent): void {
  ensureDataDir();
  appendFileSync(EVENTS_FILE, JSON.stringify(event) + "\n", "utf8");
}

async function readStdin(): Promise<string> {
  if (process.stdin.isTTY) return "";
  const rl = readline.createInterface({ input: process.stdin });
  const lines: string[] = [];
  for await (const line of rl) {
    lines.push(line);
  }
  return lines.join("\n");
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv);

  if (args["init"] === true) {
    const config = loadConfig();
    if (!config) {
      // First run — SKILL.md already showed the consent prompt and got confirmation
      // Create config and log session-start now
      ensureDataDir();
      saveConfig({
        v: 1,
        consentGiven: true,
        consentAt: new Date().toISOString(),
      });
      appendEvent({
        v: 1,
        ts: new Date().toISOString(),
        type: "session-start",
      });
      console.log(`Session started. Data: ${DATA_DIR}`);
      return;
    }

    appendEvent({
      v: 1,
      ts: new Date().toISOString(),
      type: "session-start",
    });

    saveConfig({
      ...config,
      consentGiven: true,
      consentAt: config.consentAt ?? new Date().toISOString(),
    });

    console.log("Session started.");
    return;
  }

  const config = loadConfig();
  if (!config?.consentGiven) {
    process.stderr.write(
      "Prompt Sensei has not been initialized. Run `/prompt-sensei observe` and consent before recording observations.\n"
    );
    return;
  }

  const hasObservationArgs =
    args["stage"] !== undefined ||
    args["score"] !== undefined ||
    args["task-type"] !== undefined ||
    args["flags"] !== undefined;
  const hashOnly = args["hash-only"] === true || !hasObservationArgs;
  const stdinText = await readStdin();

  if (hashOnly) {
    if (!stdinText.trim()) return;
    appendEvent({
      v: 1,
      ts: new Date().toISOString(),
      type: "prompt-hashed",
      promptHash: hashPrompt(stdinText),
    });
    return;
  }

  // Record a scored prompt observation. This path is used by the skill after it
  // classifies and scores the prompt in conversation context.
  const stage = args["stage"] ? String(args["stage"]) : "unknown";
  const score = args["score"] !== undefined ? parseFloat(String(args["score"])) : undefined;
  const taskType = args["task-type"] ? String(args["task-type"]) : "other";
  const flagsRaw = args["flags"] ? String(args["flags"]) : "";
  const flags = flagsRaw ? flagsRaw.split(",").map((f) => f.trim()).filter(Boolean) : [];

  if (score !== undefined && (isNaN(score) || score < 1 || score > 5)) {
    process.stderr.write("Error: --score must be between 1 and 5\n");
    process.exit(1);
  }

  appendEvent({
    v: 1,
    ts: new Date().toISOString(),
    type: "prompt-observed",
    stage,
    taskType,
    ...(score !== undefined && { score }),
    ...(flags.length > 0 && { flags }),
    ...(stdinText.trim() && { promptHash: hashPrompt(stdinText) }),
  });
}

main().catch((err) => {
  process.stderr.write(`observe error: ${err}\n`);
  process.exit(1);
});
