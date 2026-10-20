import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root=path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/,'$1'));
const phase=process.argv[2]||'terminal';
const repo='MJ-AgentLab/mj-agentlab-marketplace';
const jobs=['39363773472','39363755336'].flatMap(runId=>JSON.parse(fs.readFileSync(path.join(root,phase,`jobs-${runId}.stdout.raw`))).jobs.map(j=>({...j,runId:Number(runId)})));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const results=jobs.filter(j=>j.name.startsWith('Baseline compat')).map(j=>{
 const file=`downloads/job-${j.id}.stdout.raw`,full=path.join(root,file);
 if(!fs.existsSync(full))return{id:j.id,runId:j.runId,name:j.name,status:j.status,conclusion:j.conclusion,logAvailable:false};
 const bytes=fs.readFileSync(full),rawLines=bytes.toString('utf8').split(/\r?\n/),lines=rawLines.map(l=>l.replace(/^\d{4}-\d\d-\d\dT\S+Z /,''));
 const rows=lines.map((text,i)=>({line:i+1,text}));
 const totals=Object.fromEntries(lines.filter(l=>/^# (tests|suites|pass|fail|cancelled|skipped|todo) \d+$/.test(l)).map(l=>{const [,k,v]=l.match(/^# (\S+) (\d+)$/);return[k,Number(v)]}));
 const skipped=rows.filter(r=>/^ok \d+ .*# SKIP/.test(r.text));
 const failed=rows.filter(r=>/^not ok \d+ /.test(r.text));
 const marker=lines.findIndex(l=>l.includes('> node scripts/smoke-codex-plugin.mjs'));
 let smoke=null,smokeLocation=null,parseErrors=[];
 if(marker>=0){
  for(let i=marker+1;i<lines.length;i++){
   if(lines[i]!=='{')continue;
   for(let end=i+1;end<lines.length;end++){
    if(lines[end]!=='}')continue;
    try {const possible=JSON.parse(lines.slice(i,end+1).join('\n'));if(Array.isArray(possible.scenarios)){smoke=possible;smokeLocation={firstLine:i+1,lastLine:end+1};break;}}catch(e){parseErrors.push({firstLine:i+1,lastLine:end+1,error:String(e)})}
   }if(smoke)break;
  }
 }
 const commands=smoke?.scenarios.flatMap(s=>s.commands)||[];
 const site=smoke?.scenarios.filter(s=>s.siteValidation).map((s,index)=>({index,installed:s.installed,rendered:s.siteValidation.rendered,staticSummary:s.siteValidation.checked.summary,staticStatus:s.siteValidation.checked.status,browserCheck:s.siteValidation.browserCheck}))||[];
 const diagram=smoke?.scenarios.filter(s=>s.diagramValidation).map(s=>({installed:s.installed,output:s.diagramValidation.output,commands:s.commands.filter(c=>c.args?.includes(s.diagramValidation.validatorPath))}))||[];
 const learning=smoke?.scenarios.filter(s=>s.learningEvidenceValidation).map(s=>({installed:s.installed,interpreter:s.learningEvidenceValidation.interpreter,saveStatus:s.learningEvidenceValidation.saveStatus,replayIdentical:s.learningEvidenceValidation.replayIdentical,structurallyValid:s.learningEvidenceValidation.structurallyValid,commands:s.commands.filter(c=>c.args?.includes(s.learningEvidenceValidation.entry))}))||[];
 const checkout=rows.filter(r=>r.text.includes(' log -1 --format=%H')).map(r=>({commandLine:r.line,shaLine:r.line+1,sha:lines[r.line]}));
 const result={id:j.id,runId:j.runId,name:j.name,status:j.status,conclusion:j.conclusion,started_at:j.started_at,completed_at:j.completed_at,raw:{path:file,bytes:bytes.length,sha256:hash(bytes)},totals,skipped,failed,checkout,steps:j.steps.map(s=>({number:s.number,name:s.name,status:s.status,conclusion:s.conclusion})),smoke:smoke?{ok:smoke.ok,version:smoke.version,scenarios:smoke.scenarios.length,allScenariosOk:smoke.scenarios.every(s=>s.ok===true),commands:commands.length,allCommandStatusZero:commands.every(c=>c.status===0),nonzeroCommands:commands.filter(c=>c.status!==0),diagramActualExecutions:diagram.length,diagram,learningScenarioCount:learning.length,learningActualExecutions:learning.length*3,learning,siteGenerationExecutions:site.length,siteStaticExecutions:site.length,site,source:'Full emitted scenarios JSON, scenarios counted once; repeated top-level final scenario excluded',location:smokeLocation,cleanupEvidence:'See cleanup-independent: default smoke successful code path removes 13 scenario roots and one prepared template. Log has no explicit per-root post-removal absence receipt; do not claim OS-wide cleanup or a new physical absence audit.'}:null,parseErrors};
 if(smoke)fs.writeFileSync(path.join(root,`job-${j.id}.smoke.json`),JSON.stringify(smoke,null,2)+'\n');return result;
});fs.writeFileSync(path.join(root,'matrix-analysis.json'),JSON.stringify({phase,analyzedAt:new Date().toISOString(),results},null,2)+'\n');
console.log(JSON.stringify(results.map(r=>({id:r.id,runId:r.runId,name:r.name,conclusion:r.conclusion,totals:r.totals,skipped:r.skipped,failed:r.failed,checkout:r.checkout,smoke:r.smoke&&{scenarios:r.smoke.scenarios,commands:r.smoke.commands,diagram:r.smoke.diagramActualExecutions,learning:r.smoke.learningActualExecutions,gen:r.smoke.siteGenerationExecutions,static:r.smoke.site.map(s=>s.staticSummary),all0:r.smoke.allCommandStatusZero},parseErrors:r.parseErrors})),null,2));
