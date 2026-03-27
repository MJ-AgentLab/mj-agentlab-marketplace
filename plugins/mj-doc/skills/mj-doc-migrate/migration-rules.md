# Migration Rules Reference

## Tag Migration Table

| Legacy Tag | Framework v4.5 Tag | Notes |
|-----------|-----------------|-------|
| `[MANUAL]` | `[RUNBOOK]` | Direct mapping — manuals are operation procedures |
| `[API]` | `[GUIDE]` | API docs → Guide with API architecture content |
| No tag (in docs/) | Evaluate per §2.3 | Use decision tree; most become `[GUIDE]` or `[SPEC]` |
| `_v{X}.{Y}` suffix | Frontmatter `version` only | Remove from filename unless multi-version coexist |
| `[DEPRECATED]` prefix | Keep if still deprecated | Otherwise remove during migration |
| Troubleshooting/FAQ content with structured analysis | Evaluate: `[ISSUE]` if problem analysis >10 lines; else keep in `[GUIDE]` TS section |
| Performance comparison / optimization reports | `[ASSESSMENT]` if contains before/after comparison across ≥2 dimensions |

## Split Heuristic

**When to split** (legacy doc → multiple Framework v4.5 docs):
- Legacy doc >800 lines
- Content covers >2 Framework v4.5 document types
- Mixed audiences (dev + ops content in same doc)

**How to split**:
1. Identify distinct content sections by type (operation steps → RUNBOOK, design rationale → SPEC/ADR, how-to → GUIDE)
2. Each split doc gets its own frontmatter, directory placement, filename
3. Add cross-references between split docs

## Merge Heuristic

**When to merge** (multiple legacy docs → single Framework v4.5 doc):
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

Common legacy locations → Framework v4.5 targets:

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

## Post-Migration Checklist

- [ ] All output docs pass mj-doc-validate
- [ ] INDEX.md updated with new entries
- [ ] Cross-references from other docs updated
- [ ] Legacy docs NOT deleted (await user approval)
- [ ] CLAUDE.md synced if affected sections changed
