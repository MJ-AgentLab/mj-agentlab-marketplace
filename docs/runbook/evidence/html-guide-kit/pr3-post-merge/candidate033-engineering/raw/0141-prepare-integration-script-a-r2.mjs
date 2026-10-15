import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {spawnSync} from 'node:child_process';import {createHash} from 'node:crypto';
const dir=path.dirname(fileURLToPath(import.meta.url)),original=path.join(dir,'prepare-integration-script-a.mjs'),source=fs.readFileSync(original,'utf8');
let next=source.replace('oldSource31_30_29EvidenceNotWritten:true,','oldSource32_30_29EvidenceNotWritten:true,');
if(next===source)throw Error('Initial anchor correction missing');
next=next.replace(/String\.raw`([\s\S]*?)`/g,(_,body)=>'String.raw`'+body.replaceAll('\\\\','\\')+'`');
const candidate=path.join(dir,'prepare-integration-script-corrected.mjs');fs.writeFileSync(candidate,next,{flag:'wx'});
fs.writeFileSync(path.join(dir,'generator-r2-correction-receipt.json'),JSON.stringify({originalSha256:createHash('sha256').update(source).digest('hex'),correctedSha256:createHash('sha256').update(next).digest('hex'),corrections:['Use actual post-version-substitution oldSource32 field anchor.','String.raw author blocks now emit one code escape per intended newline/regexp escape; Windows backslash strings retain required two code slashes.'],originalPreserved:true,previewRun:false,repoWritten:false},null,2)+'\n',{flag:'wx'});
const r=spawnSync(process.execPath,[candidate],{encoding:'utf8',shell:false,windowsHide:true});process.stdout.write(r.stdout);process.stderr.write(r.stderr);process.exitCode=r.status??1;
