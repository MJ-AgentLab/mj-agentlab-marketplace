---
name: sync
description: This skill should be used when the user asks to sync the latest develop or main changes into the current working branch, or sync main back to develop after a hotfix merge in MJ System. It should also be invoked when the user mentions their branch is behind, has conflicts with develop, wants to update their branch, or mentions pulling or merging upstream changes, even without saying "sync" explicitly. Triggers on "同步分支", "拉取最新", "sync branch", "pull develop", "merge develop", "update branch", "rebase", "分支落后", "branch behind", "合并最新代码", "落后了", "分支过时了", "develop 有新代码", "冲突太多了", "branch outdated", "catch up with develop", "同步一下", "同步 main 到 develop", "hotfix 合并后同步", "sync main to develop", "自更新", "origin 有新提交", "协作者推了代码", "self-update", "pull remote", "另一台机器提交了", "remote ahead".
---

# MJ Git Sync

## Overview

同步基线分支（develop 或 main）的最新代码到当前工作分支，或从 origin 拉取同名分支的远端提交。这是一个**侧循环辅助操作**，非线性链节点——可在 branch→push 之间的任意时刻多次调用。

```
branch → [开发] → sync ↻ → commit → push → pr → check-merge → delete
                     ↑          |
                     └──────────┘ (可多次调用)
```

**三模式**：
- **开发中同步模式**：工作分支（feature/bugfix/documentation/maintain/hotfix）拉取基线分支最新代码
- **Hotfix 回同步模式**：在 develop 上将 main（含 hotfix 修复）合并回 develop 并推送
- **自更新模式**：任何分支从 origin/<当前分支> 拉取远端最新提交
  适用场景：多机器开发、协作者推送、PR 合并后更新本地 worktree

## 前置条件

- 在 MJ System worktree 目录内执行（bare repo 根目录无 working tree）
- `main` 分支上禁止跨分支合并（自更新 origin/main → main 例外）

## 快速开始（交互模式）

### 信息充足性判断

| 已知信息 | 行动 |
|---------|------|
| 用户说「同步」但未指定分支 | `git branch --show-current`，自动推导基线分支 |
| 用户说「rebase」 | 告知项目统一使用 merge 策略，引导为 merge (H5) |
| 当前在 develop 上 + 意图明确 | 进入 hotfix 回同步或自更新模式 |
| 分支名和意图明确 | 直接执行同步流程 |

### 意图识别（概念区分，非关键词匹配）

两种同步操作的本质区别：
- **自更新** = origin/<当前分支> → 本地（同名分支间同步）
  信号：用户提到 origin、远端提交、协作者、另一台机器、self-update
- **跨分支同步** = origin/<基线分支> → 本地（不同分支间同步）
  信号：用户提到 develop、main、基线、落后、behind
- **意图模糊** = 无法区分上述两者时，由 H-code 机制解决

---

## Sync Workflow (6 steps)

### Step 0 — 环境检测（三模式，自动执行）

```bash
git branch --show-current
git worktree list
```

**检测逻辑**（解析用户意图 + 当前分支）：

```
┌─ 意图 = 自更新（检测到自更新信号）
│   ├── 任何分支（含 main、develop）→ 进入「自更新模式」
│   └── base = origin/<current-branch>
│
├─ 意图 = 跨分支同步（检测到基线分支信号）
│   ├── main → H4 硬阻断（不变）
│   ├── develop → Hotfix 回同步模式（不变）
│   └── work branch → 开发中同步模式（不变）
│       ├── feature/bugfix/documentation/maintain → 基线 = develop
│       ├── hotfix → 基线 = main
│       └── 其他前缀 → H6 询问基线分支
│
├─ 意图 = Hotfix 回同步（检测到 hotfix 回同步信号）
│   └── develop → Hotfix 回同步模式（不变）
│
└─ 意图 = 模糊（无法区分）
    ├── main → H4a：询问自更新 or 取消
    ├── develop → H4b（三选一）：自更新 / hotfix 回同步 / 取消
    └── work branch → Smart H7（数据驱动，见下）
```

#### Smart H7 — 工作分支模糊意图的数据驱动路由

工作分支 + 意图模糊时，提前执行 fetch 后用数据决定：

```bash
# Step 2 提前执行
git fetch origin

# 检查 origin/<current-branch> 是否存在及落后数
SELF_GAP=$(git rev-list --count HEAD..origin/<current-branch> 2>/dev/null || echo 0)
```

```
├── origin/<current-branch> 不存在（新分支未推送）→ 跳过自更新，直接跨分支同步
├── SELF_GAP = 0 → 默认跨分支同步（现有行为，零干扰）
└── SELF_GAP > 0 → 触发 H7 询问：
    「origin/<current> 有 N 个远端提交。你想要？
     (1) 先拉取远端提交，再同步基线（推荐）
     (2) 仅同步基线 origin/<base>
     (3) 仅拉取远端 origin/<current>
     (4) 取消」
```

> **设计理由**：solo 开发者的 SELF_GAP 几乎永远是 0，H7 不会触发，与现有行为完全一致。只有真正存在协作者提交时才询问——这时询问有实际价值。

### Step 1 — 检查工作目录状态

```bash
git status --short
```

- 工作目录干净 → 继续
- 有未提交修改 → **H1**（三选一）

### Step 2 — 获取远程最新状态

```bash
git fetch origin
```

> 若 Smart H7 已提前执行 fetch，此步跳过。

### Step 3 — 展示分歧信息 + 确认合并

```bash
# 基线分支有多少新提交
git rev-list --count HEAD..origin/<base>

# 当前分支领先多少提交
git rev-list --count origin/<base>..HEAD

# 展示即将合并的提交列表
git log --oneline HEAD..origin/<base>
```

**输出示例**：`develop 有 5 个新提交，你的分支领先 3 个提交。即将合并以下变更：...  是否继续合并？(Y/n)`

- **count = 0** → 告知「已是最新，无需同步」并结束
- **确认** → Step 4
- **取消** → 终止，告知「同步已取消，工作分支未变更」

### Step 4 — 执行合并

```bash
# 开发中同步模式
git merge origin/develop   # feature/bugfix/documentation/maintain 分支
git merge origin/main      # hotfix 分支

# Hotfix 回同步模式
git merge origin/main      # 在 develop 上执行

# 自更新模式
git merge origin/<current-branch>   # 任何分支
```

- 无冲突 → 自动完成，进入 Step 5
- 有冲突 → **H2**（Claude 提案 → 用户选择 → 执行）

### Step 5 — 同步后验证

```bash
git status --short
git log --oneline -3
```

**开发中同步模式**：

- 若 Step 1 使用了 stash → 执行 `git stash pop`
  - pop 产生冲突 → **H3**
- 输出 handoff：

```
同步完成 ✓ 可继续开发，完成后使用 mj-git-commit → mj-git-push。
```

**Hotfix 回同步模式（额外步骤）**：

```bash
# 推送 develop 到双端远程
git pushall
```

- 输出 handoff：

```
hotfix 修复已同步到 develop 并推送完成 ✓
```

**自更新模式**：

- main/develop 自更新 → **不** pushall（本地同步即可）
- 工作分支自更新 → **不** pushall（本地同步即可）
- 若 H7 选择了(1)「先拉取再同步基线」→ 自更新完成后继续跨分支同步流程（回到 Step 3）
- 输出 handoff：

```
自更新完成 ✓（已从 origin/<branch> 拉取最新提交）
```

---

## 人工介入场景（STOP & ASK）

以下场景必须暂停，等待用户明确决策后再继续：

| # | 触发条件 | 技能行为 | 级别 |
|---|---------|---------|------|
| **H1** | `git status` 显示有未提交修改 | ⚠️ 三选一：(1) 使用 mj-git-commit 提交 (2) `git stash` 暂存 (3) 取消同步 | Soft |
| **H2** | `git merge` 产生冲突 | ⚠️ Claude 提案→用户选择→执行（详见下方 H2 冲突解决流程） | Soft |
| **H3** | `git stash pop` 产生冲突 | ⚠️ 告知 stash 内容与合并结果冲突，需手动解决后执行 `git stash drop` | Soft |
| **H4** | 当前在 `main` 分支 + 跨分支合并意图 | 🚫 硬阻断：main 不允许跨分支 merge，告知需切换到工作分支或 develop | Hard |
| **H4a** | 当前在 `main` + 意图模糊 | ⚠️ 「你当前在 main 分支。是要从 origin/main 拉取最新（如 release PR 合并后更新本地），还是误操作了？」选项：(1) 自更新 origin/main (2) 取消 | Soft |
| **H4b** | 在 `develop` 但意图模糊 | ⚠️ 三选一：(1) 从 origin/develop 自更新 (2) Hotfix 回同步 merge main (3) 取消 | Soft |
| **H5** | 用户要求 rebase | ℹ️ 引导为 merge：「项目统一使用 merge 策略（团队协作安全 / 历史一致性 / 无需 force push），已改为 merge 执行。」 | Info |
| **H6** | 分支名前缀无法匹配已知类型 | ⚠️ 询问：「无法推导基线分支，请确认同步目标是 develop 还是 main？」 | Soft |
| **H7** | 工作分支 + 意图模糊 + SELF_GAP > 0 | ⚠️ 「origin/<current> 有 N 个远端提交。你想要？(1) 先拉取远端提交，再同步基线（推荐）(2) 仅同步基线 origin/<base> (3) 仅拉取远端 origin/<current> (4) 取消」 | Soft |

> **正常流程确认节点**：Step 3 末尾的「是否继续合并？」不属于 H-code，是常规交互确认。

---

### H2 冲突解决详细流程

> Claude 是「提案者」非「决策者」，每个冲突区域的最终方案需用户确认。

1. **展示冲突概况**（自动）：`git diff --name-only --diff-filter=U`，列出冲突文件
2. **🔴 人工选择**：(1) Claude 分析并提方案（推荐） (2) 用户自行解决 (3) 放弃合并 `git merge --abort`
3. **Claude 提案**（仅路径 1）：逐文件读取冲突区域，分析双方代码语义，提出解决方案并说明理由
4. **🔴 用户确认**：对每个冲突区域选择 接受 / 修改 / 跳过
5. **执行**：`git add <files>` → `git commit -m "merge: 合并 <base> 最新内容，解决冲突"`

**安全出口**：任何步骤说「放弃」→ `git merge --abort`，告知「合并已中止，工作分支恢复到同步前状态」。

---

## 安全规则

1. **禁止在 main 上跨分支 merge**：触发 H4 直接拒绝。自更新（origin/main → main）例外
2. **develop 上允许自更新和 hotfix 回同步**：自更新（origin/develop → develop）和 hotfix 回同步（origin/main → develop）均为合法操作。非上述两者触发 H4b 澄清意图
3. **merge 策略强制**：rebase 请求一律引导为 merge (H5)
4. **冲突解决中保护工作成果**：Claude 修改冲突文件前，先展示方案等用户确认

---

## 示例

### 示例 1：常规同步（无冲突）

```bash
# feature/mj-git-sync-skill worktree，基线 = develop
git branch --show-current    # → feature/mj-git-sync-skill
git status --short           # （干净）
git fetch origin
git rev-list --count HEAD..origin/develop    # → 3
git rev-list --count origin/develop..HEAD    # → 2
git log --oneline HEAD..origin/develop
# 「develop 有 3 个新提交，你的分支领先 2 个提交。是否继续合并？」→ 确认
git merge origin/develop     # fast-forward / merge commit
git status --short           # 空
# 同步完成 ✓ 可继续开发
```

### 示例 2：有未提交修改的同步（stash 路径）

```bash
git status --short
# M  src/.../service.py → H1 触发 → 用户选择 (2) stash
git stash push -m "sync: 暂存未提交修改"
# Step 2-4: fetch → 确认 → merge
git stash pop                # 无冲突 → 同步完成 ✓
```

### 示例 3：有冲突的同步（Claude 辅助解决）

```bash
git merge origin/develop
# CONFLICT → H2 触发
git diff --name-only --diff-filter=U   # 展示冲突文件
# 用户选 (1) Claude 分析 → Claude 提案 → 用户确认
git add <resolved-files>
git commit -m "merge: 合并 develop 最新内容，解决冲突"
# 同步完成 ✓
```

### 示例 4：Hotfix 回同步

```bash
# develop worktree，hotfix 已合并到 main
git branch --show-current    # → develop → Hotfix 回同步模式
git fetch origin
git rev-list --count HEAD..origin/main  # → 2
git log --oneline HEAD..origin/main
# 「main 有 2 个新提交（含 hotfix）。是否继续合并？」→ 确认
git merge origin/main
git pushall                  # 推送 develop 到 gitee + origin
# hotfix 修复已同步到 develop 并推送完成 ✓
```

### 示例 5：develop 自更新（PR 合并后同步）

```bash
# 当前在 develop worktree，PR 合并后需要拉取最新。用户说「从 origin 更新 develop」

# Step 0: 检测到"origin"→ 自更新模式，base = origin/develop

# Step 1-2: 检查 + fetch
git fetch origin

# Step 3: 展示分歧
git rev-list --count HEAD..origin/develop  # → 4
git log --oneline HEAD..origin/develop
#   abc1234 Merge pull request #45 from feature/add-user-auth
#   def5678 feat(auth): implement JWT-based authentication
#   ghi9012 feat(auth): add login endpoint
#   jkl3456 docs(auth): add API documentation
# 「origin/develop 有 4 个新提交。是否继续合并？」

# Step 4: 执行合并
git merge origin/develop

# Step 5: 验证（不 pushall）
git status --short
git log --oneline -3
# 自更新完成 ✓
```

### 示例 6：main 自更新（release PR 合并后打 tag）

```bash
# 当前在 main worktree，release PR 合并后需要更新本地。用户说「自更新 main」

# Step 0: 检测到"自更新"→ 自更新模式，base = origin/main（不触发 H4）

# Step 1-2: 检查 + fetch
git fetch origin

# Step 3: 展示分歧
git rev-list --count HEAD..origin/main  # → 3
git log --oneline HEAD..origin/main
#   abc1234 Merge pull request #50 from develop (Release v2.9.0)
#   def5678 infra(release): bump version to v2.9.0
#   ghi9012 docs: 整理 CHANGELOG v2.9.0
# 「origin/main 有 3 个新提交。是否继续合并？」

# Step 4: 执行合并
git merge origin/main

# Step 5: 验证（不 pushall）
git status --short
git log --oneline -3
# main 自更新完成 ✓ 可继续打 tag
```

### 示例 7：Smart H7 触发（协作者推了代码）

```bash
# 当前在 feature/xyz，协作者推了代码。用户说「同步一下」

# Step 0: 意图模糊 → 提前 fetch
git fetch origin
SELF_GAP=$(git rev-list --count HEAD..origin/feature/xyz)  # → 2

# → H7 触发：
# 「origin/feature/xyz 有 2 个远端提交。你想要？
#   (1) 先拉取远端提交，再同步基线（推荐）
#   (2) 仅同步基线 origin/develop
#   (3) 仅拉取远端 origin/feature/xyz
#   (4) 取消」

# → 用户选择 (1)

# Step 4a: 先 merge origin/feature/xyz
git merge origin/feature/xyz

# Step 3-4b: 再 merge origin/develop（回到跨分支同步流程）
git rev-list --count HEAD..origin/develop  # → 5
git log --oneline HEAD..origin/develop
# 「develop 有 5 个新提交。是否继续合并？」→ 确认
git merge origin/develop

# Step 5: 验证
git status --short
git log --oneline -3
# 同步完成 ✓ 已拉取远端提交 + 同步基线
```
