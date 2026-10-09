---
type: guide
scope: marketplace
summary: "Current marketplace scope and source-of-truth map"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-09
state: active
version: v2.1
---

# [GUIDE] Marketplace project overview

市场提供 diagram-kit / arch-diagram 和 explain-kit / glossary、concept；19 个 mp-* 是仓库开发技能，不进入插件公开目录。支持 ChatGPT 桌面端和 Codex 本地；CLI 验收基线 0.147.0。解释技能范围见 [ADR](../adr/[ADR]_Explain_Kit_Addition.md)。

- VERSION：市场版本权威。
- 两个插件各自的根 plugin.json：独立插件版本及 portable identity；OpenAI 展示在 extensions.com.openai。
- .agents/plugins/marketplace.json：精确两插件索引，不含版本。
- .agents/skills：开发技能。AGENTS.md：项目指令。 .codex：项目配置与执行规则。
- scripts / tests：结构、版本、发布、安装和 Python 图表行为。

旧 learn-kit/NLM 集成已退役，历史见 [索引](../INDEX.md)。迁移规则与版本例外见 [迁移 ADR](../adr/[ADR]_ChatGPT_Codex_Portable_Migration_And_LearnKit_Retirement.md)；新 explain-kit 不恢复旧集成。
