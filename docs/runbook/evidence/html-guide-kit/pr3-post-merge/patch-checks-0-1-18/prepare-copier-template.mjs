// External Source18 copier preparation; no installation, mirrors, caches or models.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url)),source=path.resolve(root,'../0-1-17/build-controls-prep-only-behavior-a.mjs'),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const original=fs.readFileSync(source);if(hash(original)!=='9037dc0f0af30405ad7823a35912401d8ecfcad46725930b642bd1751d8c20e2')throw new Error('Actual Source17 copier pin mismatch');
let text=original.toString('utf8');const edits=[
 ['0.1.16','__SOURCE_VERSION_LITERAL__'],['0.1.17','__CANDIDATE_VERSION_LITERAL__'],
 ['0-1-16','0-1-17'],['source16','source17'],['Source16','Source17'],['SOURCE16','SOURCE17'],['COMMITTED17','COMMITTED18'],
 ['__SOURCE_VERSION_LITERAL__','0.1.17'],['__CANDIDATE_VERSION_LITERAL__','0.1.18'],
 ['9e969c402e80dff38793f044aeff8f103933c783c1fab04dbb048678b00236e9','7763895eb81ab435a1023d196d71cd076acc3283ad503df3c54d75d512dfa5ae'],
 ['2534cf07232c5bda84bc38a76399f414a999bf1563301c67471c2e0cf3bfb9e5','964a944b6e91f258dca3dce118495b5806e2073116cf2ca15b25e5aeaa02a449'],
 ['b4fb2468bd0baec6d57494eed39514ec724ca5e5','5bf3edf7e4c7ded20f9344ecfe4fbcae9104330b'],
 ['29e6d3e3e1287a34e88d3061f1d8b0d0a85e1419','67663002e90e6e532f36fbd6377a8cfc09f50ddf'],
 ["beforeHex:'36',afterHex:'37'","beforeHex:'37',afterHex:'38'"],['last byte36 ->37','last byte37 ->38'],['last-byte36→37','last-byte37→38'],
 ['Missing current16 version guard','Missing current17 version guard'],['an exact17 canonical','an exact18 canonical'],['No15 runs','No17 runs'],
];
const changes=[];for(const [before,after]of edits){const occurrences=text.split(before).length-1;if(!occurrences)throw new Error('Copier metadata target absent: '+before);text=text.replaceAll(before,after);changes.push({before,after,occurrences});}
const target=path.join(root,'build-controls-prep-only-behavior-a.mjs');fs.writeFileSync(target,text,{flag:'wx'});fs.mkdirSync(path.join(root,'provenance'),{recursive:true});fs.writeFileSync(path.join(root,'provenance/source17-copier-original.mjs'),original,{flag:'wx'});
const control={recordedAt:new Date().toISOString(),phase:'PREP_ONLY_COPIER_PREPARATION',sourceFile:source,sourceSha256:hash(original),targetFile:target,targetSha256:hash(Buffer.from(text)),changes,source17Modified:false,root18ExistingFilesModified:false,source17Closure:{source:'Root actual pack/Node/.NET/seal confirmation',packChunk:'9032c7',nodeChunk:'fc05c6',dotNetChunk:'482bd8',sealChunk:'caf729',allExitCode:0,seal:'candidate027-final-seal',actualFreshSessions:8,actualCompleteTurns:16,independentOutcomes:{PASS:6,FAIL:1,UNKNOWN:1}},frozenControlsCopied:false,modelInvoked:false,installationInvoked:false};
fs.writeFileSync(path.join(root,'copier-source-control.json'),JSON.stringify(control,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({target,targetSha256:control.targetSha256,source17Unchanged:hash(fs.readFileSync(source))===control.sourceSha256,edits:changes.length,model:false,installation:false},null,2));
