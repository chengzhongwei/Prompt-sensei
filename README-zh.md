# Prompt Sensei

> 在 AI 时代，写好 prompt 正在变成一项重要的个人能力。Prompt Sensei 不只是帮你改 prompt，也会教你如何提升这个能力。

[English](README.md)

Prompt Sensei 是一个面向 Claude Code 和 Codex 的本地优先 prompt 教练，也适用于能加载这些 skill 的 IDE/plugin 环境。它会根据你当前所处的阶段给反馈，把粗糙的 prompt 改成更可执行的版本，在你允许时回看本地历史，并帮助你一次练好一个习惯。

没有云端服务。没有遥测。没有排行榜。默认不保存原始 prompt。

Prompt Sensei 的分数是一个教学信号，不是客观评分，也不保证模型输出一定更好。真正的判断标准是：改写后的 prompt 是否带来更有用的第一版回答、更少的来回澄清、更安全的 agent 行为，以及更容易验证的结果。

---

## 为什么做这个

AI 编程 agent 和普通聊天模型不一样。它会改文件、跑命令、做实现决策。一个含糊的 prompt 不只是得到一个含糊的回答，还可能带来过大的改动、没说清的假设和反复返工。

Prompt Sensei 的核心想法很简单：

- 写 prompt 是一种工程能力。
- 工程能力需要靠反馈来进步。
- 好反馈应该友善、具体、私密、有用。

它不会说 `fix this test` 是“烂 prompt”。它会判断这是一个早期探索 prompt，然后告诉你下一步最值得补什么。

---

## 5 分钟快速开始

安装到 Claude Code：

```bash
git clone https://github.com/chengzhongwei/Prompt-sensei ~/.claude/skills/prompt-sensei
(cd ~/.claude/skills/prompt-sensei && npm install && npm run build)
```

然后在 Claude Code 里用 `/prompt-sensei observe` 启动实时反馈。

安装到 Codex：

```bash
git clone https://github.com/chengzhongwei/Prompt-sensei ~/.codex/skills/prompt-sensei
(cd ~/.codex/skills/prompt-sensei && npm install && npm run build)
```

然后用自然语言告诉 Codex：`Use prompt-sensei observe mode.`

在 Claude Code 里启动实时反馈：

```txt
/prompt-sensei observe
```

试着改写一个很常见的弱 prompt：

```txt
/prompt-sensei improve "fix this test"
```

示例输出：

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

更多可复制的前后对比例子见 [examples/prompt-gallery.md](examples/prompt-gallery.md)。

---

## 支持环境

Prompt Sensei 最适合在能直接加载 skill 的工具里使用。

| 使用方式 | 环境 |
|---|---|
| 直接用 skill 命令，例如 `/prompt-sensei improve "fix this test"` | Claude Code，以及兼容 Claude Code skill 的环境 |
| 用自然语言触发，例如 `Use prompt-sensei to improve this prompt...` | Codex，以及不支持 slash command 的 IDE/plugin 环境 |

如果 Claude Code 或 Codex 是在 IDE plugin 里运行，只要它能访问已安装的 skill，就可以使用同一套 Prompt Sensei 工作流。

`/prompt-sensei observe` 是 Claude Code 的 skill 命令。在 Codex 或其他不支持 slash command 的环境里，要用自然语言触发，而且效果取决于当前 agent 是否加载到了这个 skill。`npm run init` 只会创建本地授权和会话记录，不会自动让 agent 开始追加实时评分。

---

## 新手路径

从这里开始：

```txt
/prompt-sensei observe
```

第一次使用时，Prompt Sensei 会先询问本地存储授权，开始 coaching，然后提供可选的自动启动设置。最简单的路径是手动开始；之后你仍然可以随时用 `/prompt-sensei observe`。

如果想一次性完成设置，可以用：

```txt
/prompt-sensei setup
```

Setup 会处理 observe 授权、可选的 Claude Code auto-start hooks，以及是否保存脱敏 prompt preview。在 Codex 里，setup 使用手动/自然语言启动，因为 Claude hooks 不适用于 Codex。Redacted previews 默认保持关闭，除非你明确打开。高级细节见 [docs/advanced-setup-zh.md](docs/advanced-setup-zh.md)。

---

## 命令

```txt
/prompt-sensei [observe|improve|lookback|setup|help]
```

核心命令：

```txt
/prompt-sensei observe              # 开始实时反馈
/prompt-sensei improve "fix this"   # 改写 prompt，并给一个练习建议
/prompt-sensei lookback             # 分析选中的本地 prompt 历史
/prompt-sensei setup                # 引导式设置
/prompt-sensei help
```

更多命令：

```txt
/prompt-sensei stop                 # 停止本次会话反馈
/prompt-sensei report               # 查看本地趋势
/prompt-sensei settings             # 查看本地设置
/prompt-sensei update               # 拉取最新版本并重新构建
/prompt-sensei clear                # 删除本地 Prompt Sensei 数据
```

设置命令、hook setup 和 consent scope 说明见 [docs/advanced-setup-zh.md](docs/advanced-setup-zh.md)。

在 Codex 里可以用自然语言触发：

```txt
Use prompt-sensei observe mode.
Use prompt-sensei to improve this prompt: "fix this test"
Use prompt-sensei to look back at my recent prompts.
Use prompt-sensei to show my report.
Use prompt-sensei settings.
Use prompt-sensei setup.
Use prompt-sensei to turn auto observe on.
```

如果只是检查本地脚本：

```bash
npm run init       # 创建本地授权和会话记录
npm run observe    # 交互式运行时显示 observe 脚本用法
npm run settings   # 查看本地设置
npm run setup-hooks -- auto-observe user
npm run sync-codex-install
```

---

## v0.4 设置

Prompt Sensei 会把本地偏好写入 `~/.prompt-sensei/settings.json`。默认保持安静：auto observe off、redacted prompt previews off、永远不保存原始 prompt。

Auto observe 和 redacted prompt previews 都必须主动开启。Auto observe hooks 只适用于 Claude Code；Codex 用户用 `Use prompt-sensei observe mode.` 开始。用 `/prompt-sensei setup` 可以走引导式设置；完整设置参考见 [docs/advanced-setup-zh.md](docs/advanced-setup-zh.md)。

---

## 它怎么教你

Prompt Sensei 会先判断阶段。早期探索时，一句话可能已经足够；真正要让 agent 改代码时，就需要更多上下文、边界和验证方式。

| 阶段 | 含义 | 示例 |
|---|---|---|
| Exploration | 还在弄清问题 | `why is this broken` |
| Diagnosis | 已经有现象或证据 | `expected /login, actual /dashboard` |
| Execution | 希望 agent 实现或修改 | `implement this with these constraints` |
| Verification | 希望检查正确性 | `find edge cases and test commands` |
| Reusable workflow | 希望得到可复用流程 | `create a code review checklist` |
| Action | 已有上下文的短指令 | `ok commit and push to main` |

实时反馈会保持很轻：

> **[Sensei: 68/100 · Diagnosis; Tip: add the error message and file path]**

可以把分数理解成当前阶段的 prompt readiness，而不是放之四海皆准的 prompt 质量。即使一个 prompt 得到 100/100，如果模型缺少领域知识、任务本身仍然模糊，或者评分规则不适合当前领域，结果仍然可能不理想。

报告关注的是成长，而不是排名：

```txt
Average score:    81 / 100  (Good)
Most common type: implementation
Next habit:       End prompts with the exact test command or edge cases.
```

完整理念见 [docs/philosophy.md](docs/philosophy.md)。评分细节见 [docs/scoring-rubric.md](docs/scoring-rubric.md)。

---

## 怎么知道它真的有帮助？

Prompt Sensei 不会因为分数变高就证明 prompt 一定更好。它提供的是结构化的教学反馈。

你可以用同一个任务对比原始 prompt 和改写后的 prompt：

- AI 是否少问了澄清问题？
- 第一版回答是否更准确、更容易执行？
- Agent 是否减少了过大或意外的改动？
- 最终结果是否更容易验证？

如果改写后的 prompt 没有带来更好的结果，那也是对评分规则的有用反馈。Prompt Sensei 的目标是训练更好的 prompting 习惯，而不是取代你的判断。

对维护者来说，`npm run eval` 会打印一组校准用例，方便快速检查 Sensei 在弱、中、强、隐私风险、安全风险和非工程 prompt 上的阶段判断、分数区间、flags 和建议是否合理。

---

## Lookback

`/prompt-sensei lookback` 会在你单独同意后，分析选中的本地 Claude Code 或 Codex 历史。

它可以：

- 自动发现最近的 Claude Code 和 Codex 会话
- 分析单个会话或全部会话
- 生成逐条反馈或完整回顾报告
- 在你确认后保存 markdown 报告

流程会一步一步引导你选择：先从可见的会话列表里选择，再选分析形式，再选 prompt 数量，最后确认授权。

Lookback 只会在本地读取历史，先脱敏再交给当前 AI agent 分析。默认不保存原始历史、不保存 prompt hash，也不把分析结果写入普通 report 数据。

Prompt Sensei 会按 scope 记住授权，减少重复确认；当数据访问范围扩大时会重新询问。例如：从单个会话变成全部会话、从 metadata-only 变成 redacted prompt analysis、从 Claude Code 变成 Codex，或者从临时报告变成保存 Markdown 报告。

---

## 可选：Claude Code Hooks

Claude Code hooks 可以提供 opt-in auto-start、hash-only 后台记录和 compaction 后短上下文恢复。它们是可选的，并且只有相关 consent/settings 允许时才会生效。Codex 目前不使用这些 hooks。

需要 hook setup 细节时，使用 `/prompt-sensei setup`、[docs/advanced-setup-zh.md](docs/advanced-setup-zh.md)，或 [examples/claude-settings.example.json](examples/claude-settings.example.json)。

---

## 隐私

Prompt 往往包含业务逻辑、调试细节和未完成的想法，所以 Prompt Sensei 在你同意之前不会保存任何数据。

同意后，它只保存本地元数据：

- `~/.prompt-sensei/events.jsonl` — 观察日志
- `~/.prompt-sensei/config.json` — 兼容旧版本的同意记录
- `~/.prompt-sensei/settings.json` — 设置和按 scope 保存的授权
- `~/.prompt-sensei/update-check.json` — 更新检查缓存
- `~/.prompt-sensei/reports/` — 可选保存的 lookback 报告

Prompt Sensei 的本地脚本不会把 prompt、分数、报告或本地日志发送到任何服务。Lookback 会在你单独同意后，把脱敏后的用户 prompt 交给当前 AI agent 分析。原始 prompt 永远不会被保存。

更多细节见 [docs/privacy.md](docs/privacy.md)。

---

## 贡献

适合入手的方向：

- 更真实的 prompt 改进示例
- 评分规则改进
- 敏感信息脱敏规则
- 报告体验改进
- 支持更多 AI 编程工具

请保持这个项目的核心气质：安静、本地优先、鼓励式、注重隐私。

---

## License

Apache-2.0 — Copyright 2026 Chengzhong Wei
