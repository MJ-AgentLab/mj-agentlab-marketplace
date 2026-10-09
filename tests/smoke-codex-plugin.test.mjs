import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {assertDiscovery,parsePromptInputSkills,cleanupIsolatedRoot} from "../scripts/smoke-codex-plugin.mjs";
import {REPOSITORY_SKILLS} from "../scripts/validate-portable.mjs";
function fixture(){const root=fs.mkdtempSync(path.join(fs.realpathSync.native(os.tmpdir()),"discovery-fixture-"));
 const cache=path.join(root,"cache"), repo=path.join(root,"repo"), file=path.join(cache,"diagram-kit/0.2.0/skills/arch-diagram/SKILL.md");
 fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,"skill");
 const dev=REPOSITORY_SKILLS.map(name=>{const file=path.join(repo,".agents/skills",name,"SKILL.md");fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,name);return {name,file};});
 return {root,cache,repo,file,dev};}
test("consumer and repository inventories are scoped to real installed files",()=>{
 const f=fixture();try{const entry={name:"diagram-kit:arch-diagram",file:f.file};
 assert.deepEqual(assertDiscovery([entry],{cacheRoot:f.cache,repositoryRoot:f.repo,inRepository:false}),{publicSkills:1,repositorySkills:0});
 assert.deepEqual(assertDiscovery([entry,...f.dev],{cacheRoot:f.cache,repositoryRoot:f.repo,inRepository:true}),{publicSkills:1,repositorySkills:19});
 assert.throws(()=>assertDiscovery([entry,...f.dev],{cacheRoot:f.cache,repositoryRoot:f.repo,inRepository:false}));
 }finally{cleanupIsolatedRoot(f.root);}});
test("duplicate, missing and escaped public locators fail closed",()=>{
 const f=fixture();try{const entry={name:"diagram-kit:arch-diagram",file:f.file}, opts={cacheRoot:f.cache,repositoryRoot:f.repo,inRepository:false};
 assert.throws(()=>assertDiscovery([],opts));assert.throws(()=>assertDiscovery([entry,entry],opts));
 const foreign=path.join(f.root,"other/skills/arch-diagram/SKILL.md");fs.mkdirSync(path.dirname(foreign),{recursive:true});fs.writeFileSync(foreign,"other");
 assert.throws(()=>assertDiscovery([{...entry,file:foreign}],opts));
 }finally{cleanupIsolatedRoot(f.root);}});
test("Windows equivalent file casing still passes containment",{skip:process.platform!=="win32"},()=>{
 const f=fixture();try{assertDiscovery([{name:"diagram-kit:arch-diagram",file:f.file.toLowerCase()}],{cacheRoot:f.cache,repositoryRoot:f.repo,inRepository:false});}finally{cleanupIsolatedRoot(f.root);}});
test("prompt parser retains spaces and closing parentheses in a locator",()=>{
 const file="C:/test folder (fixture)/SKILL.md";
 assert.deepEqual(parsePromptInputSkills(JSON.stringify([{text:'- diagram-kit:arch-diagram: generate diagrams (file: '+file+')'}])),[{name:"diagram-kit:arch-diagram",file}]);
});

function aliasedPrompt(roots, entries) {
 return JSON.stringify([{text:["### Skill roots",...roots.map(([alias,root])=>`- \`${alias}\` = \`${root}\``),
  "### Available skills",...entries.map(({name,file})=>`- ${name}: discover skill (file: ${file})`)].join("\n")}]);
}

test("root aliases resolve installed and all 19 repository skills before scope checks",()=>{
 const f=fixture();try{
  const roots=[["r1",f.cache],["r2",path.join(f.repo,".agents/skills")]];
  const entry={name:"diagram-kit:arch-diagram",file:"r1/diagram-kit/0.2.0/skills/arch-diagram/SKILL.md"};
  const opts={cacheRoot:f.cache,repositoryRoot:f.repo};
  const consumer=parsePromptInputSkills(aliasedPrompt(roots,[entry]));
  assert.deepEqual(assertDiscovery(consumer,{...opts,inRepository:false}),{publicSkills:1,repositorySkills:0});
  const dev=f.dev.map(({name})=>({name,file:`r2/${name}/SKILL.md`}));
  const repository=parsePromptInputSkills(aliasedPrompt(roots,[entry,...dev]));
  assert.deepEqual(assertDiscovery(repository,{...opts,inRepository:true}),{publicSkills:1,repositorySkills:19});
  assert.throws(()=>assertDiscovery(repository,{...opts,inRepository:false}));
 }finally{cleanupIsolatedRoot(f.root);}
});

test("missing, relative, conflicting and escaped root mappings fail closed",()=>{
 const f=fixture();try{
  const entry={name:"diagram-kit:arch-diagram",file:"r1/diagram-kit/0.2.0/skills/arch-diagram/SKILL.md"};
  assert.throws(()=>parsePromptInputSkills(aliasedPrompt([], [entry])),/unknown skill root/);
  assert.throws(()=>parsePromptInputSkills(aliasedPrompt([["r1","relative/cache"]], [entry])),/absolute/);
  assert.throws(()=>parsePromptInputSkills(aliasedPrompt([["r1",f.cache],["r1",f.repo]], [entry])),/conflicting skill root/);
  assert.throws(()=>parsePromptInputSkills(aliasedPrompt([["r1",f.cache]], [{...entry,file:"r1/../repo/SKILL.md"}])),/escapes skill root/);
 }finally{cleanupIsolatedRoot(f.root);}
});

test("root mappings are local to their prompt text block",()=>{
 const f=fixture();try{
  const blocks=[f.cache,f.repo].map(root=>JSON.parse(aliasedPrompt([["r1",root]], [{name:"fixture",file:"r1/SKILL.md"}]))[0]);
  assert.deepEqual(parsePromptInputSkills(JSON.stringify(blocks)),[f.cache,f.repo].map(root=>({name:"fixture",file:path.join(root,"SKILL.md")})));
  blocks.push({text:"- fixture: discover skill (file: r1/SKILL.md)"});
  assert.throws(()=>parsePromptInputSkills(JSON.stringify(blocks)),/unknown skill root/);
 }finally{cleanupIsolatedRoot(f.root);}
});
