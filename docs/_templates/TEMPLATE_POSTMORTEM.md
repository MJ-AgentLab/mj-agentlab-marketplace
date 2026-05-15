---
type: postmortem
scope: marketplace
summary: <one-line incident description, 20-80 chars>
owner: <user-handle or team>
created: <YYYY-MM-DD>
updated: <YYYY-MM-DD>
state: active
version: v1.0
# severity: P0 | P1 | P2 | P3   # optional but recommended
# incident-date: <YYYY-MM-DD>   # when incident occurred
# resolved-at: <YYYY-MM-DDTHH:MM:SSZ>   # ISO 8601 timestamp
# related:
#   - ../runbook/[RUNBOOK]_<related>.md
#   - ../adr/[ADR]_<related>.md
---

# [POSTMORTEM] <Incident Title>

| Field | Value |
|-------|-------|
| Severity | P0 / P1 / P2 / P3 |
| Incident date | YYYY-MM-DD |
| Detected at | YYYY-MM-DD HH:MM (timezone) |
| Resolved at | YYYY-MM-DD HH:MM (timezone) |
| Duration | <N hours / minutes> |
| Affected | <plugin / marketplace metadata / consumers> |

## §1 Summary

<One paragraph: what happened, scope of impact, current status. Suitable for non-engineering audience.>

## §2 Timeline

<Chronological narrative. Each entry: timestamp + observed event / action taken / decision made.>

| Time | Event | By |
|------|-------|-----|
| YYYY-MM-DD HH:MM | <first detection> | <user / system> |
| YYYY-MM-DD HH:MM | <investigation step> | <user> |
| YYYY-MM-DD HH:MM | <intermediate finding> | <user> |
| YYYY-MM-DD HH:MM | <fix applied> | <user> |
| YYYY-MM-DD HH:MM | <verification successful> | <user> |
| YYYY-MM-DD HH:MM | <incident closed> | <user> |

## §3 Root Cause

<Technical analysis. What was the actual cause (not just the symptom)? How did the cause go unnoticed until now? What chain of events allowed it to manifest?>

- **Immediate cause**: <what triggered the failure>
- **Contributing factors**: <conditions that made it possible>
- **Root cause**: <the deepest "why" that explains everything above>

## §4 Impact

<What was affected? Who experienced what?>

- **Users affected**: <count or description>
- **Plugins affected**: <list>
- **Data affected**: <description; "none" if applicable>
- **Public statement made**: <yes / no; link to statement if yes>

## §5 Remediation

<What was done to fix the immediate incident? What was done to prevent recurrence?>

### §5.1 Immediate (during incident)

- <action 1>
- <action 2>

### §5.2 Short-term (within 1 week)

- <action 1>
- <action 2>

### §5.3 Long-term (process / tooling changes)

- <action 1>
- <action 2>

## §6 Action Items

<Concrete follow-ups with owners and due dates. Each should result in a PR / ADR / RUNBOOK.>

| # | Action | Owner | Due | Status |
|---|--------|-------|-----|--------|
| 1 | <action> | <user> | YYYY-MM-DD | open / done |
| 2 | <action> | <user> | YYYY-MM-DD | open |
| 3 | <action> | <user> | YYYY-MM-DD | open |

## §7 Lessons Learned

<What did the team learn that's worth carrying forward into future work?>

- <lesson 1>
- <lesson 2>

## §8 References

- Issue: #<NN>
- PR (fix): #<NN>
- Related ADR: `../adr/[ADR]_<related>.md`
- Related RUNBOOK: `../runbook/[RUNBOOK]_<related>.md`
- External: <url>
