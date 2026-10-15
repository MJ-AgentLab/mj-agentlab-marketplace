import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const root=path.resolve('../reviewer/corrections/0-1-35'),H=b=>createHash('sha256').update(b).digest('hex');
const pin=f=>{const b=fs.readFileSync(f);return{file:f,bytes:b.length,sha256:H(b)}};
const J=f=>JSON.parse(fs.readFileSync(f)),canonical='0ed26217fc65043622f1ff1b428ff42118f5dd3a';
const stop=J(path.join(root,'native-ui/interaction-stop-root.json'));
assert.equal(stop.actualNativeInputs,4);assert.equal(stop.postMarkerStarts,0);assert.equal(stop.crossMarkerInFlight,0);
const reports=[];
for(const [file,n,origin,expectedHash] of [
 ['scoped-work-three-turn-derivative-b.json',3,'codex_work_desktop','a5eb944672bd6cdedee36101f6163152d754c04495159f9478457c31d5e5eb55'],
 ['scoped-codex-one-turn-derivative-b.json',1,'Codex Desktop','edf2b399ee38d75c154d3bd654f69d525a4f8267de303c4983fe2f7add371097']]){
 const filePath=path.join(root,'native-ui',file),p=pin(filePath),j=J(filePath);
 assert.equal(p.sha256,expectedHash);assert.equal(j.canonicalSha,canonical);assert.equal(j.version,'0.1.35');
 assert.equal(j.label,'SCOPED_DERIVATIVE_NOT_FULL_SDK');assert.equal(j.sourceIdentity.originator,origin);
 assert.equal(j.actualInputs.length,n);assert.equal(j.actualFullFinalAnswers.length,n);assert.equal(j.contexts.length,n);assert.equal(j.actualReads.length,3);
 assert(j.contexts.every(x=>x.model==='gpt-6-astra'&&x.effort==='xhigh'));
 for(const r of j.actualReads){
  assert.equal(r.body.encoding,'base64');const body=Buffer.from(r.body.base64,'base64');
  const git=execFileSync('git',['show',canonical+':plugins/html-guide-kit/skills/guide/'+r.relative]);
  assert(body.equals(git));assert.equal(H(body),r.body.sha256);assert.equal(body.length,r.body.utf8Bytes);
  assert.equal(r.body.actualFullBodyByteExactContiguous,true);
 }
 for(const p of j.originalPrivateSnapshotsAndParsedFiles){const actual=pin(p.file);assert.equal(actual.bytes,p.bytes);assert.equal(actual.sha256,p.sha256)}
 assert(j.originalsAfterExtractionUnchanged&&j.noClaimOfLosslessFullSdkOrFullFirstStdout&&j.packageBodiesExactlyRecoverableFromBase64);
 reports.push({derivative:p,uuid:j.sessionUuid,inputs:n,fullFinals:n,actualFullResourceBodies:3,originator:origin,model:'gpt-6-astra',effort:'xhigh',sourceRowHashesAndByteOffsetsPreserved:true,wholeSdkOrFullFirstStdoutPublic:false});
}
const restoreFile=path.join(root,'native-setup/restored-own-sections.json'),restore=J(restoreFile);
assert.equal(restore.priorOwnedSectionsRestored,10);assert(restore.new35Disabled&&restore.nonOwnedBytesBeforeAfterExact);
const report={recordedAt:new Date().toISOString(),reviewer:'/root',canonical,version:'0.1.35',actualNativeInputs:4,actualSessionUUIDs:2,reports,
 work:'PASS_LIMITED_THREE_TURN_PATH_ONLY',codex:'INITIAL_READING_AND_TARGETS_PASS_CONFIRMED_GUIDE_UNEXERCISED',nativeUnsentInputs:2,
 postMarkerStarts:0,crossMarkerInFlight:0,wholeDualAcceptance:'INCOMPLETE',lifecycle:'NOT_RUN',effect:'NOT_MEASURED',
 stopRecord:pin(path.join(root,'native-ui/interaction-stop-root.json')),restoration:pin(restoreFile),
 privateOriginalPolicy:'All four native SDK jsonl and four parsed json originals stay local, hash-only in public; no bootstrap/profile configuration diagnostic body is public evidence.',
 scopedDerivativesOnly:true,coreAggregateUnmodified:true,source35AllRootNativeWritesNowComplete:true,noNewModelUiApiOrGitMutation:true};
const out=path.join(root,'native-ui/final-native-closure-root.json');fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({status:'FINAL_NATIVE_SCOPED_CLOSURE',report:pin(out),inputs:4,workLimited:'PASS',codexWhole:'UNEXERCISED',dual:'INCOMPLETE'}));
