---
name: mj-git-pr
description: This skill should be used when the user asks to create a Pull Request, select a PR template, fill PR fields, choose a deploy strategy for test environment, bump version numbers, or perform a release for MJ System. Triggers on "创建PR", "新建PR", "提PR", "create PR", "pull request", "PR模板", "deploy strategy", "版本号", "发版", "release", "合并到main", "merge to main". Uses gh CLI with --body-file and the correct template per branch type.
---

# MJ Git PR

## Overview

Creates Pull Requests for MJ System using the correct template per branch type. Never inline PR body with `--body`; in non-interactive mode (Claude Code CLI), use `--body-file` with the filled template. 6 templates, 6 branch types, 2 target branches.

## Template Selection Matrix

| Template | Branch | Target | Special |
|----------|--------|--------|---------|
| `feature.md` | `feature/*` | develop | — |
| `bugfix.md` | `bugfix/*` | develop | — |
| `documentation.md` | `documentation/*` | develop | — |
| `maintain.md` | `maintain/*` | develop | — |
| `hotfix.md` | `hotfix/*` | **main** | Rollback plan mandatory |
| `release.md` | develop | **main** | Version bump required |

Templates are in `.github/PULL_REQUEST_TEMPLATE/`.

## Deploy Strategy Injection（PR 目标为 develop 时）

当 PR 目标分支为 `develop`（即 feature/*/bugfix/*/documentation/*/maintain/* 分支）时，在创建 PR 前执行以下步骤。这一步很重要，因为 PR 合并到 develop 会触发测试环境 CI 部署——策略关键词写入 PR title 后，通过 Merge Commit 传递给 CI 的 `detect-strategy` job。

### Step 1: 分析变更，生成推荐

检查本分支相对 develop 的变更，判断是否涉及数据库结构变化。只检测以下两类路径：
- **基线 SQL**：`sql/00-global/`、`sql/10-ops/`、`sql/20-biz/`（数据库 schema 定义）
- **Flyway 迁移**：`sql/migrations/`（增量迁移脚本）

其他 `sql/` 路径（如 `sql/README.md`、`sql/scripts/`）不影响部署策略，与 CI `detect-strategy` 行为一致。

```bash
CHANGED=$(git diff --name-only develop..HEAD)
HAS_BASELINE=$(echo "$CHANGED" | grep -qE '^sql/(00-global|10-ops|20-biz)/' && echo "true" || echo "false")
HAS_MIGRATION=$(echo "$CHANGED" | grep -q '^sql/migrations/' && echo "true" || echo "false")

if [[ "$HAS_BASELINE" == "true" && "$HAS_MIGRATION" == "false" ]]; then
  RECOMMEND="partial-reset"
  REASON="检测到基线 SQL 变更（sql/00-global|10-ops|20-biz），需要完整重建"
elif [[ "$HAS_MIGRATION" == "true" && "$HAS_BASELINE" == "false" ]]; then
  RECOMMEND="hot-restart"
  REASON="仅 Flyway 迁移文件变更（sql/migrations/），Flyway 将增量执行，零数据丢失"
elif [[ "$HAS_BASELINE" == "true" && "$HAS_MIGRATION" == "true" ]]; then
  RECOMMEND="hot-restart"
  REASON="基线 + 迁移双轨同步变更；已有环境由 Flyway 增量迁移处理，基线变更在全新初始化时生效"
else
  RECOMMEND="hot-restart"
  REASON="仅代码/文档变更"
fi
```

### Step 2: 询问用户（AskUserQuestion）

根据推荐结果展示不同选项（推荐项置于首位，标记 "(Recommended)"）：

**场景 A：无 SQL 变更（推荐 hot-restart）**

| 选项 | 说明 |
|------|------|
| hot-restart (Recommended) | 仅重启 mj-app，保留数据库卷（~2 min） |
| partial-reset | 销毁卷 + 局部 ODS 冷启动（~5-10 min） |
| full-reset | 销毁卷 + 全量 ODS 冷启动（~35 min） |

**场景 B：仅基线 SQL 变更（推荐 partial-reset）**

| 选项 | 说明 |
|------|------|
| partial-reset (Recommended) | 销毁卷 + 局部 ODS 冷启动（~5-10 min） |
| full-reset | 销毁卷 + 全量 ODS 冷启动（~35 min，仅大规模 schema 重构时需要） |
| hot-restart | 仅重启 mj-app，不重建数据库（⚠️ SQL 变更可能不生效） |

**场景 C：仅 Flyway 迁移变更（推荐 hot-restart）**

| 选项 | 说明 |
|------|------|
| hot-restart (Recommended) | 重启容器 + Flyway 增量迁移，零数据丢失（~2 min） |
| partial-reset | 销毁卷 + 局部 ODS 冷启动（~5-10 min，测试数据会丢失） |
| full-reset | 销毁卷 + 全量 ODS 冷启动（~35 min） |

**场景 D：基线 + 迁移双轨变更（推荐 hot-restart）**

> ⚠️ **注意**：检测到基线 SQL 和 Flyway 迁移同时变更。请确认基线变更已有对应 migration 文件覆盖，否则已有环境可能与基线不一致。

| 选项 | 说明 |
|------|------|
| hot-restart (Recommended) | 重启容器 + Flyway 增量迁移；基线变更仅影响全新初始化，已有环境零数据丢失（~2 min） |
| partial-reset | 销毁卷 + 局部 ODS 冷启动（~5-10 min，测试数据会丢失；仅在需要验证全新初始化流程时选择） |
| full-reset | 销毁卷 + 全量 ODS 冷启动（~35 min） |

### Step 3: 注入 PR Title

- 若用户选择 `partial-reset` 或 `full-reset`：在 PR title 末尾追加关键词
  - 例：`feat(qcm): 新增指标计算 [partial-reset]`
- 若用户选择 `hot-restart`（默认）：**不追加关键词**（CI auto-detect 默认为 hot-restart）

### 不触发条件

- PR 目标为 `main`（hotfix/*, release）→ 不询问，不注入

## Command Format

Claude Code CLI 为非交互模式，`--template` 单独使用时会报错（需要终端交互打开编辑器）。
正确流程：**读取模板 → 填写内容 → 写入临时文件 → `--body-file` 传入**。

```bash
# Step 1: 读取对应模板
# .github/PULL_REQUEST_TEMPLATE/<type>.md

# Step 2: 填写完内容后写入临时文件
# Windows: C:\Users\<user>\AppData\Local\Temp\pr-body-<branch>.md

# Step 3: 创建 PR
# Standard branches (feature/bugfix/documentation/maintain)
gh pr create \
  --base develop \
  --head <branch-name> \
  --title "<PR title>" \
  --body-file <tmp-file> \
  --reviewer "<PM-username>"

# Hotfix — target is main
gh pr create \
  --base main \
  --head hotfix/<desc> \
  --title "fix(<scope>): <summary>" \
  --body-file <tmp-file> \
  --reviewer "<PM-username>"

# Release
gh pr create \
  --base main \
  --head develop \
  --title "Release vX.Y.Z" \
  --body-file <tmp-file> \
  --reviewer "<reviewer-username>"
```

> **PROHIBITED**: 不得用 `--body` 内联 PR 描述（防止绕过模板结构）。
> 正确做法：读取 `.github/PULL_REQUEST_TEMPLATE/<type>.md` → 填写内容 → 写入临时文件 → `--body-file <tmp>`。

> **`--reviewer`**: Expected practice in all examples. Include it.

## Per-Template Summary

| Template | Required Fields |
|----------|----------------|
| `feature.md` | 变更摘要, 影响范围, 审核要点, 自检结果 (incl. CHANGELOG updated) |
| `bugfix.md` | Bug描述, 根因分析, 修复方案, 影响范围, 自检结果 (incl. CHANGELOG updated) |
| `documentation.md` | 文档变更内容, 变更原因, 自检结果 |
| `maintain.md` | 变更摘要, 影响评估, 审核要点, 自检结果 |
| `hotfix.md` | 事故描述, 影响范围, 根因分析, 修复方案, **回滚预案** (mandatory), 自检结果 |
| `release.md` | Highlights (from CHANGELOG [Unreleased]), 审核要点checklist, Details |

## CHANGELOG Requirement

- **feature/* and bugfix/* PRs**: MUST update `CHANGELOG.md [Unreleased]` block before creating PR
- Self-check item in both templates: "CHANGELOG.md [Unreleased] 区块已更新"

## Hotfix Special Rules

1. Target branch is `main` (not develop)
2. **Rollback plan is mandatory** — describe how to revert if the fix introduces new problems
3. PR description must confirm the plan to sync fix back to develop after merge
4. After merge: tag a patch version on main, then merge main → develop

## Release PR: Version Bump

Only at release time. Not during feature development.

### Files Updated by `bump-version.ps1` (7 files)

| File | What Changes |
|------|-------------|
| `pyproject.toml` | `version = "X.Y.Z"` |
| `main.py` | FastAPI title + version |
| `Dockerfile` | Comment header + LABEL |
| `docker-compose.yml` | `image: mj-system:X.Y.Z` + comment |
| `docker-compose.override.yml` | Comment header |
| `README.md` | Title version number |
| `QUICK_STATUS_SUMMARY.txt` | Version field |

### Files Requiring Manual Update (script skips these)

- **`CHANGELOG.md`**: PM manages manually — move `[Unreleased]` to `[X.Y.Z]`, add release date
- **`CLAUDE.md`**: Too many scattered refs — find and replace manually

### Running the Script

```powershell
# Preview (dry run)
.\scripts\bump-version.ps1 -From "2.7.0" -To "2.8.0" -DryRun

# Execute
.\scripts\bump-version.ps1 -From "2.7.0" -To "2.8.0"
```

### Release Highlights Source

Extract from `CHANGELOG.md [Unreleased]` section — list the core changes under Highlights in the PR.

## Self-Check ↔ Code Review Alignment

| Code Review Item (PM) | Self-Check Item (Dev) |
|-----------------------|-----------------------|
| Code correct, no bugs | Docker 自测通过 / Bug 已验证修复 |
| Commit message format | Commit message 符合规范 |
| No hardcoded secrets | 无硬编码 |
| SQL naming + schema correct | SQL 脚本语法正确 |
| No debug code remaining | 无残留调试代码 |
| Branch type discipline | 仅含允许的 Commit 类型 |
| CHANGELOG updated | CHANGELOG [Unreleased] 已更新 |

## Handoff to mj-git-check-merge

PR 创建完成后输出提示：

```
PR 创建完成 ✓
下一步：等待 CI 运行完成后，使用 mj-git-check-merge 检查合并就绪状态。
  已完成项：模板选择 ✓、描述填写 ✓、部署策略注入 ✓
  待检查项：合并冲突、CI 状态、Review 审批、描述完整性、Merge Commit
```

## Detailed Fields → pr-templates-reference.md

Complete field-by-field guidance for each template with examples in `pr-templates-reference.md`.
