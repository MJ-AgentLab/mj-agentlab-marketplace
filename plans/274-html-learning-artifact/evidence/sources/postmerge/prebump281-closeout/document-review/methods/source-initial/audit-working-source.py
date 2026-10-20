import pathlib,subprocess,json,hashlib,datetime,posixpath,re,collections
out=pathlib.Path(r'C:/Users/Admin/AppData/Local/Temp/html-learning-274-prebump281-document-review/source-audit');root=pathlib.Path.cwd();plan='plans/274-html-learning-artifact/';mf=plan+'source-bindings.json';baseline='62945150df984e2747684d1ea46b8772b56db2d9';ancient='1d8b6849ec7e398d65a949d204abe38bc64a4e0b'
def git(*a):return subprocess.run(['git',*a],stdout=subprocess.PIPE,stderr=subprocess.PIPE,check=True).stdout
def sh(b):return hashlib.sha256(b).hexdigest()
def utc():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def save(n,o):(out/n).write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
def tree(commit):
 d={}
 for row in git('ls-tree','-r','-z',commit).split(b'\0'):
  if not row:continue
  meta,p=row.split(b'\t',1);mode,kind,oid=meta.decode().split();d[p.decode('utf8')]=(mode,kind,oid)
 return d
started=utc();initial=read_initial=json.loads((out/'working-state-start.json').read_text(encoding='utf8'));data=(out/'working-source-bindings-start.json').read_bytes();new=json.loads(data)['sources'];oldbytes=git('show',baseline+':'+mf);old=json.loads(oldbytes)['sources'];ancbytes=git('show',ancient+':'+mf);anc=json.loads(ancbytes)['sources'];oldtree=tree(baseline);anctree=tree(ancient);blocks=[]
actual_files=sorted(str(p.relative_to(root)).replace('\\','/') for p in (root/(plan+'evidence/sources')).rglob('*') if p.is_file());expected=[plan+s['path'] for s in new]
if len(new)!=1391 or len(set(s['id'] for s in new))!=1391 or len(set(expected))!=1391:blocks.append('COUNT_OR_ID_PATH_DUPLICATE')
missing=sorted(set(expected)-set(actual_files));extra=sorted(set(actual_files)-set(expected))
if missing or extra:blocks.append('SOURCE_SET_MISMATCH')
if new[:979]!=old or old[:740]!=anc or new[:740]!=anc:blocks.append('HISTORICAL_OBJECT_PREFIX_CHANGED')
def rawprefix(a,b):
 cut=a.rfind(b'\n  ]');return cut>=0 and b.startswith(a[:cut])
rawprefix629=rawprefix(oldbytes,data);rawprefix1d8=rawprefix(ancbytes,data)
if not(rawprefix629 and rawprefix1d8):blocks.append('HISTORICAL_RAW_PREFIX_CHANGED')
proc=subprocess.Popen(['git','cat-file','--batch'],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE);cache={}
def blob(oid):
 if oid in cache:return cache[oid]
 proc.stdin.write((oid+'\n').encode());proc.stdin.flush();hdr=proc.stdout.readline().decode().strip().split();assert len(hdr)==3 and hdr[1]=='blob';n=int(hdr[2]);b=proc.stdout.read(n);assert len(b)==n and proc.stdout.read(1)==b'\n';cache[oid]=b;return b
rows=[];origins=[];groups=collections.Counter()
for i,s in enumerate(new):
 p=plan+s['path'];file=root/p
 if not file.is_file():rows.append({'path':p,'missing':True});continue
 b=file.read_bytes();rec={'position':i+1,'id':s['id'],'path':p,'bytes':len(b),'sha256':sh(b),'declared_sha256':s['sha256'],'matches_sha256':sh(b)==s['sha256']}
 if not rec['matches_sha256']:blocks.append('SOURCE_SHA_MISMATCH:'+p)
 if i<979:
  ent=oldtree.get(p);same=ent is not None and ent[1]=='blob' and blob(ent[2])==b;rec['old629_blob']=ent[2] if ent else None;rec['old629_bytes_exact']=same
  if not same:blocks.append('OLD629_SOURCE_CHANGED:'+p)
 if i<740:
  ent=anctree.get(p);same=ent is not None and ent[1]=='blob' and blob(ent[2])==b;rec['old1d8_blob']=ent[2] if ent else None;rec['old1d8_bytes_exact']=same
  if not same:blocks.append('OLD1D8_SOURCE_CHANGED:'+p)
 if i>=979:
  parts=pathlib.PurePosixPath(s['path']).parts;groups[parts[4] if len(parts)>4 else s['path']]+=1
  origin=s.get('original','');row={'path':p,'original':origin}
  if re.match(r'^[A-Za-z]:[\\/]',origin):
   op=pathlib.Path(origin)
   if op.is_file():ob=op.read_bytes();row.update({'origin_exists':True,'origin_bytes':len(ob),'origin_sha256':sh(ob),'working_matches_original_bytes':ob==b})
   else:row.update({'origin_exists':False,'working_matches_original_bytes':None})
  else:row['origin_kind']='non-filesystem provenance'
  if row.get('origin_exists') is False:blocks.append('NEW_ORIGIN_UNAVAILABLE:'+p)
  if row.get('working_matches_original_bytes') is False:blocks.append('NEW_ORIGIN_BYTE_MISMATCH:'+p)
  origins.append(row)
 rows.append(rec)
proc.stdin.close();proc.wait();assert proc.returncode==0
rowmap={r['path']:r for r in rows};manifests=[];edges={};checksum=[];relative_failures=[]
for s in new[979:]:
 p=plan+s['path'];file=root/p
 if file.suffix=='.sha256':
  for line in file.read_text(encoding='utf8').splitlines():
   match=re.fullmatch(r'([0-9a-f]{64})\s+\*?(.+)',line)
   if not match:continue
   target=posixpath.normpath(posixpath.join(posixpath.dirname(p),match[2]));ok=(root/target).is_file() and sh((root/target).read_bytes())==match[1];checksum.append({'sidecar':p,'target':target,'sha256':match[1],'pass':ok})
   if not ok:blocks.append('CHECKSUM_SIDECAR_MISMATCH:'+p)
 if file.suffix!='.json':continue
 try:obj=json.loads(file.read_text(encoding='utf8'))
 except (UnicodeError,json.JSONDecodeError):continue
 if not isinstance(obj,dict):continue
 declared=obj.get('files')
 if not isinstance(declared,list) or not declared or not all(isinstance(r,dict) for r in declared) or not any('sha256' in r and ('file'in r or 'path'in r) for r in declared):continue
 payload=list(declared)
 if isinstance(obj.get('sourceRaw'),dict):payload.append(obj['sourceRaw'])
 checks=[];edges[p]=[]
 for ent in payload:
  rel=ent.get('file',ent.get('path'));target=posixpath.normpath(posixpath.join(posixpath.dirname(p),rel)) if isinstance(rel,str) else None
  valid=bool(target) and not re.match(r'^[A-Za-z]:|^/',str(rel)) and target.startswith(plan+'evidence/sources/')
  chk={'declared_file':rel,'target':target,'declared_bytes':ent.get('bytes'),'declared_sha256':ent.get('sha256'),'relative_local_path':valid}
  if valid and (root/target).is_file():
   bb=(root/target).read_bytes();chk.update({'exists':True,'bytes':len(bb),'sha256':sh(bb),'bytes_and_sha_match':len(bb)==ent.get('bytes') and sh(bb)==ent.get('sha256'),'in_source_inventory':target in rowmap});edges[p].append(target)
  else:chk.update({'exists':False,'bytes_and_sha_match':False,'in_source_inventory':target in rowmap if target else False})
  if not (chk['relative_local_path'] and chk['exists'] and chk['bytes_and_sha_match'] and chk['in_source_inventory']):
   relative_failures.append({'manifest':p,**chk});blocks.append('MANIFEST_RELATIVE_CLOSURE:'+p+' -> '+str(rel))
  checks.append(chk)
 manifests.append({'manifest':p,'declared_entries':len(payload),'direct_successful_entries':sum(c.get('bytes_and_sha_match',False) and c['in_source_inventory'] and c['relative_local_path'] for c in checks),'checks':checks})
# Only supplementary same-repository evidence for the two original forensic metadata aliases; does not silently rebase their declarations.
supplement=[]
for m in manifests:
 if pathlib.PurePosixPath(m['manifest']).name not in ['root-original-final-manifest.json','root-original-terminal-receipt.json']:continue
 base=posixpath.join(posixpath.dirname(m['manifest']),'root-batch');checked=[]
 for ent in m['checks']:
  target=posixpath.normpath(posixpath.join(base,ent['declared_file']));f=root/target;bb=f.read_bytes() if f.is_file() else None;ok=bb is not None and len(bb)==ent['declared_bytes'] and sh(bb)==ent['declared_sha256']
  checked.append({'declared_file':ent['declared_file'],'same_repository_relocated_target':target,'exists':bb is not None,'bytes':len(bb) if bb is not None else None,'sha256':sh(bb) if bb is not None else None,'matches_declared':ok,'in_source_inventory':target in rowmap})
 supplement.append({'original_alias':m['manifest'],'proposed_same_repo_base':base,'checked_entries':len(checked),'matching_entries':sum(c['matches_declared'] and c['in_source_inventory'] for c in checked),'checks':checked,'interpretation':'Supplementary same-repository byte identity only. Direct relative closure remains unclosed pending explicit relocation context; no external directory used.'})
cycles=[];seen=set()
def visit(n,stack):
 if n in stack:cycles.append(stack[stack.index(n):]+[n]);return
 if n in seen:return
 for t in edges.get(n,[]):
  if t in edges:visit(t,stack+[n])
 seen.add(n)
for n in edges:visit(n,[])
if cycles:blocks.append('MANIFEST_REFERENCE_CYCLE')
if any('document-review' in s['path'] or 'document-review' in s.get('original','') for s in new[979:]):blocks.append('NEW_DOCUMENT_REVIEW_RECURSIVE_SOURCE')
# Lock complete current working state again; no index/staging verdict is substituted.
changed=sorted(set(x.decode('utf8') for x in git('diff','--name-only','-z','HEAD').split(b'\0') if x)|set(x.decode('utf8') for x in git('ls-files','--others','--exclude-standard','-z').split(b'\0') if x));nowbind=json.loads((root/mf).read_text(encoding='utf8'))['sources'];tracked=set(plan+s['path'] for s in nowbind)|set(changed)|{mf};facts=[]
for p in sorted(tracked):
 f=root/p
 if f.is_file():bb=f.read_bytes();facts.append({'path':p,'bytes':len(bb),'sha256':sh(bb)})
 else:facts.append({'path':p,'missing_or_not_file':True})
endfinger=sh(json.dumps(facts,ensure_ascii=False,separators=(',',':')).encode('utf8'));stable=endfinger==initial['working_fingerprint_sha256']
if not stable:blocks.append('WORKING_FINGERPRINT_CHANGED')
result={'schemaVersion':1,'started_at':started,'completed_at':utc(),'status':'PASS' if not blocks else 'BLOCK','review_object':'Working bytes, not index/staged content','source_count':len(new),'new_sources':len(new)-979,'snapshot_actual_count':len(actual_files),'group_counts':dict(groups),'ids_unique':len({s['id'] for s in new})==len(new),'paths_unique':len(set(expected))==len(expected),'missing':missing,'extra':extra,'all_source_sha_match':all(r.get('matches_sha256',False) for r in rows),'old629_979_object_prefix_unchanged':new[:979]==old,'old629_raw_prefix_unchanged':rawprefix629,'old629_979_raw_bytes_unchanged':all(r.get('old629_bytes_exact',False) for r in rows[:979]),'old1d8_740_object_prefix_unchanged':new[:740]==anc,'old1d8_raw_prefix_unchanged':rawprefix1d8,'old1d8_740_raw_bytes_unchanged':all(r.get('old1d8_bytes_exact',False) for r in rows[:740]),'new_original_files_byte_match_count':sum(o.get('working_matches_original_bytes') is True for o in origins),'new_origin_total':len(origins),'manifest_or_payload_receipt_count':len(manifests),'total_manifest_declared_entries':sum(m['declared_entries'] for m in manifests),'direct_closure_failures':relative_failures,'supplementary_local_alias_checks':[{'original_alias':s['original_alias'],'checked_entries':s['checked_entries'],'matching_entries':s['matching_entries']} for s in supplement],'checksum_sidecars':checksum,'cycles':cycles,'working_start_fingerprint':initial['working_fingerprint_sha256'],'working_end_fingerprint':endfinger,'working_fingerprint_stable':stable,'current_working_source_count_at_end':len(nowbind),'new_document_review_not_in_sources':not any('document-review'in s['path'] or 'document-review'in s.get('original','') for s in new[979:]),'blocks':blocks}
save('source-rows.json',rows);save('new-origin-byte-checks.json',origins);save('manifest-closures.json',manifests);save('forensic-alias-local-supplement.json',supplement);save('working-files-end.json',facts);save('candidate1391-result.json',result)
print(json.dumps({k:v for k,v in result.items() if k not in ['direct_closure_failures','checksum_sidecars','blocks']}|{'block_count':len(blocks),'block_types':sorted(set(x.split(':',1)[0] for x in blocks)),'relative_missing_entries':len(relative_failures)},ensure_ascii=False,indent=2))
