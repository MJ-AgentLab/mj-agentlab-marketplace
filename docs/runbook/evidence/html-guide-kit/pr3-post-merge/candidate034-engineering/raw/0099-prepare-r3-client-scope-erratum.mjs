import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const root='C:/Users/Admin/.codex/worktrees/html-guide-acceptance/reviewer/corrections/0-1-34/engineering-integration-draft',source=path.join(root,'integrate-source34-r2.mjs'),target=path.join(root,'integrate-source34-r3.mjs');
const old=fs.readFileSync(source),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
assert.equal(sha(old),'d68c1ce675cf614441b36693e583b32d62c7dbae63dc1d9ec5eeb9bc7f2b2bb5');
const edits=[
 {old:'双端只安装/0.1.33详情及自有配置复原有证，无本轮typed/send/modelUUID',new:'原生安装及同一应用0.1.33详情、自有配置复原有证；本地Codex入口未运行，无本轮typed/send/modelUUID'},
 {old:'Source33两端有真实安装/0.1.33详情及已恢复自有/非自有配置的证据，未typed/send或产生模型UUID',new:'Source33原生安装及同一应用0.1.33详情有证，自有/非自有配置已复原；本地Codex入口未运行，未typed/send或产生模型UUID'},
 {old:'双端仅安装/详情无输入',new:'原生安装/同一应用详情有证，本地Codex入口未运行/无输入'},
 {old:'71 distribution Git modes/blobs must match Source32 canonical',new:'71 distribution Git modes/blobs must match Source33 canonical'}
];
let next=old.toString('utf8');for(const e of edits){assert.equal(next.split(e.old).length,2);next=next.replace(e.old,e.new);}
let inverse=next;for(const e of [...edits].reverse()){assert.equal(inverse.split(e.new).length,2);inverse=inverse.replace(e.new,e.old);}assert(Buffer.from(inverse).equals(old));
fs.writeFileSync(target,next,{flag:'wx'});
const receipt={recordedAt:new Date().toISOString(),reason:'Root documentation review: same native backend/app installation and detail/composer evidence does not establish two client entrances. Local Codex entrance NOT_RUN; no source33 typed/send/modelUUID.',source,sourceSha256:sha(old),target,targetBytes:Buffer.byteLength(next),targetSha256:sha(next),edits,orderedForwardInverseExact:true,otherScriptBytesUnchanged:true,resourceControlsPathsGuardsUnchanged:true,originalPreviewRetained:true,repoMutation:false,versionTestApiModelNotRun:true};
fs.writeFileSync(path.join(root,'r3-client-scope-erratum.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({target,bytes:receipt.targetBytes,sha256:receipt.targetSha256}));
