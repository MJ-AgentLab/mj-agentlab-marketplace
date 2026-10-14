// Isolated installation entry only. Call only after parent supplies the full committed
// 0.1.17 canonical and confirms eight strict installs / four actual cache Python runs.
// This program starts no model turn; it never sends plans or review data to a model.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url)),[coverage,canonical,suppliedProof]=process.argv.slice(2);
const routes={
 'six-groups':{kind:'blocking',plan:'blocking/plan.json'},
 'b3-b5':{kind:'blocking',plan:'blocking/plan.json',ids:['B3.1','B3.2','B4.1','B4.2','B5.1','B5.2']},
 'affected-expanded':{kind:'expanded',plan:'expanded/plan.json',ids:['E1-maintainer','E13','E13-bilingual','E14-review','E9-recommended','E15']},
 'repeated':{kind:'expanded',plan:'expanded/repeated-plan.json'},
 'continuous':{kind:'continuous-supplement',plan:'continuous-supplement/plan.json'},
};
const route=routes[coverage];if(!route)throw new Error('Known coverage required: '+Object.keys(routes).join(', '));
if(!/^[a-f0-9]{40}$/i.test(canonical??''))throw new Error('Wait for parent full committed 0.1.17 canonical and strict installation PASS');
const repo=path.resolve(root,'../../../develop'),manifest=spawnSync('git',['show',canonical+':plugins/html-guide-kit/plugin.json'],{cwd:repo,encoding:'utf8',shell:false,windowsHide:true});
if(manifest.status!==0||JSON.parse(manifest.stdout).version!=='0.1.17')throw new Error('Canonical must contain HTML Guide Kit 0.1.17');
const planFile=path.join(root,route.plan),plan=JSON.parse(fs.readFileSync(planFile,'utf8')),ids=route.ids??plan.variants.filter(v=>v.runnable!==false).map(v=>v.id);
if(ids.some(id=>!plan.variants.some(v=>v.id===id&&v.runnable!==false)))throw new Error('Frozen plan does not contain requested runnable coverage');
const proof=suppliedProof??path.join(root,'../../diagnostics/inherited-pr2-6ee40474/metadata-relocated.json');
const args=[path.join(root,route.kind,'harness.mjs'),'prepare','--repo',repo,'--canonical',canonical,'--plan',planFile,'--baseline-default-proof',proof,'--variants',ids.join(',')];
const result=spawnSync(process.execPath,args,{encoding:'utf8',shell:false,windowsHide:true,maxBuffer:32*1024*1024});
process.stdout.write(result.stdout);process.stderr.write(result.stderr);process.exitCode=result.status??1;
