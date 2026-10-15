import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url)),script=path.join(root,'build-controls-prep-only-behavior-a.mjs'),startedAt=new Date().toISOString();
const result=spawnSync(process.execPath,[script],{encoding:null,shell:false,windowsHide:true,maxBuffer:32*1024*1024});
const out=result.stdout??Buffer.alloc(0),err=result.stderr??Buffer.alloc(0),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
fs.writeFileSync(path.join(root,'preparation.stdout.log'),out,{flag:'wx'});fs.writeFileSync(path.join(root,'preparation.stderr.log'),err,{flag:'wx'});
fs.writeFileSync(path.join(root,'preparation-execution.json'),JSON.stringify({startedAt,finishedAt:new Date().toISOString(),executable:process.execPath,nodeVersion:process.version,script,scriptSha256:sha(fs.readFileSync(script)),args:[],cwd:process.cwd(),status:result.status,signal:result.signal,error:result.error?String(result.error):null,stdoutBytes:out.length,stdoutSha256:sha(out),stderrBytes:err.length,stderrSha256:sha(err),modelExecuted:false,installationExecuted:false,source14Modified:false},null,2)+'\n',{flag:'wx'});
process.stdout.write(out);process.stderr.write(err);process.exitCode=result.status??1;
