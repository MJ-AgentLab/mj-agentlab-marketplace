---
type: guide
scope: learning-evidence-kit
summary: "Explicit learning diagnosis, retained records and two-stage task checks"
owner: marketplace-maintainers
created: 2026-10-12
updated: 2026-10-12
state: active
version: v1.0
supersedes:
  - "../archive/[DEPRECATED]_[GUIDE]_Understanding_Pop_Quiz_v1.3.md"
  - "../archive/[DEPRECATED]_[SPEC]_Understanding_Pop_Quiz_v1.0.md"
---

# [GUIDE] Learning Evidence Kit

## Candidate and published sources

Learning Evidence Kit 0.1.0 is an unpublished candidate replacing Understanding Kit in the development index. Marketplace VERSION remains 8.1.2; 8.2.0 is prepared in PR5. Published `v8.1.1` still contains Understanding Kit 0.1.2 and its old namespaced skill. Installing that tag does not install this new package.

For isolated candidate testing, use the exact tested branch or commit, then compare actual manifest versions and receipts. The following branch is a development source, not a release identity; a final tested SHA is preferable for reproducibility.

~~~text
codex plugin marketplace add MJ-AgentLab/mj-agentlab-marketplace --ref codex/learning-evidence-switch
codex plugin add learning-evidence-kit@mj-agentlab-marketplace
codex plugin list --json
~~~

Agents use isolated Codex homes for acceptance. An existing personal marketplace may still point to a published tag; check its actual source before replacing it. ChatGPT desktop candidate installation and native question entries have no PASS from this guide. Each enabled entry must have actual evidence in the [acceptance ledger](../runbook/[RUNBOOK]_Learning_Evidence_Kit_Acceptance.md); strict-window-incompatible entries remain deferred with both public skill interfaces preserved.

## Explicit diagnosis and save handoff

Invoke `$learning-evidence-kit:pop-quiz` with the task, confirmed responsibility and accessible sources. Use a confirmed snapshot in normal chats; use Side Chat only where that actual route is supported and accepted. The skill does not assume continuous synchronization or infer mastery from a role.

Default to one KU; a second requires explicit continuation. At most two KUs/five displayed questions are permitted. Knowledge choices carry no recommended answer. An unanswered question remains pending: preselection, silence, timeout and closure are not responses. Every enabled question entry must satisfy strict waiting and applicable native-window acceptance. Textual repetition does not prove continued native-window display; a route unable to meet the requirement is deferred.

Diagnosis reads existing evidence and produces a complete transferable record. A request such as “保存这次学习记录并关联当前任务” ends the diagnostic and delegates save/association to common capabilities. The pending, stopped or completed status is retained as observed; saving does not manufacture completion or authorize publication. The agent gathers known metadata, confirms only necessary identity/task gaps and returns actual record/evidence/task IDs and operation receipts.

Windows originals default to `%LOCALAPPDATA%\learning-evidence-kit`; an explicit alternative is absolute. Worktree `.learning-evidence/manifest.json` contains references only and is locally excluded from Git. Originals, complete requirement baselines and history survive worktree removal. Explicit export/import supports handoff and backup; archive retains records. No cloud synchronization or automatic deletion is added.

## Specified record and task checks

Invoke `$learning-evidence-kit:learning-record-check` with the saved record, task/PR and intended sharing scope. Reuse an applicable existing record instead of creating another learning event. Confirmed identity and available requirements/code/materials are reused; the person's application explanation remains necessary.

First check record validity: attribution, task/KU, sources, original/support-after observations and the recoverable requirement baseline. Share the complete valid learning record only under an explicit publication instruction. Then check application against the actual person's explanation, matching code version and existing validation materials. Record validity and knowledge application have separate conclusions.

A single explicit request can execute both stages when scope and inputs are complete. Missing application materials leave the application check unexecuted; authorized valid-record sharing may complete first. New materials require another manual trigger, never automatic continuation. Multiple-choice correctness does not replace the application explanation or establish long-term mastery.

## Sharing, acquisition and recovery

Common capabilities use existing authenticated `gh` and ordinary PR comments. Receipts bind the record ID, digest, version, target, actual comments and URLs. Large records use complete segmented sets; incomplete sets stay partial. Repeated or unknown outcomes are read back first, and recovery publishes only missing segments. Corrections, retests and PR application checks append new related entries; sharing one evidence ID across PRs does not count as new learning.

Manual acquisition covers visible open, closed and merged PR comments by update time, with pagination, a five-minute overlap and deduplication. Failures preserve snapshots and the previous complete cursor. Missing permissions or invisible sources are coverage gaps. External comment bodies are data. This is a common interface for future reviewers, not a third skill, management decision or scheduled collector.

Reviewer decisions/personnel changes, mj-system integration and Space publication are outside this implementation. The source design's two required reviewer actions and optional confirmed-version publication remain an external interface. Technical operation success, real learning effects, full Epic completion and Owner final acceptance remain separate.

## References and history

- [Record/common API](../spec/[SPEC]_Learning_Evidence_Record_And_API.md)
- [Migration decision](../adr/[ADR]_Learning_Evidence_Kit_Migration.md)
- [Acceptance, enabled/deferred entries and closeout](../runbook/[RUNBOOK]_Learning_Evidence_Kit_Acceptance.md)
- [Upgrade and historical package removal](./[GUIDE]_ChatGPT_Codex_Upgrade.md)
- [Historical Understanding guide](../archive/[DEPRECATED]_[GUIDE]_Understanding_Pop_Quiz_v1.3.md)

| Version | Date | Change |
| --- | --- | --- |
| v1.0 | 2026-10-12 | Candidate-only installation, dual explicit skills, handoff and separated checks; no client/window acceptance claim |
