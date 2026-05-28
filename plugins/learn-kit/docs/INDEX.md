---
type: guide
scope: learn-kit
summary: learn-kit plugin-internal documentation navigation hub — ADRs + GUIDEs (2 合卷 + Discovery_Recipes) + cross-references
owner: marketplace-maintainers
created: 2026-05-15
updated: 2026-05-28
state: active
version: v1.3
domain: plugin-internal
tags:
  - index
  - navigation
related:
  - ../../../docs/rule/[STANDARD]_Documentation_Framework.md
  - ../../../docs/INDEX.md
revision: |
  2026-05-28 — v1.3: §Guides 段加入 [GUIDE]_LearnKit_Discovery_Recipes (v3.0.0 新增 — 保留 v2.x locate/scan 算法的 manual recipes)；§Architecture Decision Records 段加 v3.0.0 marketplace-layer ADR 的 cross-reference 备注（ADR 文件在 marketplace docs/adr/，scope: marketplace）
  2026-05-18 — v1.2: 加 8 字段 frontmatter（Framework v1.5 §1 INDEX special clause）；删除 §Plugin-Internal Teaching Series 段（v1.1 教学系列豁免取消）；§Guides 段填入 2 份合规 [GUIDE]_*.md（合并自原 6 lowercase 教学系列）
---

# learn-kit Documentation Index

> Last updated: 2026-05-28 (v3.0.0+). Plugin-internal documentation index, scoped to learn-kit. For marketplace-level docs (governance / release / cross-plugin) see [`../../../docs/INDEX.md`](../../../docs/INDEX.md).

Navigation hub for `plugins/learn-kit/docs/` — plugin-internal documentation organized by the Marketplace Documentation Framework v1.6 with `scope: learn-kit`.

## Architecture Decision Records (`docs/adr/`)

| Document | State | Version | Description |
|----------|-------|---------|-------------|
| [ADR: learn-kit Discovery & Locate Skills](./adr/[ADR]_LearnKit_Discovery_Skills.md) | active | v1.0 | v3.1.0 引入 locate + scan 两个 discovery skill 的决策；记录为什么不用 manifest / 持久化缓存。v3.0.0 起 skill 已删除，算法保留在新 [GUIDE]_LearnKit_Discovery_Recipes 中 |

> **Note (v3.0.0+)**: marketplace-layer ADR [`[ADR]_LearnKit_Consolidation_To_Single_Skill`](../../../docs/adr/[ADR]_LearnKit_Consolidation_To_Single_Skill.md) 记录 5 skill → 1 three-views 的收敛决策（scope: marketplace，不在本 plugin-internal INDEX 内）。

## Guides (`docs/guide/`)

v3.0.0 起 plugin-internal pedagogical content 共 3 份合规 `[GUIDE]_*.md`:

| Document | Description |
|----------|-------------|
| [Pedagogy 教学合卷](./guide/[GUIDE]_LearnKit_Pedagogy.md) | 定位 + 8 阶段方法论 + RFC 2119 worked example + 6 类质量门 + 8 跨阶段反模式 |
| [Design 设计合卷](./guide/[GUIDE]_LearnKit_Design.md) | 历史 5 skill 分工 + v3.0.0 收敛决策 + dogfood findings + parallel subsystem 治理模型 + frontmatter / INDEX / 归档规则 + 依赖矩阵 + 版本演化策略 |
| [Discovery Recipes (v3.0.0 新)](./guide/[GUIDE]_LearnKit_Discovery_Recipes.md) | 保留 v2.x locate/scan skill 的算法核心为 manual recipes (Grep+Glob 模板 + 置信度评分 + canonical doc 枚举 + 引用频率 ranking)；用户可在任意项目内手动执行等价工作 |

## Specifications (`docs/spec/`)

*暂无 plugin-internal specs — schema work for learn-kit's `learning/` subsystem lives in skill templates (`skills/scaffold-learning/templates/METHODOLOGY.md`) rather than as formal SPEC docs.*

## Cross-References

- **Plugin entry point**: [`../CLAUDE.md`](../CLAUDE.md) — plugin overview + skill catalogue + Advanced Tips（v1.2.0 起含吸收自原用户手册的进阶提示）
- **Plugin user guide**: [`../README.md`](../README.md) — 安装 + walkthrough + 中文 TL;DR + 5 分钟上手 + Worked Cases + Troubleshooting（v1.2.0 起含吸收自原用户手册的快速参考）
- **Plugin changelog**: [`../CHANGELOG.md`](../CHANGELOG.md)
- **Marketplace doc framework** (governing this INDEX's schema): [`../../../docs/rule/[STANDARD]_Documentation_Framework.md`](../../../docs/rule/[STANDARD]_Documentation_Framework.md) v1.5
- **Marketplace INDEX** (sees this plugin INDEX as one entry): [`../../../docs/INDEX.md`](../../../docs/INDEX.md)

## Notes on Scope

`scope: learn-kit` in plugin-internal docs frontmatter signals that the doc concerns learn-kit's plugin-internal decisions (e.g., skill design, methodology iterations). Cross-plugin or marketplace-level decisions stay at marketplace `docs/adr/` with `scope: marketplace`.
