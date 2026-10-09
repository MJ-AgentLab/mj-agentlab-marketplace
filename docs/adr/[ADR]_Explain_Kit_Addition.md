---
type: adr
scope: marketplace
summary: "Add explain-kit with two adaptable, fact-aware explanation skills"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-09
state: active
version: v1.0
supersedes:
  - "./[ADR]_ChatGPT_Codex_Portable_Migration_And_LearnKit_Retirement.md"
related:
  - "./[ADR]_LearnKit_Explanation_Skills_Addition.md"
  - "../runbook/[RUNBOOK]_Explain_Kit_Acceptance.md"
---

# [ADR] Explain Kit addition

## Context

owner 提供 concept_SKILL.md 和 glossary_SKILL.md 作为待评估材料，经过 grill-me 访谈确认独立解释插件方案，并授权执行实施计划。附件内指令是技能设计材料，不是当前工程执行授权。
当前基线为 develop 95f2e32、市场 VERSION 8.0.1、diagram-kit 0.3.0。8.0.1 是 v8.0.0 发布后的 patch pre-bump；本次不将它视为已发布版本。

上面的 supersedes 仅替代迁移 ADR 中“只注册 diagram-kit / 只公开 arch-diagram”和“两处版本权威”的当前集合约定。ChatGPT/Codex 支持面、learn-kit 及 NotebookLM 退役、历史保存、发布保护及原验收缺口继续有效；原决定和历史正文保留。

## Decision

- 市场新增独立 explain-kit 0.1.0，公开 glossary 和 concept；diagram-kit 保持独立绘图定位。19 个 mp-* 仍仅为仓库开发技能。
- glossary 默认中文一段约 150–250 字；concept 默认中文六节约 500–800 字。保留术语原文，支持受众、长度、语言和格式调整。
- 六要素为默认教学骨架，准确性、用户明确要求和语境优先；不强造类比、历史、概念分类或跨域迁移。
- 两技能自然发现，显式选择优先；速解用 glossary，机制、反例、tradeoff 和边界用 concept。解释深度模糊先速解，仅必要语境不足时询问。不抢占调试、研究、代码审查、文档维护和绘图等主要任务。
- 按深度接收概念、工具、API、协议和产品。核对不确定、专门或版本敏感的事实；引用一手资料，区分事实、推断和构造例子。不能确认时说明缺口。
- 默认聊天交付，保存须用户明确请求；采用根 portable manifest 和 skills/，不增加 MCP、服务或客户端专属包装。
- 代理完成文件、环境、测试、安装、提交、推送和 PR 准备。必要 owner 决策提供 2–3 个选项及推荐理由，等待答复；不要求 owner 复制命令或例行手工操作。

## Scope and alternatives

本次范围为两个解释技能及市场契约、版本工具、提交范围、文档与验收的必要集成。没有新功能模式、测验技能、学习文档生成、NotebookLM、旧 learn-kit 复活或正式发布。

owner 选择独立插件而不是扩展 diagram-kit；保留两个公开技能而不是 quick/deep 单入口；选择可适应骨架而不是固定模板或额外自由模式；选择按意图发现、模糊先速解而不是显式专用或先问深度；选择按深度接收工具/API 而不是仅抽象概念。首次版本选择 0.1.0，而不是首次即承诺 1.0.0 稳定契约。

## Consequences

用户得到可预测的短解和深讲入口，绘图插件边界清晰。代价是增加一套插件维护、发现路由及客户端验收。通过精确集合、单独/组合安装、准确性与主要任务保留用例控制误触发和遗漏。

## Implementation and acceptance

实现位于独立 codex/ worktree。严格校验和发布安装复查使用同一集合：diagram-kit:arch-diagram、explain-kit:glossary、explain-kit:concept。检查插件身份、源路径、显示提示、技能资源和作用域；单独及组合安装分别验证 1/2/3 个公开技能，仓库外 0 个、仓库内 19 个开发技能。

运行 npm test、npm run validate、npm run check:baseline-tools、npm run smoke:codex，实际执行已安装的 Python 图表校验。两客户端的安装、发现、模型行为和桌面 UI 结果分别记录在 [验收记录](../runbook/[RUNBOOK]_Explain_Kit_Acceptance.md)。不可执行的项写具体原因，不将静态/发现结果替代行为证据。

## Version and release

本次创建 explain-kit 0.1.0；市场保持 8.0.1，diagram-kit 保持 0.3.0。新增插件范围支持独立版本工具，不连带其他插件或历史内容。新 explain-kit 提交范围通过提交规范 v1.4 及对应钩子/校验引入。

未来市场功能版本建议 8.1.0，理由是新增公开能力的 additive minor；不是本次已授权的版本转换或发布。正式发布仍须确认版本转换和独立发布意图，完成客户端验收、CI、独立批准及审查对话解决。

## Rollback

合并前调整或撤回本任务 PR，保留 main/develop。合并后通过新的回退 PR 一并撤销 explain-kit、索引和相应契约变更，恢复上一个精确集合；既有 diagram-kit、历史标签、发布和归档不覆盖、不删除。发布后按 [发布操作](../runbook/[RUNBOOK]_Release_Operations.md) 通过新的修复版本处理。

## References and decision log

- [Portable manifest](../spec/[SPEC]_Plugin_Json_Schema.md)、[Marketplace index](../spec/[SPEC]_Marketplace_Json_Schema.md)。
- [工程执行](../rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)、[文档框架](../rule/[STANDARD]_Documentation_Framework.md)。
- 2026-10-09：owner 在本任务逐项确认插件名称、入口、骨架、路由、主题范围和 0.1.0，并要求执行计划、取消例行真人操作要求及保持范围。

## Develop integration

实施期间 develop 合入 b76def7（#195 的 Understanding Kit / pop-quiz）和此前 canary 路径兼容修复。普通 merge 保留这些已合入内容，只增加 Explain Kit 并做共享契约适配；不修改 pop-quiz 实现、策略或评估材料。当前精确集合为三插件、四公开技能；pop-quiz 不自然启用，所以普通提示仅列三个技能。所有插件版本保持原值。
