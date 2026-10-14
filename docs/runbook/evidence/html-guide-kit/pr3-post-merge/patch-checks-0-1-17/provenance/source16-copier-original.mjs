// External PREP_ONLY: source15 actual inventory, exact copies, three version guards, syntax only.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url)),sourceRoot=path.resolve(root,'../0-1-15');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const fail=s=>{throw new Error(s);};
const guards=new Set(['prepare-correction.mjs','prepare-coverage.mjs','verify-canonical.mjs']);
const inventoryFile=path.join(sourceRoot,'frozen-copy-inventory.json'),inventoryBytes=fs.readFileSync(inventoryFile),baseline=JSON.parse(inventoryBytes);
if(sha(inventoryBytes)!=='5bce6731ff32d077e72a7307ab7295a6c379e146a50bb4476ffaa9a0bcddea0d')fail('Unexpected original source15 inventory');
if(baseline.candidateVersion!=='0.1.15'||baseline.files.length!==33||baseline.files.filter(r=>!guards.has(r.relative)).length!==30||baseline.extras.length!==5)fail('Expected source15 frozen30 plus3 guards and5 extras');
if(baseline.collectionUnchanged.strictInstallScenarios!==13||baseline.collectionUnchanged.actualCachePythonRuns!==6)fail('Actual strict13/cache6 baseline required');
if(fs.existsSync(path.join(root,'frozen-copy-inventory.json')))fail('Current preparation must not be overwritten');
const priorFiles=[];
function walk(dir,base,rows){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,entry.name);if(entry.isDirectory())walk(f,base,rows);else{const b=fs.readFileSync(f);rows.push({relative:path.relative(base,f).replaceAll('\\','/'),bytes:b.length,sha256:sha(b)});}}}
walk(root,root,priorFiles);
const allowed=relative=>{if(path.isAbsolute(relative)||relative.split(/[\\/]/).some(s=>s==='..')||/(?:^|\/)(?:runs|reviews|grade|cache|mirror|draft)(?:\/|$)/i.test(relative))fail('Disallowed control path: '+relative);};
const core=baseline.files.map(r=>{allowed(r.relative);const source=path.join(sourceRoot,r.relative),bytes=fs.readFileSync(source);if(sha(bytes)!==r.sha256||bytes.length!==r.bytes)fail('Actual source15 core drift: '+r.relative);if(fs.existsSync(path.join(root,r.relative)))fail('Destination exists: '+r.relative);return {...r,source,bytes,actualSha256:sha(bytes)};});
const extra=baseline.extras.map(r=>{allowed(r.name);const source=path.join(sourceRoot,r.name),bytes=fs.readFileSync(source);if(sha(bytes)!==r.destinationSha256||bytes.length!==r.bytes)fail('Actual source15 extra drift: '+r.name);if(fs.existsSync(path.join(root,r.name)))fail('Extra destination exists: '+r.name);return {name:r.name,source,bytes,actualSha256:sha(bytes)};});
const verifier=core.find(r=>r.relative==='verify-canonical.mjs');
if(verifier.actualSha256!=='3bed1059aacf13ca0183e20da8045ff74b03b736597ee6502a84b3670d2c9440')fail('Only actual13/6 source15 verifier is authorized');
const verifierText=verifier.bytes.toString('utf8');
for(const literal of ['expectedScenarioCount:13','expectedActualPythonRuns:6','scenarios.length!==13','python.length!==6','scenarioCount:13','actualPythonRuns:6'])if(!verifierText.includes(literal))fail('Missing strict collection literal: '+literal);
const write=(relative,bytes)=>{const f=path.join(root,relative);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,bytes,{flag:'wx'});return f;};
const save=(relative,value)=>write(relative,JSON.stringify(value,null,2)+'\n');
write('provenance/source15-inventory.json',inventoryBytes);
const provenanceFiles=['build-controls-prep-only-behavior-a.mjs','copier-provenance.json','guard-version-diff.json','manual-extra-helper-copy-control.json'];
const provenance=provenanceFiles.map(relative=>{const f=path.join(sourceRoot,relative),b=fs.readFileSync(f);return {relative,source:f,bytes:b.length,sha256:sha(b),preservedCopy:write('provenance/source15-'+relative,b),executed:false};});
const files=[],guardDiffs=[];
for(const r of core){
 let output=r.bytes,operation='EXACT_COPY';
 if(guards.has(r.relative)){
  const before=Buffer.from('0.1.15'),after=Buffer.from('0.1.16'),offsets=[],chunks=[];let cursor=0;
  for(let at=r.bytes.indexOf(before,cursor);at>=0;at=r.bytes.indexOf(before,cursor)){chunks.push(r.bytes.subarray(cursor,at),after);cursor=at+before.length;offsets.push({versionOffsetZeroBased:at,differingByteOffsetZeroBased:at+5,beforeHex:'35',afterHex:'36',byteDelta:0,line:r.bytes.subarray(0,at).toString('utf8').split('\n').length});}
  if(!offsets.length)fail('Missing current14 version guard: '+r.relative);chunks.push(r.bytes.subarray(cursor));output=Buffer.concat(chunks);
  if(output.length!==r.bytes.length||!Buffer.from(output.toString('utf8').replaceAll('0.1.16','0.1.15')).equals(r.bytes))fail('Version-only restoration failure');
  const actualChanges=[];for(let i=0;i<r.bytes.length;i++)if(r.bytes[i]!==output[i])actualChanges.push(i);
  if(JSON.stringify(actualChanges)!==JSON.stringify(offsets.map(o=>o.differingByteOffsetZeroBased)))fail('Non-version byte difference');
  const originalCopy=write('originals/'+r.relative,r.bytes);
  guardDiffs.push({relative:r.relative,originalCopy,originalSha256:r.actualSha256,newSha256:sha(output),beforeBytes:r.bytes.length,afterBytes:output.length,versionOccurrences:offsets.length,offsets,actualDifferingByteOffsets:actualChanges,change:'Only literal0.1.15 ->0.1.16; each last byte35 ->36',collectionCountsUnchanged:{strictInstalls:13,actualCachePython:6},allOutsideVersionSegmentsOriginalBytes:true});
  operation='VERSION_GUARD_ONLY';
 }
 const destination=write(r.relative,output);
 files.push({relative:r.relative,source:r.source,expectedSourceSha256:r.sha256,sourceSha256:r.actualSha256,sha256:sha(output),bytes:output.length,operation,destination});
}
if(guardDiffs.reduce((n,r)=>n+r.versionOccurrences,0)!==9)fail('Expected nine last-byte-only changes');
const extras=extra.map(r=>({name:r.name,source:r.source,destination:write(r.name,r.bytes),sourceSha256:r.actualSha256,destinationSha256:r.actualSha256,bytes:r.bytes.length,operation:'EXACT_COPY',originalControlVersionAndPathProvenancePreserved:r.name.endsWith('.json')}));
const parse=relative=>{const f=path.join(root,relative),r=spawnSync(process.execPath,['--check',f],{encoding:'utf8',shell:false,windowsHide:true});if(r.status!==0||r.error)fail('Syntax failure: '+relative);return {relative,sha256:sha(fs.readFileSync(f)),status:r.status,stdout:r.stdout,stderr:r.stderr,executed:false};};
const syntax=baseline.syntax.map(r=>({...parse(r.relative),scope:r.scope}));if(syntax.length!==22)fail('Expected22 core syntax checks');
const extraSyntax=extras.filter(r=>r.name.endsWith('.mjs')).map(r=>parse(r.name));if(extraSyntax.length!==3)fail('Expected3 extra syntax checks');
const exactInvariantChecks=files.filter(r=>r.operation==='EXACT_COPY').map(r=>({relative:r.relative,sourceSha256:sha(fs.readFileSync(r.source)),destinationSha256:sha(fs.readFileSync(r.destination)),equal:fs.readFileSync(r.source).equals(fs.readFileSync(r.destination))}));
if(!exactInvariantChecks.every(r=>r.equal)||![...files,...extras].every(r=>sha(fs.readFileSync(r.source))===r.sourceSha256))fail('Source or copied invariant drift');
if(!priorFiles.every(r=>sha(fs.readFileSync(path.join(root,r.relative)))===r.sha256))fail('Preexisting target preparation file changed');
const proofFile=path.resolve(root,'../../diagnostics/inherited-pr2-6ee40474/metadata-relocated.json'),proofBytes=fs.readFileSync(proofFile);
if(sha(proofBytes)!=='112d6f63191c781df9d2ca6d99a2f228f299aae82e056e3bf1869ee70d50bb49'||sha(proofBytes)!==baseline.defaultProof.sha256)fail('Frozen default proof drift');
const plans=baseline.plans.map(r=>{const b=fs.readFileSync(path.join(root,r.relative)),p=JSON.parse(b);if(sha(b)!==r.sha256)fail('Frozen plan drift');return {relative:r.relative,sha256:sha(b),sourceSha256:sha(fs.readFileSync(path.join(sourceRoot,r.relative))),freshVariants:p.freshVariants,plannedTurns:p.plannedTurns,variantCount:p.variants.length,specSha256:p.specSha256};});
const noRuns=['blocking','expanded','continuous-supplement'].every(k=>!fs.existsSync(path.join(root,k,'runs')));if(!noRuns)fail('Unexpected runs directory');
const report={recordedAt:new Date().toISOString(),phase:'PREP_ONLY_WAITING_SOURCE15_FINAL_CLOSURE_AND_ROOT_EXACT_COMMITTED16_CANONICAL_THIRTEEN_STRICT_INSTALLS_SIX_ACTUAL_CACHE_PYTHON',candidateVersion:'0.1.16',sourceRoot,sourceCanonical:'2bcbe30ac2b4e2a64a159f121dc818f961fe7c15',sourceCanonicalTree:'329f0f2e5946194895aca2ee2fbb5bc0d7b1c6aa',candidateCanonical:null,sourceInventory:{path:inventoryFile,sha256:sha(inventoryBytes),copy:'provenance/source15-inventory.json',actualCurrentSource15Controls:true},sourceInventoryException:null,sourcePriorEngineeringAdaptationPreservedAsProvenanceOnly:true,files,guardDiffs,extras,syntax,extraSyntax,exactInvariantChecks,plans,frozenCount:30,versionGuardCount:3,versionLastByteChanges:9,extraCount:5,previousDestinationFiles:priorFiles,previousDestinationUnchanged:true,oldInputsMaterialsPlansAndSpecUnchanged:true,sourceOldDirectoriesModified:false,collectionUnchanged:baseline.collectionUnchanged,defaultProof:{file:proofFile,sha256:sha(proofBytes),unchanged:true,copiedIntoControls:false},manualPolicy:baseline.manualPolicy,chooseFirstPolicy:baseline.chooseFirstPolicy,pausePolicy:baseline.pausePolicy,fullReadPolicy:baseline.fullReadPolicy,intendedCoverage:baseline.intendedCoverage,behaviorStatus:'NOT_RUN',clientUiStatus:'NOT_RUN',effectStatus:'NOT_MEASURED',installationInvoked:false,mirrorPrepared:false,cachePrepared:false,modelInvoked:false,gradeInvoked:false,repositoryModified:false,accountConfigReadOrWritten:false,noRunsDirectoryCreated:noRuns};
save('frozen-copy-inventory.json',report);save('guard-version-diff.json',guardDiffs);
save('manual-extra-helper-copy-control.json',{recordedAt:new Date().toISOString(),phase:'PREP_ONLY',sourceRoot,sourceOriginalControlSha256:sha(fs.readFileSync(path.join(sourceRoot,'manual-extra-helper-copy-control.json'))),extraFiles:extras,extraSyntax,sourceProvenanceStringsPreserved:true});
save('copier-provenance.json',{recordedAt:new Date().toISOString(),phase:'PREP_ONLY',method:'New external byte copier following original14 copier; every actual source15 control is verified against its current inventory before literal version substitution',sourceInventorySha256:sha(inventoryBytes),sourceProvenance:provenance,candidateCopierSha256:sha(fs.readFileSync(fileURLToPath(import.meta.url))),modelInputsOrHelperSemanticsChanged:false,sourceInventoryUnmodified:sha(fs.readFileSync(inventoryFile))===sha(inventoryBytes),outsideCoreVersionLiteralChanges:0});
save('preparation-verification.json',{recordedAt:new Date().toISOString(),phase:'PREP_ONLY',candidateVersion:'0.1.16',frozenCopyCount:30,versionGuardCount:3,lastByteChanges:9,syntaxCount:22,extraFiles:5,extraSyntaxCount:3,syntaxPassed:true,exactFrozenAndExtraCopies:true,onlyVersionLiteralChanged:true,countsRemain13and6:true,noInstallMirrorCacheModelGradeRepo:true,noRunsDirectoryCreated:true,inventorySha256:sha(fs.readFileSync(path.join(root,'frozen-copy-inventory.json')))});
write('README.md','# 0.1.16 external reviewer controls\n\nPREP_ONLY. Source15 current inventory supplies thirty frozen controls plus three version guards and five extra controls. All thirty plus five are exact byte copies. Only three guards replace literal0.1.15 with0.1.16: nine last-byte35→36 differences, no size change. Actual strict13 installations and6 cache Python checks are unchanged. All22 core and3 extra syntax parses pass. Prior source15 copier/inventory and current old guard bytes are preserved as provenance.\n\nNo15 runs, reviews, grades, stop markers, static drafts, caches or mirrors are copied into active controls. No installation, mirror, cache, run, model or grade was invoked. Root must close source15 final reviews, commit an exact16 canonical and pass actual13/6 engineering before new model execution. No inherited PASS. Inputs, criteria, plans, SPEC, helpers, frozen default proof and manual selection history semantics are unchanged. Select an actual top-level complete triplet; never invoke choose-first or infer a target from a nested numeral. Preserve normal pause boundaries, all original failures and partial/not-run observations.\n\nBehavior and client UI NOT_RUN; real-world effect NOT_MEASURED. No repository or account configuration modification.\n');
console.log(JSON.stringify({root,phase:report.phase,inventorySha256:sha(fs.readFileSync(path.join(root,'frozen-copy-inventory.json'))),frozenControls:30,extraControls:5,syntax:[22,3],guardDiffs:guardDiffs.map(r=>({relative:r.relative,originalSha256:r.originalSha256,newSha256:r.newSha256,actualDifferingByteOffsets:r.actualDifferingByteOffsets})),noInstallMirrorCacheModelGradeRepo:true},null,2));
