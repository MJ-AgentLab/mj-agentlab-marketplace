---
type: standard
scope: marketplace
summary: Documentation framework v1.3 — tag prefixes, frontmatter, state machine, paths, INDEX sync, exemption frontmatter discipline, archive mechanism
owner: marketplace-maintainers
created: 2026-05-15
updated: 2026-05-15
state: active
version: v1.3
domain: governance
tags:
  - documentation
  - framework
  - meta
  - archive
related:
  - ./[STANDARD]_GitHub_Markdown.md
  - ./[STANDARD]_Commit_Message_Convention.md
  - ./[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md
  - ../runbook/[RUNBOOK]_Doc_Archive_Procedure.md
---

# [STANDARD] Documentation Framework

## §1 Scope & Applicability

This STANDARD governs every markdown document under:

- `docs/**/*.md` (marketplace-level documentation)
- `plugins/<name>/docs/**/*.md` (plugin-internal documentation, post-PR 4 extension)

**Out of scope** (exempt from this framework):

| Path | Reason |
|------|--------|
| `docs/INDEX.md` | navigation hub, not a tag-prefixed artifact |
| `docs/CONTRIBUTING.md` | contributor guide, owned by the repo root |
| `docs/MIGRATION_GUIDE.md` | release-cycle artifact, separate lifecycle |
| `docs/ai_engineering_execution_hitl_workflow.md` | generic HITL philosophy doc (parent to specialized marketplace variant) |
| `README.md` (any depth) | public-facing entry point |
| `CHANGELOG.md` (any depth) | Keep-a-Changelog format |
| `plugins/<name>/CLAUDE.md` | plugin Claude Code spec contract |
| `plugins/<name>/skills/<name>/SKILL.md` | **explicitly excluded** — uses Claude Code plugin spec native frontmatter (`name`, `description`, optional `allowed-tools`, `disable-model-invocation`); applying marketplace 8-field frontmatter would break the loader contract |
| `plugins/<name>/skills/<name>/templates/*.md` | LLM-facing runtime assets |
| `plugins/<name>/skills/<name>/references/*.md` | LLM-facing runtime assets |
| `plugins/notebooklm-kit/skills/nlm-shared/*.md` (retired) / similar shared bags | LLM-facing runtime assets, addressed by skill relative paths |
| `plugins/<name>/docs/<plugin>-NN-*.md` and `plugins/<name>/docs/<plugin>-*.md` plugin-internal teaching series | **v1.1 new**: plugin-internal pedagogical content where a numbered prefix (`-01-` / `-02-` / …) or named series serves as the **pedagogical ordering signal**. Tag-prefixing would obscure that ordering. Files function similarly to README / CHANGELOG (plugin-public-facing content), not as architectural / decision artifacts. Examples: `plugins/learn-kit/docs/learn-kit-01-positioning.md` ... `learn-kit-05-governance-boundary.md` + `learn-kit-使用手册.md`. **Pattern criteria** (must satisfy ALL): (1) lives at `plugins/<name>/docs/` root (not in `adr/` / `guide/` / `spec/` / `runbook/` subdirs); (2) filename starts with the plugin's own name as prefix (`<plugin>-`); (3) content is human-pedagogical (tutorial / 5-min onboarding / worked example) rather than normative rule / decision record / runbook procedure |

The framework's audience is: **AI agents** writing/editing docs (so they have machine-readable schema), **human reviewers** (consistent structure speeds review), and **future maintainers** (state machine + version history clarify what's authoritative).

> **v1.1 note on exemption design**: An exempt file is *informally tracked* — it appears in its plugin's `docs/INDEX.md` under a dedicated «Plugin-Internal Teaching Series» section (or equivalent) so AI agents and humans can discover it, but `/mp-doc-validate` skips frontmatter and path-prefix checks against it. The exemption is intentional, not lax: plugins SHOULD use it sparingly and only when numbered sequencing carries pedagogical meaning. When a plugin needs decision records, runbooks, or normative rules, those MUST use the tag-prefixed framework in `adr/` / `guide/` / `runbook/` / `rule/` subdirs.

> **v1.3 normative clarification on exempt-file frontmatter**: Files matching a §1 exemption MAY (a) omit frontmatter entirely OR (b) carry the canonical 8-field frontmatter (per §2.2) as if non-exempt. They MUST NOT use legacy non-canonical keys such as `title`, `purpose`, `audience`, or YAML literal-block-scalar list fields (`related: |` followed by bullet text). `/mp-doc-validate` continues to skip required-field and path-prefix checks against exempt files, but SHOULD emit a **Warning** (not Critical) when it detects forbidden legacy keys on an exempt file. README.md / CHANGELOG.md / CLAUDE.md / SKILL.md retain their domain-specific formats and are out of scope for this clarification (each has a separate external contract: README is a public-facing entry point with no formal frontmatter convention, CHANGELOG follows Keep-a-Changelog with no frontmatter, CLAUDE.md is the Claude Code spec contract, and SKILL.md uses the plugin loader's native frontmatter — `name` / `description` / optional `allowed-tools` / `disable-model-invocation`). See [`../adr/[ADR]_Documentation_Framework_Exemption_Review.md`](../adr/[ADR]_Documentation_Framework_Exemption_Review.md) for the rationale on why both §1 exemptions remain in v1.3 rather than being revoked.

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

- `[CONTRACT]` / `[EVAL]` / `[PROMPT]` / `[SKILL]` are mj-agent runtime-flavored, not applicable to a static plugin registry
- `[ISSUE]` / `[ASSESSMENT]` are reserved for v1.1 if doc count crosses ~25
- `[LEARNING]` is owned by learn-kit's `learning/<topic>/` subsystem (managed by `/learn-kit:init` + `/learn-kit:generate-tier`); not a marketplace docs framework concern

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
| `deprecated` → `archived` | doc moved to `docs/archive/<subtype>/[DEPRECATED]_<TAG>_<Topic>_v<X.Y>.md`; state immutable afterward |

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

**Adapted from**: mj-agent ADR-017 (Archive Trigger Quantification). Marketplace's 4-trigger set matches mj-agent's verbatim — these criteria are domain-agnostic.

### §2.3.2 Frontmatter on Archive Transition (v1.2 NEW)

When a doc moves to `state: archived` (physical relocation to `docs/archive/<subtype>/`), the following frontmatter changes happen **in the same commit as the `git mv`**:

```yaml
# Before (active doc, on its way to archive)
state: active
version: v1.0
# ...

# After (archived version of the same doc, now at docs/archive/<subtype>/[DEPRECATED]_<name>_v1.0.md)
state: archived
version: v1.0
archived: 2026-05-15                        # NEW: ISO date archive move executed
replaced-by: ../../rule/[STANDARD]_New.md   # NEW: relative path to active successor
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
    - ../archive/rule/[DEPRECATED]_[STANDARD]_X_v1.0.md
    - ../archive/rule/[DEPRECATED]_[STANDARD]_Y_v1.0.md
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
- Relative path in `Superseded by [...](path)` is computed from the archive location (typically 2 levels up to `docs/` root, then descend into successor subdir)
- The active successor's `state: deprecated` precursor banner (if any) is replaced by this Archive Banner at the time of the move

### §2.3.4 Living vs Frozen Reference Judgment (v1.2 NEW)

When archiving a doc, references to it from OTHER docs need judgment per reference. Each reference falls into one of two categories:

**Living reference** — cites the **current state** of a concept:
- Example: "Per `[STANDARD]_Documentation_Framework` §2.3, archive transitions are…"
- **Action on archive**: auto-upgrade the reference to point to the **active successor** (or omit the version qualifier so the link tracks `active`)

**Frozen reference** — cites a **historical fact** or **past rule**:
- Example: "In v1.0 the framework had no archive concept (see `[DEPRECATED]_[STANDARD]_Documentation_Framework_v1.0`)"
- **Action on archive**: preserve the reference but update the path to the archive location (`../archive/rule/[DEPRECATED]_*_v1.0.md`)

**Decision procedure** (per reference):

1. Read the sentence containing the reference
2. Does it cite a state-of-affairs that may evolve? → **Living** (upgrade to successor)
3. Does it cite a specific event / version / past decision? → **Frozen** (preserve archive path)
4. Ambiguous? → Default to **Living** + add a parenthetical pointer to the archive for full historical context

The procedural execution of this judgment is in [`../runbook/[RUNBOOK]_Doc_Archive_Procedure.md`](../runbook/[RUNBOOK]_Doc_Archive_Procedure.md) Phase 3. The RUNBOOK escalates to HITL (Gate D-02) when >3 references need judgment in a single archive ceremony.

### §2.4 Filename & Path Stability

Filename format: `[TAG]_<TitleCase_Topic>.md`

- `[TAG]` is one of the 6 prefixes (uppercase, square brackets)
- `_` separates prefix from topic
- `<Topic>` uses `TitleCase` with underscores
- **No `_vX.Y` suffix** on `active` or `deprecated` files — version lives in `frontmatter.version`
- **Only `archived` files** carry `_vX.Y` in filename: `docs/archive/<subtype>/[DEPRECATED]_<TAG>_<Topic>_vX.Y.md`
  - Full pattern: `[DEPRECATED]_` prefix (uppercase, literal) + original `[TAG]_<Topic>` + `_v<major>.<minor>` suffix + `.md`
  - Example: `docs/archive/rule/[DEPRECATED]_[STANDARD]_Documentation_Framework_v1.2.md` (hypothetical archive of current v1.2 once v2.0 lands)
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

v1.0 relies on manual + skill-based verification. v1.1+ may introduce CI gates equivalent to mj-agent A1-A6:

| Gate | Check |
|------|-------|
| A1 | Path & filename legal |
| A2 | Frontmatter schema complete |
| A3 | `state` & enum fields legal |
| A4 | Internal wikilinks resolve |
| A5 | `INDEX.md` sync |
| A6 | `CLAUDE.md` allowlist sync |

These gates are deferred until doc count + reviewer burden justify the CI cost.

## §5 Change History

| Version | Date | Summary |
|---------|------|---------|
| v1.3 | 2026-05-15 | **§1 exempt-file frontmatter discipline**: add normative clause (insert after §1 v1.1 note) requiring exempt files to either omit frontmatter entirely OR use the canonical 8-field schema. Legacy non-canonical keys (`title / purpose / audience`) and YAML literal-block-scalar list fields (`related: \|` followed by bullet text) are forbidden. `/mp-doc-validate` SHOULD emit Warning (not Critical) on detection of forbidden keys on exempt files (new Step 2.7 — §1 exempt-file discipline). Both §1 exemptions remain (single file `ai_engineering_execution_hitl_workflow.md` + plugin-internal teaching series pattern); decision rationale recorded in [`../adr/[ADR]_Documentation_Framework_Exemption_Review.md`](../adr/[ADR]_Documentation_Framework_Exemption_Review.md). Backward compatible: no existing path or schema change required for any file other than the 2 outliers `ai_engineering_execution_hitl_workflow.md` + `learn-kit-使用手册.md` (legacy frontmatter dropped; paired with this PR). README.md / CHANGELOG.md / CLAUDE.md / SKILL.md remain out of scope (separate external contracts). Adopted in PR #XX (v4.X.Y). |
| v1.2 | 2026-05-15 | **Archive mechanism codification**: expand §2.3 State Machine with 4 new subsections — §2.3.1 Archive Triggers (4 conditions: major bump / structural rewrite / ≥70% content replacement / split-merge-rename; adapted from mj-agent ADR-017); §2.3.2 Frontmatter on Archive Transition (new `archived:` date + `replaced-by:` pointer fields, bidirectional with `supersedes:` on active successor); §2.3.3 Archive Banner Template (canonical blockquote format at top of archived body); §2.3.4 Living vs Frozen Reference Judgment (procedural rule for cross-doc refs during archive ceremony). Also clarify §2.4 archived filename pattern (`[DEPRECATED]_<TAG>_<Topic>_v<major>.<minor>.md`; patch dropped). Backward compatible: no existing doc paths or frontmatter changes required — these are rules for **future** archive events. Operationalized in `docs/runbook/[RUNBOOK]_Doc_Archive_Procedure.md` v1.0 (new). Adopted in PR #83 (v4.4.0). |
| v1.1 | 2026-05-15 | **§1 exemption codification**: formalize «plugin-internal teaching series» (e.g., `plugins/learn-kit/docs/learn-kit-NN-*.md` numbered series) as an explicit §1 exemption category. Pre-v1.1 the 6 lowercase learn-kit teaching docs were "informally exempt" per `plugins/learn-kit/docs/INDEX.md` §Plugin-Internal Teaching Series; v1.1 promotes this to canonical framework rule with 3-point pattern criteria (root-level under `plugins/<name>/docs/`, filename prefixed with plugin name, content is human-pedagogical). Backward compatible: no existing doc paths or frontmatter required to change. Adopted in PR #80 (v4.3.3). |
| v1.0 | 2026-05-15 | Initial framework: 6 tag prefixes + 8-field frontmatter + 3-state machine + path stability + INDEX sync. Adopted in PR #75 (v4.2.0). Adapted from mj-agent `[STANDARD]_MJ_Agent_Documentation_Meta_Framework.md` v2.2; simplified by removing track multiplexing, agent-runtime types, and CI gate enforcement. |
