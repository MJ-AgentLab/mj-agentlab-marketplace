import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root='C:/Users/Admin/.codex/worktrees/html-learning-artifact/develop';
function edit(name,changes){const p=path.join(root,name),old=fs.readFileSync(p,'utf8'),nl=old.includes('\r\n')?'\r\n':'\n';let s=old.replaceAll('\r\n','\n');for(const [a,b]of changes){assert(s.includes(a),a);s=s.replace(a,b);}fs.writeFileSync(p,s.replaceAll('\n',nl));}
const current=`### Current record merge and synchronization

Owner续办“#279 PR 已合并，继续后续工作”，[直接请求与捕获](./evidence/sources/postmerge/record279/continuation/capture-metadata.json)只承接同一#274/P5操作授权，消息身份/时间未知，不推定最终接受或新bypass授权。记录PR [#279](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/pull/279)已于2026-10-19T15:17:09Z实际合入main e3dc40f734fc972e05956da3e908091e09963675，tree ae121f6b256d1a44ea05a06061ba025b605655d9 与已测head315b5942及实际CI checkout687b70ab相同，parents为f906+315。默认公开安装指引v8.3.2/site已实际交付。当前main e3dc与发布身份分开：v8.3.2 tag/Release仍为原f906，不因文档记录merge改绑。

[实际合入与规则审计](./evidence/sources/postmerge/record279/audit/summary.json)保存真实main suite4602541728，匹配beforef906/aftere3dc，result=bypass；pull_request FAIL（缺最新推送者之外的批准），required_status_checks及其他规则PASS，reviews=[]，保护批准仍NOT_MET。不把Owner实际合入、技术PASS或同树当批准，也不作为后续sync/prebump例外。

[279精确head新CI原件/方法](./evidence/sources/postmerge/record279/ci/final-manifest.json)记run39272665913成功：Linux641/642（唯一Windows专用skip）、Windows642/642零skip，各13安装/178命令全0、6Diagram18LEK实际Python、4site生成/4静态各89/89，四browser工程case各未skip，source/cache资源一致。push39272636618成功只列真实状态，不另计独立验收；16个清理名称匹配TAP用例通过、默认smoke正常返回，但本CI逐根absence未记录，不能借发布后f906的15根证据。72原件摘要和final-manifest原字节已冻结；此前372来源及失败保持，新增原件按各自时点绑定。

实际e3dc的新十三安装于15:18:57.732Z启动，当前RUNNING；真实终态、Python、资源及15根清理结果待回执，不借315/687 CI或f906旧计数。该批不运行新model/desktop/browser验收。

本轮同步分支codex/sync-main-8-3-2从完整actual main e3dc派生，保留279及所有原main ancestry；目标develop65d已是e3dc祖先，普通同步无runtime冲突。同步PR当前PREPARING，实际develop merge及其独立新复验仍待，编号不预造。当前候选保留VERSION8.3.2、公开安装ref v8.3.2、五包版本与guide原字节；最终head/base、严格CI/A6、一个真实非作者/最新推送批准及线程按新PR实际回读，Agent不bypass。只有实际sync交付并新验后，才DryRun→Apply仅市场8.3.3 VERSION/badge/正常根AGENTS预升，不改插件、不建同号tag/Release。

私有代表Site保留原身份、保存版本1及受众，本轮未部署或扩大权限。原生窗口/第二客户端等延期非PASS，理解效果NOT_MEASURED；核心交付、正式公开、维护闭环、全计划和Owner最终接受分记，#274保持开放。

### Historical publication and record-preparation snapshot

下文为#278公开后、#279尚待合入时的原快照。当前记录合入、main与tag身份及后续依赖以上节为准，不把当时待办视作当前状态。
`;
edit('plans/274-html-learning-artifact/[REPORT]_HTML_Learning_Artifact.md',[
 ['version: v1.6','version: v1.7'],
 ['## Current conclusion and remaining gaps\n','## Current conclusion and remaining gaps\n\n'+current],
 ['本表引用其稳定条目，不另造需求，当前状态已接续实际275/278合入和v8.3.2公开。','本表引用其稳定条目，不另造需求，当前状态已接续实际275/278/279合入和v8.3.2公开。'],
 ['275/278已实际合入、v8.3.2已公开并新验','275/278/279已实际合入、v8.3.2已公开并新验'],
 ['| C22 | 主PR275/子PR276/277及发布PR278已实际合入，v8.3.2交付HTML0.1.37；其他包版本/guide保持 | 开发拓扑及公开已执行；275/278实际Owner bypass及reviews=[]保留，记录/sync/prebump依真实前序推进 |','| C22 | 主PR275/子PR276/277、发布PR278及记录PR279已实际合入，v8.3.2交付HTML0.1.37；其他包/guide保持 | 开发/公开/记录已交付；275/278/279批准NOT_MET与bypass保持；完整main同步PREPARING，8.3.3依赖actualsync新验 |'],
 ['A4整体仍NOT_MET：275/278保护批准缺项','A4整体仍NOT_MET：275/278/279保护批准缺项'],
 ['| C25 | 本REPORT已接回实际main/tag/Release、双系统CI/真实tag新验与Site原生只读状态 | 有界交付报告已更新；后续维护实际合入、成品体检/最终接受及延期另待证 |','| C25 | 本REPORT已接回实际发布、279同树合入、新CI与main/tag不同当前身份；e3dc新验终态据实际回执追加 | 有界交付/记录已交付；actualsync及预升、成品体检/最终接受和延期另待证 |'],
 ['最终双系统CI、275/278实际合入和公开后新13安装分别留证','最终双系统CI、275/278/279实际合入和公开后新13安装分批留证'],
 ['278→main发布及实际规则/CI留证 | 单Issue/主子PR拓扑已执行；内部reviews[]与实际275/278 bypass','278发布/279记录→main均实际合入及规则/CI留证 | 单Issue/主子PR及维护拓扑已执行；内部reviews[]与实际275/278/279 bypass']
]);
edit('plans/274-html-learning-artifact/[PLAN]_HTML_Learning_Artifact.md',[
 ['version: v1.5','version: v1.6'],
 ['275开发与278正式8.3.2已交付；Owner接受未完','275开发/278正式8.3.2/279记录已交付；Owner接受未完'],
 ['278已正式发布8.3.2；维护收尾进行中，原批准NOT_MET','278已正式发布8.3.2、279记录已合e3dc；完整main同步准备中、8.3.3仍依赖，原批准NOT_MET'],
 ['develop/main已合入且8.3.2公开；A4批准NOT_MET','develop/main/279记录已合入且8.3.2公开；A4批准NOT_MET'],
 ['唯一REPORT已记实际公开/版本/URL；post-tag独立新验13/178/Python/15清理已通过，最终接受未给','唯一REPORT已记实际公开/版本/URL、279CI/实际合入与e3dc新验；原tag13/178/Python/15清理已通过，最终接受未给'],
 ['内部技术PASS：本机642/双系统CI各13安装；275实际同已测tree，批准NOT_MET','工程有据：本机642/双系统CI各13安装；275/278/279分批实际同树，批准NOT_MET'],
 ['拓扑已交付：275→develop、276/277→集成；275批准NOT_MET，未追认','拓扑已交付：275→develop、276/277→集成，278发布/279记录→main；原批准NOT_MET，未追认'],
 ['## Current publication continuation','## Current development synchronization\n\nOwner本轮“#279 PR 已合并，继续后续工作”的[原话/捕获](./evidence/sources/postmerge/record279/continuation/capture-metadata.json)延续原P5五边界授权，不新增Owner接受或bypass决定。实际记录PR279于15:17:09Z合入main e3dc40f734fc972e05956da3e908091e09963675/treeae121f6b，同已测315/687，parents为f906+315；导航/公开记录已交付。发布tag/Release仍f906，当前main记录merge e3dc另记；真实suite4602541728 bypass/reviews[]/批准NOT_MET保原结果。actuale3dc新13安装于15:18:57.732Z启动、终态回唯一REPORT，不借旧结果。\n\nAgent已从完整actualmain e3dc派生codex/sync-main-8-3-2，准备向受保护develop65d同步；保留全部main ancestry，当前VERSION8.3.2与插件原版本不变。新head必要Harness/CI/A6、真实非作者/最新推送批准、线程和latestbase均按实际新PR核；Agent不bypass。只有actualsync合入及新复验后才仅市场8.3.3先DryRun后Apply，不建发行；本轮未执行预升。延期/Owner最终接受/NOT_MEASURED独立，进度仍以同一Issue274为准。这是既有P5技术排程，不把历史8.3.1的三PR模式追加为Owner决定。\n\n## Historical publication continuation'],
 ['actual main/tag/Release均f906b100/tree6e4bc9cc，8.3.2已于14:30:16Z公开','本段为#278续办时点快照：当时actual main/tag/Release均f906b100/tree6e4bc9cc，8.3.2已于14:30:16Z公开']
]);
edit('plans/274-html-learning-artifact/INDEX.md',[
 ['version: v1.4','version: v1.5'],
 ['2026-10-19：#278已合入实际main','2026-10-19续办：#279已于15:17:09Z合入main e3dc40f7/treeae121f6b，同已测315/687；发布tag/Release仍f906，默认安装v8.3.2/site导航已交付。真实批准NOT_MET/Owner bypass保留。当前准备完整main→develop同步PR，actualsync新验后才仅市场8.3.3DryRun/Apply；原生/第二客户端延期、Owner接受及NOT_MEASURED独立。实际e3dc新13验终态见唯一REPORT，进度以Issue274为准。\n\n下段为上轮发布记录准备快照，后续279已合入，当前以上段为准。\n\n2026-10-19：#278已合入实际main']
]);
edit('README.md',[
 ['当前记录分支保持8.3.2；包含本记录实际merge的完整main同步并复验后，才准备仅市场8.3.3预升','记录PR279已合入main e3dc40f7；当前同步候选完整继承该main，保持8.3.2。实际同步合入并新复验后，才准备仅市场8.3.3预升']
]);
edit('AGENTS.md',[
 ['HTML0.1.37/site已随#278/v8.3.2公开，guide原字节保持；[任务274](plans/274-html-learning-artifact/INDEX.md)承接记录→实际main同步→仅市场8.3.3预升。新PR真实门禁保持；原生/第二客户端延期、Owner接受独立。','HTML0.1.37/site随#278/v8.3.2公开，guide原字节保持。#279记录已合maine3dc40f7/同已测tree；[任务274](plans/274-html-learning-artifact/INDEX.md)现同步完整main→develop，实际sync新验后才仅市场8.3.3预升。原批准NOT_MET/bypass保留，新PR真实门禁保持；延期/Owner接受独立。']
]);
edit('CHANGELOG.md',[
 ['### Documentation\n','### Documentation\n\n- Synchronize complete actual main e3dc40f7, including merged publication-record PR279, back into develop. Preserve v8.3.2 runtime/plugin identities and public tag f906, freeze exact record-candidate CI and actual-merge audit evidence, and keep actual synchronization verification and marketplace-only 8.3.3 preparation dependent. Retain approval NOT_MET, original failures, deferred entries and Owner-acceptance boundaries. Refs #274.\n']
]);
console.log('Updated current sync task/coverage and root navigation; original snapshots/runtime/version untouched.');
