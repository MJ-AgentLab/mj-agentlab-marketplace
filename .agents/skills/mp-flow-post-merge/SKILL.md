---
name: mp-flow-post-merge
description: "Use after marketplace PR merge / 合并后验证 to verify target branches, release state, version preparation and safe cleanup within authorization."
---

# mp-flow-post-merge

获取实际 merge SHA 和目标分支，确认 diff 和 VERSION。治理同步若两个目标分支都落地，后续迁移才可合并。正式发布之后核对标签绑定、Release 正文、published 状态与 immutability；不覆盖已发布版本或旧资产。若已授权执行下一补丁 pre-bump，先运行版本工具 dry-run，再通过新 PR 推进。最后使用 mp-git-cleanup 仅清理本任务已合并且无保留需求的工作树。

在已有授权范围内由代理执行操作，owner 负责未决事项。需要决定时给出 2–3 个选项、影响及有理由的推荐；必须等待的决定等待答复，推荐不构成批准。详见 [执行与决策规范](../../../docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)。
