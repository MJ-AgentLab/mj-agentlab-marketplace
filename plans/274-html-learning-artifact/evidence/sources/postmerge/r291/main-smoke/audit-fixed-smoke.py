import datetime, hashlib, json, pathlib, sys

ROOT=pathlib.Path(__file__).resolve().parent
def read(name): return json.loads((ROOT/name).read_text(encoding='utf-8'))
checks=[]
def check(name,value,observed=None): checks.append({'name':name,'passed':bool(value),'observed':observed})
def normalized(value): return str(pathlib.Path(value).resolve()).replace('\\','/').lower()
try:
    config=read('run-config.json'); result=read('run-result.json'); before=read('before-snapshot.json'); after=read('after-snapshot.json'); report=read('smoke-report.json'); command=read('command.json'); roots=read('owned-roots-absence.json'); tools=read('tools.json')
    scenarios=report['scenarios']; commands=[dict(scenario=i+1,**command) for i,scenario in enumerate(scenarios) for command in scenario['commands']]
    def ends(command,suffix): return any(str(argument).replace('\\','/').endswith(suffix) for argument in command['args'])
    diagrams=[c for c in commands if ends(c,'/validate_diagram.py')]
    lek=[c for c in commands if ends(c,'/lek.py')]
    sitechecks=[c for c in commands if ends(c,'/check_artifact.py')]
    sitegenerations=[c for c in commands if ends(c,'/render-site.mjs')]
    site=[s for s in scenarios if s.get('siteValidation')]
    recheck=[]
    for record in roots:
        owned=pathlib.Path(record['root']); prefix={'canonical':'release-install-','template':'marketplace-smoke-source-','scenario':'marketplace-smoke-'}[record['kind']]
        recheck.append(dict(record,existsAtIndependentAudit=owned.exists(),boundaryAtIndependentAudit=normalized(owned.parent)==normalized(config['shortTemp']) and owned.name.startswith(prefix),secondCheckedAt=datetime.datetime.now(datetime.timezone.utc).isoformat()))
    check('fixed source SHA and tree',result['canonicalSha']==config['canonicalSha'] and result['canonicalTree']==config['canonicalTree'],{'sha':result['canonicalSha'],'tree':result['canonicalTree']})
    check('host identity and clean unchanged',before['head']==after['head']==config['expectedHead'] and before['tree']==after['tree']==config['expectedTree'] and before['statusBase64']==after['statusBase64']=='')
    check('primary identity status and source unchanged',before['primaryHead']==after['primaryHead'] and before['primaryStatusBase64']==after['primaryStatusBase64'] and before['ownerOriginalSha256']==after['ownerOriginalSha256']=='dc9d58437778093ae9b51d052908712a3bbb2624f16ff335f5210435ca2f0895')
    check('all complete worktree records byte identical',before['worktreesBase64']==after['worktreesBase64'])
    check('process-only TEMP same for outer and child',all(normalized(command['processEnvironment'][key])==normalized(config['shortTemp']) for key in ['TEMP','TMP','outerOsTmpdir']))
    check('actual Codex CLI exact baseline',tools['cli']['status']==0 and tools['cli']['stdout'].strip()=='codex-cli 0.147.0' and all(s['version']=='codex-cli 0.147.0' for s in scenarios))
    check('actual Python is bundled interpreter',tools['python']['status']==0 and tools['pathPython']['status']==0 and normalized(json.loads(tools['python']['stdout'])['executable'])==normalized(config['python']) and normalized(tools['pathPython']['stdout'].strip())==normalized(config['python']))
    check('canonical verifier default strict version and cleanup',command['allowVersionDrift'] is False and command['keepRoot'] is False)
    check('smoke zero exit and outer guards',result['exitCode']==0 and result['overall']=='PASS_PENDING_INDEPENDENT_AUDIT' and all(result['guards'].values()) and not result.get('evidenceAnalysisError'))
    check('13 fresh scenarios all pass',len(scenarios)==13 and all(s['ok'] is True for s in scenarios),len(scenarios))
    check('178 actual commands all zero',len(commands)==178 and all(c['status']==0 for c in commands),{'actual':len(commands),'zero':sum(c['status']==0 for c in commands)})
    check('6 actual Diagram Python calls',len(diagrams)==6 and all(c['command']=='python' for c in diagrams) and sum(bool(s.get('diagramValidation')) for s in scenarios)==6,len(diagrams))
    check('18 actual LEK Python calls',len(lek)==18 and all(c['command']=='python' for c in lek) and sum(bool(s.get('learningEvidenceValidation')) for s in scenarios)==6,len(lek))
    check('4 actual site generations and Python checks',len(site)==4 and len(sitegenerations)==4 and len(sitechecks)==4 and all(c['command']=='python' for c in sitechecks),{'site':len(site),'generation':len(sitegenerations),'python':len(sitechecks)})
    check('4 static reports96 checks zero fail',len(site)==4 and all(s['siteValidation']['checked']['status']=='PASS' and s['siteValidation']['checked']['summary']['checks']==96 and s['siteValidation']['checked']['summary']['failed']==0 for s in site),[s['siteValidation']['checked']['summary'] for s in site])
    check('HTML0.1.39 installed from own cache',len(site)==4 and all('/html-guide-kit/0.1.39/' in s['siteValidation']['skillPath'].replace('\\','/') for s in site))
    check('site20 guide4 full installed resources',len(site)==4 and all(len(s['installedResources']['html-guide-kit:site'])==20 and len(s['installedResources']['html-guide-kit:guide'])==4 for s in site))
    check('ordinary3 native8 explicit5 repo20',report['outside']=={'publicSkills':3,'repositorySkills':0} and report['repository']=={'publicSkills':3,'repositorySkills':20} and report['nativeOutside']=={'publicSkills':8,'repositorySkills':0} and report['nativeRepository']=={'publicSkills':8,'repositorySkills':20} and len(report['explicitOnly'])==5)
    check('15 exact observed owned roots',len(roots)==15 and len({normalized(r['root']) for r in roots})==15 and sum(r['kind']=='canonical' for r in roots)==1 and sum(r['kind']=='template' for r in roots)==1 and sum(r['kind']=='scenario' for r in roots)==13,len(roots))
    check('each root boundary and double absence',len(roots)==15 and all(r['boundaryVerified'] and r['boundaryAtIndependentAudit'] and not r['existsAfter'] and not r['existsAtIndependentAudit'] for r in recheck))
    check('no manual root cleanup',result['cleanup']['manualRootCleanupPerformed'] is False)
    temp=pathlib.Path(config['shortTemp'])
    check('dedicated TEMP empty at independent audit',temp.is_dir() and not any(temp.iterdir()))
    check('installation browser NOT_RUN preserved',len(site)==4 and all(s['siteValidation']['browserCheck'].startswith('NOT_RUN') for s in site))
    summary={'auditedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'PASS_LIMITED' if all(c['passed'] for c in checks) else 'FAIL','checks':checks,'checkCount':len(checks),'sourceSha':config['canonicalSha'],'sourceTree':config['canonicalTree'],'hostSha':before['head'],'actualCounts':{'scenarios':len(scenarios),'commands':len(commands),'diagramPython':len(diagrams),'lekPython':len(lek),'siteGeneration':len(sitegenerations),'siteStaticPython':len(sitechecks)},'roots':recheck,'limits':['Fixedcommit installation/discovery/static evidence only; no real browser/GUI, model behavior, Matt interview, desktop/native waiting-window, second-client, Sites or effects were run.','Actual public tag/Release unchanged; this candidate install is not publication or Owner acceptance.','Historical failures/rootUNKNOWN and protected approvalNOT_MET remain independent.']}
except Exception as error:
    import traceback
    summary={'auditedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'FAIL','checks':checks,'error':traceback.format_exc()}
target=ROOT/'independent-audit.json'
with target.open('x',encoding='utf-8') as stream: stream.write(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':summary['status'],'checkCount':len(checks),'passed':sum(c['passed'] for c in checks),'actualCounts':summary.get('actualCounts'),'failed':[c['name'] for c in checks if not c['passed']]},ensure_ascii=False))
sys.exit(0 if summary['status']=='PASS_LIMITED' else 1)
