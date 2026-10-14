// Prepare a new external byte copier; never execute an installation or model.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url)),source=path.resolve(root,'../0-1-16/build-controls-prep-only-behavior-a.mjs');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const sourceBytes=fs.readFileSync(source);
if(hash(sourceBytes)!=='d83d0f06ebcf7e1c549858d22280bc41a75dc582386b8ebb7115ba28d36a3e6a')throw new Error('Unexpected actual Source16 copier');
let text=sourceBytes.toString('utf8');
const replacements=[
 ['0.1.15','__SOURCE_VERSION_LITERAL__'],['0.1.16','__CANDIDATE_VERSION_LITERAL__'],
 ['0-1-15','0-1-16'],['source15','source16'],['Source15','Source16'],
 ['__SOURCE_VERSION_LITERAL__','0.1.16'],['__CANDIDATE_VERSION_LITERAL__','0.1.17'],
 ['5bce6731ff32d077e72a7307ab7295a6c379e146a50bb4476ffaa9a0bcddea0d','9e969c402e80dff38793f044aeff8f103933c783c1fab04dbb048678b00236e9'],
 ['3bed1059aacf13ca0183e20da8045ff74b03b736597ee6502a84b3670d2c9440','2534cf07232c5bda84bc38a76399f414a999bf1563301c67471c2e0cf3bfb9e5'],
 ['2bcbe30ac2b4e2a64a159f121dc818f961fe7c15','b4fb2468bd0baec6d57494eed39514ec724ca5e5'],
 ['329f0f2e5946194895aca2ee2fbb5bc0d7b1c6aa','29e6d3e3e1287a34e88d3061f1d8b0d0a85e1419'],
 ["beforeHex:'35',afterHex:'36'","beforeHex:'36',afterHex:'37'"],
 ['last byte35 ->36','last byte36 ->37'],['last-byte35→36','last-byte36→37'],
 ['Missing current14 version guard','Missing current16 version guard'],
 ['PREP_ONLY_WAITING_SOURCE15_FINAL_CLOSURE_AND_ROOT_EXACT_COMMITTED16_CANONICAL_THIRTEEN_STRICT_INSTALLS_SIX_ACTUAL_CACHE_PYTHON','PREP_ONLY_SOURCE16_FINAL_CLOSED_WAITING_ROOT_EXACT_COMMITTED17_CANONICAL_THIRTEEN_STRICT_INSTALLS_SIX_ACTUAL_CACHE_PYTHON'],
 ['an exact16 canonical','an exact17 canonical'],
 ['Root must close source16 final reviews, commit an exact17 canonical','Source16 final closure is verified by Root; Root must commit an exact17 canonical'],
];
const changes=[];
for(const [from,to]of replacements){const occurrences=text.split(from).length-1;if(!occurrences)throw new Error('Expected copier metadata target absent: '+from);text=text.replaceAll(from,to);changes.push({from,to,occurrences});}
if(text.includes('__SOURCE_VERSION_LITERAL__')||text.includes('__CANDIDATE_VERSION_LITERAL__'))throw new Error('Unresolved copier literal');
const destination=path.join(root,'build-controls-prep-only-behavior-a.mjs');
fs.writeFileSync(destination,text,{flag:'wx'});
const provenance=path.join(root,'provenance');fs.mkdirSync(provenance,{recursive:true});
fs.writeFileSync(path.join(provenance,'source16-copier-original.mjs'),sourceBytes,{flag:'wx'});
const control={recordedAt:new Date().toISOString(),phase:'PREP_ONLY_COPIER_PREPARATION',sourceFile:source,sourceSha256:hash(sourceBytes),destinationFile:destination,destinationSha256:hash(Buffer.from(text)),changes,source16Modified:false,root17ExistingFilesModified:false,source16FinalClosure:{rootPack:'pack026',files:423,bytes:8272520,packets:7,inventorySha256:'9efdb1bc1292b5a6d2ee17fde90ec7b55b8503653d30f6c7cb2a1394ddc78bbe',rootSeal:'candidate026-final-seal',actualFreshSessions:10,actualCompleteTurns:19,independentOutcomes:{PASS:4,FAIL:4,UNKNOWN:2},source:'Root actual execution/seal confirmation'},modelInvoked:false,installationInvoked:false,frozenControlsCopied:false};
fs.writeFileSync(path.join(root,'copier-source-control.json'),JSON.stringify(control,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({destination,sha256:control.destinationSha256,substitutionCount:changes.length,source16Unchanged:hash(fs.readFileSync(source))===control.sourceSha256,model:false,installation:false},null,2));
