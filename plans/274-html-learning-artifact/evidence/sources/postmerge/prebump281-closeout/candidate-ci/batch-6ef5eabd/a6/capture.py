import subprocess,pathlib,json,hashlib,datetime
base=pathlib.Path(r'C:/Users/Admin/AppData/Local/Temp/html-learning-274-prebump-pr281-diagnostic-ci/batch-6ef5eabd/a6');repo='MJ-AgentLab/mj-agentlab-marketplace'
def utc():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def api(endpoint,name):
    start=utc();p=subprocess.run(['gh','api',endpoint],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if p.returncode:raise RuntimeError(p.stderr.decode('utf8',errors='replace'))
    path=base/name;path.write_bytes(p.stdout);data=path.read_bytes()
    rec={'endpoint':endpoint,'file':name,'started_at':start,'completed_at':utc(),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'method':'gh api stdout bytes, full write closes before read/hash'}
    (base/(name+'.capture.json')).write_text(json.dumps(rec,indent=2)+'\n',encoding='utf8');return json.loads(data)
runs=[]
for rid,label in [(39298279721,'latest'),(39298251724,'old')]:
    run=api(f'repos/{repo}/actions/runs/{rid}',f'{label}-run.json');jobs=api(f'repos/{repo}/actions/runs/{rid}/attempts/{run["run_attempt"]}/jobs?per_page=100',f'{label}-jobs.json')
    runs.append({'label':label,'run_id':rid,'attempt':run['run_attempt'],'event':run['event'],'path':run['path'],'head_sha':run['head_sha'],'status':run['status'],'conclusion':run['conclusion'],'jobs':[{k:j[k] for k in ('id','name','status','conclusion','created_at','started_at','completed_at')} for j in jobs['jobs']]})
pr=api(f'repos/{repo}/pulls/281','pr-current.json');body=pr['body'] or '';bodybytes=body.encode('utf8');(base/'pr-body.raw.txt').write_bytes(bodybytes)
print(json.dumps({'captured_at':utc(),'runs':runs,'pr':{'number':pr['number'],'title':pr['title'],'head_sha':pr['head']['sha'],'base_sha':pr['base']['sha'],'updated_at':pr['updated_at'],'body_utf8_bytes':len(bodybytes),'body_sha256':hashlib.sha256(bodybytes).hexdigest()}},ensure_ascii=False,indent=2))
