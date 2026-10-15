// Records one target already selected by the operator reading actual output.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {spawnSync} from 'node:child_process';
const [batchFile,id,turnArgument,label,title,nextTitle,reason]=process.argv.slice(2),sourceTurn=Number(turnArgument);
if(!batchFile||!id||!Number.isInteger(sourceTurn)||!label||!title||!nextTitle||!reason)throw Error('Actual manual fields required');
const batch=JSON.parse(fs.readFileSync(batchFile)),attempt=batch.cases[id]?.attempts.at(-1),turn=attempt?.turns[sourceTurn-1];
if(turn?.transportStatus!=='COMPLETE'||(attempt.selection&&sourceTurn<=(attempt.selection.sourceTurn??1)))throw Error('Unfrozen complete output required');
const bytes=fs.readFileSync(turn.outputFile),text=bytes.toString('utf8'),start=text.indexOf(title),end=text.indexOf(nextTitle,start+title.length);
if(start<0||end<=start||text.indexOf(title,start+title.length)>=0)throw Error('Exact unique manually read heading boundaries required');
const excerpt=text.slice(start,end).trim(),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
if(!excerpt.includes(label)||!excerpt.includes('读者')||!excerpt.includes('任务')||!excerpt.includes('理解问题'))throw Error('One actual complete triplet required');
const dir=path.join(path.dirname(batchFile),'root-manual-selection');fs.mkdirSync(dir,{recursive:true});
const quoteFile=path.join(dir,id+'-turn-'+sourceTurn+'.quote.txt'),auditFile=path.join(dir,id+'-turn-'+sourceTurn+'.audit.json');
fs.writeFileSync(quoteFile,excerpt+'\n',{flag:'wx'});
const args=[path.join(batch.reviewerRoot,'harness.mjs'),'choose','--batch',batchFile,'--variant',id,'--turn',String(sourceTurn),'--label',label,'--quote-file',quoteFile];
const result=spawnSync(process.execPath,args,{encoding:'utf8',shell:false,windowsHide:true});process.stdout.write(result.stdout);process.stderr.write(result.stderr);
fs.writeFileSync(auditFile,JSON.stringify({recordedAt:new Date().toISOString(),operator:'root',canonicalSha:batch.source.canonicalSha,variant:id,uuid:attempt.threadId,sourceTurn,label,exactTargetHeading:title,exactNextHeading:nextTitle,sourceOutput:turn.outputFile,sourceSha256:hash(bytes),quoteFile,quoteSha256:hash(fs.readFileSync(quoteFile)),reason,method:'MANUAL_ACTUAL_HEADING_AND_SINGLE_COMPLETE_TRIPLET',automaticSelection:false,noAnswerKeySentToModel:true,noSemanticGrade:true,actualChooseExit:result.status},null,2)+'\n',{flag:'wx'});
if(result.status!==0)process.exitCode=result.status??1;
