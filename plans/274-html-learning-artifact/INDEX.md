---
type: guide
scope: html-guide-kit
summary: "Issue 274 HTML learning artifact task entry and recoverable sources"
owner: marketplace-maintainers
created: 2026-10-19
updated: 2026-10-21
state: active
version: v1.19
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

## Actual PR293 develop verification and marketplace8.3.5 pre-bump

2026-10-21（Asia/Taipei）：#293于2026-10-20T17:43:53Z（台北2026-10-21T01:43:53+08:00）实际合入develop **ac36c10d52e0712338888a007d2b9281d3097b6c/tree698065a160995014522019d9aae161b8ad1ebd1f**，parents7c23＋1732，完整树同已测同步候选；main **931e1214377357e9f94b6c5ca10029330c6ec0d6** 完整祖先已独立核对。Git commit clock为2026-10-20T17:43:52Z，与PR mergedAt分属字段，不混作同一时钟。公开仍Marketplace8.3.4/HTML0.1.39，tag/Release5898；835仅本轮隔离预升候选，尚未合入、未公开。

本轮actualdevelop新canonical于2026-10-20T17:54:28.528Z–2026-10-20T18:08:34.370Z执行，13/178全exit0、6Diagram＋18LEK真实Python、4site生成/4静态各96/96、15自有根双absence/8guards通过；随后本机于2026-10-20T18:09:21.098+00:00–2026-10-20T18:13:51.742+00:00执行652总/651PASS/0FAIL/1平台skip、strict20repo/8public、CLI0.147.0/Python3.12.14和限定browser通过。两批各核9692完整跟踪文件图、index/primary/Owner原件与全worktree库存，分别冻结STOP后独立回读解锁；旧293CI和tag运行不改名为actualdevelop。

实际#293 suite4625293266为bypass，pull_request规则FAIL缺latest-pusher以外批准，reviews=[]、批准NOT_MET；Agent未执行该保护合入，不构成未来豁免。actualdevelop通用CI未触发，不dispatch或重跑、不把旧四矩阵改名。独立reader的历史base字段误解及已存快照写保护两次exit1保留原件；scope的INTENT初筛/插件字典键方法修正另见选证，不是产品或CI失败。旧FAIL/UNKNOWN保留；D01持续窗口/其他客户端DEFERRED、效果NOT_MEASURED、完整计划OPEN；Owner原ACCEPTED_LIMITED仅0.1.37，不扩大至.38/Site v2/.39。

现有版本工具先DryRun（2026-10-20T18:35:54.924814+00:00–2026-10-20T18:35:55.205939+00:00）恰VERSION/README两锚点且9692源图零写，再Apply（2026-10-20T18:35:58.160251+00:00–2026-10-20T18:35:58.452513+00:00）只改VERSION与badge为未发布8.3.5。README六个真实v8.3.4公开安装锚点保持；后继七项文档/来源登记维护单独计数，不冒称版本工具改完整包。全部插件/运行/.agents/scripts/workflow/INTENT、公开root/plugin CHANGELOG整字节及834账本保持，无新tag/Release。

下一步推荐：完成本轮预升候选的来源/文档/A6、适用工程检查及独审后，提交Issue274唯一主PR→protecteddevelop；新head真实非作者且非latest-pusher批准、实际requiredchecks（包括适用A6）、线程及最新base满足后才正常合入。理由是实际完整同步与新复验已支持市场预升，预升不等于正式发行或新能力接受。候选自身PR/CI/实际merge只回Issue和外部冻结回执，无新实质差异不递归纯证据PR。

以下旧current/待办为各自原时点快照，当前以本节和Issue274为准。

## Actual PR292 main verification and full synchronization

2026-10-21（Asia/Taipei）：#292于2026-10-20T16:25:37Z（台北2026-10-21T00:25:37+08:00）实际合入main **931e1214377357e9f94b6c5ca10029330c6ec0d6/tree3b310156c5d56a4bf533c1cfebdeb1e5ef4d71ca**，parents5898＋010e，树同已测维护候选。该main完整包含develop7c23；普通完整同步保留全部main ancestry，版本仍Marketplace8.3.4/HTML0.1.39。公开tag/Release仍5898a819，正文/旧833保持；维护合入未触发通用CI或Release、未新增tag，不将PR矩阵改名为actualmain新验。

本轮actualmain新canonical于2026-10-20T16:28:57.619Z–2026-10-20T16:42:59.351Z运行，13/178全exit0、6Diagram＋18LEK实际Python、4site生成/4静态各96/96、15精确自有根双absence及8guards通过。随后独占本机套件于2026-10-20T16:43:37.228+00:00–2026-10-20T16:48:02.041+00:00执行652总/651PASS/0FAIL/1平台skip，strict20repo/8public、CLI0.147.0、真实Python3.12.14和限定浏览器通过；两批各新核9616跟踪文件完整字节图、index/primary/Owner原件/完整worktree库存，终态均原件冻结后才释放写窗口。运行时钟按原UTC保存，不借候选、旧tag或发布run计数。

实际#292 suite4623862443为bypass，pull_request规则FAIL缺latest-pusher以外批准、reviews=[]、批准NOT_MET；Agent未执行该保护合入。独立审计首次repo URL尾斜杠HTTP404及后续cached URL guard退出保留原件/方法说明，均非产品或CI失败，不宣称全部方法首跑成功。旧FAIL/UNKNOWN与历史批准缺口保留。D01持续窗口/其他客户端入口DEFERRED、效果NOT_MEASURED、完整计划OPEN；Owner原ACCEPTED_LIMITED仅0.1.37，不扩大至0.1.38/Site v2/0.1.39。

下一步推荐：完成本轮完整同步候选的来源/文档/A6、适用工程检查和独立审查后，提交唯一主PR→protected develop；当前head真实非作者且非latest-pusher批准、CI/Structure、项目A6、线程及最新base满足后才正常合入。理由是actualmain新验已支持完整同步，而保护批准不能由旧bypass或合成审查替代。实际同步合入并新验后，才在后继独立范围DryRun→Apply仅市场下一补丁；本轮不预升8.3.5、不发布。

以下旧current/待办为各自原时点快照，当前以本节和Issue274为准。

## Actual PR291 publication and post-publication checks

2026-10-20：#291于15:13:30Z实际合入main **5898a8192740b39f41263129a5f99efeba96a6cc/tree3a68976af95bb5948de17a6fccaabf892becaaca**，parents f18＋f344，树同已审发行候选。v8.3.4于15:16:38Z正式公开，tag/Release target均为该actualmain；Release418543870、draft=false/prerelease=false/assets=[]、正文1677B/SHA25693f4459e8718b06eae19dc6aa82397eacce723470f8fd6e33214fb489d542d38，actual CHANGELOG8.3.4节按CRLF→LF/trim相同。Release run39446432726 exact5898/push/attempt1自然成功；immutable=false，仓库配置缺字段仍UNKNOWN。五包八公开/五显式/三自然/20repo skills；HTML0.1.39，其他四包版本保持。

新actualmain本机652总/651PASS/0FAIL/1平台skip、strict/CLI0.147.0/实际Python及限定浏览器通过；actualmain新十三安装与真实tag解析SHA后的独立新十三安装各13/178全exit0，6Diagram＋18LEK实际Python、4site生成/4静态各96/96，15精确自有根双absence/外层guards通过。actualmain两批各新核完整9366文件字节图及索引/primary/库存，tag批核HEAD/tree/clean/index/primary/完整库存守卫；各自前后核验，按顺序执行，不过滤其他工作树或复用候选/发布run计数。

实际suite4622448549为bypass、reviews=[]、批准NOT_MET；Agent未执行该保护合并。旧FAIL/UNKNOWN和历史批准缺口保留。D01持续原生窗口、其他延期客户端/扩展入口非PASS，效果NOT_MEASURED、完整计划OPEN；Owner原ACCEPTED_LIMITED仅0.1.37，不扩至0.1.38/Site v2/0.1.39。 详细方法/原件见[唯一REPORT](./[REPORT]_HTML_Learning_Artifact.md#actual-pr291-publication-and-post-publication-checks)与[8.3.4账本](../../docs/runbook/[RUNBOOK]_Marketplace_8_3_4_Release_Readiness.md)。

下一步推荐：先正常合入本轮有界main安装导航/记录PR，再以包含该实际merge的完整main ancestry向protected develop同步；同步实际合入并新验后，才DryRun→Apply仅市场下一补丁预升。理由是默认安装应先抵达已验证公开版本，随后保持main/develop历史与版本准备有序。当前head真实批准/CI/A6/线程/latestbase保持门禁，无新增Owner产品决定。

以下旧current/待办为各自原时点快照，当前以上节为准。

## Actual PR290 verification and HTML0.1.39 release preparation

#290实际develop7c23已交付未发布8.3.4/HTML0.1.39，新验通过；本轮准备发行PR→main，公开仍v8.3.3。批准缺口/延期/效果/原接受保界，见[唯一REPORT](./[REPORT]_HTML_Learning_Artifact.md#actual-pr290-verification-and-html0139-release-preparation)与[8.3.4账本](../../docs/runbook/[RUNBOOK]_Marketplace_8_3_4_Release_Readiness.md)。

下一步推荐：完成本轮发行候选来源/文档/A6及独立复核，向受保护main提交唯一8.3.4发行PR；当前head CI、真实非作者且非latest-pusher批准、线程及最新base满足后才正常合入，核actualmain再按既有draft-first流程公开与真实tag新十三安装。理由是实际develop已完成市场预升和新验，HTML0.1.39的新增/继承/延期边界可分别恢复；正式公开与Owner接受不可由候选通过替代。

以下旧current/待办为各自原时点快照；当前以Issue274及本节为准。

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
