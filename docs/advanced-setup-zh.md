# 高级设置

Prompt Sensei 不需要高级设置也能使用。先从 `/prompt-sensei observe` 或 `Use prompt-sensei observe mode.` 开始即可。

当你想配置自动启动、设置范围、同步 Codex 安装，或可选的脱敏 prompt preview 时，再看这页。

## 设置

Prompt Sensei 会把本地偏好写入 `~/.prompt-sensei/settings.json`。

默认值：

- Auto observe: off
- Save redacted prompts: off
- Raw prompts: never stored

查看设置：

```bash
npm run settings
```

修改设置：

```bash
node dist/scripts/settings.js auto-observe on
node dist/scripts/settings.js auto-observe off
node dist/scripts/settings.js auto-observe user
node dist/scripts/settings.js auto-observe folder
node dist/scripts/settings.js save-redacted-prompts on
node dist/scripts/settings.js save-redacted-prompts off
```

## Auto Observe

`autoObserve` 必须主动开启。它只允许 SessionStart hook 在 observe 已授权后恢复 coaching。

Claude Code 范围：

- User level：本机所有 Claude Code 会话，写入 `~/.claude/settings.json`
- Folder level：只在当前文件夹，写入 `.claude/settings.local.json`

Codex 目前不支持 Prompt Sensei auto-start hooks。在 Codex 里请用自然语言开始：

```txt
Use prompt-sensei observe mode.
```

安装 hooks 并开启 auto observe：

```bash
node dist/scripts/setup-hooks.js auto-observe user
node dist/scripts/setup-hooks.js auto-observe folder
```

关闭 auto observe：

```bash
node dist/scripts/setup-hooks.js auto-observe off
```

关闭后，已安装的 hooks 会保持安静。

## Claude Code Hooks

只适用于 Claude Code。这些 hooks 不是 Codex auto-start 机制。

可复制的设置文件见 [../examples/claude-settings.example.json](../examples/claude-settings.example.json)。

示例包含：

- `SessionStart`：用于 opt-in auto-start context
- `UserPromptSubmit`：用于授权后的 hash-only prompt captures
- `Stop`：用于安静地持久化最后一行 Sensei 评分
- `PreCompact`：用于 compaction 后的短上下文恢复

`UserPromptSubmit` 只记录 hash，因为 hook 没有足够的对话上下文来评分。`Stop` hook 会在回复结束后解析可见的 Sensei 行，并在不显示 Bash 调用的情况下记录分数和阶段。

## 同步 Codex 安装

Claude Code 和 Codex 使用不同的 skill 目录。不要假设 Codex 会自动读取 `~/.claude/skills/prompt-sensei`。

同步当前安装到 Codex：

```bash
npm run sync-codex-install
```

等价的手动同步：

```bash
rsync -a --delete ~/.claude/skills/prompt-sensei/ ~/.codex/skills/prompt-sensei/
(cd ~/.codex/skills/prompt-sensei && npm install && npm run build)
```

## Redacted Prompt Previews

`saveRedactedPrompts` 默认关闭。

开启后，Prompt Sensei 只保存短的 `redactedPromptPreview`，不会保存原始 prompt。保存前会先脱敏，覆盖常见敏感模式，比如邮箱、API keys、tokens、private keys、长 secret，以及带 query parameters 的 URLs。

脱敏是 best-effort，不能保证覆盖所有敏感内容。除非你的本地数据策略允许保存脱敏 preview，否则建议保持关闭。

## 授权复用

Prompt Sensei 会按 scope 记住授权，减少重复确认；当数据访问范围扩大时会再次询问。

范围扩大示例：

- 单个会话变成全部会话
- metadata-only 变成 redacted prompt analysis
- Claude Code 变成 Codex/Cursor/其他来源
- 临时报告变成保存 Markdown 报告
