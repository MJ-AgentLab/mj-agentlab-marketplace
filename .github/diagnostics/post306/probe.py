"""One diagnostic launch. Original checker bytes, argv, private Job and limits stay fixed.
Only inherited NUL stdio sink is redirected to an owned diagnostic file.
This is instrumented evidence, never an acceptance replacement or automatic retry."""
import contextlib, hashlib, importlib.util, io, json, os, pathlib, sys, time
from datetime import datetime,timezone
out=pathlib.Path(sys.argv[1]).resolve()
assert os.name=="nt"
record={"scope":"single failed warm-paper startup diagnostic; no acceptance replacement","startedUtc":datetime.now(timezone.utc).isoformat(),"instrumentationLimits":["The single inherited NUL handle is redirected for stdin/stdout/stderr to a new owned file; argument list, flags, private Job ownership and checker deadlines are unchanged.","Single diagnostic outcome does not explain or overwrite the original two CI failures."]}
source=pathlib.Path("plugins/html-guide-kit/skills/site/scripts/check_renderings.py").resolve()
raw=source.read_bytes()
assert hashlib.sha256(raw).hexdigest()=="ac82f8fd8ed4ad07e07142c0d35b4b08fc29657f2a665f020c9b5d502854abf8"
spec=importlib.util.spec_from_file_location("original_checker",source);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
record["checkerSha256"]=hashlib.sha256(raw).hexdigest()
sink=out/"browser-stdio.raw";sink.write_bytes(b"")
old_init=m._WindowsJobAPI.__init__
def init(api):
    old_init(api)
    create=api.CreateFileW
    def redirected(name,*args):
        return create(str(sink) if name=="NUL" else name,*args)
    api.CreateFileW=redirected
m._WindowsJobAPI.__init__=init
old_members=m.WindowsBrowserScope.members
samples=[]
def members(scope):
    state=old_members(scope)
    if len(samples)<400:
        samples.append({"monotonic":time.monotonic(),"state":state})
    return state
m.WindowsBrowserScope.members=members
old_wait=m.wait_browser_endpoint
def wait(process,profile,timeout):
    started=time.monotonic()
    rec={"startedMonotonic":started,"requestedTimeout":timeout,"sourceLimit":min(timeout,15),"profile":str(profile),"argv":process.command}
    record["endpoint"]=rec
    try:
        value=old_wait(process,profile,timeout)
        rec["outcome"]="RETURNED_TARGETS";rec["targets"]=value
        return value
    except BaseException as e:
        rec["outcome"]="RAISED";rec["error"]=type(e).__name__+": "+str(e)
        raise
    finally:
        rec["elapsedSeconds"]=time.monotonic()-started
        try:rec["launcherPoll"]=process.poll();rec["jobBeforeCleanup"]=old_members(process)
        except Exception as e:rec["snapshotError"]=repr(e)
        try:rec["profileTopLevel"]=[{"name":p.name,"directory":p.is_dir(),"bytes":p.stat().st_size} for p in list(profile.iterdir())[:64]]
        except Exception as e:rec["profileSnapshotError"]=repr(e)
m.wait_browser_endpoint=wait
old_stop=m.WindowsBrowserScope.stop_and_confirm_empty
def stop(process,*args,**kwargs):
    old_terminate=process.api.TerminateJobObject
    def terminate(job,code):
        record.setdefault("terminateJobCalls",[]).append({"monotonic":time.monotonic(),"code":code})
        return old_terminate(job,code)
    process.api.TerminateJobObject=terminate
    return old_stop(process,*args,**kwargs)
m.WindowsBrowserScope.stop_and_confirm_empty=stop
fixture=json.loads((out/"fixture-record.json").read_text(encoding="utf-8"))
browser=pathlib.Path(os.environ["PROGRAMFILES"])/"Google/Chrome/Application/chrome.exe"
assert browser.is_file()
record["browser"]=str(browser)
sys.argv=[str(source),"--input",fixture["generated"],"--browser",str(browser),"--screenshots",str(out/"screenshots")]
stream=io.StringIO()
rc=2
try:
    with contextlib.redirect_stdout(stream):rc=m.main()
except BaseException as error:
    rc=error.code if isinstance(error,SystemExit) and isinstance(error.code,int) else 1
    record["checkerException"]=repr(error)
finally:
    original=stream.getvalue()
    record["returnCode"]=rc;record["endedUtc"]=datetime.now(timezone.utc).isoformat();record["jobSamples"]=samples
    errors=[];tail=b""
    for name in ("snapshotError","profileSnapshotError"):
        if name in record.get("endpoint",{}):errors.append({"phase":name,"error":record["endpoint"][name]})
    try:(out/"checker-original.json").write_text(original,encoding="utf-8")
    except Exception as error:errors.append({"phase":"preserve-checker-output","error":repr(error)})
    try:
        size=sink.stat().st_size
        h=hashlib.sha256()
        with sink.open("rb") as f:
            for chunk in iter(lambda:f.read(65536),b""):h.update(chunk)
            f.seek(max(0,size-65536));tail=f.read(65536)
        (out/"browser-stdio.tail").write_bytes(tail)
        record["stdio"]={"totalBytes":size,"storedTailBytes":len(tail),"tailLimit":65536,"truncated":size>65536,"rawSha256":h.hexdigest(),"tailSha256":hashlib.sha256(tail).hexdigest()}
    except Exception as error:errors.append({"phase":"collect-stdio","error":repr(error)})
    try:record["browserBinarySha256AfterLaunch"]=hashlib.sha256(browser.read_bytes()).hexdigest()
    except Exception as error:errors.append({"phase":"browser-identity-after-launch","error":repr(error)})
    record["diagnosticErrors"]=errors;record["diagnosticComplete"]=not errors
    try:(out/"diagnostic.json").write_text(json.dumps(record,ensure_ascii=False,indent=2),encoding="utf-8")
    except Exception as error:
        record["diagnosticComplete"]=False
        record["diagnosticErrors"].append({"phase":"write-diagnostic","error":repr(error)})
    print(original);print(json.dumps(record,ensure_ascii=False));print(tail.decode("utf-8",errors="replace"))
raise SystemExit(rc)
