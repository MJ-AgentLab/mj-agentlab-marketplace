import fs from 'node:fs';
const base='C:/Users/Admin/.codex/worktrees/html-guide-acceptance';
const original=fs.readFileSync(base+'/tracking/record-014-root-handoff.mjs','utf8');
const adapted=original.replaceAll('0-1-14','0-1-16').replaceAll('68543af8-f1bd-4785-b513-b8c3f4b95a98','8018554a-75b5-482c-bf9c-801603038c9e').replaceAll("version:'0.1.14'","version:'0.1.16'");
if(adapted===original||adapted.includes('0-1-14'))throw Error('Mechanical adaptation incomplete');
const observation=base+'/reviewer/corrections/0-1-16/root-handoff-helper-adaptation.json';
fs.writeFileSync(observation,JSON.stringify({recordedAt:new Date().toISOString(),originalHelper:base+'/tracking/record-014-root-handoff.mjs',kind:'OPERATOR_OBSERVATION_ONLY',changes:['source correction directory','actual Root batch UUID','observed version'],noModelCallOrSemanticGrade:true},null,2)+'\n',{flag:'wx'});
await import('data:text/javascript;base64,'+Buffer.from(adapted).toString('base64'));
