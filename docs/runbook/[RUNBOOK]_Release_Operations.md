---
type: runbook
scope: marketplace
summary: "Draft-first Git/tag release with install verification and immutable history"
owner: marketplace-maintainers
created: 2026-10-09
updated: 2026-10-21
state: active
version: v2.10.12
layer: canonical
---

# [RUNBOOK] Release operations

## Preparation

2026-10-21（Asia/Taipei）：#292于2026-10-20T16:25:37Z（台北2026-10-21T00:25:37+08:00）实际合入main **931e1214377357e9f94b6c5ca10029330c6ec0d6/tree3b310156c5d56a4bf533c1cfebdeb1e5ef4d71ca**，parents5898＋010e，树同已测维护候选。该main完整包含develop7c23；普通完整同步保留全部main ancestry，版本仍Marketplace8.3.4/HTML0.1.39。公开tag/Release仍5898a819，正文/旧833保持；维护合入未触发通用CI或Release、未新增tag，不将PR矩阵改名为actualmain新验。

本轮actualmain新canonical于2026-10-20T16:28:57.619Z–2026-10-20T16:42:59.351Z运行，13/178全exit0、6Diagram＋18LEK实际Python、4site生成/4静态各96/96、15精确自有根双absence及8guards通过。随后独占本机套件于2026-10-20T16:43:37.228+00:00–2026-10-20T16:48:02.041+00:00执行652总/651PASS/0FAIL/1平台skip，strict20repo/8public、CLI0.147.0、真实Python3.12.14和限定浏览器通过；两批各新核9616跟踪文件完整字节图、index/primary/Owner原件/完整worktree库存，终态均原件冻结后才释放写窗口。运行时钟按原UTC保存，不借候选、旧tag或发布run计数。

实际#292 suite4623862443为bypass，pull_request规则FAIL缺latest-pusher以外批准、reviews=[]、批准NOT_MET；Agent未执行该保护合入。独立审计首次repo URL尾斜杠HTTP404及后续cached URL guard退出保留原件/方法说明，均非产品或CI失败，不宣称全部方法首跑成功。旧FAIL/UNKNOWN与历史批准缺口保留。D01持续窗口/其他客户端入口DEFERRED、效果NOT_MEASURED、完整计划OPEN；Owner原ACCEPTED_LIMITED仅0.1.37，不扩大至0.1.38/Site v2/0.1.39。

下一步推荐：完成本轮完整同步候选的来源/文档/A6、适用工程检查和独立审查后，提交唯一主PR→protected develop；当前head真实非作者且非latest-pusher批准、CI/Structure、项目A6、线程及最新base满足后才正常合入。理由是actualmain新验已支持完整同步，而保护批准不能由旧bypass或合成审查替代。实际同步合入并新验后，才在后继独立范围DryRun→Apply仅市场下一补丁；本轮不预升8.3.5、不发布。

以下为各轮原时点快照。

2026-10-20：#291于15:13:30Z实际合入main **5898a8192740b39f41263129a5f99efeba96a6cc/tree3a68976af95bb5948de17a6fccaabf892becaaca**，parents f18＋f344，树同已审发行候选。v8.3.4于15:16:38Z正式公开，tag/Release target均为该actualmain；Release418543870、draft=false/prerelease=false/assets=[]、正文1677B/SHA25693f4459e8718b06eae19dc6aa82397eacce723470f8fd6e33214fb489d542d38，actual CHANGELOG8.3.4节按CRLF→LF/trim相同。Release run39446432726 exact5898/push/attempt1自然成功；immutable=false，仓库配置缺字段仍UNKNOWN。五包八公开/五显式/三自然/20repo skills；HTML0.1.39，其他四包版本保持。

新actualmain本机652总/651PASS/0FAIL/1平台skip、strict/CLI0.147.0/实际Python及限定浏览器通过；actualmain新十三安装与真实tag解析SHA后的独立新十三安装各13/178全exit0，6Diagram＋18LEK实际Python、4site生成/4静态各96/96，15精确自有根双absence/外层guards通过。actualmain两批各新核完整9366文件字节图及索引/primary/库存，tag批核HEAD/tree/clean/index/primary/完整库存守卫；各自前后核验，按顺序执行，不过滤其他工作树或复用候选/发布run计数。

实际suite4622448549为bypass、reviews=[]、批准NOT_MET；Agent未执行该保护合并。旧FAIL/UNKNOWN和历史批准缺口保留。D01持续原生窗口、其他延期客户端/扩展入口非PASS，效果NOT_MEASURED、完整计划OPEN；Owner原ACCEPTED_LIMITED仅0.1.37，不扩至0.1.38/Site v2/0.1.39。

下一步推荐：先正常合入本轮有界main安装导航/记录PR，再以包含该实际merge的完整main ancestry向protected develop同步；同步实际合入并新验后，才DryRun→Apply仅市场下一补丁预升。理由是默认安装应先抵达已验证公开版本，随后保持main/develop历史与版本准备有序。当前head真实批准/CI/A6/线程/latestbase保持门禁，无新增Owner产品决定。

以下旧current/待办为各自原时点快照。

2026-10-20：#290已于14:16:36Z实际合入develop **7c23f347c0725bdfa57ee1e0f5e9075a8d90babf/tree5743c7974880ff5fa87c9294313ec9adc6abac40**，parents f3e8＋720540，完整main f18 ancestry保持。市场8.3.4预升已交付，HTML0.1.39及其他插件版本保持；公开仍v8.3.3/HTML0.1.38。实际7c23本机652总/651PASS/0FAIL/1平台skip、strict/CLI0.147及新13/178、实际Python/15精确根清理通过。

本轮沿既有P5/五边界授权准备8.3.4/HTML0.1.39发行，完整actualdevelop→main，版本不再bump；[当前账本](./[RUNBOOK]_Marketplace_8_3_4_Release_Readiness.md)与唯一REPORT承接。上轮“仅预升/不正式发布”是上轮工程窗口，非永久Owner禁令；新真实保护批准及draft-first/恢复/tag新验不豁免。

下一步推荐：完成本轮发行候选来源/文档/A6及独立复核，向受保护main提交唯一8.3.4发行PR；当前head CI、真实非作者且非latest-pusher批准、线程及最新base满足后才正常合入，核actualmain再按既有draft-first流程公开与真实tag新十三安装。理由是实际develop已完成市场预升和新验，HTML0.1.39的新增/继承/延期边界可分别恢复；正式公开与Owner接受不可由候选通过替代。

以下旧current/待办为各自原时点快照；当前以Issue274及本节为准。


2026-10-20：#289已于13:09:38Z合入develop **f3e8ba322109e2a43dcdcd68fdd2f0c655c78240/tree6daad5a9e9f9d749e48e38b148657195c3ed2fa5**，parents a4892f51＋6de4be7d，完整继承main f18aa09；HTML0.1.39选择性统一已进入develop、尚未发布。实际develop新本机652总/651PASS/0FAIL/1平台skip、strict/CLI0.147.0及新13/178、实际Python和15精确根清理通过。其后在隔离候选DryRun零写→Apply仅VERSION+badge预升未发布8.3.4（尚待新保护PR合入），实际develop市场仍8.3.3；HTML0.1.39及其他插件保持；默认公开安装仍v8.3.3/HTML0.1.38。

suite4620018712实际bypass、reviews=[]/批准NOT_MET，Agent未执行该保护合并；旧Linux启动FAIL/UNKNOWN与一次同条件有界复验成功分记，成功不等于根因修复。D01持续窗口等延期非PASS、效果NOT_MEASURED、完整计划OPEN，原核心ACCEPTED_LIMITED不扩至0.1.38/Site v2/0.1.39；无新模型/桌面/第二客户端/原生/Sites测试或受众变更，无新增Owner实质决定。

下一步推荐：完成本轮预升候选的来源/文档/A6及独立复核，提交唯一新主PR→protected develop，并核对当前head CI、真实非作者且非latest-pusher批准、线程和最新base；理由是实际同步复验已具备预升前提，而预升不等于正式发行。自身PR/CI/实际合入结果接Issue274与外部冻结回执，无新实质差异不递归纯证据PR。

以下旧current/待办段均为各自原时点快照；本轮进度以Issue274与本节为准。


2026-10-20当前：#284已合main fdede，v8.3.3/HTML0.1.38已真实公开；新actualmain工程和真实tag13/178/Python/精确清理通过，批准NOT_MET/实际bypass、原失败和UNKNOWN不追认。当前main默认README仍指旧版本，故在同Issue274准备一份有界导航/记录PR；其自身后继CI/merge仅回Issue和外部回执，无新实质问题不递归建纯证据PR。该PR实际合入后，可将完整actualmain ancestry与已授权0.1.39在后继唯一protected develop主PR同步交付，不要求机械独立纯同步PR。只有actualdevelop同步合入与复验完成后，才仅市场8.3.4先DryRun后Apply。详见[唯一REPORT](../../plans/274-html-learning-artifact/[REPORT]_HTML_Learning_Artifact.md#actual-pr284-publication-and-next-delivery)。Owner最终接受/延期/效果独立；无新增周期自动化。以下原“当前”段按各自日期保留。

当前发行PR284首head318的Windows CRLF预算已修/双表示strict通过；原Linux启动FAIL/UNKNOWN保留，后继当前head CI/真实批准继续独立，详见下述8.3.3账本。

当前有界修复发行：#283已合developa4892f51/HTML0.1.38，实际全测/strict/CLI及新13通过，同private Site v2已部署且受众不变。沿原B1/P5五边界授权准备一次Marketplace8.3.3→受保护main修复发行，不再bump；真实head CI/外部批准/线程/latestbase、actualmain、draft-first、tag/Release及真实tag安装分别取证。公开及默认安装仍v8.3.2；完整计划/效果/历史批准缺口不追认。当前见[8.3.3账本](./[RUNBOOK]_Marketplace_8_3_3_Release_Readiness.md)及[同一REPORT](../../plans/274-html-learning-artifact/[REPORT]_HTML_Learning_Artifact.md#actual283-and-repair-release-continuation)。

下列281记录为上一维护批次快照，不构成本次修复发行的永久禁止；其无实质差异不递归纯证据PR原则继续有效。

当前发布后技术链：#281于2026-10-20T00:00:09Z实际合入develop62945150/tree6659，同已测6ef/c41；市场8.3.3预升已交付但仍未发布，公开v8.3.2/f906及插件保持。候选CI、actual629新验与真实bypass/批准NOT_MET分别绑定；当前结果和原始证据见[唯一REPORT](../../plans/274-html-learning-artifact/[REPORT]_HTML_Learning_Artifact.md#current-sync-merge-and-marketplace-prebump)。

本轮沿用原P5五边界授权，由Agent作工程排程，最多准备一份有界文档修正，不新增Owner决定。该记录自身实际合入后的审计/范围复验只回Issue274并保存外部不可变回执；没有新的实质差异时不递归创建纯证据PR。

以下为281合入前历史快照，旧FAIL及根因UNKNOWN保持原轮；当前以上述REPORT与Issue274为准。

当前后继CI（本地2026-10-20）：[预升PR281](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/281)已创建，原head1d8b6849/treeeefcaa与潜在merge4e495同树；尚未实际合入。原PR Linux640P/1F/1平台skip，真实Chrome未取得可读DevTools端点、NOT_RUN/exit2，smoke未执行；原Windows642/642及新13/178/6/18/4/4实际通过。原push两端各有启动FAIL，一次有界复验Linux仍FAIL，根因UNKNOWN，不能用本地/Windows通过覆盖。诊断前124原件及捕获中间文本副本已覆盖的限制由唯一REPORT冻结；当前仅补测试层Linux有界stderr，不改checker/flags/15秒判据/非零NOT_RUN、插件或workflow，不把诊断当修复或通过。新诊断检查/后继headCI和真实批准/线程/latestbase各待真实证据，Agent不bypass；8.3.3仍未发布、公开8.3.2保持，Owner接受/延期独立。

[同一任务当前证据](../../plans/274-html-learning-artifact/[REPORT]_HTML_Learning_Artifact.md#current-sync-merge-and-marketplace-prebump)继续承接。下列原市场预升准备为PR281创建前快照，当前后继失败/诊断以上段为准。

当前市场预升准备（本地2026-10-20，Asia/Taipei）：[同步PR280](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/280)于UTC19日16:37:27Z（本地20日00:37:27）实际合入develop4d10a067/tree db49629f，同已测ef85/535 tree，parents65d+ef85并完整继承main e3dc。suite4603805882匹配65d→4d10为实际Owner bypass，pull_request FAIL缺latest-pusher外批准，required checks/non-fast-forward/deletion PASS，reviews=[]，批准仍NOT_MET。CI39279114820最终raw已独立解析：Linux641/642、唯一平台skip，Windows642/642零skip，每端13/178、6Diagram+18LEK/4生成+4静态各89/89；原queued/UNKNOWN及9项时序冲突原值保留，不据异常helper时间解释因果、顺序或耗时。actual4d10新验UTC16:39:19.139–16:50:02.166Z已PASS：13/178全exit0、6Diagram18LEK4生成4静态各89/89，15精确根不存在、hostHEAD/worktree清单复原。随后UTC16:52:31.265Z DryRun→16:52:32.762Z Apply仅市场8.3.2→未发布8.3.3；7252文件map证DryRun零写、Apply仅VERSION+README badge，插件/运行/guide未变，无新发行。隔离分支codex/prebump-marketplace-8-3-3向受保护develop4d10准备新PR，尚无编号；本地642/642及独立8.3.3新安装检查已通过；当前head真实1非作者/lastpush批准、Validate Structure+A6、线程/latestbase仍待满足，Agent不bypass。8.3.2 tag/Release仍f906、正文未变，未创建8.3.3tag/Release；此前两404仅为当次观察。当前事实及原件见[8.3.2账本当前节](./[RUNBOOK]_Marketplace_8_3_2_Release_Readiness.md#current-sync-merge-and-marketplace-prebump)和同一[REPORT当前节](../../plans/274-html-learning-artifact/[REPORT]_HTML_Learning_Artifact.md#current-sync-merge-and-marketplace-prebump)，Owner接受/延期/效果NOT_MEASURED分记。

下段为v2.10.2在PR280实际同步前的准备快照；其中sync准备中/尚无编号保留原时点。当前actualsync与新验已交付、未发布8.3.3已Apply，本地完整测试及新安装已通过，待办为新PR真实保护门禁。

当前同步准备（2026-10-19）：[记录PR279](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/279)已于15:17:09Z实际合入main e3dc40f734fc972e05956da3e908091e09963675/tree ae121f6b，与已测315b5942及merge-ref687b70ab同树，parents f906+315b；完整ancestry已含develop65d。Marketplace公开tag/Release仍为v8.3.2/f906，不把新记录main当新tag。PR279双系统CI39272665913终态成功：Linux641PASS/平台专用skip1（总642）、Windows642PASS/零skip，各13场景/178命令、实际6Diagram+18LEK Python及4生成+4静态各89/89，4browser case未skip；16清理名TAP不等于逐根absence，push39272636618仅列success。实际suite4602541728匹配f906→e3dc为Owner bypass，pull_request FAIL缺latest-pusher外批准、其余4规则PASS，reviews=[]，批准仍NOT_MET。独立actualmain e3dc新验15:18:57.732–15:29:31.902Z已PASS：13场景/178命令全exit0、6Diagram18LEK Python、4site生成4静态各89/89，site20/guide4资源一致，15精确自有根absence且完整worktree清单及hostHEAD复原，新原件另存，不借CI/tag计数。当前codex/sync-main-8-3-2从完整e3dc派生，向受保护develop65d准备正常PR，尚无编号；当前head真实1非作者/last-push批准、Validate Structure+A6、线程和latestbase须满足，Agent不bypass。只有actualsync真实合入及新复验后才8.3.3 DryRun/Apply，插件不变、无同号发行；当前证据及恢复见[8.3.2账本当前节](./[RUNBOOK]_Marketplace_8_3_2_Release_Readiness.md#current-record-merge-and-synchronization)与[#274唯一REPORT](../../plans/274-html-learning-artifact/[REPORT]_HTML_Learning_Artifact.md#current-record-merge-and-synchronization)，Owner接受/延期/效果NOT_MEASURED分记。

下段“当前续办”为PR279实际合入前的v2.10.1记录准备快照；其中记录分支与后续依赖只代表当时状态，当前actualmain新验和同步准备以上段为准。

当前续办（2026-10-19）：[PR278](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/278)已于14:28:06Z实际合入main f906b100/tree6e4bc9cc，与发布head f68c22b及双系统CI的merge-ref4269d663同树。v8.3.2已于14:30:16Z正式公开，tag/Release target同f906，自动发布run39269211915于14:30:24Z成功；Release draft=false/prerelease=false/assets=[]/latest=true/immutable=false，仓库immutable配置UNKNOWN。独立发布回执19项实际观察均有证，正文在CRLF→LF后trim范围内与actualmain CHANGELOG对应节相同。原main suite4601606831为实际Owner bypass，pull_request fail（缺latest-pusher外批准）/required checks pass、reviews=[]，批准仍NOT_MET，不追认批准或未来豁免。独立新验14:31:11.601–14:41:25.926Z已PASS：13/13场景、178命令全exit0、6Diagram+18LEK Python、4site生成/4静态各89/89，公开8/仓库20/显式5/自然3、site20/guide4资源摘要一致；15精确自有根均不存在、canonical无注册残留；未沿用准备候选或CI计数，新tag原件与边界见本账本。当前codex/record-html-learning-8-3-2记录真实公开及复验，后继正常main→develop同步与仅市场8.3.3预升严格依真实前序，均不得提前记PASS。完整身份、发布/PR278终态CI回执、原失败及恢复见[8.3.2账本Actual publication](./[RUNBOOK]_Marketplace_8_3_2_Release_Readiness.md#actual-publication-and-current-continuation)和同一[#274任务](../../plans/274-html-learning-artifact/INDEX.md)；Owner体检/最终接受、非核心延期与NOT_MEASURED继续独立。

下段“当前任务”为8.3.2发布前准备原快照，保留其当时未创建PR/未公开状态；后续真实PR278及公开事实以上段和新账本为准。

当前任务（2026-10-19）：#275 已于12:56:35Z实际合入develop65d756ef，tree d7de559f与已测1a80相同，HTML0.1.37新增site；完整候选为五包八公开/五显式/三自然，其他插件版本与运行保持。正式发布沿用[#274主PLAN](../../plans/274-html-learning-artifact/[PLAN]_HTML_Learning_Artifact.md)P5授权，隔离分支codex/release-html-learning-8-3-2向main7615ca58准备正常release PR；编号尚未创建，不预造。Marketplace8.3.2已由#255同步后#256预升，不重复bump，无新版tag/Release，安装仍v8.3.1。actual65d已于13:00:06–13:10:12Z新13安装/178命令、6Diagram+18LEK及4site生成/静态Python通过，自有新根无残留；不借旧候选计数。#275 reviews=[]、批准NOT_MET；匹配before1d5219/after65d的真实suite4599887231为bypass，pull_request fail（缺最新推送者外批准）、required checks pass，不构成后续例外。main当前head的真实非作者/最新推送批准、适用code-owner要求、Validate Structure及其他required checks、最新base和线程必须满足后才普通合并，再draft-first公开并从真实tag新十三安装/实际Python。完整范围、历史限制、停止恢复及发布后记录→sync→仅市场8.3.3预升顺序见[8.3.2账本](./[RUNBOOK]_Marketplace_8_3_2_Release_Readiness.md)；Owner体检/最终接受和理解效果另记，不为常规构建重复求批准。

以下2026-10-16同步准备文字保留为当时快照；后继#255/#256已完成的实际同步/8.3.2预升以上述当前任务与根AGENTS记录为准，不将历史PENDING当作现状。

当前同步任务（2026-10-16）：第1步发布记录 #254 已合入 actual main7615ca58/treeb323（同已测6a4），治理仍为suite4563644321 bypass/reviews=[]/批准NOT_MET；actual761 的新精确十三安装与实际缓存 Python 已通过。第2步复用既有隔离工作区，以 codex/sync-main-8-3-1 从真实 main761 派生，准备向 develop6df 提正常同步 PR；新候选 CI/真实批准/线程及实际 sync 后精确十三安装均待完成。第3步仅在 actual sync 交付并复验后，才准备 Marketplace 8.3.1→8.3.2 VERSION/badge 与 AGENTS 正常A6；当前 NOT_STARTED/DEPENDENT，不 apply、不改插件、不创建8.3.2 tag/Release。原8.3.1 tag/Release仍4e4，#245例外不外推。来源、实际结果与顺序见 [8.3.1账本](./[RUNBOOK]_Marketplace_8_3_1_Release_Readiness.md)。

历史发布准备快照（2026-10-16，现已发布，原门禁要求与执行结果分开记录）：Owner 已要求“进行发布”，授权 8.3.1 维护补丁；沿用已预升版本与未变五包、原限定客户端证据及全部失败/延期。完整 develop6df 已含维护内容，本次隔离发布候选直接向 main 提正常 release PR；当前 head 真实非作者批准、CI、最新 base 与线程门禁满足后才普通合并，再由自动 draft-first 发布并从真实 tag 新做十三安装/缓存 Python。#245 历史治理例外不延伸；不重启模型或桌面测试。当前来源、逐项 PENDING 与证据见 [8.3.1 账本](./[RUNBOOK]_Marketplace_8_3_1_Release_Readiness.md)。下段保留已完成的 8.3.0 历史任务快照。

发布前任务快照（已完成，续办状态见 Post-release）：2026-10-15 本轮按 Owner 已确认计划发布完整 develop 五插件/七技能/四显式的 8.3.0，取代旧 Communication 四包范围。HTML 0.1.36 按当前实现交付，#239 已知 FAIL、双端与扩展未覆盖继续保留；不重启模型/桌面验收，仅执行必要 CI、准确安装及缓存 Python。具体授权与逐项资格以[8.3.0 账本](./[RUNBOOK]_Marketplace_8_3_0_Release_Readiness.md)为准。当前 head 批准、required checks 和线程门禁保持。完成公开和发布后必要复查即停止；以下既有 Post-release 回同步、预升、文档收尾及 Issue/归档流程留待后续，不在本轮执行。

两个治理 PR 及 portable 迁移 PR 已合并。历史 8.0.0 / 0.3.0 版本准备授权及阶段调整见 [迁移 ADR](../adr/[ADR]_ChatGPT_Codex_Portable_Migration_And_LearnKit_Retirement.md)。代理执行已授权 dry-run、更新、测试与 PR 准备，缺项据实记录。VERSION 变化合入 main 会触发发布，正式 release PR 必须满足实际发布范围的客户端验收、发布授权、CI、当前 head 非作者批准及已解决审查线程。

Learning Evidence Epic #209 已获集中实施及条件发布授权，Owner 接受双技能/接口不变、核心独立验收后交付，不能满足严格原生窗口的入口延期。PR4 暂保持市场 8.1.2，PR5 准备 8.2.0 并逐项列实际可启用入口；未提交/默认/超时/关闭不算答复，文字重述/pending 不算窗口持续显示通过。按 [新 ADR](../adr/[ADR]_Learning_Evidence_Kit_Migration.md)与[验收账本](./[RUNBOOK]_Learning_Evidence_Kit_Acceptance.md)核对证据；核心发布不完成原 Epic，延期项、两个收尾 PR 和 Owner 最终接受仍独立追踪。

#197 合并后，owner 明确要求继续并发布；#198 已合入 main，marketplace v8.1.0 于 2026-10-09 自动发布，包含 diagram-kit 0.3.0 / understanding-kit 0.1.1 / explain-kit 0.1.0。发布后四种 canonical 安装复查通过。真实桌面交互未执行、GitHub 未提供独立批准记录，不能因发布成功推定豁免或补记 PASS。发布身份与后续同步见 [8.1.0 发布记录](./[RUNBOOK]_Marketplace_8_1_0_Release_Readiness.md)。

## Draft-first state machine

scripts/run-release.mjs 从指定 SHA 读取 VERSION 与 CHANGELOG，要求 SHA 属于 main，新发布须绑定当前 main tip。既有标签必须 peel 到同一 SHA；既有草稿标题、tag、正文、target SHA 和 prerelease 状态必须一致。

创建空 draft → 有界等待可见 → 验证 canonical Git tree 的安装/发现 → 紧邻 publish 再取远端身份/状态 → publish → 复查 published/immutability。新发布无附加资产；unexpected assets fail closed，既有公开资产不会上传、覆盖或删除。已发布版本只能验证并 noop；故障通过新修复版本处理。

## Post-release

2026-10-20当前：#284已合main fdede，v8.3.3/HTML0.1.38已真实公开；新actualmain工程和真实tag13/178/Python/精确清理通过，批准NOT_MET/实际bypass、原失败和UNKNOWN不追认。当前main默认README仍指旧版本，故在同Issue274准备一份有界导航/记录PR；其自身后继CI/merge仅回Issue和外部回执，无新实质问题不递归建纯证据PR。该PR实际合入后，可将完整actualmain ancestry与已授权0.1.39在后继唯一protected develop主PR同步交付，不要求机械独立纯同步PR。只有actualdevelop同步合入与复验完成后，才仅市场8.3.4先DryRun后Apply。详见[唯一REPORT](../../plans/274-html-learning-artifact/[REPORT]_HTML_Learning_Artifact.md#actual-pr284-publication-and-next-delivery)。Owner最终接受/延期/效果独立；无新增周期自动化。以下原“当前”段按各自日期保留。

当前阶段（本地2026-10-20）：#279记录、#280完整main同步及#281未发布市场8.3.3预升均已实际合入；actual629本机644总/643PASS/1Linux机制不适用、strict/CLI已通过，新13/实际Python/15精确根清理通过，与候选CI/旧批次分记。公开安装仍v8.3.2/f906，插件保持；实际bypass/批准NOT_MET及Owner/延期边界不变。本轮沿用原P5五边界授权，由Agent作工程排程，最多准备一份有界文档修正，不新增Owner决定或机械三PR条件。该记录自身实际合入后的审计/复验只回Issue274并保存外部不可变回执；没有新的实质差异时不递归创建纯证据PR。详见[#274唯一REPORT](../../plans/274-html-learning-artifact/[REPORT]_HTML_Learning_Artifact.md#current-sync-merge-and-marketplace-prebump)。

以下为PR281合入前的发布后准备快照，不重启其中已由实际合入取代的待办。

当前阶段（本地2026-10-20）：记录PR279及同步PR280均已实际合入，actualdevelop4d10的新十三安装/缓存Python与15精确根清理已取得独立限定PASS。其后先DryRun再Apply已将市场预升为未发布8.3.3，版本工具只改VERSION/README badge，正常根AGENTS/A6及阶段文档另行同步；插件不变、无v8.3.3发行，公开tag仍v8.3.2/f906。预升PR尚未创建，本地642/642及独立8.3.3新安装已通过；受保护develop4d10当前head真实批准、Structure+A6、线程/latestbase与实际合入继续待证，Agent不bypass。旧治理缺口、queued/UNKNOWN与9项时间字段限制不因后续success追认；当前证据继续由[#274唯一REPORT新节](../../plans/274-html-learning-artifact/[REPORT]_HTML_Learning_Artifact.md#current-sync-merge-and-marketplace-prebump)接续。

下段为PR280合入前的同步准备快照，其“尚待actualsync”已经由实际4d10替代；当前新验与预升状态以上段为准，原计数/批准及旧待办的当时语义保持。

当前阶段：记录PR279已实际交付到main e3dc，公开tag仍f906；独立actualmain e3dc新验15:18:57.732–15:29:31.902Z已PASS：13场景/178命令全exit0、6Diagram18LEK Python、4site生成4静态各89/89，site20/guide4资源一致，15精确自有根absence且完整worktree清单及hostHEAD复原。同步分支已继承记录merge的完整main ancestry，当前准备受保护develop PR，不能将“已派生分支”当actualsync交付。后续真实同步merge取得新复验后，才先DryRun再Apply仅市场8.3.3预升，VERSION/badge/根AGENTS正常A6同步、插件不变，不创建v8.3.3 tag/Release；真实批准/CI/线程/latestbase逐PR满足，Agent不bypass。actualmain新验PASS及同步PR后续终态的原件由同一[REPORT当前节](../../plans/274-html-learning-artifact/[REPORT]_HTML_Learning_Artifact.md#current-record-merge-and-synchronization)接续。

下段为PR279合入前的发布后导航修复安排快照，记录PR已由实际279交付；其未执行部分按上段实际同步及复验条件继续，不将旧待办重启为新任务。

Marketplace v8.3.2已实际公开，独立发布审计和真实tag新13安装/178命令、实际Python及15根清理均已PASS。本轮main记录PR保存公开/复验原件，将README默认公开安装ref从v8.3.1改为真实v8.3.2，并展示已公开site。这是当前产品导航修复，不把历史8.3.1的三个PR编号或当时准备状态作为本轮完成条件。记录PR正常实际合入后，再将包含该merge的完整actualmain ancestry通过正常PR同步回develop并复验，最后才从实际同步结果DryRun/Apply仅Marketplace8.3.2→8.3.3预升，插件版本保持、无v8.3.3 tag/Release。后续当前head真实批准、CI、最新base与线程均须满足；本轮实际bypass不授权代理再次bypass。具体身份与未完成项见[8.3.2账本](./[RUNBOOK]_Marketplace_8_3_2_Release_Readiness.md#actual-publication-and-current-continuation)。

下段为本次发布前快照，原“尚未公开”不代表当前事实；其预定顺序继续适用，完成情况只以上段和新账本实际证据判断。

本轮8.3.2尚未公开，以下旧发布记录保持各自历史时点。当前发布完成后才按[8.3.2账本](./[RUNBOOK]_Marketplace_8_3_2_Release_Readiness.md)先保存真实公开/新tag核验，再正常同步完整main回develop，最后DryRun/Apply仅市场8.3.3预升；三步不提前记完成、插件不变、无同号新发行。

下段为#254合入后的历史同步准备快照；#255实际同步及#256实际8.3.2预升已接续，不改写当时尚待执行的原记录。

发布记录 #254 已实际合入 main7615ca58f410876fc7393b0d93017250fe712091/treeb323da8a764120c23544ef9b65df479d9ca7a20f，与已测6a4同树。actual761 新核验：UTC15:03:12.936–15:04:07.552Z、wall54616.4894ms，十三安装/170命令零错、6Diagram+18LEK、130phases全ok/15cleanup及15自有根absence；52源哈希保持、实际19→19完整列表相同，canonical AGENTS未测，无新full/24/model/UI。宿主保持原6a4，目标为不同的actual761；计数不得借自候选/4e4旧批次。原suite4563644321 bypass、reviews=[]、批准NOT_MET保留；actual merge与技术结果不追认批准，后续sync/pre-bump继续正常门禁。当前第二步同步准备中、实际develop merge及其精确复验待完成，第三步依赖actualsync且未apply；原#253公开身份与限定客户端证据均保持。详见 [8.3.1账本§3.3](./[RUNBOOK]_Marketplace_8_3_1_Release_Readiness.md)与[汇总回执 recordPRPostMerge 附录](evidence/marketplace-8-3-1-postrelease.json)。

Marketplace v8.3.1 已通过 #253 于 2026-10-16T14:27:14Z 合入 main4e4d4172，tree9824218 与已测 b830 相同；direct tag/Release target 同4e4，bot于14:28:02Z公开，workflow38915888301 attempt1 SUCCESS。发布后14:30:44–14:31:40Z新tag批次十三安装/170命令、6 Diagram+18 LEK Python、130成功phases/15cleanup及15自有根absence通过，51源哈希与实际18→18登记列表保持；宿主b830未切，canonical AGENTS未测。内部发布工作流不补造逐十三/Python raw。原suite4563052548为bypass/approval fail、reviews=[]，治理NOT_MET不因技术PASS改写；HTML FAIL、Learning延期、Communication PARTIAL及所有客户端/效果限制保持。完整原件、独立核验与新授权三PR收尾顺序见 [8.3.1 账本](./[RUNBOOK]_Marketplace_8_3_1_Release_Readiness.md)及[发布后汇总回执](evidence/marketplace-8-3-1-postrelease.json)。

v8.3.0 已由 #241 于 2026-10-15 合入 main，实际 merge/tag/Release target 为 `ae2754dbae2a9acaedf6965ecc4a7b3df7dadd64`；github-actions[bot] 07:51:33Z published，workflow 38701485705 success，assets=[]、immutable=false 为实际观察。发布后 07:55:29–07:56:54Z 十三 canonical、6 Diagram + 6 Learning 实际缓存 Python 通过；R05只对应已有有限客户端证据，不新增界面/模型/效果结论。#240/#241 reviews=[]；后续规则审计确认两次合并与develop删除的最终结果为bypass，详见账本，不写保护批准通过。用户续办的文档收尾与常规维护按原授权处理；用户明确要求关闭自动删分支和恢复develop后，设置已false、原head32e32c5普通创建恢复，规则审计4536963592为PASS且保护规则不变；同步/预升仍走受保护PR。完整回执见[8.3.0 账本](./[RUNBOOK]_Marketplace_8_3_0_Release_Readiness.md)。

Marketplace v8.2.0已通过#232/main ebc4bdc3于2026-10-13自动公开，原三插件/五技能/两显式学习策略，发布后五精确canonical安装与实际Python通过；空reviews及immutable配置未提供/Release immutable=false保留，见[发行账本](./[RUNBOOK]_Marketplace_8_2_0_Release_Readiness.md)。#234实际合入2c0a8317同步main ancestry并保留HTML四插件开发集合，#235实际合入3af68373完成未发布8.2.1预升；两次merge各八精确安装/实际Python通过，见[收尾回执](evidence/learning-evidence-8-2-0-closeout.json)。版本工具先dry-run再只更新VERSION/README badge，插件版本保持，无同号tag/Release。原两文件预升的[skip a6]缺当前head签核失败如实保留；Owner要求修复后补充真实根AGENTS摘要、移除跳过标记，最终三路径走正常A6，通过且不修改门禁。纯两文件例外仍须既有精确非作者签核，正常摘要同步不需专用N/A正文；普通当前head非作者批准要求保持。两PR的空reviews不追认批准/豁免，原生/桌面/效果/Owner接受仍在OPEN Epic独立追踪。

Marketplace v8.1.1 已通过 #205 合入 main 并于 2026-10-10 公开，tag 与 Release 绑定 merge 8f0e044a593408fadc90565f326ef4cb5906e840；发布后四种 canonical 安装、图标比较和实际 Python 校验通过。Owner 截图及未提供的两端完整客户端结果、#205 独立批准缺项继续分开记录，见 [8.1.1 发布记录](./[RUNBOOK]_Marketplace_8_1_1_Release_Readiness.md)。#206 已回同步发布 main；本分支随后先 dry-run 再实际应用仅 VERSION / README badge 的 8.1.2 pre-bump，插件版本保持。同期 main 文档 PR #207 的实际 merge ancestry 在收尾时继续纳入。

记录标签、Release 身份和实际验收；按既有 [pre-bump 决策](../adr/[ADR]_Develop_PreBump_Adoption.md) 先将 main 同步回 develop，再准备 develop 的下一补丁 PR。Portable 格式仅预升 VERSION 与派生 README badge，市场索引不承载版本，各插件根 manifest 不连带更新；先执行版本工具 dry-run。develop badge 表示预计下一版本，不创建同号标签或 Release。回退与历史政策见 [迁移 ADR](../adr/[ADR]_ChatGPT_Codex_Portable_Migration_And_LearnKit_Retirement.md)。

Understanding Kit 初始 0.1.0 通过 #195 合入 develop；行为缺陷修正 0.1.1 已通过 #197 合入，并随 v8.1.0 发布。此前保留 marketplace 8.0.1 pre-bump，[新增决定](../adr/[ADR]_Understanding_Kit_Addition.md) 本身不构成发布授权。已有 [验收记录](./[RUNBOOK]_Understanding_Kit_Acceptance.md) 的历史失败、未覆盖行为及未执行客户端结果保留。#199 同步已发布 main 回 develop，#200 修正发布记录，#201 将 develop 预升为 8.1.1，均已合并并核对实际 Git tree；在该预升阶段 main 保持 8.1.0，各插件保持版本，8.1.1 不创建同号 Release。若并行的主分支文档 PR 产生新的 merge 身份，收尾时同步该 ancestry，保留已预升版本与现有内容。

v8.0.0 的标签、自动发布及合并后安装复查已记录在 [发布记录](./[RUNBOOK]_Portable_Migration_Release_Readiness.md)。已经发布不替代缺失的客户端验收或独立批准证据；保留未执行/未见记录状态，不追认 PASS 或未经提供的豁免。

历史带 wheel/checksum 的 v7.x 发布保留原资产。本次无资产状态机若被手工指向这类历史版本会拒绝重跑，不尝试修复、删除或覆盖资产；验证/noop 只适用于本次及后续无资产版本。

## Current closeout revision

v2.10.4 (2026-10-20, Asia/Taipei): Preserve PR281 initial failed Linux and bounded push recheck failure, distinct Windows PASS and current strict protected gates; prepare test-only bounded browser stderr diagnostics, no changed shipped checker, plugin versions or workflow.

v2.10.3 (2026-10-20, Asia/Taipei): Record actual PR280 synchronization, independently parsed final CI and fresh actualdevelop checks PASS, followed by zero-write DryRun and bounded Apply to unpublished Marketplace8.3.3. Preserve tag f906, approval NOT_MET/bypass, queued/UNKNOWN and timestamp limits; local642/642 and independent8.3.3 installs passed; protected PR and actual merge remain pending.

v2.10.2 (2026-10-19): Record actual PR279/main record merge separately from unchanged v8.3.2 tag f906; retain source-bound matrix results and approval NOT_MET/Owner bypass, fresh actualmain checks PASS, and protected develop sync preparation before any 8.3.3 DryRun/Apply.

v2.10.1 (2026-10-19): Record actual PR278/main/tag/Release 8.3.2 publication and preserve Owner bypass/approval NOT_MET; record fresh real-tag verification PASS; the record PR, actual main sync and Marketplace-only 8.3.3 preparation remain dependent under ordinary protected gates. Preserve the prior preparation text as dated history.

v2.10.0 (2026-10-19): Prepare authorized 8.3.2 from actual #275 with new HTML site and inherited governance; retain empty reviews and matched rule-suite bypass without invented rule details, pending main protection/publication and fresh checks, and preserve old synchronization snapshots as history.

v2.9.5 (2026-10-15): Append actual five-package publication and fresh post-publication installation receipts, retain limited R05 and missing independent reviews; distinguish resumed maintenance from the prior release task stop boundary.

v2.9.3 (2026-10-13): Record the actual #234/#235 ordered merges and exact canonical installation/Python checks; retain original A6 failure/normal root-summary repair, missing independent reviews and all deferred Epic entries. Published three-plugin 8.2.0 and unpublished four-plugin development 8.2.1 remain separate.
