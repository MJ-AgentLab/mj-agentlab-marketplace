---
type: guide
scope: learn-kit
summary: learn-kit plugin-internal documentation navigation hub — ADRs + GUIDEs (2 合卷) + cross-references
owner: marketplace-maintainers
created: 2026-05-15
updated: 2026-05-18
state: active
version: v1.2
domain: plugin-internal
tags:
  - index
  - navigation
related:
  - ../../../docs/rule/[STANDARD]_Documentation_Framework.md
  - ../../../docs/INDEX.md
revision: |
  2026-05-18 — v1.2: 加 8 字段 frontmatter（Framework v1.5 §1 INDEX special clause）；删除 §Plugin-Internal Teaching Series 段（v1.1 教学系列豁免取消）；§Guides 段填入 2 份合规 [GUIDE]_*.md（合并自原 6 lowercase 教学系列）
---

# learn-kit Documentation Index

> Last updated: 2026-05-18 (v1.2.0). Plugin-internal documentation index, scoped to learn-kit. For marketplace-level docs (governance / release / cross-plugin) see [`../../../docs/INDEX.md`](../../../docs/INDEX.md).

Navigation hub for `plugins/learn-kit/docs/` — plugin-internal documentation organized by the Marketplace Documentation Framework v1.5 with `scope: learn-kit`.

## Architecture Decision Records (`docs/adr/`)

| Document | State | Version | Description |
|----------|-------|---------|-------------|
| [ADR: learn-kit Discovery & Locate Skills](./adr/[ADR]_LearnKit_Discovery_Skills.md) | active | v1.0 | v3.1.0 引入 locate + scan 两个 discovery skill 的决策；记录为什么不用 manifest / 持久化缓存 |

## Guides (`docs/guide/`)

v1.2.0 起 plugin-internal pedagogical content 整合为 2 份合规 `[GUIDE]_*.md`（合并自原 6 份 lowercase 教学系列；Framework v1.5 §1 取消 v1.1 教学系列模式豁免配套）:

| Document | Description |
|----------|-------------|
| [Pedagogy 教学合卷](./guide/[GUIDE]_LearnKit_Pedagogy.md) | 定位 + 8 阶段方法论 + RFC 2119 worked example + 6 类质量门 + 8 跨阶段反模式 |
| [Design 设计合卷](./guide/[GUIDE]_LearnKit_Design.md) | 5 skill 分工 + 闭环 + dogfood findings + parallel subsystem 治理模型 + frontmatter / INDEX / 归档规则 + v1.0.0 依赖矩阵 + 版本演化策略 |

## Specifications (`docs/spec/`)

*暂无 plugin-internal specs — schema work for learn-kit's `learning/` subsystem lives in skill templates (`skills/init/templates/METHODOLOGY.md`) rather than as formal SPEC docs.*

## Cross-References

- **Plugin entry point**: [`../CLAUDE.md`](../CLAUDE.md) — plugin overview + skill catalogue + Advanced Tips（v1.2.0 起含吸收自原用户手册的进阶提示）
- **Plugin user guide**: [`../README.md`](../README.md) — 安装 + walkthrough + 中文 TL;DR + 5 分钟上手 + Worked Cases + Troubleshooting（v1.2.0 起含吸收自原用户手册的快速参考）
- **Plugin changelog**: [`../CHANGELOG.md`](../CHANGELOG.md)
- **Marketplace doc framework** (governing this INDEX's schema): [`../../../docs/rule/[STANDARD]_Documentation_Framework.md`](../../../docs/rule/[STANDARD]_Documentation_Framework.md) v1.5
- **Marketplace INDEX** (sees this plugin INDEX as one entry): [`../../../docs/INDEX.md`](../../../docs/INDEX.md)

## Notes on Scope

`scope: learn-kit` in plugin-internal docs frontmatter signals that the doc concerns learn-kit's plugin-internal decisions (e.g., skill design, methodology iterations). Cross-plugin or marketplace-level decisions stay at marketplace `docs/adr/` with `scope: marketplace`.
