import fs from 'node:fs';import crypto from 'node:crypto';
const base='C:/Users/Admin/.codex/worktrees/html-guide-acceptance',dir=base+'/reviewer/corrections/0-1-16',original=base+'/reviewer/corrections/0-1-15/engineering-2bcbe30a/controller.mjs',hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const bytes=fs.readFileSync(original),text=bytes.toString('utf8');
const anchor="repo=path.resolve(root,'../../../develop')";
if(!text.includes(anchor)||!text.includes("versions['html-guide-kit']!=='0.1.15'"))throw Error('Exact original engineering anchors');
const next=text.replace(anchor,"repo='C:/Users/Admin/.codex/worktrees/html-guide-acceptance/develop'").replace("versions['html-guide-kit']!=='0.1.15'","versions['html-guide-kit']!=='0.1.16'");
fs.writeFileSync(dir+'/controller.mjs',next,{flag:'wx'});
fs.writeFileSync(dir+'/engineering-controller-preparation.json',JSON.stringify({recordedAt:new Date().toISOString(),source:{file:original,sha256:hash(bytes),bytes:bytes.length},target:{file:dir+'/controller.mjs',sha256:hash(Buffer.from(next))},changes:['Exact authorized workspace resolution for the new root-level controller','Require HTML version0.1.16 in the canonical detached candidate'],strictInstallMechanismUnchanged:true,scenarioCount:13,actualPythonRuns:6,canonicalInstallation:'NOT_RUN',model:'NOT_RUN'},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({file:dir+'/controller.mjs',preparedOnly:true}));
