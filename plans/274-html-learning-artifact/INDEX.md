---
type: guide
scope: html-guide-kit
summary: "Issue 274 HTML learning artifact task entry and recoverable sources"
owner: marketplace-maintainers
created: 2026-10-19
updated: 2026-10-20
state: active
version: v1.7
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

2026-10-20当前：预升PR281原1d8b的Linux启动CI及一次有界push复验FAIL，Windows原PR完整PASS；根因UNKNOWN，诊断前124原件已冻结。当前仅加测试层Linux有界stderr采集，保持原checker/阈值/真实测量门禁及插件/公开版本；修后本机完整644总/643PASS/1新增Linux机制在Windows不适用、strict及独立反例复验已通过，后继新head双端CI待真实结果，保护批准NOT_MET、延期/Owner接受独立。同一REPORT/Issue274接续。

以下为原PR创建前准备快照。

2026-10-20（Asia/Taipei）：#280已于00:37:27合入develop4d10/treedb496，同ef85/535，完整maine3dc ancestry已交付；公开tag/Release仍f906/8.3.2。actual4d10新13/178/实际Python及15根清理已PASS，随后市场8.3.3DryRun零写/Apply精确VERSION+badge已通过；当前仅未发布预升候选，新保护PR另待。批准NOT_MET/Owner bypass、旧queued原观察和时间字段差异保留，Owner接受/延期/NOT_MEASURED独立；唯一REPORT接续实际结果，进度以Issue274为准。

下段为#280合入前准备快照，当前以上段为准。

2026-10-19续办：#279已于15:17:09Z合入main e3dc40f7/treeae121f6b，同已测315/687；发布tag/Release仍f906，默认安装v8.3.2/site导航已交付。真实批准NOT_MET/Owner bypass保留。当前准备完整main→develop同步PR，actualsync新验后才仅市场8.3.3DryRun/Apply；原生/第二客户端延期、Owner接受及NOT_MEASURED独立。实际e3dc独立新13/178/Python及15根清理已通过，原件见唯一REPORT，进度以Issue274为准。

下段为上轮发布记录准备快照，后续279已合入，当前以上段为准。

2026-10-19：#278已合入实际main f906b100/tree6e4bc9cc，v8.3.2于14:30:16Z公开，main/direct tag/Release同SHA；HTML0.1.37含site，五包八公开。真实tag独立新13安装/178命令、6Diagram18LEK/4生成4静态、15精确根清理均通过，原件已接回唯一REPORT；278空reviews/真实suite4601606831 bypass/批准NOT_MET保留，不作未来豁免。当前维护默认公开安装指引/记录→同步完整实际main→仅市场8.3.3预升，详见[8.3.2账本](../../docs/runbook/[RUNBOOK]_Marketplace_8_3_2_Release_Readiness.md)及唯一REPORT；Owner体检/最终接受、延期与NOT_MEASURED独立，Issue保持开放。
