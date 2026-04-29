# CHANGELOG

本插件版本变更日志。遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/) + [SemVer 2.0](https://semver.org/lang/zh-CN/)。

## [Unreleased]

> Phase 1 计划事项见 [0.2.0 占位](#020---tbd) 段（待 Code_Side §7.2 OB1-OB5 阈值定稿后开启）。

### Added

- _暂无_

### Changed

- _暂无_

### Fixed

- _暂无_

---

## [0.1.0] - 2026-04-29

### Added

- 初始部分骨架版本（按 mj-agent 仓 PLAN F §V-skel-5 + working notes `[PLAN]_Marketplace_Plugin_Construction.md` 内容蓝图实施）
- Skill: `mj-agent-code-doc-plan` — 大型 code-side 文档变更 PLAN 起草引导
- Skill: `mj-agent-code-doc-author` — 8 类 code-side canonical（GUIDE / ADR / SPEC / RUNBOOK / POSTMORTEM / STANDARD / ISSUE / ASSESSMENT）起草引导
- author 子目录：`type-decision-tree.md` + `frontmatter-templates/{8 type}.md` + `body-skeleton-{8 type}.md`
- plan 子目录：`plan-template.md` + `plan-checklist.md`
- 每 skill `evals/` 目录：`evals.json`（≥ 3 prompt）+ `trigger-eval.json`（5+5 query）
- 使用 Claude Code 原生 SKILL.md schema（`name + description` 两字段），由 mj-agent 仓 [ADR-013](https://github.com/MJ-AgentLab/mj-agent/blob/develop/docs/adr/%5BADR%5D_013_Plugin_SKILL_md_Schema_Separation.md) 锁定
- body 结构与 marketplace 现存 mj-sys-* 4 plugin 风格对齐（Overview / Workflow / Quick Reference / Examples / Anti-patterns）

### Notes

- **Schema decision rationale**（详见 [ADR-013](https://github.com/MJ-AgentLab/mj-agent/blob/develop/docs/adr/%5BADR%5D_013_Plugin_SKILL_md_Schema_Separation.md)）：本 plugin SKILL.md **不使用** mj-agent in-source SKILL.md 的 13 字段 schema（那是 Agent_Side v1.0 §2 范围；由 mj-agent loader §7.3/§7.5 frontmatter strip 契约支撑，与 Claude Code plugin loader 无关）。**不强制** Agent_Side §2.1 五段式 body。
- **Deferred to Phase 1**（在 [Unreleased] 跟踪到 0.2.0 落地）：
  - `mj-agent-code-doc-validate` — 依赖 Code_Side §7.2 OB1-OB5 阈值定稿
  - `mj-agent-code-doc-sync` — 依赖 §7.6 `.claude/` 边界细化 + ADR-013 双 source 同步职责
- **Quality gate**：本版本 vacuum 率（每段 body 非 TODO 占位字符数）≥ 70%；仅在明确 Phase 1 完成的部分使用 TODO 占位
- **Namespace separation**：与 marketplace 既有 mj-sys-* 4 plugin 命名空间清晰分流（`mj-agent-*` vs `mj-sys-*`）

---

## [0.2.0] - TBD

> 占位。待 Code_Side §7.2 OB1-OB5 阈值定稿后启动。计划：

### Added (planned)

- Skill: `mj-agent-code-doc-validate` — Code_Side §7.2 OB1-OB5 + A1-A6 PR 校验
- Skill: `mj-agent-code-doc-sync` — INDEX.md 同步 + 双 source 内容同步（mj-agent in-source SKILL.md ↔ marketplace plugin SKILL.md，per ADR-013）

[Unreleased]: https://github.com/MJ-AgentLab/mj-agentlab-marketplace/compare/main...develop
[0.1.0]: https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases/tag/mj-agent-code-doc-v0.1.0
