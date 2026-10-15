import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const dir=path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1'));
const sha=b=>createHash('sha256').update(b).digest('hex');
const checks={};
for(const name of ['quick','docs65','strict','check147','full346']){
 const result=JSON.parse(fs.readFileSync(path.join(dir,name+'.result.json')));
 const stdout=fs.readFileSync(path.join(dir,name+'.stdout.txt'),'utf8');
 checks[name]={...result,validCompleted:!result.error&&result.exit?.code===0&&result.close?.code===0};
 if(['docs65','full346'].includes(name)){
  const values={};for(const key of ['tests','pass','fail','cancelled','skipped','todo','duration_ms'])values[key]=Number(new RegExp('^# '+key+' ([0-9.]+)$','m').exec(stdout)?.[1]??NaN);
  checks[name].reported=values;
  if(values.fail!==0||values.cancelled!==0||values.skipped!==0||values.todo!==0||values.tests!==(name==='docs65'?65:346)||values.pass!==values.tests)checks[name].validCompleted=false;
 }
}
const pins=[];for(const name of fs.readdirSync(dir).sort()){const p=path.join(dir,name);if(!fs.statSync(p).isFile())continue;const b=fs.readFileSync(p);pins.push({relative:name,bytes:b.length,sha256:sha(b)});}
if(!process.argv[2])throw new Error('Original outer completion chunk is required');
const summary={recordedAt:new Date().toISOString(),baseline:'70ec2870a5c049f292c7fc4ddaaf185bd5be87cf',plugin:'html-guide-kit',version:'0.1.31',status:Object.values(checks).every(r=>r.validCompleted)?'WORKING_CANDIDATE_ENGINEERING_PASS':'WORKING_CANDIDATE_ENGINEERING_INCOMPLETE_OR_FAIL',checks,outerTools:{eof:{initial:'8f47ed',exit:0},fast:{initial:'6d1d3e',exit:0},full:{initial:'f0fee3',sessionId:10223,completion:process.argv[2],polls:['732a8b','62b3bb','941d34','f89ebf','b66b43']}},scope:{installation:'NOT_RUN',model:'NOT_RUN',client:'NOT_RUN',effect:'NOT_RUN',gitMutation:'NOT_RUN'},pins};
fs.writeFileSync(path.join(dir,'engineering-summary.json'),JSON.stringify(summary,null,2)+'\n',{flag:'wx'});
process.stdout.write(JSON.stringify({status:summary.status,checks:Object.fromEntries(Object.entries(checks).map(([k,r])=>[k,{validCompleted:r.validCompleted,reported:r.reported??null,exit:r.exit,close:r.close}])),summarySha256:sha(fs.readFileSync(path.join(dir,'engineering-summary.json')))}));
