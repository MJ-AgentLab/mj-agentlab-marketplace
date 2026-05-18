---
type: adr
scope: marketplace
summary: 在 develop 分支引入 post-release 预 bump 机制，使 develop VERSION 始终领先 main
owner: ranzuozhou
created: 2026-05-18
updated: 2026-05-18
state: active
version: v1.1
domain: release
related:
  - ../runbook/[RUNBOOK]_Release_Operations.md
  - ../rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md
  - ../rule/[STANDARD]_Documentation_Framework.md
revision: |
  2026-05-18 — v1.1: scrub external project references per `[STANDARD]_AI_Engineering_Execution_HITL_Prompt` §0.3 independence principle; reframe §1 Context / §2 Decision / §3 Consequences / §4 Alternatives with marketplace-internal rationale; remove §7 external reference repo line; technical decision unchanged.
  2026-05-18 — v1.0: 初版（含外部项目引用，v1.1 已 scrub）
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

v4.6.0 发布完成后，`develop` 与 `main` 的 `VERSION` 文件均停在 `4.6.0`，与 `[RUNBOOK]_Release_Operations` v1.2 "release-time bump" 策略的预期完全一致。该状态本身**不是 bug**，但触发了一个 release readiness signal 模糊性问题：

- 在 develop 上肉眼看 `VERSION=4.6.0`，无法直接判断 "develop 是否有未发布变更累积"。要回答这个问题，必须 `git log origin/main..develop` 或扫 `CHANGELOG.md [Unreleased]` 段。
- 这种 ambiguity 在多 PR 累积窗口尤其明显：维护者切上 develop 后需额外认知步骤判断当前状态。
- CI 端只有 `Validate README badge matches VERSION` 一道 invariant，没有 "develop 是否已经准备好发布" 这种 hygiene 维度的反馈。

约束：

- marketplace 必须遵守 `[STANDARD]_AI_Engineering_Execution_HITL_Prompt` §0.4 / §4.3 "marketplace **不维护** `plans/` 目录" 的约束。
- 现有 5 类 PR 模板中只有 `feature.md` / `bugfix.md` 含 `CHANGELOG [Unreleased]` checkbox；`documentation.md` / `maintain.md` / `hotfix.md` / fallback 模板未覆盖，纪律不齐。
- marketplace dual-layer versioning（顶层 `VERSION` + per-plugin `plugin.json`）要求任何机制都要明确作用于哪一层。

## §2 Decision

We decide to **在 develop 分支引入 post-release 预 bump 机制**，并配套 2 项流程纪律：

- **核心机制：develop pre-bump**（pure patch 风格，4.6.0 → 4.6.1）。每次 release PR 合并 main + sync-main-to-develop PR 合并 develop 之后，在 develop 上加 1 个 `infra(release): pre-bump develop X.Y.Z -> X.Y.(Z+1) (post-vX.Y.Z)` commit。**只 bump 顶层 `VERSION` + `marketplace.json metadata.version` + `README.md` badge** 三处；plugin.json 不动（plugin 按自身节奏 bump，预 bump plugin 会产生 "plugin 有未发变更" 假信号）。
- **CHANGELOG `[Unreleased]` PR-time 纪律**：5 类 PR 模板均含 CHANGELOG checkbox（feature/bugfix 已有；本 ADR 补齐 documentation/maintain/hotfix/fallback），让 [Unreleased] 段在每次 PR 时即累积变更。
- **Warn-only CI 状态检查**（`verify-develop-prebumped.yml`）：post-release 72h 宽限窗口之外报 workflow summary 警告，永不 `exit 1`。

Boundary:

- **In-scope**: marketplace 顶层 `VERSION` + `marketplace.json metadata.version` + `README.md` badge 的预 bump；5 类 PR 模板 CHANGELOG checkbox 覆盖；develop push 时的 warn-only CI 检查。
- **Out-of-scope**:
  - Plugin 级 `plugin.json` 预 bump（dual-layer versioning 隔离原则）。
  - Hotfix 与预 bump 的冲突处理（暂无 hotfix 高频场景；RUNBOOK §4.5 加 TODO 标记，待首次事件再补 §4.6）。
  - CHANGELOG [Unreleased] 的 CI 守门（暂依赖 PR review 纪律；6 个月内若漏更新频次高再追加 warn-only CI）。
- **Open questions**:
  - 72h 宽限窗口是否合适？暂按经验值；若观察到 false-positive 频次高再调。

## §3 Consequences

### §3.1 Positive

- `develop VERSION > main VERSION` 成为 marketplace 内部的硬不变式：肉眼可见 "develop 是否领先 main"，回答 release readiness 不再需要 git log / CHANGELOG 二次确认。
- Warn-only CI 在 release 后 72h 未预 bump 时主动提醒，闭合 "忘记预 bump" 这类 hygiene 风险。
- CHANGELOG PR 纪律覆盖 5 类 PR 模板，让 [Unreleased] 段在每次 PR 时即累积，避免 release-time 集中回忆累积变更（v4.5.0 → v4.6.0 期间 [Unreleased] 段在 release-cut 时为空就是该问题的实例）。
- 与既有 4-layer drift defense（PR #109 + #114 + #115 + #117）形成互补：drift defense 防止 VERSION 漂移，pre-bump invariant 防止 VERSION 停滞。

### §3.2 Negative

- Develop 的 `README.md` badge 在预 bump 后显示 "4.6.1"，但 `v4.6.1` release 尚未发布 —— 通过 README 脚注 + CLAUDE.md Key Conventions 段澄清 "develop badge = 预计下一个 release 号"。
- 每次 release 多 1 个 commit（预 bump commit），develop history 比 main 多一个标记位。
- Hotfix 流程未预先处理与预 bump 的冲突，未来首次 hotfix 时需 ad-hoc 解决。

### §3.3 Risks

- **README badge 误导**：develop 浏览者看到 4.6.1 误以为已发布。**Mitigation**: README + CLAUDE.md 加脚注；引导用户用 release 页 / main 分支安装。
- **CI 检查误报**：72h 宽限不够（如维护者周末发版周一才预 bump）。**Mitigation**: warn-only，永不阻塞；可观察后调阈值。
- **Plugin 级版本被误连带 bump**：本 ADR 明确不连带，但维护者需记忆。**Mitigation**: RUNBOOK §3.7 写明 "仅 bump 顶层 VERSION，不动 plugin.json"。

## §4 Alternatives Considered

### §4.1 Option A: 完全不动（保持现状）

- **Pros**: 零改动；现有 CHANGELOG `[Unreleased]` 已经是"是否累积"的权威信号。
- **Cons**: release readiness signal 仍需 git log / CHANGELOG 二次确认；不解决 §1 Context 的 ambiguity 问题。
- **Why rejected**: 不解决用户实际遇到的疑问场景；invariant 缺失。

### §4.2 Option B: 采用 `-dev` / `-SNAPSHOT` 后缀风格（Maven 习惯）

- **Pros**: 语义最明确；develop badge 显示 "4.7.0-dev" 一眼可知是预发布。
- **Cons**: 需放宽 `release.yml` semver 校验（当前严格 `^\d+\.\d+\.\d+$`）；CI README badge 校验逻辑需重写；marketplace 现有 `bump-version.ps1` 也需改写 regex；改动面比 pure patch 大得多。
- **Why rejected**: blast radius 不成比例（同等 invariant 价值，但需改 3 处 CI/script）。

### §4.3 Option C: 在预 bump 之上额外引入 `plans/[PLAN]_Release_vX.Y.Z.md` 审计文档

- **Pros**: 每次 release 都有独立 audit doc；追溯最完整。
- **Cons**: 违反 `[STANDARD]_AI_Engineering_Execution_HITL_Prompt` §4.3 "marketplace 不维护 plans/ 目录"；且 marketplace `CHANGELOG.md` 现有详细 release narrative（v4.6.0 entry 含 per-PR breakdown + 4-layer defense table + root cause + lessons）已承担同等审计职能 —— 追加 `plans/` 是冗余。
- **Why rejected**: STANDARD 是 marketplace 工作流 single source of truth，违反它需要先发起 STANDARD revision ADR；且 CHANGELOG 已覆盖 audit 需求。

### §4.4 Option D: 把 release 审计迁到 `docs/postmortem/[POSTMORTEM]_Release_vX.Y.Z.md`

- **Pros**: 不违反 STANDARD（POSTMORTEM 是 Framework v1.5 6 tag 之一，`docs/postmortem/` 目录已就位）；不创建新 `plans/` 目录。
- **Cons**: POSTMORTEM 模板语义是 INCIDENT（Severity P0-P3 / Root Cause / Impact / Remediation），与 "成功 release 的审计记录" 语义不匹配；正常 release 套 INCIDENT 框架会产生误导。
- **Why rejected**: 语义错位比目录命名问题更严重；POSTMORTEM 应保留给真正的事故场景。

## §5 Implementation Plan

1. Create this ADR (in original PR #120)
2. Update `docs/runbook/[RUNBOOK]_Release_Operations.md` v1.2 → v1.3：
   - Add §3.7 "Post-release develop 预 bump"
   - Add §6 checklist 项 "release 完成后 72h 内 develop 已预 bump"
   - Add §4.5 hotfix TODO 标记
3. Update 4 PR templates (`documentation.md` / `maintain.md` / `hotfix.md` / `PULL_REQUEST_TEMPLATE.md`) 加 CHANGELOG checkbox
4. Update `README.md` + `CLAUDE.md` 加 develop badge 脚注
5. Update `.claude/skills/mp-doc-bump-version/SKILL.md` 加 post-release pre-bump 使用场景
6. Add `CHANGELOG.md` 新的空 `[Unreleased]` stub
7. Execute first pre-bump: `pwsh ./scripts/bump-version.ps1 -From 4.6.0 -To 4.6.1`（在 PR #120 中作为机制启动点）
8. Create `.github/workflows/verify-develop-prebumped.yml`（在 step 7 之后落地，否则该 workflow 自己引入即报 warn）

Related documentation updates:

- `[RUNBOOK]_Release_Operations.md`: bump v1.2 → v1.3，加 §3.7 / §4.5 TODO / §6 checklist
- `README.md` + `CLAUDE.md`: 加 develop badge 脚注
- `.claude/skills/mp-doc-bump-version/SKILL.md`: 加 post-release 场景
- 4 个 PR 模板补 CHANGELOG checkbox

## §6 Acceptance Criteria

- [x] `bump-version.ps1 -From 4.6.0 -To 4.6.1 -DryRun` 输出 3 文件预期变更（VERSION / marketplace.json / README.md）
- [x] develop 上首次预 bump commit 落地后，`git show develop:VERSION` = 4.6.1, `git show main:VERSION` = 4.6.0
- [x] `verify-develop-prebumped.yml` 在 develop push 时触发，输出 `OK: develop pre-bumped`
- [x] PR 模板 4 文件均含 CHANGELOG checkbox（feature/bugfix/documentation/maintain/hotfix 5 类 PR 全覆盖）
- [x] README + CLAUDE.md 含 develop badge 脚注，说明 "develop badge = 预计下一个 release 号"
- [x] RUNBOOK v1.3 §3.7 详述预 bump 步骤；§4.5 含 hotfix TODO 标记
- [x] CI `Validate README badge matches VERSION` 步骤在 develop 上 PR 仍 pass（badge=4.6.1 = VERSION=4.6.1）

## §7 References

- Issue: 无（直接 ADR 驱动；起源于维护者对 develop=main 版本号语义的疑问）
- Plan: `~/.claude/plans/https-github-com-mj-agentlab-mj-agentlab-velvet-moonbeam.md`
- Related STANDARD: `[STANDARD]_AI_Engineering_Execution_HITL_Prompt` v1.4 §0.3（独立性原则）/ §0.4（不维护 plans/ 约束）/ §4.3
- Related RUNBOOK: `[RUNBOOK]_Release_Operations` v1.3（本 ADR 落地后的版本）

## §8 Decision Log

| Date | State | By | Note |
|------|-------|----|------|
| 2026-05-18 | proposed | ranzuozhou | 初稿；4 选项分析 |
| 2026-05-18 | accepted | ranzuozhou | 用户确认 3 机制 + drop release plan doc；执行 Implementation Plan（PR #120）|
| 2026-05-18 | revised | ranzuozhou | v1.0 → v1.1: scrub 外部项目引用 per STANDARD §0.3（独立性原则）；技术决策不变（follow-up PR）|
