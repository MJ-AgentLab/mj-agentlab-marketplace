---
name: mp-git-pr
description: "Use to create or update a marketplace pull request / 创建 PR with the correct base, scope, evidence and template; execute authorized PR preparation."
---

# mp-git-pr

先读任务 INDEX/主 PLAN 和[执行规范](../../../docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)，选择 .github/PULL_REQUEST_TEMPLATE/ 中符合任务的模板，确认 base、head、非空 diff 和实际权限。拆分任务在同 Epic 下同时一个活动主 PR 指向 develop，子 PR 指向该主 PR 的集成分支；后续批次复用 Epic/目录，上一活动主 PR 结束后再开下一主 PR。标明内部/最终角色、接受基线及实际候选检查。正文说明问题与结果、影响、实际验证、AI 判断、风险/回退和依赖，六项自检如实完成。正文保存在任务临时目录，用 gh pr create/edit --body-file 执行，保留真实换行。创建后用应用提供的 attach_artifact 附加 PR（工具可用时）。读取 CI 结果并修复；依赖治理或客户端验收未完成时创建 draft 并说明解除条件。

在已有授权范围内由代理执行操作，owner 负责未决事项。需要决定时给出 2–3 个选项、影响及有理由的推荐；必须等待的决定等待答复，推荐不构成批准。详见 [执行与决策规范](../../../docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)。
