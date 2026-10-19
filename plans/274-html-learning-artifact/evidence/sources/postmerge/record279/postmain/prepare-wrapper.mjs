import fs from 'node:fs';import path from 'node:path';
const root=path.resolve(process.argv[2]),source=path.resolve(process.argv[3]);
const old=fs.readFileSync(source,'utf8');
let script=old.slice(0,old.indexOf('const publication='))+String.raw`const startedAt=new Date().toISOString();
function ghRecord(file,args){const b=execFileSync('gh',args,{windowsHide:true,maxBuffer:10*1024*1024});fs.writeFileSync(path.join(output,file),b);return JSON.parse(b);}
const pr=ghRecord('pr279-start.json',['pr','view','279','--repo','MJ-AgentLab/mj-agentlab-marketplace','--json','number,url,state,mergedAt,mergeCommit,headRefOid,baseRefOid']);
const main=ghRecord('main-start.json',['api','repos/MJ-AgentLab/mj-agentlab-marketplace/git/ref/heads/main']);
const sourceGate={pr:279,state:pr.state,mergedAt:pr.mergedAt,mergeCommit:pr.mergeCommit?.oid,previousHead:pr.headRefOid,previousBase:pr.baseRefOid,main:main.object.sha};
if(sourceGate.state!=='MERGED'||sourceGate.mergeCommit!==canonicalSha||sourceGate.main!==canonicalSha||new Date(startedAt)<=new Date(sourceGate.mergedAt)||git(['rev-parse','HEAD'])!==canonicalSha)throw new Error('Actual merged canonical start gate not satisfied');
`+old.slice(old.indexOf('const apiBytes='));
script=script.replaceAll('f906b1001a86d7b5415451bd973bea26e6cc3a1d','e3dc40f734fc972e05956da3e908091e09963675').replaceAll('post-publication','post-merge #279').replaceAll('publication','sourceGate').replaceAll('beginAfterPublished:true','beginAfterMerged:true').replaceAll('hostHeadInvariantRequired:false','hostHeadInvariantRequired:true');
script=script.replace(" const scenarios=raw.scenarios", " if(git(['rev-parse','HEAD'])!==canonicalSha)throw new Error('Host HEAD changed during canonical verification');\n const scenarios=raw.scenarios");
fs.writeFileSync(path.join(root,'verify-canonical.mjs'),script);
console.log('Prepared new #279 actual-merge wrapper; only method reused, no prior result input.');
