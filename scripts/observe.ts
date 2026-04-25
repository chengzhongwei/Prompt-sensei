#!/usr/bin/env node
/**
 * Record a prompt entry to the local session store.
 * Usage: npx ts-node scripts/observe.ts --score 72 --grade "Developing" [--summary "top tip text"]
 *
 * Raw prompt text is NOT stored by default. Only metadata (score, grade, timestamp, char count)
 * is written. Pass --store-prompt to opt in to full text storage.
 */

import fs from "fs";
import path from "path";
import os from "os";

const DATA_DIR = path.join(process.cwd(), ".prompt-sensei");
const SESSION_FILE = path.join(
  DATA_DIR,
  `session-${new Date().toISOString().slice(0, 10)}.jsonl`
);

interface PromptEntry {
  ts: string;
  score: number;
  grade: string;
  charCount?: number;
  summary?: string;
  prompt?: string;
}

function parseArgs(argv: string[]): Record<string, string | boolean> {
  const result: Record<string, string | boolean> = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        result[key] = next;
        i++;
      } else {
        result[key] = true;
      }
    }
  }
  return result;
}

function main() {
  const args = parseArgs(process.argv);

  const score = Number(args["score"]);
  const grade = String(args["grade"] ?? "Unknown");
  const summary = args["summary"] ? String(args["summary"]) : undefined;
  const charCount = args["char-count"] ? Number(args["char-count"]) : undefined;
  const storePrompt = args["store-prompt"] === true;
  const promptText = storePrompt && args["prompt"] ? String(args["prompt"]) : undefined;

  if (isNaN(score) || score < 0 || score > 100) {
    console.error("Error: --score must be a number between 0 and 100");
    process.exit(1);
  }

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const entry: PromptEntry = {
    ts: new Date().toISOString(),
    score,
    grade,
    ...(charCount !== undefined && { charCount }),
    ...(summary && { summary }),
    ...(promptText && { prompt: promptText }),
  };

  fs.appendFileSync(SESSION_FILE, JSON.stringify(entry) + os.EOL, "utf8");
  console.log(`Recorded: score=${score} grade=${grade} -> ${SESSION_FILE}`);
}

main();
