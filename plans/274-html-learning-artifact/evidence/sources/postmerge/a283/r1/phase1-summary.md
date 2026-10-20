# #284 phase1 terminal audit

Exact head 318db5a5660920f4fcd95f0f96c352d012514815, base e3dc40f734fc972e05956da3e908091e09963675; PR checkout ac34c52c0eab22368e5e2737ee59241f5aad2912, Git commit tree 44893ef4e8dcdc437d8bbeafb3b67960ef8baa29 equals head tree.

| Run / platform | Unit total | Pass | Fail | Skip | Smoke |
| --- | ---: | ---: | ---: | ---: | --- |
| PR 39363773472 / Ubuntu | 647 | 646 | 0 | 1 Windows-casing | 13 scenarios / 178 all-zero commands; 6 actual Diagram, 18 LEK (Python 3.12.15), 4 render and 4 static (95 checks each, 0 failed) |
| PR 39363773472 / Windows | 647 | 645 | 1 | 1 Linux-capture | NOT_RUN after unit failure |
| Push 39363755336 / Ubuntu | 647 | 645 | 1 | 1 Windows-casing | NOT_RUN after unit failure |
| Push 39363755336 / Windows | 647 | 645 | 1 | 1 Linux-capture | NOT_RUN after unit failure |

Both Windows failures: TAP621, tests/validate-portable.test.mjs:28 and assertion29, AGENTS.md exceeds configured instruction budget. Push Ubuntu failure: TAP330, tests/html-site-checks.test.mjs:316/assert329; checker exit2, NOT_RUN, no DevToolsActivePort; captured955B startupstderr retained and hash-verified. Five DBus errors observed; root cause UNKNOWN.

PR CI and push CI are terminal failure. A6 run39363773424 and both Structure jobs passed. Push proof reported skipPush=false/no_unique_exact_open_pr, so an actual second matrix ran; this is not a dedup pass. No rerun/cancel/review/merge/comment or repository mutation performed.

All9 executed jobs have full raw logbytes plus transport receipts. Two skipped jobs have metadata only. PR Ubuntu bounded smoke cleanup follows source calls, without an explicit physical-absence receipt; failed browser cleanup is separately scoped. Real GitHub approvals remain independent.

Method caveat: first followup was46.328s after initial snapshot; subsequent observations were>=60s. Raw timestamps retained. Future head evidence must use phase2/ without overwriting any frozen phase1 path.
