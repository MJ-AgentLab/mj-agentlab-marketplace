import importlib.util,json,os,pathlib,signal,subprocess,sys,tempfile,time
spec=importlib.util.spec_from_file_location('qa',sys.argv[1]);qa=importlib.util.module_from_spec(spec);spec.loader.exec_module(qa)
results=[]
foreign=subprocess.Popen([sys.executable,'-c','import time;time.sleep(30)'],start_new_session=True)
try:
 for separate_group in (False,True):
  root=pathlib.Path(tempfile.mkdtemp(prefix='html-site-layout-')); marker=root/'writer.json';child_pid=None
  writer="import json,os,pathlib,sys,time; p=pathlib.Path(sys.argv[1]); separate=sys.argv[2]=='True'; os.setpgid(0,0) if separate else None; exec('while True:\\n p.parent.mkdir(exist_ok=True)\\n p.write_text(json.dumps({\"pid\":os.getpid(),\"group\":os.getpgrp(),\"session\":os.getsid(0)}))\\n time.sleep(0.02)'.replace('\\\\n','\\n'))"
  writer='import json,os,pathlib,sys,time\np=pathlib.Path(sys.argv[1])\nif sys.argv[2]=="True": os.setpgid(0,0)\nwhile True:\n p.parent.mkdir(exist_ok=True)\n p.write_text(json.dumps({"pid":os.getpid(),"group":os.getpgrp(),"session":os.getsid(0)}))\n time.sleep(0.02)'
  launcher='import subprocess,sys; subprocess.Popen([sys.executable,"-c",sys.argv[1],sys.argv[2],sys.argv[3]],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)'
  owned=subprocess.Popen([sys.executable,'-c',launcher,writer,str(marker),str(separate_group)],start_new_session=True)
  try:
   owned.wait(timeout=5); deadline=time.monotonic()+3
   while not marker.exists() and time.monotonic()<deadline:time.sleep(0.01)
   data=json.loads(marker.read_text()); child_pid=data['pid'];assert data['session']==owned.pid
   before=qa.live_group_members(owned.pid); lifecycle=[]; qa.close_browser(owned,None,lifecycle); after=qa.live_group_members(owned.pid)
   try: state=(pathlib.Path("/proc")/str(child_pid)/"stat").read_text().rsplit(")",1)[1].split()[0];alive=state not in ("Z","X")
   except FileNotFoundError:alive=False
   assert child_pid in before and not after and not alive
   assert foreign.poll() is None
   qa.cleanup_workspace(root,lifecycle);time.sleep(0.15);recreated=root.exists();assert not recreated
   results.append({'separateGroup':separate_group,'launcher':owned.pid,'writer':data,'trackedBefore':before,'trackedAfter':after,'writerAliveAfterClose':alive,'rootRecreatedAfterCleanup':recreated,'foreignUnaffected':foreign.poll() is None,'lifecycle':lifecycle})
  finally:
   if child_pid:
    try:os.kill(child_pid,signal.SIGKILL)
    except ProcessLookupError:pass
   try:os.killpg(owned.pid,signal.SIGKILL)
   except ProcessLookupError:pass
   time.sleep(0.05)
   if root.exists():qa.cleanup_workspace(root,[])
finally:
 foreign.terminate();foreign.wait(timeout=3)
from unittest.mock import patch
from contextlib import redirect_stdout
import errno,io
incomplete=[]
for phase in ('directory-list','entry-stat'):
 def failed_list(self):
  if self==pathlib.Path('/proc'): raise PermissionError(errno.EACCES,'independent incomplete /proc inventory')
  raise AssertionError('unexpected enumeration')
 original_read=qa.Path.read_text
 def failed_stat(self,*args,**kwargs):
  if self.parent.parent==pathlib.Path('/proc') and self.name=='stat':raise PermissionError(errno.EACCES,'independent unreadable process stat')
  return original_read(self,*args,**kwargs)
 target=patch.object(qa.Path,'iterdir',failed_list) if phase=='directory-list' else patch.object(qa.Path,'read_text',failed_stat)
 with target:
  try: qa.live_group_members(1)
  except RuntimeError as error: incomplete.append({'phase':phase,'status':'FAIL_CLOSED','reason':str(error)})
  else: raise AssertionError('incomplete enumeration must not be empty success')
with tempfile.TemporaryDirectory(prefix='html-lifecycle-main-review-') as temporary:
 root=pathlib.Path(temporary);artifact=root/'artifact';artifact.mkdir();(artifact/'index.html').write_text('<h1>fixture</h1>')
 def completed_then_incomplete(root,browser,screenshots,viewports,timeout,results,lifecycle):
  results.extend([{'status':'PASS','viewport':{'width':w,'height':h}} for w,h in viewports]);qa.live_group_members(1)
 oldargv=sys.argv;sys.argv=['check_renderings.py','--input',str(artifact),'--screenshots',str(root/'shots'),'--browser',sys.executable,'--output',str(root/'main-report.json')]
 try:
  with patch.object(qa.Path,'iterdir',failed_list),patch.object(qa,'run_checks',completed_then_incomplete),redirect_stdout(io.StringIO()):code=qa.main()
  mainreport=json.loads((root/'main-report.json').read_text());assert code==2 and mainreport['status']=='NOT_RUN' and len(mainreport['viewports'])==2
  incomplete.append({'phase':'main-after-completed-viewports','exit':code,'status':mainreport['status'],'reason':mainreport['reason'],'completedViewports':len(mainreport['viewports'])})
 finally:sys.argv=oldargv
report={'platform':sys.platform,'python':sys.version,'results':results,'incompleteEnumeration':incomplete,'scope':'isolated Python launcher/writer; not actual Chrome or GitHub CI'}
pathlib.Path(sys.argv[2]).write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))

