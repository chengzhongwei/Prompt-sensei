#!/usr/bin/env node
/**
 * Generate a session report from local observation data.
 * Usage: report.js [--days 7]
 *
 * Reads ~/.prompt-sensei/events.jsonl and prints a Markdown report to stdout.
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const DATA_DIR = join(homedir(), ".prompt-sensei");
const EVENTS_FILE = join(DATA_DIR, "events.jsonl");

interface PromptEvent {
  v: number;
  ts: string;
  type: string;
  stage?: string;
  taskType?: string;
  score?: number;
  flags?: string[];
}

function loadEvents(days: number): PromptEvent[] {
  if (!existsSync(EVENTS_FILE)) return [];

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const lines = readFileSync(EVENTS_FILE, "utf8")
    .split("\n")
    .filter(Boolean);

  const events: PromptEvent[] = [];
  for (const line of lines) {
    try {
      const event = JSON.parse(line) as PromptEvent;
      if (
        event.type === "prompt-observed" &&
        new Date(event.ts) >= cutoff
      ) {
        events.push(event);
      }
    } catch {
      // skip malformed lines
    }
  }
  return events;
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function gradeLabel(score: number): string {
  if (score >= 4.5) return "Excellent";
  if (score >= 3.5) return "Good";
  if (score >= 2.5) return "Developing";
  if (score >= 1.5) return "Early stage";
  return "Needs work";
}

function topN<T>(map: Map<T, number>, n: number): Array<[T, number]> {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}

function sparkline(scores: number[]): string {
  const chars = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
  return scores
    .map((s) => chars[Math.min(Math.floor((s / 5) * chars.length), chars.length - 1)])
    .join("");
}

function generateEncouragement(
  avgScore: number,
  trend: number,
  topStage: string,
  topFlags: Array<[string, number]>
): string {
  const lines: string[] = [];

  if (trend > 0.2) {
    lines.push("Your scores are trending upward. The practice is working.");
  } else if (trend < -0.2) {
    lines.push(
      "Your scores dipped recently. That can happen when tasks get harder — keep going."
    );
  } else {
    lines.push("Your scores are steady. Ready to push to the next level?");
  }

  if (avgScore >= 4.5) {
    lines.push("You are consistently writing execution-ready prompts. That's a real skill.");
  } else if (avgScore >= 3.5) {
    lines.push(
      "You are writing good prompts. One more habit — verification steps — will take you to the next level."
    );
  } else if (avgScore >= 2.5) {
    lines.push(
      "You are in the developing stage. The gap between where you are and 'good' is smaller than it feels."
    );
  } else {
    lines.push(
      "Every expert started with exploration prompts. Focus on one dimension at a time."
    );
  }

  if (topFlags.length > 0) {
    const [topFlag] = topFlags[0];
    const flagHints: Record<string, string> = {
      "missing-context": "Try adding the error message or stack trace to every debugging prompt.",
      "no-constraints": "Add at least one constraint to implementation prompts ('don't change the API', 'no new deps').",
      "no-verification": "End implementation prompts with 'Return: test command and edge cases to verify.'",
      "no-output-format": "Specify the format: 'Return: 1. Root cause 2. Fix 3. Test command'",
      "missing-input-boundaries": "Name the specific file and function, not just the module.",
    };
    const hint = flagHints[topFlag];
    if (hint) {
      lines.push(`\nMain growth area: ${hint}`);
    }
  }

  return lines.join("\n");
}

function main(): void {
  const daysArg = process.argv.find((a) => a.startsWith("--days="));
  const days = daysArg ? parseInt(daysArg.split("=")[1]!) : 7;

  const events = loadEvents(days);

  if (events.length === 0) {
    console.log("No session data found.");
    console.log(
      "Activate observation with `/prompt-sensei observe` to start tracking."
    );
    return;
  }

  const scores = events.map((e) => e.score).filter((s): s is number => s !== undefined);
  const avgScore = avg(scores);
  const recent3 = scores.slice(-3);
  const older3 = scores.slice(-6, -3);
  const trend = recent3.length > 0 && older3.length > 0
    ? avg(recent3) - avg(older3)
    : 0;

  const stageCounts = new Map<string, number>();
  const taskCounts = new Map<string, number>();
  const flagCounts = new Map<string, number>();

  for (const event of events) {
    if (event.stage) {
      stageCounts.set(event.stage, (stageCounts.get(event.stage) ?? 0) + 1);
    }
    if (event.taskType) {
      taskCounts.set(event.taskType, (taskCounts.get(event.taskType) ?? 0) + 1);
    }
    for (const flag of event.flags ?? []) {
      flagCounts.set(flag, (flagCounts.get(flag) ?? 0) + 1);
    }
  }

  const topStage = topN(stageCounts, 1)[0]?.[0] ?? "unknown";
  const topTask = topN(taskCounts, 1)[0]?.[0] ?? "unknown";
  const topFlags = topN(flagCounts, 3);

  const trendSymbol = trend > 0.1 ? "↑" : trend < -0.1 ? "↓" : "→";

  console.log("# Prompt Sensei Report");
  console.log(`Observed ${events.length} prompts in the last ${days} days.\n`);
  console.log(`**Average score:**    ${avgScore.toFixed(1)} / 5  (${gradeLabel(avgScore)})`);
  console.log(`**Trend:**            ${trendSymbol}  ${Math.abs(trend).toFixed(1)} vs previous period`);
  console.log(`**Most common type:** ${topTask}`);
  console.log(`**Most common stage:** ${topStage}`);

  if (scores.length >= 3) {
    console.log(`\n**Score history:**    ${sparkline(scores.slice(-20))}`);
  }

  if (topFlags.length > 0) {
    console.log("\n## Most common gaps");
    for (const [flag, count] of topFlags) {
      console.log(`- ${flag} (${count}×)`);
    }
  }

  const stageEntries = topN(stageCounts, 5);
  if (stageEntries.length > 0) {
    console.log("\n## Stage breakdown");
    for (const [stage, count] of stageEntries) {
      const pct = ((count / events.length) * 100).toFixed(0);
      console.log(`- ${stage}: ${count} (${pct}%)`);
    }
  }

  console.log("\n## Feedback");
  console.log(generateEncouragement(avgScore, trend, topStage, topFlags));
}

main();
