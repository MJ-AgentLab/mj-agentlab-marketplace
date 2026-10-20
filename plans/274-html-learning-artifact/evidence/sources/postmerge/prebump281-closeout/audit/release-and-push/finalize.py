import pathlib,json,hashlib,re,datetime
base=pathlib.Path(r'C:/Users/Admin/AppData/Local/Temp/html-learning-274-prebump281-postmerge-audit/release-and-push')
def read(name):return json.loads((base/name).read_text(encoding='utf8'))
def save(name,obj):(base/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
def fact(path):
    data=path.read_bytes();return {'file':path.name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
col=read('collection-summary.json');initial=read('initial-identities.json');rel=read('release-417390526.json');frozen=read('frozen-v8.3.2-release-final.json');run=read('push-run.json');jobs=read('push-jobs.json');meta=read('actual-merge-git-commit.json');rels=read('releases-all-rows.json');tags=read('tags-all-rows.json')
checks=[]
def check(name,value):checks.append({'claim':name,'pass':bool(value)})
expected_release='f906b1001a86d7b5415451bd973bea26e6cc3a1d';expected_merge='62945150df984e2747684d1ea46b8772b56db2d9'
check('v8.3.2 tag peel remains f906',initial['tag_peeled_commit']==expected_release)
check('Release417390526 remains published v8.3.2 at f906',rel['id']==417390526 and rel['tag_name']=='v8.3.2' and rel['target_commitish']==expected_release and rel['draft'] is False)
check('frozen release identity',frozen['id']==rel['id'] and frozen['tag_name']==rel['tag_name'] and frozen['target_commitish']==rel['target_commitish'])
check('release body exact committed frozen bytes',col['release_body']['exact_bytes_equal'])
check('full releases end at empty page',col['full_list_pages']['releases'][-1]['count']==0 and len(rels)==45 and len({r['id'] for r in rels})==45)
check('full tags end at empty page',col['full_list_pages']['tags'][-1]['count']==0 and len(tags)==47 and len({t['name'] for t in tags})==47)
check('no v8.3.3 release draft or published rows',not col['v8.3.3_list_matches']['releases'])
check('no v8.3.3 tag rows',not col['v8.3.3_list_matches']['tags'])
for label in ['tag-v8.3.3-response.json','release-v8.3.3-response.json']:
    response=read(label);capture=read(label+'.capture.json')
    check(label+' actual404',response.get('status')=='404' and capture['exit_code']!=0 and 'HTTP 404' in capture['stderr'])
check('tag list current v8.3.2 matches exact ref',[t['commit']['sha'] for t in tags if t['name']=='v8.3.2']==[expected_release])
listed=[r for r in rels if r['id']==417390526]
check('release list current v8.3.2 body matches exact release endpoint',len(listed)==1 and listed[0]['body']==rel['body'])
check('actual postmerge push exact identity and success',run['id']==39344994194 and run['event']=='push' and run['head_sha']==expected_merge and run['status']=='completed' and run['conclusion']=='success')
check('actual job completed/success',len(jobs['jobs'])==1 and jobs['jobs'][0]['id']==118375345914 and jobs['jobs'][0]['status']=='completed' and jobs['jobs'][0]['conclusion']=='success')
check('actual checkout next-line matches merge',len(col['push_checkout_next_lines'])==1 and col['push_checkout_next_lines'][0]['sha']==expected_merge)
check('actual merge tree bound to Git metadata',run['head_commit']['tree_id']==meta['tree']['sha']==col['actual_merge']['tree'])
lines=[re.sub(r'^\d{4}-\d\d-\d\dT[^ ]+ ','',line) for line in (base/'push-job-118375345914.raw.log').read_text(encoding='utf8').splitlines()]
actual_results=[]
for i,line in enumerate(lines):
    if line.startswith('{'):
        try:
            obj=json.loads(line)
            if isinstance(obj,dict) and 'state' in obj and 'ok' in obj:actual_results.append({'line':i+1,'result':obj})
        except json.JSONDecodeError:pass
check('one actual prebump JSON output',len(actual_results)==1)
if actual_results:check('actual prebump state/pass',actual_results[0]['result']['state']=='prebumped' and actual_results[0]['result']['ok'] is True)
errors=[{'line':i+1,'text':line} for i,line in enumerate(lines) if line.startswith('##[error]')]
check('no actual error annotations',not errors)
step_names=[s['name'] for s in jobs['jobs'][0]['steps']]
check('no test/install Harness step named',not any(('smoke:codex' in s or 'npm test' in s or 'npm run validate' in s) for s in step_names))
issues=[c['claim'] for c in checks if not c['pass']]
summary={'schemaVersion':1,'finalized_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'PASS' if not issues else 'FAIL','actual_merge':col['actual_merge'],'publication':{'v8.3.2_tag_peeled_commit':initial['tag_peeled_commit'],'v8.3.2_tag_kind':read('tag-v8.3.2-ref.json')['object']['type'],'release':{k:rel.get(k) for k in ['id','tag_name','target_commitish','draft','prerelease','published_at','immutable','html_url']},'release_body':col['release_body'],'v8.3.3_tag_endpoint':read('tag-v8.3.3-response.json'),'v8.3.3_release_endpoint':read('release-v8.3.3-response.json'),'complete_releases':{'count':len(rels),'draft_count':sum(r['draft'] for r in rels),'published_count':sum(not r['draft'] for r in rels),'pages':col['full_list_pages']['releases'],'matching_v8.3.3':col['v8.3.3_list_matches']['releases']},'complete_tags':{'count':len(tags),'pages':col['full_list_pages']['tags'],'matching_v8.3.3':col['v8.3.3_list_matches']['tags']},'scope':'Current authenticated REST snapshot only; no future publication absence or broader immutable-policy claim.'},'postmerge_push':{'run_id':run['id'],'run_attempt':run['run_attempt'],'name':run['name'],'event':run['event'],'head_sha':run['head_sha'],'status':run['status'],'conclusion':run['conclusion'],'job_id':jobs['jobs'][0]['id'],'jobs_and_steps':jobs['jobs'],'checkout_next_lines':col['push_checkout_next_lines'],'tree':meta['tree']['sha'],'raw_log':col['push_log'],'workflow':col['push_workflow'],'actual_result_json':actual_results,'actual_error_annotations':errors,'scope':'Verify Develop Pre-bumped only: checkout629, setup-node, runner fetch origin/main, read develop/main VERSION plus main VERSION epoch, execute check-prebump.mjs, publish job summary.','not_executed_by_this_run':{'tap644':'NOT_RUN','npm_validate':'NOT_RUN','canonical13_installations':'NOT_RUN','commands178':'NOT_RUN','Diagram6_LEK18_site4_static4':'NOT_RUN','model_desktop_native_UI_Sites':'NOT_RUN'},'prior_6ef_results_borrowed':False},'checks':checks,'verification_issues':issues}
save('summary.json',summary)
method='''Read-only independent postmerge release/push audit, fixed actual merge62945150df984e2747684d1ea46b8772b56db2d9. Collector issued only GitHub REST GET calls and wrote this new TEMP release-and-push directory. It did not fetch or mutate the local repository, rerun/cancel/comment/reviewer/merge/approve anything, or modify frozen221/prebump281-handoff302/any old evidence directory. A local read-only file inventory located frozen v8.3.2 evidence; the actual body comparison source was then read through the exact actual629 Git contents API, not by editing/normalizing an old file.

All API JSON, expected404 body/stderr, and completed job raw log were captured as subprocess stdout/stderr byte buffers. Write completion precedes reread/SHA256. Every API call has start/end UTC and endpoint/exit-code metadata. v8.3.2 ref object is commit directly (lightweight tag), so its peel result is that commit with no annotated-tag hop required. Release417390526 identity/tag/target/draft state are preserved. Current release body and committed frozen release-final.json body are separately encoded to UTF-8 with no newline normalization and compared exact bytes. Complete releases and tags listings use per_page100, retain every page and explicitly request the subsequent empty page; authenticated endpoint visibility is the stated scope. Matching v8.3.3 tag/name rows are checked including draft/published release flags. Both exact ref and release-by-tag endpoints return actual HTTP404 recorded by gh stderr and JSON status; no empty-success inference is used.

Actual pushrun39344994194/attempt1 and job118375345914 were already completed/success before log download. Raw next-line after git log -1 is actual629 and is bound to REST Git metadata tree6659fadd62bc03aa3ab4eee61e63804fc25b914b. The actual workflow Git content at629 is preserved. Actual JSON state prebumped/ok:true, original ageSeconds289919, version inputs8.3.3/8.3.2 and all original timestamps remain unmodified. The job's runner fetch is an observed remote workflow operation, not a fetch by this collector. This is only a branch pre-bump status check; no644 TAP,13 installs,178 commands,Diagram/LEK/site static counts from6ef or another batch are reused as this run's result. No canonical/model/desktop/UI/Sites acceptance is inferred.

All original files and derived summary/method are closed before final manifest hashing. All listed hashes are verified, then this directory is frozen without further writes or API calls.
'''
(base/'method.txt').write_text(method,encoding='utf8')
files=[fact(p) for p in sorted(base.iterdir(),key=lambda p:p.name) if p.is_file() and p.name not in ('finalmanifest.json','finalmanifest.sha256')]
manifest={'schemaVersion':1,'frozen_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':summary['status'],'actual_merge':expected_merge,'tree':meta['tree']['sha'],'release_id':417390526,'public_tag':'v8.3.2','public_commit':expected_release,'v8.3.2_release_body_sha256':col['release_body']['current_sha256'],'v8.3.3_tag_status':'404','v8.3.3_release_status':'404','all_release_rows':45,'all_tag_rows':47,'push_run_id':39344994194,'push_job_id':118375345914,'push_scope':'Verify Develop Pre-bumped only','all_raw_writes_closed_before_hash':True,'method':'method.txt','summary':'summary.json','files':files}
save('finalmanifest.json',manifest);mf=fact(base/'finalmanifest.json');(base/'finalmanifest.sha256').write_text(mf['sha256']+'  finalmanifest.json\n',encoding='utf8')
assert all(fact(base/r['file'])==r for r in files)
print(json.dumps({'directory':str(base),'status':summary['status'],'issues':issues,'finalmanifest':mf,'summary':fact(base/'summary.json'),'method':fact(base/'method.txt'),'push_raw':fact(base/'push-job-118375345914.raw.log'),'frozen':True},ensure_ascii=False,indent=2))
