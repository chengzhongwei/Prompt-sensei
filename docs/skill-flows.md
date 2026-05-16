# Prompt Sensei Skill Flows

This file holds lower-frequency workflow details for `SKILL.md`. Read it only when the user asks for setup, settings, hooks, or lookback.

## Host-Aware Input

When asking setup or consent questions, prefer structured input when the active host and mode exposes it:

1. Claude Code `AskUserQuestion`
2. Codex `request_user_input`, when available in the current Codex collaboration mode
3. Numbered-list fallback when the active tool surface does not expose structured input

Codex `request_user_input` supports one to three short questions per call. Include the Codex-only `id` field for each question. Claude Code `AskUserQuestion` uses the same header, question, and options shape, but omit `id`.

Do not claim the structured picker is unavailable in Codex globally. It is host/mode-dependent: if `request_user_input` is not available in the current Codex mode, briefly say that this mode only supports the numbered fallback and continue setup that way.

## Consent Text

Use this when observe consent has not already been granted:

Structured-input shape:

```txt
id: observe_consent (Codex only)
header: Observe
question: May Prompt Sensei store local prompt-coaching metadata for this session?
options:
  - label: Yes
    description: Start observe mode and save local metadata only.
  - label: No
    description: Do not start observe mode or save consent.
```

Option mapping:

| Label | Invocation |
|---|---|
| Yes | `node <skill-root>/dist/scripts/observe.js --init` |
| No | Exit gracefully without running a script. |

Fallback only when neither structured-input tool is available:

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

After first-time observe consent is recorded, ask whether to install host-native auto-start hooks.

Use structured input:

```txt
id: auto_start_scope (Codex only)
header: Auto-start
question: Where should Prompt Sensei auto-start in future sessions?
options:
  - label: All sessions
    description: Install user-scope hooks for this host.
  - label: This folder
    description: Install folder-scope hooks for this project.
  - label: Manual start
    description: Leave auto observe off and start manually.
```

Option mapping:

| Label | Invocation |
|---|---|
| All sessions | `node <skill-root>/dist/scripts/settings.js auto-observe user` |
| This folder | `node <skill-root>/dist/scripts/settings.js auto-observe folder` |
| Manual start | `node <skill-root>/dist/scripts/settings.js auto-observe off` |

Fallback only when neither structured-input tool is available:

```txt
Want Prompt Sensei to auto-start in future sessions?

1. Yes, for all sessions on this machine
2. Yes, only for this folder
3. No, I will start it manually
```

Run:

```bash
node <skill-root>/dist/scripts/settings.js auto-observe user
node <skill-root>/dist/scripts/settings.js auto-observe folder
node <skill-root>/dist/scripts/settings.js auto-observe off
```

Auto observe is opt-in. The installed hooks stay quiet when `autoObserve` is off, and they do not start coaching unless observe consent has already been granted. In Codex, hooks may need to be reviewed or trusted with `/hooks` before they run.

## Setup Mode

For `/prompt-sensei setup`:

1. Check observe consent with `node <skill-root>/dist/scripts/settings.js`.
2. Prefer one combined structured-input call with up to three questions when the active host/mode exposes structured input:
   - Q1 `id: observe_consent`, `header: Observe` — skip if observe consent is already granted.
   - Q2 `id: auto_start_scope`, `header: Auto-start`.
   - Q3 `id: redacted_previews`, `header: Previews`.
3. After answers come back, fan out to the matching `observe.js` or `settings.js` calls based on each answer's label.
4. In Codex, after applying answers, tell the user to review or trust newly installed hooks with `/hooks` if Codex asks.

Combined structured-input question for redacted previews:

```txt
id: redacted_previews (Codex only)
header: Previews
question: Save redacted prompt previews for richer local reports?
options:
  - label: Keep off
    description: Store only metadata and keep prompt previews off.
  - label: Save previews
    description: Store best-effort redacted prompt previews locally.
```

Option mapping:

| Label | Invocation |
|---|---|
| Keep off | `node <skill-root>/dist/scripts/settings.js save-redacted-prompts off` |
| Save previews | `node <skill-root>/dist/scripts/settings.js save-redacted-prompts on` |

Fallback only when neither structured-input tool is available:

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
node <skill-root>/dist/scripts/settings.js auto-observe=off save-redacted-prompts=on
```

The settings CLI also accepts `enable/disable`, `true/false`, `yes/no`, multi-word names such as `save redacted prompts`, and aliases such as `redacted`, `previews`, and `auto-start`.

If enabling redacted previews, remind the user:

```txt
This stores redacted prompt text, not raw prompt text. Redaction is best-effort and may not catch everything.
```

## Hook Setup

Prompt Sensei auto observe uses host-native lifecycle hooks.

Claude Code user scope writes `~/.claude/settings.json`.

Claude Code folder scope writes `.claude/settings.local.json`.

Codex user scope writes `~/.codex/hooks.json`.

Codex folder scope writes `.codex/hooks.json`. Project-local Codex hooks load only when the project `.codex/` layer is trusted, and new or changed non-managed hooks may need review with `/hooks`.

Use [../examples/claude-settings.example.json](../examples/claude-settings.example.json) for the full Claude Code hook structure and [../examples/codex-hooks.example.json](../examples/codex-hooks.example.json) for the Codex hook structure. Codex uses the same `SessionStart`, `UserPromptSubmit`, and `Stop` scripts in `hooks.json`; do not mark Codex hooks as `async`, because Codex parses but skips async command hooks in the current release.

Scripts used by host hooks:

```bash
node <skill-root>/dist/scripts/session-start.js
node <skill-root>/dist/scripts/stop.js
node <skill-root>/dist/scripts/observe.js --hash-only
```

Claude Code also uses:

```bash
node <skill-root>/dist/scripts/pre-compact.js
```

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
