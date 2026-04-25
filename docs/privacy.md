# Privacy

## What is stored by default

When observation mode is active, Prompt Sensei records the following per prompt:

| Field       | Type     | Example                    |
|-------------|----------|----------------------------|
| `ts`        | string   | `"2026-04-25T14:32:10Z"`   |
| `score`     | number   | `72`                       |
| `grade`     | string   | `"Developing"`             |
| `charCount` | number   | `148`                      |
| `summary`   | string   | `"add explicit constraints"` |

**Raw prompt text is never stored by default.**

## What is never stored

- Prompt content
- File paths referenced in prompts
- Code snippets from prompts
- Anything that could identify a project, repo, or organization

## Where data lives

All session data is written to `.prompt-sensei/` in your project directory.

```
.prompt-sensei/
└── session-2026-04-25.jsonl
```

This directory is listed in `.gitignore` and will not be committed to version control.

## Opting in to full prompt storage

If you want to store raw prompt text for your own analysis, you can call the observe script with `--store-prompt`:

```bash
npx ts-node scripts/observe.ts --score 72 --grade "Developing" --store-prompt --prompt "your prompt text"
```

This stores the prompt **locally only**. Nothing is sent externally.

## Deleting your data

Run:

```bash
npx ts-node scripts/clear.ts
```

Or delete the directory directly:

```bash
rm -rf .prompt-sensei/
```

There is no account to close, no server to notify, and no backup to remove. It's gone.

## No telemetry

Prompt Sensei contains no analytics, no error reporting, no usage tracking, and no network calls of any kind. The scripts are local Node.js executables. You can verify this by reading the source in `scripts/`.

## Use in sensitive environments

If you are working in an environment with strict data handling requirements (e.g., regulated industries, client work, confidential projects), you should:

1. Keep `--store-prompt` disabled (the default)
2. Add `.prompt-sensei/` to your organization's gitignore standards
3. Run `clear` at the end of each session if required by policy

Prompt Sensei is designed to be safe to use in sensitive contexts with default settings.
