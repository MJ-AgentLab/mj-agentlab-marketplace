import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const root='C:/Users/Admin/.codex/worktrees/html-learning-artifact/develop', temp='C:/Users/Admin/AppData/Local/Temp';
const task='plans/274-html-learning-artifact', relative='evidence/sources/postmerge/deferral-recovery-20261020';
const target=path.join(root,task,relative), entries=[];
assert(!fs.existsSync(target)); fs.mkdirSync(target,{recursive:true});
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function copy(from,to){const bytes=fs.readFileSync(from),dest=path.join(target,to);assert(!fs.existsSync(dest));fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,bytes);assert.equal(hash(fs.readFileSync(dest)),hash(bytes));entries.push({path:to,original:from,bytes:bytes.length,sha256:hash(bytes)});}
function tree(from,to){for(const entry of fs.readdirSync(from,{withFileTypes:true})){if(entry.isSymbolicLink())throw Error('no symlink evidence copy');const a=path.join(from,entry.name),b=path.posix.join(to,entry.name);if(entry.isDirectory())tree(a,b);else copy(a,b);}}
function selected(from,to,names){for(const name of names)copy(path.join(from,name),path.posix.join(to,name));}
tree(path.join(temp,'html-learning-274-deferrals-fixed-selected'),'fixed');
tree(path.join(temp,'html-learning-274-deferrals-accessibility'),'baseline-visual');
tree(path.join(temp,'html-learning-274-deferrals-extensions-r2'),'extensions-r2');
selected(path.join(temp,'html-learning-274-deferrals-extensions'),'extensions-first',['method.mjs','fixture-classification.json','long-unicode-material-render.stdout.log','long-unicode-material-render.stderr.log']);
selected(path.join(temp,'html-learning-274-deferrals-contract'),'inventory',['assessment.md','assessment.json','capture-method.mjs','assessment-method.mjs','input-manifest.json']);
selected(path.join(temp,'html-learning-274-deferrals-hosting'),'hosting',['native-metadata.json','capability-boundaries.json']);
tree('C:/Users/Admin/.codex/worktrees/html-learning-artifact/owner-core-acceptance282','owner-core-acceptance282');
const recovery=path.join(temp,'html-learning-274-deferrals-recovery');
selected(recovery,'recovery',['summary.json','generated-license-transfer-design-review.json','README.md']);
tree(path.join(recovery,'methods'),'recovery/methods'); tree(path.join(recovery,'recovery'),'recovery/recovery');
selected(path.join(recovery,'license'),'license-audit',['summary.json','generated-output-license-gap.json','package-license-text-check.json','research-provenance-check.json','source-target-comparisons.json','upstream-primary-audit.json','research-ancestor-rights-scan.json']);
const review=path.join(temp,'html-learning-274-deferrals-code-review-r2');
for(const name of fs.readdirSync(review))if(fs.statSync(path.join(review,name)).isFile()&&!/^(?:initial-manifest|manifest)(?:\.|$)/.test(name))copy(path.join(review,name),path.posix.join('code-review',name));
for(const name of ['html-learning-274-deferrals-docs.mjs','html-learning-274-deferrals-collect.mjs','html-learning-274-deferrals-version-dryrun.log','html-learning-274-deferrals-version-apply.log','html-learning-274-deferrals-license-regression-red.log','html-learning-274-deferrals-license-regression-green-r1.log','html-learning-274-deferrals-targeted-r1.log','html-learning-274-deferrals-targeted-r2.log','html-learning-274-deferrals-targeted-r3.log'])copy(path.join(temp,name),path.posix.join('root',name));
const request={schemaVersion:1,capturedAt:new Date().toISOString(),messageId:null,messageTime:null,source:'Direct human request in current task; capture clock is not message clock',request:'梳理 #274 剩余延期事项及恢复条件，已具备条件的继续自主推进，只把确需我作实质决定的事项集中列出。',coreAnswer:'接受当前已交付核心，保留全部延期与历史缺口（推荐）',baseline:'908d29537a19ceca166e8f3c7cddef4d419781a4',fiveBoundaries:'unchanged; no new model/desktop, public audience, official release, reviewer notification, or production rollback',selection:'Selected reproducible methods, source/hash identities, raw outputs and screenshots; complete frozen external QA sets stay at original paths. Research source raw originals deliberately excluded; research redistribution rights UNKNOWN. Existing source bindings unchanged. Browser source can be restored from public baseline or this candidate Git tree; working patches identify pre-alias candidate. No historical PASS/failure or approval is reclassified.'};
const local=path.join(temp,'html-learning-274-deferrals-request.json');fs.writeFileSync(local,JSON.stringify(request,null,2)+'\n');copy(local,'request.json');
const map={schemaVersion:1,capturedAt:new Date().toISOString(),purpose:'Explicit selected-evidence relocation map; paths relative to this directory, original locations preserved. A nested original full manifest remains an inventory at its original root unless all listed files copied; selected fixed manifest is internally complete. No claim that selected evidence reproduces omitted external dependency/native binaries.',files:entries};
const mapFile=path.join(temp,'html-learning-274-deferrals-selection-map.json');fs.writeFileSync(mapFile,JSON.stringify(map,null,2)+'\n');copy(mapFile,'selection-map.json');
const bindingPath=path.join(root,task,'source-bindings.json'), binding=JSON.parse(fs.readFileSync(bindingPath)),old=structuredClone(binding.sources);assert.equal(old.length,1417);
for(const item of entries)binding.sources.push({id:'deferral20261020-'+hash(Buffer.from(item.path)).slice(0,24),kind:'snapshot',path:path.posix.join(relative,item.path),sha256:item.sha256,original:item.original,purpose:'Recover bounded Issue274 deferral inventory, actual failures, candidate fixes and independent engineering evidence',scope:'Own source/materials and selected QA only; unpublished0.1.38 working candidate versus baseline908/publicf906 distinguished. No native/secondclient/effect/legal or protected approval PASS inferred; original evidence and explicit selection map retain identity.'});
assert.deepEqual(binding.sources.slice(0,1417),old);fs.writeFileSync(bindingPath,JSON.stringify(binding,null,2)+'\n');
console.log(JSON.stringify({status:'COPIED_BYTE_EXACT',new:entries.length,total:binding.sources.length,bytes:entries.reduce((n,x)=>n+x.bytes,0),root:target}));
