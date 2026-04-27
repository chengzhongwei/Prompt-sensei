# Prompt Sensei

> Prompting is becoming one of the most important engineering skills in the AI era. Prompt Sensei helps you improve your prompts while teaching you how to improve.

[中文说明](README-zh.md)

Prompt Sensei is a quiet, local-first prompt coach for Claude Code and Codex, including IDE/plugin environments that can load those skills. It gives stage-aware feedback, rewrites rough prompts into better ones, looks back on local history when you ask, and helps you practice one habit at a time.

No cloud. No telemetry. No leaderboard. No raw prompt archive.

---

## Why This Exists

AI coding agents do real work: they edit files, run commands, and make implementation choices. A vague prompt does not just produce a vague answer; it can produce broad edits, hidden assumptions, and extra revision loops.

Prompt Sensei is built around a simple belief:

- Prompting is an engineering skill.
- Engineering skills improve through feedback.
- Feedback should be kind, specific, private, and useful.

It does not treat `fix this test` as a bad prompt. It treats it as an early-stage prompt, then teaches the next step.

---

## 5-Minute Quickstart

Install for Claude Code:

```bash
git clone https://github.com/chengzhongwei/Prompt-sensei ~/.claude/skills/prompt-sensei
(cd ~/.claude/skills/prompt-sensei && npm install && npm run build)
```

Then start live coaching with `/prompt-sensei observe` inside Claude Code.

Install for Codex:

```bash
git clone https://github.com/chengzhongwei/Prompt-sensei ~/.codex/skills/prompt-sensei
(cd ~/.codex/skills/prompt-sensei && npm install && npm run build)
```

Then ask Codex in natural language: `Use prompt-sensei observe mode.`

Start live coaching in Claude Code:

```txt
/prompt-sensei observe
```

Try improving a rough prompt:

```txt
/prompt-sensei improve "fix this test"
```

Example output:

```txt
Prompt Sensei Improve
=====================
Stage:    Exploration
Score:    70 / 100  (Good)

What is missing:
  - failing test name
  - expected behavior
  - actual error output

Improved prompt:
  Help me debug this failing test.

  Test: [test name]
  Expected: [what should happen]
  Actual: [error output or wrong behavior]
  Related file: [file path]

  Return:
  1. Likely root cause
  2. Minimal fix
  3. Test command to verify

Habit to practice next:
  Add expected and actual behavior before asking for a fix.
```

See [examples/prompt-gallery.md](examples/prompt-gallery.md) for more copyable before/after prompts.

---

## Supported Environments

Prompt Sensei works best when the host tool can load the skill directly.

| Invocation style | Environments |
|---|---|
| Direct skill command, e.g. `/prompt-sensei improve "fix this test"` | Claude Code and compatible Claude Code skill environments |
| Natural language, e.g. `Use prompt-sensei to improve this prompt...` | Codex and IDE/plugin environments where slash commands are not available |

If Claude Code or Codex is running inside an IDE plugin and can access the installed skill, use the same Prompt Sensei workflow there.

`/prompt-sensei observe` is a Claude Code skill command. In Codex and other hosts without slash commands, natural-language requests depend on the host agent loading the installed skill. `npm run init` only creates Prompt Sensei's local consent/session record; it does not turn on live coaching by itself.

---

## Commands

```txt
/prompt-sensei [observe|stop|improve|lookback|report|help|clear|update]
```

```txt
/prompt-sensei observe              # start live coaching
/prompt-sensei stop                 # stop coaching this session
/prompt-sensei improve "fix this"   # rewrite a prompt with one teaching note
/prompt-sensei lookback             # analyze selected local prompt history
/prompt-sensei report               # show local session trends
/prompt-sensei update               # pull latest version and rebuild
/prompt-sensei clear                # delete local Prompt Sensei data
/prompt-sensei help
```

For Codex, use natural language:

```txt
Use prompt-sensei observe mode.
Use prompt-sensei to improve this prompt: "fix this test"
Use prompt-sensei to look back at my recent prompts.
Use prompt-sensei to show my report.
```

For direct script checks:

```bash
npm run init       # create local consent/session records
npm run observe    # show observe-script usage when run interactively
```

---

## How It Teaches

Prompt Sensei is stage-aware. A short exploration prompt can be reasonable early, while an execution prompt needs clearer context, boundaries, and verification.

| Stage | Meaning | Example |
|---|---|---|
| Exploration | Still figuring out the problem | `why is this broken` |
| Diagnosis | Have evidence or symptoms | `expected /login, actual /dashboard` |
| Execution | Want implementation or changes | `implement this with these constraints` |
| Verification | Want correctness checks | `find edge cases and test commands` |
| Reusable workflow | Want a repeatable process | `create a code review checklist` |
| Action | Short follow-through directive | `ok commit and push to main` |

The coaching line stays small:

> **[Sensei: 68/100 · Diagnosis; Tip: add the error message and file path]**

The report focuses on growth:

```txt
Average score:    81 / 100  (Good)
Most common type: implementation
Next habit:       End prompts with the exact test command or edge cases.
```

For the full philosophy, read [docs/philosophy.md](docs/philosophy.md). For scoring details, read [docs/scoring-rubric.md](docs/scoring-rubric.md).

---

## Lookback

`/prompt-sensei lookback` analyzes selected local Claude Code or Codex history after separate consent.

It can:

- find recent Claude Code and Codex sessions
- analyze one session or all sessions
- generate one-by-one coaching or a full lookback report
- save a markdown report only after confirmation

The flow is guided one step at a time: choose from a visible session list, choose the analysis format, choose the prompt count, then confirm consent.

Lookback reads raw history locally, redacts user prompts before analysis, and does not store raw history, prompt hashes, or derived metadata by default.

---

## Optional Claude Code Hook

Add a `UserPromptSubmit` hook to `~/.claude/settings.json` to record hash-only prompt metadata in the background after consent:

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

Hook captures are excluded from scoring because hooks do not have enough conversation context to classify the prompt or choose a coaching tip.

---

## Privacy

Prompt content is sensitive. Prompt Sensei stores nothing until you consent.

After consent, it stores local metadata only:

- `~/.prompt-sensei/events.jsonl` — observation log
- `~/.prompt-sensei/config.json` — consent record
- `~/.prompt-sensei/update-check.json` — cached update status
- `~/.prompt-sensei/reports/` — optional saved lookback reports

Prompt Sensei's local scripts do not send prompt text, scores, reports, or local event data to a service. Lookback may show redacted user prompts to the current AI agent after separate consent.

See [docs/privacy.md](docs/privacy.md) for details.

---

## Contributing

Good first areas:

- realistic prompt improvement examples
- scoring rubric improvements
- redaction rule improvements
- report improvements
- support for other AI coding tools

Please keep changes aligned with the core philosophy: quiet, local-first, encouraging, and privacy-aware.

---

## License

Apache-2.0 — Copyright 2026 Chengzhong Wei
