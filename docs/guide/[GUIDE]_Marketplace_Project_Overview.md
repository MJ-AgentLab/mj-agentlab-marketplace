---
type: guide
scope: marketplace
summary: "Current marketplace scope and source-of-truth map"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-13
state: active
version: v2.7
---

# [GUIDE] Marketplace project overview

PR3 开发候选注册 diagram-kit / arch-diagram、understanding-kit / pop-quiz、explain-kit / glossary、concept 、html-guide-kit / guide 与 communication-kit / communicate，共五插件六公开技能；20 个 mp-* 是仓库开发技能，不进入插件公开目录。支持 ChatGPT 桌面端和 Codex 本地；CLI 验收基线 0.147.0。已发布 main / v8.1.1 包含 Diagram 0.3.1 / Understanding 0.1.2 / Explain 0.1.1，采用 A 主标与 D 插件图标。#206 已回同步发布 main，本分支为未发布 8.1.2 pre-bump，Communication 0.1.0 仍为未发布候选；[发布记录](../runbook/[RUNBOOK]_Marketplace_8_1_1_Release_Readiness.md) 保存实际身份与未完成证据。历史 v8.0.0 仅包含 Diagram Kit。

- VERSION：市场版本权威。
- plugins/*/plugin.json：各插件版本及 portable identity；OpenAI 展示在 extensions.com.openai。
- .agents/plugins/marketplace.json：候选五插件安装索引，不含版本；已发布范围按 main/tag 分开读取。
- .agents/skills：开发技能。AGENTS.md：项目指令。 .codex：项目配置与执行规则。
- scripts / tests：结构、版本、发布、安装和 Python 图表行为。

Understanding Kit 是独立的纯指令理解测验插件，Codex 优先 Side Chat，其他会话用明确快照。旧 learn-kit / NLM 集成仍退役，历史见 [索引](../INDEX.md)。新增范围见 [Understanding Kit ADR](../adr/[ADR]_Understanding_Kit_Addition.md)；迁移规则与版本例外见 [迁移 ADR](../adr/[ADR]_ChatGPT_Codex_Portable_Migration_And_LearnKit_Retirement.md)。

Explain Kit 初始 0.1.0，按深度提供可适应的速解与深讲；见 [ADR](../adr/[ADR]_Explain_Kit_Addition.md)。它不改变 pop-quiz 的显式只读策略。

Communication 是显式的沟通、编写与保义改写单入口，默认聊天交付成稿＋关键提示，关键缺口先问并等待，明确请求后才保存或编辑 Markdown/TXT。运行用包内原创 AICS 冻结摘要，来源路径与脏状态只作追溯；见[包说明](../../plugins/communication-kit/README.md)、[ADR](../adr/[ADR]_Communication_Kit_Addition.md)和[验收契约](../runbook/[RUNBOOK]_Communication_Kit_Acceptance.md)。实际行为与必要双客户端可用性按验收记录逐项登记，基础功能不证明现实效果。

实施由 [Epic #222](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/222) 管理；Learning 先8.2.0、Communication 随后独立 minor（预计8.3.0），PR4 重查实际 From/To 和基线范围。现实场景效果测试本轮延期，不是基础上线门槛。

主标与各插件功能形状沿用统一 [品牌规范](../rule/[STANDARD]_Brand_Identity.md)，仓库设计入口为 mp-design-icon。

| Version | Date | Summary |
|---|---|---|
| v2.6 | 2026-10-12 | Communication 候选与已发布范围、来源冻结和验收边界 |

HTML Guide Kit 0.1.0 作为 develop 开发候选原子接入，新增唯一显式 Read 入口 guide；同步到 Communication 候选后为五插件/六公开技能，普通提示自然发现仍三项，20项开发技能仍仅在仓库作用域。只在聊天新建指南，先确认读者/任务/理解问题；[使用指南](./[GUIDE]_HTML_Guide_Kit.md) 与 [新增 ADR](../adr/[ADR]_HTML_Guide_Kit_Addition.md) 定义边界。main/v8.1.1 不新增该插件，本任务无正式发布。

| Version | Date | Summary |
|---|---|---|
| v2.7 | 2026-10-13 | 同步 HTML 开发基线，保留 Communication 合同并更新五插件集合与十三组合预期 |
