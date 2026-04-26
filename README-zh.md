# Prompt Sensei

> 一个安静、本地优先、面向工程师的 AI 编程提示词教练。

[English](README.md)

Prompt Sensei 根据 prompt 所处阶段给出有针对性的建议，安静地在后台运行，无需云端，无排行榜。

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

Codex 不支持 slash command，可以用自然语言触发：

```txt
Use prompt-sensei to review this prompt: "fix this test"
Use prompt-sensei to show my report.
```

---

## 可选：本地 Hook

将 `UserPromptSubmit` hook 加到 `~/.claude/settings.json`，在后台安静记录 prompt 元数据（只记录 hash，不保存原文）：

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

只有在你先运行 `/prompt-sensei observe` 同意后，hook 才会写入数据。Hash-only 记录不参与评分——stage-aware 反馈需要对话上下文。

如果你的 Claude Code 版本支持 `Stop` hook：

```json
{
  "hooks": {
    "Stop": [
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

---

## Demo

**Prompt：** `fix this test`

**Prompt Sensei 反馈：**

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

Habit to practice next:
  Add expected behavior and actual behavior to every debugging prompt.
```

观察模式下，每次回复末尾会追加一行：

> **[Sensei: 68/100 · Diagnosis; Tip: add the error message and file path]**

完整的 before/after 进步示例见 [examples/debugging-journey.md](examples/debugging-journey.md)。

---

## Prompt 阶段

| 阶段 | 含义 | 示例 |
|---|---|---|
| Exploration | 还在理解问题 | `why is this broken` |
| Diagnosis | 已经有症状或证据 | `expected /login, actual /dashboard` |
| Execution | 希望 agent 实现或修改 | `implement this with these constraints` |
| Verification | 希望检查正确性 | `find edge cases and test commands` |
| Reusable workflow | 希望得到可复用流程 | `create a code review checklist` |
| Action | 已有上下文的短指令 | `ok commit and push to main` |

Action prompt 不会因为缺少 Constraints、Verification、Output Format 被扣分。

完整维度定义和阶段权重见 [docs/scoring-rubric.md](docs/scoring-rubric.md)。

---

## Good Prompt Pattern

```
Goal:         What do you want?
Context:      What should the AI know?
Input:        What should the AI use?
Constraints:  What should the AI avoid or prioritize?
Output:       How should the answer be structured?
Verification: How should correctness be checked?
```

不是每个 prompt 都需要六项。根据阶段来决定深度。

---

## 示例报告

```
# Prompt Sensei Report
Observed 18 prompts in the last 7 days.

**Average score:**     68 / 100  (Developing)
**Trend:**             ↑  6 pts vs previous 5 prompts
**Most common type:**  debugging
**Most common stage:** diagnosis

**Score history:**     ▂▃▃▄▄▄▅▅▆▆

## Most common gaps
- missing-context (7×)
- no-verification (5×)
- no-constraints (3×)

## Feedback
Your scores are trending upward. The practice is working.
Next habit for debugging: Add the error message, expected behavior, and recent change before asking for help.
```

---

## 隐私

完全本地——没有云端后端，没有 telemetry，没有登录。

默认只保存：timestamp、task type、prompt stage、prompt hash、分数和 feedback tags。不保存原始 prompt 文本。

- `~/.prompt-sensei/events.jsonl` — 观察日志
- `~/.prompt-sensei/config.json` — consent 记录

详见 [docs/privacy.md](docs/privacy.md)。

---

## 贡献

欢迎贡献。推荐的方向：

- 更多真实 prompt 改进示例
- 评分 rubric 改进
- redaction 规则改进
- 更多 task type 分类器
- 报告改进
- 支持更多 AI coding 工具

请保持与核心设计理念一致：安静、本地优先、鼓励式、注重隐私。

---

## License

Apache-2.0 — Copyright 2026 Chengzhong Wei
