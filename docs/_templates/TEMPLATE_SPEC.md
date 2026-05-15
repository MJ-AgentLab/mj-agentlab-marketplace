---
type: spec
scope: marketplace
summary: <one-line spec subject, 20-80 chars>
owner: <user-handle or team>
created: <YYYY-MM-DD>
updated: <YYYY-MM-DD>
state: active
version: v1.0
# domain: plugin-dev | governance | infra   # optional
# related:
#   - ./[STANDARD]_<related>.md
---

# [SPEC] <Subject>

## §1 Purpose

<What does this specify? What's the contract / schema being formalized? Who consumes it?>

## §2 Schema

<Formal definition. Use code blocks for structural schemas.>

```yaml
# example schema declaration
type: <root-type>
properties:
  <field-1>:
    type: <type>
    description: <what it means>
    required: true | false
  <field-2>:
    type: <type>
```

Or in JSON Schema notation:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "<field-1>": {"type": "string"}
  },
  "required": ["<field-1>"]
}
```

## §3 Examples

### §3.1 Minimal Valid

```yaml
<minimal example that satisfies the schema>
```

### §3.2 Full / Realistic

```yaml
<full-featured example>
```

### §3.3 Invalid (with reason)

```yaml
<invalid example>   # ❌ <which constraint violated>
```

## §4 Validation

<How to verify a candidate document conforms to this spec.>

- Manual: <step-by-step>
- Tool: `<validator command>` if exists
- Skill: `/mp-doc-validate` (or relevant skill)

## §5 Versioning

<How is this spec versioned? When does a minor / major bump happen?>

| Change Type | Bump |
|-------------|------|
| New optional field | minor |
| New required field | major |
| Field removal | major |
| Field rename | major (with `supersedes:` pointer) |

## §6 Change History

| Version | Date | Summary |
|---------|------|---------|
| v1.0 | YYYY-MM-DD | Initial spec. |
