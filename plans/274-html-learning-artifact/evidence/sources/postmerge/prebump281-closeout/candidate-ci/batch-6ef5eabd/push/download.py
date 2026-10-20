import pathlib,subprocess,json,hashlib,datetime,re
base=pathlib.Path(r'C:/Users/Admin/AppData/Local/Temp/html-learning-274-prebump-pr281-diagnostic-ci/batch-6ef5eabd/push');repo='MJ-AgentLab/mj-agentlab-marketplace'
def utc():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def api(endpoint,name,asjson=False):
    start=utc();p=subprocess.run(['gh','api',endpoint],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if p.returncode:raise RuntimeError(p.stderr.decode('utf8',errors='replace'))
    path=base/name;path.write_bytes(p.stdout);data=path.read_bytes()
    rec={'endpoint':endpoint,'file':name,'started_at':start,'completed_at':utc(),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'method':'stdout byte buffer, complete write then reread/hash'}
    (base/(name+'.capture.json')).write_text(json.dumps(rec,indent=2)+'\n',encoding='utf8')
    return json.loads(data) if asjson else rec
meta=api(f'repos/{repo}/git/commits/6ef5eabd52934144daf7b60ddb4011686c0657c4','head-git-commit.json',True)
logs=[]
for job,label in [(118216290960,'proof'),(118216291322,'structure')]:
    rec=api(f'repos/{repo}/actions/jobs/{job}/logs',f'job-{job}-{label}.raw.log')
    lines=[re.sub(r'^\d{4}-\d\d-\d\dT[^ ]+ ','',line) for line in (base/rec['file']).read_text(encoding='utf8').splitlines()]
    checkouts=[{'command_line':i+1,'sha_line':i+2,'sha':lines[i+1]} for i,line in enumerate(lines[:-1]) if re.search(r'\blog -1 --format=%H$',line)]
    logs.append({'job_id':job,'label':label,**rec,'actual_checkout':checkouts,'error_annotations':[{'line':i+1,'text':line} for i,line in enumerate(lines) if '##[error]' in line]})
print(json.dumps({'head_sha':meta['sha'],'head_tree':meta['tree']['sha'],'logs':logs},ensure_ascii=False,indent=2))
(base/'download-and-checkout-summary.json').write_text(json.dumps({'captured_at':utc(),'head_sha':meta['sha'],'head_tree':meta['tree']['sha'],'logs':logs},ensure_ascii=False,indent=2)+'\n',encoding='utf8')
