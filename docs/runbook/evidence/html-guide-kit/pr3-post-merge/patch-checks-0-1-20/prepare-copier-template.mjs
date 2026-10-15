// Prepare a new external copier from the exact Source19 template. No consumer execution.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url)),sourceRoot=path.resolve(root,'../0-1-19'),source=path.join(sourceRoot,'build-controls-prep-only-behavior-a.mjs'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const original=fs.readFileSync(source);if(sha(original)!=='dc1a5de54d7690fdcc4ea3433e978d424d89122c78c11852a177b49986408205')throw new Error('Exact Source19 copier pin mismatch');
let text=original.toString('utf8');const edits=[];
function change(before,after){const occurrences=text.split(before).length-1;if(!occurrences)throw new Error('Original copier target absent: '+before);text=text.replaceAll(before,after);edits.push({before,after,occurrences});}
for(const [before,after] of [
 ['0.1.18','__SOURCE_VERSION_LITERAL__'],['0.1.19','__CANDIDATE_VERSION_LITERAL__'],
 ['0-1-18','0-1-19'],['source18','source19'],['Source18','Source19'],['SOURCE18','SOURCE19'],['COMMITTED19','COMMITTED20'],
 ['__SOURCE_VERSION_LITERAL__','0.1.19'],['__CANDIDATE_VERSION_LITERAL__','0.1.20'],
 ['a748e7499b2d67c589a0cd3b6a471ed8fddba29c737a8777786324aae99893cd','2dedefccb624d5cad08f45d331c5f947cefb2f89906ee23c9b82be5cf9412bb3'],
 ['5d40c9d06217dff3aeef3a74db38d5935a558e9b83cbff5705ed00ab1a0488ac','f89c2e08da507222b4a8a86f061f756f56316594d8b4e607594eed06abddce15'],
 ['0a6c48c2b3d782cbffb86355060d65986383eeea','2fb20957d5c082aead7c8f3a8136d44c574487ee'],
 ['b09e7772bc34e37d6fe9206fa263f827895549af','906333383ba731f90d3c495e4b645708aaf1d815'],
 ['PREP_ONLY_SOURCE19_FINAL_CLOSED_WAITING_ROOT_EXACT_COMMITTED20_CANONICAL_THIRTEEN_STRICT_INSTALLS_SIX_ACTUAL_CACHE_PYTHON','PREP_ONLY_SOURCE19_FIXED_CONTROL_SET_ROOT_FINAL_PACK_AND_STATIC_PENDING_BEFORE_SOURCE20_RUNTIME'],
])change(before,after);
const oldBlock=String.raw`  const before=Buffer.from('0.1.19'),after=Buffer.from('0.1.20'),offsets=[],chunks=[];let cursor=0;
  for(let at=r.bytes.indexOf(before,cursor);at>=0;at=r.bytes.indexOf(before,cursor)){chunks.push(r.bytes.subarray(cursor,at),after);cursor=at+before.length;offsets.push({versionOffsetZeroBased:at,differingByteOffsetZeroBased:at+5,beforeHex:'38',afterHex:'39',byteDelta:0,line:r.bytes.subarray(0,at).toString('utf8').split('\n').length});}
  if(!offsets.length)fail('Missing current18 version guard: '+r.relative);chunks.push(r.bytes.subarray(cursor));output=Buffer.concat(chunks);
  if(output.length!==r.bytes.length||!Buffer.from(output.toString('utf8').replaceAll('0.1.20','0.1.19')).equals(r.bytes))fail('Version-only restoration failure');
  const actualChanges=[];for(let i=0;i<r.bytes.length;i++)if(r.bytes[i]!==output[i])actualChanges.push(i);
  if(JSON.stringify(actualChanges)!==JSON.stringify(offsets.map(o=>o.differingByteOffsetZeroBased)))fail('Non-version byte difference');
  const originalCopy=write('originals/'+r.relative,r.bytes);
  guardDiffs.push({relative:r.relative,originalCopy,originalSha256:r.actualSha256,newSha256:sha(output),beforeBytes:r.bytes.length,afterBytes:output.length,versionOccurrences:offsets.length,offsets,actualDifferingByteOffsets:actualChanges,change:'Only literal0.1.19 ->0.1.20; each last byte38 ->39',collectionCountsUnchanged:{strictInstalls:13,actualCachePython:6},allOutsideVersionSegmentsOriginalBytes:true});`;
const newBlock=String.raw`  const before=Buffer.from('0.1.19'),after=Buffer.from('0.1.20'),offsets=[],chunks=[];let cursor=0;
  for(let at=r.bytes.indexOf(before,cursor);at>=0;at=r.bytes.indexOf(before,cursor)){
   chunks.push(r.bytes.subarray(cursor,at),after);cursor=at+before.length;
   const differingBytes=[];for(let j=0;j<Math.max(before.length,after.length);j++)if(before[j]!==after[j])differingBytes.push({relativeByteOffset:j,absoluteByteOffset:at+j,beforeHex:before[j]?.toString(16).padStart(2,'0')??null,afterHex:after[j]?.toString(16).padStart(2,'0')??null});
   offsets.push({versionOffsetZeroBased:at,beforeLiteral:before.toString(),afterLiteral:after.toString(),beforeSegmentBytes:before.length,afterSegmentBytes:after.length,byteDelta:after.length-before.length,line:r.bytes.subarray(0,at).toString('utf8').split('\n').length,differingBytes});
  }
  if(!offsets.length)fail('Missing current19 version guard: '+r.relative);chunks.push(r.bytes.subarray(cursor));output=Buffer.concat(chunks);
  if(!Buffer.from(output.toString('utf8').replaceAll('0.1.20','0.1.19')).equals(r.bytes))fail('Version-only restoration failure');
  const actualChanges=[];for(let i=0;i<Math.max(r.bytes.length,output.length);i++)if(r.bytes[i]!==output[i])actualChanges.push(i);
  const expectedChanges=offsets.flatMap(o=>o.differingBytes.map(d=>d.absoluteByteOffset));
  if(JSON.stringify(actualChanges)!==JSON.stringify(expectedChanges))fail('Non-version byte difference');
  const originalCopy=write('originals/'+r.relative,r.bytes);
  guardDiffs.push({relative:r.relative,originalCopy,originalSha256:r.actualSha256,newSha256:sha(output),beforeBytes:r.bytes.length,afterBytes:output.length,byteLengthDelta:output.length-r.bytes.length,versionOccurrences:offsets.length,offsets,actualDifferingByteOffsets:actualChanges,actualDifferingByteCount:actualChanges.length,change:'Only literal0.1.19 ->0.1.20; every actual segment and byte difference computed',collectionCountsUnchanged:{strictInstalls:13,actualCachePython:6},allOutsideVersionSegmentsOriginalBytes:true});`;
change(oldBlock,newBlock);
change("if(guardDiffs.reduce((n,r)=>n+r.versionOccurrences,0)!==9)fail('Expected nine last-byte-only changes');","const versionLiteralOccurrences=guardDiffs.reduce((n,r)=>n+r.versionOccurrences,0),actualDifferingBytes=guardDiffs.reduce((n,r)=>n+r.actualDifferingByteCount,0);if(versionLiteralOccurrences!==9)fail('Expected nine actual version-literal occurrences');");
change('versionLastByteChanges:9','versionLiteralOccurrences,actualDifferingBytes');
change('lastByteChanges:9','versionLiteralOccurrences,actualDifferingBytes');
change('nine last-byte38→39 differences, no size change','nine literal occurrences; exact per-segment byte differences are computed and recorded, no prior nine-byte assumption');
change('Source19 final closure is verified by Root; Root must commit an exact19 canonical and pass actual13/6 engineering before new model execution.','Source19 whole-directory metadata may still be finalized by Root; only the fixed38 control set is inherited. Root must confirm Source19 final pack and Source20 static review, commit an exact20 canonical, and pass actual13/6 engineering before new model execution.');
change('sourceOldDirectoriesModified:false','sourceOldDirectoriesModified:null,sourceWritesPerformedByThisCopier:false,sourceFixedControlsUnchanged:true,sourceWholeDirectoryUnchangedClaim:false,sourceWholeDirectoryObservation');
const beforeInsert=String.raw`
const sourceWholeBefore=[];
function inventoryAll(dir,base,rows){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,entry.name);if(entry.isDirectory())inventoryAll(f,base,rows);else{const b=fs.readFileSync(f);rows.push({relative:path.relative(base,f).replaceAll('\\','/'),bytes:b.length,sha256:sha(b)});}}}
inventoryAll(sourceRoot,sourceRoot,sourceWholeBefore);sourceWholeBefore.sort((a,b)=>a.relative.localeCompare(b.relative));
fs.writeFileSync(path.join(root,'source19-whole-before-preparation-inventory.json'),JSON.stringify({recordedAt:new Date().toISOString(),method:'ACTUAL_WHOLE_SOURCE19_BEFORE_FIXED_CONTROL_COPY_NO_FULL_STATIC_CLAIM',root:sourceRoot,files:sourceWholeBefore,filesCount:sourceWholeBefore.length,totalBytes:sourceWholeBefore.reduce((n,r)=>n+r.bytes,0)},null,2)+'\n',{flag:'wx'});
`;
change("const fail=s=>{throw new Error(s);};","const fail=s=>{throw new Error(s);};"+beforeInsert);
const afterInsert=String.raw`
const sourceWholeAfter=[];inventoryAll(sourceRoot,sourceRoot,sourceWholeAfter);sourceWholeAfter.sort((a,b)=>a.relative.localeCompare(b.relative));
save('source19-whole-after-preparation-inventory.json',{recordedAt:new Date().toISOString(),method:'ACTUAL_SOURCE19_AFTER_FIXED_CONTROL_COPY_NO_FULL_STATIC_CLAIM',root:sourceRoot,files:sourceWholeAfter,filesCount:sourceWholeAfter.length,totalBytes:sourceWholeAfter.reduce((n,r)=>n+r.bytes,0)});
const beforeMap=new Map(sourceWholeBefore.map(r=>[r.relative,r])),afterMap=new Map(sourceWholeAfter.map(r=>[r.relative,r]));
const observedSourceWholeChanges=[...new Set([...beforeMap.keys(),...afterMap.keys()])].sort().flatMap(relative=>{const b=beforeMap.get(relative),a=afterMap.get(relative);return !b||!a||b.sha256!==a.sha256?[{relative,before:b??null,after:a??null}]:[];});
const fixedPaths=new Set([...core.map(r=>r.relative),...extra.map(r=>r.name)]);if(observedSourceWholeChanges.some(r=>fixedPaths.has(r.relative)))fail('Fixed Source19 control changed');
const sourceWholeDirectoryObservation={beforeFile:path.join(root,'source19-whole-before-preparation-inventory.json'),afterFile:path.join(root,'source19-whole-after-preparation-inventory.json'),beforeFileCount:sourceWholeBefore.length,afterFileCount:sourceWholeAfter.length,observedWholeChanges:observedSourceWholeChanges,wholeDirectoryKnownFrozen:false,liveProvenanceChangesPermittedOutsideFixedControls:true,sourceWritesPerformedByThisCopier:false};
save('source19-whole-during-preparation-diff.json',sourceWholeDirectoryObservation);
save('source19-fixed-controls-before-after.json',{recordedAt:new Date().toISOString(),files:[...core.map(r=>({relative:r.relative,expectedSha256:r.actualSha256,actualAfterSha256:sha(fs.readFileSync(r.source)),bytes:r.bytes.length})),...extra.map(r=>({relative:r.name,expectedSha256:r.actualSha256,actualAfterSha256:sha(fs.readFileSync(r.source)),bytes:r.bytes.length}))],all38SourceControlsExact:true,sourceInventorySha256:sha(inventoryBytes),sourceInventoryAfterSha256:sha(fs.readFileSync(inventoryFile)),wholeDirectoryUnchangedClaim:false});
`;
change("const report={recordedAt:new Date().toISOString()",afterInsert+"\nconst report={recordedAt:new Date().toISOString()");
const target=path.join(root,'build-controls-prep-only-behavior-a.mjs');fs.mkdirSync(path.join(root,'provenance'),{recursive:true});fs.writeFileSync(path.join(root,'provenance/source19-copier-original.mjs'),original,{flag:'wx'});fs.writeFileSync(target,text,{flag:'wx'});
const report={recordedAt:new Date().toISOString(),phase:'PREP_ONLY_COPIER_TEMPLATE_PREPARATION',sourceFile:source,sourceSha256:sha(original),sourceFileAfterSha256:sha(fs.readFileSync(source)),targetFile:target,targetSha256:sha(Buffer.from(text)),mechanicalEdits:edits,source19ModifiedByThisPreparation:false,wholeSource19StaticNotAssumed:true,newCopierNotExecutedYet:true,noConsumerPreparation:true,noModel:true,noInstall:true,noMirror:true,noCache:true,noRepositoryMutation:true};
fs.writeFileSync(path.join(root,'copier-source-control.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({target,targetSha256:report.targetSha256,source19OriginalSha256:report.sourceSha256,mechanicalEdits:edits.length,noConsumerPreparation:true},null,2));
