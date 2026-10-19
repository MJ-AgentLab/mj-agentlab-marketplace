import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const root='C:/Users/Admin/.codex/worktrees/html-learning-artifact/develop',task=path.join(root,'plans/274-html-learning-artifact'),src='C:/Users/Admin/AppData/Local/Temp/html-learning-274-record279-merge-audit',dest=path.join(task,'evidence/sources/postmerge/record279/audit');
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');assert(!fs.existsSync(dest));assert.equal(hash(path.join(src,'summary.json')),'718266dafa0ae083476ac4642a729d12c6463b553d9a7f4a5732682c53cc12a1');
const files=fs.readdirSync(src);assert.equal(files.length,34);assert.equal(files.filter(n=>hash(path.join(src,n))==='6ea1b1c35fc21fbbdf52e1f9f5a68d7a8ef43ce9e1f63e91143416c4cf59bf3f').length,1);
const bf=path.join(task,'source-bindings.json'),b=JSON.parse(fs.readFileSync(bf,'utf8'));fs.mkdirSync(dest);
for(const name of files){const from=path.join(src,name),to=path.join(dest,name);assert(fs.lstatSync(from).isFile());fs.copyFileSync(from,to);assert.equal(hash(from),hash(to));b.sources.push({id:'record279-audit-'+name.replaceAll('.','-'),kind:'snapshot',path:path.relative(task,to).replaceAll('\\','/'),sha256:hash(to),original:from,purpose:'Restore independent actual PR279 merge/source/tested-tree, full ancestry, matched rule-suite/reviews, immutable publication identities and develop protected-rule observations',scope:'22 actual observations captured2026-10-19 after279merge only; main e3dc differs from publishedtag/Release f906, approvalNOT_MET/bypass preserved, initial short-prefix404 not used for conclusions; no new installation, candidate CI or Owner acceptance'});}
fs.writeFileSync(bf,JSON.stringify(b,null,2)+'\n');console.log(JSON.stringify({frozenAuditFiles:files.length,totalSources:b.sources.length}));
