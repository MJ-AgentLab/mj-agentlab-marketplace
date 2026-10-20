import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const cwd='C:/Users/Admin/.codex/worktrees/html-learning-artifact/develop',tmp='C:/Users/Admin/AppData/Local/Temp';
const gh=args=>execFileSync('gh',args,{cwd,encoding:'utf8',maxBuffer:8*1024*1024});
const mf=tmp+'/html-learning-274-record279-ci/final-manifest.json',raw=fs.readFileSync(mf);assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),'9267bd2b89fd549f1a0088e2e012510cf0f9d50b7c17d582d76d0d9003e9fc2b');
const m=JSON.parse(raw),g=JSON.parse(fs.readFileSync(tmp+'/html-learning-274-record279-gate-current.json','utf8'));assert.equal(m.status,'PASS');assert.equal(m.head,'315b5942a3a61c6bf7ab17513b8263496bd7a48a');assert.equal(m.platforms.windows.tap.pass,642);assert.equal(m.platforms.linux.tap.pass,641);assert.equal(g.assessment.pendingChecks.length,0);assert.equal(g.assessment.failedChecks.length,0);assert.equal(g.assessment.unresolvedThreads,0);
const terminal=`## 当前记录PR终态核对（${g.capturedAt}）

[本PR精确head新CI run39272665913](https://github.com/MJ-AgentLab/mj-agentlab-marketplace/actions/runs/39272665913)及push39272636618均completed/success；push重复矩阵只列状态，不另计独立验收。结构/A6也已PASS，pending/failed checks均0，review threads完整且未解决0。

新PR实际checkout687b70abd58a8556ee566c74c340dd66480fe407，treeae121f6b与head315b5942一致，parents为f906/315。Windows642/642零skip，Linux641/642仅Windows专属skip1，均零fail/cancel；四browser相关case各实际执行未skip。每平台新13安装/178命令全0、6Diagram18LEK实际Python、4site生成4静态各89/89，source/cache资源核对通过。清理名称匹配的16个TAP用例通过、默认smoke清理后正常返回；本CI未输出逐根absence，NOT_RECORDED，不能借发布后f906的15精确根原件。

72份CI原件及方法均已冻结，manifest SHA256 9267bd2b89fd549f1a0088e2e012510cf0f9d50b7c17d582d76d0d9003e9fc2b。Linux raw a42d54396115d2de4f71c535ee7c04c39bc49a147e4cc217822bbac2ae27f663，Windows raw 4970404c1177fcbae03718d8b9e72cb19434aeaa52b64a7919177266440f3f68。后续实际main合入再将本轮服务端原件接回同一REPORT，当前冻结提交不反复追加CI自指证据。

**当前真实剩余门禁：main要求1个当前提交非作者/最新推送者之外的批准及适用code-owner要求，现reviews=[]、REVIEW_REQUIRED。** 实际base f906、head315和merge-ref687b同树均未变。Agent不代造批准、不bypass；实际记录PR合入前，sync及8.3.3准备仍NOT_STARTED/DEPENDENT。Owner最终接受及非核心延期独立。
`;
const initial=fs.readFileSync(tmp+'/html-learning-274-record-pr.md','utf8'),prBody=terminal+'\n'+initial;const p=tmp+'/html-learning-274-record279-pr-final.md';fs.writeFileSync(p,prBody);console.log(gh(['pr','edit','279','--body-file',p]).trim());
const issue=JSON.parse(gh(['issue','view','274','--json','body,state']));assert.equal(issue.state,'OPEN');assert(issue.body.includes('服务端新head平台CI仍在跑。'));
const issueBody=issue.body.replace('服务端新head平台CI仍在跑。','本PR新CI39272665913与push39272636618均completed/success：Windows642/642零skip、Linux641/642仅平台skip1；每端新13安装/178命令、6Diagram18LEK4生成4静态各89/89，四browser工程case未skip。实际checkout687b/treeae121与315同树。72原件/方法已冻结，manifest9267bd2b89fd；16清理相关TAP用例与默认返回成功，逐根absence本CI未记录、不借前轮15根。当前A6/结构/全部平台检查PASS、pending/failed0、线程完整未解0；main仍真实缺当前head非作者批准。');
const i=tmp+'/html-learning-274-record279-issue-final.md';fs.writeFileSync(i,issueBody);console.log(gh(['issue','edit','274','--body-file',i]).trim());
const verification={capturedAt:new Date().toISOString(),pr:JSON.parse(gh(['pr','view','279','--json','number,url,state,isDraft,headRefOid,baseRefOid,reviewDecision,mergeStateStatus,body'])),issue:JSON.parse(gh(['issue','view','274','--json','number,url,state,body']))};assert.equal(verification.pr.body.replaceAll('\r\n','\n'),prBody.replaceAll('\r\n','\n'));assert.equal(verification.issue.body.replaceAll('\r\n','\n'),issueBody.replaceAll('\r\n','\n'));fs.writeFileSync(tmp+'/html-learning-274-record279-live-final.json',JSON.stringify(verification,null,2)+'\n');console.log(JSON.stringify({readback:'MATCH',pr:verification.pr.number,state:verification.pr.state,reviewDecision:verification.pr.reviewDecision,issueState:verification.issue.state}));
