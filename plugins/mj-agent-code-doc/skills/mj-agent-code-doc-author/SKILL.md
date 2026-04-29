---
name: mj-agent-code-doc-author
description: 当用户提到 新建ADR、起草STANDARD、新GUIDE、RUNBOOK撰写、POSTMORTEM、写复盘、事故复盘、ASSESSMENT、新建技术评估、做选型对比、起草SPEC、起草ISSUE、记录已知问题、起草 code-side 文档、写一个 code-side 决策记录、新增 code 文档、code doc author、author code documentation、draft ADR、draft STANDARD、create RUNBOOK、write postmortem 时使用此技能。本技能覆盖 mj-agent 仓 code-side 8 类 canonical（GUIDE / ADR / SPEC / RUNBOOK / POSTMORTEM / STANDARD / ISSUE / ASSESSMENT）的起草引导，按 Code_Side_Documentation_Framework v1.0 §3-§4 路径与命名 + §7.1 PR template Code-Side checklist。Make sure to use this skill whenever the user is drafting any new code-side canonical document, even if they only mention the document type abstractly (e.g., "I need to record a decision about..."). **不适用于** 单字符修改、frontmatter 字段修订（直接编辑）、agent-side 文档（用 agent-doc plugin）、PLAN 起草（用 mj-agent-code-doc-plan）、INDEX 同步（用 sync skill，Phase 1 落地）、文档校验（用 validate skill，Phase 1 落地）。
---

# mj-agent-code-doc-author

## Overview

为 mj-agent 仓 **code-side track** 起草 8 类 canonical 之一：**GUIDE / ADR / SPEC / RUNBOOK / POSTMORTEM / STANDARD / ISSUE / ASSESSMENT**。Author skill 是单文档起草工具——多文档协调用 plan skill；本 skill 不做校验（Phase 1 validate skill）。

定位：在 mj-agent 仓 canonical layer（`docs/`）落地新文档，按 [Code_Side_Documentation_Framework v1.0](https://github.com/MJ-AgentLab/mj-agent/blob/develop/docs/rule/%5BSTANDARD%5D_MJ_Agent_Code_Side_Documentation_Framework_v1.0.md) §3 类型 + §4 命名 + §7.1 PR Code-Side checklist 强制。

## When to use

**触发场景**（满足任一即应触发）：

- 新建 / 起草任一 8 类 code-side canonical
- 现有文档大改重写（譬如 GUIDE v1 → v2）

**反例**（不要触发）：

- 单字符修改 / frontmatter 字段微调 → 直接编辑
- agent-side 文档（SKILL/PROMPT/EVAL/CONTRACT）→ 用 agent-doc plugin（后续 phase）
- PLAN 起草 → 用 mj-agent-code-doc-plan
- 文档校验 → 用 validate skill（Phase 1）
- 多文档协调（先 PLAN）→ 用 mj-agent-code-doc-plan

## Workflow

按 5 步起草任一 canonical：

| 步 | 内容 | 引用 |
|---|---|---|
| 1 | **类型决策**：判断要写哪一类（8 选 1） | [type-decision-tree.md](./type-decision-tree.md) |
| 2 | **路径与命名**：按 Code_Side §3.x 决定目标路径；按 §4 起 filename；判断是否需要 `_vX.Y` 后缀 | Code_Side §3-§4 |
| 3 | **frontmatter 起草**：从 [frontmatter-templates/](./frontmatter-templates/) 选对应类型模板 copy + 填字段 | frontmatter-templates/ |
| 4 | **body skeleton 起草**：从对应类型骨架 copy + 填内容。8 类各一份：[guide](./body-skeleton-guide.md) / [adr](./body-skeleton-adr.md) / [spec](./body-skeleton-spec.md) / [runbook](./body-skeleton-runbook.md) / [postmortem](./body-skeleton-postmortem.md) / [standard](./body-skeleton-standard.md) / [issue](./body-skeleton-issue.md) / [assessment](./body-skeleton-assessment.md) | body-skeleton-*.md |
| 5 | **PR Code-Side checklist 自查**：A1-A6 按 Code_Side §7.1 逐项确认 | Code_Side §7.1 |

## Quick Reference

### 8 类 canonical 速查

| 类型 | 落点 | 何时用 | 范例 |
|---|---|---|---|
| **GUIDE** | `docs/guide/` | 教程 / 操作向导 | "如何在本地跑 LangGraph Studio" |
| **ADR** | `docs/adr/` | 架构决策记录 | "决定使用 PostgreSQL 而非 MongoDB" |
| **SPEC** | `docs/spec/` | 技术规范（接口 / schema） | "JobRunRequest API contract" |
| **RUNBOOK** | `docs/runbook/` | 操作手册 / 故障应对 | "数据库故障切换 SOP" |
| **POSTMORTEM** | `docs/postmortem/` | 事故复盘 | "2026-04-01 production OOM 事故" |
| **STANDARD** | `docs/rule/` | 跨多个领域强制规则 | "Commit Message Convention" |
| **ISSUE** | `docs/issue/` | 已知问题 / 待解项 | "LangGraph Studio websocket 偶发断" |
| **ASSESSMENT** | `docs/assessment/` | 技术评估 / 选型对比 | "vector DB 选型对比" |

### 命名规则速查

按 Code_Side §4：

- 模式：`docs/<type>/[<TYPE>]_<NNN>_<Title>.md`（ADR）或 `docs/<type>/[<TYPE>]_<Title>_v<X.Y>.md`（STANDARD/SPEC）
- 范例：
  - `docs/adr/[ADR]_013_Plugin_SKILL_md_Schema_Separation.md`
  - `docs/rule/[STANDARD]_MJ_Agent_Documentation_Meta_Framework_v2.0.md`
  - `docs/guide/[GUIDE]_LangGraph_Studio_Local_Setup.md`（GUIDE 通常无版本号）

### frontmatter 字段一览

所有 8 类共用最小字段（`type / domain / summary / owner / created / updated / state / track`），各类型有特有字段：

| 类型 | 共用字段 | 特有字段 |
|---|---|---|
| GUIDE | 共用 | — |
| ADR | 共用 | `decision`（accepted/rejected/superseded）|
| SPEC | 共用 | `version`（必填，与文件名 `_vX.Y` 同步） |
| RUNBOOK | 共用 | `severity_levels`（可选数组） |
| POSTMORTEM | 共用 | `incident_date / severity / status` |
| STANDARD | 共用 | `version`（必填）|
| ISSUE | 共用 | `severity / status / blocking` |
| ASSESSMENT | 共用 | `decision_date / outcome` |

详见 [frontmatter-templates/](./frontmatter-templates/) 目录下各类型模板。

## Common patterns（mj-agent 现有正例）

参考 mj-agent develop 分支：

- **ADR**：`docs/adr/[ADR]_012_Two_Track_Documentation_Governance.md`（完整长形 ADR）；`docs/adr/[ADR]_013_Plugin_SKILL_md_Schema_Separation.md`（紧凑 ADR）
- **STANDARD**：`docs/rule/[STANDARD]_MJ_Agent_Documentation_Meta_Framework_v2.0.md`（300+ 行复杂 STANDARD）；`docs/rule/[STANDARD]_GitHub_Markdown_v1.0.md`（简版 STANDARD）
- **GUIDE**：mj-agent 仓 GUIDE 当前少（部分 TODO）；可参考 mj-system 仓 GUIDE 风格
- **RUNBOOK**：参考 mj-agent 仓 [PLAN]_D_Setup_Env_Scripts.md 中的操作步骤段（待 RUNBOOK 实例完成 Phase 1）
- **POSTMORTEM**：当前仓内尚无（Phase 1+ 出现实例）

> **TODO Phase 1**：每类至少补 1 个 production-grade 正例（依赖 mj-agent 实际事故 / 决策出现）。

## Anti-patterns

- ❌ **ADR 缺 `decision` 字段**：违反 A3。ADR 必须明确 accepted / rejected / superseded
- ❌ **STANDARD 缺 `version` 但文件名带 `_v1.0`**：违反 A1（frontmatter 与文件名必须一致）
- ❌ **POSTMORTEM 直接放 `docs/runbook/`**：路径错。POSTMORTEM 是事后复盘，RUNBOOK 是操作步骤；分别落 `docs/postmortem/` 和 `docs/runbook/`
- ❌ **ISSUE 没有 `status` 字段**：reviewer 无法判断是 active / resolved / blocked
- ❌ **GUIDE 中混入 ADR 决策**：GUIDE 是"如何做"，ADR 是"为何选"。如果发现 GUIDE 在解释设计选择，应该拆出 ADR 单独存放，GUIDE 引用 ADR
- ❌ **ASSESSMENT 没有 `outcome` 字段**：评估如果没有结论，readers 不知道怎么往下走

## 进一步参考

- [type-decision-tree.md](./type-decision-tree.md) — 8 类的判断树，回答"我应该写哪一类"
- [frontmatter-templates/](./frontmatter-templates/) — 8 个 frontmatter 起手模板
- [body-skeleton-guide.md](./body-skeleton-guide.md) ~ [body-skeleton-assessment.md](./body-skeleton-assessment.md) — 8 个 body 骨架
- mj-agent [Code_Side §3 类型枚举](https://github.com/MJ-AgentLab/mj-agent/blob/develop/docs/rule/%5BSTANDARD%5D_MJ_Agent_Code_Side_Documentation_Framework_v1.0.md)
- mj-agent [Meta v2.0 §3 文档类型 + §3.5 优先级](https://github.com/MJ-AgentLab/mj-agent/blob/develop/docs/rule/%5BSTANDARD%5D_MJ_Agent_Documentation_Meta_Framework_v2.0.md)
- mj-agent [ADR-011 文档版本与 archive 约定](https://github.com/MJ-AgentLab/mj-agent/blob/develop/docs/adr/%5BADR%5D_011_Doc_Versioning_And_Archive_Convention.md)
