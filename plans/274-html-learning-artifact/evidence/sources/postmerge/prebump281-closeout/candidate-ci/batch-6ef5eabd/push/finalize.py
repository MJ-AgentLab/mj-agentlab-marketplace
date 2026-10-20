import pathlib,json,re,hashlib,datetime
base=pathlib.Path(r'C:/Users/Admin/AppData/Local/Temp/html-learning-274-prebump-pr281-diagnostic-ci/batch-6ef5eabd/push')
def save(name,obj):(base/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
def read(name):return json.loads((base/name).read_text(encoding='utf8'))
def fact(path):
    data=path.read_bytes();return {'file':path.name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
run=read('run-20261019T175620Z.json');jobs=read('jobs-20261019T175620Z.json');meta=read('head-git-commit.json');downloads=read('download-and-checkout-summary.json')
assert run['id']==39298245127 and run['run_attempt']==1 and run['status']=='completed' and run['conclusion']=='success' and run['event']=='push'
assert run['head_sha']==meta['sha']=='6ef5eabd52934144daf7b60ddb4011686c0657c4'
assert run['head_commit']['tree_id']==meta['tree']['sha']=='6659fadd62bc03aa3ab4eee61e63804fc25b914b'
assert all(j['status']=='completed' for j in jobs['jobs'])
parsed={}
for log in downloads['logs']:
    lines=[re.sub(r'^\d{4}-\d\d-\d\dT[^ ]+ ','',line) for line in (base/log['file']).read_text(encoding='utf8').splitlines()]
    plain='\n'.join(lines)
    if log['label']=='proof':
        proof=[json.loads(line.removeprefix('MJ_PR5_DEDUP_REPORT ')) for line in lines if line.startswith('MJ_PR5_DEDUP_REPORT {')]
        assert len(proof)==1 and proof[0]['skipPush'] is True
        save('proof-decision.json',proof[0]);parsed['proof']=proof[0]
    else:
        assert len(log['actual_checkout'])==1 and log['actual_checkout'][0]['sha']==meta['sha']
        candidates=[]
        for m in re.finditer(r'^\{$',plain,re.M):
            try:
                obj,_=json.JSONDecoder().raw_decode(plain[m.start():])
                if isinstance(obj,dict) and 'repositorySkills' in obj and 'publicSkills' in obj:candidates.append(obj)
            except json.JSONDecodeError:pass
        assert len(candidates)==1
        save('structure-validation.json',candidates[0]);parsed['structure_validation']=candidates[0]
    assert not log['error_annotations']
skipped=[j for j in jobs['jobs'] if j['conclusion']=='skipped'];matrix=[j for j in jobs['jobs'] if j['name'].startswith('Baseline compat')]
assert len(matrix)==1 and matrix[0]['conclusion']=='skipped' and not matrix[0]['steps']
summary={'schemaVersion':1,'captured_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'run_id':run['id'],'run_attempt':run['run_attempt'],'event':'push','status':'completed','conclusion':'success','run_url':run['html_url'],'head_sha':meta['sha'],'tree':meta['tree']['sha'],'actual_checkout':downloads['logs'][1]['actual_checkout'],'head_git_metadata':'head-git-commit.json','jobs':jobs['jobs'],'downloaded_raw_logs':downloads['logs'],'proof':parsed['proof'],'proof_interpretation':'Decision-time equivalent current PR carrier proof only; carrier was in_progress with conclusion null at decision. This push does not claim that PR matrix completed or passed.','structure_validation':parsed['structure_validation'],'matrix_execution':{'status':'NOT_RUN','api_job_id':matrix[0]['id'],'api_job_name':matrix[0]['name'],'api_conclusion':'skipped','platform_jobs_executed':0,'tap644':'NOT_RUN','unit_actual_browser_case':'NOT_RUN','startup_stderr_diagnostics':'NOT_RUN','matrix_validate':'NOT_RUN','baseline_tools':'NOT_RUN','installation_smoke':'NOT_RUN','scenarios13_commands178':'NOT_RUN','diagram6_lek18_site4_static4':'NOT_RUN','resource_internal_comparisons':'NOT_RUN'},'individual_cleanup_root_absence':'NOT_RECORDED','api_job_timing_anomalies':[{'job_id':j['id'],'created_at':j['created_at'],'started_at':j['started_at'],'completed_at':j['completed_at']} for j in jobs['jobs'] if (j['started_at'] and j['started_at']<j['created_at']) or (j['completed_at'] and j['completed_at']<j['started_at'])],'limitations':'No old attempt/local result substituted. No new PR matrix results read by this agent. No startup failure/root cause inferred from skipped matrix. No model/desktop/Sites/native UI acceptance.'}
save('summary.json',summary)
method='''Read-only monitoring of new push run 39298245127, attempt 1, for fixed head 6ef5eabd52934144daf7b60ddb4011686c0657c4. First exact REST read at 2026-10-19T17:56:20Z already returned terminal completed/success, so no later periodic polling was required. The actual run_attempt drove the explicit /attempts/1/jobs endpoint. All API JSON and raw job logs were captured as Python subprocess gh api stdout byte buffers. Complete file writes closed before reread/SHA256. No text-pipeline conversion was used for raw evidence. No repository write, index read/write, rerun, cancel, approval, comment, merge, installation or runtime/model/desktop/Sites operation was performed. Previous source-audit and CI evidence directories were untouched.

Only completed non-skipped jobs 118216290960 (proof) and 118216291322 (Structure) had actual raw logs downloaded. Matrix placeholder job 118216394852 was skipped with no steps; there are zero executed platform jobs. No 644 TAP, browser startup diagnostics, per-platform validation/baseline/smoke, 13/178 or resource comparison result is asserted for this push. The actual proof output identifies decision_time_exact_pr_carrier, PR run 39298251581 attempt 1 in_progress/conclusion null at decision time. That proves carrier equivalence, not PR pass. The exact output sourceProofs and all original timing values are preserved, including cancel completed_at preceding started_at; no cause is guessed.

Actual checkout is read from the next line after git log -1 --format=%H in Structure log (command line 208, SHA line 209) and bound to Git REST commit metadata tree 6659fadd62bc03aa3ab4eee61e63804fc25b914b. The PR merge ref appearing inside sourceProofs is not used as push checkout. The Structure strict validator JSON is parsed separately and does not stand in for skipped matrix validation. Individual cleanup-root absence remains NOT_RECORDED. All raw/derived files are closed before final manifest hashing; saved file hashes are verified once and then this directory is frozen.
'''
(base/'method.txt').write_text(method,encoding='utf8')
files=[fact(p) for p in sorted(base.iterdir(),key=lambda p:p.name) if p.is_file() and p.name not in ('finalmanifest.json','finalmanifest.sha256')]
manifest={'schemaVersion':1,'frozen_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'run_id':39298245127,'run_attempt':1,'status':'completed','conclusion':'success','head_sha':meta['sha'],'tree':meta['tree']['sha'],'matrix_status':'NOT_RUN (API skipped)','actual_platform_jobs':0,'all_raw_downloads_closed_before_final_hash':True,'raw_logs':[r for r in files if r['file'].endswith('.raw.log')],'method':'method.txt','summary':'summary.json','files':files}
save('finalmanifest.json',manifest);mf=fact(base/'finalmanifest.json');(base/'finalmanifest.sha256').write_text(mf['sha256']+'  finalmanifest.json\n',encoding='utf8')
assert all(fact(base/r['file'])==r for r in files)
print(json.dumps({'directory':str(base),'manifest':mf,'summary':fact(base/'summary.json'),'method':fact(base/'method.txt'),'raw_logs':manifest['raw_logs'],'frozen':True},ensure_ascii=False,indent=2))
