# Plan Checklist Reference

## §2.3 Decision Tree (Gap Analysis Orientation)

For each identified gap, ask:

| Question | If Yes → Type |
|----------|---------------|
| Is this a production operation procedure? | `[RUNBOOK]` |
| Is this a technical design for a feature/system? | `[SPEC]` |
| Is this an architecture/technology decision? | `[ADR]` |
| Is this a how-to or tutorial for developers? | `[GUIDE]` |
| Is this a naming/format/data standard? | `[STANDARD]` |
| Is this an incident analysis? | `[POSTMORTEM]` |
| Is this a deferred problem found during development? | `[ISSUE]` |
| Is this a post-optimization before/after evaluation? | `[ASSESSMENT]` |

## §12 前置检查 Protocol

### When to Require ADR (§12.2)

Any ONE of these → must create ADR:
- New API endpoint, service, or processing pipeline
- Architecture pattern change (new framework, communication style, layer restructure)
- DB schema change (new/delete table, field type change, new schema domain)
- CI/CD pattern change (deployment strategy, pipeline structure, new automation tool)
- Cross-project change (affects ≥2 services, tech stack swap, security policy)

### When to Require SPEC (§12.3)

**New SPEC** — any ONE of these:
- New external interface (API endpoint, router, external contract)
- New DB table or schema
- New user-visible capability (service, processing stage, data flow)

**Update existing SPEC** — any of these:
- Bug fix that changes interface signature, data model, or process steps
- Internal logic change that affects documented behavior

## Documentation Coverage Heuristics

| Area | Minimum Coverage |
|------|-----------------|
| Each service | ≥1 `[SPEC]` + relevant `[RUNBOOK]`s |
| Each infrastructure area | ≥1 `[GUIDE]` + relevant `[RUNBOOK]`s |
| Each architecture decision | 1 `[ADR]` |
| Each DB schema domain | Referenced in `[STANDARD]` or `[SPEC]` |
| Cross-service standards | `[STANDARD]` in `rule/` or `infrastructure/` |
| Each significant optimization round | ≥1 `[ASSESSMENT]` documenting before/after comparison |
| Cross-module deferred problems | `[ISSUE]` when problem needs >10 lines of structured analysis |

## §11 Expansion Triggers (ISSUE / ASSESSMENT)

| Type | Trigger Condition |
|------|------------------|
| `[ISSUE]` | During optimization or cross-module dev, discover another service's potential problem AND the problem needs >10 lines of context/analysis AND fix is deferred to a future iteration |
| `[ASSESSMENT]` | Complete an optimization round (involving architecture change, performance improvement, or major refactoring) AND merge to main branch AND team needs to record before/after comparison for future reference |

## Plan Document Format

```markdown
# {Topic} Documentation Plan

## Context
Brief explanation of why these docs are needed.
What triggered this assessment.

## Existing Documentation
- List of existing docs found and their status

## Proposed Documents

| # | Type | Filename | Directory | Content Sources | Priority |
|---|------|----------|-----------|-----------------|----------|
| 1 | ... | ... | ... | code/legacy/config paths | High/Med/Low |

## Task List
Ordered by dependencies:
1. Task description — depends on: none / task #N
2. ...

## Code Verification Checklist
Per-document list of code paths to verify:
- [ ] Doc1: verify X against `src/path/file.py`
- [ ] Doc2: verify Y against `sql/path/script.sql`
```

## Migration Check

Before finalizing plan, scan `docs_old/` for:
- Files matching the topic
- Files with legacy tags (`[MANUAL]`, `[API]`, no tag, or content that may map to `[ISSUE]`/`[ASSESSMENT]`)
- Content that overlaps with proposed new docs

If found → include migration tasks using `mj-doc-migrate` skill.

For type decision details: see type-decision-reference.md via `mj-doc-author`.
