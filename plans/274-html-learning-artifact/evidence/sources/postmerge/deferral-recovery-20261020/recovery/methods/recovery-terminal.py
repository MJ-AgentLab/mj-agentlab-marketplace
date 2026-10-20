"""Finish the single unexecuted scenario; preserve both QA assertion errors and all prior product-command bytes."""
import ast,datetime,hashlib,json,pathlib,shutil,subprocess,sys,time
ROOT=pathlib.Path('C:/Users/Admin/AppData/Local/Temp/html-learning-274-deferrals-recovery');OUT=ROOT/'recovery';COMMANDS=OUT/'commands';HOST='C:/Users/Admin/.codex/worktrees/html-learning-artifact/develop';SOURCE='908d29537a19ceca166e8f3c7cddef4d419781a4';PUBLIC='f906b1001a86d7b5415451bd973bea26e6cc3a1d';FROZEN='plans/274-html-learning-artifact/evidence/sources/consumer/run02/consumer-cwd';EXPECTED='c4c445947180f77641512dee1de3732fbc7946fb53fce804f33677e6e037c16e'
# Reuse only pure helper definitions, never import/execute the prior script's top-level scenarios.
old_source=(ROOT/'methods/recovery-continuation.py').read_text(encoding='utf-8');module=ast.parse(old_source);functions=[n for n in module.body if isinstance(n,ast.FunctionDef)];exec(compile(ast.Module(body=functions,type_ignores=[]),'recovery-continuation-helper-definitions','exec'))
started=now();before={'head':git('rev-parse','HEAD').decode().strip(),'statusSha256':digest(git('status','--porcelain=v1','-z')),'worktreeListSha256':digest(git('worktree','list','--porcelain'))};write(OUT/'terminal-start.json',(json.dumps({'startedAt':started,'host':before},indent=2)+'\n').encode())
good=OUT/'known-good';materials=OUT/'materials';damaged=OUT/'damaged';recovered=OUT/'recovered-from-backup';regenerated=OUT/'regenerated';runtime=OUT/'runtime';renderer=runtime/'html-guide-kit/skills/site/scripts/render-site.mjs'
assert digest((good/'artifact-manifest.json').read_bytes())==EXPECTED;manifest=json.loads((good/'artifact-manifest.json').read_bytes());good_tree=tree(good);materials_tree=tree(materials);damaged_tree=tree(damaged)
protected=[]
for p in [r['path']for r in manifest['files']]+['artifact-manifest.json']:
    b=(good/p).read_bytes();source=FROZEN+'/artifact/'+p;assert b==blob(SOURCE,source);protected.append({'sourcePath':source,'bytes':len(b),'sha256':digest(b)})
for p in ['artifact.json','content.md','sources/renewal-rules.md']:
    b=(materials/p).read_bytes();source=FROZEN+'/representative-input/'+p;assert b==blob(SOURCE,source);protected.append({'sourcePath':source,'bytes':len(b),'sha256':digest(b)})
assert tree(regenerated)==good_tree==tree(recovered)and len(good_tree)==7
bad=json.loads((OUT/'damaged-static.json').read_bytes());bad_checks=[r for r in bad['checks']if r['status']=='FAIL'];assert bad_checks==[{'code':'manifest:3:bytes','status':'FAIL','detail':'learning.js'}]
post=json.loads((OUT/'recovered-static.json').read_bytes());assert post['status']=='PASS'and post['summary']=={'checks':89,'failed':0,'pages':1,'files':6}
assert all(damaged_tree[p]==v for p,v in good_tree.items()if p!='learning.js')and damaged_tree['learning.js']!=good_tree['learning.js']
receipts=[]
for name,exit_code in [('regenerate',0),('detect-corruption',1),('refuse-overwrite',1),('recovered-static',0)]:
    r=json.loads((COMMANDS/(name+'.json')).read_bytes());assert r['exitCode']==exit_code
    for channel in ['stdout','stderr']:
        b=(ROOT/r[channel]['file']).read_bytes();assert len(b)==r[channel]['bytes']and digest(b)==r[channel]['sha256']
    receipts.append(r)
assert b'output must be a new directory'in(COMMANDS/'refuse-overwrite.stderr.raw').read_bytes()
invalid=OUT/'invalid-materials';shutil.copytree(materials,invalid);(invalid/'artifact.json').write_bytes(b'{"schemaVersion":1,"schemaVersion":2}\n');invalid_tree=tree(invalid);absent=OUT/'invalid-attempt-output'
p,r=run('invalid-input-preserved',['node',str(renderer),'--input',str(invalid),'--output',str(absent)],1);receipts.append(r);assert b'duplicate JSON key'in p.stderr and not absent.exists()and tree(invalid)==invalid_tree
assert tree(good)==good_tree and tree(materials)==materials_tree and tree(damaged)==damaged_tree and tree(recovered)==good_tree
source_files=[]
for p in sorted(runtime.rglob('*')):
    if not p.is_file():continue
    source='plugins/'+str(p.relative_to(runtime)).replace('\\','/');b=p.read_bytes();assert b==blob(SOURCE,source)==blob(PUBLIC,source);source_files.append({'path':source,'snapshot':str(p.relative_to(ROOT)).replace('\\','/'),'bytes':len(b),'sha256':digest(b)})
assert len(source_files)==20
after={'head':git('rev-parse','HEAD').decode().strip(),'statusSha256':digest(git('status','--porcelain=v1','-z')),'worktreeListSha256':digest(git('worktree','list','--porcelain'))};assert before==after
qa={'schema':1,'recordedAt':now(),'errors':[{'method':'methods/recovery-drill.py','exit':1,'error':"KeyError: 'name'",'cause':'Actual checker entries use code/status/detail; original raw detection FAIL remained correct.'},{'method':'methods/recovery-continuation.py','exit':1,'error':'AssertionError after actual recovered checker exit0/PASS','cause':'QA expected checker summary.files=7, but actual checker excludes artifact-manifest.json and reports6 payload files; complete physical bundle still has7.'}],'rawProductCommandResultsUnchanged':True,'productCommandsRerun':False,'oldMethodsPreserved':True,'exceptionTextSource':'Transcribed from actual tool results; not asserted as captured subprocess raw bytes.','initialTwoScriptHostSnapshots':'Held in memory and lost on QA exceptions; no full-five-command host before/after equality claim is made.','terminalStepHostBeforeAfterEqual':True}
write(OUT/'qa-method-corrections.json',(json.dumps(qa,ensure_ascii=False,indent=2)+'\n').encode())
scenarios=[{'name':'explicit-materials-regenerate-known-good','status':'PASS','all7FilesExact':True},{'name':'generated-file-corruption-detected','status':'PASS','expectedExit':1,'failedChecks':bad_checks},{'name':'existing-damaged-output-refuses-overwrite','status':'PASS','expectedExit':1,'damagedEvidencePreserved':True},{'name':'known-good-backup-restored-in-new-directory','status':'PASS','all7FilesExact':True,'actualStatic':post['summary'],'checkerFilesExcludeManifest':True},{'name':'invalid-input-rejected-before-any-output','status':'PASS','expectedExit':1,'invalidEvidencePreserved':True,'outputAbsent':True}]
summary={'schema':3,'firstProductCommandStartedAt':receipts[0]['startedAt'],'lastContinuationStartedAt':started,'completedAt':now(),'executor':'/root/post_merge_verify','source':{'canonicalSha':SOURCE,'tree':'9d4926a116e1b146a92131139f3e9a75be988b63','runtimeAll20FilesEqualPublishedF906':True,'runtimeFiles':source_files},'knownGood':{'manifestSha256':EXPECTED,'physicalFiles':7,'checkerPayloadFiles':6,'files':good_tree},'scenarios':scenarios,'commands':receipts,'productCommandsExecutedExactlyOnceEach':5,'expectedFaultInjectionNonzeroCommands':3,'qaAssertionFailuresPreserved':2,'originals':protected,'sourceAndOriginalsUnchangedAtFinalHashAudit':True,'failedDamagedAndInvalidArtifactsPreserved':True,'lastContinuationHostBefore':before,'lastContinuationHostAfter':after,'lastContinuationHostAndWorktreeListEqual':True,'completeFiveCommandHostBeforeAfterEqualityClaimed':False,'allWritesWithinTaskTemp':True,'remoteRollback':'NOT_RUN','publishedPluginRollback':'NOT_RUN','SiteRollback':'NOT_RUN','continuousMonitoring':'NOT_CREATED','new13ModelDesktopBrowser':'NOT_RUN','scope':'Local artifact recovery mechanisms only, not full P06, C21 clearance or Owner acceptance.','status':'PASS'}
write(OUT/'summary.json',(json.dumps(summary,ensure_ascii=False,indent=2)+'\n').encode());print(json.dumps({'status':'PASS','scenarios':scenarios,'productCommands':5,'injectedExpectedFailures':3,'qaFailuresRetained':2,'summary':str(OUT/'summary.json')},ensure_ascii=False))
