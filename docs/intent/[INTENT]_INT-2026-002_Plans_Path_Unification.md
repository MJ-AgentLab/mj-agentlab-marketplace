---
type: intent
scope: marketplace
summary: "Unify task plan management under plans without legacy path compatibility"
owner: marketplace-maintainers
created: 2026-10-19
updated: 2026-10-19
state: draft
version: v1.3
layer: canonical
intent-id: INT-2026-002
---

# [INTENT] Unify plan management under plans

| 来源与责任 | 实际记录 |
|---|---|
| 提出者 | 当前聊天的项目 Owner；准确账号未由来源提供 |
| 原始来源 | Owner 本次需求、grilling Q1 范围选择及 Q2 核对/接受见[完整 B1 与决定](../../plans/269-plans-path-unification/evidence/sources/accepted-baseline-b1.json)；后续直接追加的七项执行原则见[P1 原文与追加决定](../../plans/269-plans-path-unification/evidence/sources/execution-principles-p1.json)。原始消息准确时间、消息 ID 和可定位聊天 URL 未提供，不补造 |
| 接受责任人 | Owner；本次由提出者本人核对原意并接受需求基线 |
| 原意核对记录 | [决定正本](../../plans/269-plans-path-unification/evidence/sources/accepted-baseline-b1.json)的 acceptanceDecision：Owner 在 Q2 明确答复“B1 准确”；实际消息时间未知，来源捕获于 2026-10-19T06:49:44Z（Asia/Taipei 为 2026-10-19 14:49:44），捕获时间不代替决定时间 |
| 内容接受记录 | B1 的 Q1/Q2 核对及接受保持；Owner 最新明确要求执行需求并遵循七原则，已从写作阶段转入实施。完整基线、先前误解及实际授权统一见[任务 PLAN 决定记录](../../plans/269-plans-path-unification/[PLAN]_Plans_Path_Unification.md#accepted-baseline-and-authorization)，不推定工程完成或 Owner 最终接受 |
| 当前内容与适用基线 | v1.3 保持已接受 B1 的原意与范围，纠正七原则应约束实施而非扩写需求，并将工程进度与最终接受交由各自实际证据判断；先前 v1.0/v1.1 可恢复原件由任务来源保存。核查起点 develop 91f982f70552fc0bfdf4015da943e257a22d4c7b，实施刷新实际基线 |
| 主跟踪 Issue | [#269](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/269)；[任务入口](../../plans/269-plans-path-unification/INDEX.md)连接 PLAN/后续 REPORT，进度留 Issue |

## 1．问题与现状

O1．Owner 原话：“在之前任务留下 plan 和 plans 两个文档路径，让本应该进行plan文档管理的目的又产生了新的理解负担，进行统一整合进入 plans 目录中”；同时要求“不再与历史进行兼容”。Q1 已将后一句收敛为本次路径整合不留兼容，其他历史文档兼容不在本次范围。

项目事实另记：在固定[核查基线](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/tree/91f982f70552fc0bfdf4015da943e257a22d4c7b)中，plan/ 仅有 Communication Kit 原实施计划和 provenance；plans/ 已采用按任务组织的 INDEX、唯一主 PLAN 及实际结果出现后的主 REPORT。原规范明确保留旧 plan/ 路径，因而双入口是既有安排，并非目录同名笔误。这是调查事实，不等同于 Owner 接受现状。

## 2．期望结果

O2．任务计划管理统一进入 plans/。原 plan/ 内容按现行任务文档结构整合，读者从唯一任务入口抵达主计划、实际结果与必要来源，不再先理解两个目录的历史分工。

O3．完整取消本次旧路径兼容：删除当前仓库的 plan/，同步现行引用、导航、规范、脚本、测试和资源定位，不提供旧路径别名、回退、重定向或校验豁免。

O4．必要的历史内容保存在 plans/ 内的证据或固定 Git 来源中，承担原件恢复与追溯用途，不再作为现行计划入口或另一份并行维护的主计划。历史接受、失败及捕获事实保持真实。

## 3．成功判断

S1．整合后的当前仓库不存在 plan/，正常阅读与维护任务计划只需使用 plans/ 的任务入口。

S2．现行导航、规范、脚本、测试和资源定位均使用整合后的路径；旧路径别名、回退、重定向及校验豁免全部撤除。本判准不要求抹除固定 Git 历史或历史证据中真实出现的旧路径。

S3．同一任务不形成两套并行维护的主计划，读者能从唯一任务入口找到主计划、实际结果和必要来源。单纯移动目录但继续要求读者理解两套管理规则，不算达成 O2。

S4．必要历史内容仍可按声明的证据位置或固定 Git 来源追溯，未将原接受、失败或捕获事实改写为新的事实；保存来源不提供旧路径运行兼容。

上述为工程验收目标，实际执行、逐项证据和限制由[任务入口](../../plans/269-plans-path-unification/INDEX.md)及主 Issue 定位；接受需求或开始实施不表示这些判准已经通过，INTENT 不复制工程进度。

## 4．范围与约束

R1．Q1 接受范围仅为 plan/ 与 plans/ 的任务计划路径统一，以及直接受影响的现行引用与校验。全仓其他历史文档兼容清单和相应逻辑不在范围内，不由“不再与历史兼容”自动扩大。

R2．核查基线中，[文档框架](../rule/[STANDARD]_Documentation_Framework.md)与[任务文档 ADR](../adr/[ADR]_Task_Documentation_Layers_And_Delivery.md)包含旧 plan/ 路径保留要求，属于本次实施必须同步处理的直接约定；本 INTENT 记录 Owner 的方向，具体修改结果由任务证据判断。具体文件结构、来源迁移及验证方法由实施阶段按有效规范细化，不重新要求 Owner 决定常规细节。

R3．Owner 已明确要求执行解决本需求，七项原则用于实施过程；此前仅写需求的阶段已结束，真实授权和五边界见[任务 PLAN](../../plans/269-plans-path-unification/[PLAN]_Plans_Path_Unification.md#accepted-baseline-and-authorization)。执行遵循[工程执行规范](../rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)，不在本原意正本重复七项过程规则。draft 只表示文档生命周期，不抵消 B1 接受或实际实施授权，也不代表工程交付/最终接受。

R4．澄清采用 Owner 指定的 Matt Pocock grilling，以选项和有理由的推荐提问，实际提交才算答复。Owner 要求未选择时窗口不能消失；当前未取得未答持续显示的客户端实证，不承诺宿主窗口可锁定，不以文字 pending 充当窗口证据。Q1/Q2 的实际提交与窗口持续显示能力分开记录，不将预选、默认、沉默、超时或关闭视为确认。

## 5．未决项

| 项目 | 实际状态、责任与依赖 |
|---|---|
| 需求范围与 B1/P1 决定 | B1 已由 Owner Q1/Q2 明确核对/接受，P1 是 Owner 直接追加的七项执行约束；完整版本与对应决定分别在[B1](../../plans/269-plans-path-unification/evidence/sources/accepted-baseline-b1.json)和[P1](../../plans/269-plans-path-unification/evidence/sources/execution-principles-p1.json)保存，各自范围不互相扩张；无剩余需求范围选择 |
| 具体工程承接 | 已由 Owner 最新指令授权进入实施；#269 及[任务入口](../../plans/269-plans-path-unification/INDEX.md)承接目录/文档整合与 Harness/测试子 PR，实际进度不在此复制 |
| 原生未答窗口持续显示 | 尚无客户端实证，不能记为通过；Agent 在宿主能力允许且有实际验证条件时核实，未提交保持待答，不默认推进依赖决定 |
| 工程结果与最终成品接受 | 工程结果由[主 REPORT](../../plans/269-plans-path-unification/[REPORT]_Plans_Path_Unification.md)及主 Issue 的实际证据判断，Owner 最终接受另据真实决定判断；本原意正本不复制迁移进度，也不以 B1 接受或文档状态代替任一结论 |
