# Prompt Sensei

> A quiet, local-first prompt mentor for engineers using AI coding tools.

[中文说明](README-zh.md)

Prompt Sensei helps developers improve their AI prompts over time with gentle, stage-aware feedback.

It is not a leaderboard.
It is not employee surveillance.
It is not prompt police.

It is a small AI coding skill and local prompt-coaching toolkit that helps engineers turn rough intent into clear, effective, work-ready prompts.

---

## Installation

```bash
git clone https://github.com/chengzhongwei/Prompt-sensei ~/.claude/skills/prompt-sensei
(cd ~/.claude/skills/prompt-sensei && npm install && npm run build)
```

Claude Code picks up skills in `~/.claude/skills/` automatically.

### Use as a Claude Code skill

```
/prompt-sensei [observe|stop|report|review|help|clear|update]
```

With no arguments, starts observation mode by default — scores your prompts quietly as you work.

```
/prompt-sensei observe          # start scoring
/prompt-sensei stop             # stop scoring this session
/prompt-sensei review "help me fix this"
/prompt-sensei report
/prompt-sensei update
/prompt-sensei help
```

### Use as a Codex skill

Install the same project into Codex's skills directory:

```bash
git clone https://github.com/chengzhongwei/Prompt-sensei ~/.codex/skills/prompt-sensei
(cd ~/.codex/skills/prompt-sensei && npm install && npm run build)
```

Codex does not use the Claude Code slash-command hook model. Use natural language instead:

```txt
Use prompt-sensei to review this prompt: "fix this test"
Use prompt-sensei to show my report.
Use prompt-sensei observe for this session.
```

Codex can use the same rubric and local report scripts. Automatic per-message observation depends on the host app keeping the skill active in context; the Claude Code hook shown below is Claude-specific.

### Optional: Enable local prompt observation

Add to your Claude Code settings (`~/.claude/settings.json`):

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "type": "command",
        "command": "node ~/.claude/skills/prompt-sensei/dist/scripts/observe.js --hash-only",
        "async": true,
        "timeout": 10
      }
    ]
  }
}
```

The hook writes only a redacted prompt hash to `~/.prompt-sensei/events.jsonl`, and only after you have consented by running `/prompt-sensei observe` once. Hash-only hook captures are excluded from scoring because the hook does not have the conversation context needed for stage-aware feedback.

Generate a report:

```bash
npm run report
```

Clear local data:

```bash
npm run clear-data
```

Check for updates:

```bash
npm run check-update
```

Apply updates:

```bash
npm run update
```

Prompt Sensei checks for updates in the background at most once per day during observe/report activity. It never auto-updates; it only tells you when a newer commit is available. Run `/prompt-sensei update` or `npm run update` to pull the latest version and rebuild.

---

## Why Prompt Sensei?

AI-assisted engineering is becoming a daily workflow. But most teams still struggle with prompts like:

```txt
fix this
why is this broken
make it better
```

These prompts are not "wrong." They are often just early-stage thoughts.

Prompt Sensei helps developers gradually improve by asking:

- Was this an exploration prompt?
- Was this ready for implementation?
- Did it include enough context?
- Did it define the expected output?
- Did it include verification steps?
- Did the user improve compared with previous prompts?

The goal is not perfect prompting. The goal is better AI-assisted work.

---

## What Makes Prompt Sensei Different?

Most prompt tools try to rewrite your prompt. Prompt Sensei is different.

| Feature | Prompt Sensei |
|---|---|
| Quiet by default | Does not interrupt your flow |
| Local-first | No cloud backend required |
| Privacy-aware | Does not store raw prompts by default |
| Stage-aware | Does not punish early exploratory prompts |
| Encouraging | Gives teacher-like feedback, not harsh grades |
| Engineering-focused | Built for debugging, coding, code review, planning, docs, and architecture |
| Growth-oriented | Tracks improvement patterns over time |

Prompt Sensei understands that this:

```
why is auth broken
```

may be a totally reasonable exploration prompt. But once more context is known, it can help you grow toward this:

```
Please debug this failing Jest test.
Goal:
  Find why unauthenticated users are redirected to /dashboard instead of /login.
Context:
  - Stack: TypeScript, React, Jest
  - Recent change: added refresh-token support
  - Related files:
    - src/middleware/auth.ts
    - src/routes/ProtectedRoute.tsx
    - src/__tests__/auth.test.ts
Expected:
  If the user has no access token and no refresh token, redirect to /login.
Actual:
  The test receives /dashboard.
Constraints:
  - Do not refactor the whole auth flow.
  - Prefer the smallest safe fix.
  - If the test expectation is wrong, explain why before changing it.
Return:
  1. Root cause
  2. Proposed fix
  3. Patch summary
  4. Test command
  5. Edge cases to verify
```

That is the difference between a vague request and a work-ready AI prompt.

---

## Prompt Stages

Prompt Sensei does not treat every prompt the same.

| Stage | Meaning | Example |
|---|---|---|
| Exploration | You are still figuring out the problem | `why is this broken` |
| Diagnosis | You have evidence or symptoms | `expected /login, actual /dashboard` |
| Execution | You want implementation or changes | `implement this with these constraints` |
| Verification | You want correctness checks | `find edge cases and test commands` |
| Reusable workflow | You want a repeatable process | `create a code review checklist` |
| Action | Short follow-through directive in an established session | `ok commit and push to main`, `run the tests` |

A vague prompt may be fine during exploration, but not enough for execution. Action prompts are never scored on Constraints, Verification, or Output Format — those dimensions don't apply to operational directives.

---

## Scoring Dimensions

Prompt Sensei scores prompts across seven practical dimensions:

| Dimension | What it checks |
|---|---|
| Goal clarity | Is the desired outcome clear? |
| Context completeness | Did the user provide enough background? |
| Input boundaries | Is the relevant input clear? |
| Constraints | Are scope and tradeoffs defined? |
| Output format | Did the user specify the desired structure? |
| Verification | Did the user ask how to check correctness? |
| Privacy/safety | Did the prompt avoid unnecessary sensitive data? |

Scores are used for private feedback and trend tracking, not public ranking.

---

## Demo

**Beginner prompt**

```
fix this test
```

**Prompt Sensei feedback**

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

Habit to practice next:
  Add expected behavior and actual behavior to every debugging prompt.
```

---

## Example Progress Over Time

Prompt Sensei is designed to notice improvement.

**Day 1:** `"fix this test"`
Feedback: Good starting point, but missing context and verification.

**Day 2:** `"A Jest test is failing. Expected /login, actual /dashboard."`
Feedback: Nice improvement. You added expected vs actual behavior.

**Day 4:**
```
Please debug this failing Jest test. Context: TypeScript, React, Jest.
Recent change: added refresh-token support. Expected no token redirects to /login.
Actual: redirects to /dashboard. Do not refactor the auth flow. Return root cause,
minimal fix, test command, and edge cases.
```
Feedback: Excellent. This is now execution-ready.

Prompt Sensei does not just ask "Was this prompt good?" It asks "Is the user learning?"

---

## How It Works

### 1. Claude Code Skill

Start observation mode with no arguments:

```
/prompt-sensei
```

This is the same as:

```
/prompt-sensei observe
```

Use review mode when you want feedback on one specific prompt without starting ongoing observation:

```
/prompt-sensei review this prompt:
"fix this test"
```

Review mode gives feedback on prompt stage, task type, clarity, context, constraints, output format, verification, privacy/safety, a suggested rewrite, and one habit to practice next.

### 2. Observe Mode — Inline Scoring

Activate observation mode to get a live score after every prompt you send:

```
/prompt-sensei observe
```

`/prompt-sensei` with no arguments also starts observation mode.

After each message, Prompt Sensei appends a one-line score at the end of its response:

> **[Sensei: Score - 68/100; Tip: add the error message and file path]**

When your prompt is excellent:

> **[Sensei: Score - 94/100; Excellent — execution-ready prompt]**

The score is calculated from 7 dimensions on a 1–5 scale, converted to /100. The tip always names the single most impactful improvement — one habit at a time, not a list.

Scores by stage:

| Score | Grade | What it means |
|---|---|---|
| 90–100 | Excellent | Execution-ready |
| 70–89 | Good | Minor gaps |
| 50–69 | Developing | Clear improvements available |
| 30–49 | Early stage | Normal for exploration |
| 10–29 | Needs work | Start with goal clarity |

Action prompts (short follow-through directives) are only scored on Goal Clarity and Privacy/Safety — never penalized for missing Constraints, Verification, or Output Format.

### Why stage-aware scores can move down

Prompt Sensei does not ask "is this a perfect execution prompt?" at every stage. It first asks "what kind of prompt is this?"

An early debugging prompt like `why is auth broken` may score well as Exploration because it only needs a clear direction and no sensitive data. Later, once you ask the agent to edit files, the same level of detail would score lower as Execution because more dimensions apply: context, input boundaries, constraints, output format, and verification.

So a score can dip when a prompt moves from Exploration to Execution. That is not a regression. It means the prompt has entered a stage where the agent can make real changes, so Prompt Sensei raises the bar.

To stop observation for the current session:

```
/prompt-sensei stop
```

To see your session statistics:

```
/prompt-sensei report
```

To update Prompt Sensei:

```
/prompt-sensei update
```

To clear local data:

```
/prompt-sensei clear
```

### 3. Optional Local Hook

Prompt Sensei can optionally hash Claude Code prompts through a local hook, recording lightweight metadata silently in the background after consent.

The hook:

- reads prompt events locally
- redacts sensitive data (emails, API keys, tokens)
- hashes prompts
- stores the hash locally as a hash-only capture

It does not classify or score prompts. Stage-aware scoring happens only in `/prompt-sensei observe`, where Claude has enough session context to classify the prompt and append feedback.

---

## Good Prompt Pattern

Prompt Sensei encourages this simple structure:

```
Goal:         What do you want?
Context:      What should the AI know?
Input:        What should the AI use?
Constraints:  What should the AI avoid or prioritize?
Output:       How should the answer be structured?
Verification: How should correctness be checked?
```

---

## Privacy Model

Prompt Sensei is privacy-first by design.

**Default behavior:**
- no cloud backend
- no telemetry
- no login
- no leaderboard
- no raw prompt storage

By default, Prompt Sensei stores only: timestamp, task type, prompt stage, prompt hash, scores, and lightweight feedback tags. Hook mode stores only timestamp and prompt hash.

Two files are created locally on first use:
- `~/.prompt-sensei/events.jsonl` — observation log
- `~/.prompt-sensei/config.json` — consent record (created once)

See [docs/privacy.md](docs/privacy.md) for full details.

---

## Example Report

```
# Prompt Sensei Report
Observed 18 prompts in the last 7 days.

**Average score:**     68 / 100  (Developing)
**Trend:**             ↑  6 pts vs previous 5 prompts
**Most common type:**  debugging
**Most common stage:** diagnosis
**Stage trend:**       more execution prompts recently (3/5 vs 1/5 previous)

**Score history:**     ▂▃▃▄▄▄▅▅▆▆

## Most common gaps
- missing-context (7×)
- no-verification (5×)
- no-constraints (3×)

## Growth area by task type
- debugging: missing-context (5×)
- implementation: no-verification (3×)

## Stage breakdown
- diagnosis: 9 (50%)
- execution: 6 (33%)
- exploration: 3 (17%)

## Update
Update available on `main`.
- Local: 65fb4ad
- Remote: 31e4a5b
- Run `/prompt-sensei update` to update.

## Feedback
Your scores are trending upward. The practice is working.
Your debugging prompts are in the developing range. The next gain is likely one missing detail, not a full rewrite.

Next habit for debugging: Add the error message, expected behavior, and recent change before asking for help.
Why it matters: Context is the difference between guessing and diagnosing.
Practice: For the next three debugging prompts, include Expected, Actual, and Recent change.
```

---

## Who Is This For?

Prompt Sensei is for:

- engineers using Claude Code, Codex, or similar AI coding agents
- teams adopting AI coding tools
- developers who want better AI results
- people learning prompt engineering through practice

It is especially useful for prompts involving: debugging, implementation, code review, refactoring, architecture, planning, documentation, and tests.

---

## What This Is Not

Prompt Sensei is not:

- a prompt marketplace
- a prompt optimizer for marketing copy
- a production LLM eval platform
- an employee monitoring tool
- a replacement for engineering judgment

It is a small, local mentor for building better prompting habits.

---

## Contributing

Contributions are welcome. Good first contributions:

- add realistic prompt improvement examples
- improve the scoring rubric
- improve redaction rules
- add more task classifiers
- improve reports
- add support for other AI coding tools

Please keep the project aligned with the core philosophy: quiet, local-first, encouraging, and privacy-aware.

---

## License

Apache-2.0 — Copyright 2026 Chengzhong Wei
