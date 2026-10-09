---
name: mp-git-push
description: "Use to push a reviewed marketplace feature branch / 推送; check upstream, commit subjects and hooks, then execute the authorized push."
---

# mp-git-push

核对当前分支、远端和 upstream；只推送任务分支，main/develop 通过 PR。运行 scripts/validate-commits.ps1 或对应 shell 版本验证相对目标 merge-base 的新提交。执行普通推送并核对远端 SHA；既有授权覆盖提交后的推送，不逐次确认。钩子或 CI 失败先修复；任何历史重写按真实范围和已授权意图处理。

在已有授权范围内由代理执行操作，owner 负责未决事项。需要决定时给出 2–3 个选项、影响及有理由的推荐；必须等待的决定等待答复，推荐不构成批准。详见 [执行与决策规范](../../../docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)。
