# Prompt Sensei Skill Flows

This file holds lower-frequency workflow details for `SKILL.md`. Read it only when the user asks for setup, settings, hooks, or lookback.

## Consent Text

Use this when observe consent has not already been granted:

```txt
Before I start, here's what I store locally:
  - Timestamp
  - Prompt stage and task type
  - A hash of your prompt, not the text itself
  - Dimension scores
  - Lightweight feedback tags
  - Cached update-check status
  - Settings and consent scope

I store nothing in the cloud. Raw prompt text is never saved.
Optional redacted prompt previews are saved only if you turn that setting on.
Data goes to:
  ~/.prompt-sensei/events.jsonl
  ~/.prompt-sensei/settings.json
  ~/.prompt-sensei/config.json (legacy compatibility)
  ~/.prompt-sensei/update-check.json

You can inspect or delete it anytime with /prompt-sensei clear.

Ready to begin? (yes / no)
```

If the user says yes, run:

```bash
node <skill-root>/dist/scripts/observe.js --init
```

If the user says no, exit gracefully.

## First-Time Auto-Start Choice

After first-time observe consent is recorded, branch by host.

For Codex, say:

```txt
Codex does not currently support Prompt Sensei auto-start hooks. Start coaching in future sessions with:

Use prompt-sensei observe mode.

You can still configure redacted previews in setup.
```

Then skip the auto-start choice.

For Claude Code, ask:

```txt
Want Prompt Sensei to auto-start in future Claude Code sessions?

1. Yes, for all Claude Code sessions on this machine
2. Yes, only for this folder
3. No, I will start it manually
```

Run:

```bash
node <skill-root>/dist/scripts/settings.js auto-observe user
node <skill-root>/dist/scripts/settings.js auto-observe folder
node <skill-root>/dist/scripts/settings.js auto-observe off
```

Auto observe is opt-in. The installed hooks stay quiet when `autoObserve` is off, and they do not start coaching unless observe consent has already been granted.

## Setup Mode

For `/prompt-sensei setup`:

1. Check observe consent with `node <skill-root>/dist/scripts/settings.js`.
2. If observe consent is missing, show the consent text above and run `observe.js --init` only after yes.
3. Use the host-aware auto-start branch above. In Codex, do not offer Claude hook installation as if it were Codex auto-start.
4. Ask:

```txt
Save redacted prompt previews for richer local reports?

This stores redacted prompt text, not raw prompt text. Redaction is best-effort and may not catch everything.

1. No, keep previews off
2. Yes, save redacted previews
```

Default to option 1 when unsure.

Run:

```bash
node <skill-root>/dist/scripts/settings.js save-redacted-prompts off
node <skill-root>/dist/scripts/settings.js save-redacted-prompts on
```

Finish by displaying:

```bash
node <skill-root>/dist/scripts/settings.js
```

## Settings Commands

Show settings:

```bash
node <skill-root>/dist/scripts/settings.js
```

Change settings:

```bash
node <skill-root>/dist/scripts/settings.js auto-observe on
node <skill-root>/dist/scripts/settings.js auto-observe off
node <skill-root>/dist/scripts/settings.js auto-observe user
node <skill-root>/dist/scripts/settings.js auto-observe folder
node <skill-root>/dist/scripts/settings.js save-redacted-prompts on
node <skill-root>/dist/scripts/settings.js save-redacted-prompts off
```

If enabling redacted previews, remind the user:

```txt
This stores redacted prompt text, not raw prompt text. Redaction is best-effort and may not catch everything.
```

## Hook Setup

Claude Code only. Codex does not currently support these Prompt Sensei hooks; Codex users should start coaching with natural language: `Use prompt-sensei observe mode.`

Use [../examples/claude-settings.example.json](../examples/claude-settings.example.json) for the full Claude Code hook structure.

Scripts:

```bash
node <skill-root>/dist/scripts/session-start.js
node <skill-root>/dist/scripts/stop.js
node <skill-root>/dist/scripts/pre-compact.js
node <skill-root>/dist/scripts/observe.js --hash-only
```

User scope writes `~/.claude/settings.json`.

Folder scope writes `.claude/settings.local.json`.

## Lookback Flow

Lookback reads selected local history after separate consent. It never stores raw history, raw prompt text, prompt hashes, or derived lookback metadata by default.

1. Discover sessions:

```bash
node <skill-root>/dist/scripts/lookback.js --discover
```

2. Re-present discovered sessions in chat. Show the most recent 10 if there are many.

3. Ask one question at a time:

```txt
Choose what to analyze:
1. <source> · <latest timestamp> · <title or path hint>
...
A. All discovered sessions
M. Manual path/source
```

Then ask:

```txt
Choose analysis format:
1. Full report
2. One-by-one coaching
```

Then ask:

```txt
How many recent user prompts should I analyze? Press Enter for 30, enter a number, or type all.
```

Default to `30`. Cap at `500`. If the request is greater than `50` or `all`, ask for confirmation before extraction.

4. Compute and check consent scope before reading prompt history:

```bash
node <skill-root>/dist/scripts/lookback.js --consent-scope --source claude --path <session-jsonl-path> --mode report --limit 30 --prompt-access redacted-prompts --report-storage temporary-report
node <skill-root>/dist/scripts/lookback.js --consent-status --scope <scope>
```

If consent is already granted for the exact same scope, do not ask again. Ask again when scope expands, including:

- one selected session to all sessions
- metadata-only to redacted prompt analysis
- Claude Code to Codex or another future source
- temporary report to saved Markdown report

5. If consent is needed, show:

```txt
Prompt Sensei will read selected local conversation history and redact user prompts before analysis.
Redacted user prompts may be shown to the current AI agent for coaching.
Raw history will not be copied into Prompt Sensei storage.
Raw prompt text will not be saved.

Continue? (yes / no)
```

If the user agrees:

```bash
node <skill-root>/dist/scripts/lookback.js --grant-consent --scope <scope>
```

6. Extract:

```bash
node <skill-root>/dist/scripts/lookback.js --extract --path <session-jsonl-path> --mode <report|one-by-one> --limit <number|all>
node <skill-root>/dist/scripts/lookback.js --extract --source all --session all --mode <report|one-by-one> --limit <number|all>
node <skill-root>/dist/scripts/lookback.js --extract --source <claude|codex> --path <file-or-dir> --mode <report|one-by-one> --limit <number|all>
```

Analyze only user prompts. Avoid direct quotes by default.

7. If the user asks to save the generated report, ask separately because saved Markdown expands the storage scope. Save only after confirmation:

```bash
node <skill-root>/dist/scripts/lookback.js --save-report --title "Prompt Sensei Lookback"
```
