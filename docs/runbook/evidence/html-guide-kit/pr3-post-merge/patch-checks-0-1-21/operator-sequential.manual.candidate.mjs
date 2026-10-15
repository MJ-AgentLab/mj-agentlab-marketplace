// Operator-only scheduling: no semantic grade, answer-key access, automatic retry, or process termination.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const directory=path.dirname(fileURLToPath(import.meta.url));
const [kind,batchArgument,...extra]=process.argv.slice(2);
if(!['blocking','expanded','continuous-supplement'].includes(kind)||!batchArgument)throw new Error('kind and existing batch required');
if(extra.length!==0&&(extra.length!==2||extra[0]!=='--pause-file'))throw new Error('Optional --pause-file requires one reviewer-only marker');
const batchFile=path.resolve(batchArgument),root=path.join(directory,kind),recordRoot=path.dirname(batchFile),pauseFile=path.resolve(extra[1]??path.join(recordRoot,'operator-pause.flag'));
const normalized=p=>path.resolve(p).toLowerCase();
if(!normalized(batchFile).startsWith(normalized(path.join(root,'runs'))+path.sep))throw new Error('Batch must be inside this kind reviewer run directory');
if(!normalized(pauseFile).startsWith(normalized(directory)+path.sep))throw new Error('Pause marker must stay reviewer-only');
const load=()=>JSON.parse(fs.readFileSync(batchFile,'utf8')),plan=JSON.parse(fs.readFileSync(load().planFile,'utf8'));
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex'),operatorSha256=hash(fs.readFileSync(fileURLToPath(import.meta.url)));
async function invoke(file,args){await new Promise((resolve,reject)=>{const proc=spawn(process.execPath,[path.join(root,file),...args],{stdio:['ignore','pipe','pipe'],shell:false,windowsHide:true});proc.stdout.on('data',s=>process.stdout.write(s));proc.stderr.on('data',s=>process.stderr.write(s));proc.on('error',reject);proc.on('close',code=>code===0?resolve():reject(new Error('operator command exited '+code+'; no retry')));});}
async function pauseAtBoundary(boundaryVariant){
 if(!fs.existsSync(pauseFile))return false;
 const marker=fs.readFileSync(pauseFile),batch=load();
 await invoke('record-native-loading.mjs',[batchFile]);await invoke('harness.mjs',['inspect','--batch',batchFile]);await invoke('operator-observations.mjs',[batchFile]);
 const cases=Object.entries(batch.cases).map(([id,s])=>({id,plannedTurns:s.plannedTurns,executionStatus:s.executionStatus,semanticStatus:s.behaviorStatus,attempts:s.attempts.map(a=>({attemptId:a.attemptId,uuid:a.threadId,turns:a.turns.map(t=>({turn:t.turn,transportStatus:t.transportStatus}))}))}));
 const pauseRoot=path.join(recordRoot,'operator-pauses');fs.mkdirSync(pauseRoot,{recursive:true});const recordFile=path.join(pauseRoot,crypto.randomUUID()+'.json');
 fs.writeFileSync(recordFile,JSON.stringify({recordedAt:new Date().toISOString(),method:'NORMAL_RETURN_AT_TURN_OR_VARIANT_BOUNDARY',boundaryVariant,canonicalSha:batch.source.canonicalSha,packageVersion:batch.packageVersion,operatorSha256,pauseFile,pauseMarkerBytes:marker.length,pauseMarkerSha256:hash(marker),markerNeverSentToModel:true,processTerminationUsed:false,modelOrHarnessInterrupted:false,noSemanticGrade:true,effectStatus:'NOT_MEASURED',cases},null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({pausedAtTurnOrVariantBoundary:true,boundaryVariant,pauseRecord:recordFile,normalReturn:true,noSemanticGrade:true}));return true;
}
function selectionTurn(id,completedCount){if(id==='E7-post-confirmation')return completedCount>=3?3:1;if(id==='E12-restart')return completedCount>=4?4:1;return ['E7','E15'].includes(id)?2:1;}
async function main(){
 if(await pauseAtBoundary(null))return;
 for(const id of load().selectedIds){
  if(await pauseAtBoundary(null))return;
  let state=load().cases[id];if(!state.attempts.length)await invoke('harness.mjs',['start','--batch',batchFile,'--variant',id]);
  while(true){state=load().cases[id];const attempt=state.attempts.at(-1),count=attempt.turns.length;if(attempt.turns.at(-1)?.transportStatus!=='COMPLETE')throw new Error(id+' incomplete transport; original attempt retained');if(count===state.plannedTurns)break;
   if(await pauseAtBoundary(id))return;
   const upcoming=plan.variants.find(v=>v.id===id).turns[count];
   if(upcoming.includes('{label}')||upcoming.includes('{peerLabel}')||upcoming.includes('{roleConfirmation}')){const sourceTurn=selectionTurn(id,count);if(!attempt.selection||(attempt.selection.sourceTurn??1)<sourceTurn){console.log(JSON.stringify({manualSelectionPending:true,variant:id,sourceTurn,requiresPeer:upcoming.includes('{peerLabel}'),requiresRole:upcoming.includes('{roleConfirmation}'),controllerReturnedNormally:true,noModelInputSent:true}));return;}}
   await invoke('harness.mjs',['next','--batch',batchFile,'--variant',id]);
  }
  console.log(JSON.stringify({variantExecuted:id,semanticStatus:'UNKNOWN_PENDING_INDEPENDENT_REVIEW'}));await invoke('record-native-loading.mjs',[batchFile]);if(await pauseAtBoundary(id))return;
 }
 await invoke('harness.mjs',['inspect','--batch',batchFile]);await invoke('operator-observations.mjs',[batchFile]);
}
await main();
