"""Shared, dependency-free contracts for Learning Evidence Kit schema 1."""
from __future__ import annotations

import datetime as dt
import hashlib
import json
import os
import re
import tempfile
from pathlib import Path


class LekError(Exception):
    def __init__(self, code, message, status="error", gaps=None):
        super().__init__(message)
        self.code, self.message, self.status = code, message, status
        self.gaps = gaps or []


def now_utc():
    return dt.datetime.now(dt.timezone.utc).isoformat(timespec="microseconds").replace("+00:00", "Z")


def canonical_bytes(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"), allow_nan=False).encode("utf-8")


def digest(value):
    raw = value if isinstance(value, bytes) else value.encode("utf-8") if isinstance(value, str) else canonical_bytes(value)
    return hashlib.sha256(raw).hexdigest()


def _pairs(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise LekError("invalid_json", f"Duplicate JSON key: {key}")
        result[key] = value
    return result


def parse_json(text):
    try:
        return json.loads(text, object_pairs_hook=_pairs,
                          parse_constant=lambda value: (_ for _ in ()).throw(LekError("invalid_json", f"Invalid JSON number: {value}")))
    except (ValueError, UnicodeError, RecursionError) as error:
        raise LekError("invalid_json", str(error)) from error


def read_json(path):
    try:
        return parse_json(Path(path).read_text(encoding="utf-8"))
    except OSError as error:
        raise LekError("io_error", f"Cannot read {path}: {error}") from error


def is_link(path):
    return path.is_symlink() or (hasattr(os.path, "isjunction") and os.path.isjunction(path))


def assert_no_links(path):
    target = Path(path).absolute()
    for node in reversed([target, *target.parents]):
        if is_link(node):
            raise LekError("unsafe_path", f"Links/junctions are not permitted: {node}")
    return target


def atomic_bytes(path, content):
    path = assert_no_links(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temporary = tempfile.mkstemp(prefix=".lek-", dir=path.parent)
    try:
        with os.fdopen(fd, "wb") as stream:
            stream.write(content)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temporary, path)
        # Directory fsync makes the rename durable on POSIX. Windows flushes the file.
        if os.name != "nt":
            descriptor = os.open(path.parent, os.O_RDONLY)
            try:
                os.fsync(descriptor)
            finally:
                os.close(descriptor)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def atomic_json(path, data):
    atomic_bytes(path, canonical_bytes(data))


def safe_id(value, label="ID"):
    if not isinstance(value, str) or not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_.-]{0,127}", value):
        raise LekError("invalid_id", f"{label} must be a safe nonempty opaque identifier")
    return value


def _need(condition, message):
    if not condition:
        raise LekError("invalid_record", message)


def _object(value, fields, label):
    _need(isinstance(value, dict), f"{label} must be an object")
    for field in fields:
        _need(field in value, f"{label}.{field} is required")
    return value


def _string(value, label, nullable=False, nonempty=True):
    _need((nullable and value is None) or (isinstance(value, str) and (not nonempty or bool(value.strip()))),
          f"{label} must be {'string or null' if nullable else 'a nonempty string'}")


def _array(value, label):
    _need(isinstance(value, list), f"{label} must be an array")
    return value


def _timestamp(value, label):
    _string(value, label)
    _need(re.fullmatch(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|\+00:00)", value) is not None,
          f"{label} must be a complete RFC3339 UTC timestamp")
    try:
        parsed = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
        _need(parsed.tzinfo is not None and parsed.utcoffset() == dt.timedelta(0), f"{label} must be UTC")
        _need("T" in value and (value.endswith("Z") or value.endswith("+00:00")), f"{label} must be RFC3339 UTC")
    except ValueError as error:
        raise LekError("invalid_record", f"{label} is not a timestamp") from error


def validate_identity(identity):
    _object(identity, ("responsible_person_id", "respondent_id", "confirmation", "account_mappings"), "identity")
    for key in ("responsible_person_id", "respondent_id"):
        _string(identity[key], f"identity.{key}")
    _need(identity["responsible_person_id"] == identity["respondent_id"], "A different respondent cannot be relabeled as the responsible person's evidence")
    confirmation = _object(identity["confirmation"], ("kind", "reference", "statement", "confirmed_at"), "identity.confirmation")
    _need(confirmation["kind"] in ("self_confirmation", "confirmed_mapping", "synthetic"), "Unknown confirmation kind")
    _string(confirmation["reference"], "confirmation.reference")
    _string(confirmation["statement"], "confirmation.statement")
    _timestamp(confirmation["confirmed_at"], "confirmation.confirmed_at")
    mappings = _array(identity["account_mappings"], "identity.account_mappings")
    for mapping in mappings:
        _need(isinstance(mapping, dict), "Each account mapping must be an object")
        _need(all(isinstance(key, str) and isinstance(value, (str, type(None))) for key, value in mapping.items()), "Account mapping values must be strings or null")
    return identity


def validate_code_version(value, label="code_version"):
    _object(value, ("repository", "base", "head", "paths"), label)
    for key in ("repository", "base", "head"):
        _string(value[key], f"{label}.{key}", nullable=True)
    for entry in _array(value["paths"], f"{label}.paths"):
        _string(entry, f"{label}.paths entry")


def validate_pr(value):
    _object(value, ("repository", "number", "base", "head"), "PR")
    _string(value["repository"], "PR.repository")
    _need(type(value["number"]) is int and value["number"] > 0, "PR.number must be a positive integer")
    for key in ("base", "head"):
        _string(value[key], f"PR.{key}", nullable=True)
    return value


RECORD_FIELDS = ("schema_version", "record_id", "evidence_id", "kind", "record_version", "related_record_ids",
                 "occurred_at", "identity", "source_author", "operator", "task", "knowledge_units", "observations",
                 "requirement_baseline", "code_version", "quiz_status", "conclusions", "application", "provenance", "limitations")


def validate_record(record, allow_missing_ids=False):
    fields = [field for field in RECORD_FIELDS if not (allow_missing_ids and field in ("record_id", "evidence_id"))]
    _object(record, fields, "record")
    _need(type(record["schema_version"]) is int and record["schema_version"] == 1, "Unknown record schema version")
    for key in ("record_id", "evidence_id"):
        if allow_missing_ids and record.get(key) is None:
            continue
        safe_id(record[key], key)
    _need(record["kind"] in ("learning", "correction", "retest", "record_check", "application_check"), "Unknown record kind")
    _need(type(record["record_version"]) is int and record["record_version"] > 0, "record_version must be a positive integer")
    related = _array(record["related_record_ids"], "related_record_ids")
    for entry in related:
        safe_id(entry, "related_record_id")
    _need(len(related) == len(set(related)), "Duplicate related_record_ids")
    _need(record["kind"] == "learning" or bool(related), "Non-learning entries require preceding record IDs")
    _timestamp(record["occurred_at"], "occurred_at")
    validate_identity(record["identity"])
    author = _object(record["source_author"], ("id", "kind"), "source_author")
    _string(author["id"], "source_author.id")
    _need(author["kind"] in ("person", "agent", "synthetic"), "Unknown source author kind")
    operator = _object(record["operator"], ("account", "tool"), "operator")
    _string(operator["account"], "operator.account", nullable=True)
    _string(operator["tool"], "operator.tool")
    task_fields = ("repository", "issue", "intent_locator", "responsibility", "worktree_reference", "pull_requests")
    task = _object(record["task"], task_fields if allow_missing_ids else ("task_id", *task_fields), "task")
    if not (allow_missing_ids and task.get("task_id") is None):
        safe_id(task["task_id"], "task_id")
    for key in ("repository", "intent_locator", "responsibility", "worktree_reference"):
        _string(task[key], f"task.{key}", nullable=True)
    _need(task["issue"] is None or (type(task["issue"]) is int and task["issue"] > 0), "task.issue must be a positive integer or null")
    for pr in _array(task["pull_requests"], "task.pull_requests"):
        validate_pr(pr)
    units = _array(record["knowledge_units"], "knowledge_units")
    _need(1 <= len(units) <= 2, "One or two knowledge units are required")
    ku_ids = []
    for unit in units:
        _object(unit, ("id", "goal", "sources"), "KU")
        _string(unit["id"], "KU.id")
        _string(unit["goal"], "KU.goal")
        ku_ids.append(unit["id"])
        _need(bool(_array(unit["sources"], "KU.sources")), "KU needs a knowledge source")
        for source in unit["sources"]:
            _object(source, ("locator", "version", "content_or_excerpt", "authority", "limitations"), "knowledge source")
            for key in ("locator", "version", "content_or_excerpt", "authority"):
                _string(source[key], f"knowledge source.{key}", nullable=True)
            for limit in _array(source["limitations"], "knowledge source.limitations"):
                _string(limit, "knowledge source limitation")
            _need(not any(source[key] is None for key in ("locator", "version", "content_or_excerpt", "authority")) or bool(source["limitations"]), "Unknown knowledge-source facts require a limitation")
    _need(len(ku_ids) == len(set(ku_ids)), "Duplicate KU IDs")
    observations = _array(record["observations"], "observations")
    observation_ids, displayed = [], set()
    for observation in observations:
        _object(observation, ("id", "ku_id", "stage", "question", "respondent_id", "response", "answer_status", "support", "feedback", "observed_at"), "observation")
        _string(observation["id"], "observation.id")
        if "question_id" in observation:
            _string(observation["question_id"], "observation.question_id")
        observation_ids.append(observation["id"])
        _need(observation["ku_id"] in ku_ids, "Observation references an unknown KU")
        _need(observation["stage"] in ("initial", "supported", "retest", "application"), "Unknown observation stage")
        _string(observation["question"], "observation.question")
        _need(observation["respondent_id"] == record["identity"]["respondent_id"], "Observation attribution differs from confirmed respondent")
        _need(observation["answer_status"] in ("answered", "pending", "skipped", "stopped"), "Unknown answer status")
        if observation["answer_status"] == "answered":
            _string(observation["response"], "answered response")
        else:
            _need(observation["response"] is None, "Unanswered observations must have null response")
        _string(observation["feedback"], "observation.feedback", nullable=True, nonempty=False)
        _timestamp(observation["observed_at"], "observation.observed_at")
        for support in _array(observation["support"], "observation.support"):
            _object(support, ("kind", "provider", "content"), "support")
            for key in ("kind", "provider", "content"):
                _string(support[key], f"support.{key}")
        if observation["stage"] in ("initial", "supported", "retest"):
            displayed.add((observation["ku_id"], observation.get("question_id", observation["id"])))
    _need(len(observation_ids) == len(set(observation_ids)), "Duplicate observation IDs")
    _need(len(displayed) <= 5, "Diagnostic exceeds five displayed questions")
    _need(record["quiz_status"] in ("pending", "completed", "skipped", "stopped", "interrupted", "not_applicable"), "Unknown quiz_status")
    _need(record["quiz_status"] != "completed" or bool(observations), "Empty observations cannot manufacture quiz completion")
    _need(record["quiz_status"] != "completed" or not any(item["answer_status"] == "pending" for item in observations), "Pending answers cannot manufacture quiz completion")
    baseline = _object(record["requirement_baseline"], ("baseline_id", "origin", "captured_at", "content", "sha256", "requirements"), "requirement_baseline")
    _string(baseline["baseline_id"], "baseline_id")
    origin = _object(baseline["origin"], ("kind", "locator", "version"), "baseline.origin")
    _string(origin["kind"], "baseline.origin.kind")
    for key in ("locator", "version"):
        _string(origin[key], f"baseline.origin.{key}", nullable=True)
    _timestamp(baseline["captured_at"], "baseline.captured_at")
    _string(baseline["content"], "baseline.content")
    _need(baseline["sha256"] == digest(baseline["content"]), "Requirement baseline digest does not match recoverable content")
    requirements = _array(baseline["requirements"], "baseline.requirements")
    _need(bool(requirements), "Baseline needs concrete requirement items")
    requirement_ids = []
    for requirement in requirements:
        _object(requirement, ("id", "text", "ku_ids", "acceptance_refs"), "requirement")
        _string(requirement["id"], "requirement.id")
        _string(requirement["text"], "requirement.text")
        requirement_ids.append(requirement["id"])
        _need(all(entry in ku_ids for entry in _array(requirement["ku_ids"], "requirement.ku_ids")), "Requirement references an unknown KU")
        for entry in _array(requirement["acceptance_refs"], "requirement.acceptance_refs"):
            _string(entry, "acceptance reference")
    _need(len(requirement_ids) == len(set(requirement_ids)), "Duplicate requirement IDs")
    validate_code_version(record["code_version"])
    conclusions = _object(record["conclusions"], ("record_validity", "knowledge_application"), "conclusions")
    for name in ("record_validity", "knowledge_application"):
        conclusion = _object(conclusions[name], ("status", "rationale", "evidence_refs", "limitations"), name)
        _need(conclusion["status"] in ("supported", "partially_supported", "unsupported", "not_run"), f"Unknown {name} status")
        _string(conclusion["rationale"], f"{name}.rationale", nullable=True)
        for key in ("evidence_refs", "limitations"):
            for entry in _array(conclusion[key], f"{name}.{key}"):
                _string(entry, f"{name}.{key} entry")
    app = record["application"]
    if record["kind"] == "learning":
        _need(app is None and conclusions["knowledge_application"]["status"] == "not_run", "Learning alone cannot establish knowledge application")
    if app is not None:
        _object(app, ("scope", "explanation", "respondent_id", "expectations", "materials", "code_version", "affected_ku_ids"), "application")
        _need(isinstance(app["scope"], dict), "application.scope must be an object")
        _string(app["explanation"], "application.explanation", nullable=True)
        _need(app["respondent_id"] == record["identity"]["respondent_id"], "Application respondent differs from confirmed respondent")
        _need(isinstance(app["expectations"], (list, str, type(None))), "application.expectations must be string, array or null")
        materials = _array(app["materials"], "application.materials")
        for material in materials:
            _object(material, ("locator", "version", "observed_result", "content"), "application material")
            for key in ("locator", "version", "observed_result", "content"):
                _string(material[key], f"application material.{key}", nullable=True)
        validate_code_version(app["code_version"], "application.code_version")
        _need(all(entry in ku_ids for entry in _array(app["affected_ku_ids"], "application.affected_ku_ids")), "Application references an unknown KU")
        if conclusions["knowledge_application"]["status"] != "not_run":
            _need(bool(app["explanation"]) and bool(materials) and all(item["content"] and item["observed_result"] for item in materials), "Applied knowledge needs actual explanation and verification materials")
            _need(app["code_version"] == record["code_version"] and app["code_version"]["head"] is not None and app["code_version"]["repository"] is not None,
                  "Application evidence must bind the actual known repository/head and the record's code version")
            _need(app["scope"].get("task_id") == task.get("task_id") and app["scope"].get("repository") == app["code_version"]["repository"]
                  and app["scope"].get("head") == app["code_version"]["head"] and app["scope"].get("base") == app["code_version"]["base"],
                  "Application scope must match the task and actual repository/base/head version")
            if "number" in app["scope"]:
                _need(type(app["scope"]["number"]) is int and app["scope"]["number"] > 0, "Application PR number must be a positive integer")
    elif conclusions["knowledge_application"]["status"] != "not_run":
        _need(False, "Knowledge application conclusion requires application evidence")
    provenance = _object(record["provenance"], ("plugin", "plugin_version", "skill", "skill_version", "context_source", "synthetic"), "provenance")
    for key in ("plugin", "plugin_version", "skill", "skill_version", "context_source"):
        _string(provenance[key], f"provenance.{key}")
    _need(type(provenance["synthetic"]) is bool, "provenance.synthetic must be boolean")
    synthetic = record["identity"]["confirmation"]["kind"] == "synthetic"
    _need(synthetic == provenance["synthetic"], "Synthetic confirmation and provenance must agree")
    _need(author["kind"] != "synthetic" or synthetic, "Synthetic author cannot generate real-person evidence")
    if synthetic:
        _need(record["identity"]["responsible_person_id"].startswith("synthetic-"), "Synthetic case must use a synthetic identity")
    if len(units) == 2 and record["kind"] in ("learning", "retest"):
        continuation = provenance.get("second_ku_continuation")
        _need(isinstance(continuation, dict) and continuation.get("confirmed") is True and isinstance(continuation.get("reference"), str) and bool(continuation["reference"].strip()), "Second KU requires explicit continuation evidence")
    for limit in _array(record["limitations"], "limitations"):
        _string(limit, "limitation")
    unknown = any(task[key] is None for key in ("repository", "issue", "intent_locator", "responsibility", "worktree_reference")) or any(record["code_version"][key] is None for key in ("repository", "base", "head")) or operator["account"] is None or origin["locator"] is None or origin["version"] is None
    _need(not unknown or bool(record["limitations"]), "Unknown facts require an explicit limitation")
    return record


LOCAL_INPUT_FIELDS = {
    "confirm_identity": {"identity"},
    "save": {"record", "worktree"},
    "get": {"record_id"},
    "list": {"evidence_id", "task_id", "include_archived"},
    "check_record": {"record_id", "task_id", "responsible_person_id", "ku_ids", "code_version"},
    "associate": {"record_id", "task_id", "pr", "worktree"},
    "restore": {"record_ids", "worktree"},
    "recover": {"dry_run"},
    "export": {"record_ids", "destination"},
    "import": {"source"},
    "archive": {"record_ids", "reason"},
}


def validate_request(request):
    if not isinstance(request, dict) or type(request.get("schema_version")) is not int or request.get("schema_version") != 1:
        raise LekError("invalid_request", "Expected a schema_version 1 JSON request object")
    if not isinstance(request.get("operation"), str) or not isinstance(request.get("input"), dict):
        raise LekError("invalid_request", "operation string and input object are required")
    unknown_envelope = set(request) - {"schema_version", "operation", "request_id", "library_root", "input"}
    if unknown_envelope:
        raise LekError("unsupported_request_fields", "Unrecognized request envelope fields: " + ", ".join(sorted(unknown_envelope)))
    operation = request["operation"]
    if operation not in LOCAL_INPUT_FIELDS and operation not in ("publish", "collect"):
        raise LekError("unknown_operation", f"Unsupported operation: {operation}")
    if operation in LOCAL_INPUT_FIELDS:
        unknown_input = set(request["input"]) - LOCAL_INPUT_FIELDS[operation]
        if unknown_input:
            raise LekError("unsupported_input_fields", "Unrecognized operation input fields: " + ", ".join(sorted(unknown_input)))
    if "library_root" in request and (not isinstance(request["library_root"], str) or not os.path.isabs(request["library_root"])):
        raise LekError("unsafe_path", "library_root must be an absolute path")
    if request.get("request_id") is not None and (not isinstance(request["request_id"], str) or not request["request_id"].strip() or len(request["request_id"]) > 256):
        raise LekError("invalid_request", "request_id must be a nonempty string of at most 256 characters")
    return request


def receipt(request, status="ok", data=None, receipts=None, gaps=None, errors=None):
    return {"schema_version": 1, "operation": request.get("operation"), "request_id": request.get("request_id"),
            "status": status, "data": data or {}, "receipts": receipts or [], "gaps": gaps or [], "errors": errors or []}


def render_markdown(record):
    # The full authoritative entry is included, so the reading copy loses no fields.
    lines = [f"# Learning evidence — {record['record_id']}", "", f"Evidence: {record['evidence_id']}",
             f"Person: {record['identity']['responsible_person_id']}", f"Task: {record['task']['task_id']}",
             f"Kind: {record['kind']} · Quiz: {record['quiz_status']}", "", "## Authoritative record", "",
             "````json", json.dumps(record, ensure_ascii=False, indent=2, sort_keys=True, allow_nan=False), "````", ""]
    return "\n".join(lines)
