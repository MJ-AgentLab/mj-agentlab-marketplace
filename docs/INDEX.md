---
type: guide
scope: marketplace
summary: Marketplace documentation navigation hub — STANDARD / GUIDE / ADR / SPEC / RUNBOOK / archive / templates 索引
owner: marketplace-maintainers
created: 2026-05-15
updated: 2026-06-02
state: active
version: v6.3
domain: governance
tags:
  - index
  - navigation
related:
  - ./rule/[STANDARD]_Documentation_Framework.md
  - ./adr/[ADR]_Root_Level_Named_Files_Codification.md
  - ./adr/[ADR]_LearnKit_Init_Skill_Rename.md
  - ./adr/[ADR]_LearnKit_Consolidation_To_Single_Skill.md
  - ./adr/[ADR]_LearnKit_ThreeViews_HITL_Expansion.md
  - ./adr/[ADR]_LearnKit_Explanation_Skills_Addition.md
  - ./adr/[ADR]_Diagram_Kit_Addition.md
revision: |
  2026-06-05 — v6.3: add [ADR]_Diagram_Kit_Addition row (v6.3.0 NEW plugin diagram-kit 0.1.0 — marketplace's first 1→2 plugin count; arch-diagram skill + 9 references + generalized Mermaid validator forked from the PG version); Commit Message Convention row v1.1 → v1.2 (diagram-kit scope added); Plugin Documentation 1 → 2 plugins (learn-kit 3.2.0 + diagram-kit 0.1.0); Last updated → 2026-06-05
  2026-06-02 — v6.2: add [ADR]_LearnKit_Explanation_Skills_Addition row (v6.2.0 learn-kit 3.1.0 → 3.2.0 — add glossary + concept pure-prompt explanation skills filling three-views' disclaimed Q&A niche; picker 1→3 reconciled vs v6.0.0 consolidation); plugin row version bumped 3.1.0 → 3.2.0
  2026-05-29 — v6.1: add [ADR]_LearnKit_ThreeViews_HITL_Expansion row (v6.1.0 learn-kit 3.1.0 additive HITL expansion — Step 1.3 视角 multi-select + Step 4 5-cell granular + source_corpus_key re-run guard); plugin row version bumped 3.0.0 → 3.1.0
  2026-05-28 — v6.0: add [ADR]_LearnKit_Consolidation_To_Single_Skill row (v6.0.0 learn-kit 5 skill → 1 three-views consolidation); update [GUIDE]_Migration_From_v3_to_v4 row to v6.0 with §6 v5.0.x→v6.0.0 chapter; learn-kit plugin-internal GUIDE [GUIDE]_LearnKit_Discovery_Recipes registered via plugin-internal INDEX cross-reference (scope: learn-kit, not in this marketplace-scope INDEX)
  2026-05-18 — v5.0: add [ADR]_LearnKit_Init_Skill_Rename row (v5.0.0 learn-kit init → scaffold-learning rename)
  2026-05-18 — v4.6.3: add 「Root-Level Meta Files」section listing 5 named special files per Framework v1.6 §1.1; bump [Documentation Framework] row v1.5 → v1.6; remove [Contributing Guide] active row (archived in v4.6.3 archive ceremony — content restored to repo root); add [DEPRECATED]_[GUIDE]_Contributing_v1.1 row to Archived Documents; add [ADR]_Root_Level_Named_Files_Codification row to ADRs; update Suggested Reading Order links to root CONTRIBUTING.md
  2026-05-18 — v4.6.2: add first [POSTMORTEM] row (2026-05-18 Bulk Cleanup Trap Analysis, P3); update [RUNBOOK]_Release_Operations row to mention v1.3.2 cleanup callouts; update [GUIDE]_Contributing row to mention v1.1 worktree prefix note
  2026-05-18 — v4.6.1: scrub external project reference from [ADR]_Develop_PreBump_Adoption row description per `[STANDARD]_AI_Engineering_Execution_HITL_Prompt` §0.3
  2026-05-18 — v4.6: add [ADR]_Develop_PreBump_Adoption row + update RUNBOOK_Release_Operations row to mention v1.3 §3.7 pre-bump
  2026-05-18 — v4.5: add 8-field frontmatter (Framework v1.5 §1 INDEX special clause); update Framework v1.4→v1.5 + HITL v1.3→v1.4 + learn-kit 1.1.0→1.2.0 entries; remove deleted ai_engineering_execution_hitl_workflow.md row; move Exemption Review ADR to Archived section; add Exemption Reversal ADR; update CONTRIBUTING + MIGRATION_GUIDE paths to docs/guide/; update plugin-internal teaching series description to reflect 6→2 consolidation
---

# Documentation Index — MJ AgentLab Marketplace

> Last updated: 2026-06-05 (v6.3). Framework §1 hard exclusions + §1.1 root-level named files codification (5 files) + §2.7 CLAUDE.md sync allowlist + §4.3.1 A6 active CI gate per [`./rule/[STANDARD]_Documentation_Framework.md`](./rule/[STANDARD]_Documentation_Framework.md) v1.6.

Navigation hub for all marketplace documentation.

## Root-Level Meta Files

> Per [Documentation Framework §1.1](./rule/[STANDARD]_Documentation_Framework.md#§11-root-level-named-special-files--individual-responsibilities-v16-new) (v1.6+), 5 named files at repo root carry individual fixed responsibilities exempt from `[TAG]_` prefix.

| File | Responsibility | Source of exclusion |
|------|----------------|---------------------|
| [README.md](../README.md) | GitHub-facing project entry; badges / TL;DR / 插件目录 / quick-start | §1 hard |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | Contributor onboarding：branch / commit / version / PR / hooks | §1.1 editorial convention |
| [CHANGELOG.md](../CHANGELOG.md) | Keep-a-Changelog 发布日志：`[Unreleased]` + 版本号 + Added/Changed/Fixed/Removed | §1 hard |
| [GLOSSARY.md](../GLOSSARY.md) | marketplace 术语词典：alphabetical terms + 1-line definitions | §1.1 editorial convention |
| [CLAUDE.md](../CLAUDE.md) | AI agent + 维护者上下文摘要；受 §2.7 sync allowlist + §4.3.1 A6 gate 约束 | §1 hard |

## Rules & Standards (`docs/rule/`)

| Document | State | Version | Purpose |
|----------|-------|---------|---------|
| [Documentation Framework](./rule/[STANDARD]_Documentation_Framework.md) | active | v1.6 | 6 tag prefixes + 8-field frontmatter + 3-state machine + 路径稳定性 + INDEX sync + flat archive layout（v1.4）+ §1 exemption cancellation（v1.5）+ §1.1 root-level named files codification + §2.7 CLAUDE.md sync allowlist + §4.3.1 A6 active CI gate（v1.6）|
| [Commit Message Convention](./rule/[STANDARD]_Commit_Message_Convention.md) | active | v1.2 | `<type>(<scope>): <summary>` + 7 types + marketplace scope whitelist (v1.2 adds `diagram-kit` plugin scope) + branch-type matrix + §11 Common Mistakes (post-v4.5.0 lessons + scripts/validate-commits.{sh,ps1} workflow) |
| [GitHub Markdown](./rule/[STANDARD]_GitHub_Markdown.md) | active | v1.0 | ATX headings + GFM tables + native alerts + frontmatter syntax for GitHub web |
| [AI Engineering Execution HITL Prompt](./rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md) | active | v1.4 | 11 阶段闭环 + skill 矩阵 + HITL 触发规则 + universal skeleton §0（v1.4 marketplace 独立性原则）|

## Guides (`docs/guide/`)

| Document | Description |
|----------|-------------|
| [Migration From v3 to v4](./guide/[GUIDE]_Migration_From_v3_to_v4.md) | 版本升级迁移指引（v2.x → v3.0.0；v3.2.x → v4.0.0；v4.0.0 → v4.3.x；v4.4.x → v4.5.0；v4.5.x → v5.0.0；**v6.0 add §6 v5.0.x → v6.0.0** learn-kit 5 skill → 1 three-views consolidation；v4.5.0 起从 docs/MIGRATION_GUIDE.md rename）|
| [Marketplace Project Overview](./guide/[GUIDE]_Marketplace_Project_Overview.md) | 项目架构、插件目录、CI/CD 体系、开发环境搭建 |
| [Plugin Development Testing Workflow](./guide/[GUIDE]_Plugin_Development_Testing_Workflow.md) | 跨仓库插件开发测试的三阶段工作流 |
| [Version Management](./guide/[GUIDE]_Version_Management.md) | 双层版本架构、bump 工具、CHANGELOG 规范 |
| [Marketplace Agent Execution Checklist](./guide/[GUIDE]_Marketplace_Agent_Execution_Checklist.md) | STANDARD 的运行时勾选清单——11 stage × 4 段 |

## Runbooks (`docs/runbook/`)

| Document | Description | Last verified |
|----------|-------------|---------------|
| [Release Operations](./runbook/[RUNBOOK]_Release_Operations.md) | 从开发到发布的完整操作流程（Issue → PR → Release）；v1.1 起 §3.2 bump-version.ps1 MANDATORY；v1.2 起 §3.2.1 反映 CLAUDE.md script 已 cover (closes #110)；v1.3 起 §3.7 add Post-release develop pre-bump (per [`[ADR]_Develop_PreBump_Adoption`](./adr/[ADR]_Develop_PreBump_Adoption.md))；v1.3.2 起 §2.6 + §3.7 加 cleanup callout 指向 mp-git-cleanup §Bulk Mode + safe-bulk-cleanup.ps1 | 2026-05-18 |
| [Doc Archive Procedure](./runbook/[RUNBOOK]_Doc_Archive_Procedure.md) | 4-phase 文档归档工作流 + 2 HITL gate（per Documentation Framework v1.4 §2.3，flat layout）| 2026-05-17 |

## Architecture Decision Records (`docs/adr/`)

| Document | Description |
|----------|-------------|
| [ADR: NotebookLM Kit Retirement](./adr/[ADR]_NotebookLM_Kit_Retirement.md) | v4.0.0 删除 notebooklm-kit + 把核心 build / studio 多媒体场景吸收到 learn-kit 的决策 |
| [ADR: Documentation Framework Exemption Reversal](./adr/[ADR]_Documentation_Framework_Exemption_Reversal.md) | v4.5.0 取消 Framework v1.1 §1 单文件 + 教学系列模式豁免；supersedes 旧 Exemption Review ADR（archived）|
| [ADR: Develop Pre-Bump Adoption](./adr/[ADR]_Develop_PreBump_Adoption.md) | v4.6.1 起每次 release + sync-main-to-develop 完成后，在 develop 上预 bump 到下一个 patch；保证 `develop VERSION > main VERSION` 恒成立，让 release readiness 信号肉眼可见 |
| [ADR: Root-Level Named Files Codification](./adr/[ADR]_Root_Level_Named_Files_Codification.md) | v4.6.3 起正向 codification 5 个 root-level named special files 责任 + CLAUDE.md sync allowlist 3 类 trigger + A6 三层 defense-in-depth enforcement；complements v1.1 Reversal ADR negative cancellation with positive codification |
| [ADR: LearnKit Init Skill Rename](./adr/[ADR]_LearnKit_Init_Skill_Rename.md) | v5.0.0 把 learn-kit `init` skill 物理重命名为 `scaffold-learning`，消除 Claude Code 内置 `/init` slash 拾取器并列冲突；触发 learn-kit `1.2.1 → 2.0.0` + marketplace `4.6.3 → 5.0.0` 双层 major bump |
| [ADR: LearnKit Consolidation To Single Skill](./adr/[ADR]_LearnKit_Consolidation_To_Single_Skill.md) | **v6.0.0 BREAKING** — learn-kit 5 skill 收敛为单一 `three-views` skill（删 scaffold-learning / locate / scan / nlm-studio + 重命名 generate-tier → three-views）；NLM artifact 默认 max 10 (9 view-cycled + 1 optional mind_map)，infographic 永久退场；保留 nlm-studio 全 dogfood防护；触发 learn-kit `2.0.1 → 3.0.0` + marketplace `5.0.2 → 6.0.0` 双层 major bump；plugin-internal `[GUIDE]_LearnKit_Discovery_Recipes` 保留 v2.x locate/scan 算法 |
| [ADR: LearnKit ThreeViews HITL Expansion](./adr/[ADR]_LearnKit_ThreeViews_HITL_Expansion.md) | **v6.1.0 Additive** — learn-kit `3.0.0 → 3.1.0` 加 Step 1.3 视角 multi-select (default 3 全选 / min 1) + Step 4 升级 5-cell granular multi-select (HTML / NLM audio / NLM video / NLM slide_deck / NLM mind_map) + Step 5B re-run guard `source_corpus_key` 等价性 + 3-level hint granularity；引入 `requested_tiers` ≠ `generated_tiers` state separation 处理 conflict-skip / generation-fail 路径；`templates/artifact-mind_map.md` 改 "across all three tiers" → "selected source corpus"；触发 plugin minor + marketplace minor `6.0.1 → 6.1.0`（consumes pre-bump slot per historical pattern）；默认产物等同 v3.0.0 |
| [ADR: LearnKit Explanation Skills Addition](./adr/[ADR]_LearnKit_Explanation_Skills_Addition.md) | **v6.2.0 Additive** — learn-kit `3.1.0 → 3.2.0` 加 `glossary`（六槽术语速记卡 ~150-250 字）+ `concept`（六节概念深讲 ~500-800 字，2 跨域正例 + 1 反例 + 失效边界）两个纯 prompt 解释 skill（无 tool / 无 file / 无 MCP）；填补 `three-views` 明确 disclaim 的 pure-explanation / Q&A niche；frontmatter `name`+`description` only + 仓库签名式 routing clause；picker 1→3 显式 reconcile v6.0.0 consolidation 的 picker-noise 论点；触发 plugin minor + marketplace minor `6.1.1 → 6.2.0`（consumes pre-bump slot）；不改 three-views 行为 |
| [ADR: Diagram Kit Addition](./adr/[ADR]_Diagram_Kit_Addition.md) | **v6.3.0 Additive (NEW plugin)** — 新建 `diagram-kit 0.1.0`，marketplace 史上首次 plugin 计数 **1 → 2**。单 skill `arch-diagram`（5-step 事实先行 L0–L3 阶梯，证据绑定 Mermaid 7 类：context / container / component / code〔C4 结构〕+ sequence / state-machine〔行为〕+ deployment〔物理〕）+ 9 份领域无关 references（progressive disclosure）+ 泛化 stdlib Mermaid validator（去 PG ROLE-03 + SLUG regex 通用化 `struct-l[1234]\|dyn\|phys`，与 PG 版双源分叉）。Reconcile 8→3→1 收敛方向：判据是**域归属**（arch-diagram 与 learn-kit 教学域正交、无法内化进 pedagogy kit）非 plugin 计数。触发 marketplace minor `6.2.1 → 6.3.0`（additive plugin per [SPEC] §4.2，消耗 post-v6.2.0 pre-bump slot）+ commit STANDARD `v1.1 → v1.2`（diagram-kit scope）；learn-kit `3.2.0` 不动 |

> Plugin-internal ADRs（如 `[ADR]_LearnKit_Discovery_Skills`，v4.3.0 起迁入 `plugins/learn-kit/docs/adr/`）见各 plugin 的 docs/INDEX.md。

## Specifications (`docs/spec/`)

| Document | State | Version | Purpose |
|----------|-------|---------|---------|
| [Marketplace JSON Schema](./spec/[SPEC]_Marketplace_Json_Schema.md) | active | v1.0 | marketplace.json 本地约定：plugins[] / metadata / 版本三角不变量 |
| [Plugin JSON Schema](./spec/[SPEC]_Plugin_Json_Schema.md) | active | v1.0 | plugin.json 6 必需字段 + `repository` 必须 string + 不用 `components` + 必需目录布局 |

## Postmortems (`docs/postmortem/`)

| Document | Severity | Date | Description |
|----------|----------|------|-------------|
| [POSTMORTEM: 2026-05-18 Bulk Cleanup Trap Analysis](./postmortem/[POSTMORTEM]_2026-05-18_Bulk_Cleanup_Trap_Analysis.md) | P3 | 2026-05-18 | Bulk branch cleanup 触发 3 个 trap (regex prefix / local-remote 对称性 / Windows gh api leading slash)；恢复无数据丢失；6 fix-sites 已落地 |

## Archived Documents (`docs/archive/`)

> v4.4.0 起 marketplace 引入归档机制；v1.4 起改 flat 布局。任何被 supersede 的旧版 doc 进入 `docs/archive/[DEPRECATED]_<TAG>_<Topic>_vX.Y.md`（flat — 不分 subtype 子目录；文件类型由 `[TAG]_` prefix 编码），frontmatter `state: archived` + body 顶部含 archive banner。完整规则见 [`./rule/[STANDARD]_Documentation_Framework.md`](./rule/[STANDARD]_Documentation_Framework.md) §2.3.1-§2.3.5；归档流程见 [`./runbook/[RUNBOOK]_Doc_Archive_Procedure.md`](./runbook/[RUNBOOK]_Doc_Archive_Procedure.md) v1.1。

| Archived Doc | Original Path | Active Replacement | Archive Date | Trigger |
|--------------|---------------|---------------------|--------------|---------|
| [[DEPRECATED]_[ADR]_Documentation_Framework_Exemption_Review_v1.0.md](./archive/[DEPRECATED]_[ADR]_Documentation_Framework_Exemption_Review_v1.0.md) | docs/adr/[ADR]_Documentation_Framework_Exemption_Review.md | [`./adr/[ADR]_Documentation_Framework_Exemption_Reversal.md`](./adr/[ADR]_Documentation_Framework_Exemption_Reversal.md) | 2026-05-18 | #4 scope-redefining rename（decision reversed v1.4 → v1.5）|
| [[DEPRECATED]_[GUIDE]_Contributing_v1.1.md](./archive/[DEPRECATED]_[GUIDE]_Contributing_v1.1.md) | docs/guide/[GUIDE]_Contributing.md | [`../CONTRIBUTING.md`](../CONTRIBUTING.md) (repo root) | 2026-05-18 | #4 scope-redefining rename（content restored to root per Framework v1.6 §1.1）|

## Templates (`docs/_templates/`)

| Template | Used For |
|----------|----------|
| [TEMPLATE_STANDARD.md](./_templates/TEMPLATE_STANDARD.md) | `[STANDARD]` 起草骨架 |
| [TEMPLATE_ADR.md](./_templates/TEMPLATE_ADR.md) | `[ADR]` 起草骨架（Michael Nygard 7 段）|
| [TEMPLATE_GUIDE.md](./_templates/TEMPLATE_GUIDE.md) | `[GUIDE]` 起草骨架（Audience / Walkthrough / Further Reading）|
| [TEMPLATE_RUNBOOK.md](./_templates/TEMPLATE_RUNBOOK.md) | `[RUNBOOK]` 起草骨架（含 `last-verified` 字段）|
| [TEMPLATE_SPEC.md](./_templates/TEMPLATE_SPEC.md) | `[SPEC]` 起草骨架 |
| [TEMPLATE_POSTMORTEM.md](./_templates/TEMPLATE_POSTMORTEM.md) | `[POSTMORTEM]` 起草骨架（含 timeline / root cause / remediation）|

每个 template 含完整 frontmatter 占位 + 多段 body 骨架。`/mp-doc-author` skill 起草新 doc 时优先复用对应 template。

## Plugin Documentation

> v6.3.0 起 marketplace 含 **2 个 plugin**：**learn-kit**（教学方法论；3 skill：three-views / glossary / concept；`three-views` 的 NLM 多媒体需 `notebooklm-mcp` MCP server + 一次性 `nlm login`，其余零依赖）+ **diagram-kit**（架构图生成；1 skill：arch-diagram；无 MCP / 无依赖）。两 plugin 功能正交、版本独立。详见 [plugins/learn-kit/README.md](../plugins/learn-kit/README.md) 与 [plugins/diagram-kit/README.md](../plugins/diagram-kit/README.md)。

| Plugin | Documentation Index | Version |
|--------|---------------------|---------|
| learn-kit | [plugins/learn-kit/docs/INDEX.md](../plugins/learn-kit/docs/INDEX.md) | 3.2.0 |
| diagram-kit | (none — 精简路径；设计 rationale 在 marketplace [`[ADR]_Diagram_Kit_Addition`](./adr/[ADR]_Diagram_Kit_Addition.md)) | 0.1.0 |

### learn-kit 用户文档（`plugins/learn-kit/docs/`）

v4.3.0 起 plugin-internal docs framework extension 落地；v4.5.0 起 v1.1 教学系列 pattern 豁免被取消，6 份 lowercase 教学系列合并为 2 份合规 `[GUIDE]_*`:

- **`docs/adr/`** — plugin-internal ADRs（v4.3.0 起含 `[ADR]_LearnKit_Discovery_Skills` 从 marketplace 迁入）
- **`docs/guide/`** — plugin-internal GUIDEs（**v4.5.0 起 2 份合卷**）:
  - `[GUIDE]_LearnKit_Pedagogy.md` — 教学合卷（定位 + 8 阶段方法论 + RFC 2119 worked example + 6 类质量门）
  - `[GUIDE]_LearnKit_Design.md` — 设计合卷（5 skill 分工 + dogfood findings + 治理模型 + frontmatter / 版本演化）
- **`docs/spec/`** — 占位子目录（暂无 plugin-internal SPECs）

详见 [plugins/learn-kit/docs/INDEX.md](../plugins/learn-kit/docs/INDEX.md) 或 plugin README 的 §学习材料 段。

## Suggested Reading Order

### New Team Members

1. [Marketplace Project Overview](./guide/[GUIDE]_Marketplace_Project_Overview.md) — 整体架构
2. [Documentation Framework](./rule/[STANDARD]_Documentation_Framework.md) — 文档规范元框架
3. [Contributing](../CONTRIBUTING.md) + [Commit Message Convention](./rule/[STANDARD]_Commit_Message_Convention.md) — 贡献规范
4. [Version Management](./guide/[GUIDE]_Version_Management.md) — 版本体系

### Plugin Developers

1. [Marketplace Project Overview](./guide/[GUIDE]_Marketplace_Project_Overview.md) — 插件结构和技能链
2. [Plugin JSON Schema](./spec/[SPEC]_Plugin_Json_Schema.md) — 6 必需字段 + 本地约定
3. [AI Engineering Execution HITL Prompt](./rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md) — AI agent 工作流规范（v4.1.0 起含 18 件 `mp-*` skill；v1.4 起 §0 含 universal skeleton 内化）
4. [Marketplace Agent Execution Checklist](./guide/[GUIDE]_Marketplace_Agent_Execution_Checklist.md) — STANDARD 的勾选清单
5. [Plugin Development Testing Workflow](./guide/[GUIDE]_Plugin_Development_Testing_Workflow.md) — 测试三阶段
6. [Commit Message Convention](./rule/[STANDARD]_Commit_Message_Convention.md) + [GitHub Markdown](./rule/[STANDARD]_GitHub_Markdown.md) — 提交 + markdown 规范

### Doc Authors

1. [Documentation Framework](./rule/[STANDARD]_Documentation_Framework.md) — 元框架
2. [GitHub Markdown](./rule/[STANDARD]_GitHub_Markdown.md) — 语法风格
3. [docs/_templates/](./_templates/) — 6 个模板骨架（按 doc 类型选）

### Release Managers

1. [Version Management](./guide/[GUIDE]_Version_Management.md) — bump 工具 + dual-layer 版本
2. [Marketplace JSON Schema](./spec/[SPEC]_Marketplace_Json_Schema.md) — version triangle invariants
3. [Release Operations](./runbook/[RUNBOOK]_Release_Operations.md) — 发布操作手册
4. [Commit Message Convention](./rule/[STANDARD]_Commit_Message_Convention.md) §4.1 — `release` scope 用法
