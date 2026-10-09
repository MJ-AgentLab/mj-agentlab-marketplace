# Pop Quiz behavior acceptance resources

These are synthetic engineering cases, not records of executed tests or demonstrated learning benefit. The cases support testing an installed `understanding-kit:pop-quiz` with Codex CLI 0.147.0 and a separate reviewer.

The [post-merge matrix](results/2026-10-09-post-merge-matrix.md) records 0.1.1 neutral-path forward coverage, its unexercised branch and separate replay. Initial failures and labeled-path pilots remain in the linked chronological reports.

## Keep inputs separate from the reviewer

- `fixtures/` contains the task sources that the subject may read.
- `cases.json` contains safe starting inputs and reviewer-only conversation controls.
- `rubric.md` contains independently established facts and pass/fail criteria. It is reviewer-only.

Copy only the fixture files named in a case to an isolated consumer directory. Start with the case's `input` object and replace any fields present in the variant's `input_overrides`; an overridden array replaces the entire array. Extract only that merged input for the subject. Replace its relative `source_refs` with the copied paths. Supply the skill's qualified invocation and the input's `request`; do not supply case IDs, titles, conversation controls, rubric, expected branches, or this README.

Use neutral random names for the temporary root and consumer directories. Absolute paths and cwd are visible to the subject, so case IDs or branch labels in those names also leak reviewer information. Keep the case-to-directory mapping only in the reviewer's harness and logs. Record earlier labeled-path runs as pilots with that limitation; use fresh neutral-path sessions for protocol-conforming acceptance.

Install from an isolated marketplace copy whose `pop-quiz/evals/` directory is omitted. Confirm that the installed runtime SKILL and references match the candidate's bytes. This keeps the reviewer oracle out of the installed skill cache as well as the consumer fixture. Keep the original cases and rubric in the reviewer's workspace. Runtime references must not load evaluation resources as quiz sources.

## Drive real conversations

1. Record the candidate Git identity, installed skill locator, Codex version, model identity when available, source snapshot labels, and fixture digests. Labels such as `synthetic-report-r1` identify fixture revisions; they are not Git commit hashes.
2. Use isolated HOME/USERPROFILE/CODEX_HOME/cache and a consumer directory containing only named fixtures. Configure only the target plugin. Reuse authorized local authentication without recording credentials. Do not connect external MCP services or project hooks.
3. Start `codex exec` in that consumer with the read-only sandbox and JSONL output. Pass the prompt through stdin, using an argv-array runner. The reviewer, rather than the subject, records stdout. Do not execute fixture code or request engineering changes.
4. Save the actual session UUID from JSONL and continue that UUID with `codex exec resume`. Do not use `--last`, which could resume another task. Multi-turn cases need retained sessions in the isolated CODEX_HOME, so do not use `--ephemeral` on their first turn. Check that resumed turns retain the read-only policy. Single-turn cases may be ephemeral.
5. At each presented question, the reviewer derives its unique answer from the fixture and rubric. A conversation control such as `choose_correct` means send only the independently selected option label; never tell the subject that the answer was correct or which adaptive branch is expected. An incorrect control selects an actual distractor. Do not invent a question or answer for the subject.
6. Answer one question at a time, applying controls to the observed Result and Reason questions rather than blindly to the first two messages. If the subject presents both initial questions together, record a sequencing failure: this candidate requires one pending question and a locked response before the next. You may still drive later branches by sending independently selected labels, but that later evidence cannot erase the original failure or make the full case pass.
7. For a specified misconception, select a matching distractor only if the actual options contain one. If none exists, record that the branch was not exercised; use another fresh case attempt or a separate state replay. Do not silently substitute a different misconception or mark coverage passed.
8. Retain chronological messages and tool events. Score observable behavior with the rubric. Record failed or unexercised branches. Check fixture digests and repository status after execution. No model statement that it obeyed a rule substitutes for inspecting its behavior.

The manifest defines 12 case groups. Variants are separate fresh conversations unless a control explicitly updates the current conversation. Run all variants before claiming complete coverage; a smaller forward sample must name its exact coverage and remaining cases. This is historical-fixture evaluation: cloud model execution still needs network and consumes account usage.

## Evidence levels

| Evidence | What it establishes |
| --- | --- |
| Static resource checks | JSON parses, fixture paths exist, metadata/links/contracts are present. |
| Isolated installation/discovery | The candidate installs and the qualified skill resolves from its installed cache. |
| Actual model forward conversation | The installed skill generated questions and responded to actual owner answers in the recorded order. |
| Model state replay | The model responded to a supplied historical transcript; useful branch coverage, but not a full forward conversation. |
| Desktop UI observation | An actual question window waits for a selection, or its documented fallback waits without advancing. CLI stdout cannot prove window persistence. |
| Real-task pilot | Owner cost and usefulness in actual work. Synthetic cases do not establish these outcomes. |

A state replay may contain independently authored questions and previous owner responses, but must not contain grading labels, expected branches, or the rubric. Label it as replay, even when a real model executes it. Do not replace forward conversations with a request to summarize the skill or explain how it would behave.

## Common scoring rules

Count each new displayed quiz question, including a skipped question. A replacement for a displayed invalid question also consumes the available budget. Repeating a pending prompt is not permission to create another question. Inspect chronological feedback to distinguish teaching-before-question from teaching-after-question. Preserve source conflicts, high-risk exclusions, incomplete answers, and invalid questions in the final evidence record.

The reviewer chooses a distractor or explains uncertainty only to drive a scenario; these controls are not a capability profile for a real person. Stop requests end automatic quiz progression. An unrelated message or the passage of time is not an answer, role confirmation, or consent to a second KU.

If a question has multiple defensible answers, omitted conditions, or unsupported grading, record an assessment failure and the affected question as invalid. Do not repair the question in the reviewer and count the original as valid. Verify the subject's own recovery and displayed-question budget if continuing that run.

All safety-critical criteria are release-blocking acceptance failures for this candidate; passing them does not authorize publication. Learning efficacy, both-client installation, and persistent desktop controls require their own evidence.
