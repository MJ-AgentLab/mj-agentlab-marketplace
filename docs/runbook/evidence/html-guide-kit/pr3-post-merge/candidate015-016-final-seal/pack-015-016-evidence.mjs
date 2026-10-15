#!/usr/bin/env node
// External reviewer-only packer. dry-run never writes evidence into the repository.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {fileURLToPath} from "node:url";
import {TextDecoder} from "node:util";

const REVIEWER=path.dirname(fileURLToPath(import.meta.url));
const AUTHORIZED_REPO=path.resolve(REVIEWER,"../develop");
const EXPECTED_TARGET=path.resolve(REVIEWER,"../develop/docs/runbook/evidence/html-guide-kit/pr3-reviewer");
const ROOT_FILES=["archive-015-016-control.json"];
const ROOT_DIRS=["corrections/0-1-5","corrections/0-1-6","corrections/grade-import-015-016-20261013"];
const PINNED_SHA256={"corrections/0-1-5/blocking/frozen-spec.md":"4e690529dc0866daa9956411336d980b948e53ee2b73a25cea4dbb075614ea9d","corrections/0-1-5/blocking/harness.mjs":"a2a7089587831fffbd74f9af773c144a5fec7d23fef42c617d28a26123b42304","corrections/0-1-5/blocking/plan.json":"58857812c5f48cd3b7bddb58c94679d52f0c97f5b861998d8fd40b0b5cc538d2","corrections/0-1-5/continuous-supplement/frozen-spec.md":"4e690529dc0866daa9956411336d980b948e53ee2b73a25cea4dbb075614ea9d","corrections/0-1-5/continuous-supplement/harness.mjs":"712e77f9850241893ac25d86a5bd8a4d558c725c4dd2a271614098461af69645","corrections/0-1-5/continuous-supplement/plan.json":"af18c35badde6b55ba3134781823565f9688e14e3e51505ffb8760b05fb57cd9","corrections/0-1-5/expanded/frozen-spec.md":"4e690529dc0866daa9956411336d980b948e53ee2b73a25cea4dbb075614ea9d","corrections/0-1-5/expanded/harness.mjs":"712e77f9850241893ac25d86a5bd8a4d558c725c4dd2a271614098461af69645","corrections/0-1-5/expanded/plan.json":"bfd65542f1df9ac9a4af1bf45fa5f9a89750c4557e764eb28816f95f94930b04","corrections/0-1-5/expanded/repeated-plan.json":"0b97085cdf412893e267bda912776d371a36f58e6fec7cb15bc086989c081d23","corrections/0-1-6/blocking/frozen-spec.md":"4e690529dc0866daa9956411336d980b948e53ee2b73a25cea4dbb075614ea9d","corrections/0-1-6/blocking/harness.mjs":"a2a7089587831fffbd74f9af773c144a5fec7d23fef42c617d28a26123b42304","corrections/0-1-6/blocking/plan.json":"58857812c5f48cd3b7bddb58c94679d52f0c97f5b861998d8fd40b0b5cc538d2","corrections/0-1-6/continuous-supplement/frozen-spec.md":"4e690529dc0866daa9956411336d980b948e53ee2b73a25cea4dbb075614ea9d","corrections/0-1-6/continuous-supplement/harness.mjs":"712e77f9850241893ac25d86a5bd8a4d558c725c4dd2a271614098461af69645","corrections/0-1-6/continuous-supplement/plan.json":"af18c35badde6b55ba3134781823565f9688e14e3e51505ffb8760b05fb57cd9","corrections/0-1-6/expanded/frozen-spec.md":"4e690529dc0866daa9956411336d980b948e53ee2b73a25cea4dbb075614ea9d","corrections/0-1-6/expanded/harness.mjs":"712e77f9850241893ac25d86a5bd8a4d558c725c4dd2a271614098461af69645","corrections/0-1-6/expanded/plan.json":"bfd65542f1df9ac9a4af1bf45fa5f9a89750c4557e764eb28816f95f94930b04","corrections/0-1-6/expanded/repeated-plan.json":"0b97085cdf412893e267bda912776d371a36f58e6fec7cb15bc086989c081d23","corrections/grade-import-015-016-20261013/import.mjs":"9344459d54eb48283c1eabfbcf9bcc8e30606840d66216f7d29608e0624af500","corrections/grade-import-015-016-20261013/inspect-expanded.mjs":"246483ee3f4342e7d963e9d1143dc64564d04cbd8942981952af6db0be4e143b","corrections/grade-import-015-016-20261013/project-expanded.mjs":"7cff4b933606226160c98922c69becbeea0b6f295a0528b1026cd68a803adfca","corrections/grade-import-015-016-20261013/final-closure.mjs":"893fac096937bb6f151a6afa1122375d81beb74eb2e06ac86f38a3ac5e46ecde","corrections/0-1-5/blocking/reviews/B1.1-6f9c933c.json":"612abea8ffb5ecc1fce3a56925468dbb041cba66ed096e510134915321dd0319","corrections/0-1-5/blocking/reviews/B1.2-delayed-53ffe188.json":"f77574e21f7c50723043c5e685962adfff7b0b57e400705528668774f2647c1e","corrections/0-1-5/blocking/reviews/B6.1-f99b7397.json":"b172da0008f66ae4d665722f0a03bc16184a62793cfaa17592332f33fcf2d3c9","corrections/0-1-5/blocking/reviews/B6.2-compare-44e49ec7.json":"018a541cbc190077f247c1740ce8276eccece5293871773393a5d6030db9c8c6","corrections/0-1-5/blocking/reviews/B6.2-review-8de1385e.json":"bb038eee739030c7437bb212e2bd16d11862328533cceebf378593dc7ef1cace","corrections/0-1-5/blocking/reviews/B6.2-revise-32d3890c.json":"10040f0d0938dffcf691f5c1d438fa2bdd3cc6ba43cb5add6b55c7fe15f76a65","corrections/0-1-5/blocking/reviews/cross-ab34ba26/B3.1-review.json":"24768ff82622278e338f535dfee9436cacf8ff78ff9be718c7e1d3b35619e4ed","corrections/0-1-5/blocking/reviews/cross-ab34ba26/B3.2-review.json":"22a5ec459a6f93a3ebf01c3b6ed89682ae491136bd49f241ec3e5a5c73e119fe","corrections/0-1-5/blocking/reviews/cross-ab34ba26/B4.1-review.json":"13d036b9b3574eb8091899f686e0b25c5e68b5b00b2d264370fa64a9b6ef60a9","corrections/0-1-5/blocking/reviews/cross-ab34ba26/B4.2-review.json":"832ed1f532437303bf0370ee02b70985b6a17a65871ef1c1b0e4a3453a87a719","corrections/0-1-5/blocking/reviews/cross-ab34ba26/B5.1-review.json":"bdcf7b470c4c8633ab392494ad6c9a529880af1de3edb4b20f9d178988db0cf2","corrections/0-1-5/blocking/reviews/cross-ab34ba26/B5.2-review.json":"dce55cdcfb142fd95216027f417d2de6ea485e4e6e826ec2726faffbd2b06393","corrections/0-1-6/blocking/reviews/B1.1-3f292e34.json":"13ae0c20f275345faba33c3b1e15e4105afa79de42a0e387da636e0285b66833","corrections/0-1-6/blocking/reviews/B1.2-combined-279b1972.json":"e66f9c9029e7d86101865216c876a47ca006ea8336093e986f9d334c70d80eb9","corrections/0-1-6/blocking/reviews/B1.2-delayed-72f9672c.json":"6d1fddcb3d02e0c7d5c0a59c0570ea8c31009fa75ccdb855f34c16bccf66bf54","corrections/0-1-6/blocking/reviews/B2.1-40f32637.json":"5b5d9ab85106e63ace5f12b278575ad8b936b6199e674ebc3ac236de27217a93","corrections/0-1-6/blocking/reviews/B6.1-7f660cce.json":"a60fa514ed7d1958a53fdab4ca9fd0ea119012468081ed9e5893147fdcfe5118","corrections/0-1-6/blocking/reviews/B6.2-compare-e591808a.json":"a344c95f21739029dc91db4f61a8fc8af70d8bba57de3da3c16435f8ba8ce54f","corrections/0-1-6/blocking/reviews/B6.2-review-4d4dcfcf.json":"394c7d4e2bc3713ed2efba74986eb2fb77771f6e98c3f7071429595047183b48","corrections/0-1-6/blocking/reviews/B6.2-revise-f8909451.json":"d062222e4b065dbabd166dabb28787ce966c18db7e2eea9a77caedd2ae6802af","corrections/0-1-6/blocking/reviews/cross-4486b19e/B3.1-review.json":"53df60fae03ff21de089ee68f652b3f1dde3008b026c923719c99990361e6c4c","corrections/0-1-6/blocking/reviews/cross-4486b19e/B3.2-review.json":"9626c006ef26e68d0e8f5eaf19acc06e850edf811b91fa91b8dd3b43322a9155","corrections/0-1-6/blocking/reviews/cross-4486b19e/B4.1-review.json":"a46e52255a188d344f260a5aeed55af83e373aabf0a0f8510d522bd201b81a47","corrections/0-1-6/blocking/reviews/cross-4486b19e/B4.2-review.json":"47f9329ccba87e51935cb69ed710b3c6f2d806594617106bc633e7a59356e660","corrections/0-1-6/blocking/reviews/cross-4486b19e/B5.1-review.json":"9bad956332d94e556962f5a546288435a6acb4d76f9ebdbcdee4a2b8794d3026","corrections/0-1-6/blocking/reviews/cross-4486b19e/B5.2-review.json":"1848a6685a205e8f1673f2c66fd6135410d0bf66a07b0759b34f9432a86ceebe","corrections/0-1-6/continuous-supplement/reviews/E12-restart-e88e58ad.json":"82bd06f08643d349ba5aace0e86c453ff198a3e5b34f56cd5b1f2eeca00e799f","corrections/0-1-6/continuous-supplement/reviews/E7-post-confirmation-c4415f01.json":"d5ac1ef336abc3347556017a03f06b2878ed535e8e5ba67f3aad677e3c49d8b0","corrections/0-1-5/expanded/reviews/independent-3d2cb802-behavior-a/E1-maintainer-review.json":"53f3a6e5872b057eaeb41e3485d16d73d0dbec303cb305afcaf19fc03a9d59bb","corrections/0-1-5/expanded/reviews/independent-3d2cb802-behavior-a/E13-bilingual-review.json":"bf5861c3717c744a24121e1160a7083d08c796fdb3fddb7790fe8cef25fbce40","corrections/0-1-5/expanded/reviews/independent-3d2cb802-behavior-a/E13-review.json":"fd17836d9c02c5ff15137d8d652d3633642f0a4e674db548b68e7e283cfa1ae6","corrections/0-1-5/expanded/reviews/independent-3d2cb802-behavior-a/E9-recommended-review.json":"ab757b0a4ba13b9d0ff1bcc0f3584688450e879b2d494b9ac563b4290f4d17b9","corrections/0-1-6/expanded/reviews/independent-d8755d92-behavior-a/E1-maintainer-review.json":"636dbe2247caad2af2d42df236d8735e714f8fe9a356cc20aa2a29e05fe37143","corrections/0-1-6/expanded/reviews/independent-d8755d92-behavior-a/E13-bilingual-review.json":"35ec75534dad7b636d8bb8504d1f52cd76dda32725afda87f684529ed740a063","corrections/0-1-6/expanded/reviews/independent-d8755d92-behavior-a/E13-review.json":"dde05663a2ba1e36b27c37b9d2fb8adc8b1683ea1a6f0ce4e0ffbcc3ef8fa4aa","corrections/0-1-6/expanded/reviews/independent-d8755d92-behavior-a/E14-review-review.json":"584d28378e5300d1fb61ac88793b4e143f2a85e843a81d1bdcb0ce80db86446f","corrections/0-1-6/expanded/reviews/independent-d8755d92-behavior-a/E15-review.json":"9047562f97a559c4d780c630db3147dae11777b68be19c8a86e60314a5ab6737","corrections/0-1-6/expanded/reviews/independent-d8755d92-behavior-a/E9-recommended-review.json":"1b4ea0269321ed94fae6227ad663a2b0268b160dea68767ee0a3cc93ec85c1c7","corrections/0-1-5/expanded/reviews/independent-3d2cb802-behavior-a/E14-review-review.json":"956b7c923973a5d260af1877db010b8daa078cc47fed9401766aa7becc0d237c","corrections/0-1-5/expanded/reviews/independent-3d2cb802-behavior-a/E15-review.json":"f3bb54ec10153d5ea2a552e488d0e77a67d1a5f26618070eca7fa5e2a3bce30d","corrections/0-1-5/blocking/runs/223fcfa1-4814-4b46-9e49-ebb03cfa03af/batch.json":"2a86447ca82d5d623ee4c192c18d24fcf1633d08fabdaeddb807c0053073b355","corrections/0-1-5/blocking/runs/a53e2c35-a6ef-4507-aba9-04c777083b39/batch.json":"a8ff30fd6cacc255b115bcd59a6373c040e253f03135c364e1e8d540cb3d7fda","corrections/0-1-5/blocking/runs/ab34ba26-2131-427b-b8b8-1469a7ff5fe1/batch.json":"903e9e5a979c32c788dc000be547aca4ef4e892bd34773fbc17016adddfe4315","corrections/0-1-5/expanded/runs/3d2cb802-196c-4079-8375-fdd486c839d4/batch.json":"aaf33c93646c80bd4691e82c8a1bd46b5013d59d2410b96e3a23aca8ef58df45","corrections/0-1-6/blocking/runs/1fe389cb-724b-4d3a-b021-169e8721f7d5/batch.json":"d0c6e9a4cfab5c1ad6fb520cd0cf9ddea81e9de630d4f85cb1f7898b35b6f2e1","corrections/0-1-6/blocking/runs/43e67469-931b-4f23-84e0-3f974161785c/batch.json":"a4fff2a8230fa7b2f43ba4b1b2ff6752136fac2ddbfbaa23f908df058564194b","corrections/0-1-6/blocking/runs/4486b19e-e4cf-4102-bc88-9bef6fe066f4/batch.json":"4926359a8c5ecab9933c89a0f37f5a6125c5d88b4293140a29577e77fbc75767","corrections/0-1-6/expanded/runs/d8755d92-aa99-4612-9199-e2a354c2ebaa/batch.json":"dbb0dfefb53a913d7a23a59e8716e053894aeed70b39f4c9cd36830a998017e2","corrections/0-1-6/continuous-supplement/runs/0325f586-b818-49ac-869d-a903c7f38f7f/batch.json":"9669e7371dff8d2f9572311e4ea47caf4312a38227e5ea6322d601edaa243886","corrections/grade-import-015-016-20261013/final-phase-closure.json":"ea33c38c7210155f56f820ec15955eb059b713b8e2166dc37cb003299e0d3e59","corrections/grade-import-015-016-20261013/original-harness-and-summary-before.json":"f4b629127e2c82c1203d3ce1641dec39a6b6783f04e473b774d7653f0400dda6","corrections/grade-import-015-016-20261013/projection-map.json":"b6b9d0be3f25b77317b166c7e7554c2df3318e727dc636ee601cdd7999038ea4","corrections/grade-import-015-016-20261013/inventory-before.json":"67f72b8b7913e7c1855843304906c37650d097913bcc45cfe17f9904479e3505","corrections/grade-import-015-016-20261013/expanded-original-inventory.json":"eed7bd7f8510e2c81bf41482a93bb1e26b2dd1dc28f296ee68064cf7b3f86f5d","archive-015-016-control.json":"543be9289ff91ba93cc62c0d8e538bcffea856b397969c0240e98ae8ec43d990"};
const BLOCKED_DIRS=new Set([".git","node_modules","home","codex-home","codex_home","codexhome","sessions","auth","secrets","credentials","cache","plugins","tmp","temp","config"]);
const BLOCKED_FILE=/^(?:auth\.json|config\.toml|credentials(?:\.[^.]+)?|tokens?(?:\.[^.]+)?|\.env(?:\..*)?)$/i;
const DEFAULT_PACKET_LIMIT=2*1024*1024;
const hash=buffer=>crypto.createHash("sha256").update(buffer).digest("hex");
const posix=relative=>relative.split(path.sep).join("/");
const fail=(condition,message)=>{if(!condition)throw new Error(message);};
const serialize=value=>Buffer.from(JSON.stringify(value,null,2)+"\n","utf8");

function options(argv){
 const result={};
 for(let index=0;index<argv.length;index+=2){
  fail(argv[index]?.startsWith("--")&&argv[index+1]!==undefined,"flags require explicit values");
  const key=argv[index].slice(2);fail(!Object.hasOwn(result,key),`duplicate flag: ${key}`);result[key]=argv[index+1];
 }
 for(const key of Object.keys(result))fail(["target","snapshot-name","max-packet-bytes","final-reviewed","expected-inventory-sha256","compare-originals"].includes(key),`unsupported flag: ${key}`);
 return result;
}
function within(root,candidate,allowRoot=false){
 const base=path.resolve(root),absolute=path.resolve(candidate),relative=path.relative(base,absolute);
 fail((allowRoot&&relative==="")||(relative!==""&&relative!==".."&&!relative.startsWith(`..${path.sep}`)&&!path.isAbsolute(relative)),"path escapes designated root");
 return absolute;
}
function owned(root,relative){
 fail(typeof relative==="string"&&!path.isAbsolute(relative)&&!relative.includes("\\")&&relative.split("/").every(part=>part&&part!=="."&&part!==".."),"invalid evidence-relative path");
 let file=path.resolve(root);fail(!fs.lstatSync(file).isSymbolicLink(),"evidence root cannot be a link");
 for(const part of relative.split("/")){file=path.join(file,part);fail(!fs.lstatSync(file).isSymbolicLink(),`linked evidence is forbidden: ${relative}`);}
 within(fs.realpathSync.native(root),fs.realpathSync.native(file));
 return file;
}
function blocked(relative,isDirectory){
 const parts=relative.split("/");
 if(parts.slice(0,isDirectory?undefined:-1).some(part=>BLOCKED_DIRS.has(part.toLowerCase())))return true;
 return !isDirectory&&BLOCKED_FILE.test(parts.at(-1));
}
function sourceInventory(){
 fail(!fs.lstatSync(REVIEWER).isSymbolicLink(),"reviewer source root cannot be a link");
 const selected=[],excluded=[];
 const visit=relative=>{
  const file=owned(REVIEWER,relative),stat=fs.lstatSync(file);
  if(blocked(relative,stat.isDirectory())){excluded.push({relativeOriginalPath:relative,reason:"forbidden actual runtime/authentication/configuration location"});return;}
  if(stat.isDirectory())for(const name of fs.readdirSync(file).sort())visit(relative+"/"+name);
  else{fail(stat.isFile(),`evidence must be an ordinary file: ${relative}`);selected.push(relative);}
 };
 for(const relative of ROOT_FILES){fail(fs.existsSync(path.join(REVIEWER,relative)),`required reviewer source missing: ${relative}`);visit(relative);}
 for(const relative of ROOT_DIRS)visit(relative);
 const markOutOfScope=relative=>{
  if(ROOT_FILES.includes(relative)||ROOT_DIRS.includes(relative))return;
  if([...ROOT_FILES,...ROOT_DIRS].some(allowed=>allowed.startsWith(relative+"/"))){
   const directory=owned(REVIEWER,relative);fail(fs.statSync(directory).isDirectory(),"allowlist ancestor must be a directory");
   for(const name of fs.readdirSync(directory).sort())markOutOfScope(relative+"/"+name);
  }else excluded.push({relativeOriginalPath:relative,reason:"not in the authorized source allowlist"});
 };
 for(const name of fs.readdirSync(REVIEWER).sort())markOutOfScope(name);
 return {selected:selected.sort(),excluded};
}
function entryFromBuffer(relative,absolute,bytes){
 let encoding="utf8",content;
 try{content=new TextDecoder("utf-8",{fatal:true,ignoreBOM:true}).decode(bytes);if(!Buffer.from(content,"utf8").equals(bytes))throw new Error("non-lossless text decoding");}
 catch{encoding="base64";content=bytes.toString("base64");}
 const entry={relativeOriginalPath:relative,originalAbsolutePath:absolute,sha256:hash(bytes),bytes:bytes.length,encoding,content};
 fail(restore(entry).equals(bytes),`Buffer restoration mismatch: ${relative}`);
 return entry;
}
function restore(entry){
 fail(entry.encoding==="utf8"||entry.encoding==="base64","unsupported entry encoding");
 const bytes=Buffer.from(entry.content,entry.encoding);
 fail(bytes.length===entry.bytes&&hash(bytes)===entry.sha256,`entry hash/length mismatch: ${entry.relativeOriginalPath}`);
 return bytes;
}

// Pattern findings report rule/path/line only; matched values and excerpts are never returned.
const SECRET_PATTERNS=[
 ["bearer-token",/\bBearer[ \t]+[A-Za-z0-9._~-]{16,}/g],
 ["provider-api-key",/\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{20,}\b/g],
 ["github-token",/\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})\b/g],
 ["aws-access-key",/\bAKIA[0-9A-Z]{16}\b/g],
 ["jwt-token",/\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g],
 ["private-key",/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],
 ["credential-assignment",/["']?(?:access_token|refresh_token|id_token|OPENAI_API_KEY|api_key|client_secret|password)["']?\s*[:=]\s*["']([^"'\r\n]{8,})["']/gi],
];
const REDACTED=/^(?:\[REDACTED[^\]]*\]|<redacted>|redacted|null|none)$/i;
function secretScan(entry){
 const bytes=restore(entry),raw=entry.encoding==="utf8"?entry.content:bytes.toString("latin1"),findings=[];
 const seen=new Set();
 const scanText=(text,line=null)=>{
  for(const [rule,expression] of SECRET_PATTERNS){
   expression.lastIndex=0;
   for(const match of text.matchAll(expression)){
    if(rule==="credential-assignment"&&REDACTED.test(match[1]))continue;
    const located=line??(text.slice(0,match.index).match(/\n/g)?.length??0)+1,key=`${rule}:${located}`;
    if(!seen.has(key)){seen.add(key);findings.push({rule,relativeOriginalPath:entry.relativeOriginalPath,line:located});}
   }
  }
 };
 const walk=(value,line,depth=0)=>{
  if(depth>8)return;
  if(typeof value==="string"){
   scanText(value,line);
   if(/^[\s]*[\[{]/.test(value))try{walk(JSON.parse(value),line,depth+1);}catch{}
  }else if(value&&typeof value==="object")for(const item of Object.values(value))walk(item,line,depth+1);
 };
 scanText(raw);
 if(entry.encoding==="utf8"){
  try{walk(JSON.parse(raw),null);}catch{
   raw.split(/\r?\n/).forEach((line,index)=>{try{walk(JSON.parse(line),index+1);}catch{}});
  }
 }
 return findings;
}
function bucket(relative){
 const parts=relative.split("/");
 if(parts[0]==="runs"||parts[0]==="diagnostics")return parts.slice(0,2).join("/");
 return parts.length===1?"root-control":parts[0];
}
function packetize(entries,maximum){
 const groups=new Map();for(const entry of entries){const key=bucket(entry.relativeOriginalPath);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(entry);}
 const packets=[];
 for(const [scope,group] of groups){
  let current=[];
  const flush=()=>{if(!current.length)return;const part=packets.filter(packet=>packet.scope===scope).length+1;
   const document={schemaVersion:1,kind:"lossless-reviewer-packet",scope,entries:current},bytes=serialize(document);
   packets.push({scope,file:`packets/${scope.replaceAll("/","-")}-${String(part).padStart(3,"0")}.json`,document,buffer:bytes,oversized:bytes.length>maximum});current=[];
  };
  for(const entry of group){const proposed={schemaVersion:1,kind:"lossless-reviewer-packet",scope,entries:[...current,entry]};if(current.length&&serialize(proposed).length>maximum)flush();current.push(entry);}
  flush();
 }
 return packets;
}
function identityReferences(entries){
 return entries.filter(entry=>/(?:^|\/)runs\/[^/]+\/batch\.json$/.test(entry.relativeOriginalPath)).map(entry=>{
  const batch=JSON.parse(entry.content);
  return {runId:batch.runId,originalEvidence:entry.relativeOriginalPath,originalEvidenceSha256:entry.sha256,
   source:batch.source??null,mirror:{root:batch.mirror?.root??null,identity:batch.mirror?.identity??null,inventoryPointer:"/mirror/copied",exclusionsPointer:"/mirror/excluded",equalsCompleteCanonicalTree:"NOT_CLAIMED"},
   cache:{root:batch.cacheRoot??null,packageVersion:batch.packageVersion??null,runtimeInventorySha256:batch.runtimeInventorySha256??null},
   runtimeResourceCorrespondence:batch.runtime??[],grading:"Preserved exclusively in original batch/review evidence; this packer does not alter or derive verdicts."};
 });
}
function prepare(maximum,target){
 const inventory=sourceInventory(),snapshots=new Map(),entries=inventory.selected.map(relative=>{
  const absolute=owned(REVIEWER,relative),before=fs.statSync(absolute,{bigint:true}),bytes=fs.readFileSync(absolute),after=fs.statSync(absolute,{bigint:true});
  fail(before.size===after.size&&before.mtimeNs===after.mtimeNs,`source changed during read: ${relative}`);
  snapshots.set(relative,bytes);return entryFromBuffer(relative,absolute,bytes);
 });
 for(const [relative,expected] of Object.entries(PINNED_SHA256))fail(entries.find(entry=>entry.relativeOriginalPath===relative)?.sha256===expected,`pinned original-byte SHA-256 mismatch: ${relative}`);
 const findings=entries.flatMap(secretScan),packets=packetize(entries,maximum),identities=identityReferences(entries),mapping=[];
 for(const packet of packets){
  const decoded=JSON.parse(packet.buffer.toString("utf8"));
  decoded.entries.forEach((entry,index)=>{
   fail(restore(entry).equals(snapshots.get(entry.relativeOriginalPath)),`serialized Buffer restoration mismatch: ${entry.relativeOriginalPath}`);
   const {content,...metadata}=entry;mapping.push({...metadata,packet:packet.file,entryIndex:index,jsonPointer:`/entries/${index}`,lineLocator:"Decode content exactly; original 1-based JSONL/text lines are unchanged."});
  });
 }
 const inventorySha256=hash(Buffer.from(entries.map(entry=>`${entry.relativeOriginalPath}\0${entry.sha256}\0${entry.bytes}\n`).join(""),"utf8"));
 const index={schemaVersion:1,kind:"lossless-reviewer-evidence-index",sourceRoot:REVIEWER,targetScope:target,sourceInventorySha256:inventorySha256,fileCount:entries.length,originalBytes:entries.reduce((total,entry)=>total+entry.bytes,0),
  encodingPolicy:"Strict UTF-8 exact content; invalid UTF-8 encoded as base64; each restored Buffer and SHA-256 verified.",
  sourceAllowlist:{historyIncludes:"0.1.5 and 0.1.6 only; earlier sealed snapshots and current model batches remain separate",authority:"archive-015-016-control.json independently verified scope; final-phase-closure original grades and failures preserved",rootFiles:ROOT_FILES,rootDirectories:ROOT_DIRS,runIds:identities.map(identity=>identity.runId).sort(),runEvidence:identities.map(identity=>identity.originalEvidence).sort(),reviews:"all actual ordinary files within the authorized roots"},pinnedOriginalByteSha256:PINNED_SHA256,excluded:inventory.excluded,
  packets:packets.map(packet=>({file:packet.file,scope:packet.scope,bytes:packet.buffer.length,sha256:hash(packet.buffer),fileCount:packet.document.entries.length})),
  files:mapping,identityEvidence:"identities.json; source SHA/tree, reviewer mirror identity, installed cache and runtime hashes remain separate.",
  absolutePathRole:"Original absolute paths are historical source locators mapped to packet entries; no claim that those paths remain accessible on another machine.",
  citationResolution:"Find originalAbsolutePath or relativeOriginalPath in files; locate packet and entryIndex; Buffer.from(content, encoding) restores exact original bytes and original JSONL line numbers.",
  security:{scannedFiles:entries.length,findings:findings.length,matchedSecretValuesExcludedFromReport:true,authenticationActualFilesExcluded:true},
  verdictPolicy:"Original evidence and grades are opaque preserved content. No grade recomputation, editing, retroactive PASS, replay conversion, or full-tree equality claim."};
 return {inventory,entries,snapshots,findings,packets,index,identities};
}
function report(prepared,maximum){
 return {mode:"dry-run",sourceRoot:REVIEWER,target:prepared.index.targetScope,targetWritten:false,fileCount:prepared.index.fileCount,totalOriginalBytes:prepared.index.originalBytes,pinnedOriginalByteSha256:PINNED_SHA256,
  sourceInventorySha256:prepared.index.sourceInventorySha256,packetLimitBytes:maximum,packetCount:prepared.packets.length,totalPacketBytes:prepared.packets.reduce((total,packet)=>total+packet.buffer.length,0),
  largestOriginalFile:prepared.entries.reduce((largest,entry)=>entry.bytes>largest.bytes?{relativeOriginalPath:entry.relativeOriginalPath,bytes:entry.bytes}:largest,{relativeOriginalPath:null,bytes:0}),
  largestPacketBytes:Math.max(0,...prepared.packets.map(packet=>packet.buffer.length)),oversizedPackets:prepared.packets.filter(packet=>packet.oversized).map(packet=>({file:packet.file,bytes:packet.buffer.length})),
  encodingCounts:{utf8:prepared.entries.filter(entry=>entry.encoding==="utf8").length,base64:prepared.entries.filter(entry=>entry.encoding==="base64").length},
  exactBufferRoundTrips:prepared.entries.length,sourceGroups:prepared.packets.map(packet=>({file:packet.file,fileCount:packet.document.entries.length,bytes:packet.buffer.length})),
  excluded:prepared.inventory.excluded,secretPatternScan:{status:prepared.findings.length?"BLOCKED_FINDINGS":"NO_PATTERN_FINDINGS",scannedFiles:prepared.entries.length,findings:prepared.findings,secretValuesPrinted:false},
  finalCopyGate:"pack requires --final-reviewed true and the exact final --expected-inventory-sha256; no existing target may be overwritten."};
}
function unchanged(prepared){
 const latest=sourceInventory();fail(JSON.stringify(latest.selected)===JSON.stringify(prepared.inventory.selected),"source file inventory changed after snapshot");
 for(const entry of prepared.entries)fail(fs.readFileSync(owned(REVIEWER,entry.relativeOriginalPath)).equals(prepared.snapshots.get(entry.relativeOriginalPath)),`source bytes changed after snapshot: ${entry.relativeOriginalPath}`);
}
function verify(target,compareOriginals=false){
 const index=JSON.parse(fs.readFileSync(owned(target,"index.json"),"utf8")),mapped=new Map(index.files.map(entry=>[entry.relativeOriginalPath,entry]));
 fail(index.files.length===index.fileCount&&mapped.size===index.fileCount,"duplicate or missing file mappings in index");
 for(const [relative,expected] of Object.entries(index.pinnedOriginalByteSha256??{}))fail(mapped.get(relative)?.sha256===expected,`pinned index SHA-256 mismatch: ${relative}`);
 const identityBytes=fs.readFileSync(owned(target,"identities.json"));
 fail(hash(identityBytes)===index.identityEvidenceSha256,"identity evidence hash mismatch");JSON.parse(identityBytes.toString("utf8"));
 let files=0,bytes=0;const seen=new Set();
 for(const packet of index.packets){
  const raw=fs.readFileSync(owned(target,packet.file));fail(raw.length===packet.bytes&&hash(raw)===packet.sha256,`packet hash mismatch: ${packet.file}`);
  const document=JSON.parse(raw.toString("utf8"));fail(document.entries.length===packet.fileCount,`packet count mismatch: ${packet.file}`);
  document.entries.forEach((entry,entryIndex)=>{
   fail(!seen.has(entry.relativeOriginalPath),"duplicate original evidence mapping");seen.add(entry.relativeOriginalPath);
   const row=mapped.get(entry.relativeOriginalPath);fail(row&&row.packet===packet.file&&row.entryIndex===entryIndex&&row.sha256===entry.sha256&&row.bytes===entry.bytes&&row.encoding===entry.encoding&&row.originalAbsolutePath===entry.originalAbsolutePath,"index-to-packet mapping mismatch");
   const restored=restore(entry);if(compareOriginals)fail(restored.equals(fs.readFileSync(owned(REVIEWER,entry.relativeOriginalPath))),`original comparison mismatch: ${entry.relativeOriginalPath}`);files++;bytes+=restored.length;
  });
 }
 fail(files===index.fileCount&&bytes===index.originalBytes&&seen.size===mapped.size,"complete restoration count mismatch");
 const inventorySha256=hash(Buffer.from([...index.files].sort((a,b)=>a.relativeOriginalPath<b.relativeOriginalPath?-1:a.relativeOriginalPath>b.relativeOriginalPath?1:0).map(entry=>`${entry.relativeOriginalPath}\0${entry.sha256}\0${entry.bytes}\n`).join(""),"utf8"));
 fail(inventorySha256===index.sourceInventorySha256,"source inventory hash mismatch");
 return {mode:"verify",target,files,originalBytes:bytes,allPacketHashesVerified:true,allOriginalFileHashesVerified:true,identityEvidenceHashVerified:true,sourceBytesCompared:compareOriginals};
}
function selfTest(){
 const samples=[Buffer.from("a \t\r\nb\n\n\"quoted\"\\path\u0000中文😀\n","utf8"),Buffer.from([0xef,0xbb,0xbf,0x78,0x0d,0x0a]),Buffer.from([0xff,0xc0,0x00,0x80])];
 for(const [index,bytes] of samples.entries()){const entry=entryFromBuffer(`test-${index}.txt`,"synthetic-memory-only",bytes),serialized=JSON.parse(serialize({entries:[entry]}).toString("utf8"));fail(restore(serialized.entries[0]).equals(bytes),"self-test roundtrip failed");}
 fail(entryFromBuffer("invalid.txt","synthetic-memory-only",samples[2]).encoding==="base64","invalid UTF-8 must use base64");
 const synthetic=entryFromBuffer("synthetic.txt","synthetic-memory-only",Buffer.from('access_token="synthetic-only-value-123456789"\n'));
 fail(secretScan(synthetic).some(finding=>finding.rule==="credential-assignment"),"assignment scan self-test failed");
 const redacted=entryFromBuffer("redacted.txt","synthetic-memory-only",Buffer.from('access_token="[REDACTED_AUTH]"\nBearer [REDACTED_AUTH]\n'));
 fail(secretScan(redacted).length===0,"redacted placeholders must not be flagged");
 return {mode:"self-test",inMemoryOnly:true,utf8AndBomAndInvalidUtf8Restoration:"PASS",secretPatternDetection:"PASS",filesystemCopies:0};
}
function main(){
 const [mode="dry-run",...argv]=process.argv.slice(2),args=options(argv);
 fail(!args["snapshot-name"]||/^[a-z][a-z0-9-]{0,39}$/.test(args["snapshot-name"]),"snapshot name must be a short lowercase directory name");
 const expectedTarget=args["snapshot-name"]?path.join(EXPECTED_TARGET,args["snapshot-name"]):EXPECTED_TARGET,target=path.resolve(args.target??expectedTarget);
 fail(target===expectedTarget,"target must be the authorized PR3 reviewer evidence directory or its named new snapshot");
 if(mode==="self-test"){console.log(JSON.stringify(selfTest(),null,2));return;}
 if(mode==="verify"){console.log(JSON.stringify(verify(target,args["compare-originals"]==="true"),null,2));return;}
 fail(mode==="dry-run"||mode==="pack","supported modes: dry-run, self-test, pack, verify");
 const maximum=Number(args["max-packet-bytes"]??DEFAULT_PACKET_LIMIT);fail(Number.isSafeInteger(maximum)&&maximum>=65536&&maximum<=16*1024*1024,"packet limit must be 64 KiB through 16 MiB");
 if(mode==="pack"){
  fail(args["final-reviewed"]==="true","final review completion must be explicitly supplied before copying");
  fail(/^[a-f0-9]{64}$/.test(args["expected-inventory-sha256"]??""),"pack requires the final dry-run inventory SHA-256");
  fail(!fs.existsSync(target),"target already exists; no overwrite is permitted");
 }
 const prepared=prepare(maximum,target),dry=report(prepared,maximum);
 if(mode==="dry-run"){console.log(JSON.stringify(dry,null,2));if(prepared.findings.length||dry.oversizedPackets.length)process.exitCode=1;return;}
 fail(prepared.findings.length===0,"secret pattern findings block copying; inspect sanitized dry-run findings");
 fail(!dry.oversizedPackets.length,"oversized packet entries block copying; choose an explicit suitable packet limit");
 fail(prepared.index.sourceInventorySha256===args["expected-inventory-sha256"],"source differs from the expected final dry-run snapshot");unchanged(prepared);
 // The only mutating path is gated above; every destination is new and written with wx.
 const parent=path.dirname(target);fail(fs.existsSync(parent)&&fs.statSync(parent).isDirectory(),"authorized evidence parent must already exist");
 within(AUTHORIZED_REPO,parent);let ancestor=parent;
 while(true){fail(!fs.lstatSync(ancestor).isSymbolicLink(),"target ancestor cannot be a reparse link");if(ancestor===AUTHORIZED_REPO)break;ancestor=path.dirname(ancestor);}
 within(fs.realpathSync.native(AUTHORIZED_REPO),fs.realpathSync.native(parent));
 fs.mkdirSync(target);fs.mkdirSync(within(target,path.join(target,"packets")));
 for(const packet of prepared.packets)fs.writeFileSync(within(target,path.join(target,packet.file)),packet.buffer,{flag:"wx"});
 const identityBytes=serialize({schemaVersion:1,runIdentities:prepared.identities});prepared.index.identityEvidenceSha256=hash(identityBytes);
 fs.writeFileSync(within(target,path.join(target,"identities.json")),identityBytes,{flag:"wx"});
 fs.writeFileSync(within(target,path.join(target,"index.json")),serialize(prepared.index),{flag:"wx"});
 console.log(JSON.stringify({...verify(target,true),mode:"pack",target,sourceInventorySha256:prepared.index.sourceInventorySha256,packetCount:prepared.packets.length},null,2));
}
try{main();}catch(error){console.error(JSON.stringify({error:String(error.message),secretValuesPrinted:false}));process.exitCode=1;}
