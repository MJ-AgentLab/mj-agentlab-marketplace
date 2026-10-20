"""Read only a completed root-run actual629 canonical batch. No tests or API calls.
Require full worktree restoration and strict ENOENT absence, beyond root boolean receipt.
"""
import datetime,hashlib,json,pathlib,re,subprocess,sys
RUN=pathlib.Path('C:/Users/Admin/AppData/Local/Temp/html-learning-274-prebump281-postmerge-6294');OUT=pathlib.Path('C:/Users/Admin/AppData/Local/Temp/html-learning-274-prebump281-finalreview/terminal-audit');HOST=pathlib.Path('C:/Users/Admin/.codex/worktrees/html-learning-artifact/develop');SHA='62945150df984e2747684d1ea46b8772b56db2d9';TREE='6659fadd62bc03aa3ab4eee61e63804fc25b914b'
read=lambda n:json.loads((RUN/n).read_text(encoding='utf-8-sig'))
assert (RUN/'final-manifest.json').is_file(),'Root terminal manifest not present; do not read in-flight batch as terminal'
manifest=read('final-manifest.json');assert manifest['canonicalSha']==SHA and manifest['canonicalTree']==TREE and manifest['status']=='PASS'
input_rows=[]
for e in manifest['files']:
    f=RUN/e['file'];b=f.read_bytes();assert len(b)==e['bytes'] and hashlib.sha256(b).hexdigest()==e['sha256'],e['file'];input_rows.append({'file':e['file'],'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()})
assert not (RUN/'failure.json').exists(),'An actual failure artifact exists; classify it before any success claim'
meta=read('execution-metadata.json');summary=read('summary.json');terminal=read('terminal-receipt.json');raw=read('raw-result.json');commit=read('canonical-commit-start.json');log=read('execution.log')
assert meta['canonicalSha']==summary['canonicalSha']==terminal['canonicalSha']==commit['sha']==SHA and meta['canonicalTree']==summary['canonicalTree']==terminal['canonicalTree']==commit['tree']['sha']==TREE
assert meta['hostHeadAtStart']==summary['hostHeadAtStart']==summary['hostHeadAtEnd']==SHA and meta['hostBranchAtStart']==summary['hostBranchAtStart']==summary['hostBranchAtEnd']==''
assert meta['sourceGate']['state']=='MERGED' and meta['sourceGate']['mergeCommit']==meta['sourceGate']['develop']==SHA
stamp=lambda x:datetime.datetime.fromisoformat(x.replace('Z','+00:00'))
assert stamp(meta['startedAt'])>stamp(meta['sourceGate']['mergedAt']) and stamp(summary['completedAt'])>stamp(meta['startedAt'])
assert log['startedAt']==summary['startedAt']==meta['startedAt'] and log['completedAt']==summary['completedAt'] and log['canonicalSha']==SHA and log['status']=='PASS'
scenarios=raw['scenarios'];commands=[c for s in scenarios for c in s['commands']];count=lambda end:sum(any(isinstance(a,str)and a.replace('\\','/').endswith(end)for a in c['args'])for c in commands)
counts={'scenarios':len(scenarios),'commands':len(commands),'diagram':count('/scripts/validate_diagram.py'),'lek':count('/scripts/lek.py'),'render':count('/scripts/render-site.mjs'),'static':count('/scripts/check_artifact.py')}
assert list(counts.values())==[13,178,6,18,4,4] and all(c['status']==0 for c in commands) and raw['ok'] and all(s['ok'] and s['version']=='codex-cli 0.147.0' for s in scenarios)
resources={};resource_occurrences=[]
for i,s in enumerate(scenarios):
    for skill,entries in s['installedResources'].items():
        if skill in resources:assert resources[skill]==entries,(i,skill)
        resources[skill]=entries;resource_occurrences.append({'scenario':i,'skill':skill,'resources':len(entries)})
assert len(resources)==8 and len(resources['html-guide-kit:site'])==20 and len(resources['html-guide-kit:guide'])==4
last=scenarios[-1];assert last['outside']=={'publicSkills':3,'repositorySkills':0} and last['repository']=={'publicSkills':3,'repositorySkills':20} and last['nativeOutside']=={'publicSkills':8,'repositorySkills':0} and last['nativeRepository']=={'publicSkills':8,'repositorySkills':20} and len(last['explicitOnly'])==5
sites=[s['siteValidation']for s in scenarios if s.get('siteValidation')];assert len(sites)==4 and all(s['checked']['status']=='PASS'and s['checked']['summary']['failed']==0 and s['checked']['summary']['checks']==89 for s in sites)
perf_files=list((RUN/'perf').glob('*.ndjson'));assert len(perf_files)==1;perf=[json.loads(l)for l in perf_files[0].read_text(encoding='utf-8').splitlines()if l];assert all(e['status']=='ok'for e in perf)
first=[e for e in perf if e['phase']=='copy'and e['details'].get('stage')=='template'];copies=[e for e in perf if e['phase']=='copy'and e['details'].get('stage')=='scenario'];assert len(first)==1 and len(copies)==13
roots=[pathlib.Path(e['details']['destinationRoot']).parent for e in copies]+[pathlib.Path(first[0]['details']['sourceRoot']).parent,pathlib.Path(first[0]['details']['destinationRoot']).parent]
normalized=[str(p.resolve(strict=False)).casefold()for p in roots];assert len(roots)==len(set(normalized))==15
import tempfile
TEMP=pathlib.Path(tempfile.gettempdir()).resolve();root_receipts=[]
for p in roots:
    absolute=p.resolve(strict=False);relative=absolute.relative_to(TEMP);assert str(relative)not in ['', '.']
    assert absolute.name.startswith(('marketplace-smoke-','release-install-')),str(p)
    try:p.lstat()
    except FileNotFoundError:root_receipts.append({'path':str(p),'normalizedPath':str(absolute),'status':'ABSENT','evidence':'lstat raised FileNotFoundError; not a swallowed permission error'})
    else:raise AssertionError('Owned root remains: '+str(p))
cleanup=[e for e in perf if e['phase']=='cleanup'];assert len(cleanup)==15
run_git=lambda a:subprocess.run(['git',*a],cwd=HOST,capture_output=True,check=True).stdout.decode('utf-8').strip()
head=run_git(['rev-parse','HEAD']);branch=run_git(['branch','--show-current']);status=run_git(['status','--porcelain=v1']);worktrees=run_git(['worktree','list','--porcelain']);assert head==SHA and branch=='' and not status
assert worktrees==meta['beforeWorktrees']==summary['cleanup']['afterWorktrees']==terminal['cleanup']['afterWorktrees']
assert terminal['cleanup']['completeWorktreeListEqualsBefore'] is True and not summary['cleanup']['newCanonicalRegistrations'] and not summary['cleanup']['ownCanonicalRegistered']
canonical=str(pathlib.Path(first[0]['details']['sourceRoot']).resolve(strict=False)).replace('\\','/').casefold();registered=[l[9:].replace('\\','/').casefold()for l in worktrees.splitlines()if l.startswith('worktree ')];assert canonical not in registered
receipt={'schema':1,'verifiedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'PASS','executionRole':'root ran fresh actual629 canonical; this agent independently verified immutable originals and actual terminal filesystem/Git state','canonicalSha':SHA,'canonicalTree':TREE,'startedAt':meta['startedAt'],'completedAt':summary['completedAt'],'startedAfterActualMerge':True,'counts':counts,'allCommandStatuses':[0],'cli':'codex-cli 0.147.0','resourceTrees':len(resources),'siteResources':20,'guideResources':4,'resourceOccurrences':resource_occurrences,'inventory':{k:last[k]for k in ['outside','repository','nativeOutside','nativeRepository','explicitOnly']},'siteStaticSummaries':[s['checked']['summary']for s in sites],'siteBrowserChecks':[s.get('browserCheck')for s in sites],'cleanup':{'uniqueRoots':15,'events':len(cleanup),'roots':root_receipts,'strictAbsenceAll15':True,'completeWorktreeListRestored':True,'hostDetachedActual629':True,'hostClean':True,'canonicalNotRegistered':True,'beforeWorktrees':meta['beforeWorktrees'],'actualAfterWorktrees':worktrees},'inputManifestSha256':hashlib.sha256((RUN/'final-manifest.json').read_bytes()).hexdigest(),'inputRowsVerified':input_rows,'limits':['No new tests, model, desktop, representative browser/Sites or Owner acceptance was executed by this independent audit.','Installation smoke browser remainsNOT_RUN, protected approval/bypass records remain separate.','Root source/exit observations and independent actual terminal checks are distinguished; no prior candidate counts borrowed.']}
OUT.mkdir(exist_ok=True);(OUT/'receipt.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');(OUT/'resourcehashes.json').write_text(json.dumps(resources,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
for file in ['execution-metadata.json','summary.json','terminal-receipt.json','final-manifest.json']:(OUT/('root-original-'+file)).write_bytes((RUN/file).read_bytes())
print(json.dumps({'status':'PASS','counts':counts,'15UniqueStrictAbsent':True,'worktreesRestored':True,'rootManifestSha256':receipt['inputManifestSha256'],'receiptSha256':hashlib.sha256((OUT/'receipt.json').read_bytes()).hexdigest()}))
