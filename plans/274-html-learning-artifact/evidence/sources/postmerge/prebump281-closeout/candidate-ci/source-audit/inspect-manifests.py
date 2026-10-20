import subprocess,json
p='plans/274-html-learning-artifact/source-bindings.json'
def git(*a): return subprocess.run(['git',*a],stdout=subprocess.PIPE,stderr=subprocess.PIPE,check=True).stdout
new=json.loads(git('show',':'+p)); old=json.loads(git('show','1d8b6849ec7e398d65a949d204abe38bc64a4e0b:'+p))
print(json.dumps({'old_count':len(old['sources']),'new_count':len(new['sources']),'new_entry_keys':sorted(set(k for s in new['sources'][740:] for k in s)),'manifest_records':[s for s in new['sources'] if s['path'].endswith(('final-manifest.json','finalmanifest.json'))][-12:]},ensure_ascii=False,indent=2))
for rel in ['evidence/sources/postmerge/prebump281/attempt2-push/finalmanifest.json','evidence/sources/postmerge/prebump281/attempt1-windows-supplement/final-manifest.json','evidence/sources/postmerge/prebump281/pre-diagnostic-stage/final-manifest.json']:
    data=git('show',':plans/274-html-learning-artifact/'+rel); obj=json.loads(data)
    print(json.dumps({'path':rel,'keys':list(obj),'sample':str(obj)[:2000]},ensure_ascii=False,indent=2))
