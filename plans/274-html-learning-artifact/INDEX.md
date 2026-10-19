---
type: guide
scope: html-guide-kit
summary: "Issue 274 HTML learning artifact task entry and recoverable sources"
owner: marketplace-maintainers
created: 2026-10-19
updated: 2026-10-19
state: active
version: v1.3
layer: working
task: 274-html-learning-artifact
tracking: https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/274
plan: "./[PLAN]_HTML_Learning_Artifact.md"
report: "./[REPORT]_HTML_Learning_Artifact.md"
canonical:
  - ../../docs/intent/[INTENT]_INT-2026-003_HTML_Learning_Artifact.md
  - ../../docs/adr/[ADR]_HTML_Learning_Artifact_Extension.md
  - ../../docs/spec/[SPEC]_HTML_Learning_Artifact.md
  - ../../docs/guide/[GUIDE]_HTML_Learning_Artifact.md
sources: ./source-bindings.json
---

# HTML learning artifact task entry

[#274](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/274) 是进度正本。

- [主 PLAN](./[PLAN]_HTML_Learning_Artifact.md)：授权、原计划完整覆盖、子 PR 顺序、验收与恢复。
- [原意 INT-2026-003](../../docs/intent/[INTENT]_INT-2026-003_HTML_Learning_Artifact.md)、[扩展 ADR](../../docs/adr/[ADR]_HTML_Learning_Artifact_Extension.md)、[site SPEC](../../docs/spec/[SPEC]_HTML_Learning_Artifact.md)、[使用指南](../../docs/guide/[GUIDE]_HTML_Learning_Artifact.md)。
- [来源清单](./source-bindings.json)：原计划完整字节、本轮请求及捕获元数据。冻结来源只用于恢复，不作第二主计划。
- [唯一主 REPORT](./[REPORT]_HTML_Learning_Artifact.md)：版本化工程/独立消费者/私有Sites与失败恢复；[主PR275](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/275)、[原子子PR276](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/276)、[验收子PR277](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/277)承接本批，进度仍以Issue为准。

2026-10-19：276/277与主PR275均已合入，actual develop65d756ef同已测1a80/tree d7de559f。独立actual65d十三安装/178命令、6Diagram+18LEK/4site生成+4静态Python新验通过，自有根无残留；275空reviews/规则实际bypass为批准NOT_MET，不作未来豁免。沿用P5授权准备[8.3.2正式发布](../../docs/runbook/[RUNBOOK]_Marketplace_8_3_2_Release_Readiness.md)，新main门禁/公开、延期与Owner接受独立，旧FAIL及效果NOT_MEASURED保持；详见REPORT/Issue。
