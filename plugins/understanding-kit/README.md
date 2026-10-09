# Understanding Kit

An explicitly invoked, evidence-grounded understanding micro-quiz for the decisions you own in software development. Published version: **0.1.1**, included in **Marketplace v8.1.0**; design baseline: **v0.3**. The initial 0.1.0 package identity was unpublished.

Invoke **`$understanding-kit:pop-quiz`** with the task, your responsibility and the relevant requirements, code, review or test records. Prefer a Side Chat when your client provides one. A regular ChatGPT desktop or local Codex chat can use the same flow with an accessible, clearly identified snapshot. The plugin does not create a Side Chat or continuously synchronize another chat.

Example request:

> Use $understanding-kit:pop-quiz. I maintain this sales report and need to judge whether the proposed query meets the approved order-level revenue definition. Use the attached requirements and query at the stated snapshot.

The skill works backward from responsibility and critical decisions to minimum necessary knowledge. It selects up to three priority candidates, checks suitability, and quizzes one KU by default. Two base questions may be followed by one adaptive question. A second KU requires your explicit choice to continue; a session never exceeds two KUs or five displayed questions.

There are four knowledge answers per question. You can also express uncertainty, skip, request a brief explanation or stop. Unanswered questions stay pending; a window default or timeout is not an answer. A pure skill cannot lock the host's window, so a lost question is preserved in chat. Correct answers are revealed after diagnosis; teaching followed by a correct answer records immediate application rather than prior mastery.

The skill reads task evidence and may use read-only file/version searches. It does not execute project programs or engineering operations, write artifacts, score personnel, approve work or message another chat. Unsupported answers, source conflicts and important untested risks are explicitly recorded. Short quiz results do not replace tests, technical review or real-work verification.

Install from the marketplace at main or pin v8.1.0. Installation and support status: see the [marketplace README](../../README.md), the [release record](../../docs/runbook/[RUNBOOK]_Marketplace_8_1_0_Release_Readiness.md) and the [acceptance record](../../docs/runbook/[RUNBOOK]_Understanding_Kit_Acceptance.md). Publication and CLI installation checks do not establish completed desktop acceptance.

The reusable behavior cases in [evals](skills/pop-quiz/evals/README.md) distinguish structural checks, actual model behavior and desktop interaction evidence.
