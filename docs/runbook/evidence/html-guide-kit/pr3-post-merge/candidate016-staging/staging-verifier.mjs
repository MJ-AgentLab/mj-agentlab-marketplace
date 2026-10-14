import fs from 'node:fs';import crypto from 'node:crypto';import path from 'node:path';import {execFileSync} from 'node:child_process';
const repo='C:/Users/Admin/.codex/worktrees/html-guide-acceptance/develop',root=path.resolve(repo,'../reviewer/corrections/0-1-16'),upstream='c1fa458df1b531d7c38436908b750ba810b0b116';
const git=args=>execFileSync('git',args,{cwd:repo,maxBuffer:128*1024*1024}),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
if(git(['diff','--name-only','--diff-filter=U']).length)throw Error('Unmerged index');
if(git(['rev-parse','origin/develop']).toString().trim()!==upstream)throw Error('Upstream changed');
let otherResources=0;for(const plugin of ['communication-kit','diagram-kit','learning-evidence-kit','explain-kit']){
 for(const f of git(['ls-tree','-r','--name-only',upstream,'--','plugins/'+plugin]).toString().trim().split('\n')){if(!git(['show',upstream+':'+f]).equals(git(['show',':'+f])))throw Error('Other plugin changed '+f);otherResources++;}
}
const pins=JSON.parse(fs.readFileSync(root+'/applied-reviewed-runtime.json')).rows;
for(const p of pins){const f='plugins/html-guide-kit/skills/guide/'+p.relative;if(hash(git(['show',':'+f]))!==p.sha256||hash(fs.readFileSync(repo+'/'+f))!==p.sha256)throw Error('Reviewed runtime drift '+f);}
for(const f of ['VERSION','.agents/plugins/marketplace.json'])if(!git(['show',':'+f]).equals(git(['show',upstream+':'+f])))throw Error('Approved upstream fact changed '+f);
if(JSON.parse(git(['show',':plugins/html-guide-kit/plugin.json'])).version!=='0.1.16')throw Error('Version');
if(git(['diff','--cached','--name-only','--diff-filter=M','HEAD','--','docs/runbook/evidence/html-guide-kit']).length)throw Error('Old evidence modified');
const added=git(['diff','--cached','--name-only','--diff-filter=A']).toString().trim().split('\n');let evidence=0,maxPath=0;
for(const f of added){maxPath=Math.max(maxPath,f.length);if(f.length>160)throw Error('New tracked path too long '+f);if(f.startsWith('docs/runbook/evidence/html-guide-kit/')){if(!git(['show',':'+f]).equals(fs.readFileSync(repo+'/'+f)))throw Error('Evidence staged-byte drift '+f);evidence++;}}
const agents=git(['show',':AGENTS.md']);const agentsCRLF=Buffer.byteLength(agents.toString().replace(/\r?\n/g,'\r\n'));if(agents.length>16384||agentsCRLF>16384)throw Error('AGENT budget');
const result={recordedAt:new Date().toISOString(),upstream,otherPluginResourcesUnchanged:otherResources,reviewedRuntime:pins,approvedVersionsUnchanged:true,oldEvidenceUnchanged:true,newEvidenceByteVerified:evidence,maxAddedRelativePathCharacters:maxPath,agentsGitBytes:agents.length,agentsCRLFBytes:agentsCRLF,version:'0.1.16',model:'NOT_RUN',canonicalInstallation:'NOT_RUN'};
fs.writeFileSync(root+'/staged-verification.json',JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(result));
