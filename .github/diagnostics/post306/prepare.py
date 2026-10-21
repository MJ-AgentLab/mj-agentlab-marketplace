"""Preserve exact preparation process output before any browser is launched."""
import datetime,json,pathlib,subprocess,sys,os
out=pathlib.Path(sys.argv[1]).resolve()
record={"startedUtc":datetime.datetime.now(datetime.timezone.utc).isoformat(),"scope":"fixture preparation only; no browser startup","cwd":os.getcwd(),"argv":["node",str(pathlib.Path(__file__).with_name("fixture.mjs")),str(out)]}
try:
    p=subprocess.run(record["argv"],stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=20)
    record["returnCode"]=p.returncode;stdout,stderr=p.stdout,p.stderr
except subprocess.TimeoutExpired as error:
    record["returnCode"]=124;record["timedOut"]=True;stdout,stderr=error.stdout or b"",error.stderr or b""
except Exception as error:
    record["returnCode"]=125;record["exception"]=repr(error);stdout,stderr=b"",repr(error).encode("utf-8")
(out/"fixture.stdout").write_bytes(stdout);(out/"fixture.stderr").write_bytes(stderr)
record["endedUtc"]=datetime.datetime.now(datetime.timezone.utc).isoformat()
(out/"prepare-process.json").write_text(json.dumps(record,indent=2),encoding="utf-8")
print(json.dumps(record));print(stdout.decode("utf-8",errors="replace"));print(stderr.decode("utf-8",errors="replace"))
raise SystemExit(record["returnCode"])
