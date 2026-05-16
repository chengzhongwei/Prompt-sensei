# Repository Guidance

This project is a local-first prompt-coaching skill for AI coding agents. Keep changes aligned with the product principles: quiet, stage-aware, encouraging, privacy-aware, and useful for engineering workflows.

## Documentation Shape

- Keep `SKILL.md` compact. It should be a runtime router plus core scoring behavior, not a full manual.
- Keep `README.md` and `README-zh.md` beginner-friendly. They should explain the happy path, command surface, and privacy promise without embedding long setup flows or hook JSON.
- Move low-frequency or advanced details into focused docs:
  - `docs/skill-flows.md` for agent-facing setup, settings, hooks, and lookback flow details.
  - `docs/advanced-setup.md` and `docs/advanced-setup-zh.md` for user-facing advanced configuration.
  - `docs/faq.md` for skeptical questions, usefulness claims, support scope, feedback channels, and quick public-facing answers.
  - `docs/privacy.md` for storage, consent, redaction, deletion, and network behavior.
  - `examples/claude-settings.example.json` for copyable Claude Code hook JSON.
  - `examples/codex-hooks.example.json` for copyable Codex hook JSON.
- Prefer short links from `SKILL.md` and README files to those deeper docs instead of duplicating the same instructions.
- Avoid large inline JSON blocks in `SKILL.md` or README unless they are essential for first-use comprehension.
- Before adding more than a short paragraph to `SKILL.md` or README, ask whether it belongs in a reference doc instead.
- As a rough guardrail, try to keep `SKILL.md` under 250 lines and each README under 325 lines. If a necessary change exceeds that, move supporting detail into `docs/`.

## When Changing Behavior

Treat behavior changes as cross-file changes by default. Before finalizing, do a related-file sweep; do not rely only on the file you initially touched or the checklist below.

- Update `SKILL.md` when command behavior, scoring behavior, consent, storage, lookback, update checks, or report output changes.
- Update `docs/skill-flows.md` when setup, settings, hook, or lookback agent workflow details change.
- Update both `README.md` and `README-zh.md` for user-facing behavior, install steps, essential command lists, examples, and privacy notes.
- Update `docs/advanced-setup.md` and `docs/advanced-setup-zh.md` for user-facing advanced settings, hook setup, Codex sync, or optional storage behavior.
- Update `docs/privacy.md` for any storage, deletion, or network behavior changes.
- Update `docs/scoring-rubric.md` when stage formulas, dimensions, flags, tip kinds, tip priority rules, or score labels change.
- Update `docs/philosophy.md` when product framing changes around scoring, reports, privacy, outcomes, or the teaching model.
- Update `docs/faq.md` when support scope, privacy posture, usefulness claims, feedback channels, or common adoption objections change.
- Update `examples/debugging-journey.md` when scoring examples, report style, or recommended prompt patterns change.
- Update `examples/prompt-gallery.md` when improve-mode examples, copyable before/after prompts, or adoption examples change.
- Update `eval/prompts.json` when scoring behavior, stage definitions, tip kinds, or teaching expectations change.
- Keep host hook snippets in `examples/claude-settings.example.json` and `examples/codex-hooks.example.json`, and reference them from docs. Do not duplicate full hook JSON in `SKILL.md` or README.
- Keep the public command surface consistent across `SKILL.md`, `README.md`, `README-zh.md`, and examples. The public prompt-rewrite command is `/prompt-sensei improve`; legacy `review`/`score` wording should only appear as a redirect to `improve`.
- Keep beginner and advanced paths separate: basic observe/improve/lookback should work without hook setup, while optional settings can live in advanced docs.

## Related File Sweep

For any change to scoring, tips, reports, privacy, consent, supported hosts, commands, hooks, or release positioning, run a targeted `rg` sweep before the final validation. Search for both the new term and the old behavior it replaces.

Common sweep targets:

- Command surface: `rg -n "observe|improve|lookback|report|settings|setup|clear|update|review|score" SKILL.md README.md README-zh.md docs examples scripts`
- Scoring and coaching: `rg -n "score|scoring|rubric|dimension|flag|tip|tip kind|next habit|lowest|verification|stage" SKILL.md docs examples eval scripts`
- Reports and storage: `rg -n "report|events.jsonl|prompt-observed|prompt-hashed|redacted|hash|storage|clear" README.md README-zh.md docs scripts`
- Host support: `rg -n "Claude Code|Codex|Cursor|AI coding tools|hooks|auto-start|sync-codex" README.md README-zh.md SKILL.md docs scripts examples`
- Release and public framing: `rg -n "0\\.[0-9]+|FAQ|privacy|guarantee|outcome|help|support" README.md README-zh.md CHANGELOG.md docs examples .github`

After the sweep, update every affected surface together or explicitly note why a matching file does not need changes. For scoring or teaching changes, inspect at least `SKILL.md`, `docs/scoring-rubric.md`, `docs/philosophy.md`, `docs/faq.md`, `examples/debugging-journey.md`, `examples/prompt-gallery.md`, `eval/prompts.json`, `scripts/lib/coaching.ts`, `scripts/observe.ts`, `scripts/stop.ts`, and `scripts/report.ts`.

## Host Compatibility

- Claude Code and Codex use separate skill directories. Do not assume Codex will load `~/.claude/skills/prompt-sensei`.
- Keep `npm run sync-codex-install` working when files need to be copied from the Claude install into `~/.codex/skills/prompt-sensei`.
- Claude Code and Codex both support host-native auto-start hooks. Claude Code uses `~/.claude/settings.json` or `.claude/settings.local.json`; Codex uses `~/.codex/hooks.json` or `.codex/hooks.json`.
- `PreCompact` is Claude Code-only. Codex hooks should use `SessionStart`, `UserPromptSubmit`, and `Stop`, and should not set `async: true` on command hooks.
- In Codex, manual observe mode is still started by natural language such as `Use prompt-sensei observe mode.`
- Settings, reports, clear, redacted prompt previews, and lookback should stay usable from either Claude Code or Codex installs.
- If adding host-specific behavior, use `scripts/lib/host.ts` instead of ad hoc path checks.

## Scripts

- Source files live in `scripts/*.ts`; generated files live in `dist/`.
- Run `npm run build` after TypeScript changes.
- Do not add network behavior except for explicit, documented update checks.
- Do not store raw prompt text. Use metadata and redacted hashes only.
- If `saveRedactedPrompts` is enabled, redaction must run before storage and only `redactedPromptPreview` or another explicitly redacted field may be stored.
- Lookback may read selected raw local history after separate consent, but must not copy raw history, prompt hashes, or derived lookback metadata into Prompt Sensei storage by default.
- Consent reuse should be scoped. Ask again when scope expands, such as one session to all sessions, metadata-only to redacted prompt analysis, Claude Code to Codex, or temporary report to saved Markdown.
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

For settings, hooks, or host-compatibility changes, also smoke test:

```bash
node dist/scripts/settings.js
node dist/scripts/setup-hooks.js auto-observe off
node dist/scripts/sync-codex-install.js --dry-run
npm run smoke
```

When changing Codex-related behavior, run at least one smoke test from a Codex-like install path or sync to `~/.codex/skills/prompt-sensei` and verify `Use prompt-sensei settings` behavior manually.

For scoring or teaching-language changes, also run:

```bash
npm run eval
```

When fixture metadata or eval output changes, also check the JSON path:

```bash
npm --silent run eval -- --json
```

## Release Notes

PR descriptions should mention:

- user-facing command changes
- improve-mode or prompt-gallery changes
- lookback behavior or saved report changes
- storage or privacy changes
- report output changes
- validation performed
