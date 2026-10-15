from pathlib import Path
import subprocess,os,datetime,json,hashlib,sys
p=Path('C:/Users/Admin/.codex/worktrees');root=p/'release-develop-8-3-0/develop';log=p/'communication-8-3-0-postrelease-canonical-20261015-01.log';assert not log.exists()
env=dict(os.environ);env['PATH']='C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python;C:/Users/Admin/AppData/Roaming/npm;D:/Development/nodejs;'+env['PATH']
start=datetime.datetime.now(datetime.timezone.utc).isoformat()
with log.open('wb') as s:r=subprocess.run(['node',str(p/'communication-8-3-0-postrelease-canonical-20261015-01.mjs')],cwd=root,env=env,stdout=s,stderr=subprocess.STDOUT)
raw=log.read_bytes();receipt={'startedAt':start,'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exitCode':r.returncode,'phase':'post-publication R04','sha':'ae2754dbae2a9acaedf6965ecc4a7b3df7dadd64','log':str(log),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()};f=p/'communication-8-3-0-postrelease-canonical-20261015-01-receipt.json';assert not f.exists();f.write_bytes((json.dumps(receipt,indent=2)+'\n').encode());print(json.dumps(receipt));print(raw.decode('utf-8',errors='replace')[-4000:]);sys.exit(r.returncode)
