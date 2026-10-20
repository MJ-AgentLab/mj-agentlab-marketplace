from pathlib import Path
import concurrent.futures,datetime,hashlib,importlib.util,json,re,subprocess,sys,zipfile
sys.dont_write_bytecode=True
ROOT=Path(__file__).resolve().parent/'actual-main-ci'
SHA='5898a8192740b39f41263129a5f99efeba96a6cc';TREE='3a68976af95bb5948de17a6fccaabf892becaaca';REPO='MJ-AgentLab/mj-agentlab-marketplace'
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def digest(b):return hashlib.sha256(b).hexdigest()
def write(p,v):
    with p.open('x',encoding='utf-8') as f:f.write(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def capture(d,name,args):
    started=now();r=subprocess.run(args,cwd=ROOT,capture_output=True)
    for key,b in [('stdout',r.stdout),('stderr',r.stderr)]:
        with (d/(name+'.'+key)).open('xb') as f:f.write(b)
    write(d/(name+'.receipt.json'),{'args':args,'startedAt':started,'finishedAt':now(),'exitCode':r.returncode,'stdout':{'bytes':len(r.stdout),'sha256':digest(r.stdout)},'stderr':{'bytes':len(r.stderr),'sha256':digest(r.stderr)}})
    assert r.returncode==0,(name,r.returncode,r.stderr.decode(errors='replace'))
    return r.stdout
def api(d,name,path):return json.loads(capture(d,name,['gh','api','repos/'+REPO+'/'+path]))
mode=sys.argv[1];assert mode in ['snapshot','download','finalize']
if mode=='snapshot':
    prior=sorted(ROOT.glob('snapshot-*/summary.json'))
    if prior:
        latest=json.loads(prior[-1].read_bytes());assert (datetime.datetime.now(datetime.timezone.utc)-datetime.datetime.fromisoformat(latest['capturedAt'])).total_seconds()>=60,'snapshot spacing >=60sec'
    d=ROOT/('snapshot-'+datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%S%fZ'));d.mkdir()
    runs=api(d,'head-push-runs','actions/runs?head_sha='+SHA+'&event=push&per_page=100');assert runs['total_count']==len(runs['workflow_runs'])<=100
    candidates=[r for r in runs['workflow_runs'] if r['path']=='.github/workflows/ci.yml' and r['head_branch']=='main']
    assert len(candidates)==1,[(r['id'],r['path'],r['status'],r['run_attempt']) for r in candidates]
    r=candidates[0];assert r['head_sha']==SHA and r['event']=='push' and r['run_attempt']==1
    jobs=api(d,'jobs','actions/runs/'+str(r['id'])+'/attempts/1/jobs?per_page=100');assert jobs['total_count']==len(jobs['jobs'])<=100
    c=api(d,'commit','git/commits/'+SHA);assert c['sha']==SHA and c['tree']['sha']==TREE
    value={'capturedAt':now(),'runId':r['id'],'head':SHA,'tree':TREE,'run':r,'jobs':jobs['jobs']};write(d/'summary.json',value)
    print(json.dumps({'capturedAt':value['capturedAt'],'runId':r['id'],'status':r['status'],'conclusion':r['conclusion'],'jobs':[{k:j[k] for k in ['id','name','status','conclusion']} for j in jobs['jobs']]}))
elif mode=='download':
    last=json.loads(sorted(ROOT.glob('snapshot-*/summary.json'))[-1].read_bytes());runid=last['runId']
    assert last['run']['status']=='completed','wait for natural terminal'
    d=ROOT/'download-attempt1';d.mkdir(exist_ok=False)
    r=api(d,'run','actions/runs/'+str(runid)+'/attempts/1');assert r['head_sha']==SHA and r['head_branch']=='main' and r['event']=='push' and r['path']=='.github/workflows/ci.yml' and r['run_attempt']==1 and r['status']=='completed'
    jobs=api(d,'jobs','actions/runs/'+str(runid)+'/attempts/1/jobs?per_page=100');assert jobs['total_count']==len(jobs['jobs'])<=100
    capture(d,'archive',['gh','api','repos/'+REPO+'/actions/runs/'+str(runid)+'/attempts/1/logs'])
    capture(d,'aggregate-log',['gh','run','view',str(runid),'--attempt','1','--repo',REPO,'--log'])
    def job(j):
        p=d/('job-'+str(j['id']));p.mkdir();m=api(p,'job','actions/jobs/'+str(j['id']));assert m['run_id']==runid and m['run_attempt']==1
        if j['conclusion']!='skipped':capture(p,'log',['gh','api','repos/'+REPO+'/actions/jobs/'+str(j['id'])+'/logs'])
        return {k:j[k] for k in ['id','name','status','conclusion']}
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:out=list(executor.map(job,jobs['jobs']))
    write(d/'summary.json',{'capturedAt':now(),'runId':runid,'runConclusion':r['conclusion'],'jobs':out});print(json.dumps({'runId':runid,'conclusion':r['conclusion'],'jobs':out}))
else:
    last=json.loads(sorted(ROOT.glob('snapshot-*/summary.json'))[-1].read_bytes());d=ROOT/'download-attempt1';done=json.loads((d/'summary.json').read_bytes());run=json.loads((d/'run.stdout').read_bytes())
    assert run['id']==last['runId']==done['runId'] and run['status']=='completed' and run['conclusion']=='success' and run['run_attempt']==1
    assert run['head_sha']==SHA and run['head_branch']=='main' and run['event']=='push'
    spec=importlib.util.spec_from_file_location('main_ci_matrix',ROOT/'parse-matrix.py');p=importlib.util.module_from_spec(spec);spec.loader.exec_module(p)
    matrices=[];structures=[];cancel=[];proof=[]
    for f in d.glob('job-*/job.stdout'):
        meta=json.loads(f.read_bytes());assert meta['status']=='completed' and meta['conclusion'] in ['success','skipped']
        if meta['conclusion']=='skipped':continue
        raw=f.with_name('log.stdout').read_bytes();text=p.clean(raw.decode('utf-8-sig'))
        if meta['name'].startswith('Baseline compat ('):
            j=p.parse_matrix(f);assert j['actualCheckout']==SHA and j['conclusion']=='success' and j['runAttempt']==1
            assert j['testCounts']=={'tests':652,'pass':651,'fail':0,'cancelled':0,'skipped':1,'todo':0}
            assert j['scenarioCount']==13 and j['scenarioCommandCount']==178 and j['commandStatuses']=={'0':178}
            assert {k:v['count'] for k,v in j['actualCheckerCommands'].items()}=={'validate_diagram.py':6,'lek.py':18,'render-site.mjs':4,'check_artifact.py':4}
            assert len(j['siteStaticSummaries'])==4 and all(s['checks']==96 and s['failed']==0 for s in j['siteStaticSummaries'])
            assert j['exactCli01470'] and j['learningPythonVersions'] and j['pythonVersionDiagnosticLines'] and len(j['skips'])==1
            smoke=j.pop('smokeObject');write(f.with_name('smoke-derived.json'),smoke);j['sourceTree']=TREE;j['newActualExecution']=True;matrices.append(j)
        if meta['name']=='Validate Structure':
            start=re.search(r'(?m)^\{\n  "ok": true,\n  "errors": \[\],\n  "repositorySkills":',text);assert start
            val,_=json.JSONDecoder().raw_decode(text[start.start():]);assert val['ok'] and val['errors']==[] and val['repositorySkills']==20 and len(val['publicSkills'])==8
            structures.append({'jobId':meta['id'],'rawLog':f.with_name('log.stdout').relative_to(ROOT).as_posix(),'portableValidation':val})
        proof.extend(json.loads(s) for s in re.findall(r'(?m)^MJ_PR5_DEDUP_REPORT (\{.*\})$',text))
        cancel.extend(json.loads(s) for s in re.findall(r'(?m)^(\{"status":"(?:complete|no_action|no_further_cancellation)".*\})$',text))
    assert len(matrices)==2 and len(structures)==1 and len({j['id'] for j in matrices})==2
    assert len(proof)==1 and proof[0]['skipPush'] is False
    if cancel:assert all(not c['cancellationRequests'] for c in cancel)
    archive=d/'archive.stdout'
    with zipfile.ZipFile(archive) as z:
        assert z.testzip() is None
        entries=[{'path':i.filename,'bytes':i.file_size,'sha256':digest(z.read(i))} for i in z.infolist()]
    receipts=[]
    for f in ROOT.rglob('*.receipt.json'):
        r=json.loads(f.read_bytes());assert r['exitCode']==0
        for key in ['stdout','stderr']:
            b=f.with_name(f.name.removesuffix('.receipt.json')+'.'+key).read_bytes();assert r[key]=={'bytes':len(b),'sha256':digest(b)}
        receipts.append(f.relative_to(ROOT).as_posix())
    summary={'status':'PASS_WITH_EXPLICIT_PLATFORM_SKIPS','capturedAt':now(),'head':SHA,'tree':TREE,'runId':run['id'],'event':'push','branch':'main','attempt':1,'matrix':matrices,'newActualExecutions':2,'inheritedExecutions':0,'structure':structures,'pushDedupProof':proof,'cancellationReports':cancel,'archive':{'path':'download-attempt1/archive.stdout','bytes':archive.stat().st_size,'sha256':digest(archive.read_bytes()),'entries':entries},'rawReceiptCount':len(receipts),'scope':'Read-only audit of already-existing actual-main push CI. No workflow started, rerun, cancellation, approval, merge or repository mutation. Actual checkout exact main merge SHA; not inherited from PR291 head or potential merge. CI source/install checks do not replace separately recorded host/index/worktree/15-root guards in external canonical install batches.','nextRecommendation':'Combine actual-main local and canonical evidence; wait for both full inventories to be released before the separately prepared real-tag batch.'}
    write(ROOT/'terminal-summary.json',summary)
    rows=[]
    for f in sorted((f for f in ROOT.rglob('*') if f.is_file()),key=lambda f:f.relative_to(ROOT).as_posix()):
        b=f.read_bytes();rows.append({'path':f.relative_to(ROOT).as_posix(),'bytes':len(b),'sha256':digest(b)})
    freeze=ROOT.with_name('actual-main-ci-freeze.json');write(freeze,{'root':str(ROOT),'frozenAt':now(),'fileCount':len(rows),'files':rows})
    assert sorted(f.relative_to(ROOT).as_posix() for f in ROOT.rglob('*') if f.is_file())==[r['path'] for r in rows]
    for r in rows:
        b=(ROOT/r['path']).read_bytes();assert len(b)==r['bytes'] and digest(b)==r['sha256']
    print(json.dumps({'status':summary['status'],'runId':run['id'],'matrices':2,'fileCount':len(rows),'freezeSha256':digest(freeze.read_bytes())}))
