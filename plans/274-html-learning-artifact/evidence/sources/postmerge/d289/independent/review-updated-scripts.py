import ast,datetime,hashlib,json,pathlib,re
OUT=pathlib.Path(__file__).resolve().parent;ROOT=OUT.parent
WT=pathlib.Path('C:/Users/Admin/.codex/worktrees/html-alignment-sync/develop')
review=OUT/'guarded-scripts-review-v2';review.mkdir(exist_ok=False)
checks=[]
def check(name,value,observed=None):checks.append({'name':name,'passed':bool(value),'observed':observed})
scripts={}
for name in ['execute-prebump.py','prepare-documents.py']:
    data=(ROOT/name).read_bytes();ast.parse(data.decode(),filename=name);(review/name).write_bytes(data)
    scripts[name]={'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'text':data.decode()}
b=scripts['execute-prebump.py']['text'];d=scripts['prepare-documents.py']['text']
check('prebump explicitGO source identity and priorcheck independentgate',all(s in b for s in ["if '--go' not in sys.argv","git('rev-parse','HEAD^{tree}')","smokeResult['canonicalSha']==config['canonicalSha']==config['expectedHead']==SHA","smokeResult['canonicalTree']==config['canonicalTree']==config['expectedTree']==TREE","local['endedAtUtc']","independent['status']=='PASS_LIMITED' and independent['actualDevelop']==SHA"]))
check('prebump fixedscope sequential dryapply',"'-From','8.3.3','-To','8.3.4','-Scope','marketplace'" in b and b.index("dry=run('dry-run',True)")<b.index("apply=run('apply',False)"))
check('prebump no keysetHEADstatus or README escape',all(s in b for s in ["assert set(after)==set(before)","status=git('status','--porcelain=v1','-z')","assert sorted(x[3:] for x in status if x)==['README.md','VERSION']","assert sorted(changed)==['README.md','VERSION']","assert (R/'README.md').read_bytes()==oldReadme.replace","afterVersions['plugins']==beforeVersions['plugins']"]))
check('prebump externalmutation assertion properlybounded','noReleaseTagOrSiteOperationInExecutedCommandPath' in b and 'noReleaseTagOrSiteMutation' not in b)
bindings=json.loads((WT/'plans/274-html-learning-artifact/source-bindings.json').read_text())
check('documents current source2598prefix fixedandappendonly',len(bindings['sources'])==2598 and "assert len(prefix)==2598" in d and "assert bindings['sources'][:2598]==prefix" in d and "bindings['sources'].append(" in d,len(bindings['sources']))
anchors={
 '[REPORT] title':('plans/274-html-learning-artifact/[REPORT]_HTML_Learning_Artifact.md','# [REPORT] HTML learning artifact\n'),
 'docsINDEX':('docs/INDEX.md','## 当前整体发布\n'),
 'releaseoperations':('docs/runbook/[RUNBOOK]_Release_Operations.md','## Preparation\n'),
 'release833':('docs/runbook/[RUNBOOK]_Marketplace_8_3_3_Release_Readiness.md','## Actual publication and current continuation\n'),
}
for name,(relative,anchor) in anchors.items():
    text=(WT/relative).read_text(encoding='utf-8');check('documents unique actual anchor '+name,text.count(anchor)==1,{'path':relative,'count':text.count(anchor)})
change=(WT/'CHANGELOG.md').read_text();docidx=change.index('### Documentation\n');published=change.index('## [8.3.3]')
check('documents firstDocumentation belongs toUnreleased and publishedtail untouched',change.index('## [Unreleased]')<docidx<published and "s.replace('### Documentation\\n'" in d,{'firstDocumentationOffset':docidx,'published833Offset':published,'publishedTailSha256':hashlib.sha256(change[published:].encode()).hexdigest()})
asttree=ast.parse(d);news=[node.value.value for node in asttree.body if isinstance(node,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='new' for t in node.targets) and isinstance(node.value,ast.Constant)]
assert len(news)==2
agents=(WT/'AGENTS.md').read_text();old=next(line for line in agents.splitlines() if line.startswith('HTML0.1.38随v8.3.3公开；'));agentCandidate=agents.replace(old,news[0],1).encode()
check('documents AGENTS dualnewline budget',len(agentCandidate)<=16384 and len(agentCandidate.replace(b'\n',b'\r\n'))<=16384,{'LF':len(agentCandidate),'CRLF':len(agentCandidate.replace(b'\n',b'\r\n')),'limit':16384})
readme=(WT/'README.md').read_text();check('documents README exact prior currentline exists',sum(line.startswith('README badge跟随当前checkout的VERSION') for line in readme.splitlines())==1)
check('documents no runtimeINTENT or originalsource mutation commands',not any(s in d for s in ["R/'plugins/","R/'tests/","R/'scripts/","[INTENT]_HTML_Learning_Artifact.md"]) and 'No private B2 redistribution' in d)
check('documents uses completedprebump receipt before newevidence creation',d.index("assert load(E/'prebump/summary.json')")<d.index("D.mkdir(parents=True)") and "counts=={'tests':652,'pass':651,'fail':0,'skipped':1}" in d)
owner=WT.parent # no Owner material is written; actual byte count below is read from primary only
original=pathlib.Path('D:/workspace/10-software-project/projects/mj-agentlab-marketplace/develop/HTML-Learning-Artifact-Plugin-Implementation-Plan.md')
check('documents Owner original count literal currentlycorrect',original.stat().st_size==25994,original.stat().st_size)
published=ROOT/'independent-merge/independent-summary.json';prior=json.loads(published.read_text());bodyCheck=next(x['observed'] for x in prior['checks'] if x['name']=='released body exact unchanged')
check('documents frozenReleasebody literalmatchesobserved',bodyCheck['utf8Bytes']==2507 and bodyCheck['sha256']=='11fc9f4c0231ba5aebda7a7d3add60ed8f506a943e2ff516d5c2c8b27c5b069c',bodyCheck)
summary={'reviewedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'PASS_CONDITIONAL_NOT_EXECUTED' if all(c['passed'] for c in checks) else 'FINDINGS_BEFORE_EXECUTION','checks':checks,'checkCount':len(checks),'scripts':{k:{a:v[a] for a in ['bytes','sha256']} for k,v in scripts.items()},'scope':'Read-only static pre-review. Neither version nor document preparation script was executed by this reviewer.','disposition':'Prior R1/R2/R3 addressed in guarded pre-bump. Nine existing navigation/working/A6/CHANGELOG files plus appended source snapshots are the planned document scope; INTENT/runtime and canonical published CHANGELOG tail remain outside mutations.','executionConditions':['Both current unique actualdevelop batches must reach terminal; independent summary PASS_LIMITED actualDevelopf3e8 is still required.','Prebump DryRun and Apply must actually satisfy guards before prepare-documents execution.','After execution, inspect actualdiff/sourceprefix/history/metadata/AGENTS dualbudget and strict Harness; a static review is not finalcandidate PASS.'],'recommendation':'Proceed with the current guard version only after the actual independent terminal result. Minor prose refinement may distinguish default/theme unit tests from the two themes actual browser loops, but no new product decision is required.'}
(review/'review.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
files=[]
for path in sorted(review.iterdir()):
    data=path.read_bytes();files.append({'path':path.name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
(OUT/'guarded-scripts-review-v2-freeze.json').write_text(json.dumps({'frozenAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'root':str(review),'files':files},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'status':summary['status'],'checks':len(checks),'passed':sum(c['passed'] for c in checks),'failed':[c['name'] for c in checks if not c['passed']]},ensure_ascii=False))
