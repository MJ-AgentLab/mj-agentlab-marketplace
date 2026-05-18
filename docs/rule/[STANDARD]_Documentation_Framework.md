---
type: standard
scope: marketplace
summary: Documentation framework v1.6 — §1 hard exclusions + §1.1 root-level named files (5 responsibilities + Source of exclusion) + §2.7 CLAUDE.md sync allowlist + §4.3.1 A6 active CI gate
owner: marketplace-maintainers
created: 2026-05-15
updated: 2026-05-18
state: active
version: v1.6
domain: governance
tags:
  - documentation
  - framework
  - meta
  - archive
  - sync-allowlist
related:
  - ./[STANDARD]_GitHub_Markdown.md
  - ./[STANDARD]_Commit_Message_Convention.md
  - ./[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md
  - ../runbook/[RUNBOOK]_Doc_Archive_Procedure.md
  - ../adr/[ADR]_Root_Level_Named_Files_Codification.md
revision: |
  2026-05-18 — v1.6: 新增 §1.1 Root-Level Named Special Files & Individual Responsibilities（5 行表 + Source of exclusion 列区分 §1 hard 与 §1.1 editorial convention）+ §1.1 自身的 editorial-convention 排除规则 for CONTRIBUTING.md + GLOSSARY.md；新增 §2.7 CLAUDE.md Sync Allowlist（3 类 trigger + 非触发 clause）；§4.3 表 A6 行 "deferred → active (v1.6+)" + 新增 §4.3.1 A6 active gate 实现规范；§1 本身保持 v1.5 原样不动。配套：bump `[ADR]_Documentation_Framework_Exemption_Reversal` v1.0 → v1.1；新建 `[ADR]_Root_Level_Named_Files_Codification.md` v1.0；archive `[GUIDE]_Contributing.md` v1.1（trigger #4）；新建 root CONTRIBUTING.md + GLOSSARY.md。Non-trigger 自身归档：仅新增章节 + 改 §5。
  2026-05-18 — v1.5: §1 取消 v1.1 单文件 + 教学系列模式豁免；改写为「Scope + Community/External-Spec Exclusion」简化版（仅保留 README/CHANGELOG/CLAUDE.md/SKILL.md/templates/references 5 类外部规范限制不可绕过的命名约束）+ INDEX.md「保留名 + 强制 frontmatter」特别条款；删除已退役 notebooklm-kit/nlm-shared 残行；删除 v1.1 + v1.3 normative blockquotes；§5 添加 v1.5 entry；清理 §2.1 / §2.3.1 / §4.3 / §5 v1.0 中所有 cross-project 引用（marketplace 独立性原则）
  2026-05-17 — v1.4: Flat archive layout amendment（§2.3 子规则系列同步 flat + §2.3.5 new）
  2026-05-15 — v1.3: §1 exempt-file frontmatter discipline
  2026-05-15 — v1.2: Archive mechanism codification（§2.3.1-§2.3.4）
  2026-05-15 — v1.1: §1 exemption codification（教学系列 pattern）
  2026-05-15 — v1.0: Initial framework
---

# [STANDARD] Documentation Framework

## §1 Scope & Applicability

This STANDARD governs every markdown document under:

- `docs/**/*.md` (marketplace-level documentation)
- `plugins/<name>/docs/**/*.md` (plugin-internal documentation)

**Out of scope** — files that **cannot** carry the marketplace 8-field frontmatter because they are bound by external naming / format contracts (GitHub UI, Keep-a-Changelog, Claude Code plugin spec, LLM-runtime assets):

| Path Pattern | External Contract | 是否允许 marketplace frontmatter |
|------|--------|--------|
| `README.md` (any depth) | GitHub public-facing entry point; no formal frontmatter convention | ❌ 禁止（破坏 GitHub 渲染） |
| `CHANGELOG.md` (any depth) | Keep-a-Changelog format; no frontmatter | ❌ 禁止（破坏 changelog 工具链） |
| `plugins/<name>/CLAUDE.md` | Claude Code plugin spec contract | ❌ 禁止（破坏 plugin loader） |
| `plugins/<name>/skills/<name>/SKILL.md` | Claude Code plugin spec native frontmatter (`name`, `description`, optional `allowed-tools`, `disable-model-invocation`) | ❌ 禁止（plugin loader 拒收） |
| `plugins/<name>/skills/<name>/templates/*.md` | LLM-facing runtime asset; loaded by skill as prompt template | ❌ 禁止（YAML 前缀干扰 LLM） |
| `plugins/<name>/skills/<name>/references/*.md` | LLM-facing runtime asset | ❌ 禁止（同上） |

**INDEX.md special clause** — `docs/INDEX.md` 与 `plugins/<name>/docs/INDEX.md`:

- **保留文件名**（所有 inbound link 稳定）
- **必须含 8 字段 frontmatter**（`type: guide` + `scope: marketplace`/`<plugin>` + 其他必填字段）
- 不视作 exempt；纳入 `/mp-doc-validate` 标准检查

**v1.5 cancellation note**:

- v1.1 「plugin-internal teaching series」pattern exemption（`plugins/<name>/docs/<plugin>-NN-*.md` / `<plugin>-*.md` lowercase 数字系列）— **canceled**；所有此类文档必须迁移到 `plugins/<name>/docs/guide/[GUIDE]_*.md` 合规命名 + 加 8 字段 frontmatter，或拆入 README / CLAUDE.md
- v1.1 single-file exemption for `docs/ai_engineering_execution_hitl_workflow.md` — **canceled**；该文件被删除，关键内容内化到 `[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md` §0
- v1.1 single-file exemptions for `docs/CONTRIBUTING.md` + `docs/MIGRATION_GUIDE.md` — **canceled**；改名 + 移到 `docs/guide/[GUIDE]_Contributing.md` + `docs/guide/[GUIDE]_Migration_From_v3_to_v4.md` + 加 frontmatter（**CONTRIBUTING 部分在 v1.6 反向回 repo-root** per §1.1 + [`[ADR]_Root_Level_Named_Files_Codification`](../adr/[ADR]_Root_Level_Named_Files_Codification.md)；guide 版本走 archive ceremony 至 `../archive/[DEPRECATED]_[GUIDE]_Contributing_v1.1.md`）
- v1.3 normative clarification on exempt-file frontmatter — **canceled** as a separate clause；本节"External Contract"表已直接表明哪些文件被排除及理由
- `plugins/notebooklm-kit/skills/nlm-shared/*.md` exemption — **removed**（plugin 已在 v4.0.0 退役，行项为残留）
- 决策完整 rationale 见 [`../adr/[ADR]_Documentation_Framework_Exemption_Reversal.md`](../adr/[ADR]_Documentation_Framework_Exemption_Reversal.md)（supersedes [`../archive/[DEPRECATED]_[ADR]_Documentation_Framework_Exemption_Review_v1.0.md`](../archive/[DEPRECATED]_[ADR]_Documentation_Framework_Exemption_Review_v1.0.md)）

The framework's audience is: **AI agents** writing/editing docs (so they have machine-readable schema), **human reviewers** (consistent structure speeds review), and **future maintainers** (state machine + version history clarify what's authoritative).

### §1.1 Root-Level Named Special Files & Individual Responsibilities (v1.6 NEW)

仓库根目录的 5 个 named special files 各承担**固定独立责任**，免 `[TAG]_` prefix 约束。本 §1.1 表与 §1 exclusion 表互为正反两面：§1 表登记**外部规范刚性约束**的 hard exclusions（无 marketplace 8 字段 frontmatter 是技术不可行）；§1.1 表登记**编辑分工 + 责任**，对其中 3 个文件 inherit §1 的 hard 排除（README.md / CHANGELOG.md / CLAUDE.md），另 2 个文件（CONTRIBUTING.md / GLOSSARY.md）由本 §1.1 自身的 **editorial convention** 排除（技术上 CAN 但不 DO，为保持 GitHub UI 集成与阅读纯净度）。

| File | 固定责任 | Source of exclusion | GitHub UI integration |
|------|---------|---------------------|----------------------|
| `README.md` | 项目对外门面：badges、TL;DR、插件目录、quick-start、链路索引 | §1 hard（GitHub render contract） | GitHub repo home page |
| `CONTRIBUTING.md` | 贡献流程：分支策略 / commit 规范 / 版本管理 / PR 流程 / 本地 hook | **§1.1 editorial convention** | GitHub "New Issue / PR" auto-prompt |
| `CHANGELOG.md` | Keep-a-Changelog 发布日志：`[Unreleased]` + 版本号 + Added/Changed/Fixed/Removed | §1 hard（Keep-a-Changelog tooling） | changelog tooling |
| `GLOSSARY.md` | marketplace 术语词典：按字母顺序术语 → 1 句定义 → 可选锚链 | **§1.1 editorial convention** | GitHub Markdown standard render |
| `CLAUDE.md` | AI agent + 维护者上下文摘要：project structure / key conventions / 11-stage table / HITL 触发摘要 | §1 hard（Claude Code runtime — root variant exempt by spec analogy） | Claude Code runtime loads |

**Editorial convention rule (§1.1-derived)**: `CONTRIBUTING.md` 与 `GLOSSARY.md` 不携带 marketplace 8 字段 frontmatter，原因是 GitHub UI 集成（CONTRIBUTING.md auto-prompt 探测）与阅读纯净度（GLOSSARY.md 是辞典型快速参考）与 marketplace 内部 schema 治理脱钩；这两个文件的版本 / 状态信息通过 git history + CHANGELOG entries 追踪，而非 frontmatter 字段。**Plugin-level variants 不在 §1.1 范围内**：`plugins/<name>/CONTRIBUTING.md` 不存在；`plugins/<name>/README.md` / `CHANGELOG.md` / `CLAUDE.md` 继承 §1 hard exclusion。

**Cross-reference**: `CLAUDE.md` 内容更新受 §2.7 Sync Allowlist 约束 + §4.3.1 A6 CI gate 强制；其他 4 个 root files 不受 sync allowlist 约束（各自独立编辑触发条件）。

## §2 Normative Rules

### §2.1 Tag Prefix Taxonomy (6 types)

| Prefix | Purpose | Marketplace Default Path | Plugin-Internal Default Path |
|--------|---------|--------------------------|------------------------------|
| `[STANDARD]` | Meta rules, commit/markdown conventions | `docs/rule/` | `plugins/<name>/docs/rule/` (rare) |
| `[ADR]` | Architecture decision records | `docs/adr/` | `plugins/<name>/docs/adr/` |
| `[GUIDE]` | How-to and onboarding | `docs/guide/` | `plugins/<name>/docs/guide/` |
| `[RUNBOOK]` | Operational procedures (release, recovery) | `docs/runbook/` | `plugins/<name>/docs/runbook/` (rare) |
| `[SPEC]` | Technical specifications (schemas, contracts) | `docs/spec/` | `plugins/<name>/docs/spec/` |
| `[POSTMORTEM]` | Incident reviews | `docs/postmortem/` | (not required at plugin level) |

**v1.0 does NOT include** `[CONTRACT]`, `[EVAL]`, `[ISSUE]`, `[ASSESSMENT]`, `[PROMPT]`, `[SKILL]`, `[LEARNING]`. Rationale:

- `[CONTRACT]` / `[EVAL]` / `[PROMPT]` / `[SKILL]` are agent-runtime-flavored, not applicable to a static plugin registry
- `[ISSUE]` / `[ASSESSMENT]` are reserved for v1.1 if doc count crosses ~25
- `[LEARNING]` is owned by learn-kit's `learning/<topic>/` subsystem (managed by `/learn-kit:scaffold-learning` + `/learn-kit:generate-tier`); not a marketplace docs framework concern

If a future need arises for an additional prefix, propose it via ADR (in `docs/adr/`) bumping this STANDARD to v1.x.

### §2.2 Frontmatter Schema

Every in-scope document **MUST** begin with YAML frontmatter delimited by `---` on lines 1 and N:

**Required 8 fields**:

```yaml
---
type: standard | adr | guide | runbook | spec | postmortem
scope: marketplace | learn-kit                 # the owning surface
summary: <20-80 chars, one-line machine-readable purpose>
owner: <user handle or team>
created: <YYYY-MM-DD>
updated: <YYYY-MM-DD>
state: active | deprecated | archived
version: v1.0 | v1.1 | ...
---
```

**Optional fields**:

| Field | When to use | Example |
|-------|-------------|---------|
| `domain` | further classification | `governance` / `release` / `plugin-dev` / `plugin-internal` / `infra` |
| `tags` | discovery keywords | `- documentation`, `- framework` |
| `related` | cross-reference other docs | relative paths or wikilinks |
| `supersedes` | replacing an archived version | `- archive/rule/[DEPRECATED]_*_v0.X.md` |
| `last-verified` | **RUNBOOK only** — date of last manual verification of the procedure | `YYYY-MM-DD` |

**Syntax constraints** (per `[STANDARD]_GitHub_Markdown.md` §13):

- All keys **lowercase**
- All enum values **lowercase**
- Dates **ISO-8601** (`YYYY-MM-DD`)
- Lists use block style (`- item` on new line), not flow style (`[a, b]`)
- 2-space indent for nested keys; tabs forbidden

### §2.3 State Machine (3 states)

```
active → deprecated → archived
```

Transitions:

| From → To | Trigger |
|-----------|---------|
| (new doc) → `active` | merged via PR (docs enter as authoritative; `draft` state is omitted because PR review filters incomplete drafts) |
| `active` → `deprecated` | a replacement doc lands; this doc still readable but no longer authoritative |
| `deprecated` → `archived` | doc moved to `docs/archive/[DEPRECATED]_<TAG>_<Topic>_v<X.Y>.md` (flat — no subtype subdir per §2.3.5); state immutable afterward |

**Rules**:

- A `deprecated` doc **MUST** include a `> [!WARNING] Deprecated by [...]` banner at the body top pointing to the successor (see §2.3.3 for canonical template)
- An `archived` doc **MUST NOT** be modified except for typo corrections — content is frozen at archive time
- `frontmatter.updated:` is bumped on each state transition
- The full archive ceremony procedure is operationalized in [`../runbook/[RUNBOOK]_Doc_Archive_Procedure.md`](../runbook/[RUNBOOK]_Doc_Archive_Procedure.md) v1.0 — follow that 4-phase workflow for every actual archive transition. §2.3.1-§2.3.4 below define the rules; the RUNBOOK defines the procedure.

### §2.3.1 Archive Triggers (v1.2 NEW)

Move a `deprecated` doc to `archived` (physical relocation under `docs/archive/`) when **one or more** of these triggers fire:

| # | Trigger | Example |
|---|---------|---------|
| 1 | **Framework major version bump** (vN.x → v(N+1).x) | `Documentation_Framework` v1.x → v2.0 → archive all v1.x predecessors |
| 2 | **STANDARD structural rewrite** (≥50% chapter restructure / template change / scope redefinition) | `Commit_Message_Convention` chapters reorganized from 10 → 5 → archive old |
| 3 | **≥70% content replacement** (substantial rewrite that diverges from original by more than two-thirds) | Same doc, but the content is functionally a new artifact |
| 4 | **Split / merge / rename** (1 doc → N docs; N → 1; or scope-redefining rename) | `[GUIDE]_X` split into `[GUIDE]_X_A` + `[GUIDE]_X_B` → archive `[GUIDE]_X` |

**Non-trigger**:

- **Drop-suffix rename** (legacy `_v1.0.md` filename → stable filename + `version: v1.0` in frontmatter) is path-stability cleanup per §2.4, NOT an archive event. The doc stays `active`.
- **Minor / patch version bumps** of the same doc (v1.0 → v1.1 → v1.2) keep the file at its stable path; frontmatter `version:` advances; no archive transition.

**Note**: Marketplace's 4-trigger set is intentionally domain-agnostic — these criteria apply equally to any structured documentation system regardless of project domain.

### §2.3.2 Frontmatter on Archive Transition (v1.2 NEW)

When a doc moves to `state: archived` (physical relocation to `docs/archive/` — flat layout, no subtype subdir per §2.3.5; file type encoded by `[TAG]_` prefix), the following frontmatter changes happen **in the same commit as the `git mv`**:

```yaml
# Before (active doc, on its way to archive)
state: active
version: v1.0
# ...

# After (archived version of the same doc, now at docs/archive/[DEPRECATED]_<name>_v1.0.md)
state: archived
version: v1.0
archived: 2026-05-15                        # NEW: ISO date archive move executed
replaced-by: ../rule/[STANDARD]_New.md      # NEW: relative path (1 level shallower under flat layout)
```

**New `archived:` field**:
- **Type**: ISO-8601 date (YYYY-MM-DD)
- **Mandatory** on all `state: archived` files
- **Frozen**: never bumped after archive; reflects the move date

**New `replaced-by:` field**:
- **Type**: relative path string (from archived file's location)
- **Mandatory** when an active successor exists (almost always)
- **Bidirectional pair**: the active successor's `supersedes:` list (see §2.2 optional fields) MUST point back to this archived file. The two fields together encode the chain `archived ←→ active`.

**`supersedes:` semantics** (already in §2.2 optional fields; clarified here):
- **Type**: list of relative path strings (supports N-to-1 merges where one new doc replaces multiple archived predecessors)
- **Lives in**: the **active successor's** frontmatter
- **Example for a v2.0 that replaces v1.0 + a separate split-off doc**:
  ```yaml
  supersedes:
    - ../archive/[DEPRECATED]_[STANDARD]_X_v1.0.md
    - ../archive/[DEPRECATED]_[STANDARD]_Y_v1.0.md
  ```

### §2.3.3 Archive Banner Template (v1.2 NEW)

Every archived doc **MUST** carry an Archive Banner immediately after the H1 heading (and before the rest of the body). The canonical template:

```markdown
# [<TAG>] <Original Title>

> **Archived**: This doc is `state: archived` (frozen at v<X.Y>). Superseded by [<new doc title>](<relative path to successor>) (v<new version>).
> **Archive reason**: <one-line reason; e.g., "Framework major version bump v1.x → v2.0">.
> **Archived on**: <YYYY-MM-DD>. Content frozen — do not modify except for typo corrections.

<rest of original body unchanged>
```

**Rules**:
- Banner uses GitHub-native blockquote (NOT `> [!CAUTION]` etc.) — keep banner format consistent across all archived docs for AI agent pattern matching
- Banner is the **first** body element after H1; nothing precedes it
- Relative path in `Superseded by [...](path)` is computed from the archive location (1 level up to `docs/` root, then descend into successor subdir; e.g., `../rule/[STANDARD]_New.md`)
- The active successor's `state: deprecated` precursor banner (if any) is replaced by this Archive Banner at the time of the move

### §2.3.4 Living vs Frozen Reference Judgment (v1.2 NEW)

When archiving a doc, references to it from OTHER docs need judgment per reference. Each reference falls into one of two categories:

**Living reference** — cites the **current state** of a concept:
- Example: "Per `[STANDARD]_Documentation_Framework` §2.3, archive transitions are…"
- **Action on archive**: auto-upgrade the reference to point to the **active successor** (or omit the version qualifier so the link tracks `active`)

**Frozen reference** — cites a **historical fact** or **past rule**:
- Example: "In v1.0 the framework had no archive concept (see `[DEPRECATED]_[STANDARD]_Documentation_Framework_v1.0`)"
- **Action on archive**: preserve the reference but update the path to the archive location (`../archive/[DEPRECATED]_*_v1.0.md`)

**Decision procedure** (per reference):

1. Read the sentence containing the reference
2. Does it cite a state-of-affairs that may evolve? → **Living** (upgrade to successor)
3. Does it cite a specific event / version / past decision? → **Frozen** (preserve archive path)
4. Ambiguous? → Default to **Living** + add a parenthetical pointer to the archive for full historical context

The procedural execution of this judgment is in [`../runbook/[RUNBOOK]_Doc_Archive_Procedure.md`](../runbook/[RUNBOOK]_Doc_Archive_Procedure.md) Phase 3. The RUNBOOK escalates to HITL (Gate D-02) when >3 references need judgment in a single archive ceremony.

### §2.3.5 Flat Archive Layout (v1.4 NEW)

归档区采用 **flat layout**，marketplace 顶层与 plugin 内部同规则:

- **Marketplace**: `docs/archive/[DEPRECATED]_<TAG>_<Topic>_vX.Y.md`
- **Plugin-internal**: `plugins/<plugin>/docs/archive/[DEPRECATED]_<TAG>_<Topic>_vX.Y.md`

不分 subtype 子目录；文件类型由文件名 `[TAG]_` prefix（per §2.4）唯一编码。

**Rationale**:

- **Marketplace 规模**：单插件仓 + 慢速文档增长 → 卡迪那 <10，subtype subdir 是过早抽象
- **`[TAG]` 强制约束**：文件名已是 type discriminator，subdir 冗余
- **对称性**：marketplace top-level 与 plugin-internal 一套规则，降低学习成本
- **路径简化**：`replaced-by:` / `supersedes:` 相对路径少一层 `..`，更易写易读

**Historical note**: v1.2–v1.3 一度规定 archive 区镜像 active 6 个 subtype subdir（`docs/archive/{adr,guide,postmortem,rule,runbook,spec}/`）。v1.4 改 flat。归档机制自 v4.4.0 引入后**从未有任何文档实际归档**（mechanism dormant），无 migration 成本；6 个空 placeholder subdir 在 v1.4 配套 PR 中删除。

### §2.4 Filename & Path Stability

Filename format: `[TAG]_<TitleCase_Topic>.md`

- `[TAG]` is one of the 6 prefixes (uppercase, square brackets)
- `_` separates prefix from topic
- `<Topic>` uses `TitleCase` with underscores
- **No `_vX.Y` suffix** on `active` or `deprecated` files — version lives in `frontmatter.version`
- **Only `archived` files** carry `_vX.Y` in filename: `docs/archive/[DEPRECATED]_<TAG>_<Topic>_vX.Y.md` (flat — no subtype subdir per §2.3.5; file type encoded by `[TAG]_` prefix)
  - Full pattern: `[DEPRECATED]_` prefix (uppercase, literal) + original `[TAG]_<Topic>` + `_v<major>.<minor>` suffix + `.md`
  - Example: `docs/archive/[DEPRECATED]_[STANDARD]_Documentation_Framework_v1.3.md` (hypothetical archive of current v1.3 once v2.0 lands)
  - Patch version is dropped (only major.minor recorded in archive filename to avoid filename churn for trivial bumps)

**Why path stability matters**: cross-document references (wikilinks, INDEX entries, code comments) point to filenames. A `v1` → `v2` rewrite that renames the file would break every reference; instead, the file path stays stable across minor/patch versions and the version number lives in frontmatter.

### §2.5 INDEX Sync

Every new tag-prefixed doc **MUST** appear in:

- `docs/INDEX.md` under its type section
- (for plugin-internal docs in v4.3.0+) `plugins/<name>/docs/INDEX.md`

The marketplace-level `docs/INDEX.md` does NOT mirror every plugin-internal doc — it links to each plugin's `docs/INDEX.md` in a "Plugin Documentation" section. This avoids drift between marketplace and plugin doc lists.

### §2.6 Cross-Reference Style

Within markdown body, use **relative paths** for stability:

```markdown
See [Commit Convention](./[STANDARD]_Commit_Message_Convention.md)
See [HITL Standard §4.1](./[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md#§41-intake-prompt)
```

In SKILL.md (which is exempt from this framework), wikilinks `[[../../../docs/...]]` are acceptable. In docs/, prefer relative paths because GitHub renders them as live links (wikilinks render as literal `[[text]]` on GitHub).

### §2.7 CLAUDE.md Sync Allowlist (v1.6 NEW)

`CLAUDE.md`（repo root）承载 AI agent + 人类维护者「快速上下文」职责（per §1.1）。为防止其内容与权威源漂移，定义 3 类**强同步触发**：PR 触及以下任一文件 / 目录条目时，`CLAUDE.md` **必须**在同一 PR 同步更新（如无实质变化面，PR description 标注 `[skip a6]` 跳过 token + reviewer 在 review 显式 sign-off "A6 N/A confirmed"）。

**Category 1 — Global Standards** (`docs/rule/[STANDARD]_*.md`)：

- `[STANDARD]_Documentation_Framework.md` — 版本变更或 §1.1 / §2.7 / §4.3 内容变更必同步 CLAUDE.md「Documentation Framework」段
- `[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md` — 11-stage 表 / HITL 触发规则变更必同步「11 阶段速查表」+「HITL 触发摘要」两段
- `[STANDARD]_Commit_Message_Convention.md` — scope 白名单 / type 集变更必同步「Commit format」+「Branch types」两行
- `[STANDARD]_GitHub_Markdown.md` — markdown 规范变更必同步（极罕见；本 STANDARD 稳定）

**Category 2 — Runtime Info**：

- `VERSION` 文件变更（marketplace 版本号）必同步 CLAUDE.md「历史版本记录」段尾追加新行
- `.claude-plugin/marketplace.json` `plugins[]` 数组结构变更（add/remove plugin）必同步「Project Structure」+「v4.0.0 Restructure Note」类历史段
- `plugins/<name>/.claude-plugin/plugin.json` major/minor version bump 必同步 plugin 描述行

**Category 3 — Directory Entries**：

- `.claude/skills/mp-*/` 新增 / 删除 / 重命名 skill 必同步「Project-Local Skills」表
- `plugins/<name>/skills/<name>/` 新增 / 删除 / 重命名 必同步 plugin 描述段
- `docs/` 子目录结构变更（add/remove subtype subdir）必同步「文档目录子结构」code block

**非触发 clause**: 上述文件的 **typo 修复 / 注释级 / 内容澄清 / 排版调整 / 单 line 文本微调** 不视作 sync 触发；只有**结构 / 规则 / 版本 / 条目**变更触发。Skill 内部实现细节变更（不动 SKILL.md frontmatter）也不触发。CHANGELOG 累加 / `[Unreleased]` 维护属高频日常操作，从不触发 sync。

**A6 gate enforcement**: 见 §4.3.1。

## §3 Examples

### §3.1 Compliant ADR

```markdown
---
type: adr
scope: marketplace
summary: Adopt 6 tag prefixes for marketplace doc framework v1.0
owner: marketplace-maintainers
created: 2026-05-15
updated: 2026-05-15
state: active
version: v1.0
domain: governance
related:
  - ./[STANDARD]_Documentation_Framework.md
---

# [ADR] Adopt 6 Tag Prefixes for Marketplace Doc Framework

## Context
...
## Decision
...
## Consequences
### Positive
### Negative
### Risks
## Alternatives Considered
## References
```

### §3.2 Non-Compliant Examples (with reason)

```markdown
---
type: ADR              # ❌ MUST be lowercase
scope: Marketplace     # ❌ MUST be lowercase
created: 05/15/2026    # ❌ MUST be ISO-8601 (2026-05-15)
state: draft           # ❌ draft is not a valid state in v1.0
tags: [docs, framework]  # ❌ MUST be block-style list
---
```

```text
docs/[ADR]_Learnkit_Discovery_Skills_v1.0.md   # ❌ no _vX.Y in active filename
docs/adr/Learnkit_Discovery_Skills.md          # ❌ missing [ADR] prefix
docs/[adr]_LearnKit_Discovery_Skills.md        # ❌ tag MUST be uppercase
```

## §4 Verification

### §4.1 Manual Checklist (every PR that touches `docs/**/*.md`)

- [ ] Frontmatter present on every tag-prefixed doc
- [ ] All 8 required fields filled
- [ ] `type:` enum matches the file's `[TAG]` prefix
- [ ] `state:` is one of `active | deprecated | archived`
- [ ] Dates ISO-8601
- [ ] File lives in the correct subdirectory per §2.1
- [ ] Filename has no `_vX.Y` suffix (unless archived)
- [ ] `docs/INDEX.md` updated to include the new doc
- [ ] `related:` paths resolve to existing files
- [ ] (for RUNBOOK) `last-verified:` field present and within 90 days

### §4.2 Skill-Backed Verification

Run `/mp-doc-validate` (per [`[STANDARD]_AI_Engineering_Execution_HITL_Prompt`](./[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md) §4.8 Stage 7 self-review) to audit `docs/**/*.md` for compliance issues. The skill outputs Critical / Warning / Verified categorization; Critical issues block commit.

### §4.3 Future CI Gates (v1.1+)

v1.0 relies on manual + skill-based verification. Future versions may introduce CI gates covering the following 6 dimensions:

| Gate | Check |
|------|-------|
| A1 | Path & filename legal |
| A2 | Frontmatter schema complete |
| A3 | `state` & enum fields legal |
| A4 | Internal wikilinks resolve |
| A5 | `INDEX.md` sync |
| A6 | `CLAUDE.md` allowlist sync **(active v1.6+; see §4.3.1)** |

A6 启用于 v1.6（详见 §4.3.1）；A1-A5 仍 deferred until doc count + reviewer burden justify the CI cost.

### §4.3.1 A6 — `CLAUDE.md` Allowlist Sync (active gate, v1.6+)

实现于 `.github/workflows/ci.yml` `validate` job 新增 step "Validate CLAUDE.md sync allowlist (A6)"。三层 defense-in-depth：PR template 自检 (soft) → `/mp-doc-validate` Step 3.5 Warning (pre-commit reminder) → CI A6 step (authoritative blocker)。

**算法**:

1. 计算 PR diff 文件清单（`git diff --name-only $BASE..$HEAD`，PR context；push 事件 fallback `origin/develop..HEAD`）
2. 与 §2.7 三类 trigger 路径模式逐一匹配 → 输出命中清单 `TRIGGERED[]`
3. 若 `TRIGGERED[] 非空` 且 `CLAUDE.md ∉ diff` → exit 1，输出 reviewer-friendly 错误消息（含命中文件清单 + §2.7 / §4.3.1 引用 + 修复建议两选）
4. 若 `TRIGGERED[] 非空` 且 `CLAUDE.md ∈ diff` → 通过（CLAUDE.md 变更内容是否真实反映 trigger 由 reviewer + `/mp-doc-validate` Step 3.5 双重审视）
5. 若 `TRIGGERED[]` 空 → 通过（无 trigger 即无需 sync）

**Bypass mechanism**: PR title 含 `[skip a6]` 字符串字面量 + reviewer 在 PR review 显式 sign-off `A6 N/A confirmed` → CI 跳过本 step（保留其他 step 不变）。极罕见正当情境（如 trigger 命中但 CLAUDE.md 真无实质变化面）使用。Reviewer sign-off 要求结构化 comment（非自由文本），便于 audit。

**`/mp-doc-validate` advisory pair**: skill 在本地工作区做相同检测（`git status --porcelain` + 同 regex），但输出 **Warning** 而非 Critical；起 pre-commit reminder 作用。CI 是 authoritative blocker；两层职责分明。

**Future Work** (v1.7+ candidate): A6 与 `/mp-doc-validate` Step 3.5 算法对齐（skill 改用 diff-based 检测匹配 CI）；A1 / A5 启用 (path 合法性 + INDEX sync auto-detect)。

## §5 Change History

| Version | Date | Summary |
|---------|------|---------|
| v1.6 | 2026-05-18 | **Root-level named files codification + CLAUDE.md sync allowlist + A6 CI gate activation**. (1) §1.1 NEW — 5-row table 编码 README/CONTRIBUTING/CHANGELOG/GLOSSARY/CLAUDE.md 各自固定责任 + Source of exclusion 列区分 §1 hard 与 §1.1 editorial convention；(2) §1.1 自身的 editorial-convention 排除规则 for `CONTRIBUTING.md` + `GLOSSARY.md`（技术可携带 frontmatter 但不携带，为保 GitHub UI 集成 + 阅读纯净度）；(3) §2.7 NEW — CLAUDE.md sync allowlist 3 类 trigger（global standards `docs/rule/[STANDARD]_*.md` / runtime info `VERSION` + `marketplace.json` + plugin.json major/minor / directory entries `.claude/skills/mp-*/` + plugin skill 目录 + docs/ 子目录结构）+ 非触发 clause（typo / 排版 / CHANGELOG 累加不触发）；(4) §4.3.1 NEW — A6 CI gate 从 v1.5 placeholder 提升为 active 阻断检查（`.github/workflows/ci.yml` validate job 新增 step + `[skip a6]` bypass token + `/mp-doc-validate` Step 3.5 Warning pair）；(5) §4.3 表 A6 行 "deferred → active (v1.6+)" 标注，A1-A5 保持 deferred；§1 本身**保持 v1.5 原样不动**。**配套**: bump `[ADR]_Documentation_Framework_Exemption_Reversal` v1.0 → v1.1（Decision 2 CONTRIBUTING.md row 标注 partially reversed in v4.6.3）；新建 `[ADR]_Root_Level_Named_Files_Codification.md` v1.0；archive `[GUIDE]_Contributing.md` v1.1 → `docs/archive/[DEPRECATED]_[GUIDE]_Contributing_v1.1.md`（§2.3.1 trigger #4 split-merge-rename；走 RUNBOOK Phase 1-4 ceremony + Gate D-02 fires ~13 living refs）；新建 root `CONTRIBUTING.md` + root `GLOSSARY.md`；cross-reference 升级 ~13 文件 living refs；CLAUDE.md / INDEX.md / 1 PR template / 1 ISSUE_TEMPLATE config / mp-doc-validate SKILL.md / RUNBOOK last-verified 同步。**Non-trigger 自身归档**: framework 文件仅新增 §1.1 / §2.7 / §4.3.1 + 改 §5；其他章节不动；不达 §2.3.1 trigger 阈值；v1.5 文件留原路径推进 v1.6。marketplace VERSION 4.6.3（develop pre-bumped per [`[ADR]_Develop_PreBump_Adoption`](../adr/[ADR]_Develop_PreBump_Adoption.md)）。learn-kit 1.2.1 不动。Adopted in PR (v4.6.3). |
| v1.5 | 2026-05-18 | **§1 Exemption Mechanism Cancellation**. §1 完全重写：(1) 取消 v1.1 「plugin-internal teaching series」pattern exemption（learn-kit 6 份教学系列必须迁 `plugins/learn-kit/docs/guide/[GUIDE]_*.md`）；(2) 取消 4 项 v1.1 single-file exemption（`ai_engineering_execution_hitl_workflow.md` 删除 + 内容内化 HITL §0；`CONTRIBUTING.md` + `MIGRATION_GUIDE.md` rename 到 `docs/guide/[GUIDE]_*.md`；`INDEX.md` 保留名但强制 frontmatter）；(3) 取消 v1.3 「exempt-file frontmatter discipline」normative blockquote（unified into exclusion table）；(4) 删除已退役 `notebooklm-kit/nlm-shared` 残余行；(5) §1 新结构：保留只读 5 类 community/external-spec exclusion（README/CHANGELOG/CLAUDE.md/SKILL.md/templates+references）由外部规范刚性约束不可绕过 + INDEX.md special clause。(6) 其余 §2-§4 结构稳定；§2.1 / §2.3.1 / §4.3 / §5 v1.0 历史条目清理所有 cross-project 引用，统一改为中性术语（marketplace 独立性原则）。**Trigger 自身归档**：本次符合 §2.3.1 trigger #4 (split-merge-rename) — §1 规则集语义重定义。配套新建 `[ADR]_Documentation_Framework_Exemption_Reversal.md` + archive 旧 `[ADR]_Documentation_Framework_Exemption_Review.md` v1.0 走 RUNBOOK ceremony；HITL STANDARD v1.3 → v1.4 同 PR；learn-kit 1.1.0 → 1.2.0；marketplace VERSION 4.4.11 → 4.5.0。Adopted in PR-B (v4.5.0). |
| v1.4 | 2026-05-17 | **Flat archive layout amendment**. §2.3 子规则系列更新：state table（§2.3）/ §2.3.2 archive-path 描述 + YAML example / §2.3.3 banner relative-path 注释 / §2.3.4 frozen-ref 示例 / §2.4 archive filename 规则示例——全部从 `docs/archive/<subtype>/` 改为 `docs/archive/`（flat）；新增 §2.3.5 Flat Archive Layout 段定义新规则 + marketplace 与 plugin-internal 双层对称 + rationale。**Non-trigger 自身归档**：本次只改 §2.3 子规则文本，§2.3 / §2.4 章节结构不动；不达 §2.3.1 trigger #2（≥50% 结构重写）/ #3（≥70% 内容替换）阈值；v1.3 文件留原路径推进 v1.4。配套 RUNBOOK v1.0 → v1.1 同步 + mp-doc-validate SKILL.md 描述同步 + 删 6 个空 placeholder subdir。Adopted in PR-A (v4.X.Y). |
| v1.3 | 2026-05-15 | **§1 exempt-file frontmatter discipline**: add normative clause (insert after §1 v1.1 note) requiring exempt files to either omit frontmatter entirely OR use the canonical 8-field schema. Legacy non-canonical keys (`title / purpose / audience`) and YAML literal-block-scalar list fields (`related: \|` followed by bullet text) are forbidden. `/mp-doc-validate` SHOULD emit Warning (not Critical) on detection of forbidden keys on exempt files (new Step 2.7 — §1 exempt-file discipline). Both §1 exemptions remain (single file `ai_engineering_execution_hitl_workflow.md` + plugin-internal teaching series pattern); decision rationale recorded in [`../adr/[ADR]_Documentation_Framework_Exemption_Review.md`](../adr/[ADR]_Documentation_Framework_Exemption_Review.md). Backward compatible: no existing path or schema change required for any file other than the 2 outliers `ai_engineering_execution_hitl_workflow.md` + `learn-kit-使用手册.md` (legacy frontmatter dropped; paired with this PR). README.md / CHANGELOG.md / CLAUDE.md / SKILL.md remain out of scope (separate external contracts). Adopted in PR #XX (v4.X.Y). |
| v1.2 | 2026-05-15 | **Archive mechanism codification**: expand §2.3 State Machine with 4 new subsections — §2.3.1 Archive Triggers (4 conditions: major bump / structural rewrite / ≥70% content replacement / split-merge-rename); §2.3.2 Frontmatter on Archive Transition (new `archived:` date + `replaced-by:` pointer fields, bidirectional with `supersedes:` on active successor); §2.3.3 Archive Banner Template (canonical blockquote format at top of archived body); §2.3.4 Living vs Frozen Reference Judgment (procedural rule for cross-doc refs during archive ceremony). Also clarify §2.4 archived filename pattern (`[DEPRECATED]_<TAG>_<Topic>_v<major>.<minor>.md`; patch dropped). Backward compatible: no existing doc paths or frontmatter changes required — these are rules for **future** archive events. Operationalized in `docs/runbook/[RUNBOOK]_Doc_Archive_Procedure.md` v1.0 (new). Adopted in PR #83 (v4.4.0). |
| v1.1 | 2026-05-15 | **§1 exemption codification**: formalize «plugin-internal teaching series» (e.g., `plugins/learn-kit/docs/learn-kit-NN-*.md` numbered series) as an explicit §1 exemption category. Pre-v1.1 the 6 lowercase learn-kit teaching docs were "informally exempt" per `plugins/learn-kit/docs/INDEX.md` §Plugin-Internal Teaching Series; v1.1 promotes this to canonical framework rule with 3-point pattern criteria (root-level under `plugins/<name>/docs/`, filename prefixed with plugin name, content is human-pedagogical). Backward compatible: no existing doc paths or frontmatter required to change. Adopted in PR #80 (v4.3.3). |
| v1.0 | 2026-05-15 | Initial framework: 6 tag prefixes + 8-field frontmatter + 3-state machine + path stability + INDEX sync. Adopted in PR #75 (v4.2.0). Simplified design tailored to a static plugin registry (no track multiplexing, no agent-runtime types, no CI gate enforcement in v1.0). |
