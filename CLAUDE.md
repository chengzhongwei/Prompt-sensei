# Repository Guidance

This project is a local-first prompt-coaching skill for AI coding agents. Keep changes aligned with the product principles: quiet, stage-aware, encouraging, privacy-aware, and useful for engineering workflows.

## When Changing Behavior

- Update `SKILL.md` when command behavior, scoring behavior, consent, storage, update checks, or report output changes.
- Update both `README.md` and `README-zh.md` for user-facing behavior, install steps, command lists, examples, and privacy notes.
- Update `docs/privacy.md` for any storage, deletion, or network behavior changes.
- Update `docs/scoring-rubric.md` when stage formulas, dimensions, flags, or score labels change.
- Update `examples/debugging-journey.md` when scoring examples, report style, or recommended prompt patterns change.

## Scripts

- Source files live in `scripts/*.ts`; generated files live in `dist/`.
- Run `npm run build` after TypeScript changes.
- Do not add network behavior except for explicit, documented update checks.
- Do not store raw prompt text. Use metadata and redacted hashes only.

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

## Release Notes

PR descriptions should mention:

- user-facing command changes
- storage or privacy changes
- report output changes
- validation performed
