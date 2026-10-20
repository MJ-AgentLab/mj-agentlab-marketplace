import pathlib,subprocess,json,hashlib,datetime
out=pathlib.Path(r'C:/Users/Admin/AppData/Local/Temp/html-learning-274-prebump281-document-review/source-audit');root=pathlib.Path.cwd();plan='plans/274-html-learning-artifact/';mf=plan+'source-bindings.json'
def git(*args):return subprocess.run(['git',*args],stdout=subprocess.PIPE,stderr=subprocess.PIPE,check=True).stdout
def sh(b):return hashlib.sha256(b).hexdigest()
def utc():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def save(n,o):(out/n).write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
started=utc();b=(root/mf).read_bytes();obj=json.loads(b);sources=obj['sources'];old=json.loads(git('show','62945150df984e2747684d1ea46b8772b56db2d9:'+mf))['sources']
changed=sorted(set(x.decode('utf8') for x in git('diff','--name-only','-z','HEAD').split(b'\0') if x)|set(x.decode('utf8') for x in git('ls-files','--others','--exclude-standard','-z').split(b'\0') if x))
tracked=set(plan+s['path'] for s in sources)|set(changed)|{mf};facts=[]
for p in sorted(tracked):
    file=root/p
    if file.is_file():data=file.read_bytes();facts.append({'path':p,'bytes':len(data),'sha256':sh(data)})
    else:facts.append({'path':p,'missing_or_not_file':True})
serialized=json.dumps(facts,ensure_ascii=False,separators=(',',':')).encode('utf8');state={'captured_at':started,'completed_at':utc(),'head':git('rev-parse','HEAD').decode().strip(),'branch':git('branch','--show-current').decode().strip(),'source_count':len(sources),'old629_count':len(old),'candidate_changed_paths':changed,'fingerprint_file_count':len(facts),'working_fingerprint_sha256':sh(serialized),'algorithm':'SHA256 UTF8 compact JSON sorted records(path,bytes,sha256); covers all source paths, bindings and all tracked diff/untracked candidate paths'}
save('working-state-start.json',state);save('working-files-start.json',facts);(out/'working-source-bindings-start.json').write_bytes(b)
new=sources[len(old):];man=[s for s in new if 'manifest' in pathlib.PurePosixPath(s['path']).name.lower()]
print(json.dumps({'state':{k:v for k,v in state.items() if k!='candidate_changed_paths'},'new_count':len(new),'new_manifest_sources':man},ensure_ascii=False,indent=2))
