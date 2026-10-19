import fs from'node:fs';import path from'node:path';import{execFileSync}from'node:child_process';
const root=path.resolve(process.argv[2]),phase=process.argv[3]||'initial',repo='MJ-AgentLab/mj-agentlab-marketplace';
const call=(file,args)=>{const b=execFileSync('gh',args,{windowsHide:true,maxBuffer:30*1024*1024});fs.writeFileSync(path.join(root,file),b);return JSON.parse(b);};
const pr=call(`pr-${phase}.json`,['pr','view','279','--repo',repo,'--json','number,url,state,headRefName,headRefOid,baseRefName,baseRefOid,potentialMergeCommit']);
const run=call(`run-${phase}.json`,['run','view','39272665913','--repo',repo,'--json','databaseId,headSha,event,status,conclusion,createdAt,updatedAt,url,jobs']);
const push=call(`push-${phase}.json`,['run','view','39272636618','--repo',repo,'--json','databaseId,headSha,event,status,conclusion,createdAt,updatedAt,url,jobs']);
if(phase==='initial'||phase==='final'){
 call(`head-${phase}.json`,['api',`repos/${repo}/git/commits/${pr.headRefOid}`]);call(`merge-${phase}.json`,['api',`repos/${repo}/git/commits/${pr.potentialMergeCommit.oid}`]);
 for(const[platform,id]of[['linux',118128777317],['windows',118128777137]])call(`${platform}-job-${phase}.json`,['api',`repos/${repo}/actions/jobs/${id}`]);
}
const capture={phase,capturedAt:new Date().toISOString(),pr:pr.number,head:pr.headRefOid,base:pr.baseRefOid,merge:pr.potentialMergeCommit.oid,run:run.databaseId,status:run.status,conclusion:run.conclusion,jobs:run.jobs.filter(j=>[118128777317,118128777137].includes(j.databaseId)).map(j=>({id:j.databaseId,name:j.name,status:j.status,conclusion:j.conclusion,activeSteps:j.steps.filter(s=>s.status==='in_progress').map(s=>s.name)})),push:{id:push.databaseId,status:push.status,conclusion:push.conclusion,jobs:push.jobs.map(j=>({id:j.databaseId,name:j.name,status:j.status,conclusion:j.conclusion}))}};
fs.writeFileSync(path.join(root,`capture-${phase}.json`),JSON.stringify(capture,null,2)+'\n');console.log(JSON.stringify(capture));
