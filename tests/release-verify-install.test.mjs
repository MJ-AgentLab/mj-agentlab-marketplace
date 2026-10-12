import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {spawnSync} from "node:child_process";
import {verifyReleaseInstall} from "../scripts/release-verify-install.mjs";
import {validateRepository,COMMUNICATION_REFERENCES} from "../scripts/validate-portable.mjs";
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
function fixture({syntheticCommunication=false}={}){const d=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),"canonical-fixture-"));dirs.push(d);
 for(const p of ["assets",".agents",".codex",".github","scripts","tests","plugins","docs","plan","AGENTS.md","README.md","CONTRIBUTING.md","GLOSSARY.md","CHANGELOG.md","VERSION"])
 fs.cpSync(path.join(REPO,p),path.join(d,p),{recursive:true});
 if(fs.existsSync(path.join(REPO,".gitattributes")))fs.copyFileSync(path.join(REPO,".gitattributes"),path.join(d,".gitattributes"));
 // The mutation suite uses a complete synthetic registration/icon only inside its temporary Git repo.
 // Actual repository/candidate installation is validated separately without this preparation.
 if(syntheticCommunication){
  const catalogFile=path.join(d,".agents/plugins/marketplace.json"),catalog=JSON.parse(fs.readFileSync(catalogFile,"utf8"));
  if(!catalog.plugins.some(plugin=>plugin.name==="communication-kit")){const plugin=structuredClone(catalog.plugins[0]);plugin.name="communication-kit";plugin.source.path="./plugins/communication-kit";catalog.plugins.push(plugin);fs.writeFileSync(catalogFile,JSON.stringify(catalog));}
  const icons=path.join(d,"plugins/communication-kit/assets");fs.mkdirSync(icons,{recursive:true});
  for(const ext of ["svg","png"])fs.copyFileSync(path.join(d,`plugins/diagram-kit/assets/icon.${ext}`),path.join(icons,`icon.${ext}`));
  for(const size of [32,48,64])fs.copyFileSync(path.join(d,`assets/brand/previews/diagram-kit-${size}.png`),path.join(d,`assets/brand/previews/communication-kit-${size}.png`));
  const exportsFile=path.join(d,"assets/brand/exports.json"),exports=JSON.parse(fs.readFileSync(exportsFile,"utf8"));
  exports.icons=exports.icons.filter(icon=>icon.id!=="communication-kit");exports.icons.push({id:"communication-kit",source:"plugins/communication-kit/assets/icon.svg",output:"plugins/communication-kit/assets/icon.png"});fs.writeFileSync(exportsFile,JSON.stringify(exports));
  fs.appendFileSync(path.join(d,".gitattributes"),"\nplugins/communication-kit/skills/communicate/references/* -text\n");
  const result=validateRepository(d);assert.equal(result.ok,true,result.errors.join("\n"));
 }
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

test("canonical communication resource loss or tampering blocks installation before any installer call",async()=>{
 const {d,sha}=fixture({syntheticCommunication:true}),base="plugins/communication-kit/skills/communicate/";
 await verifyReleaseInstall({repoRoot:d,canonicalSha:sha,install:async({repoRoot})=>{const valid=validateRepository(repoRoot);assert.equal(valid.ok,true,valid.errors.join("\n"));return {ok:true};}});
 const resources=[base+"SKILL.md",base+"agents/openai.yaml",...COMMUNICATION_REFERENCES.map(reference=>base+reference),"plugins/communication-kit/assets/icon.png","plugins/communication-kit/assets/icon.svg"];
 let calls=0;
 for(const rel of resources){
  const file=path.join(d,rel),bytes=fs.readFileSync(file);
  for(const mutation of ["missing","tampered"]){
   if(mutation==="missing")fs.unlinkSync(file);
   else if(rel.endsWith(".png")){const corrupted=Buffer.from(bytes);corrupted[29]^=1;fs.writeFileSync(file,corrupted);}
   else if(rel.endsWith(".md")&&rel.includes("/references/"))fs.writeFileSync(file,Buffer.concat([bytes,Buffer.from("\naltered\n")]));
   else fs.writeFileSync(file,"invalid resource\n");
   git(d,"add",".");git(d,"commit","--quiet","-m",mutation+"-communication-resource");
   await assert.rejects(verifyReleaseInstall({repoRoot:d,canonicalSha:git(d,"rev-parse","HEAD"),install:async()=>{calls++;return {ok:true};}}),/communication|brand resources|invalid package resource/,rel+" "+mutation);
   fs.writeFileSync(file,bytes);
   assert.equal(git(d,"worktree","list","--porcelain").match(/^worktree /gm).length,1);
  }
 }
 assert.equal(calls,0);
 const restored=validateRepository(d);assert.equal(restored.ok,true,restored.errors.join("\n"));
});
