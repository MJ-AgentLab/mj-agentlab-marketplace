---
name: mp-git-merge-gate
description: "Use for marketplace PR merge readiness / 合并门禁: verify CI, independent approvals, resolved threads, current base and any unresolved publish authorization."
---

# mp-git-merge-gate

读取 PR、current head SHA、required checks、reviews 与 unresolved threads；确认目标分支最新且可合并。只接受非作者的当前提交批准；不得绕过分支保护或用 AI 自检冒充 GitHub 批准。VERSION 变化合入 main 会触发发布，需此前明确发布授权；版本不变的治理同步按已有授权执行。条件全部满足时执行授权合并，随后核对目标 SHA；缺条件时说明具体约束与最小参与。

在已有授权范围内由代理执行操作，owner 负责未决事项。需要决定时给出 2–3 个选项、影响及有理由的推荐；必须等待的决定等待答复，推荐不构成批准。详见 [执行与决策规范](../../../docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)。
