import fs from 'node:fs';import crypto from 'node:crypto';import path from 'node:path';
const [stage,id,status,exitArgument]=process.argv.slice(2),base='C:/Users/Admin/.codex/worktrees/html-guide-acceptance',dir=base+'/reviewer/corrections/0-1-16/blocking/runs/8018554a-75b5-482c-bf9c-801603038c9e';
if(!/^\d\d$/.test(stage)||!/^\d+$/.test(id)||!['RUNNING','COMPLETE'].includes(status))throw Error('Actual outer observation required');
const log=base+'/tracking/016-root-operator-'+stage+'.log',bytes=fs.readFileSync(log),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const record={recordedAt:new Date().toISOString(),stage,outerUnifiedExecSessionId:Number(id),actualOuterStatus:status,actualOuterExitCode:status==='COMPLETE'?Number(exitArgument):null,logSource:log,logBytesAtObservation:bytes.length,logSha256AtObservation:hash(bytes),canonicalSha:'b4fb2468bd0baec6d57494eed39514ec724ca5e5',operatorSha256:hash(fs.readFileSync(base+'/reviewer/corrections/0-1-16/operator-sequential.manual.mjs')),actualExitNotInferredFromModelOutput:true,noModelOrInputMutation:true};
fs.writeFileSync(path.join(dir,'root-outer-'+stage+'-'+status.toLowerCase()+'.json'),JSON.stringify(record,null,2)+'\n',{flag:'wx'});
if(status==='COMPLETE')fs.writeFileSync(path.join(dir,'root-outer-'+stage+'.log'),bytes,{flag:'wx'});
console.log(JSON.stringify(record));
