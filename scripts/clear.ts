#!/usr/bin/env node
/**
 * Delete all local session data.
 * Usage: npx ts-node scripts/clear.ts [--force]
 */

import fs from "fs";
import path from "path";
import readline from "readline";

const DATA_DIR = path.join(process.cwd(), ".prompt-sensei");

function countSessions(): { files: number; entries: number } {
  if (!fs.existsSync(DATA_DIR)) return { files: 0, entries: 0 };
  const files = fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.startsWith("session-") && f.endsWith(".jsonl"));

  let entries = 0;
  for (const file of files) {
    const lines = fs
      .readFileSync(path.join(DATA_DIR, file), "utf8")
      .split("\n")
      .filter(Boolean);
    entries += lines.length;
  }
  return { files: files.length, entries };
}

function deleteAll() {
  if (!fs.existsSync(DATA_DIR)) {
    console.log("Nothing to clear — no session data found.");
    return;
  }
  const files = fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.startsWith("session-") && f.endsWith(".jsonl"));
  for (const file of files) {
    fs.unlinkSync(path.join(DATA_DIR, file));
  }
  console.log(`Cleared ${files.length} session file(s). Fresh start.`);
}

function main() {
  const force = process.argv.includes("--force");
  const { files, entries } = countSessions();

  if (files === 0) {
    console.log("Nothing to clear — no session data found.");
    return;
  }

  if (force) {
    deleteAll();
    return;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(
    `Delete ${files} session file(s) containing ${entries} prompt entries? [y/N] `,
    (answer) => {
      rl.close();
      if (answer.toLowerCase() === "y") {
        deleteAll();
      } else {
        console.log("Aborted. Data preserved.");
      }
    }
  );
}

main();
