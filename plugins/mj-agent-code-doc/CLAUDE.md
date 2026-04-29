# CLAUDE.md — mj-agent-code-doc Plugin

## Plugin 概述

mj-agent-code-doc 是 MJ-Agent code-side 文档治理工具家族 Plugin，v0.1 部分骨架（2 skill）。

> **v0.1 状态**: 仅含 plan + author。validate + sync 推迟 Phase 1。

| Skill | 命令 | 职责 |
|---|---|---|
| **plan** | `/mj-agent-code-doc:mj-agent-code-doc-plan` | 起草 mj-agent 仓 `plans/[PLAN]_*.md` 工作层文档（用于跨多文档 / 跨 phase 的大型变更） |
| **author** | `/mj-agent-code-doc:mj-agent-code-doc-author` | 起草 8 类 code-side canonical：GUIDE / ADR / SPEC / RUNBOOK / POSTMORTEM / STANDARD / ISSUE / ASSESSMENT |

## 与 mj-agent 仓 STANDARD 的映射

本 plugin 是 mj-agent 仓 [Code_Side_Documentation_Framework v1.0](https://github.com/MJ-AgentLab/mj-agent/blob/develop/docs/rule/%5BSTANDARD%5D_MJ_Agent_Code_Side_Documentation_Framework_v1.0.md) 的执行工具：

| Skill | 章节对应 | 范围 |
|---|---|---|
| plan | Code_Side §3.9（Working layer 文档）+ Meta v2.0 §3 working layer 通用约束 | 跨多 code-side 文档的预先规划 |
| author | Code_Side §3-§4（8 类 canonical 类型 + 路径与命名）+ §7.1 PR template Code-Side checklist | 单文档起草 |

## Schema 治理

本 plugin SKILL.md 使用 **Claude Code 原生 schema**（`name + description` 两字段），由 mj-agent 仓 [ADR-013](https://github.com/MJ-AgentLab/mj-agent/blob/develop/docs/adr/%5BADR%5D_013_Plugin_SKILL_md_Schema_Separation.md) 锁定。

> **不要** 把 mj-agent 仓内 in-source SKILL.md（`src/mj_agent/skills/**/SKILL.md`）的 13 字段 schema（type / domain / state / version / track / owner / created / updated / summary / activation / related_prompts / eval_references）添加到本 plugin 的 SKILL.md 中。这些字段是 mj-agent loader 用的，与 Claude Code plugin loader 无关。

## 与 mj-agentlab-marketplace 其它 plugin 的命名分流

| 命名空间 | 适用对象 | plugin 例 |
|---|---|---|
| `mj-sys-*` | MJ System 团队工具 | mj-sys-doc / mj-sys-git / mj-sys-n8n / mj-sys-ops |
| `mj-agent-*` | mj-agent 项目工具 | mj-agent-code-doc（本 plugin）+ 未来 mj-agent-agent-doc |

> **不要** 在本 plugin 内引入 mj-system 类型（譬如试图治 mj-system 的文档）；那是 mj-sys-doc 的范围。
> **不要** 在 mj-sys-doc 中引入 mj-agent 类型（譬如试图治 mj-agent 的 ADR）；那是本 plugin 的范围。

## Anti-patterns

- ❌ **把 mj-agent in-source SKILL.md 的 13 字段 frontmatter 复制到本 plugin SKILL.md**：违反 ADR-013，会导致 Claude Code 触发匹配失败（`description` 字段缺失）
- ❌ **强制使用 Agent_Side §2.1 五段式 body**：那是 in-source SKILL.md 规则；本 plugin 用 Overview / Workflow / Quick Reference 风格
- ❌ **在 plan skill 中起草单 ADR 或 单 SPEC**：plan skill 的范围是"跨多文档预先规划"；起草单文档用 author skill
- ❌ **在 author skill 中起草 PLAN**：PLAN 是 working layer，author skill 治 canonical layer；用 plan skill

## 文件结构

```
plugins/mj-agent-code-doc/
├── .claude-plugin/plugin.json
├── README.md
├── CHANGELOG.md
├── CLAUDE.md（本文件）
└── skills/
    ├── mj-agent-code-doc-plan/
    │   ├── SKILL.md
    │   ├── plan-template.md
    │   ├── plan-checklist.md
    │   └── evals/{evals,trigger-eval}.json
    └── mj-agent-code-doc-author/
        ├── SKILL.md
        ├── type-decision-tree.md
        ├── frontmatter-templates/{guide,adr,spec,runbook,postmortem,standard,issue,assessment}.md
        ├── body-skeleton-{guide,adr,spec,runbook,postmortem,standard,issue,assessment}.md
        └── evals/{evals,trigger-eval}.json
```
