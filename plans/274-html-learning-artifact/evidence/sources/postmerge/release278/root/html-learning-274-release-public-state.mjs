import fs from 'node:fs';
import {spawnSync,execFileSync} from 'node:child_process';
const cwd='C:/Users/Admin/.codex/worktrees/html-learning-artifact/develop';
const response=spawnSync('gh',['api','repos/MJ-AgentLab/mj-agentlab-marketplace/releases/tags/v8.3.2'],{cwd,encoding:'utf8',maxBuffer:2*1024*1024});
let parsed;try{parsed=JSON.parse(response.stdout);}catch{parsed=null;}
const state=response.status===0?'PRESENT':String(parsed?.status)==='404'?'ABSENT':'UNKNOWN';
const tag=execFileSync('git',['ls-remote','--tags','origin','refs/tags/v8.3.2','refs/tags/v8.3.2^{}'],{cwd,encoding:'utf8'}).trim();
const receipt={capturedAt:new Date().toISOString(),version:'8.3.2',releaseState:state,tagState:tag?'PRESENT':'ABSENT',tagRefs:tag,requestStatus:response.status,releaseResponse:parsed,stderr:response.stderr,scope:'Read-only current publication check, no draft/tag/release mutation'};
fs.writeFileSync('C:/Users/Admin/AppData/Local/Temp/html-learning-274-release-public-state.json',JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({capturedAt:receipt.capturedAt,releaseState:state,tagState:receipt.tagState}));
