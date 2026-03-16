# Type Decision Reference

## §2.3 Decision Tree

```
What is the content about?
│
├── Project entry (overview + quick start) ─────── README.md (no tag)
├── Onboarding / tutorial / API overview ──────── [GUIDE]
├── Technical choice conclusion ──────────────── [ADR]
├── Feature/system design proposal ───────────── [SPEC]
├── Code submission / PR / branch rules ──────── CONTRIBUTING.md (no tag)
├── Production operation steps ───────────────── [RUNBOOK]
├── Incident root cause analysis ─────────────── [POSTMORTEM]
├── Version change log ───────────────────────── CHANGELOG.md (no tag)
├── Term definitions ─────────────────────────── GLOSSARY.md (no tag)
└── Naming / data / coding standards ─────────── [STANDARD]
```

## Auxiliary Judgment

| Dimension | Question | Type |
|-----------|----------|------|
| Tense | Decision already made? | `[ADR]` (past) |
| Tense | Proposing a design? | `[SPEC]` (future) |
| Reader state | Operating production under pressure? | `[RUNBOOK]` (imperative) |
| Reader state | Learning calmly? | `[GUIDE]` (explanatory) |
| Permission | Needs production access? | `[RUNBOOK]` |
| Permission | No special access needed? | `[GUIDE]` |
| Mutability | Should not change after publish? | `[ADR]` or `[POSTMORTEM]` |
| Mutability | Must stay current? | `[RUNBOOK]` or `[GUIDE]` |

## §7.2 Confusion Pairs

| Pair | Key Distinction |
|------|----------------|
| `[ADR]` ↔ `[SPEC]` | ADR = conclusion (past, immutable). SPEC = proposal (future, iterable). Decision → ADR; design → SPEC |
| `[RUNBOOK]` ↔ `[GUIDE]` TS | RUNBOOK = production env, needs prod access, imperative. GUIDE = dev env, no special access, explanatory |
| `[RUNBOOK]` ↔ `[POSTMORTEM]` | RUNBOOK = imperative (fix now). POSTMORTEM = past tense (analyze after). During incident → RUNBOOK; after resolution → POSTMORTEM |
| `[GUIDE]` ↔ CONTRIBUTING | GUIDE = environment not ready (new person). CONTRIBUTING = environment ready (submitting code) |

## Content Boundaries (MUST / MAY / MUST NOT Summary)

| Type | Key MUST | Key MUST NOT |
|------|----------|-------------|
| README | Project name, tech stack, quick start ≤15 steps, arch overview | Detailed install, API params, deploy flow |
| `[GUIDE]` | Target reader, step-by-step, verification points | Architecture decisions, prod troubleshooting |
| `[ADR]` | ID, status, context, alternatives, decision, impact | Detailed implementation, operation steps |
| `[SPEC]` | Problem, goals/non-goals, detailed design, alternatives | Decision without discussion, operation steps |
| `[RUNBOOK]` | Alert→steps mapping, diagnosis, fix, rollback, `last-verified` | Root cause analysis, design rationale |
| `[POSTMORTEM]` | Summary, impact, timeline, 5-Whys, action items | Personal blame, operation tutorials |
| `[STANDARD]` | Scope, rules with correct/incorrect examples | Step-by-step tutorials, architecture discussions |

## Line Count Constraints

README: 200-500 | GUIDE: 100-800 | ADR: 50-200 | SPEC: 200-1500
CONTRIBUTING: 100-500 | RUNBOOK: 50-500 | POSTMORTEM: 100-500 | STANDARD: 100-1000

For full rules: `docs/rule/[STANDARD]_Documentation_Management_Framework_v4.md` §7.1
