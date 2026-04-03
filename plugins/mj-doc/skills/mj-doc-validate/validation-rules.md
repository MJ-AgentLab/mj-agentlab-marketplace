# Validation Rules Reference — Framework v5.0

> **Compatibility**: `mj-doc` v2.0 validates only repositories that have completed the Framework v5.0 migration. If a governed doc still uses v4.5 frontmatter (e.g., `status`, `tags` as required, `date` instead of `created`), the validator returns `FAIL` with a migration-required message directing the user to `mj-doc-migrate`.

## Applicability

### Governed docs (receive A1-A6 + OB checks)

- `docs/**/*.md` (excluding `docs/archive/legacy/**` and `docs/_templates/**`)
- `plans/**/*.md`

### Root special files (receive OB checks only; A1-A6 return `SKIP`)

- `README.md`
- `CONTRIBUTING.md`
- `CHANGELOG.md`
- `GLOSSARY.md`
- `CLAUDE.md`

### Excluded (no validation)

- `docs/archive/legacy/**` — legacy archive, not governed
- `docs/_templates/**` — template files (plugin convention; standard is silent)

## Status Semantics

| Status | Meaning |
|--------|---------|
| `PASS` | Check passed |
| `FAIL` | Check failed — blocks merge in PR mode |
| `WARN` | Non-blocking advisory issue |
| `SKIP` | Check not applicable to this file type |

---

## A1: Path and Filename Legality

Canonical docs (`docs/**`):

```python
DOCS_FILENAME_RE = r'^\[(?:GUIDE|ADR|SPEC|RUNBOOK|POSTMORTEM|STANDARD|ISSUE|ASSESSMENT)\](?:_[A-Za-z0-9]+)+(?:_v\d+\.\d+)?\.md$'
```

Working docs (`plans/**`):

```python
PLAN_FILENAME_RE = r'^\[PLAN\](?:_[A-Za-z0-9]+)+\.md$'
```

Root special files:

```python
ROOT_FILENAME_RE = r'^(README|CONTRIBUTING|CHANGELOG|GLOSSARY|CLAUDE)\.md$'
```

Template and index files:

```python
TEMPLATE_FILENAME_RE = r'^(TEMPLATE_[A-Z]+|INDEX)\.md$'
```

Rules:

- `[DEPRECATED]` prefix is **removed** from valid filename patterns — deprecated docs use `state: deprecated` with their original type prefix
- English filename tokens and underscores only
- Path layer enforcement:
  - canonical docs must live in `docs/**`
  - working docs must live in `plans/**`
  - legacy output must live in `docs/archive/legacy/**` (not A1-A6 governed)

## A2: Frontmatter Schema Completeness

### Canonical required fields (7)

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Document type (validated by A3) |
| `domain` | string | Domain abbreviation (validated by A3) |
| `summary` | string | One-line summary (used by INDEX generation) |
| `owner` | string | Document owner |
| `created` | date | Creation date |
| `updated` | date | Last substantive update date |
| `state` | enum | Lifecycle state (validated by A3) |

### Type-specific required fields

| Type | Extra Fields |
|------|-------------|
| `[STANDARD]`, `[SPEC]` | `version` (any non-empty string) |
| `[ADR]` | `decision` (validated by A3) |
| `[ISSUE]` | `priority` (validated by A3), `resolution` (validated by A3) |
| `[ASSESSMENT]` | `dimensions` (YAML list, ≥2 items), `period` (free-text string) |

### Working doc required fields (5)

| Field | Type | Description |
|-------|------|-------------|
| `summary` | string | One-line summary |
| `owner` | string | Document owner |
| `created` | date | Creation date |
| `updated` | date | Last update date |
| `state` | enum | Lifecycle state (validated by A3) |

All 5 working doc fields are mandatory. A working doc missing any field gets `FAIL`.

### Optional fields (accepted, never required or rejected)

- `tags`
- `aliases`
- `supersedes`

### Mixed-repo failure path

If a governed canonical doc uses v4.5-style frontmatter (`status` instead of `state`, `date` instead of `created`, `tags`/`aliases`/`version` as required fields), return `FAIL` with message:

> `mj-doc v2.0 only supports Framework v5.0 repositories. This document appears to use v4.5 frontmatter. Run mj-doc-migrate first.`

## A3: State and Enum Validation

| Field | Valid Values |
|-------|-------------|
| `state` | `draft`, `active`, `deprecated` |
| `type` | `guide`, `spec`, `standard`, `adr`, `runbook`, `postmortem`, `issue`, `assessment` |
| `domain` | `AEC`, `DQV`, `QVL`, `QCM`, `SAC`, `FC`, `DOCKER`, `DB`, `FLYWAY`, `N8N`, `CICD`, `GIT`, `NET`, `SYS` |
| ADR `decision` | `accepted`, `superseded`, `rejected` |
| ISSUE `resolution` | `open`, `fixed`, `wontfix`, `obsolete` |
| ISSUE `priority` | `P0`, `P1`, `P2`, `P3` |

## A4: Internal Link Target Existence

Supported internal link forms:

| Form | Example |
|------|---------|
| Wikilink | `[[Doc]]` |
| Wikilink with alias | `[[Doc\|Alias]]` |
| Wikilink with heading | `[[Doc#Heading]]` |
| Intra-doc heading | `[[#Heading]]` |
| Relative Markdown link | `[text](./path.md)` |
| Parent Markdown link | `[text](../path.md)` |
| Angle-bracket Markdown | `[text](<./path.md>)` |

Rules:

- Skip external URLs (`http://`, `https://`, `mailto:`)
- Ignore links inside fenced code blocks
- Resolve heading anchors against actual heading text (GitHub-style slug normalization)
- `FAIL` if file target is missing
- `FAIL` if heading target is missing
- `FAIL` if wikilink resolves ambiguously to multiple files

Requires `--repo-root` to resolve file paths.

## A5: INDEX Managed-Block Sync

Managed block markers (plugin convention):

```html
<!-- mj-doc:index:start -->
<!-- mj-doc:index:end -->
```

Entry format:

```markdown
- [[filename]] — {summary}
```

Rules:

- `docs/INDEX.md` **must** contain a managed block
- Any existing `docs/**/INDEX.md` **must** contain a managed block
- A5 validates only the managed block content, not the whole file
- Content is generated from governed canonical docs and their `summary` frontmatter fields
- Does **not** auto-create missing subdirectory INDEX files where none exist
- `--write-managed-indexes` uses the same render function that A5 uses for comparison (idempotency guarantee)

Requires `--repo-root` to scan docs.

## A6: CLAUDE.md Allowlist Trigger

PR-mode only (returns `SKIP` outside PR mode).

Default hardcoded allowlist patterns:

- `docs/rule/[STANDARD]_Documentation_Management_Framework_*`
- `docs/rule/[STANDARD]_SQL_*`
- Service architecture SPECs
- High-frequency runtime/runbook entry docs
- `docs/INDEX.md`

Rules:

- Requires `--pr-mode` and `--base-ref`
- `--head-ref` defaults to `HEAD`
- Compares changed files in `git diff <base-ref>...<head-ref>`
- `FAIL` if allowlist doc changed but root `CLAUDE.md` did not change
- `SKIP` outside PR mode

---

## OB Checks (Non-Blocking, Retained from v4.5)

OB checks test Markdown format compliance. They are complementary to A-checks (which test schema/existence). Both families run independently.

### OB1: No GitHub-Style Anchor Links

`FAIL` on `[text](#anchor)` outside code fences. Use `[[#Heading]]` instead.

### OB2: Heading Format

- Space after `#`: `## Title` ✅ / `##Title` ❌
- No period after number: `## 1 Title` ✅ / `## 1. Title` ❌
- No trailing punctuation: `## What is X` ✅ / `## What is X?` ❌

### OB3: Unordered Lists Use `-` Only

`FAIL` on `*` or `+` list markers outside code fences.

### OB4: Code Block Language Tags

`WARN` on fenced code blocks without a language identifier.

### OB5: Callout Types

Valid types: `note`, `info`, `tip`, `hint`, `important`, `warning`, `caution`, `attention`, `danger`, `error`, `example`, `quote`, `cite`, `abstract`, `summary`, `tldr`, `success`, `check`, `done`, `question`, `help`, `faq`, `failure`, `fail`, `missing`, `bug`, `todo`

`FAIL` on unknown callout types.

---

## Non-Blocking Advisory Checks

These checks return `WARN` only:

- **Line count range**: Type-specific advisory limits (see table below)
- **Tense consistency** (semi-auto): Flag future-tense words in past-tense doc types
- **Content boundary** (semi-auto): Flag content that violates type MUST NOT lists
- **Summary quality** (semi-auto): Flag missing or low-quality summary fields

### Line Count Ranges (Advisory)

| Type | Min | Max |
|------|-----|-----|
| README | 200 | 500 |
| `[GUIDE]` | 100 | 800 |
| `[ADR]` | 50 | 200 |
| `[SPEC]` | 200 | 1500 |
| CONTRIBUTING | 100 | 500 |
| `[RUNBOOK]` | 50 | 500 |
| `[POSTMORTEM]` | 100 | 500 |
| `[STANDARD]` | 100 | 1000 |
| `[ISSUE]` | 50 | 200 |
| `[ASSESSMENT]` | 100 | 1000 |
| GLOSSARY | 50 | 500 |
| CHANGELOG | — | — (skip) |
| INDEX | — | — (skip) |
| TEMPLATE | — | — (skip) |

---

## CLI Contract

```bash
# Basic validation
python validate_doc.py <file_or_dir> [--json]

# With repo root (required for A4, A5, A6, INDEX generation)
python validate_doc.py <file_or_dir> --repo-root <repo>

# Generate/update managed INDEX blocks
python validate_doc.py <file_or_dir> --repo-root <repo> --write-managed-indexes

# PR-mode validation (A6 enabled)
python validate_doc.py <file_or_dir> --repo-root <repo> --pr-mode --base-ref <ref> [--head-ref <ref>]
```

For full Framework v5.0 rules: see `[STANDARD]_Documentation_Management_Framework_v5.0.md`
