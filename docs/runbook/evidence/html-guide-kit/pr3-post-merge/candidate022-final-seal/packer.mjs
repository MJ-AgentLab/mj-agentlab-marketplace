#!/usr/bin/env node
// External reviewer-only packer. dry-run never writes evidence into the repository.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {fileURLToPath} from "node:url";
import {TextDecoder} from "node:util";

const REVIEWER=path.dirname(fileURLToPath(import.meta.url));
const AUTHORIZED_REPO=path.resolve(REVIEWER,"../develop");
const EXPECTED_TARGET=path.resolve(REVIEWER,"../develop/docs/runbook/evidence/html-guide-kit/pr3-reviewer");
const ROOT_FILES=["archive-022-control.json","corrections/0-1-12/README.md","corrections/0-1-12/behavior-b-helper-copy-control.json","corrections/0-1-12/blocking/choose-first.mjs","corrections/0-1-12/blocking/frozen-spec.md","corrections/0-1-12/blocking/harness.mjs","corrections/0-1-12/blocking/operator-observations.mjs","corrections/0-1-12/blocking/plan.json","corrections/0-1-12/blocking/record-native-loading.mjs","corrections/0-1-12/build-controls-prep-only-behavior-a.mjs","corrections/0-1-12/builder-control-provenance.json","corrections/0-1-12/continuous-supplement/choose-first.mjs","corrections/0-1-12/continuous-supplement/expanded-plan.mjs","corrections/0-1-12/continuous-supplement/frozen-spec.md","corrections/0-1-12/continuous-supplement/harness.mjs","corrections/0-1-12/continuous-supplement/operator-observations.mjs","corrections/0-1-12/continuous-supplement/plan.json","corrections/0-1-12/continuous-supplement/record-native-loading.mjs","corrections/0-1-12/copy-extra-manual-controls.mjs","corrections/0-1-12/correct-cross-context-audit-behavior-b.mjs","corrections/0-1-12/correct-stop-chronology-behavior-a.mjs","corrections/0-1-12/create-builder-from-011.mjs","corrections/0-1-12/cross-audit-7a6ee4f4-B3-1-prefix.mjs","corrections/0-1-12/cross-audit-7a6ee4f4-closed.mjs","corrections/0-1-12/cross-audit-closed-derivation.json","corrections/0-1-12/cross-audit-prefix-derivation.json","corrections/0-1-12/cross-context-read-7a6ee4f4-behavior-b.mjs","corrections/0-1-12/cross-context-read-7a6ee4f4-corrected-behavior-b.mjs","corrections/0-1-12/derive-extra-copier-from-011.mjs","corrections/0-1-12/expanded/choose-first.mjs","corrections/0-1-12/expanded/criterion-citation-erratum.json","corrections/0-1-12/expanded/expanded-plan.mjs","corrections/0-1-12/expanded/frozen-spec.md","corrections/0-1-12/expanded/harness.mjs","corrections/0-1-12/expanded/operator-observations.mjs","corrections/0-1-12/expanded/plan.json","corrections/0-1-12/expanded/record-native-loading.mjs","corrections/0-1-12/expanded/repeated-plan.json","corrections/0-1-12/extra-copier-control-provenance.json","corrections/0-1-12/frozen-copy-inventory.json","corrections/0-1-12/guard-version-diff.json","corrections/0-1-12/manual-extra-helper-copy-control.json","corrections/0-1-12/manual-selection-behavior-a.mjs","corrections/0-1-12/manual-selection-behavior-b.mjs","corrections/0-1-12/manual-selection-continuous-behavior-a.mjs","corrections/0-1-12/manual-selection-continuous-control.final.json","corrections/0-1-12/manual-selection-continuous-control.json","corrections/0-1-12/operator-sequential.manual.mjs","corrections/0-1-12/preparation-verification.json","corrections/0-1-12/prepare-correction.mjs","corrections/0-1-12/prepare-coverage.mjs","corrections/0-1-12/prepare-cross-audit-closed-behavior-b.mjs","corrections/0-1-12/prepare-cross-audit-prefix-behavior-b.mjs","corrections/0-1-12/prepare-parent.log","corrections/0-1-12/prepare-runtime-resources.log","corrections/0-1-12/provenance/independent-b6-root-logic-review-handoff.json","corrections/0-1-12/provenance/model-context-reference-read-logic.json","corrections/0-1-12/provenance/prepare-correction.0-1-11.original.mjs","corrections/0-1-12/provenance/prepare-coverage.0-1-11.original.mjs","corrections/0-1-12/provenance/source-0-1-11-builder.original.mjs","corrections/0-1-12/provenance/source-0-1-11-extra-copier.original.mjs","corrections/0-1-12/provenance/source-0-1-11-frozen-copy-inventory.json","corrections/0-1-12/provenance/verify-canonical.0-1-11.original.mjs","corrections/0-1-12/record-E15-stop-behavior-b.mjs","corrections/0-1-12/record-operator-handoff-behavior-a.mjs","corrections/0-1-12/record-operator-handoff.mjs","corrections/0-1-12/record-recommended-observation-behavior-b.mjs","corrections/0-1-12/record-stopped-b3-b5-behavior-a.mjs","corrections/0-1-12/repeated-plan-control.json","corrections/0-1-12/review-e15-prefix-behavior-a.mjs","corrections/0-1-12/root-manual-helper-copy-control.json","corrections/0-1-12/root-manual-select.mjs","corrections/0-1-12/root-pause-marker-record.json","corrections/0-1-12/source-inventory-observation.json","corrections/0-1-12/verify-canonical.mjs","corrections/0-1-12/write-cross-7a6ee4f4-final-reviews-behavior-b.mjs","corrections/0-1-12/write-cross-B3-1-final-behavior-b.mjs","corrections/0-1-12/write-cross-B3-1-observation-behavior-b.mjs","corrections/0-1-12/write-e15-prefix-review-behavior-a.mjs"];
const ROOT_DIRS=["corrections/0-1-12/blocking/reviews","corrections/0-1-12/blocking/runs/32e4fc43-89b9-4eed-a2fb-bea82fb96fc0","corrections/0-1-12/blocking/runs/4d35838f-2fb3-46ab-a871-0d37d0cb771e","corrections/0-1-12/blocking/runs/7a6ee4f4-e3e0-4c84-a70d-1749c074e94c","corrections/0-1-12/expanded/reviews","corrections/0-1-12/expanded/runs/28ff23cb-5fc5-4fca-b40b-9bfb712fc54e","corrections/0-1-12/provenance/grade-import"];
const PINNED_SHA256={"corrections/0-1-12/blocking/harness.mjs":"a2a7089587831fffbd74f9af773c144a5fec7d23fef42c617d28a26123b42304","corrections/0-1-12/blocking/plan.json":"58857812c5f48cd3b7bddb58c94679d52f0c97f5b861998d8fd40b0b5cc538d2","corrections/0-1-12/blocking/frozen-spec.md":"4e690529dc0866daa9956411336d980b948e53ee2b73a25cea4dbb075614ea9d","corrections/0-1-12/blocking/choose-first.mjs":"72aec6c283b98efb8fd5de25245be59757f15f5ebf5e3a65c9b058bd602c29d1","corrections/0-1-12/blocking/record-native-loading.mjs":"12b2cc27107a304e3a966a85b739d5ed4b2426394902934fe478b54ca2949253","corrections/0-1-12/blocking/operator-observations.mjs":"610fcd357060afa9f377de911e27b499ee6db50d9a9ead1c470c9ccc974f5871","corrections/0-1-12/expanded/harness.mjs":"712e77f9850241893ac25d86a5bd8a4d558c725c4dd2a271614098461af69645","corrections/0-1-12/expanded/plan.json":"bfd65542f1df9ac9a4af1bf45fa5f9a89750c4557e764eb28816f95f94930b04","corrections/0-1-12/expanded/frozen-spec.md":"4e690529dc0866daa9956411336d980b948e53ee2b73a25cea4dbb075614ea9d","corrections/0-1-12/expanded/choose-first.mjs":"72aec6c283b98efb8fd5de25245be59757f15f5ebf5e3a65c9b058bd602c29d1","corrections/0-1-12/expanded/record-native-loading.mjs":"12b2cc27107a304e3a966a85b739d5ed4b2426394902934fe478b54ca2949253","corrections/0-1-12/expanded/operator-observations.mjs":"610fcd357060afa9f377de911e27b499ee6db50d9a9ead1c470c9ccc974f5871","corrections/0-1-12/expanded/expanded-plan.mjs":"5465c0cb8b1929a6df616137c3f5a9d0287473d00b61c2ceea3138be5c17631e","corrections/0-1-12/continuous-supplement/harness.mjs":"712e77f9850241893ac25d86a5bd8a4d558c725c4dd2a271614098461af69645","corrections/0-1-12/continuous-supplement/plan.json":"af18c35badde6b55ba3134781823565f9688e14e3e51505ffb8760b05fb57cd9","corrections/0-1-12/continuous-supplement/frozen-spec.md":"4e690529dc0866daa9956411336d980b948e53ee2b73a25cea4dbb075614ea9d","corrections/0-1-12/continuous-supplement/choose-first.mjs":"72aec6c283b98efb8fd5de25245be59757f15f5ebf5e3a65c9b058bd602c29d1","corrections/0-1-12/continuous-supplement/record-native-loading.mjs":"12b2cc27107a304e3a966a85b739d5ed4b2426394902934fe478b54ca2949253","corrections/0-1-12/continuous-supplement/operator-observations.mjs":"610fcd357060afa9f377de911e27b499ee6db50d9a9ead1c470c9ccc974f5871","corrections/0-1-12/continuous-supplement/expanded-plan.mjs":"5465c0cb8b1929a6df616137c3f5a9d0287473d00b61c2ceea3138be5c17631e","corrections/0-1-12/expanded/criterion-citation-erratum.json":"8a1e7e3a4305b076e9069c39dd5f605ff21dca5a5ade59ada17afba60ed63969","corrections/0-1-12/expanded/repeated-plan.json":"0b97085cdf412893e267bda912776d371a36f58e6fec7cb15bc086989c081d23","corrections/0-1-12/operator-sequential.manual.mjs":"8d1860e2f3122867737a76aba14be642dd345d8100f03e1d1a7ffdf21087691b","corrections/0-1-12/repeated-plan-control.json":"47a66a9d5148b301f1fbff721670de92c8986467d590030159adcfd239c69c79","corrections/0-1-12/record-operator-handoff.mjs":"553c482e3977ed600b0846051ee1de9fa983e3a656867a3aa4c05cda393339bf","corrections/0-1-12/manual-selection-behavior-a.mjs":"eee0e08f8295e45e39e9a1193ad084953de55d0471fef15b811c80718650d559","corrections/0-1-12/manual-selection-continuous-behavior-a.mjs":"7fcf3c78437f33f8d146684e7e6173324a996b65c6722d58fec17dcfba643ecc","corrections/0-1-12/manual-selection-continuous-control.json":"b84e79d9c799413461c708b9fde47860acf1be57887dcd50f2f7a34c25750eea","corrections/0-1-12/manual-selection-continuous-control.final.json":"f958efe94dc9475a32703e57885c069e7f95f884cd6b259471a490b085b57039","corrections/0-1-12/record-operator-handoff-behavior-a.mjs":"c9e93fb47caee212c3b5eb2322e963fa89fbe10008db469d9dd4dc6a47546d82","corrections/0-1-12/prepare-correction.mjs":"aedcdb07381ed8e3fb600a3d7184afe2845cacfa129970b8aa22aa2acd6316d9","corrections/0-1-12/prepare-coverage.mjs":"7415a15061a688e90d47d9f5a0c88e94e31298098277a516e840bc65a071380a","corrections/0-1-12/verify-canonical.mjs":"8659644b9aa72ac3720230f80614d2a6c70146144192c5349be44331a8e22766"};
const BLOCKED_DIRS=new Set([".git","node_modules","home","codex-home","codex_home","codexhome","sessions","auth","secrets","credentials","cache","plugins","tmp","temp","config"]);
const BLOCKED_FILE=/^(?:auth\.json|config\.toml|credentials(?:\.[^.]+)?|tokens?(?:\.[^.]+)?|\.env(?:\..*)?)$/i;
const DEFAULT_PACKET_LIMIT=2*1024*1024;
const hash=buffer=>crypto.createHash("sha256").update(buffer).digest("hex");
const posix=relative=>relative.split(path.sep).join("/");
const fail=(condition,message)=>{if(!condition)throw new Error(message);};
const serialize=value=>Buffer.from(JSON.stringify(value,null,2)+"\n","utf8");

function options(argv){
 const result={};
 for(let index=0;index<argv.length;index+=2){
  fail(argv[index]?.startsWith("--")&&argv[index+1]!==undefined,"flags require explicit values");
  const key=argv[index].slice(2);fail(!Object.hasOwn(result,key),`duplicate flag: ${key}`);result[key]=argv[index+1];
 }
 for(const key of Object.keys(result))fail(["target","snapshot-name","max-packet-bytes","final-reviewed","expected-inventory-sha256","compare-originals"].includes(key),`unsupported flag: ${key}`);
 return result;
}
function within(root,candidate,allowRoot=false){
 const base=path.resolve(root),absolute=path.resolve(candidate),relative=path.relative(base,absolute);
 fail((allowRoot&&relative==="")||(relative!==""&&relative!==".."&&!relative.startsWith(`..${path.sep}`)&&!path.isAbsolute(relative)),"path escapes designated root");
 return absolute;
}
function owned(root,relative){
 fail(typeof relative==="string"&&!path.isAbsolute(relative)&&!relative.includes("\\")&&relative.split("/").every(part=>part&&part!=="."&&part!==".."),"invalid evidence-relative path");
 let file=path.resolve(root);fail(!fs.lstatSync(file).isSymbolicLink(),"evidence root cannot be a link");
 for(const part of relative.split("/")){file=path.join(file,part);fail(!fs.lstatSync(file).isSymbolicLink(),`linked evidence is forbidden: ${relative}`);}
 within(fs.realpathSync.native(root),fs.realpathSync.native(file));
 return file;
}
function blocked(relative,isDirectory){
 const parts=relative.split("/");
 if(parts.slice(0,isDirectory?undefined:-1).some(part=>BLOCKED_DIRS.has(part.toLowerCase())))return true;
 return !isDirectory&&BLOCKED_FILE.test(parts.at(-1));
}
function sourceInventory(){
 fail(!fs.lstatSync(REVIEWER).isSymbolicLink(),"reviewer source root cannot be a link");
 const selected=[],excluded=[];
 const visit=relative=>{
  const file=owned(REVIEWER,relative),stat=fs.lstatSync(file);
  if(blocked(relative,stat.isDirectory())){excluded.push({relativeOriginalPath:relative,reason:"forbidden actual runtime/authentication/configuration location"});return;}
  if(stat.isDirectory())for(const name of fs.readdirSync(file).sort())visit(relative+"/"+name);
  else{fail(stat.isFile(),`evidence must be an ordinary file: ${relative}`);selected.push(relative);}
 };
 for(const relative of ROOT_FILES){fail(fs.existsSync(path.join(REVIEWER,relative)),`required reviewer source missing: ${relative}`);visit(relative);}
 for(const relative of ROOT_DIRS)visit(relative);
 const markOutOfScope=relative=>{
  if(ROOT_FILES.includes(relative)||ROOT_DIRS.includes(relative))return;
  if([...ROOT_FILES,...ROOT_DIRS].some(allowed=>allowed.startsWith(relative+"/"))){
   const directory=owned(REVIEWER,relative);fail(fs.statSync(directory).isDirectory(),"allowlist ancestor must be a directory");
   for(const name of fs.readdirSync(directory).sort())markOutOfScope(relative+"/"+name);
  }else excluded.push({relativeOriginalPath:relative,reason:"not in the authorized source allowlist"});
 };
 for(const name of fs.readdirSync(REVIEWER).sort())markOutOfScope(name);
 return {selected:selected.sort(),excluded};
}
function entryFromBuffer(relative,absolute,bytes){
 let encoding="utf8",content;
 try{content=new TextDecoder("utf-8",{fatal:true,ignoreBOM:true}).decode(bytes);if(!Buffer.from(content,"utf8").equals(bytes))throw new Error("non-lossless text decoding");}
 catch{encoding="base64";content=bytes.toString("base64");}
 const entry={relativeOriginalPath:relative,originalAbsolutePath:absolute,sha256:hash(bytes),bytes:bytes.length,encoding,content};
 fail(restore(entry).equals(bytes),`Buffer restoration mismatch: ${relative}`);
 return entry;
}
function restore(entry){
 fail(entry.encoding==="utf8"||entry.encoding==="base64","unsupported entry encoding");
 const bytes=Buffer.from(entry.content,entry.encoding);
 fail(bytes.length===entry.bytes&&hash(bytes)===entry.sha256,`entry hash/length mismatch: ${entry.relativeOriginalPath}`);
 return bytes;
}

// Pattern findings report rule/path/line only; matched values and excerpts are never returned.
const SECRET_PATTERNS=[
 ["bearer-token",/\bBearer[ \t]+[A-Za-z0-9._~-]{16,}/g],
 ["provider-api-key",/\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{20,}\b/g],
 ["github-token",/\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})\b/g],
 ["aws-access-key",/\bAKIA[0-9A-Z]{16}\b/g],
 ["jwt-token",/\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g],
 ["private-key",/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],
 ["credential-assignment",/["']?(?:access_token|refresh_token|id_token|OPENAI_API_KEY|api_key|client_secret|password)["']?\s*[:=]\s*["']([^"'\r\n]{8,})["']/gi],
];
const REDACTED=/^(?:\[REDACTED[^\]]*\]|<redacted>|redacted|null|none)$/i;
function secretScan(entry){
 const bytes=restore(entry),raw=entry.encoding==="utf8"?entry.content:bytes.toString("latin1"),findings=[];
 const seen=new Set();
 const scanText=(text,line=null)=>{
  for(const [rule,expression] of SECRET_PATTERNS){
   expression.lastIndex=0;
   for(const match of text.matchAll(expression)){
    if(rule==="credential-assignment"&&REDACTED.test(match[1]))continue;
    const located=line??(text.slice(0,match.index).match(/\n/g)?.length??0)+1,key=`${rule}:${located}`;
    if(!seen.has(key)){seen.add(key);findings.push({rule,relativeOriginalPath:entry.relativeOriginalPath,line:located});}
   }
  }
 };
 const walk=(value,line,depth=0)=>{
  if(depth>8)return;
  if(typeof value==="string"){
   scanText(value,line);
   if(/^[\s]*[\[{]/.test(value))try{walk(JSON.parse(value),line,depth+1);}catch{}
  }else if(value&&typeof value==="object")for(const item of Object.values(value))walk(item,line,depth+1);
 };
 scanText(raw);
 if(entry.encoding==="utf8"){
  try{walk(JSON.parse(raw),null);}catch{
   raw.split(/\r?\n/).forEach((line,index)=>{try{walk(JSON.parse(line),index+1);}catch{}});
  }
 }
 return findings;
}
function bucket(relative){
 const parts=relative.split("/");
 if(parts[0]==="runs"||parts[0]==="diagnostics")return parts.slice(0,2).join("/");
 return parts.length===1?"root-control":parts[0];
}
function packetize(entries,maximum){
 const groups=new Map();for(const entry of entries){const key=bucket(entry.relativeOriginalPath);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(entry);}
 const packets=[];
 for(const [scope,group] of groups){
  let current=[];
  const flush=()=>{if(!current.length)return;const part=packets.filter(packet=>packet.scope===scope).length+1;
   const document={schemaVersion:1,kind:"lossless-reviewer-packet",scope,entries:current},bytes=serialize(document);
   packets.push({scope,file:`packets/${scope.replaceAll("/","-")}-${String(part).padStart(3,"0")}.json`,document,buffer:bytes,oversized:bytes.length>maximum});current=[];
  };
  for(const entry of group){const proposed={schemaVersion:1,kind:"lossless-reviewer-packet",scope,entries:[...current,entry]};if(current.length&&serialize(proposed).length>maximum)flush();current.push(entry);}
  flush();
 }
 return packets;
}
function identityReferences(entries){
 return entries.filter(entry=>/(?:^|\/)runs\/[^/]+\/batch\.json$/.test(entry.relativeOriginalPath)).map(entry=>{
  const batch=JSON.parse(entry.content);
  return {runId:batch.runId,originalEvidence:entry.relativeOriginalPath,originalEvidenceSha256:entry.sha256,
   source:batch.source??null,mirror:{root:batch.mirror?.root??null,identity:batch.mirror?.identity??null,inventoryPointer:"/mirror/copied",exclusionsPointer:"/mirror/excluded",equalsCompleteCanonicalTree:"NOT_CLAIMED"},
   cache:{root:batch.cacheRoot??null,packageVersion:batch.packageVersion??null,runtimeInventorySha256:batch.runtimeInventorySha256??null},
   runtimeResourceCorrespondence:batch.runtime??[],grading:"Preserved exclusively in original batch/review evidence; this packer does not alter or derive verdicts."};
 });
}
function prepare(maximum,target){
 finalClosureControl();
 const inventory=sourceInventory(),snapshots=new Map(),entries=inventory.selected.map(relative=>{
  const absolute=owned(REVIEWER,relative),before=fs.statSync(absolute,{bigint:true}),bytes=fs.readFileSync(absolute),after=fs.statSync(absolute,{bigint:true});
  fail(before.size===after.size&&before.mtimeNs===after.mtimeNs,`source changed during read: ${relative}`);
  snapshots.set(relative,bytes);return entryFromBuffer(relative,absolute,bytes);
 });
 for(const [relative,expected] of Object.entries(PINNED_SHA256))fail(entries.find(entry=>entry.relativeOriginalPath===relative)?.sha256===expected,`pinned original-byte SHA-256 mismatch: ${relative}`);
 const findings=entries.flatMap(secretScan),packets=packetize(entries,maximum),identities=identityReferences(entries),mapping=[];
 const actualBatches=identities.map(identity=>JSON.parse(entries.find(entry=>entry.relativeOriginalPath===identity.originalEvidence).content));
 fail(actualBatches.length===4&&actualBatches.every(batch=>batch.source?.canonicalSha==="5bce83410802b04c2d0c7fb0324610f87917a386"),"frozen12 batch/source identity mismatch");
 const actualAttempts=actualBatches.flatMap(batch=>Object.values(batch.cases??{}).flatMap(state=>state.attempts??[]));
 const actualUuids=new Set(actualAttempts.map(attempt=>attempt.threadId).filter(Boolean));
 const actualInputs=entries.filter(entry=>/\/\d+\.input\.txt$/.test(entry.relativeOriginalPath));
 fail(actualUuids.size===15&&actualInputs.length===31,"final actual15UUID/31inputs do not match frozen12 source");
 fail(actualAttempts.flatMap(attempt=>attempt.turns??[]).every(turn=>turn.transportStatus!=="RUNNING"),"source still contains an active model writer");
 for(const packet of packets){
  const decoded=JSON.parse(packet.buffer.toString("utf8"));
  decoded.entries.forEach((entry,index)=>{
   fail(restore(entry).equals(snapshots.get(entry.relativeOriginalPath)),`serialized Buffer restoration mismatch: ${entry.relativeOriginalPath}`);
   const {content,...metadata}=entry;mapping.push({...metadata,packet:packet.file,entryIndex:index,jsonPointer:`/entries/${index}`,lineLocator:"Decode content exactly; original 1-based JSONL/text lines are unchanged."});
  });
 }
 const inventorySha256=hash(Buffer.from(entries.map(entry=>`${entry.relativeOriginalPath}\0${entry.sha256}\0${entry.bytes}\n`).join(""),"utf8"));
 const index={schemaVersion:1,kind:"lossless-reviewer-evidence-index",sourceRoot:REVIEWER,targetScope:target,sourceInventorySha256:inventorySha256,fileCount:entries.length,originalBytes:entries.reduce((total,entry)=>total+entry.bytes,0),
  encodingPolicy:"Strict UTF-8 exact content; invalid UTF-8 encoded as base64; each restored Buffer and SHA-256 verified.",
  sourceAllowlist:{historyIncludes:"0.1.12 stopped prefixes only; earlier sealed snapshots, independent engineering, drafts and all0.1.13 evidence remain separate",authority:"archive-022-control.json independently verified final grade closure; original grades, failures, partial/unrun paths and protocol/stop records preserved",rootFiles:ROOT_FILES,rootDirectories:ROOT_DIRS,runIds:identities.map(identity=>identity.runId).sort(),runEvidence:identities.map(identity=>identity.originalEvidence).sort(),reviews:"all actual ordinary files within the authorized roots"},pinnedOriginalByteSha256:PINNED_SHA256,excluded:inventory.excluded,
  packets:packets.map(packet=>({file:packet.file,scope:packet.scope,bytes:packet.buffer.length,sha256:hash(packet.buffer),fileCount:packet.document.entries.length})),
  files:mapping,identityEvidence:"identities.json; source SHA/tree, reviewer mirror identity, installed cache and runtime hashes remain separate.",
  absolutePathRole:"Original absolute paths are historical source locators mapped to packet entries; no claim that those paths remain accessible on another machine.",
  citationResolution:"Find originalAbsolutePath or relativeOriginalPath in files; locate packet and entryIndex; Buffer.from(content, encoding) restores exact original bytes and original JSONL line numbers.",
  security:{scannedFiles:entries.length,findings:findings.length,matchedSecretValuesExcludedFromReport:true,authenticationActualFilesExcluded:true},
  actualAccounting:{distinctRealUuidCount:actualUuids.size,rawInputFileCount:actualInputs.length,partialAndNoAttemptStates:"Preserved exactly; not promoted to PASS"},
  verdictPolicy:"Original evidence and grades are opaque preserved content. No grade recomputation, editing, retroactive PASS, replay conversion, or full-tree equality claim."};
 return {inventory,entries,snapshots,findings,packets,index,identities};
}
function report(prepared,maximum){
 return {mode:"dry-run",sourceRoot:REVIEWER,target:prepared.index.targetScope,targetWritten:false,fileCount:prepared.index.fileCount,totalOriginalBytes:prepared.index.originalBytes,pinnedOriginalByteSha256:PINNED_SHA256,
  sourceInventorySha256:prepared.index.sourceInventorySha256,packetLimitBytes:maximum,packetCount:prepared.packets.length,totalPacketBytes:prepared.packets.reduce((total,packet)=>total+packet.buffer.length,0),
  largestOriginalFile:prepared.entries.reduce((largest,entry)=>entry.bytes>largest.bytes?{relativeOriginalPath:entry.relativeOriginalPath,bytes:entry.bytes}:largest,{relativeOriginalPath:null,bytes:0}),
  largestPacketBytes:Math.max(0,...prepared.packets.map(packet=>packet.buffer.length)),oversizedPackets:prepared.packets.filter(packet=>packet.oversized).map(packet=>({file:packet.file,bytes:packet.buffer.length})),
  encodingCounts:{utf8:prepared.entries.filter(entry=>entry.encoding==="utf8").length,base64:prepared.entries.filter(entry=>entry.encoding==="base64").length},
  exactBufferRoundTrips:prepared.entries.length,sourceGroups:prepared.packets.map(packet=>({file:packet.file,fileCount:packet.document.entries.length,bytes:packet.buffer.length})),
  excluded:prepared.inventory.excluded,secretPatternScan:{status:prepared.findings.length?"BLOCKED_FINDINGS":"NO_PATTERN_FINDINGS",scannedFiles:prepared.entries.length,findings:prepared.findings,secretValuesPrinted:false},
  finalCopyGate:"pack requires --final-reviewed true and the exact final --expected-inventory-sha256; no existing target may be overwritten."};
}
function unchanged(prepared){
 const latest=sourceInventory();fail(JSON.stringify(latest.selected)===JSON.stringify(prepared.inventory.selected),"source file inventory changed after snapshot");
 for(const entry of prepared.entries)fail(fs.readFileSync(owned(REVIEWER,entry.relativeOriginalPath)).equals(prepared.snapshots.get(entry.relativeOriginalPath)),`source bytes changed after snapshot: ${entry.relativeOriginalPath}`);
}
function verify(target,compareOriginals=false){
 const index=JSON.parse(fs.readFileSync(owned(target,"index.json"),"utf8")),mapped=new Map(index.files.map(entry=>[entry.relativeOriginalPath,entry]));
 fail(index.files.length===index.fileCount&&mapped.size===index.fileCount,"duplicate or missing file mappings in index");
 for(const [relative,expected] of Object.entries(index.pinnedOriginalByteSha256??{}))fail(mapped.get(relative)?.sha256===expected,`pinned index SHA-256 mismatch: ${relative}`);
 const identityBytes=fs.readFileSync(owned(target,"identities.json"));
 fail(hash(identityBytes)===index.identityEvidenceSha256,"identity evidence hash mismatch");JSON.parse(identityBytes.toString("utf8"));
 let files=0,bytes=0;const seen=new Set();
 for(const packet of index.packets){
  const raw=fs.readFileSync(owned(target,packet.file));fail(raw.length===packet.bytes&&hash(raw)===packet.sha256,`packet hash mismatch: ${packet.file}`);
  const document=JSON.parse(raw.toString("utf8"));fail(document.entries.length===packet.fileCount,`packet count mismatch: ${packet.file}`);
  document.entries.forEach((entry,entryIndex)=>{
   fail(!seen.has(entry.relativeOriginalPath),"duplicate original evidence mapping");seen.add(entry.relativeOriginalPath);
   const row=mapped.get(entry.relativeOriginalPath);fail(row&&row.packet===packet.file&&row.entryIndex===entryIndex&&row.sha256===entry.sha256&&row.bytes===entry.bytes&&row.encoding===entry.encoding&&row.originalAbsolutePath===entry.originalAbsolutePath,"index-to-packet mapping mismatch");
   const restored=restore(entry);if(compareOriginals)fail(restored.equals(fs.readFileSync(owned(REVIEWER,entry.relativeOriginalPath))),`original comparison mismatch: ${entry.relativeOriginalPath}`);files++;bytes+=restored.length;
  });
 }
 fail(files===index.fileCount&&bytes===index.originalBytes&&seen.size===mapped.size,"complete restoration count mismatch");
 const inventorySha256=hash(Buffer.from([...index.files].sort((a,b)=>a.relativeOriginalPath<b.relativeOriginalPath?-1:a.relativeOriginalPath>b.relativeOriginalPath?1:0).map(entry=>`${entry.relativeOriginalPath}\0${entry.sha256}\0${entry.bytes}\n`).join(""),"utf8"));
 fail(inventorySha256===index.sourceInventorySha256,"source inventory hash mismatch");
 return {mode:"verify",target,files,originalBytes:bytes,allPacketHashesVerified:true,allOriginalFileHashesVerified:true,identityEvidenceHashVerified:true,sourceBytesCompared:compareOriginals};
}
function selfTest(){
 const samples=[Buffer.from("a \t\r\nb\n\n\"quoted\"\\path\u0000中文😀\n","utf8"),Buffer.from([0xef,0xbb,0xbf,0x78,0x0d,0x0a]),Buffer.from([0xff,0xc0,0x00,0x80])];
 for(const [index,bytes] of samples.entries()){const entry=entryFromBuffer(`test-${index}.txt`,"synthetic-memory-only",bytes),serialized=JSON.parse(serialize({entries:[entry]}).toString("utf8"));fail(restore(serialized.entries[0]).equals(bytes),"self-test roundtrip failed");}
 fail(entryFromBuffer("invalid.txt","synthetic-memory-only",samples[2]).encoding==="base64","invalid UTF-8 must use base64");
 const synthetic=entryFromBuffer("synthetic.txt","synthetic-memory-only",Buffer.from('access_token="synthetic-only-value-123456789"\n'));
 fail(secretScan(synthetic).some(finding=>finding.rule==="credential-assignment"),"assignment scan self-test failed");
 const redacted=entryFromBuffer("redacted.txt","synthetic-memory-only",Buffer.from('access_token="[REDACTED_AUTH]"\nBearer [REDACTED_AUTH]\n'));
 fail(secretScan(redacted).length===0,"redacted placeholders must not be flagged");
 return {mode:"self-test",inMemoryOnly:true,utf8AndBomAndInvalidUtf8Restoration:"PASS",secretPatternDetection:"PASS",filesystemCopies:0};
}
function finalClosureControl(){
 const file=owned(REVIEWER,"archive-022-control.json"),control=JSON.parse(fs.readFileSync(file,"utf8"));
 fail(control.phase==="INDEPENDENT_CLOSED_SOURCE_DRY_RUN_PREPARATION"&&control.finalGradeClosureVerified===true,"archive022 is PREP_ONLY until final grade closure is independently verified");
 fail(JSON.stringify(control.sourceAllowlist?.rootFiles)===JSON.stringify(ROOT_FILES)&&JSON.stringify(control.sourceAllowlist?.rootDirectories)===JSON.stringify(ROOT_DIRS),"archive control allowlist differs from this exact packer");
 const relative=posix(path.relative(REVIEWER,path.resolve(control.closureBasis?.path??"")));
 fail(ROOT_DIRS.some(root=>relative.startsWith(root+"/")),"grade closure must be within the explicit authorized source roots");
 fail(!blocked(relative,false),"grade closure cannot be an actual runtime/authentication/configuration file");
 const closure=owned(REVIEWER,relative);fail(hash(fs.readFileSync(closure))===control.closureBasis.sha256,"grade closure basis SHA changed");
 fail(control.realDistinctUUIDs===15&&control.actualInputFiles===31,"0.1.12 archival requires actual15UUID/31input accounting");
 fail(control.inputsOutputsAndSessionsUnchangedThroughGrade===true&&control.noRunningTurns===true,"raw source or writer closure incomplete");
 const finalPins=control.pinnedFinalEvidenceSha256;fail(finalPins&&Object.keys(finalPins).length>0,"final dynamic evidence pins absent; not sealed");
 for(const [relative,expected]of Object.entries(finalPins)){
  fail((ROOT_FILES.includes(relative)||ROOT_DIRS.some(root=>relative.startsWith(root+"/"))),"final evidence pin outside explicit source allowlist");
  fail(!blocked(relative,false),"actual runtime/authentication/configuration pin is forbidden");
  fail(hash(fs.readFileSync(owned(REVIEWER,relative)))===expected,"final dynamic evidence pin changed: "+relative);
 }
 return control;
}

function main(){
 const [mode="dry-run",...argv]=process.argv.slice(2),args=options(argv);
 fail(!args["snapshot-name"]||/^[a-z][a-z0-9-]{0,39}$/.test(args["snapshot-name"]),"snapshot name must be a short lowercase directory name");
 const expectedTarget=args["snapshot-name"]?path.join(EXPECTED_TARGET,args["snapshot-name"]):EXPECTED_TARGET,target=path.resolve(args.target??expectedTarget);
 fail(target===expectedTarget,"target must be the authorized PR3 reviewer evidence directory or its named new snapshot");
 if(mode==="self-test"){console.log(JSON.stringify(selfTest(),null,2));return;}
 if(mode==="verify"){console.log(JSON.stringify(verify(target,args["compare-originals"]==="true"),null,2));return;}
 fail(mode==="dry-run"||mode==="pack","supported modes: dry-run, self-test, pack, verify");
 const maximum=Number(args["max-packet-bytes"]??DEFAULT_PACKET_LIMIT);fail(Number.isSafeInteger(maximum)&&maximum>=65536&&maximum<=16*1024*1024,"packet limit must be 64 KiB through 16 MiB");
 if(mode==="pack"){
  fail(Boolean(args["snapshot-name"]),"pack022 requires a new named snapshot; earlier sealed records cannot be replaced");
  fail(args["final-reviewed"]==="true","final review completion must be explicitly supplied before copying");
  fail(/^[a-f0-9]{64}$/.test(args["expected-inventory-sha256"]??""),"pack requires the final dry-run inventory SHA-256");
  fail(!fs.existsSync(target),"target already exists; no overwrite is permitted");
 }
 const prepared=prepare(maximum,target),dry=report(prepared,maximum);
 if(mode==="dry-run"){console.log(JSON.stringify(dry,null,2));if(prepared.findings.length||dry.oversizedPackets.length)process.exitCode=1;return;}
 fail(prepared.findings.length===0,"secret pattern findings block copying; inspect sanitized dry-run findings");
 fail(!dry.oversizedPackets.length,"oversized packet entries block copying; choose an explicit suitable packet limit");
 fail(prepared.index.sourceInventorySha256===args["expected-inventory-sha256"],"source differs from the expected final dry-run snapshot");unchanged(prepared);
 // The only mutating path is gated above; every destination is new and written with wx.
 const parent=path.dirname(target);fail(fs.existsSync(parent)&&fs.statSync(parent).isDirectory(),"authorized evidence parent must already exist");
 within(AUTHORIZED_REPO,parent);let ancestor=parent;
 while(true){fail(!fs.lstatSync(ancestor).isSymbolicLink(),"target ancestor cannot be a reparse link");if(ancestor===AUTHORIZED_REPO)break;ancestor=path.dirname(ancestor);}
 within(fs.realpathSync.native(AUTHORIZED_REPO),fs.realpathSync.native(parent));
 fs.mkdirSync(target);fs.mkdirSync(within(target,path.join(target,"packets")));
 for(const packet of prepared.packets)fs.writeFileSync(within(target,path.join(target,packet.file)),packet.buffer,{flag:"wx"});
 const identityBytes=serialize({schemaVersion:1,runIdentities:prepared.identities});prepared.index.identityEvidenceSha256=hash(identityBytes);
 fs.writeFileSync(within(target,path.join(target,"identities.json")),identityBytes,{flag:"wx"});
 fs.writeFileSync(within(target,path.join(target,"index.json")),serialize(prepared.index),{flag:"wx"});
 console.log(JSON.stringify({...verify(target,true),mode:"pack",target,sourceInventorySha256:prepared.index.sourceInventorySha256,packetCount:prepared.packets.length},null,2));
}
try{main();}catch(error){console.error(JSON.stringify({error:String(error.message),secretValuesPrinted:false}));process.exitCode=1;}
