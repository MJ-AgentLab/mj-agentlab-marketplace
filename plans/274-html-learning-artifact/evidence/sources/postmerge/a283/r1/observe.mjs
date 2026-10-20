import {spawn} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/,'$1'));
const repo='MJ-AgentLab/mj-agentlab-marketplace';
const phase=process.argv[2]||'initial';
const dir=path.join(root,phase); fs.mkdirSync(dir,{recursive:true});
const requests=[
 ['pr284',`repos/${repo}/pulls/284`],
 ...['39363773472','39363773424','39363755336'].flatMap(id=>[
  [`run-${id}`,`repos/${repo}/actions/runs/${id}`],
  [`jobs-${id}`,`repos/${repo}/actions/runs/${id}/jobs?per_page=100`]
 ]),
 ['git-head',`repos/${repo}/git/commits/318db5a5660920f4fcd95f0f96c352d012514815`],
 ['git-base',`repos/${repo}/git/commits/e3dc40f734fc972e05956da3e908091e09963675`],
 ['git-merge',`repos/${repo}/git/commits/ac34c52c0eab22368e5e2737ee59241f5aad2912`],
 ['checks-head',`repos/${repo}/commits/318db5a5660920f4fcd95f0f96c352d012514815/check-runs?per_page=100`]
];
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const results=await Promise.all(requests.map(async([name,endpoint])=>{
 const startedAt=new Date().toISOString(); const args=['api','--method','GET',endpoint];
 const child=spawn('gh',args,{shell:false}); const out=[],err=[];
 child.stdout.on('data',b=>out.push(b)); child.stderr.on('data',b=>err.push(b));
 let timedOut=false; const timer=setTimeout(()=>{timedOut=true;child.kill()},60000);
 const result=await new Promise(resolve=>{child.on('error',e=>resolve({code:null,error:String(e)}));child.on('close',(code,signal)=>resolve({code,signal}))});clearTimeout(timer);
 const stdout=Buffer.concat(out),stderr=Buffer.concat(err);
 fs.writeFileSync(path.join(dir,`${name}.stdout.raw`),stdout);fs.writeFileSync(path.join(dir,`${name}.stderr.raw`),stderr);
 const row={name,command:'gh',args,startedAt,endedAt:new Date().toISOString(),...result,timedOut,stdout:{bytes:stdout.length,sha256:hash(stdout)},stderr:{bytes:stderr.length,sha256:hash(stderr)}};
 let data;try{data=JSON.parse(stdout)}catch{}
 if(name.startsWith('run-'))row.snapshot={id:data?.id,name:data?.name,path:data?.path,event:data?.event,status:data?.status,conclusion:data?.conclusion,head_sha:data?.head_sha,created_at:data?.created_at,updated_at:data?.updated_at,run_attempt:data?.run_attempt};
 if(name.startsWith('jobs-'))row.snapshot=data?.jobs?.map(j=>({id:j.id,name:j.name,status:j.status,conclusion:j.conclusion,started_at:j.started_at,completed_at:j.completed_at,steps:j.steps?.map(s=>({name:s.name,status:s.status,conclusion:s.conclusion,number:s.number}))}));
 if(name==='pr284')row.snapshot={draft:data?.draft,state:data?.state,mergeable:data?.mergeable,mergeable_state:data?.mergeable_state,head:data?.head?.sha,base:data?.base?.sha,merge_commit_sha:data?.merge_commit_sha};
 if(name.startsWith('git-'))row.snapshot={sha:data?.sha,tree:data?.tree?.sha,parents:data?.parents?.map(p=>p.sha)};
 return row;
}));
fs.writeFileSync(path.join(dir,'transport.json'),JSON.stringify({phase,completedAt:new Date().toISOString(),results},null,2)+'\n');
console.log(JSON.stringify(results.map(({name,code,snapshot,stderr})=>({name,code,snapshot:Array.isArray(snapshot)?snapshot.map(j=>({id:j.id,name:j.name,status:j.status,conclusion:j.conclusion,active:j.steps.filter(s=>s.status==='in_progress'||s.conclusion==='failure')})):snapshot,stderrBytes:stderr.bytes})),null,2));
