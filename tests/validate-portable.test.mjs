import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import os from "node:os";
import {spawnSync} from "node:child_process";
import {validateManifest,validateSkill,validateSkillInterface,validateRepository,parseFrontmatter,validateLinks,REPOSITORY_SKILLS} from "../scripts/validate-portable.mjs";
const root=path.resolve(import.meta.dirname,".."), read=p=>fs.readFileSync(path.join(root,p),"utf8");
const manifest=()=>JSON.parse(read("plugins/diagram-kit/plugin.json"));
test("two portable plugins, three public skills and 19 repository skills satisfy contracts",()=>{
 const r=validateRepository(root);assert.equal(r.ok,true,r.errors.join("\n"));assert.equal(r.repositorySkills,19);assert.deepEqual(r.publicSkills,["diagram-kit:arch-diagram","explain-kit:glossary","explain-kit:concept"]);
});

function repositoryFixture(t){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),"portable-contract-"));
 t.after(()=>fs.rmSync(dir,{recursive:true,force:true,maxRetries:5,retryDelay:100}));
 for(const p of [".agents",".codex",".github","scripts","tests","plugins","docs","AGENTS.md","README.md","CONTRIBUTING.md","GLOSSARY.md","CHANGELOG.md","VERSION"])
 fs.cpSync(path.join(root,p),path.join(dir,p),{recursive:true});
 return dir;
}

test("marketplace inventory rejects missing, duplicate, unknown and misdirected entries",t=>{
 const dir=repositoryFixture(t),file=path.join(dir,".agents/plugins/marketplace.json"),original=JSON.parse(fs.readFileSync(file,"utf8"));
 const cases=[m=>m.plugins.pop(),m=>m.plugins[1]=structuredClone(m.plugins[0]),m=>m.plugins.push({...m.plugins[0],name:"other"}),m=>m.plugins[1].source.path="./plugins/diagram-kit",m=>m.plugins[1].source.path="../outside",m=>m.plugins[1].version="0.1.0"];
 for(const mutate of cases){const m=structuredClone(original);mutate(m);fs.writeFileSync(file,JSON.stringify(m));assert.equal(validateRepository(dir).ok,false);}
 fs.writeFileSync(file,JSON.stringify(original));assert.equal(validateRepository(dir).ok,true);
});

test("each plugin rejects extra skills, missing files and swapped manifest identities",t=>{
 const dir=repositoryFixture(t),plugin=path.join(dir,"plugins/explain-kit"),extra=path.join(plugin,"skills/extra");
 fs.mkdirSync(extra);assert.equal(validateRepository(dir).ok,false);fs.rmdirSync(extra);
 const skill=path.join(plugin,"skills/concept/SKILL.md"),text=fs.readFileSync(skill);fs.unlinkSync(skill);assert.equal(validateRepository(dir).ok,false);fs.writeFileSync(skill,text);
 const file=path.join(plugin,"plugin.json"),original=fs.readFileSync(file);fs.writeFileSync(file,read("plugins/diagram-kit/plugin.json"));
 assert.ok(validateRepository(dir).errors.some(e=>e.includes("identity/version")));fs.writeFileSync(file,original);
 assert.equal(validateRepository(dir).ok,true);
});

test("manifest discovery prompts cover only the package's complete public skill set",()=>{
 const source=()=>JSON.parse(read("plugins/explain-kit/plugin.json"));
 validateManifest(source(),"explain-kit");assert.throws(()=>validateManifest(source(),"diagram-kit"));
 for(const prompts of [["Use $explain-kit:glossary"],["Use $diagram-kit:arch-diagram"],["Use $explain-kit:glossary-other and $explain-kit:concept"]]){
 const m=source();m.extensions["com.openai"].interface.defaultPrompt=prompts;assert.throws(()=>validateManifest(m));}
 const m=source();m.name="unknown";assert.throws(()=>validateManifest(m));
});

test("skill UI resources cannot resolve outside their plugin package",t=>{
 const dir=repositoryFixture(t),agents=path.join(dir,"plugins/explain-kit/skills/glossary/agents"),outside=path.join(dir,"external-agents");
 fs.renameSync(agents,outside);
 fs.symlinkSync(outside,agents,process.platform==="win32"?"junction":"dir");
 const result=validateRepository(dir);
 assert.equal(result.ok,false);
 assert.ok(result.errors.some(e=>e.includes("invalid package resource: skills/glossary/agents/openai.yaml")));
});

test("skill display configuration rejects wrong entry points and implicit-policy drift",()=>{
 const text=read("plugins/explain-kit/skills/glossary/agents/openai.yaml");validateSkillInterface(text,"explain-kit:glossary");
 assert.throws(()=>validateSkillInterface(text,"explain-kit:concept"));
 assert.throws(()=>validateSkillInterface(text.replace("allow_implicit_invocation: true","allow_implicit_invocation: false"),"explain-kit:glossary"));
 assert.throws(()=>validateSkillInterface(text+"policy: {}\n","explain-kit:glossary"));
});
test("strict repository validation rejects every retired instruction surface",t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),"retired-instructions-"));
 t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 for(const p of [".agents",".codex",".github","scripts","tests","plugins","docs","AGENTS.md","README.md","CONTRIBUTING.md","GLOSSARY.md","CHANGELOG.md","VERSION"])
 fs.cpSync(path.join(root,p),path.join(dir,p),{recursive:true});
 assert.equal(validateRepository(dir).ok,true);
 for(const rel of ["CLAUDE.md",".claude",".claude-plugin"]){
  const target=path.join(dir,rel);
  if(rel==="CLAUDE.md")fs.writeFileSync(target,"# Retired instruction notice\n");else fs.mkdirSync(target);
  const result=validateRepository(dir);
  assert.equal(result.ok,false);
  assert.ok(result.errors.some(error=>error.includes("retired instruction surface: "+rel)));
  if(rel==="CLAUDE.md")fs.unlinkSync(target);else fs.rmdirSync(target);
 }
 assert.equal(validateRepository(dir).ok,true);
});
test("manifest version is a root semver string",()=>{
 for(const version of [["0.2.0"],{},2,null,"00.2.0","v0.2.0"]){const m=manifest();m.version=version;assert.throws(()=>validateManifest(m));}
});
test("portable manifest refuses compatibility fields and missing routing metadata",()=>{
 const m=manifest();m.skills="./skills";assert.throws(()=>validateManifest(m));
 const n=manifest();delete n.extensions;assert.throws(()=>validateManifest(n));
});
test("skill YAML cannot duplicate keys or use retired tools/placeholders",()=>{
 const prefix='---\nname: example\ndescription: "Use for diagrams"\n';
 assert.throws(()=>validateSkill(prefix+'name: example\n---\nbody','example'));
 for(const description of ['TODO', '<purpose>', 'x'.repeat(1025)])assert.throws(()=>validateSkill('---\nname: example\ndescription: '+JSON.stringify(description)+'\n---\nbody','example'));
 assert.throws(()=>validateSkill(prefix+'---\nUse AskUserQuestion','example'));
});
test("all repository workflows use current authority paths and execution principle",()=>{
 for(const name of REPOSITORY_SKILLS){const s=read('.agents/skills/'+name+'/SKILL.md');assert.match(s,/代理执行/);assert.match(s,/推荐不构成批准/);validateLinks(s,path.join(root,'.agents/skills',name,'SKILL.md'));}
});
test("archive origins are reproducible Git blobs and preserve source versions",()=>{
 const ledger=JSON.parse(read('docs/archive/history-sources.json'));
 for(const item of ledger){
 const r=spawnSync('git',['show',item.sourceCommit+':'+item.source],{cwd:root,maxBuffer:10*1024*1024});assert.equal(r.status,0,item.source);
 assert.equal(crypto.createHash('sha256').update(r.stdout).digest('hex'),item.originalSha256,item.source);
 const text=read(item.archive);assert.ok(text.includes(item.sourceCommit));validateLinks(text,path.join(root,item.archive));
 if(item.version!=='unversioned')assert.equal(parseFrontmatter(text).metadata.version,item.version,item.archive);
 }
});
