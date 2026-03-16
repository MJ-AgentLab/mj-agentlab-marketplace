---
name: delete
description: Use when deleting branches, removing worktrees, or cleaning up after PR merge in MJ System. Triggers on 删除分支, 清理分支, branch cleanup, delete branch, worktree remove, PR 合并后清理, 分支已合并. Enforces correct deletion order (worktree → local branch → optional remote) with safety checks and human confirmation for all destructive steps.
---

# MJ Git Delete

## Overview

删除 MJ System 中的 Git 分支，支持 Bare Repo Worktree 模式下的安全清理流程。删除是不可逆操作，技能在每个关键节点都需要用户确认。

## 快速开始（交互模式）

### Step 0 — 确认分支名

若用户未提供分支名，先追问：

> 「要删除哪个分支？可先运行以下命令查看当前所有 worktree：」
>
> ```bash
> git worktree list
> ```

### Step 0.5 — 同步远程状态（自动执行）

在确认分支名后、询问删除范围前，自动执行：

```bash
git fetch origin --prune
git fetch gitee --prune 2>/dev/null || true
```

> 目的：确保本地远程追踪分支（origin/develop 等）是最新的，避免因本地过期状态误判合并情况。

### Step 1 — 确认删除范围（人工判断，必填）

分支名确认后，**必须询问**用户选择删除范围：

> 请选择删除范围：
>
> **1. 仅本地**：移除 worktree + 删除本地分支（保留远程，适合 PR 已合并、平台自动清理远程的情况）
>
> **2. 仅远程**：删除 Gitee 和 GitHub 上的远程分支，保留本地 worktree 和分支
>
> **3. 本地及远程**：完整清理 — 本地 worktree + 本地分支 + 双端远程全部删除
>
> （hotfix 分支合并后建议选 **3**，因为 hotfix 通常需要完整清理）

---

## 命令序列

### 选项 1：仅本地删除

```bash
# 必须从其他 worktree 内执行（如 develop/），不能在被删 worktree 内执行
git worktree remove ../<type>/<desc>
git branch -d <type>/<desc>
```

> 若 `git branch -d` 报错（含未合并提交）→ 见下方人工介入 **H2**

### 选项 2：仅远程删除（保留本地）

```bash
git push gitee --delete <type>/<desc>
git push origin --delete <type>/<desc>
```

### 选项 3：本地及远程（完整清理）

```bash
# Step 1: 移除 worktree（必须从其他 worktree 内执行）
git worktree remove ../<type>/<desc>

# Step 2: 删除本地分支
git branch -d <type>/<desc>

# Step 3: 删除双端远程（对应双推顺序）
git push gitee --delete <type>/<desc>
git push origin --delete <type>/<desc>
```

> **错误恢复规则（选项 3）**：
> - 三个 Step 应尽量按序执行，但 **每个 Step 失败不阻塞后续 Step**
> - Step 1（worktree remove）：若 git 元数据已移除但目录残留（Windows 文件锁常见），记录提示并**继续 Step 2、3**，不要反复尝试删除目录
> - Step 2（branch -d）：若触发 H2（未合并），按 H2 流程处理后继续 Step 3
> - Step 3（远程删除）：若触发 H4（远程不存在），按 H4 流程处理
> - 最终输出清理摘要，标记每个 Step 的完成状态：
>   ```
>   清理摘要：
>   ✅ Step 1: worktree 已移除（⚠️ 目录残留需手动清理: <path>）
>   ✅ Step 2: 本地分支已删除
>   ✅ Step 3: 远程分支已删除（gitee ✅ / origin ✅）
>   ```

---

## 人工介入场景（STOP & ASK）

以下 4 种情况必须暂停，等待用户明确决策后再继续：

| # | 触发条件 | 技能行为 |
|---|---------|---------|
| **H1** | `git status` 显示 worktree 内有未提交修改 | ⚠️ 展示 `git status` 输出，询问：「这些修改将永久丢失，是否确认继续删除？」 |
| **H2** | `git branch -d` 报错（含未合并提交） | ⚠️ 先执行 `git log -1 --format=%H <branch>` 获取分支末端提交，再运行 `git branch -r --contains <tip-commit> \| grep origin/develop` 检查远程是否已合并。**若远程已合并**：告知用户「提交已通过 PR 合并到 origin/develop，本地 develop 未同步导致误报，可安全使用 `-D` 删除」并自动执行 `-D`。**若远程也未合并**：展示错误信息，询问：「此分支有未合并提交，是否用 `-D` 强制删除？提交将永久丢失。」 |
| **H3** | 当前 shell 处于被删 worktree 目录内 | 🚫 暂停，告知需先切换目录，输出 `cd ../develop` 让用户执行后再继续 |
| **H4** | 远程分支不存在（push --delete 失败） | ℹ️ 告知远程分支不存在，询问：「是否继续完成本地清理？」 |

> **原则**：删除是不可逆操作，有任何不确定因素都应先暂停确认，而不是假设用户意图。

---

## 安全规则

1. **禁止删除受保护分支**：`main` 和 `develop` 不可删除，触发时直接拒绝并说明原因
2. **执行位置要求**：`git worktree remove` 必须在其他 worktree 目录内执行，不能在被删 worktree 内（→ H3）
3. **`-d` vs `-D`**：已合并分支用 `-d`（安全）；有未合并提交时才用 `-D`，且必须经过 H2 确认

---

## 示例

```bash
# 用户说：帮我删除 bugfix/verify-qcm-calculation-accuracy 分支

# Step 0: 技能输出确认命令
git worktree list
# 输出示例：
# D:/workspace/mj-system/.bare        (bare)
# D:/workspace/mj-system/develop      [develop]
# D:/workspace/mj-system/bugfix/verify-qcm-calculation-accuracy  [bugfix/verify-qcm-calculation-accuracy]

# Step 1: 询问删除范围 → 用户选择「本地及远程」

# Step 2: 输出命令（从 develop/ 内执行）
git worktree remove ../bugfix/verify-qcm-calculation-accuracy
git branch -d bugfix/verify-qcm-calculation-accuracy
git push gitee --delete bugfix/verify-qcm-calculation-accuracy
git push origin --delete bugfix/verify-qcm-calculation-accuracy
```
