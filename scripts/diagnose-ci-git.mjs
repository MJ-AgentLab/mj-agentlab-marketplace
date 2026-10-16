#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import {fileURLToPath} from "node:url";
import {performance} from "node:perf_hooks";
import {runCommand,addOwnedWorktree,removeOwnedWorktrees,canonicalPath,validateBaselineConfig,RUNTIME_PATHS} from "./benchmark-ci-performance.mjs";

export const TARGET_TITLE="canonical communication resource loss or tampering blocks installation before any installer call";
export const DIAGNOSTIC_ARGV=Object.freeze(["--test","--test-name-pattern","^"+TARGET_TITLE+"$","tests/release-verify-install.test.mjs"]);
const BASELINE="30665998dda2ebbbae1806b946ec63f840bd98e0",BASELINE_TREE="20f540fcabba740e549ecdbf01cf78f2ce3473f5";
const MINUTE=60000,COMMAND_BUDGET=20*MINUTE,TOTAL_BUDGET=80*MINUTE,CLEANUP_RESERVE=3*MINUTE;
const CONTRACT_PATHS=["scripts/release-verify-install.mjs","scripts/run-cli.mjs","tests/release-verify-install.test.mjs"];
const ROOT=path.resolve(import.meta.dirname,"..");
const digest=bytes=>crypto.createHash("sha256").update(bytes).digest("hex");
const fileRecord=file=>({file,bytes:fs.statSync(file).size,sha256:digest(fs.readFileSync(file))});
const overlaps=(a,b)=>{const rel=path.relative(canonicalPath(a),canonicalPath(b));return !rel||(!rel.startsWith("..")&&!path.isAbsolute(rel));};

export function parseDiagnosticOptions(argv){
 const options={};const names={"--candidate-sha":"candidateSha","--report-dir":"reportDir"};
 for(let i=0;i<argv.length;i++){const name=names[argv[i]];if(!name||Object.hasOwn(options,name)||!argv[i+1]||argv[i+1].startsWith("--"))throw new Error("only one --candidate-sha and --report-dir are allowed");options[name]=argv[++i];}
 if(!/^[a-f0-9]{40}$/.test(options.candidateSha||""))throw new Error("candidate-sha must be a full lowercase SHA");
 if(!options.reportDir||!path.isAbsolute(options.reportDir))throw new Error("report-dir must be absolute");
 return options;
}
export function diagnosticPlan(){return ["baseline","candidate","candidate","baseline","baseline","candidate"].map((source,index)=>({id:String(index+1).padStart(2,"0")+"-"+source+"-r"+(Math.floor(index/2)+1),source,round:Math.floor(index/2)+1}));}
export function diagnosticDisposition(complete=false){return {mode:"diagnostic_only",coreAccepted:false,status:complete?"diagnostic_collected":"diagnostic_incomplete",selectedConcurrency:null,gates:Object.fromEntries(Object.entries({fixtureBytes:.95,test:.50,canonical:.80,smoke:.30}).map(([name,required])=>[name,{required,improvement:null,status:"not_measured",ok:false}]))};}
export function validateDiagnosticPaths(reportDir,repoRoot,temporary){
 if(!path.isAbsolute(reportDir)||!path.isAbsolute(repoRoot)||(temporary&&!path.isAbsolute(temporary)))throw new Error("diagnostic paths must be absolute");
 for(const source of [repoRoot,temporary].filter(Boolean))if(overlaps(source,reportDir)||overlaps(reportDir,source))throw new Error("report and source/owned paths must not overlap");
 if(fs.existsSync(reportDir))throw new Error("report-dir must be new");
 return canonicalPath(reportDir);
}
export function inspectDiagnosticTap(stdout){
 const text=stdout.replace(/\r/g,"");
 const results=[...text.matchAll(/^(ok|not ok) (\d+) - (.+)$/gm)].map(match=>({status:match[1],index:Number(match[2]),name:match[3].replace(/ # (SKIP|TODO).*$/,""),skipped:/ # SKIP(?:\s|$)/.test(match[3]),todo:/ # TODO(?:\s|$)/.test(match[3])}));
 const targets=results.filter(result=>result.name===TARGET_TITLE),plans=[...text.matchAll(/^1\.\.(\d+)$/gm)];
 const counts={};for(const match of text.matchAll(/^# (tests|pass|fail|cancelled|skipped) (\d+)$/gm))counts[match[1]]=Number(match[2]);
 const valid=results.every((result,index)=>result.index===index+1)&&plans.length===1&&Number(plans[0][1])===results.length&&targets.length===1&&!targets[0].skipped&&!targets[0].todo&&results.every(result=>result.name===TARGET_TITLE||result.skipped)&&!/^Bail out!/m.test(text)&&(!Object.hasOwn(counts,"cancelled")||counts.cancelled===0);
 return {valid,target:targets[0]||null,results,counts,ok:valid&&targets[0].status==="ok"};
}
export function parseTrace2(files){
 const sessions=new Map(),errors=[];
 for(const {name,text} of files){
  if(!text.endsWith("\n"))errors.push(name+": incomplete final line");
  const fileSids=new Set();
  for(const line of text.split(/\r?\n/).filter(Boolean)){
   let event;try{event=JSON.parse(line);}catch{errors.push(name+": invalid JSON/partial record");continue;}
   if(typeof event.sid!=="string"||typeof event.event!=="string"){errors.push(name+": missing SID/event (or discarded Trace2 records)");continue;}
   fileSids.add(event.sid);const state=sessions.get(event.sid)||{sid:event.sid,file:name,start:0,terminal:0,argv:null,events:{},children:new Map(),regions:[],lastEvent:null};
   if(state.file!==name)errors.push("SID appears in multiple files");state.events[event.event]=(state.events[event.event]||0)+1;state.lastEvent=event.event;
   if(event.event==="start"){state.start++;state.argv=event.argv;state.startedAt=event.time;}
   if(event.event==="exit"){state.exitCode=event.code;state.exitSeconds=event.t_abs;}
   if(event.event==="atexit"){state.terminal++;state.endedAt=event.time;state.exitCode=event.code;state.totalSeconds=event.t_abs;}
   if(event.event==="child_start"){if(state.children.has(event.child_id))errors.push("duplicate child_start");state.children.set(event.child_id,{childId:event.child_id,argv:event.argv,startedAt:event.time,closed:false});}
   if(event.event==="child_exit"){const child=state.children.get(event.child_id);if(!child||child.closed)errors.push("unmatched child_exit");else Object.assign(child,{closed:true,pid:event.pid,code:event.code,durationSeconds:event.t_rel});}
   if(event.event==="region_leave")state.regions.push({category:event.category,label:event.label,durationSeconds:event.t_rel});
   sessions.set(event.sid,state);
  }
  if(fileSids.size!==1)errors.push(name+": expected one process SID per file");
 }
 const records=[...sessions.values()].map(state=>({...state,children:[...state.children.values()]}));
 const closed=files.length>0&&!errors.length&&records.every(state=>state.start===1&&state.terminal===1&&state.lastEvent==="atexit"&&Array.isArray(state.argv)&&state.argv.length>0&&state.argv.every(arg=>typeof arg==="string")&&Number.isInteger(state.exitCode)&&Number.isFinite(state.totalSeconds)&&state.totalSeconds>=0&&state.children.every(child=>child.closed));
 return {closed,processState:closed?"observed_sessions_closed":"unknown_not_proof_of_leak",errors,sessions:records};
}
export function assertDiagnosticSource(actual,expected){
 if(actual.sha!==expected.sha||actual.tree!==expected.tree||actual.status!=="")throw new Error("source SHA/tree/clean status drift");
 if(expected.contracts&&JSON.stringify(actual.contracts)!==JSON.stringify(expected.contracts))throw new Error("source contract hash drift");
 return actual;
}
export async function collectDiagnosticSamples(measure,onSample=()=>{}){
 const samples=[];for(const planned of diagnosticPlan()){
  let sample;try{sample={...planned,...await measure(planned)};}catch(error){sample={...planned,ok:false,error:error.message};}
  samples.push(sample);await onSample(sample);if(sample.ok!==true)break;
 }
 return {samples,complete:samples.length===6&&samples.every(sample=>sample.ok===true)};
}
export function readDiagnosticEvidence(directory,kind){
 const files=fs.readdirSync(directory,{withFileTypes:true});
 if(files.some(file=>!file.isFile()||file.isSymbolicLink()))throw new Error("evidence must contain only ordinary files");
 const raw=files.map(file=>{const absolute=path.join(directory,file.name),buffer=fs.readFileSync(absolute);return {name:file.name,text:buffer.toString("utf8"),inventory:{file:absolute,bytes:buffer.length,sha256:digest(buffer)}};});
 const inventory=raw.map(file=>file.inventory),snapshot={capturedAt:new Date().toISOString(),inventoryDomain:"read_time_snapshot"};
 if(kind==="trace")return {files:inventory,...snapshot,...parseTrace2(raw)};
 const errors=[],events=[];for(const file of raw){if(!file.name.endsWith(".ndjson")||!file.text.endsWith("\n"))errors.push("partial/unexpected phase file");for(const line of file.text.split(/\r?\n/).filter(Boolean)){try{const event=JSON.parse(line);if(typeof event.phase!=="string"||!Number.isFinite(event.durationMs)||event.durationMs<0||!Number.isSafeInteger(event.pid)||event.pid<=0||!["ok","error"].includes(event.status))throw new Error("invalid phase");events.push(event);}catch{errors.push("invalid/partial phase record");}}}
 const cleanups=events.filter(event=>["cleanup","worktree.remove"].includes(event.phase));
 const cleanupObserved=cleanups.some(event=>event.phase==="cleanup"&&event.details?.scope==="canonical")&&cleanups.some(event=>event.phase==="cleanup"&&event.details?.scope==="fixture")&&cleanups.every(event=>event.status==="ok");
 return {files:inventory,...snapshot,events,errors,valid:events.length>0&&!errors.length,cleanupObserved};
}

export async function diagnose(options,repoRoot=ROOT){
 const reportDir=validateDiagnosticPaths(options.reportDir,repoRoot);
 const temporary=fs.mkdtempSync(path.join(fs.realpathSync.native(os.tmpdir()),"mj-ci-git-diagnostic-"));
 validateDiagnosticPaths(reportDir,repoRoot,temporary);fs.mkdirSync(path.dirname(reportDir),{recursive:true});fs.mkdirSync(reportDir);
 const report={schemaVersion:1,...diagnosticDisposition(),startedAt:new Date().toISOString(),candidateSha:options.candidateSha,targetTitle:TARGET_TITLE,argv:[...DIAGNOSTIC_ARGV],budgets:{commandMs:COMMAND_BUDGET,totalMs:TOTAL_BUDGET,cleanupReserveMs:CLEANUP_RESERVE,originalInternalGitTimeoutMs:60000},plan:diagnosticPlan(),plannedSamples:6,sources:{},sourceChecks:[],samples:[],preparation:[],cleanup:[],failures:[],sourceTemporary:temporary,limits:["Trace2 adds I/O and directed test6 lacks whole-suite preconditions; non-reproduction is not resolution.","Missing exit/atexit is unknown state, not proof of a process leak; no unrelated process is killed.","Diagnostic measurements never satisfy formal gates or select concurrency.","Evidence inventories are per-file read_time_snapshot buffers, not an atomic directory or upload-time guarantee; unknown Trace2 sessions may keep live files changing. Recheck archived/uploaded hashes independently."]};
 const attempted=[],started=performance.now();let sequence=0,safeCleanup=true,cleaning=false;
 const write=()=>fs.writeFileSync(path.join(reportDir,"report.json"),JSON.stringify(report,null,2)+"\n");
 const checked=async(executable,args,{cwd=repoRoot,timeoutMs=COMMAND_BUDGET,...rest}={})=>{
  const remaining=TOTAL_BUDGET-(performance.now()-started)-(cleaning?0:CLEANUP_RESERVE);if(remaining<=0)throw new Error("diagnostic total budget exhausted");
  const directory=path.join(reportDir,"preparation",String(++sequence).padStart(3,"0"));fs.mkdirSync(directory,{recursive:true});
  const result=await runCommand(executable,args,{cwd,...rest,timeoutMs:Math.min(timeoutMs,COMMAND_BUDGET,remaining),stdoutFile:path.join(directory,"stdout.log"),stderrFile:path.join(directory,"stderr.log")});
  const {stdout,stderr,...metadata}=result;report.preparation.push({...metadata,stdout:fileRecord(path.join(directory,"stdout.log")),stderr:fileRecord(path.join(directory,"stderr.log"))});
  if(result.exitCode!==0||result.timedOut||result.spawnError||result.killError){safeCleanup=false;throw new Error(executable+" operation failed; raw output retained in "+directory);}
  return stdout.trim();
 };
 const inspectSource=async(cwd,expected)=>{
  const actual={sha:await checked("git",["rev-parse","HEAD"],{cwd}),tree:await checked("git",["rev-parse","HEAD^{tree}"],{cwd}),status:await checked("git",["status","--porcelain=v1","--untracked-files=all"],{cwd}),contracts:Object.fromEntries(CONTRACT_PATHS.map(relative=>[relative,digest(fs.readFileSync(path.join(cwd,relative)))]))};
  report.sourceChecks.push({workspace:cwd,...actual});
  const verifier=fs.readFileSync(path.join(cwd,CONTRACT_PATHS[0]),"utf8");if((verifier.match(/runCli\("git", args, \{ cwd: repoRoot, timeoutMs: 60000 \}\)/g)||[]).length!==1){safeCleanup=false;throw new Error("original single Git60000ms contract missing");}
  try{return assertDiagnosticSource(actual,expected);}catch(error){safeCleanup=false;throw error;}
 };
 try{
  write();const config=validateBaselineConfig(JSON.parse(fs.readFileSync(path.join(repoRoot,"config/ci-performance-baseline.json"),"utf8")));
  if(config.baselineSha!==BASELINE||config.baselineTree!==BASELINE_TREE)throw new Error("frozen baseline306/tree20 must remain unchanged");report.baselineConfig={...config,sha256:digest(fs.readFileSync(path.join(repoRoot,"config/ci-performance-baseline.json")))};
  report.environment={node:process.version,python:JSON.parse(await checked("python",["-c","import json,sys; print(json.dumps({'version':'.'.join(map(str,sys.version_info[:3])), 'executable':sys.executable}))"])),codex:await checked("codex",["--version"]),git:await checked("git",["--version"]),npm:await checked("npm",["--version"]),nodeOptionsInherited:Boolean(process.env.NODE_OPTIONS),nodeTestContextInherited:Boolean(process.env.NODE_TEST_CONTEXT),platform:process.platform,release:os.release(),arch:process.arch,cpuModel:os.cpus()[0]?.model??null,logicalCpus:os.cpus().length,availableParallelism:os.availableParallelism(),runner:Object.fromEntries(["RUNNER_OS","RUNNER_ARCH","RUNNER_ENVIRONMENT","ImageOS","ImageVersion","GITHUB_RUN_ID","GITHUB_RUN_ATTEMPT","GITHUB_SHA"].map(name=>[name,process.env[name]??null]))};
  if(process.platform!=="win32"||process.version!=="v22.23.3"||report.environment.python.version!=="3.12.10"||!/^codex-cli 0\.147\.0\b/.test(report.environment.codex)||process.env.NODE_OPTIONS||process.env.NODE_TEST_CONTEXT)throw new Error("diagnostic requires fixed hosted Windows/Node/Python/Codex and no inherited Node runner options");
  if(await checked("git",["rev-parse","HEAD"])!==options.candidateSha||await checked("git",["status","--porcelain=v1","--untracked-files=all"]))throw new Error("controller must be the exact clean candidate checkout");
  const differences=await checked("git",["diff","--name-only",BASELINE,options.candidateSha,"--",...RUNTIME_PATHS]);if(differences)throw new Error("runtime/catalog/version paths differ");report.runtimeEquivalence={ok:true,paths:RUNTIME_PATHS};
  for(const [name,sha] of Object.entries({baseline:BASELINE,candidate:options.candidateSha})){
   const workspace=path.join(temporary,name);await addOwnedWorktree(workspace,sha,{temporary,repoRoot,attempted,git:checked});
   const tree=await checked("git",["rev-parse","HEAD^{tree}"],{cwd:workspace});if(name==="baseline"&&tree!==BASELINE_TREE)throw new Error("frozen baseline tree differs");
   const before=await inspectSource(workspace,{sha,tree});await checked("npm",["ci"],{cwd:workspace});await inspectSource(workspace,before);report.sources[name]={workspace,...before};write();
  }
  const collected=await collectDiagnosticSamples(async planned=>{
   const directory=path.join(reportDir,planned.id),phases=path.join(directory,"phases"),trace=path.join(directory,"trace2");fs.mkdirSync(phases,{recursive:true});fs.mkdirSync(trace);
   const record={ok:false,directory,inventoryDomain:"read_time_snapshot",liveFilesMayContinueChanging:true,evidenceLimit:"Until observed Trace2 closure, live files may continue changing; archived/uploaded hashes require independent recheck."};try{
    const source=report.sources[planned.source];record.before=await inspectSource(source.workspace,source);
    const remaining=TOTAL_BUDGET-(performance.now()-started)-CLEANUP_RESERVE;if(remaining<=0)throw new Error("diagnostic budget exhausted before next sample");
    const result=await runCommand(process.execPath,[...DIAGNOSTIC_ARGV],{cwd:source.workspace,env:{...process.env,MJ_PERF_DIR:phases,GIT_TRACE2_EVENT:trace,REQUIRE_PWSH:"1",REQUIRE_PYTHON:"1"},timeoutMs:Math.min(COMMAND_BUDGET,remaining),stdoutFile:path.join(directory,"stdout.log"),stderrFile:path.join(directory,"stderr.log")});
    const {stdout,stderr,...metadata}=result;Object.assign(record,metadata,{stdout:fileRecord(path.join(directory,"stdout.log")),stderr:fileRecord(path.join(directory,"stderr.log")),tap:inspectDiagnosticTap(stdout)});
    if(result.timedOut||result.spawnError||result.killError)safeCleanup=false;
    record.phases=readDiagnosticEvidence(phases,"phases");record.trace2=readDiagnosticEvidence(trace,"trace");
    if(result.timedOut||result.spawnError||result.killError||!record.trace2.closed||!record.phases.valid||!record.phases.cleanupObserved)safeCleanup=false;
    record.after=safeCleanup?await inspectSource(source.workspace,source):{status:"not_checked",reason:"uncertain process/cleanup state; stop further Git probes"};
    record.ok=result.exitCode===0&&!result.signal&&!result.timedOut&&!result.spawnError&&!result.killError&&record.tap.ok&&record.phases.valid&&record.phases.cleanupObserved&&record.trace2.closed;
   }catch(error){safeCleanup=false;record.error=error.message;}
   return record;
  },sample=>{report.samples.push(sample);write();process.stderr.write("[diagnostic "+report.samples.length+"/6] "+sample.id+": "+(sample.ok?"collected":"stopped")+"\n");});
  if(!collected.complete)throw new Error("diagnostic stopped at first non-pass; no replacement samples");report.collectionComplete=true;
 }catch(error){report.failures.push({at:new Date().toISOString(),message:error.message});}
 finally{
  cleaning=true;
  if(!safeCleanup&&attempted.length)report.cleanup=[{status:"retained",reason:"process/cleanup/source state uncertain; do not remove potentially active owned sources",temporary}];
  else{
   report.cleanup=await removeOwnedWorktrees({temporary,repoRoot,attempted},checked);
   if(report.cleanup.some(item=>item.status!=="ok"))report.failures.push({message:"owned-worktree cleanup failed; paths retained"});
   else try{const relative=path.relative(canonicalPath(os.tmpdir()),canonicalPath(temporary));if(!relative||relative.startsWith("..")||path.isAbsolute(relative)||!path.basename(temporary).startsWith("mj-ci-git-diagnostic-"))throw new Error("unsafe owned temporary cleanup");await fs.promises.rm(temporary,{recursive:true,force:true,maxRetries:5,retryDelay:100});report.cleanup.push({status:"ok",operation:"owned-root.remove",temporary});}catch(error){report.failures.push({message:"owned temporary cleanup failed: "+error.message});}
  }
  report.endedAt=new Date().toISOString();report.durationMs=performance.now()-started;Object.assign(report,diagnosticDisposition(report.collectionComplete===true&&!report.failures.length&&report.cleanup.every(item=>item.status!=="retained"&&item.status!=="error")));write();
 }
 return report;
}
if(process.argv[1]&&canonicalPath(process.argv[1])===canonicalPath(fileURLToPath(import.meta.url))){
 try{const options=parseDiagnosticOptions(process.argv.slice(2)),report=await diagnose(options);process.stdout.write(JSON.stringify({report:path.join(options.reportDir,"report.json"),mode:report.mode,status:report.status,coreAccepted:false,attempted:report.samples.length,planned:6,selectedConcurrency:null},null,2)+"\n");if(report.status!=="diagnostic_collected")process.exitCode=1;}
 catch(error){process.stderr.write(error.message+"\n");process.exitCode=1;}
}