from pathlib import Path
import datetime as dt
import hashlib
import json
import os
import shutil
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parent
WT = Path(r"C:/Users/Admin/.codex/worktrees/html-alignment-sync/develop")
SOURCE = Path(r"C:/Users/Admin/.codex/task-evidence/html-learning-274-post290-20261020/actual-develop-local/run-local-harness.py")
PYTHON = r"C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe"
EXPECTED_HEAD = "5898a8192740b39f41263129a5f99efeba96a6cc"
EXPECTED_TREE = "3a68976af95bb5948de17a6fccaabf892becaaca"

def now():
    return dt.datetime.now(dt.timezone.utc).isoformat(timespec="milliseconds")

def git(*args):
    return subprocess.run(["git", "-C", str(WT), *args], capture_output=True, check=True).stdout.decode("utf-8").strip()

def save(name, data):
    (ROOT / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

assert not (ROOT / "batch.json").exists() and not (ROOT / "launch.json").exists(), "Single batch only; never overwrite"
assert git("rev-parse", "HEAD") == EXPECTED_HEAD
assert git("rev-parse", "HEAD^{tree}") == EXPECTED_TREE
assert not git("status", "--porcelain=v1")
dependencies = []
for relative in ["node_modules/yaml/package.json", "node_modules/cross-spawn/package.json", "node_modules/pngjs/package.json", "node_modules/@resvg/resvg-js/package.json"]:
    path = WT / relative
    data = path.read_bytes()
    value = json.loads(data)
    dependencies.append({"path": relative, "name": value["name"], "version": value["version"], "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()})
destination = ROOT / "run-local-harness.py"
assert not destination.exists()
shutil.copyfile(SOURCE, destination)
script_data = destination.read_bytes()
assert script_data == SOURCE.read_bytes()
owned_temp = Path(tempfile.mkdtemp(prefix="t291u-", dir="D:/")).resolve()
assert owned_temp.parent == Path("D:/").resolve() and owned_temp.name.startswith("t291u-")
env = dict(os.environ)
env["TEMP"] = str(owned_temp)
env["TMP"] = str(owned_temp)
launch = {"startedAtUtc": now(), "scope": "Actual protected main merge checked locally once; separate from CI and isolated canonical installation smoke", "head": EXPECTED_HEAD, "tree": EXPECTED_TREE,
          "sourceHarness": str(SOURCE), "copiedHarness": str(destination), "sourceAndCopySha256": hashlib.sha256(script_data).hexdigest(), "sourceAndCopyByteIdentical": True,
          "dependencies": dependencies, "temporaryRoot": str(owned_temp), "temporaryRootOwnership": "Fresh process-owned mkdtemp under D:/; no shared environment mutation", "temporaryEnvironmentOverrides": {"TEMP": str(owned_temp), "TMP": str(owned_temp)},
          "argv": [PYTHON, str(destination)], "cwd": str(WT)}
save("launch.json", launch)
with (ROOT / "launch.log").open("wb") as log:
    result = subprocess.run([PYTHON, str(destination)], cwd=WT, env=env, stdout=log, stderr=subprocess.STDOUT, check=False)
launch.update({"endedAtUtc": now(), "exitCode": result.returncode, "temporaryRootRemainingEntries": [path.name for path in owned_temp.iterdir()]})
if not launch["temporaryRootRemainingEntries"]:
    owned_temp.rmdir()
launch["temporaryRootAbsentAfterNonrecursiveCleanup"] = not owned_temp.exists()
data = (ROOT / "launch.log").read_bytes()
launch["combinedOutput"] = {"path": "launch.log", "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}
save("launch.json", launch)
print(json.dumps({"head": EXPECTED_HEAD, "exitCode": result.returncode, "temporaryRoot": str(owned_temp), "temporaryRootAbsentAfterNonrecursiveCleanup": launch["temporaryRootAbsentAfterNonrecursiveCleanup"], "harnessSha256": launch["sourceAndCopySha256"]}))
raise SystemExit(result.returncode)
