import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync, spawnSync} from 'node:child_process';
const root='C:/Users/Admin/.codex/worktrees/html-guide-acceptance';
const repo=path.join(root,'develop'), base=path.join(root,'reviewer/corrections/0-1-33');
const baseline='4725121b05239c886bc8a9dc39cf81ec6cd35cec';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const pin=file=>({file,bytes:fs.statSync(file).size,sha256:hash(fs.readFileSync(file))});
const readJson=file=>JSON.parse(fs.readFileSync(file));
const assert=(v,m)=>{if(!v)throw Error(m);};
const git=args=>execFileSync('git',args,{cwd:repo,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
const planFile=path.join(base,'engineering-integration-draft/preview-4725121b/integration-plan.json');
const plan=readJson(planFile), scriptFile=path.join(base,'engineering-integration-draft/integrate-source33-r2.mjs');
const freezeFile=path.join(base,'DRAFT_FINAL_FROZEN.json'), freeze=readJson(freezeFile);
const inventoryFile=path.join(base,'frozen-copy-inventory.json'), inventory=readJson(inventoryFile);
assert(pin(planFile).sha256==='754def6656393fc3d92272da41bd6901a33904290360157ec2b20a19a82ddd52','Approved plan exact');
const scriptPin=pin(scriptFile);
assert(scriptPin.sha256.startsWith('b7e92')&&scriptPin.sha256.endsWith('9751'),'Root-approved script identity');
const changed=git(['diff','--name-only','-z',baseline,'--']).split('\0').filter(Boolean).sort();
assert(changed.length===13&&JSON.stringify(changed)===JSON.stringify(plan.rows.map(r=>r.relative).sort()),'Actual13 paths exact');
const rows=plan.rows.map(r=>{
 const current=pin(path.join(repo,r.relative));
 assert(current.bytes===r.proposed.bytes&&current.sha256===r.proposed.sha256,'Actual proposed bytes '+r.relative);
 assert(pin(r.before.file).sha256===r.before.sha256&&pin(r.proposed.file).sha256===r.proposed.sha256,'Original proposed snapshots');
 return {relative:r.relative,bytes:current.bytes,sha256:current.sha256};
});
assert(freeze.changedFiles===2&&freeze.changedSpans===3,'Three reviewed spans');
const resources=freeze.resources.map(r=>{
 const current=pin(path.join(repo,'plugins/html-guide-kit/skills/guide',r.relative));
 const original=fs.readFileSync(r.sourceFile), proposed=fs.readFileSync(r.draftFile);
 assert(current.bytes===r.draftBytes&&current.sha256===r.draftSha256,'Runtime freeze '+r.relative);
 assert(original.length===r.sourceBytes&&hash(original)===r.sourceSha256,'Source freeze '+r.relative);
 let forward=original.toString(), inverse=proposed.toString();
 for(const e of r.edits){assert(forward.includes(e.old),'Exact old span');forward=forward.replace(e.old,e.new);}
 for(const e of [...r.edits].reverse()){assert(inverse.includes(e.new),'Exact new span');inverse=inverse.replace(e.new,e.old);}
 assert(Buffer.from(forward).equals(proposed)&&Buffer.from(inverse).equals(original),'Entire resource exact forward/inverse');
 return {relative:'skills/guide/'+r.relative,bytes:current.bytes,sha256:current.sha256,editCount:r.edits.length};
});
for(const r of plan.protectedPins){const q=pin(path.join(repo,r.relative));assert(q.bytes===r.bytes&&q.sha256===r.sha256,'Protected bytes '+r.relative);}
const other=plan.protectedPins.filter(r=>r.relative.startsWith('plugins/')&&!r.relative.startsWith('plugins/html-guide-kit/'));
assert(plan.protectedPins.length===65&&other.length===59,'Protected65 / other59');
const tools=git(['ls-files','scripts','.github/workflows','package.json','package-lock.json']).split(/\r?\n/);
assert(tools.length===28&&plan.toolPins.length===28,'Actual28 tool collection');
for(const relative of tools){
 assert(git(['hash-object','--path='+relative,path.join(repo,relative)])===git(['rev-parse',baseline+':'+relative]),'Tool Git blob');
 const r=plan.toolPins.find(r=>r.relative===relative);
 assert(r&&pin(path.join(repo,relative)).sha256===r.sha256,'Tool raw pin');
}
function files(directory){
 let result=[];
 for(const name of fs.readdirSync(directory)){
  const file=path.join(directory,name),stat=fs.lstatSync(file);assert(!stat.isSymbolicLink(),'No original link');
  result.push(...(stat.isDirectory()?files(file):[path.resolve(file).toLowerCase()]));
 }
 return result.sort();
}
const originals=[];
for(const [version,key,count]of [['32','sourceProtectedPins',677],['31','source31ProtectedPins',472],['30','source30ProtectedPins',451],['29','source29ProtectedPins',362]]){
 const saved=inventory[key];assert(saved.length===count,'Original count');
 assert(JSON.stringify(files(path.join(root,'reviewer/corrections/0-1-'+version)))===JSON.stringify(saved.map(r=>path.resolve(r.file).toLowerCase()).sort()),'Original full set');
 for(const r of saved){const q=pin(r.file);assert(q.bytes===r.bytes&&q.sha256===r.sha256,'Original full byte pins');}
 originals.push({version,fileCount:count,fullSetAndBytesExact:true,privatePayloadParsedOrCopied:false});
}
function onlyVersion(relative,oldValue,newValue){
 const row=plan.rows.find(r=>r.relative===relative);
 const before=fs.readFileSync(row.before.file,'utf8'),current=fs.readFileSync(path.join(repo,relative),'utf8');
 assert(before.replace(oldValue,newValue)===current,'Only authorized raw version delta');
}
onlyVersion('plugins/html-guide-kit/plugin.json','"version": "0.1.32"','"version": "0.1.33"');
onlyVersion('tests/html-guide-kit.test.mjs','m.version,"0.1.32"','m.version,"0.1.33"');
const headers=plan.docTransitions.map(r=>{
 const text=fs.readFileSync(path.join(repo,r.path),'utf8'),version=text.match(/^version: (\S+)$/m)?.[1];
 assert(version===r.to,'Header exact');return {relative:r.path,version};
});
const agents=fs.readFileSync(path.join(repo,'AGENTS.md'),'utf8');
const entry=fs.readFileSync(path.join(repo,'plugins/html-guide-kit/skills/guide/SKILL.md'),'utf8');
const windowsBytes=text=>Buffer.byteLength(text.replace(/\r?\n/g,'\r\n'));
assert(agents.endsWith('\n')&&!agents.endsWith('\n\n')&&windowsBytes(agents)<=16384&&windowsBytes(entry)<=6144,'EOF / budgets');
const whitespace=spawnSync('git',['diff','--check',baseline,'--'],{cwd:repo,encoding:null,windowsHide:true});
assert(whitespace.status===0,'Actual diff whitespace');
const report={
 recordedAt:new Date().toISOString(),reviewer:'/root/precommit_014',status:'STATIC_ONLY',conclusion:'NO_STATIC_BLOCKERS',
 baseline,actualHead:git(['rev-parse','HEAD']),sourceCanonical:freeze.sourceCanonical,proposedVersion:plan.targetVersion,
 plan:pin(planFile),applicationScript:scriptPin,appliedReceipt:pin(path.join(base,'engineering-integration-draft/apply-4725121b-r2/APPLIED_RECEIPT.json')),
 runtimeFreeze:pin(freezeFile),controlFreeze:pin(path.join(base,'CONTROLS_FINAL_FROZEN.json')),
 actual13Diff:rows,resources,onlyThreeSpanForwardAndInverse:true,protected65Exact:true,other59Exact:true,toolsGitAndRaw28Exact:true,
 marketVersion:fs.readFileSync(path.join(repo,'VERSION'),'utf8').trim(),registryIconsUiPolicyInteractionUnchanged:true,
 manifestOnlyVersionAnchor:true,testOnlyVersionExpectation:true,originalEvidence:originals,protectionInventory:pin(inventoryFile),
 budgets:{AGENTS_LF:Buffer.byteLength(agents),AGENTS_Windows:windowsBytes(agents),entry_LF:Buffer.byteLength(entry),entry_Windows:windowsBytes(entry),AGENTS_EOF:'SINGLE_LF_EXACT_PLAN'},
 docHeaders:headers,fullActualDiffReadTool:'469e0e',
 AIJudgment:'Three generic entry/framework spans preserve complete parallel source actions/objects/non-field effects before field end-values while keeping scope-bound simplification, depth adaptation and existing product contract. Docs retain Source32 actual whole failure and unrun cases; no fresh behavior/client pass is claimed.',
 whitespace:{exit:whitespace.status,stdoutSha256:hash(whitespace.stdout),stderrSha256:hash(whitespace.stderr)},
 initialObserverError:pin(path.join(base,'integration-independent-c/initial-reviewer-program-error.json')),
 limits:['No tests/installation/model/UI repeated or performed by C; A owns actual engineering.','STATIC_ONLY does not prove behavior, native clients/effects, CI, GitHub independent approval or merge readiness.'],noRepositoryMutation:true
};
assert(report.marketVersion==='8.3.0','Market unchanged');
const output=path.join(base,'integration-independent-c/final-static-review-c.json');
fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({report:pin(output),status:report.status,conclusion:report.conclusion,paths:13,spans:3,protected:65,other:59,tools:28,old:originals,budgets:report.budgets,headers}));