import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import os from "node:os";
import {spawnSync} from "node:child_process";
import {validateManifest,validateSkill,validateRepository,validateOpenAIConfig,parseFrontmatter,validateLinks,REPOSITORY_SKILLS,PUBLIC_SKILLS} from "../scripts/validate-portable.mjs";
const root=path.resolve(import.meta.dirname,".."), read=p=>fs.readFileSync(path.join(root,p),"utf8");
const manifest=()=>JSON.parse(read("plugins/diagram-kit/plugin.json"));
test("both approved portable plugins and all 19 repository skills satisfy contracts",()=>{
 const r=validateRepository(root);assert.equal(r.ok,true,r.errors.join("\n"));assert.equal(r.repositorySkills,19);assert.deepEqual(r.publicSkills,[...PUBLIC_SKILLS]);
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
test("manifest identity and default prompts cannot route into another plugin",()=>{
 const m=manifest();m.name="understanding-kit";m.extensions["com.openai"].interface.defaultPrompt=["Use $understanding-kit:pop-quiz to check this task"];m.extensions["com.openai"].interface.capabilities=["Read"];
 assert.doesNotThrow(()=>validateManifest(m,"understanding-kit"));
 assert.throws(()=>validateManifest(m,"diagram-kit"));
 for(const prompt of ["Use $diagram-kit:arch-diagram","Use $understanding-kit:unknown","Use $understanding-kit:pop-quiz-extra","Use $understanding-kit:pop-quiz_extra","Use $understanding-kit:pop-quiz and $diagram-kit:arch-diagram"]){m.extensions["com.openai"].interface.defaultPrompt=[prompt];assert.throws(()=>validateManifest(m));}
 m.name="unapproved-kit";assert.throws(()=>validateManifest(m));
 m.name=["diagram-kit"];assert.throws(()=>validateManifest(m));
});
test("each plugin advertises its exact approved capabilities without duplicates",()=>{
 for(const [plugin,skill,approved] of [["diagram-kit","arch-diagram",["Read","Write"]],["understanding-kit","pop-quiz",["Read"]]]){
  const m=manifest();m.name=plugin;const ui=m.extensions["com.openai"].interface;ui.defaultPrompt=[`Use $${plugin}:${skill}`];
  ui.capabilities=[...approved];assert.doesNotThrow(()=>validateManifest(m,plugin));
  ui.capabilities=[...approved].reverse();assert.doesNotThrow(()=>validateManifest(m,plugin));
  for(const invalid of [undefined,[],["Write"],["Read","Read"],["Read","Write","Write"],["Read","Execute"],"Read"]){ui.capabilities=invalid;assert.throws(()=>validateManifest(m,plugin),/approved capabilities/);}
 }
});
const quizConfig = policy => 'interface:\n  display_name: "Pop Quiz"\n  short_description: "Check task understanding"\n  default_prompt: "Use $understanding-kit:pop-quiz for this task"\n'+policy;
test("native pop-quiz metadata requires a boolean explicit-only policy",()=>{
 assert.equal(validateOpenAIConfig(quizConfig('policy:\n  allow_implicit_invocation: false\n'),"understanding-kit","pop-quiz").policy.allow_implicit_invocation,false);
 for(const policy of ["",'policy:\n  allow_implicit_invocation: true\n','policy:\n  allow_implicit_invocation: "false"\n','policy:\n  allow_implicit_invocation: false\n  allow_implicit_invocation: true\n']) assert.throws(()=>validateOpenAIConfig(quizConfig(policy),"understanding-kit","pop-quiz"));
 assert.throws(()=>validateOpenAIConfig(quizConfig('policy:\n  allow_implicit_invocation: false\n').replace('$understanding-kit:pop-quiz','$diagram-kit:arch-diagram'),"understanding-kit","pop-quiz"));
});
function repositoryFixture(t){
 const dir=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),"portable-inventory-"));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 for(const p of [".agents",".codex",".github","scripts","tests","plugins","docs","AGENTS.md","README.md","CONTRIBUTING.md","GLOSSARY.md","CHANGELOG.md","VERSION"])fs.cpSync(path.join(root,p),path.join(dir,p),{recursive:true});
 return dir;
}
test("catalog rejects missing, duplicate, unknown, versioned and escaped plugin entries",t=>{
 const dir=repositoryFixture(t),target=path.join(dir,'.agents/plugins/marketplace.json'),original=JSON.parse(fs.readFileSync(target,'utf8'));
 const variants=[m=>m.plugins.pop(),m=>{m.plugins[1]=m.plugins[0];},m=>{m.plugins[1].name='unapproved-kit';},m=>{m.plugins[1].version='0.1.0';},m=>{m.plugins[1].source.path='../outside';}];
 for(const mutate of variants){const m=structuredClone(original);mutate(m);fs.writeFileSync(target,JSON.stringify(m));const result=validateRepository(dir);assert.equal(result.ok,false);assert.ok(result.errors.some(e=>e.startsWith('marketplace:')),result.errors.join('\n'));}
 fs.writeFileSync(target,JSON.stringify(original));assert.equal(validateRepository(dir).ok,true);
 fs.mkdirSync(path.join(dir,'plugins/unapproved-kit'));const result=validateRepository(dir);assert.equal(result.ok,false);assert.ok(result.errors.some(e=>e.includes('unexpected runtime plugin directory')));
});
test("quiz references must exist within their own installed skill",t=>{
 const dir=repositoryFixture(t),quiz=path.join(dir,'plugins/understanding-kit/skills/pop-quiz');
 fs.rmSync(path.join(quiz,'references/quiz-policy.md'));const missing=validateRepository(dir);assert.equal(missing.ok,false);assert.ok(missing.errors.some(e=>e.startsWith('quiz resources:')));
});
test("quiz resources cannot borrow another plugin directory through a junction",t=>{
 const dir=repositoryFixture(t),refs=path.join(dir,'plugins/understanding-kit/skills/pop-quiz/references');
 fs.rmSync(refs,{recursive:true});
 try{fs.symlinkSync(path.join(dir,'plugins/diagram-kit/skills/arch-diagram/references'),refs,process.platform==='win32'?'junction':'dir');}catch(e){if(['EPERM','EACCES','ENOSYS'].includes(e.code)){t.skip('symbolic links unavailable');return;}throw e;}
 const result=validateRepository(dir);assert.equal(result.ok,false);assert.ok(result.errors.some(e=>e.includes('resource escapes skill')),result.errors.join('\n'));
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
