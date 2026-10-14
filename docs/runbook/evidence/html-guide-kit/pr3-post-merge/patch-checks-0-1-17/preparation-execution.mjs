// Only external control copying and syntax parsing; preserve every Source16 byte.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url)),sourceRoot=path.resolve(root,'../0-1-16'),script=path.join(root,'build-controls-prep-only-behavior-a.mjs');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function inventory(dir,base=dir){const rows=[];for(const e of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,e.name);if(e.isDirectory())rows.push(...inventory(file,base));else{const bytes=fs.readFileSync(file);rows.push({relative:path.relative(base,file).replaceAll('\\','/'),bytes:bytes.length,sha256:hash(bytes)});}}return rows.sort((a,b)=>a.relative.localeCompare(b.relative));}
const before=inventory(sourceRoot),startedAt=new Date().toISOString();
fs.writeFileSync(path.join(root,'source16-before-preparation-inventory.json'),JSON.stringify({recordedAt:startedAt,sourceRoot,rows:before},null,2)+'\n',{flag:'wx'});
const result=spawnSync(process.execPath,[script],{encoding:null,shell:false,windowsHide:true,maxBuffer:32*1024*1024});
const stdout=result.stdout??Buffer.alloc(0),stderr=result.stderr??Buffer.alloc(0);
fs.writeFileSync(path.join(root,'preparation.stdout.log'),stdout,{flag:'wx'});fs.writeFileSync(path.join(root,'preparation.stderr.log'),stderr,{flag:'wx'});
const after=inventory(sourceRoot),unchanged=JSON.stringify(before)===JSON.stringify(after);
const completion={startedAt,finishedAt:new Date().toISOString(),executable:process.execPath,nodeVersion:process.version,script,scriptSha256:hash(fs.readFileSync(script)),args:[],cwd:process.cwd(),status:result.status,signal:result.signal,error:result.error?String(result.error):null,stdoutBytes:stdout.length,stdoutSha256:hash(stdout),stderrBytes:stderr.length,stderrSha256:hash(stderr),modelExecuted:false,installationExecuted:false,source16Modified:!unchanged,source16FileCount:before.length,source16ByteTotal:before.reduce((n,r)=>n+r.bytes,0),source16InventoryBeforeSha256:hash(Buffer.from(JSON.stringify(before))),source16InventoryAfterSha256:hash(Buffer.from(JSON.stringify(after))),source16Unchanged:unchanged};
fs.writeFileSync(path.join(root,'source16-after-preparation-inventory.json'),JSON.stringify({recordedAt:new Date().toISOString(),sourceRoot,rows:after,unchanged},null,2)+'\n',{flag:'wx'});
fs.writeFileSync(path.join(root,'preparation-execution.json'),JSON.stringify(completion,null,2)+'\n',{flag:'wx'});
process.stdout.write(stdout);process.stderr.write(stderr);console.log(JSON.stringify({source16FileCount:before.length,source16Unchanged:unchanged,exitCode:result.status,modelExecuted:false,installationExecuted:false},null,2));
process.exitCode=unchanged?(result.status??1):1;
