import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import {parseDocument} from "yaml";
import {RUNTIME_PLUGINS,PUBLIC_SKILLS,EXPLICIT_ONLY_SKILLS,REPOSITORY_SKILLS,SKILL_RESOURCES,validateManifest,validateOpenAIConfig,validateRepository,assertInstalledSkillResources,assertInstalledPluginResources} from "../scripts/validate-portable.mjs";

const REPO=path.resolve(import.meta.dirname,".."),TEMP_ROOT=fs.realpathSync.native(os.tmpdir());
const PLUGIN="html-guide-kit",SKILL="html-guide-kit:guide",SKILL_PATH="skills/guide";
const RESOURCES=["SKILL.md","agents/openai.yaml","references/guide-framework.md","references/interaction-design.md"];
const sourceRoot=path.join(REPO,"plugins",PLUGIN);
const read=rel=>fs.readFileSync(path.join(sourceRoot,rel),"utf8");
const manifest=()=>JSON.parse(read("plugin.json"));
const ui=m=>m.extensions["com.openai"].interface;

function temporary(t,prefix){
 const root=fs.mkdtempSync(path.join(TEMP_ROOT,prefix));
 t.after(()=>{
  const resolved=fs.realpathSync.native(root),relative=path.relative(TEMP_ROOT,resolved);
  assert.ok(relative&&!path.isAbsolute(relative)&&relative!==".."&&!relative.startsWith(`..${path.sep}`)&&path.basename(resolved).startsWith(prefix),"cleanup must stay inside its temporary fixture root");
  fs.rmSync(resolved,{recursive:true,force:true,maxRetries:5,retryDelay:100});
 });
 return root;
}
function installedFixture(t,plugin=PLUGIN){
 const root=temporary(t,"guide-package-"),source=path.join(root,"source"),installed=path.join(root,"cache");
 fs.cpSync(path.join(REPO,"plugins",plugin),source,{recursive:true});
 fs.cpSync(source,installed,{recursive:true});
 return {root,source,installed};
}
function repositoryFixture(t){
 const root=temporary(t,"guide-repository-");
 for(const rel of ["assets",".agents",".codex",".github","scripts","tests","plugins","docs","AGENTS.md","README.md","CONTRIBUTING.md","GLOSSARY.md","CHANGELOG.md","VERSION"])fs.cpSync(path.join(REPO,rel),path.join(root,rel),{recursive:true});
 return root;
}

// These are distribution and metadata checks. Model behavior is validated separately.
test("HTML Guide Kit has one approved Read-only explicit entry without changing repository skill count",()=>{
 assert.deepEqual(RUNTIME_PLUGINS[PLUGIN],["guide"]);
 assert.deepEqual(PUBLIC_SKILLS,["diagram-kit:arch-diagram","understanding-kit:pop-quiz","explain-kit:glossary","explain-kit:concept",SKILL]);
 assert.deepEqual(EXPLICIT_ONLY_SKILLS,["understanding-kit:pop-quiz",SKILL]);
 assert.deepEqual(PUBLIC_SKILLS.filter(name=>!EXPLICIT_ONLY_SKILLS.includes(name)),["diagram-kit:arch-diagram","explain-kit:glossary","explain-kit:concept"]);
 assert.equal(REPOSITORY_SKILLS.length,20);assert.ok(!REPOSITORY_SKILLS.includes("guide"));
 const m=manifest();assert.equal(m.name,PLUGIN);assert.equal(m.version,"0.1.3");assert.deepEqual(ui(m).capabilities,["Read"]);validateManifest(m,PLUGIN);
});

test("HTML Guide Kit manifest rejects wrong identity, root versions, capabilities and routes",()=>{
 for(const version of ["00.1.0","v0.1.0",["0.1.0"],null,1]){const m=manifest();m.version=version;assert.throws(()=>validateManifest(m,PLUGIN));}
 assert.throws(()=>validateManifest(manifest(),"explain-kit"),/identity/);
 for(const value of [[],["Write"],["Read","Write"],["Read","Read"],"Read"]){const m=manifest();ui(m).capabilities=value;assert.throws(()=>validateManifest(m,PLUGIN),/approved capabilities/);}
 for(const prompt of ["Create a guide","Use $explain-kit:concept","Use $html-guide-kit:unknown","Use $html-guide-kit:guide-extra","Use $html-guide-kit:guide_extra","Use $html-guide-kit:guide and $explain-kit:concept"]){
  const m=manifest();ui(m).defaultPrompt=[prompt];assert.throws(()=>validateManifest(m,PLUGIN));
 }
});

test("HTML Guide Kit marketplace default prompts remain discoverable within the runtime length limit",()=>{
 const m=manifest(),prompts=ui(m).defaultPrompt;assert.equal(prompts.length,1);
 assert.ok([...prompts[0]].length<=128,"runtime ignores marketplace examples longer than 128 characters");
 const calls=[...prompts[0].matchAll(/\$([a-z0-9-]+):([a-z0-9-]+)(?![A-Za-z0-9_-])/g)];
 assert.equal(calls.length,1);assert.equal(calls[0][1],PLUGIN);assert.equal(calls[0][2],"guide");
 assert.match(prompts[0],/new teaching guide/);assert.match(prompts[0],/wait for my confirmation/);
 assert.doesNotThrow(()=>validateManifest(m,PLUGIN));
});

test("HTML Guide Kit marketplace default prompts accept 128 characters and reject any oversized entry",()=>{
 const prefix="Use $html-guide-kit:guide ",atLimit=prefix+"x".repeat(128-prefix.length),oversized=atLimit+"x";
 const m=manifest();ui(m).defaultPrompt=[atLimit];assert.doesNotThrow(()=>validateManifest(m,PLUGIN));
 for(const prompts of [[oversized],[atLimit,oversized],[oversized,atLimit]]){
  ui(m).defaultPrompt=prompts;assert.throws(()=>validateManifest(m,PLUGIN),/defaultPrompt entries must be at most 128 characters/);
 }
});

test("guide native metadata requires its own route and a boolean false invocation policy",()=>{
 const text=read(`${SKILL_PATH}/agents/openai.yaml`),valid=validateOpenAIConfig(text,PLUGIN,"guide");
 assert.equal(valid.policy.allow_implicit_invocation,false);
 assert.match(valid.interface.default_prompt,/\$html-guide-kit:guide(?![A-Za-z0-9_-])/);
 for(const replacement of ["true",'"false"',"null"]){assert.throws(()=>validateOpenAIConfig(text.replace("allow_implicit_invocation: false",`allow_implicit_invocation: ${replacement}`),PLUGIN,"guide"));}
 assert.throws(()=>validateOpenAIConfig(text.replace(/policy:\r?\n\s+allow_implicit_invocation: false\r?\n?/,""),PLUGIN,"guide"));
 assert.throws(()=>validateOpenAIConfig(text+"\npolicy: {}\n",PLUGIN,"guide"));
 for(const route of ["$explain-kit:concept","$html-guide-kit:guide-extra","$html-guide-kit:unknown"]){assert.throws(()=>validateOpenAIConfig(text.replace("$html-guide-kit:guide",route),PLUGIN,"guide"));}
 assert.throws(()=>validateOpenAIConfig(text,PLUGIN,"unknown"));
 const doc=parseDocument(text,{uniqueKeys:true});assert.deepEqual(doc.errors,[]);
});

test("guide has exactly its four approved package-owned runtime resources",()=>{
 assert.deepEqual([...SKILL_RESOURCES[SKILL]].sort(),[...RESOURCES].sort());
 const skillRoot=path.join(sourceRoot,SKILL_PATH);
 const files=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(path.join(dir,entry.name)):[path.relative(skillRoot,path.join(dir,entry.name)).split(path.sep).join("/")]);
 assert.deepEqual(files(skillRoot).sort(),[...RESOURCES].sort());
});

for(const reference of ["references/guide-framework.md","references/interaction-design.md"])test("repository refuses missing mandatory guide reference even without a Markdown pointer: "+reference,t=>{
 const root=repositoryFixture(t),skillRoot=path.join(root,"plugins",PLUGIN,SKILL_PATH),skill=path.join(skillRoot,"SKILL.md");
 fs.unlinkSync(path.join(skillRoot,reference));
 fs.writeFileSync(skill,fs.readFileSync(skill,"utf8").replaceAll(reference,"#omitted-pointer"));
 const result=validateRepository(root);assert.equal(result.ok,false);
 assert.ok(result.errors.some(error=>error.includes(path.basename(reference))),result.errors.join("\n"));
});

test("repository rejects an extra guide runtime file",t=>{
 const root=repositoryFixture(t);fs.writeFileSync(path.join(root,"plugins",PLUGIN,SKILL_PATH,"extra.md"),"unapproved runtime material\n");
 const result=validateRepository(root);assert.equal(result.ok,false);
 assert.ok(result.errors.some(error=>error.includes(SKILL)||error.includes("guide resources")),result.errors.join("\n"));
});

test("guide references cannot borrow another directory through a junction",t=>{
 const root=repositoryFixture(t),skillRoot=path.join(root,"plugins",PLUGIN,SKILL_PATH),refs=path.join(skillRoot,"references"),foreign=path.join(root,"foreign-references");
 fs.renameSync(refs,foreign);fs.symlinkSync(foreign,refs,process.platform==="win32"?"junction":"dir");
 const result=validateRepository(root);assert.equal(result.ok,false);
 assert.ok(result.errors.some(error=>/resource escapes|owned|reparse|symlink/.test(error)),result.errors.join("\n"));
});

for(const resource of RESOURCES)test("installed guide compares actual bytes and rejects missing or drifted resource: "+resource,t=>{
 const f=installedFixture(t),source=path.join(f.source,SKILL_PATH),installed=path.join(f.installed,SKILL_PATH),file=path.join(installed,resource),bytes=fs.readFileSync(file);
 assert.doesNotThrow(()=>assertInstalledSkillResources(source,installed,SKILL));
 fs.writeFileSync(file,Buffer.concat([bytes,Buffer.from("\n")]));
 assert.throws(()=>assertInstalledSkillResources(source,installed,SKILL),/installed skill resource differs/);
 fs.writeFileSync(file,bytes);fs.unlinkSync(file);
 assert.throws(()=>assertInstalledSkillResources(source,installed,SKILL));
});

test("installed guide byte equality cannot legitimize a resource junction or extra file",t=>{
 const f=installedFixture(t),source=path.join(f.source,SKILL_PATH),installed=path.join(f.installed,SKILL_PATH),refs=path.join(installed,"references"),foreign=path.join(f.root,"foreign-references");
 fs.renameSync(refs,foreign);fs.symlinkSync(foreign,refs,process.platform==="win32"?"junction":"dir");
 assert.throws(()=>assertInstalledSkillResources(source,installed,SKILL),/owned|reparse|symlink|escapes/);
 fs.unlinkSync(refs);fs.renameSync(foreign,refs);fs.writeFileSync(path.join(installed,"extra.md"),"unapproved\n");
 assert.throws(()=>assertInstalledSkillResources(source,installed,SKILL));
});

for(const plugin of ["diagram-kit","understanding-kit","explain-kit",PLUGIN])test("complete installed plugin preserves manifest, icons and approved skill resources: "+plugin,t=>{
 const f=installedFixture(t,plugin),result=assertInstalledPluginResources(f.source,f.installed,plugin);
 assert.equal(result.name,plugin);assert.deepEqual(Object.keys(result.rootFiles).sort(),["plugin.json","assets/icon.svg","assets/icon.png"].sort());
 assert.deepEqual(Object.keys(result.skills).sort(),[...RUNTIME_PLUGINS[plugin]].sort());
 const hash=bytes=>crypto.createHash("sha256").update(bytes).digest("hex");
 for(const [rel,item] of Object.entries(result.rootFiles)){
  assert.equal(item.source,path.join(f.source,rel));assert.equal(item.installed,path.join(f.installed,rel));
  assert.equal(item.sha256,hash(fs.readFileSync(item.source)));assert.equal(item.sha256,hash(fs.readFileSync(item.installed)));
 }
 for(const [skill,resources] of Object.entries(result.skills)){
  assert.deepEqual(Object.keys(resources).sort(),[...SKILL_RESOURCES[`${plugin}:${skill}`]].sort());
  for(const [rel,item] of Object.entries(resources)){
   assert.equal(item.source,path.join(f.source,"skills",skill,rel));assert.equal(item.installed,path.join(f.installed,"skills",skill,rel));
   assert.equal(item.sha256,hash(fs.readFileSync(item.source)));assert.equal(item.sha256,hash(fs.readFileSync(item.installed)));
  }
 }
 const file=path.join(f.installed,"plugin.json"),bytes=fs.readFileSync(file),m=JSON.parse(bytes);
 for(const change of [{name:"unapproved-kit"},{version:"9.9.9"}]){
  fs.writeFileSync(file,JSON.stringify({...m,...change},null,2));assert.throws(()=>assertInstalledPluginResources(f.source,f.installed,plugin));
 }
 fs.writeFileSync(file,bytes);fs.appendFileSync(file,"\n");assert.throws(()=>assertInstalledPluginResources(f.source,f.installed,plugin),/installed plugin resource differs/);
});

test("installed HTML Guide Kit rejects Read capability drift and SVG source byte drift",t=>{
 const f=installedFixture(t),file=path.join(f.installed,"plugin.json"),bytes=fs.readFileSync(file),m=JSON.parse(bytes);
 ui(m).capabilities=["Read","Write"];fs.writeFileSync(file,JSON.stringify(m));assert.throws(()=>assertInstalledPluginResources(f.source,f.installed,PLUGIN));
 fs.writeFileSync(file,bytes);fs.appendFileSync(path.join(f.installed,"assets/icon.svg"),"\n");
 assert.throws(()=>assertInstalledPluginResources(f.source,f.installed,PLUGIN),/installed plugin resource differs/);
});
