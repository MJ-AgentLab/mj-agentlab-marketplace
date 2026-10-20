"""Parse only this exact PR281 6ef5eabd completed job provider raw. No older counts as inputs.
ISO log prefixes are removed only in parser text; originals are unchanged. Failures and
NOT_RUN are observations, never converted to success by another platform or local test.
"""
import datetime,hashlib,json,pathlib,re,sys
ROOT=pathlib.Path('C:/Users/Admin/AppData/Local/Temp/html-learning-274-prebump-pr281-diagnostic-ci/batch-6ef5eabd/pr')
HEAD='6ef5eabd52934144daf7b60ddb4011686c0657c4';BASE='4d10a0677c745eccb2775f7ae6176f8e2b1d2387';MERGE='c41dee3c7a14da2c1a94e84643c736d578d9c9fa';TREE='6659fadd62bc03aa3ab4eee61e63804fc25b914b'
platform=sys.argv[1];jobids={'linux':118216308604,'windows':118216308644};assert platform in jobids
read=lambda f:json.loads((ROOT/f).read_text(encoding='utf-8-sig'))
job=read(f'{platform}-job-completed.json');assert job['id']==jobids[platform] and job['status']=='completed'
raw=(ROOT/f'{platform}-job.raw.log').read_bytes();text='\n'.join(re.sub(r'^\d{4}-\d\d-\d\dT\S+Z ', '', line)for line in raw.decode('utf-8-sig').splitlines())
checkouts=re.findall(r'(?m)^.* log -1 --format=%H\s*\n([0-9a-f]{40})\s*$',text);assert checkouts==[MERGE],checkouts
assert 'refs/remotes/pull/281/merge' in text
head=read('head-initial.json');merge=read('merge-initial.json');assert head['sha']==HEAD and merge['sha']==MERGE and head['tree']['sha']==merge['tree']['sha']==TREE and [p['sha']for p in merge['parents']]==[BASE,HEAD]
tap={key:int(value)for key,value in re.findall(r'(?m)^# (tests|suites|pass|fail|cancelled|skipped|todo) (\d+)\s*$',text)}
cases=[{'status':a,'number':int(b),'name':c,'skipped':'# SKIP' in c}for a,b,c in re.findall(r'(?m)^(ok|not ok) (\d+) - ([^\n]+)$',text)]
failed=[c for c in cases if c['status']=='not ok'];skipped=[c for c in cases if c['skipped']]
browser_names=['browser unavailable is NOT_RUN with nonzero exit and a persisted missing-scope record','browser workspace cleanup retries actual late-file ENOTEMPTY and fails closed on persistent writes','actual browser measures mobile/desktop viewport sizes and detects overflow, clipping and extreme wrapping','literal percent, Chinese and spaces in local filenames round-trip through browser URLs']
browser=[c for name in browser_names for c in cases if c['name'].split(' # SKIP')[0]==name]
objects=[];decoder=json.JSONDecoder();offset=0
while offset<len(text):
    m=re.search(r'(?m)^\s*\{',text[offset:])
    if not m:break
    start=offset+m.start()
    while text[start].isspace():start+=1
    try:obj,size=decoder.raw_decode(text[start:]);offset=start+size;objects.append(obj)
    except ValueError:offset=start+1
smokes=[o for o in objects if isinstance(o,dict)and'scenarios'in o];assert len(smokes)<=1
startup=[]
for m in re.finditer('Startup stderr diagnostics: ',text):
    value=text[m.end():];record={'textPrefix':value[:200000]}
    try:obj,size=decoder.raw_decode(value);record={'diagnostics':obj}
    except ValueError as error:record['parseError']=str(error)
    startup.append(record)
steps={s['name']:{'status':s['status'],'conclusion':s['conclusion'],'startedAt':s['started_at'],'completedAt':s['completed_at']}for s in job['steps']}
summary={'schema':1,'parsedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'platform':platform,'runId':39298251581,'attempt':1,'jobId':job['id'],'jobConclusion':job['conclusion'],'batchHead':HEAD,'batchBase':BASE,'actualCheckout':MERGE,'actualCheckoutRef':'refs/remotes/pull/281/merge','checkoutTree':TREE,'potentialMergeIsNotActualMerge':True,'raw':{'file':f'{platform}-job.raw.log','bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()},'tap':tap or None,'tapCaseCount':len(cases),'failedCases':failed,'skippedCases':skipped,'browserCases':browser,'diagnosticRelatedTestCases':[c for c in cases if 'stderr' in c['name']or'Linux exec capture' in c['name']],'newDiagnosticTestCases':[c for c in cases if c['name'].split(' # SKIP')[0] in ['actual Python drains a large stderr stream into a bounded exact tail and byte counters','Linux exec capture preserves original checker args, failure, owned-session cleanup and foreign isolation']],'browserDiagnostics':[o for o in objects if isinstance(o,dict)and o.get('checker')=='artifact-browser-layout'],'startupStderrDiagnostics':startup,'steps':steps,'cleanupCases':[c for c in cases if any(w in c['name'].lower()for w in ['cleanup','cleans','cleaning','temporary','finally','owned session'])],'cleanupScope':{'individualRootAbsence':'NOT_RECORDED','otherBatchRootCountsBorrowed':False},'smoke':None}
if not smokes:
    step=steps.get('Run npm run smoke:codex',{})
    summary['smoke']={'status':'NOT_RUN'if step.get('conclusion')=='skipped'else'NO_COMPLETE_RESULT','scenarios':None,'commands':None,'executionCounts':None}
else:
    smoke=smokes[0];commands=[c for row in smoke['scenarios']for c in row['commands']];resources={};differences=[]
    for i,row in enumerate(smoke['scenarios']):
        for skill,entries in row['installedResources'].items():
            if skill in resources and entries!=resources[skill]:differences.append({'scenario':i,'skill':skill})
            resources[skill]=entries
    count=lambda ending:sum(any(isinstance(a,str)and a.replace('\\','/').endswith(ending)for a in c['args'])for c in commands)
    counts={key:count(end)for key,end in {'diagram':'/scripts/validate_diagram.py','lek':'/scripts/lek.py','siteGeneration':'/scripts/render-site.mjs','siteStatic':'/scripts/check_artifact.py'}.items()}
    sites=[row['siteValidation']for row in smoke['scenarios']if row.get('siteValidation')]
    record={'status':'PASS'if smoke['ok']else'FAIL','scenarios':len(smoke['scenarios']),'allScenariosOk':all(row['ok']for row in smoke['scenarios']),'commands':len(commands),'nonzeroCommands':[{'args':c.get('args'),'status':c.get('status')}for c in commands if c.get('status')!=0],'executionCounts':counts,'cliVersions':sorted({row['version']for row in smoke['scenarios']}),'publicResourceTrees':len(resources),'siteResources':len(resources.get('html-guide-kit:site',{})),'resourceHashCrossScenarioDifferences':differences,'sourceToCacheIdentity':'Completed Harness checks actual platform checkout versus its own installed cache; no cross-platform physical byte equality assertion.','inventory':{key:smoke[key]for key in ['outside','repository','nativeOutside','nativeRepository','explicitOnly']},'siteStaticSummaries':[r['checked']['summary']for r in sites],'siteBrowserChecks':[r.get('browserCheck')for r in sites],'cleanupReturn':{'defaultKeepRoot':False,'successfulReturnAfterCleanup':smoke['ok'],'individualRootAbsence':'NOT_RECORDED'}}
    summary['smoke']=record
    (ROOT/f'{platform}-smoke.json').write_text(json.dumps(smoke,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    (ROOT/f'{platform}-resourcehashes.json').write_text(json.dumps({'sourceRawSha256':summary['raw']['sha256'],'installedResources':resources,'installedPluginResources':smoke['installedPluginResources']},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
summary['verificationIssues']=[]
def require(condition,message):
    if not condition:summary['verificationIssues'].append(message)
require(tap.get('tests')==644 and len(cases)==644,'Expected full actual644 TAP cases')
if job['conclusion']=='success':
    require(tap.get('pass')==643 and tap.get('fail')==0 and tap.get('skipped')==1 and tap.get('cancelled')==0 and tap.get('todo')==0 and not failed,'Successful job must expose actual643P/0F/1skip')
    expected_skip='Windows equivalent file casing still passes containment'if platform=='linux'else'Linux exec capture preserves original checker args, failure, owned-session cleanup and foreign isolation'
    require(len(skipped)==1 and skipped[0]['name'].split(' # SKIP')[0]==expected_skip,'Only actual expected platform-specific skip')
    require(len(browser)==4 and all(c['status']=='ok'and not c['skipped']for c in browser),'Four actual browser cases must each be ok and not skip')
    require(all(steps.get(name,{}).get('conclusion')=='success'for name in ['Unit and real Python execution tests','Run npm run validate','Run npm run check:baseline-tools','Run npm run smoke:codex']),'Full matrix required steps must complete success')
    if smokes:
        r=summary['smoke'];require(r['status']=='PASS'and r['allScenariosOk']and r['scenarios']==13 and r['commands']==178 and not r['nonzeroCommands'],'Actual13/178 all0 commands')
        require(counts=={'diagram':6,'lek':18,'siteGeneration':4,'siteStatic':4},'Actual6/18/4/4 execution counts')
        require(r['cliVersions']==['codex-cli 0.147.0'],'Exact actualCLI baseline')
        require(len(resources)==8 and r['siteResources']==20 and not differences,'Resource8/site20 same-skill hashes stable')
        require(r['inventory']['outside']=={'publicSkills':3,'repositorySkills':0}and r['inventory']['repository']=={'publicSkills':3,'repositorySkills':20}and r['inventory']['nativeOutside']=={'publicSkills':8,'repositorySkills':0}and r['inventory']['nativeRepository']=={'publicSkills':8,'repositorySkills':20}and len(r['inventory']['explicitOnly'])==5,'Actual3natural/5explicit/native8/repo20')
        require(len(sites)==4 and all(r['checked']['status']=='PASS'and r['checked']['summary']['checks']==89 and r['checked']['summary']['failed']==0 for r in sites),'Four actual site static89/89')
    else:require(False,'Successful job missing smoke JSON')
summary['status']='PASS'if job['conclusion']=='success'and not summary['verificationIssues']else'FAIL'
(ROOT/f'{platform}-summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({key:summary[key]for key in ['platform','jobId','status','jobConclusion','tap','failedCases','skippedCases','startupStderrDiagnostics','verificationIssues']}))
