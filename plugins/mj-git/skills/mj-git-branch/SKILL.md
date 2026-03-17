---
name: mj-git-branch
description: This skill should be used when the user asks to create a branch, name a branch, start feature/bugfix/documentation/maintain/hotfix work, set up a Git Worktree, or choose the correct branch type in MJ System. Triggers on "创建分支", "新建分支", "开新分支", "create branch", "new branch", "branch naming", "worktree add", "哪种分支类型", "which branch type", "开始开发", "start feature", "start bugfix", "start hotfix".
---

# MJ Git Branch

## Overview

Creates and manages Git branches for MJ System following the project's branch strategy. Five temporary branch types, two protected permanent branches (`main`, `develop`).

## 快速开始（交互模式）

用户触发此技能时，先判断已有信息是否充足，再决定直接生成还是追问。

### 信息充足性判断

| 已知信息 | 行动 |
|---------|------|
| 任务性质不明确（「要开始开发」「要改代码」） | 问：「这次任务是新功能、bug 修复、纯文档、基础设施维护，还是生产紧急修复？」 |
| 类型明确，但无英文描述词 | 问：「请用 2-5 个英文单词描述此任务（e.g. `user-auth`、`fix-date-parse`）」 |
| 类型 + 描述词均有，缺 issue-id | 直接生成（issue-id 可选，不追问）。若需先创建 Issue，可使用 mj-git-issue |
| 信息完整 | 直接生成命令 |

### 追问用语模板

- 类型不明：「这次任务的性质是什么？新功能 / bug 修复 / 纯文档 / 基础设施 / 生产紧急修复？」
- 描述词缺失：「请用 2-5 个英文单词描述此任务（用连字符分隔，e.g. `add-user-auth`）」

### 输出格式

信息收集完毕后，**只输出单行创建命令**，不展开完整工作流：

```bash
# feature / bugfix / documentation / maintain（从 develop/ 内执行）
cd develop && git worktree add ../<type>/<desc> -b <type>/<desc> develop

# hotfix（若 main/ 不存在则先创建）
git worktree add main main && cd main && git worktree add ../hotfix/<desc> -b hotfix/<desc> main
```

**示例**：

```bash
# feature
cd develop && git worktree add ../feature/12-user-auth -b feature/12-user-auth develop

# hotfix
git worktree add main main && cd main && git worktree add ../hotfix/fix-imap-timeout -b hotfix/fix-imap-timeout main
```

> 基础分支规则：feature / bugfix / documentation / maintain → `develop`；hotfix → `main`
>
> 完整工作流（含提交、推送、清理步骤）见下方 `## Commands by Branch Type`，用户需要时可参考。

## Branch Type Decision

| Question | → Branch Type |
|----------|--------------|
| New feature, new service, or refactor? | `feature/` |
| Bug found on develop? | `bugfix/` |
| Only docs changed, no code? | `documentation/` |
| Docs changed alongside code? | Follow the code type (`feature/` or `maintain/`) |
| CI/Docker/deps/scripts/config? | `maintain/` |
| Production emergency bug? | `hotfix/` |

> `CHANGELOG.md` is part of the release process — it does NOT need its own branch.

## Naming Format

```
<type>/<issue-id>-<description>   # with GitHub Issue
<type>/<description>              # without Issue (also valid)
```

Valid types: `feature`, `bugfix`, `documentation`, `maintain`, `hotfix`

Rules: lowercase, hyphens only, no spaces or uppercase.

## Commands by Branch Type

### feature / bugfix / documentation / maintain (all use develop as base)

```bash
# Step 1: Create branch + worktree (from develop/ inside mj-system/)
cd mj-system/develop
git worktree add ../feature/12-user-auth -b feature/12-user-auth develop

# Step 2: Work in the new worktree
cd ../feature/12-user-auth
# ... develop → commit ...
# 开发中如需同步 develop 最新代码 → 使用 mj-git-sync

# Step 3: Push (first push needs -u; subsequent pushes use pushall)
git push -u gitee feature/12-user-auth && git push -u origin feature/12-user-auth

# After PR merge — cleanup:
cd ../mj-system
git worktree remove feature/12-user-auth
git -C develop branch -d feature/12-user-auth
```

### hotfix (from main, 7-step workflow)

```bash
# Step 1: Create main worktree if it doesn't exist (from mj-system/ root)
git worktree add main main   # skip if main/ already exists

# Step 2: Create hotfix branch from main worktree
cd main && git worktree add ../hotfix/20-email-timeout -b hotfix/20-email-timeout main

# Step 3: Fix and commit (only `fix` commits allowed)
cd ../hotfix/20-email-timeout
git add <files>
git commit -m "fix(aec): 修复 IMAP 连接超时问题"

# Step 4: Push and create PR targeting main
git push -u gitee hotfix/20-email-timeout && git push -u origin hotfix/20-email-timeout

# Step 5: After PR merge — tag a patch version on main
cd ../main && git pull origin main
git tag -a v2.7.1 -m "Hotfix: 修复 IMAP 连接超时"
git push origin v2.7.1 && git push gitee v2.7.1

# Step 6: Sync fix back to develop (使用 mj-git-sync)
cd ../develop
# 运行 mj-git-sync → 自动检测 hotfix 回同步模式 → merge main + pushall

# Step 7: Cleanup
cd ../mj-system
git worktree remove hotfix/20-email-timeout
git -C develop branch -d hotfix/20-email-timeout
git push origin --delete hotfix/20-email-timeout
```

## Git Worktree Setup（Bare Repo，初次初始化）

```bash
# Step 1: Create container directory
mkdir mj-system && cd mj-system

# Step 2: Clone as bare repo
git clone --bare https://github.com/MJ-AgentLab/mj-system.git .bare

# Step 3: Create gitdir pointer
echo "gitdir: ./.bare" > .git
# Windows PowerShell: New-Item .git -ItemType File -Value "gitdir: ./.bare"

# Step 4: Fix fetch refspec (required — bare clone omits this by default)
git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"

# Step 5: Fetch remote branches + create develop worktree
git fetch origin
git worktree add develop develop

# Result structure:
# mj-system/
# ├── .bare/              (bare repo — hidden)
# ├── .git                (single-line pointer — hidden)
# └── develop/            (worktree, develop branch)

# Create feature/bugfix/maintain worktrees (from within develop/):
cd develop
git worktree add ../feature/12-user-auth -b feature/12-user-auth develop

# Common commands (run from any worktree):
git worktree list              # see all worktrees and their paths
git worktree remove <dir>      # cleanup after PR merge
```

> **SAFETY**: `git checkout` to switch branches is NOT available from `mj-system/` root — the bare repo root has no working tree. Always `cd` into the target worktree directory. Never run `git checkout` in `mj-system/` root.

## Quick Reference → branch-rules.md

Full commit-type × branch-type allowed matrix, naming examples, and lifecycle diagrams are in `branch-rules.md`.
