"""Bounded local recovery exercise. Writes only this new TEMP evidence tree; never deploys or mutates source/cache."""
import datetime,hashlib,json,pathlib,shutil,subprocess,sys,time
ROOT=pathlib.Path('C:/Users/Admin/AppData/Local/Temp/html-learning-274-deferrals-recovery')
OUT=ROOT/'recovery';OUT.mkdir(parents=True,exist_ok=False);COMMANDS=OUT/'commands';COMMANDS.mkdir()
HOST='C:/Users/Admin/.codex/worktrees/html-learning-artifact/develop'
SOURCE='908d29537a19ceca166e8f3c7cddef4d419781a4';PUBLIC='f906b1001a86d7b5415451bd973bea26e6cc3a1d';PRIOR='4e4d4172fb27c812d3be8847f792dae5313daec8'
TASK='plans/274-html-learning-artifact';FROZEN=TASK+'/evidence/sources/consumer/run02/consumer-cwd'
PREFIX='plugins/html-guide-kit/skills/site';EXPECTED_MANIFEST='c4c445947180f77641512dee1de3732fbc7946fb53fce804f33677e6e037c16e'
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def digest(data):return hashlib.sha256(data).hexdigest()
def git(*args):return subprocess.check_output(['git','-C',HOST,*args])
def blob(sha,p):return git('show',sha+':'+p)
def write(p,data):
    p.parent.mkdir(parents=True,exist_ok=True)
    with p.open('xb')as f:f.write(data)
def tree(p):return {str(f.relative_to(p)).replace('\\','/'):{'bytes':f.stat().st_size,'sha256':digest(f.read_bytes())}for f in sorted(p.rglob('*'))if f.is_file()}
def check_manifest(p):
    raw=(p/'artifact-manifest.json').read_bytes();m=json.loads(raw);errors=[]
    for f in m['files']:
        target=p/f['path']
        if not target.is_file():errors.append({'path':f['path'],'reason':'MISSING'});continue
        b=target.read_bytes()
        if len(b)!=f['bytes']or digest(b)!=f['sha256']:errors.append({'path':f['path'],'reason':'HASH_OR_SIZE_MISMATCH','actualBytes':len(b),'actualSha256':digest(b),'expected':f})
    expected={f['path']for f in m['files']}|{'artifact-manifest.json'}
    if set(tree(p))!=expected:errors.append({'reason':'INVENTORY_MISMATCH'})
    return {'manifestSha256':digest(raw),'fileCount':len(expected),'ok':not errors,'errors':errors}
def run(name,args,expected):
    start=now();begin=time.monotonic();p=subprocess.run(args,cwd=ROOT,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=30)
    write(COMMANDS/(name+'.stdout.raw'),p.stdout);write(COMMANDS/(name+'.stderr.raw'),p.stderr)
    receipt={'name':name,'args':args,'startedAt':start,'completedAt':now(),'durationSeconds':time.monotonic()-begin,'exitCode':p.returncode,'expectedExitCode':expected,'stdout':{'file':str((COMMANDS/(name+'.stdout.raw')).relative_to(ROOT)).replace('\\','/'),'bytes':len(p.stdout),'sha256':digest(p.stdout)},'stderr':{'file':str((COMMANDS/(name+'.stderr.raw')).relative_to(ROOT)).replace('\\','/'),'bytes':len(p.stderr),'sha256':digest(p.stderr)}}
    write(COMMANDS/(name+'.json'),(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n').encode());assert p.returncode==expected,receipt
    return p,receipt
started=now();before={'head':git('rev-parse','HEAD').decode().strip(),'statusSha256':digest(git('status','--porcelain=v1','-z')),'worktreeListSha256':digest(git('worktree','list','--porcelain'))}
assert git('rev-parse',SOURCE+'^{tree}').decode().strip()=='9d4926a116e1b146a92131139f3e9a75be988b63'
assert git('rev-parse','v8.3.2^{commit}').decode().strip()==PUBLIC
assert git('rev-parse','v8.3.1^{commit}').decode().strip()==PRIOR
source_snapshots=[];runtime=OUT/'runtime'
paths=git('ls-tree','-r','--name-only','-z',SOURCE,PREFIX).decode().split('\0')
for p in filter(None,paths):
    b=blob(SOURCE,p);relative=p.removeprefix('plugins/');target=runtime/relative;write(target,b)
    assert b==blob(PUBLIC,p),'Current renderer/runtime differs from published f906: '+p
    source_snapshots.append({'sourcePath':p,'snapshot':str(target.relative_to(ROOT)).replace('\\','/'),'bytes':len(b),'sha256':digest(b),'sameBytesAsPublishedF906':True})
assert len(source_snapshots)==20
renderer=runtime/'html-guide-kit/skills/site/scripts/render-site.mjs';checker=runtime/'html-guide-kit/skills/site/scripts/check_artifact.py'
frozen_manifest=blob(SOURCE,FROZEN+'/artifact/artifact-manifest.json');assert digest(frozen_manifest)==EXPECTED_MANIFEST
manifest=json.loads(frozen_manifest);good=OUT/'known-good';materials=OUT/'materials'
protected=[]
for p in [f['path']for f in manifest['files']]+['artifact-manifest.json']:
    source=FROZEN+'/artifact/'+p;b=blob(SOURCE,source);write(good/p,b);protected.append({'sourcePath':source,'bytes':len(b),'sha256':digest(b)})
for p in ['artifact.json','content.md','sources/renewal-rules.md']:
    source=FROZEN+'/representative-input/'+p;b=blob(SOURCE,source);write(materials/p,b);protected.append({'sourcePath':source,'bytes':len(b),'sha256':digest(b)})
good_before=tree(good);materials_before=tree(materials);assert check_manifest(good)['ok']
regenerated=OUT/'regenerated';generated,generated_receipt=run('regenerate',['node',str(renderer),'--input',str(materials),'--output',str(regenerated)],0)
generated_result=json.loads(generated.stdout);assert generated_result['status']=='GENERATED'
regeneration={'generation':generated_result,'inventoryEqual':tree(regenerated)==good_before,'manifest':check_manifest(regenerated)};assert regeneration['inventoryEqual']and regeneration['manifest']['ok']
damaged=OUT/'damaged';shutil.copytree(good,damaged);write(OUT/'injected-corruption.txt',b'Append a harmless marker to TEMP damaged/learning.js only; original and good backup are read-only.\n')
with(damaged/'learning.js').open('ab')as f:f.write(b'\n// recovery exercise: deliberate TEMP corruption\n')
damaged_before=tree(damaged);detected=check_manifest(damaged);assert not detected['ok']and [e.get('path')for e in detected['errors']]==['learning.js']
bad,bad_receipt=run('detect-corruption',[sys.executable,str(checker),'--input',str(damaged),'--output',str(OUT/'damaged-static.json')],1)
bad_result=json.loads(bad.stdout);assert bad_result['status']=='FAIL'and bad_result['summary']['failed']>0
failed_checks=[c for c in bad_result['checks']if c['status']=='FAIL'];assert any('learning.js'in c['name']or'learning.js'in str(c)for c in failed_checks)
blocked,blocked_receipt=run('refuse-overwrite',['node',str(renderer),'--input',str(materials),'--output',str(damaged)],1)
assert b'output must be a new directory'in blocked.stderr and tree(damaged)==damaged_before
recovered=OUT/'recovered-from-backup';shutil.copytree(good,recovered);recovered_verified=check_manifest(recovered);assert recovered_verified['ok']and tree(recovered)==good_before
checked,checked_receipt=run('recovered-static',[sys.executable,str(checker),'--input',str(recovered),'--output',str(OUT/'recovered-static.json')],0)
checked_result=json.loads(checked.stdout);assert checked_result['status']=='PASS'and checked_result['summary']=={'checks':89,'failed':0,'pages':1,'files':7}
invalid=OUT/'invalid-materials';shutil.copytree(materials,invalid)
with(invalid/'artifact.json').open('wb')as f:f.write(b'{"schemaVersion":1,"schemaVersion":2}\n')
invalid_before=tree(invalid);uncreated=OUT/'invalid-attempt-output'
invalid_run,invalid_receipt=run('invalid-input-preserved',['node',str(renderer),'--input',str(invalid),'--output',str(uncreated)],1)
assert not uncreated.exists()and tree(invalid)==invalid_before and b'duplicate JSON key'in invalid_run.stderr
assert tree(good)==good_before and tree(materials)==materials_before and tree(damaged)==damaged_before
for row in protected:assert digest(blob(SOURCE,row['sourcePath']))==row['sha256']
after={'head':git('rev-parse','HEAD').decode().strip(),'statusSha256':digest(git('status','--porcelain=v1','-z')),'worktreeListSha256':digest(git('worktree','list','--porcelain'))}
report={'schema':1,'startedAt':started,'completedAt':now(),'executor':'/root/post_merge_verify','source':{'head':SOURCE,'tree':'9d4926a116e1b146a92131139f3e9a75be988b63','publishedF906SiteRuntimeAll20FilesIdentical':True,'runtime':source_snapshots},'knownGood':{'manifestSha256':EXPECTED_MANIFEST,'files':good_before,'siteMetadataOnlyReference':'Previously saved Site1, sourceffaaa; no Site tool/deploy used by this drill.'},'scenarios':[{'name':'deterministic-regeneration-from-explicit-materials','status':'PASS','details':regeneration},{'name':'deliberate-generated-file-corruption-detected','status':'PASS','expectedCheckerExit':1,'detector':detected,'failedStaticChecks':failed_checks},{'name':'existing-damaged-output-never-overwritten','status':'PASS','expectedRendererExit':1,'damagedBytesPreserved':True},{'name':'recover-known-good-into-new-independent-directory','status':'PASS','all7FilesExact':True,'static':checked_result['summary']},{'name':'invalid-input-does-not-create-output-or-overwrite-evidence','status':'PASS','expectedRendererExit':1,'invalidInputPreserved':True,'outputAbsent':True}],'actualCommands':[generated_receipt,bad_receipt,blocked_receipt,checked_receipt,invalid_receipt],'originalGitMaterialsAndKnownGoodBackupUnchanged':True,'failedDamagedAndInvalidArtifactsPreserved':True,'hostBefore':before,'hostAfter':after,'hostAndWorktreeListUnchanged':before==after,'allWritesWithinTaskTempRoot':True,'remoteRollback':'NOT_RUN','pluginPublishedRollback':'NOT_RUN','siteDeploymentRollback':'NOT_RUN','continuousMonitoring':'NOT_CREATED_OR_MEASURED','newFull13OrModelOrDesktop':'NOT_RUN','OwnerFinalAcceptance':'NOT_PROVIDED','status':'PASS'}
assert report['hostAndWorktreeListUnchanged'],'Concurrent host change observed; do not assert stable host'
write(OUT/'protected-originals.json',(json.dumps(protected,ensure_ascii=False,indent=2)+'\n').encode());write(OUT/'summary.json',(json.dumps(report,ensure_ascii=False,indent=2)+'\n').encode())
print(json.dumps({'status':report['status'],'scenarios':[{'name':s['name'],'status':s['status']}for s in report['scenarios']],'staticRecovery':checked_result['summary'],'sourceRuntimeFiles':len(source_snapshots),'expectedFailuresRetained':3,'hostAndWorktreeListUnchanged':report['hostAndWorktreeListUnchanged'],'summary':str(OUT/'summary.json')},ensure_ascii=False))
