---
name: mp-git-commit
description: Stages files and creates marketplace commits in the `<type>(<scope>): <summary>` format, enforcing the 7-type allowed list (feat/fix/perf/refactor/test/docs/infra), the marketplace scope whitelist, and the 6-branch × 7-type matrix discipline at commit time. Make sure to use this skill whenever the user says "git add", "git commit", "提交代码", "暂存文件", "commit message", "提交格式", "拆分提交", "准备提交", "stage files", "怎么写 commit", "提交规范", "marketplace commit", or after Stage 7 self-review has produced a GO recommendation and the changes need to be committed. Marketplace scope whitelist: plugin names (e.g., `learn-kit`), `marketplace`, `ci`, `scripts`, `deps`, `infra`, and (post-PR 2) `docs-rule` / `docs-adr` / `docs-guide` / `docs-runbook` / `docs-spec`. Pre-commit guard: rejects `.env`, `*.key`, `*.pem`, `secrets.enc`, `PR_BODY.md`, IDE caches; refuses commit on `main` or `develop` directly. Outputs the prepared commit message + ready-to-run `git add` + `git commit` commands; does NOT auto-execute — user reviews. Do not use for: branch creation (use mp-git-branch), push (use mp-git-push), PR creation (use mp-git-pr), or amending pushed commits.
---

# Marketplace Git Commit

## Overview

Stages files and creates commits compliant with marketplace commit message convention. 7-step Pre-Commit workflow covering file filtering / staging strategy / commit message format / 6-branch × 7-type discipline / scope deduction / split guidance. Bridges `/mp-git-branch` (creates the worktree) and `/mp-git-push` (pushes).

**Reference**: [[../../../docs/CONTRIBUTING.md|CONTRIBUTING]] § Commit Convention + (post-PR 2) `[STANDARD]_Commit_Message_Convention`.

**Workflow position**: Stage 8 step 1 of HITL Prompt 11-stage flow.

## Prerequisite

- 在 marketplace worktree 内执行（bare repo 根目录无 working tree）
- 当前分支为临时分支（feature/bugfix/documentation/maintain/hotfix/release），不在 `main` 或 `develop` 上直接提交

## 快速开始（交互模式）

| 已知信息 | 行动 |
|---|---|
| 用户说"提交"但未说明提交什么 | 跑 `git status --short`，展示修改列表，询问"全部提交还是部分？" |
| 有修改文件，但变更性质不明 | 询问："这次修改是 feat / fix / perf / refactor / docs / test / infra？" |
| 变更性质明确，未提供 scope | 从修改文件路径推断 scope（见 Step 3 推导表），不追问 |
| 信息完整 | 直接生成 commit 命令 |

## Pre-Commit Workflow（7 Steps）

### Step 1 — Verify Working Location

```bash
git branch --show-current
# 必须返回 feature/bugfix/documentation/maintain/hotfix/release 之一；
# 若 main / develop → STOP

git worktree list
# 确认在某个 worktree 内
```

### Step 2 — Review Changes & File Selection

```bash
git status --short
git diff             # 未暂存差异
git diff --cached    # 已暂存差异
```

**文件排除规则**:

| 模式 | 原因 | 发现后行为 |
|---|---|---|
| `.env` | 含敏感配置 | **HARD BLOCK** |
| `secrets.enc` 解密产物 | 团队口令解密的明文 | **HARD BLOCK** |
| `*.pem` / `*.key` / `*.p12` | 私钥 / 证书 | **HARD BLOCK** |
| `PR_BODY.md` | gh pr create 临时文件 | 不暂存 |
| 文件 > 10 MB | 大文件不宜入 git | 询问用户 |
| `__pycache__/` / `*.pyc` / `node_modules/` | 运行时产物 | 静默跳过 |
| `.claude/settings.local.json` | 个人配置（已 gitignore） | 静默跳过 |
| `.worktrees/` | bare repo worktree 目录 | 静默跳过 |
| IDE caches (`.idea/`, `.vscode/`, `.DS_Store`) | IDE 私有 | 静默跳过 |

**暂存策略**:

```bash
# 推荐：按文件名逐个暂存（最安全）
git add docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md

# 可接受：按目录暂存
git add .claude/skills/mp-flow-intake/

# 可接受：仅暂存已追踪修改
git add -u

# 避免：git add -A 或 git add .（会暂存所有未追踪文件）
```

### Step 3 — Compose Commit Message

**格式**: `<type>(<scope>): <summary>`

**规则**:
1. `type` ∈ `{feat, fix, perf, refactor, test, docs, infra}` (小写)
2. `scope` ∈ marketplace 闭合 allowlist (小写)
3. `:` 后加一个空格
4. `summary` 不以句号结尾，不超过 72 字符
5. 中英文均可

**Scope 推导**:

| 修改路径模式 | Scope |
|---|---|
| `plugins/learn-kit/**` | `learn-kit` |
| `.claude-plugin/marketplace.json` / `VERSION` / `CHANGELOG.md` (顶层) | `marketplace` |
| `.claude/skills/**` (项目本地工作流) | `marketplace`（跨多 skill 改）or 单 skill 用 `learn-kit` 视情 |
| `.github/workflows/` / PR templates / Issue templates | `ci` |
| `scripts/` | `scripts` |
| `package.json` / `pyproject.toml` / `uv.lock` | `deps` |
| `docs/` | `docs` (type=docs) + scope 按域选 (post-PR 2: `docs-rule` / `docs-adr` / `docs-guide` / `docs-runbook` / `docs-spec`) |
| Dockerfile / .gitignore / `.gitattributes` | `infra` |

> **重要**: scope 是闭合 allowlist；引入新 scope 必须修订 commit convention STANDARD（minor 版本号 bump）。

### Step 4 — Enforce Type/Branch Discipline

```bash
git branch --show-current
# 提取分支类型前缀
```

| 分支类型 | 允许的 Commit 类型 | 常见误用 |
|---|---|---|
| `feature/*` | `feat` / `perf` / `refactor` / `test` / `docs` | `fix` / `infra` |
| `bugfix/*` | `fix` / `test` / `docs` | `feat` / `infra` |
| `documentation/*` | `docs` 仅 | `feat` / `fix` |
| `maintain/*` | `infra` / `docs` | `feat` / `fix` |
| `hotfix/*` | `fix` 仅 | 其他 |
| `release/*` | `infra` | `feat` / `fix` |

误用举例:
- `feature/X` + `fix(...)` → 改用 `feat` 或拆 bugfix branch
- `documentation/X` + `feat(...)` → 改 type 或换 feature branch

### Step 5 — Body & Footer

```markdown
<type>(<scope>): <summary>

<body — explain WHY, not WHAT; max 72 char per line>

<footer:>
Refs: #<issue>
Closes: #<issue>
Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

Body 说 **why** (motivation, context, trade-off rationale)，不是 **what** (diff 已说明)。
Co-Authored-By 在 AI 协作时尾部加。

### Step 6 — Split Commit Decision

| 拆分指标 | 建议 |
|---|---|
| 改动 > 300 行 + > 5 文件 | 拆 |
| 混 feat + refactor | 拆 |
| 混 schema + app | 拆 |
| 不同 scope | 拆 |
| 同 scope, < 5 文件, < 100 行 | 单 commit OK |
| code + 配对 unit test | 一起（不拆） |

合理拆分顺序: contract/schema → code → tests → docs → infra。

### Step 7 — Execute

```bash
# 单 commit
git commit -m "$(cat <<'EOF'
<type>(<scope>): <summary>

<body>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"

# 多 commit（按 Step 6 顺序逐条执行）
```

不用 `--no-verify` / 不绕过 pre-commit hook。

## Output Format

```markdown
## Commit Plan

### Working Location
- worktree: feature-X/
- branch: feature/X
- pass G1 check ✅

### File Selection
| File | Action | Note |
|---|---|---|
| .claude/skills/mp-flow-intake/SKILL.md | stage | new file |
| docs/[STANDARD]_AI_Eng*.md | stage | modified §4.1 |
| ... |

(excluded: PR_BODY.md, .claude/settings.local.json)

### Commit Message
```
<type>(<scope>): <summary>

<body>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

### Type × Branch Verify
- branch type: feature/
- commit type: docs
- ✅ valid (feature/* 允许 docs)

### Ready Commands
```bash
git add <file1> <file2> ...
git commit -m "$(cat <<'EOF'
...
EOF
)"
```

### Split Decision
- Single commit / N commits ordered: <list>

### Next Step
- 用户确认 → run commands
- 完成后 → /mp-git-push (Stage 8 step 2)
```

## What This Skill DOES NOT DO

- ❌ 不创建分支（用 `/mp-git-branch`）
- ❌ 不 push（用 `/mp-git-push`）
- ❌ 不创建 PR（用 `/mp-git-pr`）
- ❌ 不 amend pushed commit（手工 interactive rebase 处理）
- ❌ 不用 `--no-verify`

## Sub-skill / Tool Calls

| Tool | 用途 |
|---|---|
| Bash (`git status` / `git diff` / `git add` / `git commit`) | 主流程 |
| Bash (`git branch --show-current`) | Step 1 |
| Bash (`git worktree list`) | Step 1 |

## Reference Files

- [[../../../docs/CONTRIBUTING.md|CONTRIBUTING]] § Commit Convention
- (post-PR 2) `docs/rule/[STANDARD]_Commit_Message_Convention.md`
- [[../../../docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt|HITL Standard]] §4.9

## Anti-patterns

- **不要** 在 main / develop 上直接 commit
- **不要** 用 `git add -A` / `git add .`（覆盖未追踪文件，含可能漏掉的本地文件）
- **不要** commit `.env` / `*.key` / `secrets.enc` / `PR_BODY.md`
- **不要** body 说 what（diff 已说）— 说 why
- **不要** type/scope 推断失误 → 跑 Step 4 verify

## Handoff to Next Stage

```text
Commit(s) created
→ /mp-git-push (Stage 8 step 2)
```
