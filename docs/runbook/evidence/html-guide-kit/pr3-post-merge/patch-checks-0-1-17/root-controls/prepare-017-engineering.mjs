import fs from 'node:fs';import crypto from 'node:crypto';
const base='C:/Users/Admin/.codex/worktrees/html-guide-acceptance',original=base+'/reviewer/corrections/0-1-16/controller.mjs',target=base+'/reviewer/corrections/0-1-17',hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const bytes=fs.readFileSync(original),text=bytes.toString('utf8'),anchor="versions['html-guide-kit']!=='0.1.16'";
if(!text.includes(anchor)||!text.includes("repo='C:/Users/Admin/.codex/worktrees/html-guide-acceptance/develop'"))throw Error('Exact previous controller anchors');
const next=text.replace(anchor,"versions['html-guide-kit']!=='0.1.17'");
fs.writeFileSync(target+'/controller.mjs',next,{flag:'wx'});
fs.writeFileSync(target+'/engineering-controller-preparation.json',JSON.stringify({recordedAt:new Date().toISOString(),source:{file:original,bytes:bytes.length,sha256:hash(bytes)},target:{file:target+'/controller.mjs',bytes:Buffer.byteLength(next),sha256:hash(Buffer.from(next))},changes:['Canonical detached candidate HTML version guard0.1.16 to0.1.17'],strictInstallMechanismUnchanged:true,scenarioCount:13,actualPythonRuns:6,canonicalInstallation:'NOT_RUN',model:'NOT_RUN'},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({preparedOnly:true,scenarioCount:13,pythonCount:6,model:'NOT_RUN'}));
