---
type: intent
scope: marketplace
summary: "Preserve accepted original meaning through marketplace engineering delivery"
owner: marketplace-maintainers
created: 2026-10-19
updated: 2026-10-19
state: draft
version: v1.0
layer: canonical
intent-id: INT-2026-001
---

# [INTENT] INTENT mechanism

| 来源与责任 | 实际记录 |
|---|---|
| 提出者 | 当前聊天的项目 Owner；准确账号未由来源提供 |
| 原始来源 | Owner 提供的 mj-system 参考说明及设计请求；[完整来源清单](../../plans/263-intent-mechanism/source-bindings.json)保存可见文字与出处性质 |
| 接受责任人 | Owner 决定本项目采用设计/范围；代表须有明确授权 |
| 原意核对记录 | [主 PLAN 的决定正本](../../plans/263-intent-mechanism/[PLAN]_Intent_Mechanism.md#accepted-baseline-and-decision-original)记录 Q1–Q6；本 AI 整理稿尚未单独核对，不妨碍原已接受范围实施 |
| 内容接受记录 | 同一[决定正本](../../plans/263-intent-mechanism/[PLAN]_Intent_Mechanism.md#accepted-baseline-and-decision-original)引用完整设计及后续实施授权；本稿逐字接受未发生，未将旧接受扩大 |
| 当前内容与适用基线 | 完整八节聊天设计 B1；当前 develop 1212514 已有 layer/PLAN/REPORT，十字段适配。新稿 v1.0 待核对/接受，原已接受设计仍为工程依据 |
| 主跟踪 Issue | [Epic #263](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/263) / [任务 INDEX](../../plans/263-intent-mechanism/INDEX.md)；进度留 Epic |

## 1．问题与现状

O1．Owner 希望保存需求原意、固定被接受内容，再转成工程范围，持续核对实现与原意差距，避免实施中悄悄改写需求。本仓已有工程规范/技能/Issue，但尚无独立 INTENT 类型与完整身份/接受检查。mj-system 是机制参考，来源说明明确其长期正式业务成熟度有限，不能将参考项目或本仓初次落地写为长期验证成功。

## 2．期望结果

O2．按 Q1 分层保存唯一原意：跨任务、长期演进、插件对外行为或重要治理变化独立 INTENT，明确小任务用 Issue 原意区，格式维护无需新原意。

O3．按 Q2 分清提出者/代表的原意核对、Owner/授权代表的内容接受、文档状态和具体操作授权，完整接受基线可恢复，实质修订保留旧范围。

O4．按 Q4 复用现有 intake、文档、计划、自检及任务载体，逐项连接正本、接受、承担范围、验收与实际结果，交付/依赖/背景关系明确；保持 20 个开发技能。

O5．按 Q5 首版纳入严格 Harness/CI，机器核验结构与集合完整性，语义审查和真实决定核验含义及接受。

O6．按新增七原则由 Agent 完成技术执行和独立合成验收，集中授权在边界未变时复用，风险隔离/恢复；单 Epic、单主 PR、多子 PR，内部 Agent 合并，最终遵守 develop 保护并向 Owner 交付成品、证据、限制。

## 3．成功判断

S1．独立 INTENT 与轻量 Issue 均有唯一正本；完整接受内容在原文件/Issue 修订后仍可恢复。

S2．跨目录重复 ID、退役身份复用、读取不全必须失败，合法完整基线快照不误判第二正本；类型/字段/日期/命名/身份及索引链接有严格非零失败门禁。

S3．按原意逐项核对实现；工程完成、原意部分达成、非核心延期、全计划完成与最终 Owner 接受各自有证据。独立 Agent 合成角色可复现验证功能与工程质量，平台批准和 Owner 接受另记。

S4．严格窗口继续保留，未答不算答复；窗口持续显示须真实观察。当前无该证据，延期对应入口并不标通过。长期现实效果与业务成功的观察期限、样本和量化阈值尚未确定，不补造。

## 4．范围与约束

R1．按 Q3 增量应用新需求/后续实质修订，补直接受影响旧任务的来源/覆盖，不全量回填或追认。仅增加 intent 类型及必要规范、模板、索引、既有技能接线、Harness/测试；采用现行 canonical/working 和稳定主 PLAN/REPORT。

R2．实施授权覆盖明确技术范围，目标/对象/环境/权限/风险未实质变化时复用。保持插件运行/版本/兼容固定来源，未授权正式发布，不改保护规则。保护批准不能由合成角色或自检替代。

R3．真实来源、决定、实施事实及运行结果分工；本稿是新整理，不将旧设计接受扩张为逐字接受。工程覆盖及恢复安排见[主 PLAN](../../plans/263-intent-mechanism/[PLAN]_Intent_Mechanism.md)。

## 5．未决项

| 项目 | 实际状态、责任与依赖 |
|---|---|
| 本稿核对及内容接受 | 尚无针对本稿的明确决定；Owner/有职责代表处理。工程继续使用原已接受完整设计，不把本稿当额外阻断。 |
| 严格原生窗口持续显示 | 当前缺证/延期对应入口；Agent 在实际宿主能力及新触发允许时复验，不能用文字 pending 代替。 |
| 真实长期使用效果 | 未测，期限/样本/阈值未知；不影响已授权结构核心自身验收。 |
| 最终保护合入 / Owner 接受 | 各自按实际证据记录，实施授权不等于已经接受最终成品。 |
