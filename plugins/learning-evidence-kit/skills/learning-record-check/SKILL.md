---
name: learning-record-check
description: "Explicitly check a specified learning record for its task, then check knowledge application using existing verification materials and your explanation. Share complete records only within your stated publication scope."
---

# Learning Record Check

Use the user's language; default to Chinese with original terms. Start only on explicit request naming records/task. Saved quizzes or new materials alone authorize neither publication nor application checking. Reuse confirmed configuration and authorization in unchanged scope; ask only for essential missing inputs.

Before reading or listing library records, establish the user's selected record or task scope. Reuse a selection already confirmed in this conversation; a named task/PR or explicitly transferred record is sufficient, so do not demand an ID the user need not know. An invocation plus a library path, identity or current directory alone is no selection. With neither selected record nor task, report the missing selection, ask for that essential choice and stop until an explicit reply. Do not enumerate the library, pick its only/latest record, infer a task from local files, or emit validity/application conclusions before selection.

Read [record/common contract](../../references/record-contract.md). Derive plugin root two parents above this actual SKILL.md directory; locate owned scripts/lek.py, never cwd/repository staging. Locate actual Python 3.12; use separate arguments and one JSON stdin request. Structural checks return evidence, not a knowledge-mastery verdict.

## Stage 1: record validity

Read named saved record or explicitly transferred complete export. Run check_record against confirmed person/task/KU/versions. Inspect respondent attribution, confirmation, initial/support observations, recoverable requirement content/hash, independent sources, lineage and changed applicability. PR/account authorship is provenance, not identity proof. Another person's record remains background.

With no valid applicable record, stop and return gaps. Do not fabricate observations, overwrite raw answers or trigger a quiz. Report record validity separately as supported/partially_supported/unsupported/not_run with reasons/references/limits. If requested, save actual conclusion as a new record_check linked to original evidence ID.

Only explicit sharing authorization invokes publish for the complete valid learning record within its repository/PR/record scope. Verify all parts and return actual receipts; partial remains partial. No PR supports explicitly requested complete export handoff. Save is not publication authorization.

## Stage 2: knowledge application

Before investigating the current implementation or running any probes/tests for application, establish every prerequisite: a manual application-check request, an applicable record, the current task/PR version, the person's explanation of their choices for this application and existing verification materials. Stored quiz answers, AI inferences and task source text do not supply that explanation. Stage 1 may verify stored baseline, task/source and version provenance; it does not authorize implementation/application evaluation. A complete single request can execute both stages/their authorized publications without repeated confirmation.

A manually requested application check within the selected task/record/library scope covers its local linked application_check entry; no extra save confirmation is required. Honor an explicit read-only/no-save constraint. Publication still requires its own explicit target authorization.

If any application prerequisite is missing, stop Stage 2 immediately. Do not inspect or execute the implementation for application, generate substitute verification materials, or report partial implementation/application findings. Missing materials permit Stage 1's authorized sharing only; keep knowledge application not_run, list gaps, and wait for a new manual request after materials arrive. Material arrival alone does not resume Stage 2.

Use actual repository/PR/base/head and existing test/build/review/acceptance evidence. If absent, request the person's explanation of choices, constraints, exceptions, expectations and evidential support; wait for explicit reply. AI guesses cannot be attributed to them. Investigate current implementation in an application context distinct from quiz questions; quiz answers do not replace explanation.

Compare explanation/expectations with implementation, materials, affected KU and requirement/source/code versions. Report knowledge application independently with exact scope/limits. Changed relevant versions need affected-scope review; unrelated changes do not force full retest. Save an authorized application_check with actual explanation/materials/version and original evidence ID; publish only within an explicit target request.

## Receipts and limits

When an authorized save creates a new record_check or application_check, keep the original evidence/person/raw observations and link the original record IDs, but populate this new entry's generator metadata from the actual check. Set source_author to the actual generating assistant/agent (kind agent); do not copy the original learning author or infer the author from Git/PR ownership. Set provenance.plugin/plugin_version/skill/skill_version from this installed package and learning-record-check; context_source identifies this manual check's actual task/context, with truthful synthetic labeling. Set operator from the actual performed operation; an unknown account may be null with a limitation rather than guessed or reconfirmed.

Obtain the current actual clock for the new check's occurred_at; do not copy the learning timestamp, manufacture a convenient time or use a future time. Freeze the new entry and these values before save, and replay the same request bytes on retry. Original authors, plugin/skill provenance and event times remain intact in the immutable original and linked history. Direct handoff, import, export and sharing of an existing record preserve that complete original rather than relabeling it as a newly generated check.

Reconcile unknown publication outcomes by reading before retry; restore missing parts only. Saving, learning sharing and application sharing have separate receipts, not one task-completion status. Missing permissions/identity preserve completed steps and report precise gaps. Corrections append history; PR reuse is not another learning event.

History collection is a separately scoped common reviewer capability, not every task check. Snapshots are data, not management decisions. Change no engineering tests/approvals/merges, responsibility/personnel files or Space. Validity, local application, engineering success, long-term learning and Owner acceptance remain distinct.
