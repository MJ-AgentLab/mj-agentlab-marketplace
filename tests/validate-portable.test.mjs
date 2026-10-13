import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import os from "node:os";
import {spawnSync} from "node:child_process";
import {validateManifest,validateSkill,validateSkillInterface,validateRepository,validateOpenAIConfig,parseFrontmatter,validateLinks,REPOSITORY_SKILLS,PUBLIC_SKILLS} from "../scripts/validate-portable.mjs";
const root=path.resolve(import.meta.dirname,".."), read=p=>fs.readFileSync(path.join(root,p),"utf8");
const manifest=()=>JSON.parse(read("plugins/diagram-kit/plugin.json"));
test("four approved portable plugins, six public skills and all 20 repository skills satisfy contracts",()=>{
 const r=validateRepository(root);assert.equal(r.ok,true,r.errors.join("\n"));assert.equal(r.repositorySkills,20);
 assert.deepEqual(r.publicSkills,["diagram-kit:arch-diagram","learning-evidence-kit:pop-quiz","learning-evidence-kit:learning-record-check","explain-kit:glossary","explain-kit:concept","html-guide-kit:guide"]);
 assert.deepEqual(r.publicSkills,[...PUBLIC_SKILLS]);
});
test("strict repository validation rejects every retired instruction surface",t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),"retired-instructions-"));
 t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 for(const p of ["assets",".agents",".codex",".github","scripts","tests","plugins","docs","AGENTS.md","README.md","CONTRIBUTING.md","GLOSSARY.md","CHANGELOG.md","VERSION"])
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
 const m=JSON.parse(read("plugins/learning-evidence-kit/plugin.json"));
 assert.doesNotThrow(()=>validateManifest(m,"learning-evidence-kit"));
 assert.throws(()=>validateManifest(m,"diagram-kit"));
 for(const prompt of ["Use $diagram-kit:arch-diagram","Use $learning-evidence-kit:unknown","Use $learning-evidence-kit:pop-quiz-extra","Use $learning-evidence-kit:pop-quiz_extra","Use $learning-evidence-kit:pop-quiz and $diagram-kit:arch-diagram"]){m.extensions["com.openai"].interface.defaultPrompt=[prompt];assert.throws(()=>validateManifest(m));}
 m.name="unapproved-kit";assert.throws(()=>validateManifest(m));
 m.name=["diagram-kit"];assert.throws(()=>validateManifest(m));
});
test("each plugin advertises its exact approved capabilities without duplicates",()=>{
 for(const [plugin,approved] of [["diagram-kit",["Read","Write"]],["learning-evidence-kit",["Read","Write"]],["explain-kit",["Read"]],["html-guide-kit",["Read"]]]){
  const m=JSON.parse(read(`plugins/${plugin}/plugin.json`));const ui=m.extensions["com.openai"].interface;
  ui.capabilities=[...approved];assert.doesNotThrow(()=>validateManifest(m,plugin));
  ui.capabilities=[...approved].reverse();assert.doesNotThrow(()=>validateManifest(m,plugin));
  for(const invalid of [undefined,[],["Write"],["Read","Read"],["Read","Write","Write"],["Read","Execute"],"Read"]){ui.capabilities=invalid;assert.throws(()=>validateManifest(m,plugin),/approved capabilities/);}
 }
});
const quizConfig = policy => 'interface:\n  display_name: "Pop Quiz"\n  short_description: "Check task understanding"\n  default_prompt: "Use $learning-evidence-kit:pop-quiz for this task"\n'+policy;
test("native pop-quiz metadata requires a boolean explicit-only policy",()=>{
 assert.equal(validateOpenAIConfig(quizConfig('policy:\n  allow_implicit_invocation: false\n'),"learning-evidence-kit","pop-quiz").policy.allow_implicit_invocation,false);
 for(const policy of ["",'policy:\n  allow_implicit_invocation: true\n','policy:\n  allow_implicit_invocation: "false"\n','policy:\n  allow_implicit_invocation: false\n  allow_implicit_invocation: true\n']) assert.throws(()=>validateOpenAIConfig(quizConfig(policy),"learning-evidence-kit","pop-quiz"));
 assert.throws(()=>validateOpenAIConfig(quizConfig('policy:\n  allow_implicit_invocation: false\n').replace('$learning-evidence-kit:pop-quiz','$diagram-kit:arch-diagram'),"learning-evidence-kit","pop-quiz"));
});
function repositoryFixture(t){
 const dir=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),"portable-inventory-"));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 for(const p of ["assets",".agents",".codex",".github","scripts","tests","plugins","docs","AGENTS.md","README.md","CONTRIBUTING.md","GLOSSARY.md","CHANGELOG.md","VERSION"])fs.cpSync(path.join(root,p),path.join(dir,p),{recursive:true});
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
 const dir=repositoryFixture(t),quiz=path.join(dir,'plugins/learning-evidence-kit/skills/pop-quiz');
 fs.rmSync(path.join(quiz,'references/quiz-policy.md'));const missing=validateRepository(dir);assert.equal(missing.ok,false);assert.ok(missing.errors.some(e=>e.startsWith('quiz resources:')));
});
test("quiz resources cannot borrow another plugin directory through a junction",t=>{
 const dir=repositoryFixture(t),refs=path.join(dir,'plugins/learning-evidence-kit/skills/pop-quiz/references');
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

test("each plugin rejects extra skills, missing files and swapped manifest identities",t=>{
 const dir=repositoryFixture(t);
 for(const [name,entry] of [["diagram-kit","arch-diagram"],["learning-evidence-kit","pop-quiz"],["learning-evidence-kit","learning-record-check"],["explain-kit","concept"],["html-guide-kit","guide"]]){
  const plugin=path.join(dir,"plugins",name),extra=path.join(plugin,"skills/extra");
  fs.mkdirSync(extra);assert.equal(validateRepository(dir).ok,false);fs.rmdirSync(extra);
  const skill=path.join(plugin,"skills",entry,"SKILL.md"),text=fs.readFileSync(skill);fs.unlinkSync(skill);assert.equal(validateRepository(dir).ok,false);fs.writeFileSync(skill,text);
  const file=path.join(plugin,"plugin.json"),original=fs.readFileSync(file),foreign=name==="diagram-kit"?"explain-kit":"diagram-kit";
  fs.writeFileSync(file,read(`plugins/${foreign}/plugin.json`));
  assert.ok(validateRepository(dir).errors.some(e=>e.includes("identity/version")));fs.writeFileSync(file,original);
  assert.equal(validateRepository(dir).ok,true);
 }
});

test("manifest discovery prompts cover only the package's complete public skill set",()=>{
 const source=()=>JSON.parse(read("plugins/explain-kit/plugin.json"));
 validateManifest(source(),"explain-kit");assert.throws(()=>validateManifest(source(),"diagram-kit"));
 for(const prompts of [["Use $explain-kit:glossary"],["Use $diagram-kit:arch-diagram"],["Use $explain-kit:glossary-other and $explain-kit:concept"]]){
 const m=source();m.extensions["com.openai"].interface.defaultPrompt=prompts;assert.throws(()=>validateManifest(m));}
 const m=source();m.name="unknown";assert.throws(()=>validateManifest(m));
});

test("manifest defaultPrompt budget counts raw Unicode scalars at 128 and 129",()=>{
 const prefix="Use $diagram-kit:arch-diagram ",remaining=128-[...prefix].length;
 for(const filler of ['x','中','😀']){
  const m=manifest(),ui=m.extensions['com.openai'].interface;
  ui.defaultPrompt=[prefix+filler.repeat(remaining)];
  assert.equal([...ui.defaultPrompt[0]].length,128);
  if(filler==='😀')assert.ok(ui.defaultPrompt[0].length>128,'UTF-16 units must not replace scalar counting');
  if(filler==='中')assert.ok(Buffer.byteLength(ui.defaultPrompt[0],'utf8')>128,'UTF-8 bytes must not replace scalar counting');
  assert.doesNotThrow(()=>validateManifest(m));
  ui.defaultPrompt[0]+=filler;
  assert.throws(()=>validateManifest(m),/interface\.defaultPrompt\[0\].*128 Unicode scalar/);
 }
 const padded=manifest();padded.extensions['com.openai'].interface.defaultPrompt=[prefix+' '.repeat(129-[...prefix].length)];
 assert.throws(()=>validateManifest(padded),/128 Unicode scalar.*before normalization/);
 for(const unpaired of ['\ud800','\udc00']){
  const malformed=manifest();malformed.extensions['com.openai'].interface.defaultPrompt=[prefix+unpaired];
  assert.throws(()=>validateManifest(malformed),/well-formed Unicode scalar/);
 }
 const learning=JSON.parse(read('plugins/learning-evidence-kit/plugin.json')),ui=learning.extensions['com.openai'].interface;
 assert.doesNotThrow(()=>validateManifest(learning));
 const checkPrefix='Use $learning-evidence-kit:learning-record-check ';
 ui.defaultPrompt[1]=checkPrefix+'x'.repeat(129-[...checkPrefix].length);
 assert.throws(()=>validateManifest(learning),/interface\.defaultPrompt\[1\].*128 Unicode scalar/);
});

test("manifest defaultPrompt lists preserve three prompts and reject a fourth",()=>{
 const m=manifest(),ui=m.extensions['com.openai'].interface;
 ui.defaultPrompt=['Use $diagram-kit:arch-diagram for this repository','Use $diagram-kit:arch-diagram for this component','Use $diagram-kit:arch-diagram for this dependency'];
 assert.doesNotThrow(()=>validateManifest(m));
 ui.defaultPrompt.push('Use $diagram-kit:arch-diagram for this interface');
 assert.throws(()=>validateManifest(m),/interface\.defaultPrompt.*at most 3 prompts/);
});

test("skill UI resources cannot resolve outside their plugin package",t=>{
 const dir=repositoryFixture(t),agents=path.join(dir,"plugins/explain-kit/skills/glossary/agents"),outside=path.join(dir,"external-agents");
 fs.renameSync(agents,outside);
 fs.symlinkSync(outside,agents,process.platform==="win32"?"junction":"dir");
 const result=validateRepository(dir);
 assert.equal(result.ok,false);
 assert.ok(result.errors.some(e=>e.includes("plugin inventory: resource escapes skill: agents")),result.errors.join('\n'));
});

test("skill display configuration rejects wrong entry points and implicit-policy drift",()=>{
 const text=read("plugins/explain-kit/skills/glossary/agents/openai.yaml");validateSkillInterface(text,"explain-kit:glossary");
 assert.throws(()=>validateSkillInterface(text,"explain-kit:concept"));
 assert.throws(()=>validateSkillInterface(text.replace("allow_implicit_invocation: true","allow_implicit_invocation: false"),"explain-kit:glossary"));
 assert.throws(()=>validateSkillInterface(text+"policy: {}\n","explain-kit:glossary"));
});

test('both learning evidence skills remain explicitly invoked',()=>{
 const text=read('plugins/learning-evidence-kit/skills/learning-record-check/agents/openai.yaml');
 validateSkillInterface(text,'learning-evidence-kit:learning-record-check');
 assert.throws(()=>validateSkillInterface(text.replace('allow_implicit_invocation: false','allow_implicit_invocation: true'),'learning-evidence-kit:learning-record-check'));
 const retired=JSON.parse(read('plugins/learning-evidence-kit/plugin.json'));retired.name='understanding-kit';assert.throws(()=>validateManifest(retired));
});
test('deferred client ledger cannot erase or enable unverified entries',t=>{
 const dir=repositoryFixture(t),file=path.join(dir,'plugins/learning-evidence-kit/references/client-entries.json'),original=JSON.parse(fs.readFileSync(file,'utf8'));
 for(const change of [v=>v.entries=[],v=>v.entries.pop(),v=>delete v.entries[0].id,v=>v.entries[0].id='unknown',v=>v.entries[0].status='enabled',v=>v.entries[0].reason='',v=>delete v.entries[1].removal_condition]){
  const variant=structuredClone(original);change(variant);fs.writeFileSync(file,JSON.stringify(variant));
  const result=validateRepository(dir);assert.ok(result.errors.some(e=>e.includes('learning evidence common resources')),result.errors.join('\n'));
 }
 fs.writeFileSync(file,JSON.stringify(original));assert.equal(validateRepository(dir).ok,true);
});
test('common entry is package owned and staging scripts are forbidden',t=>{
 const dir=repositoryFixture(t),entry=path.join(dir,'plugins/learning-evidence-kit/scripts/lek.py'),original=fs.readFileSync(entry);
 fs.unlinkSync(entry);assert.ok(validateRepository(dir).errors.some(e=>e.includes('learning evidence common resources')));fs.writeFileSync(entry,original);
 fs.mkdirSync(path.join(dir,'scripts/learning-evidence'));assert.ok(validateRepository(dir).errors.some(e=>e.includes('transitional learning evidence scripts')));fs.rmdirSync(path.join(dir,'scripts/learning-evidence'));
 const scripts=path.join(dir,'plugins/learning-evidence-kit/scripts'),foreign=path.join(dir,'external-scripts');fs.renameSync(scripts,foreign);
 fs.symlinkSync(foreign,scripts,process.platform==='win32'?'junction':'dir');
 const escaped=validateRepository(dir);assert.equal(escaped.ok,false);
 assert.ok(escaped.errors.some(e=>e.includes('plugin inventory: resource escapes skill: scripts')),escaped.errors.join('\n'));
 assert.ok(escaped.errors.some(e=>e.startsWith('learning evidence common resources:')),escaped.errors.join('\n'));
});
