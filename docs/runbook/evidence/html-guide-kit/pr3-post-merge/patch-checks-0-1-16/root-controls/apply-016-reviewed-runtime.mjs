import fs from 'node:fs';import crypto from 'node:crypto';
const base='C:/Users/Admin/.codex/worktrees/html-guide-acceptance',root=base+'/reviewer/corrections/0-1-16',repo=base+'/develop',hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const seal=JSON.parse(fs.readFileSync(repo+'/docs/runbook/evidence/html-guide-kit/pr3-post-merge/candidate025-final-seal/archive-index.json'));
if(seal.version!=='0.1.15'||seal.canonicalSha!=='2bcbe30ac2b4e2a64a159f121dc818f961fe7c15')throw Error('Actual source15 final closure required');
const control=JSON.parse(fs.readFileSync(root+'/draft-ready/runtime-draft-control.json'));
const reports=['static-review-016-logic.json','static-review-016-b.json'].map(file=>JSON.parse(fs.readFileSync(root+'/'+file)));
if(reports.some(r=>(r.verdict??r.result)!=='NO_STATIC_BLOCKERS'))throw Error('Independent static verdicts required');
for(const report of reports){
 if(report.status!=='STATIC_ONLY'||report.proposedVersion!=='0.1.16'||report.sourceCanonical!=='2bcbe30ac2b4e2a64a159f121dc818f961fe7c15')throw Error('Exact independent static identity required');
 const pins=report.pins??report.resources??[];
 for(const row of control.rows)if(!pins.some(p=>p.relative===row.relative&&p.draftSha256===row.draftSha256&&p.draftBytes===row.draftBytes))throw Error('Independent review does not pin this draft byte identity');
}
if(JSON.parse(fs.readFileSync(repo+'/plugins/html-guide-kit/plugin.json')).version!=='0.1.15')throw Error('Unexpected source version');
const planned=control.rows.map(row=>{const target=repo+'/plugins/html-guide-kit/skills/guide/'+row.relative,name=row.relative.split('/').at(-1),bytes=fs.readFileSync(root+'/draft-ready/'+name+'.snapshot.txt');if(hash(fs.readFileSync(target))!==row.originalSha256||hash(bytes)!==row.draftSha256||bytes.length!==row.draftBytes)throw Error('Reviewed draft drift');return{row,target,bytes};});
if(planned.length!==3||planned[0].bytes.length>6144)throw Error('Three runtime resources and unchanged budget required');
for(const item of planned)fs.writeFileSync(item.target,item.bytes);
const rows=planned.map(({row})=>({relative:row.relative,bytes:row.draftBytes,sha256:row.draftSha256}));
fs.writeFileSync(root+'/applied-reviewed-runtime.json',JSON.stringify({recordedAt:new Date().toISOString(),rows,proposedVersion:'0.1.16',marketplace:'8.3.0',appliedExactReviewedBytes:true,model:'NOT_RUN',installation:'NOT_RUN',source15OriginalFailuresAndTransportInvalidPreserved:true},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({applied:true,proposedVersion:'0.1.16',rows}));
