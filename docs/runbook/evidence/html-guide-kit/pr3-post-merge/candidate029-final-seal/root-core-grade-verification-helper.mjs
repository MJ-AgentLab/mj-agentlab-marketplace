import fs from 'node:fs';import crypto from 'node:crypto';import path from 'node:path';
const root='C:/Users/Admin/.codex/worktrees/html-guide-acceptance/reviewer/corrections/0-1-19',file=root+'/provenance/core-grade-import/before-inventory.json',p=JSON.parse(fs.readFileSync(file)),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
if(p.canonicalSha!=='2fb20957d5c082aead7c8f3a8136d44c574487ee'||p.packageVersion!=='0.1.19'||p.rows.length!==14||p.actualUuids!==14||p.completeTurns!==30||p.invalidTurns!==0||p.executionList.length!==17)throw Error('Actual closed 14/30 mapping required');
for(const key of ['variant','attemptId','uuid'])if(new Set(p.rows.map(r=>r[key])).size!==14)throw Error('Duplicate '+key);
const expectedHarness=path.resolve(root+'/blocking/harness.mjs');
for(let i=0;i<p.rows.length;i++){
 const r=p.rows[i],a=JSON.parse(fs.readFileSync(r.batchFile)).cases[r.variant].attempts;
 if(a.length!==1||a[0].attemptId!==r.attemptId||a[0].threadId!==r.uuid||a[0].turns.length!==r.completeTurns||a[0].turns.some(t=>t.transportStatus!=='COMPLETE')||r.status!=='PASS'||!r.wholeOriginalReviewWillBeImported||!r.noProjection)throw Error('Original mapping drift '+r.variant);
 if(hash(fs.readFileSync(r.originalReviewFile))!==r.originalReviewSha256||hash(fs.readFileSync(r.originalReviewCopy))!==r.originalReviewSha256)throw Error('Original report byte drift '+r.variant);
 const c=p.executionList[i],expected=[expectedHarness,'grade','--batch',r.batchFile,'--review',r.originalReviewFile];
 if(c.kind!=='grade'||JSON.stringify(c.args.map((x,j)=>j===0?path.resolve(x):x))!==JSON.stringify(expected))throw Error('Unexpected grade command '+r.variant);
}
const batches=[...new Set(p.rows.map(r=>r.batchFile))];
for(let i=0;i<3;i++){const c=p.executionList[14+i];if(c.kind!=='summary'||JSON.stringify(c.args.map((x,j)=>j===0?path.resolve(x):x))!==JSON.stringify([expectedHarness,'summary','--batch',batches[i]]))throw Error('Unexpected summary');}
const result={recordedAt:new Date().toISOString(),actualPreparationSha256:hash(fs.readFileSync(file)),status:'EXACT_ORIGINALS_AND_17_COMMANDS_VERIFIED',uniqueVariants:14,uniqueAttempts:14,uniqueUuids:14,completeTurns:30,originalReviewBytesEqual:true,gradeCommands:14,summaryCommands:3,noSemanticRegrading:true,noModelInputOrRuntimeChange:true};
fs.writeFileSync(root+'/provenance/core-grade-import/root-prep-verification.json',JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(result));
