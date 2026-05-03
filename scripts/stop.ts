#!/usr/bin/env node
/**
 * Claude Code Stop hook support for quiet auto-observe persistence.
 *
 * This hook parses the final Sensei line from Claude's response and records a
 * scored prompt observation without requiring a visible Bash tool call.
 */

import { appendFileSync, existsSync, readFileSync } from "fs";
import * as readline from "readline";
import { EVENTS_FILE } from "./lib/paths";
import { ensureDataDir, hasObserveConsent, loadSettings } from "./lib/settings";

interface StopInput {
  hook_event_name?: string;
  stop_hook_active?: boolean;
  last_assistant_message?: string;
}

interface PromptEvent {
  v: 1;
  ts: string;
  type: "prompt-observed";
  stage: string;
  taskType: string;
  score: number;
  source: "stop-hook";
}

interface HistoricalPromptEvent {
  ts?: string;
  type?: string;
  stage?: string;
  score?: number;
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

function parseInput(stdinText: string): StopInput {
  try {
    const parsed = JSON.parse(stdinText) as unknown;
    return typeof parsed === "object" && parsed !== null ? (parsed as StopInput) : {};
  } catch {
    return {};
  }
}

function normalizeStage(stage: string): string {
  return stage.trim().toLowerCase().replace(/\s+/g, "-");
}

function parseSenseiLine(message: string): { score: number; stage: string } | null {
  if (/Sensei:\s*skipped grading for low-signal prompt/i.test(message)) {
    return null;
  }

  const match = message.match(/Sensei:\s*(\d{1,3})\s*\/\s*100\s*[·-]\s*([^;\]\n]+)/i);
  if (!match) return null;

  const score100 = Number(match[1]);
  if (!Number.isFinite(score100) || score100 < 0 || score100 > 100) return null;

  return {
    score: Math.max(1, Math.min(5, score100 / 20)),
    stage: normalizeStage(match[2]),
  };
}

function appendEvent(event: PromptEvent): void {
  ensureDataDir();
  appendFileSync(EVENTS_FILE, JSON.stringify(event) + "\n", "utf8");
}

function sameScore(left: unknown, right: number): boolean {
  return typeof left === "number" && Math.abs(left - right) < 0.001;
}

function wasRecentlyRecorded(parsed: { score: number; stage: string }, windowMs = 5000): boolean {
  if (!existsSync(EVENTS_FILE)) return false;

  const cutoff = Date.now() - windowMs;
  const lines = readFileSync(EVENTS_FILE, "utf8").trimEnd().split("\n").slice(-10);
  for (const line of lines) {
    try {
      const event = JSON.parse(line) as HistoricalPromptEvent;
      if (
        event.type === "prompt-observed" &&
        event.stage === parsed.stage &&
        sameScore(event.score, parsed.score) &&
        event.ts &&
        new Date(event.ts).getTime() >= cutoff
      ) {
        return true;
      }
    } catch {
      // Ignore malformed historical lines.
    }
  }
  return false;
}

async function main(): Promise<void> {
  const input = parseInput(await readStdin());
  const settings = loadSettings();

  if (!settings.autoObserve || !hasObserveConsent(settings)) {
    return;
  }

  const lastMessage = input.last_assistant_message ?? "";
  const parsed = parseSenseiLine(lastMessage);
  if (!parsed) return;
  if (wasRecentlyRecorded(parsed)) return;

  appendEvent({
    v: 1,
    ts: new Date().toISOString(),
    type: "prompt-observed",
    stage: parsed.stage,
    taskType: "other",
    score: parsed.score,
    source: "stop-hook",
  });
}

main().catch((err) => {
  process.stderr.write(`stop hook error: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
