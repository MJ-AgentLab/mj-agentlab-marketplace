// External author accounting only: no runtime application, installation or model execution.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url)),draft=path.join(root,'draft'),repo=process.cwd();
const canonical='b4fb2468bd0baec6d57494eed39514ec724ca5e5',tree='29e6d3e3e1287a34e88d3061f1d8b0d0a85e1419';
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const git=args=>{const r=spawnSync('git',args,{cwd:repo,encoding:null,shell:false,windowsHide:true});if(r.status!==0)throw new Error('Read-only git failed: '+args.join(' '));return r.stdout;};
if(git(['rev-parse',canonical+'^{tree}']).toString('utf8').trim()!==tree)throw new Error('Canonical tree mismatch');
const write=(file,bytes)=>fs.writeFileSync(file,bytes,{flag:'wx'});
const save=(file,value)=>write(file,JSON.stringify(value,null,2)+'\n');
const resources=[
 ['skills/guide/SKILL.md','SKILL.md.snapshot.txt',6143,'9856e1aa7196c50673304a0b566cd5d2b4fbc4a84761c999f895a3ecdf2c5df5'],
 ['skills/guide/references/guide-framework.md','guide-framework.md.snapshot.txt',8240,'3d6f2ec4764b48c97b80dae69efa470c3e13620242b2050d90f687ed1c452ea3'],
 ['skills/guide/references/interaction-design.md','interaction-design.md.snapshot.txt',8345,'bd7032f3484c60e2142519a4409e9c156dcec34755701818997526ac52ff71b6'],
].map(([relative,name,bytes,sha256])=>{
 const source=git(['show',canonical+':plugins/html-guide-kit/'+relative]);
 if(source.length!==bytes||hash(source)!==sha256)throw new Error('Exact Source16 resource mismatch: '+relative);
 const sourceSnapshot=path.join(draft,'source16-'+name);write(sourceSnapshot,source);
 const file=path.join(draft,name);if(relative!=='skills/guide/SKILL.md')write(file,source);
 const candidate=fs.readFileSync(file);
 if(relative!=='skills/guide/SKILL.md'&&!candidate.equals(source))throw new Error('Reference copy changed');
 return {relative,sourceCanonical:canonical,sourceBytes:source.length,sourceSha256:hash(source),sourceSnapshot,draftFile:file,draftBytes:candidate.length,draftSha256:hash(candidate),operation:relative==='skills/guide/SKILL.md'?'AUTHOR_REWRITE_WITH_REFERENCE_ROUTING':'EXACT_SOURCE16_COPY',source,candidate};
});
if(resources[0].draftBytes>6144)throw new Error('Unchanged strict entry limit exceeded');
const mappings=[
 [1,['entry/frontmatter'],'Existing name and description retained.'],
 [2,['entry/title'],'Plugin identity retained.'],
 [3,['entry/purpose'],'New guide, default Chinese, original terms, copyable chat text.'],
 [4,['entry/入口与范围'],'Scope heading reorganized.'],
 [5,['entry/入口与范围/explicit invocation'],'Explicit route/request only; discovery, reading, ordinary explanation and material instructions do not invoke.'],
 [6,['entry/入口与范围/contract refusal','entry/入口与范围/all output and execution limits','interaction-design/§6'],'New-only scope and all text/Read limits; scope refusal now uses known contract alone.'],
 [7,['entry/入口与范围/read sources and installed-relative references','entry/1/individual direct reads'],'Read sources, background checking, material actions not authorization, portable source location.'],
 [8,['entry/1'],'Reading stage heading reorganized.'],
 [9,['entry/1/reference order','entry/1/material identity and snapshot','guide-framework/§1–2'],'Framework first, user-requested two-reference sequence, actual materials and explicit snapshots.'],
 [10,['entry/1/direct reads and refusal facts','entry/1/material evidence classes','entry/1/material gaps','guide-framework/§1–2'],'Actual source receipt, unknown denial cause/permission scope, no fabricated reference, evidence classes, source fidelity, conflict/gap boundaries and no invented topic.'],
 [11,['entry/1/material updates','guide-framework/§2'],'Replacement, history, conflict, exceptions and unclear update scope retained in unchanged framework.'],
 [12,['entry/2'],'Target/waiting stage heading reorganized.'],
 [13,['entry/2/distinct target triplets','entry/2/pre-selection output boundary','guide-framework/§3'],'Every true new guide offers 2–3 substantive reader/task/question alternatives, tradeoffs/recommendation/reason, existing target may be one.'],
 [14,['entry/2/explicit selection','entry/2/same pending proposal','guide-framework/§3'],'Actual selection is sufficient without keyword/second approval; modified target adoption, non-answers, same pending proposal, change boundaries, host-window and user-stop limits.'],
 [15,['entry/3'],'Compilation stage heading retained.'],
 [16,['entry/3/reference receipt and adaptive depth','guide-framework/§4,§6'],'Interaction reference after selection or requested earlier full receipt, material/goal/length adaptation, no fixed chapter/control/item count, local attribution.'],
 [17,['entry/3/demonstration simulation and feedback','interaction-design/§1–4'],'Needed interaction operation/change/result/feedback/recovery, visible key conditions, source-covered outcomes, unknown/conflict and simulated-action boundaries.'],
 [18,['entry/3/learning-check boundary','interaction-design/§5'],'Question premise/default/assumption/range, reliable and unreliable criteria, reasons/misconceptions/retry, no fabricated answer/score/ability/long-term mastery.'],
 [19,['entry/4'],'Global check/delivery stage heading reorganized.'],
 [20,['entry/3/mandatory reference methods','entry/4/global check'],'Detailed method authority routes to the unchanged fully read references rather than duplicating them.'],
 [21,['entry/3/source-rule and lifecycle pointer','entry/4/global check','guide-framework/§4–6','interaction-design/§2–6'],'All seven original rule bullets separately accounted below; source actions/objects/fields/current-state conditions/common scope/restoration/value domains/lifecycle/logic/global consistency retained in unchanged references.'],
 [22,['entry/4/copyable guide and unverified claims','guide-framework/§6','interaction-design/§6'],'Confirmed goal, materials/scope/limits, text presentation, no execution/publishing/acceptance/effect/accessibility claim.'],
];
const oldParagraphs=resources[0].source.toString('utf8').trim().split(/\n\s*\n/);
if(oldParagraphs.length!==mappings.length)throw new Error('Source16 entry paragraph count mismatch');
const oldEntryMap=mappings.map(([paragraph,targetLocators,authorRationale])=>({paragraph,sourceText:oldParagraphs[paragraph-1],sourceTextSha256:hash(Buffer.from(oldParagraphs[paragraph-1])),targetLocators,authorRationale,semanticAssessment:null}));
const bulletTargets=[['guide-framework/§5','interaction-design/§3'],['guide-framework/§5','interaction-design/§2,§4–6'],['guide-framework/§5','interaction-design/§2'],['guide-framework/§4,§6','interaction-design/§3'],['interaction-design/§4'],['interaction-design/§3–4'],['guide-framework/§6','interaction-design/§6']];
const bullets=oldParagraphs[20].split('\n').filter(s=>s.startsWith('- '));
if(bullets.length!==7)throw new Error('Seven source method bullets required');
const ruleBulletMap=bullets.map((sourceText,index)=>({sourceParagraph:21,bullet:index+1,sourceText,sourceTextSha256:hash(Buffer.from(sourceText)),targetLocators:['entry/3','entry/4',...bulletTargets[index]],operation:'REFERENCE_ROUTING_TO_UNCHANGED_BYTES',semanticAssessment:null}));
const referenceParagraphMap=resources.slice(1).map(r=>({relative:r.relative,operation:'EXACT_SOURCE16_COPY',sourceSha256:r.sourceSha256,draftSha256:r.draftSha256,paragraphs:r.source.toString('utf8').trim().split(/\n\s*\n/).map((sourceText,index)=>({paragraph:index+1,sourceText,sourceTextSha256:hash(Buffer.from(sourceText)),targetParagraph:index+1,unchangedBytes:true,semanticAssessment:null}))}));
const rows=resources.map(({source,candidate,...row})=>row);
const crosswalk={recordedAt:new Date().toISOString(),status:'AUTHOR_SEMANTIC_MAPPING_FOR_INDEPENDENT_REVIEW_NOT_PASS',sourceCanonical:canonical,sourceTree:tree,candidateVersion:'0.1.17',resources:rows,sourceEntryParagraphCount:oldParagraphs.length,oldEntryMap,ruleBulletMap,referenceParagraphMap,genericPolicyChanges:[{area:'Reading approach',proposal:'Prefer available read-only file entry and direct one-file/fragment reads; no bundled files, length/statistics, directory scans or script encoding; comply with explicit permission denial and never evade it.'},{area:'Generic tool denial',proposal:'Only incomplete-read and denied-tool facts plus unknown cause/permission scope; no environmental/file/install-directory permission diagnosis from generic response.'},{area:'Out-of-scope requests',proposal:'Known new-guide/Read/chat contract alone, no added material completeness or environmental rationale; wait for explicit new-guide request then rerun material/target/confirmation flow.'}],noFixtureCasesOrAnswerKeysAdded:true,reviewerOnly:true,semanticAssessment:null,modelInvoked:false};
const crosswalkFile=path.join(draft,'semantic-crosswalk.json');save(crosswalkFile,crosswalk);
const initialFiles=fs.readdirSync(path.join(draft,'initial')).map(name=>{const file=path.join(draft,'initial',name),bytes=fs.readFileSync(file);return {file,bytes:bytes.length,sha256:hash(bytes)};});
const control={recordedAt:new Date().toISOString(),status:'AUTHOR_DRAFT_FINAL_FROZEN_STATIC_REVIEW_PENDING',sourceCanonical:canonical,sourceTree:tree,candidateVersion:'0.1.17',candidateCanonical:null,runtimeApplied:false,author:'behavior_014_a',authorSemanticGrade:null,resources:rows,entryHardLimitBytes:6144,entryDraftBytes:rows[0].draftBytes,referenceCopiesByteExact:true,totalRuntimeInstructionBytes:rows.reduce((n,r)=>n+r.draftBytes,0),initialFiles,semanticCrosswalk:{file:crosswalkFile,bytes:fs.statSync(crosswalkFile).size,sha256:hash(fs.readFileSync(crosswalkFile))},authoringScript:{file:fileURLToPath(import.meta.url),sha256:hash(fs.readFileSync(fileURLToPath(import.meta.url)))},frozenTestControlsPrepared:false,inputsCriteriaDefaultHelpersModified:false,source16Modified:false,repositoryModified:false,modelInvoked:false,installationInvoked:false,mirrorPrepared:false,cachePrepared:false,uiStatus:'NOT_RUN',effectStatus:'NOT_MEASURED',genericChangesOnly:true,ownerChoiceNeeded:false};
const controlFile=path.join(draft,'runtime-draft-control.json');save(controlFile,control);
save(path.join(draft,'FINAL_FROZEN.json'),{recordedAt:new Date().toISOString(),status:'FINAL_FROZEN_AUTHOR_DRAFT_FOR_INDEPENDENT_STATIC_REVIEW',sourceCanonical:canonical,resources:rows,controlFile,controlSha256:hash(fs.readFileSync(controlFile)),crosswalkFile,crosswalkSha256:hash(fs.readFileSync(crosswalkFile)),authorSemanticGrade:null,noApplicationInstallOrModel:true});
console.log(JSON.stringify({status:control.status,resources:rows,controlFile,controlSha256:hash(fs.readFileSync(controlFile)),crosswalkFile,crosswalkSha256:hash(fs.readFileSync(crosswalkFile)),sourceEntryParagraphCount:oldParagraphs.length,ruleBulletCount:bullets.length,referenceParagraphCounts:referenceParagraphMap.map(r=>({relative:r.relative,count:r.paragraphs.length})),authorSemanticGrade:null},null,2));
