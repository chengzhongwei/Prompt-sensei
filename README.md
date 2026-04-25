# Prompt Sensei

> A quiet, local-first prompt mentor for engineers using AI coding tools.

Prompt Sensei is a small Claude Code skill that helps developers turn rough intent into clear, work-ready prompts — with gentle, stage-aware feedback and no cloud backend.

It is not a leaderboard. It is not employee surveillance. It is not prompt police.

---

## 10-second demo

**You write:**

```
fix this test
```

**Prompt Sensei replies:**

```
Stage:    Exploration
Score:    2.0 / 5  (as execution-ready)
          3.5 / 5  (as exploration)

Habit to practice next:
  Add expected behavior and actual behavior to every debugging prompt.

Suggested rewrite:
  Please debug this failing Jest test.
  Context:
    - Stack: TypeScript, React, Jest
    - Related file: src/__tests__/auth.test.ts
    - Expected: unauthenticated users redirect to /login
    - Actual: test redirects to /dashboard
  Return:
    1. Root cause
    2. Minimal fix
    3. Test command
    4. Edge cases to verify
```

That is the difference between a vague request and a work-ready AI prompt.

---

## Install

```bash
git clone https://github.com/chengzhongwei/Prompt-sensei.git
cd Prompt-sensei
npm install
npm run build

mkdir -p ~/.claude/skills
cp -R .claude/skills/prompt-sensei ~/.claude/skills/prompt-sensei
```

Claude Code picks up skills in `~/.claude/skills/` automatically. Restart your Claude Code session to load the new skill.

> The repo is a development workspace. The skill itself lives at `.claude/skills/prompt-sensei/`. The `cp -R` step is what makes it discoverable as a global Claude Code skill.

---

## Usage

### Review a specific prompt

```
/prompt-sensei review "fix this test"
```

You'll get a scorecard, the single highest-impact habit to practice next, and a suggested rewrite.

### Session coaching mode

```
/prompt-sensei observe
```

Prompt Sensei will append a one-line score after each of its responses for the rest of the session.

```
[Sensei: Score - 68/100; Tip: add the error message and file path]
```

When your prompt is excellent:

```
[Sensei: Score - 94/100; Excellent — execution-ready prompt]
```

Session coaching is skill-driven: Claude classifies each prompt against the rubric, scores it, and records lightweight metadata via `observe.js`.

### Reports

```
/prompt-sensei report
```

Shows your average score, trend, most common task types, most common gaps, and one focused growth area.

### Clear local data

```
/prompt-sensei clear
```

Wipes `~/.prompt-sensei/events.jsonl`. Add `--all` to also reset consent.

---

## Why Prompt Sensei?

AI-assisted engineering is becoming a daily workflow. But most teams still struggle with prompts like:

```txt
fix this
why is this broken
make it better
```

These prompts are not "wrong." They are often just early-stage thoughts.

Prompt Sensei helps developers gradually improve by asking: was this exploration or execution? did it include enough context? did it define the expected output? did it include verification steps? did the user improve compared with previous prompts?

The goal is not perfect prompting. The goal is better AI-assisted work.

---

## What makes it different

| Feature | Prompt Sensei |
|---|---|
| Quiet by default | Does not interrupt your flow |
| Local-first | No cloud backend, no telemetry, no login |
| Privacy-aware | Raw prompt text is never stored |
| Stage-aware | Does not punish exploratory prompts |
| Encouraging | Teacher-like feedback, not harsh grades |
| Engineering-focused | Built for debugging, coding, code review, planning, docs, architecture |
| Growth-oriented | Tracks improvement patterns over time |

---

## Prompt stages

Prompt Sensei classifies every prompt before scoring it. The same prompt may be a 2/5 execution prompt and a 4/5 exploration prompt — stage matters.

| Stage | Meaning | Example |
|---|---|---|
| Exploration | Still figuring out the problem | `why is this broken` |
| Diagnosis | Has evidence or symptoms | `expected /login, actual /dashboard` |
| Execution | Wants implementation or changes | `implement this with these constraints` |
| Verification | Wants correctness checks | `find edge cases and test commands` |
| Reusable workflow | Wants a repeatable process | `create a code review checklist` |

---

## Scoring dimensions

| Dimension | What it checks |
|---|---|
| Goal clarity | Is the desired outcome clear? |
| Context completeness | Did the user provide enough background? |
| Input boundaries | Is the relevant input clear? |
| Constraints | Are scope and tradeoffs defined? |
| Output format | Did the user specify the desired structure? |
| Verification | Did the user ask how to check correctness? |
| Privacy/safety | Did the prompt avoid unnecessary sensitive data? |

Scores are used for private feedback and trend tracking, not public ranking. See [docs/scoring-rubric.md](docs/scoring-rubric.md).

---

## Privacy

Prompt Sensei is privacy-first by design.

- No cloud backend
- No telemetry
- No login
- No leaderboard
- **Raw prompt text is never stored.** Only metadata: timestamp, stage, task type, score, and lightweight flags. Optionally a SHA-256 hash of the redacted prompt.

All data lives at `~/.prompt-sensei/events.jsonl` on your local machine. Inspect it, delete it, or `rm -rf ~/.prompt-sensei/` at any time.

See [docs/privacy.md](docs/privacy.md).

---

## Example report

```
# Prompt Sensei Report
Observed 18 prompts in the last 7 days.

Average score:      3.4 / 5
Trend:              ↑  0.3 vs previous period
Most common type:   debugging
Most common stage:  diagnosis

## Most common gaps
- missing-context (7×)
- no-verification (5×)
- no-constraints (3×)

## Feedback
Your scores are trending upward. The practice is working.
You are writing good prompts. One more habit — verification steps —
will take you to the next level.

Main growth area: Try adding the error message or stack trace to every
debugging prompt.
```

---

## Good prompt pattern

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

## Who is this for?

- engineers using Claude Code
- teams adopting AI coding tools
- developers who want better AI results
- people learning prompt engineering through practice

Especially useful for prompts involving: debugging, implementation, code review, refactoring, architecture, planning, documentation, and tests.

---

## What this is not

- a prompt marketplace
- a prompt optimizer for marketing copy
- a production LLM eval platform
- an employee monitoring tool
- a replacement for engineering judgment

---

## Contributing

Contributions are welcome. Good first contributions:

- realistic prompt improvement examples
- improvements to the scoring rubric
- improvements to redaction rules
- additional task classifiers
- better reports
- support for other AI coding tools

Please keep the project aligned with the core philosophy: quiet, local-first, encouraging, and privacy-aware.

---

## License

Apache-2.0 — Copyright 2026 Chengzhong Wei
