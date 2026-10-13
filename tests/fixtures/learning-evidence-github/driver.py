"""Exercise the actual flow and gh subprocess transport against a controlled executable."""
import json
import os
from pathlib import Path
import sys

assert sys.version_info[:2] == (3, 12), "Flow acceptance must actually use Python 3.12"

sys.path.insert(0, sys.argv[1])
from common import parse_json, receipt
from github_flow import GhClient, assemble_parts, dispatch, make_publication, parse_part

request = parse_json(sys.stdin.buffer.read().decode("utf-8"))
if isinstance(request, dict) and request.get("operation") == "test_plan":
    result = make_publication(request["input"]["record"], request["input"]["target"], request["input"].get("max_comment_chars", 60000))
elif isinstance(request, dict) and request.get("operation") == "test_assemble":
    from common import LekError
    try:
        result = assemble_parts([parse_part(body) for body in request["input"]["bodies"]])
    except LekError as error:
        result = {"status": error.status, "errors": [{"code": error.code, "message": error.message}]}
elif isinstance(request, dict) and request.get("operation") == "test_local":
    from common import LekError, validate_request
    from storage import dispatch as local_dispatch
    local_request = {**request, "operation": request["input"]["operation"], "input": request["input"]["input"]}
    try:
        validate_request(local_request)
        result = local_dispatch(local_request)
    except LekError as error:
        result = receipt(local_request, status=error.status, gaps=error.gaps,
                         errors=[{"code": error.code, "message": error.message}])
elif isinstance(request, dict) and request.get("operation") == "test_zip":
    import zipfile
    with zipfile.ZipFile(request["input"]["source"]) as archive:
        result = {"members": sorted(archive.namelist()),
                  "values": {name: json.loads(archive.read(name)) for name in archive.namelist() if name.endswith(".json")}}
else:
    fake = GhClient((sys.executable, str(Path(__file__).with_name("fake_gh.py"))))
    result = dispatch(request, client=fake)
sys.stdout.buffer.write(json.dumps(result, ensure_ascii=False).encode("utf-8") + b"\n")
raise SystemExit(1 if result.get("status") in {"blocked", "error"} else 0)
