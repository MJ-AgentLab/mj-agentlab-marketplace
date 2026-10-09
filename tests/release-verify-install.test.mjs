import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {spawnSync} from "node:child_process";
import {verifyReleaseInstall} from "../scripts/release-verify-install.mjs";
const REPO=path.resolve(import.meta.dirname,".."), dirs=[];
test.after(()=>dirs.forEach(d=>fs.rmSync(d,{recursive:true,force:true})));
function git(d,...args){const r=spawnSync("git",args,{cwd:d,encoding:"utf8"});assert.equal(r.status,0,r.stderr);return r.stdout.trim();}
function fixture(){const d=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),"canonical-fixture-"));dirs.push(d);
 for(const p of [".agents",".codex",".github","scripts","tests","plugins","docs","AGENTS.md","README.md","CONTRIBUTING.md","GLOSSARY.md","CHANGELOG.md","VERSION"])
 fs.cpSync(path.join(REPO,p),path.join(d,p),{recursive:true});
 git(d,"init","--quiet");git(d,"config","user.name","Fixture");git(d,"config","user.email","fixture@example.invalid");git(d,"add",".");git(d,"commit","--quiet","-m","fixture");return {d,sha:git(d,"rev-parse","HEAD"),version:fs.readFileSync(path.join(d,"VERSION"),"utf8").trim()};}
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
test("failed installation cleans up the canonical worktree and fails closed",async()=>{
 const {d,sha}=fixture();let temporary;
 await assert.rejects(verifyReleaseInstall({repoRoot:d,canonicalSha:sha,install:async({repoRoot})=>{temporary=repoRoot;return {ok:false};}}),/verification failed/);
 assert.ok(!fs.existsSync(temporary));assert.equal(git(d,"worktree","list","--porcelain").match(/^worktree /gm).length,1);
});
