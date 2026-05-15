# Documentation Index — MJ AgentLab Marketplace

> Last updated: 2026-05-15 (v4.2.1). Doc framework retrofit complete — all tag-prefixed docs now live in their canonical subdirectory per [`docs/rule/[STANDARD]_Documentation_Framework.md`](<./rule/[STANDARD]_Documentation_Framework.md>) §2.1.

Navigation hub for all marketplace documentation.

## Rules & Standards (`docs/rule/`)

| Document | State | Version | Purpose |
|----------|-------|---------|---------|
| [Documentation Framework](<./rule/[STANDARD]_Documentation_Framework.md>) | active | v1.0 | 6 tag prefixes + 8-field frontmatter + 3-state machine + 路径稳定性 + INDEX sync |
| [Commit Message Convention](<./rule/[STANDARD]_Commit_Message_Convention.md>) | active | v1.0 | `<type>(<scope>): <summary>` + 7 types + marketplace scope whitelist + branch-type matrix |
| [GitHub Markdown](<./rule/[STANDARD]_GitHub_Markdown.md>) | active | v1.0 | ATX headings + GFM tables + native alerts + frontmatter syntax for GitHub web |
| [AI Engineering Execution HITL Prompt](<./rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md>) | active | v1.2 | 11 阶段闭环 + skill 矩阵 + HITL 触发规则 |
| [AI Engineering HITL Workflow (Generic)](./ai_engineering_execution_hitl_workflow.md) | active | v2.0 | plugin-agnostic 哲学锚点（parent generic doc，本 marketplace specialized 变体的 fork 源；exempt from framework per §1 boundary） |

## Guides (`docs/guide/`)

| Document | Description |
|----------|-------------|
| [Marketplace Project Overview](<./guide/[GUIDE]_Marketplace_Project_Overview.md>) | 项目架构、插件目录、CI/CD 体系、开发环境搭建 |
| [Plugin Development Testing Workflow](<./guide/[GUIDE]_Plugin_Development_Testing_Workflow.md>) | 跨仓库插件开发测试的三阶段工作流 |
| [Version Management](<./guide/[GUIDE]_Version_Management.md>) | 双层版本架构、bump 工具、CHANGELOG 规范 |
| [Marketplace Agent Execution Checklist](<./guide/[GUIDE]_Marketplace_Agent_Execution_Checklist.md>) | STANDARD 的运行时勾选清单——11 stage × 4 段（pairs with HITL Prompt v1.2） |

## Runbooks (`docs/runbook/`)

| Document | Description | Last verified |
|----------|-------------|---------------|
| [Release Operations](<./runbook/[RUNBOOK]_Release_Operations.md>) | 从开发到发布的完整操作流程（Issue → PR → Release） | 2026-05-14 |
| [Doc Archive Procedure](<./runbook/[RUNBOOK]_Doc_Archive_Procedure.md>) | 4-phase 文档归档工作流 + 2 HITL gate（per Documentation Framework v1.2 §2.3）；v4.4.0 引入 | 2026-05-15 |

## Architecture Decision Records (`docs/adr/`)

| Document | Description |
|----------|-------------|
| [ADR: NotebookLM Kit Retirement](<./adr/[ADR]_NotebookLM_Kit_Retirement.md>) | v4.0.0 删除 notebooklm-kit + 把核心 build / studio 多媒体场景吸收到 learn-kit 的决策（跨 plugin 决策；marketplace scope） |

> Plugin-internal ADRs（如 `[ADR]_LearnKit_Discovery_Skills`，v4.3.0 起迁入 `plugins/learn-kit/docs/adr/`）见各 plugin 的 docs/INDEX.md。

## Specifications (`docs/spec/`)

| Document | State | Version | Purpose |
|----------|-------|---------|---------|
| [Marketplace JSON Schema](<./spec/[SPEC]_Marketplace_Json_Schema.md>) | active | v1.0 | marketplace.json 本地约定：plugins[] / metadata / 版本三角不变量 |
| [Plugin JSON Schema](<./spec/[SPEC]_Plugin_Json_Schema.md>) | active | v1.0 | plugin.json 6 必需字段 + `repository` 必须 string + 不用 `components` + 必需目录布局 |

## Postmortems (`docs/postmortem/`)

*暂无 postmortem 记录*

## Archived Documents (`docs/archive/`)

> v4.4.0 起 marketplace 引入归档机制。任何被 supersede 的旧版 doc 进入 `docs/archive/<subtype>/[DEPRECATED]_<TAG>_<Topic>_vX.Y.md`，frontmatter `state: archived` + body 顶部含 archive banner。完整规则见 [`rule/[STANDARD]_Documentation_Framework.md`](<./rule/[STANDARD]_Documentation_Framework.md>) §2.3.1-§2.3.4 (v1.2+)；归档流程见 [`runbook/[RUNBOOK]_Doc_Archive_Procedure.md`](<./runbook/[RUNBOOK]_Doc_Archive_Procedure.md>) v1.0。

*暂无 archived 文档 — 当首个 doc 进入 archived state 时此表填入条目。*

| Archived Doc | Original Path | Active Replacement | Archive Date | Trigger |
|--------------|---------------|---------------------|--------------|---------|
| *(placeholder — populated as archives accrue)* | | | | |

## Templates (`docs/_templates/`)

| Template | Used For |
|----------|----------|
| [TEMPLATE_STANDARD.md](./_templates/TEMPLATE_STANDARD.md) | `[STANDARD]` 起草骨架 |
| [TEMPLATE_ADR.md](./_templates/TEMPLATE_ADR.md) | `[ADR]` 起草骨架（Michael Nygard 7 段） |
| [TEMPLATE_GUIDE.md](./_templates/TEMPLATE_GUIDE.md) | `[GUIDE]` 起草骨架（Audience / Walkthrough / Further Reading） |
| [TEMPLATE_RUNBOOK.md](./_templates/TEMPLATE_RUNBOOK.md) | `[RUNBOOK]` 起草骨架（含 `last-verified` 字段） |
| [TEMPLATE_SPEC.md](./_templates/TEMPLATE_SPEC.md) | `[SPEC]` 起草骨架 |
| [TEMPLATE_POSTMORTEM.md](./_templates/TEMPLATE_POSTMORTEM.md) | `[POSTMORTEM]` 起草骨架（含 timeline / root cause / remediation） |

每个 template 含完整 frontmatter 占位 + 多段 body 骨架。`/mp-doc-author` skill 起草新 doc 时优先复用对应 template。

## Contributing & Migration

| Document | Description |
|----------|-------------|
| [CONTRIBUTING.md](./CONTRIBUTING.md) | 贡献入口；commit 段引用 [`rule/[STANDARD]_Commit_Message_Convention.md`](<./rule/[STANDARD]_Commit_Message_Convention.md>) |
| [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) | 版本升级迁移指引（v2.x → v3.0.0；v3.2.x → v4.0.0；historical refs 保留原 flat 路径） |

## Plugin Documentation

> v4.0.0 起 marketplace 仅含 **1 个 plugin**（learn-kit v1.1.0+）。learn-kit `nlm-studio` skill 需要 `notebooklm-mcp` MCP server（plugin 内自带 `.mcp.json`）+ 一次性 `nlm login`；其余 4 个 skill 零外部依赖。详见 [plugins/learn-kit/README.md](../plugins/learn-kit/README.md) 与 [plugins/learn-kit/CLAUDE.md](../plugins/learn-kit/CLAUDE.md)。

| Plugin | Documentation Index | Version |
|--------|---------------------|---------|
| learn-kit | [plugins/learn-kit/docs/INDEX.md](../plugins/learn-kit/docs/INDEX.md) | v1.1.0 |

### learn-kit 用户文档（`plugins/learn-kit/docs/`）

v4.3.0 起 plugin-internal docs framework extension 落地：

- **`docs/adr/`** — plugin-internal ADRs（v4.3.0 起含 `[ADR]_LearnKit_Discovery_Skills` 从 marketplace 迁入）
- **`docs/guide/`** / **`docs/spec/`** — 占位子目录（暂无 plugin-internal GUIDEs / SPECs）
- **6 份 lowercase 数字教学系列**（`learn-kit-01..05` + `使用手册`）— plugin-internal pedagogical content；保留原 lowercase 命名（numbered ordering 是 pedagogical signal）；exempt from tag prefix requirement per Framework §1 扩展条款（plugin-internal teaching series）

详见 [plugins/learn-kit/docs/INDEX.md](../plugins/learn-kit/docs/INDEX.md) 或 plugin README 的 §学习材料 段。

## Suggested Reading Order

### New Team Members

1. [Marketplace Project Overview](<./guide/[GUIDE]_Marketplace_Project_Overview.md>) — 整体架构
2. [Documentation Framework](<./rule/[STANDARD]_Documentation_Framework.md>) — 文档规范元框架
3. [CONTRIBUTING.md](./CONTRIBUTING.md) + [Commit Message Convention](<./rule/[STANDARD]_Commit_Message_Convention.md>) — 贡献规范
4. [Version Management](<./guide/[GUIDE]_Version_Management.md>) — 版本体系

### Plugin Developers

1. [Marketplace Project Overview](<./guide/[GUIDE]_Marketplace_Project_Overview.md>) — 插件结构和技能链
2. [Plugin JSON Schema](<./spec/[SPEC]_Plugin_Json_Schema.md>) — 6 必需字段 + 本地约定
3. [AI Engineering Execution HITL Prompt](<./rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md>) — AI agent 工作流规范（v4.1.0 起含 18 件 `mp-*` skill）
4. [Marketplace Agent Execution Checklist](<./guide/[GUIDE]_Marketplace_Agent_Execution_Checklist.md>) — STANDARD 的勾选清单
5. [Plugin Development Testing Workflow](<./guide/[GUIDE]_Plugin_Development_Testing_Workflow.md>) — 测试三阶段
6. [Commit Message Convention](<./rule/[STANDARD]_Commit_Message_Convention.md>) + [GitHub Markdown](<./rule/[STANDARD]_GitHub_Markdown.md>) — 提交 + markdown 规范

### Doc Authors

1. [Documentation Framework](<./rule/[STANDARD]_Documentation_Framework.md>) — 元框架
2. [GitHub Markdown](<./rule/[STANDARD]_GitHub_Markdown.md>) — 语法风格
3. [docs/_templates/](./_templates/) — 6 个模板骨架（按 doc 类型选）

### Release Managers

1. [Version Management](<./guide/[GUIDE]_Version_Management.md>) — bump 工具 + dual-layer 版本
2. [Marketplace JSON Schema](<./spec/[SPEC]_Marketplace_Json_Schema.md>) — version triangle invariants
3. [Release Operations](<./runbook/[RUNBOOK]_Release_Operations.md>) — 发布操作手册
4. [Commit Message Convention](<./rule/[STANDARD]_Commit_Message_Convention.md>) §4.1 — `release` scope 用法
