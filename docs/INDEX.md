---
type: guide
scope: marketplace
summary: Marketplace documentation navigation hub — STANDARD / GUIDE / ADR / SPEC / RUNBOOK / archive / templates 索引
owner: marketplace-maintainers
created: 2026-05-15
updated: 2026-05-18
state: active
version: v4.6.2
domain: governance
tags:
  - index
  - navigation
related:
  - ./rule/[STANDARD]_Documentation_Framework.md
revision: |
  2026-05-18 — v4.6.2: add first [POSTMORTEM] row (2026-05-18 Bulk Cleanup Trap Analysis, P3); update [RUNBOOK]_Release_Operations row to mention v1.3.2 cleanup callouts; update [GUIDE]_Contributing row to mention v1.1 worktree prefix note
  2026-05-18 — v4.6.1: scrub external project reference from [ADR]_Develop_PreBump_Adoption row description per `[STANDARD]_AI_Engineering_Execution_HITL_Prompt` §0.3
  2026-05-18 — v4.6: add [ADR]_Develop_PreBump_Adoption row + update RUNBOOK_Release_Operations row to mention v1.3 §3.7 pre-bump
  2026-05-18 — v4.5: add 8-field frontmatter (Framework v1.5 §1 INDEX special clause); update Framework v1.4→v1.5 + HITL v1.3→v1.4 + learn-kit 1.1.0→1.2.0 entries; remove deleted ai_engineering_execution_hitl_workflow.md row; move Exemption Review ADR to Archived section; add Exemption Reversal ADR; update CONTRIBUTING + MIGRATION_GUIDE paths to docs/guide/; update plugin-internal teaching series description to reflect 6→2 consolidation
---

# Documentation Index — MJ AgentLab Marketplace

> Last updated: 2026-05-18 (v4.5.0). Framework §1 exemption mechanism canceled — all marketplace docs (except 5 community/spec exclusion categories) now require tag-prefix + 8-field frontmatter per [`./rule/[STANDARD]_Documentation_Framework.md`](./rule/[STANDARD]_Documentation_Framework.md) v1.5.

Navigation hub for all marketplace documentation.

## Rules & Standards (`docs/rule/`)

| Document | State | Version | Purpose |
|----------|-------|---------|---------|
| [Documentation Framework](./rule/[STANDARD]_Documentation_Framework.md) | active | v1.5 | 6 tag prefixes + 8-field frontmatter + 3-state machine + 路径稳定性 + INDEX sync + flat archive layout（v1.4）+ §1 exemption cancellation（v1.5）|
| [Commit Message Convention](./rule/[STANDARD]_Commit_Message_Convention.md) | active | v1.1 | `<type>(<scope>): <summary>` + 7 types + marketplace scope whitelist + branch-type matrix + §11 Common Mistakes (post-v4.5.0 lessons + scripts/validate-commits.{sh,ps1} workflow) |
| [GitHub Markdown](./rule/[STANDARD]_GitHub_Markdown.md) | active | v1.0 | ATX headings + GFM tables + native alerts + frontmatter syntax for GitHub web |
| [AI Engineering Execution HITL Prompt](./rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md) | active | v1.4 | 11 阶段闭环 + skill 矩阵 + HITL 触发规则 + universal skeleton §0（v1.4 marketplace 独立性原则）|

## Guides (`docs/guide/`)

| Document | Description |
|----------|-------------|
| [Contributing Guide](./guide/[GUIDE]_Contributing.md) | 贡献入口；commit 段引用 Commit Message Convention（v4.5.0 起从 docs/CONTRIBUTING.md rename；v1.1 起 §Bare Repo + Worktree 加 `git branch` 前缀说明）|
| [Migration From v3 to v4](./guide/[GUIDE]_Migration_From_v3_to_v4.md) | 版本升级迁移指引（v2.x → v3.0.0；v3.2.x → v4.0.0；v4.0.0 → v4.3.x；v4.4.x → v4.5.0；v4.5.0 起从 docs/MIGRATION_GUIDE.md rename）|
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
| [ADR: LearnKit Init Skill Rename](./adr/[ADR]_LearnKit_Init_Skill_Rename.md) | v5.0.0 把 learn-kit `init` skill 物理重命名为 `scaffold-learning`，消除 Claude Code 内置 `/init` slash 拾取器并列冲突；触发 learn-kit `1.2.1 → 2.0.0` + marketplace `4.6.3 → 5.0.0` 双层 major bump |

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

> v4.0.0 起 marketplace 仅含 **1 个 plugin**（learn-kit v1.2.0+）。learn-kit `nlm-studio` skill 需要 `notebooklm-mcp` MCP server（plugin 内自带 `.mcp.json`）+ 一次性 `nlm login`；其余 4 个 skill 零外部依赖。详见 [plugins/learn-kit/README.md](../plugins/learn-kit/README.md) 与 [plugins/learn-kit/CLAUDE.md](../plugins/learn-kit/CLAUDE.md)。

| Plugin | Documentation Index | Version |
|--------|---------------------|---------|
| learn-kit | [plugins/learn-kit/docs/INDEX.md](../plugins/learn-kit/docs/INDEX.md) | v1.2.0 |

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
3. [Contributing Guide](./guide/[GUIDE]_Contributing.md) + [Commit Message Convention](./rule/[STANDARD]_Commit_Message_Convention.md) — 贡献规范
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
