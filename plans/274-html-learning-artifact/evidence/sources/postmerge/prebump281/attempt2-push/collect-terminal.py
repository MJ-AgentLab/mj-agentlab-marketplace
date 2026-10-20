import pathlib,json,re,hashlib,datetime,subprocess
base=pathlib.Path(r'C:/Users/Admin/AppData/Local/Temp/html-learning-274-prebump-pr281-ci/attempt2-push')
repo='MJ-AgentLab/mj-agentlab-marketplace'; runid=39292085653

def utc(): return datetime.datetime.now(datetime.timezone.utc).isoformat()
def save(name,obj):
    path=base/name; path.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf8'); return path

def api_bytes(endpoint,filename):
    start=utc(); proc=subprocess.run(['gh','api',endpoint],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if proc.returncode: raise RuntimeError(proc.stderr.decode('utf8',errors='replace'))
    path=base/filename; path.write_bytes(proc.stdout)
    data=path.read_bytes()
    save(filename+'.capture.json',{'capture_started_at':start,'capture_completed_at':utc(),'endpoint':endpoint,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'capture_method':'gh api stdout bytes via Python subprocess; save complete before hash'})
    return data

def stripped_lines(path):
    return [re.sub(r'^\d{4}-\d\d-\d\dT[^ ]+ ','',line) for line in path.read_text(encoding='utf8',errors='strict').splitlines()]

def parse_job(job,label):
    path=base/f'job-{job["id"]}-{label}.raw.log'
    api_bytes(f'repos/{repo}/actions/jobs/{job["id"]}/logs',path.name)
    lines=stripped_lines(path); plain='\n'.join(lines)
    result={'job_id':job['id'],'name':job['name'],'status':job['status'],'conclusion':job['conclusion'],'started_at':job['started_at'],'completed_at':job['completed_at'],'raw_log':path.name,'raw_bytes':path.stat().st_size,'raw_sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
    checkout=[]
    for i,line in enumerate(lines[:-1]):
        if re.search(r'\blog -1 --format=%H$',line): checkout.append({'command_line':i+1,'sha_line':i+2,'sha':lines[i+1]})
    result['actual_checkout_from_git_log_next_line']=checkout
    result['steps']=job['steps']
    if label in ('linux','windows'):
        totals={}
        for key in ('tests','suites','pass','fail','cancelled','skipped','todo'):
            totals[key]=[int(x) for x in re.findall(r'^# '+key+r' (\d+)$',plain,re.M)]
        tap=[]
        for i,line in enumerate(lines):
            m=re.match(r'^(not ok|ok) (\d+) - (.*)$',line)
            if m: tap.append({'line':i+1,'status':m.group(1),'id':int(m.group(2)),'name':m.group(3),'skip':'# SKIP' in m.group(3)})
        result['tap_totals']=totals
        result['tap_result_count']=len(tap)
        result['tap_result_ids_unique']=len({t['id'] for t in tap})==len(tap)
        result['not_ok']=[t for t in tap if t['status']=='not ok']
        result['skipped_tests']=[t for t in tap if t['skip']]
        result['error_annotation_lines']=[{'line':i+1,'text':l} for i,l in enumerate(lines) if '##[error]' in l]
        result['browser_named_tap_results']=[t for t in tap if re.search('browser|viewport',t['name'],re.I)]
        result['python_named_tap_results']=[t for t in tap if re.search('actual Python|real Python|Python 3.12|static checker executes Python',t['name'])]
        browser=[]
        for i,l in enumerate(lines):
            if '"checker": "artifact-browser-layout"' not in l: continue
            start=i
            while start>=0 and lines[start].strip()!='{': start-=1
            if start<0: continue
            try:
                obj,used=json.JSONDecoder().raw_decode('\n'.join(lines[start:]).lstrip())
                browser.append({'json_start_line':start+1,'payload':obj})
            except json.JSONDecodeError as e: browser.append({'parse_error':str(e),'line':i+1})
        result['actual_browser_checker_payloads']=browser
        downstream={}
        for name in ['Run npm run validate','Run npm run check:baseline-tools','Run npm run smoke:codex']:
            s=[s for s in job['steps'] if s['name']==name]
            downstream[name]={'api_steps':s,'interpretation':'NOT_RUN' if s and s[0]['conclusion']=='skipped' else ('PASS' if s and s[0]['conclusion']=='success' else 'FAIL' if s and s[0]['conclusion']=='failure' else 'UNKNOWN')}
        result['downstream']=downstream
        smoke=downstream['Run npm run smoke:codex']['interpretation']
        result['smoke_execution_metrics']={'status':'NOT_RUN' if smoke=='NOT_RUN' else 'REQUIRES_LOG_EXTRACTION','scenarios':None,'commands':None,'diagram_python':None,'learning_evidence_python':None,'site_generated':None,'site_static':None,'source_cache_comparison':None,'cli_version_actual':None,'source_cache_digest':None,'note':'Do not infer executed smoke metrics from unit-test fixture names or install command.'}
        result['cli_install_step']=[s for s in job['steps'] if s['name']=='Run npm install -g @openai/codex@0.147.0']
        result['per_root_absence']='NOT_RECORDED'
        result['root_cause']='UNKNOWN'
        save(f'{label}-all-tap-results.json',tap)
    save(f'{label}-summary.json',result)
    return result

run=json.loads(api_bytes(f'repos/{repo}/actions/runs/{runid}/attempts/2','final-run-attempt2.json'))
jobs=json.loads(api_bytes(f'repos/{repo}/actions/runs/{runid}/attempts/2/jobs?per_page=100','final-jobs-attempt2.json'))
if run['run_attempt']!=2 or run['status']!='completed' or any(j['status']!='completed' for j in jobs['jobs']):
    print(json.dumps({'status':'NOT_TERMINAL','run_attempt':run['run_attempt'],'run_status':run['status'],'jobs':[{k:j[k] for k in ('id','name','status','conclusion')} for j in jobs['jobs']]},ensure_ascii=False)); raise SystemExit(3)
labels={118198894761:'linux',118198895238:'windows',118198896900:'proof',118198960000:'structure'}
parsed=[]
for job in jobs['jobs']:
    if job['conclusion']=='skipped': continue
    parsed.append(parse_job(job,labels[job['id']]))
summary={'captured_at':utc(),'repository':repo,'run_id':runid,'run_attempt':run['run_attempt'],'event':run['event'],'status':run['status'],'conclusion':run['conclusion'],'head_sha':run['head_sha'],'expected_tree':'eefcaa0f1bd4201a38f9d46ff668c28b7d662e8c','git_metadata_file':'head-git-commit.json','run_url':run['html_url'],'jobs':parsed,'skipped_jobs':[j for j in jobs['jobs'] if j['conclusion']=='skipped'],'attempt1':'Historical failures retained by parent; no attempt1 logs/results reused as attempt2 evidence.','root_cause':'UNKNOWN','per_root_absence':'NOT_RECORDED','raw_job_timing_anomalies':[{'job_id':j['id'],'created_at':j['created_at'],'started_at':j['started_at'],'completed_at':j['completed_at']} for j in jobs['jobs'] if (j['started_at'] and j['started_at']<j['created_at']) or (j['completed_at'] and j['completed_at']<j['started_at'])]}
save('summary.json',summary)
print(json.dumps({'status':summary['status'],'conclusion':summary['conclusion'],'jobs':[{k:j[k] for k in ('job_id','name','conclusion','raw_sha256')} for j in parsed]},ensure_ascii=False,indent=2))
