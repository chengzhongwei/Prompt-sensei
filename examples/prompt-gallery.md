# Prompt Gallery

Copyable before/after prompts for common AI coding workflows.

Prompt Sensei's goal is not to make every prompt long. It is to add the smallest missing detail that helps an AI coding agent act safely.

Many real prompts start tiny. The examples below keep that spirit: add the missing input, constraint, or check without turning a five-word request into a specification document.

---

## Tiny Everyday Prompts

### Python Function

**Before**

```txt
write a python function to sort list
```

**After**

```txt
Write a Python function that sorts a list of [items].

Input:
- Type: [numbers / strings / dicts / custom objects]
- Example: [sample input]

Requirements:
- Return a new sorted list without mutating the original
- Handle empty lists
- Use ascending order unless I specify otherwise

Return:
1. Function code
2. Two simple examples
3. One edge-case test
```

**Habit:** Name the input type and edge case before asking for code.

### Quick Bug Fix

**Before**

```txt
this is broken fix it
```

**After**

```txt
Help me fix this bug.

Expected:
[what should happen]

Actual:
[what happens instead]

Evidence:
[error message, log line, screenshot text, or failing test]

Relevant code:
[file path or pasted snippet]

Return the likely cause first, then the smallest safe fix.
```

**Habit:** Add expected behavior, actual behavior, and one piece of evidence.

### Simple Explanation

**Before**

```txt
explain this code
```

**After**

```txt
Explain this code for someone who knows [language/framework level].

Focus on:
- what it does
- why each main step exists
- any surprising edge cases

Code:
[paste code or name file/function]

Keep the explanation practical and point out anything risky or confusing.
```

**Habit:** Name the audience and the code boundary.

### Make It Faster

**Before**

```txt
make this faster
```

**After**

```txt
Look for a small performance improvement in [file/function].

Context:
- Current slow case: [input size or scenario]
- Current behavior: [timing, query count, or symptom]

Constraints:
- Do not change the public API
- Prefer readability over clever tricks

Return:
1. Likely bottleneck
2. Minimal change
3. How to verify the improvement
```

**Habit:** Say what "faster" means and how to verify it.

### API Helper

**Before**

```txt
make an api call
```

**After**

```txt
Write a [language/framework] helper that calls [API endpoint].

Input:
- Method: [GET/POST/etc.]
- Endpoint: [URL or route]
- Auth: [none / bearer token from env var / existing client]
- Request body shape: [fields]
- Response shape: [fields]

Requirements:
- Handle non-2xx responses
- Do not log secrets
- Return typed/structured data if possible

Include one example call and one error-case test.
```

**Habit:** Name the endpoint, auth shape, and failure behavior.

---

## Debugging

**Before**

```txt
fix this test
```

**After**

```txt
Help me debug this failing test.

Test: [test name]
Expected: [expected behavior]
Actual: [error output or wrong behavior]
Related file: [file path]
Verification: [test command to run]

Return:
1. Root cause
2. Minimal fix
3. Patch summary
```

**Habit:** Add expected behavior and actual behavior before asking for a fix.

---

## Implementation

**Before**

```txt
add login
```

**After**

```txt
Implement login for [app/module].

Context:
- Stack: [framework/language]
- Existing auth code: [file path]

Constraints:
- Prefer the smallest safe change
- Do not add new dependencies unless necessary

Verification:
- Run [test/build command]

Return:
1. Implementation summary
2. Files changed
3. Any risks or follow-ups
```

**Habit:** Add one constraint before asking the agent to change code.

---

## Code Review

**Before**

```txt
check these changes
```

**After**

```txt
Inspect the changes in [branch/files] for correctness risks.

Focus on:
- bugs or regressions
- missing tests
- confusing edge cases

Return findings first, ordered by severity, with file/line references when possible.
```

**Habit:** Tell the agent what kind of review you want.

---

## Refactor

**Before**

```txt
clean this up
```

**After**

```txt
Refactor [file/function] to make it easier to read without changing behavior.

Constraints:
- Keep the public API the same
- Avoid unrelated formatting churn
- Preserve existing tests

Return:
1. Refactor plan
2. Patch summary
3. Test command
```

**Habit:** State what must not change.

---

## Testing

**Before**

```txt
add tests
```

**After**

```txt
Add tests for [feature/function].

Cover:
- happy path
- invalid input
- edge case: [specific edge case]

Use the existing test style in [test file or directory].
Return the test command to run.
```

**Habit:** Name the behavior and edge case to cover.

---

## Beginner App Improvement

**Before**

```txt
make this app better
```

**After**

```txt
Help me improve this app one step at a time.

Goal:
  Make [specific screen or workflow] easier to use.

Current issue:
  [what feels confusing, slow, or broken]

Constraints:
  Keep the change small and explain each decision.

Return:
1. One recommended improvement
2. Why it matters
3. Exact files or UI areas to change
```

**Habit:** Pick one screen, one workflow, or one pain point.

---

## Release Notes

**Before**

```txt
write release notes
```

**After**

```txt
Write release notes for [version].

Input:
- Compare changes from [old tag] to [new tag]
- Audience: users who already installed the tool

Return:
1. Highlights
2. Breaking or changed behavior
3. Upgrade steps
4. One short social post
```

**Habit:** Name the audience before asking for writing help.

---

## Maintainer Docs Sync

**Before**

```txt
update my CLAUDE.md if needed
```

**After**

```txt
Review CLAUDE.md and update it only if the current project workflow has changed.

Focus on:
- command behavior
- docs that must stay in sync
- validation steps before release
- privacy or storage rules

Constraints:
- Keep the edit minimal
- Do not rewrite unrelated guidance
- If no update is needed, say so clearly

Return:
1. Whether CLAUDE.md needed changes
2. Summary of any edits made
3. Verification command
```

**Habit:** Add the decision rule behind "if needed."
