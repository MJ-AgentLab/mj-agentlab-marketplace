// New Source19 external copier: literal metadata adaptation, no consumer execution.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url)),source=path.resolve(root,'../0-1-18/build-controls-prep-only-behavior-a.mjs'),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const original=fs.readFileSync(source);if(hash(original)!=='0d529f0255e41087a64ddaa03b687eb01975af3d60cb7757ca4be22539f304b2')throw new Error('Actual Source18 copier pin mismatch');
let text=original.toString('utf8');const edits=[
 ['0.1.17','__SOURCE_VERSION_LITERAL__'],['0.1.18','__CANDIDATE_VERSION_LITERAL__'],
 ['0-1-17','0-1-18'],['source17','source18'],['Source17','Source18'],['SOURCE17','SOURCE18'],['COMMITTED18','COMMITTED19'],
 ['__SOURCE_VERSION_LITERAL__','0.1.18'],['__CANDIDATE_VERSION_LITERAL__','0.1.19'],
 ['7763895eb81ab435a1023d196d71cd076acc3283ad503df3c54d75d512dfa5ae','a748e7499b2d67c589a0cd3b6a471ed8fddba29c737a8777786324aae99893cd'],
 ['964a944b6e91f258dca3dce118495b5806e2073116cf2ca15b25e5aeaa02a449','5d40c9d06217dff3aeef3a74db38d5935a558e9b83cbff5705ed00ab1a0488ac'],
 ['5bf3edf7e4c7ded20f9344ecfe4fbcae9104330b','0a6c48c2b3d782cbffb86355060d65986383eeea'],
 ['67663002e90e6e532f36fbd6377a8cfc09f50ddf','b09e7772bc34e37d6fe9206fa263f827895549af'],
 ["beforeHex:'37',afterHex:'38'","beforeHex:'38',afterHex:'39'"],['last byte37 ->38','last byte38 ->39'],['last-byte37→38','last-byte38→39'],
 ['Missing current17 version guard','Missing current18 version guard'],['an exact18 canonical','an exact19 canonical'],['No17 runs','No18 runs'],
];
const changes=[];for(const [before,after]of edits){const occurrences=text.split(before).length-1;if(!occurrences)throw new Error('Copier metadata target absent: '+before);text=text.replaceAll(before,after);changes.push({before,after,occurrences});}
const target=path.join(root,'build-controls-prep-only-behavior-a.mjs');fs.writeFileSync(target,text,{flag:'wx'});fs.mkdirSync(path.join(root,'provenance'),{recursive:true});fs.writeFileSync(path.join(root,'provenance/source18-copier-original.mjs'),original,{flag:'wx'});
const control={recordedAt:new Date().toISOString(),phase:'PREP_ONLY_COPIER_PREPARATION',sourceFile:source,sourceSha256:hash(original),targetFile:target,targetSha256:hash(Buffer.from(text)),changes,source18Modified:false,root19ExistingFilesModified:false,source18Closure:{source:'Root actual pack028/Node/.NET/seal confirmation',packChunk:'7ce46a',nodeChunk:'f0c96d',dotNetChunk:'00045e',sealChunk:'5af463',allExitCode:0,seal:'seal028',files:413,bytes:9015728,packets:7,independentOutcomes:{PASS:6,FAIL:3,UNKNOWN:1}},frozenControlsCopied:false,modelInvoked:false,installationInvoked:false};
fs.writeFileSync(path.join(root,'copier-source-control.json'),JSON.stringify(control,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({target,targetSha256:control.targetSha256,source18Unchanged:hash(fs.readFileSync(source))===control.sourceSha256,edits:changes.length,model:false,installation:false},null,2));
