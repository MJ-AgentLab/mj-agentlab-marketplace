import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const root='C:/Users/Admin/.codex/worktrees/html-learning-artifact/develop',task='plans/274-html-learning-artifact',relative='evidence/sources/postmerge/deferral-recovery-20261020';
const p=path.join(root,task,'source-bindings.json'),binding=JSON.parse(fs.readFileSync(p));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const args=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
for(const item of args){const bytes=fs.readFileSync(item.from),dest=path.join(root,task,relative,item.to);assert(!fs.existsSync(dest),item.to);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,bytes);binding.sources.push({id:'deferral20261020-'+hash(Buffer.from(item.to)).slice(0,24),kind:'snapshot',path:path.posix.join(relative,item.to),sha256:hash(bytes),original:item.from,purpose:item.purpose??'Preserve actual bounded candidate engineering terminal evidence',scope:item.scope??'Unpublished0.1.38 candidate only; original failures preserved; no client/effect/legal or protected approval inference.'});}
assert.equal(new Set(binding.sources.map(x=>x.id)).size,binding.sources.length);fs.writeFileSync(p,JSON.stringify(binding,null,2)+'\n');console.log(JSON.stringify({added:args.length,sources:binding.sources.length}));
