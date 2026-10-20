---
type: report
scope: html-guide-kit
summary: "Bounded local and private Sites acceptance, preserved failures and protected delivery gaps"
owner: marketplace-maintainers
created: 2026-10-19
updated: 2026-10-20
state: active
version: v1.12
layer: working
task: 274-html-learning-artifact
tracking: https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/274
---

# [REPORT] HTML learning artifact

[任务入口](./INDEX.md) · [主 PLAN/接受来源](./[PLAN]_HTML_Learning_Artifact.md) · [Issue #274](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/274) · [INTENT](../../docs/intent/[INTENT]_INT-2026-003_HTML_Learning_Artifact.md)


## Actual283 and repair release continuation

2026-10-20：Owner直接续办“#283 PR 已合并，继续后续工作”，准确消息ID/时间未知，[本次捕获](./evidence/sources/postmerge/a283/request.json)与实际平台事件时间分开。实际283于UTC02:51:03Z合入develop **a4892f51f4163fb5bd4457d99229eaf1a4683e8f / tree196daab879d38b649333a01c4c0d0194c7b107c7**，parents908d+395bafe，与已测395候选同树。[独立实际审计](./evidence/sources/postmerge/a283/audit/summary.json)保存suite4612130198的bypass、reviews=[]、批准NOT_MET；actual merge没有新的完整Actions/checks，不借395候选计数，也不把缺触发称CI失败。Agent未执行bypass，新发布PR须真实保护批准。

实际合入源的完整本机测试647总/646PASS/0FAIL/1项Linux机制在Windows不适用，duration324686.71ms；[原全测](./evidence/sources/postmerge/a283/local/full-test.log)、[strict](./evidence/sources/postmerge/a283/local/validate.log)及[CLI0.147.0](./evidence/sources/postmerge/a283/local/cli.log)均通过。另一个冻结窗口内的新安装批于UTC **02:56:38.655–03:09:46.916Z** 原始PASS/driver0：[13场景/178命令](./evidence/sources/postmerge/a283/install/summary.json)全exit0，6Diagram+18LEK实际Python、4site生成/4静态各95/95，四产物各10物理文件（9payload+manifest），20site/4guide及安装根LICENSE原字节一致，94包文件/8Harness前后保持。14实际唯一自有根（13场景+1template）均absence，detacheda489/clean、primary908、完整15登记worktree及Owner原件25994B/dc9d摘要保持。此批终态后才建发布分支；[选证指针](./evidence/sources/postmerge/a283/install-selection/selected-manifest.json)覆盖28原件、638992B，外部170payload完整运行不冒充全部接回。原908运行guardFAIL/exit1、首Windows checkoutFAIL与旧Chrome根因UNKNOWN均保持原身份。

同一私有Site已前向更新为 **v2**。源 **3d3082ff8cfa99576bbda816a3ecc3b0b787636d**，project appgprj_6ad5ec4ffef08191ab68478e806c7d54，保存版本 appgprj_6ad5ec4ffef08191ab68478e806c7d54~appgver_248c305315948191b5b8656427218f4d，部署 appgdep_6ad6db98ebd08191b4e623ba462c8d23 于 **03:10:30.278974+00:00 succeeded**。[原生回执](./evidence/sources/postmerge/a283/site/native-final.json)回读v2/source、active/owner、custom revision1、1位owner/0组/0外部/0automation，地址仍为[现有私有成品](https://html-learning-artifact-274.zuozhouran.chatgpt.site)。独立本地QA为[PASS_LIMITED](./evidence/sources/postmerge/a283/siteqa/summary.json)：old7/new10，材料/index/JS保持ffaaa Git原字节，仅CSS一处边界、manifest及3项许可；静态89→95零失败，明确Chrome155三视口320/390/1366与空白控件截图实看通过。没有重跑键盘/复制，按未变index/JS限定继承旧交互；无新托管完整交互或原生/第二客户端/效果主张。

Site helper压缩输入16381B/b957cad3…、11payload仅10制品+原hosting元数据；原生保存回读11files/61440B/a8509332…，本地gunzip61952B/929e6c84…也与其不同。原生保存归档未下载，不能宣称这三者字节等同或推造转换原因；源身份/部署/文件数/受众分别已有证。首次autocrlf工作副本对LF输出的原字节断言FAIL发生在任何Site写入前，保留[原错误](./evidence/sources/postmerge/a283/site/first-method-error.json)，改用固定ffaaa Git原字节导出后通过；不改全局Git配置。通用python不在PATH的预览启动失败亦保留，明确bundled Python随后HTTP200；仅关闭自有65044预览，未触用户8765。open_in_codex为queued，不证明Owner访站。v1及其原源/部署保留，未演练生产回滚。

授权[独立复核](./evidence/sources/postmerge/a283/scope/assessment.md)确认原B1/P5“上线后修订/受影响复验”、本轮七原则及PLAN五边界可覆盖 **一次HTML0.1.38修复发行与同一private Site前向修复**。dr274库存批的“不正式发布”是当时Agent工程边界，不是Owner永久撤销授权；市场8.3.3预升本身也不构成授权。没有实质越界，不重复请批。当前从actuala489完整ancestry准备codex/release-html-learning-8-3-3→受保护main e3dc；不再bump，四包/guide/workflow不变，旧8.3.2正文/资产保持，默认安装继续真实v8.3.2。新[8.3.3账本](../../docs/runbook/[RUNBOOK]_Marketplace_8_3_3_Release_Readiness.md)登记headCI/真实外部批准/线程/latestbase、实际main、draft-first发布/tag及真实tag新验的待办，均未先PASS。无新需求/INTENT/Issue/主PLAN或REPORT。

新增选证由[恢复上下文](./evidence/sources/postmerge/a283/README.md)、[逐项映射](./evidence/sources/postmerge/a283/selection-map.json)及同一source-bindings逐字节绑定；旧1890项与原件保持。首次root GraphQL只读连接中断后REST成功，原root运输错误未单独落盘，独审REST原件有效；不制造该缺失raw。原Owner接受仅绑定当时已交付核心，仍 **ACCEPTED_LIMITED**；不推定0.1.38或Site v2已获新接受。完整计划OPEN、完整最终接受NOT_PROVIDED、效果NOT_MEASURED；D01–D07恢复条件沿用下节，没有立即需要Owner实质决定。独立GitHub批准是门禁，由合资格非作者/非最新推送者提供，不能用合成验收或Owner本次续办替代。

以下Deferral recovery是283合入前批次快照，原“候选/未部署”等语句保留各自原时点；当前actual283/Sitev2及发布准备以上节、8.3.3账本与Issue为准。

## Deferral recovery results

2026-10-20：#282已合入develop908d2953；Owner已明确接受当前交付核心并保留全部延期/历史缺口（ACCEPTED_LIMITED），完整计划仍OPEN。本轮按同一五边界自主恢复可执行工程项，新发现边界对比度与输出许可缺件，准备HTML0.1.38修复候选；公开仍v8.3.2/HTML0.1.37，市场8.3.3未发布。原生窗口/原生派发/第二客户端仍延期，历史FAIL/UNKNOWN/bypass及批准NOT_MET不追认。

本轮为实际新缺陷修复，非补历史批准或递归纯证据PR。候选工作树与actual908/公开f906身份分别记录；以下新测试不冒称已在公开0.1.37或真实托管Site执行。既有1417来源前缀/原件及32项基线前五列保持；新证据选择性接回，不公开权利未知研究原件。

- **D04发现与修复**：独立隔离浏览器16例为14PASS/1FAIL/1NOT_RUN。原空白反思输入框边界#aba492对纸背景2.3570979971820427:1、对白2.483198873838037:1，未达适用控件可辨边界3:1。候选仅该边界改#767676，独立Chrome155.0.8059.80在320/390/1366截图像素及computed style核实，对纸4.311563390203977:1、对白4.542224959605253:1；真实键盘选择/核对/改答失效/输入聚焦及复制拒绝Escape回焦通过。截图逐张实看，初次口头147版本勘误保留，以raw155为准。真实浏览器UI缩放尝试未生效，记NOT_RUN；没有宣称完整WCAG/辅助技术/真实触控或全托管页通过。依据[WCAG22 SC1.4.11](https://www.w3.org/TR/WCAG22/#non-text-contrast)。
- **C21发现与修复**：登记研究与固定上游版本/哈希及Apache原文一致；研究资料再分发权利未识别，保持UNKNOWN，不据MIT包推定许可。原生成器复制CSS/JS却遗漏许可输出，已证FAIL。候选新增LICENSE及licenses/Apache-2.0.txt原字节，THIRD_PARTY_NOTICES.md以明确资产/材料范围和安装包定位前缀接完整原notice字节尾部，均纳入manifest；不把输入材料或独立想法重授权。独立实际安装生成10文件/manifest9，三安装许可缺件在首写前失败、输出篡改/缺件按原manifest失败、installer根LICENSE缺件/篡改失败。通用checker只证明声明清单自洽，同步删改清单仍可能PASS，不充当独立许可真实性或法律裁决。
- **路径修正**：独立代码审查发现long-s与Windows尾点材料路径被生成器接受但checker拒绝，原反例保留。候选统一upper/lower保留名判定并拒绝任一材料路径组件尾点/尾空格；新增Unicode/别名零写负例，修后结果另接真实复验。
- **D05有界扩展**：长中英/表格/中文空格%文件名生成+实际Python静态通过；不支持图片语法、重复JSON键、缺来源文件、禁词四负例非零/无输出，5例通过。首轮测试材料含声明不支持的underscore语法，被正确拒绝，原Harness失败保留，改为子集内合法输入另批执行；未作模型语义/冲突推理新验。
- **D06恢复与观测**：冻结公开已知良好7文件，在隔离目录实际完成再生字节同一、损坏JS静态失败、拒覆盖已有损坏目录、备份恢复后89/89、坏输入零输出5步，原Harness取字段/文件数误差及观测快照缺口保留。只读原生Sites回读仍同私有Site版本1/源码ffaaa359、部署succeeded/owner audience；无新版本/ACL/发布，生产回滚及周期监控NOT_RUN。

D01原生持续窗口/空返回/超时/关闭、D02桌面菜单热加载派发、D03第二真实客户端仍缺可观测目标能力，并保留不重启模型/桌面测试限制，均DEFERRED非PASS。D04/D05/D06只完成上述限定子集，剩余完整视觉/托管/真实设备/模型语义/生产恢复范围不被消除。D07完整计划最终接受仍NOT_PROVIDED；Owner核心接受已存在，不重问。历史保护批准NOT_MET/bypass、旧FAIL/UNKNOWN永久保留。

候选工程状态：46项定向检查已PASS；修后独立别名9例/许可回归3例/installer六负例均通过，无未解决代码发现。首轮完整647项为644PASS/2文档FAIL/1平台skip；两FAIL是新增插件CHANGELOG的Unreleased日期格式及缺自身版本说明，已按既有格式修正并明确“准备候选、非已发布”，原失败保留。strict与CLI0.147.0已PASS；新完整复验647总/646PASS/0FAIL/1平台skip，255948.2688ms，绑定该轮实际候选；之后仅修选证/恢复上下文文档并复核来源。独立新13安装子项终态已接入（原整体元数据guard FAIL另记）；修后当前headCI另待。本轮新PR真实批准/受保护合入/正式发布未完成，不把本地修复称交付。本轮无必须立即提交Owner的实质决定；只有改变原生测试限制、提前修改完整完成范围或新增真实学习效果目标时才触发集中决定。

证据入口：[本轮请求与边界](./evidence/sources/postmerge/dr274/request.json)、[延期/32项只读盘点](./evidence/sources/postmerge/dr274/inventory/assessment.md)、[Owner真实核心接受](./evidence/sources/postmerge/dr274/owner-core-acceptance282/owner-decision.json)、[原视觉FAIL/未测](./evidence/sources/postmerge/dr274/baseline-visual/final-summary.json)、[修后独立复验及截图](./evidence/sources/postmerge/dr274/fixed/REPORT.md)、[路径首次发现及修后审查](./evidence/sources/postmerge/dr274/code-review/report.json)、[材料扩展](./evidence/sources/postmerge/dr274/extensions-r2/summary.json)、[恢复原动作/输出](./evidence/sources/postmerge/dr274/recovery/recovery/summary.json)、[许可审计限制](./evidence/sources/postmerge/dr274/license-audit/summary.json)、[只读托管观察](./evidence/sources/postmerge/dr274/hosting/native-metadata.json)、[首轮完整失败](./evidence/sources/postmerge/dr274/root/initial-full-test.log)。[选择证据恢复映射](./evidence/sources/postmerge/dr274/selection-map.json)逐项保存原根/相对落点/字节摘要；不声称接回未选择的完整外部运行目录、系统二进制或研究原件，重放代码可由候选Git与原始patch恢复。修后浏览器pre/post-alias产物10文件完全相同，只按未变CSS/JS沿用该浏览器证据，不重复冒称新浏览器运行。

选证独审另发现两审计JSON嵌29处研究逐字片段，原copy/strict未检出；已在首次提交/推送前移除这两份公开副本/绑定，只留哈希/计数/外部定位，完整原审计不动。原始选证方法/勘误保留，[选择修正](./evidence/sources/postmerge/dr274/selection-correction.json)与[恢复上下文](./evidence/sources/postmerge/dr274/README.md)解释各组选证中原报告相对路径的原根；未选择研究内容不得据此公开。

新修复主[PR283](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/283)以develop908为base，初head470970b/tree74332c；初PR/push两Windows job均在checkout step2真实FAIL/exit128，尚未进入测试：新证据根路径过深。已将本批根缩至dr274、424原件逐sha/字节不变、内部布局保持，最长repo相对215→194、CI绝对268→247；[显式旧新映射](./evidence/sources/postmerge/dr274/relocation.json)解释原方法中的捕获路径。无workflow/门禁放宽；修后当前headCI另验。原失败保留，不借Linux或本机通过覆盖Windows。

独立新安装批已实际完成（UTC02:09:27.099–02:22:46.410Z）：13场景/178命令均exit0，6Diagram+18LEK实际Python、4site生成/4静态各95/95、四制品各10物理文件/9payload+manifest，site20/guide4及根LICENSE原字节通过；94包文件/8Harness前后相同，14实际唯一自有根均不存在。原整体summary=FAIL/exit1保留：运行中root正常提交使HEAD908→470、worktree列表HEAD变化触发末态guard，默认git对超长路径还出现D观测；[独立核对](./evidence/sources/postmerge/dr274/installation/source/independent-extraction.json)与[元数据判读](./evidence/sources/postmerge/dr274/installation/source/host-adjudication.json)把实际安装子项通过与原guard失败分开，primary908未变，所涉文件移位前/后字节与470原blob相同。不伪造整体原run为PASS、不改称actual470新跑；这批始于908上方固定未提交候选、后续运行资源等同。两次后处理Harness误差保留，未因其重跑已通过安装。[选证说明](./evidence/sources/postmerge/dr274/installation/selection-receipt.json)声明原完整174本地payload留外部；当前选证manifest只覆盖所列32项。浏览器/model/desktop/Sites/真实批准不在这批主张中。

首CI checkout失败的[两job原日志及诊断](./evidence/sources/postmerge/dr274/ci-first-failure/summary.json)与[独立移位闭包](./evidence/sources/postmerge/dr274/ci-first-failure/relocation-closure.json)分记；首次tree统计因默认maxBuffer截断失效，完整r2分析替换其结论，不改写原两job日志。修后head再次执行必要CI，未借原Linux在途或本地安装替代当前Windows checkout/门禁。

以下“Current sync”是上一维护批次截至281的历史叙述，actual282及Owner核心接受以本节/Issue外部回执为准，不追改原观察。

## Current conclusion and remaining gaps

### Current sync merge and marketplace prebump

PR281于2026-10-20T00:00:09Z（Asia/Taipei08:00:09）实际合入develop62945150df984e2747684d1ea46b8772b56db2d9，parents4d10+6ef，tree6659与已测6ef/c41候选相同。仅Marketplace8.3.3未发布预升已交付；插件、运行、workflow及公开v8.3.2/f906与正式Release正文保持。

最终候选CI run39298251581两端均为644总/643PASS/1平台专用skip，原真实layout case330执行；每端13安装/178命令、6Diagram+18LEK实际Python、4site生成+4静态各89/89通过。这些结果绑定候选checkout，不改称actual629新跑。actual629自动push run39344994194仅prebumped版本检查PASS，不是完整测试/安装矩阵。

actual629合入后的固定源完整本机测试已PASS：644总/643PASS/0FAIL/1新增Linux机制在Windows不适用，duration252225.8375ms；strict及CLI0.147.0精确基线亦PASS，原件由本轮local/actual-local-receipt.json承接。root在actual629于UTC2026-10-20T00:01:58.847Z–2026-10-20T00:13:24.756Z新验PASS：13场景/178命令全exit0、6Diagram+18LEK实际Python、4site生成4静态各89/89，site20/guide4源缓存一致；15精确自有根不存在，hostHEAD629与完整worktree列表复原。manifest SHA256 c551b4396974676bc2fdfe835adbbc895542a7a8cc0909c5922a4abe97cb6ea4。该安装批不含新model/desktop/Sites/browser，原始执行与独立复核分记，不借候选CI计数。

实际suite4610354048为bypass：pull_request FAIL缺latest-pusher之外的批准，其余3项PASS，reviews=[]，保护批准仍NOT_MET。实际合入/技术PASS不追认批准，不授权Agent以后bypass；旧1d原FAIL、Chrome启动根因UNKNOWN及提取勘误保持。原生窗口/第二客户端等延期非PASS，效果NOT_MEASURED，Owner最终接受NOT_PROVIDED，Issue274 OPEN。

安装smoke的browser仍NOT_RUN，候选CI的4个browser相关工程TAP只含1个实际布局case330，不等于4次布局或新客户端验收；CI逐根absence未记录，15根清理仅属于本轮actual629实证。候选221payload+manifest共222原件，独审分类勘误及原v1保留；旧979来源/740前缀与原字节保持。

本轮[继续请求](./evidence/sources/postmerge/prebump281-closeout/continuation/capture-metadata.json)、[候选CI](./evidence/sources/postmerge/prebump281-closeout/candidate-ci/final-manifest.json)、[实际审计](./evidence/sources/postmerge/prebump281-closeout/audit/final-manifest.json)、[actual629 root执行新13](./evidence/sources/postmerge/prebump281-closeout/actual629/final-manifest.json)、[独立原件复核](./evidence/sources/postmerge/prebump281-closeout/independent-actual/final-manifest.json)和[本机回执](./evidence/sources/postmerge/prebump281-closeout/local/actual-local-receipt.json)各自绑定原身份/原件，不互借计数。

独审首次识别两份原样搬位清单缺恢复基准；原数据未丢、95原件未改，现用[显式恢复映射](./evidence/sources/postmerge/prebump281-closeout/actual629-relocation-map.json)逐字节/摘要恢复15+14条引用到已有root-batch。初次1391来源的171项及strict通过仅限各自工程检查，未冒称已覆盖该语义缺口；本次补映射后再核来源闭包。

本次文档候选修后171项/零FAIL与strict已通过；独立审查保留首次1391来源的29引用上下文阻断，1393显式映射后解除，原979/740前缀和原件保持。最终1417来源的完整工作树/暂存Gitblob与终态strict在记录提交前另核；仅补终态原件和本段，后继本PR真实headCI/保护门禁由Issue继续，未冒称记录自身已合入。

本轮沿用原P5五边界授权，由Agent作工程排程，最多准备一份有界文档修正，不新增Owner决定或机械三PR条件。该记录自身实际合入后的审计/复验只回Issue274并保存外部不可变回执；没有新的实质差异时不递归创建纯证据PR。

以下为PR281实际合入前失败/诊断/准备的历史快照；原PASS/FAIL、根因UNKNOWN、提取勘误及其待证状态只限各自原轮，不作当前actual629结论。

本轮后继真实CI：预升[PR281](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/281)已创建，原head1d8b6849ec7e398d65a949d204abe38bc64a4e0b/潜在merge4e495033同tree eefcaa0f；不是实际受保护merge。原PR attempt1整体FAIL：Linux640P/1F/1 Windows专用skip，case328真实Chrome启动未取得可读DevTools端点、NOT_RUN/exit2，后继安装未执行；Windows642/642零skip及新13/178/6Diagram18LEK4生成4静态各89/89实际通过。原push两端也有各自启动FAIL，push一次有界复验Linux再次FAIL；不能以本地/Windows通过覆盖Linux。根因UNKNOWN，未称修复。[诊断前124原件](./evidence/sources/postmerge/prebump281/pre-diagnostic-stage/final-manifest.json)分别绑定run/attempt/job/checkout、原日志及方法，首次PowerShell文本中间副本被覆盖的缺口如实登记，GitHub实际raw已独立Buffer重取核同；在途push复验Windows不在该终态范围。

这是原P04必要工程诊断：仅在测试层为Linux实际Chrome建立临时exec stderr采集，保持原checker/flags/15秒就绪算法/主测非零NOT_RUN和几何判据、主PID/session及完整自有清理；连续排空日志、最多64KiB，失败断言附原启动信息，不自动重试、不skip原真实browsercase、不代替验收。插件/运行/公开版本、workflow及发布历史不变。新诊断测试、本机完整检查/独立审查与后继headCI按真实新证据接续，当前尚未证明真实Chrome的Linux CI通过；真实非作者/lastpush批准、Structure+A6、线程/latestbase保持，Agent不bypass。

[新诊断作者单项实跑](./evidence/sources/postmerge/prebump281/diagnostic-local/html-learning-274-browser-stderr-targeted-summary-r1.json)：Windows实际Python大流量drain 1PASS/1Linux专属不适用，WSL Linux 2/2 PASS、零skip，原args/exit23/NOT_RUN2、自有SID/logger清理、foreign存活及input/checker原字节保持均核；隔离WSL使用三源文件逐sha相同的临时投影和官方SHASUM校验Node22.18，非全仓Linux复验、非真实Chromium修复证明。首次Windows缺Python环境FAIL保留。原push复验Windows后来642/642和新13/178等实际PASS，Linux仍FAIL，原run整体FAIL；[终态原件](./evidence/sources/postmerge/prebump281/attempt2-push/finalmanifest.json)与[原PR Windows补提取](./evidence/sources/postmerge/prebump281/attempt1-windows-supplement/final-manifest.json)分别保存，不追认原失败。

修后诊断已完成[作者两端单项](./evidence/sources/postmerge/prebump281/diagnostic-fixed/html-learning-274-browser-stderr-targeted-summary-r2.json)、[独立修后审查](./evidence/sources/postmerge/prebump281/diagnostic-review/html-learning-274-browser-stderr-independent-review-final.json)及[固定源完整本机测试](./evidence/sources/postmerge/prebump281/diagnostic-final/html-learning-274-prebump-diagnostic-local-receipt.json)：644总/643PASS/1新增Linux机制在Windows不适用，0FAIL/取消，原实际browsercase仍执行；CLI0.147.0精确通过。独审实际发现可选版本probe忽略TERM使诊断7秒不返，root完全删除该子进程及对应附加断言，修后原反例约0.092秒完成、diagnostics约1ms，原status23/NOT_RUN/foreign隔离保持；不把未知Chrome启动根因称修复。旧helper精确字节和原反例保留，首次内联driver未保存及并发首审inventory与实际失败执行hash不同的范围如实列明。版本probe移除前启动的早次644总全测单列，未改名为修后全测。以上完整测试后仅追加原件与终态说明，再做strict及最终来源/暂存Gitblob核验；后继新head双端CI、真实保护批准仍另待。

终态strict已PASS；最终979来源全部逐工作树与暂存Gitblob摘要核验，原740绑定/原字节保持。后继CI与真实批准由Issue274/PR281继续记录，以下仍为历史准备快照。

以下为原1d8b创建PR前已完成预升及本机检查快照；后继CI失败/诊断以上段为准，原PASS只限原批次。

本轮客户端日期2026-10-20（Asia/Taipei）。Owner续办“#280 PR 已合并，继续后续工作”，[原话/捕获](./evidence/sources/postmerge/sync280/continuation/capture-metadata.json)复用同一#274/P5五边界授权，不视为最终接受、新bypass或新正式发行授权。同步PR [#280](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/280)已于本地10月20日00:37:27（UTC2026-10-19T16:37:27Z）实际合入develop4d10a0677c745eccb2775f7ae6176f8e2b1d2387，tree db49629fe767d3584f6ce772ef7bf5cdb52094e1与source ef85a2de及CI merge535315f0相同，parents65d+ef85。main e3dc的完整ancestry已继承；当前main e3dc、actualdevelop4d10与公开v8.3.2 tag/Release f906分别记录，历史正式正文不变。

[实际合入审计](./evidence/sources/postmerge/sync280/audit/summary.json)绑定真实develop suite4603805882，before65d/after4d10，result=bypass；pull_request FAIL缺最新推送者外批准，required_status_checks/non_fast_forward/deletion PASS，reviews=[]。保护批准仍NOT_MET，历史275/278/279/280实际合入不追认批准或以后例外，新预升PR继续严格Structure+A6/真实非作者及lastpush批准/线程/latestbase、Agent不bypass。

[280本批CI终态原件](./evidence/sources/postmerge/sync280/ci-terminal/final-manifest.json)已独立提取：run39279114820实际checkout535315f0、tree与ef85/actual4d10同db49629f，Linux641/642（唯一Windows专用skip）、Windows642/642零skip，strict/CLI0.147.0/每端新13安装178命令及6Diagram18LEK4site生成4静态各89/89全部通过，四browser工程case实际ok未skip。各16条清理名称TAP仅证明用例，逐根absence本CI未记录；push39279043416只列终态success。33份原件摘要由final-manifest给出，summary的过程hash预留字段不代替终态摘要；不借旧结果。此前[排队/UNKNOWN原件](./evidence/sources/postmerge/sync280/pending/copy-receipt.json)完整保持；后继API已回读终态success，但部分字段与旧queued观察时序不一致，两个skipped helper的completedAt早于startedAt在双接口复现。原观察不改写、不计算负耗时，不据这些字段重建可靠排队/实际启动时间或推造原因；上述实际计数已从本PR完成job原日志独立取得，不借旧279/e3dc批次。

[actualsync4d10独立新验](./evidence/sources/postmerge/sync280/postdevelop/final-manifest.json)于UTC2026-10-19T16:39:19.139Z–16:50:02.166Z（本地20日00:39–00:50）终态PASS：13/13安装、178命令全exit0，6Diagram18LEK实际Python、4site生成4静态各89/89，公开8/仓库20/显式5/自然3、site20/guide4资源摘要一致。15精确自有根均不存在，hostHEAD4d10及完整worktree清单复原；final-manifest SHA93601736e301a05082e7653d41f3f7d576f30a7058ce9462d5b6d4947cf3f117，terminal SHA748f8742a4b8f72dd5e47e06cbf866d22f31aa9bdf2415081d312a64ebb6b90c。新验独立于ef85/535/e3dc旧批次，未动Site/模型/桌面。

前置新验PASS后，root在codex/prebump-marketplace-8-3-3于UTC16:52:31.265Z先DryRun、16:52:32.762Z完成Apply，仅市场8.3.2→8.3.3。[实际版本回执](./evidence/sources/postmerge/sync280/prebump/html-learning-274-prebump-receipt.json)及三全库哈希map核7252文件：DryRun零写入、Apply只改VERSION与README版本badge、文件集合不变且无backup残留；插件/运行/guide不变，正常根AGENTS/A6与任务文档另行更新。静态预审4项P2已修（manifest闭包/分支锁/backup保护/Windows跨盘边界），记录不冒称真实GitHub批准。

[本轮本机检查](./evidence/sources/postmerge/sync280/local/html-learning-274-prebump-local-receipt.json)：固定源后完整npm test为642/642、零FAIL/skip，CLI0.147.0精确基线及strict已通过。此前R1为641P/1F，591用例在spec_review并发改readiness时检出源副本摘要冲突；[原失败](./evidence/sources/postmerge/sync280/local/html-learning-274-prebump-test-r1-concurrent-doc-fail.log)完整保留，暂停源编辑后R2完整复测PASS，未修改runtime规避检查。[719来源独立审查](./evidence/sources/postmerge/sync280/local/html-learning-274-prebump-independent-review.json)逐sha/旧529 Gitblob/版本三map及范围语义无阻断，仅代表该时点719项；后追加终态原件再验全集合。

[当前工作树8.3.3的新安装检查](./evidence/sources/postmerge/sync280/prebump-smoke/final-manifest.json)于UTC16:57:11.416–17:07:18.416Z独立PASS：13/178命令全0、6Diagram18LEK4生成4静态各89/89，7035源文件起止摘要相同，14自有根精确不存在、hostHEAD4d10及完整worktree清单复原；manifest SHAa5f0cbac8fb555fdd723e275d6c201142a44a9641c5018fcdc71a5f9901c5603。其身份是未发布8.3.3工作树，不能改名为实际4d10或新PR CI。完整本机测试和源冻结smoke结束后只追加原件与终态文档，再做strict/来源全集合检查。

终态原件追加后的[最终strict](./evidence/sources/postmerge/sync280/local/html-learning-274-prebump-final-validate.log)与[738来源独立delta审查](./evidence/sources/postmerge/sync280/local/final-review738.json)均通过，前719及原529绑定/字节保持；最后仅再追加这两份原件，总740项由暂存Gitblob/全集合复核，不将738时点改名为此前已审740项。

本轮仅准备未发布下一市场补丁；插件版本/运行、guide原字节、公开安装ref v8.3.2及现有tag/Release保持。新预升PR目标受保护develop4d10，当前尚未创建编号、不预造；本节是建PR前准备快照，最终head/CI/批准/线程与actualmerge由同一Issue274及新PR实况接续。私有Site本轮未改动，原生窗口/第二客户端等延期非PASS，效果NOT_MEASURED；Owner体检/最终接受未提供、#274继续开放。

### Current record merge and synchronization

本节为#279后、#280尚未合入时的历史同步准备快照，保留原标题锚点；本轮实际sync/预升状态以上节为准。

Owner续办“#279 PR 已合并，继续后续工作”，[直接请求与捕获](./evidence/sources/postmerge/record279/continuation/capture-metadata.json)只承接同一#274/P5操作授权，消息身份/时间未知，不推定最终接受或新bypass授权。记录PR [#279](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/279)已于2026-10-19T15:17:09Z实际合入main e3dc40f734fc972e05956da3e908091e09963675，tree ae121f6b256d1a44ea05a06061ba025b605655d9 与已测head315b5942及实际CI checkout687b70ab相同，parents为f906+315。默认公开安装指引v8.3.2/site已实际交付。当前main e3dc与发布身份分开：v8.3.2 tag/Release仍为原f906，不因文档记录merge改绑。

[实际合入与规则审计](./evidence/sources/postmerge/record279/audit/summary.json)保存真实main suite4602541728，匹配beforef906/aftere3dc，result=bypass；pull_request FAIL（缺最新推送者之外的批准），required_status_checks及其他规则PASS，reviews=[]，保护批准仍NOT_MET。不把Owner实际合入、技术PASS或同树当批准，也不作为后续sync/prebump例外。

[279精确head新CI原件/方法](./evidence/sources/postmerge/record279/ci/final-manifest.json)记run39272665913成功：Linux641/642（唯一Windows专用skip）、Windows642/642零skip，各13安装/178命令全0、6Diagram18LEK实际Python、4site生成/4静态各89/89，四browser工程case各未skip，source/cache资源一致。push39272636618成功只列真实状态，不另计独立验收；16个清理名称匹配TAP用例通过、默认smoke正常返回，但本CI逐根absence未记录，不能借发布后f906的15根证据。72原件摘要和final-manifest原字节已冻结；此前372来源及失败保持，新增原件按各自时点绑定。

独立actualmain e3dc新验15:18:57.732–15:29:31.902Z已PASS：13场景/178命令全exit0、6Diagram18LEK Python、4site生成4静态各89/89，site20/guide4资源一致，15精确自有根absence且完整worktree清单及hostHEAD复原。[本轮raw/summary](./evidence/sources/postmerge/record279/postmain/summary.json)、[终态清理复核](./evidence/sources/postmerge/record279/postmain/terminal-receipt.json)及[15原件manifest](./evidence/sources/postmerge/record279/postmain/final-manifest.json)分别保留本轮新结果；不借315/687 CI或f906旧计数，未运行新model/desktop/browser，私有Site未变。

本轮同步分支codex/sync-main-8-3-2从完整actual main e3dc派生，保留279及所有原main ancestry；目标develop65d已是e3dc祖先，普通同步无runtime冲突。同步PR当前PREPARING，实际develop merge及其独立新复验仍待，编号不预造。当前候选保留VERSION8.3.2、公开安装ref v8.3.2、五包版本与guide原字节；最终head/base、严格CI/A6、一个真实非作者/最新推送批准及线程按新PR实际回读，Agent不bypass。只有实际sync交付并新验后，才DryRun→Apply仅市场8.3.3 VERSION/badge/正常根AGENTS预升，不改插件、不建同号tag/Release。

本节为提交/创建同步PR前的准备快照，最终head/CI/批准/线程与真实sync合入由Issue274及新PR实况接续，不将此处PREPARING当以后终态。

私有代表Site保留原身份、保存版本1及受众，本轮未部署或扩大权限。原生窗口/第二客户端等延期非PASS，理解效果NOT_MEASURED；核心交付、正式公开、维护闭环、全计划和Owner最终接受分记，#274保持开放。

同步准备态本机[完整测试](./evidence/sources/postmerge/record279/sync-local/html-learning-274-sync-full-tests.log)642/642、零fail/cancel/skip，实际duration193332.6447ms；[strict](./evidence/sources/postmerge/record279/sync-local/html-learning-274-sync-validate.log)、[CLI0.147.0精确基线](./evidence/sources/postmerge/record279/sync-local/html-learning-274-sync-baseline.log)和[范围9项](./evidence/sources/postmerge/record279/sync-local/html-learning-274-sync-scope.json)均PASS。[独立502来源/语义复核](./evidence/sources/postmerge/record279/sync-local/html-learning-274-sync-review502.json)无阻断，旧372保持；该观察明确只覆盖当时502，后续方法/原件追加不改名为此前已审数量。完整测试后仅补actuale3dc新验终态、当前措辞及冻结原件，再重做strict及最终来源核验；新同步PR最终head平台CI/批准/线程和实际sync交付均按各自真实结果另记。

### Historical publication and record-preparation snapshot

下文为#278公开后、#279尚待合入时的原快照。当前记录合入、main与tag身份及后续依赖以上节为准，不把当时待办视作当前状态。

Marketplace [v8.3.2](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases/tag/v8.3.2)已于2026-10-19T14:30:16Z正式公开，HTML0.1.37/site随五包八公开/五显式/三自然交付，20仓库技能保持。主发布PR278于14:28:06Z实际合入main `f906b1001a86d7b5415451bd973bea26e6cc3a1d`，direct tag/Release target同SHA；tree `6e4bc9cc31df2d1eac33e8c10907eb3725ca744d` 与source f68c及实际CI checkout4269d663相同。[出版原件与19项核对](./evidence/sources/postmerge/release278/publication/publication-summary.json)记Release417390526、workflow39269211915 attempt1 SUCCESS、正文精确对应actual main的8.3.2节、assets=[]、immutable=false；仓库immutability配置未返回，UNKNOWN。

PR278实际终态新CI为Linux641/642（唯一Windows专用skip）、Windows642/642零skip，各13安装/178命令及6Diagram+18LEK/4site生成4静态（各89/89），真实browser相关case均未skip；[完整原log/方法/summary](./evidence/sources/postmerge/release278/ci/summary.json)保持。额外QA首次跨平台物理字节断言失败原件保留，24旧文本逐Git blob/hash核实仅可逆LF/CRLF，长度声明为匹配hash的Git重构值；HTML guide/site hash同，各平台内部source/cache核对原样通过，不重写失败或补造远端原字节取回。

**治理与技术分记。** [真实main规则suite4601606831](./evidence/sources/postmerge/release278/publication/pr278-rule-suite.json)为Owner bypass，pull_request fail（缺最新推送者之外的批准）、required checks pass；reviews=[]，原A4保护批准仍NOT_MET。正式公开不追认275/278或旧任务批准，不构成任何以后豁免。

独立新验14:31:11.601–14:41:25.926Z已PASS：13/13场景、178命令全exit0、6Diagram+18LEK Python、4site生成/4静态各89/89，公开8/仓库20/显式5/自然3、site20/guide4资源摘要一致；15精确自有根均不存在、canonical无注册残留。[本轮raw/metadata](./evidence/sources/postmerge/release278/posttag/summary.json)及[独立终态/20原件摘要](./evidence/sources/postmerge/release278/posttag/terminal-receipt.json)保留真实公开前404等待观察，非候选FAIL。开始晚于公开55.601秒；自动发布概括、65d及CI旧结果均未沿用。本批未运行model/desktop/browser验收。本记录已据新验更新公开main安装指引，通过正常PR交付；再同步包含该实际main记录合入的完整ancestry，实际同步复验后才DryRun/Apply仅市场8.3.3预升，无同号发行、插件不变。

[14:39:28UTC原生回读](./evidence/sources/postmerge/release278/continuation/site-postpublication.json)确认私有代表Site仍active/原版本1/同ffaaa源码，owner/custom/users1/groups0/external0；这是一次只读metadata核对，非新browser或持续监控。私有代表Site仍为原版本1，原生窗口/第二客户端等延期不算PASS，Owner体检/最终接受未提供，理解效果NOT_MEASURED；#274继续开放。实现/技术验收、正式公开、全计划完成及Owner接受各自判断，A4批准缺项保留。

本轮记录工作树本机[全测](./evidence/sources/postmerge/release278/record/html-learning-274-record-full-tests.log)642/642、零失败/跳过，随后仅修当轮状态措辞及接受表；修后[严格校验](./evidence/sources/postmerge/release278/record/html-learning-274-record-validate.log)、[CLI基线](./evidence/sources/postmerge/release278/record/html-learning-274-record-baseline.log)和[范围/原字节7项](./evidence/sources/postmerge/release278/record/html-learning-274-record-scope.json)通过。[独立语义复核](./evidence/sources/postmerge/release278/record/html-learning-274-record-review.json)的P2状态漂移已修、无剩余阻断；其364来源/旧236条未变结论只绑定该观察时点，本次再追加8份方法/日志/审查原件，不将其计为该次已审数量。冻结后重做strict并从Git blob核原件；新记录PR的最终head平台检查/批准/线程按真实PR与Issue终态回读，不借本机或PR278旧结果，不追认Owner接受。

## Historical post275 preparation snapshot

2026-10-19，Owner 续办“#275 PR 已合并，继续后续工作”。[#275](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/275) 实际于 `12:56:35Z` 合入 develop `65d756efd3024ac10d1d0e6ea189055fbe6f1545`；tree `d7de559f6563d8208098952f92495c1b7acca9cb` 与已测主 PR head `1a80bab5c85ae9b216f49a5d9c114770117ab2dd` 相同。子 PR276、277及主 PR275均已实际合入，开发目标已交付；[实际 Git/API 原件](./evidence/sources/postmerge/pr275-actual-git.json)与[合入回读](./evidence/sources/postmerge/pr275-merge-api.json)保留真实身份。独立 /root/post_merge_verify 的 [实际65d新验回执](./evidence/sources/postmerge/canonical65d/summary.json)已于13:00:06.401–13:10:12.179Z实际完成：13/13场景、178命令全status0，6 Diagram+18 LEK Python、4次site生成+4次静态Python（各89项零错），源/缓存47资源组及4份site各20资源核对，普通3/原生8/仓库20/显式5符合；自有新临时根无残留、worktree清单完整复原。默认keepRoot=false，宿主未切换到canonical；本次安装未运行browser/model/desktop，不改原消费者/Sites证据身份。

**技术交付与保护批准分开。** [规则执行4599887231](./evidence/sources/postmerge/pr275-rule-suite.json)实际结果为 bypass，pull_request evaluation fail（缺最新推送者之外的批准），required checks pass；[PR275 reviews=[]](./evidence/sources/postmerge/pr275-actual.json)，因此原批准 **NOT_MET**。合入者为 ranzuozhou，不推定新的未来豁免。当前准许复用的 P5 操作授权见唯一主 PLAN；正式 Marketplace 8.3.2 发布准备在[本次账本](../../docs/runbook/[RUNBOOK]_Marketplace_8_3_2_Release_Readiness.md)承接，main 新 PR 仍须当前 head 的真实批准、最新基线检查与线程门禁，Agent 不 bypass。

HTML0.1.37/site 的 A1–A3及A4工程检查已有技术证据，A4中的保护批准仍为 **NOT_MET**；四项门槛未全部通过。私有代表站点仍为下文同一版本1。Marketplace正式公开、原生窗口/第二客户端延期、Owner体检/最终接受各自待证，效果 **NOT_MEASURED**；#274 保持开放。以下“Historical”段落及当时待办保留各批时点，当前状态以本节和新发布账本为准。

## Historical pre-merge acceptance snapshot

本批本地实现、独立合成验收与同包私有Sites已有证据；最新本机完整r4为642/642 PASS、零skip，strict-r4 PASS。HTML0.1.37两显式入口、五包八公开/五显式/三自然、20仓库技能，guide原四资源保持。独立消费者12项及完整13安装r2绑定1a3ac5f5/tree8c579494，原1a全测641/641也保留；这些证据按实际源身份及后续字节对应复用，不改写成新跑。

最新本机完整r4已 **642/642 PASS、零skip**，strict-r4 PASS；最终候选 `acafc34850ce9e9560bdc72a419031353d688c87` / tree `99837ab45ddf36bde041efc88bf3784855d6aecb` 已通过双系统完整CI run39239107681并由276正常合入552b6e0；Linux raw提取641/642（Windows专用skip1），Windows642/642零skip。相对03092ce仅四repo工程技能去本任务working链接及fixture增加canonical SPEC目标，整个plugins Git子树原身份一致；[对应回执](./evidence/sources/engineering/runtime-correspondence-acafc348.json)支持复用03092ce真实缓存/浏览器与未变资产的原消费/Sites证据，不声称重复完整13安装或12交互。

root在当前Codex桌面聊天中从同一安装locator手动显式执行Sites流程，2026-10-19T10:22:46Z成功私有部署：[Library Renewal · 续借判断](https://html-learning-artifact-274.zuozhouran.chatgpt.site)。版本1、源码 `ffaaa35965e7525b4f85036aa62e21b3c2095c73`、部署succeeded及owner-only访问由原生get_site/get_site_version回读；不是桌面原生菜单派发实证。完整身份、四次打包尝试及限制见[Site回执](./evidence/sources/sites/site-result.json)。

**四项上线前门槛的内部runtime证据已齐，最终保护交付仍未完成。** acaf最终Linux job641/642（仅Windows大小写专用skip1）与Windows642/642零skip，strict/baseline/各13安装/真实browser均通过；276于2026-10-19T10:53:43Z正常合入552b6e0，tree99837ab4与已测head/潜在merge一致。P2固定源独立限定PASS、旧3507/fixture FAIL均保原结果。子PR2证据记录、主PR275实际当前head的1个非作者批准/CI/线程/最终merge复验、Marketplace正式发布和Owner接受仍待，不能将内部reviews[]或同tree复用当作保护批准。效果 **NOT_MEASURED**。

本报告文档工作区从集成 `6c2f41516325ab3929d933efcf54457fb71f644a` 派生，只整理证据，不将该工作区旧运行树当已验候选。主PR [#275](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/275) → develop；原子子PR [#276](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/276) → codex/html-learning-artifact。当前事实由Issue/后续追加保持，不覆盖本批原FAIL。

| 最小门槛 | 本批有据结论 | 剩余责任/恢复条件 |
|---|---|---|
| A1 安装与本地独立 | 限定PASS：最终acaf LinuxCI实际13/13安装、6 Diagram+18LEK Python及4site生成/静态；03092ce同字节新缓存/native两入口/浏览器 | CLI发现不等于桌面原生派发；其他版本原轮证据分记 |
| A2 核心内容正确 | 限定PASS：LIB1–LIB4规则/四组合/跨月日期/完成确认及12项独立消费者 | 仅自编代表材料，不是真实馆规或一般语义/效果证明 |
| A3 Sites主流程 | 限定PASS：同一7文件包在当前桌面聊天手动读取安装技能后真实私有发布/版本1回读 | 原生菜单派发、第二客户端及发布后全页面矩阵未覆盖 |
| A4 工程与发布边界 | 内部runtime门槛已通过：acaf本机642/642、最终Linux641/642仅平台skip1/Windows642/642零skip，strict/baseline/各13安装及真实browser均过；276正常合入552同tree | 整体PARTIAL：子PR2记录门禁、主PR275实际当前head的1个非作者批准/CI/线程及最终merge复验/正式发布仍待；旧FAIL不追认 |

## Original meaning outcome

统一接受/操作基线为[主PLAN授权记录](./[PLAN]_HTML_Learning_Artifact.md#accepted-baseline-and-authorization)与B1/U1完整快照；本表引用其稳定条目，不另造需求，当前状态已接续实际275/278/279/280/281合入、v8.3.2公开和未发布8.3.3预升。限定PASS只覆盖明示版本、材料和方法；历史快照和原始失败保留原时点。

| 条目 | 实际工程证据及结果 | 原意达成/差距与处置 |
|---|---|---|
| C01 | 六步本地方法、3输入/7输出、12项消费及同包私有Sites；275/278/279/280/281已实际合入，v8.3.2已公开，8.3.3仅未发布预升 | PARTIAL：有界核心和预升交付有证；actual629本机/strict/CLI通过、新13/实际Python/15精确根清理通过；原保护批准NOT_MET，非核心延期/效果NOT_MEASURED及Owner最终接受NOT_PROVIDED独立 |
| C02 | [安装回执](./evidence/sources/engineering/html-learning-274-consumer-install.json)、guide固定四hash/源缓存比对 | 限定PASS：同包两入口/0.1.37/ReadWrite；最新head按差异复验 |
| C03 | 四工具/主题及[消费者12项](./evidence/sources/consumer/run02/consumer-report.json) | 已实现并限定验证；不强制章节/题量，整体A4仍阻断 |
| C04 | 真实安装locator读9参考、独立cwd与明确3输入 | 限定PASS；冻结QA原路径不是消费运行依赖 |
| C05 | 当前Sites实际技能/工具流程与私有保存部署回读 | 限定PASS于当前桌面手动执行路径；通用宿主发现/派发不外推 |
| C06 | [独立角色review](./evidence/sources/consumer/run02/role-review.json)核英文核心/中文正文活动/反馈 | 限定PASS，仅代表材料 |
| C07 | 主题映射、已知术语静态检查、正文/交互/导出独立核验 | 限定PASS；机器词面通过不证明一般语义 |
| C08 | Audience/Task/Goals/范围/判准已在代表输入给定，实际读原件 | 限定PASS：合成任务；必要澄清原生窗口未测 |
| C09 | 独立Markdown、原规则、支持范围和不支持语法负例 | 限定PASS；早期吞语法/修复分别保存 |
| C10 | 四组合表、分类/条件/日期/完成依据分别对照原件 | 限定PASS；不把分类当过程、不扩为真实馆规 |
| C11 | 真实浏览器反馈/改答失效/重核/重置/静态路径 | 限定PASS：本制品选用活动，非穷举矩阵 |
| C12 | 交接/检查与同包Sites私有发布 | 限定PASS；最终新head/受保护交付另验 |
| C13 | 检查/版本/失败重跑/效果边界与报告 | PARTIAL：真实Owner体检及据此修订尚无 |
| C14 | 严格待答指令及网页未选状态实测 | PARTIAL；网页活动不等于Owner提问窗口，原生生命周期延期 |
| C15 | 四工具本机实跑，复制成功/注入分开；03092ce新缓存checker两viewport/cleanup | 限定PASS；原Windows/Linux FAIL保留；P2独立原探针修后PASS不代最终CI |
| C16 | renderer子集、UTF-8/percent路径/分类/不支持语法负例 | 限定PASS；未迁延期工具，非全Markdown支持 |
| C17 | 两初始viewport截图、禁JS静态内容、暖白陶土 | 限定PASS；全面视觉/无障碍延期 |
| C18 | [实际7文件manifest](./evidence/sources/consumer/run02/consumer-cwd/artifact/artifact-manifest.json)、3输入与同包Sites源 | 限定PASS：内容有界，QA/导出在制作包外 |
| C19 | [Site回执](./evidence/sources/sites/site-result.json)：版本1/精确源/部署身份/URL/私有受众 | 限定PASS；不等于插件公开或Owner接受 |
| C20 | CLI native两入口/真实缓存消费；桌面手动加载安装locator后调用Sites | 有限定路径实证；桌面原生菜单派发未测，公共目录资格未验证 |
| C21 | 包资源/来源metadata/固定上游hash与许可声明、严格校验 | 已实现/部分独立核验；consumer未裁决全部上游许可，范围见role-review |
| C22 | 主PR275/子PR276/277、发布278/记录279/同步280/预升281已实际合入；HTML0.1.37、其他包/guide和公开v8.3.2保持 | 开发/公开/记录/同步及仅市场8.3.3预升已交付、8.3.3未发布；actual629本机/strict/CLI通过、新13/实际Python/15精确根清理通过，各轮批准NOT_MET/bypass不追认 |
| C23 | A1–A3及A4工程、各批双系统CI、实际merge/公开/新tag安装已有证；281候选CI与actual629本机通过/新13分记 | A4整体仍NOT_MET：275/278/279/280/281保护批准缺项，四门槛未全通过；actual629新13/实际Python/15精确根清理通过，公开/技术PASS不追认批准或延期 |
| C24 | Owner上线后体检/最终接受无真实决定 | WAIT_OWNER_AFTER_DELIVERY；接受须真实范围/决定 |
| C25 | 本REPORT接续公开、279/280/281实际同树合入、各批CI与main/develop/tag身份；actual629本机/strict/CLI通过、新13/实际Python/15精确根清理通过 | 有界交付/记录/同步/未发布预升已交付；成品体检/最终接受NOT_PROVIDED、延期和效果NOT_MEASURED独立；本次记录自身合入后仅回Issue与外部不可变回执，无新差异不递归纯证据PR |
| P01 | Agent执行构建/检查/修复/安装/PR/Sites | 按原则执行；不冒充Owner成品接受 |
| P02 | 独立`/root/checks_agent`内容/消费者；早期独立标准探针无代理署名；Linux P2由`/root/standards_review` | 限定PASS于实际范围；未知身份不补造，不等同GitHub批准 |
| P03 | 未选网页状态有实测，严格待答规则保持 | PARTIAL；原生窗口/第二客户端延期不算PASS |
| P04 | 同目标/插件/现有环境权限风险内复用授权 | 已复用；越界只停依赖，推荐不造答复 |
| P05 | 原FAIL/诊断反例/勘误、各批最终双系统CI及275/278/279/280/281合入分批留证；actual629本机644总/643PASS/1Linux机制不适用及strict/CLI通过，新13/实际Python/15精确根清理通过 | 工程与来源按真实执行身份分记；281候选通过不冒actual629复跑，自动push仅版本检查；保护批准NOT_MET及Owner接受/延期独立 |
| P06 | 独立输出/原件只读；Site同身份/私有受众回读、v8.3.2真实公开及恢复计划留证 | 有界实证；完整恢复演练与持续监控未执行，不覆盖已公开历史或扩大受众 |
| P07 | 275→develop、276/277→集成，278发布/279记录→main、280同步/281预升→develop均已实际合入；复用Issue274及唯一PLAN/REPORT | 原拓扑与有界维护排程已执行，非Owner新增机械三PR条件；内部reviews[]及275/278/279/280/281实际bypass不替保护批准。本轮记录合入后无新差异不递归纯证据PR |

## Implementation and verification ledger

| 时间/批次 | 实际候选/方法 | 原始结果与证据 | 覆盖限制 |
|---|---|---|---|
| 2026-10-19，本地r1 | 原子候选开发过程 | [全测r1](./evidence/sources/engineering/html-learning-274-full-tests-r1.log)633/636、3 FAIL；[targeted](./evidence/sources/engineering/html-learning-274-targeted-r1.log)105/105；[strict r1](./evidence/sources/engineering/html-learning-274-validate-r1.log)PASS | 三FAIL是CHANGELOG标题/版本正文及README未列site，原结果保持 |
| 2026-10-19，本地r2 | 文档修正及语法/路径/分类负例修复候选 | [全测r2](./evidence/sources/engineering/html-learning-274-full-tests-r2.log)641/641零skip；[strict r2](./evidence/sources/engineering/html-learning-274-validate-r2.log)PASS；[renderer+文档](./evidence/sources/engineering/html-learning-274-render-doc-r2.log)23/23；[docfix](./evidence/sources/engineering/html-learning-274-docfix-r2.log)10/10 | renderer节点13+文档10合并23，不重复计为另一套矩阵 |
| 2026-10-19，checker修复 | 源材料分类/几何/缺浏览器边界 | [分类修复](./evidence/sources/review/checks/material-classification-repair-tests.log)8/8零skip；[早期修后](./evidence/sources/review/checks/repaired-tests.log)6/6 | 缺Python/新worktree开发依赖与实际运行分别登记 |
| 2026-10-19，安装r1/r2 | 真实CLI0.147.0、完整canonical，r2绑定1a | [r1](./evidence/sources/engineering/html-learning-274-smoke-r1.log)及[r2](./evidence/sources/engineering/html-learning-274-smoke-r2.log)各13组合；r2实际6 Diagram+18LEK Python及4site生成/静态Python成功 | 3507只变浏览器生命周期，不能称3507全13本机复验 |
| 2026-10-19T10:12:28Z，标准retest | 1a/tree8c579494，材料分类/Markdown源名/percent路径 | [summary](./evidence/sources/review/standards-retest/retest-summary.json)：percent89/89、定向4/4；故意坏生成页两份制品报告各FAIL5项 | 正确拒绝坏页是检测证据，不抹原制品FAIL；未做完整浏览器/Sites |
| 2026-10-19T10:12:42Z，安装回执 | 1a、实际0.1.37缓存locator/逐文件hash | [安装回执](./evidence/sources/engineering/html-learning-274-consumer-install.json) native guide/site enabled、资源比对/命令 | CLI发现不证桌面菜单热加载/派发 |
| 2026-10-19T10:13:54–10:13:58Z，consumer02 | 安装SKILL hash c3c47756…，Python3.12.14/Chromium155.0.8059.80 | [报告](./evidence/sources/consumer/run02/consumer-report.json)12 PASS；static89项0失败，两viewport实渲染/下载/导出/复制/禁JS | 仅本地浏览器；Sites由root独立实际执行，不冒充消费者执行 |
| 2026-10-19T10:14:48Z，独立review | `/root/checks_agent`核来源/日期/判准/两实际截图 | [role-review](./evidence/sources/consumer/run02/role-review.json)限定PASS | 不是学习者测量、全视觉/无障碍或Owner接受 |
| 2026-10-19，Linux CI首轮 | PR276候选相关CI job | [原日志](./evidence/sources/engineering/html-learning-274-ci-linux-job-r1.log)browser profile清理失败、job FAIL | 局部几何完成不抵消任务FAIL，3507新CI待终态 |
| 2026-10-19T10:22:46Z，Sites | 1a同包，源ffaaa359…/版本1 | [site-result](./evidence/sources/sites/site-result.json)私有succeeded，get_site/get_site_version一致 | 当前桌面聊天手动显式执行；非原生菜单派发 |
| 2026-10-19T10:26:41–10:26:44Z，平台只读回读 | [275](./evidence/sources/engineering/platform-pr275.json)、[276](./evidence/sources/engineering/platform-pr276.json)、内部rules[] | 275仍6c2/draft/REVIEW_REQUIRED/reviews[]；276为3507/draft，两系统CI IN_PROGRESS | 观察快照不等于最终合并通过；无批准缺项不追认 |
| 2026-10-19T10:25:32Z及后续3507本机复验 | [新缓存回执](./evidence/sources/engineering/html-learning-274-consumer-install-r3.json)、[cleanup9项](./evidence/sources/engineering/html-learning-274-cleanup-tests-r3.log)、[浏览器](./evidence/sources/review/final-checker-3507/layout.json) | 全部资源源/缓存相符、native2入口，两viewport/cleanup及9项实际PASS | 不称3507全13复验；下行Linux会话反例独立保留 |
| 2026-10-19，独立Linux生命周期探针 | [原session探针](./evidence/sources/review/lifecycle-3507/session-probe.py)与[原结果](./evidence/sources/review/lifecycle-3507/session-probe-report.json) | 同组writer正确清除；同owned session中另建process group的writer未跟踪、close后存活并重建已清目录，foreign会话未受影响 | 原轮P2 OPEN；下方固定a02e独立修复限定PASS另记，非Chrome/GitHubCI替代 |
| 2026-10-19，a02e实现者修复 | [WSL结构报告](./evidence/sources/review/lifecycle-fix-a02e/wsl-report.json)、[原WSL输出](./evidence/sources/review/lifecycle-fix-a02e/wsl-lifecycle-tests.json)、[Windows9项](./evidence/sources/review/lifecycle-fix-a02e/windows-tests.log) | 全session所有组、两次空扫描；两变体root不重建/foreign保留；有界cleanup晚写重试通过、持久晚写按预期FAIL | 明确为实现者运行证据，不冒充独立；WSL原输出保混合提示/编码，不重写为纯JSON |
| 2026-10-19，固定a02e独立复测 | [独立报告](./evidence/sources/review/lifecycle-independent-a02e/session-retest-report.json)、[原模块](./evidence/sources/review/lifecycle-independent-a02e/check_renderings-a02e204.py)及probe/runner | 同组/新组writer都杀闭、无root重建、foreign保留；/proc目录或单stat不可读抛RuntimeError；完成两viewport后模拟枚举失败main exit2/NOT_RUN | P2在该固定模块/独立Python范围已修复PASS；不是实际Chrome或最终LinuxCI |
| 2026-10-19T10:33:56–10:34:03Z，整合03092ce本机 | [新安装](./evidence/sources/engineering/html-learning-274-consumer-install-r4.json)、[9项](./evidence/sources/engineering/html-learning-274-cleanup-tests-r4.log)、[新浏览器](./evidence/sources/review/final-checker-03092ce/layout.json) | fresh native2/全包资源比对、实际两viewport/cleanup及Windows9/9零skip | 不重复无差异的12交互；[Git对应](./evidence/sources/engineering/runtime-correspondence-03092ce.json)证site仅checker较1a变化，checker与a02e/独立快照hash一致 |
| 2026-10-19，03092ce Linux CI-r2 | [原始job日志](./evidence/sources/engineering/html-learning-274-ci-linux-job-r2.log)，job118012756999/run39238325149 | 642总/584PASS/57FAIL/1 Windows专用skip；浏览器生命周期相关项本轮通过 | 四既有工程技能新增SPEC指针后，隔离fixture合成文档目标缺该SPEC，57前置失败；非产品运行缺陷，root只补helper目标，修后r3/CI待证，判准不变 |
| 2026-10-19，本地完整r3 | [原全测日志](./evidence/sources/engineering/html-learning-274-full-tests-r3.log)，补SPEC后的工作树 | 642总/585PASS/57FAIL/0skip；SPEC目标补齐后，四可复用工程技能的本任务INDEX链接仍超出fixture闭包 | 第二次前置FAIL分别保留，非产品运行缺陷；root移除四技能具体working任务链接、仅保canonical SPEC并补一个合成目标，严格validation不变；该观察时r4仍运行，其后终态见下行 |
| 2026-10-19，fixture/复用技能指针修后stage | [严格validate-r4](./evidence/sources/engineering/html-learning-274-validate-r4.log) | 当时strict PASS、完整r4仍运行；后续完整终态见下一行，未提前复制未结束日志 | 仍须完整测试/新CI/实际合并门禁；develop实际要求1个当前head非作者批准，当前尚无 |
| 2026-10-19，完整r4终态/acaf候选 | [原全测r4](./evidence/sources/engineering/html-learning-274-full-tests-r4.log)、strict-r4、[Git子树对应](./evidence/sources/engineering/runtime-correspondence-acafc348.json) | 642/642 PASS，零skip；仅四repo技能指针/fixture目标变化，plugins子树同03092ce为f7856bc24c4a1b3d269e114fe5de55c85d525a53 | 本机终态已取；最新acaf CI run39239107681仍运行，内部merge及主保护门禁另待 |
| 2026-10-19，早期03092ce WindowsCI-r2 | [原job日志](./evidence/sources/engineering/html-learning-274-ci-windows-job-r2.log) | 642总/585PASS/57fixture前置FAIL/0skip，与Linux-r2同SPEC/working闭包问题 | 旧FAIL保留；不把本机r4或新CI外推旧轮通过 |
| 2026-10-19T10:40:21–10:44:29Z，最终acaf LinuxCI | [完整raw job](./evidence/sources/engineering/html-learning-274-ci-linux-job-r3.log)、[实际job metadata](./evidence/sources/engineering/ci-linux-final-job-metadata.json)、[独立提取summary](./evidence/sources/engineering/ci-linux-final-summary.json) | job118015318754/run39239107681 success；unit642总/641PASS/0FAIL/1 Windows casing专用skip；真实浏览器case通过；strict/baseline与13/13 smoke PASS，实际6Diagram+18LEK Python、4site生成+4静态Python均status0 | 统计从raw逐条提取，不按平台假定；Windows完整job/实际merge/保护批准另待 |
| 2026-10-19，276 potential merge核对 | [GitHub commit metadata](./evidence/sources/engineering/pr276-potential-merge-candidate.json) | potential merge20c911d615d72b1681464db9f2a767164c0d6485，parents6c2/acaf，tree99837ab4与已测head一致 | 只是候选，不当作实际合入；root另核内部rules[]/threads0及必要门禁 |
| 2026-10-19T10:40:20–10:53:02Z，最终WindowsCI | [完整raw job](./evidence/sources/engineering/html-learning-274-ci-windows-job-r3.log)、[独立提取summary](./evidence/sources/engineering/ci-windows-final-summary.json) | 642/642 PASS、零skip，实际browser case、strict/baseline PASS；13/13安装、6Diagram+18LEK Python、4site生成+4静态Python均status0 | 与Linux同acaf/run39239107681，原两轮fixture FAIL保留；不是保护主PR批准 |
| 2026-10-19T10:53:43Z，276实际内部merge | [最终gate](./evidence/sources/engineering/html-learning-274-runtime-gate-final.json)、[threads0](./evidence/sources/engineering/html-learning-274-runtime-threads-final.json)、[规则[]](./evidence/sources/engineering/html-learning-274-internal-rules-final.json)、[merge](./evidence/sources/engineering/html-learning-274-runtime-merge-final.json)、[实际tree/parents](./evidence/sources/engineering/pr276-actual-merge-tree.json) | 正常合入552b6e0a5d9e3d0a85e284406fe87e9508549028；tree99837ab45ddf36bde041efc88bf3784855d6aecb同acaf/20c已测tree；base6c2/headacaf、CI终态通过 | 内部不受保护，按授权Agent合并，reviews[]不当作主PR275批准；后续证据PR/最终保护/发布接受另据门禁 |

## Independent synthetic acceptance

`/root/checks_agent`实际读取安装SKILL及9参考，担任独立内容/学习设计和包消费者，不要求真人模拟。3输入为artifact.json、content.md及自编LIB1–LIB4原件；规则明确不是现实馆规。实际核四组合、七日跨月2026-10-29→2026-11-05和提交不等于完成的三判准；浏览器核错误反馈、改答失效/重核、重置、版本/来源导出、真实下载、复制及禁JS读取。其未独立裁决全部上游许可，范围按原role-review保留。

真实成功复制使用未修改Clipboard writeText/readText。Windows将55个LF转CRLF：原回读2878字节、导出2823字节，原始hash不同；只明确归一化换行表示后其余内容一致，**不称原始字节一致**。run01严格字节比较FAIL保留。另两条拒绝/缺API是**真实浏览器故障注入**，证明完整手动文本选择、可见返回及Escape/按钮恢复焦点；手动复制完成仍UNCONFIRMED，不把注入称真实用户拒绝事件。

早期独立标准审查/探针保存首次坏页、percent、不支持Markdown与新复验；这些原件未署执行代理，不据排程猜作者。材料分类修后故意坏页仍被拒绝，路径/词边界/Markdown子集有定向证据；完整浏览器/Sites与无关全审未执行。Linux P2原反例及固定a02e独立复测实际执行者为`/root/standards_review`；该范围来源于真实代理协作记录与原probe/result。独立审查、合成验收、GitHub批准与Owner接受各自判断。

## Failures, corrections and recovery

1. 原联合静态89项1 FAIL：shell/input两个h1；桌面孤字换行有实际截图。renderer修支持标题层级、主题balance，[初始观察](./evidence/sources/review/checks/failure-observations.json)/原截图与[新静态](./evidence/sources/review/checks/repaired-static.json)分开保留。
2. Windows DevToolsActivePort创建后句柄仍占用，首checker NOT_RUN/exit2。改在既有时限等实际可读/loopback响应，未放宽几何判准。早期stdout未原存独立日志，failure-observations标恢复观察，不冒充字节原日志。
3. 源材料/Markdown分类、percent URL、单词边界、不支持Markdown静默处理等独立审查问题，保存[首原探针](./evidence/sources/review/standards-first/probe.py)、[首percent报告](./evidence/sources/review/standards-first/percent2-report.json)与修后输入/输出/探针。[tool-fixes](./evidence/sources/review/tool-fixes/percent-static.json)及retest注明修复范围。无Python PATH/新worktree缺yaml先记未运行，后配置真实解释器/仓库锁定开发依赖重跑，不改消费者运行时独立规则。
4. 完整工程r1三文档FAIL、r2修后641/641分记，不抹原输出。
5. [首loader观察](./evidence/sources/consumer/prep/first-loader-failure.json)是Node Windows绝对import scheme错误，candidateExecuted=false/NOT_RUN；只改临时QA脚本file URL。[run01原报告](./evidence/sources/consumer/run01/consumer-report.json)保剪贴板换行字节FAIL；run02只校准QA换行边界，不因此改runtime。
6. Linux profile清理导致CI job FAIL，3507修复仍需新缓存/浏览器及CI，不以Windows本地通过补Linux。
7. Sites同一身份/源码经历3次打包FAIL：Git HTTP500/expected flush、默认bash误入缺/bin/bash的WSL、GNU tar将Windows冒号当远端。第四次用既有Git Bash会话PATH及TAR_OPTIONS=--force-local成功；随后私有保存部署与原生回读一致。不重复建站，凭据仅会话内存/隐藏stdin，不入制品/参数/日志。
8. 3507在本机新缓存/实际浏览器及9项PASS后，独立Linux反例证明原`pgrp==sid==launcherPID`筛选过窄：owned session中新组writer未跟踪并能重建临时目录。原probe/result完整保存，当轮登记P2 OPEN；后续固定a02e修复与独立限定PASS见第9项，不改此历史FAIL，也不以CI绿补修复证据。
9. a02e修为完整检查owned Linux session所有组，两次连续空扫描才认退出。实现者WSL/Windows先独立登记；后续标准评审者使用固定模块重跑原探针、加目录/单stat不足与main失败传播变体，限定PASS。03092ce集成checker与固定a02e Git blob均为d4a7b0e783d411547abf79a32a3ce49df3690067，独立源快照/两commit原字节SHA256均d99dc2ad8a67d557f552280b83a5e519eb5395e18e71775abe7cb3fdbb489ccd，原3507 FAIL仍保。真实Chrome/最终CI另据各自证据，不扩张探针范围。
10. 03092ce Linux CI-r2保原57个fixture前置FAIL：四工程技能的真实SPEC链接在新合成fixture中无目标；同轮生命周期项实际通过。root只补tests/helpers/repository-fixture.mjs的合成SPEC目标，不造历史证据、不降严格validation；后续本机r3另一前置FAIL见第11项，不能把本轮失败记PASS。
11. 本地完整r3再出现57个前置FAIL：补SPEC后，同四可复用工程技能仍带本任务working INDEX链接。root移除具体task历史指针、保canonical SPEC，fixture仅合成该SPEC目标，不复制任务历史为假证据，不降严格校验。原r3=585/642、57FAIL、0skip及早期WindowsCI-r2同计数均保留；新完整r4已642/642零skip，acaf新CI仍待，不能重写旧轮FAIL。
12. 最终acaf Linux原job已成功，独立提取脚本只去GitHub时间前缀、读完整root JSON与精确TAP汇总；只统计scenarios的实际command，避免重复统计顶层别名。原skip为Windows等价大小写专用case，不是浏览器/核心跳过。raw log、原执行[提取脚本](./evidence/sources/engineering/ci-final-summary-parser.mjs)、派生summary与API job metadata分别保存；本轮PASS不改前两轮fixture FAIL。

本地输出可由明确输入再生，原材料/缓存保持。Sites未知结果先回读；身份/受众/凭据/非预期材料异常停止新增发布并升级Agent/Owner，采用真实已知良好保存版本或前向修复。插件回退用新受保护PR原子恢复包/严格清单，保留历史tag/Release/原证据。

## Historical delivery, handoff and acceptance snapshot

原子子PR276已正常合入集成552b6e0，双系统完整CI、规则[]/threads0及实际同树均有原件。主PR275仍需其实际当前head非作者批准/检查/线程与最终merge复验，不能以内部合入替代。子PR2先冻结本文与证据，再正常继承origin集成运行基线并执行strict/doc复验；实际新SHA和结果追加，不删除旧FAIL。

Sites同消费者run02的7文件有界包，manifest SHA256 `c4c445947180f77641512dee1de3732fbc7946fb53fce804f33677e6e037c16e`；源码ffaaa359…，保存版本ID `appgprj_6ad5ec4ffef08191ab68478e806c7d54~appgver_5ccea8f05c14819198526552c44cae8d`，部署ID `appgdep_6ad5ef65b5148191aa412670234db65a`。访问custom、owner角色、allowedUsers1/groups0/externalVisitors0；网页已私有部署，插件仍NOT_PUBLISHED，OwnerInspection PENDING。

[包核验](./evidence/sources/sites/package-verification.json)确认Site源码中7文件字节相同，仅额外包含预期`dist/.openai/hosting.json`元数据，无QA/导出混入；[匿名访问观察](./evidence/sources/sites/anonymous-access.json)为无cookie/授权、禁止重定向的单次HttpClient GET返回401，与原生私有ACL分开支持访问边界，不记录响应正文/凭据。

[一次部署后原生元数据回读](./evidence/sources/sites/postdeployment-metadata.json)于2026-10-19 10:41 UTC保持同Site/URL/版本1、active及owner/custom/users1/groups0/external0，无受众变化；这是一次观测，无持续自动化，不冒充浏览器/内容复验或Owner接受。

| 未完成/延期 | 影响 | 责任/恢复条件 |
|---|---|---|
| 子PR2记录/最终主保护门禁 | 阻整体最终交付 | 276完整双系统CI/实际merge已过；Agent继续子PR2记录门禁与275实际当前head检查，开发保护1个非作者批准真实满足 |
| 保护批准/合并/Marketplace发布 | 开发目标与正式公开未完成 | 真实非作者批准；Agent按当前head/base/门禁和发布控制推进，不bypass |
| 原生窗口/桌面原生派发 | 仅CLI发现/安装消费/桌面手动执行有证 | Agent在真实入口/生命周期事件可用时测；未答不默认，持续显示无证不PASS |
| 第二客户端/全面视觉无障碍/扩展 | 仅两初始viewport与选定活动/禁JS | Agent按问题/环境恢复定向验证；有限截图/注入不等于全覆盖 |
| Owner体检/最终接受 | 成品体验与最终接受未决定 | Owner在可审查成品后给真实范围/决定；Agent修复并复验受影响项，不默认接受 |
| 理解效果 | NOT_MEASURED | 未来另定人群/任务/判准与测量；本次不据美观/单次答对宣称改善 |

[source-bindings](./source-bindings.json)逐文件验证原字节，[复制回执](./evidence/sources/engineering/evidence-copy-receipt.json)记原路径/hash/实际复制时钟。固定QA脚本含原绝对临时/工具路径，标为原运行脚本快照，非插件依赖；read-resources.json的完整参考快照不是第二正式正本。核心交付、全计划完成、插件发布、网页部署、Owner体检与最终接受分记。


2026-10-19，文档子PR [#277](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/277) 已实际创建，目标为同一集成分支。其7138d343/tree31f7fa21正常继承552b6e0，运行Git对象与552相同，197原来源已从Git blob独立逐hash核验。root实际文档/INTENT/契约116项与完整real-source原字节投影1项均PASS/零skip，见[范围检查回执](./evidence/sources/engineering/acceptance-scope-checks.json)。本次只补真实PR链接与这3份检查原件绑定，未改变运行、原197证据或接受判准；子PR完整平台矩阵与最终主PR检查按各自服务器终态记录，不将未完成项写成通过。内部实际merge和受保护275/发布/Owner接受的后续事实由Issue及PR回读，原FAIL保留。

## Release preparation checks and preserved failures

本次只整理发行/任务文档、HTML README/CHANGELOG中性版本介绍及新增postmerge原证据局部空白属性；技能、工具、manifest与guide均未变。[独立复核汇编](./evidence/sources/postmerge/preparation/html-learning-274-release-review.json)记录两个已修维护问题和真实角色，不能替代GitHub批准。新正式候选的完整平台矩阵仍待当前head。

root首轮相关144/144通过；增加README任务链接后隔离套件出现143PASS/1FAIL，删去该仓库依赖后144/144修后PASS，未改fixture或判准。另完整642首轮633PASS/9FAIL/零skip，原因是该测试进程未传已有Python解释器；显式HTML_SITE_PYTHON后site9/9（含真实browser）零skip。各原日志在[来源清单](./source-bindings.json)分别冻结；正确环境的完整重跑另据终态追加，不据定向9项宣称完整PASS。actual65d的原件、15精确不存在目录与核验方法另见[终态独立回执](./evidence/sources/postmerge/canonical65d/terminal-receipt.json)。

正确环境完整重跑已实际结束：**642/642 PASS、零FAIL/skip/cancel**，原始[完整日志](./evidence/sources/postmerge/preparation/html-learning-274-release-full-tests-repaired.log)与[阶段汇总](./evidence/sources/postmerge/preparation/html-learning-274-release-final-checks.json)分开保存；使用已有Python，无产品/fixture/门禁改动。来源与文档补记之后继续strict/原字节闭包检查，最终head平台完整矩阵与保护批准另据事实。
