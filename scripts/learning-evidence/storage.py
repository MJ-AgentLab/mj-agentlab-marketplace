"""Immutable local records, reference-only worktrees, and recoverable transactions."""
from __future__ import annotations

import base64
import copy
import io
import os
import subprocess
import time
import uuid
import zipfile
from contextlib import contextmanager
from pathlib import Path, PurePosixPath

from common import (LekError, assert_no_links, atomic_bytes, atomic_json, canonical_bytes,
                    digest, now_utc, parse_json, read_json, receipt, render_markdown,
                    safe_id, validate_identity, validate_pr, validate_record)


BUCKETS = ("records", "identities", "tasks", "associations", "archives", "receipts", "publications", "collections", "markdown", "transactions")
EXPORT_BUCKETS = set(BUCKETS) - {"transactions", "markdown"}
MAX_MEMBER = 32 * 1024 * 1024
MAX_EXPORT = 128 * 1024 * 1024
MAX_MEMBERS = 10000


def flow_dependencies(event):
    result = []
    for field, bucket in (("snapshot_ids", "collections/snapshots"), ("new_snapshot_ids", "collections/snapshots"),
                          ("assembled_ids", "collections/assembled")):
        values = event.get(field, [])
        if not isinstance(values, list):
            raise LekError("corruption", f"Malformed flow dependency: {field}")
        for key in values:
            result.append(bucket + "/" + safe_id(key, field) + ".json")
    if event.get("operation") == "publish" and event.get("set_id"):
        result.append("publications/plans/" + safe_id(event["set_id"], "publication set_id") + ".json")
    return result


def default_root():
    if os.name == "nt":
        base = os.environ.get("LOCALAPPDATA")
        if not base or not os.path.isabs(base):
            raise LekError("library_unavailable", "LOCALAPPDATA is not an available absolute user data directory")
        return Path(base) / "learning-evidence-kit"
    if __import__("sys").platform == "darwin":
        return Path.home() / "Library" / "Application Support" / "learning-evidence-kit"
    base = os.environ.get("XDG_DATA_HOME")
    if base and not os.path.isabs(base):
        raise LekError("library_unavailable", "XDG_DATA_HOME must be absolute")
    return (Path(base) if base else Path.home() / ".local" / "share") / "learning-evidence-kit"


def generated_id(prefix, request_id):
    return prefix + "-" + uuid.uuid5(uuid.NAMESPACE_URL, "learning-evidence-kit:" + prefix + ":" + request_id).hex


class Library:
    def __init__(self, root=None):
        self.root = Path(root) if root is not None else default_root()
        if not self.root.is_absolute():
            raise LekError("unsafe_path", "Evidence library root must be absolute")
        self.root = assert_no_links(self.root).resolve()
        if self.root.exists() and not self.root.is_dir():
            raise LekError("library_unavailable", "Evidence library root is not a directory")

    def path(self, *parts):
        for part in parts:
            if not isinstance(part, (str, Path)) or Path(part).is_absolute() or ".." in str(part).replace("\\", "/").split("/"):
                raise LekError("unsafe_path", "Library path must remain inside the selected root")
        candidate = assert_no_links(self.root.joinpath(*parts))
        if not candidate.resolve().is_relative_to(self.root):
            raise LekError("unsafe_path", "Library path escapes the selected root")
        return candidate

    def read(self, *parts, default=None):
        path = self.path(*parts)
        return read_json(path) if path.exists() else copy.deepcopy(default)

    def write(self, *parts, value):
        atomic_json(self.path(*parts), value)

    def append_event(self, bucket, key, event):
        safe_id(key, "event key")
        target = self.path(bucket, key + ".json")
        raw = canonical_bytes(event)
        if target.exists() and target.read_bytes() != raw:
            raise LekError("conflict", f"Immutable event differs: {bucket}/{key}")
        if not target.exists():
            atomic_bytes(target, raw)
        return event

    def request_binding(self, request, data=None):
        key = request.get("request_id")
        if not isinstance(key, str) or not key.strip():
            raise LekError("missing_request_id", "Mutation requires an explicit idempotency request_id")
        expected = {"schema_version": 1, "request_id": key, "operation": request["operation"],
                    "request_digest": digest({"operation": request["operation"], "input": request["input"], "schema_version": 1})}
        existing = self.read("receipts", "requests", digest(key) + ".json")
        if existing is not None:
            if not isinstance(existing, dict) or any(existing.get(name) != value for name, value in expected.items()):
                raise LekError("request_conflict", "This global request ID already belongs to different operation/input")
            return existing
        for name in ("record_id", "record_ids"):
            if data is not None and name in data:
                expected[name] = data[name]
        return expected

    def bind_request(self, request, data=None):
        """Reserve a global mutation key; caller must hold locked() before remote I/O."""
        binding = self.request_binding(request, data)
        self.append_event("receipts/requests", digest(request["request_id"]), binding)
        return binding

    @contextmanager
    def locked(self):
        self.root.mkdir(parents=True, exist_ok=True)
        for bucket in BUCKETS:
            self.path(bucket).mkdir(exist_ok=True)
        lockpath = self.path("mutation.lock")
        # OS advisory locks release automatically if the process is interrupted.
        handle = open(lockpath, "a+b")
        if lockpath.stat().st_size == 0:
            handle.write(b"0")
            handle.flush()
        acquired = False
        deadline = time.monotonic() + 0.5
        try:
            while True:
                try:
                    handle.seek(0)
                    if os.name == "nt":
                        import msvcrt
                        msvcrt.locking(handle.fileno(), msvcrt.LK_NBLCK, 1)
                    else:
                        import fcntl
                        fcntl.flock(handle.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
                    acquired = True
                    break
                except OSError as error:
                    if time.monotonic() >= deadline:
                        raise LekError("library_busy", "Another mutation holds the library lock", "blocked") from error
                    time.sleep(0.025)
            yield self
        finally:
            if acquired:
                handle.seek(0)
                if os.name == "nt":
                    import msvcrt
                    msvcrt.locking(handle.fileno(), msvcrt.LK_UNLCK, 1)
                else:
                    import fcntl
                    fcntl.flock(handle.fileno(), fcntl.LOCK_UN)
            handle.close()

    def files(self, bucket):
        parent = self.path(bucket)
        if not parent.exists():
            return []
        result = []
        for folder, directories, filenames in os.walk(parent, followlinks=False):
            for name in directories:
                assert_no_links(Path(folder) / name)
            for name in filenames:
                path = self.path(Path(folder).relative_to(self.root), name)
                if name.endswith(".json"):
                    result.append(path)
        return sorted(result)

    def get_record(self, record_id):
        safe_id(record_id, "record_id")
        record = self.read("records", record_id + ".json")
        if record is None:
            raise LekError("record_not_found", f"No saved record: {record_id}", "blocked")
        validate_record(record)
        if record["record_id"] != record_id:
            raise LekError("corruption", "Record filename and record ID differ")
        expected = [event.get("sha256") for event in self.events_for("receipts", record_id)
                    if event.get("operation") == "save" and event.get("sha256")]
        if expected and any(value != digest(record) for value in expected):
            raise LekError("corruption", "Saved record digest differs from its immutable save receipt")
        return record

    def events_for(self, bucket, record_id):
        return [entry for path in self.files(bucket)
                if isinstance((entry := read_json(path)), dict)
                and (entry.get("record_id") == record_id or record_id in entry.get("record_ids", []))]

    def get_metadata(self, record_id):
        return {"associations": self.events_for("associations", record_id),
                "archives": self.events_for("archives", record_id),
                "receipts": self.events_for("receipts", record_id),
                "publications": self.events_for("publications", record_id),
                "collections": self.events_for("collections", record_id)}

    def plan_file(self, relative, value, immutable=True):
        path = self.path(relative)
        raw = value if isinstance(value, bytes) else canonical_bytes(value)
        return {"target": str(relative).replace("\\", "/"), "absolute": False,
                "content": base64.b64encode(raw).decode("ascii"), "sha256": digest(raw),
                "immutable": immutable, "expected": digest(path.read_bytes()) if path.exists() else None}

    def _external_plan(self, path, raw, guard):
        path = assert_no_links(path)
        return {"target": str(path), "absolute": True, "guard": guard,
                "content": base64.b64encode(raw).decode("ascii"), "sha256": digest(raw), "immutable": False,
                "expected": digest(path.read_bytes()) if path.exists() else None}

    def _step_path(self, step):
        if not step.get("absolute"):
            return self.path(step["target"])
        target = assert_no_links(step["target"])
        guard = step.get("guard", {})
        if guard.get("kind") == "worktree":
            worktree, exclude = self._git_worktree(guard["worktree"])
            manifest = worktree / ".learning-evidence" / "manifest.json"
            if target != manifest and target != exclude:
                raise LekError("unsafe_path", "Transaction worktree target does not match verified targets")
        elif guard.get("kind") == "export":
            if not target.is_absolute() or target.suffix.lower() != ".zip":
                raise LekError("unsafe_path", "Export destination must be an absolute ZIP path")
        else:
            raise LekError("corruption", "Unrecognized external transaction target")
        return target

    def _preflight(self, transaction):
        """Validate the complete durable plan and current targets without writing."""
        if not isinstance(transaction, dict) or not isinstance(transaction.get("writes"), list):
            raise LekError("corruption", "Transaction must contain a writes array")
        checked = []
        for step in transaction["writes"]:
            if (not isinstance(step, dict) or not isinstance(step.get("target"), str) or not step["target"]
                    or type(step.get("absolute")) is not bool or type(step.get("immutable")) is not bool
                    or not isinstance(step.get("content"), str) or not isinstance(step.get("sha256"), str)
                    or "expected" not in step or (step["expected"] is not None and not isinstance(step["expected"], str))
                    or (step["absolute"] and not isinstance(step.get("guard"), dict))):
                raise LekError("corruption", "Transaction contains a malformed write step")
            path = self._step_path(step)
            try:
                raw = base64.b64decode(step["content"], validate=True)
            except (ValueError, TypeError) as error:
                raise LekError("corruption", "Transaction contains invalid encoded content") from error
            if digest(raw) != step["sha256"]:
                raise LekError("corruption", "Transaction content digest differs")
            existing = path.read_bytes() if path.exists() else None
            if existing != raw and existing is not None:
                if step["immutable"] or digest(existing) != step["expected"]:
                    raise LekError("conflict", f"Target changed since the prepared mutation: {path.name}")
            if existing is None and step["expected"] is not None:
                raise LekError("conflict", f"Previously existing target is missing: {path.name}")
            checked.append((path, raw, existing))
        return checked

    def _apply(self, transaction):
        # All targets and content are checked before the first resumed write.
        checked = self._preflight(transaction)
        for path, raw, existing in checked:
            if existing != raw:
                atomic_bytes(path, raw)

    def mutate(self, request, prepare):
        key = request.get("request_id")
        if not isinstance(key, str) or not key.strip():
            raise LekError("missing_request_id", "Mutation requires an explicit idempotency request_id")
        tx_path = self.path("transactions", digest(key) + ".json")
        with self.locked():
            binding = self.request_binding(request)
            request_digest = binding["request_digest"]
            transaction = self.read("transactions", digest(key) + ".json")
            if transaction is not None:
                if transaction.get("request_digest") != request_digest or transaction.get("request_id") != key:
                    raise LekError("request_conflict", "This request ID was already used with different operation/input")
                if transaction.get("state") == "completed":
                    return transaction["result"]
                if transaction.get("state") != "prepared":
                    raise LekError("corruption", "Unknown transaction state")
            else:
                result, writes = prepare()
                binding = self.request_binding(request, result.get("data"))
                writes.insert(0, self.plan_file("receipts/requests/" + digest(key) + ".json", binding))
                transaction = {"schema_version": 1, "request_id": key, "request_digest": request_digest,
                               "state": "prepared", "prepared_at": now_utc(), "writes": writes, "result": result}
                # The durable plan allocates IDs before any record write.
                atomic_json(tx_path, transaction)
            self._apply(transaction)
            transaction["state"] = "completed"
            transaction["completed_at"] = now_utc()
            atomic_json(tx_path, transaction)
            return transaction["result"]

    def make_receipt(self, request, data, target, timestamp=None):
        event = {"schema_version": 1, "receipt_id": generated_id("receipt", request["request_id"]),
                 "request_id": request["request_id"], "operation": request["operation"], "time": timestamp or now_utc(),
                 "target": target, "result": "ok", **data}
        return event, self.plan_file("receipts/" + event["receipt_id"] + ".json", event)

    def _identity_plan(self, identity):
        validate_identity(identity)
        filename = digest(identity["responsible_person_id"]) + ".json"
        existing = self.read("identities", filename)
        if existing is not None:
            if existing != identity:
                raise LekError("identity_conflict", "Existing confirmed identity differs; no automatic account/role remapping")
            return []
        return [self.plan_file("identities/" + filename, identity)]

    def _lineage(self, record, candidates=None):
        for related_id in record["related_record_ids"]:
            if related_id == record["record_id"]:
                raise LekError("invalid_lineage", "A record cannot reference itself")
            related = candidates.get(related_id) if candidates is not None else None
            if related is None:
                related = self.get_record(related_id)
            if related["evidence_id"] != record["evidence_id"] or related["identity"]["responsible_person_id"] != record["identity"]["responsible_person_id"]:
                raise LekError("invalid_lineage", "Related entries must preserve original evidence and responsible identity")
            from datetime import datetime
            if datetime.fromisoformat(related["occurred_at"].replace("Z", "+00:00")) > datetime.fromisoformat(record["occurred_at"].replace("Z", "+00:00")):
                raise LekError("invalid_lineage", "Related observation occurs after its successor")

    def _git_worktree(self, value):
        if not isinstance(value, str) or not Path(value).is_absolute():
            raise LekError("unsafe_path", "worktree must be an explicit absolute path")
        worktree = assert_no_links(value).resolve()
        if not worktree.is_dir():
            raise LekError("worktree_unavailable", "Specified worktree does not exist", "blocked")
        def git(*args):
            try:
                completed = subprocess.run(["git", "-C", str(worktree), *args], capture_output=True, text=True,
                                           encoding="utf-8", timeout=10, shell=False)
            except (OSError, subprocess.SubprocessError) as error:
                raise LekError("git_unavailable", str(error), "blocked") from error
            if completed.returncode:
                raise LekError("worktree_unavailable", completed.stderr.strip() or "Git worktree cannot be verified", "blocked")
            return completed.stdout.strip()
        actual = Path(git("rev-parse", "--show-toplevel")).resolve()
        if actual != worktree:
            raise LekError("unsafe_path", "Expected the exact Git worktree root")
        if git("ls-files", "--", ".learning-evidence"):
            raise LekError("tracked_manifest", "Learning evidence manifest/data is already tracked; refuse to modify business files", "blocked")
        exclude = Path(git("rev-parse", "--path-format=absolute", "--git-path", "info/exclude"))
        if not exclude.is_absolute():
            raise LekError("unsafe_path", "Git returned a relative exclude target")
        assert_no_links(exclude)
        # Exclude must lie in this checkout's actual common Git directory.
        common = Path(git("rev-parse", "--path-format=absolute", "--git-common-dir")).resolve()
        if exclude.resolve() != common / "info" / "exclude":
            raise LekError("unsafe_path", "Git exclude is outside the verified common directory")
        assert_no_links(worktree / ".learning-evidence" / "manifest.json")
        return worktree, exclude

    def _association(self, record, task_id, request, pr=None, worktree=None):
        safe_id(task_id, "task_id")
        if pr is not None:
            validate_pr(pr)
        key = generated_id("assoc", request["request_id"] + ":" + record["record_id"] + ":" + task_id)
        return {"schema_version": 1, "association_id": key, "record_id": record["record_id"],
                "evidence_id": record["evidence_id"], "task_id": task_id, "repository": record["task"]["repository"],
                "pull_request": pr, "worktree_reference": worktree, "associated_at": now_utc()}

    def _manifest_plans(self, worktree_value, associations):
        worktree, exclude = self._git_worktree(worktree_value)
        path = worktree / ".learning-evidence" / "manifest.json"
        expected_keys = {"schema_version", "library_root", "references"}
        existing = read_json(path) if path.exists() else {"schema_version": 1, "library_root": str(self.root), "references": []}
        if not isinstance(existing, dict) or set(existing) != expected_keys or type(existing.get("schema_version")) is not int or existing["schema_version"] != 1 or existing.get("library_root") != str(self.root) or not isinstance(existing.get("references"), list):
            raise LekError("manifest_conflict", "Unexpected existing manifest content or a different library locator")
        reference_keys = {"record_id", "evidence_id", "task_id", "association_id"}
        for reference in existing["references"]:
            if not isinstance(reference, dict) or set(reference) != reference_keys:
                raise LekError("manifest_conflict", "Manifest contains data beyond approved references")
            for key in reference_keys:
                safe_id(reference[key], "manifest reference")
        refs = {entry["association_id"]: entry for entry in existing["references"]}
        for association in associations:
            reference = {key: association[key] for key in reference_keys}
            if reference["association_id"] in refs and refs[reference["association_id"]] != reference:
                raise LekError("manifest_conflict", "Existing association reference differs")
            refs[reference["association_id"]] = reference
        desired = {"schema_version": 1, "library_root": str(self.root), "references": sorted(refs.values(), key=lambda entry: entry["association_id"])}
        raw_exclude = exclude.read_bytes() if exclude.exists() else b""
        try:
            text_exclude = raw_exclude.decode("utf-8")
        except UnicodeError as error:
            raise LekError("manifest_conflict", "Local Git exclude is not valid UTF-8") from error
        guard = {"kind": "worktree", "worktree": str(worktree)}
        plans = []
        if "/.learning-evidence/" not in text_exclude.splitlines():
            extra = ("\n" if text_exclude and not text_exclude.endswith("\n") else "") + "/.learning-evidence/\n"
            plans.append(self._external_plan(exclude, raw_exclude + extra.encode("utf-8"), guard))
        plans.append(self._external_plan(path, canonical_bytes(desired), guard))
        return plans

    def save(self, request):
        def prepare():
            data = request["input"]
            if not isinstance(data.get("record"), dict):
                raise LekError("invalid_input", "save needs a record object")
            record = copy.deepcopy(data["record"])
            validate_record(record, allow_missing_ids=True)
            record["record_id"] = record.get("record_id") or generated_id("rec", request["request_id"])
            record["evidence_id"] = record.get("evidence_id") or (self.get_record(record["related_record_ids"][0])["evidence_id"] if record["related_record_ids"] else generated_id("ev", request["request_id"]))
            record["task"]["task_id"] = record["task"].get("task_id") or generated_id("task", request["request_id"])
            validate_record(record)
            self._lineage(record)
            if record["kind"] == "learning":
                for path in self.files("records"):
                    previous = self.get_record(path.stem)
                    if previous["evidence_id"] == record["evidence_id"] and previous["kind"] == "learning" and previous["record_id"] != record["record_id"]:
                        raise LekError("evidence_conflict", "An existing learning event must be reused or appended as correction/retest, not saved as another original")
            writes = self._identity_plan(record["identity"])
            writes.extend([self.plan_file("records/" + record["record_id"] + ".json", record),
                           self.plan_file("markdown/" + record["record_id"] + ".md", render_markdown(record).encode("utf-8"), immutable=False),
                           self.plan_file("tasks/" + record["task"]["task_id"] + "/" + record["record_id"] + ".json", record["task"])])
            worktree = data.get("worktree")
            association = self._association(record, record["task"]["task_id"], request, worktree=worktree)
            writes.append(self.plan_file("associations/" + association["association_id"] + ".json", association))
            if worktree is not None:
                writes.extend(self._manifest_plans(worktree, [association]))
            result_data = {"record_id": record["record_id"], "evidence_id": record["evidence_id"], "task_id": record["task"]["task_id"],
                           "association_id": association["association_id"], "sha256": digest(record), "record_version": record["record_version"]}
            event, plan = self.make_receipt(request, result_data, str(self.root))
            writes.append(plan)
            return receipt(request, data=result_data, receipts=[event]), writes
        return self.mutate(request, prepare)

    def confirm_identity(self, request):
        def prepare():
            identity = request["input"].get("identity")
            writes = self._identity_plan(identity)
            result = {"identity": identity, "confirmation_reference": identity["confirmation"]["reference"]}
            event, plan = self.make_receipt(request, {"responsible_person_id": identity["responsible_person_id"], "sha256": digest(identity)}, str(self.root))
            return receipt(request, data=result, receipts=[event]), [*writes, plan]
        return self.mutate(request, prepare)

    def associate(self, request):
        def prepare():
            data = request["input"]
            record = self.get_record(data.get("record_id"))
            task_id = data.get("task_id")
            safe_id(task_id, "task_id")
            pr, worktree = data.get("pr"), data.get("worktree")
            association = self._association(record, task_id, request, pr, worktree)
            writes = [self.plan_file("associations/" + association["association_id"] + ".json", association)]
            if worktree is not None:
                writes.extend(self._manifest_plans(worktree, [association]))
            event, plan = self.make_receipt(request, association, str(self.root))
            return receipt(request, data=association, receipts=[event]), [*writes, plan]
        return self.mutate(request, prepare)

    def restore(self, request):
        def prepare():
            data = request["input"]
            record_ids = checked_ids(data.get("record_ids"))
            associations, writes = [], []
            for record_id in record_ids:
                record = self.get_record(record_id)
                previous = self.events_for("associations", record_id)
                task_ids = sorted({entry["task_id"] for entry in previous}) or [record["task"]["task_id"]]
                for task_id in task_ids:
                    association = self._association(record, task_id, request, worktree=data.get("worktree"))
                    associations.append(association)
                    writes.append(self.plan_file("associations/" + association["association_id"] + ".json", association))
            writes.extend(self._manifest_plans(data.get("worktree"), associations))
            event, plan = self.make_receipt(request, {"record_ids": record_ids, "association_ids": [item["association_id"] for item in associations]}, data.get("worktree"))
            return receipt(request, data={"record_ids": record_ids, "references": associations}, receipts=[event]), [*writes, plan]
        return self.mutate(request, prepare)

    def check_record(self, request):
        data = request["input"]
        record = self.get_record(data.get("record_id"))
        self._lineage(record)
        gaps = []
        expected_person = data.get("responsible_person_id")
        if expected_person is not None and expected_person != record["identity"]["responsible_person_id"]:
            gaps.append({"code": "identity_mismatch", "message": "Requested person differs from confirmed responsible person"})
        expected_task = data.get("task_id")
        associated_tasks = {item["task_id"] for item in self.events_for("associations", record["record_id"])} | {record["task"]["task_id"]}
        if expected_task is not None:
            safe_id(expected_task, "task_id")
            if expected_task not in associated_tasks:
                gaps.append({"code": "task_mismatch", "message": "Record has no association with the requested task"})
        if "ku_ids" in data:
            if not isinstance(data["ku_ids"], list) or not all(isinstance(entry, str) for entry in data["ku_ids"]):
                raise LekError("invalid_input", "ku_ids must be an array of strings")
            if not set(data["ku_ids"]).issubset({unit["id"] for unit in record["knowledge_units"]}):
                gaps.append({"code": "ku_mismatch", "message": "Requested KU is not in this learning record"})
        if "code_version" in data:
            from common import validate_code_version
            validate_code_version(data["code_version"])
            if data["code_version"] != record["code_version"]:
                gaps.append({"code": "version_review_required", "message": "Code version changed; review affected KU before reusing application conclusions"})
        if record["quiz_status"] in ("pending", "interrupted", "stopped"):
            gaps.append({"code": "incomplete_diagnostic", "message": "Record retains its actual incomplete diagnostic state"})
        return receipt(request, status="partial" if gaps else "ok",
                       data={"record_id": record["record_id"], "structurally_valid": True,
                             "applicability": "needs_review" if gaps else "within_requested_structure",
                             "record_validity": "not_inferred", "knowledge_application": "not_inferred"}, gaps=gaps)

    def listing(self, request):
        data = request["input"]
        if "include_archived" in data and type(data["include_archived"]) is not bool:
            raise LekError("invalid_input", "include_archived must be boolean")
        for name in ("evidence_id", "task_id"):
            if name in data:
                safe_id(data[name], name)
        records = []
        for path in self.files("records"):
            record = self.get_record(path.stem)
            if data.get("evidence_id") is not None and record["evidence_id"] != data["evidence_id"]:
                continue
            tasks = {entry["task_id"] for entry in self.events_for("associations", record["record_id"])} | {record["task"]["task_id"]}
            if data.get("task_id") is not None and data["task_id"] not in tasks:
                continue
            archived = bool(self.events_for("archives", record["record_id"]))
            if archived and not data.get("include_archived", False):
                continue
            records.append({"record_id": record["record_id"], "evidence_id": record["evidence_id"], "kind": record["kind"],
                            "task_ids": sorted(tasks), "occurred_at": record["occurred_at"], "archived": archived, "sha256": digest(record)})
        return receipt(request, data={"records": records, "unique_learning_events": len({item["evidence_id"] for item in records})})

    def archive(self, request):
        def prepare():
            data = request["input"]
            ids = checked_ids(data.get("record_ids"))
            reason = data.get("reason")
            if not isinstance(reason, str) or not reason.strip():
                raise LekError("invalid_input", "archive requires a nonempty reason")
            writes, events = [], []
            for record_id in ids:
                record = self.get_record(record_id)
                event = {"schema_version": 1, "archive_id": generated_id("archive", request["request_id"] + ":" + record_id),
                         "record_id": record_id, "evidence_id": record["evidence_id"], "reason": reason, "archived_at": now_utc()}
                events.append(event)
                writes.append(self.plan_file("archives/" + event["archive_id"] + ".json", event))
            event, plan = self.make_receipt(request, {"record_ids": ids, "retained": True}, str(self.root))
            return receipt(request, data={"record_ids": ids, "retained": True}, receipts=[event]), [*writes, plan]
        return self.mutate(request, prepare)

    def export(self, request):
        def prepare():
            data = request["input"]
            ids = set(checked_ids(data.get("record_ids")))
            destination = data.get("destination")
            if not isinstance(destination, str) or not Path(destination).is_absolute() or Path(destination).suffix.lower() != ".zip":
                raise LekError("unsafe_path", "Export destination must be an explicit absolute .zip file")
            target = assert_no_links(destination)
            if target.resolve().is_relative_to(self.root):
                raise LekError("unsafe_path", "Export destination must be outside the evidence library")
            if target.exists():
                raise LekError("export_conflict", "Existing export destination will not be overwritten")
            records, queue = {}, list(ids)
            while queue:
                record_id = queue.pop()
                if record_id in records:
                    continue
                record = self.get_record(record_id)
                self._lineage(record)
                records[record_id] = record
                queue.extend(record["related_record_ids"])
            contents = {}
            for record in records.values():
                relative = "records/" + record["record_id"] + ".json"
                contents[relative] = self.path(relative).read_bytes()
                identity = "identities/" + digest(record["identity"]["responsible_person_id"]) + ".json"
                saved_identity = self.read(identity)
                if saved_identity != record["identity"]:
                    raise LekError("corruption", "Confirmed identity missing or differs from saved entry")
                contents[identity] = self.path(identity).read_bytes()
                task = "tasks/" + record["task"]["task_id"] + "/" + record["record_id"] + ".json"
                if self.read(task) != record["task"]:
                    raise LekError("corruption", "Saved task snapshot missing or differs")
                contents[task] = self.path(task).read_bytes()
                contents["markdown/" + record["record_id"] + ".md"] = render_markdown(record).encode("utf-8")
            ids = set(records)
            dependency_queue = []
            def add_flow_member(path):
                name = str(path.relative_to(self.root)).replace("\\", "/")
                if name not in contents:
                    contents[name] = path.read_bytes()
                    dependency_queue.append(read_json(path))
            for bucket in ("associations", "archives", "receipts", "publications", "collections"):
                for path in self.files(bucket):
                    event = read_json(path)
                    relative = str(path.relative_to(self.root)).replace("\\", "/")
                    # A record-specific backup must not silently share other people's
                    # scope indexes or bulk collection results. Per-record snapshots
                    # and receipts retain their original exact bytes instead.
                    if relative.startswith("collections/scopes/"):
                        continue
                    event_ids = set(event.get("record_ids", []))
                    if bucket == "collections" and event_ids - ids:
                        continue
                    if event.get("record_id") in ids or ids.intersection(event.get("record_ids", [])):
                        if event_ids - ids:
                            raise LekError("export_scope_conflict", "A related batch receipt includes unselected records; explicitly include its full record scope", "blocked")
                        add_flow_member(path)
            while dependency_queue:
                event = dependency_queue.pop()
                if event.get("request_id"):
                    binding = self.path("receipts", "requests", digest(event["request_id"]) + ".json")
                    if binding.exists():
                        add_flow_member(binding)
                for dependency_name in flow_dependencies(event):
                    path = self.path(dependency_name)
                    if not path.exists():
                        raise LekError("incomplete_export", f"Flow dependency is missing: {dependency_name}", "blocked")
                    dependency = read_json(path)
                    if set(dependency.get("record_ids", [])) - ids or (dependency.get("record_id") is not None and dependency["record_id"] not in ids):
                        raise LekError("export_scope_conflict", "A flow dependency includes an unselected learning record", "blocked")
                    add_flow_member(path)
            manifest = {"schema_version": 1, "format": "learning-evidence-kit-export", "exported_at": now_utc(),
                        "record_ids": sorted(ids), "members": {name: {"sha256": digest(raw), "size": len(raw)} for name, raw in sorted(contents.items())}}
            archive = io.BytesIO()
            with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED) as package:
                for name, raw in sorted(contents.items()):
                    package.writestr(name, raw)
                package.writestr("manifest.json", canonical_bytes(manifest))
            raw_archive = archive.getvalue()
            if len(raw_archive) > MAX_EXPORT or sum(len(raw) for raw in contents.values()) > MAX_EXPORT or len(contents) > MAX_MEMBERS:
                raise LekError("export_too_large", "Export exceeds package size limits")
            result = {"record_ids": sorted(ids), "destination": str(target), "sha256": digest(raw_archive), "members": len(contents)}
            event, plan = self.make_receipt(request, result, str(target))
            writes = [self._external_plan(target, raw_archive, {"kind": "export"}), plan]
            return receipt(request, data=result, receipts=[event]), writes
        return self.mutate(request, prepare)

    def _validate_export(self, source):
        if not isinstance(source, str) or not Path(source).is_absolute():
            raise LekError("unsafe_path", "Import source must be an explicit absolute path")
        source = assert_no_links(source)
        if not source.is_file() or source.stat().st_size > MAX_EXPORT:
            raise LekError("invalid_import", "Import source is missing or too large")
        contents = {}
        try:
            with zipfile.ZipFile(source) as package:
                members = package.infolist()
                if len(members) > MAX_MEMBERS or sum(item.file_size for item in members) > MAX_EXPORT:
                    raise LekError("invalid_import", "Import exceeds expanded size limits")
                for item in members:
                    name = item.filename
                    path = PurePosixPath(name)
                    mode = (item.external_attr >> 16) & 0o170000
                    if name in contents or "\\" in name or path.is_absolute() or any(part in ("..", ".", "") for part in name.split("/")) or ":" in name or mode not in (0, 0o100000) or item.is_dir() or item.file_size > MAX_MEMBER or item.flag_bits & 1:
                        raise LekError("unsafe_import", f"Unsafe or duplicate ZIP member: {name}")
                    if name != "manifest.json" and (len(path.parts) < 2 or path.parts[0] not in EXPORT_BUCKETS | {"markdown"}):
                        raise LekError("unsafe_import", f"Unexpected import member: {name}")
                    contents[name] = package.read(item)
        except (zipfile.BadZipFile, OSError, RuntimeError, NotImplementedError) as error:
            raise LekError("invalid_import", str(error)) from error
        if "manifest.json" not in contents:
            raise LekError("invalid_import", "ZIP package lacks a digest manifest")
        manifest = parse_json(contents.pop("manifest.json").decode("utf-8"))
        if not isinstance(manifest, dict) or type(manifest.get("schema_version")) is not int or manifest.get("schema_version") != 1 or manifest.get("format") != "learning-evidence-kit-export" or not isinstance(manifest.get("members"), dict) or set(manifest["members"]) != set(contents):
            raise LekError("invalid_import", "Unsupported/incomplete export manifest")
        records, values = {}, {}
        for name, raw in contents.items():
            descriptor = manifest["members"][name]
            if not isinstance(descriptor, dict) or descriptor.get("sha256") != digest(raw) or type(descriptor.get("size")) is not int or descriptor["size"] != len(raw):
                raise LekError("invalid_import", f"Member digest/size mismatch: {name}")
            if name.startswith("markdown/"):
                continue
            if not name.endswith(".json"):
                raise LekError("unsafe_import", "Only recognized JSON and generated Markdown members are allowed")
            value = parse_json(raw.decode("utf-8"))
            if not isinstance(value, dict):
                raise LekError("invalid_import", "JSON package members must be objects")
            values[name] = value
            if name.startswith("records/"):
                validate_record(value)
                if name != "records/" + value["record_id"] + ".json":
                    raise LekError("invalid_import", "Record member path/ID mismatch")
                records[value["record_id"]] = value
            elif name.startswith("identities/"):
                validate_identity(value)
                if name != "identities/" + digest(value["responsible_person_id"]) + ".json":
                    raise LekError("invalid_import", "Identity path/ID mismatch")
            elif name.split("/", 1)[0] != "tasks" and (type(value.get("schema_version")) is not int or value.get("schema_version") != 1):
                raise LekError("invalid_import", "Unsupported event schema version")
        if set(checked_ids(manifest.get("record_ids"))) != set(records):
            raise LekError("invalid_import", "Manifest record IDs do not match the complete entries")
        visited, active = set(), set()
        def check_lineage(record_id):
            if record_id in active:
                raise LekError("invalid_import", "Imported lineage contains a cycle")
            if record_id in visited:
                return
            if record_id not in records:
                raise LekError("invalid_import", "Export omits related original entries")
            active.add(record_id)
            for previous in records[record_id]["related_record_ids"]:
                check_lineage(previous)
            active.remove(record_id)
            visited.add(record_id)
        for record_id in records:
            check_lineage(record_id)
        original_events = {}
        for record in records.values():
            if record["kind"] == "learning":
                if record["evidence_id"] in original_events:
                    raise LekError("invalid_import", "Export has duplicate original entries for one learning event")
                original_events[record["evidence_id"]] = record["record_id"]
        for record in records.values():
            if any(entry not in records for entry in record["related_record_ids"]):
                raise LekError("invalid_import", "Export omits related original entries")
            self._lineage(record, records)
            identity = "identities/" + digest(record["identity"]["responsible_person_id"]) + ".json"
            task = "tasks/" + record["task"]["task_id"] + "/" + record["record_id"] + ".json"
            markdown = "markdown/" + record["record_id"] + ".md"
            if values.get(identity) != record["identity"] or values.get(task) != record["task"] or contents.get(markdown) != render_markdown(record).encode("utf-8"):
                raise LekError("invalid_import", "Package omits or alters identity, task, or generated complete reading copy")
        expected_identity_paths = {"identities/" + digest(record["identity"]["responsible_person_id"]) + ".json" for record in records.values()}
        expected_task_paths = {"tasks/" + record["task"]["task_id"] + "/" + record["record_id"] + ".json" for record in records.values()}
        expected_markdown_paths = {"markdown/" + record_id + ".md" for record_id in records}
        if ({name for name in contents if name.startswith("identities/")} != expected_identity_paths
                or {name for name in contents if name.startswith("tasks/")} != expected_task_paths
                or {name for name in contents if name.startswith("markdown/")} != expected_markdown_paths):
            raise LekError("invalid_import", "Package contains unreferenced identity/task/reading-copy members")
        for name, value in values.items():
            bucket = name.split("/", 1)[0]
            if bucket == "receipts":
                request_id = value.get("request_id")
                if not isinstance(request_id, str) or not request_id.strip() or len(request_id) > 256:
                    raise LekError("invalid_import", "Receipt lacks a valid original request ID")
                if name.startswith("receipts/requests/"):
                    if name != "receipts/requests/" + digest(request_id) + ".json" or not isinstance(value.get("operation"), str) or not isinstance(value.get("request_digest"), str) or len(value["request_digest"]) != 64:
                        raise LekError("invalid_import", "Malformed global request binding/path")
                else:
                    receipt_id = value.get("receipt_id")
                    safe_id(receipt_id, "receipt_id")
                    if (name != "receipts/" + receipt_id + ".json" or receipt_id != generated_id("receipt", request_id)
                            or not isinstance(value.get("operation"), str) or not isinstance(value.get("time"), str)
                            or not isinstance(value.get("target"), str) or value.get("result") != "ok"):
                        raise LekError("invalid_import", "Malformed receipt structure, path, or stable ID")
                if value.get("record_id") is not None and value["record_id"] not in records:
                    raise LekError("invalid_import", "Receipt references an absent exported record")
                if not isinstance(value.get("record_ids", []), list) or any(record_id not in records for record_id in value.get("record_ids", [])):
                    raise LekError("invalid_import", "Receipt references an absent exported record scope")
                if value.get("operation") == "save" and not name.startswith("receipts/requests/"):
                    record_id = value.get("record_id")
                    if record_id not in records:
                        raise LekError("invalid_import", "Save receipt requires its actual original record")
                    original = records[record_id]
                    association_id = value.get("association_id")
                    association = values.get("associations/" + str(association_id) + ".json")
                    if (value.get("sha256") != digest(original) or value.get("evidence_id") != original["evidence_id"]
                            or value.get("task_id") != original["task"]["task_id"] or type(value.get("record_version")) is not int
                            or value["record_version"] != original["record_version"] or not isinstance(association, dict)
                            or association.get("record_id") != record_id or association.get("evidence_id") != original["evidence_id"]
                            or association.get("task_id") != original["task"]["task_id"]):
                        raise LekError("invalid_import", "Save receipt digest/version/association differs from the authoritative record")
            if bucket in ("publications", "collections"):
                if value.get("record_id") is not None and value["record_id"] not in records:
                    raise LekError("invalid_import", "Flow points to an absent exported record")
                if not isinstance(value.get("record_ids", []), list) or any(record_id not in records for record_id in value.get("record_ids", [])):
                    raise LekError("invalid_import", "Flow references an absent exported record")
                if any(dependency not in contents for dependency in flow_dependencies(value)):
                    raise LekError("invalid_import", "Package omits a flow snapshot/plan dependency")
            if bucket in ("associations", "archives"):
                record_id = value.get("record_id")
                if record_id not in records or value.get("evidence_id") != records[record_id]["evidence_id"]:
                    raise LekError("invalid_import", "Imported event points to an absent/different record")
                if bucket == "associations":
                    safe_id(value.get("task_id"), "association task_id")
                    safe_id(value.get("association_id"), "association_id")
                    if name != "associations/" + value["association_id"] + ".json":
                        raise LekError("invalid_import", "Association path/ID mismatch")
                    required = ("repository", "pull_request", "worktree_reference", "associated_at")
                    if any(key not in value for key in required) or any(value[key] is not None and not isinstance(value[key], str) for key in ("repository", "worktree_reference")) or not isinstance(value["associated_at"], str):
                        raise LekError("invalid_import", "Malformed association metadata")
                    if value["pull_request"] is not None:
                        validate_pr(value["pull_request"])
                else:
                    safe_id(value.get("archive_id"), "archive_id")
                    if name != "archives/" + value["archive_id"] + ".json" or not isinstance(value.get("reason"), str) or not value["reason"].strip() or not isinstance(value.get("archived_at"), str):
                        raise LekError("invalid_import", "Malformed archive receipt")
        return manifest, contents, records

    def import_package(self, request):
        def prepare():
            source = request["input"].get("source")
            manifest, contents, records = self._validate_export(source)
            # Validating the package alone is insufficient: its original learning
            # roots must also be unique across the destination's existing history.
            existing_originals = {}
            for path in self.files("records"):
                existing = self.get_record(path.stem)
                if existing["kind"] == "learning":
                    prior_id = existing_originals.setdefault(existing["evidence_id"], existing["record_id"])
                    if prior_id != existing["record_id"]:
                        raise LekError("import_conflict", "Destination already has multiple original entries for one learning event")
            for record in records.values():
                if record["kind"] == "learning":
                    prior_id = existing_originals.setdefault(record["evidence_id"], record["record_id"])
                    if prior_id != record["record_id"]:
                        raise LekError("import_conflict", "Imported learning event conflicts with a different existing original entry")
            # Preflight all members before preparing a journal or changing records.
            for name, raw in contents.items():
                target = self.path(name)
                if target.exists() and target.read_bytes() != raw:
                    raise LekError("import_conflict", f"Existing member differs from imported immutable data: {name}")
            writes = [self.plan_file(name, raw) for name, raw in sorted(contents.items())]
            result = {"record_ids": sorted(records), "preserved_ids": True, "source_sha256": digest(Path(source).read_bytes())}
            event, plan = self.make_receipt(request, result, str(self.root))
            return receipt(request, data=result, receipts=[event]), [*writes, plan]
        return self.mutate(request, prepare)

    def recover(self, request):
        dry_run = request["input"].get("dry_run", False)
        if type(dry_run) is not bool:
            raise LekError("invalid_input", "dry_run must be boolean")
        if not dry_run and not request.get("request_id"):
            raise LekError("missing_request_id", "Recovery mutation requires request_id")
        def scan(apply):
            gaps, rebuilt, reconciled = [], [], []
            for path in self.files("transactions"):
                transaction = read_json(path)
                if (not isinstance(transaction, dict) or type(transaction.get("schema_version")) is not int
                        or transaction["schema_version"] != 1 or transaction.get("state") not in ("prepared", "completed")
                        or not isinstance(transaction.get("writes"), list)):
                    gaps.append({"code": "corruption", "message": f"Invalid transaction: {path.name}"})
                    continue
                if transaction["state"] == "prepared":
                    try:
                        if apply:
                            self._apply(transaction)
                            transaction["state"] = "completed"
                            transaction["completed_at"] = now_utc()
                            atomic_json(path, transaction)
                        else:
                            self._preflight(transaction)
                        reconciled.append(transaction["request_id"])
                    except (LekError, OSError) as error:
                        gaps.append({"code": "recovery_conflict", "message": str(error), "request_id": transaction.get("request_id")})
                else:
                    for step in transaction["writes"]:
                        # Compare only immutable authority. Derived copies can be regenerated.
                        if not step.get("immutable") or step.get("absolute"):
                            continue
                        target = self.path(step["target"])
                        if not target.exists():
                            if step["target"].startswith("receipts/"):
                                if apply:
                                    atomic_bytes(target, base64.b64decode(step["content"], validate=True))
                                rebuilt.append(step["target"])
                            else:
                                gaps.append({"code": "missing_authority", "message": f"Missing original data: {step['target']}"})
                        elif digest(target.read_bytes()) != step["sha256"]:
                            gaps.append({"code": "corruption", "message": f"Immutable bytes changed: {step['target']}"})
            for path in self.files("records"):
                try:
                    record = self.get_record(path.stem)
                    self._lineage(record)
                    derived = self.path("markdown", path.stem + ".md")
                    desired = render_markdown(record).encode("utf-8")
                    if not derived.exists() or derived.read_bytes() != desired:
                        if apply:
                            atomic_bytes(derived, desired)
                        rebuilt.append("markdown/" + path.stem + ".md")
                except LekError as error:
                    gaps.append({"code": error.code, "message": str(error), "record_id": path.stem})
            return receipt(request, status="partial" if gaps else "ok", data={"dry_run": not apply, "rebuilt": rebuilt, "reconciled": reconciled}, gaps=gaps)
        if dry_run:
            return scan(False)
        def prepare():
            result = scan(True)
            event, _ = self.make_receipt(request, {"reconciled": result["data"]["reconciled"], "rebuilt": result["data"]["rebuilt"], "result_status": result["status"]}, str(self.root))
            result["receipts"].append(event)
            return result, [self.plan_file("receipts/" + event["receipt_id"] + ".json", event)]
        return self.mutate(request, prepare)


def checked_ids(ids):
    if not isinstance(ids, list) or not ids or len(ids) != len(set(entry for entry in ids if isinstance(entry, str))):
        raise LekError("invalid_input", "record_ids must be a nonempty array of unique identifiers")
    for entry in ids:
        safe_id(entry, "record_id")
    return ids


def dispatch(request):
    library = Library(request.get("library_root"))
    operation = request["operation"]
    if operation == "get":
        record = library.get_record(request["input"].get("record_id"))
        return receipt(request, data={"record": record, **library.get_metadata(record["record_id"])})
    methods = {"save": library.save, "confirm_identity": library.confirm_identity, "list": library.listing,
               "check_record": library.check_record, "associate": library.associate, "restore": library.restore,
               "recover": library.recover, "export": library.export, "import": library.import_package, "archive": library.archive}
    if operation not in methods:
        raise LekError("unknown_operation", f"Unsupported local operation: {operation}")
    return methods[operation](request)
