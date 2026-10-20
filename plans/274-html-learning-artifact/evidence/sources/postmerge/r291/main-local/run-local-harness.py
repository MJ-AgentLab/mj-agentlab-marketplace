"""Single, explicitly requested local Harness batch; never retries commands."""
from pathlib import Path
import datetime as dt
import hashlib
import json
import os
import subprocess
import time

ROOT = Path(r"C:/Users/Admin/.codex/worktrees/html-alignment-sync/develop")
OUT = Path(__file__).resolve().parent
NODE = r"D:/Development/nodejs/node.exe"
NPM_CLI = r"D:/Development/nodejs/node_modules/npm/bin/npm-cli.js"
PYTHON = r"C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe"

def now():
    return dt.datetime.now(dt.timezone.utc).isoformat(timespec="milliseconds")

def save(name, obj):
    (OUT / name).write_text(json.dumps(obj, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

def git(*args):
    result = subprocess.run(["git", "-C", str(ROOT), *args], capture_output=True, check=False)
    return {"command": ["git", "-C", str(ROOT), *args], "exitCode": result.returncode,
            "stdout": result.stdout.decode("utf-8", errors="replace"),
            "stderr": result.stderr.decode("utf-8", errors="replace")}

def identity():
    tracked = subprocess.run(["git", "-C", str(ROOT), "ls-files", "-z"], capture_output=True, check=True).stdout
    files = []
    for raw in tracked.split(b"\0"):
        if not raw:
            continue
        relative = raw.decode("utf-8")
        path = ROOT / relative
        if not path.is_file():
            files.append({"path": relative, "missing": True})
            continue
        data = path.read_bytes()
        files.append({"path": relative, "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()})
    return {"capturedAtUtc": now(), "head": git("rev-parse", "HEAD"),
            "status": git("status", "--porcelain=v1"), "unmerged": git("ls-files", "-u"),
            "workingDiff": git("diff", "HEAD", "--raw"), "files": files}

if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    if (OUT / "batch.json").exists():
        raise SystemExit("Refusing to overwrite or rerun an existing batch")
    before = identity()
    save("candidate-before.json", before)
    env = dict(os.environ)
    env.update({"PATH": str(Path(PYTHON).parent) + os.pathsep + env.get("PATH", ""),
                "HTML_SITE_PYTHON": PYTHON, "LEK_PYTHON": PYTHON, "PYTHON": PYTHON,
                "REQUIRE_PYTHON": "1", "PYTHONUTF8": "1", "PYTHONDONTWRITEBYTECODE": "1"})
    batch = {"startedAtUtc": now(), "cwd": str(ROOT), "platform": os.name,
             "scope": "npm test; npm run validate; npm run check:baseline-tools; no standalone installation smoke",
             "environmentOverrides": {k: env[k] for k in ["HTML_SITE_PYTHON", "LEK_PYTHON", "PYTHON", "REQUIRE_PYTHON", "PYTHONUTF8", "PYTHONDONTWRITEBYTECODE"]},
             "pathPrepended": str(Path(PYTHON).parent), "commands": []}
    save("batch.json", batch)
    for name, arguments in [("npm-test", ["test"]), ("npm-validate", ["run", "validate"]), ("baseline-tools", ["run", "check:baseline-tools"])]:
        argv = [NODE, NPM_CLI, *arguments]
        item = {"name": name, "displayCommand": "npm " + " ".join(arguments), "argv": argv, "startedAtUtc": now()}
        started = time.monotonic()
        with (OUT / (name + ".log")).open("wb") as raw:
            process = subprocess.Popen(argv, cwd=ROOT, env=env, stdout=raw, stderr=subprocess.STDOUT)
            item["pid"] = process.pid
            batch["commands"].append(item)
            save("batch.json", batch)
            item["exitCode"] = process.wait()
        item["endedAtUtc"] = now()
        item["elapsedSeconds"] = round(time.monotonic() - started, 3)
        log = (OUT / (name + ".log")).read_bytes()
        item["combinedOutput"] = {"path": name + ".log", "bytes": len(log), "sha256": hashlib.sha256(log).hexdigest()}
        save("batch.json", batch)
        print(json.dumps(item, ensure_ascii=False), flush=True)
    after = identity()
    save("candidate-after.json", after)
    batch["endedAtUtc"] = now()
    batch["trackedFilesByteIdenticalBeforeAfter"] = before["files"] == after["files"]
    batch["headIdenticalBeforeAfter"] = before["head"]["stdout"] == after["head"]["stdout"]
    batch["allCommandExitCodesZero"] = all(item["exitCode"] == 0 for item in batch["commands"])
    save("batch.json", batch)
    raise SystemExit(0 if batch["allCommandExitCodesZero"] and batch["trackedFilesByteIdenticalBeforeAfter"] and batch["headIdenticalBeforeAfter"] else 1)
