---
name: push
description: Use when ready to push code, running pre-push checks, setting up dual-push to Gitee and GitHub, troubleshooting push errors, or handling CHANGELOG updates in MJ System.
---

# MJ Git Push

## Overview

8-item pre-push checklist + dual-push execution (Gitee first, GitHub second) for MJ System. CI Runner cannot access GitHub directly — it pulls from Gitee mirror, so both remotes must receive every push.

> **前置技能**：`mj-git-commit` 已在提交阶段验证 commit message 格式和 type/branch 纪律。本技能的 Step 1-2 作为二次确认。

## Pre-Push Checklist (run in order)

```bash
# 1. Commit message format check
git log --oneline develop..HEAD
# Verify each: <type>(<scope>): <summary> — lowercase, space after colon, no period at end

# 2. Commit type matches branch type
# feature/* → feat/perf/refactor/test/docs only
# bugfix/*  → fix/test/docs only
# documentation/* → docs only
# maintain/* → infra/docs only
# hotfix/*  → fix only
# If mismatch: git commit --amend or interactive rebase before pushing

# 3. CHANGELOG check
git diff develop -- CHANGELOG.md
# Empty output + has feat/fix commits = missing CHANGELOG update
# Fix: edit CHANGELOG.md [Unreleased] block → git add CHANGELOG.md → git commit -m "docs: 补充 CHANGELOG 变更记录"

# 4. Clean working directory
git status --short
# Must be empty. If not: use mj-git-commit to stage and commit, or add to .gitignore

# 5. Validate branch name
git branch --show-current
# Must match: feature/<desc> | bugfix/<desc> | documentation/<desc> | maintain/<desc> | hotfix/<desc>

# 6. Sync base branch (详细流程见 mj-git-sync skill)
git fetch origin && git merge origin/develop   # regular branches
git fetch origin && git merge origin/main      # hotfix/* branches only
# Conflict? → git status → resolve → git add . → git commit -m "merge: 合并 develop 最新内容，解决冲突"
# Note: 自更新场景（origin/同名分支 → 本地）由 mj-git-sync 自更新模式覆盖，不在此步骤处理

# 7. Execute dual-push
# First push of this branch (set upstream):
git push -u gitee <branch> && git push -u origin <branch>
# Subsequent pushes (alias):
git pushall

# 8. Confirm remote received
git log origin/<branch> --oneline -3
```

## CHANGELOG Update Rules

| Commit Type | CHANGELOG Section | Record? |
|-------------|------------------|---------|
| `feat` | `### Added` | **Must record** |
| `fix` | `### Fixed` | **Must record** |
| `perf` | `### Changed` | **Must record** |
| `refactor` | `### Changed` | Only if user-visible |
| `infra` | `### Added` or `### Changed` | Only if significant infra change |
| `docs` | — | Skip |
| `test` | — | Skip |

Add entries under `## [Unreleased]` block in `CHANGELOG.md`.

## Dual-Push Setup

```bash
# One-time: add Gitee remote (if not already configured)
git remote -v   # check if gitee remote exists
git remote add gitee https://gitee.com/ranzuozhou/mj-system.git

# One-time: configure pushall alias
git config alias.pushall '!git push gitee HEAD && git push origin HEAD'

# First push of a new branch (needs -u to set upstream):
git push -u gitee <branch> && git push -u origin <branch>

# Subsequent pushes:
git pushall
```

**Order is mandatory**: Gitee first, GitHub second — CI pulls from Gitee mirror.

## Worktree Validation

**Push must happen from inside a worktree directory** — `mj-system/` root is a bare repo with no working tree, so `git push` from root will fail.

```bash
# Verify you're inside the correct worktree before pushing:
git worktree list          # shows all worktrees and their paths
pwd                        # confirm current directory
git branch --show-current  # confirm current branch

# Correct: push from inside a worktree
cd mj-system/feature/12-user-auth
git pushall

# Wrong: push from bare repo root (will fail — no working tree)
# cd mj-system   ← git push here fails
```

## Force Push (after amending)

```bash
# Only on personal dev branches, never on main or develop
git commit --amend -m "<corrected message>"
git push --force-with-lease   # safer than --force
```

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `rejected - non-fast-forward` | Remote has commits you don't | Run step 6: fetch + merge |
| `fatal: no upstream branch` | First push without `-u` | `git push -u gitee <branch> && git push -u origin <branch>` |
| `remote: Permission denied` | No write access | `gh auth status`, check GitHub permissions |
| `remote: Unauthorized` (Gitee) | Expired Gitee token | Check credential manager, re-authenticate |

## Common Issues → push-faq.md

Full troubleshooting for: missing Gitee push, force-push recovery, worktree confusion, CI failures, and pre-push hook setup in `push-faq.md`.
