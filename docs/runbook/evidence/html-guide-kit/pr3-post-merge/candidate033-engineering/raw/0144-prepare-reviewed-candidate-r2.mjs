import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {createHash} from 'node:crypto';
const dir=path.dirname(fileURLToPath(import.meta.url));let s=fs.readFileSync(path.join(dir,'integrate-source33.mjs'),'utf8');
const a=s.indexOf('function verifyHistoricalProtection()'),b=s.indexOf('\nfunction baselineGuard()',a);if(a<0||b<a)throw Error('Exact protection function anchor missing');
const functionText=`function verifyHistoricalProtection(){
 const inventoryFile=path.join(ROOT,'control-copy-inventory.draft.json');
 assert.equal(pin(inventoryFile).sha256,'de22f0361cc452452b64df297a27d2a763df3d53d99dcd45d379b7bb62f833bc');
 const inventory=JSON.parse(text(inventoryFile));
 const groups=[['32',inventory.sourceProtectedPins,677],['31',inventory.source31ProtectedPins,472],['30',inventory.source30ProtectedPins,451],['29',inventory.source29ProtectedPins,362]];
 const normalize=p=>path.resolve(p).split(path.sep).join('/'),cmp=(x,y)=>x<y?-1:x>y?1:0;
 function walk(directory){return fs.readdirSync(directory,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(directory,e.name)):[path.join(directory,e.name)]);}
 return groups.map(([version,pins,count])=>{
  assert.equal(pins.length,count);
  const directory=path.resolve(ROOT,'../0-1-'+version);
  assert.deepEqual(walk(directory).map(normalize).sort(cmp),pins.map(p=>normalize(p.file)).sort(cmp));
  for(const p of pins){const actual=pin(p.file);assert.equal(actual.bytes,p.bytes);assert.equal(actual.sha256,p.sha256);}
  return{source:version,count,exactFileSetAndBytes:true,privateOnlyHashedNotParsed:true};
 });
}
`;
s=s.slice(0,a)+functionText+s.slice(b);
const anchor='baselineGuard();const freezeFile=';if(s.split(anchor).length!==2)throw Error('Exact initial guard anchor missing');
const controlGuard="for(const [file,expected] of [['CONTROLS_FINAL_FROZEN.json','ad191464c19549f8bc5ac2eaf0d9baafe1e3be1959a6b9ff587838b5a7bf5974'],['frozen-copy-inventory.json','4ca8a609333f387ed4e1ebfed2f5e5cb88b619ac936eb631be04b9ee2a0e9c7a'],['final-freeze-receipt.json','955787b661407d0cfc79476f0407115030435d7f14c3d1a86d45d9517606b5cf']])assert.equal(pin(path.join(ROOT,file)).sha256,expected);\n";
s=s.replace(anchor,controlGuard+anchor);
const output=path.join(dir,'integrate-source33-r2.mjs');fs.writeFileSync(output,s,{flag:'wx'});console.log(JSON.stringify({file:output,bytes:Buffer.byteLength(s),sha256:createHash('sha256').update(s).digest('hex'),originalCandidatePreserved:true,previewRun:false,repoWritten:false}));
