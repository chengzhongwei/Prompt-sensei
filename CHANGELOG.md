# Changelog

All notable changes to Prompt Sensei are documented here.

## 0.5.1 - 2026-05-03

### Fixed

- Strengthened observe-mode guidance so agents pick a canonical `tipKind` before writing below-90 tips.
- Updated Claude Code auto-start context so hook-recorded sessions preserve `tipKind` more consistently.
- Broadened Stop-hook tip inference for common free-form tip wording such as complete-sentence, exact-output, repository, validation, and audience guidance.

## 0.5.0 - 2026-05-03

### Added

- Added shared coaching metadata with canonical `tipKind` values for repeated habits.
- Added task-aware tip priority guidance so Sensei chooses the most useful next habit instead of mechanically picking the lowest dimension.
- Added habit-first reports that surface the next habit and repeated gap before average score.
- Added eval fixture fields for expected and poor tip-kind choices.
- Added an FAQ covering usefulness, privacy, scoring limits, Claude Code/Codex support, and unsupported tools such as Cursor.
- Added GitHub issue and discussion templates for redacted scoring feedback.

### Changed

- Observation events now use v2 for scored prompt observations and can store `tipKind`.
- Stop hook persistence now infers habit metadata from the visible Sensei tip when available.
- Report language no longer claims that upward score movement proves practice is working.
- README quick links now point to FAQ, privacy, examples, advanced setup, and discussions.

### Fixed

- PreCompact hook now stays inert unless auto observe is enabled and observe consent has already been granted.

## 0.4.0 - 2026-05-03

### Added

- Added Claude Code auto-observe hook setup with SessionStart, UserPromptSubmit, Stop, and PreCompact hooks.
- Added silent session auto-start guidance so observe mode can activate without visible setup chatter.
- Added Stop hook persistence so scored Sensei lines are recorded to local events after responses.
- Added structured settings storage for host, auto-observe, redacted prompt, observe, and lookback consent state.
- Added advanced setup docs, skill-flow docs, and a Claude settings example.
- Added focused eval fixtures for short factual prompts and below-90 feedback that needs a concrete tip.

### Changed

- Tightened low-signal skip guidance so short factual questions and short instructions are still scored.
- Require concrete `Tip:` guidance for scores below 90, including `Good - minor gaps` feedback.
- Clarified Claude Code, Codex, privacy, and setup behavior across README and docs.
- Split larger skill guidance into focused docs so the runtime skill stays easier for host agents to follow.

### Fixed

- Avoid duplicate local observations when manual observe recording and Stop hook recording overlap.
- Avoid hashing a full JSON hook envelope when no prompt field is present.
- Preserve existing lookback consent timestamps when consent is re-granted with the same scope.
- Keep setup hook reruns in sync when hook fields such as `async` change.
- Surface save-redacted-prompts consent in settings output.
- Remove runtime-irrelevant contributor guidance from Codex sync installs.

### Notes

- This release is intended for source installs using the README flow: clone or copy the skill, run `npm install`, then run `npm run build`.
- The npm package tarball does not include compiled `dist/` output.
