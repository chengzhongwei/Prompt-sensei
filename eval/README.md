# Prompt Sensei Eval Fixtures

This folder contains calibration prompts for checking how Prompt Sensei reacts to different prompt levels.

The eval suite is not a deterministic proof that a prompt is "good." Today, live scoring is produced by the host AI following `SKILL.md`, so these fixtures are designed for review and calibration:

- Does Sensei choose the expected stage?
- If the fixture lists acceptable stages, does Sensei choose one of them and explain the tradeoff well?
- Is the score inside a reasonable band?
- Are the flags, tip kind, and tip aligned with the most useful next habit?
- Does the coaching stay kind and stage-aware?
- Does it avoid treating coding-agent rules as universal prompt quality?

Run:

```bash
npm run build
npm run eval
```

Then paste one fixture prompt at a time into `/prompt-sensei improve` or observe mode and compare the real Sensei response with the expected stage, score band, flags, tip kind, and tip theme.

Use `npm run eval -- --case execution-medium-001` to print a single fixture.

Use `npm --silent run eval -- --json` when you need machine-readable JSON. Plain `npm run` prints an npm banner before script output.
