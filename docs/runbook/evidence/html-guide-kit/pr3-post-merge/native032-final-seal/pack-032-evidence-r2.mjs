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
const ROOT_FILES=["archive-032-control-r2.json","build-pack-032-native-logic-r2.mjs","packer-provenance/native-ui-0-1-20/preparation-control-r2.json","verify-lossless-032-dotnet.ps1"];
const ROOT_DIRS=["native-public/0-1-20"];
const PINNED_SHA256={"native-public/0-1-20/chat/01.assistant-content-reference.txt":"df4b9bf072e5e83da17c511b8261c572eea025fadd49435edf154fd31481866e","native-public/0-1-20/chat/01.input.txt":"5443f16e0d05a939aec275885ae25d17042e3aaeb75ef3601e0d353c513bde4c","native-public/0-1-20/chat/02-entry-unavailable-window.png":"a1e17de922c72bfa4fa9dcdfd3cbac374338dc97f2e97e9944a658757719b3b5","native-public/0-1-20/chat/02-visible-top-output.scope.json":"9590b6045a9c4aa67b8dbc7cb853c66f41f0987472e73d1892b796aee58fe0b0","native-public/0-1-20/chat/03-visible-middle-output.scope.json":"7ec45effff1c4b9cdcd610436b13f5a6490cc1369179dc1aa33afc46109466dd","native-public/0-1-20/chat/03-visible-middle-window.png":"4a3f578ec1cfe09ab8beac48144177cd62f8ab2391af8f1ac61b3070ffdc8130","native-public/0-1-20/chat/04-visible-selection-output.scope.json":"9e6ca2093bea2640d7d5efbf54710f21909b38fdcee838b6586e0aa956230ee2","native-public/0-1-20/chat/04-visible-selection-window.png":"227a9067c9d71dd14e4321c7ef668d357d2260e9159eda83585c90f8b9f8fb9e","native-public/0-1-20/chat/05-visible-bottom-output.scope.json":"af19617328050faf2e9940e5062e237ace892edc9978ef6a486cf3524aea5af1","native-public/0-1-20/chat/05-visible-bottom-window.png":"c197f0af9927500930b446c17434e913a89e29c132d7095a2cddbc6337d2db34","native-public/0-1-20/chat/actual-cloud-read.json":"d3f4b4fa718fc0ece27084adeae5547de3590d72848c42b59ae6b44657d58697","native-public/0-1-20/chat/independent-visible-notes.json":"26db664c5ebc3af223e9469cb68064ea6fae784253e8575f349cc6e96807eab7","native-public/0-1-20/chat/session-evidence.json":"457737bed98fcc2137ce049261742bc4563822e0a2c698289c25831da69c6dd5","native-public/0-1-20/codex/01.answer.txt":"5d6bb3ac22d5fbc1809a1e10b02392c29b3e33610b67d06116e91a2bca03c1bb","native-public/0-1-20/codex/01.input.txt":"9dabe73a1d5cc9f05dedcf9368bb3929f00f621d3db488c454f3681c6a278410","native-public/0-1-20/codex/02.answer.txt":"b4f65bda66f211e5bb2eb4a561be585d103b18e184431a02f2e19365b3bc891e","native-public/0-1-20/codex/02.input.txt":"e4d78c7e0e940843d9e19e4a8619f8cac89ac98b8c3964ccf3ef85f7217877c4","native-public/0-1-20/codex/03.answer.txt":"7d2874a7a6da7e807d4b36881a60d5a57674ef6f7e278db7465555e25805aa52","native-public/0-1-20/codex/03.input.txt":"04e450eddeaf9d23f4426f71b5a7a8af258c7482daca6fb76604e64dddc799d9","native-public/0-1-20/codex/04-delivered-window.png":"f6fd74eddcf2f1ef9ff4262adbf05883f402655da30017e6d2044dc4ef426c5a","native-public/0-1-20/codex/independent-review.public-scope.json":"bf745f67b1dc13da68158c637937cde5076c341b5f9c7c94133cce76f9494a6a","native-public/0-1-20/codex/sdk-own.scope.json":"9e72128eb3156c06ec6620c0ea1a80e826d3b0830fa571699666acb87c7219e6","native-public/0-1-20/codex/session-evidence.json":"766dee7fffbccedc48e6adc0fa7c8d936a0b43fc315002da34c39d259a42d169","native-public/0-1-20/codex/turn-1.scope.json":"5365b237f10d024b13bfe6035772189df461303d351ba6b0aac3fd2cba68aebd","native-public/0-1-20/codex/turn-2.scope.json":"ae53a884c09d19584d2e10f186a1b986f3398ced29f6abb677239824d9773e64","native-public/0-1-20/codex/turn-3.scope.json":"9098bd6ba38e5608551ff7259fb3c705dcd0e051081e8848f532ed160136c912","native-public/0-1-20/installation/canonical-source-cache-pins.json":"91523c4f0bd011dfb89d5ec9bed91a820bc09cfd6130768cf475ae6e730f5303","native-public/0-1-20/installation/installed-plugin-observation.scope.json":"f47c30ee67ddbbdb2680de832201a5b3136ee2e0ea840119401a86908f6649c8","native-public/0-1-20/installation/installed-plugin-window.png":"42c2e86b5b53390f8890903ea1816b58fab83da70c7c7fd5d41de362dbf52919","native-public/0-1-20/public-scope-manifest.json":"a8438bcd9604075dc292f9adf4453be49b68cefc70f92df7f8dfa0c9579ac9df","native-public/0-1-20/work/01.answer.txt":"0c99b1cfe7a26c5aed972128a929395e132cd1b0f0f1f9e13b5772526737e0a6","native-public/0-1-20/work/01.input.txt":"fa2efdcd709e49a3187316a343fe4a8f754c0e1f309f3b045a33c4b10d2d70ac","native-public/0-1-20/work/02.answer.txt":"ab4b3f8fbf00ba858831ef33ca118fe3834fbf7e95b2a38c403e3216852e1fa7","native-public/0-1-20/work/02.input.txt":"e4d78c7e0e940843d9e19e4a8619f8cac89ac98b8c3964ccf3ef85f7217877c4","native-public/0-1-20/work/03.answer.txt":"018dde325547ddd18bbed9dd21a0181098752918a21c8e603a3b60c7bb9538b8","native-public/0-1-20/work/03.input.txt":"04b8012486e47f4f6ddc84c2da6e3922dca934d1635c1dcc13bac81755b6cc6a","native-public/0-1-20/work/04-delivered-window.png":"d67957d41816d5cb2e424f4522ff921d9be95652ddc92cf273cf654feb1bcc0e","native-public/0-1-20/work/independent-review.public-scope.json":"93cceb5ce5b0cd996e1fd47cdd89dd70d8ca11bb26daa95dc465b4af7f488d49","native-public/0-1-20/work/sdk-own.scope.json":"31d3f38cc5ac70cdc1025c95cf361dc333c9b9bca2c8daf7fc77fd5f5e140e46","native-public/0-1-20/work/session-evidence.json":"4974ad4ad4213ef8b0df7483bd185028cceb41319b2b11c1f7aed8787f4df049","native-public/0-1-20/work/turn-1.scope.json":"7f89473a38c0bc85184899e55d8d2ffc527756d9bcc683331451c565b5cd6b9f","native-public/0-1-20/work/turn-2.scope.json":"a568596f5d8ceb3ff883b0162cd9b8f3431853bc54a67d3519c0b5ccb64d4f55","native-public/0-1-20/work/turn-3.scope.json":"3d02a21ae0a7272e672b4feaa5adae818c92bb114eb5c049f7733ee38c04d909"};
const BLOCKED_DIRS=new Set([".git","node_modules","home","codex-home","codex_home","codexhome","sessions","auth","secrets","credentials","cache","plugins","tmp","temp","config"]);
const BLOCKED_FILE=/^(?:auth\.json|config\.toml|credentials(?:\.[^.]+)?|tokens?(?:\.[^.]+)?|\.env(?:\..*)?)$/i;
const DEFAULT_PACKET_LIMIT=2097151;
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
 excluded.push({relativeOriginalPath:'private originals and all non-allowlisted locations',reason:'Excluded by explicit native public-scope allowlist; no private source enumeration or HOME traversal.'});
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
 return entries.filter(entry=>/^native-public\/0-1-20\/(work|codex|chat)\/session-evidence\.json$/.test(entry.relativeOriginalPath)).map(entry=>{
  const identity=JSON.parse(entry.content);
  return {...identity,originalEvidence:entry.relativeOriginalPath,originalEvidenceSha256:entry.sha256,
   mirrorWholeTreeEquality:'NOT_CLAIMED',cachePhysicalFilesPacked:false,
   scope:'Explicit native own-session selections; private whole SDK/A11/HOME not packed.',
   grading:'Exact original independent criteria and finite result preserved; no recomputation or extension of coverage.'};
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
 fail(identities.length===3&&identities.every(i=>i.source?.canonicalSha==='7e3deb8fb1d9960ede37ea96a714b1e34652a751'),'Three native exact-source identities required');
 const actualUuids=new Set(identities.map(i=>i.runId));
 const actualInputs=entries.filter(e=>/^native-public\/0-1-20\/(work|codex|chat)\/\d+\.input\.txt$/.test(e.relativeOriginalPath));
 fail(actualUuids.size===3&&actualInputs.length===7,'Three native UUIDs/seven own actual inputs required');
 const work=identities.find(i=>i.sourceSessionKind==='Work local-backed UI'),codex=identities.find(i=>i.sourceSessionKind==='Codex local UI'),chat=identities.find(i=>i.runId==='6acf3d18-6a3c-83ee-a0ca-529a710117d4');
 fail(work?.actualUserInputs===3&&work.actualCompletedTurns===3&&work.actualModelTools===3,'Work finite accounting mismatch');
 fail(codex?.actualUserInputs===3&&codex.actualCompletedTurns===3&&codex.actualModelTools===4&&codex.ownReadOnlyDescriptorLookups===1,'Codex finite accounting mismatch');
 fail(chat?.actualUserInputs===1&&chat.apiCompletedTurns===1&&chat.fullAssistantBodyAvailable===false&&chat.modelToolEventCount==='UNKNOWN_NOT_EXPOSED','PureChat limitations cannot be inferred away');
 for(const client of [work,codex])fail(client.sourceMirrorCacheCorrespondence?.length===10&&client.sourceMirrorCacheCorrespondence.every(row=>row.sourceSha256===row.mirrorSha256&&row.sourceSha256===row.cacheSha256),'Ten separate source/mirror/cache byte pins required');
 for(const packet of packets){
  const decoded=JSON.parse(packet.buffer.toString("utf8"));
  decoded.entries.forEach((entry,index)=>{
   fail(restore(entry).equals(snapshots.get(entry.relativeOriginalPath)),`serialized Buffer restoration mismatch: ${entry.relativeOriginalPath}`);
   const {content,...metadata}=entry;mapping.push({...metadata,packet:packet.file,entryIndex:index,jsonPointer:`/entries/${index}`,lineLocator:"Decode the public scoped source exactly; private original source line selectors are declared inside each derivative, not a complete private-source reproduction."});
  });
 }
 const inventorySha256=hash(Buffer.from(entries.map(entry=>`${entry.relativeOriginalPath}\0${entry.sha256}\0${entry.bytes}\n`).join(""),"utf8"));
 const index={schemaVersion:1,kind:"lossless-reviewer-evidence-index",sourceRoot:REVIEWER,targetScope:target,sourceInventorySha256:inventorySha256,fileCount:entries.length,originalBytes:entries.reduce((total,entry)=>total+entry.bytes,0),
  encodingPolicy:"Strict UTF-8 exact content; invalid UTF-8 encoded as base64; each restored Buffer and SHA-256 verified.",
  sourceAllowlist:{historyIncludes:'Source20 native Work and Codex finite three-turn paths; pureChat unavailable entry and readable output fragments. These are separate from original and recovered CLI batches.',authority:'archive-032-control-r2.json scoped own-session export and original criterion byte equality',rootFiles:ROOT_FILES,rootDirectories:ROOT_DIRS,runIds:identities.map(i=>i.runId).sort(),runEvidence:identities.map(i=>i.originalEvidence).sort(),reviews:'Declared public-scope copies with private original report SHA and unchanged criteria; never whole private originals'},pinnedOriginalByteSha256:PINNED_SHA256,excluded:inventory.excluded,
  packets:packets.map(packet=>({file:packet.file,scope:packet.scope,bytes:packet.buffer.length,sha256:hash(packet.buffer),fileCount:packet.document.entries.length})),
  files:mapping,identityEvidence:"identities.json; exact native UUIDs, separate canonical/source/mirror/cache byte pins and explicit path resolution; physical SDK/cache/HOME excluded.",
  absolutePathRole:"Original absolute paths are historical source locators mapped to packet entries; no claim that those paths remain accessible on another machine.",
  citationResolution:"Find the public derivative path in files and restore its exact bytes from packet/entryIndex. Its declared crosswalk identifies selected private source rows and omissions; private whole SDK/A11 is not reconstructed.",
  security:{scannedFiles:entries.length,findings:findings.length,matchedSecretValuesExcludedFromReport:true,authenticationActualFilesExcluded:true},
  actualAccounting:{distinctRealUuidCount:actualUuids.size,rawInputFileCount:actualInputs.length,scopeLimits:"Work/Codex finite P only; pureChat body/reference/tool limitations preserved. No popup, whole-client or effect PASS is inferred."},
  verdictPolicy:"Original independent criteria are opaque and unchanged within declared public-scope copies. Restored bytes equal the explicit public derivative sources, not omitted private originals. No recomputation, retroactive PASS, or full-tree equality claim."};
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
 const control=JSON.parse(fs.readFileSync(owned(REVIEWER,'archive-032-control-r2.json'),'utf8'));
 fail(control.phase==='INDEPENDENT_NATIVE_UI_PUBLIC_SCOPE_PREPARATION'&&control.sourceScopesVerified===true,'Native public export scope must be independently checked');
 fail(JSON.stringify(control.sourceAllowlist?.rootFiles)===JSON.stringify(ROOT_FILES)&&JSON.stringify(control.sourceAllowlist?.rootDirectories)===JSON.stringify(ROOT_DIRS),'Exact allowlist mismatch');
 fail(control.realDistinctUUIDs===3&&control.actualInputFiles===7&&control.noModelOrGradePerformedByPacker===true,'Native finite accounting or role mismatch');
 fail(control.privateOriginalsPacked===false&&control.wholeSdkOrHomePacked===false&&control.wholeA11Packed===false,'Privacy omissions must remain explicit');
 fail(hash(fs.readFileSync(owned(REVIEWER,control.scopeBasis.relative)))===control.scopeBasis.sha256,'Public scope basis changed');
 const pins=control.pinnedFinalEvidenceSha256;
 fail(pins&&Object.keys(pins).length>0,'Native final file pins absent');
 for(const [relative,expected] of Object.entries(pins)){
  fail(ROOT_FILES.includes(relative)||ROOT_DIRS.some(root=>relative.startsWith(root+'/')),'Pin outside native scope');
  fail(!blocked(relative,false),'Forbidden actual credential/configuration/runtime file');
  fail(hash(fs.readFileSync(owned(REVIEWER,relative)))===expected,'Native public source pin changed: '+relative);
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
 const maximum=Number(args["max-packet-bytes"]??DEFAULT_PACKET_LIMIT);fail(Number.isSafeInteger(maximum)&&maximum>=65536&&maximum<2*1024*1024,"native packet limit must be 64 KiB through 2097151 bytes");
 if(mode==="pack"){
  fail(Boolean(args["snapshot-name"]),"pack032 requires a new named snapshot; earlier sealed records cannot be replaced");
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
