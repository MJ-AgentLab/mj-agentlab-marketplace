---
name: mj-agent-code-doc-plan
description: 当用户提到 起草PLAN、新ADR plan、code-side文档变更计划、跨文档协调、PLAN_doc、起草大型文档计划、跨文档大改造、cross-doc plan、draft PLAN、plan code documentation、large doc change plan 时使用此技能。本技能专为 mj-agent 仓 code-side track 大型文档变更（新建STANDARD草案 / 跨≥3文档协调 / 新ADR涉及现有STANDARD修订）生成 plans/[PLAN]_*.md 工作层文档，按 Code_Side_Documentation_Framework v1.0 §3.9 + Meta v2.0 §3 working layer 约束。Make sure to use this skill whenever the user is planning a large code-side documentation change, even if they don't explicitly say "PLAN". **不适用于** 单文件错别字、单ADR创建（直接编辑即可）、agent-side 文档（用 agent-doc plugin 后续 phase 落地后）、SPEC/RUNBOOK 单文档起草（用 mj-agent-code-doc-author）。
---

# mj-agent-code-doc-plan

## Overview

为 mj-agent 仓 **code-side track** 的大型文档变更生成 **PLAN（working layer 文档）**。PLAN 是预先规划，记录哪些 canonical 文档要动、为什么动、以什么顺序动。Plan skill 不起草 canonical（那是 author skill 的范围）；它产出 `plans/[PLAN]_<letter>_<topic>.md`。

定位：在 mj-agent 仓 working layer（`plans/` 目录）落地 PLAN，按 [Code_Side_Documentation_Framework v1.0](https://github.com/MJ-AgentLab/mj-agent/blob/develop/docs/rule/%5BSTANDARD%5D_MJ_Agent_Code_Side_Documentation_Framework_v1.0.md) §3.9 working layer + [Meta v2.0](https://github.com/MJ-AgentLab/mj-agent/blob/develop/docs/rule/%5BSTANDARD%5D_MJ_Agent_Documentation_Meta_Framework_v2.0.md) §3 通用 working layer 约束。

## When to use

**触发场景**（满足任一即应触发）：

- 新建 STANDARD 草案（譬如新增子框架 / 跨多 ADR 整合规则）
- 跨 ≥ 3 个 canonical 文档的协调改动（避免 ad-hoc 多 PR 冲突）
- 新 ADR 涉及修订现有 STANDARD（决策与规则的同步演进）
- 跨多 phase（譬如 Phase 0 → Phase 1）的大型工作流规划

**反例**（不要触发）：

- 单文件错别字 / frontmatter 字段微调 → 直接编辑
- 单 ADR 创建（决策范围已明确）→ 用 author skill
- agent-side 文档相关 → 用 agent-doc plugin（后续 phase 落地）
- 仅做 INDEX / CLAUDE.md sync → 用 sync skill（v0.2 / Phase 1）

## Workflow

按 5 步起草 PLAN：

| 步 | 内容 | 引用 |
|---|---|---|
| 1 | **影响清单**：列出本次变更涉及的 canonical 文档（路径 + 变更性质：新建 / 修订 / archive） | mj-agent INDEX.md |
| 2 | **落点选择**：决定 PLAN 文件名 `plans/[PLAN]_<letter>_<topic>.md`（按现有 PLAN A-F 字母序连续）；frontmatter 5 字段（`summary / owner / created / updated / state`） | Meta v2.0 §3.3 working layer |
| 3 | **frontmatter 起草**：对照 [plan-template.md](./plan-template.md) 填字段；`state: draft`、`owner: 项目负责人` 默认值 | plan-template.md |
| 4 | **body 五件套起草**：Context（为什么） → Decisions（决策点） → Steps / Verification（执行步骤 + 自检判据） → Open Items（待定项）→ References（关联 ADR / STANDARD / 现有 PLAN） | mj-agent 现有 PLAN A-F 实例 |
| 5 | **关联 issue / PR**：如已有 issue 编号则在 frontmatter `tracking_issue` 或 body References 引用；如尚无，建议创建后再回填 | — |

完成后用 [plan-checklist.md](./plan-checklist.md) 自查 6 项。

## Quick Reference

**PLAN 命名规则**（`plans/[PLAN]_<letter>_<topic>.md`）：

- letter：单大写字母，按现有 PLAN 字母序连续（**起草前在 mj-agent 仓跑** `ls plans/\[PLAN\]_*.md` **确认下一个可用字母**——本文件中给的字母会随时间过期）
- topic：snake_case 或 PascalCase，简洁概括（≤ 5 词），譬如 `Track_Split_And_Plugin_Skeleton`
- 完整范例：`plans/[PLAN]_G_Some_Topic.md`

**frontmatter 5 字段**（最小可用）：

```yaml
---
summary: <一句话定位本 PLAN 解决什么问题>
owner: 项目负责人
created: <YYYY-MM-DD>
updated: <YYYY-MM-DD>
state: draft
---
```

可选字段：`tracking_issue`（Linear / GitHub issue 编号）、`tags`（数组）。

**body 五件套**（顺序固定）：

1. **Context**：为什么做、问题陈述、相关背景
2. **Decisions**：本 PLAN 已经决定的事（用表格或列表）
3. **Steps / Verification**：分步骤实施 + 每步自检 / 验收判据
4. **Open Items**：尚未决定 / 等用户回答的事
5. **References**：关联 ADR / STANDARD / 现有 PLAN / 外部资料

## Common patterns（mj-agent 已有 PLAN 正例）

参考 mj-agent develop 分支：

- [PLAN E（Phase 0 docs governance verification）](https://github.com/MJ-AgentLab/mj-agent/blob/develop/plans/%5BPLAN%5D_E_Phase0_Docs_Governance_Verification.md) — 单 phase / 跨多文档 验证类 PLAN
- [PLAN F（Documentation track split + plugin skeleton）](https://github.com/MJ-AgentLab/mj-agent/blob/develop/plans/%5BPLAN%5D_F_Documentation_Track_Split_And_Plugin_Skeleton.md) — 跨 phase / 跨 plugin 战略 PLAN
- [Roadmap v1.6](https://github.com/MJ-AgentLab/mj-agent/blob/develop/plans/mj-agent-roadmap-v1.6.md) — multi-phase strategic plan，超长形

## Anti-patterns

- ❌ **PLAN 直接落在 `docs/` 而非 `plans/`**：违反 working layer 规则。`docs/` 是 canonical，`plans/` 是 working。
- ❌ **PLAN frontmatter 缺 `owner` 或 `state`**：违反 Meta v2.0 §3.3 minimum schema；reviewer 无法追溯责任人。
- ❌ **PLAN 没有"Decisions"或"Verification"段**：缺乏可执行性；只是想法记录而非可落地的方案。这种应该写到 ADR / GUIDE，不是 PLAN。
- ❌ **PLAN letter 跳号或重复**：`plans/[PLAN]_F_X.md` 和 `plans/[PLAN]_F_Y.md` 同时存在；在新建前先 grep 现有 PLAN 字母序。

## 进一步参考

- [plan-template.md](./plan-template.md) — 直接 copy 的 PLAN body 五件套骨架
- [plan-checklist.md](./plan-checklist.md) — PR 前自查清单（6 项）
- mj-agent [Code_Side §3.9](https://github.com/MJ-AgentLab/mj-agent/blob/develop/docs/rule/%5BSTANDARD%5D_MJ_Agent_Code_Side_Documentation_Framework_v1.0.md) Working layer 约束（部分 TODO，但 trigger 列表已可定）
- mj-agent [Meta v2.0 §3](https://github.com/MJ-AgentLab/mj-agent/blob/develop/docs/rule/%5BSTANDARD%5D_MJ_Agent_Documentation_Meta_Framework_v2.0.md) 文档类型（含 working layer 通用约束）
