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
 const r=validateRepository(root,{allowGovernanceTransition:true});assert.equal(r.ok,true,r.errors.join("\n"));assert.equal(r.repositorySkills,19);assert.deepEqual(r.publicSkills,["arch-diagram"]);
});
test("CI may accept only the fixed governance notice; release validation remains strict",t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),"governance-transition-"));
 t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 for(const p of [".agents",".codex",".github","scripts","tests","plugins","docs","AGENTS.md","README.md","CONTRIBUTING.md","GLOSSARY.md","CHANGELOG.md","VERSION"])
 fs.cpSync(path.join(root,p),path.join(dir,p),{recursive:true});
 assert.equal(validateRepository(dir).ok,true);
 const notice="# 治理过渡同步说明\n\n项目指令唯一权威入口为 [AGENTS.md](AGENTS.md)。\n\n本文件仅用于 #186 / #187 合并前的旧 A6 同步检查，不恢复 Claude 支持。当前市场仅 diagram-kit，公开技能仅 arch-diagram，19 个开发技能位于 .agents/skills；learn-kit 与 NotebookLM 已退役。\n\n两个治理 PR 合并后，代理须在 #188 合并前删除本文件及 CI 的临时校验选项，重跑新版 A6、结构校验与完整测试。正式发布校验始终拒绝本文件。\n";
 fs.writeFileSync(path.join(dir,"CLAUDE.md"),notice);
 assert.equal(validateRepository(dir).ok,false);
 const allowed=validateRepository(dir,{allowGovernanceTransition:true});
 assert.equal(allowed.ok,true,allowed.errors.join("\n"));
 fs.appendFileSync(path.join(dir,"CLAUDE.md"),"\n新增 Claude 指令\n");
 assert.equal(validateRepository(dir,{allowGovernanceTransition:true}).ok,false);
 fs.writeFileSync(path.join(dir,"CLAUDE.md"),notice);
 fs.mkdirSync(path.join(dir,".claude"));
 assert.equal(validateRepository(dir,{allowGovernanceTransition:true}).ok,false);
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
