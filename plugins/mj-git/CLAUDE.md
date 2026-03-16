# CLAUDE.md — mj-git Plugin

## Plugin 概述

mj-git 是 MJ System 的 Git 工作流技能家族 Plugin，提供 9 个 skill：

| Skill | 命令 | 职责 |
|-------|------|------|
| **branch** | `/mj-git:branch` | 创建分支、命名规范、Worktree 设置 |
| **check-merge** | `/mj-git:check-merge` | 检查分支合并就绪状态 |
| **commit** | `/mj-git:commit` | 规范化提交（scope 推断、message 格式） |
| **delete** | `/mj-git:delete` | 删除分支、清理 Worktree |
| **issue** | `/mj-git:issue` | 创建 GitHub Issue（模板选择、字段填充） |
| **pr** | `/mj-git:pr` | 创建 Pull Request（模板、版本号、部署策略） |
| **push** | `/mj-git:push` | 推送代码（pre-push 检查、dual-push） |
| **review-pr** | `/mj-git:review-pr` | PR 架构评审（合规性、设计一致性） |
| **sync** | `/mj-git:sync` | 同步分支（develop/main 合入当前分支） |

## MCP 依赖

本 plugin 通过 `.mcp.json` 自动注册 2 个 MCP server：

- **github**: GitHub API 访问（需 `GITHUB_PERSONAL_ACCESS_TOKEN` 系统环境变量）
- **serena**: 代码分析工具（使用 `--project-from-cwd`，无需额外配置）

## Skill 调用约定

- 完整工作流链：`issue` → `branch` → `commit` → `push` → `pr` → `review-pr` → `check-merge` → `delete`
- 破坏性操作（force push、branch delete）需用户二次确认
- `commit` skill 根据变更文件路径自动推断 scope

## 文件结构

```
skills/
├── mj-git-branch/        # 分支技能 + branch-rules.md
├── mj-git-check-merge/   # 合并检查技能
├── mj-git-commit/        # 提交技能 + commit-rules.md
├── mj-git-delete/        # 删除技能
├── mj-git-issue/         # Issue 技能 + issue-templates-reference.md
├── mj-git-pr/            # PR 技能 + pr-templates-reference.md
├── mj-git-push/          # 推送技能 + push-faq.md
├── mj-git-review-pr/     # PR 评审技能 + comment-template.md + review-checklist.md + scripts/
└── mj-git-sync/          # 同步技能
```
