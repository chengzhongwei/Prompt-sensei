# Prompt Sensei

> A quiet, local-first prompt mentor for engineers using AI coding tools.

[中文说明](README-zh.md)

Prompt Sensei gives stage-aware coaching on your AI prompts — quietly in the background, no cloud, no leaderboard.

---

## Installation

```bash
git clone https://github.com/chengzhongwei/Prompt-sensei ~/.claude/skills/prompt-sensei
(cd ~/.claude/skills/prompt-sensei && npm install && npm run build)
```

Claude Code picks up skills in `~/.claude/skills/` automatically.

For Codex:

```bash
git clone https://github.com/chengzhongwei/Prompt-sensei ~/.codex/skills/prompt-sensei
(cd ~/.codex/skills/prompt-sensei && npm install && npm run build)
```

---

## Usage

```
/prompt-sensei [observe|stop|report|review|help|clear|update]
```

With no arguments, starts observation mode by default.

```
/prompt-sensei observe          # start scoring
/prompt-sensei stop             # stop scoring this session
/prompt-sensei review "help me fix this"
/prompt-sensei report
/prompt-sensei update
/prompt-sensei help
```

For Codex (no slash-command support), use natural language:

```txt
Use prompt-sensei to review this prompt: "fix this test"
Use prompt-sensei to show my report.
```

---

## Optional: Local Hook

Add a `UserPromptSubmit` hook to `~/.claude/settings.json` to record lightweight prompt metadata in the background (hash only, no raw text):

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.claude/skills/prompt-sensei/dist/scripts/observe.js --hash-only",
            "async": true,
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

The hook only writes after you consent by running `/prompt-sensei observe` once. Hash-only captures are excluded from scoring — stage-aware feedback requires conversation context.

If your Claude Code version supports `Stop` hooks:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.claude/skills/prompt-sensei/dist/scripts/observe.js --hash-only",
            "async": true,
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

---

## Demo

**Prompt:** `fix this test`

**Prompt Sensei feedback:**

```
Prompt stage:    Exploration
Score:           70 / 100  (Good for Exploration)

What is good:
  You clearly indicated you need debugging help.

What is missing for execution:
  - failing test output
  - expected behavior
  - actual behavior
  - related files
  - verification command

Habit to practice next:
  Add expected behavior and actual behavior to every debugging prompt.
```

After scoring in observation mode, each response ends with:

> **[Sensei: 68/100 · Diagnosis; Tip: add the error message and file path]**

See [examples/debugging-journey.md](examples/debugging-journey.md) for a full before/after progression.

---

## Prompt Stages

| Stage | Meaning | Example |
|---|---|---|
| Exploration | Still figuring out the problem | `why is this broken` |
| Diagnosis | Have evidence or symptoms | `expected /login, actual /dashboard` |
| Execution | Want implementation or changes | `implement this with these constraints` |
| Verification | Want correctness checks | `find edge cases and test commands` |
| Reusable workflow | Want a repeatable process | `create a code review checklist` |
| Action | Short follow-through directive | `ok commit and push to main` |

Action prompts are never penalized for missing Constraints, Verification, or Output Format.

See [docs/scoring-rubric.md](docs/scoring-rubric.md) for full dimension definitions and stage weights.

---

## Good Prompt Pattern

```
Goal:         What do you want?
Context:      What should the AI know?
Input:        What should the AI use?
Constraints:  What should the AI avoid or prioritize?
Output:       How should the answer be structured?
Verification: How should correctness be checked?
```

Not every prompt needs all six parts. Match the structure to the stage.

---

## Example Report

```
# Prompt Sensei Report
Observed 18 prompts in the last 7 days.

**Average score:**     68 / 100  (Developing)
**Trend:**             ↑  6 pts vs previous 5 prompts
**Most common type:**  debugging
**Most common stage:** diagnosis

**Score history:**     ▂▃▃▄▄▄▅▅▆▆

## Most common gaps
- missing-context (7×)
- no-verification (5×)
- no-constraints (3×)

## Feedback
Your scores are trending upward. The practice is working.
Next habit for debugging: Add the error message, expected behavior, and recent change before asking for help.
```

---

## Privacy

Local only — no cloud, no telemetry, no login.

By default, stores: timestamp, task type, prompt stage, prompt hash, scores, and feedback tags. Never stores raw prompt text.

- `~/.prompt-sensei/events.jsonl` — observation log
- `~/.prompt-sensei/config.json` — consent record

See [docs/privacy.md](docs/privacy.md) for full details.

---

## Contributing

Contributions are welcome. Good first areas:

- realistic prompt improvement examples
- scoring rubric improvements
- redaction rule improvements
- additional task classifiers
- report improvements
- support for other AI coding tools

Please keep changes aligned with the core philosophy: quiet, local-first, encouraging, and privacy-aware.

---

## License

Apache-2.0 — Copyright 2026 Chengzhong Wei
