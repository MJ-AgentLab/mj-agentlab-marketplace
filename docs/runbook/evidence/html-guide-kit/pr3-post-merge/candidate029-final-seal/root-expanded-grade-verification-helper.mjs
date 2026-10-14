import fs from 'node:fs';import crypto from 'node:crypto';import path from 'node:path';
const root='C:/Users/Admin/.codex/worktrees/html-guide-acceptance/reviewer/corrections/0-1-19',file=root+'/provenance/expanded-grade-import/before-inventory.json',p=JSON.parse(fs.readFileSync(file)),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
if(p.canonicalSha!=='2fb20957d5c082aead7c8f3a8136d44c574487ee'||p.packageVersion!=='0.1.19'||p.rows.length!==11||p.actualUuids!==11||p.completeTurns!==21||p.invalidTurns!==0||p.executionList.length!==15||p.coreRegrade!==false)throw Error('Actual closed 11/21 expanded mapping required');
for(const key of ['variant','attemptId','uuid'])if(new Set(p.rows.map(r=>r[key])).size!==11)throw Error('Duplicate '+key);
const expectedHarness=path.resolve(root+'/expanded/harness.mjs');
for(let i=0;i<p.rows.length;i++){
 const r=p.rows[i],state=JSON.parse(fs.readFileSync(r.batchFile)).cases[r.variant],a=state.attempts,review=JSON.parse(fs.readFileSync(r.originalReviewFile));
 if(a.length!==1||a[0].attemptId!==r.attemptId||a[0].threadId!==r.uuid||a[0].turns.length!==r.completeTurns||a[0].turns.some(t=>t.transportStatus!=='COMPLETE')||!['PASS','FAIL','UNEXERCISED'].includes(r.status)||review.status!==r.status||review.attemptId!==r.attemptId||review.variant!==r.variant||review.canonicalSha!==p.canonicalSha||!r.wholeOriginalReviewWillBeImported||!r.noProjection)throw Error('Original mapping drift '+r.variant);
 if(r.status==='PASS'&&a[0].turns.length!==state.plannedTurns)throw Error('Incomplete cannot pass '+r.variant);
 if(hash(fs.readFileSync(r.originalReviewFile))!==r.originalReviewSha256||hash(fs.readFileSync(r.originalReviewCopy))!==r.originalReviewSha256)throw Error('Original report byte drift '+r.variant);
 const c=p.executionList[i],expected=[expectedHarness,'grade','--batch',r.batchFile,'--review',r.originalReviewFile];
 if(c.kind!=='grade'||JSON.stringify(c.args.map((x,j)=>j===0?path.resolve(x):x))!==JSON.stringify(expected))throw Error('Unexpected grade command '+r.variant);
}
const batches=[...new Set(p.rows.map(r=>r.batchFile))];
if(batches.length!==4)throw Error('Four original expanded batches required');
for(let i=0;i<4;i++){const c=p.executionList[11+i];if(c.kind!=='summary'||JSON.stringify(c.args.map((x,j)=>j===0?path.resolve(x):x))!==JSON.stringify([expectedHarness,'summary','--batch',batches[i]]))throw Error('Unexpected summary');}
const counts=Object.fromEntries(['PASS','FAIL','UNEXERCISED'].map(s=>[s,p.rows.filter(r=>r.status===s).length]));
if(counts.PASS!==6||counts.FAIL!==3||counts.UNEXERCISED!==2)throw Error('Original outcome mismatch');
const result={recordedAt:new Date().toISOString(),actualPreparationSha256:hash(fs.readFileSync(file)),status:'EXACT_EXPANDED_ORIGINALS_AND_15_COMMANDS_VERIFIED',uniqueVariants:11,uniqueAttempts:11,uniqueUuids:11,completeTurns:21,counts,originalReviewBytesEqual:true,gradeCommands:11,summaryCommands:4,coreRegraded:false,noSemanticRegrading:true,noModelInputOrRuntimeChange:true};
fs.writeFileSync(root+'/provenance/expanded-grade-import/root-prep-verification.json',JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(result));
