---
type: guide
scope: marketplace
summary: "Current marketplace scope and source-of-truth map"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-13
state: active
version: v2.9
---

# [GUIDE] Marketplace project overview

当前PR3候选注册diagram-kit/arch-diagram、learning-evidence-kit/pop-quiz及learning-record-check、explain-kit/glossary及concept、html-guide-kit/guide和communication-kit/communicate：五插件七公开技能、四显式入口，20个mp-*仅属仓库开发技能。目标为ChatGPT桌面和Codex本地，CLI基线0.147.0。VERSION沿用8.2.0；main已发布三包五技能，Diagram0.3.1/Learning0.1.0/Explain0.1.1，HTML0.1.0/Communication0.1.0未公开。Communication正式四包六技能、HTML留develop另发，后续minor目标8.3.0；实际发布与入口资格见[8.2.0账本](../runbook/[RUNBOOK]_Marketplace_8_2_0_Release_Readiness.md)及[Communication验收](../runbook/[RUNBOOK]_Communication_Kit_Acceptance.md)。

Owner 已确认独立公开 8.2.0 保持 Diagram、Learning Evidence、Explain 三插件/五技能，HTML 在 develop 保留并另行发行。

公开 v8.1.1 仍包含 Diagram 0.3.1 / Understanding 0.1.2 / Explain 0.1.1，采用 A 主标与 D 图标。[历史发布记录](../runbook/[RUNBOOK]_Marketplace_8_1_1_Release_Readiness.md) 保留当时实际身份与缺项；这些结果不代表新候选通过。新包从候选 branch/精确 SHA 验收，正式版本尚未发布。

- VERSION：市场版本权威。
- plugins/*/plugin.json：各插件版本及 portable identity；OpenAI 展示在 extensions.com.openai。
- .agents/plugins/marketplace.json：候选五插件安装索引，不含版本；已发布范围按 main/tag 分开读取。
- .agents/skills：开发技能。AGENTS.md：项目指令。 .codex：项目配置与执行规则。
- scripts / tests：仓库结构、版本、发布、安装及行为测试；新共用 Python 运行能力归属 plugins/learning-evidence-kit/scripts，不依赖过渡脚本区。

Learning Evidence Kit 的 Pop Quiz 只读诊断，明确移交后由共用能力保存；Learning Record Check 分开核验记录有效性和任务应用。稳定 evidence ID、完整需求基线、独立本机原件、普通 PR 评论共享及手动历史采集见 [新 ADR](../adr/[ADR]_Learning_Evidence_Kit_Migration.md)和[记录/API](../spec/[SPEC]_Learning_Evidence_Record_And_API.md)。旧 learn-kit / NLM 集成仍退役。team-management、mj-system、Space 及真实长期学习效果评价不在本轮实施。

所有可启用提问入口严格待答；原生持续显示须独立验证，无法满足的入口延期。Owner 接受核心独立验收后交付并保留双技能接口；Epic、延期项和最终接受见 [验收账本](../runbook/[RUNBOOK]_Learning_Evidence_Kit_Acceptance.md)。

Explain Kit 初始 0.1.0，按深度提供可适应的速解与深讲；见 [ADR](../adr/[ADR]_Explain_Kit_Addition.md)。它不改变 pop-quiz 的显式只读策略。

Communication 是显式的沟通、编写与保义改写单入口，默认聊天交付成稿＋关键提示，关键缺口先问并等待，明确请求后才保存或编辑 Markdown/TXT。运行用包内原创 AICS 冻结摘要，来源路径与脏状态只作追溯；见[包说明](../../plugins/communication-kit/README.md)、[ADR](../adr/[ADR]_Communication_Kit_Addition.md)和[验收契约](../runbook/[RUNBOOK]_Communication_Kit_Acceptance.md)。实际行为与必要双客户端可用性按验收记录逐项登记，基础功能不证明现实效果。

实施由 [Epic #222](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/222) 管理；Learning 先8.2.0、Communication 随后独立 minor（预计8.3.0），PR4 重查实际 From/To 和基线范围。现实场景效果测试本轮延期，不是基础上线门槛。

主标与各插件功能形状沿用统一 [品牌规范](../rule/[STANDARD]_Brand_Identity.md)，仓库设计入口为 mp-design-icon。

| Version | Date | Summary |
|---|---|---|
| v2.6 | 2026-10-12 | Communication 候选与已发布范围、来源冻结和验收边界 |

HTML Guide Kit 0.1.0 作为 develop 开发候选原子接入，新增唯一显式 Read 入口 guide；同步到 Communication 候选后为五插件/七公开技能，普通提示自然发现仍三项，20项开发技能仍仅在仓库作用域。只在聊天新建指南，先确认读者/任务/理解问题；[使用指南](./[GUIDE]_HTML_Guide_Kit.md) 与 [新增 ADR](../adr/[ADR]_HTML_Guide_Kit_Addition.md) 定义边界。main/v8.1.1 不新增该插件，本任务无正式发布。

| Version | Date | Summary |
|---|---|---|
| v2.7 | 2026-10-13 | 同步 HTML 开发基线，保留 Communication 合同并更新五插件集合与十三组合预期 |

| Version | Date | Summary |
|---|---|---|
| v2.8 | 2026-10-13 | 同步 Learning 原子替代与 Communication 完整集成，按当前集合验收，发行范围另核对 |

| v2.9 | 2026-10-13 | 同步已公开Learning8.2.0基线，保留Communication开发五包与正式四包范围及历史限制 |
