# Prompt Sensei

> 一个安静、本地优先、面向工程师的 AI 编程提示词教练。

[English](README.md)

Prompt Sensei 帮助开发者在日常使用 AI 编程工具时，逐步写出更清晰、更可执行、更适合工程协作的 prompt。

它不是排行榜。
它不是员工监控。
它不是 prompt 警察。

它是一个小型的 AI coding skill 和本地 prompt coaching 工具。它的目标不是把每个 prompt 改写得很华丽，而是帮助工程师把粗略意图变成清楚、有效、可执行的工作请求。

---

## 安装

Claude Code:

```bash
git clone https://github.com/chengzhongwei/Prompt-sensei ~/.claude/skills/prompt-sensei
(cd ~/.claude/skills/prompt-sensei && npm install && npm run build)
```

Claude Code 会自动读取 `~/.claude/skills/` 下的 skills。

Codex:

```bash
git clone https://github.com/chengzhongwei/Prompt-sensei ~/.codex/skills/prompt-sensei
(cd ~/.codex/skills/prompt-sensei && npm install && npm run build)
```

Codex 不使用 Claude Code 的 slash command hook 模型。可以用自然语言触发：

```txt
Use prompt-sensei to review this prompt: "fix this test"
Use prompt-sensei to show my report.
Use prompt-sensei observe for this session.
```

### 推荐：开启本地 prompt 观察 hook

安装后，如果你希望 Claude Code 在后台安静地记录本地 prompt metadata，可以把 `UserPromptSubmit` hook 加到 `~/.claude/settings.json`：

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

这个 hook 只会写入 redacted prompt hash，并且只有在你先运行 `/prompt-sensei observe` 同意之后才会写入。Hash-only 记录不会参与评分，因为 hook 没有足够的对话上下文来判断 prompt 阶段和 coaching tip。

如果你的 Claude Code 版本支持 `Stop` hook，也可以添加一个响应结束后的 hash-only capture：

```json
{
  "hooks": {
    "Stop": [
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

`Stop` hook 适合安静地记录后台 metadata，但不能替代 `/prompt-sensei observe` 的评分。Stage-aware feedback 仍然需要在对话中完成，因为只有 agent 有足够上下文判断 prompt 阶段并给出 coaching tip。

---

## 使用

Claude Code:

```txt
/prompt-sensei [observe|stop|report|review|help|clear|update]
```

不带参数时，默认启动观察模式：

```txt
/prompt-sensei observe          # 开始持续评分
/prompt-sensei stop             # 停止本次会话观察
/prompt-sensei review "help me fix this"
/prompt-sensei report
/prompt-sensei update
/prompt-sensei help
```

生成报告：

```bash
npm run report
```

清理本地数据：

```bash
npm run clear-data
```

检查更新：

```bash
npm run check-update
```

应用更新：

```bash
npm run update
```

Prompt Sensei 会在 observe/report 活动中最多每天后台检查一次更新。它不会自动更新，只会提示你有新版本。需要用户主动运行 `/prompt-sensei update` 或 `npm run update`。

---

## 为什么需要 Prompt Sensei？

AI-assisted engineering 已经变成日常工作流。但很多团队仍然会把这样的 prompt 丢给 coding agent：

```txt
fix this
why is this broken
make it better
```

这些 prompt 并不是“错”的。很多时候，它们只是问题早期的想法。

Prompt Sensei 会根据 prompt 所处阶段给反馈：

- 这是探索问题的 prompt，还是已经准备让 agent 改代码？
- 目标是否清楚？
- 是否给了足够上下文？
- 是否限定了输入范围？
- 是否给了约束？
- 是否说明了输出格式？
- 是否说明了如何验证？
- 用户是否比之前更清楚了？

目标不是完美 prompt。目标是更好的 AI-assisted work。

---

## Prompt Sensei 有什么不同？

大多数 prompt 工具会直接帮你“优化”或“改写” prompt。Prompt Sensei 更像一个安静的老师。

| 特性 | Prompt Sensei |
|---|---|
| 默认不打扰 | 不打断你的工作流 |
| 本地优先 | 不需要云端后端 |
| 注重隐私 | 默认不保存原始 prompt |
| 阶段感知 | 不会惩罚早期探索型 prompt |
| 鼓励式反馈 | 像老师，不像评分机器 |
| 面向工程 | 适合 debugging、coding、code review、planning、docs、architecture |
| 面向成长 | 关注习惯变化，而不是一次性分数 |

Prompt Sensei 理解：

```txt
why is auth broken
```

这在探索阶段可能是完全合理的。但当你准备让 agent 真正改代码时，它会帮助你逐步走向这样的 prompt：

```txt
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

这就是模糊请求和可执行工程请求之间的差别。

---

## Prompt 阶段

Prompt Sensei 不会用同一把尺子衡量所有 prompt。

| 阶段 | 含义 | 示例 |
|---|---|---|
| Exploration | 还在理解问题 | `why is this broken` |
| Diagnosis | 已经有症状或证据 | `expected /login, actual /dashboard` |
| Execution | 希望 agent 实现或修改 | `implement this with these constraints` |
| Verification | 希望检查正确性 | `find edge cases and test commands` |
| Reusable workflow | 希望得到可复用流程 | `create a code review checklist` |
| Action | 已有上下文里的短指令 | `ok commit and push to main`, `run the tests` |

一个模糊 prompt 在探索阶段可能没问题，但在执行阶段通常不够。Action prompt 不会因为缺少 Constraints、Verification、Output Format 被扣分，因为这些维度不适用于短 follow-through 指令。

---

## 评分维度

Prompt Sensei 使用七个工程实用维度评分：

| 维度 | 检查什么 |
|---|---|
| Goal clarity | 目标是否清楚 |
| Context completeness | 背景是否足够 |
| Input boundaries | 输入范围是否明确 |
| Constraints | 是否有范围、依赖、风格、安全约束 |
| Output format | 是否说明希望回答如何组织 |
| Verification | 是否说明如何验证正确性 |
| Privacy/safety | 是否避免不必要的敏感信息 |

分数用于私人的反馈和趋势跟踪，不用于排名。

---

## 为什么分数可能会下降？

Prompt Sensei 的分数是 stage-aware 的。它不是每次都问：“这个 prompt 是否是完美的执行型 prompt？”它会先问：“这个 prompt 现在处于什么阶段？”

例如：

```txt
why is auth broken
```

作为 Exploration，它可能得分不错，因为早期只需要一个清楚方向，并且不泄露敏感信息。

但当你开始要求 agent 改文件时，同样的信息量在 Execution 阶段可能会得分更低，因为此时需要更多维度：上下文、输入范围、约束、输出格式、验证方式。

所以当 prompt 从 Exploration 进入 Execution，分数下降不一定是退步。它只是说明：现在 agent 可能会修改真实文件，因此 Prompt Sensei 提高了标准。

---

## Demo

**初始 prompt**

```txt
fix this test
```

**Prompt Sensei feedback**

```txt
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

## 观察模式

启动观察模式：

```txt
/prompt-sensei observe
```

`/prompt-sensei` 不带参数时等价于 `/prompt-sensei observe`。

之后每次回复末尾会追加一行：

> **[Sensei: Score - 68/100; Tip: add the error message and file path]**

如果 prompt 很成熟：

> **[Sensei: Score - 94/100; Excellent — execution-ready prompt]**

评分等级：

| 分数 | 等级 | 含义 |
|---|---|---|
| 90–100 | Excellent | execution-ready |
| 70–89 | Good | 小问题 |
| 50–69 | Developing | 有明显改进空间 |
| 30–49 | Early stage | 探索阶段很常见 |
| 10–29 | Needs work | 先从目标清晰度开始 |

---

## Good Prompt Pattern

执行型 prompt 通常可以用这个结构：

```txt
Goal:         What do you want?
Context:      What should the AI know?
Input:        What should the AI use?
Constraints:  What should the AI avoid or prioritize?
Output:       How should the answer be structured?
Verification: How should correctness be checked?
```

不是每个 prompt 都需要六项。根据阶段来决定深度。

---

## 隐私模型

Prompt Sensei 默认本地优先：

- 没有云端后端
- 没有 telemetry
- 没有登录
- 没有排行榜
- 默认不保存原始 prompt

观察模式默认只保存：

- timestamp
- prompt stage
- task type
- score
- feedback flags
- 可选的 redacted prompt hash

本地文件：

- `~/.prompt-sensei/events.jsonl` — 观察日志
- `~/.prompt-sensei/config.json` — consent 记录
- `~/.prompt-sensei/update-check.json` — 更新检查缓存

详见 [docs/privacy.md](docs/privacy.md)。

---

## 示例报告

```txt
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

## Feedback
Your scores are trending upward. The practice is working.
Your debugging prompts are in the developing range. The next gain is likely one missing detail, not a full rewrite.

Next habit for debugging: Add the error message, expected behavior, and recent change before asking for help.
Why it matters: Context is the difference between guessing and diagnosing.
Practice: For the next three debugging prompts, include Expected, Actual, and Recent change.
```

---

## 适合谁？

Prompt Sensei 适合：

- 使用 Claude Code、Codex 或类似 AI coding agent 的工程师
- 正在引入 AI coding workflow 的团队
- 希望提升 AI 协作效率的开发者
- 希望通过实践学习 prompt engineering 的人

尤其适合 debugging、implementation、code review、refactoring、architecture、planning、documentation、testing 等场景。

---

## 它不是什么？

Prompt Sensei 不是：

- prompt marketplace
- 营销文案优化器
- 生产级 LLM eval 平台
- 员工监控工具
- 工程判断的替代品

它只是一个小型、本地、安静的 prompt mentor，帮助你养成更好的 AI 编程习惯。

---

## License

Apache-2.0 — Copyright 2026 Chengzhong Wei
