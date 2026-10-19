---
type: guide
scope: marketplace
summary: "Plan path unification implementation and delivery entry"
owner: marketplace-maintainers
created: 2026-10-19
updated: 2026-10-19
state: active
version: v1.2
layer: working
task: 269-plans-path-unification
tracking: https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/269
plan: "./[PLAN]_Plans_Path_Unification.md"
report: "./[REPORT]_Plans_Path_Unification.md"
sources: "./source-bindings.json"
canonical:
  - "../../docs/intent/[INTENT]_INT-2026-002_Plans_Path_Unification.md"
  - "../../docs/rule/[STANDARD]_Documentation_Framework.md"
  - "../../docs/rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md"
---

# Plans path unification

[Issue #269](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/269) 为进度正本；[INTENT](../../docs/intent/[INTENT]_INT-2026-002_Plans_Path_Unification.md)保存唯一需求原意。

- [主 PLAN](./[PLAN]_Plans_Path_Unification.md)：接受来源、实施授权、两子 PR 的承担范围、验收及恢复。
- [来源清单](./source-bindings.json)：完整 B1、七项执行原则原文及 Owner 纠正/授权的可恢复原件。
- [主 REPORT](./[REPORT]_Plans_Path_Unification.md)：实际修改、首次失败/修复、当前候选验证及仍需完成的门禁。

2026-10-19，按 Issue #269 与主 PR #270：内部 #271/#272 已实际合入集成分支，核心代码同树的 612 测试/13 安装/实际 Python 通过。当前下一操作由 Agent 完成最终来源绑定检查和真实主 PR 门禁；develop 保护批准、实际合入与 Owner 最终接受尚未发生。快照冲突时以 Issue 为准。
