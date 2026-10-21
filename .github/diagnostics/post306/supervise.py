"""Original case's 45s outer supervision, scoped to this owned Python controller."""
import datetime,json,pathlib,subprocess,sys,time
out=pathlib.Path(sys.argv[1]).resolve()
record={"startedUtc":datetime.datetime.now(datetime.timezone.utc).isoformat(),"timeoutSeconds":45,"scope":"one instrumented warm-paper checker, no retry; no other process control"}
rc=2
with (out/"controller.stdout").open("wb") as stdout,(out/"controller.stderr").open("wb") as stderr:
    process=subprocess.Popen([sys.executable,str(pathlib.Path(__file__).with_name("probe.py")),str(out)],stdout=stdout,stderr=stderr)
    record["controllerPid"]=process.pid
    try:
        rc=process.wait(timeout=45);record["originalControllerReturnCode"]=rc;record["timedOut"]=False
    except subprocess.TimeoutExpired:
        record["timedOut"]=True;record["originalControllerReturnCode"]=None
        process.kill()
        process.wait(timeout=5)
        record["controllerReturnCodeAfterOwnedKill"]=process.returncode
        record["limit"]="Only this controller was killed. Private Job kill-on-close is configured by original source; no post-timeout empty-scope proof or acceptance is claimed."
        rc=124
record["endedUtc"]=datetime.datetime.now(datetime.timezone.utc).isoformat()
try:
    diagnostic=json.loads((out/"diagnostic.json").read_text(encoding="utf-8"))
    record["diagnosticComplete"]=diagnostic.get("diagnosticComplete") is True
except Exception as error:
    record["diagnosticComplete"]=False;record["diagnosticReadError"]=repr(error)
record["workflowExitCode"]=rc if rc else (0 if record["diagnosticComplete"] else 3)
(out/"supervisor.json").write_text(json.dumps(record,indent=2),encoding="utf-8")
for name in ("controller.stdout","controller.stderr"):
    with (out/name).open("rb") as stream:
        stream.seek(0,2);stream.seek(max(0,stream.tell()-100000))
        print(stream.read(100000).decode("utf-8",errors="replace"))
print(json.dumps(record))
raise SystemExit(record["workflowExitCode"])
