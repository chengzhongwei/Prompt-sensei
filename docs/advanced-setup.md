# Advanced Setup

Prompt Sensei works without advanced setup. Start with `/prompt-sensei observe` or `Use prompt-sensei observe mode.`

Use this page when you want auto-start hooks, scoped settings, Codex install sync, or optional redacted prompt previews.

## Settings

Prompt Sensei stores local preferences in `~/.prompt-sensei/settings.json`.

Defaults:

- Auto observe: off
- Save redacted prompts: off
- Raw prompts: never stored

Show settings:

```bash
npm run settings
```

Change settings:

```bash
node dist/scripts/settings.js auto-observe on
node dist/scripts/settings.js auto-observe off
node dist/scripts/settings.js auto-observe user
node dist/scripts/settings.js auto-observe folder
node dist/scripts/settings.js save-redacted-prompts on
node dist/scripts/settings.js save-redacted-prompts off
node dist/scripts/settings.js auto-observe=off save-redacted-prompts=on
```

The settings command is forgiving: `enable/disable`, `true/false`, and `yes/no` work too. It also accepts aliases such as `redacted`, `previews`, and `auto-start`, plus multi-word names like `save redacted prompts`.

## Auto Observe

`autoObserve` is opt-in. It only lets the host SessionStart hook resume coaching after observe consent has already been granted.

Claude Code hook scopes:

- User level: all Claude Code sessions on this machine, stored in `~/.claude/settings.json`
- Folder level: only the current folder, stored in `.claude/settings.local.json`

Codex hook scopes:

- User level: all Codex sessions on this machine, stored in `~/.codex/hooks.json`
- Folder level: only the current folder, stored in `.codex/hooks.json`

Install hooks and turn auto observe on:

```bash
node dist/scripts/setup-hooks.js auto-observe user
node dist/scripts/setup-hooks.js auto-observe folder
```

Turn auto observe off:

```bash
node dist/scripts/setup-hooks.js auto-observe off
```

Installed hooks stay quiet while auto observe is off.

In Codex, new or changed hooks may need review with `/hooks` before they run.

## Host Hooks

Use [../examples/claude-settings.example.json](../examples/claude-settings.example.json) as a copyable Claude Code settings file, or [../examples/codex-hooks.example.json](../examples/codex-hooks.example.json) as a copyable Codex hooks file.

Claude Code hooks include:

- `SessionStart` for opt-in auto-start context
- `UserPromptSubmit` for hash-only prompt captures after consent
- `Stop` for quiet persistence of the final scored Sensei line
- `PreCompact` for compact-safe coaching continuity

Codex hooks use the same `SessionStart`, `UserPromptSubmit`, and `Stop` scripts from `~/.codex/hooks.json` or `.codex/hooks.json`. Codex currently parses but skips async command hooks, so Prompt Sensei installs Codex `UserPromptSubmit` without `async: true`.

`UserPromptSubmit` captures are hash-only because the hook does not have enough conversation context to score the prompt. The `Stop` hook parses the visible Sensei line after the response and records its score, stage, and inferred habit metadata without a visible Bash call.

## Sync Codex Install

Claude Code and Codex use separate skill directories. Codex should not be expected to load `~/.claude/skills/prompt-sensei` automatically.

To sync this install into Codex:

```bash
npm run sync-codex-install
```

Equivalent manual sync:

```bash
rsync -a --delete ~/.claude/skills/prompt-sensei/ ~/.codex/skills/prompt-sensei/
(cd ~/.codex/skills/prompt-sensei && npm install && npm run build)
```

## Redacted Prompt Previews

`saveRedactedPrompts` is off by default.

When enabled, Prompt Sensei stores a short `redactedPromptPreview`, not raw prompt text. Redaction runs before storage and covers common sensitive patterns such as emails, API keys, tokens, private keys, long secrets, and URLs with query parameters.

Redaction is best-effort and may not catch everything. Keep this setting off unless redacted previews are acceptable for your local data policy.

## Consent Reuse

Prompt Sensei remembers consent by scope to avoid repeated prompts, but asks again when data access expands.

Examples of expanded scope:

- one selected session to all sessions
- metadata-only to redacted prompt analysis
- Claude Code to Codex or another future source
- temporary report to saved Markdown report
