import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawn} from 'node:child_process';
const base='C:/Users/Admin/.codex/worktrees/html-guide-acceptance';
const root=base+'/reviewer/corrections/0-1-15';
const directory=root+'/capture-diagnostic';
fs.mkdirSync(directory,{recursive:true});
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const batchFile=root+'/blocking/runs/4ea39ae8-782d-4ebb-ab80-2b02bf093757/batch.json';
const batch=JSON.parse(fs.readFileSync(batchFile));
const attempt=batch.cases['B1.1'].attempts[0],turn=attempt.turns[1];
const events=fs.readFileSync(turn.eventsFile,'utf8').trim().split('\n').map(s=>JSON.parse(s));
const session=fs.readFileSync(turn.sessionSnapshot,'utf8').trim().split('\n').map(s=>JSON.parse(s));
const original={canonical:batch.source.canonicalSha,version:batch.packageVersion,uuid:attempt.threadId,attempt:attempt.attemptId,turn:turn.turn,started:turn.started,controllerCompleted:turn.completed,transportStatus:turn.transportStatus,exitCode:turn.exitCode,timedOut:turn.timedOut,eventTypes:events.map(e=>e.type),sessionTaskCompletions:session.filter(e=>e.type==='event_msg'&&e.payload?.type==='task_complete').map(e=>({timestamp:e.timestamp,taskId:e.payload.task_id})),originals:[batchFile,turn.eventsFile,turn.sessionSnapshot,turn.stderrFile,turn.outputFile].map(file=>({file,bytes:fs.statSync(file).size,sha256:hash(fs.readFileSync(file))})),limitation:'The original capture has no process exit event timestamp. A task_complete and exitCode 0 do not establish when the process exited. Original INVALID_RUN remains unchanged.'};
async function probe(clearOnExit){
 const timeline=[],start=performance.now();
 const record=(type,details={})=>timeline.push({type,elapsedMs:Math.round(performance.now()-start),...details});
 const dummy="const {spawn}=require('node:child_process');spawn(process.execPath,['-e','setTimeout(()=>{},1800)'],{stdio:'inherit',windowsHide:true});process.stdout.write('dummy_completed\\n');process.exit(0);";
 return new Promise(resolve=>{
  const child=spawn(process.execPath,['-e',dummy],{shell:false,windowsHide:true,stdio:['pipe','pipe','pipe']});
  let timedOut=false,stdout='',stderr='';
  const timer=setTimeout(()=>{timedOut=true;record('timer',{killReturned:child.kill()});},350);
  child.stdout.on('data',s=>{stdout+=s;record('stdout');});
  child.stderr.on('data',s=>{stderr+=s;record('stderr');});
  child.on('exit',(code,signal)=>{record('exit',{code,signal});if(clearOnExit)clearTimeout(timer);});
  child.on('close',(code,signal)=>{clearTimeout(timer);record('close',{code,signal});resolve({clearOnExit,timedOut,code,signal,stdout,stderr,timeline,noModelInvocation:true});});
  child.stdin.end();
 });
}
const probes=[await probe(false),await probe(true)];
const report={recordedAt:new Date().toISOString(),original,probes,provedHarnessDefect:probes[0].code===0&&probes[0].timedOut&&probes[0].timeline.some(e=>e.type==='exit'&&e.elapsedMs<350)&&probes[1].code===0&&!probes[1].timedOut,actualIncidentCause:'Not established: original exit timestamp was not captured.',noModelRetry:true,noRuntimeMutation:true,noOriginalMutation:true};
fs.writeFileSync(directory+'/process-lifecycle.json',JSON.stringify(report,null,2)+'\n',{flag:'wx'});
fs.copyFileSync(new URL(import.meta.url),directory+'/diagnose.mjs',fs.constants.COPYFILE_EXCL);
console.log(JSON.stringify({report:directory+'/process-lifecycle.json',provedHarnessDefect:report.provedHarnessDefect,originalTransport:original.transportStatus,probes:probes.map(p=>({clearOnExit:p.clearOnExit,timedOut:p.timedOut,code:p.code,timeline:p.timeline}))}));
