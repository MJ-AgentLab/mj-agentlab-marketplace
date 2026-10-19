"""Read-only extraction from exact #281 PR run/job metadata and downloaded raw job logs.
Only ISO log timestamps are removed for parsing; original log bytes remain untouched.
TAP totals and skip labels are read from this run, not prior candidates. Smoke JSON
is decoded from full logs, and command argv/status are independently counted.
"""
import datetime,hashlib,json,pathlib,re,sys
ROOT=pathlib.Path(sys.argv[1])
HEAD='1d8b6849ec7e398d65a949d204abe38bc64a4e0b'
BASE='4d10a0677c745eccb2775f7ae6176f8e2b1d2387'
MERGE='4e49503345f814175d0af39ab1ea8e02eb6a6adf'
TREE='eefcaa0f1bd4201a38f9d46ff668c28b7d662e8c'
def read(name):return json.loads((ROOT/name).read_text(encoding='utf-8-sig'))
def digest(file):
    raw=file.read_bytes()
    return {'file':file.relative_to(ROOT).as_posix(),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}
summary={'schemaVersion':1,'runId':39292125277,'pr':281,'expectedHead':HEAD,'expectedBase':BASE,'potentialMerge':MERGE,'expectedTree':TREE,'platforms':{}}
browser_names=['browser unavailable is NOT_RUN with nonzero exit and a persisted missing-scope record','browser workspace cleanup retries actual late-file ENOTEMPTY and fails closed on persistent writes','actual browser measures mobile/desktop viewport sizes and detects overflow, clipping and extreme wrapping','literal percent, Chinese and spaces in local filenames round-trip through browser URLs']

def extract(platform,job):
    file=ROOT/f'{platform}-job.log';raw=file.read_bytes()
    text='\n'.join(re.sub(r'^\d{4}-\d\d-\d\dT\S+Z ', '', line) for line in raw.decode('utf-8-sig').splitlines())
    tap={key:int(value) for key,value in re.findall(r'(?m)^# (tests|suites|pass|fail|cancelled|skipped|todo) (\d+)\s*$',text)}
    checkout_shas=re.findall(r'(?m)^.* log -1 --format=%H\s*\n([0-9a-f]{40})\s*$',text)
    assert checkout_shas==[MERGE],(platform,'actual checked out SHA',checkout_shas)
    assert 'refs/remotes/pull/281/merge' in text
    skipped=re.findall(r'(?m)^ok \d+ - (.*?)(?:\s+# SKIP.*)$',text)
    not_ok=re.findall(r'(?m)^not ok \d+ - (.*)$',text)
    cleanup_cases=[{'name':name,'tapNumber':int(index),'status':status,'skipped':'# SKIP' in name} for status,index,name in re.findall(r'(?m)^(ok|not ok) (\d+) - ([^\n]+)$',text) if any(word in name.lower() for word in ['cleanup','cleans','cleaning','temporary','finally','owned session'])]
    browser=[]
    for name in browser_names:
        matches=re.findall(r'(?m)^(ok|not ok) (\d+) - '+re.escape(name)+r'(?:\s+(# SKIP.*))?$',text)
        assert len(matches)==1,(platform,name,matches)
        status,index,skip=matches[0]
        browser.append({'name':name,'tapNumber':int(index),'status':status,'skipped':bool(skip),'skipReason':skip or None})
    decoder=json.JSONDecoder();offset=0;smoke=None
    while offset<len(text):
        match=re.search(r'(?m)^\s*\{',text[offset:])
        if not match:break
        start=offset+match.start()
        while text[start].isspace():start+=1
        try:
            obj,size=decoder.raw_decode(text[start:]);offset=start+size
            if isinstance(obj,dict) and 'scenarios' in obj:smoke=obj
        except ValueError:offset=start+1
    assert smoke is not None,'missing actual smoke JSON'
    counts={'diagramPython':0,'lekPython':0,'siteGeneration':0,'siteStaticPython':0}
    endings={'diagramPython':'validate_diagram.py','lekPython':'/scripts/lek.py','siteGeneration':'render-site.mjs','siteStaticPython':'check_artifact.py'}
    nonzero=[];commands=0;resource_sets={}
    for index,scenario in enumerate(smoke['scenarios']):
        for skill,resources in scenario['installedResources'].items():
            if skill in resource_sets:assert resource_sets[skill]==resources,(platform,skill,'resource mismatch')
            resource_sets[skill]=resources
        for command in scenario.get('commands',[]):
            commands+=1
            for argument in command.get('args',[]):
                if isinstance(argument,str):
                    for key,ending in endings.items():
                        if argument.replace('\\','/').endswith(ending):counts[key]+=1
            if command.get('status')!=0:nonzero.append({'scenario':index,'status':command.get('status')})
    cli_versions=sorted({row.get('version') for row in smoke['scenarios']})
    assert cli_versions==['codex-cli 0.147.0'],cli_versions
    site=[row['siteValidation'] for row in smoke['scenarios'] if row.get('siteValidation')]
    job_meta=read(f'{platform}-job-completed.json')
    record={'jobId':job,**digest(file),'tap':tap,'skippedCases':skipped,'notOkCases':not_ok,'browserCases':browser,'cleanupCases':cleanup_cases,'cleanupScope':{'defaultKeepRoot':False,'successfulSmokeReturnAfterCleanup':smoke.get('ok') is True,'individualRootAbsenceRecords':'NOT_RECORDED in this CI log; do not inherit another batch count'},'sourceToInstalledCacheByteChecks':'PASS within each actual platform checkout; no cross-platform physical byte-equality assertion','checkedOutSha':checkout_shas[0],'checkedOutRef':'refs/remotes/pull/281/merge','checkedOutCommitMetadata':'merge-final.json','checkedOutMergeShaPresent':MERGE in text,'smokeOk':smoke.get('ok'),'smokeScenarios':len(smoke['scenarios']),'allScenarioOk':all(row.get('ok') is True for row in smoke['scenarios']),'commands':commands,'cliVersions':cli_versions,'executionCounts':counts,'nonzeroCommands':nonzero,'publicSkills':len(resource_sets),'siteResources':len(resource_sets['html-guide-kit:site']),'allPackageInventory':{key:smoke[key] for key in ['outside','repository','nativeOutside','nativeRepository','explicitOnly']},'siteStaticSummaries':[row['checked']['summary'] for row in site],'siteBrowserScope':[row.get('browserCheck') for row in site],'steps':[{'name':s['name'],'conclusion':s['conclusion'],'number':s['number']} for s in job_meta['steps']]}
    assert tap['tests']==642 and tap['fail']==0 and tap['cancelled']==0 and tap['todo']==0,tap
    assert tap['skipped']==len(skipped) and not not_ok
    assert all(row['status']=='ok' and not row['skipped'] for row in browser),browser
    assert record['smokeOk'] and record['allScenarioOk'] and record['smokeScenarios']==13
    assert counts=={'diagramPython':6,'lekPython':18,'siteGeneration':4,'siteStaticPython':4}
    assert commands==178 and record['siteResources']==20 and record['publicSkills']==8
    assert record['checkedOutMergeShaPresent']
    assert not nonzero and len(site)==4 and all(row['checked']['status']=='PASS' and row['checked']['summary']['failed']==0 and row['checked']['summary']['checks']==89 for row in site)
    (ROOT/f'{platform}-smoke.json').write_text(json.dumps(smoke,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    return record

try:
    source_versions=read('source-versions.json')
    assert source_versions['head']==HEAD and source_versions['marketplace']=='8.3.3'
    assert source_versions['plugins']=={'diagram-kit':'0.3.1','learning-evidence-kit':'0.1.0','explain-kit':'0.1.1','html-guide-kit':'0.1.37','communication-kit':'0.1.0'}
    summary['sourceVersions']=source_versions
    initial=read('pr-initial.json');final=read('pr-final.json');run=read('run-final.json')
    head=read('head-final.json');merge=read('merge-final.json')
    assert initial['headRefOid']==final['headRefOid']==run['headSha']==HEAD
    assert initial['baseRefOid']==final['baseRefOid']==BASE
    assert initial['potentialMergeCommit']['oid']==final['potentialMergeCommit']['oid']==merge['sha']==MERGE
    assert head['sha']==HEAD and head['tree']['sha']==merge['tree']['sha']==TREE
    assert [p['sha'] for p in merge['parents']]==[BASE,HEAD]
    assert run['databaseId']==39292125277 and run['event']=='pull_request' and run['status']=='completed' and run['conclusion']=='success'
    jobs={job['databaseId']:job for job in run['jobs']}
    for platform,job_id in [('linux',118195195093),('windows',118195194932)]:
        summary['platforms'][platform]=extract(platform,job_id)
        job=jobs[job_id]
        assert job['status']=='completed' and job['conclusion']=='success'
        summary['platforms'][platform].update({'conclusion':job['conclusion'],'completedAt':job['completedAt'],'url':job['url']})
    assert summary['platforms']['linux']['tap']['skipped']==1 and summary['platforms']['windows']['tap']['skipped']==0
    assert summary['platforms']['linux']['skippedCases']==['Windows equivalent file casing still passes containment']
    summary.update({'status':'PASS','extractedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'headAndBaseUnchanged':True,'mergeTreeEqualsHeadTree':True,'runConclusion':run['conclusion'],'limitations':['The matrix does not replace protected current-head non-author approval, thread resolution, actual merge, publication, or Owner acceptance.','The actual browser unit case exercises desktop/mobile layout and induced overflow/clipping/wrapping. Installation smoke browserCheck remains NOT_RUN; no representative consumer, desktop menu, Sites access-scope or learning-effect test is inferred from this matrix.']})
    (ROOT/'summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(summary,ensure_ascii=False,indent=2))
except Exception as error:
    failure={'status':'FAIL','extractedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'runId':39292125277,'pr':281,'error':type(error).__name__,'message':str(error),'partial':summary}
    (ROOT/'extraction-failure.json').write_text(json.dumps(failure,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    raise





