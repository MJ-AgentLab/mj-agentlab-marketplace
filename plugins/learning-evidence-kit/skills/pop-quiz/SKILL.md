---
name: pop-quiz
description: "Explicitly diagnose the knowledge needed for your task and produce a complete transferable learning record. Start only when you request Pop Quiz. Interactive questions require a client entry that passed strict-window acceptance."
---

# Pop Quiz

Use the user's language; default to Chinese and retain original terms. Start only on explicit request. Discovery during engineering work supplies no quiz/save authorization.

An explicit handoff of an existing complete record goes directly to Transfer and handoff; it does not require an interactive entry, new questions or a completed quiz.

## Establish context and entry

Read [client entry acceptance](../../references/client-entries.json) before requesting quiz setup facts. Interactive questions require an enabled entry matching actual client/version and retaining its window until explicit submission. With no matching enabled entry, report deferred route/missing evidence, preserve supplied observations without displaying/scoring new knowledge questions, and stop diagnosis. Textual restatement or pending flag is not native-window acceptance.

For a qualified entry, identify task, confirmed responsible person, responsibility, full requirement baseline and independent knowledge sources. Reuse confirmed identity/scope; ask only for essential missing facts. PR authors, source authors and operators do not establish responsible-person identity. Prefer an accepted Side Chat entry; other entries require an explicit accessible snapshot, without assuming continuous synchronization.

Read [KU selection](references/ku-selection.md). Follow Role → Decision → MNK → KU → Top 3, then suitability. Default to one supported QUIZ_ELIGIBLE KU and retain unassessed risks. Requirement intent is not an answer key. Read accessible sources/versions; project program/test/build execution, edits, publication and engineering-state changes are outside diagnosis.

## Diagnose through a qualified entry

Read [quiz policy](references/quiz-policy.md). Prepare two base questions, optionally one adaptive Q3. Display sequentially and lock explicit responses. Each question has four mutually exclusive knowledge choices, one independently supported correct answer and three plausible distractors. No knowledge answer is recommended or preselected. Uncertainty, skip, explanation and stop are separate controls. Withhold scores, answers and hints until diagnosis ends.

Keep one question pending. Silence, defaults, automatic resolution, timeout and closure are not answers. Clarify ambiguity without scoring; advance only after explicit answer/skip/stop. If a qualified entry loses its pre-submission window, suspend the entry, preserve the same pending question and record failure; textual redisplay is no PASS. Respect stop. Teaching on request ends pre-feedback diagnosis; subsequent observations are supported performance.

Apply policy attribution/scenario-novelty checks before Q3. Two wrong answers alone do not establish a shared misconception; renamed/numeric reskins are not new transfer evidence. Finish each KU with target, signals, core understanding and work connection, distinguishing initial/supported responses. These observations establish neither stable competence nor engineering approval.

Second KU needs explicit continuation recorded as provenance.second_ku_continuation. Reserve two base questions. Hard limits: two KUs/five displayed questions, including skipped/invalidated displays. Restating the same pending question costs no new slot. After three questions for KU1, KU2 has two slots. Further learning starts a separate explicit request.

## Transfer and handoff

Read [record/common contract](../../references/record-contract.md). Produce complete JSON and summary with confirmed person/source/operator, task/KU, original and supported observations, recoverable requirement content, independent sources, code/package versions, limits and actual quiz status. Preserve raw attribution and label synthetic cases; pending/stopped/interrupted is not completed.

Results remain in chat before handoff. Explicit save handoff ends diagnosis immediately and invokes common save with task/worktree association. Derive plugin root two parents above this actual SKILL.md directory; locate owned scripts/lek.py, never bare scripts/ against cwd. Locate actual Python 3.12; pass separate arguments and JSON stdin. Common save does not restart diagnosis or require another confirmation.

Return actual saved IDs/association/receipt or precise partial/blocked/error. Save invents no completion and publishes nothing. Corrections/retests append linked entries; PR reuse preserves evidence ID. Learning Record Check starts only on its explicit request.
