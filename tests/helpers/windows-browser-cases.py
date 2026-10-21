"""Real Windows kernel ownership cases; invoked by Node, no browser download."""
import ctypes
from ctypes import wintypes
import importlib.util
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import time
from unittest.mock import patch

sys.dont_write_bytecode = True
spec = importlib.util.spec_from_file_location("browser_qa", sys.argv[1])
qa = importlib.util.module_from_spec(spec)
spec.loader.exec_module(qa)
assert os.name == "nt", "native Windows tests must execute on Windows"
kernel = ctypes.WinDLL("kernel32", use_last_error=True)
kernel.OpenProcess.argtypes = [wintypes.DWORD, wintypes.BOOL, wintypes.DWORD]
kernel.OpenProcess.restype = wintypes.HANDLE
kernel.WaitForSingleObject.argtypes = [wintypes.HANDLE, wintypes.DWORD]
kernel.WaitForSingleObject.restype = wintypes.DWORD
kernel.CloseHandle.argtypes = [wintypes.HANDLE]
kernel.CloseHandle.restype = wintypes.BOOL


def wait_for(predicate, seconds=5):
    deadline = time.monotonic() + seconds
    while time.monotonic() < deadline:
        value = predicate()
        if value:
            return value
        time.sleep(0.02)
    raise AssertionError("bounded actual process condition did not become true")


def read_json(path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return None


def process_handle(pid):
    handle = kernel.OpenProcess(0x00100000 | 0x1000, False, pid)
    assert handle, "open actual owned process before testing termination"
    return handle


def finish(scope):
    try:
        scope.stop_and_confirm_empty(.05, 3)
    finally:
        scope.release_handles()


WRITER = "import json,os,pathlib,sys,time\np=pathlib.Path(sys.argv[1])\nwhile True:\n p.parent.mkdir(parents=True,exist_ok=True)\n p.write_text(json.dumps({'pid':os.getpid(),'time':time.monotonic()}))\n time.sleep(.02)"
rows = []
base = Path(tempfile.mkdtemp(prefix="windows-job-test-"))
foreign_marker = base / "foreign.json"
foreign_code = WRITER.replace("while True:", "deadline=time.monotonic()+90\nwhile time.monotonic()<deadline:")
foreign = subprocess.Popen([sys.executable, "-c", foreign_code, str(foreign_marker), "--user-data-dir=look-alike-browser-profile"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, creationflags=subprocess.CREATE_NO_WINDOW)

try:
    # A timed-out or killed test controller cannot leave this unowned canary
    # alive indefinitely; normal and assertion-failure exits use finally below.
    wait_for(lambda: read_json(foreign_marker))
    # The original launcher exits0 before its detached child's delayed write.
    # The child later creates a grandchild. Neither is owned by parent PID scans.
    for delay, close_before_write in [(.05, False), (.8, True)]:
        root = Path(tempfile.mkdtemp(prefix="html-site-layout-"))
        ready, marker, grandchild = base / ("ready-" + str(delay)), root / "child.json", root / "grandchild.json"
        child = "import json,os,pathlib,subprocess,sys,time\npathlib.Path(sys.argv[1]).write_text(json.dumps({'pid':os.getpid()}))\ntime.sleep(float(sys.argv[2]))\nsubprocess.Popen([sys.executable,'-c',sys.argv[3],sys.argv[5]],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)\nexec(sys.argv[3],{'__name__':'__main__'})"
        # WRITER executes in child with marker as sys.argv[1] after readiness.
        child = child.replace("exec(sys.argv[3],{'__name__':'__main__'})", "code=sys.argv[3];sys.argv=[sys.argv[0],sys.argv[4]];exec(code)")
        launcher = "import subprocess,sys;subprocess.Popen([sys.executable,'-c',sys.argv[1],*sys.argv[2:]],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,creationflags=0x8|0x200)"
        life, scope = [], qa.WindowsBrowserScope([])
        scope.lifecycle = life
        scope._pid_capacity = 1  # Force the actual variable PID-list growth path.
        query_events = []
        original_query = scope.api.QueryInformationJobObject
        def observed_query(job, kind, buffer, size, returned):
            okay = original_query(job, kind, buffer, size, returned)
            error = ctypes.get_last_error() if not okay else 0
            if kind == 3:
                query_events.append({"bufferBytes": size, "success": bool(okay), "error": error})
            return okay
        scope.api.QueryInformationJobObject = observed_query
        try:
            scope.start([sys.executable, "-c", launcher, child, str(ready), str(delay), WRITER, str(marker), str(grandchild)])
            wait_for(lambda: scope.poll() == 0)
            child_id = wait_for(lambda: read_json(ready))["pid"]
            assert scope.has_live_members() and child_id in scope.members()["pids"]
            if not close_before_write:
                child_data = wait_for(lambda: read_json(marker))
                grand_data = wait_for(lambda: read_json(grandchild))
                assert {child_data["pid"], grand_data["pid"]}.issubset(scope.members()["pids"])
                assert any(x["error"] == 234 for x in query_events), "real insufficient PID buffer must exercise ERROR_MORE_DATA"
            scope.stop_and_confirm_empty(.05, 3)
            assert scope.cleanup_permitted
            qa.cleanup_workspace(root, life)
            time.sleep(delay + .15)
            assert not root.exists(), "delayed owned descendants must not recreate the profile"
            assert foreign.poll() is None
            rows.append({"case": "launcher-exit0-detached-late-descendants", "delay": delay, "closedBeforeWrite": close_before_write, "launcherReturnCode": scope.returncode, "childPid": child_id, "canarySurvived": True, "pidListQueries": query_events, "lifecycle": life})
        finally:
            if scope.job:
                finish(scope)
            if root.exists():
                shutil.rmtree(root)

    # A real local HTTP endpoint becomes readable only after launcher exit0.
    endpoint = "import http.server,json,pathlib,sys,time\ntime.sleep(float(sys.argv[2]))\nclass H(http.server.BaseHTTPRequestHandler):\n def do_GET(self):\n  body=json.dumps([{'type':'page','webSocketDebuggerUrl':'ws://127.0.0.1/fake'}]).encode();self.send_response(200);self.end_headers();self.wfile.write(body)\n def log_message(self,*a):pass\ns=http.server.HTTPServer(('127.0.0.1',0),H);p=pathlib.Path(sys.argv[1]);p.mkdir(parents=True,exist_ok=True);(p/'DevToolsActivePort').write_text(str(s.server_port)+'\\n');s.serve_forever()"
    for delay, expected in [(.2, "endpoint-after-launcher-exit"), (6, "endpoint-too-late")]:
        root = Path(tempfile.mkdtemp(prefix="html-site-layout-"))
        profile = root / "browser-profile"
        launcher = "import subprocess,sys;subprocess.Popen([sys.executable,'-c',sys.argv[1],sys.argv[2],sys.argv[3]],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,creationflags=0x8|0x200)"
        life, scope = [], qa.WindowsBrowserScope([])
        scope.lifecycle = life
        try:
            scope.start([sys.executable, "-c", launcher, endpoint, str(profile), str(delay)])
            wait_for(lambda: scope.poll() == 0)
            started = time.monotonic()
            try:
                targets = qa.wait_browser_endpoint(scope, profile, 5)
            except RuntimeError as error:
                assert delay == 6 and "readable local DevTools endpoint" in str(error)
                assert 4.8 <= time.monotonic() - started < 5.8, "original5-second requested startup limit must remain bounded"
            else:
                assert delay == .2 and targets[0]["type"] == "page" and scope.poll() == 0
            scope.stop_and_confirm_empty(.05, 3)
            qa.cleanup_workspace(root, life)
            assert not root.exists() and foreign.poll() is None
            rows.append({"case": expected, "delay": delay, "launcherReturnCode": scope.returncode, "canarySurvived": True, "lifecycle": life})
        finally:
            if scope.job:
                finish(scope)
            if root.exists():
                shutil.rmtree(root)

    # Faults are injected into real kernel process lifecycles, not fake PIDs.
    for operation in ["SetInformationJobObject", "CreateProcessW", "AssignProcessToJobObject", "ResumeThread", "QueryInformationJobObject", "TerminateJobObject"]:
        life, scope = [], qa.WindowsBrowserScope([])
        scope.lifecycle = life
        root = None
        handle = None
        marker = base / (operation + ".json")
        real = getattr(scope.api, operation)
        def denied(*_):
            ctypes.set_last_error(5)
            return 0xFFFFFFFF if operation == "ResumeThread" else 0
        try:
            with qa.owned_workspace(life, lambda: scope.cleanup_permitted) as workspace:
                root = Path(workspace)
                (root / "preserve").write_text("owned profile evidence")
                if operation in ["SetInformationJobObject", "CreateProcessW", "AssignProcessToJobObject", "ResumeThread"]:
                    setattr(scope.api, operation, denied)
                    try:
                        scope.start([sys.executable, "-c", WRITER, str(marker)])
                    except OSError:
                        pass
                    else:
                        raise AssertionError("failed birth-time ownership must fail closed")
                    setattr(scope.api, operation, real)
                    scope.stop_and_confirm_empty(.05, 3)
                    scope.release_handles()
                    assert not marker.exists(), "unresumed launcher must not execute Python code"
                else:
                    scope.start([sys.executable, "-c", WRITER, str(marker)])
                    wait_for(lambda: read_json(marker))
                    handle = process_handle(scope.pid)
                    setattr(scope.api, operation, denied)
                    qa.close_browser(scope, None, life)
        except RuntimeError as error:
            assert operation in ["QueryInformationJobObject", "TerminateJobObject"] and operation in str(error)
            assert root.exists() and (root / "preserve").is_file(), "unknown teardown must preserve the profile"
            assert not scope.cleanup_permitted and life[-1]["status"] == "BLOCKED"
            assert kernel.WaitForSingleObject(handle, 3000) == 0, "last private job handle closes and contains actual writer"
        else:
            assert operation in ["SetInformationJobObject", "CreateProcessW", "AssignProcessToJobObject", "ResumeThread"]
            assert not root.exists()
        finally:
            setattr(scope.api, operation, real)
            if scope.job:
                finish(scope)
            if handle:
                assert kernel.CloseHandle(handle)
            if root and root.exists():
                qa.cleanup_workspace(root, [])
        assert foreign.poll() is None
        rows.append({"case": "kernel-failure-failclosed", "operation": operation, "canarySurvived": True, "lifecycle": life})

    # Actual run_checks must retain its original startup error AND teardown error.
    real_scope = qa.WindowsBrowserScope
    life, held = [], []
    class BrokenScope(real_scope):
        def __init__(self, lifecycle):
            super().__init__(lifecycle)
            def resume_failure(_):
                held.append(process_handle(self.pid))
                ctypes.set_last_error(5)
                return 0xFFFFFFFF
            def query_failure(*_):
                ctypes.set_last_error(6)
                return 0
            self.api.ResumeThread = resume_failure
            self.api.QueryInformationJobObject = query_failure
    artifact = base / "selected-artifact"
    artifact.mkdir()
    (artifact / "index.html").write_text("<h1>unchanged input</h1>")
    preserved = None
    try:
        with patch.object(qa, "WindowsBrowserScope", BrokenScope):
            try:
                qa.run_checks(artifact, Path(sys.executable), base, [(390, 844)], 5, [], life)
            except RuntimeError as error:
                assert "ResumeThread" in str(error) and "QueryInformationJobObject" in str(error)
                preserved = Path(life[-1]["preservedRoot"])
                assert life[-1]["status"] == "BLOCKED" and preserved.is_dir()
            else:
                raise AssertionError("startup plus teardown failures must not turn into PASS")
        assert (artifact / "index.html").read_text() == "<h1>unchanged input</h1>"
        assert held and kernel.WaitForSingleObject(held[0], 3000) == 0 and foreign.poll() is None
        rows.append({"case": "startup-and-teardown-errors-both-preserved", "canarySurvived": True, "lifecycle": life})
    finally:
        for handle in held:
            assert kernel.CloseHandle(handle)
        if preserved and preserved.exists():
            qa.cleanup_workspace(preserved, [])

    # A broken transport close must not bypass the real owned-job teardown when
    # its API caller catches the error and continues to live.
    marker = base / "transport-close.json"
    life, scope = [], qa.WindowsBrowserScope([])
    scope.lifecycle = life
    handle = None
    class BrokenTransport:
        def call(self, method):
            assert method == "Browser.close"
        def close(self):
            raise OSError("injected transport close failure")
    try:
        scope.start([sys.executable, "-c", WRITER, str(marker)])
        wait_for(lambda: read_json(marker))
        handle = process_handle(scope.pid)
        try:
            qa.close_browser(scope, BrokenTransport(), life)
        except RuntimeError as error:
            assert "injected transport close failure" in str(error)
        else:
            raise AssertionError("transport close error must keep the overall result non-PASS")
        assert scope.cleanup_permitted and scope.job is None and scope.process is None
        assert any(item["phase"] == "DevTools.close" and item["status"] == "FAIL" for item in life)
        assert any(item["phase"] == "owned-windows-job-exit" and item["status"] == "PASS" for item in life)
        assert kernel.WaitForSingleObject(handle, 0) == 0 and foreign.poll() is None
        rows.append({"case": "transport-close-failure-still-drains-and-releases-job", "canarySurvived": True, "overallResult": "NON_PASS_EXPECTED", "lifecycle": life})
    finally:
        if scope.job:
            finish(scope)
        if handle:
            assert kernel.CloseHandle(handle)

    # The controller's last non-inheritable job handle must not leak to children.
    record, marker = base / "controller.json", base / "controller-child.json"
    controller_code = "import importlib.util,json,pathlib,sys,time\ns=importlib.util.spec_from_file_location('qa',sys.argv[1]);q=importlib.util.module_from_spec(s);s.loader.exec_module(q);o=q.WindowsBrowserScope([]);o.start([sys.executable,'-c',sys.argv[2],sys.argv[3]]);pathlib.Path(sys.argv[4]).write_text(json.dumps({'pid':o.pid}));time.sleep(60)"
    controller = subprocess.Popen([sys.executable, "-c", controller_code, sys.argv[1], WRITER, str(marker), str(record)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, creationflags=subprocess.CREATE_NO_WINDOW)
    handle = None
    try:
        child_id = wait_for(lambda: read_json(record))["pid"]
        wait_for(lambda: read_json(marker))
        handle = process_handle(child_id)
        controller.kill()
        controller.wait(timeout=5)
        assert kernel.WaitForSingleObject(handle, 5000) == 0
        assert foreign.poll() is None
        rows.append({"case": "controller-death-kill-on-close", "childPid": child_id, "canarySurvived": True})
    finally:
        if controller.poll() is None:
            controller.kill()
            controller.wait(timeout=5)
        if handle:
            assert kernel.CloseHandle(handle)

    # A controller already inside an outer job creates an inner job; inner stop
    # must leave a peer in the same outer job alive.
    nested_record = base / "nested.json"
    nested_code = "import importlib.util,json,pathlib,subprocess,sys,time\ns=importlib.util.spec_from_file_location('qa',sys.argv[1]);q=importlib.util.module_from_spec(s);s.loader.exec_module(q);p=subprocess.Popen([sys.executable,'-c','import time;time.sleep(30)']);o=q.WindowsBrowserScope([])\ntry:\n o.start([sys.executable,'-c','import time;time.sleep(30)']);o.stop_and_confirm_empty(.05,3);o.release_handles();assert p.poll() is None;pathlib.Path(sys.argv[2]).write_text(json.dumps({'peerSurvived':True}))\nfinally:\n p.terminate();p.wait(timeout=5)"
    outer = qa.WindowsBrowserScope([])
    try:
        outer.start([sys.executable, "-c", nested_code, sys.argv[1], str(nested_record)])
        assert wait_for(lambda: read_json(nested_record))["peerSurvived"] is True
        wait_for(lambda: outer.poll() == 0)
        finish(outer)
        rows.append({"case": "nested-job-isolates-outer-peer", "peerSurvived": True})
    finally:
        if outer.job:
            finish(outer)
    assert foreign.poll() is None
    print(json.dumps({"status": "PASS", "cases": rows, "foreignPid": foreign.pid, "foreignSurvivedEveryCase": True}))
finally:
    foreign.terminate()
    foreign.wait(timeout=5)
    shutil.rmtree(base)
