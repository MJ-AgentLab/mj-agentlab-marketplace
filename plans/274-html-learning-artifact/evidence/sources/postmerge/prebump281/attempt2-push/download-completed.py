import subprocess,json,datetime,pathlib,hashlib
base=pathlib.Path(r'C:/Users/Admin/AppData/Local/Temp/html-learning-274-prebump-pr281-ci/attempt2-push')
def utc(): return datetime.datetime.now(datetime.timezone.utc).isoformat()
results=[]
for job_id,label in [(118198894761,'linux'),(118198896900,'proof'),(118198960000,'structure')]:
    start=utc()
    p=subprocess.run(['gh','api',f'repos/MJ-AgentLab/mj-agentlab-marketplace/actions/jobs/{job_id}/logs'],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    path=base/f'job-{job_id}-{label}.raw.log'
    if p.returncode==0:
        path.write_bytes(p.stdout)
        end=utc()
        saved=path.read_bytes()
        rec={'job_id':job_id,'file':str(path),'download_started_at':start,'download_completed_at':end,'bytes':len(saved),'sha256':hashlib.sha256(saved).hexdigest(),'capture_method':'Python subprocess stdout bytes from gh api; write completed before read/hash','exit_code':p.returncode}
    else:
        rec={'job_id':job_id,'download_started_at':start,'download_completed_at':utc(),'exit_code':p.returncode,'stderr':p.stderr.decode('utf8',errors='replace')}
    (base/f'job-{job_id}-{label}-download.json').write_text(json.dumps(rec,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    results.append(rec)
print(json.dumps(results,ensure_ascii=False,indent=2))
