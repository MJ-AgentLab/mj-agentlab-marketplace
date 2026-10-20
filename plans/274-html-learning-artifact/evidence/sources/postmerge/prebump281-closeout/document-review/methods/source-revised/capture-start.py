import pathlib,subprocess,json,hashlib,datetime
out=pathlib.Path(r'C:/Users/Admin/AppData/Local/Temp/html-learning-274-prebump281-document-review/source-audit/candidate1393');root=pathlib.Path.cwd();plan='plans/274-html-learning-artifact/';mf=plan+'source-bindings.json'
def git(*a):return subprocess.run(['git',*a],stdout=subprocess.PIPE,stderr=subprocess.PIPE,check=True).stdout
def sha(b):return hashlib.sha256(b).hexdigest()
def utc():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def save(n,o):(out/n).write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
start=utc();b=(root/mf).read_bytes();sources=json.loads(b)['sources'];changed=sorted(set(x.decode('utf8') for x in git('diff','--name-only','-z','HEAD').split(b'\0') if x)|set(x.decode('utf8') for x in git('ls-files','--others','--exclude-standard','-z').split(b'\0') if x));paths=set(plan+s['path'] for s in sources)|set(changed)|{mf};facts=[]
for p in sorted(paths):
 f=root/p
 if f.is_file():bb=f.read_bytes();facts.append({'path':p,'bytes':len(bb),'sha256':sha(bb)})
 else:facts.append({'path':p,'missing_or_not_file':True})
fingerprint=sha(json.dumps(facts,ensure_ascii=False,separators=(',',':')).encode('utf8'));state={'captured_at':start,'completed_at':utc(),'head':git('rev-parse','HEAD').decode().strip(),'branch':git('branch','--show-current').decode().strip(),'source_count':len(sources),'fingerprint_file_count':len(facts),'working_fingerprint_sha256':fingerprint,'candidate_changed_paths':changed}
save('working-state-start.json',state);save('working-files-start.json',facts);(out/'source-bindings-start.json').write_bytes(b)
mapentry=next(s for s in sources if s['path'].endswith('/actual629-relocation-map.json'));mp=root/(plan+mapentry['path']);mb=mp.read_bytes();obj=json.loads(mb);(out/'relocation-map-snapshot.json').write_bytes(mb)
print(json.dumps({'state':{k:v for k,v in state.items() if k!='candidate_changed_paths'},'last_two_sources':sources[-2:],'map_path':plan+mapentry['path'],'map_bytes':len(mb),'map_sha256':sha(mb),'map':obj},ensure_ascii=False,indent=2))
