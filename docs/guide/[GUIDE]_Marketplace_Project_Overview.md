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

当前开发市场注册 diagram-kit / arch-diagram 与 understanding-kit / pop-quiz；19 个 mp-* 是仓库开发技能，不进入插件公开目录。支持 ChatGPT 桌面端和 Codex 本地；CLI 验收基线 0.147.0。已发布 main / v8.0.0 仅包含 Diagram Kit；新增插件仍在 develop PR 准备阶段。

- VERSION：市场版本权威。
- plugins/*/plugin.json：各插件版本及 portable identity；OpenAI 展示在 extensions.com.openai。
- .agents/plugins/marketplace.json：插件安装索引，不含版本。
- .agents/skills：开发技能。AGENTS.md：项目指令。 .codex：项目配置与执行规则。
- scripts / tests：结构、版本、发布、安装和 Python 图表行为。

Understanding Kit 是独立的纯指令理解测验插件，Codex 优先 Side Chat，其他会话用明确快照。旧 learn-kit / NLM 集成仍退役，历史见 [索引](../INDEX.md)。新增范围见 [Understanding Kit ADR](../adr/[ADR]_Understanding_Kit_Addition.md)；迁移规则与版本例外见 [迁移 ADR](../adr/[ADR]_ChatGPT_Codex_Portable_Migration_And_LearnKit_Retirement.md)。
