# Prompt Sensei

> A quiet, local-first prompt mentor for engineers using AI coding tools.

Prompt Sensei helps developers improve their AI prompts over time with gentle, stage-aware feedback.

It is not a leaderboard.
It is not employee surveillance.
It is not prompt police.

It is a small Claude Code skill and local prompt-coaching toolkit that helps engineers turn rough intent into clear, effective, work-ready prompts.

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

A vague prompt may be fine during exploration, but not enough for execution.

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
Score:           2.0 / 5  (as execution-ready)
                 3.5 / 5  (as exploration)

What is good:
  You clearly indicated you need debugging help.

What is missing:
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

Use it on demand:

```
/prompt-sensei
```

or:

```
/prompt-sensei review this prompt:
"fix this test"
```

The skill gives feedback on prompt stage, task type, clarity, context, constraints, output format, verification, privacy/safety, a suggested rewrite, and one habit to practice next.

### 2. Observe Mode — Inline Scoring

Activate observation mode to get a live score after every prompt you send:

```
/prompt-sensei observe
```

After each message, Prompt Sensei appends a one-line score at the end of its response:

```
[Sensei: Score - 68/100; Tip: add the error message and file path]
```

When your prompt is excellent:

```
[Sensei: Score - 94/100; Excellent — execution-ready prompt]
```

The score is calculated from 7 dimensions on a 1–5 scale, converted to /100. The tip always names the single most impactful improvement — one habit at a time, not a list.

Scores by stage:

| Score | Grade | What it means |
|---|---|---|
| 90–100 | Excellent | Execution-ready |
| 70–89 | Good | Minor gaps |
| 50–69 | Developing | Clear improvements available |
| 30–49 | Early stage | Normal for exploration |
| 10–29 | Needs work | Start with goal clarity |

To see your session statistics:

```
/prompt-sensei report
```

To clear local data:

```
/prompt-sensei clear
```

### 3. Optional Local Observer

Prompt Sensei can optionally observe Claude Code prompts through a local hook, recording metadata silently in the background without needing the skill to be active.

The observer:

- reads prompt events locally
- redacts sensitive data (emails, API keys, tokens)
- hashes prompts
- classifies prompt stage
- scores prompt quality
- stores lightweight metadata locally
- generates private reports

By default, it does not store raw prompts.

---

## Installation

### Install globally

```bash
git clone https://github.com/chengzhongwei/Prompt-sensei ~/.claude/skills/prompt-sensei
cd ~/.claude/skills/prompt-sensei
npm install
npm run build
```

Claude Code picks up skills in `~/.claude/skills/` automatically.

### Use as a Claude Code skill

```
/prompt-sensei
```

or:

```
/prompt-sensei review this prompt:
"help me fix this"
```

### Optional: Enable local prompt observation

Add to your Claude Code settings (`~/.claude/settings.json`):

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.claude/skills/prompt-sensei/dist/scripts/observe.js",
            "async": true,
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

The observer writes local metadata to `~/.prompt-sensei/events.jsonl`.

Generate a report:

```bash
npm run report
```

Clear local data:

```bash
npm run clear-data
```

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

By default, Prompt Sensei stores only: timestamp, task type, prompt stage, prompt hash, scores, and lightweight feedback.

Raw prompt storage is opt-in only:

```bash
PROMPT_SENSEI_STORE_RAW=1 npm run observe
```

Even then, Prompt Sensei attempts to redact emails, API keys, tokens, private keys, and URLs with query parameters before storing.

See [docs/privacy.md](docs/privacy.md) for full details.

---

## Example Report

```
# Prompt Sensei Report
Observed 18 prompts in the last 7 days.

Average score:      3.4 / 5
Most common type:   debugging
Most common stage:  diagnosis

## What improved
You are adding expected vs actual behavior more often.
This makes debugging prompts much easier for AI tools to answer reliably.

## Main growth area
Verification is still missing in many prompts.
Try adding:
  "Please include the test command and edge cases to verify."

## Encouragement
Your prompts are becoming more execution-ready. You are moving from broad
exploration toward clearer debugging and implementation requests.
```

---

## Who Is This For?

Prompt Sensei is for:

- engineers using Claude Code
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
