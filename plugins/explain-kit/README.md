# Explain Kit

面向 ChatGPT 桌面端与 Codex 本地环境的解释插件，版本 0.1.0，已随 Marketplace v8.1.0 发布，可从 main 或固定标签 v8.1.0 安装。

| 技能 | 用途 | 默认输出 |
|---|---|---|
| [glossary](skills/glossary/SKILL.md) | 快速理解陌生术语 | 中文一段，约 150–250 字 |
| [concept](skills/concept/SKILL.md) | 理解机制、应用、反例与边界 | 中文六节，约 500–800 字 |

Codex 使用 `$explain-kit:glossary` 或 `$explain-kit:concept`；ChatGPT 桌面端选择 Glossary 或 Concept。
明确短解释或深讲意图时自然启用；解释深度模糊时先速解。显式选择及用户长度、语言、格式要求优先。
主题可以是概念、工具、API、协议或产品，受众可用 `@产品经理`、`@后端工程师` 等提示。
六要素是教学骨架，允许适应；不适用的类比和分类不强填。不确定或版本敏感的知识按需核对一手资料。

默认在聊天中交付；保存需用户明确请求。插件没有 MCP、脚本、额外服务或认证依赖，查证使用客户端已有能力。
它独立提供解释能力，旧 learn-kit 及 NotebookLM 集成的退役保持有效。

安装、验收状态和发布限制见市场 [说明](../../README.md) 与 [验收记录](../../docs/runbook/[RUNBOOK]_Explain_Kit_Acceptance.md)。
