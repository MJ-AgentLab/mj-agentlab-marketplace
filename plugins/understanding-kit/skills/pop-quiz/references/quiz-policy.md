# Adaptive quiz and feedback policy

## Question design

Q1 assesses result recognition: a predicted outcome, behavior or decision. Q2 assesses its causal mechanism or constraint. Both target the same primary KU. Generate and quality-check both before showing Q1; show them sequentially and lock a submitted response before the next question. If Q2 would reveal Q1's answer, revise the pair. Do not announce Q1 correctness, praise the selection or give a misconception hint while collecting diagnostic evidence.

Each question needs a complete context, four mutually exclusive A–D knowledge answers, one supported correct answer and three distinct plausible distractors. Keep reasonable answer length and specificity balanced. Place the correct answer without a consistent position, recommendation label or UI default that reveals correctness. "Uncertain" and "skip" are independent controls; a user may select an answer and separately express low confidence, or express uncertainty without an answer.

Keep the answer key separate from displayed text:

| Internal field | Purpose |
| --- | --- |
| `primary_ku`, `required_kus` | Primary target and all actual dependencies. |
| `diagnostic_target` | Result / Reason / Transfer. |
| `source_refs`, `correct_answer` | Independently checkable answer and snapshot. |
| `distractor_misconceptions` | Possible misconceptions, not certain diagnoses of the person. |
| `question_phase` | `pre_feedback` or `post_feedback`. |

Before display check target alignment; mutually exclusive answers; trusted answer evidence; complete determining premises; no Q1/Q2 leakage; only necessary extra knowledge; and distractors that will be corrected rather than reinforced. Repair or skip a failed question before display. If failure is discovered after display, mark `INVALID_ASSESSMENT`, explain the ambiguity and count the displayed question against the budget. Never score a multi-answer question as the owner's error.

## Diagnostic transition table

Collect both base answers before selecting a branch. Do not emit a KU Brief or score first if a diagnostic Q3 is needed.

| Q1 | Q2 | Preferred next step |
| --- | --- | --- |
| Correct | Correct | Finish with a short Brief. Only append diagnostic Q3 when important transfer evidence is missing and a valid new scenario fits the budget. |
| Correct | Incorrect | Explain the identified mechanism gap, then optionally offer a post-feedback practice Q3. |
| Incorrect | Correct | Use a diagnostic Q3 before feedback when a valid new scenario can disambiguate the inconsistent signals. |
| Incorrect | Incorrect | For a clear shared misconception, explain then optionally practice. For unclear causes, prefer diagnostic Q3 before feedback. |

Before choosing the shared-misconception branch, compare the meanings of both selected distractors and any volunteered rationale. A clear common cause must account for both actual selections together. Two incorrect labels alone do not establish that cause. Contradictory mechanisms or several plausible prerequisites leave attribution uncertain: use a supported diagnostic Q3 before any score, answer or teaching, or finish with an explicitly bounded `UNCERTAIN` conclusion when none is available. Keep each observation distinct instead of assigning both to the most convenient misconception.

No branch requires Q3 just to use the budget. If a valid new scenario cannot be supported, give bounded feedback without Q3. Do not make Q3 a numeric or wording reskin; vary a meaningful setting or constraint while measuring the same KU, recording dependencies and avoiding unexplained prerequisites.

Before displaying Q3, identify internally the meaningful change relative to both base questions and why it adds evidence for this KU. Change a relevant relationship, grouping boundary, operational choice or business condition, with all determining premises stated. Keep the original KU target. Replacing names, values or wording while retaining the same tested structure supplies no new transfer evidence; omit Q3 if the novelty check cannot identify a meaningful change. A scenario need not change the query operation when a changed relational boundary itself tests the target in a new way.

- **Diagnostic transfer:** base answers → new-scenario Q3 → unified feedback. This supplements pre-feedback evidence.
- **Post-feedback practice:** base answers → brief correction → new-scenario Q3 → feedback. Record only immediate application; do not retroactively treat a correct Q3 as pre-existing understanding.

Uncertainty without an answer is `UNCERTAIN`, not an incorrect answer. If an answer is also supplied, preserve both its correctness and uncertainty. Skips retain the evidence already collected and consume the displayed question; do not endlessly replace skipped questions. With incomplete base evidence, choose the lowest-cost useful feedback or follow-up within the budget, and state the limitation rather than forcing the correct/incorrect table.

## Waiting and user control

Use native choice tools only when available and able to show four knowledge choices without answer leakage. In another environment, show a compact A–D question in chat. Offer uncertainty, skip, brief explanation and stop as controls in text or separate native controls; avoid tools that force a recommendation of a knowledge answer. A host's preselected first option is not a submitted answer. Never count silence, elapsed time, window closure or automatic timeout resolution as a user answer or permission to continue.

Keep one pending knowledge question. A partial/ambiguous response needs clarification without scoring; once explicitly submitted, lock it for the remaining pre-feedback diagnostic branch. A user correction can be recorded without pretending the original response did not occur. If the UI loses the pending question, restate that same question and wait; it consumes no new slot. Do not promise that a skill can prevent host closure, turn changes or interruption.

Respect explicit user control immediately:

- **Skip:** no incorrect score; preserve incomplete evidence and proceed only when useful and budget allows.
- **Uncertain:** no forced answer; preserve uncertainty as a distinct signal.
- **Explain:** clarify wording without giving the answer when possible. If the requested explanation teaches the tested knowledge, provide it, end the pre-feedback diagnostic branch and mark contamination; subsequent answers are `post_feedback` only. Do not ask permission again to provide the requested explanation.
- **Stop:** no new question or automatic continuation. Give a short summary of collected evidence and remaining risks.

## Budget and continuation

Count each newly displayed question, even if skipped or later invalid. Restating a pending question does not increment the count; displaying a replacement does. Never exceed five questions or two KUs. Reserve two base questions before starting the second KU, and get explicit continuation first. If the first KU used three questions, the second has two slots and no adaptive Q3. Important remaining risks go into the summary, not into unrequested extra questions.

An explicit additional-learning request beyond the limit starts a separately identified session; it does not silently reset the current budget. Do not append another question after a stop or while waiting for consent to a second KU.

## Briefs and result labels

After each KU, give **core understanding**, **diagnostic feedback** and **work connection** in a short Brief. Correct answers merit concise confirmation; errors merit one targeted correction; inadequate evidence merits a clear limit. For example: "This option confuses amount-value uniqueness with order identity; distinct orders can share an amount." Do not turn a distractor into a global assertion that the owner lacks SQL competence. A question with several required KUs cannot uniquely attribute one error to one KU.

Use these local states, combining observations when appropriate:

| State | Meaning |
| --- | --- |
| `UNASSESSED` | No valid diagnostic evidence. |
| `CORRECT_IN_QUIZ` | Correct pre-feedback performance in this scenario. |
| `POSSIBLE_GAP` | Supported possible misunderstanding; attribution remains bounded. |
| `UNCERTAIN` | Owner uncertainty or insufficient evidence. |
| `IMMEDIATE_APPLICATION` | Correct application after instruction. |
| `INVALID_ASSESSMENT` | The question or scoring cannot support diagnosis. |

For teaching followed by Q3, report pre-feedback signals and post-feedback application separately. Two or three correct choices do not prove stable independent mastery or permanent movement from Q2 to Q1.

Finish with a compact summary of task, confirmed role, snapshot, checked KUs, observed signals, remaining uncertainty, and separate work-verification / technical-review needs. Include significant gated-out or unassessed risks even when the selected quiz went well. Keep results in the current chat rather than saving personal scores or changing engineering artifacts.
