import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {spawnSync} from "node:child_process";
import {verifyReleaseInstall} from "../scripts/release-verify-install.mjs";
const REPO=path.resolve(import.meta.dirname,".."), dirs=[];
test.after(()=>dirs.forEach(d=>{
 const relative=path.relative(fs.realpathSync(os.tmpdir()),fs.realpathSync(d));
 assert.ok(relative && !relative.startsWith("..") && !path.isAbsolute(relative),"fixture cleanup must stay inside the temporary directory");
 // A transient ENOTEMPTY must not fail the suite after installation assertions pass.
 // Retries are bounded; a persistent cleanup failure still throws.
 fs.rmSync(d,{recursive:true,force:true,maxRetries:5,retryDelay:100});
 assert.ok(!fs.existsSync(d),"fixture cleanup must finish");
}));
function git(d,...args){const r=spawnSync("git",args,{cwd:d,encoding:"utf8"});assert.equal(r.status,0,r.stderr);return r.stdout.trim();}
function fixture(){const d=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),"canonical-fixture-"));dirs.push(d);
 for(const p of ["assets",".agents",".codex",".github","scripts","tests","plugins","docs","AGENTS.md","README.md","CONTRIBUTING.md","GLOSSARY.md","CHANGELOG.md","VERSION"])
 fs.cpSync(path.join(REPO,p),path.join(d,p),{recursive:true});
 git(d,"init","--quiet");git(d,"config","user.name","Fixture");git(d,"config","user.email","fixture@example.invalid");
 // Fixture commits must not leave asynchronous maintenance writing into .git during teardown.
 git(d,"config","gc.auto","0");git(d,"config","maintenance.auto","false");
 git(d,"add",".");git(d,"commit","--quiet","-m","fixture");return {d,sha:git(d,"rev-parse","HEAD"),version:fs.readFileSync(path.join(d,"VERSION"),"utf8").trim()};}
test("release install uses the exact canonical tree rather than a dirty checkout",async()=>{
 const {d,sha,version}=fixture();fs.writeFileSync(path.join(d,"VERSION"),"9.9.9\n");let temporary;
 const r=await verifyReleaseInstall({repoRoot:d,canonicalSha:sha,install:async({repoRoot})=>{
 temporary=repoRoot;assert.equal(git(repoRoot,"rev-parse","HEAD"),sha);
 assert.equal(fs.readFileSync(path.join(repoRoot,"VERSION"),"utf8").trim(),version);return {ok:true};}});
 assert.equal(r.ok,true);assert.ok(!fs.existsSync(temporary));assert.equal(git(d,"worktree","list","--porcelain").match(/^worktree /gm).length,1);
});
test("invalid canonical source never calls the installer",async()=>{
 const {d,sha}=fixture();fs.writeFileSync(path.join(d,"VERSION"),"bad\n");git(d,"add","VERSION");git(d,"commit","--quiet","-m","invalid");
 let calls=0;const install=async()=>{calls++;return {ok:true};};
 await assert.rejects(verifyReleaseInstall({repoRoot:d,canonicalSha:git(d,"rev-parse","HEAD"),install}),/VERSION/);
 await assert.rejects(verifyReleaseInstall({repoRoot:d,canonicalSha:"main",install}),/40-character/);
 assert.equal(calls,0);assert.equal(git(d,"worktree","list","--porcelain").match(/^worktree /gm).length,1);
});
test("a retired instruction entry blocks canonical release installation",async()=>{
 const {d}=fixture();fs.writeFileSync(path.join(d,"CLAUDE.md"),"# Retired instruction notice\n");
 git(d,"add","CLAUDE.md");git(d,"commit","--quiet","-m","retired-entry");
 let calls=0;
 await assert.rejects(verifyReleaseInstall({repoRoot:d,canonicalSha:git(d,"rev-parse","HEAD"),install:async()=>{calls++;return {ok:true};}}),/retired instruction surface: CLAUDE.md/);
 assert.equal(calls,0);assert.equal(git(d,"worktree","list","--porcelain").match(/^worktree /gm).length,1);
});
test("failed installation cleans up the canonical worktree and fails closed",async()=>{
 const {d,sha}=fixture();let temporary;
 await assert.rejects(verifyReleaseInstall({repoRoot:d,canonicalSha:sha,install:async({repoRoot})=>{temporary=repoRoot;return {ok:false};}}),/verification failed/);
 assert.ok(!fs.existsSync(temporary));assert.equal(git(d,"worktree","list","--porcelain").match(/^worktree /gm).length,1);
});

test("canonical release validation includes explain-kit before invoking installation",async()=>{
 const {d}=fixture();fs.unlinkSync(path.join(d,"plugins/explain-kit/skills/concept/SKILL.md"));
 git(d,"add",".");git(d,"commit","--quiet","-m","missing-public-skill");let calls=0;
 await assert.rejects(verifyReleaseInstall({repoRoot:d,canonicalSha:git(d,"rev-parse","HEAD"),install:async()=>{calls++;return {ok:true};}}),/explain-kit:concept/);
 assert.equal(calls,0);assert.equal(git(d,"worktree","list","--porcelain").match(/^worktree /gm).length,1);
});
