---
type: adr
scope: marketplace
summary: "Adopt tiered INTENT originals and recoverable accepted engineering scope"
owner: marketplace-maintainers
created: 2026-10-19
updated: 2026-10-19
state: active
version: v1.0
layer: canonical
related:
  - ./[ADR]_Task_Documentation_Layers_And_Delivery.md
  - ../rule/[STANDARD]_AI_Engineering_Intent.md
  - ../rule/[STANDARD]_Documentation_Framework.md
---

# [ADR] INTENT mechanism addition

| Field | Value |
|---|---|
| Status | accepted design; implementation, protected merge and final Owner acceptance tracked separately |
| Decision source | Owner's Q1–Q6 replies, seven-principle addition and implementation authorization in this chat |
| Exact decision-message time | unavailable in supplied transcript; not replaced with capture time |
| Record date | 2026-10-19 |
| Scope | repository governance, intent documents and existing engineering handoff |
| Reversibility | corrective repository change; preserve source and prior acceptance |

## Context and source

Owner 提供 mj-system 的 INTENT 机制说明，要求借鉴设计、增加 intent 类型，初期明确只读。经 Q1–Q5 分别选择分层正本、Owner/授权代表接受、增量接入、复用已有技能及首版严格门禁；Q6 确认已达成设计共识并继续只读。随后 Owner 增加七项执行原则，最终明确授权按上述方案实施、创建单 Epic/单主 PR/多子 PR、Agent 合并子 PR、主 PR 遵守 develop 保护。

完整设计、确认回复及授权的逐字聊天捕获见[来源清单](../../plans/263-intent-mechanism/source-bindings.json)与[主 PLAN](../../plans/263-intent-mechanism/[PLAN]_Intent_Mechanism.md)。快照是当前上下文可见文字的实际 UTF-8 字节，非宿主消息导出；来源的实际消息时刻不可得。未将本次 AI 整理的 INTENT 或 ADR 虚称 Owner 已逐字接受。

## Decision

采用[INTENT 规范](../rule/[STANDARD]_AI_Engineering_Intent.md)：唯一正本、五段正文、完整接受基线、核对/接受/状态/授权分工、稳定 ID、增量修订和逐项工程覆盖。简单单任务继续 Issue 原意区，不强制访谈或新增文件。重要长期原意独立保存，新增 `intent` 类型。

当前实际 develop 已有正式 PLAN/REPORT、canonical/working 和九公共字段，原设计按较早本地基线写九字段（含 intent-id）。本次兼容现行框架，加 `layer: canonical` 为十字段，不回退现有任务机制，不改变已接受业务含义。七执行原则复用[现行执行规范](../rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)，不复制第二套合同。

使用一个 Epic、同时一个活动主 PR→受保护 develop、多个子 PR→集成分支。内部 Harness、独立 Agent 核验与 Agent 合并独立记录；GitHub 当前 head 非作者批准、checks、线程及实际基线按保护要求处理。保持 20 个已有开发技能，无 `mp-flow-intent` 新入口，无插件运行、版本、发布或保护配置变化。

## Consequences and alternatives

| 选择 | 影响及决定 |
|---|---|
| 所有任务独立 INTENT | 维护开销高，采用分层正本 |
| 全量回填旧任务 | 可能制造历史接受，采用增量/直接受影响部分接入 |
| 新增独立访谈技能 | 增加入口与严格窗口验收，首版复用 intake/doc/plan/self-review |
| 先人工提示后 CI | 无可执行类型合同，首版即严格门禁 |

新增模板、索引、技能接线及完整集合/来源检查增加必要维护；独立合成验收检验实际功能与工程质量，不代替 Owner 最终接受。严格未答原生窗口当前缺证，延期对应入口，核心、全计划和接受分别记录；现实长期使用效果未测。

## Implementation and acceptance

[Epic #263](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/263)、[主 PR #264](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/264)与[任务入口](../../plans/263-intent-mechanism/INDEX.md)组织合同、Harness、独立合成验收及集成。现有规范保留其历史范围，兼容清单固定来源不改。验收包括独立/Issue 唯一原意、完整旧基线恢复、跨目录重复/退役身份/不完整集合失败、合法快照不误判、实质修订保界、原意部分达成与工程完成分记。判准写入不等于通过，实际结果由主 REPORT 记录。
