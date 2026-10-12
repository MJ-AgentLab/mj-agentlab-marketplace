"""Controlled gh process used by tests. Never contacts a network or reads tokens."""
import datetime as dt
import json
import os
from pathlib import Path
import re
import sys
from urllib.parse import parse_qs, urlparse

state_path = Path(os.environ["LEK_FAKE_GH_STATE"])
state = json.loads(state_path.read_text(encoding="utf-8"))
args = sys.argv[1:]
assert args[0] == "api" and "--method" in args
endpoint = args[1]
method = args[args.index("--method") + 1]
body = json.load(sys.stdin) if "--input" in args else None
if body is not None:
    assert args[args.index("--input") + 1] == "-"
state.setdefault("calls", []).append({"args": args, "method": method, "endpoint": endpoint, "body": body})
parsed = urlparse("https://fake.invalid/" + endpoint)
path, query = parsed.path.lstrip("/"), parse_qs(parsed.query)
post_count = sum(c["method"] == "POST" for c in state["calls"])
rule = None
for candidate in state.get("failures", []):
    if (candidate.get("remaining", 0) > 0 and candidate.get("method", "GET") == method
            and candidate.get("path", path) == path
            and candidate.get("query_contains", "") in endpoint
            and post_count >= candidate.get("after_post_count", 0)):
        candidate["remaining"] -= 1
        rule = candidate
        break


def persist():
    state_path.write_text(json.dumps(state, ensure_ascii=False), encoding="utf-8")


def fail(rule):
    persist()
    if rule.get("invalid_json"):
        sys.stdout.write("not JSON")
        raise SystemExit(0)
    sys.stderr.write(f"synthetic failure (HTTP {rule.get('http', 500)})")
    raise SystemExit(1)


if rule and not rule.get("after_write"):
    fail(rule)


def public_comment(comment):
    return {k: v for k, v in comment.items() if k not in {"repository", "number", "invisible"}}


match = re.fullmatch(r"repos/([^/]+/[^/]+)(?:/(.*))?", path)
if path == "user":
    result = {"login": "synthetic-operation-account", "id": 90}
elif not match:
    fail({"http": 404})
else:
    repository, rest = match.groups()
    repo = state.get("repos", {}).get(repository)
    if repo is None:
        fail({"http": 404})
    if rest is None:
        result = {"full_name": repository, "private": repo.get("private", True),
                  "visibility": "private" if repo.get("private", True) else "public"}
    elif rest.startswith("pulls/"):
        number = int(rest.split("/")[1])
        pull = repo.get("pulls", {}).get(str(number))
        if not pull:
            fail({"http": 404})
        result = {"number": number, "state": pull.get("state", "open"), "merged_at": pull.get("merged_at"),
                  "head": {"sha": pull.get("head", "head-v1")}, "base": {"sha": pull.get("base", "base-v1")}}
    elif re.fullmatch(r"issues/\d+", rest):
        number = rest.split("/")[1]
        result = {"number": int(number), "state": "open"}
        if number in repo.get("pulls", {}):
            result["pull_request"] = {"url": f"https://api.github.com/repos/{repository}/pulls/{number}"}
    elif re.fullmatch(r"issues/comments/\d+", rest):
        number = int(rest.rsplit("/", 1)[1])
        comment = next((c for c in state.get("comments", []) if c["id"] == number and c["repository"] == repository and not c.get("invisible")), None)
        if comment is None:
            fail({"http": 404})
        result = public_comment(comment)
    elif rest == "issues/comments" or re.fullmatch(r"issues/\d+/comments", rest):
        number = int(rest.split("/")[1]) if rest != "issues/comments" else None
        if method == "POST":
            assert number is not None and isinstance(body, dict) and set(body) == {"body"}
            next_id = max([999, *[c["id"] for c in state.get("comments", [])]]) + 1
            clock = state.get("clock") or dt.datetime.now(dt.timezone.utc).isoformat(timespec="microseconds").replace("+00:00", "Z")
            comment = {"repository": repository, "number": number, "id": next_id, "body": body["body"],
                       "issue_url": f"https://api.github.com/repos/{repository}/issues/{number}",
                       "url": f"https://api.github.com/repos/{repository}/issues/comments/{next_id}",
                       "html_url": f"https://github.com/{repository}/pull/{number}#issuecomment-{next_id}",
                       "user": {"login": "synthetic-operation-account", "id": 90}, "created_at": clock, "updated_at": clock}
            state.setdefault("comments", []).append(comment)
            result = public_comment(comment)
            if state.get("duplicate_after_post"):
                concurrent = {**comment, "id": next_id + 1,
                              "html_url": f"https://github.com/{repository}/pull/{number}#issuecomment-{next_id + 1}",
                              "user": {"login": "synthetic-concurrent-account", "id": 91}}
                state["comments"].append(concurrent)
        else:
            assert method == "GET"
            comments = [c for c in state.get("comments", []) if c["repository"] == repository and not c.get("invisible")
                        and (number is None or c["number"] == number)]
            if query.get("since"):
                threshold = dt.datetime.fromisoformat(query["since"][0].replace("Z", "+00:00"))
                comments = [c for c in comments if dt.datetime.fromisoformat(c["updated_at"].replace("Z", "+00:00")) > threshold]
            key = "updated_at" if query.get("sort") == ["updated"] else "created_at"
            comments.sort(key=lambda c: (c[key], c["id"]))
            page, per_page = int(query.get("page", [1])[0]), int(query.get("per_page", [30])[0])
            result = [public_comment(c) for c in comments[(page - 1) * per_page:page * per_page]]
            if state.get("duplicate_pages") and page > 1 and result:
                result = [public_comment(comments[(page - 1) * per_page - 1]), *result]
                if type(state["duplicate_pages"]) is int:
                    state["duplicate_pages"] -= 1
            # Mutate after freezing this page response, exactly at the offset-pagination race.
            if number is None and page == 1 and state.get("move_after_first_page") and not state.get("moved_page"):
                moving = next(c for c in state["comments"] if c["id"] == state["move_after_first_page"])
                moving["updated_at"] = "2030-01-01T00:00:00Z"
                moving["body"] = "ordinary conversation comment edited after page one"
                state["moved_page"] = True
            if number is None and page == 1 and state.get("churn_repo_pages"):
                state["churn_count"] = state.get("churn_count", 0) + 1
                moving = next(c for c in state["comments"] if c["id"] == state["churn_repo_pages"])
                moving["body"] = "ordinary conversation churn " + str(state["churn_count"])
                moving["updated_at"] = "2030-01-01T00:00:" + str(state["churn_count"]).zfill(2) + "Z"
    else:
        fail({"http": 404})

persist()
if rule:
    fail(rule)
sys.stdout.write(json.dumps(result, ensure_ascii=False))
