import pathlib,subprocess,json,hashlib,datetime
base=pathlib.Path(r'C:/Users/Admin/AppData/Local/Temp/html-learning-274-prebump-pr281-ci/attempt2-push'); sha='1d8b6849ec7e398d65a949d204abe38bc64a4e0b'
paths=['VERSION']+[f'plugins/{p}/plugin.json' for p in ['diagram-kit','learning-evidence-kit','explain-kit','html-guide-kit','communication-kit']]
rows=[]
for path in paths:
    p=subprocess.run(['git','show',sha+':'+path],stdout=subprocess.PIPE,stderr=subprocess.PIPE,check=True)
    data=p.stdout
    version=data.decode('utf8').strip() if path=='VERSION' else json.loads(data)['version']
    rows.append({'path':path,'git_object':sha+':'+path,'version':version,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
result={'captured_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_commit':sha,'versions':rows,'published_state':'Parent assignment states marketplace 8.3.3 is unpublished; this version binding does not independently inspect releases.'}
(base/'source-version-binding.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps(result,ensure_ascii=False,indent=2))
