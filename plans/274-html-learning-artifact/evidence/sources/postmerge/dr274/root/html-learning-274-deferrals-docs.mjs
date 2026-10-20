import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root='C:/Users/Admin/.codex/worktrees/html-learning-artifact/develop';
function edit(name, fn) { const p=path.join(root,name), bytes=fs.readFileSync(p), raw=bytes.toString('utf8'), crlf=raw.includes('\r\n'); const result=fn(raw.replace(/\r\n/g,'\n')); fs.writeFileSync(p,result.replace(/\n/g,crlf?'\r\n':'\n')); }
function after(s, needle, addition) { assert(s.includes(needle),needle); return s.replace(needle,needle+addition); }
const current='2026-10-20：#282已合入develop908d2953；Owner已明确接受当前交付核心并保留全部延期/历史缺口（ACCEPTED_LIMITED），完整计划仍OPEN。本轮按同一五边界自主恢复可执行工程项，新发现边界对比度与输出许可缺件，准备HTML0.1.38修复候选；公开仍v8.3.2/HTML0.1.37，市场8.3.3未发布。原生窗口/原生派发/第二客户端仍延期，历史FAIL/UNKNOWN/bypass及批准NOT_MET不追认。';
edit('plans/274-html-learning-artifact/INDEX.md',s=>after(s.replace('version: v1.8','version: v1.9'),'[#274](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/274) 是进度正本。','\n\n'+current+' 可自治检查、各延期恢复条件及真实新修复由同一[PLAN](./[PLAN]_HTML_Learning_Artifact.md#deferral-recovery-batch)和[REPORT](./[REPORT]_HTML_Learning_Artifact.md#deferral-recovery-results)接续；下方维护段按其历史日期读取。'));
const planSection=`
## Deferral recovery batch

Owner本轮直接请求：“梳理 #274 剩余延期事项及恢复条件，已具备条件的继续自主推进，只把确需我作实质决定的事项集中列出。”准确消息ID/时间未知，捕获时间独立记录。复用同一五边界和32项完整接受基线，不新建INTENT/主PLAN、不重新请求已授工程权限。Owner真实回复“接受当前已交付核心，保留全部延期与历史缺口（推荐）”，故核心为ACCEPTED_LIMITED；不推定Owner实际访站或完整计划接受。

当前基准为已合入#282的develop908d29537a19ceca166e8f3c7cddef4d419781a4。原批次无新实质差异不递归建纯证据PR的规则继续有效；本次实际发现两项产品问题及路径别名问题，允许在同一Issue新开一个修复主PR→受保护develop，原子包含实现、Harness及相关文档。无子任务需要独立PR，保护批准不得由Agent合成审查替代。仅HTML0.1.37→0.1.38候选；市场8.3.3仍未发布，其他包及guide运行不变。

有序执行：①只读合同/客户端能力/来源许可盘点；②隔离浏览器与材料负例、只读同Site观测、离线恢复；③保留实际失败，修正输入框可辨边界和生成资产许可传递；④独立角色复验、完整本机/严格/13安装/实际Python、来源闭包；⑤提交/推送/同Issue主PR及CI，真实批准后才按保护合入。发布与Site前向更新另按实际候选、同身份/受众和发布控制，不因本地修复直接宣称公开交付。

| 延期 | 当前可自治动作与恢复条件 | 剩余边界/责任 |
|---|---|---|
| D01 原生待答窗口生命周期 | 获得可观测原生持续显示、空返回、超时、关闭事件后，才恢复对应实际客户端用例 | 当前无原生控制/事件观测能力，且保留不重启模型/桌面测试限制；Agent负责技术准备，必要答案仍严格待答，HTML/CLI不替代 |
| D02 桌面技能菜单/派发 | 真实安装、菜单发现/热加载及派发事件可观察，且该批客户端测试限制已明确解除后恢复 | 手动安装locator→Sites已有限通过，不等于原生派发；不转交Owner做常规技术QA |
| D03 第二真实目标客户端 | 独立受支持客户端、安装来源/版本与完整动作事件均可用后恢复 | Chrome/Edge、视口、CLI或同应用另一入口不充当第二客户端；Agent执行 |
| D04 扩展视觉/可访问性 | 本轮可先做真实隔离浏览器的视口、语义、键盘、减少动效、打印等限定检查，发现问题自主修复 | 真正浏览器UI缩放、真实辅助技术/触控设备、全面WCAG及托管页完整矩阵未全测，不称认证 |
| D05 材料/异常扩展 | 本轮可做长中英/表格/特殊文件名，以及不支持结构、重复键、缺材料、禁词等零写负例 | 冲突/缺口的模型语义扩展需实际新材料/判准和客户端条件；工具结果不代语义或效果 |
| D06 恢复/观测 | 冻结已知良好包、离线损坏/拒覆写/备份恢复、同Site身份版本受众只读核对可自主执行 | 实际生产回滚仅必要故障/专门有界场景再执行；未请求周期监控，不创建后台自动化 |
| D07 残余范围/最终接受 | Agent先完成可自治体检及修复；D01–D03具备条件后继续 | 已接受核心不重问，完整计划尚未接受；只有要求提前终结、改范围或另开效果研究时才需Owner实质决定 |

C21来源/许可记录本轮自主复核，发现生成器传递资产却缺许可文本，修复为输出MIT原LICENSE、Apache原文及带范围说明/原notice完整尾部的THIRD_PARTY_NOTICES；不把输入材料改授权，不作研究资料完整法律裁决。生成/安装字节核验与通用checker自洽校验分开：同步改写manifest可使后者仍通过，不能证明许可真实性。新增保留输出名及跨平台文件名约束在首写前执行，负例不创建输出。

当前没有阻断上述工作的Owner决定。恢复原生/第二客户端若需改变既有限制、提前结束完整计划或新增真实学习效果研究，才集中提交有理由选项；授权不能替代缺失技术能力。公共目录上架、延期HTMLPlan/Birch运行组件和效果研究是首版明确排除项，不自动纳入剩余实施。实际结果仅见唯一REPORT；延期不得写通过。
`;
edit('plans/274-html-learning-artifact/[PLAN]_HTML_Learning_Artifact.md',s=>{
 const before=s.split('\n').filter(x=>/^\| (?:C\d|P\d)/.test(x)).map(x=>x.split('|').slice(1,6).join('|'));
 s=after(s.replace('version: v1.9','version: v1.10'),'## Goal, scope and intake', '');
 s=s.replace('## Goal, scope and intake',planSection+'\n## Goal, scope and intake');
 const results={C01:'核心ACCEPTED_LIMITED；完整计划OPEN；本轮修复与延期见[REPORT](./[REPORT]_HTML_Learning_Artifact.md#deferral-recovery-results)',C17:'原边界对比2.357/2.483 FAIL；0.1.38候选修复/独立有界浏览器复验，全面可访问性仍延期；[REPORT](./[REPORT]_HTML_Learning_Artifact.md#deferral-recovery-results)',C21:'原生成缺许可已证FAIL，0.1.38候选补传递/安装核验；研究资料权利UNKNOWN及checker自洽边界保留；[REPORT](./[REPORT]_HTML_Learning_Artifact.md#deferral-recovery-results)',C24:'Owner已真实限定接受核心；未推定实际体检/完整计划接受；本轮技术体检Agent承担；[REPORT](./[REPORT]_HTML_Learning_Artifact.md#deferral-recovery-results)',C25:'actual282/Owner接受/本轮新恢复分记，效果NOT_MEASURED；[REPORT](./[REPORT]_HTML_Learning_Artifact.md#deferral-recovery-results)',P06:'离线5步恢复与同Site只读观察已运行；生产回滚/周期监控NOT_RUN；[REPORT](./[REPORT]_HTML_Learning_Artifact.md#deferral-recovery-results)',P07:'原批次结束，新实质缺陷修复同Issue一个主PR→develop；保护批准不替代；[REPORT](./[REPORT]_HTML_Learning_Artifact.md#deferral-recovery-results)'};
 s=s.split('\n').map(line=>{const m=line.match(/^\| (C\d+|P\d+) \/ /);if(!m||!results[m[1]])return line;const cols=line.split('|');cols[6]=' '+results[m[1]]+' ';return cols.join('|');}).join('\n');
 assert.deepEqual(s.split('\n').filter(x=>/^\| (?:C\d|P\d)/.test(x)).map(x=>x.split('|').slice(1,6).join('|')),before);return s;
});
const reportSection=`
## Deferral recovery results

${current}

本轮为实际新缺陷修复，非补历史批准或递归纯证据PR。候选工作树与actual908/公开f906身份分别记录；以下新测试不冒称已在公开0.1.37或真实托管Site执行。既有1417来源前缀/原件及32项基线前五列保持；新证据选择性接回，不公开权利未知研究原件。

- **D04发现与修复**：独立隔离浏览器16例为14PASS/1FAIL/1NOT_RUN。原空白反思输入框边界#aba492对纸背景2.3570979971820427:1、对白2.483198873838037:1，未达适用控件可辨边界3:1。候选仅该边界改#767676，独立Chrome147在320/390/1366截图像素及computed style核实，对纸4.311563390203977:1、对白4.542224959605253:1；真实键盘选择/核对/改答失效/输入聚焦及复制拒绝Escape回焦通过。截图逐张实看。真实浏览器UI缩放尝试未生效，记NOT_RUN；没有宣称完整WCAG/辅助技术/真实触控或全托管页通过。依据[WCAG22 SC1.4.11](https://www.w3.org/TR/WCAG22/#non-text-contrast)。
- **C21发现与修复**：登记研究与固定上游版本/哈希及Apache原文一致；研究资料再分发权利未识别，保持UNKNOWN，不据MIT包推定许可。原生成器复制CSS/JS却遗漏许可输出，已证FAIL。候选新增LICENSE及licenses/Apache-2.0.txt原字节，THIRD_PARTY_NOTICES.md以明确资产/材料范围和安装包定位前缀接完整原notice字节尾部，均纳入manifest；不把输入材料或独立想法重授权。独立实际安装生成10文件/manifest9，三安装许可缺件在首写前失败、输出篡改/缺件按原manifest失败、installer根LICENSE缺件/篡改失败。通用checker只证明声明清单自洽，同步删改清单仍可能PASS，不充当独立许可真实性或法律裁决。
- **路径修正**：独立代码审查发现long-s与Windows尾点材料路径被生成器接受但checker拒绝，原反例保留。候选统一upper/lower保留名判定并拒绝任一材料路径组件尾点/尾空格；新增Unicode/别名零写负例，修后结果另接真实复验。
- **D05有界扩展**：长中英/表格/中文空格%文件名生成+实际Python静态通过；不支持图片语法、重复JSON键、缺来源文件、禁词四负例非零/无输出，5例通过。首轮测试材料含声明不支持的underscore语法，被正确拒绝，原Harness失败保留，改为子集内合法输入另批执行；未作模型语义/冲突推理新验。
- **D06恢复与观测**：冻结公开已知良好7文件，在隔离目录实际完成再生字节同一、损坏JS静态失败、拒覆盖已有损坏目录、备份恢复后89/89、坏输入零输出5步，原Harness取字段/文件数误差及观测快照缺口保留。只读原生Sites回读仍同私有Site版本1/源码ffaaa359、部署succeeded/owner audience；无新版本/ACL/发布，生产回滚及周期监控NOT_RUN。

D01原生持续窗口/空返回/超时/关闭、D02桌面菜单热加载派发、D03第二真实客户端仍缺可观测目标能力，并保留不重启模型/桌面测试限制，均DEFERRED非PASS。D04/D05/D06只完成上述限定子集，剩余完整视觉/托管/真实设备/模型语义/生产恢复范围不被消除。D07完整计划最终接受仍NOT_PROVIDED；Owner核心接受已存在，不重问。历史保护批准NOT_MET/bypass、旧FAIL/UNKNOWN永久保留。

候选工程状态：46项定向检查已PASS；独立修后别名检查、完整本机/13安装与CI终态随后接入。本轮新PR真实批准/受保护合入/正式发布未完成，不把本地修复称交付。本轮无必须立即提交Owner的实质决定；只有改变原生测试限制、提前修改完整完成范围或新增真实学习效果目标时才触发集中决定。

以下“Current sync”是上一维护批次截至281的历史叙述，actual282及Owner核心接受以本节/Issue外部回执为准，不追改原观察。
`;
edit('plans/274-html-learning-artifact/[REPORT]_HTML_Learning_Artifact.md',s=>s.replace('version: v1.10','version: v1.11').replace('## Current conclusion and remaining gaps',reportSection+'\n## Current conclusion and remaining gaps'));
edit('plugins/html-guide-kit/README.md',s=>s.replace('0.1.37 提供两个显式入口：','0.1.38 为未发布修复候选（当前公开0.1.37），提供两个显式入口：')+'\n生成器输出保留模板/运行资产的MIT LICENSE、Apache原文及带范围说明的THIRD_PARTY_NOTICES；材料、学习正文和来源原件保留各自权利，不因生成网页改授权。许可输出与全部生成文件纳入manifest。\n');
edit('plugins/html-guide-kit/CHANGELOG.md',s=>s.replace('# Changelog\n','# Changelog\n\n## [0.1.38] - Unreleased\n\n### Fixed\n\n- Carry asset license texts and scoped notices into generated artifacts without relicensing supplied materials; reject reserved-name and Windows path aliases before writing.\n- Make the blank reflection control boundary distinguishable against both paper and white surfaces.\n- Require the installed HTML package LICENSE and verify exact cache bytes.\n'));
edit('CHANGELOG.md',s=>s.replace('## [Unreleased]\n','## [Unreleased]\n\n### Fixed\n\n- Prepare HTML Guide Kit 0.1.38 with generated asset notices, portable output-name checks and a visible reflection input boundary; public Marketplace remains v8.3.2.\n\n### Maintenance\n\n- Resume Issue274 bounded accessibility, material-negative and offline recovery checks; record accepted core separately from deferred native/client coverage and historical approval gaps.\n'));
edit('plugins/html-guide-kit/skills/site/references/input-contract.md',s=>s.replace('输出含 `index.html/theme.css/learning.js`、原路径原字节输入文件，以及 `artifact-manifest.json`。','输出含 `index.html/theme.css/learning.js`、原路径原字节输入文件、资产许可 `LICENSE` 与 `licenses/Apache-2.0.txt`、带资产/材料范围说明及完整包notice字节尾部的 `THIRD_PARTY_NOTICES.md`，以及 `artifact-manifest.json`。输入材料和学习正文保留原权利，不因生成网页改授权。上述生成名（含licenses目录）按统一upper/lower键保留，材料文件不允许大小写/Unicode别名或嵌套冲突，任一路径组件不得以点/空格结尾；缺安装许可或路径冲突在首写前失败。').replace('生成成功只表示生成器检查范围内已输出。','通用静态checker核验声明的文件/manifest自洽；同步删改清单仍可能通过，不独立认证材料来源或许可真实性。安装器和生成器的许可传递另核原包字节。\n\n生成成功只表示生成器检查范围内已输出。'));
edit('docs/spec/[SPEC]_HTML_Learning_Artifact.md',s=>s.replace('updated: 2026-10-19','updated: 2026-10-20').replace('version: v1.0','version: v1.1').replace('候选HTML0.1.37','原子首版HTML0.1.37；后续0.1.38修复候选未公开').replace('实际第三方内容建立THIRD_PARTY_NOTICES，保留许可；','实际第三方内容建立THIRD_PARTY_NOTICES，保留许可；生成的模板/运行资产携带包MIT LICENSE、Apache原文及带范围/原安装定位说明的完整notice尾部，全部入manifest，不重授权输入材料。安装器核根LICENSE原字节；生成前缺件或保留名/跨平台路径冲突均零写失败。通用checker只核声明清单自洽，不认证许可/原件真实性；').replace('检查实际背景对比度、','可编辑控件必要边界也须可辨，检查实际背景对比度、'));
edit('docs/guide/[GUIDE]_HTML_Learning_Artifact.md',s=>s.replace('updated: 2026-10-19','updated: 2026-10-20').replace('version: v1.0','version: v1.1')+'\n## Generated asset notices\n\n0.1.38修复候选会随生成资产携带LICENSE、licenses/Apache-2.0.txt及带范围说明的THIRD_PARTY_NOTICES.md，纳入输出manifest；学习正文和输入材料保留各自权利。不要把静态清单通过当作许可真实性或材料授权证明。当前公开0.1.37与候选状态见任务入口。\n');
edit('docs/INDEX.md',s=>s.replace('version: v2.105','version: v2.106').replace('## 当前整体发布','## 当前整体发布\n\n'+current+' 余项/恢复条件见同一[任务REPORT](../plans/274-html-learning-artifact/[REPORT]_HTML_Learning_Artifact.md#deferral-recovery-results)。下方为之前各轮的原日期记录。'));
edit('AGENTS.md',s=>s.replace(/HTML0\.1\.37\/site随#278\/v8\.3\.2公开，guide保持。#281合develop62945150[^\n]+/,'HTML0.1.37/site随#278/v8.3.2公开；#282合develop908d2953，市场8.3.3预升未发布。Owner已限定接受核心，延期/历史缺口保留。[任务274](plans/274-html-learning-artifact/INDEX.md)本轮自主恢复有界浏览器/材料负例/离线恢复，发现输出许可和表单边界缺陷，0.1.38修复候选未发布；原生/第二客户端仍延期、效果未测、旧FAIL/UNKNOWN及保护批准NOT_MET保留，新PR不bypass。'));
assert(fs.statSync(path.join(root,'AGENTS.md')).size<=16384);
console.log(JSON.stringify({status:'APPLIED',baselineRows:32,firstFiveColumns:'unchanged',agBytes:fs.statSync(path.join(root,'AGENTS.md')).size}));
