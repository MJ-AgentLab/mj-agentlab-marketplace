---
type: guide
scope: html-guide-kit
summary: "Issue 274 HTML learning artifact task entry and recoverable sources"
owner: marketplace-maintainers
created: 2026-10-19
updated: 2026-10-20
state: active
version: v1.10
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

2026-10-20：Owner已选择以完整制作提示词作选择性统一基准，保护原材料、允许独立产物；同一[PLAN决定正本](./[PLAN]_HTML_Learning_Artifact.md#selective-alignment-baseline)承接按需Matt/共识确认、可选主题和本地交付，准备0.1.39，保本地生成与工程检查。[REPORT](./[REPORT]_HTML_Learning_Artifact.md#selective-alignment-results)分记新证据。#284→main的0.1.38发行候选保持冻结，本批内部推进，结束后衔接唯一主PR→develop。窗口持续显示仍延期，核心既有接受不扩大，下方记录按历史批次读取。

2026-10-20：#282已合入develop908d2953；Owner已明确接受当前交付核心并保留全部延期/历史缺口（ACCEPTED_LIMITED），完整计划仍OPEN。本轮按同一五边界自主恢复可执行工程项，新发现边界对比度与输出许可缺件，准备HTML0.1.38修复候选；公开仍v8.3.2/HTML0.1.37，市场8.3.3未发布。原生窗口/原生派发/第二客户端仍延期，历史FAIL/UNKNOWN/bypass及批准NOT_MET不追认。 可自治检查、各延期恢复条件及真实新修复由同一[PLAN](./[PLAN]_HTML_Learning_Artifact.md#deferral-recovery-batch)和[REPORT](./[REPORT]_HTML_Learning_Artifact.md#deferral-recovery-results)接续；下方维护段按其历史日期读取。

- [主 PLAN](./[PLAN]_HTML_Learning_Artifact.md)：授权、原计划完整覆盖、子 PR 顺序、验收与恢复。
- [原意 INT-2026-003](../../docs/intent/[INTENT]_INT-2026-003_HTML_Learning_Artifact.md)、[扩展 ADR](../../docs/adr/[ADR]_HTML_Learning_Artifact_Extension.md)、[site SPEC](../../docs/spec/[SPEC]_HTML_Learning_Artifact.md)、[使用指南](../../docs/guide/[GUIDE]_HTML_Learning_Artifact.md)。
- [来源清单](./source-bindings.json)：原计划完整字节、本轮请求及捕获元数据。冻结来源只用于恢复，不作第二主计划。
- [唯一主 REPORT](./[REPORT]_HTML_Learning_Artifact.md)：版本化工程/独立消费者/私有Sites与失败恢复；[主PR275](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/275)、[原子子PR276](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/276)、[验收子PR277](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/277)承接本批，进度仍以Issue为准。

2026-10-20当前：[PR281](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/281)已于00:00:09Z（本地08:00:09）合入develop62945150，与已测候选同tree6659；仅市场8.3.3预升已交付、仍未发布，插件及公开v8.3.2/f906保持。候选CI与actual629新验分记，actual本机/strict/CLI通过，新13/实际Python/15精确根清理通过；实际bypass/批准NOT_MET、旧FAIL/根因UNKNOWN、延期与Owner接受独立，进度以Issue274为准。

以下为原PR创建前准备快照。

2026-10-20（Asia/Taipei）：#280已于00:37:27合入develop4d10/treedb496，同ef85/535，完整maine3dc ancestry已交付；公开tag/Release仍f906/8.3.2。actual4d10新13/178/实际Python及15根清理已PASS，随后市场8.3.3DryRun零写/Apply精确VERSION+badge已通过；当前仅未发布预升候选，新保护PR另待。批准NOT_MET/Owner bypass、旧queued原观察和时间字段差异保留，Owner接受/延期/NOT_MEASURED独立；唯一REPORT接续实际结果，进度以Issue274为准。

下段为#280合入前准备快照，当前以上段为准。

2026-10-19续办：#279已于15:17:09Z合入main e3dc40f7/treeae121f6b，同已测315/687；发布tag/Release仍f906，默认安装v8.3.2/site导航已交付。真实批准NOT_MET/Owner bypass保留。当前准备完整main→develop同步PR，actualsync新验后才仅市场8.3.3DryRun/Apply；原生/第二客户端延期、Owner接受及NOT_MEASURED独立。实际e3dc独立新13/178/Python及15根清理已通过，原件见唯一REPORT，进度以Issue274为准。

下段为上轮发布记录准备快照，后续279已合入，当前以上段为准。

2026-10-19：#278已合入实际main f906b100/tree6e4bc9cc，v8.3.2于14:30:16Z公开，main/direct tag/Release同SHA；HTML0.1.37含site，五包八公开。真实tag独立新13安装/178命令、6Diagram18LEK/4生成4静态、15精确根清理均通过，原件已接回唯一REPORT；278空reviews/真实suite4601606831 bypass/批准NOT_MET保留，不作未来豁免。当前维护默认公开安装指引/记录→同步完整实际main→仅市场8.3.3预升，详见[8.3.2账本](../../docs/runbook/[RUNBOOK]_Marketplace_8_3_2_Release_Readiness.md)及唯一REPORT；Owner体检/最终接受、延期与NOT_MEASURED独立，Issue保持开放。
