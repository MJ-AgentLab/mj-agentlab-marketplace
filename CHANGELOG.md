# Changelog

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### Fixed

- **`scripts/safe-bulk-cleanup.ps1`** `-IncludeRemote` 路径 P3 解析 bug — `git for-each-ref refs/remotes/origin/` 把 HEAD symbolic ref 返回为裸 `origin`（不是 `origin/HEAD`），原 filter `Where-Object { $_ -ne 'origin/HEAD' }` 漏过，导致 dry-run 错误显示 `git push origin --delete origin` 为候选命令。修复：改用 `Where-Object { $_ -match '^origin/.+' }` 强制 `origin/` 前缀 + 至少 1 字符后缀。Bug 被脚本本身的 dry-run-default + candidate 列表打印 + 多层 protected-branch refusal 拦截，无实际删除风险。Smoke test in clean develop env: OLD filter → 1 bogus `origin` candidate; NEW filter → 0 candidates。

### Added

- **`docs/postmortem/[POSTMORTEM]_2026-05-18_Bulk_Cleanup_Trap_Analysis.md`** — 项目首份 POSTMORTEM 文档（填补 Framework v1.5 §2.4 `docs/postmortem/` placeholder）。记录 2026-05-18 bulk branch cleanup 触发的 3 个 trap：(1) `git branch` `+` 前缀漏过滤导致 local `main` 误删；(2) local `git branch -d` 不动 remote，audit 用语 "sync with" 歧义误导；(3) Windows Git Bash 把 `gh api /repos/...` 改写成 Windows 路径。Severity P3（恢复，0 数据丢失）。
- **`scripts/safe-bulk-cleanup.ps1`** — 安全 bulk cleanup 脚本。封装 pre-flight 4-check + 3-trap-aware 删除：使用 `git for-each-ref`（避开 Trap #1 前缀问题）+ 多层 protected-branch refusal + dry-run-default（必须显式 `-Apply`）+ opt-in `-IncludeRemote`。镜像 `bump-version.ps1` 风格（StrictMode + 彩色输出 + `.SYNOPSIS`/`.DESCRIPTION` 注释块）。
- **`.claude/skills/mp-git-cleanup/SKILL.md`** §Bulk Cleanup Mode — 新章节（在 Step 7 之后）。3 traps inline 含错误/正确写法对照 + Pre-flight 4-check + 指向 `safe-bulk-cleanup.ps1`；revised "DOES NOT DO" 反映 GitHub `delete_branch_on_merge=true` v4.6.2+ 启用现实；扩 Anti-patterns 加 3 条 (Bulk mode) / (Windows) 项目。

### Changed

- **`docs/runbook/[RUNBOOK]_Release_Operations.md`** v1.3.1 → v1.3.2 — §2.6 + §3.7 加 cleanup callout box，指向 mp-git-cleanup §Bulk Cleanup Mode + `safe-bulk-cleanup.ps1`；frontmatter `related[]` 加 POSTMORTEM_2026-05-18 引用。Procedural commands 完全不变。
- **`.claude/skills/mp-git-merge-gate/SKILL.md`** Step 4 — 加 Windows Git Bash 警告 callout (`gh api` 端点 leading slash 改写)。
- **`docs/guide/[GUIDE]_Contributing.md`** v1.0 → v1.1 — §Bare Repo + Worktree 加 "`git branch` 输出前缀（worktree 模式特有）" 子段，列 3 prefix (`  ` / `* ` / `+ `) 含义 + 过滤脚本必须用 `[ *+]` 警告 + 交叉引用 mp-git-cleanup §Bulk Mode + POSTMORTEM。

## [4.6.1] - 2026-05-18

This release introduces the **develop post-release pre-bump mechanism** (per [`[ADR]_Develop_PreBump_Adoption`](docs/adr/[ADR]_Develop_PreBump_Adoption.md)). The release itself is **the first cycle through the new mechanism end-to-end** — VERSION was already pre-bumped on develop during PR #120 (4.6.0 → 4.6.1), so this release branch only promotes `[Unreleased]` → `[4.6.1]` without a separate bump step. After merge, `release.yml` auto-tags `v4.6.1`, then the standard sync-main-to-develop + next pre-bump (4.6.1 → 4.6.2) closes the loop.

No plugin behavior change for end users. learn-kit stays at v1.2.0 (no plugin bump). Marketplace patch bump v4.6.0 → v4.6.1.

### Added

- **Develop post-release pre-bump 机制** — 每次 release + sync-main-to-develop 完成后，在 develop 上额外 `bump-version.ps1 -From X.Y.Z -To X.Y.(Z+1)` 一个 commit，让 `develop VERSION > main VERSION` 成为 marketplace 内部硬不变式 —— 肉眼可见 develop 是否领先 main，回答 release readiness 不再需要 git log / CHANGELOG 二次确认。Pure patch 风格无 `-dev` 后缀；只 bump 顶层 VERSION，不连带 plugin.json。详见 [docs/adr/[ADR]_Develop_PreBump_Adoption.md](docs/adr/[ADR]_Develop_PreBump_Adoption.md)。
- **`docs/adr/[ADR]_Develop_PreBump_Adoption.md`** v1.0 → v1.1 — 决策文档：3 项机制（pre-bump + CHANGELOG PR-time 纪律 + warn-only CI 检查）；不采用 `plans/[PLAN]_Release_*.md` audit doc 模式（违反 `[STANDARD]_AI_Engineering_Execution_HITL_Prompt` §4.3；marketplace `CHANGELOG.md` 已承担同等审计职能）。v1.1 scrub 外部项目引用 per STANDARD §0.3（regression fix from initial v1.0）。
- **`.github/workflows/verify-develop-prebumped.yml`** — warn-only CI 工作流：develop push 时检查 `develop VERSION > main VERSION` 是否成立；若等于且距 main 最后 commit 已 ≥ 72h，输出 workflow summary 警告（永不 `exit 1`）。路径触发：`VERSION` 或 workflow yml 自身改动。
- **PR 模板 CHANGELOG checkbox 全覆盖** — `documentation.md` / `maintain.md` / `hotfix.md` / `PULL_REQUEST_TEMPLATE.md` (fallback) 4 个模板补齐 `[Unreleased]` checkbox，与 `feature.md` / `bugfix.md` 现有项目对齐，5 类 PR 全覆盖。
- **首次预 bump 执行**：PR #120 含 `infra(release): pre-bump develop 4.6.0 -> 4.6.1 (post-v4.6.0)` commit 作为新机制启动点。

### Changed

- **`docs/runbook/[RUNBOOK]_Release_Operations.md`** v1.2 → v1.3 → v1.3.1：v1.3 新增 §3.7 "Post-release develop 预 bump" + §4.5 hotfix 与预 bump 冲突 TODO 标记 + §6 发布后检查清单加 1 项 "72h 内完成预 bump"；v1.3.1 scrub frontmatter summary + revision + §3.7 callout 中的外部项目引用 per STANDARD §0.3。
- **`README.md`** — 加 develop badge 语义脚注（"develop branch badge = 预计下一个 release 号"）。
- **`CLAUDE.md`** — Key Conventions 段加 2 项：post-release pre-bump 机制 + develop README badge 语义说明；引用新 ADR + RUNBOOK §3.7。
- **`.claude/skills/mp-doc-bump-version/SKILL.md`** — Step 1 scope 表加 "post-release pre-bump" 第 4 行 + 5-bullet 子段详述触发 / 执行 / commit 格式 / 不动 plugin.json / README badge 副效应。
- **`docs/INDEX.md`** v4.5 → v4.6 → v4.6.1：v4.6 加 [ADR]_Develop_PreBump_Adoption 行 + RUNBOOK 行 update；v4.6.1 scrub ADR row description 中的外部项目引用 per STANDARD §0.3。

### Fixed

- **PR #121 (follow-up to PR #120)** — scrub cross-project references introduced by PR #120 across 4 governance surfaces (ADR / RUNBOOK / CHANGELOG `[Unreleased]` / INDEX ADR row), 17 → 0 refs. Technical decisions unchanged; reframed with marketplace-internal rationale per `[STANDARD]_AI_Engineering_Execution_HITL_Prompt` §0.3 independence principle. Historical CHANGELOG entries (v3.0.0+ release narratives) intentionally preserved (revisionist removal would falsify history).

### Release-Engineering Note

This is the **first release executed under the pre-bump model**. Differences from pre-v4.6.1 release flow:

| Step | Pre-v4.6.1 (legacy) | v4.6.1+ (pre-bump model) |
|------|---------------------|--------------------------|
| Release branch creation | from develop | from develop (unchanged) |
| VERSION bump | `bump-version.ps1 -From X.Y.Z -To Y.Z.W` on release branch | **already done on develop** as pre-bump commit; no bump on release branch |
| CHANGELOG transition | on release branch | on release branch (unchanged) |
| Release commit | `infra(release): bump marketplace X.Y.Z -> Y.Z.W` | `infra(release): release v4.6.1 (VERSION pre-bumped on develop)` |
| Post-merge | sync-main-to-develop | sync-main-to-develop **+ pre-bump 4.6.1 → 4.6.2** |

RUNBOOK §3.2 / §3.4 wording was authored under legacy model; will be polished in a future minor revision to reflect the pre-bump variant inline. For now the v1.3 §3.7 callout + this CHANGELOG note are the canonical guidance for the new flow.

## [4.6.0] - 2026-05-18

This release ships the **post-v4.5.0 drift-defense quartet** — 5 PRs that fix the root-cause + build 4 redundant layers of protection against README/CLAUDE.md badge drift recurring:

- **#109** — root `README.md` + `CLAUDE.md` content refresh (badge `4.4.8` → `4.5.0`; learn-kit `1.1.0` → `1.2.0`; 5 broken doc links fixed) + NEW `ci.yml` step «Validate README badge matches VERSION» as **blocking guard** (drift fails CI)
- **#114** — `[RUNBOOK]_Release_Operations` v1.0 → v1.1: §3.2 rewrites `scripts/bump-version.ps1` invocation from advisory to **MANDATORY** (`[!IMPORTANT]` callout) + NEW §3.2.1 «Post-bump verification (MANDATORY)» with 3 checks (README in diff / CLAUDE.md grep / Quintangle 5-site sed alignment) + §6 release checklist adds 3 NEW pre-checks + 1 post-check (visual badge verify)
- **#115** — `scripts/bump-version.ps1` extended: plugin-scope now auto-patches `CLAUDE.md` plugin-line via scoped regex `` (`<PluginName>` v)<EscapedFrom>`` ; pre-existing marketplace.json `[^}]*` regex bug fixed (had silently SKIPped marketplace.json for every plugin bump where description contained `}` — e.g., post-v4.5.0 `[GUIDE]_LearnKit_{Pedagogy,Design}.md` mention). Script now genuinely covers all 5 Quintangle sites. RUNBOOK bumped v1.1 → v1.2 to reflect CLAUDE.md auto-coverage.
- **#116** — Corpus-wide post-v4.5.0 stale-content audit (3 parallel Explore agents + post-edit grep). Fixed **25 broken renamed-doc references** across 18 files (`docs/CONTRIBUTING.md` + `docs/MIGRATION_GUIDE.md` references that pointed to pre-PR-103 paths). Also `v1.2 → v1.5` Framework version drift in `mp-doc-validate` SKILL + `v4.0.0 → v4.5.0` in `mp-flow-intake` + 3 historical-context notes in `mp-git-pr` (preserving v4.1.0-era examples as real-world demos).
- **#117** — NEW `.github/workflows/readme-badge-suggest.yml` — **GitHub Suggested Change bot**. When README badge drifts from VERSION, posts a review comment on `README.md` line 3 with a ` ```suggestion ` block; contributor clicks "Commit suggestion" to apply the fix in 1 click. Sticky via marker `<!-- readme-badge-suggest-bot -->`; auto-resolves when drift fixed (no ghost suggestions). Defense-in-depth UX layer over #109's blocking guard.

**End state — 4-layer drift defense in place**:

| Layer | PR | Mechanism |
|-------|-----|-----------|
| **Blocking** | #109 | `ci.yml` fails CI on drift |
| **Process** | #114 | RUNBOOK §3.2 MANDATORY use of script |
| **Automation** | #115 | Script covers all 5 Quintangle sites |
| **UX** | #117 | Suggested Change bot for 1-click fix |

Plus #116 ensures the rest of the doc corpus is current with v4.5.0 path renames.

No plugin behavior change for end users. learn-kit stays at v1.2.0 (no plugin bump). Marketplace minor bump v4.5.0 → v4.6.0.

### Fixed

- **Audit-wide renamed-doc references** (PR #116 closes #113) — fix **25 broken references** across **18 files** that still pointed to the pre-v4.5.0 paths `docs/CONTRIBUTING.md` + `docs/MIGRATION_GUIDE.md` (both renamed by PR #103). Affected: 7 docs/** files (1 ADR frontmatter + 2 STANDARD body + 4 GUIDE prose+links), 6 `.claude/skills/**/SKILL.md` (wikilink form), 5 `.github/ISSUE_TEMPLATE/*.md` (GitHub absolute URLs that 404'd post-rename). Discovery: 3 parallel Explore agents found 19 items; post-edit grep caught 6 more in ISSUE_TEMPLATE (outside original audit scope). Historical references KEPT in CHANGELOG entries + ADR Decision tables + revision blocks + migration-guide §3.2 path mapping (those describe the rename event itself).
- **`README.md`** — refresh stale content post-v4.5.0: badge `4.4.8` → `4.5.0`; learn-kit plugin-table cell `1.1.0` → `1.2.0`; fix **5 broken links** (3× `docs/MIGRATION_GUIDE.md` → `docs/guide/[GUIDE]_Migration_From_v3_to_v4.md` + 2× `docs/CONTRIBUTING.md` → `docs/guide/[GUIDE]_Contributing.md`; both moved by PR #103). **Root cause**: last 4 release-bump commits (v4.4.9 / v4.4.10 / v4.4.11 / v4.5.0) skipped `scripts/bump-version.ps1` so README never got version sync.
- **`CLAUDE.md`** — refresh stale content post-v4.5.0: learn-kit `v1.0.0` → `v1.2.0` mention; `docs/` Project Structure line rewritten to reflect 5-subdir structure + renamed migration guide path; Documentation Framework heading adds `当前 v1.5 / marketplace v4.5.0` suffix + STANDARD list shows v1.5 / v1.1 versions; docs/ tree drops `CONTRIBUTING.md` + `MIGRATION_GUIDE.md` from exempt line (only `INDEX.md` exempt per Framework v1.5 §1 special clause), converts «PR 3 / PR 4 (will move)» future-tense to completion-state, adds `archive/` flat layout line; `MIGRATION_GUIDE.md` link in v4.0.0 Restructure Note → renamed path; HITL STANDARD reference `(v1.2)` → `(v1.4)`; «历史版本记录» fills 4.0.0 → 4.5.0 gap with v4.1.0 + v4.2.0 + v4.3.x-4.4.11 + v4.5.0 entries.

### Added

- **`.github/workflows/ci.yml`** — NEW step «Validate README badge matches VERSION» appended after «Validate version consistency». Guards against the silent badge drift that produced the v4.4.8-stuck-while-on-v4.5.0 postmortem. Fails CI if `README.md` line 3 badge encodes a different `X.Y.Z` than the `VERSION` file. Error output suggests both manual-edit fix + `bump-version.ps1` command. Runs on all PRs + branch pushes (no `release/*` skip).
- **`.github/workflows/readme-badge-suggest.yml`** (PR #117 closes #112) — NEW PR Suggested Change bot. Triggers on `workflow_run` after `CI — Validate Plugin Structure` completes; checks README badge vs VERSION; if drift exists, posts a GitHub review comment on README.md badge line with a ` ```suggestion ` block. User clicks "Commit suggestion" to apply the fix in 1 click (no local edit needed). Sticky semantics via marker `<!-- readme-badge-suggest-bot -->` — DELETE+POST on each push so the suggestion always anchors to the current commit_id. Auto-resolves the marker comment when drift is fixed (avoids ghost suggestions). Uses `pulls/{n}/comments` API (review comments anchored to file+line — required for Suggested Change syntax) vs `comment-on-pr.yml` which uses `issues/{n}/comments` (general PR comment) — distinct concerns, separate workflows for SRP. Defense-in-depth UX layer over PR #109's blocking CI guard.

### Changed

- **`.claude/skills/mp-doc-bump-version/SKILL.md`** — promote «Version Triangle (4-site)» → «Version Quintangle (5-site invariant)»: add README.md badge + plugin-table cell + CLAUDE.md plugin line. Frontmatter description extends version-bearing-files list. Step 7 Verify adds 3 new sed-based checks (cross-platform: `grep -P` is locale-sensitive on Windows git-bash) + cross-references ci.yml's new CI guard. Anti-patterns expand "4 sites" → "5 sites" + add explicit 4-release silent-drift postmortem note. **(PR #115 update)** Overview comment + anti-pattern wording updated to reflect CLAUDE.md is now automatically covered by the script (Issue #110 closed).
- **`docs/runbook/[RUNBOOK]_Release_Operations.md` v1.0 → v1.1 → v1.2** (closes #111 + #110) — **v1.1** makes `scripts/bump-version.ps1` invocation **MANDATORY** in the release workflow (not advisory). §3.2 rewritten as `[!IMPORTANT]` callout with PR #109 postmortem context + CI safety-net cross-ref. NEW §3.2.1 «Post-bump verification (MANDATORY)» with 3 checks: README in diff / CLAUDE.md grep / Quintangle 5-site sed alignment. §3.4 git add list explicitly includes `README.md` + `CLAUDE.md`; commit message example switched to canonical `infra(release): bump marketplace X.Y.Z -> Y.Z.W`; cross-ref `validate-commits.sh`. §6 发布前检查清单 加 3 NEW checkboxes + 发布后 加 1 visual badge verify. NEW §7 版本历史 + §8 (renumbered from §7) 相关文档. Fix line 350 `../CONTRIBUTING.md` → `../guide/[GUIDE]_Contributing.md` (was broken since PR #103 v4.5.0 rename). **v1.2** (same PR batch via #115) updates §3.2.1 step 2 + §6 item 3 wording to reflect CLAUDE.md is now auto-covered by the script (Issue #110 closed); grep retained as last-line defense.
- **`docs/INDEX.md`** — Runbooks 表 `Release Operations` 行 last-verified `2026-05-14` → `2026-05-18` + description 加 v1.2 changelog 摘要.
- **`scripts/bump-version.ps1`** (PR #115 / closes #110) — Add CLAUDE.md plugin-line auto-patch for plugin-scope bumps (3rd file-type branch in foreach loop with backtick-anchored scoped regex `` (`<PluginName>` v)<EscapedFrom>`` so it only touches the `plugins/` section, not narrative version mentions in `历史版本记录` etc.). Plugin-scope TargetFiles now includes `CLAUDE.md`. **Bug fix** (discovered while testing #110): marketplace.json plugin-entry regex `[^}]*` stopped at first `}` (including `}` inside description strings like `[GUIDE]_LearnKit_{Pedagogy,Design}.md`), silently SKIPping marketplace.json for every plugin bump where description contained literal braces — fixed with `[\s\S]*?` non-greedy match. bump-version.ps1 now genuinely covers all 5 Quintangle sites; "use the script" promise in RUNBOOK v1.1 is now executable.
- **`.claude/skills/mp-doc-validate/SKILL.md`** (PR #116 closes #113 — version-drift batch) — replace_all `v1.2` → `v1.5` (7 occurrences): description / Overview / Check 7b header / Check 8 header / Check 12 header / Reference Files line. Documentation Framework authority is now v1.5; references claiming v1.2 misled readers about which §section numbering applied. Unrelated version mentions (v1.0 RUNBOOK / v1.3 Step 2.7 historical / v1.4 §2.3.5 flat layout) correctly preserved by substring scope.
- **`.claude/skills/mp-flow-intake/SKILL.md`** (PR #116) — line 123 HITL trigger #9 secrets example: `v4.0.0` → `v4.5.0` + annotation `— 架构性 trigger 非时间性` clarifying the trigger is architectural (not version-anchored).
- **`.claude/skills/mp-git-pr/SKILL.md`** (PR #116) — add 3 inline historical-context notes around the v4.1.0 PR examples (sections: 示例 list / 示例 PR_BODY.md / Output Format). Preserves historical PR-body text as real-world demonstration material; clarifies that current HITL STANDARD is v1.4, not v1.1 from the original example era. Approach chosen over "replace with v1.4 example" to retain learning value.

## [4.5.0] - 2026-05-18

This release rolls up 5 PR batches since v4.4.11 — `v4.5.0` umbrella version covers all 5:

- **#99** — flat archive layout (`docs/archive/<subtype>/` → `docs/archive/`; `[TAG]_` prefix-encoded; Framework v1.3 → v1.4)
- **#100** — HITL Prompt STANDARD v1.2 → v1.3 integrates archive mechanism as HITL dimension (companion to #99)
- **#103** — Documentation Framework v1.5 §1 exemption cancellation + HITL v1.4 §0 universal skeleton + learn-kit 1.2.0 docs consolidation (6 lowercase teaching files → 2 `[GUIDE]` files)
- **#104** — Marketplace independence audit cleanup (14 files neutralized — `mj-system` / `mj-agent` cross-project references purged in scope; closes #101)
- **#105** — Commit-validation P0+P1 local layer (scripts + 3 skills + STANDARD §11 «Common Mistakes»; pre-push hook)
- **#106** — Commit-validation P2 CI feedback layer (ci.yml delegation to `validate-commits.sh` + `comment-on-pr.yml` sticky PR bot)

**End state**: 8-layer commit-validation stack deployed (commit-msg → pre-push → script → mp-git-commit Step 8 → mp-flow-self-review item 8 → mp-git-push checklist item 8 → ci.yml → comment-on-pr.yml bot); marketplace docs fully independent (no cross-project references in scope); learn-kit teaching docs consolidated 6 → 2 `[GUIDE]`; Framework §1 exemption mechanism replaced with 5-class community/external-spec exclusion.

### Added

- **`.github/workflows/comment-on-pr.yml`** (#106 — NEW) — PR comment bot. Triggers on `workflow_run` after `CI — Validate Plugin Structure` completes; posts (or edits in-place via marker `<!-- validate-commits-bot -->`) a sticky PR comment with the validator's full output. Different shape for PASS («✅ All Pass» collapsed) vs FAIL («❌ Failed» expanded + 5-step how-to-fix inline). `workflow_run` trigger pattern keeps fork PRs safe — gets BASE-repo token + `pull-requests: write`; ci.yml itself stays restricted. Uses `gh` CLI; minimal permissions (`pull-requests: write` + `actions: read` + `contents: read`). Skips silently if no artifact (e.g., release/* branches).
- **`scripts/validate-commits.sh` + `scripts/validate-commits.ps1`** (#105 — NEW) — bulk validator for marketplace commit subjects. Dual-language (bash + PowerShell) parity; same interface, exit codes, output formatting. Per-commit failure output diagnoses specific reason (type / scope / length) + targeted suggestion (e.g., «'chore' is NOT in marketplace's 7-type enum; use 'docs', 'refactor', or 'infra'»). Closes the diagnostic gap that caused PR #102's late-binding CI failure + reconstruction cycle.
- **`docs/adr/[ADR]_Documentation_Framework_Exemption_Reversal.md` v1.0** (#103 — NEW) — marketplace-scope ADR recording v1.5's reversal of v1.1 exemption decision. Structure: Status / Context (marketplace independence principle + actual-dependency audit + Framework v1.4 flat archive infrastructure prerequisite) / Decision (5-class exclusion + INDEX special clause + 7-item disposition) / Alternatives Considered (4 declined options including a 3-layer governance v2.0 candidate) / Consequences (positive / negative / risks) / Future Work (v2.0 / 3-layer governance / POSTMORTEM tag / INDEX automation) / References. `supersedes: ../archive/[DEPRECATED]_[ADR]_Documentation_Framework_Exemption_Review_v1.0.md`; includes revision block.
- **`plugins/learn-kit/docs/guide/[GUIDE]_LearnKit_Pedagogy.md` v1.0** (#103 — NEW) — pedagogy compendium (~600 lines) merging `learn-kit-01-positioning.md` (222) + `learn-kit-02-eight-stage-methodology.md` (269) + `learn-kit-03-rfc-2119-worked-example.md` (274). Covers §1 Positioning (vs 6 competitors + N=5 cross-domain validation + 8 «when NOT to use» criteria) + §2 8-stage methodology (5 elements per stage) + §3 RFC 2119 worked example (traffic-light metaphor + 5 categories + 8-stage mapping + 6-quality-gate pass verification) + §4 Quality Gates + 8 cross-stage anti-pattern quick reference.
- **`plugins/learn-kit/docs/guide/[GUIDE]_LearnKit_Design.md` v1.0** (#103 — NEW) — design compendium (~600 lines) merging `learn-kit-04-three-skills.md` (615) + `learn-kit-05-governance-boundary.md` (432). Covers §1 5-skill responsibility split + closed-loop diagram + 8 design-tradeoff highlights + §2 shared project_profile recognition + §3 5 dogfood findings + §4 Parallel subsystem governance model + §5 5-class rules (naming / paths / frontmatter / INDEX / archive) + §6 v1.0.0 dependency matrix + version evolution strategy + generalization tradeoffs + governance decision quick reference.

### Changed

- **`scripts/install-hooks.ps1`** (#105) extended with **pre-push hook installer** (alongside existing commit-msg). The pre-push hook delegates to `scripts/validate-commits.sh` (single source of validation logic) — catches violations introduced via `git commit --amend` / `git cherry-pick` / `git rebase` that bypass commit-msg. Opt-in (re-run installer to activate); zero impact on contributors who don't.
- **`.github/workflows/ci.yml`** (#106) — «Validate commit message format» step refactored to **delegate to `scripts/validate-commits.sh`**. PATTERN site count: 4 → 3 (script now drives CI too). CI error output now identical to local validator — each FAIL includes targeted «Suggest:» remediation (e.g., 'chore' → docs/refactor/infra). NEW step «Upload commit validation output (for PR comment bot)» tees script output to artifact for downstream consumption by `comment-on-pr.yml`. Release/* PRs skipped (per existing rationale).
- **`docs/rule/[STANDARD]_Commit_Message_Convention.md` v1.0 → v1.1** (#105 + #106) — add §11 «Common Mistakes (post-v4.5.0 lessons)» documenting 4 failure patterns from the PR #102 close-and-rebuild: (§11.1) `chore` type rejected with substitution table; (§11.2) `docs` is a TYPE not a SCOPE; (§11.3) summary > 72 chars with CJK / symbols; (§11.4) `documentation/*` template recommendation vs CI hook reality; (§11.5) local validation workflow. §9.3 rewritten from «Future CI Gates» (forward-looking) to «CI Gates (current)» — 8-layer validation stack table covering all hooks + skills + workflows in deployment. Frontmatter revision block added. Backward compatible — PATTERN regex unchanged.
- **`docs/guide/[GUIDE]_Marketplace_Agent_Execution_Checklist.md`** (#105) — Stage 8 (Commit/Push/PR) Actions段 + Verification checklist 加入 push 前必跑 `scripts/validate-commits.{sh,ps1}` 的强制项。Runtime entry point now naturally flows through the validator.
- **`.claude/skills/mp-git-commit/SKILL.md`** (#105) — NEW Step 8 «Post-commit PATTERN Self-check» after Step 7 Execute. Runs `sh scripts/validate-commits.sh HEAD~N..HEAD` immediately to catch violations before handoff to mp-git-push.
- **`.claude/skills/mp-git-push/SKILL.md`** (#105) — Pre-Push Checklist 7 → 8 items. NEW item 8 «Commit message PATTERN 合规» (BLOCK on fail). Mandatory regardless of pre-push git-hook install state.
- **`.claude/skills/mp-flow-self-review/SKILL.md`** (#105) — Item 8 strengthened from vague «commit message 符合 …» to mandate running `validate-commits.sh` + pasting output to «本地验证» segment; 0 failures gate the stage exit.
- **`docs/rule/[STANDARD]_Documentation_Framework.md` v1.4 → v1.5** (#103) — **取消 §1 豁免机制**（marketplace 独立性 + 文档体系名实相符）。§1 完全重写：删除 12 行 v1.1 单文件 + 教学系列模式豁免表 + 2 个 normative blockquote（v1.1 note + v1.3 normative clarification）；保留 5 类 community/external-spec exclusion（README / CHANGELOG / CLAUDE.md / SKILL.md / templates+references）由外部规范刚性约束不可绕过；新增 INDEX.md「保留名 + 强制 frontmatter」special clause；删除已退役 `plugins/notebooklm-kit/skills/nlm-shared/*.md` 残行；frontmatter 加 revision block；§5 加 v1.5 entry；清理 §2.1 / §2.3.1 / §4.3 / §5 v1.0/v1.2 中所有 cross-project 引用为中性术语。
- **`docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md` v1.3 → v1.4** (#103) — §0 重写 Universal Skeleton + 内化 generic HITL workflow（marketplace 独立性配套）。§0 大改：替换原「适用范围 与外部同名 STANDARD 的关系」整段 → 新 §0「Universal Skeleton & Compression Heritage」含 §0.1 Universal 19-step Skeleton + §0.2 Marketplace Compression Mapping + §0.3 specialized 子流程指引 + §0.4 Scope；§1 opening 改述 + 删除原 17 阶段对照表（mapping 迁 §0.2）；§4.8 line 597 删除外部 STANDARD 对照；§8 添加 v1.4 entry + 清理 v1.0 中 cross-project 引用；frontmatter v1.3 → v1.4 + 删 `related: ../ai_engineering_execution_hitl_workflow.md` + 加 revision block；§1 / §3.3 / §4.3 / §4.7 共 6 处 cross-project 引用清理。
- **`docs/rule/[STANDARD]_Documentation_Framework.md` v1.3 → v1.4** (#99) — §2.3 state table / §2.3.2 archive-path 描述 + YAML / §2.3.3 banner / §2.3.4 frozen-ref 示例 / §2.4 archive filename 规则 全部从 subtype 路径改 flat；新增 §2.3.5 Flat Archive Layout 定义规则 + marketplace 与 plugin-internal 对称 + rationale + historical note。
- **`docs/runbook/[RUNBOOK]_Doc_Archive_Procedure.md` v1.0 → v1.1** (#99) — §1 intro 描述 / §2.1 Step 2.1 表（「Subtype directory」改「Archive root」+ Full archive path 示例）/ §3.1 git mv 路径 / §3.2 `replaced-by:` 示例 / §3.3 banner Superseded by 示例 / §3.4 `supersedes:` 示例 / Step 4.1 INDEX 行模板 / §5 Verification 两条 path 全部同步 flat。
- **`docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md` v1.2 → v1.3** (#100) — **§3.1** 新增 HITL trigger bullet：涉及 doc archive 触发（§2.3.1 四触发器之一）必须暂停按 RUNBOOK 4-phase 走，不得 PR 中混入隐式归档；**§4.2** Repo Scan Rules 从 8 维扩到 9 维，新增 item 9 `docs/archive/` 一致性盘点（active 应归档未归档检查 + INDEX archive 表行 vs 实际文件数）；**§4.4** ADR Prompt Rules 新增 supersede check 判断；**§4.8** Self-review item 12 扩展为含 archive POST-condition 审计；**§5.2** 增 Archive-specific note 把 `/mp-doc-validate` 标注为 archive 审计入口。
- **`docs/guide/[GUIDE]_Marketplace_Agent_Execution_Checklist.md` v1.1 → v1.3** (#100) — Stage 1 Verification 从 8 维 → 9 维 + 加 archive inventory 勾；Stage 7 Verification 从 11 项 → 12 项 + 扩展为含 archive POST-condition；§5 history 加 v1.2 (补同步) + v1.3 双条目。
- **`docs/CONTRIBUTING.md` → `docs/guide/[GUIDE]_Contributing.md`** (#103 — rename) + 加 8 字段 frontmatter + revision block；fix 4 处 `rule/` 相对路径为 `../rule/`；移除 cross-project 引用。
- **`docs/MIGRATION_GUIDE.md` → `docs/guide/[GUIDE]_Migration_From_v3_to_v4.md`** (#103 — rename) + 加 8 字段 frontmatter + revision block；§3.2 path mapping 更新 v4.5.0 各被改/删文件新去向；新增 §4「v4.4.x → v4.5.0」段记录本批次变更；fix §3.9 相对路径。
- **`docs/INDEX.md`** (#99 + #100 + #103 + #104) — 加 8 字段 frontmatter（Framework v1.5 §1 INDEX special clause）；Rules & Standards 表删除 `ai_engineering_execution_hitl_workflow.md` 行 + Framework/HITL 版本号同步（含 v1.4 + v1.5）；Guides 表加 `[GUIDE]_Contributing` + `[GUIDE]_Migration_From_v3_to_v4`；ADR 表 Exemption Review → Exemption Reversal + 旧 ADR 移到 Archived Documents 表；Plugin Documentation 段更新 learn-kit 1.1.0 → 1.2.0 + 教学系列 6 → 2 `[GUIDE]`；archive 概述描述同步 flat layout (v1.4)；Suggested Reading Order 各段路径同步。
- **`plugins/learn-kit/docs/INDEX.md` v1.1 → v1.2** (#103) — 加 8 字段 frontmatter；§Guides 段填入 2 份合规 `[GUIDE]_*` 路径；删除原 §Plugin-Internal Teaching Series 段。
- **`plugins/learn-kit/README.md`** (#103) — 教学系列表 6 行 → 2 行；新增 4 个章节吸收原用户手册内容（中文 TL;DR / 5 分钟上手 / 真实使用案例 / 常见踩坑）；前置依赖段加 legacy plugin 卸载提示；演进历史段移除 cross-project 引用。
- **`plugins/learn-kit/CLAUDE.md`** (#103) — Documentation 段重写指向 2 份合卷；新增 §Advanced Tips。
- **`.claude/skills/mp-flow-intake/SKILL.md`** (#103) — Reference Files 段 + Rules 段更新 CONTRIBUTING 引用路径为新的 `docs/guide/[GUIDE]_Contributing.md`；删除对已删除 `ai_engineering_execution_hitl_workflow.md` 的 reference。
- **`.claude/skills/mp-doc-validate/SKILL.md`** (#99 + #103) — description + Step 2.5 opener 同步 flat archive 路径；Step 1 豁免清单重写为 5 类 community/spec exclusion；Step 2.7 标记为 REMOVED（含 v1.5 cancellation 历史说明）；不再扫描 v1.1 教学系列 + v1.0 single-file 豁免。
- **Marketplace independence audit — 14 files** (#104) — `mj-system` / `mj-agent` cross-project references purged from in-scope marketplace docs + skills + plugin files. Historical references retained ONLY in CHANGELOG (chronicle) + README (evolution narrative) + ADR References (decision provenance). Includes neutralization in: `docs/rule/[STANDARD]_*` (×3) + `docs/guide/[GUIDE]_*` (×2) + `docs/adr/*` (×1) + `.claude/skills/mp-flow-*/SKILL.md` (×4) + `plugins/learn-kit/docs/*` (×2) + `plugins/learn-kit/README.md` (×1) + `plugins/learn-kit/CLAUDE.md` (×1). Closes #101.
- **`.claude-plugin/marketplace.json`** — `metadata.version` 4.4.11 → 4.5.0；`metadata.description` 同步 v4.5.0 changelog + 清理 cross-project 引用；`plugins[0].version` 1.1.0 → 1.2.0 + description 更新。
- **`VERSION`** — 4.4.11 → 4.5.0.
- **`plugins/learn-kit/.claude-plugin/plugin.json`** — version 1.1.0 → 1.2.0 + description 加 v1.2.0 changelog 摘要。
- **`plugins/learn-kit/CHANGELOG.md`** — 追加 1.2.0 entry.

### Removed

- **`docs/ai_engineering_execution_hitl_workflow.md`** (#103) — 删除 generic HITL philosophy fork-source 单文件。关键内容（universal 19-step skeleton + compression mapping + fork guidance）浓缩内化到 `docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md` §0.1-§0.4。Marketplace 不再担任任何外部项目的 fork-source（marketplace 独立性原则）。
- **`plugins/learn-kit/docs/learn-kit-{01..05}-*.md` + `learn-kit-使用手册.md`** (#103) — 6 lowercase teaching series 已合并/拆入 2 份 `[GUIDE]` + README + CLAUDE.md。
- **`docs/archive/{adr,guide,postmortem,rule,runbook,spec}/.gitkeep`** (#99) — 6 个空 placeholder subdir 已被 flat layout 替代（v4.4.0 引入归档机制以来 0 件实际归档，无 migration 成本）；保留 `docs/archive/.gitkeep` 占位。

### Archived

- **`docs/adr/[ADR]_Documentation_Framework_Exemption_Review.md` v1.0** → **`docs/archive/[DEPRECATED]_[ADR]_Documentation_Framework_Exemption_Review_v1.0.md`** (#103) — Trigger: §2.3.1 #4 (scope-redefining rename) — decision reversed by v1.5。Per RUNBOOK v1.1 4-phase + 2-HITL-gate ceremony：加 Archive Banner + `state: archived` + `archived: 2026-05-18` + `replaced-by: ../adr/[ADR]_Documentation_Framework_Exemption_Reversal.md`；INDEX `## Archived Documents` 表加新行。

### Closed Issues

- **#101** — Marketplace independence audit (closed by #104).

## [4.4.11] - 2026-05-15

### Added

- **`docs/rule/[STANDARD]_Documentation_Framework.md` v1.2 → v1.3** — new §1 normative blockquote (inserted after the v1.1 exemption-design note) clarifying frontmatter discipline for §1-exempt files. Files matching either §1 exemption (single-file `docs/ai_engineering_execution_hitl_workflow.md` + plugin-internal teaching series pattern `plugins/<name>/docs/<plugin>-*.md`) MAY (a) omit frontmatter entirely OR (b) carry the canonical 8-field schema, but MUST NOT use legacy non-canonical keys (`title / purpose / audience`) or YAML literal-block-scalar list fields (`related: |` followed by bullet text). Both §1 exemptions remain in v1.3 (single file + teaching series); no path or content change for any other doc.

- **`docs/adr/[ADR]_Documentation_Framework_Exemption_Review.md`** (new ADR, marketplace scope) — records the decision (and full reasoning) for keeping both §1 exemptions in v1.3 rather than revoking and retrofitting the seven currently-exempt files. Two independent design agents (one briefed for revoke + retrofit, one for keep + tighten) converged: keep both. Decisive reasons: (1) `ai_engineering_execution_hitl_workflow.md` is intentionally fork-source for downstream projects (per its own §0) and marketplace-style frontmatter would harm that role; (2) `learn-kit-NN-*` numbered teaching series is structurally fragile under tag-prefix retrofit because future non-numbered LearnKit GUIDEs would sort lexically before `_01_`. §4 Alternatives Considered seriously engages "revoke + retrofit" and "status-quo + INDEX-only fix" as rejected options.

- **`.claude/skills/mp-doc-validate/SKILL.md` Step 2.7** — exempt-file frontmatter discipline check (v1.3+, 2 sub-checks). Enumerates files matching the §1 exemption patterns; for each that DOES carry frontmatter (no-frontmatter files are silently OK), warns on legacy keys (`title / purpose / audience` literal match — Check 14) and on `related: |` literal-block scalar (Check 15). Both emit Warning (not Critical): exempt files remain outside the required-field critical path. Workflow DOT diagram updated (`s2c` node inserted between Step 2.5 and Step 3); Step 4 Categorize table extended; Anti-pattern bullet at line ~344 clarified to call out the new v1.3 scope.

### Changed

- **`docs/INDEX.md` line 11** — Documentation Framework version cell `v1.0` → `v1.3` (drift fix; v1.0 → v1.1 in PR #80, v1.1 → v1.2 in PR #83 — neither propagated to INDEX). Description column also extended to mention the new exemption-frontmatter-discipline clause.

- **`docs/INDEX.md` §"Architecture Decision Records"** — new row added for `[ADR]_Documentation_Framework_Exemption_Review.md`, sitting next to the existing `[ADR]_NotebookLM_Kit_Retirement.md` row.

### Removed

- **Legacy non-canonical frontmatter dropped from 2 §1-exempt files** (per the v1.3 §1 normative clause):
  - `docs/ai_engineering_execution_hitl_workflow.md` — frontmatter (`title / purpose / version / updated / audience / related: |`) deleted; file now starts directly with H1, matching the sibling no-frontmatter teaching docs. Body unchanged. Reason: this doc is intentionally fork-source per its own §0; marketplace-style frontmatter would force every downstream fork (mj-system, future projects) to either strip or inherit irrelevant marketplace bookkeeping.
  - `plugins/learn-kit/docs/learn-kit-使用手册.md` — frontmatter (`title / purpose / version / updated / audience / related`) deleted. Reason: consistency with the other 5 sibling no-frontmatter teaching docs (`learn-kit-01..05`); the previous `version: v1.1.0 / marketplace v4.4.8` field was incorrect-by-design (a teaching doc should not co-version with marketplace releases).

  Information loss: zero. File 1's title / purpose / audience / version / cross-doc-relationships are already explicit in the body §0 three-layer table. File 7's title is already its H1; audience and purpose are explicit in §1 (30 秒认知); sister-doc relationships are documented in `plugins/learn-kit/docs/INDEX.md` §"Plugin-Internal Teaching Series".

### Rationale

User-initiated re-examination of Documentation Framework v1.2 §1 exemptions on 2026-05-15. The original question presupposed the seven currently-exempt files might be non-compliant; the investigation found they are all already compliant via explicit §1 exemptions (single-file + plugin-internal teaching series). However, two genuine soft drifts surfaced: (1) two of seven exempt files mixed legacy non-canonical frontmatter keys with the no-frontmatter pattern, creating a 3-shape state; (2) `docs/INDEX.md` line 11 still listed Documentation Framework as v1.0 although actual frontmatter had been bumped to v1.2.

The keep-and-tighten decision (full reasoning in the new ADR) collapses the 3-shape state into 2 (no-frontmatter or canonical), preserves the two load-bearing exemptions, and pairs the rule tightening with `/mp-doc-validate` Step 2.7 enforcement. Backward compatible — no path or schema change for any other doc.

PR: #96 (merged into develop on 2026-05-15 after rebase to fix `Validate commit message format` CI gate; the original commits used scopes `framework` / `adr` and a type `infra` outside the §4 whitelist + §5 documentation/* matrix; identical diff was rebased with corrected `<type>(<scope>)` headers).

## [4.4.10] - 2026-05-15

### Fixed

- **`.github/workflows/ci.yml`** — Replace YAML literal block scalar `if: |` with folded scalar `if: >-` on the `Validate commit message format` step's condition. The literal block style preserves newlines as `\n` characters in the expression value, which causes GitHub Actions' expression evaluator to return Internal Server Error on `pull_request` events (push events appeared to evade the issue due to short-circuit evaluation on the empty `github.head_ref` field).

  Symptom (post-PR #91 v4.4.8 merge to develop on 2026-05-15):
  - Run #161 (push trigger on `documentation/refresh-stale-versions`): success in 6s
  - Run #162 (pull_request trigger on same branch): **failure after 17m** — job never started, run-level Internal Server Error (Correlation ID `49749753-a162-43d4-bd76-aac9f7088e5e`)
  - Run #163 (pull_request trigger on `release/v4.4.9`, blocking THIS very release): **failure after 17m 38s** — same symptom

  Fix: `if: |` → `if: >-`. The `>` folds newlines into spaces (producing a clean single-line expression value); `-` strips the trailing newline. Multi-line readability preserved in source while emitting a syntactically unambiguous value to GitHub Actions' expression engine.

  Validated by precedent: GitHub Actions docs recommend `>-` for multi-line `if:` conditions. Single-line alternative rejected because the full expression exceeds ~200 chars and harms reviewability.

### Rationale

This release was originally going to be **v4.4.9** (CHANGELOG section preserved below). During release PR #94 CI runs, the YAML defect surfaced and blocked the release. The fix is committed directly on `release/v4.4.9` per release-branch convention (same pattern as v4.4.8 where the release-branch CI exemption was added inline), and the release is re-versioned to **v4.4.10** to reflect the additional change.

### Follow-up

After this release merges to main, a separate maintain PR must sync the `if: >-` fix back to develop (analogous to PR #92 post-v4.4.8). Without that, every future `pull_request` CI run on develop would hit the same wall.

## [4.4.9] - 2026-05-15

### Fixed

- **`README.md`** — Refresh 3 stale version strings discovered during user repo-page review:
  - Line 3: version badge `version-4.0.0-blue` → `version-4.4.8-blue` (matches `VERSION` truth — note this PR's own bump-target `4.4.9` will be reflected by the NEXT badge refresh after this PR merges; intentional one-cycle lag)
  - Line 15: plugin table learn-kit version `**1.0.0**` → `**1.1.0**` (matches `plugin.json` truth)
  - Line 25: nlm-studio description `5 类 × 3 view = 至多 15 个多媒体 artifact` → `4 view-cycled × 3 view + 1 shared mind_map = 至多 13 个多媒体 artifact（HTML 不上传）` (matches the canonical phrasing in marketplace.json plugins[0].description)

- **4 plugin-internal teaching docs** — Refresh "current state" version stamps from `v1.0.0 / v4.0.0 (2026-05-14)` to `v1.1.0 / v4.4.8 (2026-05-15)`. These are the §1-exempt "plugin-internal teaching series" docs; their banners explicitly claim "本文反映 ... 状态" which is a verifiable current-state claim and should track reality:
  - `plugins/learn-kit/docs/learn-kit-01-positioning.md` — banner (line 5) + "现行版本" line (line 106)
  - `plugins/learn-kit/docs/learn-kit-04-three-skills.md` — banner (line 5)
  - `plugins/learn-kit/docs/learn-kit-05-governance-boundary.md` — banner (line 5)
  - `plugins/learn-kit/docs/learn-kit-使用手册.md` — frontmatter `version` + `updated` + "验证应看到" line

  Historical version markers (e.g., "v0.3.0 起", "v1.0（2026-05-14）：加 nlm-studio") preserved unchanged — those describe specific version events.

- **`docs/ai_engineering_execution_hitl_workflow.md`** — `updated: 2026-05-14` → `updated: 2026-05-15` (1-day refresh on the §1-exempt generic HITL philosophy parent doc; content unchanged).

### Rationale

User flagged the README badge "4.0.0" during repo landing page review. Investigation found 3 README items + 5 doc-stamp items + 1 HITL date all stale relative to the v4.4.8 release that just shipped. None of these are functional bugs — purely "version-truth drift" from the v4.0.0 baseline that accumulated across the v4.4.x patch cycle.

The exemption-vs-migration assessment performed during planning concluded: **no docs need migration into the framework or archival**. The §1 exemption rules correctly classify all named docs. The 8 fixes here are pure version-stamp polish on already-exempt docs (filename / classification unchanged).

### Skipped (intentional)

- **`learn-kit-04-three-skills.md` filename** — covers 5 skills but filename says "three" (historical: v0.2.0 had 3 skills). Filename rename `-three-` → `-five-` would change the pedagogical-numbering reference path and is invasive; the doc body already explains the history inline. Keep as-is per assessment.
- **`learn-kit-02-eight-stage-methodology.md` + `-03-rfc-2119-worked-example.md`** — neither carries a "current state" version stamp; content is methodology / worked-example reference, version-independent. Nothing to refresh.

## [4.4.8] - 2026-05-15

> **Release v4.4.8 ships everything from v4.0.0 → v4.4.8** (the v3.2.1 → v4.x integration finally reaches main). Cumulative theme: **Documentation Framework v1.2 + archive mechanism + skill hardening + CI enforcement**.

### Release Summary — what this release brings (cumulative since last main release v3.2.1)

| Sub-version | Highlights |
|---|---|
| [4.0.0] | Retire notebooklm-kit plugin; absorb core multimedia scenarios into learn-kit (`/learn-kit:nlm-studio`); marketplace converges to 1 plugin |
| [4.1.0] | Add 18 project-local `mp-*` workflow skills under `.claude/skills/` (9 mp-flow-* + 6 mp-git-* + 3 mp-doc-*) |
| [4.2.0]-[4.2.1] | Documentation Framework v1.0 — 6 tag prefixes / 8-field frontmatter / 3-state machine / 3 STANDARDs / 2 SPECs / 6 templates; v4.2.1 retrofits 8 existing docs into framework subdirs |
| [4.3.0]-[4.3.5] | Framework extension to plugin-internal docs (`plugins/learn-kit/docs/`); content drift cleanup; framework v1.0 → v1.1 (codify plugin-internal teaching series exemption); CONTRIBUTING Git Hooks section; MIGRATION_GUIDE §3 |
| [4.4.0] | **Archive mechanism**: `docs/archive/` subdirs + `[RUNBOOK]_Doc_Archive_Procedure.md` v1.0 + Documentation Framework v1.1 → v1.2 (§2.3.1-§2.3.4 archive triggers / frontmatter / banner / living-vs-frozen refs) |
| [4.4.1] | `mp-doc-validate` extended with 6 archive-specific checks + 1 active-doc cross-check |
| [4.4.2] | UTF-8 BOM stripped from 5 docs |
| [4.4.3] | INDEX orphan fix — Doc_Archive_Procedure RUNBOOK registered in active table (dogfood-surfaced) |
| [4.4.4] | Repair 5 broken `related:` paths in 4 frontmatters |
| [4.4.5] | `mp-doc-validate` Step 3/5/6 hardened from placeholder code to executable; broken `related:` promoted Warning → Critical |
| [4.4.6] | CI `Validate commit message format` step added — central enforcement of v4.x scope whitelist |
| [4.4.7] | `mp-doc-author` Step 7 hardened (mirrors validator semantics; author + validator drift-resistant) |
| [4.4.8] | **This release** — CI release-branch exemption fix (unblocks this very release PR) |

For full per-version details, see [4.4.7] through [4.0.0] sections below.

### Fixed

- **`.github/workflows/ci.yml`** — Skip the `Validate commit message format` step for `release/*` PRs and pushes. Surfaced when the v4.4.7 release PR (#91) failed CI on 9 historical commits in the `main..develop` range that predate the v4.x PATTERN finalization:
  - 3 commits use scopes retired in v4.0.0 (`nlm-studio`, `notebooklm-kit`)
  - 1 commit uses scope `docs` (not in v4.x whitelist; was caught after PR #79 tightened scope list)
  - 5 commits exceed the 72-char subject limit
  - 1 commit missing `(scope)` entirely

  Rationale: release branches re-publish already-vetted develop content; their underlying commits were validated by prior PR CIs (or predate the gate entirely). Hotfix branches still validate — they introduce new commits that should conform. Feature/bugfix/maintain/documentation branches all still validate.

  Condition added to step's `if:`:
  ```yaml
  (github.event_name == 'pull_request' && !startsWith(github.head_ref, 'release/'))
  || (github.event_name == 'push' && github.ref != 'refs/heads/develop' && github.ref != 'refs/heads/main' && !startsWith(github.ref, 'refs/heads/release/'))
  ```

### Follow-up

This fix is committed directly to `release/v4.4.7` per release-branch convention. After this release merges to main, a separate small PR must sync the ci.yml change back to develop to prevent regression on the next release.

## [4.4.7] - 2026-05-15

> Sits above [4.4.6] which landed via PR #89 just before this PR's rebase.

### Changed

- **`.claude/skills/mp-doc-author/SKILL.md`** — Harden Step 7 (Verify Cross-references) with the same patterns PR #88 applied to `mp-doc-validate` Step 5+6. Surfaced by scanning all `mp-*` skills for placeholder `...` patterns post-PR #88; `mp-doc-author` was the only other skill with real (not template-ellipsis) placeholder bugs:

  **`related:` resolution** — old code used `grep -E '^  - \./?\S+\.md'` (only matched `./`-prefixed paths, missed `../` and other relatives; relied on `awk '{print $2}'` which fails for paths with spaces). New impl uses proper YAML stop-anchor (`awk '/^related:/{flag=1; next} /^[a-z][a-zA-Z_-]*:/{flag=0} flag && /^  - /'`) + `realpath -m` for normalized resolution.

  **Wikilink check** — old code was a literal `...` placeholder inside the `while read link; do ... done` loop. New impl extracts target from `[[name|alias]]` syntax then runs `find docs plugins -name "*target*.md"` for basename match.

  Both checks now mirror `mp-doc-validate` exactly so the author + validator share identical resolution semantics (what passes author also passes validator post-write).

  **Severity**: broken `related:` → Critical (consistent with `mp-doc-validate` v4.4.5 promotion); broken wikilink → Warning.

### Verified

- Diff with `mp-doc-validate/SKILL.md` Step 5+6 confirms identical reference code (modulo the `<dir-of-new-doc>` placeholder vs. file path).

### Rationale

The "schematic placeholder code" pattern was inherited from the same authoring era as `mp-doc-validate` pre-PR #88. Scanning all 18 mp-* skills found 8 occurrences of `...` patterns total but only 1 was a real placeholder (in `mp-doc-author/SKILL.md` line 157-159); the other 7 are intentional template ellipsis inside markdown skeletons (e.g., ADR template `## Decision\n...\n## Consequences`). Confirmed by reading each occurrence with ±5 line context.

## [4.4.6] - 2026-05-15

### Added

- **`.github/workflows/ci.yml`** — New step "Validate commit message format" added to Validate Structure CI job. Validates each non-merge commit in the PR range (or push range against develop) against the canonical PATTERN regex from [STANDARD]_Commit_Message_Convention §3+§4.

  **Trigger conditions**:
  - `pull_request` events: validates `${{ github.event.pull_request.base.sha }}..${{ github.event.pull_request.head.sha }}` range
  - `push` events on branches other than `develop` / `main`: validates `origin/develop..HEAD`
  - Skips on push to develop / main (those branches receive only merge commits, which are exempt)

  **PATTERN** (must stay in sync with `scripts/install-hooks.ps1` + STANDARD §3/§4):
  ```
  ^(feat|fix|perf|refactor|test|docs|infra)\((learn-kit|marketplace|ci|scripts|deps|infra|docs-rule|docs-adr|docs-guide|docs-runbook|docs-spec|release)\): .{1,72}$
  ```

  Uses `git log --no-merges --format='%H%x09%s' <range>` to enumerate commits, then per-line `grep -qE` against PATTERN. Merge commits exempt by convention.

  `actions/checkout@v4` upgraded to `fetch-depth: 0` so full commit history is available for `git log` range queries.

### Rationale

PR #86 surfaced this gap: `fix(docs): ...` scope (not in v4.x whitelist) merged successfully because:
1. **`scripts/install-hooks.ps1` is local-only** — the pre-commit hook validates commit messages but only when installed on the developer's machine. Verified `.git/hooks/commit-msg` was NOT installed (only `.sample` files present).
2. **CI had no commit-msg check** — `.github/workflows/ci.yml` validates plugin/marketplace/SKILL/dir/version/CHANGELOG but not commit message format.

With this PR, the whitelist is **centrally enforced** at PR-merge gate — no longer dependent on each developer installing the local hook. The pre-commit hook remains valuable for fast local feedback but is now backstopped by CI.

Verified PATTERN matches expected results on test cases:
- `fix(docs): register Doc_Archive_Procedure RUNBOOK in INDEX active table` → **FAIL** (correctly — `docs` not in scope whitelist)
- `fix(marketplace): harden mp-doc-validate Step 3/5/6 to executable` → PASS
- `docs(marketplace): something` → PASS
- `fix(docs-runbook): hypothetical fix` → PASS

## [4.4.5] - 2026-05-15

### Changed

- **`.claude/skills/mp-doc-validate/SKILL.md`** — Harden Step 3 (INDEX cross-check) and Step 5 (`related:` resolution) from placeholder reference code to executable implementations. Step 6 (wikilinks) also upgraded from `...` placeholder to a real basename-search resolution. Surfaced by the dogfood loop PR #84 → #86 → #87: each iteration revealed the validator was missing real issues because reference code wasn't actually being run; PR #87 fixed 5 broken `related:` paths that the placeholder Check 5 couldn't catch.

  **Step 3 — INDEX regex tightened from `[^)]+\.md` to `[A-Za-z0-9_-]+\.md`**:
  - Old loose pattern matched greedy across same-line backtick code + link URL, producing false positives like `[STANDARD]_X.md\`](../../docs/rule/[STANDARD]_X.md` as one entry
  - New strict basename pattern with `-A-Za-z0-9_-` charset is precise; cross-references in prose no longer pollute the listed set
  - Switched from `diff` to `comm -23 / comm -13` for clearer "listed-but-not-actual" + "actual-but-not-listed" reporting
  - Added note clarifying that empty Archived Documents placeholder (`*暂无 archived 文档*`) is NOT a mismatch

  **Step 5 — Real `realpath -m` resolution**:
  - Old reference code: `for rel in $(echo "$fm" | awk '/^  - \./')` — broken (only matched lines starting `./`, missed `../` and absolute paths; relied on shell word-splitting which doesn't work with multi-line YAML)
  - New impl: proper `awk` stop-anchor on next top-level key, then per-entry `cd $(dirname <file>) && realpath -m "$rel"` for normalized resolution; `-m` flag tolerates missing intermediate components and returns the resolved path even if the target doesn't exist, so the subsequent `-f` test is the actual existence check
  - **Promoted broken `related:` from Warning to Critical** per anti-pattern review: broken navigation defeats the framework's explicit "related: paths must resolve" rule. Updated Step 4 categorization table accordingly.

  **Step 6 — Wikilink resolution**:
  - Old reference code: ended in `...` literal placeholder
  - New impl: `grep -oE` extracts `[[target]]` content (with optional `|alias` stripped), then `find docs plugins -name "*target*.md"` for basename match; Warning if no match. Marketplace corpus uses zero wikilinks (verified 2026-05-15) but the check now executes correctly for future-proofing.

  **Description field** updated to reflect promoted severity ("broken `related:` path" added to Critical bullet list) + v4.4.5 hardening note.

### Verified

- Hardened skill dogfooded against current corpus 2026-05-15 post-fix: Step 3 reports 13 listed = 13 actual (zero discrepancy), Step 5 reports zero broken `related:` paths (PR #87 fixes confirmed). Skill is now production-grade.

### Rationale

The skill enhancement PR #84 added 6 new archive checks but inherited 4 placeholder check implementations from v4.4.0. Dogfood loop (PR #86 INDEX orphan → PR #87 5 broken paths) repeatedly surfaced issues that should have been caught automatically by Step 3 / Step 5 but weren't, because the reference code was schematic only. This PR closes the gap by making the reference code real.

## [4.4.4] - 2026-05-15

### Fixed

- **5 broken `related:` paths across 4 frontmatters** — Repair stale + typo'd cross-references in docs/. Surfaced by continued dogfooding of `mp-doc-validate` against the corpus post-PR #86; Step 5 `related:` resolution check executed per-doc against `realpath -m` exposed bugs that the skill's placeholder Check 5 code didn't actually run (the skill's reference impl was schematic; real-shell resolution exposes more).

  | File | Stale | Fixed | Cause |
  |------|-------|-------|-------|
  | `docs/adr/[ADR]_NotebookLM_Kit_Retirement.md` | `./[ADR]_LearnKit_Discovery_Skills.md` | `../../plugins/learn-kit/docs/adr/[ADR]_LearnKit_Discovery_Skills.md` | v4.3.0 migrated this ADR into plugin-internal location; cross-reference never updated |
  | `docs/adr/[ADR]_NotebookLM_Kit_Retirement.md` | `.../MIGRATION_GUIDE.md` | `../MIGRATION_GUIDE.md` | 3-dot path typo |
  | `docs/rule/[STANDARD]_Commit_Message_Convention.md` | `.../CONTRIBUTING.md` | `../CONTRIBUTING.md` | 3-dot path typo |
  | `docs/spec/[SPEC]_Marketplace_Json_Schema.md` | `../[GUIDE]_Version_Management.md` | `../guide/[GUIDE]_Version_Management.md` | Missing `/guide/` subdir segment after PR 2 (v4.2.1) retrofit moved GUIDEs into `docs/guide/` |
  | `docs/spec/[SPEC]_Plugin_Json_Schema.md` | `../[GUIDE]_Plugin_Development_Testing_Workflow.md` | `../guide/[GUIDE]_Plugin_Development_Testing_Workflow.md` | Same `/guide/` retrofit miss |

  All 5 targets verified to exist post-fix via `realpath -m` resolution. No semantic content change to bodies.

### Rationale

These bugs accumulated across multiple framework migrations: PR 2 (v4.2.1) retrofitted top-level docs into framework subdirs (`docs/guide/`, `docs/spec/` etc.), which made bare `../[GUIDE]_*` references stale. PR 4 (v4.3.0) migrated `[ADR]_LearnKit_Discovery_Skills.md` from marketplace `docs/adr/` into plugin-internal `plugins/learn-kit/docs/adr/`, which made the local `./` reference stale. The 3-dot typos predate this session.

The fix loop is continuing to demonstrate value: PR #84 (skill enhancement) → PR #86 (orphan from PR #83) → this PR (related: paths). Each dogfood iteration finds new latent bugs.

## [4.4.3] - 2026-05-15

### Fixed

- **`docs/INDEX.md`** — Register `[RUNBOOK]_Doc_Archive_Procedure.md` in the active `## Runbooks` table. PR #83 (v4.4.0) introduced this RUNBOOK file as an active doc but only forward-referenced it from the `## Archived Documents` section preamble; the active Runbooks table was never updated, leaving the doc as an INDEX orphan per Documentation Framework §3 (INDEX sync requirement).

  Surfaced by dogfooding `mp-doc-validate` against the corpus on 2026-05-15 (post-PR #84 skill enhancement). Step 3 INDEX cross-check correctly identifies orphan because the skill's awk filter excludes the Archived Documents section (`awk '/^## Archived Documents/{exit} 1'`) — forward-references from inside the archive preamble do not count as active-section listings.

### Rationale

Minor regression introduced by PR #83's INDEX edits: the new RUNBOOK was scaffolded but its registration in the active Runbooks table was missed. Discovered via the very dogfood that the v1.2 archive mechanism + v4.4.1 skill enhancement enabled — proves the end-to-end framework + skill loop is working.

## [4.4.2] - 2026-05-15

### Changed

- **5 docs** — Stripped UTF-8 BOM (byte sequence `EF BB BF`) from file start. Affected files:
  - `docs/CONTRIBUTING.md`
  - `docs/guide/[GUIDE]_Marketplace_Project_Overview.md`
  - `docs/guide/[GUIDE]_Plugin_Development_Testing_Workflow.md`
  - `docs/guide/[GUIDE]_Version_Management.md`
  - `docs/runbook/[RUNBOOK]_Release_Operations.md`

  BOM bytes were introduced during early authoring (likely by a Windows editor with default UTF-8-with-BOM setting). Although most modern markdown renderers (GitHub, VS Code preview) silently accept BOM, the project's Documentation Framework v1.2 §6 specifies LF-only UTF-8 with no BOM, and BOM presence can:
  - Break frontmatter parsing in stricter YAML loaders (BOM appears as part of the first key)
  - Cause `grep`-style regex line-anchor `^---` to miss the frontmatter delimiter
  - Show as a stray `﻿` character in raw views of older editors

  Fix is a 3-byte file-head strip; no content change. All other corpus markdown files were re-audited and confirmed BOM-free.

### Rationale

Deferred from PR #79 (v4.3.2) content-drift audit when the focus was script bugs + content drift. Now landed as a focused single-purpose maintain PR since the archive mechanism (PR #83) made framework spec authoritative on encoding.

## [4.4.1] - 2026-05-15

### Changed

- **`.claude/skills/mp-doc-validate/SKILL.md`** — Extended skill to verify Framework v1.2 archive compliance. Without this update, the new archive rules (banner / frontmatter fields / bidirectional supersedes-replaced-by / filename pattern) sat documented but unenforced at the skill level.

  **Description field** expanded: now mentions archive-specific checks + new trigger keywords ("archive validation", "archive compliance").

  **Workflow DOT diagram** updated: Step 2 split into Step 2 (active docs, 7 checks including new Check 7b for supersedes integrity on active docs) + Step 2.5 (archived docs, 6 new checks). INDEX cross-check (Step 3) extended to also verify Archived Documents table.

  **Step 1 enumerate** now globs both `docs/**/*.md -not -path 'docs/archive/*'` (active) and `docs/archive/**/*.md` (archived) separately. Also documents framework §1 exemption list explicitly (plugin-internal teaching series newly added per v1.1).

  **6 new archive checks (Step 2.5)**:
  - **Check 8 Archived Filename Pattern** — `[DEPRECATED]_<TAG>_<Topic>_v<major>.<minor>.md` regex per Framework v1.2 §2.4
  - **Check 9 `state: archived`** — files under `docs/archive/` MUST have state=archived
  - **Check 10 `archived:` field** — mandatory ISO-8601 date per Framework v1.2 §2.3.2
  - **Check 11 `replaced-by:` resolution** — path resolves to existing file (or empty for pure retirement = WARNING with CHANGELOG confirmation prompt)
  - **Check 12 Archive Banner** — body MUST have 3-line canonical banner per Framework v1.2 §2.3.3 (`> **Archived**:` / `> **Archive reason**:` / `> **Archived on**:`)
  - **Check 13 Bidirectional Integrity** — successor's `supersedes:` list MUST include this archive path (paired with archived doc's `replaced-by:`)

  **1 new active check (Check 7b)** — active doc with `supersedes:` list: each listed archive path MUST exist AND have `state: archived` (catches dangling supersedes references)

  **Step 4 Categorize** updated: archived-specific Critical examples added (banner missing / filename pattern mismatch / broken bidirectional / supersedes points to missing or non-archived file). Pure-retirement (`replaced-by:` empty) downgraded to Warning since it's a valid edge case.

  **Output Format** restructured into separate Active and Archived results tables; summary now reports both severity categories separately.

  **Reference Files** updated: Framework v1.2 (was v1.0); added RUNBOOK reference; added archive ceremony pointer.

  **Anti-patterns** updated: 6 items (was 4); new items cover archive-specific edge cases (don't treat archived as active and vice versa; don't flag empty Archived Documents placeholder).

  **Handoff** updated: critical-on-archived path routes to `[RUNBOOK]_Doc_Archive_Procedure §5 verification checklist` (was previously only `mp-doc-author`).

### Changed (versioning)

- **`VERSION`** — 4.4.0 → 4.4.1 (patch — skill enhancement to enforce existing framework rules; no new framework or marketplace surface)
- **`.claude-plugin/marketplace.json`** — `metadata.version` 4.4.0 → 4.4.1; `plugins[].version` unchanged (learn-kit 1.1.0)

### Rationale

v4.4.0 (PR #83) introduced the archive mechanism: 4 new framework subsections + new RUNBOOK + 6 archive subdirs. But the validation skill (`mp-doc-validate`) wasn't updated. The new v1.2 rules — Archive Banner format, archived/replaced-by frontmatter fields, archived filename pattern, bidirectional supersedes↔replaced-by linkage — sat documented but not auto-enforceable.

This made the archive mechanism partially incomplete: when first real archive happens and someone runs `/mp-doc-validate`, the skill would only check the legacy 7 active-doc checks and silently pass archive-related issues. v4.4.1 closes this loop. After this PR, `/mp-doc-validate` enforces the full v1.2 framework — both active-doc compliance AND archive-doc compliance.

This is a skill-only change. No framework / runbook / docs content changes. Lowest possible risk surface for an enforcement-extension PR.

## [4.4.0] - 2026-05-15

### Added

- **Archive infrastructure**: `docs/archive/{rule,adr,guide,runbook,spec,postmortem}/` 6 subdirectories scaffolded with `.gitkeep` placeholders (mirrors active `docs/<subtype>/` layout)
- **`docs/INDEX.md` § Archived Documents** new section (between Postmortems and Templates) with placeholder table — populates as first archive event lands
- **`docs/runbook/[RUNBOOK]_Doc_Archive_Procedure.md`** v1.0 (~370 lines) — operational handbook with full archive ceremony:
  - §1 Preconditions (4 trigger checks + worktree precondition)
  - §2 Workflow (4 phases + 2 HITL gates):
    - **Phase 1 Analysis** + HITL Gate Q-01 (standard vs unusual case)
    - **Phase 2 Migration Plan** (destination path computation + reference audit scope + user approval)
    - **Phase 3 Execute** (`git mv` + frontmatter update + body banner + reference audit) + HITL Gate D-02 (>3 refs need Living/Frozen judgment)
    - **Phase 4 INDEX & Validate** (`/mp-doc-validate` skill + 7-item checklist)
  - §3 Archive Banner Template (canonical reference)
  - §4 Living vs Frozen Quick Reference (7-row decision table)
  - §5 Verification Checklist (8 items)
  - §6 Rollback (reset --hard / revert paths)
  - §7 Change History

### Changed

- **`docs/rule/[STANDARD]_Documentation_Framework.md`** v1.1 → **v1.2** — expanded §2.3 State Machine with 4 new subsections codifying archive mechanism:
  - **§2.3.1 Archive Triggers** (4 conditions adapted from mj-agent ADR-017): major version bump / structural rewrite (≥50% restructure) / ≥70% content replacement / split-merge-rename. Explicit non-triggers: drop-suffix rename + minor/patch bumps.
  - **§2.3.2 Frontmatter on Archive Transition**: new mandatory `archived: <date>` field + `replaced-by: <path>` pointer (bidirectional with `supersedes:` list on active successor); list-form supersedes for N-to-1 merges
  - **§2.3.3 Archive Banner Template**: canonical GitHub-native blockquote format inserted immediately after H1 of every archived doc
  - **§2.3.4 Living vs Frozen Reference Judgment**: procedural rule for cross-doc refs during archive ceremony (Living → upgrade to successor; Frozen → preserve with archive path; ambiguous → Living + parenthetical pointer)
- **§2.4 Filename & Path Stability** clarified: archived filename pattern is `[DEPRECATED]_<TAG>_<Topic>_v<major>.<minor>.md` (patch dropped to avoid filename churn for trivial bumps); concrete example added
- frontmatter: version v1.1 → v1.2; summary extended; tags + `archive`; related + RUNBOOK
- §5 Change History: v1.2 entry detailing the 4 new subsections + linking to operational RUNBOOK

### Changed (versioning)

- **`VERSION`** — 4.3.5 → 4.4.0 (**minor** — new feature: archive mechanism; first non-patch since v4.3.0)
- **`.claude-plugin/marketplace.json`** — `metadata.version` 4.3.5 → 4.4.0; `metadata.description` extended with v4.4.0 archive note; `plugins[].version` unchanged (learn-kit 1.1.0)

### Out of scope

- **No actual archive of any current doc** — all 12 active docs stay active. v4.4.0 builds infrastructure + spec + procedure; no archive trigger has fired against any existing doc. The mechanism is ready for first use when needed (e.g., when Documentation Framework eventually bumps v1.x → v2.0).
- **No `mp-doc-migrate` skill** — archive is rare (~per major version); RUNBOOK is canonical procedure. If recurrence proves high enough to warrant a skill, that's a future PR.
- **No plugin-level archive** (`plugins/<name>/docs/archive/`) — defer until a plugin has its first deprecated doc; learn-kit teaching series is framework §1 exempt so doesn't enter the state machine.
- **No skeleton-first archive mode** (mj-agent Meta v2.1 §5.8 for multi-doc cascade archives) — defer until marketplace has a cascade case. RUNBOOK §7 notes "will add as v1.1 if marketplace ever has a cascade case."
- **No auto-discovery script** for archive cross-refs — defer until archive grows. mj-agent ADR-020 pattern available if needed.

### Rationale

The v4.2.0-rollout (PR #75) introduced Documentation Framework v1.0 which **specified** the state machine `active → deprecated → archived` (§2.3) and archive filename pattern (§2.4), but the **physical infrastructure and procedural details were never built**:

- `docs/archive/` directory didn't exist
- The 4 archive triggers from mj-agent ADR-017 weren't documented
- New frontmatter fields (`archived:`, `replaced-by:`) weren't formally specified
- The Archive Banner template format was unspecified
- The Living vs Frozen reference judgment procedure was unspecified
- No operational RUNBOOK explained how to execute an archive ceremony step-by-step

v4.4.0 closes all 6 gaps in one minor release. Now when a real archive trigger fires (most likely first: Documentation Framework v1.x → v2.0 when some major restructure happens), the team has a complete handbook to follow rather than improvising.

Design inputs:
- mj-agent `docs/rule/[STANDARD]_MJ_Agent_Documentation_Meta_Framework.md` v2.2 §5.6 / §5.9 (archive triggers + ceremony)
- mj-agent `docs/archive/{rule,adr}/` actual archive directory (22 archived docs as live reference)
- mj-agent `.claude/skills/mj-agent-doc-migrate/SKILL.md` (6-phase workflow + 2 HITL gates; compressed to 4 phases for marketplace's smaller scope)
- mj-agent ADR-017 (Archive Trigger Quantification), ADR-018 (Active Path Stability), ADR-019 (Archive Naming Convention)

## [4.3.5] - 2026-05-15

### Added

- **`docs/MIGRATION_GUIDE.md` §3 · v4.0.0 → v4.3.x** — Consolidates 8 PRs of doc framework rollout into a single migration section. Frames v4.x rollout as **contributor-facing** (consumers using `/plugin install learn-kit` see no behavior change). 9 sub-sections:
  - §3.1 Release-by-Release 速查表 — 8-row table mapping each v4.x release to required contributor + consumer actions
  - §3.2 路径搬迁速查表 — 9-row old-path → new-path table for v4.2.1 docs subdir migration (covers 7 STANDARDs/GUIDEs/RUNBOOK/ADRs + v4.3.0 plugin-internal ADR migration + exempt files list)
  - §3.3 Commit-msg Hook 升级 — most-important contributor action; explicit re-install command + "how to detect stale hook" PowerShell snippet
  - §3.4 Scripts API 变化 — `scripts/bump-version.ps1` ValidateSet table (v3.x vs v4.x)
  - §3.5 Plugin-Internal Docs Framework 引入 — guidance for adding new learn-kit-internal docs (which subdir; teaching series exemption pattern)
  - §3.6 Commit Convention v1.0 — points fork/mirror maintainers to new STANDARD location
  - §3.7 时间线 — 9-row table of all v4.x releases including this one
  - §3.8 回滚指引 — note that v4.x rollout is fully additive; any commit revertable individually
  - §3.9 询问 — pointers to CHANGELOG / Framework STANDARD / HITL Standard for deeper detail

- File header reframed from "two major migrations" to "three migrations" with a §3 audience-clarification line emphasizing the consumer-vs-contributor distinction.

### Changed

- **`docs/MIGRATION_GUIDE.md` §2 询问 link** — fixed `docs/[ADR]_NotebookLM_Kit_Retirement.md` → `docs/adr/[ADR]_NotebookLM_Kit_Retirement.md` (path was stale from v4.2.1 retrofit; MIGRATION_GUIDE is exempt from auto-rewrite so was missed earlier)

### Changed (versioning)

- **`VERSION`** — 4.3.4 → 4.3.5 (patch — migration documentation completion)
- **`.claude-plugin/marketplace.json`** — `metadata.version` 4.3.4 → 4.3.5; `plugins[].version` unchanged (learn-kit 1.1.0)

### Rationale

The 8 PRs of v4.x doc framework rollout each had CHANGELOG entries but no consolidated migration guidance. Anyone upgrading from v4.0.0 to v4.3.4 in one shot (or external consumers checking what changed) had to read 8 CHANGELOG sections. §3 consolidates the contributor-impactful changes into one navigable section with explicit user actions.

The most important user action (v4.3.2 hook re-install) was already documented in CONTRIBUTING.md § Git Hooks (v4.3.4 / PR #81), but MIGRATION_GUIDE is a more natural discovery path for someone explicitly looking at version migrations. §3.3 references the CONTRIBUTING.md section as the canonical hook maintenance source while giving the migration-context summary.

§3.2 path migration table is useful for external consumers / forks / external docs that bookmarked old marketplace doc URLs. Without this table they'd need to grep their own content + cross-reference CHANGELOG entries to figure out new paths.

## [4.3.4] - 2026-05-15

### Added

- **`docs/CONTRIBUTING.md`** — New `## Git Hooks` section between `## Bare Repo + Worktree` and `## 推送`. Covers:
  - **First-time install**: `pwsh -File scripts/install-hooks.ps1` (installs `commit-msg` to bare repo shared `.bare/hooks/` so all worktrees share it)
  - **Upgrade path**: re-run the installer when CHANGELOG notes `install-hooks.ps1` updates (because the PATTERN regex inside is hardcoded; v4.3.2 was the first such update)
  - **Known history note**: explicit pointer that pre-v4.3.2 hooks reject current v4.x scope commits — affected contributors should re-run installer
  - **Removal command**: PowerShell one-liner to delete the installed hook
  - **Canonical source table**: links to `[STANDARD]_Commit_Message_Convention.md` §4 (scope whitelist) + `scripts/install-hooks.ps1` (the script itself) + git hook test command

### Changed (versioning)

- **`VERSION`** — 4.3.3 → 4.3.4 (patch — pure contributor-docs improvement, no script or marketplace behavior change)
- **`.claude-plugin/marketplace.json`** — `metadata.version` 4.3.3 → 4.3.4; `plugins[].version` unchanged (learn-kit 1.1.0)

### Rationale

PR #79 (v4.3.2) updated `scripts/install-hooks.ps1` PATTERN regex from the retired v3.x `mj-sys-*` scopes to the v4.x canonical whitelist. The PR was correct but left an implicit assumption that contributors would discover the change on next failed commit. v4.3.4 makes the upgrade path explicit and discoverable:

1. **For new contributors**: `## Git Hooks` section is now the canonical onboarding for setting up commit-msg validation.
2. **For existing contributors with stale hooks**: the "Known history" note tells them exactly what happened and how to recover (`pwsh -File scripts/install-hooks.ps1`).
3. **For future maintainers**: when `[STANDARD]_Commit_Message_Convention.md` §4 scope whitelist changes again (adding a new scope, retiring one), the documented procedure is: bump that STANDARD's version → update `install-hooks.ps1` PATTERN regex in same commit → add CHANGELOG note → contributors re-run installer.

## [4.3.3] - 2026-05-15

### Changed

- **`docs/rule/[STANDARD]_Documentation_Framework.md`** v1.0 → **v1.1** — Codify the "plugin-internal teaching series" exemption that was *informally* recognized during the v4.3.0 plugin extension (PR #77). The 6 lowercase numbered learn-kit teaching docs (`plugins/learn-kit/docs/learn-kit-01-positioning.md` ... `learn-kit-05-governance-boundary.md` + `learn-kit-使用手册.md`) were marked "informally exempt" in `plugins/learn-kit/docs/INDEX.md`; v1.1 promotes this to a canonical §1 exemption row with explicit **3-point pattern criteria**:
  1. File lives at `plugins/<name>/docs/` root (NOT in `adr/` / `guide/` / `spec/` / `runbook/` subdirs)
  2. Filename starts with the plugin's own name as prefix (`<plugin>-`)
  3. Content is human-pedagogical (tutorial / 5-min onboarding / worked example) rather than normative rule / decision record / runbook procedure
  
  Also adds a "v1.1 note on exemption design" callout clarifying that exempt files MUST still appear in their plugin's INDEX «Plugin-Internal Teaching Series» section (for discovery) while `/mp-doc-validate` skips frontmatter checks against them. The exemption is intentional design, not lax — plugins SHOULD use it sparingly only when numbered sequencing carries pedagogical meaning.

- **`plugins/learn-kit/docs/INDEX.md`** — §Plugin-Internal Teaching Series header note updated from «*intentionally exempt*» (informal) to «**formally exempt** per [STANDARD]_Documentation_Framework §1 (v1.1 codification)» (canonical). Added pointer to `/mp-doc-validate` skip behavior.

### Backward compatibility

- No existing doc paths or frontmatter changes required.
- `/mp-doc-validate` skill's behavior unchanged in practice (it already skipped non-tag-prefixed files at `plugins/<name>/docs/` root via implicit rule); v1.1 makes the skip-rule canonical so future maintainers / new plugins can rely on it.

### Changed (versioning)

- **`VERSION`** — 4.3.2 → 4.3.3 (patch — Framework specification refinement, no doc content / behavior change)
- **`.claude-plugin/marketplace.json`** — `metadata.version` 4.3.2 → 4.3.3; `plugins[].version` unchanged (learn-kit 1.1.0)

### Rationale

PR #77 (v4.3.0) introduced the plugin-internal docs framework extension and explicitly *deferred* the question of how to treat plugin-internal numbered teaching series (the 6 learn-kit lowercase docs). The pragmatic call then was to mark them "informally exempt" in the plugin INDEX with a §Plugin-Internal Teaching Series section. This worked but left a small inconsistency: the framework STANDARD itself didn't acknowledge the exemption, so `/mp-doc-validate` had to be implicitly tolerant.

v1.1 closes that gap with a minimal-impact framework refinement: one new row in §1 exemption table + a clarifying callout + §10 history entry. The 3-point pattern criteria prevent the exemption from being overused: it only applies to files that are clearly pedagogical sequences, not to general "I don't feel like adding frontmatter" cases. New plugins inheriting this pattern get a clean path forward.

## [4.3.2] - 2026-05-15

### Fixed (real bugs surfaced during content drift audit)

- **`scripts/bump-version.ps1`** — `ValidateSet` had only retired `mj-sys-doc` / `mj-sys-git` / `mj-sys-n8n` / `mj-sys-ops` scopes; running `.\scripts\bump-version.ps1 -Scope "learn-kit"` would have FAILED with parameter validation error. Replaced with `("marketplace", "learn-kit")` (v4.x reality). Comments and `.EXAMPLE` block updated.
- **`scripts/install-hooks.ps1`** — The installed `commit-msg` git hook used a hardcoded `mj-sys-git|mj-sys-doc|mj-sys-n8n|mj-sys-ops|ci|deps|scripts|marketplace` scope whitelist regex. Any commit using current v4.x scopes (`learn-kit`, `docs-rule`, `docs-adr`, `docs-guide`, `docs-runbook`, `docs-spec`, `release`) would have been REJECTED. Updated PATTERN regex + error message + console output to the canonical v4.x scope set from `docs/rule/[STANDARD]_Commit_Message_Convention.md` §4.

### Changed (content drift cleanup — docs aligned with v4.0.0+ single-plugin reality)

- **`docs/CONTRIBUTING.md`** — Line 4 `Claude Code agent 行为规范请参考各 Plugin 的 SKILL.md（如 mj-sys-git ...）` replaced with current AI Engineering reference (HITL Prompt STANDARD + `.claude/skills/mp-*`). Line 75 `bump-version.ps1 -Scope "mj-sys-git"` example updated to `-Scope "learn-kit"`.
- **`docs/guide/[GUIDE]_Marketplace_Project_Overview.md`** — §2 architecture tree rewritten for v4.x layout (1 plugin: learn-kit; `.claude/skills/` 18 mp-* skills section added; `docs/` subdirs reflected). §3 plugin table now lists only `learn-kit` row. §3.2 skill workflow chain replaced 4 mj-sys-* enumerations with learn-kit's 5 skills.
- **`docs/guide/[GUIDE]_Version_Management.md`** — §1.1 version tree rewrote 4-plugin hierarchy as 1-plugin (learn-kit). §1.3 version-file table simplified to 2 rows. §2.1 ValidateSet, §2.2 Scope table, §2.3 examples, §3.2 CHANGELOG examples, §4.1 CI failure examples, §5 release scenarios all updated to learn-kit + current v4.3.x version numbers.
- **`docs/guide/[GUIDE]_Plugin_Development_Testing_Workflow.md`** — Plugin tree at §2.1 collapsed from 4 plugins to 1 (learn-kit). §4.2 `--plugin-dir mj-sys-git` examples → `learn-kit`. §Step 4 plugin install commands reduced from 4 lines to 1.
- **`docs/runbook/[RUNBOOK]_Release_Operations.md`** — Commit examples updated to `learn-kit` scope. §2.3 scope list rewritten with v4.x canonical whitelist + canonical-source link. §3.1 version table updated with v4.3.x example numbers. §3.2 / §4.2 bump-version examples migrated to learn-kit.

### Preserved unchanged (historical fidelity)

- `CHANGELOG.md` (root and `plugins/learn-kit/CHANGELOG.md`): historical entries reference plugin state at time of each release.
- `docs/MIGRATION_GUIDE.md`: explicitly describes v2.x → v3.0.0 retirement of mj-sys-* plugins; updating would falsify migration documentation.
- `docs/rule/[STANDARD]_Commit_Message_Convention.md` §10 Change History: explicit retrospective note "Replaces stale mj-sys-* scope whitelist with marketplace v4.x scopes" — intentional historical commentary.

### Changed (versioning)

- **`VERSION`** — 4.3.1 → 4.3.2 (patch — bugfix + content drift cleanup)
- **`.claude-plugin/marketplace.json`** — `metadata.version` 4.3.1 → 4.3.2; `plugins[].version` unchanged (learn-kit 1.1.0)

### Rationale

The 4-PR doc framework rollout (v4.1.0 - v4.3.0) brought structural compliance to marketplace docs (subdir layout, frontmatter, INDEX schema) but did NOT address content drift in pre-existing GUIDE / RUNBOOK body text. Those docs were authored during v3.x era when marketplace had 4 mj-sys-* plugins; after v3.0.0 retirement and v4.0.0 notebooklm-kit consolidation, the body references became stale.

Worse, **two scripts had hardcoded v3.x plugin names** that would actively break v4.x workflows: `bump-version.ps1 -Scope "learn-kit"` would have failed `ValidateSet` parameter validation, and the commit-msg hook installed by `install-hooks.ps1` would have rejected any commit using current v4.x scopes (which is most of them — every commit since v4.0.0 has used scopes the hook would reject). Going forward both scripts are aligned with current reality.

## [4.3.1] - 2026-05-15

### Changed

- **`.gitignore`** — Add root-anchored `/learning/` ignore entry. `/learn-kit:init` scaffolds a `learning/<topic>/` subsystem at the project root for user-generated learning materials (tier `.md` files, optional interactive HTML, NLM artifact metadata records). Without this entry, developers running learn-kit skills in the marketplace's own develop / feature worktrees would accidentally commit personal learning materials into the marketplace repo. The anchor `/` ensures only root-level `learning/` is ignored — any nested `learning/` (e.g., inside a plugin's test fixtures) remains tracked.

### Changed (versioning)

- **`VERSION`** — 4.3.0 → 4.3.1 (patch — developer-experience improvement, no marketplace / plugin behavior change)
- **`.claude-plugin/marketplace.json`** — `metadata.version` 4.3.0 → 4.3.1; `plugins[].version` unchanged (learn-kit 1.1.0)

### Rationale

Operational fix surfaced during PR 4 dogfood: a developer running `/learn-kit:init` inside a marketplace worktree to test learn-kit behavior would create `learning/` at marketplace root, then `git add -A` would sweep it into the next commit unless explicitly noticed. This is a minor pitfall worth eliminating up front. The pattern matches existing `.gitignore` entries like `plugins/mj-ops/.env` and `**/config/secrets-*.conf` — preventing accidental commits of generated / user-private content.

## [4.3.0] - 2026-05-15

### Added

- **Plugin-internal docs framework extension** — Documentation Framework v1.0 now applies to `plugins/learn-kit/docs/` (post-PR 4 framework reach):
  - **`plugins/learn-kit/docs/INDEX.md`** — Plugin-internal documentation index with `scope: learn-kit`. Catalogues plugin-internal ADRs / GUIDEs / SPECs + the 6 lowercase numbered teaching docs (which are intentionally exempt from tag-prefix requirement as plugin-internal pedagogical content).
  - **`plugins/learn-kit/docs/adr/`** — Plugin-internal ADR subdir (newly populated by the migrated ADR below).
  - **`plugins/learn-kit/docs/guide/`** and **`docs/spec/`** — Placeholder subdirs with `.gitkeep` for future plugin-internal GUIDEs / SPECs.

### Moved (plugin-scope boundary realignment)

- **`docs/adr/[ADR]_LearnKit_Discovery_Skills.md`** → **`plugins/learn-kit/docs/adr/[ADR]_LearnKit_Discovery_Skills.md`** — Migrated from marketplace level to plugin-internal level. Rationale: the decision is plugin-internal (skill design within learn-kit), not marketplace governance. The companion ADR `[ADR]_NotebookLM_Kit_Retirement.md` stays at marketplace `docs/adr/` because it's a cross-plugin governance decision.

### Changed

- **`plugins/learn-kit/CLAUDE.md`** — New `## Documentation` section linking to `docs/INDEX.md`.
- **`plugins/learn-kit/.claude-plugin/plugin.json`** — version 1.0.0 → 1.1.0; description extended to mention v1.1.0 plugin-internal docs framework.
- **`docs/INDEX.md`** (marketplace level) — ADR table now lists only `[ADR]_NotebookLM_Kit_Retirement.md` (marketplace scope); LearnKit Discovery removed (migrated); Plugin Documentation section gets a new table linking to `plugins/learn-kit/docs/INDEX.md`; learn-kit docs section rewritten to describe the new plugin-internal framework layout.

### Changed (versioning)

- **`VERSION`** — 4.2.1 → 4.3.0 (minor)
- **`.claude-plugin/marketplace.json`** — `metadata.version` 4.2.1 → 4.3.0; `metadata.description` extended with v4.3.0 segment describing plugin extension; `plugins[learn-kit].version` 1.0.0 → 1.1.0; `plugins[learn-kit].description` extended to mention v1.1.0 plugin-internal docs framework

### Rationale

PR 4 of 4 in the doc framework rollout. PRs 1-3 established framework + retrofitted marketplace-level docs. PR 4 extends the framework reach into the plugin (`plugins/learn-kit/docs/`) with appropriate scope adjustment: plugin-internal architectural decisions (e.g., skill design choices) live under the plugin; cross-plugin / marketplace governance decisions stay at marketplace level. This boundary surfaces clearly via the `scope:` frontmatter field (`learn-kit` vs `marketplace`).

The 6 lowercase numbered teaching docs in `plugins/learn-kit/docs/` (`learn-kit-01-positioning.md` etc.) are **intentionally retained at their existing flat paths** without tag prefixes. They are plugin-internal pedagogical content (a sequential tutorial series), not architectural / decision artifacts. The numbered prefix is the pedagogical ordering signal; tag-prefixing them would obscure that. They are documented in `plugins/learn-kit/docs/INDEX.md` under a "Plugin-Internal Teaching Series" section that acknowledges them as informally exempt.

A future Documentation Framework v1.1 may codify "plugin-internal teaching series" as an explicit §1 exemption category. For now the policy is implicit (no framework enforcement attempted on them).

## [4.2.1] - 2026-05-15

### Changed (patch — mechanical doc framework retrofit)

- **Moved 8 tag-prefixed docs into framework subdirs** (per `docs/rule/[STANDARD]_Documentation_Framework.md` §2.1 path conventions). All moves use `git mv` for clean rename history (100% similarity):
  - `docs/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md` → `docs/rule/`
  - `docs/[GUIDE]_Marketplace_Project_Overview.md` → `docs/guide/`
  - `docs/[GUIDE]_Plugin_Development_Testing_Workflow.md` → `docs/guide/`
  - `docs/[GUIDE]_Version_Management.md` → `docs/guide/`
  - `docs/[GUIDE]_Marketplace_Agent_Execution_Checklist.md` → `docs/guide/`
  - `docs/[RUNBOOK]_Release_Operations.md` → `docs/runbook/`
  - `docs/[ADR]_LearnKit_Discovery_Skills.md` → `docs/adr/` (will further move to `plugins/learn-kit/docs/adr/` in PR 4 v4.3.0)
  - `docs/[ADR]_NotebookLM_Kit_Retirement.md` → `docs/adr/`

- **Retrofit 8 docs with 8-field YAML frontmatter** per `[STANDARD]_Documentation_Framework` §2.2. Existing markdown table headers (HITL Standard / Checklist / ADRs) replaced with YAML frontmatter; blockquote headers (4 GUIDEs + RUNBOOK) preserved as body intro and prepended with YAML frontmatter. RUNBOOK_Release_Operations adds `last-verified: 2026-05-14`. All retrofitted docs `state: active` and `version: v1.0` (or current minor as applicable).

- **Bulk update of 37 files' cross-references** to new subdir paths (via sed -i pattern replacement):
  - 17 `.claude/skills/mp-*/SKILL.md` wikilinks to HITL Standard
  - `.github/PULL_REQUEST_TEMPLATE/feature.md` Related STANDARDs links
  - Root `CLAUDE.md` (11-stage table + Doc Framework section + v4.0.0 note + HITL version reference 1.1 → 1.2)
  - Root `README.md` (ADR_NotebookLM references)
  - `docs/INDEX.md` (full rewrite of post-retrofit state; removed "stays flat" transitional markers)
  - 8 moved docs' internal cross-references updated to subdir-relative paths (`./` siblings stay; `../guide/`, `../rule/`, etc. for cross-subdir)
  - `docs/ai_engineering_execution_hitl_workflow.md` (generic doc, exempt from framework but updated path to specialized variant)
  - `plugins/learn-kit/README.md` + 4 internal learn-kit docs

- **Removed `.gitkeep` placeholders** from `docs/{guide,runbook,adr}/` (now populated by moved docs); `docs/postmortem/` retains `.gitkeep` (still empty).

### Preserved unchanged (historical fidelity)

- `CHANGELOG.md` (root and `plugins/learn-kit/CHANGELOG.md`): historical references reflect path state at time of each release entry. Updating these would falsify the historical record.
- `docs/MIGRATION_GUIDE.md`: same rationale (release-cycle artifact frozen at original migration time).

### Out of scope (preserved for later)

- Content drift in `[GUIDE]_Version_Management.md` and `[RUNBOOK]_Release_Operations.md` (references to retired `mj-sys-*` plugins from v3.x era). This is content cleanup independent of the framework retrofit; addressed when those docs are next substantively edited.
- `[ADR]_LearnKit_Discovery_Skills.md` migration to plugin-internal `plugins/learn-kit/docs/adr/` is deferred to PR 4 (v4.3.0).
- Plugin-internal docs framework extension (tag prefixes + frontmatter for `plugins/learn-kit/docs/learn-kit-*.md`) is PR 4 scope.

### Changed (versioning)

- **`VERSION`** — 4.2.0 → 4.2.1 (patch)
- **`.claude-plugin/marketplace.json`** — `metadata.version` 4.2.0 → 4.2.1; `metadata.description` mentions v4.2.1 retrofit; `plugins[].version` unchanged (learn-kit 1.0.0)

### Rationale

PR 2 (v4.2.0) established the doc framework + subdirectory scaffolding; this PR mechanically migrates the 8 pre-existing tag-prefixed docs into their canonical subdirectories and brings them into frontmatter compliance. Phased separation keeps PR 2 reviewable as "introduce framework" without retrofit churn, and keeps PR 3 reviewable as pure mechanical rename + frontmatter add. After v4.2.1, all `docs/**/*.md` (except explicitly exempt files per Framework §1) conform to the v1.0 schema; `/mp-doc-validate` should report zero Critical issues across the corpus.

## [4.2.0] - 2026-05-15

### Added

- **Marketplace Documentation Framework v1.0** — 3 个新 STANDARD 落地 `docs/rule/`：
  - **`docs/rule/[STANDARD]_Documentation_Framework.md`** v1.0 — 6 tag prefixes (`[STANDARD]` / `[ADR]` / `[GUIDE]` / `[RUNBOOK]` / `[SPEC]` / `[POSTMORTEM]`) + 8-field frontmatter (type/scope/summary/owner/created/updated/state/version) + 3-state machine (active/deprecated/archived) + 路径稳定性（active 文件无 `_vX.Y` 后缀，version 居 frontmatter） + INDEX sync 强制 + SKILL.md 显式豁免（用 Claude Code spec native frontmatter）。Adapted from mj-agent Meta v2.2，剔除 track multiplexing / 12 文档类型 / CI gates 等过量内容。
  - **`docs/rule/[STANDARD]_Commit_Message_Convention.md`** v1.0 — `<type>(<scope>): <summary>` + 7 types (feat/fix/perf/refactor/test/docs/infra) + marketplace scope whitelist (v4.x: `learn-kit`, `marketplace`, `ci`, `scripts`, `deps`, `infra`, `docs-rule`, `docs-adr`, `docs-guide`, `docs-runbook`, `docs-spec`, `release`) + branch-type × commit-type 矩阵 + commit 拆分指导 + Co-Authored-By 模式。提取自 `docs/CONTRIBUTING.md` § 提交规范（旧版引用过期 mj-sys-* scopes），扩展为完整 STANDARD。
  - **`docs/rule/[STANDARD]_GitHub_Markdown.md`** v1.0 — Canonical 渲染环境 GitHub web；ATX headings (only) + GFM tables + GitHub native 5 alerts (`[!NOTE]` 等) + frontmatter syntax 严格约束 (ISO-8601 dates, block-style lists, lowercase enums) + 代码块语言 hint + 锚点 ID 自动生成规则 + Mermaid / DOT 用法。Adopted from mj-agent v1.0 ~95% 内容；调整路径示例。

- **`docs/_templates/` — 6 个起草骨架模板**：
  - `TEMPLATE_STANDARD.md` (5 段: Scope / Rules / Examples / Verification / History)
  - `TEMPLATE_ADR.md` (Michael Nygard 7 段: Context / Decision / Consequences / Alternatives / Implementation Plan / AC / References / Decision Log)
  - `TEMPLATE_GUIDE.md` (3 段宽松: Audience / Walkthrough / Further Reading)
  - `TEMPLATE_RUNBOOK.md` (4 段 + `last-verified`: Preconditions / Steps / Verification / Rollback)
  - `TEMPLATE_SPEC.md` (5 段: Purpose / Schema / Examples / Validation / Versioning)
  - `TEMPLATE_POSTMORTEM.md` (6 段: Summary / Timeline / Root Cause / Impact / Remediation / Action Items)

- **`docs/spec/` — 2 个 SPEC seed**：
  - **`docs/spec/[SPEC]_Marketplace_Json_Schema.md`** v1.0 — marketplace.json 本地约定：plugins[] 字段、metadata、版本三角不变量（VERSION ↔ metadata.version ↔ plugins[].version ↔ plugin.json.version）、添加/删除 plugin 的版本影响。
  - **`docs/spec/[SPEC]_Plugin_Json_Schema.md`** v1.0 — plugin.json 6 必需字段 + `repository` MUST be string（per v3.2.1 bugfix） + 不用 `components` 字段 + 必需目录布局 + keywords 组成建议（15-25 个，混 domain / skill / tool）。

- **`docs/{rule,guide,runbook,adr,spec,postmortem,_templates}/`** 子目录全部创建（`.gitkeep` 占位空目录）。本 PR 仅创建新 docs；现有 `docs/` 根目录下的 4 GUIDEs + 1 RUNBOOK + 2 ADRs + 1 STANDARD（HITL Prompt）+ 1 lowercase generic doc 暂保留原位，在 PR 3 (v4.2.1) 通过单独的 mechanical move PR 迁移并加 frontmatter。

### Changed

- **`docs/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md`** v1.1 → **v1.2** —— §4.8 Self-review checklist 从 11 项升到 **12 项**，新增 item 12: 「新建/修改 `docs/**/*.md` 必须遵循 `[STANDARD]_Documentation_Framework` 的 frontmatter 8 字段约束 + 路径规则；用 `/mp-doc-validate` 跑审计；豁免列表明确（INDEX/CONTRIBUTING/MIGRATION_GUIDE/README/CHANGELOG/plugin CLAUDE.md/SKILL.md）」。§8 版本历史新增 v1.2 条目。
- **`docs/INDEX.md`** —— Schema 升级反映新子目录结构（rule/ guide/ runbook/ adr/ spec/ postmortem/ _templates/）；明确标注「现有文档仍在 flat `docs/` 路径，PR 3 retrofit 时迁入子目录」；新增 「Templates」 段 + 「Specifications」 段 + 「Doc Authors」 reading order；reading order 表更新引用新 STANDARDs。
- **`docs/CONTRIBUTING.md`** —— § 提交规范 段从详细表改为 5-line summary + 链 [`[STANDARD]_Commit_Message_Convention.md`](rule/[STANDARD]_Commit_Message_Convention.md)。Marketplace scope whitelist 修正为 v4.x（剔除过期的 mj-sys-* scopes）。
- **`CLAUDE.md`**（marketplace 根）—— 新增 § Documentation Framework 段（v4.2.0 起），列出 3 个新 STANDARDs + docs/ 子目录结构图 + templates / mp-doc-* skill 协作模型；段位插入在 § v4.0.0 Restructure Note 之前。
- **`.github/PULL_REQUEST_TEMPLATE/feature.md`** —— § 自检结果 段增加 「文档合规」「commit STANDARD 引用」 checkbox；新增 § Related STANDARDs 段（4 项链接）。
- **`.github/PULL_REQUEST_TEMPLATE/documentation.md`** —— § 自检结果 完全重写以引用 Documentation Framework 的 8 字段 frontmatter / 子目录路径 / markdown 风格规则；新增 § Related STANDARDs 段。

### Changed (versioning)

- **`VERSION`** — 4.1.0 → 4.2.0
- **`.claude-plugin/marketplace.json`** — `metadata.version` 4.1.0 → 4.2.0；`metadata.description` 增加 v4.2.0 段描述新 framework；`plugins[].version` 不变（learn-kit 1.0.0）

### Migration notes for users (v4.1.0 → v4.2.0)

- **现有文档无需立即迁移**：本 PR 仅引入 framework + 创建子目录。`docs/` 根目录下的 12 个现有文档（GUIDEs / RUNBOOK / ADRs / HITL Standard）保留原位，引用路径不变。
- **新文档强制走 framework**：从 v4.2.0 起，任何新建的 tag-prefixed `docs/**/*.md` 必须用 `docs/_templates/TEMPLATE_*.md` 起草，含完整 8 字段 frontmatter，落正确子目录。
- **commit format 不变** but scope whitelist 升级：从本 PR 起，scope `mj-sys-*` （v3.x 遗留）不再合法；用 `marketplace` / `learn-kit` / `docs-*` / `ci` / `scripts` / `deps` / `infra` / `release` 替代。`/mp-git-commit` skill 自动验证。
- **PR 3 (v4.2.1) 即将到来**：mechanical move 把现有 12 个文档迁入 subdirs + 加 frontmatter；该 PR 仅 rename + frontmatter retrofit，无内容编辑。

### Rationale

PR 1 (v4.1.0) 给 marketplace 配齐了 11-stage 工作流 skill 与 HITL Standard v1.1 集成；但缺失文档规范本身——AI agent 写新 ADR / GUIDE 时无统一可引用的 frontmatter schema、命名规则、状态机。本 PR 引入轻量 Hybrid 深度的 marketplace 文档框架（参考 mj-agent Meta v2.2 但剔除 track multiplexing / runtime types / CI gates），落地 3 个 STANDARDs + 6 templates + 2 SPEC seeds。Phased rollout：本 PR 仅创建 framework 本身（不动现有文档；保证内部一致性，避免 v1.0 STANDARD 引用 frontmatter 规则但现有文档不合规的窗口）；PR 3 才 mechanical migrate；PR 4 延伸至 learn-kit 内部。



### Added

- **`.claude/skills/` — 18 个项目本地 Track C 工作流 skill** 覆盖 flow + git + doc 三 family。所有 skill 用 `mp-*` 命名 prefix，匹配 mj-agent `mj-agent-*` 同源对称风格。每个 SKILL.md 含 frontmatter (name + description with 双语 trigger phrases) + 10 段 body（Overview / Workflow DOT diagram / When to Run / Step-by-step / Output Format / DOES NOT DO / Sub-skill / Reference Files / Anti-patterns / Handoff）。
  - **mp-flow-* (9)**: `intake` (Stage 0 任务准入) / `repo-scan` (Stage 1 marketplace 8 维事实核查) / `plan` (Stage 2 6 段 Plan body) / `design-adr` (Stage 3 Michael Nygard 7 段 ADR) / `author` (Stage 4 orchestrator → /plugin-dev:create-plugin + /skill-creator:skill-creator) / `compliance` (Stage 5 orchestrator → /plugin-dev:plugin-validator + skill-reviewer agents) / `dogfood` (Stage 6 真实环境验证) / `self-review` (Stage 7 11-item checklist + §4.7 双段) / `post-merge` (Stage 10 post-merge orchestrator)
  - **mp-git-* (6)**: `branch` (worktree-based bare repo 分支创建；G1 hard requirement) / `commit` (7-step pre-commit + type/branch 矩阵 + scope 推导) / `push` (7-item pre-push checklist) / `pr` (gh pr create --body-file 模式 + 6 PR template) / `merge-gate` (Stage 9 readiness + main HITL) / `cleanup` (`git worktree remove` + `git branch -D` + `git fetch --tags`)
  - **mp-doc-* (3)**: `author` (tag-prefixed doc 起草 + 8-field frontmatter；post-PR 2 framework prerequisite) / `validate` (frontmatter / path / INDEX / wikilink 合规审计) / `bump-version` (4 站点 atomic 版本同步 + CHANGELOG 段头 promote)

### Changed

- **`docs/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md`** v1.0 → **v1.1**：
  - §4.1-§4.11 Skill Hint 段全部 refactor，Preferred Skill 指向新建 `mp-*` skill；外部 plugin-dev / skill-creator skill 转为 Augment（被 orchestrator 内部调用）或 Fallback（skill 不可用时手工）
  - §5.1 Skill 矩阵填全：11 阶段无「—」（每阶段 Preferred Skill + Augment/Fallback 完整）
  - §5.2 重整为 4 大类 skill 来源表（项目本地 / 本 marketplace 插件 / 外部 plugin-dev / 通用方法学），含 2026-05-15 完整快照清单
  - §5.3 选用原则按稳定性 + 域适配优先级重排：**最优先项目本地 `mp-*` > learn-kit > plugin-dev > superpowers**
  - line 357 / 703 修正：`v4.0.0 起本 marketplace 唯一 plugin` → `本 marketplace 唯一 plugin`（去 forward-looking 表述，v4.0.0 已落地）
  - §8 版本历史加 v1.1 条目
- **`docs/[GUIDE]_Marketplace_Agent_Execution_Checklist.md`** v1.0 → **v1.1**：每 stage 新增 **Preferred Skill** 标记行；Stage 8 改为 3-skill chain；Stage 10 改为 2-skill chain；§5 版本历史更新
- **`CLAUDE.md`**（marketplace 根）—— 「11 阶段速查表」Preferred Skill 列全部填上 `/mp-*` 引用；新增 **Project-Local Skills (`.claude/skills/`)** 段说明 18 件 skill 划分 3 family；AI Engineering 段头 "v3.2.0 起" → "v4.1.0 起含 18 件项目本地 mp-* skill"

### Changed (versioning)

- **`VERSION`** — 4.0.0 → 4.1.0
- **`.claude-plugin/marketplace.json`** — `metadata.version` 4.0.0 → 4.1.0；`metadata.description` 增加 v4.1.0 段（18 项目本地 skill）；`plugins[].version` 不变（learn-kit 1.0.0 仍然，本 PR 不动 plugin）

### Rationale

v4.0.0 NotebookLM_Kit 退役 + learn-kit v1.0.0 落地后，marketplace 工作流稳态化。mj-agent 同期已发展出 34 件 `.claude/skills/mj-agent-*` Track C skill；本 PR 移植其中 18 件适用于 marketplace 静态注册表场景的（剔除 runtime / infra 两 family，剔除 n8n / SQL guardrail / Docker / LLM endpoint 等 mj-agent 专属内容）。匹配 mj-agent 同源对称风格（`<project>-<family>-<action>`）以保持跨项目 AI agent 识别一致性。



### Removed

- **`plugins/notebooklm-kit/`** — 整个插件递归删除（22 个文件：plugin.json + CLAUDE.md + CHANGELOG.md + README.md + 7 个 skill + 10 份 `nlm-shared/` 共享参考）。退役 skill：`auth` / `build` / `studio` / `learn-make` / `learn-test` / `manage` / `query`。**永久退役场景**（无替代）：quiz / flashcards / data_table / report / cross-notebook query / source 增删改 / notebook 分享 / Deep Research。用户场景中需要 quiz/flashcards 的请用外部评估工具；需要 notebook 管理的请用 notebooklm.google.com web UI；需要跨 notebook 查询的同上。

### Added

- **`plugins/learn-kit/skills/nlm-studio/SKILL.md`** + **9 个 templates** — 新 skill `/learn-kit:nlm-studio <topic>` 吸收 notebooklm-kit 的核心多媒体场景（build + studio 多媒体制品生成），但加入 **View-Purpose Preservation** 原则使生成的 artifact 显著保留 foundation/structural/challenge 三档的教学目的差异。**生成 4 view-cycled 类型 × 3 view + 1 shared view-agnostic mind_map = 13 个 artifact**（mind_map 经 dogfood 发现 NLM 对其 view 差异化无视，故收敛为 1 shared / topic）。5-step workflow with per-Step auth refresh（pre-flight: real auth gate via notebook_list, not just local refresh_auth+server_info → re-run guard → notebook setup: 3 markdown source_add + mandatory notebook_get verification → quota confirm gate → artifact generation in 3 parallel batches of 5/4/4 with mid-run auth retry-once → terminal recap）。**markdown-only 源**（HTML 在 dogfood 中被 NLM 在 file 和 text 两模式下都拒，故 v1.0.0 不上传 HTML）。零本地落盘（artifact 全在 notebooklm.google.com 在线访问）。9 个 prompt 模板：3 view-prefix（pedagogical purpose 五段必备）+ 5 artifact-suffix（4 view-cycled + 1 view-agnostic mind_map）+ 1 interaction-overrides.yaml（4 个 view × artifact 高耦合 cell 联合调优；mind_map 不在 cartesian 中）。
- **`docs/[ADR]_NotebookLM_Kit_Retirement.md`** — 新 ADR：记录 v4.0.0 退场决策（context / decision / consequences / 4 个 alternative considered + 否决理由 / compliance verification 路径）。

### Moved

- **`plugins/notebooklm-kit/.mcp.json` → `plugins/learn-kit/.mcp.json`** — `notebooklm-mcp` MCP server 注册位置迁移；server name 不变；MCP 工具前缀**自然变化**从 `mcp__plugin_notebooklm-kit_notebooklm-mcp__*` 变为 `mcp__plugin_learn-kit_notebooklm-mcp__*`（规则：`mcp__plugin_<plugin.json-name>_<server-key>__<tool>`）。

### Changed

- **`VERSION`** — 3.2.1 → 4.0.0
- **`.claude-plugin/marketplace.json`** — `metadata.version` 3.2.1 → 4.0.0；`metadata.description` 重写（从 "two plugins" 变为 "sole plugin: learn-kit"）；删 `plugins[]` 中 `notebooklm-kit` 条目；`learn-kit` 条目 version 0.3.1 → 1.0.0 + description 重写覆盖 5 个 skill + `keywords` 新增 8 词（`nlm-studio` / `notebooklm` / `audio` / `video` / `multimedia` / `slide-deck` / `mind-map` / `infographic`）—— 改善 marketplace 搜索 discoverability
- **`plugins/learn-kit/.claude-plugin/plugin.json`** — version 0.3.1 → 1.0.0；description 改写删 "Independent plugin — no external service dependencies" 加 nlm-studio 描述 + 分级依赖说明；keywords 同步加 8 个新词
- **`plugins/learn-kit/CLAUDE.md`** — 删独立性宣言；新增「v1.0.0 起的依赖」段；新增「触发 `/learn-kit:nlm-studio`」段；新增「NLM 集成 · 工具前缀」段说明 MCP prefix 规则
- **`plugins/learn-kit/CHANGELOG.md`** — 加 `[1.0.0] - 2026-05-14` 完整条目（Added / Changed / Breaking / Released as part of）
- **`plugins/learn-kit/README.md`** — opener 加多媒体流；加 §前置依赖 段；§使用 step 5 详述 nlm-studio；evolution table 加 v1.0.0 行
- **`plugins/learn-kit/skills/generate-tier/SKILL.md`** — workflow 8-step → **10-step**（HTML 渲染 step 8 后插入 optional step 9 询问是否调 nlm-studio；原 step 9 Summary 改名 step 10）；`generator` frontmatter tag bumped 到 `learn-kit/generate-tier v1.0.0`；§Non-goals 中 "no NotebookLM" 改写为「step 9 only **offers** to invoke external services; user must opt in」
- **`CLAUDE.md`**（marketplace 根）— "2 个通用插件" 改为 "1 个通用插件"；新增 §v4.0.0 Restructure Note；其他 v3.x notes 折叠到「历史版本记录」段
- **`README.md`**（marketplace 根）— version badge 3.2.1 → 4.0.0；插件表只剩 learn-kit；加 5 skill 子表；§3 使用示例 / §更新 / §v3.x → v4.0.0 迁移指引 / §历史版本 全部按 1-plugin 重写
- **`docs/INDEX.md`** — Architecture Decision Records 表加新 ADR 行；Plugin References 段更新为 1-plugin 状态
- **`docs/MIGRATION_GUIDE.md`** — 重排：原内容归 §1 v2.x→v3.0.0；新增 §2 v3.2.x→v4.0.0（退役 skill 替代矩阵 + 工具前缀变化 + 用户迁移 5 步 + legacy mj-nlm 卸载提醒 + 历史 NLM 数据兼容性 + 回滚路径）
- **`docs/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md`** — 4 处 `notebooklm-kit` 引用更新（line 357 reference docs / 427 skill-reviewer fallback / 699 hybrid skill matrix / 704 marketplace 自有 skill 选用原则）

### Breaking

- **Marketplace surface 减少**：v3.x 的 2 plugin 减到 v4.0.0 的 1 plugin。用户 `~/.claude/settings.json` 中如显式 enable 过 `notebooklm-kit@mj-agentlab-marketplace` 的条目会成为 orphan reference（无害）。
- **退役 7 个 skill** 无替代（详见 §Removed）；用户场景中真依赖 quiz / cross-notebook / source 管理者需要切换到外部工具或 web UI。
- **MCP server 重复加载风险**：如用户曾手动注册 legacy `mj-nlm@my-marketplace` plugin，升级 v4.0.0 后会出现两个 `notebooklm-mcp` server 同名加载；MIGRATION_GUIDE 明示需 `/plugin uninstall mj-nlm@my-marketplace`。

### Dogfood-validated design adjustments (in v4.0.0 PR pre-merge)

End-to-end dogfooding of `/learn-kit:nlm-studio documentation-framework` against mj-agent's `learning/documentation-framework/` produced 5 findings that reshaped the v1.0.0 release before merge:

1. **HTML upload dropped** — NLM rejects `.html` source uploads in both `source_type="file"` and `source_type="text"` modes for non-trivial content. The L2 file→text fallback in earlier drafts is removed entirely. Only 3 `.md` files are uploaded per topic. HTML output of `/learn-kit:generate-tier` is now explicitly for human browser viewing only, not NLM ingestion. Source count per notebook: 6 → 3.
2. **Pre-flight strengthened** — `refresh_auth` + `server_info` are local-only checks (token presence + freshness timestamp); they do NOT verify Google still accepts the token. Step 1.4 now calls `notebook_list` as a real network-level auth gate.
3. **Per-Step auth refresh** — NLM tokens observed to expire within 15–30 min, often inside a single 7–15 min `nlm-studio` run. Every Step now refreshes auth at its start; mid-run auth failure in Step 4 retries once before aborting.
4. **Post-upload verification mandatory** — `source_add` error responses are unreliable (server may async-succeed despite client error). Step 3 now mandates `notebook_get` to cross-check the actual source list; trust notebook_get over the source_add response.
5. **Mind_map collapsed to view-agnostic** — NLM's mind_map artifact type produces near-identical structural-hierarchy output across foundation/structural/challenge prompting variants. Producing 3 view-cycled mind_maps wasted quota for redundant content. v1.0.0 ships with one shared mind_map per topic; previous structural+mind_map interaction-override removed; artifact total: 15 → 13.

Additional optimization: parallel batches of 5 `studio_create` calls per round work without rate-limiting, replacing the original strict-sequential design for ~3× speedup.

### Released

通过 release.yml 自动 tag `v4.0.0` + 创建 GitHub Release (trigger: push to main + paths: VERSION)。本次包含 marketplace v4.0.0 + learn-kit v1.0.0 双 tag（marketplace 主标签；learn-kit 跟随 marketplace tag policy）。

## [3.2.1] - 2026-05-14

### Fixed

- **`plugins/learn-kit/.claude-plugin/plugin.json`** + **`plugins/notebooklm-kit/.claude-plugin/plugin.json`** — `repository` field rewritten from `{ type, url }` object form to string form, per [Claude Code plugin manifest schema](https://code.claude.com/docs/en/plugins-reference). Prior shape caused `/plugin` install to fail with `Validation errors: repository: Invalid input: expected string, received object`. (PR #70)

### Changed

- **`VERSION`** — 3.2.0 → 3.2.1
- **`.claude-plugin/marketplace.json`** — `metadata.version` 3.2.0 → 3.2.1; `notebooklm-kit` entry version 2.4.1 → 2.4.2; `learn-kit` entry version 0.3.0 → 0.3.1
- **`plugins/notebooklm-kit/.claude-plugin/plugin.json`** — version 2.4.1 → 2.4.2 (cache-bust patch so `/plugin update` picks up the manifest fix)
- **`plugins/learn-kit/.claude-plugin/plugin.json`** — version 0.3.0 → 0.3.1 (same rationale)
- **`README.md`** — badge 3.1.0 → 3.2.1 (also corrects stale badge that was not bumped during v3.2.0); plugin table `notebooklm-kit` version 2.4.1 → 2.4.2; `learn-kit` row updated (version 0.2.0 → 0.3.1, skills 3 → 4 to reflect `generate-tier` added in v3.2.0, description appends generate-tier mention)

### Released

通过 release.yml 自动 tag `v3.2.1` + 创建 GitHub Release (trigger: push to main + paths: VERSION)

## [3.2.0] - 2026-05-13

### Added

- **`docs/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md`** — marketplace 第一个 `[STANDARD]_*` 文档，定义 AI agent 在 marketplace 仓库内的 11 阶段闭环工作流 + Prompt 通用结构 + HITL 触发规则 + Hybrid Skill 矩阵（plugin-dev + skill-creator + superpowers + marketplace self-hosted）。从 v3.0.0 + v3.1.0 两轮实战经验提炼；剥离 mj-system 同名 STANDARD 中 DB / n8n / ETL / FastAPI / Flyway 等不适用内容；保留 HITL 哲学骨架。 (PR #65)
- **`docs/[GUIDE]_Marketplace_Agent_Execution_Checklist.md`** — STANDARD 的运行时配套勾选清单。把每个 stage 压缩为 4 段（Entry / Actions / Verification / Exit），共 11 stage × ~25 行，便于 agent 与人类在执行中对照。包含通用 HITL 触发摘要表 + 5 个关联文档指针。 (PR #66)
- **`docs/INDEX.md`** 新增 `## Standards` 段登记 STANDARD；Guides 表新增 GUIDE 行；Plugin Developers 推荐阅读顺序加入 STANDARD（步骤 2）+ GUIDE（步骤 3）
- **顶层 `CLAUDE.md`** 新增 `## AI Engineering` 段，从原 4-bullet 摘要升级为完整 11-stage 速查表 + HITL 触发摘要表 + 同时引用 STANDARD + GUIDE；v3.2.0 加 Update Note 段反映 learn-kit v0.3.0 generate-tier + NLM decoupling
- **learn-kit v0.2.0 → v0.3.0** — 两条主线 (PR #68)：
  - **新增 `/learn-kit:generate-tier`** — AI 一键生成三档（foundation 零基础版 / structural 结构版 / challenge 挑战版）reading-tier 学习文档，8 步工作流：intake → pre-flight → source acquisition (4 机制多选: project paths / scan-locate / pasted text / dir scan) → tier selection (multi-select, 默认全选) → topic confirmation + conflict policy → per-tier markdown gen → INDEX update → optional HTML render (per-tier, spawn Explore subagent 做概念→代码 grounding)。配 4 个 prompt templates: `templates/{foundation,structural,challenge,html-renderer}.md` (~1193 行总和)
  - **与 notebooklm-kit 解绑** — 删除 `templates/NLM_RECORD_TEMPLATE.md`；移除 METHODOLOGY §10.1 NLM integration 段（METHODOLOGY 内部版本 v0.2 → v0.3）；清理 init/locate/scan SKILL 中所有 `/notebooklm-kit:*` 互引；plugin.json + marketplace.json learn-kit description 重写为「Independent plugin — no external service dependencies」。两插件可继续在同一 marketplace 共存，但 learn-kit 不再 promote 任何 NotebookLM 工作流
  - **HTML 渲染策略** — 默认全离线（无 CDN，inline CSS/JS，手写语法高亮 + SVG 流程图 + Tab/折叠/复制为 prompt 按钮 + 暗亮主题）；spawn Explore subagent 在主对话外做 concept→code grounding 避免上下文淹没

### Changed

- **`docs/INDEX.md` Plugin References** — 清理 v3.0.0 已删除的 mj-sys-ops / mj-sys-git secrets setup 引用（stale reference fix-while-here）
- **`.claude-plugin/marketplace.json`** — metadata.version 3.1.0 → 3.2.0；learn-kit 条目 version 0.2.0 → 0.3.0 + description 重写（去掉 NLM coupling 主张，加 3-tier generator + HTML render 能力）+ keywords 扩展（three-tier / foundation / structural / challenge / ai-generation / html-render）
- **`VERSION`** — 3.1.0 → 3.2.0
- **`plugins/learn-kit/.claude-plugin/plugin.json`** — version 0.2.0 → 0.3.0；description / keywords mirror marketplace.json (byte-identical for description per validator)

### Removed

- **`plugins/learn-kit/skills/init/templates/NLM_RECORD_TEMPLATE.md`** (-242L) — entire file deleted；NLM artifact metadata schema is no longer maintained by learn-kit。v0.2.x 用户迁移：见 `plugins/learn-kit/CHANGELOG.md` [0.3.0] §Migration note 段
- **`plugins/learn-kit/skills/init/templates/METHODOLOGY.md` §10.1 With notebooklm-kit** — section removed；§10.2 markdownlint 提升为新 §10.1
- **`plugins/learn-kit/skills/init/templates/INDEX.md` §NotebookLM Notebooks** + 维护规则 NLM bullet — sections removed；新增 §Tier Documents 段为 generate-tier 占位
- All `/notebooklm-kit:*` cross-references in init / locate / scan SKILL.md and templates

### Decoupled

- **learn-kit ↔ notebooklm-kit** — 两插件不再互依，可独立采用。详见 `plugins/learn-kit/CHANGELOG.md` [0.3.0] §Decoupled from + §Migration note

### Released

通过 release.yml 自动 tag `v3.2.0` + 创建 GitHub Release（trigger: push to main + paths: VERSION）

## [3.1.0] - 2026-05-11

### Added

- **learn-kit v0.1.0 → v0.2.0** — 新增 2 个 discovery skills，闭环初次使用场景：
  - `/learn-kit:locate <query>` — 反向定位概念名 / 口诀 / 部分文档名 → 已解读 [LEARNING] 文档（首选）+ 源 canonical 文档（次选），含置信度分级与项目识别 profile
  - `/learn-kit:scan` — 项目可学候选枚举：按 tag prefix 分类（[STANDARD]/[SPEC]/[ADR]/[GUIDE]/[RUNBOOK]），交叉标记已解读 vs 未解读，按引用频率 (PageRank-lite) 排序
  - `skills/init/templates/METHODOLOGY.md` 新增 §1.5 "Project Discovery"（v0.1 → v0.2），文档化 scan → locate → 8-stage 推荐工作流

- **`docs/[ADR]_LearnKit_Discovery_Skills.md`** — 决策记录：为什么选 2 skill 而非 1 或 3；为什么纯启发式而非 manifest；为什么不引入持久化 cache

- **`docs/INDEX.md`** — 新增 Architecture Decision Records 段，登记 ADR

### Changed

- **`.claude-plugin/marketplace.json`** — metadata.version 3.0.0 → 3.1.0；learn-kit 条目 version 0.1.0 → 0.2.0 + description 提及 locate/scan + keywords 扩展（discovery / locate / scan）
- **`VERSION`** — 3.0.0 → 3.1.0
- **`README.md`** — version badge 3.0.0 → 3.1.0；learn-kit 插件目录行更新（skills 1 → 3、version 0.1.0 → 0.2.0、description 更新）；使用示例段补充 `/learn-kit:locate` 与 `/learn-kit:scan`

### Design notes

- Pure heuristic project recognition (零配置)：扫 CLAUDE.md tag 声明 + learning/INDEX.md / docs/INDEX.md 存在性 + 文件 tag prefix 实测；confidence 分级 ≥0.95 / 0.85–0.95 / 0.7–0.85 / <0.7-with-warning
- Stateless re-scan：每次调用全量扫描，无 cache / manifest / 持久化索引；典型项目 (<500 doc) 1–5s 完成
- 与 notebooklm-kit 解耦：learn-kit discovery 不直接调 NotebookLM；用户 read 后自行决定是否生成 NLM 制品
- mj-system / mj-agent / 用户全局 settings / ranzuozhou/my-marketplace 一律零改动；消费者侧整合保留为可选 follow-up

### Risk

- 启发式识别在 tag 不统一项目失效 → 已设 confidence < 0.7 warning + best-effort 兜底
- 大项目（>1000 doc）Grep 性能退化 → 已设 `path:` / `tag:` 限定参数

## [3.0.0] - 2026-05-11

### Breaking Changes

Marketplace 从 "MJ System 团队专属工具集" 重构为 "通用 Claude Code 插件市场"。完整迁移指引见 [docs/MIGRATION_GUIDE.md](docs/MIGRATION_GUIDE.md)。

### Removed

- **mj-sys-doc** v3.0.2 — 已迁回 mj-system 项目 in-tree skills（`.claude/skills/mj-sys-doc-*/`）
- **mj-sys-git** v2.0.0 — 已迁回 mj-system 项目 in-tree skills
- **mj-sys-n8n** v2.0.0 — 已迁回 mj-system 项目 in-tree skills
- **mj-sys-ops** v2.0.0 — 已迁回 mj-system 项目 in-tree skills
- **mj-agent-code-doc** v0.1.0 — 已迁回 mj-agent 项目 in-tree skills

### Added

- **learn-kit** v0.1.0 — 教学方法论 kit：8 阶段方法（Source Intake / Framework Induction / Categorical Alignment / Asymmetry Handling / Terminology Pairing / Metaphor Unification / Page Assembly / Quality Gates）+ METHODOLOGY / NLM_RECORD_TEMPLATE / INDEX 模板 + RFC 2119 worked example + `/learn-kit:init` scaffold 命令。从 mj-system v2.0 STANDARD-tier `[LEARNING]_Rule_List_Interpretation_Authoring.md`（N=5 跨域验证）剥离 MJ 引用通用化而来。

- **notebooklm-kit** v2.4.1 — NotebookLM 集成（auth / build / studio / query / manage 5 个 base skill + learn-make / learn-test 2 个高级 wrapper + _shared 公共内容）。**从 `mj-nlm` v2.4.1（ranzuozhou/my-marketplace）迁移并重命名而来**。功能 1:1 保留；8 个 skill folder 去 `mj-nlm-` 前缀；slash 命令 namespace `/mj-nlm:X` → `/notebooklm-kit:X`；MCP server 名保持 `notebooklm-mcp` 未变；`author.name` 保留 `ranzuozhou`（创作者归属）。

### Changed

- `metadata.description` 重写：从 "MJ System 团队插件市场 — 提供文档、Git、n8n、运维等 Claude Code 插件" 改为 "Generic Claude Code plugins for AI engineering workflows. NotebookLM integration (notebooklm-kit) and pedagogical methodology (learn-kit). Tested with mj-system and mj-agent."
- 顶层 `README.md` 重写：反映 generic 定位 + 新插件目录 + v3.0.0 迁移指引入口
- `VERSION` 文件：2.1.1 → 3.0.0

### Migration

旧来源 `ranzuozhou/my-marketplace/mj-nlm` 保持可用（未删除），消费者按需切换。mj-system / mj-agent 两项目本身不在本 PR 修改范围——消费者侧整合（settings.json / 文档引用清理）由各项目维护者按需推进。详见 [docs/MIGRATION_GUIDE.md](docs/MIGRATION_GUIDE.md)。

### Risk

- mj-system / mj-agent 项目 `.claude/settings.json` 中残留 `mj-sys-*` / `mj-agent-code-doc` 启用条目变成 orphan plugin reference（无害，可独立清理）
- 用户在 `~/.claude/settings.json` 中残留 `mj-nlm@my-marketplace` 仍可用（来源未删）

## [2.1.1] - 2026-04-30

### Fixed

- **mj-sys-doc 3.0.0 → 3.0.1** (#57, fix #56) — `validate_doc.py:parse_frontmatter` 未剥离 YAML quoted scalar 引号，导致所有 v5.0 frontmatter（默认 quoted form 如 `state: "active"`）被检查为含字面引号字符串 → 与未引号 `VALID_STATES`/`VALID_TYPES`/`VALID_DOMAINS` 集合比较后误报 A3 FAIL。新增 `_strip_yaml_quotes` 辅助函数剥离首尾匹配引号；下游所有 v5.0 文档库（mj-system + 任何 v5.0 仓）A3 误报消除

### Added

- **mj-sys-doc 3.0.1 → 3.0.2** (#59, fix #58) — `validate_doc.py:VALID_DOMAINS` 注册新服务域 `SVL`（SubmitVolumeLoader），与已登记的 `QVL` 平行；支持 mj-system #173 引入的新 biz/ops 域服务

## [2.1.0] - 2026-04-29

### Added
- 新增插件 `mj-agent-code-doc` v0.1.0 — MJ-Agent code-side 文档工作流 plugin
  （v0.1 部分骨架，含 plan + author 2 个 skill；validate + sync 推迟至 Phase 1）(#54)
  - `mj-agent-code-doc-plan` — 跨多文档大型变更的 PLAN 起草引导
  - `mj-agent-code-doc-author` — 8 类 canonical 起草引导
    （GUIDE / ADR / SPEC / RUNBOOK / POSTMORTEM / STANDARD / ISSUE / ASSESSMENT）
  - SKILL.md 采用 Claude Code 原生 schema（per mj-agent ADR-013）

### Changed
- mj-sys-git: 重新加密 `secrets-sys-git.enc`（恢复的 GitHub PAT），无代码变更 (#53)
- 各插件 CHANGELOG 对齐 Keep a Changelog 格式 (#54)
- README.md 同步至 marketplace.json 实际版本：插件目录表格修正 + 新增 mj-agent-code-doc 行 + 顶部 version 徽章更新（修正自 v1.3.2 / v2.0.0 起的版本漂移）

## [2.0.0] - 2026-04-25

### Breaking Changes
为 mj-agent 家族插件预留命名空间，所有现有 mj-system 专属插件重命名为 `mj-sys-*` 前缀：
- `mj-doc` → `mj-sys-doc` v3.0.0
- `mj-git` → `mj-sys-git` v2.0.0
- `mj-n8n` → `mj-sys-n8n` v2.0.0
- `mj-ops` → `mj-sys-ops` v2.0.0

用户迁移步骤见 `[GUIDE]_Updated_Plugin_Installation_Steps.md`。

未来 mj-agent 家族插件将采用 `mj-agent-*` 前缀，与 mj-sys-* 形成镜像结构。

## [1.3.2] - 2026-04-22

### Changed
- mj-ops: 轮换加密运维密钥，无代码变更 (#49)

## [1.3.1] - 2026-04-11

### Fixed
- mj-ops: `pg-server-start.cmd` 新增 npx 缓存依赖完整性校验，防止缓存损坏导致 postgres-* MCP server 永久 `failed` (#46)

## [1.3.0] - 2026-04-03

### Added
- mj-doc: 升级至 v2.0.0，全面支持 Documentation Management Framework v5.0
- mj-doc: 新增 A4（链接存在性）、A5（INDEX 管理块同步）、A6（CLAUDE.md 允许列表）阻断性检查
- mj-doc: 新增 `--repo-root`、`--pr-mode`、`--write-managed-indexes` CLI 参数
- mj-doc: 新增 Q-12 交互节点（文档层级归属歧义）
- mj-doc: 新增 v4.5→v5.0 前置元数据映射和状态映射表
- mj-doc: 新增 unittest 回归测试套件

### Changed
- mj-doc: **BREAKING** — v2.0 仅支持已完成 v5.0 迁移的仓库（v1.2.0 → v2.0.0）
- mj-doc: 前置元数据模式从 v4.5 切换为 v5.0（type/domain/summary/owner/created/updated/state）
- mj-doc: 状态生命周期从 6+ 中文状态简化为 draft/active/deprecated
- mj-doc: 校验检查重编号为 A1-A6（阻断性）+ OB1-OB5（非阻断性）
- mj-doc: 计划输出路径从 `docs/plans/` 变更为顶级 `plans/`

## [1.2.6] - 2026-04-02

### Fixed
- mj-ops: MCP postgres 查询结果中 timestamp/timestamptz 字段保留 PostgreSQL 原始时区格式，不再转为 UTC (#38)
- mj-n8n: WeChat 通知模板时间字段从 UTC ISO 格式改为北京时间显示，新增 DateTime 时区处理约定 (#39)

## [1.2.5] - 2026-03-27

### Changed
- mj-doc: 全部 6 个技能同步至 Documentation Management Framework v4.5，新增 `[ISSUE]` 和 `[ASSESSMENT]` 文档类型支持（v1.1.0 → v1.2.0）

### Fixed
- scripts: bump-version.ps1 同步 README 插件版本表

## [1.2.4] - 2026-03-24

### Fixed
- mj-ops + mj-git: `Find-OpenSSL` 改为从 `git.exe` 位置动态推导 OpenSSL 路径，支持非标准 Git 安装路径

## [1.2.3] - 2026-03-24

### Fixed
- mj-ops + mj-git: `Find-OpenSSL` 优先使用 Git for Windows 标准 OpenSSL，避免 Anaconda PATH 中的非标准构建导致 `bad decrypt`

## [1.2.2] - 2026-03-23

### Fixed
- mj-ops + mj-git: 加解密脚本添加 `-md sha256` 参数，修复 OpenSSL 1.x/3.x 跨版本 PBKDF2 摘要算法不一致导致 `bad decrypt`
- mj-doc/mj-git/mj-n8n: 补充遗漏的 [1.1.0] CHANGELOG 条目（版本号与变更记录对齐）

### Changed
- mj-ops: PostgreSQL WAN MCP 条目移除 fallback 硬编码凭据，未配置环境变量时连接失败而非静默使用默认凭据

## [1.2.1] - 2026-03-23

### Fixed
- bump-version.ps1 输出文件移除 UTF-8 BOM，修复 CI marketplace.json 验证失败

### Changed
- 项目级 `.claude/settings.json` 新增 permissions 配置（allow/deny 规则）并重新启用 mp-dev、mp-git 插件

## [1.2.0] - 2026-03-23

### Added
- mj-ops: 加密秘密值管理 — `config/secrets-ops.enc`（9 变量: 4 SSH 密码 + 5 PG URLs）+ `scripts/setup-ops-env.ps1`（支持 `-Reload`、`-Force`）+ `scripts/encrypt-ops-secrets.ps1`
- mj-git: 加密秘密值管理 — `config/secrets-git.enc`（1 变量: GitHub PAT）+ `scripts/setup-git-env.ps1`（支持 `-Reload`、`-Force`）+ `scripts/encrypt-git-secrets.ps1`
- 两个插件 README.md 新增 Post-Install Setup 章节
- 两个插件 CLAUDE.md 新增 Secrets Setup 章节
- marketplace CLAUDE.md 新增 Plugin Secrets Management 章节
- docs/INDEX.md 新增 Plugin References 章节

## [1.1.5] - 2026-03-20

### Changed
- mj-ops: PostgreSQL WAN MCP 条目移除 fallback 硬编码凭据，未配置环境变量时连接失败而非静默使用默认凭据

## [1.1.4] - 2026-03-20

### Fixed
- mj-ops: PostgreSQL WAN 默认端口适配 FRP 实际范式（543202→25432、543203→35432）

## [1.1.3] - 2026-03-20

### Added
- mj-ops: 云服务器 SSH 条目 `SSH_SERVER_CLOUD_*`（8.135.38.175:22）
- mj-ops: 3 组 WAN 穿透 SSH 条目（RUNNER_WAN :2201、TEST_WAN :2202、PROD_WAN :2203）
- mj-ops: PostgreSQL MCP 服务器 postgres-test-wan、postgres-prod-lan、postgres-prod-wan
- mj-ops: env-reference.md 新增 5 个 PostgreSQL MCP URL 覆盖变量文档

### Changed
- **BREAKING** mj-ops: SSH 环境变量 `SSH_SERVER_DEV_*` 重命名为 `SSH_SERVER_RUNNER_LAN_*`
- **BREAKING** mj-ops: PostgreSQL MCP `postgres-test` 重命名为 `postgres-test-lan`
- mj-ops: SSH/PostgreSQL 条目统一 LAN/WAN 对称命名
- mj-ops: 版本 1.1.0 → 1.2.0

### Fixed
- mj-git-pr 部署策略检测从 2-case 升级为 4-case，区分基线 SQL、Flyway 迁移、双轨同步和纯代码变更，与 CI `detect-strategy` 对齐，避免误推荐 `partial-reset` 导致测试环境数据丢失

## [1.1.1] - 2026-03-18

### Added
- 导入 4 篇项目文档：项目概览、插件开发测试工作流、版本管理指南、发布操作手册
- 新增 `docs/INDEX.md` 文档导航中心（含角色推荐阅读顺序）
- 新增根 `CLAUDE.md`（marketplace 级 Claude Code agent 上下文）
- `README.md` 新增文档索引链接

### Removed
- 删除 `docs/superpowers/` 临时规划文件

### Changed
- `.gitignore` 新增 `.serena/` 规则，优化 `.claude/` 忽略模式
- 提交 `.claude/settings.json` 项目级插件启用配置

## [1.1.0] - 2026-03-17

### Changed
- 所有 26 个 SKILL.md `name` 字段从短名改为全限定名（目录名），支持短前缀调用（如 `/mj-git-commit`）
- 同步更新 4 个 Plugin 的 CLAUDE.md 和 README.md 命令表

## [1.0.0] - 2026-03-16

### Added
- 初始发布：4 个 Plugin（mj-doc, mj-git, mj-n8n, mj-ops），26 个 Skill
- Plugin Marketplace 元数据结构（marketplace.json）
- 各 Plugin 含 CLAUDE.md、README.md、plugin.json、SKILL.md
