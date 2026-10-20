import fs from'node:fs';import path from'node:path';
const root=path.resolve(process.argv[2]),source=path.resolve(process.argv[3]);
for(const file of['verify-canonical.mjs','verify-terminal.mjs']){
 let text=fs.readFileSync(path.join(source,file),'utf8').replaceAll('e3dc40f734fc972e05956da3e908091e09963675','4d10a0677c745eccb2775f7ae6176f8e2b1d2387').replaceAll('ae121f6b256d1a44ea05a06061ba025b605655d9','db49629fe767d3584f6ce772ef7bf5cdb52094e1').replaceAll('pr279','pr280').replace(/\b279\b/g,'280').replace(/\bmain\b/g,'develop').replaceAll('from f906','from 4d10');
 fs.writeFileSync(path.join(root,file),text);
}
console.log('Prepared method-only wrappers for new actual develop merge 4d10; no prior result inputs.');
