from pathlib import Path
import datetime, hashlib, json, os, subprocess, sys

ROOT = Path(__file__).resolve().parent
CWD = Path('C:/Users/Admin/.codex/worktrees/html-post284-sync/develop')
PYDIR = Path('C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python')
NODE = 'D:/Development/nodejs/node.exe'
NPM = 'D:/Development/nodejs/node_modules/npm/bin/npm-cli.js'
EXPECTED = 'fdede3cf5578dee8a41aef4310a9387d695c56bd'
env = os.environ.copy()
env['PATH'] = str(PYDIR) + os.pathsep + env['PATH']

def now(): return datetime.datetime.now(datetime.timezone.utc).isoformat()
def sha(data): return hashlib.sha256(data).hexdigest()
def git(*args):
    p = subprocess.run(['git', *args], cwd=CWD, env=env, capture_output=True)
    if p.returncode: raise RuntimeError(p.stderr.decode(errors='replace'))
    return p.stdout
def state():
    status=git('status','--porcelain=v1','-z','--untracked-files=all')
    return dict(head=git('rev-parse','HEAD').decode().strip(),tree=git('rev-parse','HEAD^{tree}').decode().strip(),statusNulSha256=sha(status),statusNulHex=status.hex(),statusBytes=len(status))
def write(name,value):
    (ROOT/name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def run(label, argv):
    before=state()
    assert before['head']==EXPECTED and before['statusBytes']==0, before
    start=now()
    print(json.dumps(dict(event='start',label=label,startedAt=start,argv=argv)),flush=True)
    with (ROOT/(label+'.stdout.log')).open('wb') as stdout, (ROOT/(label+'.stderr.log')).open('wb') as stderr:
        p = subprocess.run(argv,cwd=CWD,env=env,stdout=stdout,stderr=stderr)
    after=state()
    rec=dict(label=label,argv=argv,cwd=str(CWD),startedAt=start,completedAt=now(),exitCode=p.returncode,headBefore=before,headAfter=after,environmentScope='process-only PATH prefix; no persistent modification',pathPrefix=str(PYDIR))
    for stream in ['stdout','stderr']:
        path=ROOT/(label+'.'+stream+'.log'); data=path.read_bytes()
        rec[stream]=dict(path=str(path),bytes=len(data),sha256=sha(data))
    write(label+'.receipt.json',rec)
    print(json.dumps(dict(event='complete',label=label,exitCode=p.returncode,completedAt=rec['completedAt'])),flush=True)
    assert after==before, dict(before=before,after=after)
    return rec

ROOT.mkdir(parents=True,exist_ok=True)
write('initial-state.json',dict(capturedAt=now(),state=state(),notes=['No node_modules existed before npm ci.','Bare python not present on host PATH. Process-only bundled Python prefix used.','Initial PowerShell observation incorrectly left HEAD^{tree} unquoted. Subsequent Git invocations use Python argv; no product check was run by that malformed observation.']))
receipts=[]
for label,argv in [('node-version',[NODE,'--version']),('npm-version',[NODE,NPM,'--version']),('python-version',[str(PYDIR/'python.exe'),'--version']),('git-version',['git','--version'])]:
    receipts.append(run(label,argv))
if not (CWD/'node_modules').exists():
    receipts.append(run('npm-ci',[NODE,NPM,'ci']))
    if receipts[-1]['exitCode'] != 0:
        write('summary.json',dict(status='BLOCKED_DEPENDENCY',receipts=receipts,completedAt=now())); sys.exit(1)
for label,args in [('npm-test',['test']),('npm-validate',['run','validate']),('npm-check-baseline-tools',['run','check:baseline-tools'])]:
    receipts.append(run(label,[NODE,NPM,*args]))
write('summary.json',dict(status='PASS' if all(r['exitCode']==0 for r in receipts) else 'FAIL',receipts=receipts,completedAt=now(),finalState=state()))
sys.exit(0 if all(r['exitCode']==0 for r in receipts) else 1)
