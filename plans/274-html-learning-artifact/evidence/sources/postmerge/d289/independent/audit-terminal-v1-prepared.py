import base64,datetime,hashlib,json,pathlib,re,subprocess,sys

OUT=pathlib.Path(__file__).resolve().parent;ROOT=OUT.parent
LOCAL=ROOT/'actual-develop-local';SMOKE=ROOT/'actual-develop-smoke'
SHA='f3e8ba322109e2a43dcdcd68fdd2f0c655c78240';TREE='6daad5a9e9f9d749e48e38b148657195c3ed2fa5'
OWNERHASH='dc9d58437778093ae9b51d052908712a3bbb2624f16ff335f5210435ca2f0895'
PYTHON='C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe'
def read(base,name):return json.loads((base/name).read_text(encoding='utf-8'))
def norm(value):return str(pathlib.Path(value).resolve()).replace('\\','/').lower()
def save(name,value):
    with (OUT/name).open('x',encoding='utf-8') as stream:stream.write(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
def ready():
    if not all((base/name).exists() for base,name in [(LOCAL,'batch.json'),(LOCAL,'launch.json'),(SMOKE,'launch-result.json'),(SMOKE,'run-state-complete.json'),(SMOKE,'independent-audit.json')]):return False
    local=read(LOCAL,'batch.json');launch=read(LOCAL,'launch.json')
    return bool(local.get('endedAtUtc') and launch.get('endedAtUtc') and all('exitCode' in c for c in local.get('commands',[])))
if not ready():
    print(json.dumps({'status':'NOT_READY','reason':'Both unique batches must have terminal files and final timestamps; no output or PASS written'}));sys.exit(2)
if '--probe' in sys.argv:
    print(json.dumps({'status':'TERMINAL_READY_FOR_AUDIT','passClaimed':False}));sys.exit(0)
if (OUT/'summary.json').exists():raise RuntimeError('No overwrite; independent terminal audit is single-run')
checks=[]
def check(name,value,observed=None):checks.append({'name':name,'passed':bool(value),'observed':observed})
local=read(LOCAL,'batch.json');launch=read(LOCAL,'launch.json');before=read(LOCAL,'candidate-before.json');after=read(LOCAL,'candidate-after.json')
check('local launch fixed actualdevelop identity',launch['head']==SHA and launch['tree']==TREE,{'head':launch['head'],'tree':launch['tree']})
check('local exact three finished commands zero', [c['name'] for c in local['commands']]==['npm-test','npm-validate','baseline-tools'] and all(c['exitCode']==0 and c.get('endedAtUtc') for c in local['commands']) and bool(local['endedAtUtc']) and launch['exitCode']==0)
check('local complete tracked hashes unchanged',before['files']==after['files'] and not any(r.get('missing') for r in before['files']) and local['trackedFilesByteIdenticalBeforeAfter'],len(before['files']))
check('local actualsource head clean before after',all(v['head']['exitCode']==0 and v['head']['stdout'].strip()==SHA and v['status']['exitCode']==0 and v['status']['stdout']=='' and v['unmerged']['stdout']=='' and v['workingDiff']['stdout']=='' for v in [before,after]) and local['headIdenticalBeforeAfter'])
logRows=[]
for command in local['commands']:
    record=command['combinedOutput'];data=(LOCAL/record['path']).read_bytes()
    logRows.append({'path':record['path'],'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'matchesReceipt':len(data)==record['bytes'] and hashlib.sha256(data).hexdigest()==record['sha256']})
check('local all command raw logs match receipts',all(r['matchesReceipt'] for r in logRows),logRows)
testText=(LOCAL/'npm-test.log').read_text(encoding='utf-8',errors='replace')
tap={name:int(re.findall(r'^# '+name+r' (\d+)\s*$',testText,re.M)[-1]) for name in ['tests','pass','fail','cancelled','skipped','todo']}
skips=[line for line in testText.splitlines() if re.match(r'^\s*ok \d+ - .*# SKIP',line)]
check('local fullsuite652 actual651PASS0FAIL1platformskip',tap=={'tests':652,'pass':651,'fail':0,'cancelled':0,'skipped':1,'todo':0} and len(skips)==1,{'tap':tap,'actualSkipLines':skips})
validationText=(LOCAL/'npm-validate.log').read_text();validation=json.loads(validationText[validationText.index('{'):])
check('local actual strictvalidation8public20repo',validation['ok'] is True and validation['errors']==[] and validation['repositorySkills']==20 and len(validation['publicSkills'])==8,validation)
baseline=(LOCAL/'baseline-tools.log').read_text()
check('local exact actual CLI01470',bool(re.search(r'OK\s+codex\s+==\s+0\.147\.0\s+actual=0\.147\.0\s+\(exact-match\)',baseline)) and '0 of 1 pin(s) failed' in baseline,baseline)
check('local ownedshortTEMP ordinary correct absent',launch['temporaryRootAbsentAfterNonrecursiveCleanup'] is True and launch['temporaryRootRemainingEntries']==[] and pathlib.Path(launch['temporaryRoot']).parent.resolve()==pathlib.Path('D:/').resolve() and pathlib.Path(launch['temporaryRoot']).name.startswith('t289u-') and not pathlib.Path(launch['temporaryRoot']).exists(),launch['temporaryRoot'])
check('local bundledPython explicit actual overrides',all(norm(local['environmentOverrides'][k])==norm(PYTHON) for k in ['HTML_SITE_PYTHON','LEK_PYTHON','PYTHON']) and local['environmentOverrides']['REQUIRE_PYTHON']=='1')
config=read(SMOKE,'run-config.json');result=read(SMOKE,'run-result.json');smokeLaunch=read(SMOKE,'launch-result.json');report=read(SMOKE,'smoke-report.json');command=read(SMOKE,'command.json');sBefore=read(SMOKE,'before-snapshot.json');sAfter=read(SMOKE,'after-snapshot.json');tools=read(SMOKE,'tools.json');ownAudit=read(SMOKE,'independent-audit.json')
check('freshsmoke actualdevelop SHA tree fixed throughout',all(v['canonicalSha']==SHA and v['canonicalTree']==TREE for v in [config,result,command]) and config['expectedHead']==SHA and config['expectedTree']==TREE and sBefore['head']==sAfter['head']==SHA and sBefore['tree']==sAfter['tree']==TREE)
check('freshsmoke terminal original driver and audit zero',smokeLaunch['overall']=='PASS_LIMITED' and smokeLaunch['outerExit']==smokeLaunch['auditExit']==result['exitCode']==0 and bool(result['finishedAt']) and ownAudit['status']=='PASS_LIMITED' and all(r['passed'] for r in ownAudit['checks']))
check('freshsmoke every original guard true',all(result['guards'].values()) and not result.get('evidenceAnalysisError'),result['guards'])
scenarios=report['scenarios'];commands=[dict(scenario=i+1,**c) for i,s in enumerate(scenarios) for c in s['commands']]
check('freshsmoke13 exact scenarios and178actualcommands pass',len(scenarios)==13 and all(s['ok'] for s in scenarios) and len(commands)==178 and all(c['status']==0 for c in commands),{'scenarios':len(scenarios),'commands':len(commands)})
def ends(c,suffix):return any(str(a).replace('\\','/').endswith(suffix) for a in c['args'])
diagram=[c for c in commands if ends(c,'/validate_diagram.py')];lek=[c for c in commands if ends(c,'/lek.py')];sitePython=[c for c in commands if ends(c,'/check_artifact.py')];siteGen=[c for c in commands if ends(c,'/render-site.mjs')];site=[s for s in scenarios if s.get('siteValidation')]
check('freshsmoke actualPython6Diagram18LEK4site',len(diagram)==6 and len(lek)==18 and len(sitePython)==4 and all(c['command']=='python' for c in diagram+lek+sitePython),{'Diagram':len(diagram),'LEK':len(lek),'site':len(sitePython)})
check('freshsmoke4sitegeneration4static96each0FAIL',len(siteGen)==4 and len(site)==4 and all(s['siteValidation']['checked']['status']=='PASS' and s['siteValidation']['checked']['summary']['checks']==96 and s['siteValidation']['checked']['summary']['failed']==0 for s in site),[s['siteValidation']['checked']['summary'] for s in site])
check('freshsmokeHTML39site20guide4bytes',len(site)==4 and all('/html-guide-kit/0.1.39/' in s['siteValidation']['skillPath'].replace('\\','/') and len(s['installedResources']['html-guide-kit:site'])==20 and len(s['installedResources']['html-guide-kit:guide'])==4 for s in site))
check('freshsmokeCLI01470bundledPython31214',tools['cli']['stdout'].strip()=='codex-cli 0.147.0' and all(s['version']=='codex-cli 0.147.0' for s in scenarios) and norm(json.loads(tools['python']['stdout'])['executable'])==norm(PYTHON) and json.loads(tools['python']['stdout'])['version'].startswith('3.12.14 ') and norm(tools['pathPython']['stdout'].strip())==norm(PYTHON))
check('freshsmokeoutside3native8repo20explicit5',report['outside']=={'publicSkills':3,'repositorySkills':0} and report['repository']=={'publicSkills':3,'repositorySkills':20} and report['nativeOutside']=={'publicSkills':8,'repositorySkills':0} and report['nativeRepository']=={'publicSkills':8,'repositorySkills':20} and len(report['explicitOnly'])==5)
check('freshsmokebrowserNOTRUNseparateboundedlocaltests',all(s['siteValidation']['browserCheck'].startswith('NOT_RUN') for s in site))
roots=read(SMOKE,'owned-roots-absence.json');rootRows=[]
for row in roots:
    path=pathlib.Path(row['root']);prefix={'canonical':'release-install-','template':'marketplace-smoke-source-','scenario':'marketplace-smoke-'}[row['kind']]
    rootRows.append(dict(row,independentExactBoundary=norm(path.parent)==norm(config['shortTemp']) and path.name.startswith(prefix),existsAtNewIndependentAudit=path.exists(),independentCheckedAt=datetime.datetime.now(datetime.timezone.utc).isoformat()))
check('freshsmoke15exactuniqueownedroots',len(roots)==15 and len({norm(r['root']) for r in roots})==15 and sum(r['kind']=='canonical' for r in roots)==1 and sum(r['kind']=='template' for r in roots)==1 and sum(r['kind']=='scenario' for r in roots)==13,len(roots))
check('freshsmoke15originalandnewindependentabsence',len(roots)==15 and all(r['boundaryVerified'] and r['independentExactBoundary'] and not r['existsAfter'] and not r['existsAtNewIndependentAudit'] for r in rootRows))
check('freshsmokeemptycontainerremovednonrecursive',smokeLaunch['shortTempContainer']['removed'] is True and smokeLaunch['shortTempContainer']['existsAfter'] is False and not pathlib.Path(config['shortTemp']).exists() and result['cleanup']['manualRootCleanupPerformed'] is False and smokeLaunch['manualOwnedRootCleanupPerformed'] is False)
check('freshsmokehostprimaryownerandfullworktreesexact',sBefore['statusBase64']==sAfter['statusBase64']=='' and sBefore['primaryHead']==sAfter['primaryHead'] and sBefore['primaryStatusBase64']==sAfter['primaryStatusBase64'] and sBefore['ownerOriginalSha256']==sAfter['ownerOriginalSha256']==OWNERHASH and sBefore['worktreesBase64']==sAfter['worktreesBase64'])
check('freshsmokeouterchildsameprocessTEMP',all(norm(command['processEnvironment'][k])==norm(config['shortTemp']) for k in ['TEMP','TMP','outerOsTmpdir']))
records=[json.loads(line) for file in (SMOKE/'perf').glob('*.ndjson') for line in file.read_text().splitlines() if line]
check('freshsmokecanonicalandtemplatecleanupmetricsallOK',all(r['status']=='ok' for r in records) and sum(r['phase']=='worktree.create' and r['details'].get('scope')=='canonical' for r in records)==1 and sum(r['phase']=='worktree.remove' and r['details'].get('scope')=='canonical' for r in records)==1 and sum(r['phase']=='copy' and r['details'].get('stage')=='scenario' for r in records)==13,{'metricCount':len(records),'errorCount':sum(r['status']!='ok' for r in records)})
rawFiles=[]
for base in [LOCAL,SMOKE]:
    for path in sorted(base.rglob('*')):
        if not path.is_file() or '__pycache__' in path.parts:continue
        data=path.read_bytes();rawFiles.append({'root':base.name,'path':path.relative_to(base).as_posix(),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
save('input-files-observed.json',{'capturedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'files':rawFiles})
summary={'auditedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'PASS_LIMITED' if all(c['passed'] for c in checks) else 'FAIL','actualDevelop':SHA,'actualTree':TREE,'checkCount':len(checks),'checks':checks,'local':{'startedAt':local['startedAtUtc'],'finishedAt':local['endedAtUtc'],'tap':tap,'actualSkippedLines':skips,'trackedFiles':len(before['files']),'commands':[{'name':c['name'],'exitCode':c['exitCode']} for c in local['commands']]},'freshCanonicalSmoke':{'startedAt':result['startedAt'],'finishedAt':result['finishedAt'],'scenarios':len(scenarios),'commands':len(commands),'actualPython':{'diagram':len(diagram),'LEK':len(lek),'site':len(sitePython)},'siteGeneration':len(siteGen),'siteStatic':[s['siteValidation']['checked']['summary'] for s in site],'exactRoots':rootRows,'originalAndNewIndependentAbsence':True if all(c['passed'] for c in checks) else 'SEE_INDIVIDUAL_CHECKS'},'newOwnerDecisionRequired':False,'nextRecommendation':'After this PASS_LIMITED result and strengthened guarded version script review, execute authorized marketplace8.3.3→8.3.4 DryRun thenApply; keep actualpublished833/HTML38 and governanceNOT_MET separate.','limits':['This is independent evidence re-reading, not another runtime test/installation run. Both root batches retain their own fresh actualdevelop identities and raw failures if any.','Full npm test contains its existing bounded browser unit cases; standalone installation smoke browser is NOT_RUN. No representative GUI/client matrix, Matt interview, native window lifecycle, newSite deployment or effects measurement is inferred.','OldFAIL/rootUNKNOWN/bypass/approvalNOT_MET and D01DEFERRED/limitedOwneracceptance remain separate.','Marketplace pre-bump changes only unpublished preparation and is not release/publication/Owner acceptance.']}
save('summary.json',summary)
print(json.dumps({'status':summary['status'],'actualDevelop':SHA,'checks':len(checks),'passed':sum(c['passed'] for c in checks),'failed':[c['name'] for c in checks if not c['passed']],'localTap':tap,'freshSmoke':{'scenarios':len(scenarios),'commands':len(commands)}},ensure_ascii=False))
sys.exit(0 if summary['status']=='PASS_LIMITED' else 1)
