---
name: mp-git-branch
description: "Use to create a marketplace branch with an isolated Git worktree / 创建分支; inspect base and workspace state and execute the authorized creation."
---

# mp-git-branch

核对 git status、git worktree list、远端目标 SHA，保护 main/develop 工作区与用户改动。按任务选 base：通常 origin/develop，main 的窄治理同步从 origin/main 派生。使用 git worktree add -b 创建分支和隔离目录；应用创建的干净 detached worktree 可绑定 codex/ 分支。默认 codex/ 前缀，用户指定名称优先。验证分支、基准和 clean 状态，然后开始工作；输出已完成结果。

在已有授权范围内由代理执行操作，owner 负责未决事项。需要决定时给出 2–3 个选项、影响及有理由的推荐；必须等待的决定等待答复，推荐不构成批准。详见 [执行与决策规范](../../../docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)。
