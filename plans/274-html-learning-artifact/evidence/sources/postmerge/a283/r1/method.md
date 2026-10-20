# #284 CI terminal audit

Read-only GitHub GET audit, exact head 318db5a5660920f4fcd95f0f96c352d012514815. No review, comment, rerun, cancellation, merge, push, checkout, workflow or repository changes. All evidence is external TEMP.

observe.mjs runs gh api GET in parallel for PR, exact run metadata and full jobs, Git commit objects, and current head checks. Raw stdout and stderr are saved without decoding/re-encoding. Per-request start/end, exit/signal/timeout, byte counts, SHA-256 are recorded in transport.json. Downloads use the same raw-byte capture and retain per-request commands. Successful downloads are cached, not fetched repeatedly.

Intended observation cadence is at least 60 seconds. Actual first follow-up started 46.328 seconds after the initial snapshot (a cadence exception); subsequent starts were 69.648, 67.327, 79.218 and 72.043 seconds apart. All timestamps remain in original transport receipts. A success-labelled proof job is interpreted from its actual MJ_PR5_DEDUP_REPORT, not from the job label. In-progress is not PASS. Terminal matrix logs will be parsed independently for TAP test totals, platform skip, complete smoke JSON scenario/command/actual Python/site summaries, checkout commit, and cleanup scope. Git commit objects bind checkout commits to trees and parents. Validation status cannot substitute for real test totals.

Workflow/package/smoke implementation files are read at the exact head using GitHub contents raw response. Raw job log bytes mean the full bytes returned by the GitHub job-logs endpoint through gh; this audit does not claim unmasked runner filesystem capture. Skipped jobs have no execution log and are listed separately. No independent GitHub approval is created or inferred.
