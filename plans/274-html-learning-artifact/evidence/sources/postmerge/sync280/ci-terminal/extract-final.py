"""Read-only extraction from exact #280 PR run/job metadata and downloaded raw job logs.
Only ISO log timestamps are removed for parsing; original log bytes remain untouched.
TAP totals and skip labels are read from this run, not prior candidates. Smoke JSON
is decoded from full logs, and command argv/status are independently counted.
"""
import datetime,json,pathlib,re,sys
ROOT=pathlib.Path(sys.argv[1])
HEAD='ef85a2de6e39b1981d94d9d4cbc004fbdc71acee'
BASE='65d756efd3024ac10d1d0e6ea189055fbe6f1545'
MERGE='535315f035a5b7a8082a263fedaf9a07aa67e9d7'
TREE='db49629fe767d3584f6ce772ef7bf5cdb52094e1'
def read(name):return json.loads((ROOT/name).read_text(encoding='utf-8-sig'))
def digest(file):
    raw=file.read_bytes()
    return {'file':file.relative_to(ROOT).as_posix(),'bytes':len(raw),'sha256':'DEFERRED_TO_FINAL_MANIFEST_AFTER_PROCESS_EXIT'}
summary={'schemaVersion':1,'runId':39279114820,'pr':280,'expectedHead':HEAD,'expectedBase':BASE,'potentialMerge':MERGE,'expectedTree':TREE,'platforms':{}}
browser_names=['browser unavailable is NOT_RUN with nonzero exit and a persisted missing-scope record','browser workspace cleanup retries actual late-file ENOTEMPTY and fails closed on persistent writes','actual browser measures mobile/desktop viewport sizes and detects overflow, clipping and extreme wrapping','literal percent, Chinese and spaces in local filenames round-trip through browser URLs']

def extract(platform,job):
    file=ROOT/f'{platform}-job.log';raw=file.read_bytes()
    text='\n'.join(re.sub(r'^\d{4}-\d\d-\d\dT\S+Z ', '', line) for line in raw.decode('utf-8-sig').splitlines())
    tap={key:int(value) for key,value in re.findall(r'(?m)^# (tests|suites|pass|fail|cancelled|skipped|todo) (\d+)\s*$',text)}
    checkout_shas=re.findall(r'(?m)^.* log -1 --format=%H\s*\n([0-9a-f]{40})\s*$',text)
    assert checkout_shas==[MERGE],(platform,'actual checked out SHA',checkout_shas)
    assert 'refs/remotes/pull/280/merge' in text
    skipped=re.findall(r'(?m)^ok \d+ - (.*?)(?:\s+# SKIP.*)$',text)
    not_ok=re.findall(r'(?m)^not ok \d+ - (.*)$',text)
    cleanup_cases=[{'name':name,'tapNumber':int(index),'status':status,'skipped':'# SKIP' in name} for status,index,name in re.findall(r'(?m)^(ok|not ok) (\d+) - ([^\n]+)$',text) if any(word in name.lower() for word in ['cleanup','cleans','cleaning','temporary','finally','owned session'])]
    browser=[]
    for name in browser_names:
        matches=re.findall(r'(?m)^(ok|not ok) (\d+) - '+re.escape(name)+r'(?:\s+(# SKIP.*))?$',text)
        assert len(matches)==1,(platform,name,matches)
        status,index,skip=matches[0]
        browser.append({'name':name,'tapNumber':int(index),'status':status,'skipped':bool(skip),'skipReason':skip or None})
    decoder=json.JSONDecoder();offset=0;smoke=None;strict=[]
    while offset<len(text):
        match=re.search(r'(?m)^\s*\{',text[offset:])
        if not match:break
        start=offset+match.start()
        while text[start].isspace():start+=1
        try:
            obj,size=decoder.raw_decode(text[start:]);offset=start+size
            if isinstance(obj,dict) and 'scenarios' in obj:smoke=obj
            if isinstance(obj,dict) and all(key in obj for key in ['ok','errors','repositorySkills','publicSkills']):strict.append(obj)
        except ValueError:offset=start+1
    assert smoke is not None,'missing actual smoke JSON'
    assert len(strict)==1 and strict[0]['ok'] is True and strict[0]['errors']==[] and strict[0]['repositorySkills']==20 and len(strict[0]['publicSkills'])==8,(platform,'actual strict validation JSON',strict)
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
    record={'jobId':job,**digest(file),'tap':tap,'skippedCases':skipped,'notOkCases':not_ok,'browserCases':browser,'cleanupCases':cleanup_cases,'cleanupScope':{'defaultKeepRoot':False,'successfulSmokeReturnAfterCleanup':smoke.get('ok') is True,'individualRootAbsenceRecords':'NOT_RECORDED in this CI log; do not inherit another batch count'},'sourceToInstalledCacheByteChecks':'PASS within each actual platform checkout; no cross-platform physical byte-equality assertion','checkedOutSha':checkout_shas[0],'checkedOutRef':'refs/remotes/pull/280/merge','checkedOutCommitMetadata':'merge-final.json','checkedOutMergeShaPresent':MERGE in text,'smokeOk':smoke.get('ok'),'smokeScenarios':len(smoke['scenarios']),'allScenarioOk':all(row.get('ok') is True for row in smoke['scenarios']),'commands':commands,'cliVersions':cli_versions,'executionCounts':counts,'nonzeroCommands':nonzero,'publicSkills':len(resource_sets),'siteResources':len(resource_sets['html-guide-kit:site']),'allPackageInventory':{key:smoke[key] for key in ['outside','repository','nativeOutside','nativeRepository','explicitOnly']},'siteStaticSummaries':[row['checked']['summary'] for row in site],'siteBrowserScope':[row.get('browserCheck') for row in site],'steps':[{'name':s['name'],'conclusion':s['conclusion'],'number':s['number']} for s in job_meta['steps']]}
    record.update({'checkedOutCommitMetadata':'ci-merge-final.json','strictValidation':strict[0],'cleanupScope':{'invocationWithoutKeepRootFlag':'Run npm run smoke:codex / node scripts/smoke-codex-plugin.mjs without --keep-root in this log','successfulSmokeReturn':smoke.get('ok') is True,'regressionCleanupCases':len(cleanup_cases),'individualRootAbsenceRecords':'NOT_RECORDED','limit':'Regression cleanup cases and successful smoke return do not establish a per-root filesystem-absence inventory. No old fifteen-root count reused.'}})
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
    initial=read('prior-pr-initial.json');final=read('pr-final.json');run=read('run-final.json')
    head=read('head-final.json');merge=read('ci-merge-final.json');actual=read('actual-merge-final.json')
    assert initial['headRefOid']==final['head']['sha']==run['head_sha']==HEAD
    assert initial['baseRefOid']==final['base']['sha']==BASE
    assert initial['potentialMergeCommit']['oid']==merge['sha']==MERGE
    assert head['sha']==HEAD and head['tree']['sha']==merge['tree']['sha']==actual['tree']['sha']==TREE
    assert [p['sha'] for p in merge['parents']]==[BASE,HEAD]
    assert final['merged'] is True and final['merged_at']=='2026-10-19T16:37:27Z' and actual['sha']==final['merge_commit_sha']=='4d10a0677c745eccb2775f7ae6176f8e2b1d2387'
    assert run['id']==39279114820 and run['event']=='pull_request' and run['status']=='completed' and run['conclusion']=='success'
    jobs={job['id']:job for job in read('jobs-final.json')['jobs']}
    for platform,job_id in [('linux',118149991325),('windows',118149991324)]:
        summary['platforms'][platform]=extract(platform,job_id)
        job=jobs[job_id]
        assert job['status']=='completed' and job['conclusion']=='success'
        summary['platforms'][platform].update({'conclusion':job['conclusion'],'completedAt':job['completed_at'],'url':job['html_url']})
    assert summary['platforms']['linux']['tap']['skipped']==1 and summary['platforms']['windows']['tap']['skipped']==0
    assert summary['platforms']['linux']['skippedCases']==['Windows equivalent file casing still passes containment']
    push=read('push-final.json');push_jobs=read('push-jobs-final.json')['jobs']
    assert push['id']==39279043416 and push['event']=='push' and push['head_sha']==HEAD and push['status']=='completed' and push['conclusion']=='success'
    prior=read('prior-queue-handoff.json');queued_at=datetime.datetime.fromisoformat(prior['capturedAt'].replace('Z','+00:00'))
    conflicts=[]
    for source,rows in [('PR',list(jobs.values())),('push',push_jobs)]:
        for job in rows:
            start=job.get('started_at');end=job.get('completed_at')
            if end and datetime.datetime.fromisoformat(end.replace('Z','+00:00'))<queued_at:
                conflicts.append({'source':source,'jobId':job['id'],'name':job['name'],'kind':'completedAt earlier than prior observed queued API snapshot','priorObservedQueuedAt':prior['capturedAt'],'nowReturnedStartedAt':start,'nowReturnedCompletedAt':end})
            if start and end and end<start:
                conflicts.append({'source':source,'jobId':job['id'],'name':job['name'],'kind':'completedAt earlier than startedAt in current API fields','nowReturnedStartedAt':start,'nowReturnedCompletedAt':end})
    assert conflicts,'expected timing conflict must not be silently omitted'
    timing={'status':'CONFLICT_RECORDED','priorQueuedSnapshot':{'capturedAt':prior['capturedAt'],'frozenAt':prior['frozenAt'],'runStatus':prior['run']['status'],'pushStatus':prior['push']['status'],'sources':['prior-queue-handoff.json','prior-capture-queue-handoff.json','prior-run-queue-handoff.json','prior-push-queue-handoff.json','prior-queue-manifest.json']},'currentTerminalCapture':'capture-final-receipt.json','conflicts':conflicts,'interpretation':'Prior queued observations and their frozen queue diagnosis are preserved unchanged. Current API backfilled job times conflict with those actual earlier observations; at least one skipped helper also has completedAt before startedAt. These fields cannot reliably establish queue duration or actual start chronology. Cause UNDETERMINED; do not erase prior queue diagnosis or infer a trustworthy schedule from the backfill. Completed raw logs support the bounded execution counts, not a reconstructed queue history.'}
    (ROOT/'timing-conflicts.json').write_text(json.dumps(timing,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    summary.update({'status':'PASS','extractedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'headAndPRBaseUnchanged':True,'ciMergeTreeEqualsHeadAndActualMergeTree':True,'actualMergeSha':actual['sha'],'actualMergeAt':final['merged_at'],'actualMergeEvidenceScope':'PR REST merged state and immutable actual merge metadata; the PR matrix checked out the distinct CI merge SHA, not the later actual merge SHA.','runConclusion':run['conclusion'],'timing':timing,'push':{'id':push['id'],'status':push['status'],'conclusion':push['conclusion'],'event':push['event'],'head':push['head_sha'],'countedAsAdditionalAcceptance':False,'jobs':[{'id':j['id'],'name':j['name'],'status':j['status'],'conclusion':j['conclusion'],'startedAt':j['started_at'],'completedAt':j['completed_at']} for j in push_jobs]},'limitations':['This extraction does not prove current-head non-author approval, thread resolution, publish authorization, Marketplace publication, Owner acceptance or learning effects. Actual merge is separately read from immutable GitHub metadata; no approval, merge or bypass was performed here.','Installation smoke browserCheck remains NOT_RUN; current-run browser unit cases are separately recorded and do not imply new representative consumer, desktop menu or Sites tests.','CI did not record individual-root absence: NOT_RECORDED. No old-batch fifteen-root count, physical cross-platform byte equality or reliable queue/start chronology is inferred.']})
    (ROOT/'summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(summary,ensure_ascii=False,indent=2))
except Exception as error:
    failure={'status':'FAIL','extractedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'runId':39279114820,'pr':280,'error':type(error).__name__,'message':str(error),'partial':summary}
    (ROOT/'extraction-failure.json').write_text(json.dumps(failure,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    raise




