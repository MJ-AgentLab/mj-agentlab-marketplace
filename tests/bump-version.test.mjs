import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {spawnSync} from "node:child_process";
import {runCli} from "../scripts/run-cli.mjs";
const REPO=path.resolve(import.meta.dirname,".."), HAVE=spawnSync("pwsh",["-NoProfile","-Command","exit 0"]).status===0;
if(process.env.REQUIRE_PWSH==="1") assert.ok(HAVE,"required PowerShell is missing");
const dirs=[];test.after(()=>dirs.forEach(d=>fs.rmSync(d,{recursive:true,force:true})));
function fixture(){
 const d=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),"bump-fixture-"));dirs.push(d);
 fs.mkdirSync(path.join(d,"scripts"));fs.copyFileSync(path.join(REPO,"scripts/bump-version.ps1"),path.join(d,"scripts/bump-version.ps1"));
 fs.mkdirSync(path.join(d,"plugins/diagram-kit"),{recursive:true});fs.mkdirSync(path.join(d,".agents/plugins"),{recursive:true});
 fs.writeFileSync(path.join(d,"VERSION"),"7.0.2\r\n");
 fs.writeFileSync(path.join(d,"README.md"),"badge/version-7.0.2-blue\n- v7.0.2 historical release\n");
 fs.writeFileSync(path.join(d,"plugins/diagram-kit/plugin.json"),JSON.stringify({name:"diagram-kit",version:"0.2.0",description:"history 0.2.0",extensions:{history:{version:"0.2.0"}}},null,2)+"\n");
 fs.copyFileSync(path.join(REPO,".agents/plugins/marketplace.json"),path.join(d,".agents/plugins/marketplace.json"));return d;
}
const files=["VERSION","README.md","plugins/diagram-kit/plugin.json",".agents/plugins/marketplace.json"];
const bytes=d=>Object.fromEntries(files.map(p=>[p,fs.readFileSync(path.join(d,p))]));
const read=(d,p)=>fs.readFileSync(path.join(d,p),"utf8");
function noBackups(d){for(const p of files) assert.ok(!fs.existsSync(path.join(d,p+".bump-backup")));}
const opts={skip:!HAVE&&"PowerShell unavailable"};
async function bump(d,scope="marketplace",extra=[],env={}){
 return runCli("pwsh",["-NoProfile","-File","./scripts/bump-version.ps1","-From",scope==="diagram-kit"?"0.2.0":"7.0.2","-To",scope==="diagram-kit"?"0.3.0":"8.0.0","-Scope",scope,...extra],{cwd:d,env:{...process.env,...env},timeoutMs:60000});
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
for(const scope of ["marketplace","diagram-kit"])test("DryRun writes nothing: "+scope,opts,async()=>{
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
