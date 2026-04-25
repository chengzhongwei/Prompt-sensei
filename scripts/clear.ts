#!/usr/bin/env node
/**
 * Delete local session data.
 * Usage: clear.js [--force] [--all]
 *
 * --force   Skip confirmation prompt
 * --all     Also delete config.json (resets consent)
 */

import { existsSync, unlinkSync, statSync, readFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import * as readline from "readline";

const DATA_DIR = join(homedir(), ".prompt-sensei");
const EVENTS_FILE = join(DATA_DIR, "events.jsonl");
const CONFIG_FILE = join(DATA_DIR, "config.json");

function countEntries(): number {
  if (!existsSync(EVENTS_FILE)) return 0;
  return readFileSync(EVENTS_FILE, "utf8")
    .split("\n")
    .filter((l) => l.trim() && l.includes("prompt-observed")).length;
}

function deleteData(all: boolean): void {
  let deleted = 0;

  if (existsSync(EVENTS_FILE)) {
    unlinkSync(EVENTS_FILE);
    deleted++;
    console.log(`Deleted: ${EVENTS_FILE}`);
  }

  if (all && existsSync(CONFIG_FILE)) {
    unlinkSync(CONFIG_FILE);
    deleted++;
    console.log(`Deleted: ${CONFIG_FILE}`);
    console.log("Consent reset. Prompt Sensei will ask for consent again on next use.");
  }

  if (deleted === 0) {
    console.log("Nothing to delete — no data found.");
  } else {
    console.log("Done. Fresh start.");
  }
}

async function confirm(question: string): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y");
    });
  });
}

async function main(): Promise<void> {
  const force = process.argv.includes("--force");
  const all = process.argv.includes("--all");

  const entries = countEntries();

  if (entries === 0 && !existsSync(CONFIG_FILE)) {
    console.log("Nothing to clear — no session data found.");
    return;
  }

  if (force) {
    deleteData(all);
    return;
  }

  const what = all ? "events and config (resets consent)" : "events";
  const ok = await confirm(
    `Delete ${entries} prompt entries (${what})? [y/N] `
  );

  if (ok) {
    deleteData(all);
  } else {
    console.log("Aborted. Data preserved.");
  }
}

main().catch((err) => {
  process.stderr.write(`clear error: ${err}\n`);
  process.exit(1);
});
