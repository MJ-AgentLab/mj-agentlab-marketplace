import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {assertDiscovery,parsePromptInputSkills,cleanupIsolatedRoot,listNativeSkills,INSTALL_SCENARIOS,assertInstalledSkillResources,assertInstalledPackageMetadata} from "../scripts/smoke-codex-plugin.mjs";
import {REPOSITORY_SKILLS,RUNTIME_PLUGINS,EXPLICIT_ONLY_SKILLS,COMMUNICATION_REFERENCES} from "../scripts/validate-portable.mjs";
import {spawnCli} from "../scripts/run-cli.mjs";
function fixture(){const root=fs.mkdtempSync(path.join(fs.realpathSync.native(os.tmpdir()),"discovery-fixture-"));
 const cache=path.join(root,"cache"), repo=path.join(root,"repo");
 const manifests=Object.fromEntries(Object.keys(RUNTIME_PLUGINS).map(plugin=>{const manifest=JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname,"..","plugins",plugin,"plugin.json"),"utf8"));if(plugin==="diagram-kit")manifest.version="0.2.0";return [plugin,manifest];}));
 const pluginVersions=Object.fromEntries(Object.entries(manifests).map(([plugin,manifest])=>[plugin,manifest.version]));
 const skillFile=(plugin,skill)=>{const file=path.join(cache,plugin,pluginVersions[plugin],"skills",skill,"SKILL.md");fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,skill);return file;};
 const file=skillFile("diagram-kit","arch-diagram"),quizFile=skillFile("learning-evidence-kit","pop-quiz");
 const explainEntries=["glossary","concept"].map(skill=>({name:"explain-kit:"+skill,file:skillFile("explain-kit",skill)}));
 const guideFile=skillFile("html-guide-kit","guide"),siteFile=skillFile("html-guide-kit","site");
 for(const [plugin,manifest] of Object.entries(manifests))for(const base of [path.join(repo,"plugins",plugin),path.join(cache,plugin,pluginVersions[plugin])]){fs.mkdirSync(base,{recursive:true});fs.writeFileSync(path.join(base,"plugin.json"),JSON.stringify(manifest));}
 const entries=[{name:"diagram-kit:arch-diagram",file},{name:"learning-evidence-kit:pop-quiz",file:quizFile},{name:"learning-evidence-kit:learning-record-check",file:skillFile("learning-evidence-kit","learning-record-check")},...explainEntries,{name:"communication-kit:communicate",file:skillFile("communication-kit","communicate")},{name:"html-guide-kit:guide",file:guideFile},{name:"html-guide-kit:site",file:siteFile}];
 const dev=REPOSITORY_SKILLS.map(name=>{const file=path.join(repo,".agents/skills",name,"SKILL.md");fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,name);return {name,file};});
 return {root,cache,repo,file,quizFile,guideFile,siteFile,entries,dev,pluginVersions};}
test("consumer and repository inventories are scoped to real installed files",()=>{
 const f=fixture();try{
 assert.deepEqual(assertDiscovery(f.entries,{cacheRoot:f.cache,repositoryRoot:f.repo,inRepository:false}),{publicSkills:8,repositorySkills:0});
 assert.deepEqual(assertDiscovery([...f.entries,...f.dev],{cacheRoot:f.cache,repositoryRoot:f.repo,inRepository:true}),{publicSkills:8,repositorySkills:20});
 assert.throws(()=>assertDiscovery([...f.entries,...f.dev],{cacheRoot:f.cache,repositoryRoot:f.repo,inRepository:false}));
 }finally{cleanupIsolatedRoot(f.root);}});
test("duplicate, missing and escaped public locators fail closed",()=>{
 const f=fixture();try{const entry=f.entries[0], opts={cacheRoot:f.cache,repositoryRoot:f.repo,inRepository:false};
 assert.throws(()=>assertDiscovery([],opts));assert.throws(()=>assertDiscovery([entry],opts));assert.throws(()=>assertDiscovery([...f.entries,entry],opts));
 const foreign=path.join(f.root,"other/skills/arch-diagram/SKILL.md");fs.mkdirSync(path.dirname(foreign),{recursive:true});fs.writeFileSync(foreign,"other");
 assert.throws(()=>assertDiscovery(f.entries.map(e=>e===entry?{...e,file:foreign}:e),opts),/own isolated plugin\/version cache/);
 assert.throws(()=>assertDiscovery(f.entries.map(e=>e===f.entries[1]?{...e,file:f.file}:e),opts),/own isolated plugin\/version cache/);
 assert.throws(()=>assertDiscovery(f.entries,{...opts,pluginVersions:{...f.pluginVersions,"diagram-kit":"0.3.0"}}));
 assert.throws(()=>assertDiscovery([...f.entries,{name:"unapproved-kit:quiz",file:f.quizFile}],opts));
 }finally{cleanupIsolatedRoot(f.root);}});
test("Windows equivalent file casing still passes containment",{skip:process.platform!=="win32"},()=>{
 const f=fixture();try{assertDiscovery(f.entries.map(e=>({...e,file:e.file.toLowerCase()})),{cacheRoot:f.cache,repositoryRoot:f.repo,inRepository:false});}finally{cleanupIsolatedRoot(f.root);}});
test("ordinary prompt metadata contains three natural skills and excludes the two learning, guide, site and communication entries",()=>{
 const f=fixture();try{const expectedSkills=["diagram-kit:arch-diagram","explain-kit:glossary","explain-kit:concept"],opts={cacheRoot:f.cache,repositoryRoot:f.repo,inRepository:false,expectedSkills};
 const natural=f.entries.filter(e=>expectedSkills.includes(e.name));
 assert.deepEqual(assertDiscovery(natural,opts),{publicSkills:3,repositorySkills:0});assert.throws(()=>assertDiscovery(f.entries,opts));
 for(const explicit of f.entries.filter(entry=>EXPLICIT_ONLY_SKILLS.includes(entry.name)))assert.throws(()=>assertDiscovery([...natural,explicit],opts),/exactly the expected approved skills/);
 }finally{cleanupIsolatedRoot(f.root);}
});
test("a plugin cache junction cannot claim files outside its marketplace directory",t=>{
 const f=fixture();t.after(()=>cleanupIsolatedRoot(f.root));
 const cache=path.join(f.cache,'learning-evidence-kit'),foreign=path.join(f.root,'foreign'),target=path.join(foreign,f.pluginVersions['learning-evidence-kit'],'skills/pop-quiz/SKILL.md');
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
 const source=`let b='',initialized=false;process.stdin.on('data',c=>{b+=c;let n;while((n=b.indexOf('\\n'))>=0){const q=JSON.parse(b.slice(0,n));b=b.slice(n+1);if(q.method==='initialize')process.stdout.write(JSON.stringify({id:q.id,result:{}})+'\\n');else if(q.method==='initialized')initialized=true;else if(q.method==='skills/list'){if(!initialized||!q.params.forceReload)throw Error('missing handshake');process.stdout.write(JSON.stringify({method:'skills/changed'})+'\\n');process.stdout.write(JSON.stringify({id:q.id,result:{data:q.params.cwds.map(cwd=>({cwd,errors:[],skills:[{name:'learning-evidence-kit:pop-quiz',enabled:true,interface:{defaultPrompt:'Use $learning-evidence-kit:pop-quiz'},path:'installed/SKILL.md'}]}))}})+'\\n');}}});`;
 const result=await listNativeSkills({cwds,spawn:fakeServer(source),timeoutMs:2000});
 assert.deepEqual(result.map(e=>e.cwd),cwds);assert.equal(result[0].skills[0].name,"learning-evidence-kit:pop-quiz");assert.equal(result[0].skills[0].enabled,true);
});

test("native protocol retains both HTML entries and their own routes in consumer and repository snapshots",async()=>{
 const cwds=[path.resolve("consumer"),path.resolve("repository")];
 const skills=["guide","site"].map(skill=>({name:`html-guide-kit:${skill}`,enabled:true,interface:{defaultPrompt:`Use $html-guide-kit:${skill}`},path:`cache/html-guide-kit/0.1.37/skills/${skill}/SKILL.md`}));
 const source=`let b='',initialized=false;const skills=${JSON.stringify(skills)};process.stdin.on('data',c=>{b+=c;let n;while((n=b.indexOf('\\n'))>=0){const q=JSON.parse(b.slice(0,n));b=b.slice(n+1);if(q.method==='initialize')process.stdout.write(JSON.stringify({id:q.id,result:{}})+'\\n');else if(q.method==='initialized')initialized=true;else if(q.method==='skills/list'){if(!initialized||!q.params.forceReload)throw Error('missing handshake');process.stdout.write(JSON.stringify({id:q.id,result:{data:q.params.cwds.map(cwd=>({cwd,errors:[],skills}))}})+'\\n');}}});`;
 const result=await listNativeSkills({cwds,spawn:fakeServer(source),timeoutMs:2000});
 assert.deepEqual(result.map(entry=>entry.cwd),cwds);
 for(const entry of result){
  assert.deepEqual(entry.skills,skills);
 }
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

for(const installed of INSTALL_SCENARIOS)test("standalone and combined discovery: "+installed.join(" + "),()=>{
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
  fs.writeFileSync(file,original);assert.equal(assertDiscovery(f.entries,opts).publicSkills,8);
 }finally{cleanupIsolatedRoot(f.root);}
});

test("complete installed manifest rejects metadata drift despite unchanged name and version",()=>{
 const f=fixture();try{
  for(const plugin of Object.keys(RUNTIME_PLUGINS)){
   const source=path.join(f.repo,"plugins",plugin),installed=path.join(f.cache,plugin,f.pluginVersions[plugin]),file=path.join(installed,"plugin.json");
   for(const target of [source,installed]){fs.mkdirSync(path.join(target,"assets"),{recursive:true});fs.copyFileSync(path.resolve(import.meta.dirname,"..","plugins",plugin,"assets/icon.svg"),path.join(target,"assets/icon.svg"));}
   const bytes=fs.readFileSync(file),original=JSON.parse(bytes),facts=assertInstalledPackageMetadata(source,installed);
   assert.equal(facts["plugin.json"].bytes,bytes.length);assert.match(facts["plugin.json"].sha256,/^[0-9a-f]{64}$/);assert.match(facts["assets/icon.svg"].sha256,/^[0-9a-f]{64}$/);
   for(const mutate of [
    m=>{m.extensions["com.openai"].interface.capabilities=["Execute"];},
    m=>{m.extensions["com.openai"].interface.defaultPrompt=["Use $unapproved-kit:escape"];},
    m=>{m.description="changed description";},m=>{m.extra="unexpected";},m=>{delete m.extensions;},
   ]){
    const changed=structuredClone(original);mutate(changed);assert.equal(changed.name,original.name);assert.equal(changed.version,original.version);
    fs.writeFileSync(file,JSON.stringify(changed));assert.throws(()=>assertInstalledPackageMetadata(source,installed),/metadata bytes differ.*plugin\.json/);
   }
   for(const content of ["not JSON",JSON.stringify(original,null,2)]){fs.writeFileSync(file,content);assert.throws(()=>assertInstalledPackageMetadata(source,installed),/metadata bytes differ.*plugin\.json/);}
   fs.unlinkSync(file);assert.throws(()=>assertInstalledPackageMetadata(source,installed));fs.mkdirSync(file);assert.throws(()=>assertInstalledPackageMetadata(source,installed),/ordinary owned file/);fs.rmdirSync(file);
   fs.writeFileSync(file,bytes);assert.deepEqual(assertInstalledPackageMetadata(source,installed),facts);
   const svg=path.join(installed,"assets/icon.svg"),svgBytes=fs.readFileSync(svg);fs.unlinkSync(svg);assert.throws(()=>assertInstalledPackageMetadata(source,installed));fs.writeFileSync(svg,Buffer.concat([svgBytes,Buffer.from("\nchanged\n")]));assert.throws(()=>assertInstalledPackageMetadata(source,installed),/metadata bytes differ.*icon\.svg/);fs.writeFileSync(svg,svgBytes);assert.deepEqual(assertInstalledPackageMetadata(source,installed),facts);
  }
 }finally{cleanupIsolatedRoot(f.root);}
});

test("thirteen install combinations preserve implicit and native inventories including explicit standalone zero",()=>{
 const f=fixture();try{
  assert.equal(INSTALL_SCENARIOS.length,13);assert.equal(new Set(INSTALL_SCENARIOS.map(plugins=>plugins.join(","))).size,13);
  for(const installed of INSTALL_SCENARIOS){
   const native=f.entries.filter(entry=>installed.includes(entry.name.split(":")[0])),ordinary=native.filter(entry=>!EXPLICIT_ONLY_SKILLS.includes(entry.name));
   const opts={cacheRoot:f.cache,repositoryRoot:f.repo,inRepository:false};
   assert.equal(assertDiscovery(native,{...opts,expectedSkills:native.map(entry=>entry.name)}).publicSkills,native.length);
   assert.equal(assertDiscovery(ordinary,{...opts,expectedSkills:ordinary.map(entry=>entry.name)}).publicSkills,ordinary.length);
   if(installed.length===1&&installed[0]==="communication-kit"){assert.equal(native.length,1);assert.equal(ordinary.length,0);}
   if(installed.length===1&&installed[0]==="html-guide-kit"){assert.equal(native.length,2);assert.equal(ordinary.length,0);}
   if(installed.length===4){const hasHtml=installed.includes("html-guide-kit");assert.equal(native.length,hasHtml?7:6);assert.equal(ordinary.length,3);assert.equal(native.filter(entry=>EXPLICIT_ONLY_SKILLS.includes(entry.name)).length,hasHtml?4:3);}
   if(installed.length===5){assert.equal(native.length,8);assert.equal(ordinary.length,3);assert.equal(native.filter(entry=>EXPLICIT_ONLY_SKILLS.includes(entry.name)).length,5);}
  }
 }finally{cleanupIsolatedRoot(f.root);}
});
test("installed communication compares every reference byte, metadata and resource ownership",t=>{
 const f=fixture();t.after(()=>cleanupIsolatedRoot(f.root));
 const source=path.join(f.root,"source"),installed=path.join(f.root,"installed"),qualified="communication-kit:communicate";
 fs.cpSync(path.resolve(import.meta.dirname,"..","plugins/communication-kit/skills/communicate"),source,{recursive:true});fs.cpSync(source,installed,{recursive:true});
 const facts=assertInstalledSkillResources(source,installed,qualified);for(const reference of ["SKILL.md","agents/openai.yaml",...COMMUNICATION_REFERENCES])assert.match(facts[reference],/^[0-9a-f]{64}$/);
 for(const reference of ["SKILL.md","agents/openai.yaml",...COMMUNICATION_REFERENCES]){
  const file=path.join(installed,reference),bytes=fs.readFileSync(file);fs.unlinkSync(file);assert.throws(()=>assertInstalledSkillResources(source,installed,qualified),/inventory/);fs.writeFileSync(file,bytes);fs.appendFileSync(file,"\nchanged\n");assert.throws(()=>assertInstalledSkillResources(source,installed,qualified),/differs/);fs.writeFileSync(file,bytes);
 }
 const extra=path.join(installed,"references/unexpected.md");fs.writeFileSync(extra,"extra");assert.throws(()=>assertInstalledSkillResources(source,installed,qualified),/inventory/);fs.unlinkSync(extra);
 const refs=path.join(installed,"references"),owned=path.join(installed,"owned");fs.renameSync(refs,owned);fs.symlinkSync(owned,refs,process.platform==="win32"?"junction":"dir");assert.throws(()=>assertInstalledSkillResources(source,installed,qualified),/symlink|junction|reparse/);fs.unlinkSync(refs);fs.renameSync(owned,refs);
 assert.doesNotThrow(()=>assertInstalledSkillResources(source,installed,qualified));
});

for(const skill of ["guide","site"])test(`${skill} discovery rejects borrowed skill locations, wrong version cache and swapped installed manifest`,()=>{
 const f=fixture();try{
  const opts={cacheRoot:f.cache,repositoryRoot:f.repo,inRepository:false},guide=f.entries.find(e=>e.name===`html-guide-kit:${skill}`);
  const differentParts=f.pluginVersions["html-guide-kit"].split(".").map(Number);differentParts[2]++;const differentVersion=differentParts.join(".");
  assert.throws(()=>assertDiscovery(f.entries.map(e=>e===guide?{...e,file:f.quizFile}:e),opts),/own isolated plugin\/version cache/);
  assert.throws(()=>assertDiscovery(f.entries,{...opts,pluginVersions:{...f.pluginVersions,"html-guide-kit":differentVersion}}),/own isolated plugin\/version cache/);
  const file=path.resolve(path.dirname(guide.file),"../../plugin.json"),original=fs.readFileSync(file),manifest=JSON.parse(original);
  for(const change of [{name:"explain-kit"},{version:differentVersion}]){
   fs.writeFileSync(file,JSON.stringify({...manifest,...change}));assert.throws(()=>assertDiscovery(f.entries,opts),/identity\/version/);
  }
  fs.writeFileSync(file,original);assert.equal(assertDiscovery(f.entries,opts).publicSkills,8);
 }finally{cleanupIsolatedRoot(f.root);}
});
