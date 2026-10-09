---
name: mp-git-cleanup
description: "Use for authorized marketplace branch or worktree cleanup / 分支清理 after verifying merge ancestry, clean state, target paths and protected branches."
---

# mp-git-cleanup

只清理已经授权且无需保留的工作树/分支。核对工作区、忽略文件、PR 状态、merge ancestry；main、develop 和当前分支保持保护。应用创建的 worktree 使用 archive_worktree，先保留仍需的忽略文件；普通工作树使用 git worktree remove，禁止强制丢弃未提交内容。Windows 删除/移动前核对绝对目标在指定目录内，使用同一 PowerShell 路径和 LiteralPath。批量清理使用 scripts/safe-bulk-cleanup.ps1 先 dry-run；git for-each-ref 不传易匹配父前缀的过滤参数，local merged 不等于所有远端已合并。gh api endpoint 用 repos/ 而非前导斜杠，避免 Git Bash 路径改写。外部旧发布资产永不作为清理目标。

在已有授权范围内由代理执行操作，owner 负责未决事项。需要决定时给出 2–3 个选项、影响及有理由的推荐；必须等待的决定等待答复，推荐不构成批准。详见 [执行与决策规范](../../../docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md)。
