import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const root='C:/Users/Admin/.codex/worktrees/html-learning-artifact/develop';
const temp='C:/Users/Admin/AppData/Local/Temp';
const f=path.join(root,'AGENTS.md');
const old=fs.readFileSync(f);
const replacement='HTML0.1.38/#283已合，8.3.3未发布。同私有Sitev2及证据/缺口见[任务274](plans/274-html-learning-artifact/INDEX.md)。';
const next=old.toString('utf8').replace(/HTML0\.1\.37\/site随#278[^\r\n]*/,replacement).replace(/\r\n/g,'\n');
if(next===old.toString('utf8'))throw Error('No budget repair');
const lf=Buffer.from(next),crlf=Buffer.from(next.replace(/\n/g,'\r\n'));
if(Math.max(lf.length,crlf.length)>=16000)throw Error('Need larger safe margin '+JSON.stringify({lf:lf.length,crlf:crlf.length}));
const result={schemaVersion:1,capturedAt:new Date().toISOString(),before:{lf:old.length,crlf:Buffer.byteLength(old.toString('utf8').replace(/\r?\n/g,'\r\n'))},after:{lf:lf.length,crlf:crlf.length,limit:16384},method:'Real strict validator executes against LF then CRLF AGENTS in the isolated release worktree; finally restore the intended LF bytes. No validator/threshold/global Git configuration change.',runs:[]};
fs.writeFileSync(f,lf);
try {
  for(const [label,bytes] of [['lf',lf],['crlf',crlf]]){
    fs.writeFileSync(f,bytes);
    const r=spawnSync(process.execPath,['scripts/validate-portable.mjs'],{cwd:root,encoding:null,maxBuffer:5*1024*1024});
    fs.writeFileSync(`${temp}/html-learning-274-release833-budget-${label}.stdout.raw`,r.stdout||Buffer.alloc(0));
    fs.writeFileSync(`${temp}/html-learning-274-release833-budget-${label}.stderr.raw`,r.stderr||Buffer.alloc(0));
    result.runs.push({representation:label,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),status:r.status,signal:r.signal,error:r.error?.message??null});
    if(r.status!==0)throw Error('Strict validator failed '+label);
  }
}finally{fs.writeFileSync(f,lf);fs.writeFileSync(`${temp}/html-learning-274-release833-budget-repair.json`,JSON.stringify(result,null,2)+'\n');}
console.log(JSON.stringify(result));
