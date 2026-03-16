# PR Templates Reference

## Template Location

All templates: `.github/PULL_REQUEST_TEMPLATE/<template>.md`

## feature.md — Field Guide

**When**: `feature/*` → develop. New features, refactors, new services.

| Field | Guidance | Example |
|-------|----------|---------|
| 变更摘要 | One paragraph: what changed and why | "QCM 全部数据库对象从 biz_ads 迁移至 biz_dws，纠正数据仓库语义分层" |
| 影响范围 | List affected services, modules, file counts | "QCM SQL 脚本（17文件）、全局SQL（2文件）、项目文档（12文件）" |
| 审核要点 | Tell reviewer what to focus on | "重点检查 SQL 文件中 biz_ads 引用是否已全部替换为 biz_dws" |
| 自检结果 | Tick all checklist items | incl. "CHANGELOG.md [Unreleased] 区块已更新" |

**Commit types allowed**: `feat`, `perf`, `refactor`, `test`, `docs`

**Complete example**:
```markdown
## 变更摘要
QCM 全部数据库对象（65 表 + 65 ETL + 9 编排 + 信号表 + cron）从 `biz_ads` 迁移至 `biz_dws`，
纠正数据仓库语义分层：多维度×多周期聚合 = DWS 本职。

## 影响范围
- QCM SQL 脚本：17 文件
- 全局 SQL 脚本：2 文件
- 项目文档：12 文件

## 审核要点
重点检查 SQL 文件中 biz_ads/ads_qcm_ 引用是否全部替换

## 自检结果
- [x] 本地 Docker 环境自测通过
- [x] SQL 脚本语法正确
- [x] 无硬编码
- [x] 无残留调试代码
- [x] Commit message 符合规范
- [x] CHANGELOG.md [Unreleased] 区块已更新
```

---

## bugfix.md — Field Guide

**When**: `bugfix/*` → develop. Bugs found during development (not production).

| Field | Guidance |
|-------|----------|
| Bug 描述 | One sentence: what the user sees (external symptom) |
| 根因分析 | Root cause (not symptom) — helps reviewer assess if fix is correct |
| 修复方案 | What was changed and how |
| 影响范围 | Affected services/modules |
| 自检结果 | incl. "CHANGELOG.md [Unreleased] 区块已更新" |

**Commit types allowed**: `fix`, `test`, `docs`

---

## documentation.md — Field Guide

**When**: `documentation/*` → develop. Pure doc changes, no code.

> If docs change alongside code, use the code's branch type (feature/maintain) instead.

| Field | Guidance |
|-------|----------|
| 文档变更内容 | List changed files with a brief description of each |
| 变更原因 | Why this update is needed (gap, outdated content, standard change) |
| 自检结果 | File naming, Obsidian links valid, INDEX.md updated |

**Commit types allowed**: `docs` only

**Lightest template** — no Docker self-test required.

---

## maintain.md — Field Guide

**When**: `maintain/*` → develop. CI/CD, Docker, dependencies, tool scripts, config.

| Field | Guidance |
|-------|----------|
| 变更摘要 | What infrastructure was changed and why |
| 影响评估 | Which **environments** are affected (dev/test/prod) and which tools/pipelines |
| 审核要点 | CI compatibility, env var changes, anything that could break existing setup |
| 自检结果 | Config syntax validated, no sensitive info exposed |

**Commit types allowed**: `infra`, `docs`

---

## hotfix.md — Field Guide

**When**: `hotfix/*` → **main**. Production emergency bug.

> Different from bugfix: hotfix targets main, not develop. Rollback plan is mandatory.

| Field | Guidance |
|-------|----------|
| 事故描述 | What users see in production (external symptom) |
| 影响范围 | Affected users, features, or services |
| 根因分析 | Root cause |
| 修复方案 | What was changed |
| **回滚预案** | **MANDATORY**: how to revert if this fix breaks something else |
| 自检结果 | Confirm: only `fix` commits; confirm: plan to sync back to develop after merge |

**Rollback plan example**:
```markdown
## 回滚预案
如修复引入新问题，执行以下步骤：
1. `git revert <merge-commit-sha>` 回滚合并
2. `git push origin main`
3. 通知相关方，恢复使用 v2.7.0 镜像
```

**After hotfix PR merges**:
1. Tag a patch version on main: `git tag -a v2.7.1 -m "Hotfix: ..."` + push
2. Merge main → develop to sync the fix

---

## release.md — Field Guide

**When**: develop → **main**. Version release. PM creates this PR.

| Field | Guidance |
|-------|----------|
| Release 标题 | Format: `Release vX.Y.Z — <theme>` e.g. "Release v2.8.0 — 数据校验模块重构" |
| Highlights | Core changes extracted from `CHANGELOG.md [Unreleased]` |
| 审核要点 | Checklist: CHANGELOG complete, version numbers consistent, no debug code, DB scripts complete |
| Details | Link to `CHANGELOG.md` for full release notes |

**Command** (non-interactive, e.g. Claude Code):
```bash
# 1. Read template, fill fields, write to temp file
# 2. Create PR with --body-file
gh pr create \
  --base main \
  --head develop \
  --title "Release v2.8.0" \
  --body-file <tmp-file> \
  --reviewer "<reviewer-username>"
```

**Version bump before Release PR**:
```powershell
# Dry run first
.\scripts\bump-version.ps1 -From "2.7.0" -To "2.8.0" -DryRun

# Execute
.\scripts\bump-version.ps1 -From "2.7.0" -To "2.8.0"

# Also manually update:
# CHANGELOG.md — move [Unreleased] → [2.8.0] with date (PM manages)
# CLAUDE.md — find and replace version references manually
```

---

## Quick `gh` Command Reference

> **Note**: `--template` only works in interactive mode. In non-interactive mode (Claude Code, CI), read the template, fill fields, write to temp file, and use `--body-file`.

| Branch | Template | Command (non-interactive) |
|--------|----------|--------------------------|
| `feature/12-user-auth` | `feature.md` | `gh pr create --base develop --title "..." --body-file <tmp> --reviewer "<user>"` |
| `bugfix/25-date-parse-npe` | `bugfix.md` | `gh pr create --base develop --title "..." --body-file <tmp> --reviewer "<user>"` |
| `documentation/15-update-api-guide` | `documentation.md` | `gh pr create --base develop --title "..." --body-file <tmp> --reviewer "<user>"` |
| `maintain/8-add-pr-template` | `maintain.md` | `gh pr create --base develop --title "..." --body-file <tmp> --reviewer "<user>"` |
| `hotfix/20-email-timeout` | `hotfix.md` | `gh pr create --base main --title "..." --body-file <tmp> --reviewer "<user>"` |
| Release | `release.md` | `gh pr create --base main --head develop --title "Release vX.Y.Z" --body-file <tmp> --reviewer "<user>"` |

## GitHub Web Alternative

To use a template via browser URL:
```
https://github.com/MJ-AgentLab/mj-system/compare/develop...<branch>?template=feature.md
```

Replace `feature.md` with the appropriate template name.
