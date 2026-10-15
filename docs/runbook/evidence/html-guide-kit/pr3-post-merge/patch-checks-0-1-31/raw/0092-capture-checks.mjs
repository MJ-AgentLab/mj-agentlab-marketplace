import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const repo='C:/Users/Admin/.codex/worktrees/html-guide-acceptance/develop';
const out=path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1'));
const require=createRequire(path.join(repo,'package.json'));
const spawn=require('cross-spawn');
const sha=b=>createHash('sha256').update(b).digest('hex');
function save(name,value){fs.writeFileSync(path.join(out,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});}
async function capture(name,command,args){
 const startedAt=new Date().toISOString();
 const streams={stdout:fs.openSync(path.join(out,name+'.stdout.txt'),'wx'),stderr:fs.openSync(path.join(out,name+'.stderr.txt'),'wx')};
 const child=spawn(command,args,{cwd:repo,env:process.env,stdio:['ignore','pipe','pipe']});
 let exit=null,error=null;
 child.stdout.on('data',b=>fs.writeSync(streams.stdout,b));
 child.stderr.on('data',b=>fs.writeSync(streams.stderr,b));
 child.on('error',e=>error={name:e.name,message:e.message,code:e.code??null});
 child.on('exit',(code,signal)=>exit={code,signal,at:new Date().toISOString()});
 return await new Promise(resolve=>child.on('close',(code,signal)=>{
  fs.closeSync(streams.stdout);fs.closeSync(streams.stderr);
  const logs={};for(const key of ['stdout','stderr']){const b=fs.readFileSync(path.join(out,name+'.'+key+'.txt'));logs[key]={bytes:b.length,sha256:sha(b)};}
  const result={name,command,args,cwd:repo,startedAt,exit,close:{code,signal,at:new Date().toISOString()},error,logs};
  save(name+'.result.json',result);process.stdout.write(JSON.stringify(result)+'\n');resolve(result);
 }));
}
const mode=process.argv[2];
if(mode==='eof'){
 const check=await capture('original-diff-check','git',['diff','--check']);
 const target=path.join(repo,'AGENTS.md');const before=fs.readFileSync(target);
 fs.writeFileSync(path.join(out,'AGENTS.before-eof.snapshot.txt'),before,{flag:'wx'});
 const text=before.toString('utf8');const lf=text.replace(/\r\n/g,'\n');
 if(!/\n\n$/.test(lf))throw new Error('Expected existing blank EOF not observed');
 const after=Buffer.from(lf.replace(/\n+$/,'')+'\n');fs.writeFileSync(target,after);
 fs.writeFileSync(path.join(out,'AGENTS.after-eof.snapshot.txt'),after,{flag:'wx'});
 const crlf=Buffer.from(after.toString('utf8').replace(/\n/g,'\r\n'));
 const receipt={status:'DOCUMENT_ONLY_WHITESPACE_CORRECTION',originalDiffCheck:check,relative:'AGENTS.md',before:{bytes:before.length,sha256:sha(before)},after:{bytes:after.length,sha256:sha(after),windowsCRLFBytes:crlf.length},runtimeChanged:false,otherTwelveApprovedTargetsChanged:false,recordedAt:new Date().toISOString()};
 save('AGENTS-eof-correction.json',receipt);process.stdout.write(JSON.stringify(receipt)+'\n');
 const revised=await capture('revised-diff-check','git',['diff','--check']);if(revised.close.code!==0)process.exitCode=1;
}else if(mode==='fast'){
 const entries=[
  ['quick','C:/Users/Admin/.codex/worktrees/html-guide-acceptance/tracking/html-guide-validator-025/Scripts/python.exe',['C:/Users/Admin/.codex/skills/.system/skill-creator/scripts/quick_validate.py',path.join(repo,'plugins/html-guide-kit/skills/guide')]],
  ['docs65','D:/Development/nodejs/node.exe',['--test','tests/documentation-contract.test.mjs','tests/check-a6.test.mjs']],
  ['strict','npm',['run','validate']],
  ['check147','npm',['run','check']]
 ];
 for(const [name,command,args] of entries){const r=await capture(name,command,args);if(r.error||r.exit?.code!==0||r.close.code!==0){process.exitCode=1;break;}}
}else if(mode==='full'){
 const r=await capture('full346','npm',['test']);if(r.error||r.exit?.code!==0||r.close.code!==0)process.exitCode=1;
}else throw new Error('Expected eof, fast, or full');
