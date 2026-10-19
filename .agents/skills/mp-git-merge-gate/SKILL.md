---
name: mp-git-merge-gate
description: "Use for marketplace PR merge readiness / 合并门禁: verify CI, independent approvals, resolved threads, current base and any unresolved publish authorization."
---

# mp-git-merge-gate

先判别 PR 目标及实际 rulesets，读取 current head/base SHA、checks、reviews、threads 和候选合并树，确认最新可合并。按[执行规范](../../../docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)，不受保护的内部子 PR 经独立审查、范围/必要 Harness/A6/线程通过即可由 Agent 按授权合并；无额外内部非作者批准门槛。受保护目标仍须实际规则和当前 head 非作者批准，AI 自检/合成角色不替代，不 bypass。集成变化复验受影响范围，主 PR 合 develop 保持保护。VERSION 变化合 main 需已明确发布授权及专门恢复条件。满足后合并并核对实际 SHA/tree 与复验；缺条件说明具体约束和最小参与，延期留原 Epic。

在已有授权范围内由代理执行操作，owner 负责未决事项。需要决定时给出 2–3 个选项、影响及有理由的推荐；必须等待的决定等待答复，推荐不构成批准。详见 [执行与决策规范](../../../docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)。
