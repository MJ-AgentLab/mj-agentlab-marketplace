import pathlib,json,subprocess,hashlib,datetime,posixpath,re,collections
out=pathlib.Path(r'C:/Users/Admin/AppData/Local/Temp/html-learning-274-prebump281-document-review/source-audit/candidate1393');prior=out.parent;root=pathlib.Path.cwd();plan='plans/274-html-learning-artifact/';mf=plan+'source-bindings.json';base='62945150df984e2747684d1ea46b8772b56db2d9';old='1d8b6849ec7e398d65a949d204abe38bc64a4e0b'
def git(*a):return subprocess.run(['git',*a],stdout=subprocess.PIPE,stderr=subprocess.PIPE,check=True).stdout
def sha(b):return hashlib.sha256(b).hexdigest()
def utc():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def save(n,o):(out/n).write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
def filefacts(p):
 b=(root/p).read_bytes();return {'path':p,'bytes':len(b),'sha256':sha(b)}
def gitfiles(ref):
 result={}
 for record in git('ls-tree','-r','-z',ref).split(b'\0'):
  if record:meta,p=record.split(b'\t',1);result[p.decode()]=meta.decode().split()[-1]
 return result
start=utc();state=json.loads((out/'working-state-start.json').read_text());b=(out/'source-bindings-start.json').read_bytes();sources=json.loads(b)['sources'];pbytes=(prior/'working-source-bindings-start.json').read_bytes();psources=json.loads(pbytes)['sources'];prows=json.loads((prior/'source-rows.json').read_text());oldb=git('show',base+':'+mf);olds=json.loads(oldb)['sources'];ancb=git('show',old+':'+mf);anc=json.loads(ancb)['sources'];blocks=[];checks=[]
def check(label,ok):
 checks.append({'claim':label,'pass':bool(ok)})
 if not ok:blocks.append(label)
actual=sorted(str(p.relative_to(root)).replace('\\','/') for p in (root/(plan+'evidence/sources')).rglob('*') if p.is_file());paths=[plan+s['path'] for s in sources];pathset=set(paths)
check('1393 complete unique source IDs/paths/set',len(sources)==1393 and len({s['id'] for s in sources})==1393 and len(pathset)==1393 and pathset==set(actual));check('original1391 records exact prefix; exactly2 appended',sources[:1391]==psources and len(sources)-len(psources)==2)
def prefix(a,b):
 cut=a.rfind(b'\n  ]');return cut>=0 and b.startswith(a[:cut])
check('raw1391 JSON prefix unchanged',prefix(pbytes,b));check('old979 and740 object and raw prefixes unchanged',sources[:979]==olds and sources[:740]==anc and prefix(oldb,b) and prefix(ancb,b))
g629=gitfiles(base);g1=gitfiles(old);proc=subprocess.Popen(['git','cat-file','--batch'],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE);cache={}
def blob(oid):
 if oid not in cache:
  proc.stdin.write((oid+'\n').encode());proc.stdin.flush();header=proc.stdout.readline().decode().split();size=int(header[2]);v=proc.stdout.read(size);assert len(v)==size and proc.stdout.read(1)==b'\n';cache[oid]=v
 return cache[oid]
rows=[];origins=[]
for n,s in enumerate(sources):
 p=plan+s['path'];bb=(root/p).read_bytes();r={'position':n+1,'id':s['id'],**filefacts(p),'expected_sha256':s['sha256'],'sha_match':sha(bb)==s['sha256']};check('source sha '+p,r['sha_match'])
 if n<1391:r['prior1391_length_sha_unchanged']=r['bytes']==prows[n]['bytes'] and r['sha256']==prows[n]['sha256'];check('prior1391 bytes '+p,r['prior1391_length_sha_unchanged'])
 if n<979:r['old629_blob']=g629[p];r['old629_exact_bytes']=blob(g629[p])==bb;check('old629 raw '+p,r['old629_exact_bytes'])
 if n<740:r['old1d8_blob']=g1[p];r['old1d8_exact_bytes']=blob(g1[p])==bb;check('old1d8 raw '+p,r['old1d8_exact_bytes'])
 if n>=979:
  origin=s.get('original','');op=pathlib.Path(origin);exists=bool(re.match(r'^[A-Za-z]:[\\/]',origin)) and op.is_file();ob=op.read_bytes() if exists else None;origins.append({'path':p,'original':origin,'same_path_authored_map':op.resolve()==(root/p).resolve() if exists else False,'exists':exists,'original_bytes':len(ob) if ob is not None else None,'original_sha256':sha(ob) if ob is not None else None,'exact_bytes':ob==bb if ob is not None else False});check('new source origin '+p,exists and ob==bb)
 rows.append(r)
proc.stdin.close();proc.wait();assert proc.returncode==0
mapentry=next(s for s in sources if s['path'].endswith('/actual629-relocation-map.json'));mappath=plan+mapentry['path'];mapbase=posixpath.dirname(mappath);mapbytes=(root/mappath).read_bytes();mapping=json.loads(mapbytes);check('exact explicit map SHA',sha(mapbytes)=='b57f7c96b3abeab473e58e2a3afb27a94f7eada12527f646c20536190533e3b1');check('explicit map root/canonical',mapping['relativePathsBasedAt']=='This mapping file directory' and mapping['sourceCanonicalSha']==base)
def local_join(base,rel):
 if not isinstance(rel,str) or re.match(r'^[A-Za-z]:|^/',rel) or '\\' in rel or any(x in ('','..','.') for x in rel.split('/')):raise ValueError('unsafe relative path '+str(rel))
 return posixpath.normpath(posixpath.join(base,rel))
contexts={};mapping_checks=[]
for m in mapping['mappings']:
 alias=local_join(mapbase,m['snapshotPath']);recovery=local_join(mapbase,m['recoveryBase']);aliasbytes=(root/alias).read_bytes();obj=json.loads(aliasbytes);declared=obj['files'];declared_by_name={x.get('file',x.get('path')):x for x in declared};entries=m['entries'];entry_by_name={x['originalRelativeFile']:x for x in entries}
 good=sha(aliasbytes)==m['snapshotSha256'] and alias in pathset and recovery==mapbase+'/independent-actual/terminal-audit/root-batch' and len(declared)==len(declared_by_name)==len(entries)==len(entry_by_name)==m['verifiedEntries'] and set(entry_by_name)==set(declared_by_name)
 check('explicit alias set/hash/base '+alias,good);local=[]
 for name,d in declared_by_name.items():
  e=entry_by_name[name];expected=local_join(recovery,name);target=local_join(mapbase,e['recoveryPath']);exists=(root/target).is_file();bb=(root/target).read_bytes() if exists else b'';ok=target==expected and exists and target in pathset and e['bytes']==d['bytes']==len(bb) and e['sha256']==d['sha256']==sha(bb)
  check('mapped entry exact '+alias+' :: '+name,ok);local.append({'original_relative_file':name,'target':target,'declared_bytes':d['bytes'],'declared_sha256':d['sha256'],'map_object_matches_original':e['bytes']==d['bytes'] and e['sha256']==d['sha256'],'actual_bytes':len(bb) if exists else None,'actual_sha256':sha(bb) if exists else None,'pass':ok})
 check('forensic alias prior bytes untouched '+alias,sha(aliasbytes)==next(r['sha256'] for r in prows if r['path']==alias));contexts[alias]={'base':recovery,'mapping':m,'entries':entry_by_name,'valid':good and all(x['pass'] for x in local)};mapping_checks.append({'snapshot':alias,'snapshot_sha256':sha(aliasbytes),'entries':local,'all_pass':contexts[alias]['valid']})
check('exactly2 aliases and29 mapped entries',len(contexts)==2 and sum(len(x['entries']) for x in mapping_checks)==29)
closure=[];edges={};checksums=[]
for s in sources[979:]:
 p=plan+s['path'];f=root/p
 if f.suffix=='.sha256':
  for line in f.read_text().splitlines():
   match=re.fullmatch(r'([0-9a-f]{64})\s+\*?(.+)',line)
   if match:
    t=local_join(posixpath.dirname(p),match[2]);ok=(root/t).is_file() and sha((root/t).read_bytes())==match[1];checksums.append({'sidecar':p,'target':t,'pass':ok});check('checksum sidecar '+p,ok)
 if f.suffix!='.json':continue
 try:obj=json.loads(f.read_text(encoding='utf8'))
 except (UnicodeError,json.JSONDecodeError):continue
 if not isinstance(obj,dict) or not isinstance(obj.get('files'),list) or not obj['files'] or not all(isinstance(x,dict) for x in obj['files']) or not any('sha256'in x and ('file'in x or 'path'in x) for x in obj['files']):continue
 payload=list(obj['files']);payload+=([obj['sourceRaw']] if isinstance(obj.get('sourceRaw'),dict) else []);resolved=[];edges[p]=[]
 for e in payload:
  rel=e.get('file',e.get('path'));context=contexts.get(p);effective=context['base'] if context and context['valid'] else posixpath.dirname(p);target=local_join(effective,rel);exists=(root/target).is_file();bb=(root/target).read_bytes() if exists else b'';ok=exists and target in pathset and len(bb)==e['bytes'] and sha(bb)==e['sha256'];check('manifest payload '+p+' :: '+rel,ok);edges[p].append(target);resolved.append({'declared_relative_file':rel,'resolution':'explicit actual629-relocation-map recoveryBase' if context else 'own directory','target':target,'bytes':len(bb) if exists else None,'sha256':sha(bb) if exists else None,'pass':ok})
 closure.append({'manifest':p,'entries':len(payload),'resolved_with_explicit_context':p in contexts,'all_pass':all(x['pass'] for x in resolved),'checks':resolved})
edges[mappath]=list(contexts)+[e['target'] for c in mapping_checks for e in c['entries']];cycles=[];seen=set()
def visit(n,stack):
 if n in stack:cycles.append(stack[stack.index(n):]+[n]);return
 if n in seen:return
 for t in edges.get(n,[]):
  if t in edges:visit(t,stack+[n])
 seen.add(n)
for n in edges:visit(n,[])
check('no manifest/mapping reference cycles',not cycles);check('current document-review never added as source',not any('document-review' in s['path'] or 'document-review'in s.get('original','') for s in sources[979:]))
# Preserve the original1391 review artifacts and verify their frozen manifest facts without modification.
prior_manifest=json.loads((prior/'candidate1391-finalmanifest.json').read_text());prior_ok=all((prior/e['file']).is_file() and len((prior/e['file']).read_bytes())==e['bytes'] and sha((prior/e['file']).read_bytes())==e['sha256'] for e in prior_manifest['files']);check('initial1391 BLOCK audit all frozen bytes unchanged',prior_ok)
changed=sorted(set(x.decode('utf8') for x in git('diff','--name-only','-z','HEAD').split(b'\0') if x)|set(x.decode('utf8') for x in git('ls-files','--others','--exclude-standard','-z').split(b'\0') if x));nowb=(root/mf).read_bytes();nows=json.loads(nowb)['sources'];allpaths=set(plan+s['path'] for s in nows)|set(changed)|{mf};facts=[]
for p in sorted(allpaths):
 if (root/p).is_file():facts.append(filefacts(p))
 else:facts.append({'path':p,'missing_or_not_file':True})
endfp=sha(json.dumps(facts,ensure_ascii=False,separators=(',',':')).encode('utf8'));check('working fingerprint stable',endfp==state['working_fingerprint_sha256'] and nowb==b)
result={'schemaVersion':1,'started_at':start,'completed_at':utc(),'status':'PASS' if not blocks else 'BLOCK','source_count':len(sources),'new_vs1391':len(sources)-len(psources),'new_total_vs629':len(sources)-len(olds),'all1393_source_sha_match':all(r['sha_match'] for r in rows),'all1391_record_and_snapshot_bytes_unchanged':sources[:1391]==psources and all(r.get('prior1391_length_sha_unchanged',False) for r in rows[:1391]),'old979_and740_unchanged':not any('old629 raw'in b or 'old1d8 raw'in b for b in blocks),'actual_file_set_equal':pathset==set(actual),'source_ids_paths_unique':len({s['id'] for s in sources})==len(pathset)==1393,'map_path':mappath,'map_sha256':sha(mapbytes),'explicit_mapping_checks':mapping_checks,'prior_direct_relative_missing29':'Preserved historical initial1391 BLOCK; now resolved only via explicit in-repository map and existing root-batch, original aliases unchanged.','manifest_payload_lists':len(closure),'manifest_declared_entries':sum(c['entries'] for c in closure),'all_manifest_closures_pass':all(c['all_pass'] for c in closure),'all_new_originals_match':all(x['exact_bytes'] for x in origins),'origin_count':len(origins),'cycles':cycles,'checksum_sidecars':checksums,'old_audit_artifacts_unchanged':prior_ok,'working_start_fingerprint':state['working_fingerprint_sha256'],'working_end_fingerprint':endfp,'working_fingerprint_file_count':len(facts),'working_stable':state['working_fingerprint_sha256']==endfp,'staging_or_commit_verdict':'NOT_EVALUATED; actual working bytes only','blocks':blocks}
save('source-rows.json',rows);save('origin-byte-checks.json',origins);save('mapping-entry-checks.json',mapping_checks);save('manifest-closures.json',closure);save('checks.json',checks);save('working-files-end.json',facts);save('result.json',result)
print(json.dumps({k:v for k,v in result.items() if k not in ['explicit_mapping_checks','checksum_sidecars','blocks']}|{'mapped_entries':sum(len(x['entries']) for x in mapping_checks),'blocks_count':len(blocks),'first_blocks':blocks[:3]},ensure_ascii=False,indent=2))
