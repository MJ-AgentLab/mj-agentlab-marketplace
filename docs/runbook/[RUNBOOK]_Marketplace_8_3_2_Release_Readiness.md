---
type: runbook
scope: marketplace
summary: "Record verified 8.3.2 synchronization and applied unpublished Marketplace-only 8.3.3 preparation"
owner: marketplace-maintainers
created: 2026-10-19
updated: 2026-10-20
state: active
version: v1.4
layer: working
purpose: "Maintain source-bound 8.3.2 release identities, gates, retained limits and ordered recovery/closeout for task 274"
last-verified: 2026-10-20
---

# [RUNBOOK] Marketplace 8.3.2 release readiness

## Current sync merge and marketplace prebump

当前后继CI（本地2026-10-20）：[预升PR281](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/281)已创建，原head1d8b6849/treeeefcaa与潜在merge4e495同树；尚未实际合入。原PR Linux640P/1F/1平台skip，真实Chrome未取得可读DevTools端点、NOT_RUN/exit2，smoke未执行；原Windows642/642及新13/178/6/18/4/4实际通过。原push两端各有启动FAIL，一次有界复验Linux仍FAIL，根因UNKNOWN，不能用本地/Windows通过覆盖。诊断前124原件及捕获中间文本副本已覆盖的限制由唯一REPORT冻结；当前仅补测试层Linux有界stderr，不改checker/flags/15秒判据/非零NOT_RUN、插件或workflow，不把诊断当修复或通过。新诊断检查/后继headCI和真实批准/线程/latestbase各待真实证据，Agent不bypass；8.3.3仍未发布、公开8.3.2保持，Owner接受/延期独立。

当前来源见[唯一REPORT](../../plans/274-html-learning-artifact/[REPORT]_HTML_Learning_Artifact.md#current-sync-merge-and-marketplace-prebump)。以下为原1d8b建PR前预升与检查快照，其PR未创建/后继待证只表示当时状态，当前以上段和Issue为准。

本轮客户端日期为Asia/Taipei `2026-10-20`；下列平台事件另保UTC原日期。[同步PR280](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/280)于 `2026-10-19T16:37:27Z`（本地20日00:37:27）实际合入develop `4d10a0677c745eccb2775f7ae6176f8e2b1d2387`，tree `db49629fe767d3584f6ce772ef7bf5cdb52094e1` 与已测head `ef85a2de6e39b1981d94d9d4cbc004fbdc71acee`、merge-ref535的tree相同；parents为develop65d与ef85，完整main e3dc已是actualdevelop祖先。同步交付与后续新验、保护批准、预升分别判断；同一[REPORT当前同步合入与预升节](../../plans/274-html-learning-artifact/[REPORT]_HTML_Learning_Artifact.md#current-sync-merge-and-marketplace-prebump)绑定原件与覆盖。

实际develop规则suite `4603805882`匹配before65d→after4d10，result=bypass；pull_request FAIL，缺少latest-pusher之外的批准，required_status_checks、non_fast_forward与deletion PASS。PR280 reviews=[]，批准仍 **NOT_MET**，不以实际Owner bypass、同tree或技术结果追认批准，不形成未来豁免。PR280原queued快照及当时UNKNOWN保留；CI run39279114820的最终raw已独立解析：Linux642总/641 PASS/0 FAIL/唯一Windows平台专用skip，Windows642/642 PASS、零skip，每端新13安装/178命令、实际6 Diagram+18 LEK Python及4site生成+4静态Python（各89/89）。这些计数绑定该次CI原身份，不改称actual4d10的新执行。9项时序冲突的原字段保留，部分helper记录completedAt早于startedAt；不据此推断因果、执行顺序或耗时，也不改写旧queued/UNKNOWN结果，详细原件与范围由REPORT接续。

actualdevelop4d10的新十三安装/实际缓存Python已于 `2026-10-19T16:39:19.139Z–16:50:02.166Z`（本地20日00:39:19.139–00:50:02.166）独立完成 **PASS / BOUNDED**：13场景/178命令全exit0、6 Diagram+18 LEK Python、4site生成+4静态各89/89，15个精确自有根均不存在，hostHEAD与完整worktree清单复原。原件由REPORT绑定 `sync280/postdevelop/`，final-manifest SHA256为 `93601736e301a05082e7653d41f3f7d576f30a7058ce9462d5b6d4947cf3f117`；这是actualmerge后的新批次，不借PR280 CI、e3dc或公开tag旧计数。

该真实PASS后，Agent于UTC19日 `16:52:31.265Z` 执行DryRun、`16:52:32.762Z` 执行Apply，仅将Marketplace8.3.2预升为**未发布8.3.3**。版本操作时的7252文件map证明DryRun零写入、Apply仅修改VERSION与README badge；插件版本/运行/guide未变，未创建v8.3.3 tag或Release。版本操作原件由REPORT绑定 `sync280/prebump/`；本地完整642/642及独立8.3.3新安装检查已通过；预升PR的真实当前head保护批准/CI/线程及实际合入仍待各自证据，不以已Apply推定交付或发布通过。

当前隔离分支 `codex/prebump-marketplace-8-3-3`从actualdevelop4d10派生，拟向受保护develop4d10提交本轮市场预升PR，尚未创建编号。当前head真实1个非作者批准、last-push approval、Validate Structure与A6、线程和latestbase逐项满足后才普通合并，Agent不self-approve、不bypass。插件版本、运行及guide资源保持，不创建新发行；公开v8.3.2 tag/Release仍为f906，发布正文未变，v8.3.3 tag与Release两次查询各404只证明该次观察不存在。Owner体检/最终接受、原生窗口等延期和NOT_MEASURED独立；继续复用#274唯一PLAN/REPORT/来源。

## Current record merge and synchronization

以下为v1.2在PR280实际合入前的记录merge与同步准备快照；其中sync PREPARING、尚无PR编号只表示当时状态。当前actualsync4d10、新验限定PASS及未发布8.3.3已Apply以上节和当前表为准，旧时点语义保留。

[记录PR279](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/279)于 `2026-10-19T15:17:09Z` 实际合入main `e3dc40f734fc972e05956da3e908091e09963675`，tree `ae121f6b256d1a44ea05a06061ba025b605655d9` 与已测head `315b5942a3a61c6bf7ab17513b8263496bd7a48a`、merge-ref `687b70abd58a8556ee566c74c340dd66480fe407` 相同；实际parents为公开源 `f906b1001a86d7b5415451bd973bea26e6cc3a1d` 与315b5942，develop65d已在完整ancestry中。本次只交付发布记录、公开安装导航与必要来源，**v8.3.2 tag/Release仍绑定f906b100**，不将后继记录main e3dc当成新tag或新发行。原件与当前工程覆盖由同一[主REPORT当前记录合入与同步节](../../plans/274-html-learning-artifact/[REPORT]_HTML_Learning_Artifact.md#current-record-merge-and-synchronization)承接。

PR279的[双系统CI run39272665913](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/39272665913)终态成功：Linux642总/641 PASS/0 FAIL/1 Windows平台专用skip，Windows642/642 PASS、零skip；每端各13安装场景、178命令及实际6 Diagram+18 LEK Python、4site生成+4静态Python（各89/89）通过，4个browser case未skip。16个清理名称对应的TAP用例通过只证明这些用例范围，不能替代真实逐自有根absence清单。push run39272636618仅记录终态success，不借其概括状态补造矩阵或安装计数。上述证据绑定315b/687b原身份，不改称e3dc合入后的新运行。

实际main规则suite `4602541728`匹配before f906 / after e3dc，为Owner bypass；pull_request FAIL，原因仍为缺latest-pusher之外的批准，其余4项规则PASS，PR279 reviews=[]，治理批准仍 **NOT_MET**。合入与技术结果不追认为独立批准，也不成为后续同步/预升的豁免。独立actualmain e3dc新验15:18:57.732–15:29:31.902Z已PASS：13场景/178命令全exit0、6Diagram18LEK Python、4site生成4静态各89/89，site20/guide4资源一致，15精确自有根absence且完整worktree清单及hostHEAD复原；[新summary/方法](../../plans/274-html-learning-artifact/evidence/sources/postmerge/record279/postmain/summary.json)与[终态](../../plans/274-html-learning-artifact/evidence/sources/postmerge/record279/postmain/terminal-receipt.json)为本轮原件，不借CI/tag计数；未运行model/desktop/browser，私有Site未变。

当前隔离分支 `codex/sync-main-8-3-2` 从完整actualmain e3dc派生，向受保护develop65d准备正常同步PR，尚未创建编号。当前head须满足真实1个非作者批准、last-push approval、Validate Structure与A6、已解决线程和latest base，Agent不self-approve、不bypass。只有actual sync真实合入并完成新复验后，才进入Marketplace8.3.2→8.3.3的DryRun/Apply，插件版本不变，不创建同号tag/Release；未发生的同步与预升不记完成。#274唯一PLAN/REPORT/来源复用，Owner体检/最终接受、原生窗口等延期及NOT_MEASURED保持各自边界。

## Actual publication and current continuation

本节公开与真实tag复验事实均绑定f906；main已由记录PR279推进到e3dc，develop已由同步PR280推进到4d10，当前预升状态以本文件开头新节和下表为准。PR278及公开时点的原事实保持，不将不同分支和时点混为同一SHA。

[PR #278](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/278) 于 `2026-10-19T14:28:06Z` 实际合入 main `f906b1001a86d7b5415451bd973bea26e6cc3a1d`，tree `6e4bc9cc31df2d1eac33e8c10907eb3725ca744d` 与发布源 head `f68c22b563fab661b803576058c8a08619c6738a` 及已测 merge-ref `4269d6632dab28f6d0aaa78dea38ad5b3b66a072` 相同。五包版本为 Diagram0.3.1 / Learning Evidence0.1.0 / Explain0.1.1 / HTML Guide0.1.37 / Communication0.1.0，八公开技能、五显式/三自然、20仓库技能；沿用同一 #274 的唯一 PLAN/REPORT，不创建第二份计划或报告。

**实际公开与保护批准分别记录。** [main规则suite4601606831原件](../../plans/274-html-learning-artifact/evidence/sources/postmerge/release278/publication/pr278-rule-suite.json)匹配 before `7615ca58f410876fc7393b0d93017250fe712091` / after `f906b100`，actor为ranzuozhou，result=bypass；pull_request evaluation fail，原因为缺少最新推送者之外的批准，required_status_checks pass。[PR278 reviews=[]](../../plans/274-html-learning-artifact/evidence/sources/postmerge/release278/publication/pr278-reviews.json)，独立批准仍 **NOT_MET**。本次实际Owner bypass不追认为批准通过，也不构成记录、同步或预升PR的未来豁免；#275原批准缺口同样保留。

[自动发布 run39269211915](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/39269211915) attempt1于 `14:30:24Z` completed/success，job118116772603于14:30:23Z成功；[Release417390526 / v8.3.2](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases/tag/v8.3.2) 于 `14:30:16Z` published。[真实tag](../../plans/274-html-learning-artifact/evidence/sources/postmerge/release278/publication/tag-ref-final.json)为直接commit ref，tag与[Release原件](../../plans/274-html-learning-artifact/evidence/sources/postmerge/release278/publication/release-final.json)target_commitish均为main `f906b1001a86d7b5415451bd973bea26e6cc3a1d`；draft=false、prerelease=false、assets=[]、latest=true、Release immutable=false，仓库immutable配置未提供，保持 **UNKNOWN**。[独立发布回执](../../plans/274-html-learning-artifact/evidence/sources/postmerge/release278/publication/publication-summary.json)于14:33:03.351Z核19项实际身份/正文/发布/规则观察均真；正文只在CRLF→LF后trim的明确范围内与实际main CHANGELOG的8.3.2节相同，不冒称原始字节全同。原API/日志、[方法](../../plans/274-html-learning-artifact/evidence/sources/postmerge/release278/publication/methods.json)及[哈希清单](../../plans/274-html-learning-artifact/evidence/sources/postmerge/release278/publication/evidence-manifest.json)保留；自动工作流成功不补造逐十三安装或缓存Python原始日志。

PR278最终head的[双系统CI run39259489009](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/39259489009)已取得终态：实际checkout为上述merge-ref/tree；Linux job118083116207于13:25:23Z成功，642总/641 PASS/0 FAIL/1 Windows等价大小写专用skip；Windows job118083116225于13:35:06Z成功，642/642 PASS、零skip。两端strict/baseline及各13场景、178命令均成功，实际各6 Diagram+18 LEK Python、4site生成+4静态Python（各89项零失败）；真实浏览器单元项未skip，安装smoke的browserCheck仍NOT_RUN，不冒充新消费者、桌面派发、Sites或效果测试。[CI summary](../../plans/274-html-learning-artifact/evidence/sources/postmerge/release278/ci/summary.json)、[terminal receipt](../../plans/274-html-learning-artifact/evidence/sources/postmerge/release278/ci/terminal-receipt.json)及[最终冻结回执](../../plans/274-html-learning-artifact/evidence/sources/postmerge/release278/ci/final-freeze-receipt.json)分别绑定其raw job及实际统计。

额外跨平台物理字节QA[首次断言FAIL](../../plans/274-html-learning-artifact/evidence/sources/postmerge/release278/ci/terminal-first-failure.log)保留，不改称全部插件跨平台原字节一致。随后按精确Git blob[独立复现全部24份既有文本差异](../../plans/274-html-learning-artifact/evidence/sources/postmerge/release278/ci/cross-platform-newline-details.json)，仅LF与CRLF可逆转换后的哈希吻合，不做一般空白归一化；HTML guide/site资源跨平台哈希一致，每个平台内源/缓存字节一致。首次digest在重定向提取日志尚未写完时捕获空文件的观察也保留，终态流程退出后另存完整哈希清单，不覆盖原记录。

| 后续项 | 当前状态 | 依赖与边界 |
| --- | --- | --- |
| 公开时main/tag/Release | PUBLISHED / SAME_TREE at f906；APPROVAL_NOT_MET | 独立发布回执19项观察有证；后继记录main e3dc与仍为f906的公开tag分开，正文核验范围、规则缺口与发布终态分别保留 |
| 真实公开tag的新十三安装/缓存Python | PASS / BOUNDED | 独立新验14:31:11.601–14:41:25.926Z已PASS：13/13场景、178命令全exit0、6Diagram+18LEK Python、4site生成/4静态各89/89，公开8/仓库20/显式5/自然3、site20/guide4资源摘要一致；15精确自有根均不存在、canonical无注册残留；[raw/summary](../../plans/274-html-learning-artifact/evidence/sources/postmerge/release278/posttag/summary.json)与[终态](../../plans/274-html-learning-artifact/evidence/sources/postmerge/release278/posttag/terminal-receipt.json)为本轮新原件，开始晚于公开55.601秒，未运行model/desktop/browser，不沿用65d/CI计数 |
| 本轮发布记录PR279 | MERGED / SAME_TREE；APPROVAL_NOT_MET | 15:17:09Z实际合入main e3dc，同已测315b/687b tree；默认公开安装ref与site导航已交付，实际Owner bypass及reviews=[]缺口保持 |
| 记录merge actualmain e3dc新验 | PASS / BOUNDED | 独立actualmain e3dc新验15:18:57.732–15:29:31.902Z已PASS：13场景/178命令全exit0、6Diagram18LEK Python、4site生成4静态各89/89，site20/guide4资源一致，15精确自有根absence且完整worktree清单及hostHEAD复原；本轮新原件见上节，不借CI或公开tag计数，不升级保护批准/Owner接受 |
| 完整actualmain同步回develop PR280 | MERGED / SAME_TREE；APPROVAL_NOT_MET | UTC19日16:37:27Z实际合入develop4d10，同ef85/535 tree且完整继承main e3dc；suite4603805882实际bypass/批准FAIL与reviews=[]缺口保持，旧queued/UNKNOWN不改 |
| actualdevelop4d10新十三安装/缓存Python | PASS / BOUNDED | UTC19日16:39:19.139–16:50:02.166Z新13/178全exit0、6Diagram+18LEK及4生成/4静态各89/89；15精确根absence、hostHEAD/worktree清单复原，原件及manifest见当前节，不借CI/旧main/tag证据 |
| 仅Marketplace8.3.3预升 | DRYRUN/APPLY_EXECUTED / UNPUBLISHED；PR_NOT_CREATED | 真实新验PASS后于UTC16:52:31.265/16:52:32.762Z先DryRun再Apply，7252文件map证零写/仅VERSION+README badge；插件不变，无新发行。本地642/642及独立8.3.3新安装已通过；新PR当前head真实批准/Structure+A6/线程/latestbase待证 |
| Owner体检/最终接受与延期 | NOT_PROVIDED / OPEN | 真实Owner决定另记；原生窗口/第二客户端等未因此通过，理解效果保持NOT_MEASURED |

以下§1–3保留本次发布前的授权、范围、准备状态及预定顺序快照；其中“尚未创建”“未公开”“PENDING”等只代表当时观察，当前实际状态以上述新节和唯一主REPORT为准。last-verified的本地2026-10-20仅覆盖已有公开/真实tag、actualmain及本轮actualdevelop新验、版本工具写入范围及本地642/642与独立8.3.3新安装核验；不表示预升PR保护批准/CI/线程、实际合入、正式发布或Owner接受已通过。原准备快照中的null只属于当时。

## §1 Authorization, task and actual source

本账本承接 [#274 任务入口](../../plans/274-html-learning-artifact/INDEX.md)的唯一[主 PLAN](../../plans/274-html-learning-artifact/[PLAN]_HTML_Learning_Artifact.md)与[主 REPORT](../../plans/274-html-learning-artifact/[REPORT]_HTML_Learning_Artifact.md)，记录正式发行的身份、适用门禁和恢复，不建立第二份计划或报告。Owner 原实施指令已覆盖完整原计划及 P5 按项目规则上线；本轮又明确“#275 PR 已合并，继续后续工作”。目标、对象、环境、权限与风险边界未实质改变，沿用该授权准备正式发布，不另要求 Owner 审查常规构建；成品体检和最终接受另待真实决定。

[PR #275](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/275) 于 `2026-10-19T12:56:35Z` 实际合入 develop `65d756efd3024ac10d1d0e6ea189055fbe6f1545`，tree `d7de559f6563d8208098952f92495c1b7acca9cb` 与已测集成 `1a80bab5c85ae9b216f49a5d9c114770117ab2dd` 相同。实际合入、工程结果、保护批准与 Owner 接受分别判断；reviews=[]，非作者批准记 **NOT_MET**。真实规则执行列表的 suite `4599887231` 匹配 develop before `1d5219c1fa1bbf14cc79f630a59e9a8c857248f4` / after `65d756ef`，pushed_at为`2026-10-19T20:56:35+08:00`，result=bypass；[原始详情](../../plans/274-html-learning-artifact/evidence/sources/postmerge/pr275-rule-suite.json)确认pull_request fail：缺少最新推送者以外的批准；required_status_checks pass，不推造豁免授权。实际合入不成为后续发布保护的例外。

本次隔离发布分支为 `codex/release-html-learning-8-3-2`，保留上述 develop 完整 ancestry；准备时 main 为 `7615ca58f410876fc7393b0d93017250fe712091`。本账本v1.0准备时正式发布 PR 尚未创建；后续当前身份由原Issue/PR回读。实际 PR 号、最终 head/base/候选合并树和服务端门禁由真实回读补记，不预造未来身份。Marketplace VERSION/badge 已由既有预升准备为 `8.3.2`；本次不重复 bump。准备时无 v8.3.2 tag 或公开 Release，现行安装仍指向真实公开 v8.3.1；新版本公开前不将安装指引改为不存在的发行。

## §2 Release scope and inherited qualifications

| Package | Candidate version | Scope compared with main761 |
| --- | --- | --- |
| Diagram Kit | 0.3.1 | 无运行或版本差异 |
| Learning Evidence Kit | 0.1.0 | 无运行或版本差异 |
| Explain Kit | 0.1.1 | 无运行或版本差异 |
| Communication Kit | 0.1.0 | 无运行或版本差异 |
| HTML Guide Kit | 0.1.37 | 新增显式 site、包内方法/主题/工具、Read/Write 包级元数据、许可与相应检查；guide 和已批准图标保持 |

候选为五包八公开技能、五显式/三自然，仓库技能仍20项。main 已含公开 HTML 0.1.36；本次不再决定其首次发行，也不重启旧 guide 验收。guide 子树在 main/develop 均为 `e6561e75fcfebf13a98469f9035b334267998ec1`，不把未变字节等同全部历史行为通过。

完整 main→develop 差异还包括已交付的 [#257 文档分层与任务机制](../../plans/257-task-documentation/INDEX.md)、[#263 INTENT](../../plans/263-intent-mechanism/INDEX.md)、[#269 计划路径统一](../../plans/269-plans-path-unification/INDEX.md)，以及直接配套模板、20项既有仓库技能适配、完整来源/冻结证据校验与内部 PR 的 CI/A6 覆盖。这些是此次完整发行候选继承的既有治理交付，不改其他插件身份或运行范围；各任务的真实接受、历史批准缺口、失败和延期沿用原账本，不由本次发行追认。

新 site 的判准见 [SPEC](../spec/[SPEC]_HTML_Learning_Artifact.md)，实际有界结论见主 REPORT：内部候选已取得完整工程/安装闭包、独立代表材料内容核验、12项浏览器交互及一个目标客户端手动消费实际安装 locator→Sites 私有部署证据。实际65d的新安装复验已独立通过（§3），未运行新browser/model/desktop；本发布准备相对65d仅修改发行/任务文档、HTML README/CHANGELOG介绍及冻结证据的局部空白属性，不改技能/工具/包manifest字节。最终运行候选的 Windows 642/642、Linux 641 PASS/1 Windows 专属大小写 skip、各十三安装及实际缓存 Python，分别绑定其原 CI 身份；不换名为 actual65d 或本发布候选的新执行。浏览器生命周期修复、原失败和修复重跑保留各自原件。

代表性 Site 为 [Library Renewal · 续借判断](https://html-learning-artifact-274.zuozhouran.chatgpt.site)，保存版本1、源码 `ffaaa35965e7525b4f85036aa62e21b3c2095c73`，有界7文件制品与实际部署版本对应；原生回读 owner/custom/users1/groups0/externalVisitors0，匿名无凭据 GET 返回401。详细部署身份、访问回读及观察时钟见主 REPORT 和其中 Sites 原件；这些是该次实际观测，不是本次新网页交互、持续监控或 Owner 接受。既有私有站保持身份和受众，不因 Marketplace 正式公开扩大站点权限。

以下限制继续适用，不以新版公开抵消：

- **HTML guide**：保留 0.1.36/#239 已知 FAIL、完整双端和扩展未覆盖、原生空返回/关闭/超时及 Owner 接受缺项；旧 Work/Codex 限定结果不升级为当前完整通过，详见[历史验收](./[RUNBOOK]_HTML_Guide_Kit_Acceptance.md)。
- **HTML site**：当前桌面手动按安装 locator 执行与 CLI 发现、原生桌面派发分开；原生持续窗口/完整生命周期、第二客户端、完整视觉/可访问性及扩展场景仍延期。必要答案缺失仍阻依赖部分，未提交/默认/预选/沉默/超时/关闭不算回答。Owner 体检与最终接受未提供，理解效果保持 **NOT_MEASURED**。
- **Learning Evidence**：沿用[入口资格账本](./[RUNBOOK]_Learning_Evidence_Kit_Acceptance.md)限定 CLI core，移交仍限已有本地 Git exclude；严格原生持续待答延期、桌面/Side Chat 和真实效果未测，#215/Epic 及 Owner 最终接受独立。
- **Communication**：保留[验收](./[RUNBOOK]_Communication_Kit_Acceptance.md) CLI 15 PASS/3 PARTIAL、同一桌面应用两个本机入口的限定结果；不冒充两个独立客户端、完整 Office 或所有窗口生命周期通过。
- **治理与批准**：各历史任务、#253/#254 的已证实治理缺口与 #245 仅限本 Issue 的历史例外保持；#275 空 reviews/批准 NOT_MET及匹配规则suite实际bypass分别披露，pull_request fail（缺最新推送者外批准）、required checks pass。任何历史接受、技术 PASS、实际合入或私有 Site 发布均不替代本次 main 当前 head 的真实保护批准。

## §3 Historical preparation gate ledger and intended execution order

本表为v1.0发布准备快照，保留当时各项状态；PR278实际合入/公开及已完成的真实tag新核验由本文件开头Actual publication新节接续。

| Item | Current preparation state | Required evidence / next action |
| --- | --- | --- |
| #275 actual develop identity | MERGED / SAME_TREE / APPROVAL_NOT_MET / BYPASS_OBSERVED | 已绑定65d/tree及1a80；空 reviews与实际suite4599887231分记，pull_request fail（缺最新推送者外批准）、required checks pass |
| Fresh actual65d verification | PASS / BOUNDED | 独立13:00:06.401–13:10:12.179Z新验：13场景/178命令全status0、6Diagram+18LEK Python、4site生成/4静态Python（各89项零错）；47资源组、site各20资源；自有新根无残留、worktree清单复原，见[原始汇总](../../plans/274-html-learning-artifact/evidence/sources/postmerge/canonical65d/summary.json) |
| Final release candidate | LOCAL_TECHNICAL_PASS / CI_PENDING | 发布准备本机642/642零skip、144相关与9site修后通过，旧FAIL保原件；最终head/tree与新服务CI/安装仍按实际PR冻结身份回读，见[阶段汇总](../../plans/274-html-learning-artifact/evidence/sources/postmerge/preparation/html-learning-274-release-final-checks.json) |
| Protected main PR | NOT_CREATED at this preparation snapshot | 从本隔离分支向最新main建正常release PR，真实编号与身份后补 |
| Current-head main approval/checks/threads | PENDING | 1个真实非作者批准、最新推送批准、适用code-owner要求、Validate Structure及其他required checks、最新base和已解决线程 |
| Actual main merge / tag / Release | NOT_PUBLISHED | 门禁满足后普通合并，由既有draft-first发布；回读实际SHA、正文、published/assets/immutability |
| Fresh real-tag verification | NOT_STARTED / DEPENDENT | 公开后从真实tag的新十三安装、6 Diagram+18 LEK Python、site生成/静态及清理结果按实际日志计数 |
| Owner inspection / final acceptance | NOT_PROVIDED | 上线后Owner从成品体验给真实范围/问题/决定；不让其承担常规构建审查 |

执行顺序：

1. Agent 核对 actual65d 合入身份并完成新复验，将原始证据与结果接回同一 #274 REPORT；冻结完整隔离发布候选，核对 VERSION=8.3.2、CHANGELOG 对应版本节、五包资源、来源/许可及无凭据或非预期材料。
2. 执行当前适用完整工程/严格校验、精确 CLI 0.147.0、十三隔离安装及实际缓存 Python；必要 CI、A6 和提交约定同样核验。check/smoke 别名不重复计作独立运行。已有内容/消费者证据只按实际资源差异继承，不重启完整旧模型或桌面矩阵。
3. 正式 PR→main 读取真实 rulesets、current head/base、最新服务端检查、批准、线程及候选合并树。所有本次适用保护条件真实满足后才普通合并；不 self-approve、不 bypass。分支移动则刷新受影响检查和最新推送批准。#275 已发生的历史缺口继续独立披露，不制造追溯批准。
4. VERSION 合入 main 会触发 [Release workflow](../../.github/workflows/release.yml)。按[现行发布操作](./[RUNBOOK]_Release_Operations.md)执行 draft-first：指定 SHA 属于 main，新发行绑定当前 main tip；空draft→canonical安装验证→紧邻publish重新核身份→publish→回读。未知结果先核状态，禁止重复创建同号发行或覆盖已公开历史。
5. 回读实际 main/tag/Release 同 SHA、版本/正文、工作流、draft=false、prerelease、assets 与 immutability；未返回的信息记 UNKNOWN。自动工作流的概括 canonical PASS 不补造逐十三场景/Python raw。
6. 从真实 tag SHA 新做十三 canonical 安装及实际缓存 Python/资源核对，保存真实工具版本、动作/返回码、清理与自有根 absence。新批次与候选/actual65d 分开，不借计数。只有此后才更新安装指引为真实 v8.3.2。
7. 先记录实际公开及复验→将完整实际main ancestry通过正常PR同步回develop并复验→才从实际同步结果先DryRun再Apply仅市场8.3.2→8.3.3预升，正常同步README badge/根AGENTS与A6；插件版本保持、不创建v8.3.3 tag或Release。后续PR各自满足真实批准、CI、最新base和线程，顺序与实际身份分别记录。

`last-verified: null` 表示本次正式发布闭环尚未完成，不否定既有候选技术验收，也不把它升级为main批准、公开或发布后新执行。只有实际事实发生后追加结果；完整计划完成与Owner最终接受仍分记。

## §4 Monitoring, stop conditions and recovery

责任为执行 Agent，Owner 处理实质决定/必要权限及成品接受。发行前、公开后即时复查与Owner问题反馈时观察 tag/Release 身份、canonical 安装/资源/Python失败、关键内容/交互错误及Sites部署/访问边界；本次没有创建持续监控自动化，不称一次回读为连续监控。

关键内容或资源缺失、核心不能完成、必要门禁失败、tag/Release错绑、身份/受众异常、凭据或非预期材料风险均停止新增发布/扩大受众，保留原始结果并升级责任Agent/必要Owner。未知远端结果先回读身份、保存版本和权限，确认实际状态后再修复，不盲目重复创建/部署。

插件已知良好公开基线为v8.3.1的实际tag `4e4d4172fb27c812d3be8847f792dae5313daec8`；Sites已知良好交接包为主REPORT对应7文件、manifest SHA256 `c4c445947180f77641512dee1de3732fbc7946fb53fce804f33677e6e037c16e`与真实保存版本1。恢复先核原始受众/身份，再选已知良好保存版本重新部署或前向修复，复验受影响部分。已公开插件问题以新受保护修复PR/版本前向处理或原子恢复完整包及严格清单，不删除、重打或覆盖历史tag/Release/资产；失败与重跑原件均保留。自有临时根只在证据保存后按精确路径安全清理，不触碰研究目录、原用户计划或其他任务缓存。

## §5 Revision history

| Version | Date | Scope |
| --- | --- | --- |
| v1.4 | 2026-10-20 | Preserve initial PR281 Linux/startup failures and bounded push recheck failure separately from Windows PASS; prepare test-only bounded stderr diagnostics without changed product/checker/gates. New diagnosis checks and protected delivery remain pending. |
| v1.3 | 2026-10-20 | Record actual PR280/develop4d10 sync, source-bound final CI and fresh actualdevelop checks PASS; preserve approval NOT_MET/bypass, UTC19 raw events and queued/UNKNOWN/timestamp limits. Record subsequent zero-write DryRun and bounded Apply to unpublished Marketplace8.3.3; local642/642 and independent8.3.3 installs passed; PR protection and merge remain pending. |
| v1.2 | 2026-10-19 | Record actual PR279/main e3dc with source-matched CI and Owner bypass/approval NOT_MET; retain published tag f906, record fresh actualmain checks PASS and protected develop sync PREPARING before any 8.3.3 preparation. |
| v1.1 | 2026-10-19 | Append actual PR278/main/tag/Release publication, final source-bound dual-platform CI and retained byte-QA failure; keep actual Owner bypass/approval NOT_MET, fresh real-tag verification PASS, and dependent record→sync→8.3.3 preparation distinct. |
| v1.0 | 2026-10-19 | Prepare authorized full 8.3.2 from actual #275 merge; preserve exact package/governance scope, empty reviews and source-matched bypass observation with original per-rule failure/check facts, fresh actual65d checks, pending final candidate/main gates/publication, and ordered recovery/closeout. |
