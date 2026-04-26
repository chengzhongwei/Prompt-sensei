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
| `flags` | string[] | `["missing-context", "no-verification"]` |
| `promptHash` | string | `"a3f1b2c4..."` (SHA-256 prefix, optional) |

**Raw prompt text is never stored by default.**

When the optional Claude Code hook is enabled, it records hash-only captures after consent:

| Field | Type | Example |
|---|---|---|
| `ts` | string | `"2026-04-25T14:32:10Z"` |
| `type` | string | `"prompt-hashed"` |
| `promptHash` | string | `"a3f1b2c4..."` |

Prompt Sensei also stores cached update-check status when update checks run:

| Field | Type | Example |
|---|---|---|
| `checkedAt` | string | `"2026-04-25T14:32:10Z"` |
| `status` | string | `"update-available"` |
| `branch` | string | `"main"` |
| `currentSha` | string | `"65fb4ad..."` |
| `remoteSha` | string | `"31e4a5b..."` |

---

## What is never stored

- Prompt content (the text you wrote)
- Claude's response text
- Code snippets from your prompts
- File contents
- Usernames, emails, or project identifiers

---

## Where data lives

All data is written to `~/.prompt-sensei/events.jsonl` — a single newline-delimited JSON file on your local machine.

```
~/.prompt-sensei/
├── events.jsonl    ← one JSON record per observed prompt
└── config.json     ← consent status and preferences
```

This directory is **not** inside your project repo. It is in your home directory and will not be committed to version control.

---

## First-use consent

The first time you run `/prompt-sensei observe`, Prompt Sensei will show you exactly what it intends to store and ask for confirmation before writing anything. It will not activate observation mode without your explicit consent.

Consent is stored in `~/.prompt-sensei/config.json`. The prompt only appears once.

---

## Hashing and redaction

Prompt Sensei does not support raw prompt storage. When prompt text is available through stdin, it is redacted before hashing. Redaction covers:

- Email addresses
- API keys and tokens (detected by common prefixes: `sk-`, `ghp_`, `xox*`, etc.)
- Credential patterns (`password=`, `token:`, `api_key=`)
- Private key blocks (`-----BEGIN ... -----`)
- URLs with query parameters

Redacted fields are replaced with labeled placeholders: `[EMAIL]`, `[API_KEY]`, `[CREDENTIAL]`, etc.

Only the hash prefix is stored. Nothing is sent externally.

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

To also reset consent (so the skill asks again on next use):

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
3. Review `scripts/observe.ts` to audit data collection before enabling the hook

Prompt Sensei is designed to be safe to use in sensitive contexts with default settings.
