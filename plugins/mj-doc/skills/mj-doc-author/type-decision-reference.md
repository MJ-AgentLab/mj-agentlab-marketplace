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
├── Deferred problem found during dev (needs >10 lines) ── [ISSUE]
├── Post-optimization before/after comparison ──────────── [ASSESSMENT]
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
| Tense | Analyzing a discovered problem? | `[ISSUE]` (present+past) |
| Tense | Reviewing a completed optimization? | `[ASSESSMENT]` (past) |
| Mutability | Should not change after publish? | [ADR] or [POSTMORTEM] or [ASSESSMENT] |
| Mutability | Must stay current? | `[RUNBOOK]` or `[GUIDE]` |
| Mutability | Append-only after publish? | `[ISSUE]` |

## §7.2 Confusion Pairs

| Pair | Key Distinction |
|------|----------------|
| `[ADR]` ↔ `[SPEC]` | ADR = conclusion (past, immutable). SPEC = proposal (future, iterable). Decision → ADR; design → SPEC |
| `[RUNBOOK]` ↔ `[GUIDE]` TS | RUNBOOK = production env, needs prod access, imperative. GUIDE = dev env, no special access, explanatory |
| `[RUNBOOK]` ↔ `[POSTMORTEM]` | RUNBOOK = imperative (fix now). POSTMORTEM = past tense (analyze after). During incident → RUNBOOK; after resolution → POSTMORTEM |
| `[GUIDE]` ↔ CONTRIBUTING | GUIDE = environment not ready (new person). CONTRIBUTING = environment ready (submitting code) |
| `[ISSUE]` ↔ `[POSTMORTEM]` | ISSUE = proactive discovery during dev, present+past tense. POSTMORTEM = reactive after runtime incident, past tense. Proactive → ISSUE; reactive → POSTMORTEM |
| `[ISSUE]` ↔ GitHub Issue | ISSUE = structured analysis >10 lines with WHY/HOW context. GitHub Issue = task tracking WHAT/WHEN. Needs analysis → [ISSUE]; simple tracking → GitHub Issue |
| `[ISSUE]` ↔ `[SPEC]` | ISSUE = describe problem + suggest fix direction (≤5 points). SPEC = complete design with interfaces. Problem description → ISSUE; solution design → SPEC |
| `[ASSESSMENT]` ↔ `[SPEC]` | ASSESSMENT = past tense (evaluate completed work). SPEC = future tense (design planned work). Work done → ASSESSMENT; work planned → SPEC |
| `[ASSESSMENT]` ↔ `[POSTMORTEM]` | ASSESSMENT = planned optimization completed, neutral evaluation. POSTMORTEM = unplanned incident, root cause analysis. Planned → ASSESSMENT; unplanned → POSTMORTEM |

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
| `[ISSUE]` | Problem summary, discovery context, impact, fix direction (≤5 points) | Complete fix design, decision discussion, operation flow, post-incident analysis |
| `[ASSESSMENT]` | Optimization overview, ≥2 dimension before/after comparison, summary table | Fix implementation details, decision discussion, incident response |

## Line Count Constraints

README: 200-500 | GUIDE: 100-800 | ADR: 50-200 | SPEC: 200-1500
CONTRIBUTING: 100-500 | RUNBOOK: 50-500 | POSTMORTEM: 100-500 | STANDARD: 100-1000
ISSUE: 50-200 | ASSESSMENT: 100-1000

For full rules: `docs/rule/[STANDARD]_Documentation_Management_Framework_v4.5.md` §7.1
