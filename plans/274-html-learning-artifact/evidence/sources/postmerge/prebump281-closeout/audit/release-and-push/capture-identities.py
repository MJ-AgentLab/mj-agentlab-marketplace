import subprocess,pathlib,json,hashlib,datetime
base=pathlib.Path(r'C:/Users/Admin/AppData/Local/Temp/html-learning-274-prebump281-postmerge-audit/release-and-push');repo='MJ-AgentLab/mj-agentlab-marketplace'
def utc():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def api(endpoint,name,allow_error=False):
    start=utc();p=subprocess.run(['gh','api',endpoint],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    (base/name).write_bytes(p.stdout)
    if p.stderr:(base/(name+'.stderr.txt')).write_bytes(p.stderr)
    rec={'endpoint':endpoint,'file':name,'started_at':start,'completed_at':utc(),'exit_code':p.returncode,'bytes':len(p.stdout),'sha256':hashlib.sha256(p.stdout).hexdigest(),'stderr':p.stderr.decode('utf8',errors='replace')}
    (base/(name+'.capture.json')).write_text(json.dumps(rec,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    if p.returncode and not allow_error:raise RuntimeError(rec['stderr'])
    return json.loads(p.stdout) if p.stdout else None
rel=api(f'repos/{repo}/releases/417390526','release-417390526.json')
ref=api(f'repos/{repo}/git/ref/tags/v8.3.2','tag-v8.3.2-ref.json');chain=[ref['object']];obj=ref['object']
while obj['type']=='tag':
    tag=api(f'repos/{repo}/git/tags/{obj["sha"]}',f'tag-object-{obj["sha"]}.json');obj=tag['object'];chain.append(obj)
run=api(f'repos/{repo}/actions/runs/39344994194','push-run.json');jobs=api(f'repos/{repo}/actions/runs/39344994194/attempts/{run["run_attempt"]}/jobs?per_page=100','push-jobs.json')
vtag=api(f'repos/{repo}/git/ref/tags/v8.3.3','tag-v8.3.3-response.json',True);vrel=api(f'repos/{repo}/releases/tags/v8.3.3','release-v8.3.3-response.json',True)
summary={'captured_at':utc(),'release':{'id':rel['id'],'tag':rel['tag_name'],'target_commitish':rel['target_commitish'],'draft':rel['draft'],'prerelease':rel['prerelease'],'published_at':rel['published_at'],'body_bytes':len((rel['body'] or '').encode('utf8')),'body_sha256':hashlib.sha256((rel['body'] or '').encode('utf8')).hexdigest()},'v8.3.2_tag_chain':chain,'tag_peeled_commit':obj['sha'],'push_run':{'id':run['id'],'name':run['name'],'event':run['event'],'head_sha':run['head_sha'],'status':run['status'],'conclusion':run['conclusion'],'attempt':run['run_attempt'],'head_tree':run.get('head_commit',{}).get('tree_id')},'push_jobs':[{k:j[k] for k in ['id','name','status','conclusion','started_at','completed_at']} for j in jobs['jobs']],'v8.3.3_tag_response':vtag,'v8.3.3_release_response':vrel}
(base/'initial-identities.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf8');print(json.dumps(summary,ensure_ascii=False,indent=2))
