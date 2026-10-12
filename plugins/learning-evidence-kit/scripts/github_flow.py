"""Manual, recoverable GitHub conversation-comment publication and collection.

Only the already authenticated gh executable is used. Remote bodies are data;
this module never evaluates them, mutates a PR, or makes management decisions.
"""
from __future__ import annotations

import base64
import binascii
from datetime import datetime, timedelta
import json
import math
import os
import re
import subprocess
import sys
from urllib.parse import urlencode, urlparse
import uuid

from common import (LekError, canonical_bytes, digest, now_utc, parse_json, receipt, safe_id,
                    render_markdown, validate_record, validate_request)
from storage import Library

MARKER = "<!-- learning-evidence-kit:v1 "
REPOSITORY = re.compile(r"[A-Za-z0-9][A-Za-z0-9_.-]*/[A-Za-z0-9][A-Za-z0-9_.-]*\Z")
HEX = re.compile(r"[a-f0-9]{64}\Z")
UTC_TIMESTAMP = re.compile(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|\+00:00)\Z")
DEFAULT_COMMENT_LIMIT = 60000  # Conservative budget, also bounded for Unicode bodies.
MAX_PARTS = 10000
PAGE_SIZE = 100
MAX_PAGES = 10000
MAX_STABLE_SCANS = 4
MAX_PAYLOAD_BYTES = 32 * 1024 * 1024


class GhError(LekError):
    """A gh error with no captured credentials or untrusted response body."""

    def __init__(self, code, message, *, unknown=False):
        super().__init__(code, message)
        self.unknown = unknown


class GhClient:
    """Argv/stdin transport; command injection exists only as a Python test seam."""

    def __init__(self, command=("gh",), *, env=None, timeout=30):
        if not command or any(not isinstance(v, str) or not v for v in command):
            raise LekError("GH_COMMAND_INVALID", "The gh command must be an argument array.")
        self.command = tuple(command)
        self.env = dict(os.environ if env is None else env)
        self.env["GH_PROMPT_DISABLED"] = "1"
        self.timeout = timeout

    def request(self, endpoint, *, method="GET", body=None):
        args = [*self.command, "api", endpoint, "--method", method,
                "--header", "Accept: application/vnd.github+json",
                "--header", "X-GitHub-Api-Version: 2022-11-28"]
        if body is not None:
            args += ["--input", "-"]
        try:
            result = subprocess.run(
                args, input=b"" if body is None else canonical_bytes(body),
                stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=False,
                timeout=self.timeout, env=self.env,
                creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0) if os.name == "nt" else 0,
            )
        except (OSError, subprocess.TimeoutExpired) as exc:
            raise GhError("GH_UNAVAILABLE", f"gh could not complete the {method} request ({type(exc).__name__}).",
                          unknown=method == "POST") from exc
        if result.returncode != 0:
            status = re.search(rb"\bHTTP\s+(\d{3})\b", result.stderr)
            http_status = int(status[1]) if status else None
            # A timeout/transport/server failure may have created the comment.
            unknown = method == "POST" and (http_status is None or http_status >= 500)
            suffix = f" (HTTP {http_status})" if http_status else ""
            raise GhError("GH_REQUEST_FAILED", f"gh returned exit {result.returncode}{suffix}.", unknown=unknown)
        try:
            if len(result.stdout) > 64 * 1024 * 1024:
                raise ValueError("response size")
            return json.loads(result.stdout.decode("utf-8"))
        except (UnicodeDecodeError, ValueError) as exc:
            raise GhError("GH_RESPONSE_INVALID", "gh returned an invalid or oversized JSON response.",
                          unknown=method == "POST") from exc

    def pages(self, endpoint, **params):
        for page in range(1, MAX_PAGES + 1):
            query = urlencode({**params, "per_page": PAGE_SIZE, "page": page})
            value = self.request(f"{endpoint}?{query}")
            if not isinstance(value, list) or any(not isinstance(v, dict) for v in value):
                raise GhError("GH_RESPONSE_INVALID", "A comment page must be a JSON array of objects.")
            yield value
            if len(value) < PAGE_SIZE:
                return
        raise GhError("PAGINATION_LIMIT", "The bounded pagination limit was reached; coverage is incomplete.")


def _repository(value):
    if not isinstance(value, str) or not REPOSITORY.fullmatch(value) or any(p in {".", ".."} for p in value.split("/")):
        raise LekError("TARGET_INVALID", "Repository must be an explicit owner/name without URL or path traversal.")
    return value.lower()


def _positive_int(value, name):
    if type(value) is not int or value < 1:
        raise LekError("INPUT_INVALID", f"{name} must be a positive integer.")
    return value


def _timestamp(value, name):
    if not isinstance(value, str) or not UTC_TIMESTAMP.fullmatch(value):
        raise LekError("INPUT_INVALID", f"{name} must be an RFC3339 UTC timestamp.")
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        if parsed.tzinfo is None or parsed.utcoffset() != timedelta(0):
            raise ValueError("timezone")
        return parsed
    except ValueError as exc:
        raise LekError("INPUT_INVALID", f"{name} must be a valid UTC timestamp.") from exc


def _authorization(inp, expected, *, optional=()):
    auth = inp.get("authorization")
    if (not isinstance(auth, dict) or auth.get("confirmed") is not True
            or not isinstance(auth.get("reference"), str) or not auth["reference"].strip()
            or not isinstance(auth.get("scope"), dict)):
        raise LekError("AUTHORIZATION_REQUIRED", "An explicit confirmed request and scope reference are required.", status="blocked")
    scope = auth["scope"]
    if set(scope) - set(expected) - set(optional):
        raise LekError("AUTHORIZATION_SCOPE_INVALID", "An unrecognized authorization scope cannot be silently ignored.", status="blocked")
    expected = {**expected, **{field: inp.get(field) for field in optional if field in scope}}
    for field, value in expected.items():
        actual = scope.get(field)
        if field == "repository" and isinstance(actual, str):
            actual = _repository(actual)
        if field == "repositories" and isinstance(actual, list):
            actual = sorted(_repository(v) for v in actual)
        if field in {"people", "task_ids"} and isinstance(actual, list):
            if any(not isinstance(v, str) or not v for v in actual):
                raise LekError("AUTHORIZATION_SCOPE_INVALID", "Authorized people and tasks must use explicit IDs.", status="blocked")
            actual = sorted(set(actual))
            value = sorted(set(value)) if isinstance(value, list) else value
        if field in {"occurred_since", "occurred_until"} and isinstance(actual, str) and isinstance(value, str):
            actual, value = _timestamp(actual, field), _timestamp(value, field)
        if type(actual) is not type(value) or actual != value:
            raise LekError("AUTHORIZATION_SCOPE_MISMATCH", f"Authorization does not cover {field}.", status="blocked")


def _visibility(client, repository):
    value = client.request(f"repos/{repository}")
    if not isinstance(value, dict) or type(value.get("private")) is not bool:
        raise GhError("GH_RESPONSE_INVALID", "Repository visibility could not be established.")
    if value.get("full_name", repository).lower() != repository.lower():
        raise LekError("TARGET_INVALID", "GitHub resolved a different repository.")
    return value.get("visibility") or ("private" if value["private"] else "public")


def _pull(client, repository, number):
    value = client.request(f"repos/{repository}/pulls/{number}")
    if not isinstance(value, dict) or value.get("number") != number or value.get("state") not in {"open", "closed"}:
        raise GhError("GH_RESPONSE_INVALID", "The target must resolve to an actual pull request.")
    try:
        base, head = value["base"]["sha"], value["head"]["sha"]
        if not isinstance(base, str) or not base or not isinstance(head, str) or not head:
            raise KeyError("sha")
    except (KeyError, TypeError) as exc:
        raise GhError("GH_RESPONSE_INVALID", "Pull-request version metadata is incomplete.") from exc
    return {"repository": repository, "number": number, "base": base, "head": head,
            "state": "merged" if value.get("merged_at") or value.get("merged") is True else value["state"]}


def _render_part(meta, encoded, reading):
    return (MARKER + canonical_bytes(meta).decode("utf-8") + " -->\n"
            f"Learning Evidence Kit · {meta['record_id']} · v{meta['record_version']} · {meta['part']}/{meta['total']}\n\n"
            + reading + f"\n<!-- lek-data:{meta['set_id']} -->\n```lek-base64\n"
            + encoded + f"\n```\n<!-- lek-end:{meta['set_id']} -->")


def make_publication(record, target, max_chars=DEFAULT_COMMENT_LIMIT):
    """Freeze exact JSON plus generated Markdown; every segment verifies independently."""
    validate_record(record)
    if type(max_chars) is not int or not 1024 <= max_chars <= DEFAULT_COMMENT_LIMIT:
        raise LekError("INPUT_INVALID", f"max_comment_chars must be between 1024 and {DEFAULT_COMMENT_LIMIT}.")
    markdown = render_markdown(record)
    payload = {"schema_version": 1, "record": record, "markdown": markdown,
               "target": {k: target[k] for k in ("repository", "number", "base", "head")}}
    raw = canonical_bytes(payload)
    if len(raw) > MAX_PAYLOAD_BYTES:
        raise LekError("PUBLICATION_TOO_LARGE", "The bounded complete publication payload limit was exceeded.")
    whole = digest(raw)
    set_id = "pub-" + whole
    encoded = base64.b64encode(raw).decode("ascii")
    initial = {"schema_version": 1, "record_id": record["record_id"], "evidence_id": record["evidence_id"],
               "record_version": record["record_version"], "record_sha256": digest(record),
               "repository": target["repository"], "number": target["number"],
               "set_id": set_id, "whole_sha256": whole}
    overhead = len(_render_part({**initial, "part": MAX_PARTS, "total": MAX_PARTS,
                                "part_sha256": "0" * 64}, "", "").encode("utf-8"))
    if overhead >= max_chars:
        raise LekError("PUBLICATION_TOO_LARGE", "The comment budget cannot fit a part envelope.")
    total = max(1, math.ceil((len(encoded) + len(markdown.encode("utf-8"))) / (max_chars - overhead)))
    while total <= MAX_PARTS:
        encoded_width = max(1, math.ceil(len(encoded) / total))
        reading_width = max(1, math.ceil(len(markdown) / total))
        parts = []
        for index in range(total):
            code = encoded[index * encoded_width:(index + 1) * encoded_width]
            reading = markdown[index * reading_width:(index + 1) * reading_width]
            meta = {**initial, "part": index + 1, "total": total,
                    "part_sha256": digest({"encoded": code, "reading": reading})}
            parts.append({"metadata": meta, "body": _render_part(meta, code, reading)})
        # UTF-8 bytes are checked too: a non-ASCII body stays below either common limit interpretation.
        if all(len(p["body"].encode("utf-8")) <= max_chars for p in parts):
            return {"schema_version": 1, "record_id": record["record_id"], "set_id": set_id,
                    "payload": payload, "parts": parts, "max_comment_chars": max_chars}
        total += max(1, total // 10)
    raise LekError("PUBLICATION_TOO_LARGE", "The complete record exceeds the bounded segmented-publication capacity.")


def parse_part(body):
    """Parse a formal envelope only; arbitrary Markdown never supplies instructions."""
    if not isinstance(body, str) or not body.startswith(MARKER):
        return None
    try:
        end = body.index(" -->\n", len(MARKER))
        meta = parse_json(body[len(MARKER):end])
        required = {"schema_version", "record_id", "evidence_id", "record_version", "record_sha256",
                    "repository", "number", "set_id", "whole_sha256", "part", "total", "part_sha256"}
        if not isinstance(meta, dict) or set(meta) != required or type(meta["schema_version"]) is not int or meta["schema_version"] != 1:
            raise ValueError("metadata shape")
        for key in ("whole_sha256", "part_sha256", "record_sha256"):
            if not isinstance(meta[key], str) or not HEX.fullmatch(meta[key]):
                raise ValueError("digest")
        if meta["set_id"] != "pub-" + meta["whole_sha256"]:
            raise ValueError("set identity")
        for key in ("record_id", "evidence_id"):
            safe_id(meta[key], key)
        _repository(meta["repository"])
        for key in ("number", "record_version", "part", "total"):
            _positive_int(meta[key], key)
        if not 1 <= meta["part"] <= meta["total"] <= MAX_PARTS:
            raise ValueError("part bounds")
        prefix = (MARKER + canonical_bytes(meta).decode("utf-8") + " -->\n"
                  f"Learning Evidence Kit · {meta['record_id']} · v{meta['record_version']} · {meta['part']}/{meta['total']}\n\n")
        delimiter = f"\n<!-- lek-data:{meta['set_id']} -->\n```lek-base64\n"
        suffix = f"\n```\n<!-- lek-end:{meta['set_id']} -->"
        if not body.startswith(prefix) or not body.endswith(suffix):
            raise ValueError("envelope")
        boundary = body.rindex(delimiter)
        reading = body[len(prefix):boundary]
        encoded = body[boundary + len(delimiter):-len(suffix)]
        if not re.fullmatch(r"[A-Za-z0-9+/=]*", encoded):
            raise ValueError("encoding")
        if digest({"encoded": encoded, "reading": reading}) != meta["part_sha256"]:
            raise ValueError("part digest")
        return {"metadata": meta, "encoded": encoded, "reading": reading, "body": body}
    except (ValueError, KeyError, TypeError, LekError) as exc:
        raise LekError("COMMENT_INVALID", "The formal evidence comment is malformed or its content digest differs.") from exc


def assemble_parts(parts):
    """Return complete exact payload, or a concrete missing/conflicting-part failure."""
    if not parts:
        raise LekError("PUBLICATION_INCOMPLETE", "No formal parts were supplied.")
    first = parts[0]["metadata"]
    by_number = {}
    invariant = {k: v for k, v in first.items() if k not in {"part", "part_sha256"}}
    for part in parts:
        meta = part["metadata"]
        if {k: v for k, v in meta.items() if k not in {"part", "part_sha256"}} != invariant:
            raise LekError("PUBLICATION_CONFLICT", "Publication parts disagree on identity, digest, version or total.")
        previous = by_number.get(meta["part"])
        if previous and previous["body"] != part["body"]:
            raise LekError("PUBLICATION_CONFLICT", "The same publication part has conflicting content.")
        by_number[meta["part"]] = part
    missing = [i for i in range(1, first["total"] + 1) if i not in by_number]
    if missing:
        raise LekError("PUBLICATION_INCOMPLETE", f"Missing publication parts: {missing}.")
    try:
        encoded = "".join(by_number[i]["encoded"] for i in sorted(by_number))
        if len(encoded) > math.ceil(MAX_PAYLOAD_BYTES / 3) * 4:
            raise ValueError("payload size")
        raw = base64.b64decode(encoded, validate=True)
        if digest(raw) != first["whole_sha256"]:
            raise ValueError("whole digest")
        payload = parse_json(raw.decode("utf-8"))
        if (not isinstance(payload, dict) or set(payload) != {"schema_version", "record", "markdown", "target"}
                or type(payload["schema_version"]) is not int or payload["schema_version"] != 1):
            raise ValueError("payload shape")
        record = payload["record"]
        validate_record(record)
        if (digest(record) != first["record_sha256"] or record["record_id"] != first["record_id"]
                or record["evidence_id"] != first["evidence_id"] or record["record_version"] != first["record_version"]):
            raise ValueError("record identity")
        if payload["markdown"] != render_markdown(record) or payload["markdown"] != "".join(by_number[i]["reading"] for i in sorted(by_number)):
            raise ValueError("reading text")
        target = payload["target"]
        if (not isinstance(target, dict) or set(target) != {"repository", "number", "base", "head"}
                or target["repository"] != first["repository"] or target["number"] != first["number"]
                or any(not isinstance(target[k], str) or not target[k] for k in ("base", "head"))):
            raise ValueError("target")
        return payload
    except (ValueError, TypeError, KeyError, binascii.Error) as exc:
        raise LekError("COMMENT_INVALID", "The complete publication cannot be reconstructed and verified.") from exc


def _stable_scan(client, endpoint, *, on_page=None, **params):
    """Offset pages need consecutive stable inventories before claiming coverage."""
    preceding = None
    for attempt in range(1, MAX_STABLE_SCANS + 1):
        boundaries, identities, rows = [], {}, []
        drift = False
        for page in client.pages(endpoint, **params):
            if on_page is not None:
                on_page(page)
            else:
                rows.extend(page)
            boundary = []
            for comment in page:
                key = digest(comment.get("id"))
                token = [comment.get("id"), comment.get("updated_at"), digest(comment.get("body"))]
                if key in identities:
                    drift = True
                identities[key] = token
                boundary.append(token)
            boundaries.append(boundary)
        signature = digest(boundaries)
        if not drift and signature == preceding:
            return {"passes": attempt, "pages": len(boundaries), "signature": signature,
                    "ids": {v[0] for v in identities.values() if type(v[0]) is int}, "rows": rows}
        preceding = None if drift else signature
    raise GhError("PAGINATION_UNSTABLE", "Comment pages did not reach two consecutive stable inventories within the bounded scan window.")


def _all_pr_comments(client, repository, number):
    return _stable_scan(client, f"repos/{repository}/issues/{number}/comments")["rows"]


def _validate_plan(plan, record, repository, number):
    """Restored flow metadata must not substitute a different record or target."""
    try:
        if (not isinstance(plan, dict) or set(plan) != {"schema_version", "record_id", "set_id", "payload", "parts", "max_comment_chars"}
                or type(plan["schema_version"]) is not int or plan["schema_version"] != 1
                or plan["record_id"] != record["record_id"]
                or type(plan["max_comment_chars"]) is not int or not 1024 <= plan["max_comment_chars"] <= DEFAULT_COMMENT_LIMIT
                or not isinstance(plan["parts"], list) or not 1 <= len(plan["parts"]) <= MAX_PARTS):
            raise ValueError("plan shape")
        parsed = []
        for part in plan["parts"]:
            if not isinstance(part, dict) or set(part) != {"metadata", "body"}:
                raise ValueError("part shape")
            recovered = parse_part(part["body"])
            if recovered is None or recovered["metadata"] != part["metadata"] or len(part["body"].encode("utf-8")) > plan["max_comment_chars"]:
                raise ValueError("part identity")
            parsed.append(recovered)
        payload = assemble_parts(parsed)
        if (payload != plan["payload"] or payload["record"] != record or plan["set_id"] != parsed[0]["metadata"]["set_id"]
                or payload["target"]["repository"] != repository or payload["target"]["number"] != number):
            raise ValueError("frozen target")
    except (ValueError, TypeError, KeyError, LekError) as exc:
        raise LekError("PUBLICATION_CONFLICT", "The frozen publication cannot be verified against this record and authorized target.") from exc


def _matching_comments(comments, plan):
    found = {}
    expected = {p["metadata"]["part"]: p for p in plan["parts"]}
    for comment in comments:
        body = comment.get("body")
        if not isinstance(body, str) or not body.startswith(MARKER):
            continue
        # Even corrupt bodies that claim this set must block a duplicate write.
        try:
            meta = json.loads(body[len(MARKER):body.index(" -->\n", len(MARKER))])
        except (ValueError, TypeError):
            if plan["set_id"] in body[:2048]:
                raise LekError("PUBLICATION_CONFLICT", "An existing comment claims this set but is malformed.")
            continue
        if not isinstance(meta, dict) or meta.get("set_id") != plan["set_id"]:
            continue
        part = parse_part(body)
        number = part["metadata"]["part"]
        if number not in expected or body != expected[number]["body"]:
            raise LekError("PUBLICATION_CONFLICT", "Existing same-set content differs from the frozen publication.")
        _positive_int(comment.get("id"), "comment ID")
        if number in found and found[number]["id"] != comment["id"]:
            raise LekError("PUBLICATION_CONFLICT", "The publication already has duplicated remote parts; no new write was made.")
        found[number] = comment
    return found


def _binding(library, operation, request):
    key = "req-" + digest(request["request_id"])
    fingerprint = digest({"operation": operation, "input": request["input"]})
    current = library.read(operation + "s", "requests", key + ".json", default=None)
    if current and current.get("input_sha256") != fingerprint:
        raise LekError("REQUEST_CONFLICT", "The request ID was already used with different input.")
    library.bind_request(request, {"record_id": request["input"]["record_id"]} if operation == "publication" else None)
    return key, fingerprint, current


def _publish(request, library, client):
    inp = request["input"]
    record_id = inp.get("record_id")
    if not isinstance(record_id, str) or not record_id:
        raise LekError("INPUT_INVALID", "record_id is required.")
    pr = inp.get("pr")
    if not isinstance(pr, dict) or set(pr) != {"repository", "number"}:
        raise LekError("TARGET_INVALID", "An explicit PR object is required.")
    repository = _repository(pr.get("repository"))
    number = _positive_int(pr.get("number"), "PR number")
    _authorization(inp, {"operation": "publish", "record_id": record_id, "repository": repository, "number": number})
    record = library.get_record(record_id)
    validate_record(record)
    key, fingerprint, binding = _binding(library, "publication", request)
    visibility = _visibility(client, repository)
    target = _pull(client, repository, number)
    if binding:
        plan = library.read("publications", "plans", binding["set_id"] + ".json")
        if not plan or plan["payload"]["record"] != record:
            raise LekError("PUBLICATION_CONFLICT", "The frozen publication or authoritative record differs.")
    else:
        plan = make_publication(record, target, inp.get("max_comment_chars", DEFAULT_COMMENT_LIMIT))
        existing = library.read("publications", "plans", plan["set_id"] + ".json", default=None)
        # A different chunk limit must not create a second layout for the same immutable set.
        if existing:
            plan = existing
        else:
            library.write("publications", "plans", plan["set_id"] + ".json", value=plan)
        binding = {"schema_version": 1, "record_id": record_id, "input_sha256": fingerprint,
                   "set_id": plan["set_id"], "result": None}
        library.write("publications", "requests", key + ".json", value=binding)
    _validate_plan(plan, record, repository, number)
    actual = []
    found = {}
    errors = []
    account = None
    reconciled = False
    conflicting = False
    last_comments = []

    def reconcile():
        nonlocal last_comments
        last_comments = _all_pr_comments(client, repository, number)
        return _matching_comments(last_comments, plan)

    try:
        found = reconcile()
        if len(found) == len(plan["parts"]) and (binding.get("result") or {}).get("status") == "ok":
            return binding["result"]
        account = client.request("user")
        if not isinstance(account, dict) or not isinstance(account.get("login"), str) or not account["login"]:
            raise GhError("GH_RESPONSE_INVALID", "The actual publication account could not be established.")
        for part in plan["parts"]:
            part_number = part["metadata"]["part"]
            if part_number in found:
                continue
            # Reconcile all pages before each possible mutation, including another-process races.
            found = reconcile()
            if part_number in found:
                continue
            attempt = {"part": part_number, "at": now_utc(), "result": "pending"}
            actual.append(attempt)
            try:
                posted = client.request(f"repos/{repository}/issues/{number}/comments", method="POST", body={"body": part["body"]})
                attempt.update({"result": "reported_success", "post_result": posted})
            except GhError as exc:
                attempt.update({"result": "unknown" if exc.unknown else "rejected", "error": exc.code})
                errors.append({"code": "REMOTE_OUTCOME_UNKNOWN" if exc.unknown else exc.code, "message": exc.message})
                # POST response absence is never a reason for an immediate duplicate POST.
                found = reconcile()
                if part_number not in found:
                    break
        found = reconcile()
        reconciled = True
    except GhError as exc:
        errors.append({"code": exc.code, "message": exc.message})
    except LekError as exc:
        conflicting = True
        errors.append({"code": exc.code, "message": exc.message})
    missing = [p["metadata"]["part"] for p in plan["parts"] if p["metadata"]["part"] not in found]
    complete = not missing and reconciled and not conflicting
    state = "error" if conflicting else "ok" if complete else "partial"
    if complete:
        assemble_parts([parse_part(found[i]["body"]) for i in sorted(found)])
    flow = {"schema_version": 1, "operation": "publish", "request_id": request["request_id"], "at": now_utc(),
            "target": plan["payload"]["target"], "visibility": visibility, "set_id": plan["set_id"],
            "record_id": record_id, "evidence_id": record["evidence_id"], "record_version": record["record_version"],
            "record_sha256": digest(record), "whole_sha256": plan["parts"][0]["metadata"]["whole_sha256"],
            "status": state, "missing_parts": missing, "posts": actual,
            "errors": errors,
            "publication_account": account["login"] if account else None,
            "comments": ([c for c in last_comments if isinstance(c.get("body"), str)
                          and c["body"].startswith(MARKER) and plan["set_id"] in c["body"][:2048]]
                         if conflicting else [found[i] for i in sorted(found)])}
    library.append_event("publications", "event-" + uuid.uuid4().hex, flow)
    result = receipt(request, status=state,
                     data={"set_id": plan["set_id"], "record_id": record_id, "evidence_id": record["evidence_id"],
                           "target": plan["payload"]["target"], "visibility": visibility,
                           "complete": complete, "missing_parts": missing, "comments": flow["comments"]},
                     receipts=[flow], gaps=([{"code": "MISSING_PARTS", "parts": missing}] if missing else
                                          [{"code": "RECONCILIATION_INCOMPLETE"}] if not reconciled else []), errors=errors)
    binding["result"] = result
    library.write("publications", "requests", key + ".json", value=binding)
    return result


def _issue_number(comment, repository):
    issue_url = comment.get("issue_url")
    if not isinstance(issue_url, str):
        raise LekError("SOURCE_INVALID", "A source comment lacks its Issue reference.")
    match = re.fullmatch(r"/repos/([^/]+/[^/]+)/issues/(\d+)", urlparse(issue_url).path)
    if not match or match[1].lower() != repository.lower():
        raise LekError("SOURCE_INVALID", "A source comment belongs to a different or invalid Issue reference.")
    return _positive_int(int(match[2]), "source Issue number")


def _collect(request, library, client):
    inp = request["input"]
    repositories = inp.get("repositories")
    if not isinstance(repositories, list) or not repositories:
        raise LekError("INPUT_INVALID", "A nonempty explicit repository scope is required.")
    repositories = sorted(set(_repository(v) for v in repositories))
    _authorization(inp, {"operation": "collect", "repositories": repositories},
                   optional=("people", "task_ids", "occurred_since", "occurred_until"))
    filters = {k: inp.get(k) for k in ("people", "task_ids", "occurred_since", "occurred_until")}
    for field in ("people", "task_ids"):
        if filters[field] is not None and (not isinstance(filters[field], list) or any(not isinstance(v, str) or not v for v in filters[field])):
            raise LekError("INPUT_INVALID", f"{field} must be an array of explicit IDs.")
        if filters[field] is not None:
            filters[field] = sorted(set(filters[field]))
    for field in ("occurred_since", "occurred_until"):
        if filters[field] is not None:
            _timestamp(filters[field], field)
    if (filters["occurred_since"] and filters["occurred_until"]
            and _timestamp(filters["occurred_since"], "occurred_since") > _timestamp(filters["occurred_until"], "occurred_until")):
        raise LekError("INPUT_INVALID", "The occurrence-time range is reversed.")
    key, fingerprint, binding = _binding(library, "collection", request)
    if binding and (binding.get("result") or {}).get("status") == "ok":
        return binding["result"]
    scope_id = "scope-" + digest({"repositories": repositories, "filters": filters})
    previous = library.read("collections", "scopes", scope_id + ".json", default={"completed_cursor": None, "known": {}})
    cursor = previous["completed_cursor"]
    since = (_timestamp(cursor, "stored cursor") - timedelta(minutes=5)).isoformat(timespec="seconds").replace("+00:00", "Z") if cursor else None
    started = now_utc()
    known = dict(previous.get("known", {}))
    record_digests = dict(previous.get("record_digests", {}))
    acquired, gaps, coverage = [], [], []
    pr_cache = {}
    filtered = any(value is not None for value in filters.values())
    candidates, groups = {}, {}

    def in_scope(record):
        if filters["people"] is not None and record["identity"]["responsible_person_id"] not in filters["people"]:
            return False
        if filters["task_ids"] is not None and record["task"]["task_id"] not in filters["task_ids"]:
            return False
        occurred = _timestamp(record["occurred_at"], "record occurred_at")
        return not ((filters["occurred_since"] and occurred < _timestamp(filters["occurred_since"], "occurred_since"))
                    or (filters["occurred_until"] and occurred > _timestamp(filters["occurred_until"], "occurred_until")))

    def persist(candidate):
        snapshot = candidate["snapshot"]
        snapshot_id = snapshot["snapshot_id"]
        if library.read("collections", "snapshots", snapshot_id + ".json", default=None) is None:
            library.append_event("collections/snapshots", snapshot_id, snapshot)
            acquired.append(snapshot_id)
        source_key = candidate["source_key"]
        old = library.read("collections", "snapshots", known[source_key] + ".json") if source_key in known else None
        try:
            if old and _timestamp(old["comment"]["updated_at"], "stored update") > _timestamp(snapshot["comment"]["updated_at"], "source update"):
                return
        except LekError:
            pass
        known[source_key] = snapshot_id

    def admit_group(sources):
        try:
            payload = assemble_parts([v["part"] for v in sources.values()])
        except LekError:
            return None
        selected = in_scope(payload["record"])
        for candidate in sources.values():
            candidate["selected"] = selected
        if not selected:
            return None
        for candidate in sources.values():
            persist(candidate)
        return payload

    def account_for(comment, repository):
        comment_id = _positive_int(comment.get("id"), "comment ID")
        source_key = f"{repository}/{comment_id}"
        body = comment.get("body")
        if not isinstance(body, str):
            raise LekError("SOURCE_INVALID", "A source comment has no recoverable body.")
        if not body.startswith(MARKER) and source_key not in known:
            return
        updated = comment.get("updated_at")
        snapshot_id = "snap-" + digest({"repository": repository, "id": comment_id, "updated_at": updated, "body_sha256": digest(body)})
        if snapshot_id in candidates:
            return  # Stable rescans do not create duplicate observations or retry failed metadata.
        candidate = {"source_key": source_key, "snapshot": {"schema_version": 1, "snapshot_id": snapshot_id,
                     "repository": repository, "record_ids": [], "comment": comment,
                     "body_sha256": digest(body), "collected_at": now_utc()},
                     "part": None, "target": None, "failures": [], "ignored": False, "selected": None}
        candidates[snapshot_id] = candidate
        try:
            _timestamp(updated, "comment updated_at")
            _timestamp(comment.get("created_at"), "comment created_at")
        except LekError as exc:
            candidate["failures"].append({"code": "SOURCE_INVALID", "message": exc.message})
        try:
            number = _issue_number(comment, repository)
            cache_key = (repository, number)
            if cache_key not in pr_cache:
                issue = client.request(f"repos/{repository}/issues/{number}")
                if not isinstance(issue, dict):
                    raise GhError("GH_RESPONSE_INVALID", "Issue metadata is invalid.")
                pr_cache[cache_key] = _pull(client, repository, number) if isinstance(issue.get("pull_request"), dict) else None
            target = pr_cache[cache_key]
            if target is None:
                candidate["ignored"] = True
                return  # Actual Issues are not the PR conversation sharing surface.
            candidate["target"] = target
            part = parse_part(body)
            if part is None:
                raise LekError("SOURCE_NOT_EVIDENCE", "The previously collected source no longer contains a formal evidence part.")
            if part["metadata"]["repository"].lower() != repository or part["metadata"]["number"] != number:
                raise LekError("SOURCE_INVALID", "The evidence marker does not match the actual repository and PR.")
            candidate["part"] = part
            candidate["snapshot"]["record_ids"] = [part["metadata"]["record_id"]]
            group_key = (repository, number, part["metadata"]["set_id"])
            sources = groups.setdefault(group_key, {})
            sources[snapshot_id] = candidate
            # Persist only after a complete authoritative record determines person/task/time scope.
            # This also makes already-confirmed in-scope groups durable before a later page fails.
            admit_group(sources)
        except LekError as exc:
            candidate["failures"].append({"code": "SOURCE_UNAVAILABLE" if isinstance(exc, GhError) else "SOURCE_INVALID" if exc.code == "INPUT_INVALID" else exc.code,
                                          "message": exc.message})
        if not filtered and not candidate["ignored"]:
            # The explicit whole-repository scope permits necessary failure/partial raw snapshots.
            persist(candidate)

    for repository in repositories:
        pages = 0
        def visit(page):
            nonlocal pages
            pages += 1
            for comment in page:
                try:
                    account_for(comment, repository)
                except LekError as exc:
                    gaps.append({"code": exc.code, "repository": repository, "message": exc.message})
        try:
            visibility = _visibility(client, repository)
            params = {"sort": "updated", "direction": "asc"}
            if since:
                params["since"] = since
            scan = _stable_scan(client, f"repos/{repository}/issues/comments", on_page=visit, **params)
            seen = {f"{repository}/{comment_id}" for comment_id in scan["ids"]}
            # Absence in an incremental page is never interpreted as deletion. Explicitly reread
            # known sources outside this window, and retain inaccessible versions with a gap.
            for source_key in [k for k in known if k.startswith(repository + "/") and k not in seen]:
                comment_id = int(source_key.rsplit("/", 1)[1])
                try:
                    account_for(client.request(f"repos/{repository}/issues/comments/{comment_id}"), repository)
                except LekError as exc:
                    gaps.append({"code": "SOURCE_UNAVAILABLE", "repository": repository, "comment_id": comment_id,
                                 "message": "Previously observed source could not be reread; deletion is not established."})
            coverage.append({"repository": repository, "visibility": visibility, "pages": pages, "passes": scan["passes"],
                             "inventory_sha256": scan["signature"], "fetched": True, "since": since})
        except GhError as exc:
            gaps.append({"code": "PAGINATION_UNSTABLE" if exc.code == "PAGINATION_UNSTABLE" else "COVERAGE_INCOMPLETE",
                         "repository": repository, "message": exc.message})
            coverage.append({"repository": repository, "pages": pages, "fetched": False, "since": since})

    for candidate in candidates.values():
        if candidate["ignored"] or candidate["selected"] is False:
            continue
        snapshot = candidate["snapshot"]
        persisted = library.read("collections", "snapshots", snapshot["snapshot_id"] + ".json", default=None) is not None
        for failure in candidate["failures"]:
            gaps.append({**failure, "repository": snapshot["repository"], "comment_id": snapshot["comment"]["id"],
                         **({"snapshot_id": snapshot["snapshot_id"]} if persisted else {})})
        if filtered and candidate["part"] is None:
            gaps.append({"code": "SCOPE_UNDETERMINED", "repository": snapshot["repository"], "comment_id": snapshot["comment"]["id"],
                         "message": "The source scope cannot be verified; its body was not persisted."})
    entries = []
    for (repository, number, set_id), sources in sorted(groups.items()):
        try:
            payload = assemble_parts([v["part"] for v in sources.values()])
        except LekError as exc:
            gaps.append({"code": exc.code, "repository": repository, "number": number, "set_id": set_id, "message": exc.message})
            if filtered:
                gaps.append({"code": "SCOPE_UNDETERMINED", "repository": repository, "number": number, "set_id": set_id,
                             "message": "An incomplete or invalid set does not establish the requested scope; its body was not persisted."})
            continue
        record = payload["record"]
        if not in_scope(record):
            continue
        record_sha256 = digest(record)
        if record["record_id"] in record_digests and record_digests[record["record_id"]] != record_sha256:
            gaps.append({"code": "RECORD_ID_CONFLICT", "repository": repository, "number": number,
                         "record_id": record["record_id"], "set_id": set_id,
                         "message": "The same immutable record ID has different content; both source versions were retained."})
            continue
        record_digests[record["record_id"]] = record_sha256
        entry = {"schema_version": 1, "record_ids": [record["record_id"]], "set_id": set_id, "payload": payload, "repository": repository, "number": number,
                 "pr_state": next(iter(sources.values()))["target"]["state"], "snapshot_ids": sorted(sources)}
        assembled_id = "assembled-" + digest(entry)
        library.append_event("collections/assembled", assembled_id, entry)
        entries.append({**entry, "assembled_id": assembled_id})
    complete = not gaps
    progress = {"schema_version": 1, "scope_id": scope_id, "repositories": repositories, "filters": filters,
                "record_ids": sorted({v["payload"]["record"]["record_id"] for v in entries}),
                "completed_cursor": started if complete else cursor, "known": known,
                "record_digests": record_digests, "last_attempt_at": started}
    library.write("collections", "scopes", scope_id + ".json", value=progress)
    summary = {"learning_evidence_ids": sorted({v["payload"]["record"]["evidence_id"] for v in entries}),
               "record_ids": sorted({v["payload"]["record"]["record_id"] for v in entries}),
               "publication_sets": len(entries), "record_kinds": {}}
    for entry in entries:
        kind = entry["payload"]["record"]["kind"]
        summary["record_kinds"].setdefault(kind, set()).add(entry["payload"]["record"]["record_id"])
    summary["record_kinds"] = {k: len(v) for k, v in summary["record_kinds"].items()}
    # A selected-record export gets complete source dependencies for that record,
    # without silently exporting unrelated people's bodies from the bulk scope.
    for record_id in summary["record_ids"]:
        related = [v for v in entries if v["payload"]["record"]["record_id"] == record_id]
        library.append_event("collections", "record-event-" + uuid.uuid4().hex,
            {"schema_version": 1, "record_ids": [record_id], "operation": "collect", "request_id": request["request_id"],
             "at": started, "scope_id": scope_id, "status": "ok" if complete else "partial",
             "scope": {"repositories": repositories, "filters": filters},
             "snapshot_ids": sorted({sid for v in related for sid in v["snapshot_ids"]}),
             "assembled_ids": [v["assembled_id"] for v in related],
             "preceding_cursor": cursor, "completed_cursor": progress["completed_cursor"], "gaps": gaps})
    flow = {"schema_version": 1, "record_ids": progress["record_ids"], "operation": "collect", "request_id": request["request_id"], "at": started, "scope_id": scope_id,
            "status": "ok" if complete else "partial", "preceding_cursor": cursor,
            "completed_cursor": progress["completed_cursor"], "coverage": coverage, "snapshot_ids": acquired,
            "assembled_ids": [v["assembled_id"] for v in entries], "gaps": gaps}
    library.append_event("collections", "event-" + uuid.uuid4().hex, flow)
    result = receipt(request, status=flow["status"], data={"scope_id": scope_id, "entries": entries, "summary": summary,
                     "coverage": coverage, "new_snapshot_ids": acquired, "completed_cursor": progress["completed_cursor"]},
                     receipts=[flow], gaps=gaps)
    library.write("collections", "requests", key + ".json", value={"schema_version": 1,
                  "record_ids": progress["record_ids"], "input_sha256": fingerprint, "result": result})
    return result


def dispatch(request, *, client=None):
    """Shared JSON operation entry; dependency injection cannot be supplied by JSON."""
    try:
        validate_request(request)
        if request.get("operation") not in {"publish", "collect"}:
            raise LekError("OPERATION_UNSUPPORTED", "This module implements only publish and collect.")
        if not isinstance(request.get("request_id"), str) or not request["request_id"]:
            raise LekError("REQUEST_ID_REQUIRED", "A mutation request_id is required.")
        allowed = ({"record_id", "pr", "authorization", "max_comment_chars"} if request["operation"] == "publish" else
                   {"repositories", "authorization", "people", "task_ids", "occurred_since", "occurred_until"})
        if set(request["input"]) - allowed:
            raise LekError("INPUT_UNSUPPORTED", "Unrecognized operation input fields cannot silently change the requested scope.")
        library = Library(request.get("library_root"))
        with library.locked():
            return (_publish if request["operation"] == "publish" else _collect)(request, library, client or GhClient())
    except LekError as exc:
        return receipt(request if isinstance(request, dict) else {}, status=exc.status, gaps=exc.gaps,
                       errors=[{"code": exc.code, "message": exc.message}])
    except OSError as exc:
        return receipt(request, status="error", errors=[{"code": "LOCAL_IO_FAILED", "message": f"Local flow persistence failed ({type(exc).__name__})."}])
    except (ValueError, TypeError, KeyError, UnicodeError, RecursionError) as exc:
        return receipt(request if isinstance(request, dict) else {}, status="error",
                       errors=[{"code": "FLOW_DATA_INVALID", "message": f"Flow data could not be validated ({type(exc).__name__})."}])


if __name__ == "__main__":
    request = {}
    try:
        if sys.version_info[:2] != (3, 12):
            raise LekError("interpreter_version", "Learning Evidence Kit requires an actual Python 3.12 interpreter.")
        raw = sys.stdin.buffer.read(MAX_PAYLOAD_BYTES + 1)
        if len(raw) > MAX_PAYLOAD_BYTES:
            raise LekError("request_too_large", "The JSON request exceeds 32 MiB.")
        request = parse_json(raw.decode("utf-8"))
        result = dispatch(request)
    except LekError as exc:
        result = receipt(request if isinstance(request, dict) else {}, status=exc.status,
                         gaps=exc.gaps, errors=[{"code": exc.code, "message": exc.message}])
    except UnicodeError:
        result = receipt({}, status="error", errors=[{"code": "invalid_json", "message": "The request must contain UTF-8 JSON."}])
    sys.stdout.buffer.write(json.dumps(result, ensure_ascii=False, allow_nan=False).encode("utf-8") + b"\n")
    raise SystemExit(1 if result["status"] in {"blocked", "error"} else 0)
