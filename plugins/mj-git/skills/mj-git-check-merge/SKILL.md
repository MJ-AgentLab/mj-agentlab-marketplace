---
name: check-merge
description: This skill should be used when the user asks to check if a PR is ready to merge, verify CI status, review approvals, merge conflicts, or PR description completeness for MJ System. It should also be invoked when the user asks about PR status, whether code is ready, whether they can merge, or whether PM can review, even if phrased indirectly. Triggers on "PR 能合并吗", "check merge readiness", "PR 审核状态", "可以合并了吗", "PR ready", "代码准备好了吗", "可以让人 review 了吗".
---

# MJ Git Check Merge

## 前置条件

- `gh` CLI 已安装并完成身份认证（`gh auth status` 验证）
- 在 MJ System worktree 目录内执行（bare repo 根目录无 git working tree）

## Overview

PR 创建后的合并就绪检查，5 项检查（4 项门控 + 1 项信息），输出表格 + 针对失败项的建议操作。适用于 PR 等待合并期间，随时可执行。

## 快速开始（交互模式）

> 本节描述每步的逻辑含义。具体的 API 调用分组方式见「推荐执行轮次」节。

### Step 1 — 识别 PR

优先从当前分支自动识别：

```bash
git branch --show-current
gh pr list --head <branch> --state open --json number,title
```

**根据结果分三种情况处理**：

| 结果 | 处理方式 |
|------|---------|
| 0 个 open PR | 询问用户：「当前分支没有找到 open PR，请提供 PR 号：」 |
| 1 个 open PR | 自动使用，输出 `→ 检查 PR #<number>: <title>` |
| 多个 open PR | 列出所有 open PR（number + title），询问：「找到多个 open PR，请选择要检查的：」 |

### Step 2 — 获取 PR 全部数据（合并调用）

```bash
gh pr view <number> --json number,title,headRefName,mergeable,body,reviews,statusCheckRollup
```

> 单次调用获取 Check [1][2][3][4] 所需全部数据。`statusCheckRollup` 以 JSON 数组返回 CI 状态，始终 exit 0，避免 `gh pr checks` 的 exit code 8（pending）问题。

### Step 3 — 运行 5 项检查

```bash
# [1] 合并冲突
# 使用 Step 2 中 mergeable 字段：MERGEABLE / CONFLICTING / UNKNOWN

# [2] CI 检查
# 使用 Step 2 中 statusCheckRollup 字段（JSON 数组）
# 判定规则见「CI 状态判定」节

# [3] Review 状态
# 使用 Step 2 中 reviews 字段

# [4] PR 描述完整性（见下方「描述完整性检查」节）

# [5] Merge Commit 检测（信息项，不影响总判断）
REPO=$(gh repo view --json owner,name --jq '"\(.owner.login)/\(.name)"')
# 获取 PR 中的 merge commits（parents >= 2）
gh api repos/$REPO/pulls/<number>/commits --jq '[.[] | select(.parents | length >= 2) | {sha: .sha[0:7], message: .commit.message}]'
# 若有 merge commit，获取每个 commit 涉及的文件
gh api repos/$REPO/commits/<sha> --jq '[.files[].filename]'
# API 失败 → ⏭️ Skip（不影响总判断）
```

### Step 4 — 输出结果

见下方「输出格式」节。

---

## 推荐执行轮次

> 指导 Claude Code 分组 API 调用，避免并行 exit code 级联取消。「快速开始」描述每步做什么，本节描述如何分组执行。

| 轮次 | 命令 | 获取数据 |
|------|------|---------|
| **Round 1** | `git branch --show-current` + `gh pr list --head <branch>` | PR 编号 |
| **Round 2** | `gh pr view <number> --json number,title,headRefName,mergeable,body,reviews,statusCheckRollup` | Check [1][2][3][4] 全部数据 |
| **Round 3** | `gh api repos/.../pulls/<number>/commits` + 逐个 `gh api repos/.../commits/<sha>` | Check [5] Merge Commit |
| **Round 4** | 编译结果 + 输出表格 | — |

- **Round 2** 是单次调用，包含合并冲突、CI、Review、PR body 所有数据，避免并行调用引发的 exit code 问题
- **Round 3** 的 `gh api` 始终 exit 0（失败走 H4 Skip），可安全并行

---

## 描述完整性检查（分支类型感知）

从 `headRefName` 提取分支类型，对照必填字段检查 PR body 中对应 Section 是否有实际内容（非空、非纯 HTML 注释）。

| 分支类型 | 必检字段 |
|----------|---------|
| `feature/*` | 变更摘要、影响范围、审核要点、自检清单（含 CHANGELOG 勾选） |
| `bugfix/*` | Bug描述、根因分析、修复方案、影响范围、自检清单（含 CHANGELOG 勾选） |
| `hotfix/*` | 事故描述、影响范围、根因分析、修复方案、**回滚预案**（mandatory）、自检清单 |
| `maintain/*` | 变更摘要、影响评估、审核要点、自检清单 |
| `documentation/*` | 文档变更内容、变更原因、自检清单 |
| `develop`（release）| Highlights、审核要点 checklist |

> **判定逻辑**：Section header 存在 + header 下方有非空、非注释内容 = Pass。若只有 header 或内容为 `<!-- ... -->` = Fail。

---

## 输出格式

```
## PR #<number>「<title>」Merge Readiness

| 检查项         | 状态       | 说明                                |
|----------------|------------|-------------------------------------|
| 无合并冲突     | ✅ Pass    | 可正常合并                          |
| CI 检查通过    | ❌ Fail    | 2 项未通过: `test-unit`, `lint`     |
| Review 已批准  | ⚠️ Pending | 0/1 Approve（等待审核人）           |
| PR 描述完整    | ❌ Fail    | 缺少：审核要点、自检清单未勾选      |
| Merge Commit   | ℹ️ Info    | 1 个 merge commit，涉及 3 个文件   |

**总判断：Not Ready to Merge**

### 待处理
1. **CI**: `gh pr checks <number>` 查看详情 → 修复后重新 push
2. **描述**: 补充「审核要点」字段，完成自检勾选
3. **Review**: 联系 PM 进行审核

### Merge Commit 详情
| Commit | Message | 涉及文件 |
|--------|---------|---------|
| `abc1234` | merge: 合并 develop 最新内容，解决冲突 | `src/foo.py`, `sql/bar.sql`, `docs/baz.md` |
```

**状态图例**：
- `✅ Pass` — 检查通过
- `❌ Fail` — 检查失败，必须修复
- `⚠️ Pending` — 已请求但尚未完成（如等待 Review）
- `⏭️ Skip` — 当前分支类型不适用此项
- `ℹ️ Info` — 信息展示，供 reviewer 参考，不影响总判断

**总判断规则**：
- 全部 Pass/Skip/Info → **Ready to Merge ✅**
- 任意 Fail → **Not Ready to Merge ❌**
- 仅有 Pending（无 Fail）→ **Waiting for Review ⏳**

> `ℹ️ Info` 不参与总判断运算——它与 Skip 一样不阻塞合并，但会在输出中展示详情供 reviewer 审查。

---

## Handoff（结果导向下一步）

根据总判断输出对应的 Handoff 消息：

### Ready to Merge ✅

```
检查完成 ✓ PR 已满足所有合并条件。
下一步：通知 PM 审核并合并。合并后使用 mj-git-delete 清理分支。
```

### Not Ready to Merge ❌

```
检查完成 — 存在待修复项。
下一步：按「待处理」列表修复 → push → 再次运行 mj-git-check-merge。
```

### Waiting for Review ⏳

```
检查完成 — 等待外部审核。
下一步：联系审核人 Review。其他检查项均已通过。
```

---

## 人工介入场景（STOP & ASK）

| # | 触发条件 | 处理方式 |
|---|---------|---------|
| **H1a** | `gh pr list --head <branch>` 返回空 | 询问用户输入 PR 号 |
| **H1b** | `gh pr list --head <branch>` 返回多个 open PR | 列出所有 open PR，让用户选择 |
| **H2** | mergeable = `UNKNOWN` | 告知「GitHub 正在计算合并状态，请稍后重试」 |
| **H3** | `statusCheckRollup` 数组为空或字段不存在 | 标记为 `⏭️ Skip`，注明「当前仓库无 CI 配置」 |
| **H4** | `gh api` 调用失败（网络错误、权限不足等） | Merge Commit 检测标记为 `⏭️ Skip`，注明「无法获取 commit 信息」，不影响总判断 |

---

## 执行备注（Claude Code 韧性）

### `gh pr checks` 的 exit code 问题

`gh pr checks <number>` 在不同状态下返回不同的 exit code：

| 状态 | Exit Code | 影响 |
|------|-----------|------|
| 全部通过 | 0 | 正常 |
| 有失败项 | 1 | Claude Code 可能报错 |
| 有 pending 项 | 8 | Claude Code 取消并行调用 |

当 `gh pr checks` 与其他命令并行执行时，exit code 1 或 8 会导致 Claude Code 取消同一轮次中的其他调用（如 Review 检查、Merge Commit 检测），造成级联失败。

### 推荐做法

- **始终使用 `statusCheckRollup`**：通过 `gh pr view --json statusCheckRollup` 获取 CI 数据，始终 exit 0
- **保留 `gh pr checks <number>` 仅用于「待处理」建议**：在输出中推荐用户在终端运行以查看 CI 详情，但不作为数据采集源
- 若仍需直接调用 `gh pr checks`，应**独立执行**（不与其他命令并行）或追加 `|| true` 防止 exit code 传播

---

## 判定规则（隐式逻辑）

### 描述完整性判定

Section header 之后、下一个 header 之前，存在至少一行**非空、非纯 HTML 注释（`<!-- ... -->`）、非空 checkbox（`- [ ]`）** 的文本 = Pass。

```
## 变更摘要
<!-- 在此填写 -->        → Fail（纯注释）
- [ ] 待填              → Fail（空 checkbox）
重构了 AEC 的邮件解析模块 → Pass
```

**粒度**：缺任意一个必填字段 = ❌ Fail，在说明列逐项列出缺少的字段名。

### Review 状态判定

Review 检查**不判定为 Fail**，只有 Pass 或 Pending：
- `≥1 Approve` → ✅ Pass
- `0 Approve`（含无任何 Review）→ ⚠️ Pending

原因：Approve 依赖外部人员，不是开发者能自行修复的项，总判断中 Pending 单独一档（`Waiting for Review ⏳`）。

### CI 状态判定

通过 Step 2 返回的 `statusCheckRollup` JSON 数组判定。

**去重规则**：同一个 check name 可能因多次 push 出现多条记录（每次 push 触发一轮 CI），按 `name` 去重，取 `startedAt` 最晚的条目：

```
去重后数组 = [statusCheckRollup | group_by(.name)[] | sort_by(.startedAt) | last]
```

**判定逻辑**（对去重后的数组）：

```
数组为空 → ⏭️ Skip（无 CI 配置，即 H3）

CheckRun 类型（__typename: "CheckRun"）：
  conclusion ∈ {FAILURE, CANCELLED, TIMED_OUT, ACTION_REQUIRED, STARTUP_FAILURE} → ❌ Fail
  status ∈ {IN_PROGRESS, QUEUED} 或 conclusion = null → ⚠️ Pending
  conclusion ∈ {SUCCESS, NEUTRAL, SKIPPED} → ✅ Pass

StatusContext 类型（__typename: "StatusContext"）：
  state ∈ {FAILURE, ERROR} → ❌ Fail
  state = PENDING → ⚠️ Pending
  state = SUCCESS → ✅ Pass

汇总：
  任意 ❌ → CI 检查 ❌ Fail
  无 ❌ 但有 ⚠️ → CI 检查 ⚠️ Pending
  全部 ✅ → CI 检查 ✅ Pass
```

> `gh pr checks <number>` 保留为「待处理」建议中的人工查看命令，但不再作为 CI 数据采集源。

### Merge Commit 判定

通过 `gh api` 获取 PR commit 列表，筛选 `parents.length >= 2` 的 merge commit：
- API 调用失败 → `⏭️ Skip`（即 H4，注明「无法获取 commit 信息」）
- 无 merge commit → `⏭️ Skip`（无同步合并）
- 有 merge commit → `ℹ️ Info`（列出数量及涉及文件）

`ℹ️ Info` 不参与总判断——纯信息展示，供 reviewer 审查冲突解决区域。

---

## 完整示例

### 示例 1：无 Merge Commit（⏭️ Skip）

```bash
# 用户在 feature/mj-skill-add-delete-branch worktree 内触发技能

# Round 1 — 识别 PR
git branch --show-current
# → feature/mj-skill-add-delete-branch

gh pr list --head feature/mj-skill-add-delete-branch --state open --json number,title
# → [{"number":31,"title":"feat(skill): add mj-git-delete skill"}]

# Round 2 — 获取全部数据（单次合并调用）
gh pr view 31 --json number,title,headRefName,mergeable,body,reviews,statusCheckRollup
# → {
#     "number": 31,
#     "mergeable": "MERGEABLE",
#     "headRefName": "feature/mj-skill-add-delete-branch",
#     "reviews": [],
#     "statusCheckRollup": [
#       {"__typename":"CheckRun","name":"build","status":"COMPLETED","conclusion":"SUCCESS","startedAt":"..."},
#       {"__typename":"CheckRun","name":"lint","status":"COMPLETED","conclusion":"FAILURE","startedAt":"..."}
#     ],
#     ...
#   }

# Round 3 — Merge Commit 检测
REPO=$(gh repo view --json owner,name --jq '"\(.owner.login)/\(.name)"')
gh api repos/$REPO/pulls/31/commits --jq '[.[] | select(.parents | length >= 2) | {sha: .sha[0:7], message: .commit.message}]'
# → [] （无 merge commit）
```

输出结果：

```
## PR #31「feat(skill): add mj-git-delete skill」Merge Readiness

| 检查项         | 状态       | 说明                                |
|----------------|------------|-------------------------------------|
| 无合并冲突     | ✅ Pass    | 可正常合并                          |
| CI 检查通过    | ❌ Fail    | 1 项未通过: `lint`                  |
| Review 已批准  | ⚠️ Pending | 0/1 Approve（等待审核人）           |
| PR 描述完整    | ✅ Pass    | 所有必填字段已填写                  |
| Merge Commit   | ⏭️ Skip    | 无同步合并                          |

**总判断：Not Ready to Merge ❌**

### 待处理
1. **CI**: `gh pr checks 31` 查看详情 → 修复后重新 push
2. **Review**: 联系 PM 进行审核

检查完成 — 存在待修复项。
下一步：按「待处理」列表修复 → push → 再次运行 mj-git-check-merge。
```

### 示例 2：有 Merge Commit（ℹ️ Info）

```bash
# 用户在 feature/42-aec-email-parser worktree 内触发技能

# Round 1 — 识别 PR
git branch --show-current
# → feature/42-aec-email-parser

gh pr list --head feature/42-aec-email-parser --state open --json number,title
# → [{"number":42,"title":"feat(aec): refactor email attachment parser"}]

# Round 2 — 获取全部数据（单次合并调用）
gh pr view 42 --json number,title,headRefName,mergeable,body,reviews,statusCheckRollup
# → {
#     "number": 42,
#     "mergeable": "MERGEABLE",
#     "headRefName": "feature/42-aec-email-parser",
#     "reviews": [{"state":"APPROVED","author":{"login":"pm-reviewer"}}],
#     "statusCheckRollup": [
#       {"__typename":"CheckRun","name":"build","status":"COMPLETED","conclusion":"SUCCESS","startedAt":"2026-03-14T01:00:00Z"},
#       {"__typename":"CheckRun","name":"build","status":"COMPLETED","conclusion":"SUCCESS","startedAt":"2026-03-14T02:00:00Z"},
#       {"__typename":"CheckRun","name":"sync-to-gitee","status":"COMPLETED","conclusion":"SUCCESS","startedAt":"2026-03-14T01:00:00Z"},
#       {"__typename":"CheckRun","name":"sync-to-gitee","status":"COMPLETED","conclusion":"SUCCESS","startedAt":"2026-03-14T02:00:00Z"}
#     ],
#     ...
#   }
# 注意：build 和 sync-to-gitee 各出现 2 次（2 次 push 触发），按 name 去重取最新

# Round 3 — Merge Commit 检测
REPO=$(gh repo view --json owner,name --jq '"\(.owner.login)/\(.name)"')
gh api repos/$REPO/pulls/42/commits --jq '[.[] | select(.parents | length >= 2) | {sha: .sha[0:7], message: .commit.message}]'
# → [{"sha":"a1b2c3d","message":"Merge branch 'develop' into feature/42-aec-email-parser"}]

# 获取涉及文件
gh api repos/$REPO/commits/a1b2c3d --jq '[.files[].filename]'
# → ["src/CollectionNodes/AutoEmailCollector/application/service.py","sql/10-ops/aec/04_dwd_tables.sql","docs/design/AutoEmailCollector/README.md"]
```

输出结果：

```
## PR #42「feat(aec): refactor email attachment parser」Merge Readiness

| 检查项         | 状态       | 说明                                          |
|----------------|------------|-----------------------------------------------|
| 无合并冲突     | ✅ Pass    | 可正常合并                                    |
| CI 检查通过    | ✅ Pass    | 全部通过（去重后 2 项 check，均 SUCCESS）      |
| Review 已批准  | ✅ Pass    | 1/1 Approve                                   |
| PR 描述完整    | ✅ Pass    | 所有必填字段已填写                            |
| Merge Commit   | ℹ️ Info    | 1 个 merge commit，涉及 3 个文件              |

**总判断：Ready to Merge ✅**

### Merge Commit 详情
| Commit | Message | 涉及文件 |
|--------|---------|---------|
| `a1b2c3d` | Merge branch 'develop' into feature/42-aec-email-parser | `src/.../service.py`, `sql/.../04_dwd_tables.sql`, `docs/.../README.md` |

检查完成 ✓ PR 已满足所有合并条件。
下一步：通知 PM 审核并合并。合并后使用 mj-git-delete 清理分支。
```
