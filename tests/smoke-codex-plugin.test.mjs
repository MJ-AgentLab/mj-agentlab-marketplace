import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {assertDiscovery,parsePromptInputSkills,cleanupIsolatedRoot,listNativeSkills} from "../scripts/smoke-codex-plugin.mjs";
import {REPOSITORY_SKILLS} from "../scripts/validate-portable.mjs";
import {spawnCli} from "../scripts/run-cli.mjs";
function fixture(){const root=fs.mkdtempSync(path.join(fs.realpathSync.native(os.tmpdir()),"discovery-fixture-"));
 const cache=path.join(root,"cache"), repo=path.join(root,"repo"), file=path.join(cache,"diagram-kit/0.2.0/skills/arch-diagram/SKILL.md");
 fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,"skill");
 const quizFile=path.join(cache,"understanding-kit/0.1.0/skills/pop-quiz/SKILL.md");fs.mkdirSync(path.dirname(quizFile),{recursive:true});fs.writeFileSync(quizFile,"quiz");
 const entries=[{name:"diagram-kit:arch-diagram",file},{name:"understanding-kit:pop-quiz",file:quizFile}];
 const dev=REPOSITORY_SKILLS.map(name=>{const file=path.join(repo,".agents/skills",name,"SKILL.md");fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,name);return {name,file};});
 return {root,cache,repo,file,quizFile,entries,dev};}
test("consumer and repository inventories are scoped to real installed files",()=>{
 const f=fixture();try{
 assert.deepEqual(assertDiscovery(f.entries,{cacheRoot:f.cache,repositoryRoot:f.repo,inRepository:false}),{publicSkills:2,repositorySkills:0});
 assert.deepEqual(assertDiscovery([...f.entries,...f.dev],{cacheRoot:f.cache,repositoryRoot:f.repo,inRepository:true}),{publicSkills:2,repositorySkills:19});
 assert.throws(()=>assertDiscovery([...f.entries,...f.dev],{cacheRoot:f.cache,repositoryRoot:f.repo,inRepository:false}));
 }finally{cleanupIsolatedRoot(f.root);}});
test("duplicate, missing and escaped public locators fail closed",()=>{
 const f=fixture();try{const entry=f.entries[0], opts={cacheRoot:f.cache,repositoryRoot:f.repo,inRepository:false};
 assert.throws(()=>assertDiscovery([],opts));assert.throws(()=>assertDiscovery([entry],opts));assert.throws(()=>assertDiscovery([...f.entries,entry],opts));
 const foreign=path.join(f.root,"other/skills/arch-diagram/SKILL.md");fs.mkdirSync(path.dirname(foreign),{recursive:true});fs.writeFileSync(foreign,"other");
 assert.throws(()=>assertDiscovery([{...entry,file:foreign},f.entries[1]],opts));
 assert.throws(()=>assertDiscovery([entry,{...f.entries[1],file:f.file}],opts));
 assert.throws(()=>assertDiscovery(f.entries,{...opts,pluginVersions:{"diagram-kit":"0.3.0","understanding-kit":"0.1.0"}}));
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
 const cache=path.join(f.cache,'understanding-kit'),foreign=path.join(f.root,'foreign'),target=path.join(foreign,'0.1.0/skills/pop-quiz/SKILL.md');
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
