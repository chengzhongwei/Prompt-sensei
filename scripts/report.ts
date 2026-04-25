#!/usr/bin/env node
/**
 * Generate a report from all local session data.
 * Usage: npx ts-node scripts/report.ts [--days 7]
 */

import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".prompt-sensei");

interface PromptEntry {
  ts: string;
  score: number;
  grade: string;
  charCount?: number;
  summary?: string;
}

function gradeLabel(score: number): string {
  if (score >= 90) return "Master";
  if (score >= 75) return "Skilled";
  if (score >= 55) return "Developing";
  if (score >= 35) return "Beginner";
  return "Needs work";
}

function bar(value: number, max: number, width = 20): string {
  const filled = Math.round((value / max) * width);
  return "█".repeat(filled) + "░".repeat(width - filled);
}

function loadEntries(days: number): PromptEntry[] {
  if (!fs.existsSync(DATA_DIR)) return [];

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const files = fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.startsWith("session-") && f.endsWith(".jsonl"))
    .sort();

  const entries: PromptEntry[] = [];
  for (const file of files) {
    const lines = fs
      .readFileSync(path.join(DATA_DIR, file), "utf8")
      .split("\n")
      .filter(Boolean);
    for (const line of lines) {
      try {
        const entry = JSON.parse(line) as PromptEntry;
        if (new Date(entry.ts) >= cutoff) {
          entries.push(entry);
        }
      } catch {
        // skip malformed lines
      }
    }
  }
  return entries;
}

function main() {
  const daysArg = process.argv.find((a) => a.startsWith("--days="));
  const days = daysArg ? parseInt(daysArg.split("=")[1]) : 30;

  const entries = loadEntries(days);

  if (entries.length === 0) {
    console.log("No session data found.");
    console.log(
      "Activate observation mode with /prompt-sensei observe to start tracking."
    );
    return;
  }

  const scores = entries.map((e) => e.score);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const trend = scores.length >= 3 ? scores.slice(-3) : scores;
  const trendAvg = trend.reduce((a, b) => a + b, 0) / trend.length;

  const gradeCounts: Record<string, number> = {
    Master: 0,
    Skilled: 0,
    Developing: 0,
    Beginner: 0,
    "Needs work": 0,
  };
  for (const e of entries) {
    const g = gradeLabel(e.score);
    gradeCounts[g] = (gradeCounts[g] ?? 0) + 1;
  }

  console.log("\n╔══════════════════════════════════════╗");
  console.log("║        Prompt Sensei Report          ║");
  console.log("╚══════════════════════════════════════╝\n");
  console.log(`Period:   last ${days} days`);
  console.log(`Prompts:  ${entries.length}`);
  console.log(`Average:  ${avg.toFixed(1)}/100 — ${gradeLabel(avg)}`);
  console.log(`Range:    ${min} – ${max}`);
  console.log(
    `Trend:    ${trendAvg.toFixed(1)} (last ${trend.length} prompts) ${trendAvg > avg ? "↑" : trendAvg < avg ? "↓" : "→"}`
  );
  console.log("\nGrade distribution:");

  for (const [grade, count] of Object.entries(gradeCounts)) {
    if (count === 0) continue;
    const pct = ((count / entries.length) * 100).toFixed(0);
    console.log(`  ${grade.padEnd(12)} ${bar(count, entries.length)} ${count} (${pct}%)`);
  }

  const recent = entries.slice(-5).reverse();
  if (recent.length > 0) {
    console.log("\nRecent prompts:");
    for (const e of recent) {
      const date = new Date(e.ts).toLocaleDateString();
      const tip = e.summary ? `  ← ${e.summary}` : "";
      console.log(`  ${date}  ${String(e.score).padStart(3)}/100  ${e.grade}${tip}`);
    }
  }

  console.log(
    `\n${avg >= 75 ? "Strong work. Keep pushing for Master-level clarity." : "Focus on explicit constraints and context richness — they move scores fastest."}`
  );
  console.log();
}

main();
