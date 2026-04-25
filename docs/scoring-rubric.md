# Scoring Rubric

Prompt Sensei scores every prompt on five criteria. Each criterion is worth 0–20 points. Maximum score: 100.

---

## 1. Intent Clarity (0–20)

**Question:** Is it immediately obvious what you want Claude to do?

A prompt with high intent clarity names the action, the target, and the desired outcome. A prompt with low clarity forces Claude to guess the goal before it can attempt it.

| Score | Description |
|-------|-------------|
| 0–5   | Vague or ambiguous — multiple interpretations are possible |
| 6–12  | Goal is implied but requires inference |
| 13–20 | Action + target + outcome are all explicit |

**Example (low):** `fix the bug`
**Example (high):** `Fix the null pointer exception in auth/login.ts:47 — the function should return null when the user is not found, not throw`

---

## 2. Context Richness (0–20)

**Question:** Does the prompt include the information Claude needs to act without asking follow-ups?

Relevant context includes: error messages, file paths, what you've already tried, what the code is supposed to do, and any unusual constraints of the environment.

| Score | Description |
|-------|-------------|
| 0–5   | No background provided |
| 6–12  | Some context but key details are missing |
| 13–20 | Relevant context included; Claude can start immediately |

**Example (low):** `my tests are failing`
**Example (high):** `My tests are failing after I renamed UserService to AccountService. Error: Cannot find module './UserService'. I've already updated the import in app.ts but the test at tests/auth.test.ts:22 still references the old name.`

---

## 3. Explicit Constraints (0–20)

**Question:** Are restrictions and preferences stated upfront?

Constraints save time. Without them, Claude may produce a solution that's technically correct but wrong for your context — using a banned library, touching files you didn't want changed, or adding abstractions you didn't ask for.

| Score | Description |
|-------|-------------|
| 0–5   | No constraints mentioned |
| 6–12  | Some constraints implied by context |
| 13–20 | Constraints are clear and complete |

**Common constraints worth stating:**
- Dependency restrictions (`no new npm packages`)
- File scope (`only modify src/utils/format.ts`)
- Style preferences (`no classes, use functions`)
- Safety boundaries (`don't modify the database schema`)
- Output format (`show me a diff, don't apply it`)

**Example (low):** `add input validation`
**Example (high):** `Add input validation to the /register endpoint. Use zod (already installed). Don't modify the database schema or add new files — only change src/routes/auth.ts.`

---

## 4. Appropriate Scope (0–20)

**Question:** Is this task sized for one productive exchange?

Too large: "build me a full authentication system" — Claude will make dozens of undiscussed decisions. Too small: "add a semicolon on line 14" — no need for an AI. The sweet spot is a single coherent unit of work that produces a reviewable result.

| Score | Description |
|-------|-------------|
| 0–5   | Scope is overwhelming or trivially small |
| 6–12  | Workable but benefits from more/less decomposition |
| 13–20 | Single coherent unit, right-sized for one exchange |

**Signs of over-scope:** Multiple "and also..." clauses, outcomes that depend on architecture decisions you haven't made yet, tasks that would take a senior engineer more than a day.

**Signs of under-scope:** The request is a lookup, a typo fix, or something you could do faster yourself.

---

## 5. Output Specification (0–20)

**Question:** Does the prompt describe what success looks like?

Without an output specification, Claude picks one. Specifying the output — a file to create, a test to pass, a behavior to demonstrate — makes the result reviewable and reduces revision cycles.

| Score | Description |
|-------|-------------|
| 0–5   | No indication of expected output |
| 6–12  | Expected output is implied |
| 13–20 | Desired output is concrete and verifiable |

**Example (low):** `make the login faster`
**Example (high):** `Reduce the latency of the login endpoint so that the existing benchmark test in tests/perf/login.bench.ts passes. Target is under 200ms p95. Don't change the test.`

---

## Grade Scale

| Score  | Grade      | Meaning                                          |
|--------|------------|--------------------------------------------------|
| 90–100 | Master     | Near-perfect — rare and worth recognizing        |
| 75–89  | Skilled    | Minor gaps; most sessions will produce good work |
| 55–74  | Developing | Clear gaps; specific fixes will move the needle  |
| 35–54  | Beginner   | Multiple fundamentals missing                    |
| 0–34   | Needs work | Start with Intent Clarity before anything else   |

---

## Which criteria move scores the most

Based on common patterns in real Claude Code sessions:

1. **Context Richness** → most common gap; error messages and file paths take seconds to add and save multiple follow-up rounds
2. **Explicit Constraints** → prevents the most frustrating outcomes (unwanted changes, wrong libraries)
3. **Output Specification** → makes results reviewable and reduces "that's not quite what I meant"

Focus on these three first if you're below 75.
