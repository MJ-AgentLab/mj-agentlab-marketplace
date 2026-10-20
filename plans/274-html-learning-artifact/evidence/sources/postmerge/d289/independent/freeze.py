import datetime,hashlib,json,pathlib
OUT=pathlib.Path(__file__).resolve().parent
summary=json.loads((OUT/'summary.json').read_text());review=json.loads((OUT/'guarded-scripts-review-v3/review.json').read_text())
assert summary['status']=='PASS_LIMITED' and summary['actualDevelop']=='f3e8ba322109e2a43dcdcd68fdd2f0c655c78240'
assert review['status']=='PASS_CONDITIONAL_NOT_EXECUTED'
files=[]
for path in sorted(OUT.rglob('*')):
    if not path.is_file() or '__pycache__' in path.parts:continue
    data=path.read_bytes();files.append({'path':path.relative_to(OUT).as_posix(),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
with (OUT.parent/'actual-develop-independent-freeze.json').open('x',encoding='utf-8') as stream:stream.write(json.dumps({'frozenAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'root':str(OUT),'status':'FROZEN_ACTUAL_DEVELOP_INDEPENDENT_EVIDENCE_AND_GUARDED_SCRIPT_REVIEW','fileCount':len(files),'files':files},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':summary['status'],'actualDevelop':summary['actualDevelop'],'independentChecks':summary['checkCount'],'conditionalScriptReviewChecks':review['checkCount'],'filesFrozen':len(files)}))
