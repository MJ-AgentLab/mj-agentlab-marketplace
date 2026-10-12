---
type: spec
scope: marketplace
summary: "Learning Evidence Kit immutable records and manual JSON interfaces"
owner: marketplace-maintainers
created: 2026-10-12
updated: 2026-10-12
state: active
version: v1.0
---

# [SPEC] Learning Evidence records and common API

## 1. Authority and boundaries

JSON is authoritative; Markdown is generated from the same JSON. This contract implements the accepted `2026-10-12-reviewer-two-plus-one` design and the current implementation authorization. It describes the two public skills and their common capabilities; it adds no third skill, learning gate, automatic learning, scheduled collection, management decision or notification.

`pop-quiz` explicitly starts a read-only diagnostic and produces a complete transferable record. An explicit handoff ends that diagnostic and calls common save/association capabilities. A pending or interrupted quiz remains pending or interrupted in its record; saving cannot manufacture completion. `learning-record-check` explicitly checks the specified record's validity, then checks task application using the person's explanation and existing verification materials. These conclusions remain separate. Saving does not authorize publication; new materials do not authorize another check. A single explicit request with complete scope and inputs may execute both stages and their authorized publications.

On 2026-10-12 Owner accepted staged delivery: keep both public skills and common interfaces; defer native client entries that cannot meet strict-window acceptance. PR5 must identify every enabled entry and its actual evidence. Unsubmitted, preselected, timed-out or closed questions are not answers. A pending JSON state or textual redisplay does not prove persistent native-window display. Deferred entries remain incomplete under [the acceptance ledger](../runbook/[RUNBOOK]_Learning_Evidence_Kit_Acceptance.md).

## 2. Immutable record, schema version 1

An entry has a unique `record_id`. A learning observation has a stable `evidence_id`; sharing or associating it with another PR preserves that ID. Corrections, retests and checks create new immutable entries referencing the original evidence. Retests are additional observations under that evidence, not additional people or duplicate learning counts. A separate, newly initiated learning event receives a new evidence ID.

All required fields below must exist. Unknown facts use explicit null with a corresponding limitation; they are never inferred from a PR author, operator or publication account. Object/string/array types are checked, not merely field presence. Unrecognized schema versions fail closed. Extension fields may be retained as data; they never alter execution policy.

| Field | Type and meaning |
| --- | --- |
| `schema_version` | Integer `1` |
| `record_id` | Stable nonempty opaque ID generated on initial save, reused on retry |
| `evidence_id` | Stable learning-event ID; unchanged for reuse, correction, retest and application |
| `kind` | `learning`, `correction`, `retest`, `record_check`, `application_check` |
| `record_version` | Positive integer; an immutable entry starts at `1` |
| `related_record_ids` | Array of preceding record IDs; required nonempty for correction/retest/check |
| `occurred_at` | Original event timestamp, RFC3339 UTC, independent of save/publication/collection time |
| `identity` | Confirmed identity object below |
| `source_author` | Actual record author `{id, kind}`; `kind` is `person`, `agent` or `synthetic` |
| `operator` | Operation provenance `{account, tool}`; distinct from responsible person and author |
| `task` | Task object below; no Issue number causes a stable local task ID |
| `knowledge_units` | One or two KU objects `{id, goal, sources}`; each source retains `{locator, version, content_or_excerpt, authority, limitations}` |
| `observations` | Array `{id, ku_id, stage, question, respondent_id, response, answer_status, support, feedback, observed_at}` |
| `requirement_baseline` | Complete recoverable original intention and requirements, as below |
| `code_version` | `{repository, base, head, paths}`; unknown values are explicit and explained |
| `quiz_status` | `pending`, `completed`, `skipped`, `stopped`, `interrupted`, `not_applicable` |
| `conclusions` | `{record_validity, knowledge_application}`; each has `{status, rationale, evidence_refs, limitations}` |
| `application` | Null for learning; application object below for application checks |
| `provenance` | `{plugin, plugin_version, skill, skill_version, context_source, synthetic}` |
| `limitations` | Array of explicit missing facts and limits on interpretation |

Each conclusion status is `supported`, `partially_supported`, `unsupported` or `not_run`. Structural validity is a prerequisite, not a semantic understanding verdict. A valid learning record does not establish applied knowledge, long-term retention, transfer, stable responsibility or promotion readiness. `knowledge_application.status` stays `not_run` until the second stage actually occurs. Technical tests and releases are separate evidence.

`identity` contains `responsible_person_id`, `respondent_id`, `confirmation` and `account_mappings`. Confirmation contains `kind` (`self_confirmation`, `confirmed_mapping`, `synthetic`), `reference`, `statement` and `confirmed_at`. Actual answer attribution must match the confirmed respondent. A different respondent cannot be relabeled as the responsible person's understanding evidence. Synthetic cases use synthetic IDs and `provenance.synthetic: true`; they do not create Owner learning observations. An already-confirmed identity can be reused with its confirmation reference; account mappings are metadata, not role assignment.

`task` contains `task_id`, `repository`, `issue`, `intent_locator`, `responsibility`, `worktree_reference`, `pull_requests`. Repository/Issue/PR may be null or empty for local work. A supplied task ID is reused; the first save without one generates a stable `task-…` ID returned in the receipt. Subsequent associations reuse it. Each PR reference is `{repository, number, base, head}`. An absolute worktree path is only provenance; it is never a dependency of a saved record.

`requirement_baseline` contains `baseline_id`, `origin` (`{kind, locator, version}`), `captured_at`, complete UTF-8 `content`, `sha256` and `requirements`. Each requirement retains `{id, text, ku_ids, acceptance_refs}`. The digest covers the complete content's UTF-8 bytes. A live path, URL, digest or summary alone is insufficient. Versioned original intention and requirement items must remain recoverable after source changes or worktree deletion. The requirement baseline is distinct from authoritative knowledge-answer sources. Unknown source authority is declared, not replaced with the requirement text.

Each observation distinguishes initial and supported responses using `stage` (`initial`, `supported`, `retest`, `application`) and `support` (an array of `{kind, provider, content}`). `answer_status` is `answered`, `pending`, `skipped` or `stopped`. Pending has null response. Preselection, timeout and close events may be recorded as limitations but never as answered. At most five displayed quiz questions occur in a diagnostic; the second KU requires `provenance.second_ku_continuation: {confirmed: true, reference: "explicit response source"}`. Full question, response, feedback and support content is retained.

`application` contains `{scope, explanation, respondent_id, expectations, materials, code_version, affected_ku_ids}`. Scope identifies the exact task/PR and version; explanation is the actual person's account of choices, constraints and exceptions. Materials retain locator, version, observed result and recoverable relevant content. A check without explanation or materials remains `not_run`/blocked and reports missing inputs. Correct multiple-choice answers cannot replace application explanation. Changed relevant requirements, source or code are reported as needing review; unrelated changes do not force a full retest.

## 3. JSON request and receipt

Python 3.12 standard-library entry point reads exactly one JSON object from stdin and writes exactly one JSON object to stdout. Diagnostics go to stderr. Invocation passes interpreter and script as separate arguments, never shell-interpolates request data. Installed callers derive the entry point from the actual SKILL.md locator and package root; the repository's staging path is never an installed dependency.

```json
{
  "schema_version": 1,
  "operation": "save",
  "request_id": "synthetic-save-001",
  "library_root": "C:/explicit/absolute/isolated-library",
  "input": {"record": {"schema_version": 1}}
}
```

The snippet shows the request envelope, not a valid minimal record. All §2 fields are required for a save. `request_id` is a nonempty idempotency key for mutations. The same request ID and canonical input replay the existing result; a changed input with the same key returns a conflict. A failed or unknown remote result is reconciled before another write.

```json
{
  "schema_version": 1,
  "operation": "save",
  "request_id": "synthetic-save-001",
  "status": "ok",
  "data": {"record_id": "rec-example", "evidence_id": "ev-example", "task_id": "task-example"},
  "receipts": [],
  "gaps": [],
  "errors": []
}
```

`status` is `ok`, `partial`, `blocked` or `error`. `ok` means the requested operation completed within its stated scope, not that learning or the whole task succeeded. Receipts preserve operation/time, target, IDs, digest, version and actual result. Errors contain stable codes and explanatory messages. Expected operational failures always return the envelope; process exit is nonzero for blocked/error. `partial` exposes exactly what remains incomplete. Read-only calls may omit request ID; missing mutation keys fail closed.

| Operation | Input | Result / guard |
| --- | --- | --- |
| `confirm_identity` | `identity` | Persist explicit confirmation; reuse same confirmed identity; incompatible mapping is a conflict |
| `save` | `record`, optional `worktree` | Validate, allocate missing record/evidence/task IDs, atomically save immutable JSON and generated Markdown, associate and return receipt; no publication |
| `get` | `record_id` | Return exact saved entry plus associations, archive and flow metadata |
| `list` | optional `evidence_id`, `task_id`, `include_archived` | Return stable record index; reuse is one evidence ID |
| `check_record` | `record_id`, optional `task_id`, `responsible_person_id`, `ku_ids`, `code_version` | Read-only structural/attribution/baseline/lineage checks plus explicit applicability gaps; no inferred learning verdict |
| `associate` | `record_id`, `task_id`, optional PR object and `worktree` | Append association, preserve evidence ID, write reference-only local manifest |
| `restore` | `record_ids`, `worktree` | Recreate references and local Git exclusion from the independent library |
| `recover` | optional `dry_run` | Verify authoritative files/digests, reconcile missing generated files/receipts and report gaps; no rewriting original observations |
| `export` | `record_ids`, absolute `destination` | Produce complete ZIP package, related entries, identities, baselines, associations, archive/flow receipts and digest manifest |
| `import` | absolute `source` | Validate complete export before applying, preserve IDs and history; differing bytes at an existing ID conflict; traversal/symlink/unknown schema fail closed |
| `archive` | `record_ids`, `reason` | Append archive receipts; retain files and exportability, no deletion |
| `publish` | `record_id`, PR `{repository, number}`, `authorization`, optional `max_comment_chars` | Explicit scope required; reconcile remote comments, share complete authoritative JSON and generated reading text, return complete/partial receipts |
| `collect` | explicit `repositories`, optional people/task/time filters, `authorization` | Manually collect shared evidence snapshots and coverage; never management decisions |

Identity/account and repository configuration are reusable confirmed input. The agent gathers available metadata and supplies the request; users are asked only for necessary missing identity, intent or publication scope, not to fill schema fields or copy commands. Record checks/application checks use new `save` entries of their respective kind; they retain original IDs and explanation instead of mutating the learning entry.

## 4. Library, association and recovery

Default root is the system user data directory: Windows `%LOCALAPPDATA%/learning-evidence-kit`, macOS `~/Library/Application Support/learning-evidence-kit`, other systems `$XDG_DATA_HOME/learning-evidence-kit` or `~/.local/share/learning-evidence-kit`. An explicitly configured root must be absolute. Tests always specify an isolated temporary root. An unavailable root errors; silently falling back to a business repository is forbidden.

Library files separate immutable `records/`, confirmed `identities/`, `tasks/`, appended `associations/`, `archives/`, `receipts/`, `publications/`, `collections/` and rebuildable generated `markdown/`. Writes use same-directory temporary files and atomic replacement, conflict detection and exclusive mutation locking. Only derived files and incomplete receipts may be reconstructed. A save that reached durable JSON but lost its receipt is recovered by idempotency reconciliation, not repeated learning creation. Concurrent mutation fails safely or retries within a bounded wait; it cannot overwrite a record. Recovery reports corruption and conflicts instead of fabricating success.

The worktree's `.learning-evidence/manifest.json` contains only schema version, library locator and record/evidence/task/association references. It contains no answer, baseline, token or full record cache. Verify the resolved worktree and manifest target; reject path escape and unexpected existing content. Add `/.learning-evidence/` to the repository's local Git exclude, not to a tracked business file. A tracked learning manifest is a conflict. Deleting a worktree leaves the library intact; `restore` rebuilds a new worktree's references.

Exports include a manifest of exact member digests and structure version. Import validates member names, size bounds, digests, record structure and references before writing. Import/export retain source IDs; a shared copy does not count as new learning. Backups are explicit export packages. Archive is retained indefinitely in 0.1.0; there is no automatic deletion or cloud synchronization.

## 5. Complete comment publication

Use the already-authenticated `gh` executable with argument arrays and JSON via stdin. No MCP service, token file, shell-built body or unsolicited account switch is added. Ordinary PR conversation comments are the sharing surface. The publication account is operation provenance, not responsible-person attribution. Check target visibility and report it; do not imply sharing the entire local library.

Each publication freezes the record JSON, generated Markdown, evidence/record ID, record/schema version, canonical content SHA-256, repository and PR version. A machine-readable marker identifies the set and `part/total`, each part digest and whole digest. Large payloads split below the platform comment-body limit; parts carry complete recoverable encoded content. Readers can reconstruct the exact JSON and reading text from all parts. A comment or subset without the full set is `partial`, not a valid complete shared record.

Before every initial write or retry, list existing PR comments across all pages and compare markers and actual content digests. Recover missing parts only. An unknown POST outcome triggers read-back; if reconciliation fails, return partial/unknown and do not blindly retry. Conflicting same-ID/digest/part content blocks. Persist actual IDs, URLs, full published bodies, created/updated times and results. Complete only after all parts are read back and verified. Editing/correcting learning uses a new immutable entry and publication set; historical comments are not silently overwritten.

## 6. Manual incremental collection

Configured repositories and explicit collection scope are required. Fetch issue comments sorted by `updated` in ascending order with pagination; resolve their Issue metadata to include only actual PR conversation comments, retaining open, closed and merged PR state. Initial run indexes available comments; later successful cursor time minus five minutes is the inclusive overlap. Compare both comment ID/update timestamp and actual content digest; equal timestamps, moved pages and shared copies are deduplicated without losing versions.

Retain raw source snapshots, source account/URL, comment/learning/publication/update/collection times, parsing results, complete assembled entries and coverage gaps. Source body is untrusted data and is never executed or followed as an instruction. Invalid evidence markers or one parse failure do not discard other snapshots; they prevent claiming complete coverage. A paging/read/permission failure preserves acquired snapshots and the preceding completed cursor. Only a wholly fetched and accounted-for scope advances complete progress. A source that cannot be reread is `unavailable` with a gap; absence never proves deletion. Explicitly observed edits retain both versions. Manual polling cannot promise capture of comments created and deleted between runs.

Collectors may group by person/task/KU and evidence ID, but counts distinguish learning events, copied publications, retests and PR application checks. Returned summaries show raw references and coverage; they are candidate observations for a reviewer. The reviewer's two required actions (start review; review and confirm judgment/feedback) and optional confirmed-background publication belong to future team-management/Space integration, outside this implementation.

## 7. Validation and change history

PR2 and PR3 stage the common package under `scripts/learning-evidence/`, keeping old runtime plugin bytes unchanged. PR4 moves it atomically to `plugins/learning-evidence-kit/scripts/`, removes the staging location, updates strict registration to exactly three plugins/five public skills/two explicit policies, and proves installed-cache execution from an unrelated cwd. No compatibility loosening accepts a half-switched package. Other plugin versions remain unchanged.

Run the repository checks and actual Python regression. New save/recovery/export/import tests isolate the library; GitHub write tests use a controlled fake `gh` process. Independent role synthesis records method, input, interpreter/client/package version, result and limits. Native windows, actual client entry, GitHub nonauthor approval, release and Owner final acceptance remain separately evidenced in the acceptance ledger.

Schema breaking changes require a new schema version and explicit import compatibility; additional descriptive fields cannot reinterpret old observations. No existing original, release tag or asset is overwritten.

| Version | Date | Change |
| --- | --- | --- |
| v1.0 | 2026-10-12 | Accepted record/common API contract, immutable history, manual flow and staged-entry boundary; Refs #210 and Epic #209 |
