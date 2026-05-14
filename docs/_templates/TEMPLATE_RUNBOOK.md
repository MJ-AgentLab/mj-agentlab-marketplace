---
type: runbook
scope: marketplace
summary: <one-line procedure purpose, 20-80 chars>
owner: <user-handle or team>
created: <YYYY-MM-DD>
updated: <YYYY-MM-DD>
state: active
version: v1.0
last-verified: <YYYY-MM-DD>   # REQUIRED for RUNBOOK; date of last successful manual run
# domain: release | infra | plugin-internal   # optional
# related:
#   - ./[STANDARD]_<related>.md
---

# [RUNBOOK] <Title>

## §1 Preconditions

<What must be true before running this procedure? Tools installed? Permissions? State of the system?>

- [ ] <precondition 1>
- [ ] <precondition 2>
- [ ] <precondition 3>

## §2 Steps

<Imperative mood. Each step is a discrete action that can be retried. Include exact commands.>

### §2.1 <Step Group 1>

```bash
<command 1>
```

Expected output:

```text
<expected output>
```

If unexpected: <troubleshooting branch>

### §2.2 <Step Group 2>

```bash
<command 2>
```

## §3 Verification

<How to confirm the procedure succeeded end-to-end.>

- [ ] <verification check 1, with command>
- [ ] <verification check 2>

## §4 Rollback

<If the procedure fails partway, how to revert state to known-good.>

```bash
<rollback command 1>
<rollback command 2>
```

If rollback is not possible: <alternative recovery path>

## §5 Change History

| Version | Date | last-verified | Summary |
|---------|------|---------------|---------|
| v1.0 | YYYY-MM-DD | YYYY-MM-DD | Initial version. |
