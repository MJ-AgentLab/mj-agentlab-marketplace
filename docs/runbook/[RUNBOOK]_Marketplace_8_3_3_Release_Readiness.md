---
type: runbook
scope: marketplace
summary: "Record actual 8.3.3 publication, real-tag checks and preserved approval gaps"
owner: marketplace-maintainers
created: 2026-10-20
updated: 2026-10-20
state: active
version: v1.3
layer: working
purpose: "Maintain task274 source-bound 8.3.3 release identities, verification, protected gates, private Site observations and recovery"
last-verified: null
---

# [RUNBOOK] Marketplace 8.3.3 release readiness

## Actual PR289 develop verification and marketplace pre-bump

2026-10-20：#289已于13:09:38Z合入develop **f3e8ba322109e2a43dcdcd68fdd2f0c655c78240/tree6daad5a9e9f9d749e48e38b148657195c3ed2fa5**，parents a4892f51＋6de4be7d，完整继承main f18aa09；HTML0.1.39选择性统一已进入develop、尚未发布。实际develop新本机652总/651PASS/0FAIL/1平台skip、strict/CLI0.147.0及新13/178、实际Python和15精确根清理通过。其后在隔离候选DryRun零写→Apply仅VERSION+badge预升未发布8.3.4（尚待新保护PR合入），实际develop市场仍8.3.3；HTML0.1.39及其他插件保持；默认公开安装仍v8.3.3/HTML0.1.38。

suite4620018712实际bypass、reviews=[]/批准NOT_MET，Agent未执行该保护合并；旧Linux启动FAIL/UNKNOWN与一次同条件有界复验成功分记，成功不等于根因修复。D01持续窗口等延期非PASS、效果NOT_MEASURED、完整计划OPEN，原核心ACCEPTED_LIMITED不扩至0.1.38/Site v2/0.1.39；无新模型/桌面/第二客户端/原生/Sites测试或受众变更，无新增Owner实质决定。

下一步推荐：完成本轮预升候选的来源/文档/A6及独立复核，提交唯一新主PR→protected develop，并核对当前head CI、真实非作者且非latest-pusher批准、线程和最新base；理由是实际同步复验已具备预升前提，而预升不等于正式发行。自身PR/CI/实际合入结果接Issue274与外部冻结回执，无新实质差异不递归纯证据PR。

详见[唯一REPORT](../../plans/274-html-learning-artifact/[REPORT]_HTML_Learning_Artifact.md#actual-pr289-develop-verification-and-marketplace-pre-bump)。

## Actual publication and current continuation

PR284于2026-10-20T09:50:50Z实际合入main **fdede3cf5578dee8a41aef4310a9387d695c56bd/treef71963c1d5640933e80fccfec3383681fb15333b**，parents e3dc40f7＋cfbeb1bb；完整树与已测cfb及9a候选相同。v8.3.3于09:53:51Z正式公开，轻量tag/Release target同fdede，Release418243144为draft=false/prerelease=false/assets=[]/latest，immutable=false；仓库immutable配置字段未提供，仍UNKNOWN。自动Release39403662285 attempt1于09:53:57Z成功；原始日志支持draft-first创建/可见性等待/核验/公开，没有独立原生draft API快照。 [独立20项观察](../../plans/274-html-learning-artifact/evidence/sources/postmerge/r284/release-audit/publication-summary-v1.json)限定全通过；公开正文2507B/SHA25611fc9f4c0231ba5aebda7a7d3add60ed8f506a943e2ff516d5c2c8b27c5b069c，与actualmain CHANGELOG8.3.3节在CRLF→LF后trim范围相等，不声称原提取2509B与正文原字节同一。

实际suite4617090917精确匹配e3dc→fdede，actor ranzuozhou、result=bypass；pull_request规则FAIL（缺最新推送者以外批准），其余四规则PASS，reviews=[]/批准NOT_MET。Agent未执行此次合并或bypass，不把公开成功追认为独立批准或未来豁免。

actualmain固定源完整本机647总/646PASS/0FAIL/1平台专用skip、strict与精确CLI0.147.0已新执行通过；独立真实v8.3.3/fdede批次于09:56:21.473–10:08:43.971Z执行，13/13场景、178/178命令全0，实际6Diagram＋18LEK＋4site Python，4生成/4静态各95/95；site20/guide4资源、15实际根（1canonical＋1template＋13scenario）逐根absence及host/primary/Owner原件/完整worktree清单保持。原driver exit0且没有overall字段，但allBoundariesVerified=false：外层helper误用宿主默认TEMP，未按命令记录的子进程D:/t274a核边界；原false保留不覆盖。另以实际子进程目录/原始copy metrics作独立23项核验，15根安全边界及两次absence均有证。结论为PASS_LIMITED_WITH_RAW_HELPER_GUARD_FAIL，只接受有证功能/恢复子项，不称原完整run无缺口PASS；安装browser仍NOT_RUN，未额外跑模型/桌面或窗口。这批实际tag结果不借候选或actual283计数。首批默认TEMP在canonical checkout因Windows路径过长失败，0场景/0安装；原stderr/命令/perf保持，finally清理metric仅ok且完整worktree清单复原，但失败canonical具体TEMP根未留存，逐根absence不可核，原空集合allAbsent不作PASS证据。新短TEMP批次仅改进程临时路径，源码、时限及判准不变，实际根清理只绑定自身证据。裸Python不可用时实际使用捆绑Python3.12.14；不伪称裸Python可用。

原cfb CI39365093169首Linux启动FAIL/NOT_RUN2及根因UNKNOWN保留；仅一次同判准完整Linux debug重跑SUCCESS（647总/646PASS/0FAIL/1平台skip），Windows原执行同计数成功；attempt2的Windows代理仍沿用原时间，不算新Windows矩阵。push39365089131仅精确PR去重载体。旧318三FAIL及WindowsCRLF预算修复仍按原证据分记；原15秒/workflow/checker/阈值不变。

公开交付仍为HTML0.1.38，其他四包/guide保持；本轮仅修正README默认真实v8.3.3安装、当前公开版本和维护状态，接必要发布记录及[选证恢复映射](../../plans/274-html-learning-artifact/evidence/sources/postmerge/r284/selection.json)，不重复bump、不改已发布8.3.3 CHANGELOG整节/标签/Release正文或资产。原2295来源完整前缀和32行旧接受基线保留；完整外部根/固定Git按映射恢复，不声称选证包包含全部独立目录。新主PR自身CI/实际merge仅回Issue274和外部不可变回执，不递归开纯自证记录PR。

HTML0.1.39选择性统一已由内部285/286正常合入集成fe295a00，证据与唯一原意修订保存在[该固定Git的PLAN](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/blob/fe295a005e1659ea210a9768bbcce88d72ed64f4/plans/274-html-learning-artifact/%5BPLAN%5D_HTML_Learning_Artifact.md#selective-alignment-baseline)及既有独立task-evidence；本轮main不带该未发布产品。下一步推荐：先正常合入本轮main导航/记录PR，随后将包含该merge的完整actualmain普通合入既有0.1.39集成分支，用后继唯一主PR→protected develop同时承接main同步及已授权选择性统一。实际develop同步合入并复验后，才可DryRun→Apply仅市场8.3.4预升；当前未执行。理由是先让默认安装抵达真实修复版本，再交付新方法，避免无产品差异的机械纯同步PR。当前无新增Owner实质决定。

原核心ACCEPTED_LIMITED仅覆盖原已交付核心，不覆盖本次0.1.38/Site v2/0.1.39或完整计划；完整计划OPEN、最终接受NOT_PROVIDED、效果NOT_MEASURED。D01原生持续窗口/空返回/超时/关闭及其余延期非PASS；本轮无新增模型/桌面/第二客户端/Sites动作。旧FAIL/UNKNOWN、历史及本次bypass/批准NOT_MET保持，后续当前head真实独立批准/required checks/线程/latestbase不得由本轮结果替代。

以下各节为各自时点原观察；创建前快照中的PENDING/未公开不作为当前状态。

last-verified继续null：这不是完整保护批准/全计划验收PASS；本节只绑定实际发布和明确范围的工程观察。

## Current preparation

发行[PR284](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/284)已创建→protected main e3dc，首head318/tree448的PR/push原CI均FAIL，不能以单PR Ubuntu通过称发行就绪。Windows16317LF→16410CRLF超限已明确修正文档摘要，实际LF15903/CRLF15996严格校验通过；push Ubuntu真实browser NOT_RUN2/955B日志原FAIL/根因UNKNOWN保留。后继head/CI及真实批准未先通过。完整[phase1原件](../../plans/274-html-learning-artifact/evidence/sources/postmerge/a283/r1/phase1-summary.json)与[本机修复](../../plans/274-html-learning-artifact/evidence/sources/postmerge/a283/budget/budget-repair.json)由REPORT接续。下列尚无PR/head等语句是首候选准备前快照，当前以本段及Issue为准。

2026-10-20：本账本准备一次已授权的Marketplace8.3.3修复发行。HTML Guide Kit0.1.38已由[PR283](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/283)实际合入develop并取得新本机/安装复验；同一私有Site的version2前向修复已原生部署成功。当前市场公开仍为v8.3.2，8.3.3尚未公开；正式发行PR、当前head保护门禁、实际main merge和真实tag新验均须各自补证。last-verified保留null，不把已列局部核验当作完整发行闭包完成。

本账本是[#274](../../plans/274-html-learning-artifact/INDEX.md)的发行身份与门禁台账，复用唯一[主PLAN](../../plans/274-html-learning-artifact/[PLAN]_HTML_Learning_Artifact.md)和[主REPORT](../../plans/274-html-learning-artifact/[REPORT]_HTML_Learning_Artifact.md)，不建立第二计划或第二交付报告。历史v8.3.2身份及未完成项保留于[原账本](./[RUNBOOK]_Marketplace_8_3_2_Release_Readiness.md)。

## Authorization and exact scope

Owner本轮明确“#283 PR已合并，继续后续工作”。沿用原完整B1/P5与五边界授权，本轮为一次repair release及同一私有Site的有界前向修复，未扩大目标、对象、环境、权限或风险边界；[范围评估](../../plans/274-html-learning-artifact/evidence/sources/postmerge/a283/scope/assessment.md)支持复用，不重复索取常规工程决定。Owner既有核心接受为ACCEPTED_LIMITED，只绑定其已接受的原交付核心；本次0.1.38、Site version2新制品及完整计划的接受均未提供，不能由合入、部署或发布推定。已有核心接受不重新索取。

| Identity | Actual value / boundary |
| --- | --- |
| develop实际PR283 merge | a4892f51f4163fb5bd4457d99229eaf1a4683e8f，2026-10-20T02:51:03Z；parents908d29537a19ceca166e8f3c7cddef4d419781a4＋395bafe51d79374f6ef57fdfd772a6d1121f7ef0 |
| actual tree | 196daab879d38b649333a01c4c0d0194c7b107c7，与已测395候选完全相同 |
| 准备时main基准 | e3dc40f734fc972e05956da3e908091e09963675；tree ae121f6b256d1a44ea05a06061ba025b605655d9 |
| 当前公开 | v8.3.2 tag/Release target f906b1001a86d7b5415451bd973bea26e6cc3a1d；本次核验时v8.3.3 tag/Release均404 |
| 市场版本 | develop VERSION/badge已预升8.3.3；本次不重复bump，公开安装指引保持真实v8.3.2直到观察到新tag |
| 集合 | 五包、八公开技能、五显式/三自然；仓库技能20保持 |

| Package | Release version | Difference from main e3dc |
| --- | --- | --- |
| Diagram Kit | 0.3.1 | 包目录和版本保持 |
| Learning Evidence Kit | 0.1.0 | 包目录和版本保持 |
| Explain Kit | 0.1.1 | 包目录和版本保持 |
| Communication Kit | 0.1.0 | 包目录和版本保持 |
| HTML Guide Kit | 0.1.38 | 0.1.37后的生成许可、输入保留名/路径边界、反思控件边界与安装LICENSE核验修复；guide完整运行目录保持 |

actual283相对main e3dc的已核范围为1546路径，其中1518证据路径、28其他路径；这是差异计数，不是验收数量，后续发行文档差异另核。完整范围还包含PR281测试层Linux Chromium启动stderr诊断与回归，以及既有公开记录、完整main回同步、仅市场预升和有界维护/恢复来源闭包；不能把8.3.3描述为仅CSS修复。其他四包、guide完整目录及全部workflow字节均与该main基准相同。原研究权利UNKNOWN的原件及凭据不进入发行。

HTML运行修复随生成制品传递原MIT LICENSE、Apache原文及带资产/材料范围和原安装定位说明的完整notice尾部；不改变输入材料授权。保留名含大小写/Unicode别名及嵌套冲突，组件尾点/尾空格在首写前拒绝；安装器逐字节核HTML根LICENSE。通用checker只核声明清单自洽，不认证来源或许可真实性。反思框边界由#aba492改为#767676；本次不修改旧guide行为合同。

PR281诊断仅在测试层保存有限启动stderr，保留checker参数、时限、非零NOT_RUN及旧启动FAIL/根因UNKNOWN；后继通过不反向解释旧失败。

## Verification and protected gates

actual283与候选/未来发行候选分别绑定。[实际合入审计](../../plans/274-html-learning-artifact/evidence/sources/postmerge/a283/audit/summary.json)确认真实reviews=[]、reviewDecision=REVIEW_REQUIRED；suite4612130198对应908→a489，result=bypass，pull_request规则FAIL缺最新推送者以外批准，required checks规则PASS。批准仍NOT_MET，不成为新main发行的例外，Agent不bypass。

| Gate / execution identity | Recorded result | Evidence / remaining work |
| --- | --- | --- |
| 395候选PR CI39359262844 | PASS_LIMITED | Ubuntu与Windows各647总/646PASS/0FAIL/1平台专用skip；每端13安装/178命令、6Diagram＋18LEK/4生成＋4静态各95/95。push39359256807由精确PR等价证明跳过matrix，不称第二次独立矩阵 |
| actual a489本机 | PASS | 647总/646PASS/0FAIL/1平台专用skip；validate及CLI0.147.0检查通过；不换名为新release head结果 |
| actual a489新13安装 | PASS | UTC02:56:38.655–03:09:46.916，13场景/178命令全exit0，实际6Diagram＋18LEK Python、4生成/4静态各95/95；[原summary](../../plans/274-html-learning-artifact/evidence/sources/postmerge/a283/install/summary.json) |
| 精确清理与隔离保持 | PASS，限本批 | 14唯一自有根为13 scenario根＋1模板根；host保持detached a489，primary908、15 worktree清单及Owner受控hash保持，不沿用历史“15根”计数 |
| actual merge Actions/checks | 空，非新CI PASS | 当前workflow不触发develop push；候选CI与本机/新安装分别保留身份 |
| 新main发行PR/head | PENDING | 尚无本账本绑定的实际PR/head；须正常继承完整actualdevelop并核最新main base |
| 新head CI / Structure / A6 | PENDING | 以新发行候选真实服务器终态为准，不借395或a489计数 |
| 当前head真实非作者/last-push批准、线程 | PENDING | 按main实际保护规则核验；历史bypass与空reviews不豁免 |
| 实际main merge SHA/tree复验 | NOT_RUN | 普通保护合入后核真实身份及适用新验 |
| v8.3.3 tag / Release / 发布workflow | NOT_CREATED / PENDING | draft-first、绑定与正式公开各需实际原件 |
| 真实v8.3.3 tag新安装/Python/资源/清理 | NOT_RUN | 公开后另开独立批次，不借候选或actual283结果 |
| Owner完整计划最终接受 / 理解效果 | NOT_PROVIDED / NOT_MEASURED | 原核心ACCEPTED_LIMITED保持，不覆盖本次0.1.38/Site version2新制品；全部延期与旧缺口继续追踪 |

## Same private Site version2

[Library Renewal · 续借判断](https://html-learning-artifact-274.zuozhouran.chatgpt.site)保持project appgprj_6ad5ec4ffef08191ab68478e806c7d54和既有受众。原version1/source ffaaa35965e7525b4f85036aa62e21b3c2095c73保留，不删除。新helper source为3d3082ff8cfa99576bbda816a3ecc3b0b787636d；version为appgprj_6ad5ec4ffef08191ab68478e806c7d54~appgver_248c305315948191b5b8656427218f4d，deployment为appgdep_6ad6db98ebd08191b4e623ba462c8d23，原生返回于2026-10-20T03:10:30.278974+00:00为succeeded。依据[原生终态及回读](../../plans/274-html-learning-artifact/evidence/sources/postmerge/a283/site/native-final.json)。

发布前后回读均为owner/custom、revision1，users1且唯一角色为owner、groups0、externalVisitors0、automations0；没有扩大访问范围。原生version2/source/deployment状态已有证据，但没有新托管页面交互或全字节核验，不把部署成功当完整客户端/行为矩阵通过。

[独立本地QA](../../plans/274-html-learning-artifact/evidence/sources/postmerge/a283/siteqa/summary.json)从原Git blob恢复canonical旧7文件并实际静态89/89，修后10文件实际95/95；材料、index及JS原字节保持，CSS只有一处边框与manifest及3许可新增。明确Chrome155.0.8059.80在320/390/1366视口运行几何检查通过，5张初始/控件截图实际查看；空白边框对纸4.311563390203977、对白4.542224959605253。Source3d308、候选10文件与本地helper归档中的dist10逐字节相同；唯一额外payload为helper预期的dist/.openai/hosting.json，字段保持。旧QA将autocrlf working bytes误作canonical的断言失败保留，未改Git全局；旧托管archive未下载，不称与本地Git相同。

| Archive representation | Observed size / SHA256 | Boundary |
| --- | --- | --- |
| helper gzip输入 | 16381B；b957cad3a47b6e68a929e3cdf7d4097da6d2a244a2acf5730396a358d05e5a06 | 本地只读核11 payload；dist10＋预期hosting字段，无QA/凭据附带文件 |
| 本地gunzip表示 | 61952B；929e6c8448c6f91d0305384ef4f55b5e027d8e58909924ab81c7e15b39bfdf6f | 仅本地表示，不等同native descriptor |
| native version2 archive descriptor | 11 files / 61440B；a8509332226fab4360ec6c6284fad572cc7a2405f5aa51a136e7e53bd4f38df1 | 未下载native archive；不声称与两种本地表示字节等同，也不推造差异原因 |

本轮没有新键盘/复制失败/焦点矩阵；只在index/JS保持字节及既有明确范围内复用旧交互证据。Site部署、Marketplace公开、原生客户端、Owner接受与理解效果分别判断。

## Retained limits and history

Owner已接受的原交付核心为ACCEPTED_LIMITED；该决定不覆盖本次0.1.38或Site version2新制品，完整计划仍OPEN。原生待答窗口持续显示/空返回/超时/关闭、桌面菜单热加载/派发和第二真实客户端仍DEFERRED；必要回答依旧严格待答。完整视觉/可访问性、真实辅助技术/触控、托管完整矩阵、模型语义扩展及生产恢复等剩余范围不由本轮有界结果消除。理解效果保持NOT_MEASURED。

原guide #239 FAIL、旧Linux启动FAIL/UNKNOWN、Windows首次470候选长路径checkout FAIL及其后路径缩短修复、首次Site工作字节身份错误均按原证据保留。283与更早真实bypass/reviews=[]/批准NOT_MET不追认；内部审查不替GitHub批准，核心接受不替完整计划接受。历史范围见[HTML验收](./[RUNBOOK]_HTML_Guide_Kit_Acceptance.md)、[唯一REPORT](../../plans/274-html-learning-artifact/[REPORT]_HTML_Learning_Artifact.md)和[8.3.2账本](./[RUNBOOK]_Marketplace_8_3_2_Release_Readiness.md)。

## Ordered publication and recovery

按[发布操作](./[RUNBOOK]_Release_Operations.md)由责任Agent执行：

1. 固定新release head/main base、完整范围及未覆盖，取得适用新检查、当前head真实非作者/last-push批准、最新base及线程后，普通保护合入main；不bypass。
2. 核实际main SHA/tree/版本并执行适用复验，再按draft-first准备v8.3.3。Tag、Release target、notes、资产及draft/prerelease/visibility均需回读；未知结果先查状态，不重复创建或覆盖旧对象。
3. 实际公开后核真实tag/Release绑定与发布workflow终态，保留原正文/资产/immutability观察，再从真实tag新跑13安装、实际Python、资源与精确清理。
4. 依据真实公开/复验做必要记录及完整main→develop同步，后续仅在既有授权与实际需要下准备下一补丁；无新实质差异不递归创建纯证据PR。

任何必要门禁、关键内容、身份/受众、凭据或非预期材料检查失败，立即停止新增发布并升级责任Agent/Owner。保持已知良好v8.3.2/f906及Site version1；Site故障先回读当前保存/部署/权限，采用有界同身份前向修复或已有良好版本恢复。插件恢复使用新的受保护版本修复，不删除或重写既有tag/Release/资产。没有请求周期监控，本轮不新增后台自动化。

## Actual publication and closeout

待实际发生后追加main/tag/Release/run/notes/assets/immutability、真实tag新验与清理、必要同步及后续版本准备。当前上述Marketplace发行闭包尚未完成；Site version2成功只覆盖独立章节，不把它当Marketplace8.3.3已公开。
