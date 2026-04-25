# Example: A Debugging Journey

This example shows one prompt improving across three iterations. Each iteration applies the feedback from the previous score.

---

## Iteration 1 — First attempt

**Prompt:**
> fix the login bug

**Score: 12/100 — Needs work**

| Criterion            | Score |
|----------------------|-------|
| Intent Clarity       | 4/20  |
| Context Richness     | 2/20  |
| Explicit Constraints | 2/20  |
| Appropriate Scope    | 2/20  |
| Output Specification | 2/20  |

**Feedback:**
- **Intent Clarity**: "fix" + "bug" tells Claude almost nothing. What kind of bug? What is the wrong behavior?
- **Context Richness**: No error, no file, no reproduction steps. Claude will ask 3–4 follow-up questions before doing anything useful.

---

## Iteration 2 — Added context

**Prompt:**
> The login form is submitting but users aren't being redirected after successful login. There's no error in the console. Fix it.

**Score: 48/100 — Beginner**

| Criterion            | Score |
|----------------------|-------|
| Intent Clarity       | 14/20 |
| Context Richness     | 8/20  |
| Explicit Constraints | 4/20  |
| Appropriate Scope    | 12/20 |
| Output Specification | 10/20 |

**Feedback:**
- **Context Richness**: Better — symptom is clear. Still missing: which file handles the redirect? Which framework (Next.js, React Router, plain JS)?
- **Explicit Constraints**: Should Claude add logging? Touch the auth middleware? Modify tests?

---

## Iteration 3 — Full prompt

**Prompt:**
> After a successful login, users should be redirected to `/dashboard` but they stay on the `/login` page. No console errors. The login logic is in `src/pages/login.tsx` — the `handleSubmit` function calls `signIn()` from next-auth and then should call `router.push('/dashboard')`. I think the issue is that `router.push` runs before `signIn` resolves. Fix the async handling in `handleSubmit` only — don't change the auth config, middleware, or tests.

**Score: 91/100 — Master**

| Criterion            | Score |
|----------------------|-------|
| Intent Clarity       | 19/20 |
| Context Richness     | 18/20 |
| Explicit Constraints | 18/20 |
| Appropriate Scope    | 18/20 |
| Output Specification | 18/20 |

**Feedback:**
- Near-perfect. Claude can go directly to the fix.
- Minor gap: "Output Specification" — could mention whether a test update is expected, but the constraint "don't change tests" makes this acceptable.

---

## What changed

| Version | Key addition                           | Score jump |
|---------|----------------------------------------|------------|
| v1 → v2 | Named the symptom                      | +36        |
| v2 → v3 | Added file path, root cause hypothesis, and constraints | +43 |

The largest gains came from **context** (knowing where to look) and **constraints** (knowing what not to touch). Both took under 30 seconds to add.

---

## The pattern

Good debugging prompts tend to follow this structure:

```
[Symptom]: What is visibly wrong
[Expected behavior]: What should happen instead
[Location]: File + function where the issue likely lives
[Hypothesis]: What you think might be causing it (even if unsure)
[Constraints]: What Claude should not touch
```

You don't need all five parts every time, but having them ready makes the difference between one round and five.
