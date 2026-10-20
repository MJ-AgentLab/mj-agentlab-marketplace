import pathlib,json,re,hashlib
base=pathlib.Path(r'C:/Users/Admin/AppData/Local/Temp/html-learning-274-prebump-pr281-ci/attempt2-push')
def save(name,obj): (base/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
summary=json.loads((base/'summary.json').read_text(encoding='utf8'))
for job in summary['jobs']:
    if job['job_id'] not in (118198894761,118198895238): continue
    label='linux' if job['job_id']==118198894761 else 'windows'
    if job['downstream']['Run npm run smoke:codex']['interpretation']!='PASS': continue
    lines=[re.sub(r'^\d{4}-\d\d-\d\dT[^ ]+ ','',line) for line in (base/job['raw_log']).read_text(encoding='utf8').splitlines()]
    plain='\n'.join(lines)
    start=plain.find('> node scripts/smoke-codex-plugin.mjs')
    if start<0: raise RuntimeError('Actual smoke command output marker missing')
    candidates=[]
    for match in re.finditer(r'^\{$',plain[start:],re.M):
        try:
            obj,_=json.JSONDecoder().raw_decode(plain[start+match.start():])
            if isinstance(obj,dict) and isinstance(obj.get('scenarios'),list): candidates.append(obj)
        except json.JSONDecodeError: pass
    if len(candidates)!=1: raise RuntimeError(f'Expected one actual smoke result; found {len(candidates)}')
    smoke=candidates[0]; scenarios=smoke['scenarios']
    save(label+'-actual-smoke-result.json',smoke)
    commands=[cmd for s in scenarios for cmd in s['commands']]
    diagram=[s['diagramValidation'] for s in scenarios if 'diagramValidation' in s]
    lek=[s['learningEvidenceValidation'] for s in scenarios if 'learningEvidenceValidation' in s]
    sites=[s['siteValidation'] for s in scenarios if 'siteValidation' in s]
    lekcommands=[c for c in commands if any(str(arg).replace('\\','/').endswith('/scripts/lek.py') for arg in c.get('args',[]))]
    facts=[]
    combined=scenarios[-1]
    for plugin,package in combined['installedPluginResources'].items():
        for relative,fact in package['rootFiles'].items(): facts.append({'path':plugin+'/'+relative,**fact})
        for skill,resources in package['skills'].items():
            for relative,fact in resources.items(): facts.append({'path':plugin+'/skills/'+skill+'/'+relative,**fact})
    facts.sort(key=lambda row:row['path'])
    canonical=[{'path':f['path'],'sha256':f['sha256']} for f in facts]
    digest=hashlib.sha256(json.dumps(canonical,ensure_ascii=False,separators=(',',':')).encode('utf8')).hexdigest()
    save(label+'-source-cache-comparison-facts.json',{'method':'Comparison facts emitted by actual current CI smoke; source/installed equality enforced by that runtime; no remote files re-read','facts':facts,'canonical_digest_method':'SHA256 of UTF-8 compact JSON sorted path/sha256 rows; ensure_ascii=False; no trailing newline','canonical_digest':digest})
    metrics={'status':'PASS','actual_smoke_json':label+'-actual-smoke-result.json','scenarios':len(scenarios),'scenario_ok_count':sum(s.get('ok') is True for s in scenarios),'commands':len(commands),'commands_nonzero':[c for c in commands if c.get('status')!=0],'diagram_python':len(diagram),'diagram_validation':diagram,'learning_evidence_python':len(lekcommands),'learning_evidence_scenarios':len(lek),'learning_evidence_results':lek,'site_generated':len(sites),'site_static':sum(s['checked'].get('status')=='PASS' and s['checked']['summary'].get('failed')==0 for s in sites),'site_results':sites,'cli_versions_actual':sorted({s['version'] for s in scenarios}),'source_cache_comparison':{'combined_files':len(facts),'unique_paths':len({f['path'] for f in facts}),'runtime_compared_files':len(facts),'facts_file':label+'-source-cache-comparison-facts.json'},'source_cache_digest':digest,'installed_plugin_versions':{p:v['version'] for p,v in combined['installedPluginResources'].items()},'browser_check_in_install_smoke':sorted({s.get('browserCheck','UNKNOWN') for s in sites}),'per_root_absence':'NOT_RECORDED'}
    job['smoke_execution_metrics']=metrics
    job['baseline_actual_version_lines']=[{'line':i+1,'text':line} for i,line in enumerate(lines) if re.search(r'^OK\s+codex\s+==\s+0\.147\.0\s+actual=',line)]
    save(label+'-summary.json',job)
save('summary.json',summary)
print(json.dumps([{'job_id':j['job_id'],'smoke_metrics':j.get('smoke_execution_metrics')} for j in summary['jobs'] if j['job_id'] in (118198894761,118198895238)],ensure_ascii=False,indent=2))
