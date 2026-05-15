# learn-kit Documentation Index

> Last updated: 2026-05-15 (v1.1.0). Plugin-internal documentation index, scoped to learn-kit. For marketplace-level docs (governance / release / cross-plugin) see [`../../../docs/INDEX.md`](../../../docs/INDEX.md).

Navigation hub for `plugins/learn-kit/docs/` — plugin-internal documentation organized by the v4.2.0 Marketplace Documentation Framework with `scope: learn-kit`.

## Architecture Decision Records (`docs/adr/`)

| Document | State | Version | Description |
|----------|-------|---------|-------------|
| [ADR: learn-kit Discovery & Locate Skills](<./adr/[ADR]_LearnKit_Discovery_Skills.md>) | active | v1.0 | v3.1.0 引入 locate + scan 两个 discovery skill 的决策；记录为什么不用 manifest / 持久化缓存 |

## Guides (`docs/guide/`)

*暂无 plugin-internal guides — pedagogical content uses the lowercase numbered series under `plugins/learn-kit/docs/` root (see below).*

## Specifications (`docs/spec/`)

*暂无 plugin-internal specs — schema work for learn-kit's `learning/` subsystem lives in skill templates (`skills/init/templates/METHODOLOGY.md`) rather than as formal SPEC docs.*

## Plugin-Internal Teaching Series (`plugins/learn-kit/docs/`)

> These 6 lowercase numbered docs are **plugin-internal pedagogical content** (a sequential learn-the-plugin tutorial), not architectural / decision artifacts. They are **formally exempt** from the Documentation Framework's tag-prefix requirement per [`[STANDARD]_Documentation_Framework.md`](../../../docs/rule/[STANDARD]_Documentation_Framework.md) §1 (v1.1 codification): the numbered ordering (`-01-`, `-02-`, ...) is the pedagogical signal and tag-prefixing would obscure it. They function similarly to README.md / CHANGELOG.md as plugin-public-facing content. `/mp-doc-validate` skips frontmatter and path-prefix checks against this series.

| # | Document | Purpose |
|---|----------|---------|
| 01 | [learn-kit-01-positioning.md](./learn-kit-01-positioning.md) | 5 分钟上手 — plugin 定位、与 mj-system 等项目的关系 |
| 02 | [learn-kit-02-eight-stage-methodology.md](./learn-kit-02-eight-stage-methodology.md) | 8-stage 方法论概览（手工流 + AI 生成流如何接入） |
| 03 | [learn-kit-03-rfc-2119-worked-example.md](./learn-kit-03-rfc-2119-worked-example.md) | RFC 2119 keywords worked example — 把规则清单解读成可学决策框架的完整案例 |
| 04 | [learn-kit-04-three-skills.md](./learn-kit-04-three-skills.md) | 5 skills 分工：init / locate / scan / generate-tier / nlm-studio |
| 05 | [learn-kit-05-governance-boundary.md](./learn-kit-05-governance-boundary.md) | 治理边界 — `learning/` 子系统与项目主治理框架的关系 |
| — | [learn-kit-使用手册.md](./learn-kit-使用手册.md) | 用户使用手册（中文） |

## Cross-References

- **Plugin entry point**: [`../CLAUDE.md`](../CLAUDE.md) — plugin overview + skill catalogue
- **Plugin user guide**: [`../README.md`](../README.md) — installation + walkthrough
- **Plugin changelog**: [`../CHANGELOG.md`](../CHANGELOG.md)
- **Marketplace doc framework** (governing this INDEX's schema): [`../../../docs/rule/[STANDARD]_Documentation_Framework.md`](../../../docs/rule/[STANDARD]_Documentation_Framework.md)
- **Marketplace INDEX** (sees this plugin INDEX as one entry): [`../../../docs/INDEX.md`](../../../docs/INDEX.md)

## Notes on Scope

`scope: learn-kit` in plugin-internal docs frontmatter signals that the doc concerns learn-kit's plugin-internal decisions (e.g., skill design, methodology iterations). Cross-plugin or marketplace-level decisions (e.g., the notebooklm-kit retirement that affected learn-kit but was a marketplace governance decision) stay at marketplace `docs/adr/` with `scope: marketplace`.
