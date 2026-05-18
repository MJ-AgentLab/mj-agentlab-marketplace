---
type: adr
scope: marketplace
summary: 借鉴 mj-system 在 develop 分支引入 post-release 预 bump 机制
owner: ranzuozhou
created: 2026-05-18
updated: 2026-05-18
state: active
version: v1.0
domain: release
related:
  - ../runbook/[RUNBOOK]_Release_Operations.md
  - ../rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md
  - ../rule/[STANDARD]_Documentation_Framework.md
---

# [ADR] develop 分支 Post-Release 预 bump 机制

| Field | Value |
|-------|-------|
| Status | accepted |
| Date | 2026-05-18 |
| Author | ranzuozhou |
| Scope | marketplace |
| Reversibility | reversible（机制可随时回退到 "release-time bump only"） |

## §1 Context

v4.6.0 发布完成后，`develop` 与 `main` 的 `VERSION` 文件均停在 `4.6.0`，与 `[RUNBOOK]_Release_Operations` v1.2 "release-time bump" 策略的预期完全一致。但维护者对此产生疑问："发布版本 = develop 版本" 是否合理？

调查发现：

- 这本身**不是 bug** —— marketplace 当前 release-time bump 策略 + `[GUIDE]_Version_Management` v1.0 + sync-main-to-develop PR (PR #119) 三者协同的预期产物。
- 但参考姊妹项目 [mj-system](https://github.com/MJ-AgentLab/mj-system) 发现它采用 **post-release pre-bump** 模式：v3.2.1 发布后 develop 立即 bump 到 3.2.2（pure patch，无 `-dev` 后缀），让 `develop VERSION > main VERSION` 始终成立。
- 维护者核心诉求是 **与 mj-system 的版本管理心智模型对齐**，避免维护两套工作流。

约束：marketplace 必须遵守 `[STANDARD]_AI_Engineering_Execution_HITL_Prompt` §0.4 / §4.3 的明确约束 "marketplace **不维护** `plans/` 目录"，所以不能照搬 mj-system 的 `plans/[PLAN]_Release_vX.Y.Z.md` 审计文档习惯。

## §2 Decision

We decide to **借鉴 mj-system 4 项发布相关机制中的 3 项到 marketplace**：

- **采用** develop 分支 post-release 预 bump（pure patch 风格：4.6.0 → 4.6.1）。每次 release sync-main-to-develop 完成后，在 develop 加 1 个 `infra(release): pre-bump develop X.Y.Z -> X.Y.(Z+1) (post-vX.Y.Z)` commit。
- **采用** CHANGELOG `[Unreleased]` PR-time 纪律：feature/bugfix/documentation/maintain/hotfix 5 类 PR 模板均含 CHANGELOG checkbox（feature/bugfix 已有；本 ADR 补齐 documentation/maintain/hotfix）。
- **采用** warn-only CI 预 bump 状态检查（`verify-develop-prebumped.yml`），post-release 72h 宽限窗口之外报 workflow summary 警告，永不 `exit 1`。
- **不采用** mj-system 的 `plans/[PLAN]_Release_vX.Y.Z.md` 审计文档机制 —— marketplace `CHANGELOG.md` 现已承担同等审计职能（v4.6.0 entry 含 per-PR breakdown + 4-layer defense table + root cause + lessons），且 STANDARD §4.3 明确禁止 marketplace 维护 `plans/` 目录。

Boundary:

- **In-scope**: marketplace 顶层 `VERSION` + `marketplace.json metadata.version` + `README.md` badge 的预 bump。
- **Out-of-scope**:
  - Plugin 级 `plugin.json` 预 bump（marketplace 双层 versioning；plugin 应按自身节奏 bump，预 bump 会产生 "plugin 有未发变更" 假信号）。
  - Hotfix 与预 bump 的冲突处理（暂无 hotfix 高频场景；RUNBOOK 加 TODO 标记，待首次事件再补 §3.9）。
- **Open questions**:
  - 72h 宽限窗口是否合适？暂按经验值；若观察到 false-positive 频次高再调。
  - CHANGELOG `[Unreleased]` CI 守门是否需要？暂不加，靠 PR review 纪律；6 个月内若漏更新频次高再追加 warn-only CI。

## §3 Consequences

### §3.1 Positive

- `develop VERSION > main VERSION` 成为肉眼可见的 "develop 是否领先 main" 信号，与 mj-system 心智模型一致。
- 跨 marketplace ↔ mj-system 维护者无需切换工作流，减少认知负担。
- CI `verify-develop-prebumped.yml` warn-only 在 release 后 72h 未预 bump 时主动提醒，闭合 "忘记预 bump" 风险。
- CHANGELOG PR 纪律覆盖 5 类 PR 模板，让 [Unreleased] 段在每次 PR 时即累积，避免 release-time 集中回忆累积变更。

### §3.2 Negative

- Develop 的 `README.md` badge 在预 bump 后显示 "4.6.1"，但 `v4.6.1` release 尚未发布 —— 通过 README 脚注澄清 "develop badge = 预计下一个 release 号"。
- 每次 release 多 1 个 commit（预 bump commit），develop history 比 main 多一个标记位。
- Hotfix 流程未预先处理与预 bump 的冲突，未来首次 hotfix 时需 ad-hoc 解决。

### §3.3 Risks

- **README badge 误导**：develop 浏览者看到 4.6.1 误以为已发布。**Mitigation**: README + CLAUDE.md 加脚注；引导用户用 release 页 / main 分支安装。
- **CI 检查误报**：72h 宽限不够（如维护者周末发版周一才预 bump）。**Mitigation**: warn-only，永不阻塞；可观察后调阈值。
- **Plugin 级版本被误连带 bump**：本 ADR 明确不连带，但维护者需记忆。**Mitigation**: RUNBOOK §3.7 写明 "仅 bump 顶层 VERSION，不动 plugin.json"。

## §4 Alternatives Considered

### §4.1 Option A: 完全不动（保持现状）

- **Pros**: 零改动；现有 CHANGELOG `[Unreleased]` 已经是"是否累积"的权威信号。
- **Cons**: 与 mj-system 心智模型不一致；维护者需记两套工作流。
- **Why rejected**: 用户的核心诉求是跨项目对齐，"不动" 不解决该诉求。

### §4.2 Option B: 采用 `-dev` / `-SNAPSHOT` 后缀风格（Maven 习惯）

- **Pros**: 语义最明确；develop badge 显示 "4.7.0-dev" 一眼可知是预发布。
- **Cons**: 与 mj-system 现行风格不一致（mj-system 用 pure patch）；需放宽 `release.yml` semver 校验；CI README badge 校验逻辑需重写。
- **Why rejected**: 偏离了 "对齐 mj-system" 的目标；改动面更大。

### §4.3 Option C: 借鉴包括 `plans/[PLAN]_Release_vX.Y.Z.md` 在内的全部 4 项机制

- **Pros**: 与 mj-system 100% 同构；审计追溯最完整。
- **Cons**: 违反 `[STANDARD]_AI_Engineering_Execution_HITL_Prompt` §4.3 ("marketplace 不维护 plans/ 目录")；与 marketplace `CHANGELOG.md` 现有详细 release narrative 形成功能重叠。
- **Why rejected**: STANDARD 是 marketplace 工作流 single source of truth，违反它需要先发起 STANDARD revision ADR；且 CHANGELOG 已承担同等审计职能（v4.6.0 entry 即典型示例：per-PR + table + 根因 + 教训），追加 PLAN 目录是冗余成本。

### §4.4 Option D: 把 release 审计迁到 `docs/postmortem/[POSTMORTEM]_Release_vX.Y.Z.md`

- **Pros**: 不违反 STANDARD（POSTMORTEM 是 Framework v1.5 6 tag 之一，`docs/postmortem/` 目录已就位）；不创建新 `plans/` 目录。
- **Cons**: POSTMORTEM 模板语义是 INCIDENT（Severity P0-P3 / Root Cause / Impact / Remediation），与 "成功 release 的审计记录" 语义不匹配；正常 release 套 INCIDENT 框架会产生误导。
- **Why rejected**: 语义错位比目录命名问题更严重；POSTMORTEM 应保留给真正的事故场景。

## §5 Implementation Plan

1. Create this ADR (in this PR)
2. Update `docs/runbook/[RUNBOOK]_Release_Operations.md` v1.2 → v1.3：
   - Add §3.7 "Post-release develop 预 bump"
   - Add §6 checklist 项 "release 完成后 72h 内 develop 已预 bump"
   - Add §4.5 hotfix TODO 标记
3. Update 4 PR templates (`documentation.md` / `maintain.md` / `hotfix.md` / `PULL_REQUEST_TEMPLATE.md`) 加 CHANGELOG checkbox
4. Update `README.md` + `CLAUDE.md` 加 develop badge 脚注
5. Update `.claude/skills/mp-doc-bump-version/SKILL.md` 加 post-release pre-bump 使用场景
6. Add `CHANGELOG.md` 新的空 `[Unreleased]` stub
7. Execute first pre-bump: `pwsh ./scripts/bump-version.ps1 -From 4.6.0 -To 4.6.1`（在 this PR 中作为机制启动点）
8. Create `.github/workflows/verify-develop-prebumped.yml`（在 step 7 之后落地，否则该 workflow 自己引入即报 warn）

Related documentation updates:

- `[RUNBOOK]_Release_Operations.md`: bump v1.2 → v1.3，加 §3.7 / §4.5 TODO / §6 checklist
- `README.md` + `CLAUDE.md`: 加 develop badge 脚注
- `.claude/skills/mp-doc-bump-version/SKILL.md`: 加 post-release 场景
- 4 个 PR 模板补 CHANGELOG checkbox

## §6 Acceptance Criteria

- [ ] `bump-version.ps1 -From 4.6.0 -To 4.6.1 -DryRun` 输出 3 文件预期变更（VERSION / marketplace.json / README.md）
- [ ] develop 上首次预 bump commit 落地后，`git show develop:VERSION` = 4.6.1, `git show main:VERSION` = 4.6.0
- [ ] `verify-develop-prebumped.yml` 在 develop push 时触发，输出 `OK: develop pre-bumped (main=4.6.0, develop=4.6.1)`
- [ ] PR 模板 4 文件均含 CHANGELOG checkbox（feature/bugfix/documentation/maintain/hotfix 5 类 PR 全覆盖）
- [ ] README + CLAUDE.md 含 develop badge 脚注，说明 "develop badge = 预计下一个 release 号"
- [ ] RUNBOOK v1.3 §3.7 详述预 bump 步骤；§4.5 含 hotfix TODO 标记
- [ ] CI `Validate README badge matches VERSION` 步骤在 develop 上 PR 仍 pass（badge=4.6.1 = VERSION=4.6.1）

## §7 References

- Issue: 无（直接 ADR 驱动；起源于用户对 develop=main 版本号的疑问）
- Plan: `~/.claude/plans/https-github-com-mj-agentlab-mj-agentlab-velvet-moonbeam.md`
- Reference repo: mj-system（pre-bump 模式来源；3.2.1 → 3.2.2 实例）
- Related STANDARD: [STANDARD]_AI_Engineering_Execution_HITL_Prompt v1.4 §0.4 / §4.3（"marketplace 不维护 plans/ 目录" 约束源）
- Related RUNBOOK: [RUNBOOK]_Release_Operations v1.2 → v1.3（本 ADR 落地后的版本）

## §8 Decision Log

| Date | State | By | Note |
|------|-------|----|------|
| 2026-05-18 | proposed | ranzuozhou | 初稿；4 选项分析；选定 Option C 之外的 3 机制借鉴方案 |
| 2026-05-18 | accepted | ranzuozhou | 用户确认借鉴 3 机制 + drop release plan doc；执行 Implementation Plan |
