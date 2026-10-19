"""Read exact failed #281 batch logs without replacing failures by newer-head results.
Original log bytes remain unchanged. ISO timestamps are stripped only in parser text.
No smoke count is inferred if the actual smoke step did not execute.
"""
import datetime,hashlib,json,pathlib,re,sys
ROOT=pathlib.Path(sys.argv[1]);HEAD='1d8b6849ec7e398d65a949d204abe38bc64a4e0b';BASE='4d10a0677c745eccb2775f7ae6176f8e2b1d2387';MERGE='4e49503345f814175d0af39ab1ea8e02eb6a6adf';TREE='eefcaa0f1bd4201a38f9d46ff668c28b7d662e8c'
def read(f):return json.loads((ROOT/f).read_text(encoding='utf-8-sig'))
def extract(platform,job_id):
    file=ROOT/f'{platform}-job.log';raw=file.read_bytes();text='\n'.join(re.sub(r'^\d{4}-\d\d-\d\dT\S+Z ','',line) for line in raw.decode('utf-8-sig').splitlines());job=read(f'{platform}-job-completed.json')
    shas=re.findall(r'(?m)^.* log -1 --format=%H\s*\n([0-9a-f]{40})\s*$',text);assert shas==[MERGE],shas
    tap={k:int(v)for k,v in re.findall(r'(?m)^# (tests|suites|pass|fail|cancelled|skipped|todo) (\d+)\s*$',text)}
    cases=[{'status':status,'number':int(n),'name':name,'skipped':'# SKIP' in name}for status,n,name in re.findall(r'(?m)^(ok|not ok) (\d+) - ([^\n]+)$',text)]
    objects=[];decoder=json.JSONDecoder();offset=0
    while offset<len(text):
        m=re.search(r'(?m)^\s*\{',text[offset:])
        if not m:break
        start=offset+m.start()
        while text[start].isspace():start+=1
        try:obj,size=decoder.raw_decode(text[start:]);offset=start+size;objects.append(obj)
        except ValueError:offset=start+1
    smoke=next((o for o in objects if isinstance(o,dict)and'scenarios'in o),None);diagnostics=[o for o in objects if isinstance(o,dict)and o.get('checker')=='artifact-browser-layout'];smoke_step=next((s for s in job['steps']if s['name']=='Run npm run smoke:codex'),None)
    summary={'jobId':job_id,'jobConclusion':job['conclusion'],'logBytes':len(raw),'logSha256':hashlib.sha256(raw).hexdigest(),'actualCheckout':shas[0],'checkoutRef':'refs/remotes/pull/281/merge','tapComplete':bool(tap),'tap':tap or None,'observedCompletedTapCases':len(cases),'failedCases':[c for c in cases if c['status']=='not ok'],'skippedCases':[c for c in cases if c['skipped']],'browserRelatedCases':[c for c in cases if any(w in c['name'].lower()for w in['browser','viewport'])],'browserDiagnostics':diagnostics,'steps':[{'name':s['name'],'status':s['status'],'conclusion':s['conclusion']}for s in job['steps']],'smokeStep':smoke_step,'smoke':None,'cleanupScope':'CI job logs do not provide individual-root absence records. Never borrow a different batch fifteen/fourteen-root result.'}
    if smoke is None:
        summary['smoke']={'status':'NOT_RUN'if smoke_step and smoke_step['conclusion']=='skipped'else'NO_COMPLETE_RESULT','actualScenarios':None,'actualCommands':None,'actualPythonAndSiteCounts':None}
    else:
        commands=[c for row in smoke['scenarios']for c in row['commands']];count=lambda end:sum(any(isinstance(a,str)and a.replace('\\','/').endswith(end)for a in c['args'])for c in commands);counts={'diagram':count('/scripts/validate_diagram.py'),'lek':count('/scripts/lek.py'),'siteGeneration':count('/scripts/render-site.mjs'),'siteStatic':count('/scripts/check_artifact.py')}
        summary['smoke']={'status':'PASS'if smoke.get('ok')else'FAIL','actualScenarios':len(smoke['scenarios']),'actualCommands':len(commands),'actualPythonAndSiteCounts':counts,'cliVersions':sorted({row.get('version')for row in smoke['scenarios']}),'nonzeroCommands':[c for c in commands if c.get('status')!=0],'siteStaticSummaries':[row['siteValidation']['checked']['summary']for row in smoke['scenarios']if row.get('siteValidation')],'sourceCacheIdentity':'Passed each platform checkout against its own installed cache; no cross-platform physical-byte equality asserted.'}
        (ROOT/f'{platform}-smoke.json').write_text(json.dumps(smoke,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    (ROOT/f'{platform}-parsed.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');return summary
run=read('attempt1-pr-run-terminal-rest.json');push=read('attempt1-linux-originals/push-run-rest-at-capture.json');initial=read('pr-initial.json');current=read('pr-final.json');head=read('head-final.json');merge=read('merge-final.json')
assert run['head_sha']==initial['headRefOid']==HEAD and initial['baseRefOid']==BASE
assert head['sha']==HEAD and head['tree']['sha']==merge['tree']['sha']==TREE and merge['sha']==MERGE and [p['sha']for p in merge['parents']]==[BASE,HEAD]
assert run['status']==push['status']=='completed'
summary={'schema':1,'status':'FAIL'if run['conclusion']!='success'else'PASS','extractionStatus':'COMPLETE','extractedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'pr':281,'batchHead':HEAD,'batchBase':BASE,'testedPotentialMerge':MERGE,'testedTree':TREE,'potentialMergeIsNotActualMerge':True,'run':{'id':run['id'],'status':run['status'],'conclusion':run['conclusion'],'attempt':run['run_attempt']},'push':{'id':push['id'],'status':push['status'],'conclusion':push['conclusion'],'attempt':push['run_attempt'],'countedAsIndependentAcceptance':False},'sourceVersions':read('source-versions.json'),'currentPrAtFinal':current,'supersededAsOfFinal':current['headRefOid']!=HEAD,'platforms':{},'initialGate':read('gate-summary-initial.json'),'currentGateAtFinal':read('gate-summary-final.json'),'limits':['Failures remain failures. Local R2/4d10/previous working-tree results cannot replace this failed server batch.','No approve, comment, reviewer request, merge, bypass, rerun or cancellation performed by this agent.','No individual-root cleanup absence evidence is inferred from CI logs.']}
for platform,job in [('linux',118195195093),('windows',118195194932)]:summary['platforms'][platform]=extract(platform,job)
(ROOT/'observed-results.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps({'status':summary['status'],'extractionStatus':'COMPLETE','platforms':{k:{f:v[f]for f in ['jobConclusion','tap','smoke']}for k,v in summary['platforms'].items()}},ensure_ascii=False))

