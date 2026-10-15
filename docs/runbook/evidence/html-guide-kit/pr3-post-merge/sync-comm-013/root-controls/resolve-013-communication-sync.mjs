import fs from 'node:fs';import path from 'node:path';import{execFileSync}from'node:child_process';
const repo='C:/Users/Admin/.codex/worktrees/html-guide-acceptance/develop',git=args=>execFileSync('git',args,{cwd:repo,encoding:'utf8',maxBuffer:16*1024*1024}),file=p=>path.join(repo,p),read=p=>fs.readFileSync(file(p),'utf8'),write=(p,s)=>{if(/^<<<<<<<|^=======|^>>>>>>>/m.test(s))throw Error('unresolved '+p);fs.writeFileSync(file(p),s);};
const conflict=(s,fn)=>{let n=0;const t=s.replace(/^<<<<<<< HEAD\r?\n([\s\S]*?)^=======\r?\n([\s\S]*?)^>>>>>>> origin\/develop\r?\n/gm,(_,a,b)=>fn(a,b,++n));return{t,n};};
let a=git(['show','origin/develop:AGENTS.md']),ours=git(['show','HEAD:AGENTS.md']);const ownStart=ours.lastIndexOf('## HTML Guide Kit 阶段实施'),ownEnd=ours.indexOf('\nCommunication PR1 ',ownStart);if(ownStart<0||ownEnd<0)throw Error('own HTML anchors');let html=ours.slice(ownStart,ownEnd);
html=html.replace('marketplace未发布8.2.1，main公开三插件、develop四插件未发行。','marketplace未发布8.3.0，main公开三插件、develop五插件候选未发行。').replace(/已同步并发origin\/developbca7b5c[^。]+。/,'已普通同步origin/develop c1fa458（#225/#229/#233，继承#223/#236），保留五插件、七公开技能、四显式、三自然和20仓库开发技能及所有其他插件版本。');
const inStart=a.indexOf('## HTML Guide Kit 阶段实施'),inEnd=a.indexOf('第五轮来源',inStart);if(inStart<0||inEnd<0)throw Error('incoming HTML anchors');a=a.slice(0,inStart)+html+'\n\n'+a.slice(inEnd);a=a.replace('当前PR3候选注册','当前develop注册').replace('PR4准备未发布VERSION8.3.0','VERSION8.3.0为Communication PR4未发布版本准备');
const compactHtml=`## HTML Guide Kit 阶段实施

Owner授权[Epic #217](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/217)三阶段、独立worktree/codex分支。#221 merge70267a5已复验/#218关闭；#226 merge d106e766与已测72cdd08同树，完整0.1.0/第二轮A图标、七安装/四缓存Python已复验/#219关闭。历史reviews缺独立批准保留。PR3 #231仍须当前head非作者批准、CI/线程门禁和实际merge复验，不bypass、不指定审查人。

合同见[ADR](docs/adr/[ADR]_HTML_Guide_Kit_Addition.md)及[SPEC](docs/spec/[SPEC]_HTML_Guide_Kit_Acceptance.md)：仅显式$html-guide-kit:guide、Read、中文/原术语、聊天文本新建指南。实际读材料/明确快照，分原料/核验背景/构造，保留定位/冲突/缺口。每次2–3不同读者/任务/问题＋推荐理由，明确选择/修改确认才编排；默认/推荐/预选/沉默/超时/无关回复/消失非确认，未答保留同一待确认，不承诺锁宿主。深度随材料，演示/模拟/自检含反馈/恢复、理由/误区、重试及判准边界；不评分/长期掌握。不修订/比较/审查，不输出HTML/代码/文件/制作工具步骤或越权执行；仅SKILL及两参考，无Owner路径/研究治理依赖。

本分支HTML0.1.12未合并。已普通同步c1fa458（#225/#229/#233），保留五包七公开/四显式/三自然/20repo-only及他插件版本，marketplace为上游未发布8.3.0；main公开8.2.0三包，HTML留develop另发，本任务无Release/tag/main发布授权，缺manifest仍失败。源12固定5bce834八安装/四Python/CI通过，15UUID/31COMPLETE独立9P4F2UNEX；完整源恢复遗漏、库存排他漏恢复及重试当前态分别FAIL，原局部PASS不抵消。0.1.0–0.1.11旧失败/invalid/未跑及封存保持，0.1.4/0.1.7模型NOT_RUN。

Owner将现实效果另测，本次NOT_MEASURED；本任务原生应用接口不可用，Codex应用UI/ChatGPT桌面与空返回/超时/关闭未执行，CLI及其他插件证据不替代。合格核心可分段交付，延期不当通过，#220/Epic开放，Owner最终接受独立。准确来源、控制修正、连续会话及阶段历史见[RUNBOOK](docs/runbook/[RUNBOOK]_HTML_Guide_Kit_Acceptance.md)§11–29；新合成须新安装/冻结行为，不继承旧PASS。研究项目只读，不整理/提交。

`;
a=a.replace(html+'\n\n',compactHtml);
a=a.replace('Owner授权[Epic #217](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/217)三阶段、独立worktree/codex分支。#221 merge70267a5已复验/#218关闭；#226 merge d106e766与已测72cdd08同树，完整0.1.0/第二轮A图标、七安装/四缓存Python已复验/#219关闭。历史reviews缺独立批准保留。PR3 #231仍须当前head非作者批准、CI/线程门禁和实际merge复验，不bypass、不指定审查人。','[Epic #217](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/issues/217)授权三阶段/worktree/codex。#221 merge70267a5复验/#218关闭；#226 d106e766同72cdd08树，0.1.0/第二轮A/七安装四Python复验/#219关闭。旧批准缺项保留。#231须当前head非作者批准、CI/线程/merge复验，不bypass或指定审查人。');
a=a.replace('历史 v8.1.0 通过 #198 发布，#199 完成 main → develop 同步，#200 修正发布记录，#201 将 develop 预升为当时未发布的 8.1.1。历史验收失败、回放、未覆盖客户端结果与缺失批准分别保留，见 [8.1.0 发布记录](docs/runbook/[RUNBOOK]_Marketplace_8_1_0_Release_Readiness.md)。','历史#198公开8.1.0，#199回同步/#200记录修正/#201预升8.1.1；失败/回放/客户端未覆盖/批准缺项见[8.1.0记录](docs/runbook/[RUNBOOK]_Marketplace_8_1_0_Release_Readiness.md)，不追认。');
a=a.replace('v8.0.0 已经 #190 合入 main 并自动发布，实际状态和未完成的桌面验收见 [发布记录](docs/runbook/[RUNBOOK]_Portable_Migration_Release_Readiness.md)。发布后按 [发布操作](docs/runbook/[RUNBOOK]_Release_Operations.md) 同步 main 到 develop 并准备下一补丁 pre-bump；只更新 marketplace VERSION 与派生 README badge，插件版本按自身变更推进。','历史#190公开v8.0.0与桌面缺项见[记录](docs/runbook/[RUNBOOK]_Portable_Migration_Release_Readiness.md)；发布后按[操作](docs/runbook/[RUNBOOK]_Release_Operations.md)回同步main并只预升市场VERSION/badge，插件独立推进。');
a=a.replace('explain-kit 0.1.0 提供速解和深讲，默认中文、保留术语原文，按深度路由并适应用户格式。新增解释能力的 [ADR](docs/adr/[ADR]_Explain_Kit_Addition.md) 与 [验收记录](docs/runbook/[RUNBOOK]_Explain_Kit_Acceptance.md) 不改变测验策略。','Explain初始0.1.0速解/深讲、中文/原术语、深度/格式适应见[ADR](docs/adr/[ADR]_Explain_Kit_Addition.md)及[验收](docs/runbook/[RUNBOOK]_Explain_Kit_Acceptance.md)，不改测验策略。');
if(Buffer.byteLength(a)>16384)throw Error('AGENTS budget '+Buffer.byteLength(a));write('AGENTS.md',a);
let p='.agents/skills/mp-doc-bump-version/SKILL.md',r=conflict(read(p),(x,y,n)=>n===1?y:x.trimEnd()+'\n\n'+y);if(r.n!==2)throw Error('version skill conflicts');write(p,r.t);
p='scripts/validate-portable.mjs';r=conflict(read(p),(x,y)=>y.trimEnd()+'\n'+x.slice(x.indexOf('// Conservative')));if(r.n!==1)throw Error('validator conflicts');write(p,r.t);
p='CHANGELOG.md';r=conflict(read(p),(x,y)=>x.trimEnd()+'\n\n'+y);write(p,r.t);
p='README.md';r=conflict(read(p),(x,y,n)=>n===1?y.replace(/(\*\*html-guide-kit[^\n]+\| )0\.1\.0,?/,'$10.1.12,').replace('0.1.0，develop 开发候选','0.1.12，develop 修正候选'):y);write(p,r.t);
p='docs/INDEX.md';r=conflict(read(p),(x,y,n)=>n===1?'version: v2.37\n':x.trimEnd()+'\n\n'+y);write(p,r.t);
p='docs/guide/[GUIDE]_Plugin_Development_Testing_Workflow.md';r=conflict(read(p),(x,y,n)=>n===1?'version: v2.11\n':y+'\n当前HTML仍为0.1.12修正候选，源12五包同步前证据不继承新合成通过；各阶段以准确候选SHA/版本及实际安装、模型和客户端账本为准。\n');write(p,r.t);
console.log(JSON.stringify({resolved:['AGENTS.md','.agents/skills/mp-doc-bump-version/SKILL.md','scripts/validate-portable.mjs','CHANGELOG.md','README.md','docs/INDEX.md','docs/guide/[GUIDE]_Plugin_Development_Testing_Workflow.md'],agentsBytes:Buffer.byteLength(a),upstream:'c1fa458df1b531d7c38436908b750ba810b0b116',htmlRuntimeStill:'0.1.12',marketplace:'8.3.0',runtimePlugins:5,publicSkills:7,strictGuideBudget:6144}));
