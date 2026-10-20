import fs from "node:fs";
import path from "node:path";
import {createHash} from "node:crypto";
import {fileURLToPath} from "node:url";
const source=path.dirname(fileURLToPath(import.meta.url)),destination=source+"-selected",sha=b=>createHash("sha256").update(b).digest("hex");
const read=file=>JSON.parse(fs.readFileSync(path.join(source,file),"utf8"));
const extraction=read("independent-extraction.json"),summary=read("summary.json"),terminal=read("terminal-receipt.json");
if(extraction.status!=="PASS"||summary.status!=="PASS"||terminal.driverExit!==0)throw Error("Not a complete PASS; preserve failures and create a truthful failure selection instead");
fs.mkdirSync(destination,{recursive:false});
const profileFiles=fs.readdirSync(path.join(source,"perf")).filter(x=>x.endsWith(".ndjson"));
const profiles=profileFiles.map(file=>{const bytes=fs.readFileSync(path.join(source,"perf",file));return{file:"perf/"+file,bytes:bytes.length,sha256:sha(bytes)};});
const events=profileFiles.flatMap(file=>fs.readFileSync(path.join(source,"perf",file),"utf8").split(/\r?\n/).filter(Boolean).map(JSON.parse).filter(x=>x.phase==="copy"));
const put=(file,data)=>fs.writeFileSync(path.join(destination,file),JSON.stringify(data,null,2)+"\n",{flag:"wx"});
put("copy-events.json",{capturedAt:new Date().toISOString(),basis:"Exact extraction of all original copy events; original complete NDJSON retained locally and hashed",profiles,copyEvents:events});
put("selection-receipt.json",{schemaVersion:1,capturedAt:new Date().toISOString(),role:"Independent actual PR283 installation execution /root/contract_scan",status:extraction.status,sourceDirectory:source,actual:extraction.source,execution:extraction.execution,fullCombo:extraction.fullCombo,cleanup:extraction.cleanup,stability:extraction.stability,checks:extraction.checks,selection:"Only listed methods/raw results/metadata/inventories; no full plugin/harness/cache copy or generated artifact copies selected. Complete one-time snapshots stay in local sourceDirectory. This is not a public full-directory closure claim.",completeLocalManifest:{file:"final-manifest.json",sha256:sha(fs.readFileSync(path.join(source,"final-manifest.json"))),scope:"Local complete snapshot identity only; selected manifest separately defines selected payload"},limitations:extraction.limits});
const selected=["prepare-method.mjs","method.mjs","finalize.mjs","select-evidence.mjs","summary.json","terminal-receipt.json","independent-extraction.json","REPORT-final.md","smoke-result.json","commands.json","owned-root-cleanup.json","before.json","after.json","before-worktrees.txt","after-worktrees.txt","plugins-before.json","plugins-after.json","harness-before.json","harness-after.json","installed-generated-comparison.json","generated-inventory.json","baseline.json","baseline.stdout.log","baseline.stderr.log","execution.stdout.log","execution.stderr.log"];
const entries=selected.map(file=>{const bytes=fs.readFileSync(path.join(source,file));return{sourceDirectory:source,file,bytes:bytes.length,sha256:sha(bytes)};});
for(const file of ["selection-receipt.json","copy-events.json"]){const bytes=fs.readFileSync(path.join(destination,file));entries.push({sourceDirectory:destination,file,bytes:bytes.length,sha256:sha(bytes)});}
const manifest=Buffer.from(JSON.stringify({schemaVersion:1,capturedAt:new Date().toISOString(),status:extraction.status,scope:"Selected immutable source pointers; all excluded complete snapshots stay local",files:entries},null,2)+"\n");
fs.writeFileSync(path.join(destination,"selected-manifest.json"),manifest,{flag:"wx"});
for(const entry of entries){const bytes=fs.readFileSync(path.join(entry.sourceDirectory,entry.file));if(bytes.length!==entry.bytes||sha(bytes)!==entry.sha256)throw Error("Selected source drift");}
console.log(JSON.stringify({status:extraction.status,selectedPayloadFiles:entries.length,payloadBytes:entries.reduce((n,x)=>n+x.bytes,0),selectedManifestSha256:sha(manifest),selectionReceiptSha256:sha(fs.readFileSync(path.join(destination,"selection-receipt.json")))}));
