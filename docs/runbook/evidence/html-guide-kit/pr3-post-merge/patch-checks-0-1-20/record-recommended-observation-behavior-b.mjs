// Operator-only observation of an already manually read, explicit real recommendation.
// The frozen natural confirmation is never substituted or changed; no batch mutation.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const [batchFile,id,label,startHeading,endHeading]=process.argv.slice(2);
const b=JSON.parse(fs.readFileSync(batchFile,'utf8')),a=b.cases[id]?.attempts.at(-1),t=a?.turns[0];
if(t?.transportStatus!=='COMPLETE'||!label||!startHeading||!endHeading)throw new Error('Actual completed first turn and manual fields required');
const bytes=fs.readFileSync(t.outputFile),text=bytes.toString('utf8'),start=text.indexOf(startHeading),end=text.indexOf(endHeading,start+startHeading.length);
if(start<0||end<=start||!startHeading.includes('推荐'))throw new Error('Actual recommended heading boundary required');
const excerpt=text.slice(start,end);if(!excerpt.includes(label)||!['读者','使用任务','理解问题'].every(x=>excerpt.includes(x)))throw new Error('Single complete actual triplet required');
const sha=x=>crypto.createHash('sha256').update(x).digest('hex'),dir=path.dirname(t.outputFile),quoteFile=path.join(dir,'manual-recommended-triplet.txt');
fs.writeFileSync(quoteFile,excerpt,{flag:'wx'});
const audit={recordedAt:new Date().toISOString(),operator:'behavior_b',canonicalSha:b.source.canonicalSha,canonicalTree:b.source.canonicalTree,variant:id,attemptId:a.attemptId,actualUuid:a.threadId,sourceTurn:1,actualLabel:label,actualTargetHeading:startHeading,actualNextTargetHeading:endHeading,actualTargetHeadingLine:text.slice(0,start).split(/\r?\n/).length,sourceOutput:t.outputFile,sourceOutputSha256:sha(bytes),singleTripletExactExcerpt:quoteFile,singleTripletExactExcerptSha256:sha(Buffer.from(excerpt)),method:'MANUAL_ACTUAL_RECOMMENDED_HEADING_AND_SINGLE_TRIPLET_OBSERVATION',frozenNaturalConfirmation:'按你推荐的方案，我确认。',naturalConfirmationUnchanged:true,labelSubstitutionUsed:false,batchMutation:false,automaticLabelInference:false,noSemanticGrade:true};
const out=path.join(dir,'manual-recommended-observation.json');fs.writeFileSync(out,JSON.stringify(audit,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({out,actualLabel:label,noSemanticGrade:true}));
