from pathlib import Path
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parent

def clean(text):
    return "\n".join(re.sub(r"^\d{4}-\d\d-\d\dT\S+ ", "", line) for line in text.splitlines())

def parse_matrix(job_path):
    meta = json.loads(job_path.read_bytes())
    log_path = job_path.with_name("log.stdout")
    raw = log_path.read_bytes()
    text = clean(raw.decode("utf-8-sig"))
    counts = {key: int(re.search(r"^# " + key + r" (\d+)$", text, re.M).group(1)) for key in ["tests", "pass", "fail", "cancelled", "skipped", "todo"]}
    smoke_start = re.search(r'(?m)^\{\n  "ok": true,\n  "version": "codex-cli', text)
    assert smoke_start, "No complete smoke JSON start found"
    smoke, end = json.JSONDecoder().raw_decode(text[smoke_start.start():])
    scenarios = smoke["scenarios"]
    commands = [command for scenario in scenarios for command in scenario["commands"]]
    command_kinds = {name: [command for command in commands if name in " ".join(command["args"])] for name in ["validate_diagram.py", "lek.py", "render-site.mjs", "check_artifact.py"]}
    validation_info = {key: [scenario[key] for scenario in scenarios if key in scenario] for key in ["diagramValidation", "learningEvidenceValidation", "siteValidation"]}
    checkouts = re.findall(r"log -1 --format=%H\n([0-9a-f]{40})", text)
    assert len(checkouts) == 1, checkouts
    report = {"id": meta["id"], "runId": meta["run_id"], "runAttempt": meta["run_attempt"], "name": meta["name"], "conclusion": meta["conclusion"],
              "startedAtUtc": meta["started_at"], "completedAtUtc": meta["completed_at"], "actualCheckout": checkouts[0],
              "testCounts": counts, "skips": [line for line in text.splitlines() if re.match(r"^ok \d+.*# SKIP", line)],
              "scenarioCount": len(scenarios), "scenarioCommandCount": len(commands),
              "commandStatuses": {str(value): sum(command["status"] == value for command in commands) for value in set(command["status"] for command in commands)},
              "actualCheckerCommands": {name: {"count": len(items), "executables": sorted(set(command["command"] for command in items))} for name, items in command_kinds.items()},
              "validationInfo": {key: {"count": len(value)} for key, value in validation_info.items()},
              "siteStaticSummaries": [value["checked"]["summary"] for value in validation_info["siteValidation"]],
              "learningPythonVersions": sorted(set(value["interpreter"] for value in validation_info["learningEvidenceValidation"])),
              "pythonVersionDiagnosticLines": [line for line in text.splitlines() if line.startswith("# Python 3.")],
              "exactCli01470": "actual=0.147.0  (exact-match)" in text,
              "rawJobMetadata": job_path.relative_to(ROOT).as_posix(),
              "rawJobLog": {"path": log_path.relative_to(ROOT).as_posix(), "bytes": len(raw), "sha256": hashlib.sha256(raw).hexdigest()},
              "smokeObject": smoke}
    return report

if __name__ == "__main__":
    jobs = {}
    for directory in sorted(ROOT.glob("matrix-jobs-*")):
        for path in directory.rglob("job.stdout"):
            report = parse_matrix(path)
            jobs[report["id"]] = report
    public = [{key: value for key, value in report.items() if key != "smokeObject"} for report in jobs.values()]
    for job in public:
        assert job["conclusion"] == "success" and job["runAttempt"] == 1
        assert job["testCounts"] == {"tests": 652, "pass": 651, "fail": 0, "cancelled": 0, "skipped": 1, "todo": 0}
        assert job["scenarioCount"] == 13 and job["scenarioCommandCount"] == 178 and job["commandStatuses"] == {"0": 178}
        assert {name: value["count"] for name, value in job["actualCheckerCommands"].items()} == {"validate_diagram.py": 6, "lek.py": 18, "render-site.mjs": 4, "check_artifact.py": 4}
        assert all(summary["checks"] == 96 and summary["failed"] == 0 for summary in job["siteStaticSummaries"])
        assert job["exactCli01470"]
    output = ROOT / ("partial-matrix-" + str(len(public)) + ".json")
    assert not output.exists()
    output.write_text(json.dumps(public, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"path": str(output), "jobs": [{key: job[key] for key in ["id", "name", "conclusion", "actualCheckout", "testCounts", "scenarioCount", "scenarioCommandCount", "commandStatuses", "learningPythonVersions"]} for job in public]}, ensure_ascii=False))
