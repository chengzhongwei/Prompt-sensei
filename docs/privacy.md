# Privacy

Prompt Sensei is privacy-first by design. This document describes exactly what is stored, where, and how to remove it.

---

## What is stored by default

When observation mode is active, Prompt Sensei records the following per prompt:

| Field | Type | Example |
|---|---|---|
| `ts` | string | `"2026-04-25T14:32:10Z"` |
| `type` | string | `"prompt-observed"` |
| `stage` | string | `"execution"` |
| `taskType` | string | `"debugging"` |
| `score` | number | `3.8` |
| `flags` | string[] | `["missing-context", "privacy-risk", "safety-risk"]` |
| `tipKind` | string | `"add-verification-command"` |
| `promptHash` | string | `"a3f1b2c4..."` (SHA-256 prefix, optional) |

**Raw prompt text is never stored by default.**

If you explicitly enable `saveRedactedPrompts`, Prompt Sensei may also store:

| Field | Type | Example |
|---|---|---|
| `redactedPromptPreview` | string | `"Help debug [URL_WITH_PARAMS] with token=[CREDENTIAL]"` |

This stores redacted prompt text, not raw prompt text. Redaction is best-effort and may not catch everything.

When an optional Claude Code `UserPromptSubmit` hook is enabled, it records hash-only captures after consent:

| Field | Type | Example |
|---|---|---|
| `ts` | string | `"2026-04-25T14:32:10Z"` |
| `type` | string | `"prompt-hashed"` |
| `promptHash` | string | `"a3f1b2c4..."` |

When an optional Claude Code `Stop` hook is enabled, it can quietly record the final scored Sensei line after a response:

| Field | Type | Example |
|---|---|---|
| `ts` | string | `"2026-04-25T14:32:10Z"` |
| `type` | string | `"prompt-observed"` |
| `stage` | string | `"diagnosis"` |
| `taskType` | string | `"other"` |
| `score` | number | `4` |
| `flags` | string[] | `["no-verification"]` |
| `tipKind` | string | `"add-verification-command"` |
| `source` | string | `"stop-hook"` |

The Stop hook reads Claude Code's `last_assistant_message` hook field to parse the Sensei line. It does not store Claude's response text.

Operational hooks may also write non-prompt markers to `events.jsonl`, such as `session-compacted`, with only timestamp and compact-state metadata. These hooks stay inert unless auto observe is enabled and observe consent has already been granted.

Prompt Sensei also stores cached update-check status when update checks run:

| Field | Type | Example |
|---|---|---|
| `checkedAt` | string | `"2026-04-25T14:32:10Z"` |
| `status` | string | `"update-available"` |
| `branch` | string | `"main"` |
| `currentSha` | string | `"65fb4ad..."` |
| `remoteSha` | string | `"31e4a5b..."` |

When you explicitly choose to save a lookback report, Prompt Sensei stores the generated markdown report:

| Field | Type | Example |
|---|---|---|
| Report file | Markdown | `~/.prompt-sensei/reports/2026-04-26T...-lookback.md` |

Saved lookback reports are optional and are created only after confirmation.

Prompt Sensei stores local settings and consent state in `~/.prompt-sensei/settings.json`:

```json
{
  "version": 1,
  "autoObserve": false,
  "saveRedactedPrompts": false,
  "consent": {
    "observe": {
      "granted": false,
      "grantedAt": null
    },
    "lookback": {
      "granted": false,
      "grantedAt": null,
      "scope": null
    },
    "saveRedactedPrompts": {
      "granted": false,
      "grantedAt": null
    }
  }
}
```

`autoObserve` and `saveRedactedPrompts` both default to `false`.

---

## What is never stored

- Raw prompt content (the text you wrote)
- Claude's response text
- Code snippets from your prompts
- File contents
- Usernames, emails, or project identifiers
- Raw lookback history
- Lookback prompt hashes
- Derived lookback metadata, unless you save a markdown report yourself

---

## Where data lives

Prompt Sensei data lives under `~/.prompt-sensei/` on your local machine.

```
~/.prompt-sensei/
├── events.jsonl    ← one JSON record per observed prompt
├── config.json     ← legacy observe consent record
├── settings.json   ← settings and consent scopes
├── update-check.json
└── reports/        ← optional saved lookback reports
```

This directory is **not** inside your project repo. It is in your home directory and will not be committed to version control.

---

## First-use consent

The first time you run `/prompt-sensei observe`, Prompt Sensei will show you exactly what it intends to store and ask for confirmation before writing anything. It will not activate observation mode without your explicit consent.

Consent is stored in `~/.prompt-sensei/settings.json`. Existing `config.json` consent records are still honored for backwards compatibility. The observe prompt only appears once for the same trust scope.

Lookback uses separate consent because it reads selected local conversation history before redaction. Observe consent does not automatically grant lookback permission.

Prompt Sensei remembers consent by scope to avoid repeated prompts, but asks again when the data access scope expands. Scope changes include moving from one selected session to all sessions, from metadata-only to redacted prompt analysis, from Claude Code to Codex or another source, and from a temporary report to a saved Markdown report.

---

## Lookback privacy

When you run `/prompt-sensei lookback`, Prompt Sensei first discovers local Claude Code and Codex session files using metadata such as file paths, session IDs, titles when available, and file timestamps. It does not parse conversation files or extract prompt text during discovery. Before extracting prompts, it asks for explicit consent with the following guarantees:

- Selected local history is read locally
- User prompts are redacted before analysis
- Redacted prompts may be shown to the current AI agent for coaching
- Assistant responses are not analyzed
- Raw history is not copied into `~/.prompt-sensei`
- Raw prompt text, prompt hashes, and derived lookback metadata are not stored by default

Lookback can optionally save the generated markdown report to `~/.prompt-sensei/reports/`, but only after you confirm. The report is written by Prompt Sensei on your machine and can be deleted at any time.

Lookback does not make network calls itself. The active AI coding tool may process the redacted prompts according to that tool's normal model behavior.

---

## Auto observe

`autoObserve` is opt-in and defaults to `false`. When enabled, a host `SessionStart` hook can add a short context reminder that Prompt Sensei coaching should be active for the session, but only if observe consent is already granted.

If `autoObserve` is enabled without observe consent, Prompt Sensei does not auto-start. It adds only a short note that the user can run `/prompt-sensei observe` to consent.

Auto observe hooks can be installed at user or folder scope. Claude Code writes `~/.claude/settings.json` or `.claude/settings.local.json`. Codex writes `~/.codex/hooks.json` or `.codex/hooks.json`. Folder-level hook files are local to that working folder and are not meant to be committed. Turning auto observe off keeps any installed hooks quiet.

## PreCompact and session persistence

The optional Claude Code `PreCompact` hook is best-effort. It writes a lightweight `session-compacted` marker to `events.jsonl` and returns short compact-safe context so coaching can resume after compaction, but only when auto observe is enabled and observe consent is already granted.

The hook does not block compaction. It does not store raw conversation text. The resume context is intentionally short.

## Hashing and redaction

Prompt Sensei does not support raw prompt storage. When prompt text is available through stdin, it is redacted before hashing. If redacted prompt previews are enabled, redaction also runs before the preview is stored. Redaction covers:

- Email addresses
- API keys and tokens (detected by common prefixes: `sk-`, `ghp_`, `xox*`, etc.)
- Credential patterns (`password=`, `token:`, `api_key=`)
- Private key blocks (`-----BEGIN ... -----`)
- Long secret-looking strings
- URLs with query parameters

Redacted fields are replaced with labeled placeholders: `[EMAIL]`, `[API_KEY]`, `[CREDENTIAL]`, etc.

By default, only the hash prefix is stored. If `saveRedactedPrompts` is enabled, a short `redactedPromptPreview` may also be stored. This stores redacted prompt text, not raw prompt text. Redaction is best-effort and may not catch everything. Nothing is sent externally by Prompt Sensei scripts.

---

## Auditing what is stored

To inspect your data at any time:

```bash
cat ~/.prompt-sensei/events.jsonl
```

Each line is a readable JSON object. There is no binary format, no encryption, no hidden fields.

---

## Deleting your data

From Prompt Sensei:

```
/prompt-sensei clear
```

From the terminal:

```bash
npm run clear-data
# or delete the directory directly:
rm -rf ~/.prompt-sensei/
```

There is no account to close, no server to notify, and no backup to remove. Deleting the directory is a complete wipe.

`/prompt-sensei clear` also deletes saved lookback reports under `~/.prompt-sensei/reports/`.

To also reset consent and settings (so the skill asks again on next use):

```bash
node dist/scripts/clear.js --all
```

---

## Network behavior

Prompt Sensei contains no analytics, no error reporting, and no usage tracking. It makes no network calls for prompt observation or reporting.

The only networked feature is update checking. At most once per day during observe/report activity, Prompt Sensei may run `git ls-remote` against the configured `origin` remote to compare the local commit with the remote branch. It stores only update status and commit SHAs in `~/.prompt-sensei/update-check.json`. It never sends prompt text, scores, reports, or local event data.

Updates are never applied automatically. `/prompt-sensei update` runs `git pull --ff-only`, `npm install`, and `npm run build` only when the user explicitly requests it.

---

## Use in sensitive environments

If you are working in an environment with strict data handling requirements:

1. Add `~/.prompt-sensei/` to your backup exclusion rules if applicable
2. Run `clear` at the end of each session if required by policy
3. Keep `saveRedactedPrompts` off unless redacted previews are acceptable for your policy
4. Prefer folder-level auto observe for sensitive projects
5. Review `scripts/observe.ts` to audit data collection before enabling hooks

Prompt Sensei is designed to be safe to use in sensitive contexts with default settings.
