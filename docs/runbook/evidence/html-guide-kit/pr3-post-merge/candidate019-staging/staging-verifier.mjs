import fs from 'node:fs';
const base='C:/Users/Admin/.codex/worktrees/html-guide-acceptance',source=base+'/tracking/verify-016-staging.mjs';
const original=fs.readFileSync(source,'utf8');
let adapted=original.replaceAll('0-1-16','0-1-19').replaceAll("version:'0.1.16'","version:'0.1.19'").replaceAll("version!=='0.1.16'","version!=='0.1.19'").replace("'plugins/html-guide-kit/skills/guide/'+p.relative","'plugins/html-guide-kit/'+p.relative");
if(process.argv.includes('--final'))adapted=adapted.replace("root+'/staged-verification.json'","root+'/final-staged-verification.json'");
if(adapted.includes('0-1-16')||adapted.includes("version:'0.1.16'"))throw Error('Incomplete mechanical verifier adaptation');
await import('data:text/javascript;base64,'+Buffer.from(adapted).toString('base64'));
