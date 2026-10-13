import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {spawnSync} from "node:child_process";
import {runCli} from "../scripts/run-cli.mjs";

const REPO=path.resolve(import.meta.dirname,".."),TEMP_ROOT=fs.realpathSync(os.tmpdir());
// Resolve Git's shell from its reported installation, without assuming a host path.
const gitExec=spawnSync("git",["--exec-path"],{encoding:"utf8"});
const shells=["sh",...(process.platform==="win32"&&gitExec.status===0?
 [path.resolve(gitExec.stdout.trim(),"../../../bin/sh.exe"),path.resolve(gitExec.stdout.trim(),"../../../usr/bin/sh.exe")]:[])];
const SH=shells.find(command=>spawnSync(command,["-c","exit 0"]).status===0)??"sh";
const HAVE_PWSH=spawnSync("pwsh",["-NoProfile","-Command","exit 0"]).status===0;
const HAVE_SH=spawnSync(SH,["-c","exit 0"]).status===0;
const HAVE_GIT=spawnSync("git",["--version"]).status===0;
if(process.env.REQUIRE_PWSH==="1")assert.ok(HAVE_PWSH&&HAVE_SH&&HAVE_GIT,"required PowerShell, sh or git is missing");
const opts={skip:(!HAVE_PWSH||!HAVE_SH||!HAVE_GIT)&&"PowerShell, sh and git are required"};
const dirs=[];
test.after(()=>dirs.forEach(d=>{
 const resolved=fs.realpathSync(d),relative=path.relative(TEMP_ROOT,resolved);
 assert.ok(relative&&!path.isAbsolute(relative)&&relative!==".."&&!relative.startsWith(`..${path.sep}`)&&path.basename(resolved).startsWith("commit-fixture-"),"cleanup must stay inside its temporary fixture root");
 fs.rmSync(resolved,{recursive:true,force:true});
}));

// Each original allowed scope is checked by execution, including historical learn-kit.
const ORIGINAL_SCOPES=["learn-kit","diagram-kit","explain-kit","marketplace","ci","scripts","deps","infra","docs-rule","docs-adr","docs-guide","docs-runbook","docs-spec","release"];
const cases=[
 {subject:"feat(html-guide-kit): add guide contract",pass:true},
 ...ORIGINAL_SCOPES.map(scope=>({subject:`test(${scope}): retain accepted scope`,pass:true})),
 {subject:"feat(future-kit): reject unknown scope",pass:false},
 {subject:"chore(html-guide-kit): reject unsupported type",pass:false},
 {subject:"feat(html-guide-kit):reject missing separator space",pass:false},
];

async function execute(command,args,cwd,input){return runCli(command,args,{cwd,input,timeoutMs:60000});}
async function git(d,args,input){
 const r=await execute("git",args,d,input);assert.equal(r.status,0,r.stdout+r.stderr);return r.stdout.trim();
}
async function fixture(){
 const d=fs.mkdtempSync(path.join(TEMP_ROOT,"commit-fixture-"));dirs.push(d);
 fs.mkdirSync(path.join(d,"scripts"));
 for(const name of ["install-hooks.ps1","validate-commits.sh","validate-commits.ps1"]){
  fs.copyFileSync(path.join(REPO,"scripts",name),path.join(d,"scripts",name));
 }
 await git(d,["init","--initial-branch=codex/commit-fixture"]);
 await git(d,["config","--local","user.name","Commit Fixture"]);
 await git(d,["config","--local","user.email","fixture@example.invalid"]);
 await git(d,["config","--local","commit.gpgsign","false"]);
 await git(d,["config","--local","core.hooksPath",".git/hooks"]);
 const tree=await git(d,["mktree"],""),base=await git(d,["commit-tree",tree,"-m","test(scripts): seed temporary fixture"]);
 await git(d,["update-ref","HEAD",base]);
 await git(d,["update-ref","refs/remotes/origin/develop",base]);
 const installed=await execute("pwsh",["-NoProfile","-File","./scripts/install-hooks.ps1"],d);
 assert.equal(installed.status,0,installed.stdout+installed.stderr);
 assert.ok(fs.existsSync(path.join(d,".git/hooks/commit-msg")));
 assert.ok(fs.existsSync(path.join(d,".git/hooks/pre-push")));
 return {d,tree,base};
}
async function objectWithSubject(f,subject,parent=f.base){
 // Plumbing creates isolated objects for rejection tests; it never bypasses real repo hooks.
 return git(f.d,["commit-tree",f.tree,"-p",parent,"-m",subject]);
}
function expected(r,c,context){
 assert.equal(r.status,c.pass?0:1,`${context}: ${c.subject}\n${r.stdout}${r.stderr}`);
}
function checkedRange(r,c){
 assert.match(r.stdout+r.stderr,c.pass?/\[OK\] 1 commit\(s\) validated/:/\[FAIL\] 1 of 1 commit\(s\) failed/);
 assert.doesNotMatch(r.stdout+r.stderr,/no commits in range/);
}

test("generated commit-msg hook accepts html-guide-kit and all original scopes, rejects invalid subjects",opts,async()=>{
 const f=await fixture(),message=path.join(f.d,"message.txt");
 for(const c of cases){
  fs.writeFileSync(message,c.subject+"\n\nRefs: #1\n");
  const r=await execute(SH,[".git/hooks/commit-msg",message],f.d);expected(r,c,"commit-msg");
  if(!c.pass)assert.match(r.stdout+r.stderr,/Commit message does not match required format/);
 }
 assert.equal(await git(f.d,["rev-parse","HEAD"]),f.base);
});

test("Shell and PowerShell bulk validators execute the same positive and negative commit cases",opts,async()=>{
 const f=await fixture();
 for(const c of cases){
  const sha=await objectWithSubject(f,c.subject),range=`${f.base}..${sha}`;
  const shell=await execute(SH,["scripts/validate-commits.sh",range],f.d);expected(shell,c,"Shell validator");checkedRange(shell,c);
  const pwsh=await execute("pwsh",["-NoProfile","-File","./scripts/validate-commits.ps1","-Range",range],f.d);expected(pwsh,c,"PowerShell validator");checkedRange(pwsh,c);
 }
 assert.equal(await git(f.d,["rev-parse","HEAD"]),f.base);
});

test("generated pre-push hook validates existing and new-branch ref ranges without remote writes",opts,async()=>{
 const f=await fixture(),zero="0".repeat(40);
 for(const c of cases){
  const sha=await objectWithSubject(f,c.subject);
  for(const remote of [f.base,zero]){
   const input=`refs/heads/codex/commit-fixture ${sha} refs/heads/codex/commit-fixture ${remote}\n`;
   const r=await execute(SH,[".git/hooks/pre-push","fixture","local-fixture"],f.d,input);expected(r,c,"pre-push");checkedRange(r,c);
   if(!c.pass)assert.match(r.stdout+r.stderr,/pre-push hook: validation failed/);
  }
 }
 assert.equal(await git(f.d,["rev-parse","HEAD"]),f.base);
});

test("generated pre-push hook rejects an invalid ref even alongside a valid html-guide-kit ref",opts,async()=>{
 const f=await fixture(),good=await objectWithSubject(f,"feat(html-guide-kit): add guide contract"),bad=await objectWithSubject(f,"feat(future-kit): reject unknown scope");
 const input=`refs/heads/codex/good ${good} refs/heads/codex/good ${f.base}\nrefs/heads/codex/bad ${bad} refs/heads/codex/bad ${f.base}\n`;
 const r=await execute(SH,[".git/hooks/pre-push","fixture","local-fixture"],f.d,input);
 assert.equal(r.status,1,r.stdout+r.stderr);assert.match(r.stdout+r.stderr,/\[OK\] 1 commit\(s\) validated/);assert.match(r.stdout+r.stderr,/\[FAIL\] 1 of 1 commit\(s\) failed/);
 assert.match(r.stdout+r.stderr,/pre-push hook: validation failed/);
});
