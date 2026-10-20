import pathlib,json,re,hashlib,datetime
base=pathlib.Path(r'C:/Users/Admin/AppData/Local/Temp/html-learning-274-prebump-pr281-diagnostic-ci/batch-6ef5eabd/a6')
def read(name):return json.loads((base/name).read_text(encoding='utf8'))
def save(name,obj):(base/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
def fact(path):
    data=path.read_bytes();return {'file':path.name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
head='6ef5eabd52934144daf7b60ddb4011686c0657c4'; expected_body='fab4435d310a26a804a9af2339b924da35ce51eb50a955b5c5c9b62dc9a65d97'
pr=read('pr-current.json');latest=read('latest-run.json');old=read('old-run.json');lj=read('latest-jobs.json');oj=read('old-jobs.json');dl=read('download-summary.json');binding=read('workflow-binding-and-latest-summary.json')
assert pr['head']['sha']==latest['head_sha']==old['head_sha']==head
assert latest['id']==39298279721 and latest['status']=='completed' and latest['conclusion']=='success'
assert old['id']==39298251724 and old['status']=='completed' and old['conclusion']=='cancelled'
assert binding['latest_is_requested']
body=(base/'pr-body.raw.txt').read_bytes();assert body==(pr['body'] or '').encode('utf8') and hashlib.sha256(body).hexdigest()==expected_body
workflow=(base/'a6-workflow.raw.yml').read_text(encoding='utf8').splitlines()
config=[{'line':i+1,'text':line} for i,line in enumerate(workflow) if 'types:' in line or 'concurrency:' in line or 'group:' in line or 'cancel-in-progress:' in line]
assert any('cancel-in-progress: true' in l for l in workflow)
assert all(r['git_blob_sha']==dl['workflow']['git_blob_sha'] for r in binding['workflow_bindings'])
parsed=[]
for log in dl['logs']:
    lines=[re.sub(r'^\d{4}-\d\d-\d\dT[^ ]+ ','',line) for line in (base/log['file']).read_text(encoding='utf8').splitlines()]
    ok=[{'line':i+1,'text':line} for i,line in enumerate(lines) if line.startswith('A6 OK')]
    heads=[{'line':i+1,'text':line} for i,line in enumerate(lines) if 'A6_HEAD_SHA:' in line]
    titles=[{'line':i+1,'text':line} for i,line in enumerate(lines) if 'A6_PR_TITLE:' in line]
    if log['label']=='latest':
        assert ok and any(head in r['text'] for r in heads) and any(pr['title'] in r['text'] for r in titles)
        assert not log['error_annotations']
        assert all(c['sha']==pr['base']['sha'] for c in log['checkout_next_line'])
    parsed.append({**log,'a6_ok_lines':ok,'a6_head_env_lines':heads,'a6_title_env_lines':titles})
summary={'schemaVersion':1,'finalized_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'pr':{'number':281,'title':pr['title'],'head_sha':head,'base_sha':pr['base']['sha'],'merge_commit_sha':pr['merge_commit_sha'],'updated_at':pr['updated_at'],'body_utf8_bytes':len(body),'body_sha256':hashlib.sha256(body).hexdigest(),'expected_fixed_body_sha256':expected_body,'body_matches_fixed':True},'current_head_workflow_runs':binding['scoped_runs'],'latest_a6':{'run_id':latest['id'],'run_attempt':latest['run_attempt'],'status':latest['status'],'conclusion':latest['conclusion'],'head_sha':latest['head_sha'],'run_created_at':latest['created_at'],'run_started_at':latest['run_started_at'],'updated_at':latest['updated_at'],'jobs':lj['jobs'],'actual_raw_result':'A6 OK — trigger files present and root AGENTS.md is updated.','interpretation':'Current-head latest A6 is PASS; current PR title/head and fixed body hash are independently verified.'},'historical_a6':{'run_id':old['id'],'run_attempt':old['run_attempt'],'status':old['status'],'conclusion':old['conclusion'],'head_sha':old['head_sha'],'run_created_at':old['created_at'],'run_started_at':old['run_started_at'],'updated_at':old['updated_at'],'jobs':oj['jobs'],'interpretation':'Retained historical cancelled run. Does not change latest A6 success to failure.'},'logs':parsed,'workflow':dl['workflow'],'workflow_binding_base_head_merge_identical':True,'workflow_bindings':binding['workflow_bindings'],'workflow_trigger_and_concurrency_lines':config,'cancellation':{'collector_cancel_actions':0,'parent_cancel_actions':'No cancellations, explicitly reported in trusted parent task','observed_old_run_conclusion':'cancelled','specific_actor':'UNKNOWN','specific_cause':'UNKNOWN','candidate_explanation':'INFERENCE only: the unchanged A6 workflow triggers on pull_request edited and uses a6-PR-number concurrency with cancel-in-progress true; root reports a fixed body edit triggered the successor. The collected API/log records do not independently identify the exact cancel action or actor.'},'limitations':['Current PR body bytes are verified by live REST snapshot; A6 raw does not print a consumed body hash. Workflow evaluates title/head and root AGENTS.md, while body editing can trigger a new run.','Actual A6 checkout next-lines are the base commit 4d10, as configured for trusted checker execution. A6_HEAD_SHA env identifies evaluated PR head6ef5eabd; checkout is not relabeled as head.','Raw metadata/job timing values are retained verbatim; no inferred chronology replaces them.','No prior push/source-audit directory was changed; no CI matrix/model/desktop/Sites acceptance is inferred.']}
save('summary.json',summary)
method='''All GitHub calls in this A6 collector were read-only gh api GET requests. This collector made zero cancel/rerun/comment/approval/merge or repository operations. The trusted parent task explicitly reports no cancellations by the collector or parent. The exact actor and cause of historical cancellation are UNKNOWN; no owner/tool action is invented.

Current PR 281 title, head, base and body were saved as original REST JSON and the body string was encoded to a separate UTF-8 byte file without text newline conversion. Its 3088-byte SHA256 exactly equals the fixed expected fab4435d310a26a804a9af2339b924da35ce51eb50a955b5c5c9b62dc9a65d97. Current-head A6 workflow run listing independently confirms 39298279721 is newer than 39298251724. Both complete run metadata and attempt-specific job metadata are saved. Completed latest and cancelled-old job raw logs were downloaded only after observing completed status, with stdout byte buffers; each file write closes before hashing. The latest API job success is separately backed by actual raw 'A6 OK — trigger files present and root AGENTS.md is updated.' and matching A6_HEAD_SHA/title env lines, with no error annotations. Old cancelled metadata/logs remain preserved and do not make the latest result fail.

The A6 workflow was read from the exact 6ef5eabd head through the contents API and its Git blob API; the decoded original Git blob bytes are preserved as a6-workflow.raw.yml. Exact base4d10 and potential mergec41 copies resolve to the same d59cd08c5cc8171abb8d9de1db4c5969c4d0c1cd blob. Relevant trigger/concurrency source lines are recorded. Concurrency configuration and root's body-edit report support an explicitly labeled candidate INFERENCE; the actual cancellation actor/cause remains UNKNOWN because collected metadata/logs do not prove it. API timestamps, including any anomalies, are retained as original values.

A6 raw checkout is base4d10, not PR head6ef5eabd; the workflow deliberately evaluates a trusted base checker with the exact PR head in A6_HEAD_SHA. The current body hash is an independent live REST binding; no consumed body hash is fabricated from logs. No result from an older CI batch substitutes this run. No files outside this new a6 directory were written, including frozen push and source-audit evidence. All raw/derived files are closed before final manifest hashing, all listed hashes are rechecked, then this directory is frozen without further writes.
'''
(base/'method.txt').write_text(method,encoding='utf8')
files=[fact(p) for p in sorted(base.iterdir(),key=lambda p:p.name) if p.is_file() and p.name not in ('finalmanifest.json','finalmanifest.sha256')]
manifest={'schemaVersion':1,'frozen_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'head_sha':head,'pr':281,'latest_run_id':latest['id'],'latest_conclusion':'success','old_run_id':old['id'],'old_conclusion':'cancelled','body_sha256':expected_body,'workflow_git_blob_sha':dl['workflow']['git_blob_sha'],'all_raw_writes_closed_before_final_hash':True,'raw_logs':[r for r in files if r['file'].endswith('.raw.log')],'method':'method.txt','summary':'summary.json','files':files}
save('finalmanifest.json',manifest);mf=fact(base/'finalmanifest.json');(base/'finalmanifest.sha256').write_text(mf['sha256']+'  finalmanifest.json\n',encoding='utf8')
assert all(fact(base/r['file'])==r for r in files)
print(json.dumps({'directory':str(base),'finalmanifest':mf,'summary':fact(base/'summary.json'),'workflow_raw':fact(base/'a6-workflow.raw.yml'),'raw_logs':manifest['raw_logs'],'frozen':True},ensure_ascii=False,indent=2))
