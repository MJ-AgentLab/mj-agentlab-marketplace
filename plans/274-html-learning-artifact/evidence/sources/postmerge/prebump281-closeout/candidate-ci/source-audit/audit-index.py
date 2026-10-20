import subprocess,pathlib,json,hashlib,datetime,posixpath
base=pathlib.Path(r'C:/Users/Admin/AppData/Local/Temp/html-learning-274-prebump-pr281-diagnostic-ci/source-audit'); plan='plans/274-html-learning-artifact/'; oldsha='1d8b6849ec7e398d65a949d204abe38bc64a4e0b'
def utc(): return datetime.datetime.now(datetime.timezone.utc).isoformat()
def sha(data): return hashlib.sha256(data).hexdigest()
def git(*args): return subprocess.run(['git',*args],stdout=subprocess.PIPE,stderr=subprocess.PIPE,check=True).stdout
def save(name,obj): (base/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
started=utc(); before=git('ls-files','--stage','-z'); initial=(base/'index-stage-start.raw').read_bytes(); blocks=[]
if before!=initial: blocks.append('INDEX_CHANGED_SINCE_INITIAL_CAPTURE')
index={}
for raw in before.split(b'\0'):
    if not raw: continue
    meta,path=raw.split(b'\t',1); mode,oid,stage=meta.decode().split(); index[path.decode('utf8')]={'mode':mode,'oid':oid,'stage':stage}
oldtree=git('ls-tree','-r','-z',oldsha); oldindex={}
for raw in oldtree.split(b'\0'):
    if not raw: continue
    meta,path=raw.split(b'\t',1); mode,typ,oid=meta.decode().split(); oldindex[path.decode('utf8')]={'mode':mode,'oid':oid}
manifest_path=plan+'source-bindings.json'; newdata=git('show',':'+manifest_path); olddata=git('show',oldsha+':'+manifest_path); new=json.loads(newdata); old=json.loads(olddata)
ns=new['sources']; os=old['sources']
if len(ns)!=979: blocks.append('SOURCE_COUNT_NOT_979')
if len(os)!=740: blocks.append('OLD_SOURCE_COUNT_NOT_740')
prefix=ns[:len(os)]==os
if not prefix: blocks.append('OLD_SOURCE_RECORD_PREFIX_CHANGED')
ids=[s['id'] for s in ns]; paths=[plan+s['path'] for s in ns]
if len(set(ids))!=len(ids): blocks.append('DUPLICATE_SOURCE_ID')
if len(set(paths))!=len(paths): blocks.append('DUPLICATE_SOURCE_PATH')
actual_set={p for p in index if p.startswith(plan+'evidence/sources/')}
missing=sorted(set(paths)-actual_set); extra=sorted(actual_set-set(paths))
if missing or extra: blocks.append('SOURCE_PATH_SET_MISMATCH')
blobcache={}; proc=subprocess.Popen(['git','cat-file','--batch'],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
def blob(oid):
    if oid in blobcache:return blobcache[oid]
    proc.stdin.write((oid+'\n').encode()); proc.stdin.flush(); header=proc.stdout.readline().decode().strip().split()
    assert len(header)==3 and header[1]=='blob',header
    size=int(header[2]); data=proc.stdout.read(size); assert len(data)==size; assert proc.stdout.read(1)==b'\n'
    rec={'bytes':size,'sha256':sha(data)}; blobcache[oid]=(rec,data); return rec,data
rows=[]; oldrows=[]
for i,s in enumerate(ns):
    path=plan+s['path']; entry=index.get(path)
    if entry is None: rows.append({'path':path,'error':'not in index'}); continue
    rec,_=blob(entry['oid']); ok=rec['sha256']==s['sha256']
    row={'position':i+1,'id':s['id'],'path':path,'index_blob':entry['oid'],'stage':entry['stage'],**rec,'expected_sha256':s['sha256'],'sha256_matches':ok,'declared_length':s.get('bytes',s.get('length'))}
    if not ok:blocks.append('SOURCE_SHA256_MISMATCH:'+path)
    if row['declared_length'] is not None and row['declared_length']!=rec['bytes']:blocks.append('SOURCE_LENGTH_MISMATCH:'+path)
    if i<len(os):
        oldentry=oldindex.get(path); same=oldentry is not None and oldentry['oid']==entry['oid']; row['old_blob_same']=same; row['old_blob']=oldentry['oid'] if oldentry else None
        if not same:blocks.append('OLD_SOURCE_BLOB_CHANGED:'+path)
        oldrows.append(row)
    rows.append(row)
source_by_path={r['path']:r for r in rows}
manifest_paths=[plan+'evidence/sources/postmerge/prebump281/'+rel for rel in ['attempt2-push/finalmanifest.json','attempt1-windows-supplement/final-manifest.json','pre-diagnostic-stage/final-manifest.json']]
closures=[]
for path in manifest_paths:
    rec,data=blob(index[path]['oid']); obj=json.loads(data); parent=posixpath.dirname(path); declared=list(obj['files'])
    if 'sourceRaw' in obj:declared.append(obj['sourceRaw'])
    checks=[]
    for item in declared:
        rel=item.get('path',item.get('file')); target=posixpath.normpath(posixpath.join(parent,rel)); ent=index.get(target)
        if not ent:checks.append({'path':target,'error':'manifest target absent in index'});blocks.append('MANIFEST_TARGET_MISSING:'+target);continue
        actual,_=blob(ent['oid']); passed=actual['bytes']==item['bytes'] and actual['sha256']==item['sha256']
        inventoried=target in source_by_path
        checks.append({'declared_path':rel,'target':target,'index_blob':ent['oid'],**actual,'declared_bytes':item['bytes'],'declared_sha256':item['sha256'],'bytes_and_sha256_match':passed,'in_source_inventory':inventoried})
        if not passed:blocks.append('MANIFEST_BYTE_CLOSURE_MISMATCH:'+target)
        if not inventoried:blocks.append('MANIFEST_NOT_IN_SOURCE_INVENTORY:'+target)
    closures.append({'manifest':path,**rec,'declared_entries':len(declared),'successful_entries':sum(c.get('bytes_and_sha256_match',False) and c.get('in_source_inventory',False) for c in checks),'entries':checks})
proc.stdin.close(); proc.wait(); assert proc.returncode==0
endlisting=git('ls-files','--stage','-z'); index_path=pathlib.Path(git('rev-parse','--git-path','index').decode().strip()); rawindex=index_path.read_bytes()
end={'captured_at':utc(),'head':git('rev-parse','HEAD').decode().strip(),'stage_listing_bytes':len(endlisting),'stage_listing_sha256':sha(endlisting),'index_file_bytes':len(rawindex),'index_file_sha256':sha(rawindex)}
if endlisting!=before:blocks.append('INDEX_CHANGED_DURING_AUDIT')
save('index-state-end.json',end); (base/'index-stage-end.raw').write_bytes(endlisting)
# A raw lexical prefix is also reported, excluding only the old final array/object closure.
cut=olddata.rfind(b'\n  ]'); rawprefix=(cut>=0 and newdata.startswith(olddata[:cut]))
result={'started_at':started,'completed_at':utc(),'status':'PASS' if not blocks else 'BLOCK','worktree':str(pathlib.Path.cwd()),'old_head':oldsha,'source_manifest':manifest_path,'source_manifest_index_sha256':sha(newdata),'source_count':len(ns),'old_count':len(os),'old_records_immutable_prefix':prefix,'old_records_raw_prefix_excluding_final_closure':rawprefix,'ids_unique':len(set(ids))==len(ids),'paths_unique':len(set(paths))==len(paths),'actual_index_source_file_count':len(actual_set),'missing_source_paths':missing,'extra_source_paths':extra,'all_979_sha256_match':all(r.get('sha256_matches',False) for r in rows),'all_740_old_git_blobs_identical':all(r.get('old_blob_same',False) for r in oldrows),'old_blob_identity_meaning':'Same Git blob OID is the same exact stored blob bytes; all current blobs were read and independently measured SHA256/length.','length_contract':'source-bindings entries declare SHA256 but no length; actual bytes measured for every raw, and each of the three manifest closures checks declared byte length plus SHA256.','initial_index_fingerprint':sha(initial),'before_index_fingerprint':sha(before),'after_index_fingerprint':sha(endlisting),'index_fingerprint_stable':initial==before==endlisting,'three_manifest_closure':[{'manifest':c['manifest'],'declared_entries':c['declared_entries'],'successful_entries':c['successful_entries'],'sha256':c['sha256']} for c in closures],'blocks':blocks}
save('source-rows.json',rows);save('old-740-byte-identity.json',oldrows);save('three-manifest-closures.json',closures);save('source-audit-result.json',result)
print(json.dumps(result,ensure_ascii=False,indent=2))
