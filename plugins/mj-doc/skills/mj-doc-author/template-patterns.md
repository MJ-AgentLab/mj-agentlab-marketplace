# Template Patterns Reference

## Template Paths

All templates at: `docs/_templates/TEMPLATE_{TYPE}.md`

| Type | Template | Status |
|------|----------|--------|
| `[SPEC]` | TEMPLATE_SPEC.md | Available |
| `[ADR]` | TEMPLATE_ADR.md | Available |
| `[GUIDE]` | TEMPLATE_GUIDE.md | Available |
| `[RUNBOOK]` | TEMPLATE_RUNBOOK.md | Available |
| `[POSTMORTEM]` | TEMPLATE_POSTMORTEM.md | Available |
| `[STANDARD]` | TEMPLATE_STANDARD.md | Available |

## RUNBOOK Sub-Patterns

### Alert-Response (Default)

Standard RUNBOOK structure for alert-driven operations:

```
Alert Lookup Table → per-alert section:
  Symptoms → Diagnosis Steps → Fix Commands → Health Check
→ Rollback → Escalation Path
```

### Process-Oriented (Adaptation)

For process-driven runbooks (release, setup, cold start, migration):

```
Process Lookup Table → per-phase section:
  Prerequisites → Steps → Verification
→ Rollback → Escalation Path
```

**When to use**: Release processes, infrastructure setup, cold start procedures, data migration operations — any RUNBOOK where the entry point is a planned process rather than an alert.

**Adaptation rules**: Rename "Alert Lookup" → "Process Lookup", "Symptoms" → "Prerequisites", "Diagnosis" → "Steps". All other RUNBOOK MUST requirements (§7.1) still apply.

## Subdirectory INDEX.md Pattern

When a directory has ≥3 docs, create INDEX.md with this structure:

```markdown
# {Directory Topic} 文档索引

> **适用范围**：{scope}
> **目标受众**：{audience}

## 文档列表

- [[doc1|Title]] — one-line description (≤60 chars)
- [[doc2|Title]] — one-line description

## 按角色导航

| 角色 | 推荐阅读 |
|------|---------|
| 开发者 | doc1, doc2 |
| 运维 | doc3 |

## 文档关系

Brief description of how the docs in this directory relate.

## 关联文档

- [[external_doc|Title]] — cross-reference to docs in other directories
```

## Template Adaptation Rules

When adapting templates for specific documents:

- **Allowed**: Rename sections, reorder sections, add sub-sections
- **MUST preserve**: YAML frontmatter, blockquote header (§5.5), related docs section
- **Never remove**: Frontmatter required fields, type-specific MUST sections from §7.1

## Service Abbreviation Registry

| Service | Abbr | Directory |
|---------|------|-----------|
| AutoEmailCollector | AEC | design/AutoEmailCollector/ |
| DataQualityValidator | DQV | design/DataQualityValidator/ |
| QueryVolumeLoader | QVL | design/QueryVolumeLoader/ |
| QueryCommonMetrics | QCM | design/QueryCommonMetrics/ |
| StageAreaCleaner | SAC | — |
| FileCleaner | FC | — |

Cross-service or general: use `SYS` as abbreviation.
