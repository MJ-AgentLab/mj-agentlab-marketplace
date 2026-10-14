// Source18 DRAFT_ONLY, exact Source17 baseline plus trigger-attribution clarification.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url)),draft=path.join(root,'draft'),repo=process.cwd();
const canonical='5bf3edf7e4c7ded20f9344ecfe4fbcae9104330b',tree='67663002e90e6e532f36fbd6377a8cfc09f50ddf';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const git=args=>{const r=spawnSync('git',args,{cwd:repo,encoding:null,shell:false,windowsHide:true});if(r.status!==0)throw new Error('Read-only exact git failed');return r.stdout;};
if(fs.existsSync(draft))throw new Error('Draft directory must be new');
if(git(['rev-parse',canonical+'^{tree}']).toString('utf8').trim()!==tree)throw new Error('Source17 tree mismatch');
fs.mkdirSync(draft);
const changesByRelative={
 'skills/guide/SKILL.md':[
  ['每项结果、恢复和新增行为用全名称直接标','每项触发条件、原操作、动作/对象/字段及结果分别用全名称直接标'],
  ['源启发非规范依据。','源启发非规范依据。新增教学入口的触发须相邻标设计，复用的源恢复动作及结果独立引源；相同结果不证明相同触发，不合成源规范。'],
 ],
 'skills/guide/references/guide-framework.md':[
  ['未知对象不改新字段/记录，设计不增减源结果。','未知对象不改新字段/记录，设计不增减源结果。来源同时核对触发条件、原操作、动作、对象、字段及结果；复用原结果的新增教学触发须相邻标设计，原结果另引源，结果相同不证明触发相同。'],
 ],
 'skills/guide/references/interaction-design.md':[
  ['恢复/反馈/答案/作者清单同样回查。','恢复/反馈/答案/作者清单同样回查。新增教学入口与源动作分开写：入口触发条件相邻标教学设计，复用的恢复动作、对象、字段及结果独立列源定位；不把二者合成原规范，相同结果不证明相同触发。'],
 ],
};
const sourceRows=[
 ['skills/guide/SKILL.md','SKILL.md.snapshot.txt',5750,'480307447076827f340cd990f7f8848ab516bd3dc2c66b87ac0a8661ab979516'],
 ['skills/guide/references/guide-framework.md','guide-framework.md.snapshot.txt',8240,'3d6f2ec4764b48c97b80dae69efa470c3e13620242b2050d90f687ed1c452ea3'],
 ['skills/guide/references/interaction-design.md','interaction-design.md.snapshot.txt',8345,'bd7032f3484c60e2142519a4409e9c156dcec34755701818997526ac52ff71b6'],
];
const resources=sourceRows.map(([relative,name,expectedBytes,expectedSha256])=>{
 const source=git(['show',canonical+':plugins/html-guide-kit/'+relative]);
 if(source.length!==expectedBytes||hash(source)!==expectedSha256)throw new Error('Exact Source17 resource mismatch');
 let text=source.toString('utf8');const changeRows=[];
 for(const [before,after]of changesByRelative[relative]){const start=text.indexOf(before);if(start<0||text.indexOf(before,start+before.length)>=0)throw new Error('Exactly one generic paragraph target required');const prior=Buffer.from(text),next=Buffer.from(text.slice(0,start)+after+text.slice(start+before.length));changeRows.push({beforeText:before,afterText:after,offsetUtf8BytesZeroBased:Buffer.byteLength(text.slice(0,start)),beforeUtf8Bytes:Buffer.byteLength(before),afterUtf8Bytes:Buffer.byteLength(after),beforeStageSha256:hash(prior),afterStageSha256:hash(next),change:'GENERIC_TRIGGER_AND_RESULT_ATTRIBUTION_CLARIFICATION'});text=next.toString('utf8');}
 const candidate=Buffer.from(text),sourceSnapshot=path.join(draft,'source17-'+name),draftFile=path.join(draft,name);
 if(relative==='skills/guide/SKILL.md'&&candidate.length>6144)throw new Error('Entry strict6144 limit exceeded');
 fs.writeFileSync(sourceSnapshot,source,{flag:'wx'});fs.writeFileSync(draftFile,candidate,{flag:'wx'});
 const originalParagraphs=source.toString('utf8').trim().split(/\n\s*\n/),candidateParagraphs=text.trim().split(/\n\s*\n/);
 if(originalParagraphs.length!==candidateParagraphs.length)throw new Error('No new repeated paragraphs expected');
 const semanticMap=originalParagraphs.map((sourceText,index)=>({sourceParagraph:index+1,sourceText,sourceTextSha256:hash(Buffer.from(sourceText)),candidateParagraph:index+1,candidateText:candidateParagraphs[index],candidateTextSha256:hash(Buffer.from(candidateParagraphs[index])),operation:sourceText===candidateParagraphs[index]?'EXACT_UNCHANGED_PARAGRAPH':'GENERIC_TRIGGER_ATTRIBUTION_DELTA',semanticAssessment:null}));
 return {relative,sourceCanonical:canonical,sourceTree:tree,sourceBytes:source.length,sourceSha256:hash(source),sourceSnapshot,draftFile,draftBytes:candidate.length,draftSha256:hash(candidate),byteDelta:candidate.length-source.length,changes:changeRows,semanticMap};
});
const rows=resources.map(({semanticMap,...row})=>row);
const crosswalk={recordedAt:new Date().toISOString(),status:'AUTHOR_MAPPING_ONLY_FOR_INDEPENDENT_STATIC_REVIEW_NOT_PASS',candidateVersion:'0.1.18',sourceCanonical:canonical,sourceTree:tree,resources:rows,sourceParagraphMap:resources.map(r=>({relative:r.relative,paragraphCount:r.semanticMap.length,changedParagraphCount:r.semanticMap.filter(p=>p.operation!=='EXACT_UNCHANGED_PARAGRAPH').length,paragraphs:r.semanticMap})),genericPurpose:'Verify provenance for the trigger, original operation, action/object/field and result independently. Newly designed teaching triggers remain local design even when using a source-supported restoration result. Identical results do not prove identical trigger provenance.',allOtherSource17MethodsUnchangedByExactParagraphBytes:true,noFixtureTermsOrCaseAnswersAdded:true,noOwnerOrResearchDependenciesAdded:true,reviewerOnly:true,authorSemanticAssessment:null};
const save=(file,value)=>fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n',{flag:'wx'});
const crosswalkFile=path.join(draft,'semantic-crosswalk.json');save(crosswalkFile,crosswalk);
const control={recordedAt:new Date().toISOString(),status:'DRAFT_ONLY_FINAL_FROZEN_INDEPENDENT_STATIC_REVIEW_PENDING',candidateVersion:'0.1.18',sourceCanonical:canonical,sourceTree:tree,candidateCanonical:null,runtimeApplied:false,author:'behavior_014_a',authorSemanticGrade:null,resources:rows,entryHardLimitBytes:6144,totalDraftInstructionBytes:rows.reduce((n,r)=>n+r.draftBytes,0),deltaOnly:'Generic trigger/action/result source attribution; no trigger-specific domain examples. Prior Source17 direct reading, denial facts, contract-only refusal, target selection and full-delivery common scope all preserved.',crosswalkFile,crosswalkSha256:hash(fs.readFileSync(crosswalkFile)),authoringScript:{file:fileURLToPath(import.meta.url),sha256:hash(fs.readFileSync(fileURLToPath(import.meta.url)))},source17Modified:false,repositoryModified:false,controlsPrepared:false,inputsCriteriaDefaultOperatorManualSpecModified:false,modelInvoked:false,installationInvoked:false,mirrorPrepared:false,cachePrepared:false,clientUiStatus:'NOT_RUN',effectStatus:'NOT_MEASURED',ownerChoiceNeeded:false};
const controlFile=path.join(draft,'runtime-draft-control.json');save(controlFile,control);
save(path.join(draft,'FINAL_FROZEN.json'),{recordedAt:new Date().toISOString(),status:'FINAL_FROZEN_DRAFT_ONLY_AUTHOR_NOT_REVIEWER',resources:rows,controlFile,controlSha256:hash(fs.readFileSync(controlFile)),crosswalkFile,crosswalkSha256:hash(fs.readFileSync(crosswalkFile)),authorSemanticAssessment:null,noControlsInstallModelOrApply:true});
console.log(JSON.stringify({status:control.status,resources:rows.map(r=>({relative:r.relative,sourceBytes:r.sourceBytes,draftBytes:r.draftBytes,byteDelta:r.byteDelta,draftSha256:r.draftSha256})),controlFile,controlSha256:hash(fs.readFileSync(controlFile)),crosswalkFile,crosswalkSha256:hash(fs.readFileSync(crosswalkFile)),sourceParagraphs:crosswalk.sourceParagraphMap.map(r=>({relative:r.relative,paragraphs:r.paragraphCount,changed:r.changedParagraphCount})),authorSemanticAssessment:null,noControlsInstallModelOrApply:true},null,2));
