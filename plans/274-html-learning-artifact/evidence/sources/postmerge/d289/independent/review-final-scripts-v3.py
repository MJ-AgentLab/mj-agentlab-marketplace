import ast,datetime,difflib,hashlib,json,pathlib
OUT=pathlib.Path(__file__).resolve().parent;ROOT=OUT.parent
OLD=OUT/'guarded-scripts-review-v2';NEW=OUT/'guarded-scripts-review-v3'
NEW.mkdir(exist_ok=False)
checks=[]
def check(name,value,observed=None):checks.append({'name':name,'passed':bool(value),'observed':observed})
sources={}
for name in ['execute-prebump.py','prepare-documents.py']:
    data=(ROOT/name).read_bytes();old=(OLD/name).read_bytes();text=data.decode();oldtext=old.decode();tree=ast.parse(text,filename=name)
    (NEW/name).write_bytes(data)
    (NEW/(name+'.diff')).write_text(''.join(difflib.unified_diff(oldtext.splitlines(True),text.splitlines(True),fromfile='v2/'+name,tofile='v3/'+name)),encoding='utf-8')
    sources[name]={'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'sameAsV2':data==old}
    if name=='prepare-documents.py':d=text;docTree=tree;oldDoc=ast.parse(oldtext)
check('guarded prebump exact reviewedv2bytes unchanged',sources['execute-prebump.py']['sameAsV2'],sources['execute-prebump.py'])
check('documents all helper mutationfunctions unchanged fromv2',{n.name:ast.dump(n,include_attributes=False) for n in docTree.body if isinstance(n,ast.FunctionDef)}=={n.name:ast.dump(n,include_attributes=False) for n in oldDoc.body if isinstance(n,ast.FunctionDef)})
check('documents identity guards exactf3tree terminal',{s for s in ["sm['canonicalSha']==expectedSHA", "sm['canonicalTree']==expectedTree", "sm['finishedAt']", "local['endedAtUtc']", "local['trackedFilesByteIdenticalBeforeAfter']", "independent['status']=='PASS_LIMITED'", "independent['actualDevelop']==expectedSHA"] if s in d}=={"sm['canonicalSha']==expectedSHA", "sm['canonicalTree']==expectedTree", "sm['finishedAt']", "local['endedAtUtc']", "local['trackedFilesByteIdenticalBeforeAfter']", "independent['status']=='PASS_LIMITED'", "independent['actualDevelop']==expectedSHA"})
guards=next(ast.literal_eval(n.value) for n in docTree.body if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='expectedGuards' for t in n.targets))
expected={'hostHeadTreePreserved','hostCleanPreserved','primaryPreserved','ownerOriginalPreserved','fullWorktreeInventoryPreserved','outerAndChildSameTemporaryRoot','shortTempEmpty','exactFifteenRootsAndAbsence'}
check('documents exact8guardset required prevents vacuousall',guards==expected and "set(sm['guards'])==expectedGuards" in d and "all(sm['guards'].values())" in d,sorted(guards))
check('documents localactualbeforeafter cleanf3 bound',"for phase in ['before','after']" in d and "snap['head']['stdout'].strip()==expectedSHA and not snap['status']['stdout']" in d)
check('documents retain initialcachefalse controlled recovery provenance',all(s in d for s in ['TEMP初次absence=false仍保留','99项库存/字节/hash','不是测试自动清理，也不计入canonical15根','cleanup-owned-temp.ps1','temp-cleanup-before.json','temp-cleanup-receipt.json']))
localList=next(ast.literal_eval(n.iter) for n in ast.walk(docTree) if isinstance(n,ast.For) and isinstance(n.iter,ast.List) and all(isinstance(x,ast.Constant) for x in n.iter.elts) and any(isinstance(x,ast.Constant) and x.value=='batch.json' for x in n.iter.elts))
check('documents11localrawselectedincludeoriginalfalseandrecovery',len(localList)==11 and {'launch.json','temp-cleanup-before.json','temp-cleanup-receipt.json','cleanup-owned-temp.ps1','freeze-manifest.json','independent-summary.json'}.issubset(localList),localList)
check('documents2598appendprefixandnoINTENTruntimepaths',"assert len(prefix)==2598" in d and "assert bindings['sources'][:2598]==prefix" in d and not any(s in d for s in ["R/'plugins/","R/'tests/","R/'scripts/","[INTENT]_HTML_Learning_Artifact.md"]))
check('documents previous9fileupdatecalls remain exact',{ast.dump(n,include_attributes=False) for n in ast.walk(docTree) if isinstance(n,ast.Call) and isinstance(n.func,ast.Name) and n.func.id=='edit'}=={ast.dump(n,include_attributes=False) for n in ast.walk(oldDoc) if isinstance(n,ast.Call) and isinstance(n.func,ast.Name) and n.func.id=='edit'})
WT=pathlib.Path('C:/Users/Admin/.codex/worktrees/html-alignment-sync/develop')
news=[n.value.value for n in docTree.body if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='new' for t in n.targets) and isinstance(n.value,ast.Constant)]
agents=(WT/'AGENTS.md').read_text();old=next(line for line in agents.splitlines() if line.startswith('HTML0.1.38随v8.3.3公开；'));candidate=agents.replace(old,news[0],1).encode()
check('latest revisedAGENTS actualdualbudget',len(candidate)<=16384 and len(candidate.replace(b'\n',b'\r\n'))<=16384,{'LF':len(candidate),'CRLF':len(candidate.replace(b'\n',b'\r\n'))})
check('latest phase distinguishes isolatedprebump andactualdevelop833','隔离' in d and '实际develop市场仍8.3.3' in d and '新保护PR' in d)
summary={'reviewedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'PASS_CONDITIONAL_NOT_EXECUTED' if all(c['passed'] for c in checks) else 'FINDINGS_BEFORE_EXECUTION','checks':checks,'checkCount':len(checks),'scripts':sources,'basis':'V2 reviewed16 static scope/anchor/budget/history checks plus exact new-source diff/helper/update-call verification. Original v2 snapshots remain frozen.','conditions':['The current two actualdevelop batches must reach terminal and independent summary statusPASS_LIMITED actualDevelopf3e8 before pre-bump.','Only after actual pre-bump receipts satisfy their guards may documents be prepared.','Actual resulting diff,2598prefix/32baseline/INTENT/runtime/publishedtail and Harness still need verification.'],'newOwnerDecisionRequired':False}
(NEW/'review.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
files=[]
for path in sorted(NEW.iterdir()):
    data=path.read_bytes();files.append({'path':path.name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
(OUT/'guarded-scripts-review-v3-freeze.json').write_text(json.dumps({'frozenAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'root':str(NEW),'files':files},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'status':summary['status'],'checks':len(checks),'passed':sum(c['passed'] for c in checks),'failed':[c['name'] for c in checks if not c['passed']]},ensure_ascii=False))
