# Philosophy

## The core belief

Prompting is becoming an engineering skill — and engineering skills improve through feedback.

But feedback should be kind, specific, private, contextual, useful, and non-performative.

A good prompt mentor does not say: **Bad prompt.**

It says: **This was reasonable as an exploration prompt. Now that you know the failing behavior, the next improvement is to add expected behavior, actual behavior, and a verification command.**

---

## Why AI coding prompts are different

Prompting for a chat model is forgiving. If your question is vague, the model gives a vague answer and you try again. The cost is low.

Prompting for an agentic coding tool like Claude Code is different. The agent edits real files, makes real changes, and can produce results that are hard to reverse. A vague prompt does not just produce a vague answer — it produces undiscussed decisions, over-broad edits, and revision loops that waste time.

Prompt quality in this context is a professional skill, not a nicety.

---

## Stage awareness

The most important design principle in Prompt Sensei is that **stage matters more than surface quality**.

A one-line exploration prompt like `why is auth broken` is not a failed execution prompt. It is the right prompt for the moment — you are still gathering evidence. Penalizing it like an execution request is wrong and discouraging.

Prompt Sensei classifies every prompt before scoring it. An exploration prompt is scored lightly — primarily on goal clarity and privacy. An execution prompt is scored on all seven dimensions. The same feedback that helps an execution prompt would confuse someone still in exploration.

This is the key insight the rubric is built around.

---

## Observe, don't interrupt

Feedback that blocks a task is annoying. Feedback that follows a task is useful.

Prompt Sensei's observe mode runs alongside your work, not in front of it. The one-line score appears after your response, not before it. You can ignore it or use it — the choice is yours.

This is the observe-don't-interrupt principle. Sensei watches, takes notes, and speaks when invited.

---

## One habit at a time

The instinct when giving feedback is to list everything that could be improved. That is not teaching. That is overwhelming.

Prompt Sensei gives one "habit to practice next" per prompt. Not five suggestions. One. The single most impactful thing.

This is slow enough to internalize and fast enough to try immediately.

---

## Growth over perfection

Prompt Sensei tracks trends, not one-off scores. A prompt that scores 2.5 is not a failure — it is a baseline. If the next similar prompt scores 3.2, that is progress worth noting.

The reports are designed to show movement, not rank. The goal is "Is the user learning?" not "Is this prompt good?"

---

## Privacy as a first principle

Prompt content is sensitive. It often contains business logic, debugging context, internal file paths, or in-progress thinking. Storing it without consent is not acceptable.

Prompt Sensei stores nothing by default except scores and metadata. No raw text. No cloud. No accounts. The consent check at first use is not a legal formality — it is a moment to give users control before data collection starts.

The data that is stored is auditable: it is human-readable JSON in a file on your machine. You can inspect it, understand it, and delete it in seconds.

---

## What Prompt Sensei is not

It is not a linter that enforces one correct style. Context changes what a good prompt looks like. The rubric is a starting point — your judgment is the finish line.

It is not a productivity monitor. It does not report to anyone. There are no dashboards, no org-level aggregates, no leaderboards.

It is not a substitute for domain knowledge. Knowing what to ask requires expertise. Prompt Sensei only helps with how to ask it.

It is a small, local mentor for building better prompting habits — and ideally, making itself unnecessary.
