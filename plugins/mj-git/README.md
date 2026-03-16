# mj-git

MJ System Git 工作流技能家族 — 提供分支、提交、推送、PR、Review、同步和清理能力。

## Skills

| Skill | 命令 | 触发场景 |
|-------|------|---------|
| branch | `/mj-git:branch` | 创建分支、Worktree 设置 |
| check-merge | `/mj-git:check-merge` | 检查合并就绪 |
| commit | `/mj-git:commit` | 规范化提交 |
| delete | `/mj-git:delete` | 删除分支、清理 Worktree |
| issue | `/mj-git:issue` | 创建 GitHub Issue |
| pr | `/mj-git:pr` | 创建 Pull Request |
| push | `/mj-git:push` | 推送代码 |
| review-pr | `/mj-git:review-pr` | PR 架构评审 |
| sync | `/mj-git:sync` | 同步分支 |

## 安装

```bash
/plugin marketplace add MJ-AgentLab/mj-agentlab-marketplace
/plugin install mj-git@mj-agentlab-marketplace
```

## 前置条件

- `GITHUB_PERSONAL_ACCESS_TOKEN` 系统环境变量（GitHub API 访问）

## 许可证

MIT
