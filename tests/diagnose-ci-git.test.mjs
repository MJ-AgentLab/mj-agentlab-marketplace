import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import {runCommand} from "../scripts/benchmark-ci-performance.mjs";
import {TARGET_TITLE,DIAGNOSTIC_ARGV,parseDiagnosticOptions,diagnosticPlan,diagnosticDisposition,validateDiagnosticPaths,inspectDiagnosticTap,parseTrace2,assertDiagnosticSource,collectDiagnosticSamples,readDiagnosticEvidence} from "../scripts/diagnose-ci-git.mjs";
const target=(status="ok",suffix="")=>"TAP version 13\n"+status+" 1 - "+TARGET_TITLE+suffix+"\n1..1\n";
function temporary(t){const root=fs.mkdtempSync(path.join(fs.realpathSync.native(os.tmpdir()),"ci-git-diagnostic-unit-"));t.after(async()=>{assert.ok(path.basename(root).startsWith("ci-git-diagnostic-unit-"));await fs.promises.rm(root,{recursive:true,force:true,maxRetries:5,retryDelay:100});});return root;}
function trace(events,name="process.json"){return {name,text:events.map(event=>JSON.stringify({sid:"session-1",thread:"main",...event})).join("\n")+"\n"};}
test("diagnostic options expose only exact candidate and absolute report directory",()=>{
 const args=["--candidate-sha","a".repeat(40),"--report-dir",path.resolve("fresh-report")];assert.equal(parseDiagnosticOptions(args).candidateSha,"a".repeat(40));
 for(const extra of [["--repetitions","3"],["--pattern",".*"],["--candidate-sha","b".repeat(40)]])assert.throws(()=>parseDiagnosticOptions([...args,...extra]));
 assert.throws(()=>parseDiagnosticOptions(["--candidate-sha","main","--report-dir","relative"]));
});
test("fixed diagnostic plan alternates B1O1 O2B2 B3O3 with exact target argv",()=>{
 assert.deepEqual(diagnosticPlan().map(x=>[x.source,x.round]),[["baseline",1],["candidate",1],["candidate",2],["baseline",2],["baseline",3],["candidate",3]]);
 assert.deepEqual(DIAGNOSTIC_ARGV,["--test","--test-name-pattern","^"+TARGET_TITLE+"$","tests/release-verify-install.test.mjs"]);
});
test("one executed exact target passes with omitted or explicitly skipped unrelated cases",()=>{
 assert.equal(inspectDiagnosticTap(target()).ok,true);
 assert.equal(inspectDiagnosticTap("ok 1 - other # SKIP test name does not match pattern\n"+target().replace("ok 1","ok 2").replace("1..1","1..2")).ok,true);
});
test("zero target matches, target SKIP/TODO, duplicate and extra executions are invalid",()=>{
 for(const output of ["ok 1 - other # SKIP\n",target("ok"," # SKIP"),target("ok"," # TODO"),target()+target(),target()+"ok 2 - unexpected execution\n",target()+"not ok 2 - unexpected failure\n",target().replace("1..1\n",""),target()+"Bail out! aborted\n"]){assert.equal(inspectDiagnosticTap(output).valid,false,output);assert.equal(inspectDiagnosticTap(output).ok,false);}
});
test("a real target failure is executed evidence but never a passing sample",()=>{const result=inspectDiagnosticTap(target("not ok"));assert.equal(result.valid,true);assert.equal(result.ok,false);assert.equal(result.target.status,"not ok");assert.equal(inspectDiagnosticTap(target().replace(TARGET_TITLE,TARGET_TITLE+" suffix")).valid,false);});
test("every diagnostic disposition keeps all formal gates and selection unavailable",()=>{for(const complete of [true,false]){const report=diagnosticDisposition(complete);assert.equal(report.mode,"diagnostic_only");assert.equal(report.coreAccepted,false);assert.equal(report.selectedConcurrency,null);assert.ok(Object.values(report.gates).every(g=>g.improvement===null&&g.status==="not_measured"&&g.ok===false));}});
test("report/source paths must be new, absolute and disjoint in both directions",t=>{
 const root=temporary(t),source=path.join(root,"source"),owned=path.join(root,"owned");fs.mkdirSync(source);fs.mkdirSync(owned);
 assert.equal(validateDiagnosticPaths(path.join(root,"report"),source,owned),process.platform==="win32"?path.join(root,"report").toLowerCase():path.join(root,"report"));
 for(const report of ["relative",source,path.join(source,"report"),root,path.join(owned,"report")])assert.throws(()=>validateDiagnosticPaths(report,source,owned));
 const report=path.join(root,"report");fs.mkdirSync(report);assert.throws(()=>validateDiagnosticPaths(report,source,owned),/new/);
});
test("Trace2 sessions retain children/regions and require observed terminal shutdown",()=>{
 const events=[{event:"start",argv:["git","version"]},{event:"child_start",child_id:0,argv:["git","child"]},{event:"child_exit",child_id:0,pid:9,code:0,t_rel:.01},{event:"region_leave",category:"worktree",label:"checkout",t_rel:.02},{event:"exit",code:0,t_abs:.03},{event:"atexit",code:0,t_abs:.04}];
 const result=parseTrace2([trace(events)]);assert.equal(result.closed,true);assert.equal(result.sessions[0].children[0].closed,true);assert.equal(result.sessions[0].regions[0].label,"checkout");
 assert.equal(parseTrace2([trace(events.slice(0,-1))]).closed,false);assert.match(parseTrace2([trace(events.slice(0,-1))]).processState,/unknown/);
 assert.equal(parseTrace2([trace(events.filter(e=>e.event!=="child_exit"))]).closed,false);
});
test("partial, discarded, mixed-process and missing Trace2 records never prove closure",()=>{
 for(const files of [[],[{name:"truncated",text:'{"event":"start",'}],[trace([{event:"too_many_files"}])],[trace([{event:"start"},{event:"atexit",sid:"other"}])],[trace([{event:"start"},{event:"atexit"}]),trace([{event:"start"},{event:"atexit"}],"second.json")]])assert.equal(parseTrace2(files).closed,false);
});
test("source safeguards reject SHA, tree, untracked status and contract drift",()=>{
 const expected={sha:"a",tree:"b",status:"",contracts:{verifier:"c"}};assert.equal(assertDiagnosticSource({...expected},expected).sha,"a");
 for(const change of [{sha:"x"},{tree:"x"},{status:"?? extra"},{contracts:{verifier:"x"}}])assert.throws(()=>assertDiagnosticSource({...expected,...change},expected),/drift/);
});
test("the actual plan collector stops after any failure or uncertain state without replacements",async()=>{
 for(const mode of ["failed","outer-timeout","source-drift","cleanup-unknown"]){let calls=0;const records=[];const result=await collectDiagnosticSamples(async()=>{calls++;if(mode==="source-drift")throw new Error(mode);return {ok:false,reason:mode};},sample=>records.push(sample));assert.equal(calls,1);assert.equal(result.samples.length,1);assert.equal(records.length,1);assert.equal(result.complete,false);}
 const success=await collectDiagnosticSamples(async()=>({ok:true}));assert.equal(success.samples.length,6);assert.equal(success.complete,true);assert.equal(diagnosticDisposition(success.complete).coreAccepted,false);
});
test("real small Git emits separate Trace2 process files in the pre-created target directory",async t=>{
 const root=temporary(t),directory=path.join(root,"trace2");fs.mkdirSync(directory);const result=await runCommand("git",["version"],{cwd:root,env:{...process.env,GIT_TRACE2_EVENT:directory},timeoutMs:10000});assert.equal(result.exitCode,0,result.stderr);const files=fs.readdirSync(directory).map(name=>({name,text:fs.readFileSync(path.join(directory,name),"utf8")}));assert.ok(files.length>0);assert.equal(parseTrace2(files).closed,true,JSON.stringify(parseTrace2(files)));
});
test("real filtered Node execution observes one target and does not invent excluded counts",async t=>{
 const root=temporary(t);fs.mkdirSync(path.join(root,"tests"));fs.writeFileSync(path.join(root,"tests/release-verify-install.test.mjs"),"import test from 'node:test'; test("+JSON.stringify(TARGET_TITLE)+",()=>{}); test('other case',()=>{throw Error('must not execute')});\n");const env={...process.env};delete env.NODE_TEST_CONTEXT;const result=await runCommand(process.execPath,[...DIAGNOSTIC_ARGV],{cwd:root,env,timeoutMs:10000});assert.equal(result.exitCode,0,result.stderr);const tap=inspectDiagnosticTap(result.stdout);assert.equal(tap.ok,true,result.stdout);assert.equal(tap.results.filter(x=>x.name===TARGET_TITLE).length,1);
});
test("profile evidence preserves intentional rejection errors but rejects partial records and failed cleanup",t=>{
 const root=temporary(t),directory=path.join(root,"phases");fs.mkdirSync(directory);const file=path.join(directory,"perf.ndjson");
 const events=[{phase:"validate",status:"error",details:{scope:"canonical"}},{phase:"cleanup",status:"ok",details:{scope:"canonical"}},{phase:"cleanup",status:"ok",details:{scope:"fixture"}}].map(e=>({pid:123,durationMs:1,...e}));
 const valid=events.map(e=>JSON.stringify(e)).join("\n")+"\n";fs.writeFileSync(file,valid);const result=readDiagnosticEvidence(directory,"phases");assert.equal(result.valid,true);assert.equal(result.cleanupObserved,true);assert.equal(result.events[0].status,"error");
 fs.appendFileSync(file,'{"partial":');const original=fs.readFileSync(file,"utf8"),partial=readDiagnosticEvidence(directory,"phases");assert.equal(partial.valid,false);assert.equal(fs.readFileSync(file,"utf8"),original);
 fs.writeFileSync(file,valid.replace('"phase":"cleanup","status":"ok"','"phase":"cleanup","status":"error"'));assert.equal(readDiagnosticEvidence(directory,"phases").cleanupObserved,false);
});
test("canonical report checks reject source-directory aliases and never create the rejected report",t=>{
 const root=temporary(t),source=path.join(root,"source"),alias=path.join(root,"alias");fs.mkdirSync(source);fs.symlinkSync(source,alias,process.platform==="win32"?"junction":"dir");const rejected=path.join(alias,"report");assert.throws(()=>validateDiagnosticPaths(rejected,source),/overlap/);assert.equal(fs.existsSync(rejected),false);
});
test("evidence bytes, hash and parsed records share one read-time Buffer despite a producer append",t=>{
 const root=temporary(t),directory=path.join(root,"phases");fs.mkdirSync(directory);const file=path.join(directory,"perf.ndjson");
 const original=JSON.stringify({pid:123,phase:"validate",status:"ok",durationMs:1,details:{scope:"canonical"}})+"\n";
 const appended=JSON.stringify({pid:123,phase:"cleanup",status:"ok",durationMs:2,details:{scope:"canonical"}})+"\n";
 fs.writeFileSync(file,original);const read=fs.readFileSync;let reads=0,result;
 fs.readFileSync=function(name,...args){const value=read.call(this,name,...args);if(path.resolve(String(name))===path.resolve(file)){reads++;if(reads===1)fs.appendFileSync(file,appended);}return value;};
 try{result=readDiagnosticEvidence(directory,"phases");}finally{fs.readFileSync=read;}
 assert.equal(reads,1,"each evidence file must be read only once");
 assert.equal(result.files[0].bytes,Buffer.byteLength(original));
 assert.equal(result.files[0].sha256,crypto.createHash("sha256").update(original).digest("hex"));
 assert.equal(result.events.length,1,"parsed data must match that same captured buffer");
 assert.equal(fs.readFileSync(file,"utf8"),original+appended,"producer append remains live and untouched");
 assert.equal(result.inventoryDomain,"read_time_snapshot");assert.ok(Number.isFinite(Date.parse(result.capturedAt)));
});