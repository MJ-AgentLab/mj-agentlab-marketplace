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
   try:os.kill(child_pid,0);alive=True
   except ProcessLookupError:alive=False
   if separate_group:
    assert alive and not before and not after
    qa.cleanup_workspace(root,lifecycle);time.sleep(0.15);recreated=root.exists()
   else:recreated=False
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
report={'platform':sys.platform,'python':sys.version,'results':results,'scope':'isolated Python launcher/writer; not actual Chrome or GitHub CI'}
pathlib.Path(sys.argv[2]).write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
