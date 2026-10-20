"""Continue the preserved first recovery attempt after its QA field-name error; do not rerun completed generation/detection."""
import datetime,hashlib,json,pathlib,shutil,subprocess,sys,time
ROOT=pathlib.Path('C:/Users/Admin/AppData/Local/Temp/html-learning-274-deferrals-recovery');OUT=ROOT/'recovery';COMMANDS=OUT/'commands';HOST='C:/Users/Admin/.codex/worktrees/html-learning-artifact/develop'
SOURCE='908d29537a19ceca166e8f3c7cddef4d419781a4';PUBLIC='f906b1001a86d7b5415451bd973bea26e6cc3a1d';FROZEN='plans/274-html-learning-artifact/evidence/sources/consumer/run02/consumer-cwd';PREFIX='plugins/html-guide-kit/skills/site';EXPECTED='c4c445947180f77641512dee1de3732fbc7946fb53fce804f33677e6e037c16e'
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def digest(b):return hashlib.sha256(b).hexdigest()
def git(*a):return subprocess.check_output(['git','-C',HOST,*a])
def blob(sha,p):return git('show',sha+':'+p)
def write(p,b):
    p.parent.mkdir(parents=True,exist_ok=True)
    with p.open('xb')as f:f.write(b)
def tree(p):return{str(f.relative_to(p)).replace('\\','/'):{'bytes':f.stat().st_size,'sha256':digest(f.read_bytes())}for f in sorted(p.rglob('*'))if f.is_file()}
def run(name,args,expected):
    started=now();begin=time.monotonic();p=subprocess.run(args,cwd=ROOT,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=30)
    write(COMMANDS/(name+'.stdout.raw'),p.stdout);write(COMMANDS/(name+'.stderr.raw'),p.stderr)
    record={'name':name,'args':args,'startedAt':started,'completedAt':now(),'durationSeconds':time.monotonic()-begin,'exitCode':p.returncode,'expectedExitCode':expected,'stdout':{'file':str((COMMANDS/(name+'.stdout.raw')).relative_to(ROOT)).replace('\\','/'),'bytes':len(p.stdout),'sha256':digest(p.stdout)},'stderr':{'file':str((COMMANDS/(name+'.stderr.raw')).relative_to(ROOT)).replace('\\','/'),'bytes':len(p.stderr),'sha256':digest(p.stderr)}}
    write(COMMANDS/(name+'.json'),(json.dumps(record,ensure_ascii=False,indent=2)+'\n').encode());assert p.returncode==expected,record;return p,record
continued=now();before={'head':git('rev-parse','HEAD').decode().strip(),'statusSha256':digest(git('status','--porcelain=v1','-z')),'worktreeListSha256':digest(git('worktree','list','--porcelain'))}
good=OUT/'known-good';materials=OUT/'materials';damaged=OUT/'damaged';regenerated=OUT/'regenerated';runtime=OUT/'runtime';renderer=runtime/'html-guide-kit/skills/site/scripts/render-site.mjs';checker=runtime/'html-guide-kit/skills/site/scripts/check_artifact.py'
manifest_raw=(good/'artifact-manifest.json').read_bytes();assert digest(manifest_raw)==EXPECTED;manifest=json.loads(manifest_raw)
protected=[]
for p in [r['path']for r in manifest['files']]+['artifact-manifest.json']:
    data=(good/p).read_bytes();source=FROZEN+'/artifact/'+p;assert data==blob(SOURCE,source);protected.append({'sourcePath':source,'bytes':len(data),'sha256':digest(data)})
for p in ['artifact.json','content.md','sources/renewal-rules.md']:
    data=(materials/p).read_bytes();source=FROZEN+'/representative-input/'+p;assert data==blob(SOURCE,source);protected.append({'sourcePath':source,'bytes':len(data),'sha256':digest(data)})
source_snapshots=[]
for f in sorted(runtime.rglob('*')):
    if not f.is_file():continue
    source='plugins/'+str(f.relative_to(runtime)).replace('\\','/');data=f.read_bytes();assert data==blob(SOURCE,source)==blob(PUBLIC,source);source_snapshots.append({'sourcePath':source,'snapshot':str(f.relative_to(ROOT)).replace('\\','/'),'bytes':len(data),'sha256':digest(data)})
assert len(source_snapshots)==20
good_before=tree(good);materials_before=tree(materials);damaged_before=tree(damaged);assert tree(regenerated)==good_before
old_records=[json.loads((COMMANDS/(name+'.json')).read_text(encoding='utf-8'))for name in ['regenerate','detect-corruption']]
for row in old_records:
    for channel in ['stdout','stderr']:
        b=(ROOT/row[channel]['file']).read_bytes();assert len(b)==row[channel]['bytes']and digest(b)==row[channel]['sha256']
bad_result=json.loads((OUT/'damaged-static.json').read_text(encoding='utf-8'));failed=[r for r in bad_result['checks']if r['status']=='FAIL'];assert bad_result['status']=='FAIL'and failed==[{'code':'manifest:3:bytes','status':'FAIL','detail':'learning.js'}]
assert all(damaged_before[p]==v for p,v in good_before.items()if p!='learning.js')and damaged_before['learning.js']!=good_before['learning.js']
blocked,blocked_receipt=run('refuse-overwrite',['node',str(renderer),'--input',str(materials),'--output',str(damaged)],1);assert b'output must be a new directory'in blocked.stderr and tree(damaged)==damaged_before
recovered=OUT/'recovered-from-backup';shutil.copytree(good,recovered);assert tree(recovered)==good_before
checked,checked_receipt=run('recovered-static',[sys.executable,str(checker),'--input',str(recovered),'--output',str(OUT/'recovered-static.json')],0);result=json.loads(checked.stdout);assert result['status']=='PASS'and result['summary']=={'checks':89,'failed':0,'pages':1,'files':7}
invalid=OUT/'invalid-materials';shutil.copytree(materials,invalid);(invalid/'artifact.json').write_bytes(b'{"schemaVersion":1,"schemaVersion":2}\n');invalid_before=tree(invalid);absent=OUT/'invalid-attempt-output'
rejected,rejected_receipt=run('invalid-input-preserved',['node',str(renderer),'--input',str(invalid),'--output',str(absent)],1);assert b'duplicate JSON key'in rejected.stderr and not absent.exists()and tree(invalid)==invalid_before
assert tree(good)==good_before and tree(materials)==materials_before and tree(damaged)==damaged_before
for r in protected:assert digest(blob(SOURCE,r['sourcePath']))==r['sha256']
after={'head':git('rev-parse','HEAD').decode().strip(),'statusSha256':digest(git('status','--porcelain=v1','-z')),'worktreeListSha256':digest(git('worktree','list','--porcelain'))}
assert before==after
qa={'schema':1,'recordedAt':now(),'originalMethod':'methods/recovery-drill.py','originalExit':1,'originalError':"KeyError: 'name' while reading actual static check entries (correct key is code/detail)",'originalToolOutput':'Transcribed from the actual tool exception; this is not a captured subprocess raw log.','actualCandidateCommandsCompletedBeforeQAError':['regenerate:exit0','detect-corruption:expected exit1'],'completedCommandsRerun':False,'candidateOrCheckerEdited':False,'v1StartHostSnapshot':'Held in memory and lost on QA exception; no v1 before/after host equality claim is made.','continuedHostBeforeAfterEqual':True}
write(OUT/'qa-method-correction.json',(json.dumps(qa,ensure_ascii=False,indent=2)+'\n').encode())
records=old_records+[blocked_receipt,checked_receipt,rejected_receipt]
report={'schema':2,'firstActualCommandStartedAt':old_records[0]['startedAt'],'continuationStartedAt':continued,'completedAt':now(),'executor':'/root/post_merge_verify','source':{'head':SOURCE,'tree':'9d4926a116e1b146a92131139f3e9a75be988b63','all20RuntimeFilesEqualPublishedF906':True,'runtime':source_snapshots},'knownGood':{'manifestSha256':EXPECTED,'files':good_before},'scenarios':[{'name':'deterministic-regeneration-from-explicit-materials','status':'PASS','all7FilesExact':True},{'name':'generated-file-corruption-detected','status':'PASS','expectedExit':1,'actualFailedChecks':failed},{'name':'damaged-output-never-overwritten','status':'PASS','expectedExit':1,'originalDamagePreserved':True},{'name':'known-good-backup-recovered-into-new-directory','status':'PASS','all7FilesExact':True,'actualStatic':result['summary']},{'name':'invalid-input-does-not-create-output','status':'PASS','expectedExit':1,'invalidInputPreserved':True,'outputAbsent':True}],'commands':records,'protectedOriginals':protected,'actualProductCommands':len(records),'expectedInjectedFailureCommands':3,'qaErrorPreserved':'recovery/qa-method-correction.json','allWritesWithinTaskTemp':True,'sourceGitAndBackupAndMaterialsUnchanged':True,'failedArtifactsPreserved':True,'continuationHostBefore':before,'continuationHostAfter':after,'continuationHostAndWorktreeListEqual':True,'remoteRollback':'NOT_RUN','publishedPluginRollback':'NOT_RUN','actualSiteRollback':'NOT_RUN','continuousMonitoring':'NOT_CREATED','full13InstallationModelDesktop':'NOT_RUN','scope':'New local recovery situation only; it is not published or Sites rollback, comprehensive P06 acceptance, C21 clearance or Owner final acceptance.','status':'PASS'}
write(OUT/'summary.json',(json.dumps(report,ensure_ascii=False,indent=2)+'\n').encode());print(json.dumps({'status':report['status'],'scenarios':report['scenarios'],'commands':len(records),'expectedInjectedFailures':3,'qaErrorRetained':True,'summary':str(OUT/'summary.json')},ensure_ascii=False))
