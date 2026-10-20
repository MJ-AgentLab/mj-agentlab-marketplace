---
type: guide
scope: html-guide-kit
summary: "Issue 274 HTML learning artifact task entry and recoverable sources"
owner: marketplace-maintainers
created: 2026-10-19
updated: 2026-10-20
state: active
version: v1.15
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

## Actual PR289 develop verification and marketplace pre-bump

#289实际develop新验通过，隔离市场8.3.4预升候选待新保护PR合入；公开仍v8.3.3/HTML0.1.38，HTML0.1.39在develop。实际批准NOT_MET、延期/效果/原接受保界，详见[唯一REPORT](./[REPORT]_HTML_Learning_Artifact.md#actual-pr289-develop-verification-and-marketplace-pre-bump)。

下一步推荐：完成本轮预升候选的来源/文档/A6及独立复核，提交唯一新主PR→protected develop，并核对当前head CI、真实非作者且非latest-pusher批准、线程和最新base；理由是实际同步复验已具备预升前提，而预升不等于正式发行。自身PR/CI/实际合入结果接Issue274与外部冻结回执，无新实质差异不递归纯证据PR。

以下旧current/待办段均为各自原时点快照；本轮进度以Issue274与本节为准。

## Selective alignment integration candidate

本节为同步子候选提交前固定快照；自身后继commit/子PR/唯一develop主PR、CI/实际合并和固定提交安装结果以Issue274及外部不可变回执为准，不以本快照替代实际交付。

2026-10-20：PR287已于11:42:47Z实际合入main **f18aa09be0cc4a96b5005157566f7f4fd4947c95/tree6f921a482ba927b82e4c5d8d13ab9e1c8559edd6**，与预解输入树相同；完整actualmain已在隔离同步子候选中正常merge；本快照不声明后继集成或protected develop已交付。公开仍v8.3.3/HTML0.1.38，0.1.39仍未发布候选，市场VERSION8.3.3保持。内部285/286的按需Matt/设计共识、可选主题、本地交付及原材料保护保持。

下一步推荐：先完成本轮新候选工程检查、全来源逐字节核验及独立复核，通过内部子PR门禁后正常合入既有集成分支；随后以唯一主PR→protected develop交付完整main ancestry及0.1.39。理由是以真实同步候选检查支持交付，保留已公开历史和当前保护要求。实际develop合入并复验后才可DryRun→Apply仅市场8.3.4预升；当前未执行。无新增Owner实质决定。

原核心ACCEPTED_LIMITED不扩至0.1.38/Site v2/0.1.39，完整计划OPEN、效果NOT_MEASURED、D01持续窗口及其他延期非PASS。实际suite4618651818为bypass、reviews=[]、批准NOT_MET；Agent未执行此次保护合并或bypass，后继保护批准不得复用为豁免。当前head新CI/真实独立批准/线程/latestbase及actualdevelop同步复验各自待证。

以下为两条分支各自时点的历史快照；其中未发布/活动PR/待检查等状态保留原时点，不作为当前状态。

[#274](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/274) 是进度正本。

2026-10-20当前：v8.3.3/HTML0.1.38已由PR284实际main/tag fdede公开；actualmain本机647/646P/1平台skip及真实tag新13/178、实际Python/资源/精确清理通过，首次TEMP长路径checkout失败与bypass/批准NOT_MET保持。当前修正main默认安装导航，.39仍内部候选；下一步推荐：先正常合入本轮main导航/记录PR，随后将包含该merge的完整actualmain普通合入既有0.1.39集成分支，用后继唯一主PR→protected develop同时承接main同步及已授权选择性统一。实际develop同步合入并复验后，才可DryRun→Apply仅市场8.3.4预升；当前未执行。理由是先让默认安装抵达真实修复版本，再交付新方法，避免无产品差异的机械纯同步PR。当前无新增Owner实质决定。 详情见[REPORT](./[REPORT]_HTML_Learning_Artifact.md#actual-pr284-publication-and-next-delivery)，延期/接受/效果独立。

以下为原发行准备快照。

2026-10-20最新：发行[PR284](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/284)→main，首head318的CI真实FAIL已保留；Windows CRLF指令预算已作有界摘要修正及双表示严格复验，Linux原启动FAIL/UNKNOWN不变，后继新headCI/真实独立批准待证。Site v2已部署，Marketplace8.3.3未公开，未扩大Owner接受；详见当前REPORT/发行账本。

以下为首次发行候选前快照。

2026-10-20当前：#283已合developa4892f51，actual本机647总/646P/1平台skip、strict/CLI及新13/178/实际Python/14自有根清理通过；同私有Site v2已部署，受众保持仅Owner。一次HTML0.1.38修复发行正按保护main门禁准备，市场8.3.3未发布，安装仍v8.3.2；真实批准、tag/Release和真实tag新验另待。[当前REPORT](./[REPORT]_HTML_Learning_Artifact.md#actual283-and-repair-release-continuation)与[8.3.3账本](../../docs/runbook/[RUNBOOK]_Marketplace_8_3_3_Release_Readiness.md)接续。核心ACCEPTED_LIMITED/完整计划OPEN/旧FAIL和批准NOT_MET、D01–D07均保留，无新增Owner实质决定。

以下为283合入前快照。


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
