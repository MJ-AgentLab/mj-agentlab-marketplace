import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {spawnSync} from "node:child_process";
import {runCli} from "../scripts/run-cli.mjs";
const REPO=path.resolve(import.meta.dirname,".."), HAVE=spawnSync("pwsh",["-NoProfile","-Command","exit 0"]).status===0;
if(process.env.REQUIRE_PWSH==="1") assert.ok(HAVE,"required PowerShell is missing");
const TEMP_ROOT=fs.realpathSync(os.tmpdir()),dirs=[];
test.after(()=>dirs.forEach(d=>{
 const resolved=fs.realpathSync(d),relative=path.relative(TEMP_ROOT,resolved);
 assert.ok(relative&&!path.isAbsolute(relative)&&relative!==".."&&!relative.startsWith(`..${path.sep}`)&&path.basename(resolved).startsWith("bump-fixture-"),"cleanup must stay inside its temporary fixture root");
 fs.rmSync(resolved,{recursive:true,force:true});
}));
function fixture(){
 const d=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),"bump-fixture-"));dirs.push(d);
 fs.mkdirSync(path.join(d,"scripts"));fs.copyFileSync(path.join(REPO,"scripts/bump-version.ps1"),path.join(d,"scripts/bump-version.ps1"));
 fs.mkdirSync(path.join(d,"plugins/diagram-kit"),{recursive:true});fs.mkdirSync(path.join(d,".agents/plugins"),{recursive:true});
 fs.writeFileSync(path.join(d,"VERSION"),"7.0.2\r\n");
 fs.writeFileSync(path.join(d,"README.md"),"badge/version-7.0.2-blue\n- v7.0.2 historical release\n");
 fs.writeFileSync(path.join(d,"plugins/diagram-kit/plugin.json"),JSON.stringify({name:"diagram-kit",version:"0.2.0",description:"history 0.2.0",extensions:{history:{version:"0.2.0"}}},null,2)+"\n");
 fs.mkdirSync(path.join(d,"plugins/learning-evidence-kit"),{recursive:true});
 fs.writeFileSync(path.join(d,"plugins/learning-evidence-kit/plugin.json"),JSON.stringify({name:"learning-evidence-kit",version:"0.1.0",description:"design v0.3",extensions:{history:{version:"0.1.0"}}},null,2)+"\n");
 fs.mkdirSync(path.join(d,"plugins/explain-kit"),{recursive:true});
 fs.writeFileSync(path.join(d,"plugins/explain-kit/plugin.json"),JSON.stringify({name:"explain-kit",version:"0.1.0",description:"history 0.1.0",extensions:{history:{version:"0.1.0"}}},null,2)+"\n");
 fs.mkdirSync(path.join(d,"plugins/html-guide-kit"),{recursive:true});
 fs.writeFileSync(path.join(d,"plugins/html-guide-kit/plugin.json"),JSON.stringify({name:"html-guide-kit",version:"0.1.0",description:"history 0.1.0",extensions:{history:{version:"0.1.0"}}},null,2)+"\n");
 fs.copyFileSync(path.join(REPO,".agents/plugins/marketplace.json"),path.join(d,".agents/plugins/marketplace.json"));return d;
}
const files=["VERSION","README.md","plugins/diagram-kit/plugin.json","plugins/learning-evidence-kit/plugin.json","plugins/explain-kit/plugin.json","plugins/html-guide-kit/plugin.json",".agents/plugins/marketplace.json"];
const bytes=d=>Object.fromEntries(files.map(p=>[p,fs.existsSync(path.join(d,p))?fs.readFileSync(path.join(d,p)):null]));
const read=(d,p)=>fs.readFileSync(path.join(d,p),"utf8");
function noBackups(d){for(const p of files) assert.ok(!fs.existsSync(path.join(d,p+".bump-backup")));}
const opts={skip:!HAVE&&"PowerShell unavailable"};
async function bump(d,scope="marketplace",extra=[],env={}){
 const versions={marketplace:["7.0.2","8.0.0"],"diagram-kit":["0.2.0","0.3.0"],"learning-evidence-kit":["0.1.0","0.2.0"],"explain-kit":["0.1.0","0.2.0"],"html-guide-kit":["0.1.0","0.1.1"]};
 return runCli("pwsh",["-NoProfile","-File","./scripts/bump-version.ps1","-From",versions[scope][0],"-To",versions[scope][1],"-Scope",scope,...extra],{cwd:d,env:{...process.env,...env},timeoutMs:60000});
}
test("marketplace updates VERSION and derived badge only",opts,async()=>{
 const d=fixture(),before=bytes(d),r=await bump(d);assert.equal(r.status,0,r.stdout+r.stderr);
 assert.equal(read(d,"VERSION").trim(),"8.0.0");assert.match(read(d,"README.md"),/badge\/version-8\.0\.0-blue/);
 assert.match(read(d,"README.md"),/v7\.0\.2 historical/);
 for(const p of files.slice(2)) assert.deepEqual(fs.readFileSync(path.join(d,p)),before[p]);noBackups(d);
});
test("plugin bumps root identity without touching prose, nested versions or catalog",opts,async()=>{
 const d=fixture(),before=bytes(d),r=await bump(d,"diagram-kit");assert.equal(r.status,0,r.stdout+r.stderr);
 const m=JSON.parse(read(d,"plugins/diagram-kit/plugin.json"));assert.equal(m.version,"0.3.0");assert.equal(m.description,"history 0.2.0");assert.equal(m.extensions.history.version,"0.2.0");
 for(const p of files.filter(p=>p!=="plugins/diagram-kit/plugin.json")) assert.deepEqual(fs.readFileSync(path.join(d,p)),before[p]);noBackups(d);
});
test("learning-evidence-kit bumps independently from marketplace and diagram-kit",opts,async()=>{
 const d=fixture(),before=bytes(d),r=await bump(d,"learning-evidence-kit");assert.equal(r.status,0,r.stdout+r.stderr);
 const m=JSON.parse(read(d,"plugins/learning-evidence-kit/plugin.json"));assert.equal(m.version,"0.2.0");assert.equal(m.description,"design v0.3");assert.equal(m.extensions.history.version,"0.1.0");
 for(const p of files.filter(p=>p!=="plugins/learning-evidence-kit/plugin.json")) assert.deepEqual(fs.readFileSync(path.join(d,p)),before[p]);noBackups(d);
});
for(const scope of ["marketplace","diagram-kit","learning-evidence-kit","explain-kit","html-guide-kit"])test("DryRun writes nothing: "+scope,opts,async()=>{
 const d=fixture(),before=bytes(d),r=await bump(d,scope,["-DryRun"]);assert.equal(r.status,0,r.stdout+r.stderr);
 assert.match(r.stdout,/No files were modified/);assert.deepEqual(bytes(d),before);noBackups(d);
});
for(const fault of [1,2])test("fault after write "+fault+" restores exact original bytes",opts,async()=>{
 const d=fixture(),before=bytes(d),r=await bump(d,"marketplace",["-TestFailAfterReplace",String(fault)],{MP_BUMP_TESTING:"1"});
 assert.notEqual(r.status,0);assert.match(r.stdout+r.stderr,/restored to their original bytes/);assert.deepEqual(bytes(d),before);noBackups(d);
});
test("post-write corruption is caught and rolled back",opts,async()=>{
 const d=fixture(),before=bytes(d),r=await bump(d,"marketplace",["-TestCorruptAfterWrite","2"],{MP_BUMP_TESTING:"1"});
 assert.notEqual(r.status,0);assert.match(r.stdout+r.stderr,/post-write validation failed/);assert.deepEqual(bytes(d),before);noBackups(d);
});
test("fault injectors are unreachable without test opt-in",opts,async()=>{
 for(const extra of [["-TestFailAfterReplace","1"],["-TestCorruptAfterWrite","1"],["-TestFailCleanup"]]){
 const d=fixture(),before=bytes(d),r=await bump(d,"marketplace",extra,{MP_BUMP_TESTING:""});assert.notEqual(r.status,0);assert.deepEqual(bytes(d),before);noBackups(d);}
});
test("backup cleanup failure does not undo a committed bump",opts,async()=>{
 const d=fixture(),r=await bump(d,"marketplace",["-TestFailCleanup"],{MP_BUMP_TESTING:"1"});assert.equal(r.status,0,r.stdout+r.stderr);
 assert.equal(read(d,"VERSION").trim(),"8.0.0");assert.match(r.stdout+r.stderr,/bump committed/);assert.doesNotMatch(r.stdout+r.stderr,/restored to their original bytes/);
});
for(const corrupt of ["badge/version-9.9.9-blue","badge/version-7.0.2-blue\nbadge/version-7.0.2-blue"])test("drifted or duplicate badge fails before writes",opts,async()=>{
 const d=fixture();fs.writeFileSync(path.join(d,"README.md"),corrupt);const before=bytes(d),r=await bump(d);assert.notEqual(r.status,0);assert.deepEqual(bytes(d),before);noBackups(d);
});
test("wrong From and missing targets fail without writes",opts,async()=>{
 const d=fixture();fs.writeFileSync(path.join(d,"VERSION"),"9.9.9\n");const before=bytes(d),r=await bump(d);assert.notEqual(r.status,0);assert.deepEqual(bytes(d),before);
 fs.unlinkSync(path.join(d,"README.md"));const r2=await bump(d);assert.notEqual(r2.status,0);assert.equal(read(d,"VERSION"),"9.9.9\n");noBackups(d);
});
test("retired scope and malformed semver are rejected before writes",opts,async()=>{
 const d=fixture(),before=bytes(d);
 const cases=[{scope:"learn-kit"},...['$0-x','08.0.0','8.0.0\n','8.0.0\r\n','8.0.٠'].map(to=>({to})),{from:'v7.0.2'},{from:'7.0.2\n'}];
 for(const c of cases){const r=await runCli('pwsh',['-NoProfile','-File','./scripts/bump-version.ps1','-From',c.from??'7.0.2','-To',c.to??'8.0.0','-Scope',c.scope??'marketplace'],{cwd:d,timeoutMs:60000});
 assert.notEqual(r.status,0,JSON.stringify(c));assert.deepEqual(bytes(d),before);}
});

test("mis-indented nested version cannot stand in for the root version",opts,async()=>{
 const d=fixture(),p=path.join(d,"plugins/diagram-kit/plugin.json");
 fs.writeFileSync(p,'{\n    "name": "diagram-kit",\n    "version": "0.2.0",\n    "extensions": {\n  "version": "0.2.0",\n    "x": true\n    }\n}');const before=bytes(d);
 const r=await bump(d,"diagram-kit");assert.notEqual(r.status,0);assert.deepEqual(bytes(d),before);noBackups(d);
});

test("plugin scope cannot bump a manifest with another plugin identity",opts,async()=>{
 const d=fixture(),p="plugins/learning-evidence-kit/plugin.json",m=JSON.parse(read(d,p));m.name="diagram-kit";fs.writeFileSync(path.join(d,p),JSON.stringify(m,null,2)+"\n");
 const before=bytes(d),r=await bump(d,"learning-evidence-kit");assert.notEqual(r.status,0);assert.match(r.stdout+r.stderr,/identity does not match Scope/);assert.deepEqual(bytes(d),before);noBackups(d);
});

test("learning-evidence-kit failure restores its version without touching the other plugin",opts,async()=>{
 const d=fixture(),before=bytes(d),r=await bump(d,"learning-evidence-kit",["-TestCorruptAfterWrite","1"],{MP_BUMP_TESTING:"1"});
 assert.notEqual(r.status,0);assert.match(r.stdout+r.stderr,/post-write validation failed/);assert.deepEqual(bytes(d),before);noBackups(d);
});

test("explain-kit version changes preserve the other plugin and marketplace",opts,async()=>{
 const d=fixture(),before=bytes(d),r=await bump(d,"explain-kit");assert.equal(r.status,0,r.stdout+r.stderr);
 const m=JSON.parse(read(d,"plugins/explain-kit/plugin.json"));assert.equal(m.version,"0.2.0");assert.equal(m.description,"history 0.1.0");assert.equal(m.extensions.history.version,"0.1.0");
 for(const p of files.filter(p=>p!=="plugins/explain-kit/plugin.json"))assert.deepEqual(fs.readFileSync(path.join(d,p)),before[p]);noBackups(d);
});


for(const scope of ["diagram-kit","explain-kit","html-guide-kit"])test("plugin write failure restores original bytes: "+scope,opts,async()=>{
 const d=fixture(),before=bytes(d),r=await bump(d,scope,["-TestFailAfterReplace","1"],{MP_BUMP_TESTING:"1"});
 assert.notEqual(r.status,0);assert.deepEqual(bytes(d),before);noBackups(d);
});

test("plugin scope cannot modify a manifest with another identity or version",opts,async()=>{
 for(const change of [{name:"diagram-kit"},{version:"0.9.0"}]){
 const d=fixture(),p=path.join(d,"plugins/explain-kit/plugin.json"),m=JSON.parse(read(d,"plugins/explain-kit/plugin.json"));
 fs.writeFileSync(p,JSON.stringify({...m,...change},null,2)+"\n");const before=bytes(d),r=await bump(d,"explain-kit");
 assert.notEqual(r.status,0);assert.deepEqual(bytes(d),before);noBackups(d);
 }
});

test("html-guide-kit patch bump preserves history, nested versions and all other version sources",opts,async()=>{
 const d=fixture(),before=bytes(d),r=await bump(d,"html-guide-kit");assert.equal(r.status,0,r.stdout+r.stderr);
 const p="plugins/html-guide-kit/plugin.json",m=JSON.parse(read(d,p));
 assert.equal(m.version,"0.1.1");assert.equal(m.description,"history 0.1.0");assert.equal(m.extensions.history.version,"0.1.0");
 for(const other of files.filter(file=>file!==p))assert.deepEqual(fs.readFileSync(path.join(d,other)),before[other]);noBackups(d);
});

for(const extra of [["-DryRun"],[]])test("html-guide-kit missing manifest fails with zero writes: "+(extra.length?"dry run":"apply"),opts,async()=>{
 const d=fixture(),p="plugins/html-guide-kit/plugin.json";fs.unlinkSync(path.join(d,p));
 const before=bytes(d),r=await bump(d,"html-guide-kit",extra);
 assert.equal(r.status,1,r.stdout+r.stderr);assert.match(r.stdout+r.stderr,/required file missing/);assert.match(r.stdout+r.stderr,/NOTHING was written/);
 assert.deepEqual(bytes(d),before);assert.equal(bytes(d)[p],null);noBackups(d);
});

for(const change of [{name:"explain-kit"},{version:"0.9.0"}])test("html-guide-kit rejects mismatched "+Object.keys(change)[0]+" before dry-run or apply writes",opts,async()=>{
 const d=fixture(),p="plugins/html-guide-kit/plugin.json",m=JSON.parse(read(d,p));
 fs.writeFileSync(path.join(d,p),JSON.stringify({...m,...change},null,2)+"\n");const before=bytes(d);
 for(const extra of [["-DryRun"],[]]){
  const r=await bump(d,"html-guide-kit",extra);assert.equal(r.status,1,r.stdout+r.stderr);
  assert.match(r.stdout+r.stderr,change.name?/identity does not match Scope/:/version does not match From/);
  assert.deepEqual(bytes(d),before);noBackups(d);
 }
});

test("html-guide-kit post-write validation failure restores exact bytes and other versions",opts,async()=>{
 const d=fixture(),before=bytes(d),r=await bump(d,"html-guide-kit",["-TestCorruptAfterWrite","1"],{MP_BUMP_TESTING:"1"});
 assert.equal(r.status,1,r.stdout+r.stderr);assert.match(r.stdout+r.stderr,/post-write validation failed/);
 assert.match(r.stdout+r.stderr,/restored to their original bytes/);assert.deepEqual(bytes(d),before);noBackups(d);
});
