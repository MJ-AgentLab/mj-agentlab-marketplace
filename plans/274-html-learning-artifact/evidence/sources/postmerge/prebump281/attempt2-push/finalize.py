import pathlib,json,re,hashlib,datetime
base=pathlib.Path(r'C:/Users/Admin/AppData/Local/Temp/html-learning-274-prebump-pr281-ci/attempt2-push')
def utc(): return datetime.datetime.now(datetime.timezone.utc).isoformat()
def save(name,obj): (base/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
def digest(path):
    data=path.read_bytes(); return {'file':path.name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
# Permit git.exe on Windows, then read the actual next line. No API is called.
p=base/'collect-terminal.py'
p.write_text(p.read_text(encoding='utf8').replace("re.search(r'\\bgit log -1 --format=%H$',line)","re.search(r'\\blog -1 --format=%H$',line)"),encoding='utf8')
summary=json.loads((base/'summary.json').read_text(encoding='utf8'))
metadata=json.loads((base/'head-git-commit.json').read_text(encoding='utf-8-sig'))
assert metadata['sha']=='1d8b6849ec7e398d65a949d204abe38bc64a4e0b'
assert metadata['tree']['sha']=='eefcaa0f1bd4201a38f9d46ff668c28b7d662e8c'
for job in summary['jobs']:
    lines=[re.sub(r'^\d{4}-\d\d-\d\dT[^ ]+ ','',line) for line in (base/job['raw_log']).read_text(encoding='utf8').splitlines()]
    checkouts=[]
    for i,line in enumerate(lines[:-1]):
        if re.search(r'\blog -1 --format=%H$',line):
            assert re.fullmatch(r'[0-9a-f]{40}',lines[i+1])
            checkouts.append({'command_line':i+1,'sha_line':i+2,'sha':lines[i+1],'git_metadata_tree':metadata['tree']['sha']})
    job['actual_checkout_from_git_log_next_line']=checkouts
    if job['job_id'] in (118198894761,118198895238):
        assert len(checkouts)==1 and checkouts[0]['sha']==metadata['sha']
        assert job['tap_result_count']==642 and job['tap_result_ids_unique'] and job['tap_totals']['tests']==[642]
        label='linux' if job['job_id']==118198894761 else 'windows'
        if label=='linux':
            assert job['tap_totals']['pass']==[640] and job['tap_totals']['fail']==[1] and job['tap_totals']['skipped']==[1]
            assert [x['id'] for x in job['not_ok']]==[328]
        else:
            assert job['tap_totals']['pass']==[642] and job['tap_totals']['fail']==[0] and job['tap_totals']['skipped']==[0]
            smoke=json.loads((base/'windows-actual-smoke-result.json').read_text(encoding='utf8'))
            scenarios=smoke['scenarios']; combined=scenarios[-1]
            metrics=job['smoke_execution_metrics']
            metrics['static_individual_results']=[{'status':s['checked']['status'],'declared_checks':s['checked']['summary']['checks'],'failed':s['checked']['summary']['failed'],'actual_check_results':len(s['checked']['checks']),'actual_pass_count':sum(c['status']=='PASS' for c in s['checked']['checks']),'rendered_status':s['rendered']['status']} for s in metrics['site_results']]
            assert all(r['declared_checks']==89 and r['actual_pass_count']==89 and r['actual_check_results']==89 and r['failed']==0 and r['rendered_status']=='GENERATED' for r in metrics['static_individual_results'])
            combined_facts={}
            per_scenario=[]; mismatches=[]
            for idx,s in enumerate(scenarios):
                rows={}
                for plugin,package in s['installedPluginResources'].items():
                    for rel,fact in package['rootFiles'].items(): rows[plugin+'/'+rel]=fact['sha256']
                    for skill,resources in package['skills'].items():
                        for rel,fact in resources.items(): rows[plugin+'/skills/'+skill+'/'+rel]=fact['sha256']
                for path,sha in rows.items():
                    if path in combined_facts and combined_facts[path]!=sha: mismatches.append({'path':path,'earlier':combined_facts[path],'current':sha,'scenario':idx+1})
                    combined_facts[path]=sha
                per_scenario.append({'scenario':idx+1,'installed':s['installed'],'ok':s['ok'],'commands':len(s['commands']),'nonzero_commands':sum(c['status']!=0 for c in s['commands']),'resource_skill_sets':len(s['installedResources']),'site_resources':len(s['installedResources'].get('html-guide-kit:site',{})),'outside':s['outside'],'repository':s['repository'],'nativeOutside':s['nativeOutside'],'nativeRepository':s['nativeRepository'],'explicitOnly':s['explicitOnly'],'source_cache_compared_file_facts':len(rows),'resource_sha256_facts':rows})
            assert not mismatches
            metrics['combined_discovery']={'natural_outside':combined['outside'],'natural_repository':combined['repository'],'native_outside':combined['nativeOutside'],'native_repository':combined['nativeRepository'],'explicit_only':combined['explicitOnly'],'explicit_count':len(combined['explicitOnly']),'resource_skill_sets':len(combined['installedResources']),'site_resources':len(combined['installedResources']['html-guide-kit:site']),'site_resource_hashes':combined['installedResources']['html-guide-kit:site']}
            cross={'source':'actual current attempt2 Windows smoke JSON','scenarios':per_scenario,'cross_scenario_unique_file_facts':len(combined_facts),'cross_scenario_total_file_fact_occurrences':sum(s['source_cache_compared_file_facts'] for s in per_scenario),'mismatches':mismatches,'limitations':'Runtime equality assertions and emitted SHA256 facts; remote runner files not independently re-read. LEK shared resources are byte-compared by runtime but its shared seven-resource loop prints no individual SHA256 facts. Browser in installation smoke NOT_RUN; individual cleanup-root absence NOT_RECORDED.'}
            save('windows-cross-scenario-summary.json',cross)
            metrics['cross_scenario_summary']='windows-cross-scenario-summary.json'
            job['browser_acceptance_limit']='TAP unit 328 PASS is limited automated checker evidence; not native UI, desktop, deployed Sites or Owner acceptance. Installation smoke browserCheck remains NOT_RUN.'
        save(label+'-summary.json',job)
summary['metadata_binding']={'source_commit':metadata['sha'],'tree':metadata['tree']['sha'],'git_metadata_file':'head-git-commit.json','versions_file':'source-version-binding.json'}
summary['method_file']='method.txt'
summary['initial_copy_loss_disclosure']='initial-text-pipeline-observation.json'
save('summary.json',summary)
compact={'run_id':summary['run_id'],'run_attempt':2,'status':summary['status'],'conclusion':summary['conclusion'],'checkout':metadata['sha'],'tree':metadata['tree']['sha'],'root_cause':'UNKNOWN','per_root_absence':'NOT_RECORDED','jobs':[]}
for j in summary['jobs']:
    row={k:j[k] for k in ('job_id','name','conclusion','raw_log','raw_bytes','raw_sha256')}
    if 'tap_totals' in j:
        row.update({'tap':j['tap_totals'],'not_ok':j['not_ok'],'error_annotation_lines':j['error_annotation_lines'],'steps':j['downstream'],'actual_checkout':j['actual_checkout_from_git_log_next_line'],'smoke_status':j['smoke_execution_metrics']['status']})
        if j['job_id']==118198895238:
            m=j['smoke_execution_metrics']; row['smoke']={k:m[k] for k in ('scenarios','scenario_ok_count','commands','commands_nonzero','diagram_python','learning_evidence_python','site_generated','site_static','static_individual_results','cli_versions_actual','combined_discovery','source_cache_digest','cross_scenario_summary','browser_check_in_install_smoke')}
    compact['jobs'].append(row)
save('compact-summary.json',compact)
text='''Push run 39292085653 attempt 2 is completed/failure. Linux job 118198894761: TAP 642 tests = 640 pass, 1 fail, 1 skip; actual browser case 328 failed with checker NOT_RUN and unreadable local DevToolsActivePort. Root cause UNKNOWN. Linux validate/baseline/smoke skipped = NOT_RUN. Windows job 118198895238: TAP 642 pass, zero fail/skip, actual browser unit case 328 PASS; validation/baseline/smoke success. Its actual smoke completed 13 scenarios / 178 zero-status commands, 6 Diagram Python validations, 18 LEK Python commands, 4 GENERATED artifacts and 4 static validations with each 89/89 checks PASS. Actual CLI is 0.147.0. Combined discovery is 3 natural public, 5 explicit, 8 native public and 20 repository skills; resources include 8 skill trees and site 20 files. Current Windows runtime comparison facts are internally consistent across scenarios. Installation smoke browser remains NOT_RUN, individual cleanup-root absence NOT_RECORDED, and understanding effects NOT_MEASURED. Both actual checkout next-lines are 1d8b6849ec7e398d65a949d204abe38bc64a4e0b, bound to tree eefcaa0f1bd4201a38f9d46ff668c28b7d662e8c. No previous attempt/local result substitutes this evidence. Original text-pipeline copy loss and corrected raw identity are disclosed in method.txt and initial-text-pipeline-observation.json.\n'''
(base/'summary.txt').write_text(text,encoding='utf8')
# All API calls/downloads are over and all raw/derived files have closed before hashing.
files=[digest(p) for p in sorted(base.iterdir(),key=lambda p:p.name) if p.is_file() and p.name not in ('finalmanifest.json','finalmanifest.sha256')]
manifest={'schemaVersion':1,'finalized_at':utc(),'directory':str(base),'repository':'MJ-AgentLab/mj-agentlab-marketplace','run_id':39292085653,'run_attempt':2,'terminal_status':'completed','terminal_conclusion':'failure','head_sha':metadata['sha'],'tree':metadata['tree']['sha'],'all_raw_downloads_closed_before_final_hash':True,'raw_logs':[r for r in files if r['file'].endswith('.raw.log')],'terminal_run_api':'final-run-attempt2.json','terminal_jobs_api':'final-jobs-attempt2.json','summary':'summary.json','compact_summary':'compact-summary.json','method':'method.txt','initial_text_pipeline_copy':json.loads((base/'initial-text-pipeline-observation.json').read_text(encoding='utf-8-sig')),'api_job_timing_anomalies':summary['raw_job_timing_anomalies'],'root_cause':'UNKNOWN','per_root_absence':'NOT_RECORDED','files':files}
save('finalmanifest.json',manifest)
manifest_digest=digest(base/'finalmanifest.json')
(base/'finalmanifest.sha256').write_text(manifest_digest['sha256']+'  finalmanifest.json\n',encoding='utf8')
for fact in files:
    assert digest(base/fact['file'])==fact
print(json.dumps({'finalmanifest':manifest_digest,'summary':digest(base/'summary.json'),'compact_summary':digest(base/'compact-summary.json'),'method':digest(base/'method.txt'),'raw_logs':manifest['raw_logs'],'directory_frozen':True},ensure_ascii=False,indent=2))

