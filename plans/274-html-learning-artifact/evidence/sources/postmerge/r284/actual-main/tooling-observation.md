# Tooling observation before product checks

The initial PowerShell-only read attempted `git rev-parse HEAD^{tree}` without quoting the argument. PowerShell parsed that argument incorrectly and Git reported an ambiguous revision (`dAByAGUAZQA=` / `-encodedCommand`). The command made no repository changes. This was an agent command-construction error, not a product or test failure. The check runner uses Python subprocess argv throughout and correctly records the tree.

The same initial read found no `node_modules`, so the runner executes one `npm ci` before tests. Bare `python` was unavailable from the host PATH; the runner prepends the existing bundled Python directory only to its child-process environment. No persistent environment settings, dependencies, source files, thresholds, or tests are changed by this observation or runner. No product check is retried.
