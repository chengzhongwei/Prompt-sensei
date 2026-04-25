# Philosophy

## Why prompt quality matters

A Claude Code session is only as good as the instructions driving it. A vague prompt produces a guess. A precise prompt produces a result. The gap between the two isn't intelligence — it's craft.

Prompt Sensei exists to make that craft learnable.

## What we believe

**Prompts are a skill, not a talent.**
Good prompting isn't intuitive for most people. It can be taught with a clear rubric, honest feedback, and repeated practice. Anyone who writes prompts can improve them.

**Feedback must be specific to be useful.**
"Be clearer" is not feedback. "Add the error message and the file path where this fails" is. Prompt Sensei gives concrete, line-level suggestions, not general advice.

**The goal is transfer, not dependency.**
The best outcome of using Prompt Sensei is that users stop needing it — because they've internalized the rubric. A score is a mirror, not a leash.

**Privacy is the default.**
Prompt content is sensitive. It often contains business logic, personal context, or in-progress thinking. Prompt Sensei stores nothing by default except scores and metadata. Raw prompts are never sent anywhere and are only stored locally when you explicitly opt in.

**Local tools stay local.**
No telemetry. No cloud sync. No accounts. The session store is a directory on your machine, and `clear` makes it gone for real.

## What this is not

Prompt Sensei is not a linter that enforces a single "correct" way to prompt. Context changes what a good prompt looks like. A quick one-liner asking about a shell flag and a multi-step implementation request need different things. The rubric is a starting point — your judgment is the finish line.

It is also not a substitute for domain knowledge. Knowing what to ask is different from knowing how to ask it. Prompt Sensei only helps with the latter.

## Design principles

1. **One actionable tip is worth ten observations.** Surface the two lowest-scoring dimensions and say specifically what to fix.
2. **Right-size the feedback to the context.** In observe mode, one line. In score mode, a full breakdown. Match interruption to intent.
3. **Celebrate meaningful progress.** Moving from 55 to 75 matters more than moving from 90 to 95. Acknowledge milestones.
4. **Never store more than needed.** The smallest useful data unit is a score and timestamp. Start there.
