import subprocess,pathlib,hashlib,json,datetime
base=pathlib.Path(r'C:/Users/Admin/AppData/Local/Temp/html-learning-274-prebump-pr281-diagnostic-ci/source-audit')
def git(*args): return subprocess.run(['git',*args],stdout=subprocess.PIPE,stderr=subprocess.PIPE,check=True).stdout
def utc(): return datetime.datetime.now(datetime.timezone.utc).isoformat()
start=utc(); listing=git('ls-files','--stage','-z'); index_path=pathlib.Path(git('rev-parse','--git-path','index').decode().strip()); raw=index_path.read_bytes()
state={'captured_at':start,'completed_at':utc(),'head':git('rev-parse','HEAD').decode().strip(),'index_file':str(index_path),'index_file_bytes':len(raw),'index_file_sha256':hashlib.sha256(raw).hexdigest(),'stage_listing_bytes':len(listing),'stage_listing_sha256':hashlib.sha256(listing).hexdigest(),'entry_count':len([x for x in listing.split(b'\0') if x])}
(base/'index-state-start.json').write_text(json.dumps(state,indent=2)+'\n',encoding='utf8'); (base/'index-stage-start.raw').write_bytes(listing)
path='plans/274-html-learning-artifact/source-bindings.json'; data=git('show',':'+path); (base/'index-source-bindings.json').write_bytes(data); obj=json.loads(data)
print(json.dumps({'index_state':state,'manifest_root_type':type(obj).__name__,'root_keys':list(obj) if isinstance(obj,dict) else None,'field_shapes':{k:(type(v).__name__,len(v) if hasattr(v,'__len__') else None) for k,v in obj.items()} if isinstance(obj,dict) else None,'sample':str(obj)[:2800]},ensure_ascii=False,indent=2))
