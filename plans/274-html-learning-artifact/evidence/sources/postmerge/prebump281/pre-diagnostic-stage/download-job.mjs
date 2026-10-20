import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import{execFileSync}from'node:child_process';
const root=path.resolve(process.argv[2]),platform=process.argv[3];
const jobs={linux:118195195093,windows:118195194932};const id=jobs[platform];if(!id)throw new Error('unknown platform');
const metadata=execFileSync('gh',['api',`repos/MJ-AgentLab/mj-agentlab-marketplace/actions/jobs/${id}`],{windowsHide:true,maxBuffer:25*1024*1024});
fs.writeFileSync(path.join(root,`${platform}-job-completed.json`),metadata);
const job=JSON.parse(metadata);if(job.status!=='completed')throw new Error('job is not completed yet');
const bytes=execFileSync('gh',['api',`repos/MJ-AgentLab/mj-agentlab-marketplace/actions/jobs/${id}/logs`],{windowsHide:true,maxBuffer:25*1024*1024});
fs.writeFileSync(path.join(root,`${platform}-job.log`),bytes);
const receipt={platform,jobId:id,downloadedAt:new Date().toISOString(),status:job.status,conclusion:job.conclusion,method:`gh api repos/MJ-AgentLab/mj-agentlab-marketplace/actions/jobs/${id}/logs`,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};fs.writeFileSync(path.join(root,`${platform}-log-receipt.json`),JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt));

