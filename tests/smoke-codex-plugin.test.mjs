import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {assertDiscovery,parsePromptInputSkills,cleanupIsolatedRoot,listNativeSkills} from "../scripts/smoke-codex-plugin.mjs";
import {REPOSITORY_SKILLS,RUNTIME_PLUGINS} from "../scripts/validate-portable.mjs";
import {spawnCli} from "../scripts/run-cli.mjs";
function fixture(){const root=fs.mkdtempSync(path.join(fs.realpathSync.native(os.tmpdir()),"discovery-fixture-"));
 const cache=path.join(root,"cache"), repo=path.join(root,"repo");
 const manifests=Object.fromEntries(Object.keys(RUNTIME_PLUGINS).map(plugin=>{const manifest=JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname,"..","plugins",plugin,"plugin.json"),"utf8"));if(plugin==="diagram-kit")manifest.version="0.2.0";return [plugin,manifest];}));
 const pluginVersions=Object.fromEntries(Object.entries(manifests).map(([plugin,manifest])=>[plugin,manifest.version]));
 const skillFile=(plugin,skill)=>{const file=path.join(cache,plugin,pluginVersions[plugin],"skills",skill,"SKILL.md");fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,skill);return file;};
 const file=skillFile("diagram-kit","arch-diagram"),quizFile=skillFile("understanding-kit","pop-quiz");
 const explainEntries=["glossary","concept"].map(skill=>({name:"explain-kit:"+skill,file:skillFile("explain-kit",skill)}));
 for(const [plugin,manifest] of Object.entries(manifests))for(const base of [path.join(repo,"plugins",plugin),path.join(cache,plugin,pluginVersions[plugin])]){fs.mkdirSync(base,{recursive:true});fs.writeFileSync(path.join(base,"plugin.json"),JSON.stringify(manifest));}
 const entries=[{name:"diagram-kit:arch-diagram",file},{name:"understanding-kit:pop-quiz",file:quizFile},...explainEntries];
 const dev=REPOSITORY_SKILLS.map(name=>{const file=path.join(repo,".agents/skills",name,"SKILL.md");fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,name);return {name,file};});
 return {root,cache,repo,file,quizFile,entries,dev,pluginVersions};}
test("consumer and repository inventories are scoped to real installed files",()=>{
 const f=fixture();try{
 assert.deepEqual(assertDiscovery(f.entries,{cacheRoot:f.cache,repositoryRoot:f.repo,inRepository:false}),{publicSkills:4,repositorySkills:0});
 assert.deepEqual(assertDiscovery([...f.entries,...f.dev],{cacheRoot:f.cache,repositoryRoot:f.repo,inRepository:true}),{publicSkills:4,repositorySkills:20});
 assert.throws(()=>assertDiscovery([...f.entries,...f.dev],{cacheRoot:f.cache,repositoryRoot:f.repo,inRepository:false}));
 }finally{cleanupIsolatedRoot(f.root);}});
test("duplicate, missing and escaped public locators fail closed",()=>{
 const f=fixture();try{const entry=f.entries[0], opts={cacheRoot:f.cache,repositoryRoot:f.repo,inRepository:false};
 assert.throws(()=>assertDiscovery([],opts));assert.throws(()=>assertDiscovery([entry],opts));assert.throws(()=>assertDiscovery([...f.entries,entry],opts));
 const foreign=path.join(f.root,"other/skills/arch-diagram/SKILL.md");fs.mkdirSync(path.dirname(foreign),{recursive:true});fs.writeFileSync(foreign,"other");
 assert.throws(()=>assertDiscovery([{...entry,file:foreign},f.entries[1]],opts));
 assert.throws(()=>assertDiscovery([entry,{...f.entries[1],file:f.file}],opts));
 assert.throws(()=>assertDiscovery(f.entries,{...opts,pluginVersions:{...f.pluginVersions,"diagram-kit":"0.3.0"}}));
 assert.throws(()=>assertDiscovery([...f.entries,{name:"unapproved-kit:quiz",file:f.quizFile}],opts));
 }finally{cleanupIsolatedRoot(f.root);}});
test("Windows equivalent file casing still passes containment",{skip:process.platform!=="win32"},()=>{
 const f=fixture();try{assertDiscovery(f.entries.map(e=>({...e,file:e.file.toLowerCase()})),{cacheRoot:f.cache,repositoryRoot:f.repo,inRepository:false});}finally{cleanupIsolatedRoot(f.root);}});
test("ordinary prompt metadata excludes the explicit-only quiz",()=>{
 const f=fixture();try{const opts={cacheRoot:f.cache,repositoryRoot:f.repo,inRepository:false,expectedSkills:["diagram-kit:arch-diagram"]};
 assert.deepEqual(assertDiscovery([f.entries[0]],opts),{publicSkills:1,repositorySkills:0});assert.throws(()=>assertDiscovery(f.entries,opts));
 }finally{cleanupIsolatedRoot(f.root);}
});
test("a plugin cache junction cannot claim files outside its marketplace directory",t=>{
 const f=fixture();t.after(()=>cleanupIsolatedRoot(f.root));
 const cache=path.join(f.cache,'understanding-kit'),foreign=path.join(f.root,'foreign'),target=path.join(foreign,f.pluginVersions['understanding-kit'],'skills/pop-quiz/SKILL.md');
 fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,'foreign');fs.rmSync(cache,{recursive:true});
 try{fs.symlinkSync(foreign,cache,process.platform==='win32'?'junction':'dir');}catch(e){if(['EPERM','EACCES','ENOSYS'].includes(e.code)){t.skip('symbolic links unavailable');return;}throw e;}
 assert.throws(()=>assertDiscovery(f.entries,{cacheRoot:f.cache,repositoryRoot:f.repo,inRepository:false}),/plugin cache escapes/);
});
test("prompt parser retains spaces and closing parentheses in a locator",()=>{
 const file="C:/test folder (fixture)/SKILL.md";
 assert.deepEqual(parsePromptInputSkills(JSON.stringify([{text:'- diagram-kit:arch-diagram: generate diagrams (file: '+file+')'}])),[{name:"diagram-kit:arch-diagram",file}]);
});

const fakeServer = source => (_name,_args,options) => spawnCli(process.execPath,["-e",source],options);
test("native skills/list completes the handshake and preserves explicitly available metadata",async()=>{
 const cwds=[path.resolve("consumer"),path.resolve("repository")];
 const source=`let b='',initialized=false;process.stdin.on('data',c=>{b+=c;let n;while((n=b.indexOf('\\n'))>=0){const q=JSON.parse(b.slice(0,n));b=b.slice(n+1);if(q.method==='initialize')process.stdout.write(JSON.stringify({id:q.id,result:{}})+'\\n');else if(q.method==='initialized')initialized=true;else if(q.method==='skills/list'){if(!initialized||!q.params.forceReload)throw Error('missing handshake');process.stdout.write(JSON.stringify({method:'skills/changed'})+'\\n');process.stdout.write(JSON.stringify({id:q.id,result:{data:q.params.cwds.map(cwd=>({cwd,errors:[],skills:[{name:'understanding-kit:pop-quiz',enabled:true,interface:{defaultPrompt:'Use $understanding-kit:pop-quiz'},path:'installed/SKILL.md'}]}))}})+'\\n');}}});`;
 const result=await listNativeSkills({cwds,spawn:fakeServer(source),timeoutMs:2000});
 assert.deepEqual(result.map(e=>e.cwd),cwds);assert.equal(result[0].skills[0].name,"understanding-kit:pop-quiz");assert.equal(result[0].skills[0].enabled,true);
});
test("native inventory fails closed on protocol errors and a stalled server",async()=>{
 for(const source of ["process.stdout.write('invalid-json\\n');","process.stdout.write(JSON.stringify({id:1,error:{message:'denied'}})+'\\n');","process.stdout.write(JSON.stringify({id:2,result:{}})+'\\n');","process.exit(0);","setInterval(()=>{},1000);"]){
 await assert.rejects(listNativeSkills({cwds:[],spawn:fakeServer(source),timeoutMs:300}));
 }
});

function aliasedPrompt(roots, entries) {
 return JSON.stringify([{text:["### Skill roots",...roots.map(([alias,root])=>`- \`${alias}\` = \`${root}\``),
  "### Available skills",...entries.map(({name,file})=>`- ${name}: discover skill (file: ${file})`)].join("\n")}]);
}

test("root aliases resolve installed and all 20 repository skills before scope checks",()=>{
 const f=fixture();try{
  const roots=[["r1",f.cache],["r2",path.join(f.repo,".agents/skills")]];
  const entry={name:"diagram-kit:arch-diagram",file:"r1/"+path.relative(f.cache,f.file).split(path.sep).join("/")};
  const opts={cacheRoot:f.cache,repositoryRoot:f.repo,expectedSkills:[entry.name]};
  const consumer=parsePromptInputSkills(aliasedPrompt(roots,[entry]));
  assert.deepEqual(assertDiscovery(consumer,{...opts,inRepository:false}),{publicSkills:1,repositorySkills:0});
  const dev=f.dev.map(({name})=>({name,file:`r2/${name}/SKILL.md`}));
  const repository=parsePromptInputSkills(aliasedPrompt(roots,[entry,...dev]));
  assert.deepEqual(assertDiscovery(repository,{...opts,inRepository:true}),{publicSkills:1,repositorySkills:20});
  assert.throws(()=>assertDiscovery(repository,{...opts,inRepository:false}));
 }finally{cleanupIsolatedRoot(f.root);}
});

test("missing, relative, conflicting and escaped root mappings fail closed",()=>{
 const f=fixture();try{
  const entry={name:"diagram-kit:arch-diagram",file:"r1/"+path.relative(f.cache,f.file).split(path.sep).join("/")};
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

for(const installed of [["diagram-kit"],["explain-kit"],["diagram-kit","explain-kit"],Object.keys(RUNTIME_PLUGINS)])test("standalone and combined discovery: "+installed.join(" + "),()=>{
 const f=fixture();try{
  const entries=f.entries.filter(e=>installed.includes(e.name.split(":")[0])),expectedSkills=entries.map(e=>e.name);
  const opts={cacheRoot:f.cache,repositoryRoot:f.repo,expectedSkills};
  assert.deepEqual(assertDiscovery(entries,{...opts,inRepository:false}),{publicSkills:entries.length,repositorySkills:0});
  assert.deepEqual(assertDiscovery([...entries,...f.dev],{...opts,inRepository:true}),{publicSkills:entries.length,repositorySkills:20});
  assert.throws(()=>assertDiscovery([...entries,{name:"mp-unknown",file:f.dev[0].file}],{...opts,inRepository:false}));
 }finally{cleanupIsolatedRoot(f.root);}
});

test("complete installed inventory rejects swapped skills and package identity/version drift",()=>{
 const f=fixture();try{
  const opts={cacheRoot:f.cache,repositoryRoot:f.repo,inRepository:false};
  const wrong=f.entries.map(e=>({...e}));wrong[2].file=wrong[3].file;assert.throws(()=>assertDiscovery(wrong,opts));
  const file=path.resolve(path.dirname(f.entries[2].file),"../../plugin.json"),original=fs.readFileSync(file),manifest=JSON.parse(original);
  for(const change of [{name:"diagram-kit"},{version:"9.9.9"}]){fs.writeFileSync(file,JSON.stringify({...manifest,...change}));assert.throws(()=>assertDiscovery(f.entries,opts),/identity\/version/);}
  fs.writeFileSync(file,original);assert.equal(assertDiscovery(f.entries,opts).publicSkills,4);
 }finally{cleanupIsolatedRoot(f.root);}
});
