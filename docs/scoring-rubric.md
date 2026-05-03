# Scoring Rubric

Prompt Sensei scores prompts across seven dimensions, with applicable dimensions chosen by prompt stage. Not every dimension applies to every prompt — an exploration prompt is not a failed execution prompt.

---

## Prompt Stages

Before scoring, classify the prompt:

| Stage | Description |
|---|---|
| **Exploration** | Still figuring out the problem — "why is this broken?" |
| **Diagnosis** | Has symptoms and evidence — "expected X, got Y" |
| **Execution** | Wants implementation — imperative verb, specific scope |
| **Verification** | Wants correctness checks — edge cases, tests, review |
| **Reusable workflow** | Wants a repeatable template or process |
| **Action** | Short follow-through directive in an established session — ≤8 words, refers entirely to prior context, no new requirements. E.g. "ok commit and push to main", "run the tests", "revert that" |

Action prompts are never penalized for missing Constraints, Verification, or Output Format — those dimensions do not apply to operational directives.

**Dimensions scored per stage:**

| Dimension | Exploration | Diagnosis | Execution | Verification | Reusable workflow | Action |
|---|---|---|---|---|---|---|
| Goal Clarity | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Context Completeness | | ✓ | ✓ | ✓ | ✓ | |
| Input Boundaries | | | ✓ | ✓ | ✓ | |
| Constraints | | | ✓ | | ✓ | |
| Output Format | | | ✓ | ✓ | ✓ | |
| Verification | | | ✓ | ✓ | ✓ | |
| Privacy/Safety | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## Dimension Definitions

### 1. Goal Clarity (all stages)

Is the desired outcome unambiguous?

| Score | Description | Example |
|---|---|---|
| 1 | No discernible goal | "Fix it." "Make it better." |
| 2 | Goal implied but ambiguous | "Clean up the auth code." |
| 3 | Goal stated, no completion criteria | "Refactor the login function." |
| 4 | Goal + one completion criterion | "Refactor login() to async/await, return typed result." |
| 5 | Goal + criterion + success definition | "Refactor login() to async/await, return `Promise<UserResult>`, existing tests must pass." |

**Before:** `fix the test`
**After:** `Debug the failing Jest test in src/__tests__/auth.test.ts — expected redirect to /login, actual /dashboard.`

---

### 2. Context Completeness (Diagnosis, Execution, Verification)

Did the user provide enough background to act without follow-up questions?

| Score | Description |
|---|---|
| 1 | No context |
| 2 | Problem area named, no specifics |
| 3 | Some context; key details missing (no error output, no file path) |
| 4 | Most context present; one or two details could help |
| 5 | Error output, file paths, recent changes, and reproduction steps provided |

**Before:** `my tests are failing`
**After:** `Tests failing after renaming UserService → AccountService. Error: Cannot find module './UserService'. Updated import in app.ts but tests/auth.test.ts:22 still references old name.`

---

### 3. Input Boundaries (Execution, Verification)

Is it clear what Claude should read, use, or focus on?

| Score | Description |
|---|---|
| 1 | No input scope stated |
| 2 | General area mentioned ("the auth code") |
| 3 | Module or file type named |
| 4 | Specific file named |
| 5 | File + function or line range named |

**Before:** `fix the validation`
**After:** `Fix input validation in the `validateUser()` function in `src/auth/validators.ts`.`

---

### 4. Constraints (Execution, Reusable workflow)

Are scope limits and tradeoffs stated?

| Score | Description |
|---|---|
| 1 | No constraints |
| 2 | One vague constraint ("keep it simple") |
| 3 | One clear constraint ("don't add new dependencies") |
| 4 | Two or more clear constraints |
| 5 | Constraints cover scope, dependencies, style, and safety |

Common constraints worth stating:
- `Don't change the public API`
- `No new npm packages`
- `Existing tests must pass`
- `Only modify src/auth/validators.ts`
- `Prefer the minimal diff`

**Before:** `add validation to the form`
**After:** `Add input validation to the /register endpoint. Use zod (already installed). Don't add new files or modify the database schema. Only change src/routes/auth.ts.`

---

### 5. Output Format (Execution, Verification)

Did the user specify how the response should be structured?

| Score | Description |
|---|---|
| 1 | No output specification |
| 2 | Output implied ("fix it" implies a code change) |
| 3 | Format partially specified ("explain the issue") |
| 4 | Format specified with a list |
| 5 | Format fully specified with numbered structure |

**Before:** `why is login slow`
**After:** `Diagnose the login endpoint latency. Return: 1. Root cause 2. Proposed fix 3. Estimated latency impact 4. Test command`

---

### 6. Verification (Execution, Verification, Reusable workflow)

Did the user ask how to check correctness?

| Score | Description |
|---|---|
| 1 | No mention of verification |
| 2 | "Make sure it works" (no method) |
| 3 | Asks for tests but no specifics |
| 4 | Names the test file or test type |
| 5 | Names test file + edge cases + test command |

**Before:** `implement the auth refresh`
**After:** `Implement token refresh in src/auth/refresh.ts. Verification: run npm test src/auth/refresh.test.ts; all existing tests must pass. Include edge cases: expired token, missing token, concurrent refresh.`

---

### 7. Privacy/Safety (all stages)

Did the prompt avoid unnecessary sensitive data?

| Score | Description |
|---|---|
| 1 | Contains obvious secrets (API keys, passwords, tokens in plain text) |
| 2 | Contains potentially sensitive data without clear need |
| 3 | Borderline — personal data or internal URLs present |
| 4 | Minor concerns (internal file paths, project names) |
| 5 | No sensitive data, or sensitive data is clearly necessary and scoped |

When in doubt, redact and note that you've done so: `[API key redacted]`.

Safety also includes risky agent actions. A prompt that asks the agent to delete data, rewrite history, force-push, rotate credentials, or make broad production changes should include safeguards such as confirmation, dry-run output, rollback steps, or explicit verification.

---

## Composite Score

Individual dimensions are scored 1–5. The composite is reported as XX / 100 (average of applicable dimensions × 20, rounded). A prompt with no issues in any dimension scores 100 / 100.

The composite is a prompt-readiness signal for the selected stage, not an objective guarantee that the model's answer will be better. Use it to guide practice, then validate the real outcome: fewer clarification turns, safer edits, more useful first drafts, and easier verification.

| Stage | Dimensions included in composite |
|---|---|
| Exploration | Goal Clarity + Privacy/Safety |
| Diagnosis | Goal Clarity + Context Completeness + Privacy/Safety |
| Execution | All seven dimensions |
| Verification | Goal Clarity + Context Completeness + Input Boundaries + Output Format + Verification + Privacy/Safety |
| Reusable workflow | Goal Clarity + Context Completeness + Input Boundaries + Constraints + Output Format + Verification + Privacy/Safety |
| Action | Goal Clarity + Privacy/Safety |

Verification prompts exclude Constraints because the user is asking for checks, review, or tests rather than an implementation plan. Reusable workflow prompts include Constraints because repeatable processes need scope, audience, and adoption boundaries.

Scores are stage-relative. A prompt can score well as Exploration and then score lower as Execution after the user asks for file edits, because more dimensions apply. This is expected: the rubric raises the bar when the agent is being asked to make real changes.

The current rubric is tuned for AI coding-agent workflows. For non-engineering prompts, treat scores as approximate coaching feedback until a profile-specific rubric exists.

**Grade labels:**

| Score | Grade | What it means |
|---|---|---|
| 90–100 | Excellent | Ready for this stage |
| 70–89 | Good | Minor gaps, will still produce useful results |
| 50–69 | Developing | Clear improvements available |
| 30–49 | Early stage | Normal for exploration; add evidence when ready |
| 10–29 | Needs work | Start with goal clarity |

---

## The Good Prompt Pattern

For execution-stage prompts, this structure reliably hits 4.0+:

```
Goal:         What do you want Claude to do?
Context:      What background is needed?
Input:        What file, function, or code to focus on?
Constraints:  What should Claude not touch?
Output:       How should the response be structured?
Verification: How should correctness be checked?
```

Not every prompt needs all six parts. Match depth to stage.

---

## Tip Selection

The score and the tip are related but not identical. The score measures stage-relative readiness. The tip should choose the most useful next habit, not mechanically repeat the lowest-scoring dimension.

Priority rules:

- Privacy and safety issues outrank all prompt-structure feedback.
- Debugging prompts should prioritize expected/actual behavior, exact errors, and reproduction evidence before output format.
- Implementation and refactoring prompts should prioritize file boundaries, scope limits, and verification before response polish.
- Code review and verification prompts should prioritize the diff, branch, file, or risk category being reviewed.
- Planning and documentation prompts should prioritize audience, decision criteria, and useful return shape.

Canonical tip kinds:

| Tip kind | Use when |
|---|---|
| `clarify-goal` | The desired action or outcome is still fuzzy |
| `add-context-evidence` | The prompt lacks background, recent changes, or evidence |
| `add-expected-actual` | A debugging prompt needs expected vs. actual behavior |
| `add-error-output` | A debugging prompt omits the exact error or failing assertion |
| `name-file-or-function` | The agent needs clearer input boundaries |
| `add-scope-boundary` | The prompt needs constraints such as no new dependencies or no API changes |
| `add-output-format` | The answer would be easier to use with a return shape |
| `add-verification-command` | The request needs a test, command, or edge case to prove correctness |
| `redact-sensitive-data` | The prompt includes secrets, personal data, or private URLs |
| `add-safety-check` | The request involves destructive or broad operations |
| `state-decision-criteria` | A planning prompt needs criteria for comparing options |

Reports use tip kinds to show repeated habits over time. They are stored as local metadata, but they are not shown in the normal Sensei line.

In observe mode, choose the canonical tip kind before writing the visible tip. The visible `Tip:` should use the matching habit phrase, or a close paraphrase with the same keywords, so Claude Code's Stop hook can infer and persist `tipKind` from the final Sensei line.
