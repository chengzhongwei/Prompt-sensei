# FAQ

## How do I know Prompt Sensei helps?

The score alone does not prove that a prompt is better. Treat it as a coaching signal, not an outcome guarantee.

The practical test is whether your work gets smoother:

- fewer clarification turns
- safer agent edits
- more useful first drafts
- clearer verification steps
- one repeated habit you can actually improve after reading `/prompt-sensei report`

If none of that changes after a couple of weeks, the tool may not be useful for you.

## Is this just a prompt template?

No. Prompt Sensei is a local skill/application with TypeScript scripts, settings, consent state, local reports, lookback, and optional host hooks for Claude Code and Codex. The coaching rubric is part of it, but the project is meant to show that a skill can be more than a markdown rulebook.

## Is the score objective?

No. The score means prompt readiness for the stage Sensei classified: Exploration, Diagnosis, Execution, Verification, Reusable workflow, or Action.

A short exploration prompt can score well because it is reasonable for early discovery. A request that asks an agent to edit files gets a higher bar: context, boundaries, constraints, output shape, and verification matter more.

## Does a higher score guarantee better AI output?

No. The model may still lack domain knowledge, misunderstand the codebase, or choose a weak implementation. Prompt Sensei can improve the request shape; it cannot guarantee the result.

## What changed in 1.0.0?

1.0.0 is the first stable release. It combines the next-habit coaching from 0.5.x with host-native auto-start support for both Claude Code and Codex:

- task-aware tip priorities
- canonical tip kinds for repeated habits
- habit-first reports
- setup flows that prefer structured option pickers when the host exposes them
- Claude Code and Codex lifecycle hook installation
- friendlier settings commands for auto observe and redacted previews

The scoring math is still intentionally modest. The goal is better suggestions and safer setup behavior, not grander claims.

## Does Prompt Sensei upload my prompts?

No. Prompt Sensei has no telemetry, account, or cloud service.

By default it stores local metadata such as timestamp, stage, task type, score, flags, and tip kind. Raw prompt text is not stored by default. Optional redacted prompt previews are opt-in and best-effort.

See [Privacy](privacy.md) for the full storage model.

## What if my prompts contain sensitive data?

Keep `saveRedactedPrompts` off unless redacted previews are acceptable for your local policy. Even with redaction enabled, treat redaction as best-effort and avoid pasting secrets, customer data, private URLs, or proprietary snippets when they are not needed.

## Will this annoy experienced engineers?

It might. Prompt Sensei is most useful when you are learning agent prompting, tired, about to start a broad task, or reviewing your habits. It is not meant to be mandatory or performative. If the Sensei line feels like noise, stop observe mode and keep using the parts that help, such as `improve`, `lookback`, or `report`.

## Why stage-aware scoring?

Because good prompting depends on what you are doing.

`why is login broken` can be fine during exploration. `implement auth refresh` needs more context, boundaries, and verification because the agent may edit real files. Prompt Sensei scores those differently on purpose.

## Does it work with Cursor or other AI coding tools?

Not yet. Prompt Sensei currently supports Claude Code and Codex workflows only.

Cursor and other AI coding tools are not supported today. There is no Cursor-specific hook integration, auto-start, or tested setup.

## Does Codex support auto-start hooks?

Yes. Prompt Sensei can use Codex lifecycle hooks for auto-start when installed from the Codex skill root. User-scope hooks go in `~/.codex/hooks.json`; folder-scope hooks go in `.codex/hooks.json`.

Codex may ask you to review or trust new hooks with `/hooks` before they run. Manual start still works with natural language: `Use prompt-sensei observe mode.`

## How can I report a scoring issue without exposing private prompts?

Use GitHub Discussions or an issue with a redacted example only if it is safe to share.

Useful details:

- stage Sensei chose
- score and tip
- what felt wrong or useful
- optional redacted prompt, with secrets and private context removed

Do not share raw secrets, customer data, private code, or proprietary prompts.

## Should a team mandate this?

No. Prompt Sensei is a personal coaching tool, not a productivity monitor. It has no leaderboard and no telemetry. It works best when people opt in because they want a private mirror for their prompting habits.
