# mj-git

MJ System Git 工作流技能家族 — 提供分支、提交、推送、PR、Review、同步和清理能力。

## Skills

| Skill | 命令 | 触发场景 |
|-------|------|---------|
| branch | `/mj-git:mj-git-branch` | 创建分支、Worktree 设置 |
| check-merge | `/mj-git:mj-git-check-merge` | 检查合并就绪 |
| commit | `/mj-git:mj-git-commit` | 规范化提交 |
| delete | `/mj-git:mj-git-delete` | 删除分支、清理 Worktree |
| issue | `/mj-git:mj-git-issue` | 创建 GitHub Issue |
| pr | `/mj-git:mj-git-pr` | 创建 Pull Request |
| push | `/mj-git:mj-git-push` | 推送代码 |
| review-pr | `/mj-git:mj-git-review-pr` | PR 架构评审 |
| sync | `/mj-git:mj-git-sync` | 同步分支 |

## 安装

```bash
/plugin marketplace add MJ-AgentLab/mj-agentlab-marketplace
/plugin install mj-git@mj-agentlab-marketplace
```

## 前置条件

以下环境变量需通过 setup 脚本配置（见 Post-Install Setup）：

- `GITHUB_PERSONAL_ACCESS_TOKEN`（GitHub API 访问）

## Post-Install Setup

秘密值配置（首次使用 + 密码更新时运行）：

```powershell
cd <marketplace>/plugins/mj-git
.\scripts\setup-git-env.ps1        # 解密 → .env → 1 个 OS 环境变量
```

终端重启后重载（无需密码）：

```powershell
.\scripts\setup-git-env.ps1 -Reload
```

详见 `config/secrets-git.example` 查看变量清单。

## 许可证

MIT
