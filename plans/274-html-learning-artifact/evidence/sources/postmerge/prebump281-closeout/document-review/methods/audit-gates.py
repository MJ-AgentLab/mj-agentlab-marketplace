"""Read closed document-gate logs only. Process exit and candidate identity are
root observations; TAP/strict contents and original bytes are independently parsed.
"""
import datetime,hashlib,json,pathlib,re
TEMP=pathlib.Path('C:/Users/Admin/AppData/Local/Temp');OUT=TEMP/'html-learning-274-prebump281-document-review/gate-log-audit';reports=[]
for attempt,suffix in [('initial1391',''),('revised1393','-r2')]:
    file=TEMP/f'html-learning-274-prebump281-closeout-document-tests{suffix}.log';raw=file.read_bytes();text=raw.decode('utf-8-sig');tap={k:int(v)for k,v in re.findall(r'(?m)^# (tests|suites|pass|fail|cancelled|skipped|todo) (\d+)\s*$',text)};cases=re.findall(r'(?m)^(ok|not ok) (\d+) - (.*)$',text);assert tap['tests']==tap['pass']==len(cases)==171 and tap['fail']==tap['cancelled']==tap['skipped']==tap['todo']==0 and all(c[0]=='ok'for c in cases)
    strict_file=TEMP/f'html-learning-274-prebump281-closeout-validate{suffix}.log';strict_raw=strict_file.read_bytes();strict_text=strict_raw.decode('utf-8-sig');decoder=json.JSONDecoder();values=[]
    for m in re.finditer(r'(?m)^\{',strict_text):
        try:v,n=decoder.raw_decode(strict_text[m.start():]);values.append(v)
        except ValueError:pass
    strict=next(v for v in values if isinstance(v,dict)and'ok'in v and'errors'in v);assert strict['ok'] is True and strict['errors']==[] and strict['repositorySkills']==20 and len(strict['publicSkills'])==8
    reports.append({'attempt':attempt,'contentStatus':'PASS','tap':tap,'testLog':{'original':str(file),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()},'strictLog':{'original':str(strict_file),'bytes':len(strict_raw),'sha256':hashlib.sha256(strict_raw).hexdigest()},'strict':strict,'rootObservedProcessExit':{'value':0,'source':'Root parent messages confirm actual exit0 and fixed candidate; raw logs do not contain independent process exit/candidate SHA marker'},'scope':'171 bounded documentation-related tests and strict validation. Not new full644 tests or13 installations.'})
result={'schema':1,'auditedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'PASS','attempts':reports,'limits':['Initial171/strict PASS does not erase initial1391 semantic alias-closure BLOCK.','Revised1393 source/mapping/semantic review is reported separately; actual CI/protected approval for future docPR remains untested.','No tests/API/repository writes by this log audit; original logs are not modified or duplicated here.']};(OUT/'report.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps({'status':'PASS','bothAttempts171':True,'reportSha256':hashlib.sha256((OUT/'report.json').read_bytes()).hexdigest()}))
