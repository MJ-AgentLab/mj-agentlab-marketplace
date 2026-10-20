import subprocess,pathlib,json,hashlib,datetime
base=pathlib.Path(r'C:/Users/Admin/AppData/Local/Temp/html-learning-274-prebump-pr281-diagnostic-ci/batch-6ef5eabd/push'); repo='MJ-AgentLab/mj-agentlab-marketplace';runid=39298245127
def utc():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def api(endpoint,name):
    start=utc();p=subprocess.run(['gh','api',endpoint],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if p.returncode:raise RuntimeError(p.stderr.decode('utf8',errors='replace'))
    path=base/name;path.write_bytes(p.stdout);data=path.read_bytes()
    return json.loads(data),{'endpoint':endpoint,'file':name,'started_at':start,'completed_at':utc(),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
run,rr=api(f'repos/{repo}/actions/runs/{runid}',f'run-{stamp}.json')
attempt=run['run_attempt'];jobs,jr=api(f'repos/{repo}/actions/runs/{runid}/attempts/{attempt}/jobs?per_page=100',f'jobs-{stamp}.json')
(base/f'capture-{stamp}.json').write_text(json.dumps({'captured_at':utc(),'method':'gh api stdout bytes; write closed before hash','run':rr,'jobs':jr},indent=2)+'\n',encoding='utf8')
print(json.dumps({'captured_at':utc(),'run_id':run['id'],'run_attempt':attempt,'head_sha':run['head_sha'],'event':run['event'],'status':run['status'],'conclusion':run['conclusion'],'run_file':rr['file'],'jobs_file':jr['file'],'jobs':[{k:j[k] for k in ('id','name','status','conclusion','created_at','started_at','completed_at')}|{'active_steps':[s['name'] for s in j['steps'] if s['status']=='in_progress']} for j in jobs['jobs']]},ensure_ascii=False,indent=2))
