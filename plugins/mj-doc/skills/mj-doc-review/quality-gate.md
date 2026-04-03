# Quality Gate Reference — Framework v5.0

## §9.3 PR Checklist Items

| # | Check | Scope | How |
|---|-------|-------|-----|
| 1 | Path + filename legal (A1) | All governed docs | validate_doc.py |
| 2 | Frontmatter complete (A2) | All governed docs | validate_doc.py |
| 3 | Enums valid (A3) | All governed docs | validate_doc.py |
| 4 | Internal links resolved (A4) | All governed docs | validate_doc.py --repo-root |
| 5 | INDEX managed block synced (A5) | INDEX.md files | validate_doc.py --repo-root |
| 6 | CLAUDE.md synced (A6) | PR changes allowlist docs | validate_doc.py --pr-mode --base-ref |
| 7 | OB format checks (OB1-OB5) | All docs including root special | validate_doc.py |
| 8 | `updated` date current | Modified existing docs | Frontmatter check (substantive changes only) |
| 9 | ADR exists if triggered | §12.2 conditions met | Check `docs/adr/` |
| 10 | SPEC exists if triggered | §12.3 new conditions met | Check `docs/design/{Service}/` |
| 11 | SPEC updated if triggered | §12.3 update conditions met | Diff check on SPEC `updated` field |

## Review Semantics

| Status | Meaning | Merge Impact |
|--------|---------|-------------|
| `PASS` | Check passed | No action needed |
| `FAIL` | Check failed | **Blocks merge** |
| `WARN` | Non-blocking issue | Requires reviewer comment but does not block |
| `SKIP` | Check not applicable | Acceptable — no action needed |

## State Lifecycle (v5.0)

```
draft → active → deprecated
```

Three states only:

| State | Meaning | Allowed Transitions |
|-------|---------|-------------------|
| `draft` | New or under revision | → `active` |
| `active` | Authoritative, current | → `deprecated`, → `draft` (major rewrite) |
| `deprecated` | No longer authoritative | Terminal (create new doc instead) |

Type-specific result fields (not states):
- **ADR**: `decision` = `accepted` / `superseded` / `rejected`
- **ISSUE**: `resolution` = `open` / `fixed` / `wontfix` / `obsolete`

Immutable after `active`: `[ADR]`, `[POSTMORTEM]`, `[ASSESSMENT]` — create new document instead of modifying.
Append-only after `active`: `[ISSUE]` — preserve original analysis, append updates.

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

## A5 Managed-Block Expectations

- `docs/INDEX.md` must contain `<!-- mj-doc:index:start -->` / `<!-- mj-doc:index:end -->` markers
- Any existing `docs/**/INDEX.md` must also contain managed block markers
- Content between markers is generated from canonical docs' `summary` fields
- Regenerate with: `validate_doc.py --repo-root <repo> --write-managed-indexes`

## A6 PR-Mode Contract

- Only runs when `--pr-mode` is supplied with `--base-ref`
- Compares changed files in `git diff <base-ref>...<head-ref>`
- If allowlist doc changed but root `CLAUDE.md` did not → `FAIL`
- Returns `SKIP` outside PR mode
