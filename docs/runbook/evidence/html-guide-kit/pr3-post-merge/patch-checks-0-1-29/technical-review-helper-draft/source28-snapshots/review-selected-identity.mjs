// External reviewer-only DRAFT. Reads saved evidence only; never calls a client/model/API.
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const proofSha='112d6f63191c781df9d2ca6d99a2f228f299aae82e056e3bf1869ee70d50bb49';
const sameValues=(a,b)=>assert.deepEqual(a,b,'Selected/effective metadata differ');
export function inspectSelectedPreparation(batch){
 assert.equal(batch.baselineVersion,'codex-cli 0.147.0');
 assert.equal(batch.packageVersion,'0.1.28');
 const bc=batch.baselineCompatibility;
 assert(bc&&bc.actualDefault&&bc.selectedIdentity&&bc.effectiveBaseline&&bc.reasoningSelection);
 const original=fs.readFileSync(bc.proofPath),proof=JSON.parse(original);
 assert.equal(sha(original),proofSha);assert.equal(bc.proofSha256,proofSha);
 assert.equal(proof.baselineVersion,'codex-cli 0.147.0');
 assert.equal(proof.actualDefault.isDefault,true);assert.equal(proof.actualDefault.hidden,false);
 assert.equal(proof.actualDefault.model,'gpt-5.6-sol');assert.equal(proof.actualDefault.defaultReasoningEffort,'low');
 assert.equal(sha(fs.readFileSync(proof.modelsApiFile)),proof.modelsApiSha256);
 assert(proof.actualDefault.supportedReasoningEfforts.some(v=>v.reasoningEffort==='high'));
 assert.equal(bc.actualDefault.model,proof.actualDefault.model);
 assert.equal(bc.actualDefault.model_reasoning_effort,proof.actualDefault.defaultReasoningEffort);
 assert.equal(bc.selectedIdentity.model,proof.actualDefault.model);
 assert.equal(bc.selectedIdentity.model_reasoning_effort,'high');
 if(bc.selectedIdentity.model_provider!==undefined)assert.equal(bc.selectedIdentity.model_provider,'openai');
 if(bc.actualDefault.model_provider!==undefined)assert.equal(bc.actualDefault.model_provider,'openai');
 sameValues(bc.selectedIdentity,bc.effectiveBaseline);
 const rs=bc.reasoningSelection;
 assert.equal(rs.requested,'high');assert.equal(rs.explicit,true);
 assert.equal(rs.supportedByProof,true);assert.equal(rs.supportedByFreshModelList,true);
 assert.equal(rs.freshActualDefault.model,proof.actualDefault.model);
 assert.equal(rs.freshActualDefault.model_reasoning_effort,proof.actualDefault.defaultReasoningEffort);
 assert.equal(rs.freshModelsFile,batch.isolation.modelMetadataFile);
 const freshBytes=fs.readFileSync(rs.freshModelsFile);assert.equal(sha(freshBytes),rs.freshModelsSha256);
 const fresh=JSON.parse(freshBytes).result.data.filter(v=>v.isDefault&&!v.hidden);
 assert.equal(fresh.length,1);assert.equal(fresh[0].model,proof.actualDefault.model);
 assert.equal(fresh[0].defaultReasoningEffort,proof.actualDefault.defaultReasoningEffort);
 assert(fresh[0].supportedReasoningEfforts.some(v=>v.reasoningEffort==='high'));
 return {originalDefault:bc.actualDefault,selectedIdentity:bc.selectedIdentity,effectiveBaseline:bc.effectiveBaseline,
  expectedClient:'0.147.0',expectedProvider:'openai',expectedModel:'gpt-5.6-sol',expectedEffort:'high',
  originalProof:{sha256:sha(original),bytes:original.length,defaultEffort:proof.actualDefault.defaultReasoningEffort},
  freshModelMetadata:{file:rs.freshModelsFile,sha256:sha(freshBytes),actualDefaultEffort:fresh[0].defaultReasoningEffort,selectedEffortSupported:true},
  actualModelEffortObserved:false,metadataIsNotSdkEvidence:true};
}
export function inspectObservedTurn(batch,attempt,turn,rows,preparation){
 const metas=rows.filter(v=>v.type==='session_meta');assert.equal(metas.length,1);
 const meta=metas[0].payload;
 assert.equal(meta.id,attempt.threadId);assert(!meta.forked_from_id);
 assert.equal(meta.cli_version,preparation.expectedClient);assert.equal(meta.model_provider,preparation.expectedProvider);
 const contexts=rows.filter(v=>v.type==='turn_context');assert(contexts.length>0,'Missing actual turn_context');
 const actualContexts=contexts.map(v=>({line:v.line,model:v.payload.model,effort:v.payload.effort??v.payload.reasoning_effort}));
 assert(actualContexts.every(v=>v.model===preparation.expectedModel&&v.effort===preparation.expectedEffort),'Actual SDK model/effort mismatch, missing or mixed');
 assert.equal(turn.actualIdentity.sessionId,attempt.threadId);assert.equal(turn.actualIdentity.cliVersion,meta.cli_version);
 assert.equal(turn.actualIdentity.modelProvider,meta.model_provider);
 assert.deepEqual(turn.actualIdentity.models,[preparation.expectedModel]);
 assert.deepEqual(turn.actualIdentity.reasoning,[preparation.expectedEffort]);
 assert.equal(turn.transportStatus,'COMPLETE');assert.equal(turn.exitCode,0);
 assert.equal(turn.timedOut,false);assert.equal(turn.lateExitInvalid,false);assert.equal(turn.processError,null);assert.equal(turn.identityError,null);
 const c=turn.captureLifecycle;assert(c);
 assert.equal(c.timeoutMs,240000);assert.equal(c.exitObserved,true);assert.equal(c.closeObserved,true);
 assert.equal(c.actualExit.code,0);assert.equal(c.actualExit.signal,null);assert.equal(c.actualExit.inDeadline,true);
 assert.equal(c.actualClose.code,0);assert.equal(c.actualClose.signal,null);assert.equal(c.deadlineCallback,null);assert.equal(c.stdioCollectedThroughClose,true);
 assert(Number.isFinite(c.deadlineMonotonicMs)&&Number.isFinite(c.actualExit.observedMonotonicMs));
 assert(c.actualExit.observedMonotonicMs<c.deadlineMonotonicMs);
 assert.equal(sha(fs.readFileSync(turn.inputFile)),turn.inputSha256);
 return {sessionMetaLine:metas[0].line,uuid:meta.id,actualClient:meta.cli_version,actualProvider:meta.model_provider,
  actualContexts,actualModel:preparation.expectedModel,actualEffort:actualContexts[0].effort,
  actualRecordedIdentityMatchesSdk:true,explicitSelectedIdentityMatchesSdk:true,actualDefaultEffortRemainsLow:true,
  actualV2ExitAndCloseValid:true,executionExitDeadlineMs:c.timeoutMs,closeDrainHasIndependentDeadline:c.drainWaitHasIndependentDeadline,
  noSdkCompletedSubstitutionForExit:true,noSemanticGrade:true};
}

