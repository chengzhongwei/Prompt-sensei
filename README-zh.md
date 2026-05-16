# Prompt Sensei

> 在 AI 时代，写好 prompt 正在变成一项重要的个人能力。Prompt Sensei 不只是帮你改 prompt，也会教你如何提升这个能力。

[English](README.md)

[Quickstart](#5-分钟快速开始) · [FAQ](docs/faq.md) · [Privacy](docs/privacy.md) · [Examples](examples/prompt-gallery.md) · [Advanced setup](docs/advanced-setup-zh.md) · [Discussions](https://github.com/chengzhongwei/Prompt-sensei/discussions)

<p align="center">
  <img src="assets/prompt-sensei-banner-zh.jpg" alt="Prompt Sensei 横幅：支持 Claude Code 和 Codex、本地优先、可选自动观察钩子、不存储原始提示词，并提供阶段感知反馈。" />
</p>

Prompt Sensei 是一个面向 Claude Code 和 Codex 的本地优先 prompt 教练。它会根据你当前所处的阶段给反馈，把粗糙的 prompt 改成更可执行的版本，在你允许时回看本地历史，并帮助你一次练好一个习惯。

它不是一份单纯的 markdown rubric，而是一个真正接入宿主生命周期的 skill：支持基于 hooks 的 observe 评分行、可选 auto-observe hooks、hash-only prompt captures、安静的 Stop-hook 持久化，以及在宿主提供对应事件时的 compact-safe continuity。

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

然后在 Claude Code 里用 `/prompt-sensei observe` 启动实时反馈。如果想配置可选 auto-start 和隐私设置，可以运行 `/prompt-sensei setup`。

安装到 Codex：

```bash
git clone https://github.com/chengzhongwei/Prompt-sensei ~/.codex/skills/prompt-sensei
(cd ~/.codex/skills/prompt-sensei && npm install && npm run build)
```

然后用自然语言告诉 Codex：`Use prompt-sensei observe mode.` 如果想开启基于 hooks 的可选 auto-start，可以运行 `npm run setup-hooks -- auto-observe folder`，或在 skill 加载后使用 `/prompt-sensei setup`。

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

Prompt Sensei 最适合在能直接加载 skill 的工具里使用。它同时支持 Claude Code 和 Codex，并使用宿主原生 hooks 实现可选 auto-observe。

| 使用方式 | 环境 |
|---|---|
| 直接用 skill 命令，例如 `/prompt-sensei improve "fix this test"` | Claude Code |
| 用自然语言触发，例如 `Use prompt-sensei to improve this prompt...` | Codex |

Cursor 和其他 AI coding tools 目前还不支持。`/prompt-sensei observe` 是 Claude Code 的 skill 命令。在 Codex 里，要用自然语言触发，而且效果取决于当前 agent 是否加载到了这个 skill。Claude Code/Codex hook 矩阵和 trust 说明见 [advanced setup](docs/advanced-setup-zh.md#host-support)。

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

Setup 会处理 observe 授权、可选的宿主 auto-start hooks，以及是否保存脱敏 prompt preview。在 Codex 里，新安装或修改过的 command hooks 触发信任提示是正常安全行为；启用前用 `/hooks` 先检查具体命令。高级细节见 [docs/advanced-setup-zh.md](docs/advanced-setup-zh.md)。

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

在 Codex 里可以用自然语言触发，例如 `Use prompt-sensei observe mode.` 或 `Use prompt-sensei to improve this prompt: "fix this test"`。

Settings commands、hook setup、Codex examples 和 consent scopes 见 [docs/advanced-setup-zh.md](docs/advanced-setup-zh.md)。

本地脚本检查命令见 [advanced setup](docs/advanced-setup-zh.md#local-script-checks)。

---

## 设置

Prompt Sensei 会把本地偏好写入 `~/.prompt-sensei/settings.json`。默认保持安静：auto observe off、redacted prompt previews off、永远不保存原始 prompt。用 `/prompt-sensei setup` 可以走引导式设置；完整设置参考见 [docs/advanced-setup-zh.md](docs/advanced-setup-zh.md)。

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

> **[[Sensei: 68/100 · Diagnosis; Tip: add the error message and file path]]()**

可以把分数理解成当前阶段的 prompt readiness，而不是放之四海皆准的 prompt 质量。即使一个 prompt 得到 100/100，如果模型缺少领域知识、任务本身仍然模糊，或者评分规则不适合当前领域，结果仍然可能不理想。

报告关注的是成长，而不是排名：

```txt
Next habit:      End with the command, test, or edge case that proves the work.
Repeated gap:    add-verification-command (5×)
Average score:   81 / 100  (Good)
```

完整理念见 [docs/philosophy.md](docs/philosophy.md)。评分细节见 [docs/scoring-rubric.md](docs/scoring-rubric.md)。

---

## 怎么知道它真的有帮助？

Prompt Sensei 不会因为分数变高就证明 prompt 一定更好。它提供的是结构化的教学反馈。

你可以用同一个任务对比原始 prompt 和改写后的 prompt：澄清轮次是否更少、第一版回答是否更好、意外改动是否更少、结果是否更容易验证。Calibration 和 skeptical 说明见 [FAQ](docs/faq.md)。

---

## Lookback

`/prompt-sensei lookback` 会在你单独同意后，分析选中的本地 Claude Code 或 Codex 历史。它可以分析单个或多个近期会话、生成 coaching，并且只会在你确认后保存 Markdown 报告。隐私细节见 [docs/privacy.md](docs/privacy.md#lookback-privacy)，流程细节见 [docs/skill-flows.md](docs/skill-flows.md#lookback-flow)。

---

## 可选：宿主 Hooks

宿主 hooks 可以提供 opt-in auto-start、hash-only 后台记录、hook-triggered observe comments，以及安静持久化最后一行 Sensei 评分。它们是可选的，并且只有相关 consent/settings 允许时才会生效。细节见 [advanced setup](docs/advanced-setup-zh.md#host-support)、[Claude example hooks](examples/claude-settings.example.json) 和 [Codex example hooks](examples/codex-hooks.example.json)。

---

## 隐私

Prompt 往往包含业务逻辑、调试细节和未完成的想法，所以 Prompt Sensei 在你同意之前不会保存任何数据。同意后，它只在 `~/.prompt-sensei/` 下保存本地元数据；原始 prompt 永远不会被保存。

Prompt Sensei 的本地脚本不会把 prompt、分数、报告或本地日志发送到任何服务。Lookback 会在你单独同意后，把脱敏后的用户 prompt 交给当前 AI agent 分析。

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
