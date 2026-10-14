// Preparation only. Requires the parent's exact complete 0.1.21 canonical; starts no model.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url)),[kind,role,canonical,suppliedProof]=process.argv.slice(2);
if(!['expanded','blocking'].includes(kind))throw new Error('kind: expanded or blocking');
if(!/^[a-f0-9]{40}$/i.test(canonical??''))throw new Error('Wait for parent-provided complete 0.1.21 canonical SHA');
const repo=path.resolve(root,'../../../develop'),manifest=spawnSync('git',['show',`${canonical}:plugins/html-guide-kit/plugin.json`],{cwd:repo,encoding:'utf8',shell:false,windowsHide:true});
if(manifest.status!==0||JSON.parse(manifest.stdout).version!=='0.1.21')throw new Error('Canonical must contain HTML Guide Kit 0.1.21');
const plan=JSON.parse(fs.readFileSync(path.join(root,kind,'plan.json'),'utf8'));
const groups={parent:['B1.1','B1.2-delayed','B1.2-combined','B2.1'],runtime_resources:['B3.1','B3.2','B4.1','B4.2','B5.1','B5.2'],acceptance_contract:['B6.1','B6.2-revise','B6.2-compare','B6.2-review']};
const ids=role==='all'?plan.variants.filter(v=>v.runnable!==false).map(v=>v.id):kind==='expanded'?plan.partitions[role]:groups[role];
if(!ids?.length)throw new Error('Unknown selector; expanded partitions or blocking parent/B3-B5(runtime_resources)/B6(acceptance_contract)/all');
const proof=suppliedProof??path.join(root,'../../diagnostics/inherited-pr2-6ee40474/metadata-relocated.json');
const args=[path.join(root,kind,'harness.mjs'),'prepare','--repo',repo,'--canonical',canonical,'--baseline-default-proof',proof,'--variants',ids.join(',')];
const result=spawnSync(process.execPath,args,{encoding:'utf8',shell:false,windowsHide:true,maxBuffer:32*1024*1024});process.stdout.write(result.stdout);process.stderr.write(result.stderr);process.exitCode=result.status??1;
