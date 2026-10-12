---
type: guide
scope: marketplace
summary: "Current marketplace scope and source-of-truth map"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-12
state: active
version: v2.7
---

# [GUIDE] Marketplace project overview

当前候选注册 diagram-kit / arch-diagram、learning-evidence-kit / pop-quiz、learning-record-check 与 explain-kit / glossary、concept：三插件、五公开技能、两个显式学习入口。20 个 mp-* 是仓库开发技能，不进入插件公开目录。目标客户端为 ChatGPT 桌面端和 Codex 本地；CLI 验收基线 0.147.0。PR5 已准备未发布 marketplace 8.2.0，Learning Evidence 0.1.0 / Diagram 0.3.1 / Explain 0.1.1 保持；逐入口资格及剩余门槛见 [发布准备](../runbook/[RUNBOOK]_Marketplace_8_2_0_Release_Readiness.md)。

公开 v8.1.1 仍包含 Diagram 0.3.1 / Understanding 0.1.2 / Explain 0.1.1，采用 A 主标与 D 图标。[历史发布记录](../runbook/[RUNBOOK]_Marketplace_8_1_1_Release_Readiness.md) 保留当时实际身份与缺项；这些结果不代表新候选通过。新包从候选 branch/精确 SHA 验收，正式版本尚未发布。

- VERSION：市场版本权威。
- plugins/*/plugin.json：各插件版本及 portable identity；OpenAI 展示在 extensions.com.openai。
- .agents/plugins/marketplace.json：三插件安装索引，不含版本。
- .agents/skills：开发技能。AGENTS.md：项目指令。 .codex：项目配置与执行规则。
- scripts / tests：仓库结构、版本、发布、安装及行为测试；新共用 Python 运行能力归属 plugins/learning-evidence-kit/scripts，不依赖过渡脚本区。

Learning Evidence Kit 的 Pop Quiz 只读诊断，明确移交后由共用能力保存；Learning Record Check 分开核验记录有效性和任务应用。稳定 evidence ID、完整需求基线、独立本机原件、普通 PR 评论共享及手动历史采集见 [新 ADR](../adr/[ADR]_Learning_Evidence_Kit_Migration.md)和[记录/API](../spec/[SPEC]_Learning_Evidence_Record_And_API.md)。旧 learn-kit / NLM 集成仍退役。team-management、mj-system、Space 及真实长期学习效果评价不在本轮实施。

所有可启用提问入口严格待答；原生持续显示须独立验证，无法满足的入口延期。Owner 接受核心独立验收后交付并保留双技能接口；Epic、延期项和最终接受见 [验收账本](../runbook/[RUNBOOK]_Learning_Evidence_Kit_Acceptance.md)。

Explain Kit 初始 0.1.0，按深度提供可适应的速解与深讲；见 [ADR](../adr/[ADR]_Explain_Kit_Addition.md)。它不改变 pop-quiz 的显式只读策略。

主标与各插件功能形状沿用统一 [品牌规范](../rule/[STANDARD]_Brand_Identity.md)，仓库设计入口为 mp-design-icon。
