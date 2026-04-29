# mj-agent-code-doc Plugin

> **Status**: `v0.1 skeleton` — 部分骨架（含 plan + author 2 skill）；validate + sync 推迟 Phase 1
> **Schema 决策**: [ADR-013](https://github.com/MJ-AgentLab/mj-agent/blob/develop/docs/adr/%5BADR%5D_013_Plugin_SKILL_md_Schema_Separation.md)（plugin SKILL.md 用 Claude Code 原生 schema）
> **Source plan**: mj-agent 仓 [PLAN F](https://github.com/MJ-AgentLab/mj-agent/blob/develop/plans/%5BPLAN%5D_F_Documentation_Track_Split_And_Plugin_Skeleton.md) §V-skel-5

## 一句话定位

mj-agent code-side 文档治理工具 — 治 GUIDE / ADR / SPEC / RUNBOOK / POSTMORTEM / STANDARD / ISSUE / ASSESSMENT 八类 canonical，按 [Code_Side_Documentation_Framework v1.0](https://github.com/MJ-AgentLab/mj-agent/blob/develop/docs/rule/%5BSTANDARD%5D_MJ_Agent_Code_Side_Documentation_Framework_v1.0.md) §3-§7 强制。

## 当前 skill 清单（v0.1）

| Skill | 命令 | 职责 | 状态 |
|---|---|---|---|
| **plan** | `/mj-agent-code-doc:mj-agent-code-doc-plan` | 大型 code-side 文档变更前的 PLAN 起草 | ✅ v0.1 部分骨架 |
| **author** | `/mj-agent-code-doc:mj-agent-code-doc-author` | 起草 8 类 code-side canonical 之一 | ✅ v0.1 部分骨架 |

## 未实现段落（Phase 1 推迟）

下列 skill 在 v0.1 **未实现**；规划在 Phase 1 落地：

- **`mj-agent-code-doc-validate`**：依赖 [Code_Side §7.2](https://github.com/MJ-AgentLab/mj-agent/blob/develop/docs/rule/%5BSTANDARD%5D_MJ_Agent_Code_Side_Documentation_Framework_v1.0.md) OB1-OB5 阈值定稿（5 项目前 100% TODO）
- **`mj-agent-code-doc-sync`**：依赖 §7.6 `.claude/` 边界细化 + INDEX.md 自动生成方案；额外承担 ADR-013 §Decision 决策点 4 的"双 source 内容同步"职责（mj-agent in-source SKILL.md ↔ marketplace plugin SKILL.md）

## 何时使用 / 何时不使用

**何时使用**：

- 新建 / 起草 mj-agent **code-side track** 文档（`track: code` 或 `track: shared` 中由 SWE 主导的部分）
- 跨多 code-side 文档协调改动（用 plan 先起 PLAN）
- 单文档创建（用 author 直接起草）

**何时不使用**：

- agent-side 文档（SKILL/PROMPT/EVAL/CONTRACT）→ 待 `mj-agent-agent-doc` plugin 后续 phase 落地后使用
- 单字符修改 / frontmatter 字段修订 → 直接编辑文件
- 文档校验 → 待 v0.2 / Phase 1 的 `validate` skill
- INDEX 同步 / 跨 source 同步 → 待 v0.2 / Phase 1 的 `sync` skill
- 非 mj-agent 仓的文档（譬如 mj-system / my-marketplace）→ 用对应仓的 plugin（如 `mj-sys-doc`）

## 安装

参考 marketplace 根 README。本 plugin 通过 `mj-agentlab-marketplace` marketplace 注册：

```
/plugin marketplace add MJ-AgentLab/mj-agentlab-marketplace
/plugin install mj-agent-code-doc@mj-agentlab-marketplace
```

## PR / Issue

- **Issue 模板**：使用 `mj-agentlab-marketplace` 仓 `.github/ISSUE_TEMPLATE` 中 `plugin-bug.yml` 或 `plugin-feature.yml`，明确标注 `plugin: mj-agent-code-doc`
- **PR 模板**：参考 marketplace 现存 mj-sys-* plugin 的 PR 提交习惯；含 v0.1 status badge

## 治理依据

本 plugin 由 mj-agent 仓 [ADR-012](https://github.com/MJ-AgentLab/mj-agent/blob/develop/docs/adr/%5BADR%5D_012_Two_Track_Documentation_Governance.md)（双轨治理）+ [ADR-013](https://github.com/MJ-AgentLab/mj-agent/blob/develop/docs/adr/%5BADR%5D_013_Plugin_SKILL_md_Schema_Separation.md)（双 schema 分离）共同治理。版本演进：

- `v0.1.0`（当前）— 部分骨架，2 skill
- `v0.2.0`（Phase 1 计划）— 加 `validate` + `sync`
- `v1.0.0`（Phase 2+ 计划）— 完整 ready
