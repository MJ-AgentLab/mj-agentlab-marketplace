import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url)),repo=path.resolve(root,'../../../develop'),canonicalSha=process.argv[2];
if(!/^[a-f0-9]{40}$/.test(canonicalSha??''))throw new Error('Requires parent-provided full canonical SHA');
const out=path.join(root,`engineering-${canonicalSha.slice(0,8)}`);if(fs.existsSync(out))throw new Error('No overwrite of earlier evidence');fs.mkdirSync(out);
const {spawnCli}=await import(pathToFileURL(path.join(repo,'scripts/run-cli.mjs'))),{verifyReleaseInstall}=await import(pathToFileURL(path.join(repo,'scripts/release-verify-install.mjs'))),{validateRepository}=await import(pathToFileURL(path.join(repo,'scripts/validate-portable.mjs')));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),save=(name,value)=>fs.writeFileSync(path.join(out,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
const env={...process.env,PATH:'C:/Users/Admin/AppData/Roaming/uv/python/cpython-3.12-windows-x86_64-none'+path.delimiter+process.env.PATH,REQUIRE_PYTHON:'1',REQUIRE_PWSH:'1'};
async function capture(label,name,args,cwd=repo){
 const startedAt=new Date().toISOString(),result=await new Promise(resolve=>{
  const stdout=[],stderr=[];let error=null;const child=spawnCli(name,args,{cwd,env,stdio:['pipe','pipe','pipe'],windowsHide:true});
  child.stdout.on('data',b=>stdout.push(b));child.stderr.on('data',b=>stderr.push(b));child.on('error',e=>error=String(e.message));child.stdin.end();
  child.on('close',(status,signal)=>resolve({status,signal,error,stdout:Buffer.concat(stdout),stderr:Buffer.concat(stderr)}));
 });
 fs.writeFileSync(path.join(out,label+'.stdout.log'),result.stdout,{flag:'wx'});fs.writeFileSync(path.join(out,label+'.stderr.log'),result.stderr,{flag:'wx'});
 save(label+'.command.json',{command:name,args,cwd,startedAt,endedAt:new Date().toISOString(),status:result.status,signal:result.signal,error:result.error,stdoutBytes:result.stdout.length,stdoutSha256:hash(result.stdout),stderrBytes:result.stderr.length,stderrSha256:hash(result.stderr)});
 if(result.status!==0||result.error)throw new Error(`${label} failed with status ${result.status}`);return result.stdout;
}
const controller=fs.readFileSync(fileURLToPath(import.meta.url));fs.writeFileSync(path.join(out,'controller.mjs'),controller,{flag:'wx'});save('control.json',{canonicalSha,controllerSha256:hash(controller),npmTestRerun:false,dependencyPreparation:'npm ci --ignore-scripts in exact detached canonical worktree',expectedScenarioCount:7,expectedActualPythonRuns:4});
const canonicalTree=(await capture('canonical-tree','git',['rev-parse',`${canonicalSha}^{tree}`])).toString('utf8').trim();
let result;
try{
 result=await verifyReleaseInstall({canonicalSha,repoRoot:repo,install:async({repoRoot})=>{
  const head=(await capture('detached-head','git',['rev-parse','HEAD'],repoRoot)).toString('utf8').trim(),tree=(await capture('detached-tree','git',['rev-parse','HEAD^{tree}'],repoRoot)).toString('utf8').trim();
  const validation=validateRepository(repoRoot);save('validation.json',{canonicalSha:head,canonicalTree:tree,...validation});if(head!==canonicalSha||tree!==canonicalTree||!validation.ok)throw new Error('Strict canonical identity/validation failed');
  await capture('npm-ci','npm',['ci','--ignore-scripts'],repoRoot);if((await capture('canonical-status','git',['status','--porcelain=v1'],repoRoot)).length)throw new Error('Dependency preparation dirtied canonical source');
  const versions=Object.fromEntries(['diagram-kit','understanding-kit','explain-kit','html-guide-kit'].map(name=>[name,JSON.parse(fs.readFileSync(path.join(repoRoot,'plugins',name,'plugin.json'),'utf8')).version]));
  save('versions.json',{marketplace:fs.readFileSync(path.join(repoRoot,'VERSION'),'utf8').trim(),plugins:versions});if(versions['html-guide-kit']!=='0.1.3')throw new Error('Correction cache would use wrong HTML version');
  const raw=(await capture('npm-smoke','npm',['run','smoke'],repoRoot)).toString('utf8'),start=raw.indexOf('{\n');if(start<0)throw new Error('Missing actual smoke JSON');
  const installation=JSON.parse(raw.slice(start));save('installation.json',{canonicalSha,canonicalTree,...installation});return installation;
 }});
 const scenarios=result.scenarios??[],python=scenarios.filter(s=>s.diagramValidation);if(scenarios.length!==7||python.length!==4||result.ok!==true)throw new Error('Incomplete strict canonical installation');
 save('summary.json',{canonicalSha,canonicalTree,ok:true,scenarios:scenarios.map(s=>({installed:s.installed,outside:s.outside,repository:s.repository,nativeOutside:s.nativeOutside,nativeRepository:s.nativeRepository,explicitOnly:s.explicitOnly,actualCachePython:s.diagramValidation??null})),scenarioCount:scenarios.length,actualPythonRuns:python.length,allInstalledResourcesCompared:true,behaviorRegraded:false,npmTestRerun:false});
 console.log(JSON.stringify({out,canonicalSha,canonicalTree,ok:true,scenarioCount:7,actualPythonRuns:4},null,2));
}catch(error){save('failure.json',{canonicalSha,canonicalTree,error:String(error.message),oldEvidenceUnmodified:true});throw error;}
