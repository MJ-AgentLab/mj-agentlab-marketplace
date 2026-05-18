---
name: mp-git-branch
description: Creates and manages Git branches for mj-agentlab-marketplace using the bare-repo + worktree-per-branch convention — 6 temporary branch types (feature/bugfix/documentation/maintain/hotfix/release) plus 2 protected permanent branches (main, develop), with worktree directories as siblings of `develop/`. Make sure to use this skill whenever the user says "创建分支", "新建分支", "开新分支", "create branch", "new branch", "branch naming", "worktree add", "哪种分支类型", "which branch type", "开始开发", "start feature", "start bugfix", "start hotfix", "start release", or asks to set up a Git worktree for marketplace work. HARD REQUIREMENT G1: new branches MUST use `git worktree add` from the bare repo / develop worktree — never `git checkout -b` or `git switch -c` in an existing worktree, which leaves the bare repo without a clean lineage. release/* branches base on develop and target main; hotfix/* branches base on main. Outputs the single-line worktree-add command and verifies the worktree path doesn't already exist. Do not use for: GitHub Issue creation, commit (use mp-git-commit), push (use mp-git-push), PR creation (use mp-git-pr), branch deletion (use mp-git-cleanup), or merge-gate check (use mp-git-merge-gate).
---

# Marketplace Git Branch

## Overview

Creates and manages Git branches for **mj-agentlab-marketplace** following the project's bare-repo + worktree-per-branch convention. **6 temporary branch types** (per `docs/guide/[GUIDE]_Contributing.md`):

| Type | Base | Target | Purpose |
|---|---|---|---|
| `feature/*` | develop | develop | 新 plugin / 新 skill / 重构 |
| `bugfix/*` | develop | develop | develop 上发现的 bug |
| `documentation/*` | develop | develop | 仅文档变更 |
| `maintain/*` | develop | develop | CI/CD / scripts / deps / Docker |
| `hotfix/*` | main | main | 生产紧急 |
| `release/*` | develop | main | 发版 PR |

Plus 2 protected permanent branches (`main`, `develop`).

**Workflow position**: Stage 8 pre-step of HITL Prompt 11-stage flow (after Stage 7 self-review GO, before Stage 8 commit).

## HARD REQUIREMENT — G1: 新分支必须 `git worktree add`

新分支用:

```bash
git worktree add ../<dir-name> -b <branch-name> <base>
```

**禁止** 在已有 worktree（`develop/`、`feature-X/` 等）中 `git checkout -b` / `git checkout -B` / `git switch -c` / `git switch -C`。bare repo + worktree 模型下 working tree 是独立目录，checkout 会破坏状态机。

钩子 (post-PR 1 可选) `.claude/scripts/guard-git-workflow.ps1` 在 PreToolUse 拦截 `git checkout -b`。

## Prerequisite Check

```bash
# 当前在 marketplace 仓内（任一 worktree）
git rev-parse --git-common-dir
# 期望返回 ../.bare 路径（marketplace 用 bare repo）

# 工作树干净
git status --short
# 干净时输出空；有未提交变更建议先 commit / stash 再切分支

# 上游已 fetch 最新
git fetch origin
git log origin/develop -1 --oneline
```

## 快速开始（交互模式）

| 已知信息 | 行动 |
|---|---|
| 任务性质不明确 | 问："新功能 / bug 修复 / 纯文档 / 基础设施 / 生产紧急 / 发版?" |
| 类型明确，但无英文描述词 | 问："请用 2-5 个英文单词描述任务（kebab-case，e.g. `hitl-skill-integration` / `fix-plugin-json-repo-string`）" |
| 类型 + 描述词均有，缺 issue-id | 直接生成（issue-id 可选） |
| 信息完整 | 直接生成命令 |

### 输出格式（信息收集完毕后，**只输出单行命令**）

```bash
# feature / bugfix / documentation / maintain（从 develop 内执行）
cd D:/workspace/10-software-project/projects/mj-agentlab-marketplace/develop && \
  git worktree add ../<type-dir>/<desc> -b <type>/<desc> develop

# 注意：worktree 目录名用 hyphen 替代 slash，避免文件系统问题
# 推荐命名: feature-<desc>/ 单层平铺
cd D:/workspace/10-software-project/projects/mj-agentlab-marketplace/develop && \
  git worktree add ../feature-<desc> -b feature/<desc> origin/develop
```

```bash
# hotfix（从 main 创建；若 main worktree 不存在则先建）
cd D:/workspace/10-software-project/projects/mj-agentlab-marketplace
[ ! -d main ] && git worktree add main main
cd main && git worktree add ../hotfix-<desc> -b hotfix/<desc> origin/main
```

```bash
# release（从 develop 创建，target main）
cd D:/workspace/10-software-project/projects/mj-agentlab-marketplace/develop && \
  git worktree add ../release-v<X.Y.Z> -b release/v<X.Y.Z> origin/develop
```

**示例**:

```bash
# feature
cd D:/workspace/10-software-project/projects/mj-agentlab-marketplace/develop && \
  git worktree add ../feature-hitl-skill-integration -b feature/hitl-skill-integration origin/develop

# documentation
cd D:/workspace/10-software-project/projects/mj-agentlab-marketplace/develop && \
  git worktree add ../documentation-frontmatter-retrofit -b documentation/frontmatter-retrofit origin/develop

# release
cd D:/workspace/10-software-project/projects/mj-agentlab-marketplace/develop && \
  git worktree add ../release-v4.1.0 -b release/v4.1.0 origin/develop
```

## Branch Type Decision Tree

| 问题 | → Branch Type |
|---|---|
| 新 plugin / 新 skill / 新文档结构 / 重构? | `feature/` |
| develop 上发现 bug，需要修? | `bugfix/` |
| 仅文档变更，无 plugin/skill 改动? | `documentation/` |
| 文档与代码同 PR? | 跟代码类型（`feature/` 或 `maintain/`） |
| CI / scripts / deps / Docker? | `maintain/` |
| 生产紧急修复? | `hotfix/`（base = main） |
| Develop → main release? | `release/v<X.Y.Z>`（base = develop） |

> `CHANGELOG.md` 不单独开分支；属于 release 流程的一部分。

## Naming Format

```
<type>/<issue-id>-<description>   # 与 GitHub Issue 关联
<type>/<description>              # 无 Issue（也合法）
```

合法 type: `feature` / `bugfix` / `documentation` / `maintain` / `hotfix` / `release`

规则: lowercase，仅字母数字 + 连字符 `-`；no spaces / uppercase。

Worktree 目录名约定: `<type>-<description>` (替换 `/` 为 `-`)。

## Verify Worktree Created

```bash
git worktree list
# 期望看到新增的 <type-dir>/ 一行

cd <new-worktree>
git branch --show-current
# 期望返回 <type>/<description>

git status
# 期望: On branch <type>/<description> + nothing to commit
```

## Output Format

```markdown
## Branch Creation

### Branch Type Decision
- Type: feature / bugfix / documentation / maintain / hotfix / release
- Base: develop / main
- Target: develop / main

### Command (single-line, ready to run)
```bash
cd D:/workspace/10-software-project/projects/mj-agentlab-marketplace/develop && \
  git worktree add ../<type>-<desc> -b <type>/<desc> origin/<base>
```

### Verification
```bash
cd D:/workspace/10-software-project/projects/mj-agentlab-marketplace/<type>-<desc>
git branch --show-current
git status
```

### Next Step
- cd into the new worktree
- 开始 Stage 1+ 工作（Repo Scan 或直接编辑）
```

## What This Skill DOES NOT DO

- ❌ 不创建 GitHub Issue（用 `gh issue create`）
- ❌ 不 commit（用 `/mp-git-commit`）
- ❌ 不 push（用 `/mp-git-push`）
- ❌ 不创建 PR（用 `/mp-git-pr`）
- ❌ 不删 branch / worktree（用 `/mp-git-cleanup`）
- ❌ 不允许 `git checkout -b` 或 `git switch -c`（G1 hard requirement）

## Sub-skill / Tool Calls

| Tool | 用途 |
|---|---|
| Bash `git worktree add` | 创建 worktree + branch |
| Bash `git rev-parse --git-common-dir` | 确认 bare repo 配置 |
| Bash `git status` | 工作树清洁检查 |
| Bash `git fetch origin` | 拉最新 base |

## Reference Files

- [[../../../CONTRIBUTING.md|CONTRIBUTING]] (branch strategy + worktree)
- [[../../../docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt|HITL Standard]] §3 + §4.9 (branch type 矩阵)

## Anti-patterns

- **不要** 用 `git checkout -b` / `git switch -c`（G1 hard requirement）
- **不要** worktree 目录名带 `/`（用 hyphen 替代）
- **不要** 直接在 main / develop 上 commit（必经过 PR + 中间分支）
- **不要** 从 develop 直接 hotfix（hotfix 必 base on main）
- **不要** 跳过 `git fetch origin`（worktree 创建可能 base on stale local）

## Handoff to Next Stage

```text
worktree + branch created
cd into the new worktree:
  → 开始 Stage 1 /mp-flow-repo-scan (if needed)
  → 或直接 Stage 4 /mp-flow-author (按 Plan 实施)
  → 完成后 → /mp-git-commit (Stage 8)
```
