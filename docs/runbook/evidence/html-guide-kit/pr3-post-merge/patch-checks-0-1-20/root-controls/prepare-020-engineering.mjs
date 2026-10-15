import fs from 'node:fs';import crypto from 'node:crypto';
const base='C:/Users/Admin/.codex/worktrees/html-guide-acceptance',source=base+'/reviewer/corrections/0-1-19/controller.mjs',target=base+'/reviewer/corrections/0-1-20/controller.mjs',bytes=fs.readFileSync(source),text=bytes.toString('utf8');
const old="versions['html-guide-kit']!=='0.1.19'",next="versions['html-guide-kit']!=='0.1.20'";
if(text.split(old).length!==2)throw Error('One exact existing expected-version guard required');
const result=text.replace(old,next),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
fs.writeFileSync(target,result,{flag:'wx'});
fs.writeFileSync(base+'/reviewer/corrections/0-1-20/engineering-controller-preparation.json',JSON.stringify({recordedAt:new Date().toISOString(),phase:'PREP_ONLY',source,sourceSha256:hash(bytes),candidateSha256:hash(Buffer.from(result)),onlyVersionGuardChanged:true,strictInstallations:13,actualCachePythonRuns:6,canonicalArgumentRequired:true,installation:'NOT_RUN',model:'NOT_RUN'},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({controllerPrepared:true,onlyGuard:'19→20',counts:'13/6',installation:'NOT_RUN',model:'NOT_RUN'}));
