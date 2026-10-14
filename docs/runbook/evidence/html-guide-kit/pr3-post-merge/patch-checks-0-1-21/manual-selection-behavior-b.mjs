// Mechanical aid for an already manually read target; never chooses a target.
// Explicit heading boundaries and label are supplied by the operator, not inferred.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const [batchFile,id,sourceTurnArgument,label,actualStartHeading,actualEndHeading,operatorReason]=process.argv.slice(2),sourceTurn=Number(sourceTurnArgument);
if(!batchFile||!id||!Number.isInteger(sourceTurn)||!label||!actualStartHeading||!actualEndHeading||!operatorReason)throw new Error('All manual source fields required');
const batch=JSON.parse(fs.readFileSync(batchFile,'utf8')),attempt=batch.cases[id]?.attempts.at(-1),turn=attempt?.turns[sourceTurn-1];
if(turn?.transportStatus!=='COMPLETE'||attempt.selection)throw new Error('Completed actual output and unfrozen selection required');
const source=fs.readFileSync(turn.outputFile),text=source.toString('utf8'),start=text.indexOf(actualStartHeading),end=text.indexOf(actualEndHeading,start+actualStartHeading.length);
if(start<0||end<=start||text.indexOf(actualStartHeading,start+actualStartHeading.length)>=0)throw new Error('Exact manually identified single target boundary missing or duplicated');
const excerpt=text.slice(start,end);
if(!excerpt.includes(label)||!excerpt.includes('读者')||!excerpt.includes('任务')||!excerpt.includes('理解问题'))throw new Error('Actual single complete triplet required');
const quote=path.join(path.dirname(turn.outputFile),'manual-selection-turn-'+sourceTurn+'.txt');
fs.writeFileSync(quote,excerpt,{flag:'wx'});
const result=spawnSync(process.execPath,[path.join(batch.reviewerRoot,'harness.mjs'),'choose','--batch',batchFile,'--variant',id,'--turn',String(sourceTurn),'--label',label,'--quote-file',quote],{encoding:'utf8',shell:false,windowsHide:true});
process.stdout.write(result.stdout);process.stderr.write(result.stderr);if(result.status!==0){process.exitCode=result.status??1;}
else{
 const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
 const audit={recordedAt:new Date().toISOString(),operator:'behavior_b',canonicalSha:batch.source.canonicalSha,canonicalTree:batch.source.canonicalTree,packageVersion:batch.packageVersion,variant:id,attemptId:attempt.attemptId,actualUuid:attempt.threadId,sourceTurn,actualLabel:label,actualTargetHeading:actualStartHeading,actualNextTargetHeading:actualEndHeading,sourceOutput:turn.outputFile,sourceOutputSha256:sha(source),singleTripletExactExcerpt:quote,singleTripletExactExcerptSha256:sha(Buffer.from(excerpt)),actualTargetHeadingLine:text.slice(0,start).split(/\r?\n/).length,operatorReason,method:'MANUAL_ACTUAL_HEADING_AND_SINGLE_COMPLETE_TRIPLET',automaticLabelInference:false,scopeOrQuestionNumeralsNotUsed:true,chooseAccepted:true,modelReceivesLabelOnly:true,noSemanticGrade:true};
 fs.writeFileSync(path.join(path.dirname(turn.outputFile),'manual-title-audit.json'),JSON.stringify(audit,null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({manualAudit:path.join(path.dirname(turn.outputFile),'manual-title-audit.json'),variant:id,actualLabel:label,sourceTurn,noSemanticGrade:true}));
}
