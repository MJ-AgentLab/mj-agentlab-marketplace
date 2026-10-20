import pathlib,json,hashlib,datetime,re,collections
root=pathlib.Path(r'C:/Users/Admin/AppData/Local/Temp/html-learning-274-prebump-pr281-diagnostic-ci/batch-6ef5eabd');out=root/'independent-parser-audit'
platform='linux'
def utc():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def hashbytes(data):return hashlib.sha256(data).hexdigest()
def save(name,obj):(out/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
started=utc();rawpath=root/'pr'/f'{platform}-job.raw.log';sum_path=root/'pr'/f'{platform}-summary.json'
data=rawpath.read_bytes();refdata=sum_path.read_bytes();ref=json.loads(refdata);(out/f'{platform}-summary-at-audit.json').write_bytes(refdata)
lines=[]
for rawline in data.decode('utf8').splitlines():
    stamp,space,body=rawline.partition(' ')
    lines.append(body if space and re.fullmatch(r'\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d+Z',stamp) else rawline)
# Independently count TAP result records; trailer totals are only a cross-check.
trailer={};tests=[];pending=[];tap_plan=[];errors=[];checkouts=[]
for no,line in enumerate(lines,1):
    if line.startswith('# Subtest: '):pending.append((no,line[len('# Subtest: '):]))
    if line.startswith('ok ') or line.startswith('not ok '):
        left,sep,name=line.partition(' - ')
        if not sep:continue
        parts=left.split();number=int(parts[-1]);verdict='PASS' if parts[0]=='ok' else 'FAIL'
        skip=bool(re.search(r'\s+# SKIP(?:\s|$)',name));clean_name=re.sub(r'\s+# SKIP(?:\s.*)?$','',name)
        tests.append({'number':number,'name':name,'verdict':verdict,'skip':skip,'raw_line':no,'matching_subtest_lines':[p[0] for p in pending if p[1]==clean_name]})
    if line.startswith('# '):
        parts=line[2:].split()
        if len(parts)==2 and parts[0] in ['tests','suites','pass','fail','cancelled','skipped','todo'] and parts[1].isdigit():trailer[parts[0]]=int(parts[1])
    if re.fullmatch(r'1\.\.\d+',line):tap_plan.append(int(line[3:]))
    if '##[error]' in line:errors.append({'line':no,'text':line})
    if line.startswith('[command]') and line.endswith(' log -1 --format=%H'):checkouts.append({'command_line':no,'sha_line':no+1,'sha':lines[no]})
counts={'tests':len(tests),'pass':sum(t['verdict']=='PASS' and not t['skip'] for t in tests),'fail':sum(t['verdict']=='FAIL' and not t['skip'] for t in tests),'skipped':sum(t['skip'] for t in tests)}
checks=[]
def compare(label,actual,want):checks.append({'claim':label,'actual':actual,'expected_or_parent':want,'match':actual==want})
compare('raw length',len(data),ref['raw']['bytes']);compare('raw SHA256',hashbytes(data),ref['raw']['sha256']);compare('known completed raw length',len(data),969927);compare('known completed raw SHA256',hashbytes(data),'9bbac38a7208c0c77bfec06e03893a1e5a05e6f4d2e4a0fc8d6741b68b01eff7')
compare('TAP cases independently recounted',counts,{'tests':644,'pass':643,'fail':0,'skipped':1});compare('TAP id set',sorted(t['number'] for t in tests),list(range(1,645)))
for key,value in counts.items():compare('trailer '+key,trailer[key],value);compare('parent TAP '+key,ref['tap'][key],value)
compare('TAP plan',tap_plan,[644]);compare('parent TAP case count',ref['tapCaseCount'],len(tests));compare('error annotations',errors,[])
skips=[t for t in tests if t['skip']];browser=[t for t in tests if 'browser' in t['name'].lower() or 'viewport' in t['name'].lower()]
compare('single Windows casing skip',[(t['number'],t['name']) for t in skips],[(563,'Windows equivalent file casing still passes containment # SKIP')]);compare('four browser-related TAP cases',len(browser),4);compare('all browser-related cases execute and pass',all(t['verdict']=='PASS' and not t['skip'] for t in browser),True)
compare('parent browser result identities',[(t['number'],t['name'],t['verdict'],t['skip']) for t in browser],[(t['number'],t['name'],'PASS' if t['status']=='ok' else 'FAIL',t['skipped']) for t in ref['browserCases']])
compare('actual checkout',checkouts[0]['sha'] if len(checkouts)==1 else checkouts,ref['actualCheckout'])
# Parse exactly the JSON emitted within the actual smoke step; count only scenarios, not the duplicated top-level combined return.
stepstart=next(i for i,line in enumerate(lines) if line.startswith('##[group]Run npm run smoke:codex'))
jsonstart=next(i for i in range(stepstart+1,len(lines)) if lines[i]=='{')
smoke,used=json.JSONDecoder().raw_decode('\n'.join(lines[jsonstart:]));scenarios=smoke['scenarios'];commands=[cmd for scenario in scenarios for cmd in scenario['commands']]
output_counts=collections.Counter()
for cmd in commands:
    args=[str(a).replace('\\','/') for a in cmd.get('args',[])]
    if any(a.endswith('/validate_diagram.py') for a in args):output_counts['diagram']+=1
    if any(a.endswith('/scripts/lek.py') for a in args):output_counts['lek']+=1
    if any(a.endswith('/scripts/render-site.mjs') for a in args):output_counts['siteGeneration']+=1
    if any(a.endswith('/scripts/check_artifact.py') for a in args):output_counts['siteStatic']+=1
combined=scenarios[-1];versions=sorted(set(s['version'] for s in scenarios));sites=[s['siteValidation'] for s in scenarios if 'siteValidation' in s]
metrics={'scenarios':len(scenarios),'all_scenarios_ok':all(s['ok'] is True for s in scenarios),'commands':len(commands),'nonzero_commands':[c for c in commands if c['status']!=0],'execution_counts':dict(output_counts),'cli_versions':versions,'public_resource_trees':len(combined['installedResources']),'site_resources':len(combined['installedResources']['html-guide-kit:site']),'inventory':{k:combined[k] for k in ['outside','repository','nativeOutside','nativeRepository','explicitOnly']},'static':[],'browser_smoke':[s['browserCheck'] for s in sites]}
for s in sites:
    c=s['checked'];metrics['static'].append({'rendered_status':s['rendered']['status'],'status':c['status'],'declared_checks':c['summary']['checks'],'actual_checks':len(c['checks']),'actual_pass':sum(x['status']=='PASS' for x in c['checks']),'failed':c['summary']['failed']})
compare('smoke scenarios',len(scenarios),13);compare('smoke all ok',metrics['all_scenarios_ok'],True);compare('smoke commands',len(commands),178);compare('smoke command statuses',metrics['nonzero_commands'],[]);compare('execution path count',dict(output_counts),{'diagram':6,'lek':18,'siteGeneration':4,'siteStatic':4});compare('actual CLI versions',versions,['codex-cli 0.147.0']);compare('public resource trees',metrics['public_resource_trees'],8);compare('site resource files',metrics['site_resources'],20)
compare('natural outside',combined['outside'],{'publicSkills':3,'repositorySkills':0});compare('natural repo',combined['repository'],{'publicSkills':3,'repositorySkills':20});compare('native outside',combined['nativeOutside'],{'publicSkills':8,'repositorySkills':0});compare('native repo',combined['nativeRepository'],{'publicSkills':8,'repositorySkills':20});compare('explicit skill count',len(combined['explicitOnly']),5)
compare('4 static results each 89/89',metrics['static'],[{'rendered_status':'GENERATED','status':'PASS','declared_checks':89,'actual_checks':89,'actual_pass':89,'failed':0}]*4)
for field,actual in [('scenarios',len(scenarios)),('commands',len(commands)),('executionCounts',dict(output_counts)),('cliVersions',versions),('publicResourceTrees',metrics['public_resource_trees']),('siteResources',metrics['site_resources']),('inventory',metrics['inventory']),('siteBrowserChecks',metrics['browser_smoke'])]:compare('parent smoke '+field,ref['smoke'][field],actual)
# Reconcile every emitted public-skill resource hash to the current raw combined scenario, never to another platform or old batch.
expected={(skill,path):sha for skill,files in combined['installedResources'].items() for path,sha in files.items()};differences=[];occurrences=0
for n,s in enumerate(scenarios,1):
    for skill,files in s['installedResources'].items():
        for path,sha in files.items():
            occurrences+=1
            if expected.get((skill,path))!=sha:differences.append({'scenario':n,'skill':skill,'path':path,'sha256':sha,'combined':expected.get((skill,path))})
compare('cross-scenario public resource hashes',differences,[]);compare('parent resource hash differences',ref['smoke']['resourceHashCrossScenarioDifferences'],differences)
unchanged=rawpath.read_bytes()==data;compare('original raw bytes stable during audit',unchanged,True)
issues=[c['claim'] for c in checks if not c['match']]
receipt={'schemaVersion':1,'platform':platform,'started_at':started,'completed_at':utc(),'status':'PASS' if not issues else 'FAIL','raw_source':{'path':str(rawpath),'bytes':len(data),'sha256':hashbytes(data),'stable_during_read':unchanged},'comparison_summary_source':{'path':str(sum_path),'bytes':len(refdata),'sha256':hashbytes(refdata),'snapshot':f'{platform}-summary-at-audit.json'},'actual_checkout':checkouts,'tap_independent_counts':counts,'tap_trailer':trailer,'skips':skips,'browser_related_cases':browser,'browser_boundary':'Four browser-related engineering TAP cases are not four real layout/consumer UI acceptances; unavailable/cleanup are failure/cleanup tests; actual layout is case330.','new_diagnostic_cases':[t for t in tests if t['number'] in (31,32)],'existing_stderr_cases':[t for t in tests if t['number'] in (147,528)],'parent_field_naming_note':'Original parent newDiagnosticTestCases includes existing stderr tests147/528; old1d8 Git source already has these. Parent notified; this is metadata labeling, not a TAP/smoke PASS discrepancy.','smoke':metrics,'resource_hash_audit':{'unique_public_resource_files':len(expected),'cross_scenario_file_occurrences':occurrences,'differences':differences,'scope':'Only current Linux raw runtime source/cache evidence; no physical cross-platform byte claim.'},'checks':checks,'verification_issues':issues,'limits':{'installation_browser':'NOT_RUN','individual_root_absence':'NOT_RECORDED','consumer_ui_acceptance':'NOT_MEASURED; not inferred from TAP'},'no_test_or_api_execution':True}
save(f'{platform}-tap-results.json',tests);save(f'{platform}-receipt.json',receipt)
print(json.dumps({'status':receipt['status'],'raw':receipt['raw_source'],'tap':counts,'browser':[{'number':t['number'],'name':t['name'],'skip':t['skip']} for t in browser],'smoke':{k:v for k,v in metrics.items() if k not in ['inventory','browser_smoke']},'resource_hashes':receipt['resource_hash_audit'],'verification_issues':issues,'receipt_file':str(out/f'{platform}-receipt.json')},ensure_ascii=False,indent=2))
