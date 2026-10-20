import fs from "node:fs";
import path from "node:path";
import {createHash} from "node:crypto";
import {execFileSync} from "node:child_process";
const directory=path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,"$1"));
const repository="C:/Users/Admin/.codex/worktrees/html-learning-artifact/develop";
const task="plans/274-html-learning-artifact/";
const sha=b=>createHash("sha256").update(b).digest("hex");
const load=file=>JSON.parse(fs.readFileSync(path.join(directory,file),"utf8"));
const manifest=load("input-manifest.json"),rows=load("inputs/acceptance32.json"),owner=load("inputs/owner-owner-decision.json"),issue=load("inputs/current-issue.json");
const head=execFileSync("git",["rev-parse","HEAD"],{cwd:repository,encoding:"utf8"}).trim();
if(head!==manifest.head||owner.ownerCoreAcceptance!=="ACCEPTED_LIMITED"||issue.state!=="OPEN")throw Error("Current identity/acceptance changed");
const supplements=[
 ["consumer-role",task+"evidence/sources/consumer/run02/role-review.json"],
 ["consumer-report",task+"evidence/sources/consumer/run02/consumer-report.json"],
 ["artifact-manifest",task+"evidence/sources/consumer/run02/consumer-cwd/artifact/artifact-manifest.json"],
 ["site-result",task+"evidence/sources/sites/site-result.json"],
 ["site-postdeployment",task+"evidence/sources/sites/postdeployment-metadata.json"],
 ["provenance","plugins/html-guide-kit/skills/site/references/resource-provenance.json"],
 ["evaluation","plugins/html-guide-kit/skills/site/references/evidence-and-evaluation.md"],
].map(([id,source])=>{
 const bytes=fs.readFileSync(path.join(repository,source)),file="inputs/"+id+path.extname(source);
 fs.writeFileSync(path.join(directory,file),bytes,{flag:"wx"});
 return {id,source,snapshot:file,bytes:bytes.length,sha256:sha(bytes)};
});
const binaries=["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe","C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe"].map(file=>({path:file,exists:fs.existsSync(file),bytes:fs.existsSync(file)?fs.statSync(file).size:null}));
const capabilities={capturedAt:new Date().toISOString(),processPlatform:process.platform,nodeVersion:process.version,binaries,verification:"File presence only; no browser/Python/client was launched for this inventory.",nativeComputerUse:"DISABLED by current tool instructions",browserComputerUse:"Browser APIs available; not equivalent to a native Codex/Work client or an unanswered-dialog lifecycle.",sitesReadToolNamesObserved:["mcp__codex_apps__sites_get_site","mcp__codex_apps__sites_get_site_version","mcp__codex_apps__sites_get_deployment_status"],sitesObservationScope:"Tool metadata observed only; no Sites call/authentication/permissions/readback occurred in this inventory.",modelDesktopBoundary:"Current AGENTS says not to restart model or desktop tests. Latest request authorizes inventory and conditional technical progress, and parent explicitly preserves this boundary."};
fs.writeFileSync(path.join(directory,"capabilities.json"),JSON.stringify(capabilities,null,2)+"\n",{flag:"wx"});
const decisions=[
 {id:"O01",kind:"conditional-scope-or-priority",neededNow:false,title:"原生/第二客户端恢复涉及既有不重启边界时的实质选择",trigger:"只有Owner希望现在恢复模型/桌面真实测试，或将其作为本轮优先目标时；当前native控制能力未满足，批准本身不能制造技术能力。",question:"是否继续保留原生与第二客户端延期，还是待实际能力可用后安排专门真实客户端验收？",options:[{id:"keep-deferred",recommended:true,text:"当前保留延期；先由Agent完成可自治网页/材料/离线恢复检查。",impact:"不越过不重启模型/桌面测试边界，不把延期当PASS。"},{id:"resume-when-capable",recommended:false,text:"指定要恢复的真实客户端/版本与范围，待可观测原生能力可用后，明确允许该批客户端测试。",impact:"这是对现有执行限制的实质调整；仍须实际事件证据，CLI/浏览器不能替代。"}]},
 {id:"O02",kind:"eventual-acceptance",neededNow:false,title:"剩余范围最终接受",trigger:"Agent完成可自治部分并给出可审查结果，剩余延期的条件或明确范围调整已具备时；不重复询问已接受的核心。",question:"对剩余体验和完整计划，应保留开放，还是在充分结果后作限定范围的最终决定？",options:[{id:"retain-open",recommended:true,text:"现在继续接受既有核心，完整计划与延期保留OPEN。",impact:"与现有ACCEPTED_LIMITED完全一致；无需Owner立即再答。"},{id:"decide-after-evidence",recommended:false,text:"剩余条件恢复并取得实测结果后，Owner基于成品作明确接受或问题反馈。",impact:"Owner承担实质体验/范围决定；Agent承担常规技术体检、修复和复验。"},{id:"explicit-scope-revision",recommended:false,text:"如确需提前结束，另行明确修订剩余完成范围及例外。",impact:"属于新的实质决定，必须保留原判准与NOT_MET历史；不能倒补保护批准或把未测写PASS。"}]},
 {id:"O03",kind:"optional-new-study-not-current-obligation",neededNow:false,title:"是否另开真实学习者效果研究",trigger:"只有Owner提出理解改善、保持或迁移等效果主张/研究目标；初版明确允许NOT_MEASURED，不是当前完成前置。",question:"是否继续不作效果声明，还是另定真实人群与测量研究？",options:[{id:"keep-not-measured",recommended:true,text:"维持NOT_MEASURED，不以效果状态阻断本次核心或工程收尾。",impact:"不额外招募真人，不扩展原实施范围。"},{id:"commission-real-study",recommended:false,text:"另定人群、任务、比较条件、判准与真实参与/同意边界后开展研究。",impact:"需Owner决定研究目的及参与边界；真实学习者测量不能用Agent角色模拟或单次答对替代。"}]}
];
const deferrals=[
 {id:"D01",name:"完整原生待答窗口生命周期",acceptanceIds:["C08","C14","P03"],originalCriterion:"原计划§5 Clarification：只问实质未决项，复用确认，推荐/预选/沉默/超时/关闭非回答，必要答案保持同一待答；持续显示/空返回/超时/关闭须真实客户端事件。",coveredEvidence:["包内严格待答规则","合成网页未选状态与12项消费者","Owner本轮有真实原生答复记录，但只证明该次答复"],remaining:"完整弹窗持续显示、空返回、超时、关闭/消失、重入与同一待答状态在真实宿主的实证。",recoverWhen:["存在实际支持且可观测这些事件的宿主/原生入口","明确当前客户端/技能/会话版本并能保存真实事件","恢复该批测试不违反现有不重启模型/桌面测试限制，或已取得针对性调整"],missingNow:["native computer APIs被禁用；没有可证明完整原生生命周期的当前执行路径","既有不重启模型/桌面测试约束仍适用"],agentCanDoNow:["保留已有协议、事件清单和失败判准；复核包内同一pending状态合同","准备精确事件矩阵与证据格式；条件具备再实际执行，不制造真人答复"],readiness:"BLOCKED_CAPABILITY_AND_EXISTING_BOUNDARY",ownerDecisionRefs:["O01"],notEquivalent:["网页radio未选","CLI安装发现","聊天文字pending","单次Owner真实答复"]},
 {id:"D02",name:"桌面原生菜单/技能派发",acceptanceIds:["C05","C20"],originalCriterion:"原计划§8.3/SPEC§5须一次安装后真实主流程；已有一个客户端手动安装locator→Sites已满足核心。桌面原生菜单热加载/派发属于尚未覆盖入口。",coveredEvidence:["CLI native两入口enabled与逐资源hash","当前Codex桌面聊天手动读取安装locator→Sites实际私有发布"],remaining:"实际桌面菜单发现、选择、派发到已安装site/guide、版本与会话对应。",recoverWhen:["真实桌面入口及观察/操作能力可用","可绑定实际安装版本和派发事件","符合既有不重启限制或得到该批次明确调整"],missingNow:["CUA native disabled","无允许新增桌面模型派发批次的当前执行条件"],agentCanDoNow:["整理安装locator/版本/hash与原派发缺口","条件到位时独立实测；不让Owner承担常规安装检查"],readiness:"BLOCKED_CAPABILITY_AND_EXISTING_BOUNDARY",ownerDecisionRefs:["O01"],notEquivalent:["CLI metadata enabled","浏览器打开网页","手动读SKILL后执行"]},
 {id:"D03",name:"第二真实客户端及其端到端范围",acceptanceIds:["C01","C12","C20","P03"],originalCriterion:"原计划§11–12明确第二客户端可后移，不要求双端作为初版核心门槛；恢复时只能按该真实客户端实际路径计证。",coveredEvidence:["一个目标客户端真实Sites主流程","本机浏览器代表制品12项交互"],remaining:"另一个真实宿主客户端的安装/调用/本地制作/Sites衔接与适用异常范围。",recoverWhen:["明确一个不同真实客户端及版本，具有实际入口/必要授权和工具","可在隔离材料/输出与同一private边界下记录完整路径","当前不重启模型/桌面测试约束不再阻该指定批次"],missingNow:["第二客户端可用入口、事件和安装环境未由当前证据提供","原不重启边界仍适用；浏览器引擎变化不等于第二客户端"],agentCanDoNow:["只读盘点可用客户端/版本及恢复清单","若条件缺失保留延期，不把Chrome/Edge或CLI替另一宿主"],readiness:"BLOCKED_REAL_CLIENT_CONDITIONS",ownerDecisionRefs:["O01"],notEquivalent:["第二浏览器","CLI","headless viewport模拟","原客户端另一次调用"]},
 {id:"D04",name:"扩展视觉/可访问性/键盘触控打印及托管页覆盖",acceptanceIds:["C11","C12","C17","C24"],originalCriterion:"原计划§7、§11–12：检查实际对比度/行宽/层级/响应式/减少动效和必要静态路径；完整视觉/可访问性可后移，有限截图不能写全面通过。",coveredEvidence:["1366x900与390x844初始截图独立看图","禁JS必要内容","12项代表交互、复制成功/故障注入/焦点恢复","实际checker两viewport及后续工程CI"],remaining:"更多屏宽/缩放/长文本与全部选定活动状态、全键盘顺序/可见焦点、可访问名称/状态、减少动效、打印、触控；托管后页面矩阵与真实辅助技术范围分别登记。",recoverWhen:["先从既有7文件包复制到隔离输出并绑定hash","Agent定义有限、可复现且与本制品功能对应的矩阵","使用现有真实浏览器工具执行网页工程检查，不启动模型/桌面技能测试","托管页验证需同私有受众可访问的已认证浏览器；辅助技术/真实设备另按实际可用性恢复"],missingNow:["完整矩阵尚未执行，不是缺Owner批准","Chrome/Edge/Python文件存在，但本轮未启动核运行；托管认证/辅助技术可用性未核"],agentCanDoNow:["立即自主准备并执行有界的本地视觉/键盘/静态语义/缩放/减少动效/打印检查","按实际失败修复并只复验受影响部分；需要代码变更时走同Issue正常保护PR","可先只读核托管认证路径是否可用，保留未覆盖项"],readiness:"READY_FOR_BOUNDED_ENGINEERING_SUBSET",ownerDecisionRefs:[],notEquivalent:["两张初始截图","自动规则通过即完整认证","桌面浏览器响应式模式即真实手机/读屏器"]},
 {id:"D05",name:"复杂/冲突/缺失材料和扩展异常的定向验证",acceptanceIds:["C08","C09","C10","C11","C13","C24"],originalCriterion:"原计划§5/§12：材料保条件/例外/冲突/未知，缺关键依据补充或收窄；复杂材料和扩展失败恢复按真实问题恢复，不强制穷举。",coveredEvidence:["LIB1–LIB4四组合、跨月日期、提交不等于完成","Markdown不支持结构/路径/分类/复制错误等原负例与修复","现有合成任务已给Audience/Task/Goals/判准"],remaining:"范围明确的新复杂材料/冲突和缺失条件样例、长内容与边界输入；真实六步模型行为与材料工具工程检查分记。",recoverWhen:["Agent给定可核对的合成原件和明确判准，标注非真实馆规","只执行本地工具/静态制品/浏览器工程与独立内容核验，不偷偷重启模型/桌面矩阵","如观测真实模型待答行为则另等D01/D03条件"],missingNow:["尚无具体新增产品缺陷/Owner材料，并不阻止Agent自编工程反例","无授权恢复真实模型/桌面调用"],agentCanDoNow:["自主挑少量高影响材料：缺关键规则、来源冲突、不支持Markdown、极长标签/术语、输出恢复；保存原件与预期","由独立Agent核对来源忠实/判准，执行现有工具而不需真人模拟","仅对真实缺陷修复；不把扩展合成覆盖写作一般语义/模型能力证明"],readiness:"READY_FOR_BOUNDED_ENGINEERING_SUBSET",ownerDecisionRefs:[],notEquivalent:["穷举所有主题","新增无需求功能","工程反例即真实客户端六步行为","真实学习者效果"]},
 {id:"D06",name:"风险相称的观测与恢复实证",acceptanceIds:["C19","C25","P06"],originalCriterion:"原计划§8/§13及P06：未知发布结果先回读，保持身份/受众；已发布版本有适度观测、停止条件、已知良好版本和可控恢复，不删除历史。",coveredEvidence:["Site四次打包尝试/同身份恢复后成功","版本1/ffaaa源码与private受众回读","部署后多次一次性metadata观察","本地再生/受保护前向修复或回退计划"],remaining:"有界离线恢复演练与恢复后核验、当前只读Site版本/受众观测；持续监控或生产回滚演练尚未执行。",recoverWhen:["冻结已知良好7文件包/源码版本1、精确校验恢复产物","先在独立目录演练、不触生产站/公开受众","实际Site只读检查可用时先读取同ID/版本/访问，不新增部署","生产回滚仅真实异常或专门必要场景，遵守同对象/权限/风险边界"],missingNow:["完整恢复演练与持续观测没有证据","本轮只观测到get_site/get_site_version工具名称，未实际读权限/站点；未请求周期自动化"],agentCanDoNow:["自主离线核恢复包完整性、独立再生产物/摘要和停止条件","在原授权同站private范围内可执行一次只读元数据核对；不为证明恢复而无故部署","无定时请求时不创建后台监控/自动化；必要故障才复原生产"],readiness:"READY_OFFLINE_AND_CONDITIONAL_READONLY_SITE",ownerDecisionRefs:[],notEquivalent:["一次回读即持续监控","回滚计划即演练","新部署成功即恢复原已发布版本"]},
 {id:"D07",name:"残余体验范围与完整原计划最终接受",acceptanceIds:["C01","C13","C24","C25","P01"],originalCriterion:"原计划§12–13分别记录实际制作体验、阅读操作、扩展异常及接受范围；Owner给实质成品判断，Agent修复并复验，不推定接受。",coveredEvidence:["当前Issue与owner-core-acceptance282：Owner真实选择接受当前已交付核心并保留延期和历史缺口","ACCEPTED_LIMITED，判准未变"],remaining:"残余体验技术体检、真实Owner实际体检过程（未提供，不推定看站）与完整原计划最终接受NOT_PROVIDED。",recoverWhen:["Agent先把可自治网页/材料/恢复检查做成可审查结果","D01–D03条件具备后按范围恢复，或Owner明确作范围修订","Owner仅就成品/剩余范围作实质接受或问题决定，不能由Agent代答"],missingNow:["完整原生/第二客户端仍缺条件","未提供Owner体检执行证据或全计划最终接受；已有核心接受不得重复当缺失"],agentCanDoNow:["承担独立角色模拟、常规工程和体验功能核验；整理成品与最少必要问题","记录新问题后自行修复和受影响复验","保持核心接受/全计划/效果/历史批准四种状态独立"],readiness:"AGENT_SUBSETS_READY_EVENTUAL_OWNER_DECISION",ownerDecisionRefs:["O02"],notEquivalent:["独立Agent模拟Owner","Owner核心接受即已实际访站/完整体检","合并/发布即全计划接受"]},
];
const exclusions=[
 {id:"H01",type:"historical-permanent-deficit",acceptanceIds:["C23","P05","P07"],text:"275/278/279/280/281/282真实保护批准NOT_MET/实际bypass是历史事实，Owner限定核心接受未豁免。新CI、合并后补评或新纯证据PR不能倒补合入时要求；未来新PR按当前真实批准/CI/A6/线程。不是当前技术待办，也不自动发起Owner例外请求。"},
 {id:"N01",type:"explicitly-excluded-first-release-tools",acceptanceIds:["C16"],text:"HTML Plan pack.mjs/htmlplan.js/htmlplan.css，以及Birch eval/vision/GEPA明确首版不迁。仅有具体代码摘录/专用关系组件/单文件导出等新需求时才另评估；无空vendor/包装，不因文档用deferred一词把它们自动纳入Issue274剩余。"},
 {id:"N02",type:"optional-effect-study",acceptanceIds:["C01","C13","C25"],text:"理解效果NOT_MEASURED按原§1/§13不阻最小上线，也不单独阻本次工程完成。真实效果研究须真实人群/任务/条件/判准与实际回答，Agent合成只验证工程和材料正确，不代学习者；仅新效果目标触发O03。"},
 {id:"N03",type:"non-goal",acceptanceIds:["C20"],text:"公共插件目录资格/上架、公开受众扩大不在本次自有Marketplace/private代表站范围；不得作为未完成核心，也不顺手实施。"},
 {id:"N04",type:"bounded-contract-not-universal-coverage",acceptanceIds:["C02","C07","C09","C11","C21"],text:"旧guide完整重测、全部Markdown/所有主题/穷举交互/大规模模型矩阵及所有上游许可法律裁决不是初版判准。C21必要的来源/许可记录须齐备，可自主核对声明/版本/哈希/notice；消费者未作全法律裁决本身不是已证许可缺陷。出现具体材料来源/复制不一致才按事实修复或请求必要权利信息。"},
 {id:"N05",type:"intentional-version-state",acceptanceIds:["C22"],text:"8.3.3仅Marketplace预升且未发布是已交付的目标状态，不是漏发；当前公开8.3.2/f906不变。不得把此次延期盘点扩成新发布、重开维护链或递归纯证据PR。"}
];
const specific={
 C01:["CORE_ACCEPTED_LIMITED_REMAINDER_OPEN","六步代表主流程、内容/独立消费/Sites/公开及维护闭环完成；Owner限定核心接受已补当前事实。","全计划仍受D01–D07的各自剩余约束，不因核心接受抹除。"],
 C02:["PASS_BOUNDED_NO_ACTIVE_GAP","同插件site/guide双显式、ReadWrite、guide四资源hash及图标身份、原子资源清单/安装有证。","无需重启旧guide矩阵；只在实际变更时复验。"],
 C03:["PASS_BOUNDED_NO_ACTIVE_GAP","六步方法/主题/四工具已迁；材料和12项消费核验、P2原反例修后/后继CI分批留证。","未知历史Chrome启动原因保留；当前没有据此自动重开产品缺陷。"],
 C04:["PASS_BOUNDED_NO_ACTIVE_GAP","独立安装locator/无研究cwd或他缓存、标准库和本地资源、独立输出实证。","只在新包/环境实变或失败时恢复对应检查。"],
 C05:["PASS_CORE_NATIVE_DISPATCH_DEFERRED","当前桌面会话手动实际读安装site locator→真实Sites保存发布/回读。","通用宿主自动发现/原生菜单派发未证，见D02；不否定已验一个目标客户端主流程。"],
 C06:["PASS_BOUNDED_NO_ACTIVE_GAP","独立内容角色核代表材料核心英文及邻近中文、教学/反馈/按钮中文。","不把代表材料通过外推任意未来材料；无当前待修项。"],
 C07:["PASS_BOUNDED_NO_ACTIVE_GAP","主题术语映射、正文/交互/导出及三组区别对照有证。","通用语义不是词面检查可自动证明；新材料出现才逐主张核对。"],
 C08:["PASS_SYNTHETIC_NATIVE_CLARIFICATION_DEFERRED","合成任务Audience/Task/Goals/范围/判准明确、实际读取原件。","真实澄清完整窗口D01，复杂/缺失材料工具工程D05分开恢复。"],
 C09:["PASS_BOUNDED_EXTENSIONS_CONDITIONAL","独立Markdown/条件例外/来源、已声明子集和不支持结构负例、原失败修复留证。","D05可做有限材料扩展；不自动承诺全Markdown。"],
 C10:["PASS_BOUNDED_EXTENSIONS_CONDITIONAL","四组合/分类/条件/日期/完成关系独立对照原件。","D05可核新增冲突/结构反例，不泛化现实馆规。"],
 C11:["PASS_BOUNDED_VISUAL_EXTENSIONS_OPEN","真实浏览器12项反馈/改答失效/重核/重置/复制导出与静态路径。","D04/D05中的键盘触控/全部状态与扩展异常未全面覆盖。"],
 C12:["PASS_CORE_DEFERRED_NONCORE_SCOPE","同7文件交接包真实Sites私有保存/部署/回读，核心已交付并被限定接受。","D03第二客户端和D04托管页扩大矩阵可后移；旧受保护merge待办不是当前状态。"],
 C13:["PARTIAL_EVALUATION_OWNER_REMAINDER","工程/体验/效果记录与失败修复重跑、Owner核心接受已记录。","D05扩展工程/体验和D07最终范围；效果仅N02，非必须真人工程验收。"],
 C14:["PARTIAL_NATIVE_LIFECYCLE_DEFERRED","严格待答合同/网页未选实测，当前核心接受有真实答复。","D01未测宿主完整生命周期；不得把这一次答复当全窗口通过。"],
 C15:["PASS_BOUNDED_NO_ACTIVE_GAP","四工具实际执行、复制真实状态/故障注入恢复、实际checker和平台CI有证；旧FAIL保留。","当前无未解决工具缺陷已证；网页扩大范围归D04/D05。"],
 C16:["PASS_EXPLICIT_EXCLUSIONS_RETAINED","去教材/个人路径/Site绑定、UTF8路径/子集负例、来源许可声明有证；未迁延期工具符合范围。","N01明确不迁内容不是待办；新产品需求另定，不能自动vendor化。"],
 C17:["PASS_INITIAL_VISUAL_FULLER_AUDIT_DEFERRED","暖白陶土、本地字体、两初始viewport/禁JS可读及实际静态/几何检查。","D04有界更完整视觉/语义/键盘/打印/减少动效可立即准备执行；不称完整认证。"],
 C18:["PASS_BOUNDED_NO_ACTIVE_GAP","三输入/七输出manifest、有界材料/术语/目标/来源/判准、QA/导出在包外；与Sites同包核对。","仅新材料/组件或来源变更才更新，不需额外产物填数。"],
 C19:["PASS_DEPLOYED_RECOVERY_OBSERVATION_OPEN","同Site版本1/源码ffaaa/部署succeeded/private受众已多次原生回读；Core accepted limited。","D06风险相称的当前观测/离线恢复可推进；无须无故重部署或扩大受众。"],
 C20:["PASS_OWN_MARKETPLACE_DEFERRED_CLIENT_ENTRY","自有Marketplace实际安装native两入口、当前桌面手动安装locator→Sites主流程。","D02原生菜单、D03第二客户端；N03公共目录资格不在本范围。"],
 C21:["PASS_PROVENANCE_RECORDS_BOUNDED_REVIEW","严格provenance必填/路径/版本/hash/notice及包闭包有记录，consumer核代表包来源字节。","可自主复核全部登记项的一致性；consumer未裁决全部许可不是已证缺陷，法律裁决不擅扩。"],
 C22:["DELIVERED_VERSION_PREP_COMPLETE","实现275/276/277、发布278、记录279、同步280、预升281和记录282均结束；actual908维护范围新验通过。","8.3.3未发布是N05目标状态，不重开发布/旧PR待办。"],
 C23:["TECHNICAL_CORE_DELIVERED_HISTORICAL_APPROVAL_NOT_MET","A1–A3和A4工程有可追溯运行/候选/actual身份；actual282文档171/strict/CLI实跑，Owner只接受核心。","H01原审批门槛未满足历史不可倒补；当前无活动PR，不为补历史凭空建PR。"],
 C24:["OWNER_CORE_ACCEPTED_LIMITED_FULL_INSPECTION_NOT_PROVIDED","owner-core-acceptance282真实答复与Issue读回：ACCEPTED_LIMITED。","D07残余技术体检Agent承担，真实Owner访站/检查过程未证，完整原计划最终接受NOT_PROVIDED；不重复问核心。"],
 C25:["MAINTENANCE_RECORDED_REMAINDER_OPEN","唯一REPORT含既有事实；282后实际908/Owner新事实由当前Issue+外部不可变回执接续，非缺一个新文档PR。","D06/D07恢复观测与剩余接受分记；效果N02；按既定规则不递归纯证据PR。"],
 P01:["EXECUTION_PRINCIPLE_RETAINED_CORE_OWNER_DECISION_PRESENT","Agent已承担工程全流程；Owner已作限定核心接受。","D07余下实质范围接受留Owner，常规技术体检不转嫁真人。"],
 P02:["PASS_BOUNDED_SYNTHETIC_ROLES","实际独立内容/消费者/标准/恢复probe角色及可复现原件，非GitHub批准或Owner。","D04/D05/D06独立工程合成可由Agent继续，不以缺真人阻断；真实学习者效果另属N02。"],
 P03:["PARTIAL_STRICT_WINDOW_DEFERRED","未选网页状态/严格待答规则、核心与延期分别交付。","D01/D03未实测部分仍延期非PASS，不能默认答复。"],
 P04:["AUTHORIZATION_REUSED_WITHIN_BOUNDARY","原五边界及续办授权复用；本次盘点/可自治工程准备不新增Owner决定。","涉及D01–D03重启限制或其他实质越界时仅停依赖；不用程序性询问阻塞本地工程。"],
 P05:["EVIDENCE_COMPLETE_FOR_DELIVERED_SCOPE_HISTORY_RETAINED","旧FAIL/勘误、候选CI、新actual629十三与actual908文档171检查分批登记；source1417及前缀原件完整。","H01历史批准保留；本轮盘点不是新增runtime/model/desktop/Sites通过，不重复大测自证。"],
 P06:["PARTIAL_PROPORTIONATE_RECOVERY_OPEN","独立输出、同Site/private版本回读、停止/前向修复/受保护回退安排。","D06完整恢复演练/持续监控没有证据；先可自治离线恢复和一次只读观测，不默认后台自动化。"],
 P07:["TOPOLOGY_AND_BOUNDED_CLOSEOUT_COMPLETE","单Issue/原主子PR及后续维护拓扑均已交付，282后无活动主PR；外部回执+Issue按既定收尾。","有真实新修复才开同Issue一个活动主PR并守保护；不强制再三PR，不补认历史批准。"],
};
const decisionMap=new Map(decisions.map(x=>[x.id,x]));
const acceptance=rows.map(row=>{
 const entry=specific[row.id];if(!entry)throw Error("Missing "+row.id);
 const relevant=deferrals.filter(x=>x.acceptanceIds.includes(row.id));
 const ownerRefs=[...new Set(relevant.flatMap(x=>x.ownerDecisionRefs))];
 return {...row,status:entry[0],coveredEvidence:[entry[1],{reportRowSnapshot:row.reportRow,scope:"Evidence linked in the fixed REPORT row remains at its original source/version; latest Issue/Owner facts supersede stale current labels only."}],remaining:entry[2],deferralIds:relevant.map(x=>x.id),exclusionOrHistoryIds:exclusions.filter(x=>x.acceptanceIds.includes(row.id)).map(x=>x.id),executableRecoveryConditions:relevant.length?relevant.flatMap(x=>x.recoverWhen):["仅实际输入/运行/合同变化或新失败时复验受影响部分；保持原有限范围"],missingConditionsNow:relevant.length?relevant.flatMap(x=>x.missingNow):["无已证当前必需缺口；有限通过不作普遍外推"],agentCanDo:relevant.length?[...new Set(relevant.flatMap(x=>x.agentCanDoNow))]:["保持证据与版本边界；不为已完成项重复构建/重测或要求Owner程序性批准"],ownerDecision:{neededImmediately:false,refs:ownerRefs,statement:ownerRefs.length?"只在相应触发条件下处理实质范围/最终接受；不阻塞已可自治的技术部分。":"无新的必要Owner决定；不为常规工程选择制造两三个选项。",options:ownerRefs.flatMap(id=>decisionMap.get(id).options.map(o=>({decision:id,...o})))}};
});
const result={
 schemaVersion:1,reviewId:"html-learning-274-deferrals-contract-908",reviewedAt:new Date().toISOString(),role:"Independent read-only contract/deferral reviewer; no new execution/acceptance/approval",
 current:{actual:head,tree:manifest.tree,issue:issue.url,issueState:issue.state,issueUpdatedAt:issue.updatedAt,issueBodySha256:manifest.issue.bodySha256,ownerCoreAcceptance:"ACCEPTED_LIMITED",ownerActualInspectionEvidence:"NOT_PROVIDED",entirePlanFinalOwnerAcceptance:"NOT_PROVIDED",entirePlan:"NOT_COMPLETE",historicalApproval:"NOT_MET",effect:"NOT_MEASURED",marketplacePrepared:"8.3.3/unpublished",public:"8.3.2/f906/HTML0.1.37/site",activeMainPR:"NONE per current Issue"},
 authorityOrder:["Original plan§1–13 + seven principles + canonical accepted baseline define criteria","Current Issue274 and owner-core-acceptance282 supply post282/Owner facts","Existing PLAN/REPORT retain older facts; do not read historical unmerged PR/publish pending as current","No retrospective regrading of original FAIL or protected approval"],
 ownerSource:{manifestSha256:manifest.owner.manifestSha256,allEightPayloadHashesVerified:true,decisionSha256:sha(fs.readFileSync(path.join(directory,"inputs/owner-owner-decision.json"))),exactAnswer:owner.answer,actualMessageTime:"UNKNOWN",actualMessageId:"UNKNOWN",capturedAt:owner.capturedAt,scope:owner.acceptedScope,notImplied:["Owner actually visited or tested Site","Full-plan acceptance","Deferred checks PASS","Learning effects measured","Retrospective protected approval","New product requirement, public audience, or future bypass permission"]},
 scope:"Only TEMP JSON/Markdown/method/source snapshots. No repo/remote mutation, no outbound messages, no browser/model/desktop/Python/runtime test or Site call. Current Issue read-only fetched with gh.",
 summary:{acceptedMappingCount:32,criteriaChanged:false,originalSectionsReviewed:13,deferralGroups:7,immediatelyRequiredOwnerAnswers:0,readyAgentGroups:["D04 local bounded web/a11y subset","D05 local high-impact synthetic material/exception subset","D06 offline recovery and conditional same-Site readonly observation"],blockedClientGroups:["D01","D02","D03"],eventualOwnerGroup:"D07",notScopeOrNotRepairable:exclusions.map(x=>x.id)},
 capabilityEvidence:capabilities,acceptance,deferrals,ownerDecisionCards:decisions,exclusions,
 proposedAutonomousSequence:[
 {order:1,ids:["D04"],action:"冻结同一7文件制品与当前包资源身份；先有界本地网页语义/键盘/焦点/状态/缩放/屏宽/减少动效/打印检查，独立看图与来源核验。",limit:"不重启模型或桌面客户端，不称真实手机/读屏器/全认证；无新失败不改runtime。"},
 {order:2,ids:["D05"],action:"基于明确合成原件准备少量高影响冲突/缺失/长文本/不支持结构反例；用本地工具/真实网页工程和独立角色核判准。",limit:"不把合成馆规当现实规则；不自动加入新功能、工具或大规模模型矩阵。"},
 {order:3,ids:["D06"],action:"独立目录演练恢复已知良好7文件包并核完整hash；当前工具和权限可用时一次只读回读同Site/version/access。",limit:"不为演练生产回滚/新建/部署；不创建周期监控或修改受众。"},
 {order:4,ids:["D01","D02","D03"],action:"列真实入口/版本/事件缺口；能力和既有执行边界满足前保延期。",limit:"不能用browser/CLI填另一个客户端、不能以Owner授权代替缺失native技术能力。"},
 {order:5,ids:["D07"],action:"完成可自治部分后只向Owner集中提供成品结果和必要范围/最终接受决定；既有核心接受保持。",limit:"独立合成不需真人；如另提理解效果研究才触发O03真实人群决定。"}
 ],
 maintenanceRule:"This inventory is not a second PLAN/REPORT or new criteria. No new substantive diff means no recursive evidence-only PR. New genuine defects/restoration implementations stay Issue274, one active protected main PR, and current real approval/CI/A6/thread requirements.",
 methodology:{capture:"capture-method.mjs",assessment:"assessment-method.mjs",inputManifest:"input-manifest.json",supplements,checks:["exact32 stable IDs once each and original criterion copied unchanged","original13 sections read","currentIssue body exact hash matches Owner readback","Owner manifest8 payload hashes validated","all local source snapshot hashes and repository HEAD rechecked before output"],limits:["No independent re-execution of historical1417-source or runtime test suites in this inventory","Current local binary presence and available tool names do not prove authenticated Site access or a runnable second client","No human participant/Owner inspection execution inferred","No actual new deferred checks performed by this read-only assignment"]},
};
const originalIds=rows.map(x=>x.id).sort();
if(JSON.stringify(acceptance.map(x=>x.id).sort())!==JSON.stringify(originalIds)||acceptance.length!==32)throw Error("32 mapping identity changed");
for(const source of manifest.local){const raw=fs.readFileSync(path.join(repository,source.source));if(sha(raw)!==source.sha256)throw Error("Repository source changed: "+source.source);}
const md=[
 "# Issue274 剩余延期与恢复条件独立盘点","",
 "审查actual908d2953 / tree9d4926；只读Issue于"+manifest.capturedAt+"捕获，当前OPEN。核心ACCEPTED_LIMITED；完整原计划NOT_COMPLETE、最终接受NOT_PROVIDED；历史批准NOT_MET，理解效果NOT_MEASURED。","",
 "32条原判准及§1–13已完整映射，判准未改。既有PLAN/REPORT未回写282/Owner新事实时，以当前Issue和owner-core-acceptance282为事实来源。当前无活动主PR；已完成发布/记录/同步/预升/维护不重开。","",
 "没有立即必须Owner回答、才能继续工程的问题。Agent可先做D04/D05/D06的有界工程部分。D01–D03缺真实宿主能力与既有执行边界条件，不能以浏览器/CLI替代。独立工程合成不需真人；真实理解效果研究才需真实学习者。","",
 "## 已可自主恢复与暂缺条件","",
 ...deferrals.flatMap(d=>[
 "### "+d.id+" "+d.name,"","接受映射："+d.acceptanceIds.join(", ")+"。状态："+d.readiness+"。","",
 "原判准："+d.originalCriterion,"","已覆盖："+d.coveredEvidence.join("；")+"。","",
 "剩余："+d.remaining,"","恢复条件："+d.recoverWhen.join("；")+"。","",
 "当前缺条件："+d.missingNow.join("；")+"。","",
 "Agent可做："+d.agentCanDoNow.join("；")+"。","",
 "真正Owner决定："+(d.ownerDecisionRefs.length?d.ownerDecisionRefs.join(", ")+"（仅触发时，不要求现在重复接受核心）":"无新的必要决定，常规技术选择自主处理。"),""
 ]),
 "## 32项完整映射","",
 "| ID | 原判准 | 当前独立结论 | 剩余/恢复入口 |","|---|---|---|---|",
 ...acceptance.map(x=>"| "+x.id+" | "+x.criterion.replaceAll("|","/")+" | "+x.status+"："+specific[x.id][1]+" | "+x.remaining+" "+x.deferralIds.join(",")+" |"),"",
 "每项完整字段（原来源/范围/判准/原REPORT行、已覆盖证据、可执行恢复条件、当前缺条件、Agent动作及真正Owner选项）见assessment.json；无Owner决定的条目明确无，未为形式凑选项。","",
 "## 集中Owner实质决定（仅条件触发，不阻已可自治工作）","",
 ...decisions.flatMap(d=>["### "+d.id+" "+d.title,"","触发："+d.trigger,"","问题："+d.question,"",...d.options.map(o=>"- "+(o.recommended?"推荐：":"")+o.text+" "+o.impact),""]),
 "## 不自动扩大的事项与历史缺口","",
 ...exclusions.map(x=>"- "+x.id+"："+x.text),"",
 "Owner已真实限定接受核心；没有实际访站/体检过程证据，不能倒填。成品技术体检由Agent承担，Owner只作必要范围/接受决定。完整原计划接受未给不等于核心未接受。","",
 "所有原FAIL、UNKNOWN和批准缺口保留；后续代码问题才走正常同Issue保护PR，不为本只读清单或已结束记录再开递归纯证据PR。","",
 "本轮未执行新的网页/客户端/效果/恢复验收，任何READY只表示授权与技术准备条件可推进，绝不表示延期通过。","",
 "## 可追溯方法与限制","",
 "capture-method.mjs保存只读gh方法、actual身份、10份合同快照及Owner8原件核验；assessment-method.mjs生成本盘点。input-manifest.json和final-manifest.json核本次原件。当前Issue正文SHA256："+manifest.issue.bodySha256+"；Owner外部manifest SHA256："+manifest.owner.manifestSha256+"。","",
 "未重跑历史1417来源/大测；未调用模型、桌面、浏览器或Sites，未编辑仓库或远端。软件/浏览器文件存在不替实际执行，Site工具名称不替认证可用，真实人群效果不能由角色模拟替代。",""
].join("\n");
fs.writeFileSync(path.join(directory,"assessment.json"),JSON.stringify(result,null,2)+"\n",{flag:"wx"});
fs.writeFileSync(path.join(directory,"assessment.md"),md,{flag:"wx"});
const files=fs.readdirSync(directory,{recursive:true}).filter(file=>fs.statSync(path.join(directory,file)).isFile()).sort().map(file=>{const bytes=fs.readFileSync(path.join(directory,file));return{file:file.replaceAll("\\","/"),bytes:bytes.length,sha256:sha(bytes)};});
fs.writeFileSync(path.join(directory,"final-manifest.json"),JSON.stringify({schemaVersion:1,frozenAt:new Date().toISOString(),reviewId:result.reviewId,files},null,2)+"\n",{flag:"wx"});
console.log(JSON.stringify({directory,acceptance:acceptance.length,deferrals:deferrals.length,ownerImmediate:0,files:files.length,assessmentSha256:sha(fs.readFileSync(path.join(directory,"assessment.json"))),markdownSha256:sha(fs.readFileSync(path.join(directory,"assessment.md"))),manifestSha256:sha(fs.readFileSync(path.join(directory,"final-manifest.json")))}));
