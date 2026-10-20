---
type: runbook
scope: marketplace
summary: "Prepare the 8.3.3 repair release with exact identities, gates and retained limits"
owner: marketplace-maintainers
created: 2026-10-20
updated: 2026-10-20
state: active
version: v1.1
layer: working
purpose: "Maintain task274 source-bound 8.3.3 release identities, verification, protected gates, private Site observations and recovery"
last-verified: null
---

# [RUNBOOK] Marketplace 8.3.3 release readiness

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
