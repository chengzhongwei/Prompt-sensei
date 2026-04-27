# Repository Guidance

This project is a local-first prompt-coaching skill for AI coding agents. Keep changes aligned with the product principles: quiet, stage-aware, encouraging, privacy-aware, and useful for engineering workflows.

## When Changing Behavior

- Update `SKILL.md` when command behavior, scoring behavior, consent, storage, lookback, update checks, or report output changes.
- Update both `README.md` and `README-zh.md` for user-facing behavior, install steps, command lists, examples, and privacy notes.
- Update `docs/privacy.md` for any storage, deletion, or network behavior changes.
- Update `docs/scoring-rubric.md` when stage formulas, dimensions, flags, or score labels change.
- Update `examples/debugging-journey.md` when scoring examples, report style, or recommended prompt patterns change.
- Update `examples/prompt-gallery.md` when improve-mode examples, copyable before/after prompts, or adoption examples change.
- Keep Claude Code hook snippets in `SKILL.md`, `README.md`, and `README-zh.md` consistent.
- Keep the public command surface consistent across `SKILL.md`, `README.md`, `README-zh.md`, and examples. The public prompt-rewrite command is `/prompt-sensei improve`; legacy `review`/`score` wording should only appear as a redirect to `improve`.

## Scripts

- Source files live in `scripts/*.ts`; generated files live in `dist/`.
- Run `npm run build` after TypeScript changes.
- Do not add network behavior except for explicit, documented update checks.
- Do not store raw prompt text. Use metadata and redacted hashes only.
- Lookback may read selected raw local history after separate consent, but must not copy raw history, prompt hashes, or derived lookback metadata into Prompt Sensei storage by default.
- If saved reports are added or changed, keep `/prompt-sensei clear` and `docs/privacy.md` in sync.
- In `SKILL.md`, prefer absolute script paths for Claude Code examples, such as `node ~/.claude/skills/prompt-sensei/dist/scripts/observe.js`, to avoid cwd-reset warnings.

## Validation

Before publishing or opening a PR, run:

```bash
npm run build
git diff --check
```

For update-related changes, also smoke test:

```bash
node dist/scripts/update.js --check --force
node dist/scripts/report.js
```

For lookback-related changes, also smoke test:

```bash
node dist/scripts/lookback.js --help
node dist/scripts/lookback.js --discover --max-sessions 3
```

## Release Notes

PR descriptions should mention:

- user-facing command changes
- improve-mode or prompt-gallery changes
- lookback behavior or saved report changes
- storage or privacy changes
- report output changes
- validation performed
