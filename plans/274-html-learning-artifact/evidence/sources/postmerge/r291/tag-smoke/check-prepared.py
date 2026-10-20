import ast,datetime,hashlib,json,pathlib,subprocess
ROOT=pathlib.Path(__file__).resolve().parent
checks=[]
def check(name,value):
    checks.append({'name':name,'passed':bool(value)})
    assert value,name
for p in ROOT.glob('*.py'):ast.parse(p.read_text(encoding='utf-8'),filename=str(p))
check('all external Python syntax parsed',True)
for name in ['run-canonical.mjs','run-fixed-smoke.cjs']:
    r=subprocess.run(['D:/Development/nodejs/node.exe','--check',str(ROOT/name)],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    check(name+' syntax',r.returncode==0)
launch=(ROOT/'launch.py').read_text(encoding='utf-8');outer=(ROOT/'run-fixed-smoke.cjs').read_text(encoding='utf-8');audit=(ROOT/'audit-fixed-smoke.py').read_text(encoding='utf-8');child=(ROOT/'run-canonical.mjs').read_text(encoding='utf-8');final=(ROOT/'finalize-tag-smoke.py').read_text(encoding='utf-8')
check('exclusive process-only D:/t291t absent and no execution config',not pathlib.Path('D:/t291t').exists() and not (ROOT/'run-config.json').exists())
check('GO/public exact identities and no overwrite',all(s in launch for s in ["if not args.go",'5898a8192740b39f41263129a5f99efeba96a6cc','3a68976af95bb5948de17a6fccaabf892becaaca','refusing to overwrite','SHORT.mkdir(exist_ok=False)']))
check('public after probe precedes empty container check/removal',launch.index('probeAfter=command')<launch.index('container={')<launch.index('SHORT.rmdir()'))
check('only nonrecursive empty-container rmdir in launcher',launch.count('SHORT.rmdir()')==1 and 'rmtree' not in launch and 'shutil' not in launch)
check('exact remote tag binding drives canonicalSha-only original Harness',all(s in child for s in ["binding.ref !== 'refs/tags/v8.3.4'",'binding.peeledCommit','verifyReleaseInstall({ canonicalSha: binding.peeledCommit, repoRoot: config.repository })']))
check('snapshot full index primary and Owner guards present',all(s in outer for s in ['hostIndexSha256','primaryIndexSha256','a4892f51f4163fb5bd4457d99229eaf1a4683e8f','25994','before.worktreesBase64 === after.worktreesBase64']))
check('original exact15 roots boundary and all8 expected guards retained',all(s in outer for s in ['roots.length === 15','result.cleanup.canonical === 1','result.cleanup.template === 1','result.cleanup.scenarios === 13','result.cleanup.allBoundariesVerified','result.cleanup.allAbsent']) and "set(result['guards'])==expectedguards" in final)
check('original installation/static CLI thresholds retained',all(s in audit for s in ['len(scenarios)==13','len(commands)==178','len(diagrams)==6','len(lek)==18','len(site)==4',"['checks']==96",'codex-cli 0.147.0','existsAtIndependentAudit','browserCheck']))
check('freeze comparison consistently string sorted',"key=lambda p:p.relative_to(ROOT).as_posix()" in final and "live=sorted(p.relative_to(ROOT).as_posix()" in final)
rows=[]
for p in sorted(ROOT.glob('*'),key=lambda p:p.name):
    if p.is_file():
        b=p.read_bytes();rows.append({'path':p.name,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()})
value={'status':'PREPARED_STATIC_PASS_NOT_PRODUCT_ACCEPTANCE','checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'checks':checks,'files':rows,'publicPreflight':'tag-binding-preflight.json','execution':'NOT_STARTED_WAITING_MAIN_CANONICAL_AND_MAIN_LOCAL_TERMINAL_FREEZE_RELEASE','nextRecommendation':'Wait for root explicit inventory-window release; then one --go batch with same SHA/tree, preserve any first failure without rerun.'}
with (ROOT/'preparation-static-review.json').open('x',encoding='utf-8') as f:f.write(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':value['status'],'checks':len(checks),'shortTempExists':pathlib.Path('D:/t291t').exists()}))
