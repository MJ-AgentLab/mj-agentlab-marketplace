import fs from 'node:fs';
import crypto from 'node:crypto';
const base='C:/Users/Admin/.codex/worktrees/html-guide-acceptance';
const target=base+'/develop/docs/runbook/evidence/html-guide-kit/pr3-post-merge/candidate023-final-seal';
if(fs.existsSync(target))throw Error('No archive overwrite');
const handoff=JSON.parse(fs.readFileSync(base+'/reviewer/packer-provenance/0-1-13/final-dry-handoff.json'));
for(const name of ['023-pack-actual.log','023-node-verify.log','023-dotnet-verify.log']){
 const result=JSON.parse(fs.readFileSync(base+'/tracking/'+name,'utf8').trim());
 if(result.files!==428||result.sourceInventorySha256!==handoff.sourceInventorySha256&&name!=='023-node-verify.log')throw Error('Actual verification mismatch');
 if(!result.allPacketHashesVerified)throw Error('Packet verification required');
}
const list=[['reviewer/pack-023-evidence.mjs','packer.mjs'],['reviewer/archive-023-control.json','archive-control.json'],['reviewer/verify-lossless-023-dotnet.ps1','independent-dotnet-verifier.ps1'],['reviewer/packer-provenance/0-1-13/final-dry-handoff.json','final-dry-handoff.json'],['tracking/023-pack-actual.log','pack-actual.log'],['tracking/023-node-verify.log','node-verify.log'],['tracking/023-dotnet-verify.log','dotnet-verify.log']];
fs.mkdirSync(target);
const rows=list.map(([source,relative])=>{const bytes=fs.readFileSync(base+'/'+source);fs.writeFileSync(target+'/'+relative,bytes,{flag:'wx'});return{sourcePath:base+'/'+source,relative,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};});
fs.writeFileSync(target+'/archive-index.json',JSON.stringify({recordedAt:new Date().toISOString(),canonicalSha:handoff.canonicalSha,canonicalTree:handoff.canonicalTree,version:'0.1.13',rawFiles:428,originalBytes:11852065,packets:9,sourceInventorySha256:handoff.sourceInventorySha256,rows,rawBytesPreserved:true,verification:'Actual pack, Node and independent .NET exact restoration; no new model acceptance'},null,2)+'\n',{flag:'wx'});
const runbook=base+'/develop/docs/runbook/[RUNBOOK]_HTML_Guide_Kit_Acceptance.md';
let content=fs.readFileSync(runbook,'utf8');
const old='完整停止原字节封存与复原另按实际补证。';
if(!content.includes(old))throw Error('Exact document anchor required');
content=content.replace(old,'完整[428文件停止原字节封存](evidence/html-guide-kit/pr3-reviewer/patch-023-stopped/index.json)及[Node／独立.NET精确复原](evidence/html-guide-kit/pr3-post-merge/candidate023-final-seal/archive-index.json)实际通过：11,852,065原字节、九packet、sourceInventorySHA13f571b25f535ff6d9e251eac01e7f15711b31b006de62d8a7223f12de75e7af。旧封包不覆盖，评审控制与未来0.1.14资源分离，不要求镜像等于完整仓库tree。');
fs.writeFileSync(runbook,content);
console.log(JSON.stringify({target,rawProofFiles:rows.length,files:428,bytes:11852065,packets:9}));
