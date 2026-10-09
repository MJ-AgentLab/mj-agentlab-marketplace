# Necessary knowledge and KU selection

## Evidence model

The four quadrants distinguish evidence about the AI-produced work from observed human understanding:

| Work evidence | Human evidence | Strategy |
| --- | --- | --- |
| Sufficient | Sufficient | Q1 shared understanding: verify |
| Sufficient | Gap signal | Q2 human understanding gap: learn |
| Insufficient | Sufficient | Q3 AI-side gap: correct / externalize |
| Insufficient | Insufficient | Q4 unresolved gap: investigate |

Either side can be **Undetermined**. Work evidence describes the supported application of knowledge, not access to a model's internal knowledge. Human evidence is limited to the responsibility and observed task. This skill checks Q2 and Q2 candidates; unknown human mastery is not a demonstrated gap. If work claims have conflicts or counterevidence, resolve correctness before teaching them.

**MNK** is the minimal sufficient knowledge for the owner's task and risk. A **KU** has one observable understanding target. **Understanding evidence** limits the conclusion the quiz can support. Top 3 prioritizes MNK-related candidates; unselected knowledge remains unassessed.

## Derive candidates

1. **Responsibility:** identify what the owner must judge, not merely which document they must read. Reuse accepted role/responsibility evidence. A missing responsibility needs confirmation of a narrow proposed responsibility before questions; missing capability data does not justify an invented ability level.
2. **Critical decisions:** list concrete judgments the responsibility requires. Locate accepted requirements and constraints, including ones missing from the AI artifact. For a sales report, the judgment might be whether the metric follows the approved grain and avoids duplicate orders.
3. **Necessary knowledge:** work backward from each judgment to concepts, rules, causal relationships and prerequisites. The presence of SQL JOINs or many technical terms is not itself a learning target.
4. **Necessity filter:** first require responsibility relevance and decision criticality; then assess failure consequence and necessary dependencies. Transfer value breaks close priority ties but cannot turn optional knowledge into MNK.
5. **Granularity:** keep one observable target and independent assessability. Split only for distinct error patterns or feedback needs. Adapt to explicitly available capability evidence and responsibility. Reliably mastered prerequisites can stay dependencies without another quiz.
6. **Boundary check:** identify why this KU matters, the decision it supports, the independent judgment it enables, prerequisites, observable evidence and excluded content. If these are unclear, revise the target rather than force a question.

For example, a report maintainer may need to judge whether joining order lines changes order-level totals. That is narrower than "understand SQL" and broader than recalling the name of an aggregate function. An architecture owner may instead need to judge a grain/relationship contract.

## Rank and gate

Use layered ranking, without an uncalibrated weighted score:

1. Necessity.
2. Risk / failure consequence.
3. Proximity of the pending decision.
4. Existing reliable understanding evidence, reducing needless repetition.
5. Transfer value for similar priorities.
6. Coverage of distinct decisions, avoiding three variants of the same judgment.

Keep at most three priority candidates; fewer are valid. Then gate each candidate:

| Gate result | Handling |
| --- | --- |
| `QUIZ_ELIGIBLE` | A unique supported judgment can be assessed by short multiple choice with plausible distractors and few extra premises. |
| `WORK_VERIFICATION` | Actual work performance or an operation is needed; retain the need without executing it in the quiz. |
| `TECHNICAL_REVIEW` | Formal scrutiny is required; identify the issue and existing review route. |
| `BLOCKED_UNVERIFIED` | The answer lacks trusted support or sources conflict; stop this KU and record what needs verification. |

Gate all priority candidates before choosing the highest eligible one. Preserve high-risk excluded candidates and their handling in the final summary; do not silently substitute a low-risk quiz as proof of coverage.

## Internal KU contract

Record the following compactly for each selected KU; expose details only when useful or requested:

| Field | Meaning |
| --- | --- |
| `ku_id`, `knowledge_concept` | Local target identifier and relatively stable concept. |
| `owner_role`, `decision_ref` | Confirmed responsibility and locatable critical judgment. |
| `understanding_target`, `necessity_reason` | One observable target and its necessity. |
| `prerequisite_kus`, `boundary` | Necessary dependencies and excluded knowledge. |
| `risk_level`, `source_refs` | Failure consequences and supported snapshot/ranges. |
| `quiz_suitability`, `expected_evidence` | Gate result and the performance a question can elicit. |

Use a simplified **Claim–Evidence–Task** link: what local understanding claim is sought; what observable judgment supports it; which question elicits that judgment. Specify the evidence limit. A correct selection can support result recognition or causal reasoning in the given scenario; it does not prove independent implementation, long-term mastery or performance in every related task.

## Trust and freshness

Prefer explicitly accepted responsibilities, requirements and project rules, together with independently inspectable source facts and existing execution records. A generated spec or plan is a claim-bearing input, not self-validating evidence. Cite relevant requirements/code/test records so the correct answer can be checked without relying solely on the generated explanation.

On conflicting requirements, spec, code or test evidence, state the conflict and defer the affected KU. Do not choose a "truth" by document title or by majority. Scope each question to its recorded snapshot. If an accessible source changes, invalidate affected unfinished diagnosis and regenerate only within the remaining budget. If main-chat changes cannot be observed, disclose that the quiz applies to the supplied snapshot.

Quiz evidence does not authorize data-security, permission, production, irreversible-operation or critical-business decisions. Keep necessary work verification / formal review visible even when quiz answers are correct.
