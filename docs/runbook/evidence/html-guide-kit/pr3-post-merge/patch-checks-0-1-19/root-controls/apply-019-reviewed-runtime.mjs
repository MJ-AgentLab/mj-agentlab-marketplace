import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {execFileSync} from 'node:child_process';
const base='C:/Users/Admin/.codex/worktrees/html-guide-acceptance',repo=base+'/develop',root=base+'/reviewer/corrections/0-1-19',canonical='0a6c48c2b3d782cbffb86355060d65986383eeea',hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const seal=JSON.parse(fs.readFileSync(repo+'/docs/runbook/evidence/html-guide-kit/pr3-post-merge/candidate028-final-seal/archive-index.json'));
if(seal.version!=='0.1.18'||seal.canonicalSha!==canonical||seal.actualRootVerification?.pack?.exitCode!==0||seal.actualRootVerification?.node?.exitCode!==0||seal.actualRootVerification?.dotnet?.exitCode!==0)throw Error('Actual source18 final closure required');
const controlFile=root+'/draft/runtime-draft-control.json',controlBytes=fs.readFileSync(controlFile),control=JSON.parse(controlBytes);
if(hash(controlBytes)!=='f0c2a168ed2d16e0669283e7791b40bd9a998f6f32151358374c3a2c66153b48'||control.sourceCanonical!==canonical||control.candidateVersion!=='0.1.19'||control.resources.length!==3)throw Error('Exact frozen author candidate required');
const reports=['static-review-019-b.json','static-review-019-logic.json'].map(file=>({file,report:JSON.parse(fs.readFileSync(root+'/'+file))}));
for(const {report} of reports){
 if(report.status!=='STATIC_ONLY'||(report.verdict??report.result)!=='NO_STATIC_BLOCKERS'||report.sourceCanonical!==canonical||report.proposedVersion!=='0.1.19')throw Error('Independent static identity or verdict missing');
 const pins=report.resources??report.pins??[];
 for(const row of control.resources)if(!pins.some(p=>p.relative===row.relative&&(p.draftBytes??p.draftLfBytes)===row.draftLfBytes&&p.draftSha256===row.draftSha256))throw Error('Independent report does not pin exact candidate');
}
if(execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim()!==canonical||JSON.parse(fs.readFileSync(repo+'/plugins/html-guide-kit/plugin.json')).version!=='0.1.18')throw Error('Unexpected current source');
const allowed=['skills/guide/SKILL.md','skills/guide/references/guide-framework.md','skills/guide/references/interaction-design.md'];
const planned=control.resources.map(row=>{
 if(!allowed.includes(row.relative)||!path.resolve(row.draftFile).startsWith(path.resolve(root+'/draft')+path.sep)||fs.lstatSync(row.draftFile).isSymbolicLink())throw Error('Unexpected reviewed resource');
 const target=repo+'/plugins/html-guide-kit/'+row.relative,bytes=fs.readFileSync(row.draftFile);
 if(hash(fs.readFileSync(target))!==row.sourceSha256||hash(bytes)!==row.draftSha256||bytes.length!==row.draftLfBytes)throw Error('Reviewed draft or runtime drift');
 return{row,target,bytes};
});
if(new Set(planned.map(p=>p.row.relative)).size!==3||planned.find(p=>p.row.relative.endsWith('/SKILL.md')).bytes.length>6144||control.resources.find(row=>row.relative.endsWith('/SKILL.md')).draftCrlfBytes>6144)throw Error('Three resources and unchanged budget required');
for(const p of planned)if(!fs.readFileSync(p.target).equals(p.bytes))fs.writeFileSync(p.target,p.bytes);
const result={recordedAt:new Date().toISOString(),sourceCanonical:canonical,sourceVersion:'0.1.18',proposedVersion:'0.1.19',appliedExactReviewedBytes:true,rows:planned.map(({row})=>({relative:row.relative,bytes:row.draftLfBytes,sha256:row.draftSha256,changed:row.sourceSha256!==row.draftSha256})),staticReports:reports.map(({file})=>({file,sha256:hash(fs.readFileSync(root+'/'+file))})),source18ActualClosurePreserved:true,marketplace:'8.3.0',installation:'NOT_RUN',model:'NOT_RUN'};
fs.writeFileSync(root+'/applied-reviewed-runtime.json',JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(result));
