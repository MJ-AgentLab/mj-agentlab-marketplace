---
name: mp-git-sync
description: "Use to synchronize marketplace branches / 分支同步 while preserving local changes and resolving actual merge or cherry-pick conflicts."
---

# mp-git-sync

读取各分支和 worktree 当前状态，fetch 后比较提交 ancestry。保护用户未提交内容，优先普通 merge/cherry-pick，不隐式 reset/force。同步 main 的治理修复只移植该变更，VERSION 与发布逻辑保持基线。冲突逐块按源意图和用户目标解决，运行相应测试，然后完成操作并报告实际差异。

在已有授权范围内由代理执行操作，owner 负责未决事项。需要决定时给出 2–3 个选项、影响及有理由的推荐；必须等待的决定等待答复，推荐不构成批准。详见 [执行与决策规范](../../../docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)。
