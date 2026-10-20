import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {createHash} from "node:crypto";
import {execFileSync} from "node:child_process";
import {pathToFileURL,fileURLToPath} from "node:url";
const directory=path.dirname(fileURLToPath(import.meta.url));
const repository="C:/Users/Admin/.codex/worktrees/html-learning-artifact/develop";
const primary="D:/workspace/10-software-project/projects/mj-agentlab-marketplace/develop";
const python="C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe";
const sha=bytes=>createHash("sha256").update(bytes).digest("hex");
const startedAt=new Date().toISOString();
const start=performance.now();
const put=(file,data)=>fs.writeFileSync(path.join(directory,file),typeof data==="string"?data:JSON.stringify(data,null,2)+"\n",{flag:"wx"});
const git=(at,...args)=>execFileSync("git",args,{cwd:at,encoding:"utf8",maxBuffer:8*1024*1024});
const originalPlan=path.join(primary,"HTML-Learning-Artifact-Plugin-Implementation-Plan.md");
const originalIdentity=()=>{const bytes=fs.readFileSync(originalPlan);return{path:originalPlan,bytes:bytes.length,sha256:sha(bytes)};};
const before={ownerOriginal:originalIdentity(),capturedAt:new Date().toISOString(),hostHEAD:git(repository,"rev-parse","HEAD").trim(),hostBranch:git(repository,"branch","--show-current").trim(),hostStatus:git(repository,"status","--porcelain=v1"),primaryHEAD:git(primary,"rev-parse","HEAD").trim(),worktrees:git(repository,"worktree","list","--porcelain")};
if(before.hostHEAD!=="a4892f51f4163fb5bd4457d99229eaf1a4683e8f"||before.hostBranch!==""||before.hostStatus!=="")throw Error("Unexpected actual merge/detached/clean source");
if(fs.readFileSync(path.join(repository,"VERSION"),"utf8").trim()!=="8.3.3"||JSON.parse(fs.readFileSync(path.join(repository,"plugins/html-guide-kit/plugin.json"),"utf8")).version!=="0.1.38")throw Error("Unexpected actual versions");
if(!fs.existsSync(python))throw Error("Bundled Python missing");
put("before.json",before);put("before-worktrees.txt",before.worktrees);
function inventory(root,relative=""){
 if(fs.lstatSync(root).isSymbolicLink())throw Error("No source links");
 return fs.readdirSync(path.join(root,relative),{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name)).flatMap(e=>{
   if(e.isSymbolicLink())throw Error("No source links: "+e.name);
   const rel=path.posix.join(relative,e.name);
   if(e.isDirectory())return inventory(root,rel);
   const bytes=fs.readFileSync(path.join(root,rel));
   return[{path:rel,bytes:bytes.length,sha256:sha(bytes)}];
 });
}
const packageRoot=path.join(repository,"plugins"),packageBefore=inventory(packageRoot);
put("plugins-before.json",packageBefore);
for(const item of packageBefore){const target=path.join(directory,"plugins-snapshot",item.path);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(packageRoot,item.path),target);if(sha(fs.readFileSync(target))!==item.sha256)throw Error("Package snapshot race");}
const runtimeOnly=items=>items.filter(x=>!/^[^/]+\/(?:README|CHANGELOG)\.md$/.test(x.path)&&!x.path.split("/").includes("__pycache__")&&!x.path.endsWith(".pyc"));
const methods=["smoke-codex-plugin.mjs","smoke-source.mjs","run-cli.mjs","perf-metrics.mjs","validate-portable.mjs","document-harness.mjs","plugin-icons.mjs","check-tool-versions.mjs"];
const methodBefore=methods.map(file=>{const bytes=fs.readFileSync(path.join(repository,"scripts",file));fs.mkdirSync(path.join(directory,"harness-snapshot"),{recursive:true});fs.writeFileSync(path.join(directory,"harness-snapshot",file),bytes,{flag:"wx"});return{file,bytes:bytes.length,sha256:sha(bytes)};});
put("harness-before.json",methodBefore);
process.env.MJ_PERF_DIR=path.join(directory,"perf");
const baseEnv={...process.env,PATH:path.dirname(python)+path.delimiter+process.env.PATH,PYTHONUTF8:"1",PYTHONDONTWRITEBYTECODE:"1",HTML_SITE_PYTHON:python};
const {runCli}=await import(pathToFileURL(path.join(repository,"scripts/run-cli.mjs")));
const {runSmoke,cleanupIsolatedRoot}=await import(pathToFileURL(path.join(repository,"scripts/smoke-codex-plugin.mjs")));
const baseline=await runCli(process.execPath,[path.join(repository,"scripts/check-tool-versions.mjs"),"--codex","0.147.0"],{cwd:repository,env:baseEnv,timeoutMs:60000});
put("baseline.stdout.log",baseline.stdout);put("baseline.stderr.log",baseline.stderr);
put("baseline.json",{status:baseline.status,error:baseline.error?.message??null,command:process.execPath,args:[path.join(repository,"scripts/check-tool-versions.mjs"),"--codex","0.147.0"]});
if(baseline.error||baseline.status!==0)throw Error("Exact baseline failed");
const profiles=()=>fs.existsSync(path.join(directory,"perf"))?fs.readdirSync(path.join(directory,"perf")).filter(x=>x.endsWith(".ndjson")).flatMap(file=>fs.readFileSync(path.join(directory,"perf",file),"utf8").split(/\r?\n/).filter(Boolean).map(line=>JSON.parse(line))):[];
const progress=setInterval(()=>{
 try{const records=profiles(),last=records.filter(x=>x.details?.installed).at(-1);console.log(JSON.stringify({at:new Date().toISOString(),state:"RUNNING",profileEntries:records.length,lastInstalled:last?.details.installed,phase:last?.phase}));}catch(error){console.error("progress: "+error.message);}
},30000);
let result,failure,comparison=[],generated=[];
try{
 console.log(JSON.stringify({startedAt,operation:"unmodified exported runSmoke",keepRoot:true,base:before.hostHEAD}));
 result=await runSmoke({repoRoot:repository,baseEnv,keepRoot:true});
 put("smoke-result.json",result);
 for(const [index,scenario] of result.scenarios.entries()){
   if(!scenario.installed.includes("html-guide-kit"))continue;
   const skill=path.dirname(scenario.skillPaths["html-guide-kit:site"]),installed=path.resolve(skill,"../..");
   const license=fs.readFileSync(path.join(installed,"LICENSE")),sourceLicense=fs.readFileSync(path.join(directory,"plugins-snapshot/html-guide-kit/LICENSE"));
   if(!license.equals(sourceLicense))throw Error("Installed LICENSE differs from snapshot");
   const siteCount=Object.keys(scenario.installedResources["html-guide-kit:site"]).length,guideCount=Object.keys(scenario.installedResources["html-guide-kit:guide"]).length;
   const output=scenario.siteValidation.rendered.output;
   const entries=inventory(output),m=JSON.parse(fs.readFileSync(path.join(output,"artifact-manifest.json"),"utf8"));
   const outputLicense=fs.readFileSync(path.join(output,"LICENSE")),apache=fs.readFileSync(path.join(output,"licenses/Apache-2.0.txt")),sourceApache=fs.readFileSync(path.join(installed,"licenses/Apache-2.0.txt")),notice=fs.readFileSync(path.join(output,"THIRD_PARTY_NOTICES.md")),sourceNotice=fs.readFileSync(path.join(installed,"THIRD_PARTY_NOTICES.md"));
   const checks={licenseOriginal:outputLicense.equals(license),apacheOriginal:apache.equals(sourceApache),noticeOriginalTail:notice.subarray(notice.length-sourceNotice.length).equals(sourceNotice),noticeHasScopedPrefix:notice.length>sourceNotice.length,allManifestEntries:m.files.every(file=>{const bytes=fs.readFileSync(path.join(output,file.path));return bytes.length===file.bytes&&sha(bytes)===file.sha256;}),exactManifestSet:JSON.stringify(entries.map(x=>x.path).sort())===JSON.stringify([...m.files.map(x=>x.path),"artifact-manifest.json"].sort()),siteResources:siteCount===20,guideResources:guideCount===4};
   if(Object.values(checks).some(value=>value!==true))throw Error("Generated/cache resources failed: "+JSON.stringify(checks));
   const target=path.join(directory,"generated","scenario-"+String(index+1).padStart(2,"0"));
   fs.mkdirSync(target,{recursive:true});for(const entry of entries){const file=path.join(target,entry.path);fs.mkdirSync(path.dirname(file),{recursive:true});fs.copyFileSync(path.join(output,entry.path),file);}
   comparison.push({scenario:index+1,installed:scenario.installed,pluginVersion:JSON.parse(fs.readFileSync(path.join(installed,"plugin.json"),"utf8")).version,packageLicenseSha256:sha(license),generatedFiles:entries.length,manifestPayloadFiles:m.files.length,checks});
   generated.push({scenario:index+1,snapshot:path.relative(directory,target).replaceAll("\\","/"),files:entries,noticePrefix:notice.subarray(0,notice.length-sourceNotice.length).toString("utf8")});
 }
 put("installed-generated-comparison.json",comparison);put("generated-inventory.json",generated);
}catch(error){failure={name:error.name,message:error.message,stack:error.stack,at:new Date().toISOString()};put("failure.json",failure);}
clearInterval(progress);
const records=profiles(),observed=new Set();
for(const row of records.filter(x=>x.phase==="copy")){
 const destination=row.details?.destinationRoot;if(destination&&(row.details.stage==="template"||row.details.stage==="scenario"))observed.add(path.dirname(destination));
}
for(const scenario of result?.scenarios??[])observed.add(scenario.root);
const temporary=fs.realpathSync.native(os.tmpdir()),cleanup=[];
for(const root of observed){
 const absolute=path.resolve(root),relative=path.relative(temporary,absolute),name=path.basename(absolute);
 if(!relative||relative===".."||relative.startsWith(".."+path.sep)||path.isAbsolute(relative)||!/^marketplace-smoke-(?:source-)?[A-Za-z0-9_-]+$/.test(name))throw Error("Unowned cleanup path: "+absolute);
 const existed=fs.existsSync(absolute),row={root:absolute,relativeToTEMP:relative,ownership:"Observed unmodified smoke copy destination or returned scenario context",beforeCleanupExists:existed};
 if(existed){
   if(fs.lstatSync(absolute).isSymbolicLink()||!fs.lstatSync(absolute).isDirectory())throw Error("Unsafe cleanup type");
   try{cleanupIsolatedRoot(absolute);row.cleanup="PASS";}catch(error){row.cleanup="FAIL";row.error=error.message;}
 }else row.cleanup="ALREADY_REMOVED_BY_UNMODIFIED_SMOKE";
 row.absentAfter=!fs.existsSync(absolute);cleanup.push(row);
}
put("owned-root-cleanup.json",cleanup);
const after={ownerOriginal:originalIdentity(),capturedAt:new Date().toISOString(),hostHEAD:git(repository,"rev-parse","HEAD").trim(),hostBranch:git(repository,"branch","--show-current").trim(),hostStatus:git(repository,"status","--porcelain=v1"),primaryHEAD:git(primary,"rev-parse","HEAD").trim(),worktrees:git(repository,"worktree","list","--porcelain")};
put("after.json",after);put("after-worktrees.txt",after.worktrees);
const packageAfter=inventory(packageRoot);put("plugins-after.json",packageAfter);
const methodsAfter=methods.map(file=>{const bytes=fs.readFileSync(path.join(repository,"scripts",file));return{file,bytes:bytes.length,sha256:sha(bytes)};});put("harness-after.json",methodsAfter);
const runtimeUnchanged=JSON.stringify(runtimeOnly(packageBefore))===JSON.stringify(runtimeOnly(packageAfter)),harnessUnchanged=JSON.stringify(methodBefore)===JSON.stringify(methodsAfter);
const scenarios=result?.scenarios??[],commands=scenarios.flatMap((scenario,index)=>scenario.commands.map(command=>({scenario:index+1,...command})));
const counts={scenarios:scenarios.length,commands:commands.length,nonzeroCommands:commands.filter(x=>x.status!==0).length,diagramPython:scenarios.filter(x=>x.diagramValidation).length,learningEvidencePython:scenarios.filter(x=>x.learningEvidenceValidation).length*3,siteGeneration:scenarios.filter(x=>x.siteValidation).length,siteStaticPython:scenarios.filter(x=>x.siteValidation).length,siteStaticChecks:scenarios.filter(x=>x.siteValidation).map(x=>x.siteValidation.checked.summary),generatedFiles:comparison.map(x=>x.generatedFiles),observedOwnedRoots:cleanup.length,strictAbsence:cleanup.every(x=>x.absentAfter)};
put("commands.json",commands);
const passed=!failure&&baseline.status===0&&scenarios.length===13&&commands.every(x=>x.status===0)&&comparison.length===4&&runtimeUnchanged&&harnessUnchanged&&cleanup.every(x=>x.absentAfter&&x.cleanup!=="FAIL")&&before.hostHEAD===after.hostHEAD&&before.hostBranch===after.hostBranch&&before.primaryHEAD===after.primaryHEAD&&before.worktrees===after.worktrees&&JSON.stringify(packageBefore)===JSON.stringify(packageAfter)&&JSON.stringify(before.ownerOriginal)===JSON.stringify(after.ownerOriginal)&&after.hostStatus==="";
const summary={schemaVersion:1,role:"Independent installed-package acceptance agent /root/contract_scan",startedAt,completedAt:new Date().toISOString(),durationMs:performance.now()-start,status:passed?"PASS":"FAIL",source:{baseHEAD:before.hostHEAD,branch:before.hostBranch,detached:before.hostBranch==="",identity:"Fresh actual PR283 merge; independent of395 candidate and prior908 working-tree run",candidatePluginVersion:JSON.parse(fs.readFileSync(path.join(directory,"plugins-snapshot/html-guide-kit/plugin.json"),"utf8")).version,marketplaceVersion:fs.readFileSync(path.join(repository,"VERSION"),"utf8").trim(),pluginSnapshot:"plugins-snapshot",runtimeBeforeAfterUnchanged:runtimeUnchanged,harnessBeforeAfterUnchanged:harnessUnchanged,distributedReadmeChangelogMayChange:"Only non-runtime README/CHANGELOG are excluded from runtime equivalence; full before/after manifests preserved."},baseline:{codex:"0.147.0 exact check",status:baseline.status,node:process.version,python},counts,host:{headUnchanged:before.hostHEAD===after.hostHEAD,branchUnchanged:before.hostBranch===after.hostBranch,primaryHeadUnchanged:before.primaryHEAD===after.primaryHEAD,fullWorktreesUnchanged:before.worktrees===after.worktrees,allPluginFilesBeforeAfterUnchanged:JSON.stringify(packageBefore)===JSON.stringify(packageAfter),ownerOriginalUnchanged:JSON.stringify(before.ownerOriginal)===JSON.stringify(after.ownerOriginal),statusBefore:before.hostStatus,statusAfter:after.hostStatus},scope:"Fresh 13 combinations with isolated HOME/CODEX_HOME/cache and actual installed resources/Python. No model/desktop/Sites/browser run; native metadata skills/list is not GUI dispatch.",limitations:["Installation smoke browserCheck remains NOT_RUN; no actual viewport/customer/client/Owner acceptance inferred","The historical14/15 root counts are not borrowed: cleanup count is derived solely from this run's actual contexts and copy profiles","Actual source remains fixed throughout run; complete plugin inventories, harness, host/detached/worktrees and originalOwner plan identities are compared","No protected approval, public release or new Owner decision is claimed"],failure};
put("summary.json",summary);
put("REPORT.md","# Independent HTML0.1.38 installation acceptance\n\nStatus: "+summary.status+"\n\n"+JSON.stringify(counts,null,2)+"\n\nFresh source snapshot and cache/generated licensing compared; actual source/cache site20 and guide4 retained. See summary.json, original smoke-result.json, commands.json and exact owned-root cleanup. No model/desktop/Sites/browser or Owner/approval claim.\n");
console.log(JSON.stringify(summary));
process.exitCode=passed?0:1;
