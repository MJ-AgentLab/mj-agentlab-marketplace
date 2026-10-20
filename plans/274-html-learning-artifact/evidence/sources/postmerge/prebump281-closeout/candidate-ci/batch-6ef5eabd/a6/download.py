import pathlib,subprocess,json,hashlib,datetime,base64,re
base=pathlib.Path(r'C:/Users/Admin/AppData/Local/Temp/html-learning-274-prebump-pr281-diagnostic-ci/batch-6ef5eabd/a6');repo='MJ-AgentLab/mj-agentlab-marketplace';head='6ef5eabd52934144daf7b60ddb4011686c0657c4'
def utc():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def api(endpoint,name,jsonout=False):
    start=utc();p=subprocess.run(['gh','api',endpoint],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if p.returncode:raise RuntimeError(p.stderr.decode('utf8',errors='replace'))
    path=base/name;path.write_bytes(p.stdout);data=path.read_bytes();rec={'endpoint':endpoint,'file':name,'started_at':start,'completed_at':utc(),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'method':'stdout byte buffer, complete write then hash'}
    (base/(name+'.capture.json')).write_text(json.dumps(rec,indent=2)+'\n',encoding='utf8');return json.loads(data) if jsonout else rec
content=api(f'repos/{repo}/contents/.github/workflows/a6.yml?ref={head}','workflow-at-head.json',True)
blob=api(f'repos/{repo}/git/blobs/{content["sha"]}','workflow-git-blob.json',True)
assert blob['encoding']=='base64';data=base64.b64decode(blob['content']);assert blob['size']==len(data);assert base64.b64decode(content['content'])==data
(base/'a6-workflow.raw.yml').write_bytes(data)
logs=[]
for job,label in [(118216448009,'latest'),(118216307755,'old')]:
    rec=api(f'repos/{repo}/actions/jobs/{job}/logs',f'{label}-job-{job}.raw.log')
    lines=[re.sub(r'^\d{4}-\d\d-\d\dT[^ ]+ ','',line) for line in (base/rec['file']).read_text(encoding='utf8').splitlines()]
    logs.append({'job_id':job,'label':label,**rec,'checkout_next_line':[{'command_line':i+1,'sha_line':i+2,'sha':lines[i+1]} for i,line in enumerate(lines[:-1]) if re.search(r'\blog -1 --format=%H$',line)],'error_annotations':[{'line':i+1,'text':l} for i,l in enumerate(lines) if '##[error]' in l]})
result={'captured_at':utc(),'workflow':{'path':content['path'],'commit_ref':head,'git_blob_sha':content['sha'],'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()},'logs':logs}
(base/'download-summary.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8');print(json.dumps(result,ensure_ascii=False,indent=2))
