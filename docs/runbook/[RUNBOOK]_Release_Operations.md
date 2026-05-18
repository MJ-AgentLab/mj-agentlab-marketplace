---
type: runbook
scope: marketplace
summary: 从功能开发到版本发布的完整操作流程 — Issue → PR → Release → Post-release develop pre-bump (v1.3 起借鉴 mj-system pre-bump 机制)
owner: marketplace-maintainers
created: 2026-03-17
updated: 2026-05-18
state: active
version: v1.3
last-verified: 2026-05-18
domain: release
tags:
  - release
  - operations
  - publish
  - pre-bump
related:
  - ../guide/[GUIDE]_Version_Management.md
  - ../spec/[SPEC]_Marketplace_Json_Schema.md
  - ../rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md
  - ../adr/[ADR]_Develop_PreBump_Adoption.md
revision: |
  2026-05-18 — v1.3: **借鉴 mj-system develop post-release 预 bump 机制** (per `[ADR]_Develop_PreBump_Adoption`)。新增 §3.7 "Post-release develop 预 bump"（sync-main-to-develop 完成后即在 develop 上执行 `bump-version.ps1 -From X.Y.Z -To X.Y.(Z+1)` 一个 commit；pure patch 风格无 `-dev` 后缀；只 bump 顶层 VERSION，不连带 plugin.json）；§4.5 加 hotfix 与预 bump 冲突 TODO 标记（暂不预设处理，待首次 hotfix 事件再补 §4.6）；§6 发布前检查清单加 1 项后置 "release 完成后 72h 内 develop 已预 bump"。Configures `verify-develop-prebumped.yml` warn-only CI 作为遗忘提醒兜底（72h 宽限）。Non-trigger archive（minor bump，无 Framework §2.3.1 触发条件）。
  2026-05-18 — v1.2: **CLAUDE.md 自动化 sync**（closes #110）。§3.2.1 post-bump verification 第 2 步 wording 从 "CLAUDE.md plugin line manual：script 不 cover" 改为 "script 已 cover (v2 起)；保留 grep verify 作为 last-line defense"；§6 发布前检查清单第 3 项 wording 同步更新；cross-reference 加 PR #115 (Issue #110 closure) + 内含 marketplace.json `[^}]*` regex bug 顺手修复（描述含 `}` 时 silent SKIP，已修为 `[\s\S]*?` 非贪婪）。bump-version.ps1 现 cover 全 5 Quintangle sites，三层防御 (script 覆盖 + CI guard + RUNBOOK MANDATORY) 完工。Non-trigger archive（minor bump，无 Framework §2.3.1 触发条件）。
  2026-05-18 — v1.1: **bump-version.ps1 MANDATORY enforcement**（closes #111）。§3.2 重写为 MANDATORY callout（不再是 advisory）+ 新增 §3.2.1 post-bump verification step（`git diff --name-only` 必须含 `README.md` + Quintangle 5-site sed-based check）；§3.4 git add 列表新增 `README.md` + `CLAUDE.md` + commit message 改 release scope 范例；§6 发布前检查清单新增 3 项 NEW（script 已运行 / diff 含 README / CLAUDE.md plugin line 同步）+ 发布后新增 1 项（visual badge verify）；§7 新增 版本历史段（§8 即原 §7 相关文档）；fix line 350 `../CONTRIBUTING.md` → `../guide/[GUIDE]_Contributing.md` (PR #103 rename)；cross-reference v4.6.0 CI guard «Validate README badge matches VERSION»（PR #109）作为 safety net + Issue #110 / #113 future-work 锚点
  2026-03-17 — v1.0: 初版
---

# [RUNBOOK] 发布操作手册 — MJ AgentLab Marketplace

> 从功能开发到版本发布的完整操作流程，面向执行者。

## 1. 流程总览

```
Issue → Branch → Develop → Commit → Push → PR → CI → Review → Merge
                                                                 │
                                              ┌──────────────────┘
                                              ▼
                                    develop 分支积累变更
                                              │
                                              ▼
                                    Bump 版本 + 更新 CHANGELOG
                                              │
                                              ▼
                                    Release PR (develop → main)
                                              │
                                              ▼
                                    CI 通过 → 合并 → 自动发布
                                              │
                                              ▼
                                    GitHub Release + Git Tag
```

## 2. 开发阶段

### 2.1 创建 Issue

```bash
# 使用 gh CLI 创建（会自动弹出模板选择）
gh issue create
```

模板类型：功能/需求、Bug 报告、文档变更、维护任务、紧急修复

### 2.2 创建分支

> **注意**：本项目使用 **bare repo worktree 模式**，不使用 `git checkout` 切换分支。每个分支对应一个独立目录，通过 `cd` 导航。

```bash
# 从 develop worktree 创建 feature worktree
cd D:/workspace/10-software-project/projects/mj-agentlab-marketplace/develop
git pull origin develop
git worktree add ../feature/<issue-id>-<description> -b feature/<issue-id>-<description> develop

# 示例
git worktree add ../feature/12-add-release-skill -b feature/12-add-release-skill develop
cd ../feature/12-add-release-skill
```

分支类型对照：

| Issue 类型 | 分支前缀 | 来源 |
|-----------|----------|------|
| 功能/需求 | `feature/` | develop |
| Bug 报告 | `bugfix/` | develop |
| 文档变更 | `documentation/` | develop |
| 维护任务 | `maintain/` | develop |
| 紧急修复 | `hotfix/` | **main** |

### 2.3 开发与提交

```bash
# 提交格式
git commit -m "<type>(<scope>): <summary>"

# 示例
git commit -m "feat(learn-kit): add release skill"
git commit -m "fix(learn-kit): fix validate frontmatter check"
git commit -m "infra(ci): add version consistency check"
```

**Commit 类型**：feat, fix, perf, refactor, test, docs, infra
**Scope 值**（v4.x 闭合 allowlist）：`learn-kit`, `marketplace`, `ci`, `scripts`, `deps`, `infra`, `docs-rule`, `docs-adr`, `docs-guide`, `docs-runbook`, `docs-spec`, `release`

> Canonical 来源：[../rule/[STANDARD]_Commit_Message_Convention.md](../rule/[STANDARD]_Commit_Message_Convention.md) §4。引入新 scope 需 minor bump 该 STANDARD + 同步更新 `scripts/install-hooks.ps1` PATTERN regex。

### 2.4 更新 CHANGELOG

在提交功能变更后，更新对应的 CHANGELOG `[Unreleased]` 区块：

```bash
# 插件级变更 → 更新插件 CHANGELOG
vim plugins/learn-kit/CHANGELOG.md

# 市场级变更 → 更新根 CHANGELOG
vim CHANGELOG.md
```

添加内容到 `[Unreleased]` 下的合适分类（Added/Changed/Fixed/Removed）。

### 2.5 推送与创建 PR

```bash
# 推送分支
git push -u origin feature/12-add-release-skill

# 创建 PR（使用对应模板）
gh pr create --base develop --head feature/12-add-release-skill \
  --title "feat(learn-kit): add release skill" \
  --body-file <filled-template>
```

### 2.6 CI 通过 → 合并

```bash
# 检查 CI 状态
gh pr checks <pr-number>

# 合并后清理 worktree 和分支
cd D:/workspace/10-software-project/projects/mj-agentlab-marketplace/develop
git pull origin develop
git worktree remove ../feature/12-add-release-skill
git branch -d feature/12-add-release-skill
# 可选：远程分支通常在 PR 合并后由 GitHub 自动删除
git push origin --delete feature/12-add-release-skill
```

## 3. 发布阶段

### 3.1 确定版本号

| 变更类型 | 版本变化示例 |
|----------|-------------|
| 新增 Skill | learn-kit 1.0.0 → 1.1.0 |
| 修复 Skill Bug | learn-kit 1.0.0 → 1.0.1 |
| 新增 Plugin | marketplace 4.3.0 → 4.4.0 |
| 删除 Plugin / 破坏性变更 | marketplace 4.x → 5.0.0 |

### 3.2 Bump 版本号

> [!IMPORTANT]
> **MANDATORY**：必须运行 `scripts/bump-version.ps1`，禁止手工逐文件 edit。
>
> **为什么强制**：v4.4.9 → v4.5.0 期间 4 次 release-bump commit 连续手工 edit + 漏 `README.md`（badge 停在 4.4.8 横跨 4 个 release），直到用户截图发现。详见 [PR #109](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/109) postmortem。
>
> **Safety net**：CI 第「Validate README badge matches VERSION」步骤（PR #109 引入）会在 `README.md` badge 与 `VERSION` drift 时直接 fail。手工跳过 script 时 CI 会拒 PR。
> CLAUDE.md plugin 行 + Quintangle 5-site 其余字段无 CI guard（追踪：[Issue #110](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/110) + [Issue #113](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/113)），故 script 是当前唯一可靠路径。

在 develop worktree 中执行：

```bash
cd D:/workspace/10-software-project/projects/mj-agentlab-marketplace/develop
git pull origin develop
```

**仅插件变更**：

```powershell
# 预览（必跑：看清将改哪些文件）
.\scripts\bump-version.ps1 -From "1.0.0" -To "1.1.0" -Scope "learn-kit" -DryRun

# 执行
.\scripts\bump-version.ps1 -From "1.0.0" -To "1.1.0" -Scope "learn-kit"
```

**市场级变更**：

```powershell
# 预览
.\scripts\bump-version.ps1 -From "4.3.0" -To "4.3.1" -DryRun

# 执行
.\scripts\bump-version.ps1 -From "4.3.0" -To "4.3.1"
```

**混合变更**：先 bump 各插件，再 bump marketplace。v4.0.0 / v4.3.0 即典型示例。

#### 3.2.1 Post-bump verification (MANDATORY)

执行 script 后立即跑（任一 ERROR 必须修正后才能进入 §3.3 CHANGELOG 转节）：

```bash
# 1. README.md 必须在 diff 中（marketplace scope 覆盖 badge + plugin table cell）
git diff --name-only | grep -E "^README\.md$" || \
  echo "ERROR: README.md not in diff — bump-version.ps1 was either skipped or failed silently"

# 2. CLAUDE.md plugin line 验证（v2 起 script 已 cover plugin scope；保留 grep verify 作为 last-line defense）
#    Script 现在用 scoped regex 锁定 `plugins/` 段 `<plugin>` v<X.Y.Z> 一行（不会误伤 历史版本记录）
#    手工 grep 仍可作为 sanity check (Issue #110 closed by PR #115)
grep -nE 'learn-kit. v[0-9.]+' CLAUDE.md

# 3. Version Quintangle 5-site 一致性（详见 .claude/skills/mp-doc-bump-version/SKILL.md Step 7）
v_root=$(cat VERSION)
v_mp_meta=$(jq -r '.metadata.version' .claude-plugin/marketplace.json)
v_readme_badge=$(sed -n 's/.*badge\/version-\([0-9.]\+\)-.*/\1/p' README.md | head -1)
[ "$v_root" = "$v_mp_meta" ] && [ "$v_root" = "$v_readme_badge" ] && echo "OK: 5-site quintangle aligned" \
  || echo "ERROR: site drift — re-run bump-version.ps1 with correct -From / -To"
```

### 3.3 更新 CHANGELOG 正式版本节

将 `[Unreleased]` 内容转为正式版本节：

**Before**：
```markdown
## [Unreleased]

### Added
- 新增 release skill

## [1.0.0] - 2026-03-16
```

**After**：
```markdown
## [Unreleased]

## [1.1.0] - 2026-03-17

### Added
- 新增 release skill

## [1.0.0] - 2026-03-16
```

对所有涉及变更的 CHANGELOG 执行此操作（根级和/或插件级）。

### 3.4 提交发布变更

```bash
# Version Quintangle 5 sites + CHANGELOG（README 必须在列表中 — 由 §3.2.1 verification 保证已改）
git add VERSION .claude-plugin/marketplace.json README.md CLAUDE.md CHANGELOG.md

# 如有插件变更，也加上：
git add plugins/learn-kit/.claude-plugin/plugin.json plugins/learn-kit/CHANGELOG.md

# Commit 主语用 release scope（per `[STANDARD]_Commit_Message_Convention` §4）
git commit -m "infra(release): bump marketplace 4.3.0 -> 4.3.1"
git push origin develop
```

> [!NOTE]
> Commit message 必须符合 `[STANDARD]_Commit_Message_Convention` PATTERN — `infra(release): bump marketplace X.Y.Z -> Y.Z.W` 是合规范例。CI 第「Validate commit message format」步骤会拒非合规 commit；本地可先跑 `bash scripts/validate-commits.sh HEAD~1..HEAD` 自验证。

### 3.5 创建 Release PR

```bash
gh pr create \
  --base main \
  --head develop \
  --title "Release v1.1.0" \
  --body-file <filled-release-template>
```

Release PR 模板审核要点：
- [ ] CHANGELOG.md 完整性（`[Unreleased]` 已转为正式版本节）
- [ ] VERSION 文件与 marketplace.json 版本一致
- [ ] 各 plugin.json 版本号与 marketplace.json plugins 数组一致
- [ ] 无残留调试代码
- [ ] 无未关闭的阻塞性 Issue

### 3.6 合并 → 自动发布

合并 Release PR 后，release.yml 自动执行：

1. 读取 `VERSION` 文件
2. 创建 git tag `vX.Y.Z`
3. 从 `CHANGELOG.md` 提取发布说明
4. 创建 GitHub Release

验证发布成功：

```bash
# 检查 tag
git fetch --tags
git tag -l "v1.1.0"

# 检查 GitHub Release
gh release view v1.1.0
```

### 3.7 Post-release develop 预 bump (v1.3 NEW)

> [!IMPORTANT]
> **MANDATORY 但宽限 72h**：每次 release 完成 + sync-main-to-develop PR 合并后，需在 develop 上执行一次预 bump，把 `VERSION` 推到下一个 patch（e.g., 4.6.0 → 4.6.1）。
>
> **为什么需要**：让 `develop VERSION > main VERSION` 始终成立，肉眼可见 "develop 是否领先 main"；与 [mj-system](https://github.com/MJ-AgentLab/mj-system) 工作流对齐。详见 [`[ADR]_Develop_PreBump_Adoption`](../adr/[ADR]_Develop_PreBump_Adoption.md)。
>
> **Safety net**：`.github/workflows/verify-develop-prebumped.yml` 在 release 后 72h 仍未预 bump 时输出 workflow summary 警告（warn-only，永不阻塞）。

执行步骤（在已 sync 的 develop worktree 内）：

```bash
cd D:/workspace/10-software-project/projects/mj-agentlab-marketplace/develop
git pull origin develop  # 拿到 sync-main-to-develop 的合并

# 预览（必跑：看清将改哪些文件 — 应为 VERSION + marketplace.json + README.md 3 文件）
.\scripts\bump-version.ps1 -From "4.6.0" -To "4.6.1" -DryRun

# 执行
.\scripts\bump-version.ps1 -From "4.6.0" -To "4.6.1"

# 提交 + 推送
git add VERSION .claude-plugin/marketplace.json README.md
git commit -m "infra(release): pre-bump develop 4.6.0 -> 4.6.1 (post-v4.6.0)"
git push origin develop
```

**关键约束**：

- **只 bump 顶层 `VERSION`**（marketplace 范围）；**不连带** `plugin.json` 预 bump。learn-kit 等 plugin 应按自身节奏 bump（plugin 真有变更时再 bump），预 bump plugin 会产生 "plugin 有未发变更" 假信号。
- **Pure patch 风格**（4.6.0 → 4.6.1），不用 `-dev` / `-SNAPSHOT` 后缀。下次 release 若实际为 minor/major，发布时再调整版本号即可。
- **Commit message 必须用 `infra(release)` scope** 并含 `(post-vX.Y.Z)` 后缀，便于 git history 一眼识别预 bump commit。
- **README.md badge** 会被脚本同步更新到 4.6.1。develop 浏览者看到的 badge = "预计下一个 release 号"（README 底部脚注 + CLAUDE.md 均已澄清）。

预 bump 完成后 `verify-develop-prebumped.yml` workflow 在 next push 时验证 `develop VERSION > main VERSION` 成立，输出 OK 注释。

## 4. Hotfix 流程

用于修复已发布版本的紧急问题。

### 4.1 创建 Hotfix 分支

```bash
# 从 main worktree 创建 hotfix worktree
cd D:/workspace/10-software-project/projects/mj-agentlab-marketplace/main
git pull origin main
git worktree add ../hotfix/<issue-id>-<description> -b hotfix/<issue-id>-<description> main
cd ../hotfix/<issue-id>-<description>
```

### 4.2 修复 + Bump Patch 版本

```bash
# 修复问题
git commit -m "fix(learn-kit): fix push skill crash on empty repo"

# Bump patch 版本
.\scripts\bump-version.ps1 -From "1.1.0" -To "1.1.1"
# 或 bump 插件版本
.\scripts\bump-version.ps1 -From "1.1.0" -To "1.1.1" -Scope "learn-kit"

# 更新 CHANGELOG
# 直接写入正式版本节（hotfix 不走 [Unreleased]）
```

### 4.3 创建 Hotfix PR → main

```bash
gh pr create \
  --base main \
  --head hotfix/<issue-id>-<description> \
  --title "fix(learn-kit): fix push skill crash on empty repo" \
  --body-file <filled-hotfix-template>
```

### 4.4 合并后同步 develop

```bash
cd D:/workspace/10-software-project/projects/mj-agentlab-marketplace/develop
git pull origin develop
git merge main
git push origin develop

# 清理 hotfix worktree
git worktree remove ../hotfix/<issue-id>-<description>
git branch -d hotfix/<issue-id>-<description>
```

### 4.5 Hotfix 与预 bump 冲突 — TODO (v1.3 NEW)

> [!warning]
> **未完成**：v1.3 起 develop 启用 post-release 预 bump（§3.7）后，如果 develop 已预 bump 到 4.6.1 而 hotfix 在 main 上发布 4.6.0 → 4.6.0.1（或 4.6.1 抢占），会与 develop 的 4.6.1 产生 VERSION 文件冲突。
>
> 当前未预设处理方案。**首次 hotfix 事件发生时**，需要在本 RUNBOOK 加 §4.6 详述冲突解决路径（候选方案：hotfix 后 develop 手动 re-bump / hotfix 后跳过本次预 bump 等下次正常 release / 暂停预 bump 机制等）。届时需配合更新 [`[ADR]_Develop_PreBump_Adoption`](../adr/[ADR]_Develop_PreBump_Adoption.md) §3.3 Risks 段。

## 5. 回滚流程

如发布版本存在严重问题且无法快速 hotfix：

```bash
# 删除错误的 GitHub Release
gh release delete v1.1.0 --yes

# 删除错误的 tag
git tag -d v1.1.0
git push origin --delete v1.1.0

# 然后走 hotfix 流程发布修正版本
```

## 6. 检查清单

### 发布前检查

- [ ] 所有目标变更已合并到 develop
- [ ] CI 全部通过（Validate Structure: SUCCESS）
- [ ] **(v1.1 NEW) `scripts/bump-version.ps1` 已运行**（先 DryRun + 看 diff preview，再执行；§3.2 MANDATORY）
- [ ] **(v1.1 NEW) `git diff --name-only` 包含 `README.md`**（§3.2.1 verification — 若不在意味着 script 漏执行 / 失败）
- [ ] **(v1.2 UPDATED) `CLAUDE.md` plugin line 已同步到新 plugin 版本**（v2 起 script 已 cover plugin scope 自动 patch；保留 `grep -nE 'learn-kit. v[0-9.]+' CLAUDE.md` 作 last-line verify）
- [ ] CHANGELOG 已从 `[Unreleased]` 转为正式版本节
- [ ] VERSION 文件已更新
- [ ] marketplace.json 版本与 VERSION 一致
- [ ] 各 plugin.json 版本与 marketplace.json 一致
- [ ] 无未关闭的阻塞性 Issue
- [ ] (本地预验证) `bash scripts/validate-commits.sh HEAD~N..HEAD` 全 PASS

### 发布后验证

- [ ] GitHub Release 已自动创建
- [ ] Git tag 已生成（`git tag -l "vX.Y.Z"`）
- [ ] Release notes 内容正确
- [ ] `gh release view vX.Y.Z` 输出无异常
- [ ] **(v1.1 NEW) 在 main 浏览 `README.md` 渲染 — badge 显示新版本号**（screenshot-level visual verify；post-PR #109 安全网）
- [ ] **(v1.3 NEW) 72h 内完成 develop 预 bump**（§3.7 流程；sync-main-to-develop PR 合并后即在 develop 执行 `bump-version.ps1 -From X.Y.Z -To X.Y.(Z+1)` 一个 commit；`verify-develop-prebumped.yml` 在超时未做时会发 warn）

## 7. 版本历史

- **v1.3**（2026-05-18）：**借鉴 mj-system develop post-release 预 bump 机制**（per `[ADR]_Develop_PreBump_Adoption`）。新增 §3.7 "Post-release develop 预 bump" — sync-main-to-develop 完成后在 develop 上执行 `bump-version.ps1 -From X.Y.Z -To X.Y.(Z+1)` 一个 commit；pure patch 风格无 `-dev` 后缀；只 bump 顶层 VERSION，不连带 plugin.json。§4.5 加 hotfix 与预 bump 冲突 TODO 标记（暂不预设处理，待首次 hotfix 事件再补 §4.6）。§6 发布后检查清单加 1 项 "72h 内完成预 bump"。配套 `.github/workflows/verify-develop-prebumped.yml` warn-only CI 在 72h 宽限外提醒。Frontmatter v1.2 → v1.3 + revision block + 加 `[ADR]_Develop_PreBump_Adoption` 到 related。Non-trigger archive（minor bump，无 Framework §2.3.1 触发条件）。
- **v1.2**（2026-05-18）：**CLAUDE.md 自动化 sync**（closes #110）。§3.2.1 第 2 步 + §6 第 3 项 wording 从「manual / script 不 cover」更新为「script 已 cover (v2 起 plugin scope 含 CLAUDE.md scoped-regex 分支)；grep 保留作 last-line defense」。配套 PR #115 同时修了 `scripts/bump-version.ps1` 中 marketplace.json `[^}]*` regex bug（描述含 `}` 时 silent SKIP）。bump-version.ps1 现真正 cover 全 5 Quintangle sites，三层防御 (script 覆盖 + CI guard + RUNBOOK MANDATORY) 完工。Frontmatter v1.1 → v1.2 + revision block。Non-trigger archive。
- **v1.1**（2026-05-18）：**bump-version.ps1 MANDATORY enforcement**（closes #111）。§3.2 改 advisory → MANDATORY callout box + 加 §3.2.1 post-bump verification（git diff README.md 必含 + Quintangle 5-site 一致性 sed-based check）；§3.4 git add 列表加 `README.md` + `CLAUDE.md` + 强调 release scope + 跨引用本地 `validate-commits.sh`；§6 发布前检查清单加 3 项 NEW + 发布后加 1 项 visual badge verify；§8 即原 §7 相关文档；fix line 350 `../CONTRIBUTING.md` → `../guide/[GUIDE]_Contributing.md` (PR #103 rename)；cross-reference v4.6.0 CI guard «Validate README badge matches VERSION»（PR #109）作为 safety net + Issue #110 / #113 future-work 锚点。Frontmatter v1.0 → v1.1 + revision block。Non-trigger archive（minor bump，无 Framework §2.3.1 触发条件）。
- **v1.0**（2026-03-17）：初版。Issue → Branch → Develop → Commit → PR → CI → Merge → Release 完整 6 阶段操作流程 + hotfix + rollback 子流程。

## 8. 相关文档

- [项目概览](<../guide/[GUIDE]_Marketplace_Project_Overview.md>) — 项目整体概览
- [版本管理指南](<../guide/[GUIDE]_Version_Management.md>) — 版本管理详细指南
- [贡献指南](<../guide/[GUIDE]_Contributing.md>) — branch strategy + commit format + PR 流程
- [Commit Message Convention](<../rule/[STANDARD]_Commit_Message_Convention.md>) — `<type>(<scope>): <summary>` PATTERN canonical
- [mp-doc-bump-version SKILL.md](../../.claude/skills/mp-doc-bump-version/SKILL.md) — Version Quintangle 5-site invariant + Step 7 Verify
- `.github/workflows/ci.yml` — 含「Validate README badge matches VERSION」step（PR #109 引入；safety net）
