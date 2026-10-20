import pathlib,subprocess,json,hashlib,datetime,base64
base=pathlib.Path(r'C:/Users/Admin/AppData/Local/Temp/html-learning-274-prebump-pr281-diagnostic-ci/batch-6ef5eabd/a6');repo='MJ-AgentLab/mj-agentlab-marketplace';head='6ef5eabd52934144daf7b60ddb4011686c0657c4'
def utc():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def api(endpoint,name):
    start=utc();p=subprocess.run(['gh','api',endpoint],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if p.returncode:raise RuntimeError(p.stderr.decode('utf8',errors='replace'))
    path=base/name;path.write_bytes(p.stdout);data=path.read_bytes();rec={'endpoint':endpoint,'file':name,'started_at':start,'completed_at':utc(),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'method':'stdout byte buffer; full write closed before hash'}
    (base/(name+'.capture.json')).write_text(json.dumps(rec,indent=2)+'\n',encoding='utf8');return json.loads(data)
pr=json.loads((base/'pr-current.json').read_text(encoding='utf8'));rows=[]
for label,ref in [('base',pr['base']['sha']),('merge',pr['merge_commit_sha'])]:
    content=api(f'repos/{repo}/contents/.github/workflows/a6.yml?ref={ref}',f'workflow-at-{label}.json');data=base64.b64decode(content['content'])
    rows.append({'role':label,'ref':ref,'git_blob_sha':content['sha'],'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
runs=api(f'repos/{repo}/actions/workflows/a6.yml/runs?head_sha={head}&event=pull_request&per_page=100','workflow-current-head-runs.json')
scoped=[r for r in runs['workflow_runs'] if r['head_sha']==head and r['event']=='pull_request'];scoped.sort(key=lambda r:(r['created_at'],r['id']),reverse=True)
print(json.dumps({'workflow_bindings':rows,'scoped_runs':[{'id':r['id'],'head_sha':r['head_sha'],'created_at':r['created_at'],'status':r['status'],'conclusion':r['conclusion']} for r in scoped],'latest_is_requested':bool(scoped) and scoped[0]['id']==39298279721},ensure_ascii=False,indent=2))
(base/'workflow-binding-and-latest-summary.json').write_text(json.dumps({'workflow_bindings':rows,'current_head':head,'scoped_runs':[{'id':r['id'],'head_sha':r['head_sha'],'created_at':r['created_at'],'status':r['status'],'conclusion':r['conclusion']} for r in scoped],'latest_is_requested':bool(scoped) and scoped[0]['id']==39298279721},ensure_ascii=False,indent=2)+'\n',encoding='utf8')
