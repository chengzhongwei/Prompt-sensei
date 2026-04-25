# Privacy

Prompt Sensei is privacy-first by design. This document describes exactly what is stored, where, and how to remove it.

---

## What is stored

When session coaching is active, Prompt Sensei records the following per prompt:

| Field | Type | Example |
|---|---|---|
| `ts` | string | `"2026-04-25T14:32:10Z"` |
| `type` | string | `"prompt-observed"` |
| `stage` | string | `"execution"` |
| `taskType` | string | `"debugging"` |
| `score` | number | `3.8` |
| `flags` | string[] | `["missing-context", "no-verification"]` |
| `promptHash` | string | `"a3f1b2c4..."` (SHA-256 prefix of the redacted prompt, optional) |

**Raw prompt text is never stored.** If a hash is recorded, it is computed from a redacted copy of the prompt — emails, API keys, credential patterns, private keys, and URLs with query parameters are replaced with placeholders before hashing.

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

This directory is **not** inside your project repo and will not be committed to version control.

---

## First-use consent

The first time you run `/prompt-sensei observe`, Prompt Sensei shows you exactly what it intends to store and asks for confirmation before writing anything. It will not activate session coaching without your explicit consent.

Consent is stored in `~/.prompt-sensei/config.json`. The prompt only appears once.

---

## Auditing what is stored

To inspect your data at any time:

```bash
cat ~/.prompt-sensei/events.jsonl
```

Each line is a readable JSON object. There is no binary format, no encryption, no hidden fields.

---

## Deleting your data

From Claude Code:

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

## No network calls

Prompt Sensei contains no analytics, no error reporting, no usage tracking, and no network calls of any kind. The scripts are local Node.js executables. You can verify this by reading the source in `scripts/` — there are no HTTP clients, no `fetch` calls, and no third-party SDKs.

---

## Use in sensitive environments

If you are working in an environment with strict data handling requirements:

1. Prompt Sensei stores no raw prompt text — only metadata
2. Add `~/.prompt-sensei/` to your backup exclusion rules if applicable
3. Run `/prompt-sensei clear` at the end of each session if required by policy
4. Review `scripts/observe.ts` to audit data collection before enabling the skill

Prompt Sensei is designed to be safe to use in sensitive contexts with default settings.
