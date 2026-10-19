import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root=path.resolve(process.argv[2]),phase=process.argv[3]||'initial';
const repo='MJ-AgentLab/mj-agentlab-marketplace';
const call=(file,args)=>{const bytes=execFileSync('gh',args,{windowsHide:true,maxBuffer:25*1024*1024});fs.writeFileSync(path.join(root,file),bytes);return JSON.parse(bytes);};
const pr=call(`pr-${phase}.json`,['pr','view','278','--repo',repo,'--json','number,url,state,headRefName,headRefOid,baseRefName,baseRefOid,potentialMergeCommit']);
const run=call(`run-${phase}.json`,['run','view','39259489009','--repo',repo,'--json','databaseId,headSha,event,status,conclusion,createdAt,updatedAt,url,jobs']);
if(phase==='initial'||phase==='final'){
 call(`head-${phase}.json`,['api',`repos/${repo}/git/commits/${pr.headRefOid}`]);
 call(`merge-${phase}.json`,['api',`repos/${repo}/git/commits/${pr.potentialMergeCommit.oid}`]);
 for(const [platform,id]of [['linux',118083116207],['windows',118083116225]])call(`${platform}-job-${phase}.json`,['api',`repos/${repo}/actions/jobs/${id}`]);
}
console.log(JSON.stringify({phase,capturedAt:new Date().toISOString(),pr:pr.number,head:pr.headRefOid,base:pr.baseRefOid,merge:pr.potentialMergeCommit.oid,run:run.databaseId,status:run.status,conclusion:run.conclusion,jobs:run.jobs.filter(j=>[118083116207,118083116225].includes(j.databaseId)).map(j=>({id:j.databaseId,name:j.name,status:j.status,conclusion:j.conclusion,activeSteps:j.steps.filter(s=>s.status==='in_progress').map(s=>s.name)}))}));
