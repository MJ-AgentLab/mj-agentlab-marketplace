import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL, fileURLToPath } from 'node:url';

const CONTROL_ROOT=path.dirname(fileURLToPath(import.meta.url));
const REPO=path.resolve(CONTROL_ROOT,'../../develop');
const MERGE='d106e76651d53cdf3f0cef2bb33ce47e8d7fda38';
const CANDIDATE='72cdd08';
const BEHAVIOR='1cd0f1c2a9395fd192260d06778e8489182516a8';
const EXPECTED_TREE='238d428b740d66069705a6208c17619cf97e338d';
const [mode,...args]=process.argv.slice(2);
if(!['checks','facts','canonical'].includes(mode)||args.length!==1||!/^[a-z0-9-]+$/.test(args[0]))throw new Error('Use checks|facts|canonical and an evidence directory basename');
const OUT=path.join(CONTROL_ROOT,args[0]);
if(!fs.existsSync(OUT))fs.mkdirSync(OUT);
const {spawnCli}=await import(pathToFileURL(path.join(REPO,'scripts/run-cli.mjs')));
const sha256=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const save=(name,value)=>fs.writeFileSync(path.join(OUT,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
const emit=value=>console.log(JSON.stringify(value));
const PYTHON='C:/Users/Admin/AppData/Roaming/uv/python/cpython-3.12-windows-x86_64-none';
const taskEnv={...process.env,PATH:PYTHON+path.delimiter+process.env.PATH,REQUIRE_PYTHON:'1',REQUIRE_PWSH:'1'};

async function capture(label,command,argv,{cwd=REPO,env=taskEnv,timeout=600000,persist=true}={}){
 const startedAt=new Date().toISOString();
 const result=await new Promise(resolve=>{
  const stdout=[],stderr=[];let error=null,timedOut=false;
  const child=spawnCli(command,argv,{cwd,env,stdio:['pipe','pipe','pipe'],windowsHide:true});
  child.stdout.on('data',chunk=>stdout.push(chunk));child.stderr.on('data',chunk=>stderr.push(chunk));
  child.on('error',value=>{error=String(value.message);});
  const timer=setTimeout(()=>{timedOut=true;child.kill();},timeout);
  child.on('close',(status,signal)=>{clearTimeout(timer);resolve({command,args:argv,cwd,startedAt,endedAt:new Date().toISOString(),status,signal,error,timedOut,stdout:Buffer.concat(stdout),stderr:Buffer.concat(stderr)});});
  child.stdin.end();
 });
 if(persist){
  fs.writeFileSync(path.join(OUT,`${label}.stdout.log`),result.stdout,{flag:'wx'});
  fs.writeFileSync(path.join(OUT,`${label}.stderr.log`),result.stderr,{flag:'wx'});
  const {stdout,stderr,...metadata}=result;
  save(`${label}.command.json`,{...metadata,forcedGates:{REQUIRE_PYTHON:'1',REQUIRE_PWSH:'1'},stdoutBytes:stdout.length,stdoutSha256:sha256(stdout),stderrBytes:stderr.length,stderrSha256:sha256(stderr)});
 }
 return result;
}
const text=result=>result.stdout.toString('utf8').trim();
const requireSuccess=result=>{if(result.status!==0||result.error||result.timedOut)throw new Error(`Command failed: ${result.command}, status=${result.status}, error=${result.error}`);return result;};
const git=(label,argv,persist=true)=>capture(label,'git',argv,{persist,timeout:60000});
const blob=(ref,file)=>git('blob',['show',`${ref}:${file}`],false).then(requireSuccess).then(result=>result.stdout);

async function checks(){
 const head=text(requireSuccess(await git('checks-head',['rev-parse','HEAD'])));
 if(head!==MERGE)throw new Error('Acceptance checkout HEAD is not the delegated actual merge');
 const before=await git('checks-working-state-before',['status','--porcelain=v1']);requireSuccess(before);
 const probes=[];
 for(const [name,argv] of [['node',['--version']],['npm',['--version']],['codex',['--version']],['pwsh',['-NoProfile','-Command','$PSVersionTable.PSVersion.ToString()']],['python',['--version']]]){
  const result=requireSuccess(await capture(`probe-${name}`,name,argv,{timeout:30000}));probes.push({command:name,status:result.status,stdout:text(result),stderr:result.stderr.toString('utf8')});
 }
 const results=[];
 for(const [label,argv] of [['npm-test',['test']],['npm-validate',['run','validate']],['npm-check',['run','check']]]){
  emit({stage:label,state:'running',out:OUT});
  const result=await capture(label,'npm',argv);
  const body=result.stdout.toString('utf8'),totals=Object.fromEntries(['tests','pass','fail','skipped'].map(key=>[key,Number(body.match(new RegExp(`# ${key} (\\d+)`))?.[1]??NaN)]));
  results.push({stage:label,status:result.status,error:result.error,timedOut:result.timedOut,...(label==='npm-test'?{totals}:{})});
  emit({stage:label,state:'complete',status:result.status,...(label==='npm-test'?{totals}:{})});
 }
 let canonical=null,canonicalError=null;
 emit({stage:'canonical-npm-smoke',state:'running',canonicalSha:MERGE,out:OUT});
 try{
  const {verifyReleaseInstall}=await import(pathToFileURL(path.join(REPO,'scripts/release-verify-install.mjs')));
  const {validateRepository}=await import(pathToFileURL(path.join(REPO,'scripts/validate-portable.mjs')));
  canonical=await verifyReleaseInstall({canonicalSha:MERGE,repoRoot:REPO,install:async({repoRoot})=>{
   const canonicalHead=text(requireSuccess(await git('canonical-head',['-C',repoRoot,'rev-parse','HEAD'])));
   const canonicalTree=text(requireSuccess(await git('canonical-tree',['-C',repoRoot,'rev-parse','HEAD^{tree}'])));
   const validation=validateRepository(repoRoot);save('canonical-validation.json',{canonicalSha:canonicalHead,canonicalTree,...validation});
   if(canonicalHead!==MERGE||canonicalTree!==EXPECTED_TREE||!validation.ok)throw new Error('Canonical identity or strict validation mismatch');
   const result=requireSuccess(await capture('canonical-npm-smoke','npm',['run','smoke'],{cwd:repoRoot,timeout:600000}));
   const body=result.stdout.toString('utf8'),start=body.indexOf('{\n'),json=JSON.parse(body.slice(start));
   save('canonical-installation.json',{canonicalSha:canonicalHead,canonicalTree,...json});return json;
  }});
 }catch(error){canonicalError=String(error.message);save('canonical-failure.json',{canonicalSha:MERGE,error:canonicalError});}
 emit({stage:'canonical-npm-smoke',state:'complete',ok:canonical?.ok??false,error:canonicalError,scenarios:canonical?.scenarios?.length,pythonRuns:canonical?.scenarios?.filter(s=>s.diagramValidation).length});
 const after=await git('checks-working-state-after',['status','--porcelain=v1']);requireSuccess(after);
 const summary={canonicalSha:MERGE,canonicalTree:EXPECTED_TREE,probes,forcedGates:{REQUIRE_PYTHON:'1',REQUIRE_PWSH:'1'},results,canonical:{ok:canonical?.ok??false,error:canonicalError,scenarios:canonical?.scenarios?.map(s=>({installed:s.installed,outside:s.outside,repository:s.repository,nativeOutside:s.nativeOutside,nativeRepository:s.nativeRepository,explicitOnly:s.explicitOnly,pythonExecuted:Boolean(s.diagramValidation),pythonEvidence:s.diagramValidation??null}))??[]},workingStateUnchanged:before.stdout.equals(after.stdout),sourceReviewerEvidenceNotRegraded:true};
 save('checks-summary.json',summary);emit({summary:path.join(OUT,'checks-summary.json'),allCommandsSuccessful:results.every(r=>r.status===0)&&canonical?.ok===true,workingStateUnchanged:summary.workingStateUnchanged});
 if(!results.every(r=>r.status===0)||canonical?.ok!==true)process.exitCode=1;
}

async function facts(){
 const candidate=text(requireSuccess(await git('candidate-head',['rev-parse',CANDIDATE]))),revisions=[MERGE,candidate,BEHAVIOR];
 const trees=[];for(const revision of revisions)trees.push({sha:revision,tree:text(requireSuccess(await git(`tree-${revision.slice(0,8)}`,['rev-parse',`${revision}^{tree}`])))});
 if(trees[0].tree!==EXPECTED_TREE||trees[1].tree!==EXPECTED_TREE)throw new Error('Actual merge and final candidate trees differ from delegated identity');
 const lists=[];for(const revision of revisions)lists.push(text(requireSuccess(await git(`files-${revision.slice(0,8)}`,['ls-tree','-r','--name-only',revision,'plugins']))).split(/\r?\n/));
 if(lists.some(list=>JSON.stringify(list)!==JSON.stringify(lists[0])))throw new Error('Plugin distribution paths differ between tested, candidate and merge');
 const files=[];
 for(const file of lists[0]){
  const resources=[];for(const revision of revisions){const bytes=await blob(revision,file);resources.push({sha:revision,bytes:bytes.length,sha256:sha256(bytes)});}
  const identical=resources.every(resource=>resource.bytes===resources[0].bytes&&resource.sha256===resources[0].sha256);
  files.push({path:file,identical,...Object.fromEntries(resources.map((resource,index)=>[['merge','finalCandidate','behaviorCandidate'][index],resource]))});
 }
 if(files.length!==62||files.some(file=>!file.identical))throw new Error('Full 62-file plugin distribution equality failed');
 const version=(await blob(MERGE,'VERSION')).toString('utf8').trim(),plugins=[];
 for(const plugin of ['diagram-kit','understanding-kit','explain-kit','html-guide-kit']){const manifest=JSON.parse((await blob(MERGE,`plugins/${plugin}/plugin.json`)).toString('utf8'));plugins.push({name:manifest.name,version:manifest.version,capabilities:manifest.capabilities??null});}
 const remote=requireSuccess(await git('remote-heads-and-tags',['ls-remote','origin','refs/heads/main','refs/heads/develop','refs/tags/v8.1.1','refs/tags/v8.1.1^{}','refs/tags/v8.1.2','refs/tags/v8.1.2^{}']));
 const branch=text(remote).split(/\r?\n/).map(line=>{const [sha,ref]=line.split(/\s+/);return {sha,ref};});
 const mainSha=branch.find(item=>item.ref==='refs/heads/main')?.sha;
 let mainVersion=null;if(mainSha)mainVersion=(await blob(mainSha,'VERSION')).toString('utf8').trim();
 const api={};
 for(const [label,endpoint] of [['github-latest-release','releases/latest'],['github-releases','releases?per_page=100'],['github-pr226','pulls/226'],['github-pr226-reviews','pulls/226/reviews?per_page=100']]){
  const result=await capture(label,'gh',['api',`repos/MJ-AgentLab/mj-agentlab-marketplace/${endpoint}`],{timeout:60000});
  api[label]={status:result.status};if(result.status===0)api[label].body=JSON.parse(result.stdout.toString('utf8'));
 }
 const inventory={canonicalSha:MERGE,finalCandidateSha:candidate,behaviorCandidateSha:BEHAVIOR,trees,fileCount:files.length,fullPluginDistributionIdentical:true,files};save('plugin-distribution-inventory.json',inventory);
 const releases=api['github-releases'].body??[],latest=api['github-latest-release'].body,pr=api['github-pr226'].body,reviews=api['github-pr226-reviews'].body;
 const summary={observedAt:new Date().toISOString(),canonicalSha:MERGE,canonicalTree:trees[0].tree,finalCandidateSha:candidate,finalCandidateTree:trees[1].tree,behaviorCandidateSha:BEHAVIOR,behaviorCandidateTree:trees[2].tree,pluginFileCount:files.length,pluginByteHashesIdentical:true,marketplaceVersion:version,plugins,remote:branch,main:{sha:mainSha,version:mainVersion},latestRelease:latest?{tag:latest.tag_name,published_at:latest.published_at,draft:latest.draft,prerelease:latest.prerelease,target_commitish:latest.target_commitish,immutable:latest.immutable,url:latest.html_url}:null,release812Exists:releases.some(release=>release.tag_name==='v8.1.2'),pr226:pr?{state:pr.state,merged:pr.merged,merge_commit_sha:pr.merge_commit_sha,head_sha:pr.head.sha,base:pr.base.ref}:null,pr226Reviews:{status:api['github-pr226-reviews'].status,count:Array.isArray(reviews)?reviews.length:null,actualRawEvidence:'github-pr226-reviews.stdout.log',interpretation:'Observed records only; absent independent GitHub review is not retrospectively PASS.'},apiStatuses:Object.fromEntries(Object.entries(api).map(([label,result])=>[label,result.status])),reviewerVerdictsRecomputed:false};
 save('facts-summary.json',summary);emit(summary);
}

async function canonicalRedo(){
 const {verifyReleaseInstall}=await import(pathToFileURL(path.join(REPO,'scripts/release-verify-install.mjs')));
 const {validateRepository}=await import(pathToFileURL(path.join(REPO,'scripts/validate-portable.mjs')));
 let result=null,error=null;
 emit({stage:'canonical-npm-smoke',state:'running',out:OUT,preparation:'npm ci --ignore-scripts inside the exact detached canonical tree'});
 try{
  result=await verifyReleaseInstall({canonicalSha:MERGE,repoRoot:REPO,install:async({repoRoot})=>{
   const canonicalHead=text(requireSuccess(await git('canonical-head',['-C',repoRoot,'rev-parse','HEAD']))),canonicalTree=text(requireSuccess(await git('canonical-tree',['-C',repoRoot,'rev-parse','HEAD^{tree}'])));
   const validation=validateRepository(repoRoot);save('canonical-validation.json',{canonicalSha:canonicalHead,canonicalTree,...validation});
   if(canonicalHead!==MERGE||canonicalTree!==EXPECTED_TREE||!validation.ok)throw new Error('Canonical identity or strict validation mismatch');
   requireSuccess(await capture('canonical-npm-ci','npm',['ci','--ignore-scripts'],{cwd:repoRoot}));
   const clean=await git('canonical-working-state',['-C',repoRoot,'status','--porcelain=v1']);requireSuccess(clean);
   if(text(clean))throw new Error('Dependency preparation changed canonical tracked/unignored source');
   const smoke=requireSuccess(await capture('canonical-npm-smoke','npm',['run','smoke'],{cwd:repoRoot}));
   const body=smoke.stdout.toString('utf8'),start=body.indexOf('{\n');if(start<0)throw new Error('Smoke output omitted its result JSON');
   const installation=JSON.parse(body.slice(start));save('canonical-installation.json',{canonicalSha:canonicalHead,canonicalTree,...installation});return installation;
  }});
 }catch(value){error=String(value.message);save('canonical-failure.json',{canonicalSha:MERGE,error});}
 const scenarios=result?.scenarios??[],summary={canonicalSha:MERGE,canonicalTree:EXPECTED_TREE,preparation:'npm ci --ignore-scripts in exact canonical worktree; tracked/unignored status checked clean',firstAttempt:'../20261012-d106e766-engineering/canonical-failure.json',ok:result?.ok??false,error,scenarioCount:scenarios.length,pythonRuns:scenarios.filter(s=>s.diagramValidation).length,scenarios:scenarios.map(s=>({installed:s.installed,outside:s.outside,repository:s.repository,nativeOutside:s.nativeOutside,nativeRepository:s.nativeRepository,explicitOnly:s.explicitOnly,pythonExecuted:Boolean(s.diagramValidation),pythonEvidence:s.diagramValidation??null})),behaviorEvidenceRegraded:false};
 save('canonical-summary.json',summary);emit(summary);
 if(result?.ok!==true||scenarios.length!==7||summary.pythonRuns!==4)process.exitCode=1;
}

save(`${mode}-control.json`,{mode,repo:REPO,canonicalSha:MERGE,runnerSha256:sha256(fs.readFileSync(fileURLToPath(import.meta.url))),startedAt:new Date().toISOString(),evidenceRoot:OUT,noRepositoryWrites:true});
await (mode==='checks'?checks():mode==='facts'?facts():canonicalRedo());
