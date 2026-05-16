#!/usr/bin/env node
/**
 * SessionStart hook support for opt-in auto observe.
 */

import * as readline from "readline";
import { detectHostFromSkillRoot } from "./lib/host";
import { loadSettings, hasObserveConsent } from "./lib/settings";

const HOST = detectHostFromSkillRoot();
const OBSERVE_CONTEXT =
  "Before responding to the user, activate Prompt Sensei observe mode for this session. This is a silent auto-start path: do not announce setup, do not check settings in the visible response, and do not run setup scripts before answering. Every final answer to a normal user prompt must end with exactly one Sensei line in this exact Markdown shape: `> **[[Sensei: 94/100 · Execution; Excellent — ready for this stage]]()**`. Do not add Sensei lines to interim progress updates, tool-status updates, working notes, or collapsed/expandable thinking-progress blocks. For scores below 90, use the same blockquote, bold, double-bracket empty-link wrapper and include `Tip:`, for example `> **[[Sensei: 68/100 · Diagnosis; Tip: add the error message and file path]]()**`. Pick one canonical Prompt Sensei tipKind first, then write `Tip:` using that habit phrase or a very close paraphrase so the Stop hook can persist tipKind. A grade label like `Good — minor gaps` is okay only if a concrete tip is also included. Score genuine questions and instructions even when they are short, factual, or ask for a terse answer. Skip only mechanical inputs: one-word acknowledgements, numeric menu choices, slash-command-only wrappers, explicit just-reply tests, and context-resume summaries. Keep feedback stage-aware, short, and privacy-preserving.";
const CODEX_OBSERVE_CONTEXT =
  `${OBSERVE_CONTEXT} In Codex, treat this as an instruction fallback for hook-based observe: add the final Sensei line yourself so the user still gets coaching if the Stop hook is not trusted or not running. If the Codex Stop hook is trusted, it will persist an existing Sensei line or request one only when a final answer omitted it; never add a second Sensei line.`;

async function readStdin(): Promise<string> {
  if (process.stdin.isTTY) return "";
  const rl = readline.createInterface({ input: process.stdin });
  const lines: string[] = [];
  for await (const line of rl) {
    lines.push(line);
  }
  return lines.join("\n");
}

function printAdditionalContext(additionalContext: string): void {
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext,
    },
  }));
}

async function main(): Promise<void> {
  await readStdin();
  const settings = loadSettings();

  if (!settings.autoObserve) {
    return;
  }

  if (!hasObserveConsent(settings)) {
    printAdditionalContext(
      "Prompt Sensei auto observe is enabled, but observe consent is not granted. Tell the user they can run `/prompt-sensei observe` to consent."
    );
    return;
  }

  if (HOST === "codex") {
    printAdditionalContext(CODEX_OBSERVE_CONTEXT);
    return;
  }

  printAdditionalContext(OBSERVE_CONTEXT);
}

main().catch((err) => {
  process.stderr.write(`session-start error: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
