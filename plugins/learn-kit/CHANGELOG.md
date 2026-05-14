# Changelog

All notable changes to the learn-kit plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.3.1] - 2026-05-14

### Fixed

- **`.claude-plugin/plugin.json`** — `repository` field rewritten from `{ "type": "git", "url": "..." }` object to string `"https://github.com/MJ-AgentLab/mj-agentlab-marketplace"`. The Claude Code plugin manifest schema only accepts string form; the object form caused `/plugin` install to fail with `Validation errors: repository: Invalid input: expected string, received object`. (PR #70 / marketplace v3.2.1)

### Changed

- **`.claude-plugin/plugin.json`** — version 0.3.0 → 0.3.1 (cache-bust patch so `/plugin update` picks up the manifest fix; no other behavior change)

## [0.3.0] - 2026-05-13

### Added

- **`skills/generate-tier/SKILL.md`** — `/learn-kit:generate-tier` AI-driven 3-tier learning doc generator. 8-step workflow: intake → pre-flight → source acquisition (4 mechanisms multi-select: project file paths / scan-locate discovery / pasted text / dir scan) → tier selection (multi-select foundation / structural / challenge, default all) → topic confirmation + conflict policy → per-tier markdown generation → INDEX update → optional HTML rendering offer → per-tier HTML render via Explore subagent (concept→code grounding) + INDEX HTML column update. Writes `learning/<topic>/[LEARNING]_<topic>_<view>.md` and optional matching `.html`. Tools: `Read, Write, Glob, Grep, AskUserQuestion, Agent`.
- **`skills/generate-tier/templates/`** — 4 independent prompt templates:
  - `foundation.md` (≈295L) — 零基础版 prompt (13 sections: 用户问题拆解 → 一句话/类比/专业 → 价值 → 新手困惑 → 能/不能解决 → 术语翻译表 → 完整故事 → 成功/失败案例 → 10 误解 → 三层目标 → 10 自测题 → 下一步)
  - `structural.md` (≈417L) — 结构版 prompt (14 sections: 子问题拆解 → 主题定位 → 解决路径 → 概念地图 → 关系表 → 前置知识路线 → 适用边界 → 成功/失败案例 → 判断清单 → 学习路径图 → 复习卡 → 12 自测题 → 总结)
  - `challenge.md` (≈367L) — 挑战版 prompt (14 sections: 真懂标准 → 易误解点 → 假懂点 → 反例训练 → 相邻概念混淆 → 失败案例诊断 → 成功反向审查 → 误用清单 → 边界判断题 → 迁移应用题 → 解释能力挑战 → 概念诊断测试 → 盲区定位表 → 总结)
  - `html-renderer.md` (≈114L) — 30-min interactive HTML learning page prompt (Phase 1 摄入 → Phase 2 设计 → Phase 3 生成；SVG 图 / 手写语法高亮 / `<details>` 折叠 / Tab 切换 / 复制为 Prompt 按钮 / 亮暗主题；离线单文件无 CDN)
- **`skills/init/templates/INDEX.md` §Tier Documents** — new catalog table for AI-generated tier docs (with HTML column).

### Changed

- **`.claude-plugin/plugin.json`** — version 0.2.0 → 0.3.0; description rewritten to reflect 3-tier generator capability and explicitly state independence (no external service dependencies); keywords expanded with `three-tier, foundation, structural, challenge, ai-generation, html-render`.
- **`README.md`** — restructured §使用 to present manual flow (METHODOLOGY 8 stages) and AI flow (generate-tier) as parallel paths; added §3b generate-tier usage; added §4 HTML output example.
- **`CLAUDE.md`** — removed NLM 协同 line; added generate-tier section with 4-source-mechanism + multi-select + HTML render summary.
- **`skills/init/SKILL.md`** — Step 6 rewritten: NLM integration option replaced with generate-tier pointer.
- **`skills/init/templates/METHODOLOGY.md`** — §10.1 With notebooklm-kit removed; §10.2 With markdownlint promoted to §10.1. METHODOLOGY internal version v0.2 → v0.3.
- **`skills/locate/SKILL.md`** + **`skills/scan/SKILL.md`** — Sibling skills sections: `/notebooklm-kit:learn-make` references replaced with `/learn-kit:generate-tier`.

### Removed

- **`skills/init/templates/NLM_RECORD_TEMPLATE.md`** — entire file deleted. NLM artifact metadata schema is no longer maintained by learn-kit. Users who installed v0.2.x and seeded `learning/_meta/NLM_RECORD_TEMPLATE.md` should manually delete that file if they wish to remove NLM coupling; learn-kit init will no longer regenerate it.
- **`templates/INDEX.md` §NotebookLM Notebooks** + 维护规则 NLM bullet — sections removed.
- All `/notebooklm-kit:*` cross-references in init / locate / scan SKILL.md and templates.

### Decoupled from

- **`notebooklm-kit`** is no longer a sibling/companion plugin from learn-kit's perspective. learn-kit is now fully independent and has no external service or plugin dependencies. The two plugins can still coexist in the marketplace, but learn-kit no longer promotes or requires any NotebookLM workflow.

### Migration note (v0.2.x → v0.3.0)

For projects that ran `/learn-kit:init` against v0.2.x and now have `learning/_meta/NLM_RECORD_TEMPLATE.md` plus a §NotebookLM Notebooks section in `learning/INDEX.md`:

1. The template file can be safely deleted (`rm learning/_meta/NLM_RECORD_TEMPLATE.md`); nothing in v0.3.0 references it.
2. The §NotebookLM Notebooks section in `learning/INDEX.md` can be deleted or repurposed as the user sees fit; v0.3.0 INDEX template offers a §Tier Documents section instead.
3. METHODOLOGY.md (if previously copied via init) may be re-synced from `${CLAUDE_PLUGIN_ROOT}/skills/init/templates/METHODOLOGY.md` v0.3 to drop §10.1 NLM section.

### Released as part of

mj-agentlab-marketplace v3.2.0 (learn-kit AI 3-tier generator + NLM decoupling minor release).

## [0.2.0] - 2026-05-11

### Added

- **`skills/locate/SKILL.md`** — `/learn-kit:locate <query>` reverse-lookup skill. Given a concept name, mnemonic, partial doc title, or section reference (e.g., "DLSRS", "5 维 HITL 规则", "§3.3 of the HITL prompt"), returns ranked candidates split into interpreted [LEARNING] docs (preferred tier) and source canonical docs (secondary tier), with confidence scores and a project-recognition profile. Tools: `Read`, `Glob`, `Grep` (read-only).
- **`skills/scan/SKILL.md`** — `/learn-kit:scan` enumeration skill. Lists all learnable canonical doc candidates in the project by tag prefix ([STANDARD] / [SPEC] / [ADR] / [GUIDE] / [RUNBOOK]), cross-references with interpreted [LEARNING] docs to mark interpreted vs uninterpreted, and ranks by citation frequency (PageRank-lite). Tools: `Read`, `Glob`, `Grep` (read-only).
- **`skills/init/templates/METHODOLOGY.md` §1.5 "Project Discovery"** — new section between §1 Source Intake and §2 Framework Induction. Documents the recommended scan → locate → 8-stage workflow for using learn-kit in existing projects with prior docs, with concrete scenarios (mj-system-like, mj-agent-like, blank-project). METHODOLOGY version: v0.1 → v0.2.

### Changed

- **`.claude-plugin/plugin.json`** — version 0.1.0 → 0.2.0; description amended to mention locate + scan skills.

### Design notes

- Both new skills use a **pure heuristic** project recognition strategy — no manifest, no persistent doc-map, no configuration. Recognition signals: CLAUDE.md tag declarations, learning/INDEX.md presence, docs/ tag-prefix file count. Confidence bands: ≥0.95 / 0.85–0.95 / 0.7–0.85 / <0.7-with-warning.
- Stateless by design: every invocation re-scans. Cost is acceptable for typical project sizes (<500 docs, 1–5s). Statelessness eliminates cache-invalidation complexity.
- Decision record: `docs/[ADR]_LearnKit_Discovery_Skills.md` in the marketplace repo.

### Released as part of

mj-agentlab-marketplace v3.1.0 (learn-kit discovery skills minor release).

## [0.1.0] - 2026-05-11

### Added

Initial release of learn-kit — a generic Claude Code plugin for converting enumerated rule lists into learnable knowledge artifacts.

**Plugin structure**:

- `.claude-plugin/plugin.json` (v0.1.0, MIT, MJ-AgentLab author)
- `skills/init/SKILL.md` — `/learn-kit:init` scaffold command (`disable-model-invocation: true`)
- `skills/init/templates/METHODOLOGY.md` — full 8-stage pedagogical methodology (de-MJ-ified)
- `skills/init/templates/NLM_RECORD_TEMPLATE.md` — NLM artifact metadata schema
- `skills/init/templates/INDEX.md` — `learning/INDEX.md` template
- `skills/init/references/rfc-2119-keywords-pedagogy.md` — worked example: RFC 2119 five normative keywords (MUST / MUST NOT / SHOULD / SHOULD NOT / MAY)
- `README.md` — install + usage guide
- `LICENSE` — MIT

**Provenance**:

Derived from `mj-system` project's `learning/_meta/[LEARNING]_Rule_List_Interpretation_Authoring.md` v2.0 STANDARD-tier methodology. The upstream methodology underwent N=5 cross-domain validation (HITL collaboration / service architecture / SQL formatting / database design / database naming; rules ranging 8–63; dimensions 3–5; 5 independent metaphor worlds; all N-dim AND-gate geometry) before stabilizing. MJ-specific references and case studies have been stripped to enable generic adoption across any project; the original methodology core (§1–§8 eight stages, §9 subsystem meta-rules, §11 worked example pointer, §12 versioning) is preserved.

**Pairs with**: `notebooklm-kit` v2.4.1 (NotebookLM artifact generation; sibling plugin in the same marketplace).

**Released as part of**: mj-agentlab-marketplace v3.0.0 generic restructure.
