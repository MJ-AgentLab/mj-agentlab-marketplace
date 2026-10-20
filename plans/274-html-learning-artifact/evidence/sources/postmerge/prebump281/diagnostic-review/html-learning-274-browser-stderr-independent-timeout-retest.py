import base64,json,os,pathlib,signal,subprocess,sys,tempfile,time
payload=json.load(sys.stdin)
with tempfile.TemporaryDirectory(prefix='html-stderr-independent-timeout-') as temporary:
 root=pathlib.Path(temporary)
 (root/'capture.mjs').write_bytes(base64.b64decode(payload['helper']))
 fake=root/"fake browser ' ; quoted"
 marker=root/'unexpected-version-command'
 fake.write_text("#!/usr/bin/python3\nimport pathlib,signal,sys,time\nif sys.argv[1:]==['--version']:\n pathlib.Path("+repr(str(marker))+").write_text('called')\n signal.signal(signal.SIGTERM,signal.SIG_IGN)\n time.sleep(60)\nelse:\n sys.stderr.write('original fake failure\\n')\n sys.exit(23)\n")
 fake.chmod(0o700)
 (root/'probe.mjs').write_text("import {captureBrowserStderr} from './capture.mjs';import {spawnSync} from 'node:child_process';\nconst c=captureBrowserStderr({directory:"+json.dumps(str(root))+",executable:"+json.dumps(str(fake))+",pythonCommand:'/usr/bin/python3'});\nconst r=spawnSync(c.executable,[],{encoding:'utf8',timeout:2000});console.log(JSON.stringify({stage:'original-returned',status:r.status}));\nconst started=Date.now();const d=c.diagnostics();console.log(JSON.stringify({stage:'diagnostics-returned',wall:Date.now()-started,attempts:d.attempts.length,acceptanceStatus:d.acceptanceStatus,versionFieldPresent:Object.hasOwn(d,'executableVersion')}));\n")
 node='/tmp/html-browser-stderr-node-22.18.0/node-v22.18.0-linux-x64/bin/node'
 foreign=subprocess.Popen(['/usr/bin/python3','-c','import time;time.sleep(30)'],start_new_session=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
 proc=subprocess.Popen([node,str(root/'probe.mjs')],start_new_session=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
 started=time.monotonic()
 try:
  out,err=proc.communicate(timeout=7)
  hung=False
 except subprocess.TimeoutExpired:
  hung=True
  os.killpg(proc.pid,signal.SIGKILL)
  out,err=proc.communicate(timeout=3)
 finally:
  foreign_alive=foreign.poll() is None
  foreign.terminate();foreign.wait(timeout=3)
 print(json.dumps({'probe':'original seven-second version-timeout counterexample, fixed helper retest','helperSha256':payload['sha'],'diagnosticDidNotReturnWithin7Seconds':hung,'wallSeconds':time.monotonic()-started,'stdout':out,'stderr':err,'unexpectedVersionCommandExecuted':marker.exists(),'foreignSurvivedOwnedProbeCleanup':foreign_alive,'scope':'Synthetic timeout boundary only; no actual Chrome, CI or root-cause diagnosis'}))