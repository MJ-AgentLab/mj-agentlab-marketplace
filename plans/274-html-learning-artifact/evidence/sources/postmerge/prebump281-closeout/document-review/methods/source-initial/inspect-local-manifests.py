import pathlib,json,posixpath
root=pathlib.Path.cwd();plan='plans/274-html-learning-artifact/';o=json.loads((root/(plan+'source-bindings.json')).read_text(encoding='utf8'));sources=o['sources'][979:];found=[]
for s in sources:
    if not s['path'].endswith('.json'):continue
    p=root/(plan+s['path'])
    try:v=json.loads(p.read_text(encoding='utf8'))
    except (UnicodeError,json.JSONDecodeError):continue
    if not isinstance(v,dict):continue
    f=v.get('files')
    if isinstance(f,list) and f and all(isinstance(r,dict) for r in f) and any('sha256' in r and ('file' in r or 'path' in r) for r in f):
        missing=[]
        for r in f:
            rel=r.get('file',r.get('path'))
            if isinstance(rel,str) and not (p.parent/rel).is_file():missing.append(rel)
        found.append({'path':plan+s['path'],'keys':list(v),'declared_files':len(f),'first':f[:2],'missing_relative':missing})
print(json.dumps(found,ensure_ascii=False,indent=2))
