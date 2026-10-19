---
type: guide
scope: communication-kit
summary: "Communication task entry with one current plan and recoverable accepted sources"
owner: marketplace-maintainers
created: 2026-10-19
updated: 2026-10-19
state: active
version: v1.0
layer: working
task: 222-communication-kit
tracking: https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/222
plan: "./[PLAN]_Communication_Kit.md"
report: "./[REPORT]_Communication_Kit.md"
sources: "./source-bindings.json"
canonical:
  - "../../docs/adr/[ADR]_Communication_Kit_Addition.md"
  - "../../docs/rule/[STANDARD]_Documentation_Framework.md"
---

# Communication Kit

[Issue #222](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/222) 是原任务进度正本；本入口统一计划、事实和恢复路径，完成或续跑仍复用。

- [唯一主 PLAN](./[PLAN]_Communication_Kit.md)：当前维护范围、已接受来源、后续承接和实际授权边界。
- [主 REPORT](./[REPORT]_Communication_Kit.md)：已存在交付事实、历史限制及本次目录整合；不将旧计划的“待执行”当作当前状态。
- [来源清单](./source-bindings.json)：原实施计划和捕获记录的固定 Git 原件及同字节快照，只供恢复，不是并行维护的主计划。
- 产品行为与验收口径见 [ADR](../../docs/adr/[ADR]_Communication_Kit_Addition.md)、[SPEC](../../docs/spec/[SPEC]_Communication_Communicate.md)；历史执行细节见[验收账本](../../docs/runbook/[RUNBOOK]_Communication_Kit_Acceptance.md)。

2026-10-19 来源为 [#269](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/269) 的路径整合范围和固定 develop 91f982f7；本批只统一阅读/恢复入口，下一操作由 Agent 完成 #269 的工程门禁，不重启 Communication 运行开发或追认旧缺证。进度冲突时以 #222 / #269 各自承担范围为准。
