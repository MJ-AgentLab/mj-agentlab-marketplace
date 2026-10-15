import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const base='C:/Users/Admin/.codex/worktrees/html-guide-acceptance',patch=base+'/reviewer/corrections/0-1-13',target=base+'/develop/docs/runbook/evidence/html-guide-kit/pr3-post-merge/patch-checks-0-1-13';
if(fs.existsSync(target))throw Error('No overwrite');
const h=b=>crypto.createHash('sha256').update(b).digest('hex'),list=[];
const add=(source,name)=>{if(!fs.statSync(source).isFile())throw Error('Not file');list.push({source,name:name.endsWith('.md')?name+'.snapshot.txt':name});};
const collect=(source,prefix)=>{for(const name of fs.readdirSync(source).sort()){const p=source+'/'+name;if(fs.statSync(p).isDirectory())collect(p,prefix+name+'/');else add(p,prefix+name);}};
for(const n of ['draft','provenance','static-snapshot-behavior-a'])collect(patch+'/'+n,n+'/');
for(const n of fs.readdirSync(patch).sort())if(fs.statSync(patch+'/'+n).isFile()&&n!=='README.md'&&!n.endsWith('working.log')&&!n.endsWith('working-corrected.log'))add(patch+'/'+n,n);
for(const n of ['prepare-013-lifecycle-runtime-draft.mjs','apply-013-reviewed-runtime.mjs','013-apply-reviewed-runtime.log','013-lifecycle-draft-success.log'])add(base+'/tracking/'+n,'root-control/'+n);
add(base+'/reviewer/corrections/0-1-12/provenance/013-method-design-advice.json','source12-method-advice.json');
fs.mkdirSync(target);const rows=[];for(const {source,name}of list){const b=fs.readFileSync(source);if(/\b(?:sk-proj-|ghp_|github_pat_)[A-Za-z0-9_-]{12,}/.test(b.toString('utf8')))throw Error('Credential finding, no output');const p=target+'/'+name;fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,b,{flag:'wx'});rows.push({relative:name,sourcePath:source,bytes:b.length,sha256:h(b)});}
fs.writeFileSync(target+'/archive-index.json',JSON.stringify({recordedAt:new Date().toISOString(),kind:'0.1.13 reviewed preparation and frozen controls; no model or installation',upstream:'c1fa458df1b531d7c38436908b750ba810b0b116',version:'0.1.13',rows,rawBytesPreserved:true,model:'NOT_RUN',installation:'NOT_RUN',engineeringCountAdaptation:'Only verify-canonical expected counts changed8/4 to13/6; original version-only file and explicit difference receipt retained'},null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({target,files:rows.length,rawBytes:rows.reduce((a,v)=>a+v.bytes,0)}));
