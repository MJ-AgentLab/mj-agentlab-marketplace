import fs from 'node:fs';
const base='C:/Users/Admin/.codex/worktrees/html-guide-acceptance',original=fs.readFileSync(base+'/tracking/record-014-root-handoff.mjs','utf8');
const adapted=original.replaceAll('0-1-14','0-1-17').replaceAll('68543af8-f1bd-4785-b513-b8c3f4b95a98','40bfff4c-4195-431e-af4d-be1b09a72012').replaceAll("version:'0.1.14'","version:'0.1.17'");
await import('data:text/javascript;base64,'+Buffer.from(adapted).toString('base64'));
