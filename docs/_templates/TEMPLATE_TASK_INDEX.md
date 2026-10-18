---
type: guide
scope: marketplace
summary: "<task purpose and reading entry>"
owner: <responsible team>
created: <YYYY-MM-DD>
updated: <YYYY-MM-DD>
state: active
version: v1.0
layer: working
task: <stable directory basename>
tracking: <actual repository Issue/PR URL or stable Codex/ChatGPT task URL>
plan: "./[PLAN]_<Topic>.md"
# Add report only after actual results exist; then create exactly one main REPORT.
# report: "./[REPORT]_<Topic>.md"
canonical:
  - ../../docs/rule/[STANDARD]_Documentation_Framework.md
# sources: ./source-bindings.json
---

# <Task reading entry>

[主任务 / Issue / Epic](<actual tracking URL>) 是工程进度正本；无 Issue 时使用真实任务入口。

- 目标、原意/接受范围、执行链：[主 PLAN](./[PLAN]_<Topic>.md)。
- 实施、失败恢复、未完成与交付：<actual main REPORT link when created>。
- 现行约定：<links to canonical requirement/ADR/SPEC and operational guidance>。
- 来源与原件：<source-bindings.json and necessary recoverable evidence links, if used>。
- 当前交付批次/主 PR：<actual PR link; sub PRs tracked by Issue or PLAN>。

## Progress snapshot

<Date/time and exact task/Issue source link>: <stage>; <critical gap>; <next action and accountable role>. 过期或冲突时以主跟踪入口为准。Keep this short; do not copy the complete progress or requirement table.
