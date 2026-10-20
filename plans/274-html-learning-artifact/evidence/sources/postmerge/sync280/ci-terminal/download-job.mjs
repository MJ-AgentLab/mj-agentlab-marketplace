import fs from 'node:fs';import path from 'node:path';import{execFileSync}from'node:child_process';
const root=path.resolve(process.argv[2]),platform=process.argv[3],jobs={linux:118149991325,windows:118149991324},id=jobs[platform];if(!id)throw new Error('Unknown platform');
const meta=execFileSync('gh',['api',`repos/MJ-AgentLab/mj-agentlab-marketplace/actions/jobs/${id}`],{windowsHide:true,maxBuffer:25*1024*1024}),job=JSON.parse(meta);if(job.run_id!==39279114820||job.status!=='completed'||job.conclusion!=='success')throw new Error('This exact PR run job is not terminal success');
fs.writeFileSync(path.join(root,`${platform}-job-completed.json`),meta,{flag:'wx'});
const startedAt=new Date().toISOString(),args=['api',`repos/MJ-AgentLab/mj-agentlab-marketplace/actions/jobs/${id}/logs`],bytes=execFileSync('gh',args,{windowsHide:true,maxBuffer:30*1024*1024});
fs.writeFileSync(path.join(root,`${platform}-job.log`),bytes,{flag:'wx'});
fs.writeFileSync(path.join(root,`${platform}-download-receipt.json`),JSON.stringify({platform,jobId:id,runId:job.run_id,status:job.status,conclusion:job.conclusion,startedAt,endedAt:new Date().toISOString(),method:'gh api exact completed job /logs; raw returned bytes retained without transformation',args,bytes:bytes.length,hashes:'Deferred until all capture/download/extraction processes exit; final manifest hashes stable files.'},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({status:'DOWNLOADED',platform,jobId:id,bytes:bytes.length}));
