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
```

## Auto Observe

`autoObserve` is opt-in. It only lets the SessionStart hook resume coaching after observe consent has already been granted.

Claude Code scopes:

- User level: all Claude Code sessions on this machine, stored in `~/.claude/settings.json`
- Folder level: only the current folder, stored in `.claude/settings.local.json`

Codex does not currently support Prompt Sensei auto-start hooks. In Codex, start coaching with:

```txt
Use prompt-sensei observe mode.
```

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

## Claude Code Hooks

Claude Code only. These hooks are not a Codex auto-start mechanism.

Use [../examples/claude-settings.example.json](../examples/claude-settings.example.json) as a copyable settings file.

The example includes:

- `SessionStart` for opt-in auto-start context
- `UserPromptSubmit` for hash-only prompt captures after consent
- `Stop` for quiet persistence of the final scored Sensei line
- `PreCompact` for compact-safe coaching continuity

`UserPromptSubmit` captures are hash-only because the hook does not have enough conversation context to score the prompt. The `Stop` hook parses the visible Sensei line after the response and records its score/stage without a visible Bash call.

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
- Claude Code to Codex/Cursor/other source
- temporary report to saved Markdown report
