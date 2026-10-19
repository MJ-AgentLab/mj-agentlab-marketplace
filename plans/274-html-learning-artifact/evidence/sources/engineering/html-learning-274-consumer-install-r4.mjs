import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const repo='C:/Users/Admin/.codex/worktrees/html-learning-site/develop';
const {runCli}=await import(pathToFileURL(path.join(repo,'scripts/run-cli.mjs')));
const {listNativeSkills}=await import(pathToFileURL(path.join(repo,'scripts/smoke-codex-plugin.mjs')));
const {assertInstalledPluginResources}=await import(pathToFileURL(path.join(repo,'scripts/validate-portable.mjs')));
const root=fs.mkdtempSync(path.join(fs.realpathSync.native(os.tmpdir()),'html-site-consumer-install-'));
const home=path.join(root,'home'),consumer=path.join(root,'consumer'),codexHome=path.join(home,'.codex');
for(const p of [home,consumer,codexHome])fs.mkdirSync(p,{recursive:true});
const env={...process.env,HOME:home,USERPROFILE:home,CODEX_HOME:codexHome,APPDATA:path.join(home,'Roaming'),LOCALAPPDATA:path.join(home,'Local'),XDG_CONFIG_HOME:path.join(home,'config')};
const commands=[];
for(const args of [['plugin','marketplace','add',repo,'--json'],['plugin','add','html-guide-kit','--marketplace','mj-agentlab-marketplace','--json']]){
const r=await runCli('codex',args,{cwd:consumer,env,timeoutMs:60000});commands.push({args,status:r.status});if(r.error||r.status!==0)throw Error(r.stderr||r.error?.message||'install failed');
}
const listed=await listNativeSkills({codexCommand:'codex',cwds:[consumer],env});
const native=listed[0].skills.find(s=>s.name==='html-guide-kit:site');
if(!native||native.enabled!==true)throw Error('native site entry missing/disabled');
const plugin=path.resolve(path.dirname(native.path),'../..');
const resources=assertInstalledPluginResources(path.join(repo,'plugins/html-guide-kit'),plugin,'html-guide-kit');
const result={schemaVersion:1,executedAt:new Date().toISOString(),candidateSha:'03092ce092f01228507ef7c27ef5d6ddd10c0b14',root,codexHome,consumer,sitePath:native.path,version:JSON.parse(fs.readFileSync(path.join(plugin,'plugin.json'))).version,native:listed,resources,commands};
fs.writeFileSync(path.join(os.tmpdir(),'html-learning-274-consumer-install-r4.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({root,sitePath:native.path,version:result.version,native:listed[0].skills.map(s=>({name:s.name,enabled:s.enabled})),resourcesCompared:true}));