import fs from 'node:fs';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const cwd='C:/Users/Admin/.codex/worktrees/html-learning-artifact/develop',git=args=>execFileSync('git',args,{cwd,maxBuffer:40*1024*1024});
const head=git(['rev-parse','HEAD']).toString().trim();assert.equal(head,'315b5942a3a61c6bf7ab17513b8263496bd7a48a');
const paths=git(['diff','--name-only','-z','f906b100',head]).toString().split('\0').filter(Boolean),findings=[];
const signatures=[['GitHub token',/\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b/],['OpenAI token',/\bsk-(?:proj-)?[A-Za-z0-9_-]{30,}\b/],['Private key',/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/]];
let bytes=0;for(const p of paths){const raw=git(['show',head+':'+p]);bytes+=raw.length;const s=raw.toString('utf8');for(const [kind,re] of signatures)if(re.test(s))findings.push({path:p,kind});}
const result={capturedAt:new Date().toISOString(),head,files:paths.length,bytes,commonCredentialSignatureFindings:findings,scope:'Committed changed files only; pattern values are never printed or retained; bounded signature scan, not proof against every possible credential encoding'};
fs.writeFileSync('C:/Users/Admin/AppData/Local/Temp/html-learning-274-record279-credential-scan.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));assert.equal(findings.length,0);
