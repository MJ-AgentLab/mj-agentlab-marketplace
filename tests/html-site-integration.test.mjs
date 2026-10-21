import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import {
 SITE_RESOURCES,SKILL_RESOURCES,validateOpenAIConfig,validateSiteProvenance,
 assertInstalledSkillResources,assertInstalledPluginResources,
} from "../scripts/validate-portable.mjs";

const REPO=path.resolve(import.meta.dirname,".."),PLUGIN="html-guide-kit",QUALIFIED=`${PLUGIN}:site`;
const PACKAGE=path.join(REPO,"plugins",PLUGIN),SITE=path.join(PACKAGE,"skills/site");
const hash=bytes=>crypto.createHash("sha256").update(bytes).digest("hex");
function fixture(t){
 const tempRoot=fs.realpathSync.native(os.tmpdir()),root=fs.mkdtempSync(path.join(tempRoot,"site-integration-"));
 t.after(()=>{
  const resolved=fs.realpathSync.native(root),relative=path.relative(tempRoot,resolved);
  assert.ok(relative&&relative!==".."&&!relative.startsWith(`..${path.sep}`)&&!path.isAbsolute(relative));
  fs.rmSync(resolved,{recursive:true,force:true,maxRetries:5,retryDelay:100});
 });
 const source=path.join(root,"source"),installed=path.join(root,"installed");
 fs.cpSync(SITE,source,{recursive:true});fs.cpSync(SITE,installed,{recursive:true});
 return {root,source,installed};
}

test("site installation accounts for every registered resource and checks its actual bytes",t=>{
 const f=fixture(t),facts=assertInstalledSkillResources(f.source,f.installed,QUALIFIED);
 assert.deepEqual(Object.keys(facts).sort(),[...SITE_RESOURCES].sort());
 assert.deepEqual(SKILL_RESOURCES[QUALIFIED],SITE_RESOURCES);
 for(const relative of SITE_RESOURCES){
  const file=path.join(f.installed,relative),bytes=fs.readFileSync(file);
  assert.equal(facts[relative].sha256,hash(bytes));
  fs.unlinkSync(file);assert.throws(()=>assertInstalledSkillResources(f.source,f.installed,QUALIFIED),undefined,`missing ${relative}`);
  fs.writeFileSync(file,bytes);fs.appendFileSync(file,"\n");
  assert.throws(()=>assertInstalledSkillResources(f.source,f.installed,QUALIFIED),undefined,`drifted ${relative}`);
  fs.writeFileSync(file,bytes);
 }
 assert.doesNotThrow(()=>assertInstalledSkillResources(f.source,f.installed,QUALIFIED));
});

test("matching source and cache cannot legitimize an unregistered site resource or implicit policy",t=>{
 const f=fixture(t),extra="references/unregistered.md";
 for(const root of [f.source,f.installed])fs.writeFileSync(path.join(root,extra),"Unregistered runtime material\n");
 assert.throws(()=>assertInstalledSkillResources(f.source,f.installed,QUALIFIED),/exactly|resources|inventory/);
 for(const root of [f.source,f.installed]){
  fs.unlinkSync(path.join(root,extra));
  const config=path.join(root,"agents/openai.yaml");
  fs.writeFileSync(config,fs.readFileSync(config,"utf8").replace("allow_implicit_invocation: false","allow_implicit_invocation: true"));
 }
 assert.throws(()=>assertInstalledSkillResources(f.source,f.installed,QUALIFIED),/explicit invocation/);
});

test("site native metadata rejects borrowed routes and every non-boolean or implicit policy",()=>{
 const text=fs.readFileSync(path.join(SITE,"agents/openai.yaml"),"utf8");
 assert.equal(validateOpenAIConfig(text,PLUGIN,"site").policy.allow_implicit_invocation,false);
 for(const value of ["true",'"false"',"null"]){
  assert.throws(()=>validateOpenAIConfig(text.replace("allow_implicit_invocation: false",`allow_implicit_invocation: ${value}`),PLUGIN,"site"));
 }
 for(const route of ["$html-guide-kit:guide","$html-guide-kit:site-extra","$explain-kit:concept"]){
  assert.throws(()=>validateOpenAIConfig(text.replace("$html-guide-kit:site",route),PLUGIN,"site"));
 }
 assert.throws(()=>validateOpenAIConfig(text.replace(/policy:\r?\n\s+allow_implicit_invocation: false\r?\n?/,""),PLUGIN,"site"));
});

test("site provenance rejects malformed source identities, hashes, targets and pinning",t=>{
 const f=fixture(t),file=path.join(f.source,"references/resource-provenance.json"),original=fs.readFileSync(file),valid=JSON.parse(original);
 assert.doesNotThrow(()=>validateSiteProvenance(f.source));
 const bad=[
  r=>{r.schemaVersion=2;},r=>{r.capturedAt="not-a-date";},r=>{r.sources=[];},
  r=>{r.sources.push(structuredClone(r.sources[0]));},
  r=>{r.sources[0].sha256="0".repeat(63);},r=>{r.sources[0].sha256="A".repeat(64);},r=>{r.sources[0].sha256=[r.sources[0].sha256];},
  r=>{r.sources[0].kind="unrecorded";},r=>{r.sources[0].file="";},
  r=>{r.sources[0].mode="";},r=>{r.sources[0].license="";},
  r=>{r.sources[0].localTargets=[];},r=>{r.sources[0].localTargets=["../outside.md"];},
  r=>{r.sources[0].localTargets.push(r.sources[0].localTargets[0]);},
  r=>{r.sources.find(s=>s.kind==="local-research").repositoryHead="not-a-commit";},
  r=>{const s=r.sources.find(s=>s.kind==="local-research");s.repositoryHead=[s.repositoryHead];},
  r=>{delete r.sources.find(s=>s.kind==="local-research").gitStatus;},
  r=>{r.sources.find(s=>s.kind==="upstream-reference").commit="0".repeat(39);},
  r=>{r.sources.find(s=>s.kind==="upstream-reference").url="https://github.com/other/unpinned";},
  r=>{r.sources.find(s=>s.kind==="upstream-reference").licenseSha256="not-a-hash";},
  r=>{const s=r.sources.find(s=>s.kind==="upstream-reference");s.commit=[s.commit];},
  r=>{const s=r.sources.find(s=>s.kind==="upstream-reference");s.licenseSha256=[s.licenseSha256];},
  r=>{delete r.sources.find(s=>s.kind==="upstream-reference").modifications;},
 ];
 for(const change of bad){
  const record=structuredClone(valid);change(record);fs.writeFileSync(file,JSON.stringify(record));
  assert.throws(()=>validateSiteProvenance(f.source),undefined,change.toString());
 }
 fs.writeFileSync(file,original);assert.doesNotThrow(()=>validateSiteProvenance(f.source));
 // Byte equality cannot make malformed provenance valid in a complete installation.
 const invalid=structuredClone(valid);invalid.sources[0].sha256="invalid";
 for(const root of [f.source,f.installed])fs.writeFileSync(path.join(root,"references/resource-provenance.json"),JSON.stringify(invalid));
 assert.throws(()=>assertInstalledSkillResources(f.source,f.installed,QUALIFIED),/source identity\/hash/);
});

test("site resources cannot be borrowed through a directory junction",t=>{
 const f=fixture(t),references=path.join(f.installed,"references"),foreign=path.join(f.root,"foreign-references");
 fs.renameSync(references,foreign);fs.symlinkSync(foreign,references,process.platform==="win32"?"junction":"dir");
 assert.throws(()=>assertInstalledSkillResources(f.source,f.installed,QUALIFIED),/owned|reparse|symlink|escapes|junction/);
});

test("site extension preserves the four guide resources from fixed develop baseline without rewriting bytes",()=>{
 // Raw Git blob SHA-256 values at 1d5219c1fa1bbf14cc79f630a59e9a8c857248f4.
 // The guide subtree has text eol=lf, so fresh Windows and Linux checkouts use these same bytes.
 const baseline={
  "SKILL.md":"9f2febe6d0d368ab0ea5eb0e570a050a557f3d80983ea70b1138b4e60e0dc58e",
  "agents/openai.yaml":"7833a8c8dc5d72f4494d1e8f563b21562326d8e71e2fefc00a8fe12a1c809f14",
  "references/guide-framework.md":"09db2c2a67d6b61ac0d6500a70c6a01cc858651a4d5b9015472a4021111ac196",
  "references/interaction-design.md":"b3089e878ff2ab424dbb4e189445bc3718df4991f428ba56494f454b891e8c2a",
 };
 assert.deepEqual(Object.keys(baseline).sort(),[...SKILL_RESOURCES[`${PLUGIN}:guide`]].sort());
 for(const [relative,expected] of Object.entries(baseline))assert.equal(hash(fs.readFileSync(path.join(PACKAGE,"skills/guide",relative))),expected,relative);
});

test("complete HTML package checks both entries and detects a missing site script",t=>{
 const f=fixture(t),source=path.join(f.root,"source-package"),installed=path.join(f.root,"cache-package");
 fs.cpSync(PACKAGE,source,{recursive:true});fs.cpSync(source,installed,{recursive:true});
 const facts=assertInstalledPluginResources(source,installed,PLUGIN);
 assert.deepEqual(Object.keys(facts.skills).sort(),["guide","site"]);
 assert.equal(facts.version,"0.1.40");
 for(const relative of ["LICENSE","THIRD_PARTY_NOTICES.md","licenses/Apache-2.0.txt"]){
  const file=path.join(installed,relative),bytes=fs.readFileSync(file);
  assert(facts.rootFiles[relative]);
  fs.unlinkSync(file);assert.throws(()=>assertInstalledPluginResources(source,installed,PLUGIN));
  fs.writeFileSync(file,bytes);fs.appendFileSync(file,"drift");
  assert.throws(()=>assertInstalledPluginResources(source,installed,PLUGIN),/differs/);
  fs.writeFileSync(file,bytes);
 }
 fs.unlinkSync(path.join(installed,"skills/site/scripts/render-site.mjs"));
 assert.throws(()=>assertInstalledPluginResources(source,installed,PLUGIN));
});
