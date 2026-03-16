# Quality Gate Reference

## §9.3 PR Checklist Items

| # | Check | Scope | How |
|---|-------|-------|-----|
| 1 | YAML frontmatter complete | All `docs/**/*.md` | A1 check via mj-doc-validate |
| 2 | Filename compliant | All docs | A2 check via mj-doc-validate |
| 3 | INDEX.md synced | PR adds/removes docs | Diff check: new files in INDEX? |
| 4 | CLAUDE.md synced | PR changes §8.2 mapped docs | Compare changed content vs CLAUDE.md |
| 5 | `updated` date current | Modified existing docs | Frontmatter check (substantive changes only) |
| 6 | Status transition legal | Docs with status change | Verify against §5.3 transition matrix |
| 7 | ADR exists if triggered | §12.2 conditions met | Check `docs/adr/` |
| 8 | SPEC exists if triggered | §12.3 new conditions met | Check `docs/design/{Service}/` |
| 9 | SPEC updated if triggered | §12.3 update conditions met | Diff check on SPEC `updated` field |

## §12.2 ADR Trigger Conditions

Create ADR when ANY is true:
- New API endpoint / service / processing pipeline
- Architecture pattern change (framework, communication, layering)
- DB schema change (new/delete table, field type, new schema)
- CI/CD pattern change (deploy strategy, pipeline structure, new tool)
- Cross-project change (≥2 services, tech stack, security policy)

**Does NOT trigger**: Bug fix, pure internal refactor, typo/format/comment changes.

## §12.3 SPEC Trigger Conditions

**New SPEC** when ANY is true:
- New external interface (API, router, contract)
- New DB table or schema
- New user-visible capability

**Update existing SPEC** when:
- Bug fix changes interface signature, data model, or process steps
- Internal logic change affects documented behavior

## §9.4 Code-Doc Mapping (Quick Reference)

| Code Change | Must Check |
|-------------|-----------|
| `src/*/router.py` | API docs + CLAUDE.md endpoints |
| `src/*/configuration/*.yaml` | Service RUNBOOK + CLAUDE.md |
| `main.py` | README + CLAUDE.md architecture |
| `sql/**` | Database docs + CLAUDE.md |
| `docker-compose*` | Docker docs + CLAUDE.md |
| `.github/workflows/*` | CI/CD docs |
| `scripts/*` | Corresponding RUNBOOK/GUIDE |
| `.env` new vars | CLAUDE.md env + RUNBOOK |
| `pyproject.toml` | README tech stack |

## Status Transition Matrix (§5.3)

```
草案 → 评审中 → 已批准 → 已废弃
                  ├→ 已实施 → 已废弃  (SPEC only)
                  ├→ 已取代           (ADR only)
                  └→ 草案             (major version bump)
评审中 → 已拒绝                      (ADR only)
```
