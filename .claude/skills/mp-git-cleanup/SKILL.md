---
name: mp-git-cleanup
description: Cleans up local Git state after a marketplace PR merges — removes the feature worktree via `git worktree remove` (not `rm -rf` which leaves stale metadata in the bare repo), deletes the local branch via `git branch -D` (safe because already merged), runs `git fetch --tags` to retrieve any tag created by release.yml, and verifies the develop worktree is up-to-date. Make sure to use this skill whenever the user says "cleanup", "post merge cleanup", "remove worktree", "delete branch", "PR merged 清理", "Stage 10 cleanup", "merge 后清理", or after `/mp-git-merge-gate` decision is acted on and the PR has been merged. Refuses to remove the `develop` or `main` worktree (those are protected). Outputs the cleanup command sequence + verification commands; does NOT auto-execute — user reviews. Do not use for: branch creation (use mp-git-branch), commit (use mp-git-commit), PR creation (use mp-git-pr), or release verification (use mp-flow-post-merge which calls this skill).
---

# Marketplace Git Cleanup

## Overview

Post-merge local cleanup. Removes worktree + deletes branch + fetches tags. Refuses to touch `develop` / `main` worktrees.

**Reference**: [[../../../docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt|HITL Standard]] §4.11 + [[../../../docs/guide/[GUIDE]_Contributing.md|GUIDE_Contributing]].

**Workflow position**: Stage 10 substep of HITL Prompt 11-stage flow.

## Workflow

```dot
digraph cleanup {
  rankdir=TB;
  start [label="PR merged + want to cleanup local" shape=doublecircle];

  s1 [label="Step 1: Identify worktree + branch" shape=box];
  s2 [label="Step 2: Verify branch is merged" shape=diamond];
  s3 [label="Step 3: Verify NOT develop/main" shape=diamond];
  s4 [label="Step 4: cd out of worktree if currently in it" shape=box];
  s5 [label="Step 5: git worktree remove" shape=box];
  s6 [label="Step 6: git branch -D" shape=box];
  s7 [label="Step 7: git fetch --tags" shape=box];

  done [label="Cleanup complete" shape=doublecircle];
  stop [label="STOP: protected branch" shape=doublecircle];

  start -> s1 -> s2;
  s2 -> stop [label="NOT merged"];
  s2 -> s3 [label="merged"];
  s3 -> stop [label="develop/main"];
  s3 -> s4 [label="ok"];
  s4 -> s5 -> s6 -> s7 -> done;
}
```

## Step 1: Identify Worktree + Branch

```bash
# 用户告知 PR number 或 branch 名
PR=<number>
branch=$(gh pr view $PR --json headRefName -q '.headRefName')

# 或: 直接告知 branch
branch=<branch-name>

# 找对应 worktree
git worktree list | grep "$branch"
# 期望输出: <path> <commit> [<branch>]
worktree_path=$(git worktree list --porcelain | awk -v b="refs/heads/$branch" '$1=="worktree" {p=$2} $1=="branch" && $2==b {print p}')
echo "$worktree_path"
```

## Step 2: Verify Branch is Merged

```bash
# 切到 develop（或对应 base）
cd D:/workspace/10-software-project/projects/mj-agentlab-marketplace/develop
git pull origin develop

# 验证 branch 已 merged
git branch -a --merged | grep -q "$branch" && echo "merged" || echo "NOT merged"

# 或：用 gh
gh pr view $PR --json state -q '.state'
# 期望 "MERGED"
```

如 `NOT merged` → STOP，不删（可能 PR closed without merge / 错 PR）。

## Step 3: Verify NOT develop/main

```bash
echo "$branch" | grep -Eq '^(main|develop)$' && echo "PROTECTED — DO NOT DELETE" && exit 1
```

Hard refuse to remove main / develop worktrees and branches.

## Step 4: cd Out of Worktree

```bash
# 如当前 PWD 在待删 worktree 内
cwd=$(pwd)
case "$cwd" in
  "$worktree_path"*) cd D:/workspace/10-software-project/projects/mj-agentlab-marketplace/develop ;;
esac
```

否则 `git worktree remove` 会失败 "working tree contains modifications" or "is currently checked out by your shell"。

## Step 5: Remove Worktree

```bash
git worktree remove "$worktree_path"
# 期望: silently success；目录从文件系统消失
```

如失败（"contains modified or untracked files"）:
```bash
# 先检查是否真有未提交内容（worktree 可能有 PR_BODY.md 遗留）
ls "$worktree_path"
# 如确认无价值，强制:
git worktree remove --force "$worktree_path"
```

⚠️ **NEVER** 用 `rm -rf "$worktree_path"`，会在 bare repo 留下 stale metadata（`.bare/worktrees/<name>/`）。

## Step 6: Delete Local Branch

```bash
git branch -D "$branch"
# -D = force delete; 安全因为 branch 已 merged (Step 2 验证)
```

不删 remote branch (让 GitHub 保留 history)。

## Step 7: Fetch Tags

```bash
git fetch --tags
# 取 release.yml 新建的 tag（如 release PR）
git tag -l "v$(cat VERSION)"   # 验证当前版本 tag 存在
```

仅 release PR 后才会有新 tag；其他 PR 这一步是 no-op，但仍跑（确保本地 tag 索引与 remote 同步）。

## Bulk Cleanup Mode

> [!IMPORTANT]
> Single-PR cleanup (Steps 1-7 above) 处理一个 worktree 一次。当用户说 **"bulk cleanup" / "清理一批分支" / "post-multi-release cleanup" / "清所有 merged 分支"** 时，进入本 mode —— 它有 3 个非显然的 trap，必须显式处理，否则会误删 protected branch 或漏删 remote。

### 何时进入

- 累积多个 cycle 后批量清残余（典型：>5 分支待删）
- 项目刚启用 GitHub `delete_branch_on_merge=true` 前留下的孤儿
- audit 报告 / 用户明确要求批量

### 3 Traps（必读，含 2026-05-18 incident 实证）

完整事故分析见 [`../../../docs/postmortem/[POSTMORTEM]_2026-05-18_Bulk_Cleanup_Trap_Analysis.md`](../../../docs/postmortem/[POSTMORTEM]_2026-05-18_Bulk_Cleanup_Trap_Analysis.md)。

#### Trap #1：`git branch` 输出前缀 `+` 漏过滤

Bare repo + worktree 模式下，`git branch` 输出前缀有 3 种：

| Prefix | 含义 |
|--------|------|
| `  ` (2 空格) | 普通本地分支 |
| `* ` | 当前 worktree 当前分支 |
| `+ ` | **被另一个 worktree 占用**（含 `.bare/` 持有 `main`） |

错误写法（会漏 `+ main`）:

```bash
git branch --merged develop | grep -v -E '^\s*\*?\s*(main|develop)$' | xargs git branch -d
# `+ main` 不匹配 → 泄漏到 xargs → `git branch -d + main` → 误删 main
```

正确写法：

```bash
git branch --merged develop | grep -v -E '^[ *+] +(main|develop)$' | xargs -r git branch -d
# [ *+] 字符类覆盖全部 3 种前缀
```

更稳：

```bash
git for-each-ref refs/heads/ --format='%(refname:short)' | grep -v -E '^(main|develop)$' | xargs -r git branch -d
# for-each-ref 输出无 prefix
```

如果不小心删了 `main` / `develop`：`git branch <name> origin/<name>` 即刻恢复（commit 历史 + remote 不受影响）。

#### Trap #2：Local 删 ≠ Remote 删

`git branch -d` **只删本地**。远端 ref 必须显式 `git push origin --delete <name>` 或依赖 GitHub `delete_branch_on_merge=true` repo setting。

**v4.6.2+ 现状**：marketplace 已启用 `delete_branch_on_merge=true`，**single-PR merge 后 head 分支自动删**，无需手动 push --delete。

**Bulk mode 例外**：清历史遗留孤儿（GitHub 设置启用之前累积的）仍需手动:

```bash
# 列 remote 孤儿（已不在 local 但仍在 origin）
git fetch --prune origin
git branch -r | grep -v -E '(HEAD|origin/(main|develop)$)' | sed 's|origin/||' | tr -d ' '

# 批量删
git branch -r | grep -v -E '(HEAD|origin/(main|develop)$)' | sed 's|origin/||' | tr -d ' ' | xargs -r -I {} git push origin --delete {}
```

不要假设 "audit 显示 local + remote 同名 = 删 local 就够"；必须独立确认 remote 状态。

#### Trap #3：Windows Git Bash 的 `gh api` leading-slash 改写

MSYS2 path translation 把任何以 `/` 开头的 CLI 参数视为 POSIX 路径并改写为 Windows 路径。

错误（Git Bash 报 `invalid API endpoint: "C:/Program Files/Git/repos/..."`）:

```bash
gh api -X PATCH /repos/owner/repo -f delete_branch_on_merge=true
```

正确（去 leading slash）:

```bash
gh api -X PATCH repos/owner/repo -f delete_branch_on_merge=true
```

影响所有带 leading-slash endpoint 的 `gh api` 调用（含 GET）。Linux/macOS 上 leading slash 仍可用，但**统一去掉是更安全的写法**。

### Pre-flight 4-check（执行前必跑）

```bash
# 1. 未合并分支必须为空
git branch --no-merged develop
# 空 → OK；非空 → STOP 排查 unmerged 工作

# 2. 无 open PR
gh pr list -R MJ-AgentLab/mj-agentlab-marketplace --state open
# 空 → OK；非空 → STOP，等 PR 合并或关闭

# 3. worktree 仅 protected
git worktree list
# 期望仅 .bare + develop；额外 worktree → 先 single-PR cleanup 它们

# 4. dry-run 候选列表（先 cat，不要直接 xargs）
git for-each-ref refs/heads/ --format='%(refname:short)' | grep -v -E '^(main|develop)$' | tee /tmp/candidates.txt
wc -l /tmp/candidates.txt
# 肉眼扫描确认无 main/develop 泄漏
```

任一不符 → 立即 STOP，不进入删除阶段。

### 推荐工具：`scripts/safe-bulk-cleanup.ps1`

项目自带的安全 bulk cleanup 脚本，封装上述 pre-flight 4-check + Trap-aware 删除 + dry-run-default + 多重 protected-branch refusal。

```powershell
# Dry-run（默认；不删任何东西，仅输出候选清单 + 预期命令）
pwsh ./scripts/safe-bulk-cleanup.ps1

# 删本地候选
pwsh ./scripts/safe-bulk-cleanup.ps1 -Apply

# 删本地 + remote 孤儿
pwsh ./scripts/safe-bulk-cleanup.ps1 -Apply -IncludeRemote
```

详见 script 自带 `.SYNOPSIS` + `.DESCRIPTION`。

## Output Format

```markdown
## Cleanup Plan

### Identified
- PR: #<NN>
- Branch: feature/X
- Worktree: D:/workspace/.../feature-X

### Pre-checks
| Check | Result |
|---|---|
| Branch merged | ✅ MERGED (gh pr view) |
| NOT develop/main | ✅ feature/X |
| current PWD | not in worktree (or cd-out planned) |

### Ready Commands
```bash
cd D:/workspace/10-software-project/projects/mj-agentlab-marketplace/develop
git worktree remove ../feature-X
git branch -D feature/X
git fetch --tags
git tag -l "v$(cat VERSION)"
```

### Verification
```bash
git worktree list   # 期望: ../feature-X 已不在列表
git branch -a       # 期望: feature/X 仅 remotes/origin/feature/X
git tag -l          # 期望: 含新 tag (if release PR)
```

### Post-cleanup
- 当前 worktree: develop/ (干净)
- 准备下一任务: /mp-flow-intake 或继续待办

### HITL Questions (if 异常)
<§3.3 格式>
```

## What This Skill DOES NOT DO

- ❌ Single-PR mode 不显式删 remote branch（v4.6.2+ GitHub `delete_branch_on_merge=true` 已 cover 自动删；Bulk mode 例外见上 §Bulk Cleanup Mode → Trap #2）
- ❌ 不删 develop / main worktree
- ❌ 不 `rm -rf` worktree（用 `git worktree remove`）
- ❌ 不删未合并 branch（除非用户强烈确认 + force flag）
- ❌ 不删 tag

## Sub-skill / Tool Calls

| Tool | 用途 |
|---|---|
| Bash `git worktree list` / `git worktree remove` | Steps 1, 5 |
| Bash `git branch -D` | Step 6 |
| Bash `git fetch --tags` / `git tag -l` | Step 7 |
| Bash `gh pr view` | Step 2 验证 merged |

## Reference Files

- [[../../../docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt|HITL Standard]] §4.11
- [[../../../docs/guide/[GUIDE]_Contributing.md|GUIDE_Contributing]] (worktree 模式)

## Anti-patterns

- **不要** 用 `rm -rf <worktree>` （留 stale metadata 在 bare repo `.bare/worktrees/<name>/`）
- **不要** 删 develop / main worktree
- **不要** `git branch -D` 未合并 branch（先 `gh pr view` 确认 MERGED）
- **不要** 跳 `git fetch --tags`（错过 release.yml tag）
- **(Bulk mode)** **不要** 用 `\s*\*?` 过滤 git branch 输出 — 会漏 `+ main` 前缀；用 `[ *+]` 字符类或 `git for-each-ref`（详 §Bulk Cleanup Mode → Trap #1）
- **(Bulk mode)** **不要** 假设删 local 就等于删 remote — 两者独立 ref 命名空间，需单独 `git push origin --delete` 或依赖 GitHub auto-delete 设置（详 §Bulk Cleanup Mode → Trap #2）
- **(Windows)** **不要** 给 `gh api` endpoint 加 leading slash — Git Bash MSYS 改写会破坏 endpoint（详 §Bulk Cleanup Mode → Trap #3）

## Handoff to Next Stage

```text
Cleanup complete
→ /mp-flow-post-merge (Stage 10 orchestrator) 闭环
→ 或 STOP, 任务完成
```
