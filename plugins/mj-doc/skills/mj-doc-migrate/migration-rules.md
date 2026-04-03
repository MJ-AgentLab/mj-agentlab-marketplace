# Migration Rules Reference

## v4.5 → v5.0 Frontmatter Mapping

### Field Mapping

| v4.5 Field | v5.0 Field | Notes |
|-----------|-----------|-------|
| `tags` | (optional) | No longer required; kept if present |
| `aliases` | (optional) | No longer required; kept if present |
| `date` | `created` | Rename only |
| `updated` | `updated` | No change |
| `version` | `version` (SPEC/STANDARD only) | Required only for SPEC and STANDARD types |
| `status` | `state` | Value mapping required (see below) |
| `owner` | `owner` | No change |
| — | `type` | **New required field**: derive from filename `[TYPE]` prefix |
| — | `domain` | **New required field**: derive from directory path or content |
| — | `summary` | **New required field**: extract from first heading or blockquote |

### State Mapping

| v4.5 `status` | v5.0 `state` | v5.0 Result Field |
|---------------|-------------|-------------------|
| 草案 | `draft` | — |
| 评审中 | `draft` | — |
| 已批准 | `active` | — |
| 已实施 (SPEC) | `active` | — |
| 已修复 (ISSUE) | `active` | `resolution: fixed` |
| 已取代 (ADR) | `deprecated` | `decision: superseded` |
| 已拒绝 (ADR) | `deprecated` | `decision: rejected` |
| 已废弃 | `deprecated` | — |

### Type-Specific Field Migration

| Type | v4.5 Extra Fields | v5.0 Extra Fields |
|------|------------------|------------------|
| `[RUNBOOK]` | `last-verified` | — (removed) |
| `[ISSUE]` | `domain`, `discovered-during`, `priority` | `priority`, `resolution` (new) |
| `[ASSESSMENT]` | `scope`, `optimization-period`, `dimensions` | `dimensions` (list ≥2), `period` (rename from `optimization-period`) |
| `[ADR]` | — | `decision` (new: `accepted`/`superseded`/`rejected`) |
| `[SPEC]`, `[STANDARD]` | `version` | `version` (unchanged) |

## Tag Migration Table

| Legacy Tag | v5.0 Type | Notes |
|-----------|----------|-------|
| `[MANUAL]` | `[RUNBOOK]` | Direct mapping — manuals are operation procedures |
| `[API]` | `[GUIDE]` | API docs → Guide with API architecture content |
| No tag (in docs/) | Evaluate per §2.3 | Use decision tree; most become `[GUIDE]` or `[SPEC]` |
| `_v{X}.{Y}` suffix | Frontmatter `version` only | Remove from filename unless multi-version coexist |
| `[DEPRECATED]` prefix | Original type prefix + `state: deprecated` | Rename: `[DEPRECATED]_X.md` → `[GUIDE]_X.md` with `state: deprecated` |
| Troubleshooting/FAQ content | Evaluate: `[ISSUE]` if >10 lines analysis; else keep in `[GUIDE]` TS section |
| Performance comparison reports | `[ASSESSMENT]` if contains before/after comparison across ≥2 dimensions |

## Output Path Decisions

| Source Content | Output Layer | Output Path |
|---------------|-------------|-------------|
| `docs_old/...` authoritative doc | Canonical | `docs/...` |
| `docs_old/...` working plan | Working | `plans/...` |
| Historical report/evidence | Legacy archive | `docs/archive/legacy/...` |
| `[DEPRECATED]_X.md` (still relevant) | Canonical | `docs/...` with `state: deprecated` |
| `[DEPRECATED]_X.md` (purely historical) | Legacy archive | `docs/archive/legacy/...` |

## Split Heuristic

**When to split** (legacy doc → multiple v5.0 docs):
- Legacy doc >800 lines
- Content covers >2 Framework v5.0 document types
- Mixed audiences (dev + ops content in same doc)
- Content serves both long-term reference and short-term execution → split into `docs/` + `plans/`

**How to split**:
1. Identify distinct content sections by type (operation steps → RUNBOOK, design rationale → SPEC/ADR, how-to → GUIDE)
2. Each split doc gets its own frontmatter, directory placement, filename
3. Add cross-references between split docs

## Merge Heuristic

**When to merge** (multiple legacy docs → single v5.0 doc):
- Multiple legacy docs cover same topic
- Each is <100 lines
- Combined content fits within target type's line range

**How to merge**:
1. Identify the primary type from combined content
2. Organize sections per template structure
3. Deduplicate overlapping content

## Content Preservation Rules

| Content Type | Action |
|-------------|--------|
| Factual technical content | Preserve — restructure into template |
| Code examples | Verify against current code, update if needed |
| Configuration values | Cross-check with actual config files |
| Screenshots/images | Keep if still accurate; flag for review if uncertain |
| Formatting artifacts | Discard (old styling, non-standard headers) |
| Broken links | Fix or remove |
| Outdated procedures | Flag for verification, do not blindly copy |

## Legacy Path Mapping

Common legacy locations → v5.0 targets:

| Legacy Path | Target Path |
|------------|-------------|
| `docs_old/infrastructure/cicd/` | `docs/infrastructure/cicd/` |
| `docs_old/infrastructure/docker/` | `docs/infrastructure/docker/` |
| `docs_old/infrastructure/database/` | `docs/infrastructure/database/` |
| `docs_old/design/{Service}/` | `docs/design/{Service}/` |
| `docs_old/guide/` | `docs/guide/` |
| `docs_old/api/` | `docs/api/` (as `[GUIDE]`) |
| `docs_old/rule/` | `docs/rule/` |
| `docs_old/` (root-level files) | Evaluate per §2.3 |
| `docs_old/issues/` (if exists) | `docs/issues/` |
| `docs_old/assessments/` (if exists) | `docs/assessments/` |
| `docs_old/plans/` (if exists) | `plans/` |

## Post-Migration Checklist

- [ ] All output docs pass mj-doc-validate (A1-A6 + OB1-OB5)
- [ ] INDEX.md managed blocks regenerated
- [ ] Cross-references from other docs updated
- [ ] Legacy docs NOT deleted (await user approval)
- [ ] CLAUDE.md synced if affected sections changed
- [ ] `[DEPRECATED]` files renamed to original type prefix + `state: deprecated`
