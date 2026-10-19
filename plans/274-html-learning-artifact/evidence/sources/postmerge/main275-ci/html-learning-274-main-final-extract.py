"""Read-only independent extraction from the two final GitHub job log files."""
import hashlib,json,pathlib,re

ROOT=pathlib.Path('C:/Users/Admin/AppData/Local/Temp')
EXPECTED_HEAD='1a80bab5c85ae9b216f49a5d9c114770117ab2dd'
EXPECTED_BASE='1d5219c1fa1bbf14cc79f630a59e9a8c857248f4'
EXPECTED_TREE='d7de559f6563d8208098952f92495c1b7acca9cb'
summary={'schemaVersion':1,'runId':39242165655,'pr':275,'expectedHead':EXPECTED_HEAD,'expectedBase':EXPECTED_BASE,'expectedTree':EXPECTED_TREE,'platforms':{}}

def extract(platform,job):
    log=ROOT/f'html-learning-274-main-final-{platform}.log'
    raw=log.read_bytes()
    text='\n'.join(re.sub(r'^\d{4}-\d\d-\d\dT\S+Z ', '', line) for line in raw.decode('utf-8-sig').splitlines())
    tap={}
    for key,value in re.findall(r'(?m)^# (tests|suites|pass|fail|cancelled|skipped|todo) (\d+)\s*$',text):tap[key]=int(value)
    skipped=re.findall(r'(?m)^ok \d+ - (.*?)(?:\s+# SKIP.*)$',text)
    decoder=json.JSONDecoder();offset=0;smoke=None
    while offset<len(text):
        match=re.search(r'(?m)^\s*\{',text[offset:])
        if not match:break
        start=offset+match.start()
        while text[start].isspace():start+=1
        try:
            obj,size=decoder.raw_decode(text[start:]);offset=start+size
            if isinstance(obj,dict) and 'scenarios' in obj:smoke=obj
        except ValueError:offset=start+1
    assert smoke is not None,'missing actual smoke JSON'
    counts={'diagramPython':0,'lekPython':0,'siteGeneration':0,'siteStaticPython':0}
    endings={'diagramPython':'validate_diagram.py','lekPython':'/scripts/lek.py','siteGeneration':'render-site.mjs','siteStaticPython':'check_artifact.py'}
    nonzero=[]
    for index,scenario in enumerate(smoke['scenarios']):
        for command in scenario.get('commands',[]):
            for argument in command.get('args',[]):
                if isinstance(argument,str):
                    for key,ending in endings.items():
                        if argument.replace('\\','/').endswith(ending):counts[key]+=1
            if command.get('status')!=0:nonzero.append({'scenario':index,'status':command.get('status')})
    site=[row['siteValidation'] for row in smoke['scenarios'] if row.get('siteValidation')]
    record={'jobId':job,'log':str(log),'logSha256':hashlib.sha256(raw).hexdigest(),'logBytes':len(raw),'tap':tap,'skippedCases':skipped,'smokeOk':smoke.get('ok'),'smokeScenarios':len(smoke['scenarios']),'allScenarioOk':all(row.get('ok') is True for row in smoke['scenarios']),'executionCounts':counts,'nonzeroCommands':nonzero,'siteStaticSummaries':[row['checked']['summary'] for row in site],'siteBrowserScope':[row.get('browserCheck') for row in site]}
    assert tap['fail']==0 and tap['cancelled']==0
    assert record['smokeOk'] and record['allScenarioOk'] and record['smokeScenarios']==13
    assert counts=={'diagramPython':6,'lekPython':18,'siteGeneration':4,'siteStaticPython':4}
    assert not nonzero and all(row['checked']['status']=='PASS' and row['checked']['summary']['failed']==0 for row in site)
    (ROOT/f'html-learning-274-main-final-{platform}-smoke.json').write_text(json.dumps(smoke,ensure_ascii=False,indent=2),encoding='utf-8')
    return record

for platform,job in [('linux',118025344868),('windows',118025345396)]:summary['platforms'][platform]=extract(platform,job)
initial=json.loads((ROOT/'html-learning-274-main-final-pr-initial.json').read_text(encoding='utf-8-sig'))
final=json.loads((ROOT/'html-learning-274-main-final-pr-final.json').read_text(encoding='utf-8-sig'))
tree=json.loads((ROOT/'html-learning-274-main-final-tree.json').read_text(encoding='utf-8-sig'))
run=json.loads((ROOT/'html-learning-274-main-final-run.json').read_text(encoding='utf-8-sig'))
assert initial['headRefOid']==final['headRefOid']==run['headSha']==EXPECTED_HEAD
assert initial['baseRefOid']==final['baseRefOid']==EXPECTED_BASE
assert tree['sha']==EXPECTED_HEAD and tree['tree']==EXPECTED_TREE
assert run['status']=='completed' and run['conclusion']=='success'
jobs={job['databaseId']:job for job in run['jobs']}
for platform in summary['platforms'].values():
    job=jobs[platform['jobId']]
    assert job['status']=='completed' and job['conclusion']=='success'
    platform.update({'conclusion':job['conclusion'],'completedAt':job['completedAt'],'url':job['url']})
summary.update({'currentHead':final['headRefOid'],'currentBase':final['baseRefOid'],'headAndBaseUnchanged':True,'runConclusion':run['conclusion'],'limitations':['This is the current main PR matrix, not a replacement for current-head protected approval, resolved threads, actual merge or release.','Smoke performs local site generation and static Python checks; its browserCheck fields explicitly remain NOT_RUN. Separate browser and consumer evidence applies within its recorded scope.']})
out=ROOT/'html-learning-274-main-final-summary.json'
out.write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(summary,ensure_ascii=False,indent=2))
