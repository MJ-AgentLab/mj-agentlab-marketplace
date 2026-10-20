import argparse, datetime, hashlib, json, os, pathlib, re, subprocess, sys

ROOT=pathlib.Path(__file__).resolve().parent
REPOSITORY=pathlib.Path('C:/Users/Admin/.codex/worktrees/html-alignment-sync/develop')
PRIMARY=pathlib.Path('D:/workspace/10-software-project/projects/mj-agentlab-marketplace/develop')
PYTHON=pathlib.Path('C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe')
NODE=pathlib.Path('D:/Development/nodejs/node.exe')
SHORT=pathlib.Path('D:/t274e')
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def write(name,value):
    with (ROOT/name).open('x',encoding='utf-8') as stream:stream.write(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
def command(args,stdoutName,stderrName,env):
    start=now()
    with (ROOT/stdoutName).open('xb') as out,(ROOT/stderrName).open('xb') as err:
        proc=subprocess.Popen(args,cwd=REPOSITORY,env=env,stdout=out,stderr=err)
        status=proc.wait()
    receipt={'args':args,'cwd':str(REPOSITORY),'startedAt':start,'finishedAt':now(),'exitCode':status,'pid':proc.pid}
    write(stdoutName+'.receipt.json',receipt)
    return status

parser=argparse.ArgumentParser(description='Explicit GO only; creates one process-only short TEMP and verifies one frozen commit')
parser.add_argument('--sha',required=True);parser.add_argument('--tree',required=True);parser.add_argument('--host-head',required=True);parser.add_argument('--host-tree',required=True);parser.add_argument('--go',action='store_true')
args=parser.parse_args()
if not args.go:parser.error('No smoke run without explicit root SHA and GO')
if not all(re.fullmatch('[0-9a-f]{40}',value) for value in [args.sha,args.tree,args.host_head,args.host_tree]):parser.error('all identities must be full40hex')
if any((ROOT/name).exists() for name in ['run-config.json','launch.json','outer.stdout.log','run-result.json']):raise RuntimeError('refusing to overwrite an earlier attempt; use a new separate output directory')
if SHORT.exists() or SHORT.is_symlink():raise RuntimeError('dedicated short TEMP already exists; no reuse or deletion is authorized by this driver')
if SHORT.parent.resolve()!=pathlib.Path('D:/').resolve() or SHORT.name!='t274e':raise RuntimeError('shortTEMP path boundary differs')
if not all(path.is_file() for path in [PYTHON,NODE]):raise RuntimeError('bundled Python or Node missing')
env=os.environ.copy()
originalEnv={key:next((value for actual,value in env.items() if actual.upper()==key),None) for key in ['TEMP','TMP','TMPDIR','PATH','MJ_PERF_DIR']}
for key in list(env):
    if key.upper() in {'PATH','TEMP','TMP','TMPDIR','MJ_PERF_DIR'}:env.pop(key)
env.update({'TEMP':str(SHORT),'TMP':str(SHORT),'TMPDIR':str(SHORT),'PATH':str(PYTHON.parent)+os.pathsep+(originalEnv['PATH'] or ''),'MJ_PERF_DIR':str(ROOT/'perf')})
SHORT.mkdir(exist_ok=False)
config={'repository':str(REPOSITORY),'primary':str(PRIMARY),'ownerOriginal':str(PRIMARY/'HTML-Learning-Artifact-Plugin-Implementation-Plan.md'),'canonicalSha':args.sha,'canonicalTree':args.tree,'expectedHead':args.host_head,'expectedTree':args.host_tree,'shortTemp':str(SHORT),'python':str(PYTHON)}
write('run-config.json',config)
write('launch.json',{'createdAt':now(),'pid':os.getpid(),'explicitRootGO':True,'shortTempDidNotExist':True,'shortTempCreatedExclusively':True,'originalProcessEnvironment':originalEnv,'childOnlyChanges':{key:env.get(key) for key in ['TEMP','TMP','TMPDIR','PATH','MJ_PERF_DIR']},'noHostEnvironmentSettingsChanged':True,'config':config})
outerStatus=command([str(NODE),str(ROOT/'run-fixed-smoke.cjs')],'outer.stdout.log','outer.stderr.log',env)
auditStatus=command([str(PYTHON),str(ROOT/'audit-fixed-smoke.py')],'audit.stdout.log','audit.stderr.log',env)
container={'checkedAt':now(),'path':str(SHORT),'ordinaryDirectory':SHORT.is_dir() and not SHORT.is_symlink(),'remainingChildren':[p.name for p in SHORT.iterdir()] if SHORT.is_dir() else None,'removed':False,'method':'nonrecursive rmdir only after independent PASS and empty direct-owned container'}
if outerStatus==0 and auditStatus==0 and container['ordinaryDirectory'] and container['remainingChildren']==[]:
    if SHORT.resolve().parent!=pathlib.Path('D:/').resolve() or SHORT.name!='t274e':raise RuntimeError('final container boundary differs')
    SHORT.rmdir();container['removed']=True
container['existsAfter']=SHORT.exists();write('short-temp-container.json',container)
status=0 if outerStatus==0 and auditStatus==0 and container['removed'] and not container['existsAfter'] else 1
write('launch-result.json',{'finishedAt':now(),'outerExit':outerStatus,'auditExit':auditStatus,'shortTempContainer':container,'overall':'PASS_LIMITED' if status==0 else 'FAIL','manualOwnedRootCleanupPerformed':False})
print(json.dumps({'status':'PASS_LIMITED' if status==0 else 'FAIL','outerExit':outerStatus,'auditExit':auditStatus,'shortTempRemoved':container['removed']},ensure_ascii=False))
sys.exit(status)
