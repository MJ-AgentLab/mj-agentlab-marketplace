---
type: standard
scope: marketplace
summary: Documentation framework v1.1 — tag prefixes, frontmatter, state machine, paths, INDEX sync, plugin-internal teaching series exemption
owner: marketplace-maintainers
created: 2026-05-15
updated: 2026-05-15
state: active
version: v1.1
domain: governance
tags:
  - documentation
  - framework
  - meta
related:
  - ./[STANDARD]_GitHub_Markdown.md
  - ./[STANDARD]_Commit_Message_Convention.md
  - ./[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md
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
| `deprecated` → `archived` | doc moved to `docs/archive/<subtype>/[DEPRECATED]_<name>_v<X.Y>.md`; state immutable afterward |

**Rules**:

- A `deprecated` doc **MUST** include a `> [!WARNING] Deprecated by [...]` banner at the body top pointing to the successor
- An `archived` doc **MUST NOT** be modified except for typo corrections — content is frozen at archive time
- `frontmatter.updated:` is bumped on each state transition

### §2.4 Filename & Path Stability

Filename format: `[TAG]_<TitleCase_Topic>.md`

- `[TAG]` is one of the 6 prefixes (uppercase, square brackets)
- `_` separates prefix from topic
- `<Topic>` uses `TitleCase` with underscores
- **No `_vX.Y` suffix** on `active` or `deprecated` files — version lives in `frontmatter.version`
- **Only `archived` files** carry `_vX.Y` in filename and live under `docs/archive/<subtype>/[DEPRECATED]_<name>_vX.Y.md`

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
| v1.1 | 2026-05-15 | **§1 exemption codification**: formalize «plugin-internal teaching series» (e.g., `plugins/learn-kit/docs/learn-kit-NN-*.md` numbered series) as an explicit §1 exemption category. Pre-v1.1 the 6 lowercase learn-kit teaching docs were "informally exempt" per `plugins/learn-kit/docs/INDEX.md` §Plugin-Internal Teaching Series; v1.1 promotes this to canonical framework rule with 3-point pattern criteria (root-level under `plugins/<name>/docs/`, filename prefixed with plugin name, content is human-pedagogical). Backward compatible: no existing doc paths or frontmatter required to change. Adopted in PR #80 (v4.3.3). |
| v1.0 | 2026-05-15 | Initial framework: 6 tag prefixes + 8-field frontmatter + 3-state machine + path stability + INDEX sync. Adopted in PR #75 (v4.2.0). Adapted from mj-agent `[STANDARD]_MJ_Agent_Documentation_Meta_Framework.md` v2.2; simplified by removing track multiplexing, agent-runtime types, and CI gate enforcement. |
