# Changelog

All notable changes to the learn-kit plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [2.0.0] - 2026-05-18

### BREAKING

- **Skill `init` renamed to `scaffold-learning`** —
  `/learn-kit:init` → `/learn-kit:scaffold-learning`. The v1.2.1
  namespace convention ("always write `/learn-kit:init`, never bare
  `/init`") was a documentation-only constraint and did NOT prevent
  Claude Code's slash-command picker from listing both Claude Code's
  builtin `/init` (CLAUDE.md generator) and learn-kit's `/init` as
  parallel candidates. Renaming the skill physically removes the
  collision: typing `/init` now matches only the host builtin; the
  scaffold action is reached via `/learn-kit:scaffold-learning`
  (fully qualified) or natural-language routing (still gated by
  `disable-model-invocation: true`).

  **Migration**: in any project that referenced the old skill, run:
  ```bash
  grep -rn "/learn-kit:init" .   # find references
  # replace each with: /learn-kit:scaffold-learning
  ```
  See [`../../docs/adr/[ADR]_LearnKit_Init_Skill_Rename.md`](../../docs/adr/[ADR]_LearnKit_Init_Skill_Rename.md)
  for the full decision (alternatives considered, why no alias is
  retained) and
  [`../../docs/guide/[GUIDE]_Migration_From_v3_to_v4.md`](../../docs/guide/[GUIDE]_Migration_From_v3_to_v4.md)
  §5 for a step-by-step migration walkthrough.

  Before / after:
  ```text
  # v1.x
  /learn-kit:init                                      # scaffold
  ${CLAUDE_PLUGIN_ROOT}/skills/init/templates/...      # template ref
  plugins/learn-kit/skills/init/SKILL.md               # file path

  # v2.0.0
  /learn-kit:scaffold-learning                                  # scaffold
  ${CLAUDE_PLUGIN_ROOT}/skills/scaffold-learning/templates/...  # template ref
  plugins/learn-kit/skills/scaffold-learning/SKILL.md           # file path
  ```

### Changed

- **`plugins/learn-kit/skills/scaffold-learning/SKILL.md`** —
  Renamed from `skills/init/SKILL.md` via `git mv`. Frontmatter
  `name: init` → `name: scaffold-learning`; H1 "Initialize Learning
  Subsystem" → "Scaffold Learning Subsystem"; in-body
  `${CLAUDE_PLUGIN_ROOT}/skills/init/templates/` →
  `${CLAUDE_PLUGIN_ROOT}/skills/scaffold-learning/templates/`;
  worked-example path reference updated. `disable-model-invocation:
  true` retained (semantic intent unchanged — scaffold is still an
  explicit, file-system-writing user action).
- **`plugins/learn-kit/skills/scaffold-learning/templates/{INDEX,METHODOLOGY}.md`**
  + **`references/rfc-2119-keywords-pedagogy.md`** — Carried
  unchanged via `git mv` (history preserved); in-body cross-references
  to `/learn-kit:init` updated to `/learn-kit:scaffold-learning`.
- **`plugins/learn-kit/skills/{locate,scan,generate-tier}/SKILL.md`** —
  Cross-skill routing references updated (8 total occurrences:
  locate 2, scan 3, generate-tier 3) from `/learn-kit:init` to
  `/learn-kit:scaffold-learning`.
- **`plugins/learn-kit/README.md`** + **`CLAUDE.md`** — All
  user-facing references to the scaffold skill updated to new name.
  §"命名约定" (slash invocation namespace convention) rewritten:
  the "直接动机" (direct motivation = `init` collides with builtin
  `/init`) is recast as historical context, since the collision is
  now physically resolved by the rename; the convention itself is
  preserved for future-proofing against other potential same-name
  builtins.
- **`plugins/learn-kit/docs/guide/[GUIDE]_LearnKit_{Pedagogy,Design}.md`** —
  In-text references and source-file pointer tables updated to new
  skill folder name.
- **`plugins/learn-kit/docs/INDEX.md`** + **`docs/adr/[ADR]_LearnKit_Discovery_Skills.md`
  §References** — Path pointers updated to `skills/scaffold-learning/`;
  Discovery_Skills ADR adds an inline note referencing the rename ADR.

### Notes

- Historical CHANGELOG entries (v0.1.0 through v1.2.1) retain the
  original `/learn-kit:init` wording — they are factual records of
  what was true at each version and must not be rewritten.
- `disable-model-invocation: true` on `scaffold-learning/SKILL.md`
  continues to block LLM auto-routing. The user-facing slash-picker
  collision was a separate UX issue not addressable by that flag.

## [1.2.1] - 2026-05-18

### Changed

- **`plugins/learn-kit/skills/nlm-studio/SKILL.md`** — Frontmatter
  `description:` 由 ~3,179 字符压缩至 ~1,490 字符（< 1,536 cap），消除
  Claude Code `/doctor` "Some skill descriptions will be shortened"
  warning。原 description 内的 runtime detail 段（13-artifact 组成 /
  HTML upload DROPPED 论证 / Notebook 命名冲突政策 / terminal-only
  output / View-Purpose Preservation 哲学段 / MCP + nlm login auth）
  迁移到 SKILL.md body 新增 `## Outputs at a glance` + `## Auth &
  prerequisites` 两段；description 仅保留 routing 必需的载荷：1 句用途
  + 上游 skill 指向 + 全部 10 条 trigger phrase（中英双语逐字保留）
  + 4 条 `Do NOT use for:` 反向触发块（逐字保留）。
- **`plugins/learn-kit/.claude-plugin/plugin.json`** — version
  `1.2.0 → 1.2.1`（patch）。

### Why

description 在 v1.0.0 起累积承担过多 runtime detail 职责，超过 Anthropic
skill description 设计原则（description 唯一职责是帮模型决定"要不要调用
本 skill"）；移迁出后 routing 信号更聚焦、body 也更利读者按章节查找。
No behavior change — trigger 路由 / allowed-tools / disable-model-invocation
flag 全部不动；现有 13 artifact 工作流不变。

## [1.2.0] - 2026-05-18

### Changed

- **`plugins/learn-kit/docs/` 6 份 lowercase 教学系列合并为 2 份合规 `[GUIDE]_*.md`**（Framework v1.5 §1 取消 v1.1 教学系列模式豁免配套）:
  - `learn-kit-01-positioning.md` + `learn-kit-02-eight-stage-methodology.md` + `learn-kit-03-rfc-2119-worked-example.md` → `plugins/learn-kit/docs/guide/[GUIDE]_LearnKit_Pedagogy.md`（教学合卷：定位 + 8 阶段方法论 + RFC 2119 worked example + 6 类质量门 + 8 跨阶段反模式）
  - `learn-kit-04-three-skills.md` + `learn-kit-05-governance-boundary.md` → `plugins/learn-kit/docs/guide/[GUIDE]_LearnKit_Design.md`（设计合卷：5 skill 分工 + 闭环 + dogfood findings + parallel subsystem 治理模型 + frontmatter / INDEX / 归档规则 + v1.0.0 依赖矩阵 + 版本演化策略）
  - `learn-kit-使用手册.md` → 拆入 `plugins/learn-kit/README.md`（§中文 TL;DR + §5 分钟上手 + §Worked Cases + §Troubleshooting）+ `plugins/learn-kit/CLAUDE.md`（§Advanced Tips）

- **`plugins/learn-kit/docs/INDEX.md` v1.1 → v1.2** — 加 8 字段 frontmatter（Framework v1.5 §1 INDEX special clause）；删除 §Plugin-Internal Teaching Series 段；§Guides 段填入 2 份合卷。

- **`plugins/learn-kit/README.md`** — 教学系列表（lines 181-192）从 6 行更新为 2 行（新 [GUIDE]_* 路径）；新增 4 个章节吸收原用户手册内容（中文 TL;DR / 5 分钟上手 / 真实使用案例 / 常见踩坑）；前置依赖段加 legacy plugin 卸载提示；演进历史段移除 cross-project 引用。

- **`plugins/learn-kit/CLAUDE.md`** — Documentation 段重写指向 2 份合卷；新增 §Advanced Tips 段吸收原用户手册的进阶提示。

- **`plugins/learn-kit/.claude-plugin/plugin.json`** — version `1.1.0 → 1.2.0`（minor）；description 加 v1.2.0 changelog 摘要。

### Removed

- 删除 6 份 lowercase 教学系列原文件（内容已合并至 2 份 [GUIDE]_* 或 README/CLAUDE.md）:
  - `plugins/learn-kit/docs/learn-kit-01-positioning.md`
  - `plugins/learn-kit/docs/learn-kit-02-eight-stage-methodology.md`
  - `plugins/learn-kit/docs/learn-kit-03-rfc-2119-worked-example.md`
  - `plugins/learn-kit/docs/learn-kit-04-three-skills.md`
  - `plugins/learn-kit/docs/learn-kit-05-governance-boundary.md`
  - `plugins/learn-kit/docs/learn-kit-使用手册.md`

### Released as part of

- marketplace v4.5.0（Framework v1.5 §1 exemption cancellation batch）

## [1.1.0] - 2026-05-15

### Added

- **`plugins/learn-kit/docs/INDEX.md`** — Plugin-internal documentation index per marketplace Documentation Framework v1.0 (with `scope: learn-kit`). Catalogues plugin-internal ADRs / GUIDEs / SPECs (currently only the migrated ADR) + the 6 lowercase numbered teaching docs (`learn-kit-01..05` + `使用手册`) which are intentionally exempt from tag-prefix requirement as plugin-internal pedagogical content.
- **`plugins/learn-kit/docs/adr/`** — Plugin-internal ADR subdir. Houses learn-kit-scope architectural decisions (cross-plugin / marketplace governance ADRs stay at marketplace `docs/adr/`).
- **`plugins/learn-kit/docs/guide/`** and **`docs/spec/`** — Placeholder subdirs with `.gitkeep` for future plugin-internal GUIDEs / SPECs. Currently no plugin-internal docs of these types (schema work lives in `skills/init/templates/METHODOLOGY.md`).

### Moved (from marketplace level)

- **`[ADR]_LearnKit_Discovery_Skills.md`** — Migrated from `mj-agentlab-marketplace/docs/adr/` → `plugins/learn-kit/docs/adr/`. Rationale: the decision is plugin-internal (skill design within learn-kit), not marketplace governance. Frontmatter updated: `scope: learn-kit` (was already set in v4.2.1 retrofit), `related:` paths recalculated for new depth (4 levels up to marketplace `docs/rule/`).

### Changed

- **`plugins/learn-kit/CLAUDE.md`** — New `## Documentation` section linking to `docs/INDEX.md` + listing the 3 framework subdirs (`adr/` / `guide/` / `spec/`) + noting the 6 lowercase teaching series.
- **`plugins/learn-kit/.claude-plugin/plugin.json`** — version `1.0.0 → 1.1.0` (minor).

### Released as part of

- marketplace v4.3.0 (PR #77)

## [1.0.0] - 2026-05-14

### Added

- **`skills/nlm-studio/SKILL.md`** — `/learn-kit:nlm-studio <topic>` skill that pushes a topic's three-tier learning markdown corpus (3 `.md` files generated by `/learn-kit:generate-tier`) to NotebookLM as sources, then generates up to 13 online-viewable multimedia artifacts per topic: **4 view-cycled artifact types × 3 view variants = 12** (audio + video + slide_deck + infographic, each in foundation/structural/challenge view) **+ 1 shared view-agnostic mind_map = 13 total**. HTML files are intentionally NOT uploaded (see Dogfood findings below). Online-only (no download). 5-step workflow with per-Step auth refresh: pre-flight (real auth gate via `notebook_list`, not just local `refresh_auth`+`server_info`; file detection requires 3 `.md`) → re-run guard (`notebook_list` lookup with 4-option AskUserQuestion: regenerate / replace sources / new-timestamped / abort) → notebook setup (notebook_create + 3 source_add in parallel + **mandatory `notebook_get` verification** since source_add error responses are unreliable) → **Step 3.5 Quota confirm gate** (explicit warning that the skill cannot see prior same-day Studio usage; user confirms / reduces subset / aborts; "~65% of empirical ~20/day ceiling") → Step 4 artifact generation (3 parallel batches of 5/4/4 — foundation includes mind_map, structural and challenge skip mind_map; idempotent via studio_status pre-loop lookup; refresh_auth between batches; mid-run auth failure → retry-once before abort) → Step 5 terminal recap. Allowed tools: 9 MCP calls under `mcp__plugin_learn-kit_notebooklm-mcp__*` prefix.
- **`skills/nlm-studio/templates/`** — 9 prompt-composition templates implementing the **View-Purpose Preservation** principle: pedagogical purpose (3 view templates) and medium constraints (5 artifact templates) compose orthogonally for the 4 view-cycled artifact types; an interaction-overrides YAML adds joint tuning for cells where view × artifact effects interact non-obviously.
  - `view-foundation.md` / `view-structural.md` / `view-challenge.md` — each follows a strict 5-section schema (§1 Pedagogical purpose / §2 Audience profile / §3 Style mandate / §4 Anti-patterns / §5 Success criteria). SKILL.md failsafe checks all 5 sections present + non-empty before composition.
  - `artifact-audio.md` / `artifact-video.md` / `artifact-slide_deck.md` / `artifact-infographic.md` — medium format constraints only for the 4 view-cycled types; pedagogical stance comes from view-prefix at composition time.
  - `artifact-mind_map.md` — **view-agnostic** (composed without view-prefix; one mind_map per topic). Dogfood found NLM's mind_map artifact type produces structural-hierarchy output regardless of view directives.
  - `interaction-overrides.md` — 4 explicit (view × artifact) joint overrides for view-cycled cells with strong interaction: challenge+audio (probing-question segment endings), foundation+infographic (≤7 digits per panel + everyday-object iconography), challenge+slide_deck (≥70% counter-example slides in 2-slide "looks-like-X / actually-Y" pairs), foundation+video (dual-modal voice+text TL;DR closing). The remaining 8 view-cycled cells use base composition. Mind_map has no overrides (view-agnostic).
- **`.mcp.json`** — migrated from notebooklm-kit (server name `notebooklm-mcp` unchanged). After this migration MCP tools resolve to `mcp__plugin_learn-kit_notebooklm-mcp__*`.

### Dogfood-validated design (in v1.0.0 PR pre-merge)

Five findings from end-to-end dogfooding against mj-agent's `learning/documentation-framework/` topic shaped the final design (also documented inline in SKILL.md §"Dogfood-validated design"):

1. **Step 1 pre-flight insufficient as auth check** — `refresh_auth` + `server_info` are local-only checks. Real auth verification requires a network call. SKILL.md Step 1.4 now calls `notebook_list` as the actual auth gate; only that call decides whether to proceed.
2. **HTML upload dropped** — Both `source_type="file"` and `source_type="text"` (L2 fallback) reject non-trivial HTML content. The L2 fallback in earlier drafts is removed. Only 3 `.md` files are uploaded. HTML output of `/learn-kit:generate-tier` is for human browser viewing only.
3. **Per-Step auth refresh** — NLM tokens are observed to expire within 15-30 min, often shorter than a 7-15 min `nlm-studio` run. Each Step (2, 3, 3.5, 4) refreshes auth at its start; mid-run auth failure in Step 4 → retry once with refresh_auth before aborting.
4. **Post-upload verification mandatory** — `source_add` error responses are unreliable (server may succeed asynchronously despite client-side error). After the 3 `source_add` calls, SKILL.md mandates `notebook_get` to cross-check the actual source list; trust notebook_get over source_add response.
5. **Mind_map collapsed to view-agnostic** — NLM's mind_map artifact type produces near-identical structural-hierarchy output across foundation/structural/challenge prompting variants. Producing 3 view-cycled mind_maps wastes quota for redundant content. v1.0.0 ships with one mind_map per topic; the previous structural+mind_map interaction-override is removed; artifact total drops from 15 to 13.

Additional optimization validated by dogfood: parallel batches of 5 `studio_create` calls per round incur no rate-limiting; the original sequential design was changed to parallel-per-round for speed.

### Language & terminology directive (added in v1.0.0 PR pre-merge)

- **`templates/language-directive.md`** — new single-source-of-truth file appended verbatim to every artifact's `focus_prompt` as the `===== LANGUAGE & TERMINOLOGY =====` section (both view-cycled compositions and the shared mind_map composition). Enforces output-language policy across all 13 artifacts in a single place:
  - **主体内容用中文（简体）** — section titles, narrative, host dialogue (audio), on-screen text (video), slide bodies, mind_map node labels, infographic panel text.
  - **Industry-standard technical terms preserved in English** — explicit non-translation lists for documentation governance (`frontmatter` / `schema` / `ADR` / `SKILL.md` / `track` / `canonical` / `deprecated` / etc.), formats & protocols (`YAML` / `Markdown` / `MCP server` / `loader`), engineering practice (`hygiene` / `governance` / `lint` / `CI` / `worktree`), generic CS (`hash` / `cache` / `enum` / `glob` / `regex`).
  - **Code / file paths / identifiers / command names verbatim** — no translation, no added quoting.
  - Concrete good/bad sample lines included in the directive so NLM has anchored exemplars rather than abstract rules.
- **SKILL.md composition contract** updated to include the new `===== LANGUAGE & TERMINOLOGY =====` section in both view-cycled and mind_map composition formats. The directive is a single file rather than 9 copies (one per template) to guarantee consistency and make future policy changes a one-file edit.

### Changed

- **`.claude-plugin/plugin.json`** — version 0.3.1 → 1.0.0 (major bump: addition of MCP-dependent skill + first stable release). description rewritten to describe all three flows (manual / AI / multimedia) and explicitly state nlm-studio's external dependencies (notebooklm-mcp + `nlm login`); keywords expanded with `nlm-studio`, `notebooklm`, `audio`, `video`, `multimedia`, `slide-deck`, `mind-map`, `infographic` (8 new entries).
- **`CLAUDE.md`** — removed "完全独立、不依赖任何外部插件 / 服务 / API" claim. Added v1.0.0 dependency notice. New §NLM 集成 section documents the MCP tool prefix rule (`mcp__plugin_<plugin.json-name>_<server-key>__*`) and why migration from notebooklm-kit changed the prefix from `mcp__plugin_notebooklm-kit_*` to `mcp__plugin_learn-kit_*`.
- **`README.md`** — added 多媒体流 (third use flow) to opener; added §前置依赖 section; restructured §5 to document nlm-studio's 5-step workflow + artifact table by view × type; v1.0.0 entry added to evolution table.
- **`skills/generate-tier/SKILL.md`** — workflow expanded from 8-step to **10-step**. Inserted new optional **Step 9** between HTML rendering (Step 8) and summary (now Step 10): asks user via AskUserQuestion whether to invoke `/learn-kit:nlm-studio <topic>` on the just-generated three-tier corpus. Default = Skip; opt-in only on explicit "Yes". `generator` frontmatter tag bumped to `learn-kit/generate-tier v1.0.0`. §Non-goals updated to clarify Step 9 only **offers** to invoke external services; user must opt in.

### Breaking

- **Marketplace coupling change**: in v0.x, learn-kit was "Independent plugin — no external service dependencies". In v1.0.0, the nlm-studio skill has a hard dependency on the `notebooklm-mcp` MCP server. The MCP server is bundled in this plugin's `.mcp.json`, but the underlying CLI (`uv tool install notebooklm-mcp-cli`) and `nlm login` are user-side prerequisites. The other 4 skills (init / locate / scan / generate-tier) remain dependency-free.

### Released as part of

mj-agentlab-marketplace **v4.0.0** (major restructure: notebooklm-kit retired entirely; nlm-studio absorbs the multimedia-generation slice into learn-kit; learn-kit becomes the sole NLM-touching plugin). See `docs/[ADR]_NotebookLM_Kit_Retirement.md` for the decision rationale + alternatives considered, and `docs/MIGRATION_GUIDE.md` §v3.2.x → v4.0.0 for user-facing migration steps.

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
