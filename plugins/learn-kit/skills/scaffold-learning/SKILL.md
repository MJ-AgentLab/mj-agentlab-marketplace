---
name: scaffold-learning
description: Scaffold a learning subsystem in this project — creates learning/ folder with 8-stage pedagogical methodology and INDEX. Use when starting pedagogical documentation for rule-list-based knowledge in a fresh project. After scaffolding, use /learn-kit:generate-tier for AI-driven three-tier (foundation/structural/challenge) learning doc generation, or follow METHODOLOGY 8 stages to author manually.
disable-model-invocation: true
---

# Scaffold Learning Subsystem

Scaffold a `learning/` folder structure at the current project root, seeded with the 8-stage rule-list-pedagogy methodology and supporting templates.

## When to use

Run this once per project when you want to start sustaining pedagogical interpretation documents for enumerated rule lists (e.g., STANDARD-tier specs, RFC keyword lists, security policies, API style guides). The output is a learning subsystem skeleton parallel to your canonical docs and working plans.

## Pre-flight

1. Detect `<project-root>/learning/`. If it already exists, **do not overwrite** — ask the user to confirm whether to:
   - Skip (default; leave existing content untouched)
   - Merge missing files only
   - Abort
2. Detect git repository at project root. If absent, warn the user that the scaffold won't be tracked.

## Scaffolding steps

Create the following structure relative to `<project-root>`:

```
learning/
├── INDEX.md                              # from templates/INDEX.md
├── _meta/
│   └── METHODOLOGY.md                    # from templates/METHODOLOGY.md
└── _archive/
    └── .gitkeep                          # empty placeholder
```

Source files live in this skill's `templates/` directory (loaded via `${CLAUDE_PLUGIN_ROOT}/skills/scaffold-learning/templates/`).

## After scaffolding

Print a "next steps" message to the user:

1. **Read** `learning/_meta/METHODOLOGY.md` to understand the 8-stage pedagogical methodology (Source Intake → Framework Induction → Categorical Alignment → Asymmetry Handling → Terminology Pairing → Metaphor Unification → Page Assembly → Quality Gates).
2. **Study** the worked example at `<plugin-root>/skills/scaffold-learning/references/rfc-2119-keywords-pedagogy.md` — a complete walkthrough applying the 8 stages to RFC 2119 keywords (MUST / SHOULD / MAY etc.).
3. **Pick a source** — your first enumerated rule list to interpret. Suggested first targets: an enumerated STANDARD doc, a policy section with numbered rules, a glossary of normative keywords.
4. **Create a topic folder**: `mkdir learning/<topic-slug>/`
5. **Author** `learning/<topic-slug>/[LEARNING]_<Source>_<Aspect>.md` following the 8 stages.
6. **Or** run `/learn-kit:generate-tier` for AI-driven three-tier (foundation / structural / challenge) learning doc generation with optional interactive HTML rendering — recommended when you have a user question + source documents and want a fast first pass.

## References

Internal to this skill (load on demand, do not eagerly read):

- `templates/METHODOLOGY.md` — full 8-stage methodology (the canonical pedagogical reference)
- `templates/INDEX.md` — generic learning subsystem INDEX template
- `references/rfc-2119-keywords-pedagogy.md` — worked example: applying 8 stages to RFC 2119

## Non-goals

- This skill does **not** walk the user through the 8 stages interactively. The methodology is for the user to read and apply manually (use `/learn-kit:generate-tier` for AI-driven generation instead).
- This skill does **not** modify or validate existing learning content. For validation, use `markdownlint` or your project's markdown linter.
