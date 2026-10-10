---
type: guide
scope: marketplace
summary: "Current marketplace scope and source-of-truth map"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-10
state: active
version: v2.5
---

# [GUIDE] Marketplace project overview

当前市场注册 diagram-kit / arch-diagram、understanding-kit / pop-quiz 与 explain-kit / glossary、concept；20 个 mp-* 是仓库开发技能，不进入插件公开目录。支持 ChatGPT 桌面端和 Codex 本地；CLI 验收基线 0.147.0。已发布 main / v8.1.1 包含 Diagram 0.3.1 / Understanding 0.1.2 / Explain 0.1.1，采用 A 主标与 D 插件图标。#206 已回同步发布 main，本分支为未发布 8.1.2 pre-bump；[发布记录](../runbook/[RUNBOOK]_Marketplace_8_1_1_Release_Readiness.md) 保存实际身份与未完成证据。历史 v8.0.0 仅包含 Diagram Kit。

- VERSION：市场版本权威。
- plugins/*/plugin.json：各插件版本及 portable identity；OpenAI 展示在 extensions.com.openai。
- .agents/plugins/marketplace.json：三插件安装索引，不含版本。
- .agents/skills：开发技能。AGENTS.md：项目指令。 .codex：项目配置与执行规则。
- scripts / tests：结构、版本、发布、安装和 Python 图表行为。

Understanding Kit 是独立的纯指令理解测验插件，Codex 优先 Side Chat，其他会话用明确快照。旧 learn-kit / NLM 集成仍退役，历史见 [索引](../INDEX.md)。新增范围见 [Understanding Kit ADR](../adr/[ADR]_Understanding_Kit_Addition.md)；迁移规则与版本例外见 [迁移 ADR](../adr/[ADR]_ChatGPT_Codex_Portable_Migration_And_LearnKit_Retirement.md)。

Explain Kit 初始 0.1.0，按深度提供可适应的速解与深讲；见 [ADR](../adr/[ADR]_Explain_Kit_Addition.md)。它不改变 pop-quiz 的显式只读策略。

主标与各插件功能形状沿用统一 [品牌规范](../rule/[STANDARD]_Brand_Identity.md)，仓库设计入口为 mp-design-icon。
