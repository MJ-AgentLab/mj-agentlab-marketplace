import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import os from "node:os";
import {spawnSync} from "node:child_process";
import {validateManifest,validateSkill,validateRepository,parseFrontmatter,validateLinks,REPOSITORY_SKILLS} from "../scripts/validate-portable.mjs";
const root=path.resolve(import.meta.dirname,".."), read=p=>fs.readFileSync(path.join(root,p),"utf8");
const manifest=()=>JSON.parse(read("plugins/diagram-kit/plugin.json"));
test("maintained portable package and all 19 skills satisfy contracts",()=>{
 const r=validateRepository(root);assert.equal(r.ok,true,r.errors.join("\n"));assert.equal(r.repositorySkills,19);assert.deepEqual(r.publicSkills,["arch-diagram"]);
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
