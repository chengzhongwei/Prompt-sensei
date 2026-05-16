#!/usr/bin/env node
/**
 * Stop hook support for quiet auto-observe persistence.
 *
 * This hook parses the final Sensei line from the assistant response and records
 * a scored prompt observation without requiring a visible Bash tool call. In
 * Codex, it can also request one continuation when auto observe is active and
 * the response omitted the Sensei line.
 */

import { appendFileSync, existsSync, readFileSync } from "fs";
import * as readline from "readline";
import { detectHostFromSkillRoot } from "./lib/host";
import { EVENTS_FILE } from "./lib/paths";
import { ensureDataDir, hasObserveConsent, loadSettings } from "./lib/settings";
import {
  flagForTipKind,
  inferTipKindFromText,
  normalizeStage,
  type PromptFlag,
  type Stage,
  type TipKind,
} from "./lib/coaching";

interface StopInput {
  hook_event_name?: string;
  stop_hook_active?: boolean;
  last_assistant_message?: string;
}

interface PromptEvent {
  v: 2;
  ts: string;
  type: "prompt-observed";
  stage: Stage;
  taskType: string;
  score: number;
  flags?: PromptFlag[];
  tipKind?: TipKind;
  source: "stop-hook";
}

interface HistoricalPromptEvent {
  ts?: string;
  type?: string;
  stage?: string;
  score?: number;
  tipKind?: string;
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

function parseSenseiLine(message: string): { score: number; stage: Stage; tipKind?: TipKind } | null {
  if (/Sensei:\s*skipped grading for low-signal prompt/i.test(message)) {
    return null;
  }

  const match = message.match(/Sensei:\s*(\d{1,3})\s*\/\s*100\s*[·\-–—]\s*([^;\]\n]+)(?:;\s*Tip:\s*([^\]\n]+))?/i);
  if (!match) return null;

  const score100 = Number(match[1]);
  if (!Number.isFinite(score100) || score100 < 0 || score100 > 100) return null;
  const stage = normalizeStage(match[2]);
  if (!stage) return null;
  const tipKind = match[3] ? inferTipKindFromText(match[3]) : null;

  return {
    score: Math.max(1, Math.min(5, score100 / 20)),
    stage,
    ...(tipKind && { tipKind }),
  };
}

function hasSenseiLine(message: string): boolean {
  return /Sensei:/i.test(message);
}

function withoutSenseiLines(message: string): string {
  return message
    .split("\n")
    .filter((line) => !/Sensei:/i.test(line))
    .join("\n")
    .trim();
}

function isLikelyProgressUpdate(message: string): boolean {
  const body = withoutSenseiLines(message);
  if (!body) return false;
  if (body.length > 900) return false;
  if (/```|\n#{1,6}\s|\n[-*]\s|\n\d+\.\s/.test(body)) return false;
  if (/\b(validation passed|verified with|changes made|updated files|summary)\b/i.test(body)) return false;
  if (/^done\.?$/i.test(body)) return false;

  const explicitProgress =
    /^(Confirmed so far|So far|Done with .*now|This matches|The check lands|The patch now|The .* now|This .* now)/i.test(body);
  if (explicitProgress) return true;

  const startsLikeProgress =
    /^(I(?:'|’)ll|I will|I(?:'|’)m|I am|I found|I see|I(?:'|’)ve|I have)/i.test(body);
  const ongoingWork =
    /\b(checking|comparing|confirming|editing|exploring|inspecting|looking|opening|patching|reading|running|searching|tracing|verifying|will|next|now|going to)\b/i.test(
      body
    );
  return startsLikeProgress && ongoingWork;
}

function printCodexSenseiContinuation(): void {
  console.log(JSON.stringify({
    decision: "block",
    reason: [
      "Prompt Sensei auto observe is active. Add exactly one final Sensei line for the immediately preceding user prompt.",
      "Do not revise or summarize the previous answer.",
      "Do this only for the final answer; do not add Sensei lines to progress updates, tool-status updates, or working notes.",
      "If the preceding user prompt was mechanical low-signal input, output exactly `> **[[Sensei: skipped grading for low-signal prompt]]()**`.",
      "Otherwise classify the prompt stage, pick one canonical Prompt Sensei tip kind first, and output exactly one Markdown blockquote line in this shape: `> **[[Sensei: 94/100 · Execution; Excellent — ready for this stage]]()**`.",
      "For any score below 90, include `Tip:` with the concrete habit phrase, for example `> **[[Sensei: 68/100 · Diagnosis; Tip: add the error message and file path]]()**`.",
    ].join(" "),
  }));
}

function appendEvent(event: PromptEvent): void {
  ensureDataDir();
  appendFileSync(EVENTS_FILE, JSON.stringify(event) + "\n", "utf8");
}

function sameScore(left: unknown, right: number): boolean {
  return typeof left === "number" && Math.abs(left - right) < 0.001;
}

function wasRecentlyRecorded(parsed: { score: number; stage: string; tipKind?: string }, windowMs = 5000): boolean {
  if (!existsSync(EVENTS_FILE)) return false;

  const cutoff = Date.now() - windowMs;
  const lines = readFileSync(EVENTS_FILE, "utf8").trimEnd().split("\n").slice(-10);
  for (const line of lines) {
    try {
      const event = JSON.parse(line) as HistoricalPromptEvent;
      const historicalStage = normalizeStage(event.stage);
      if (
        event.type === "prompt-observed" &&
        historicalStage === parsed.stage &&
        (!parsed.tipKind || !event.tipKind || event.tipKind === parsed.tipKind) &&
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
  const host = detectHostFromSkillRoot();

  if (!settings.autoObserve || !hasObserveConsent(settings)) {
    return;
  }

  const lastMessage = input.last_assistant_message ?? "";
  if (host === "codex" && isLikelyProgressUpdate(lastMessage)) {
    return;
  }

  const parsed = parseSenseiLine(lastMessage);
  if (!parsed) {
    if (host === "codex" && !input.stop_hook_active && !hasSenseiLine(lastMessage)) {
      printCodexSenseiContinuation();
    }
    return;
  }
  if (wasRecentlyRecorded(parsed)) return;
  const flag = parsed.tipKind ? flagForTipKind(parsed.tipKind) : null;

  appendEvent({
    v: 2,
    ts: new Date().toISOString(),
    type: "prompt-observed",
    stage: parsed.stage,
    taskType: "other",
    score: parsed.score,
    ...(flag && { flags: [flag] }),
    ...(parsed.tipKind && { tipKind: parsed.tipKind }),
    source: "stop-hook",
  });
}

main().catch((err) => {
  process.stderr.write(`stop hook error: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
