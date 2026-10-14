// Mechanical handoff using actual manually recorded headings. Never reads grading criteria or reviews.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url)),file=process.argv[2],before=fs.readFileSync(file),batch=JSON.parse(before),sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const originalHelper=path.join(root,'record-operator-handoff.mjs'),originalHelperBytes=fs.readFileSync(originalHelper);
const nativeFile=path.join(batch.recordRoot,'native-loading-observations.json'),native=JSON.parse(fs.readFileSync(nativeFile,'utf8'));
const rows=Object.entries(batch.cases).map(([id,state])=>({variant:id,plannedTurns:state.plannedTurns,originalExecutionStatus:state.executionStatus,attempts:state.attempts.map(a=>{
 const attemptDir=path.dirname(a.turns[0].inputFile),audits=fs.readdirSync(attemptDir).filter(n=>/^manual-title-audit(?:-turn-\d+)?\.json$/.test(n)).map(n=>{
  const auditFile=path.join(attemptDir,n),audit=JSON.parse(fs.readFileSync(auditFile,'utf8')),source=fs.readFileSync(audit.sourceOutput),text=source.toString('utf8'),quote=fs.readFileSync(audit.singleTripletExactExcerpt),q=quote.toString('utf8'),index=text.indexOf(q),actualHeading=text.split(/\r?\n/)[audit.actualTargetHeadingLine-1];
  const exact=index>=0&&source.length>0&&sha(source)===audit.sourceOutputSha256&&sha(quote)===audit.singleTripletExactExcerptSha256&&actualHeading===audit.actualTargetHeading&&q.startsWith(audit.actualTargetHeading)&&['读者','任务','理解问题'].every(v=>q.includes(v));
  return {auditFile,auditFileSha256:sha(fs.readFileSync(auditFile)),actualTargetHeading:audit.actualTargetHeading,actualLabel:audit.actualLabel,sourceTurn:audit.sourceTurn,actualTargetHeadingLine:audit.actualTargetHeadingLine,
   actualUuid:audit.actualUuid,sourceOutput:audit.sourceOutput,sourceOutputSha256:audit.sourceOutputSha256,singleTripletExactExcerpt:audit.singleTripletExactExcerpt,singleTripletExactExcerptSha256:audit.singleTripletExactExcerptSha256,
   exactActualHeadingAndTripletVerified:exact,semanticAssessment:null};
 });
 const no=native.observations.find(r=>r.variant===id&&r.attemptId===a.attemptId);
 return {attemptId:a.attemptId,actualUuid:a.threadId,method:a.method,selectionAudits:audits,nativeAttachments:no?.nativeAttachments??[],successfulShellReads:no?.successfulShellReads??[],
  nativeFullBodyAndCacheLocatorMatch:no?.nativeAttachments.some(n=>n.exactUtf8TrimBodyMatchesCache&&n.cachePathMatches)??false,
  turns:a.turns.map(t=>{const events=fs.readFileSync(t.eventsFile,'utf8').split(/\r?\n/).flatMap((line,i)=>line.trim()?[{line:i+1,event:JSON.parse(line)}]:[]);return {turn:t.turn,originalTransportStatus:t.transportStatus,actualIdentity:t.actualIdentity,inputFile:t.inputFile,inputSha256:sha(fs.readFileSync(t.inputFile)),inputShaMatchesOriginal:sha(fs.readFileSync(t.inputFile))===t.inputSha256,
   outputFile:t.outputFile,outputSha256:sha(fs.readFileSync(t.outputFile)),eventsFile:t.eventsFile,eventsSha256:sha(fs.readFileSync(t.eventsFile)),sessionFile:t.sessionSnapshot,sessionSha256:sha(fs.readFileSync(t.sessionSnapshot)),
   rawTransportErrors:events.filter(r=>['error','turn.failed'].includes(r.event.type)),allToolEvents:events.filter(r=>r.event.type==='item.completed'&&r.event.item?.type!=='agent_message').map(r=>({jsonlLine:r.line,itemId:r.event.item?.id,type:r.event.item?.type,status:r.event.item?.status??null,exitCode:r.event.item?.exit_code??null,command:r.event.item?.command??null,message:r.event.item?.message??null})),exitCode:t.exitCode,timedOut:t.timedOut,semanticAssessment:null};})};
})}));
const runtime=batch.runtime.map(r=>{const original=spawnSync('git',['show',batch.source.canonicalSha+':plugins/html-guide-kit/'+r.relative],{cwd:batch.source.repo,encoding:null,shell:false,windowsHide:true});if(original.status!==0)throw new Error('missing exact source');const row={relative:r.relative,sourceSha256:sha(original.stdout),mirrorSha256:sha(fs.readFileSync(path.join(batch.mirror.root,'plugins/html-guide-kit',r.relative))),cacheSha256:sha(fs.readFileSync(path.join(batch.cacheRoot,r.relative)))};if(![row.sourceSha256,row.mirrorSha256,row.cacheSha256].every(v=>v===r.sourceSha256))throw new Error('runtime bytes changed');return row;});
const turns=rows.flatMap(r=>r.attempts.flatMap(a=>a.turns));
const report={recordedAt:new Date().toISOString(),operator:'behavior_a',canonical:batch.source,packageVersion:batch.packageVersion,batchFile:file,writerStopped:true,
 counts:{selectedVariants:rows.length,actualFreshSessions:rows.reduce((n,r)=>n+r.attempts.length,0),plannedTurns:rows.reduce((n,r)=>n+r.plannedTurns,0),actualTurns:turns.length,completeTurns:turns.filter(t=>t.originalTransportStatus==='COMPLETE').length,failedOrInvalidTurns:turns.filter(t=>t.originalTransportStatus==='FAILED_OR_INVALID').length,runningTurns:turns.filter(t=>t.originalTransportStatus==='RUNNING').length,remainingNotRunTurns:rows.reduce((n,r)=>n+r.plannedTurns,0)-turns.length},
 rows,runtime,planFile:batch.planFile,planSha256:sha(fs.readFileSync(batch.planFile)),nativeObservationFile:nativeFile,nativeObservationSha256:sha(fs.readFileSync(nativeFile)),
 shortLabelControl:{originalHelper,originalHelperSha256Before:sha(originalHelperBytes),originalHelperSha256After:sha(fs.readFileSync(originalHelper)),originalHelperExecuted:false,originalHelperChanged:false,
  reason:'Original helper requires label.length>5 and label===entire heading, which would misclassify actual short A/B/2 labels as CONTROL_SOURCE_GAP. Manual-title-audit preserves full actual top-level heading and a single exact triplet; this separate accounting verifies those original bytes without changing selection or frozen inputs.',
  newHelper:fileURLToPath(import.meta.url),newHelperSha256:sha(fs.readFileSync(fileURLToPath(import.meta.url))),modelInputsAffected:false},
 rawBatchSha256Before:sha(before),rawBatchSha256After:sha(fs.readFileSync(file)),originalInputsOutputsAndResultsUnmodified:true,
 noOperatorAutomaticRetry:true,noProcessTermination:true,operatorSemanticAssessment:null,effectStatus:'NOT_MEASURED',clientUiStatus:'NOT_RUN'};
if(report.rawBatchSha256Before!==report.rawBatchSha256After)throw new Error('batch changed during accounting');
const out=path.join(batch.recordRoot,'operator-handoff-behavior-a.json');fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({out,counts:report.counts,nativeFullCount:rows.flatMap(r=>r.attempts).filter(a=>a.nativeFullBodyAndCacheLocatorMatch).length,
 allActualTitleAuditsValid:rows.flatMap(r=>r.attempts.flatMap(a=>a.selectionAudits)).every(a=>a.exactActualHeadingAndTripletVerified),semanticAssessment:null},null,2));
