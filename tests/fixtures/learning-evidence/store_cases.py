"""Reproducible synthetic cases; every mutation uses an isolated library."""
from __future__ import annotations

import copy
import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
import zipfile
from pathlib import Path

LEK = Path(sys.argv.pop(1)).resolve()
PACKAGE = LEK.parent
sys.path.insert(0, str(PACKAGE))
from common import canonical_bytes, digest, render_markdown

FIXTURE = json.loads(Path(__file__).with_name("learning-record.json").read_text(encoding="utf-8"))


class StoreCases(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix="lek-synthetic-")
        self.directory = Path(self.temporary.name)
        self.library = self.directory / "isolated-user-data"
        self.unrelated = self.directory / "unrelated-working-directory"
        self.unrelated.mkdir()
        self.counter = 0

    def tearDown(self):
        self.temporary.cleanup()

    def request(self, operation, data, request_id=None, root=None):
        self.counter += 1
        return {"schema_version": 1, "operation": operation, "request_id": request_id or f"synthetic-request-{self.counter}",
                "library_root": str(root or self.library), "input": data}

    def invoke(self, request, status="ok"):
        result = subprocess.run([sys.executable, str(LEK)], input=json.dumps(request, ensure_ascii=False), capture_output=True,
                                text=True, encoding="utf-8", cwd=self.unrelated, timeout=15,
                                env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1", "PYTHONUTF8": "1"})
        response = json.loads(result.stdout)
        self.assertEqual(response["status"], status, response)
        self.assertEqual(result.returncode, 1 if status in ("blocked", "error") else 0, response)
        self.assertEqual(response["schema_version"], 1)
        self.assertTrue(all(key in response for key in ("operation", "request_id", "data", "receipts", "gaps", "errors")))
        return response

    def save(self, record=None, request_id=None, worktree=None):
        data = {"record": copy.deepcopy(record or FIXTURE)}
        if worktree is not None:
            data["worktree"] = str(worktree)
        return self.invoke(self.request("save", data, request_id))

    def get(self, record_id):
        return self.invoke(self.request("get", {"record_id": record_id}))["data"]

    def git_worktree(self, name="business"):
        worktree = self.directory / name
        worktree.mkdir()
        subprocess.run(["git", "init", "--quiet", str(worktree)], check=True, capture_output=True)
        return worktree

    def test_complete_save_replay_and_identity_separation(self):
        request = self.request("save", {"record": copy.deepcopy(FIXTURE)}, "idempotent-save")
        first = self.invoke(request)
        self.assertEqual(self.invoke(request), first)
        stored = self.get(first["data"]["record_id"])["record"]
        self.assertEqual(stored["evidence_id"], first["data"]["evidence_id"])
        self.assertEqual(stored["identity"]["responsible_person_id"], "synthetic-person-1")
        self.assertEqual(stored["source_author"]["id"], "synthetic-author")
        self.assertEqual(stored["operator"]["account"], "synthetic-operation-account")
        self.assertEqual(stored["requirement_baseline"], FIXTURE["requirement_baseline"])
        self.assertEqual(len(list((self.library / "records").glob("*.json"))), 1)
        self.assertEqual(len(list((self.library / "publications").glob("*.json"))), 0)
        self.assertEqual((self.library / "markdown" / f"{stored['record_id']}.md").read_text(encoding="utf-8"), render_markdown(stored))

    def test_missing_or_changed_mutation_key_fails_closed(self):
        request = self.request("save", {"record": copy.deepcopy(FIXTURE)}, "fixed-key")
        self.invoke(request)
        changed = copy.deepcopy(request)
        changed["input"]["record"]["observations"][0]["response"] = "Different original answer"
        self.assertEqual(self.invoke(changed, "error")["errors"][0]["code"], "request_conflict")
        missing = self.request("save", {"record": copy.deepcopy(FIXTURE)})
        missing.pop("request_id")
        self.assertEqual(self.invoke(missing, "error")["errors"][0]["code"], "missing_request_id")
        self.assertEqual(len(list((self.library / "records").glob("*.json"))), 1)

    def test_misplaced_input_library_root_cannot_write_default_or_requested_library(self):
        requested = self.directory / "intended-explicit-library"
        isolated_default = self.directory / "isolated-default-library"
        request = self.request("save", {"record": copy.deepcopy(FIXTURE), "library_root": str(requested)})
        request.pop("library_root")
        # Isolate even the erroneously selected default root, so a regression can
        # never write to the test operator's genuine evidence library.
        code = """import sys,pathlib
sys.path.insert(0,sys.argv[1])
import storage
storage.default_root=lambda: pathlib.Path(sys.argv[2])
import lek
raise SystemExit(lek.main())
"""
        process = subprocess.run([sys.executable, "-c", code, str(PACKAGE), str(isolated_default)], input=json.dumps(request),
                                 text=True, capture_output=True, cwd=self.unrelated, timeout=15)
        result = json.loads(process.stdout)
        self.assertEqual(process.returncode, 1)
        self.assertEqual(result["status"], "error")
        self.assertEqual(result["errors"][0]["code"], "unsupported_input_fields")
        self.assertFalse(isolated_default.exists())
        self.assertFalse(requested.exists())
        self.assertFalse(self.library.exists())

    def test_unknown_operation_or_envelope_fields_cannot_imply_authorization(self):
        request = self.request("save", {"record": copy.deepcopy(FIXTURE), "authorization": {"publish": True}})
        response = self.invoke(request, "error")
        self.assertEqual(response["errors"][0]["code"], "unsupported_input_fields")
        request = self.request("save", {"record": copy.deepcopy(FIXTURE)})
        request["authorization"] = {"publish": True}
        response = self.invoke(request, "error")
        self.assertEqual(response["errors"][0]["code"], "unsupported_request_fields")
        self.assertFalse(self.library.exists())
        record = copy.deepcopy(FIXTURE)
        record["descriptive_extension"] = {"note": "Retained as data, never an execution policy"}
        saved = self.save(record)["data"]
        self.assertEqual(self.get(saved["record_id"])["record"]["descriptive_extension"], record["descriptive_extension"])

    def test_explicit_ids_and_immutable_conflict(self):
        record = copy.deepcopy(FIXTURE)
        record.update(record_id="rec-explicit", evidence_id="ev-explicit")
        record["task"]["task_id"] = "task-explicit"
        self.save(record)
        record["observations"][0]["response"] = "Cannot replace the saved original"
        response = self.invoke(self.request("save", {"record": record}), "error")
        self.assertEqual(response["errors"][0]["code"], "conflict")
        self.assertEqual(self.get("rec-explicit")["record"]["observations"][0]["response"], FIXTURE["observations"][0]["response"])

    def test_correction_retest_and_cross_pr_reuse_are_one_learning(self):
        initial = self.save()["data"]
        record = self.get(initial["record_id"])["record"]
        for pr_number in (100, 101):
            self.invoke(self.request("associate", {"record_id": record["record_id"], "task_id": record["task"]["task_id"],
                                                    "pr": {"repository": "synthetic-owner/example", "number": pr_number, "base": "base", "head": f"head-{pr_number}"}}))
        retest = copy.deepcopy(record)
        retest["record_id"] = None
        retest["kind"] = "retest"
        retest["related_record_ids"] = [record["record_id"]]
        retest["occurred_at"] = "2026-10-12T05:00:00Z"
        retest["observations"][0].update(stage="retest", response="A new observed answer", observed_at="2026-10-12T05:00:00Z")
        new = self.save(retest)["data"]
        self.assertNotEqual(new["record_id"], record["record_id"])
        self.assertEqual(new["evidence_id"], record["evidence_id"])
        listing = self.invoke(self.request("list", {}))["data"]
        self.assertEqual(len(listing["records"]), 2)
        self.assertEqual(listing["unique_learning_events"], 1)
        self.assertEqual(len(self.get(record["record_id"])["associations"]), 3)

    def test_identity_confirmation_reuse_and_conflict(self):
        identity = copy.deepcopy(FIXTURE["identity"])
        self.invoke(self.request("confirm_identity", {"identity": identity}))
        self.invoke(self.request("confirm_identity", {"identity": identity}))
        changed = copy.deepcopy(identity)
        changed["account_mappings"][0]["account"] = "different-account"
        self.assertEqual(self.invoke(self.request("confirm_identity", {"identity": changed}), "error")["errors"][0]["code"], "identity_conflict")
        self.save()

    def test_no_relabeling_other_respondents_or_synthetic_as_real(self):
        for change in ("respondent", "synthetic"):
            with self.subTest(change=change):
                record = copy.deepcopy(FIXTURE)
                if change == "respondent":
                    record["observations"][0]["respondent_id"] = "someone-else"
                else:
                    record["provenance"]["synthetic"] = False
                self.invoke(self.request("save", {"record": record}), "error")
        self.assertFalse(list((self.library / "records").glob("*.json")))

    def test_worktree_only_contains_references_and_restores_after_removal(self):
        original = self.git_worktree()
        saved = self.save(worktree=original)["data"]
        manifest = json.loads((original / ".learning-evidence" / "manifest.json").read_text(encoding="utf-8"))
        self.assertEqual(set(manifest), {"schema_version", "library_root", "references"})
        self.assertEqual(set(manifest["references"][0]), {"record_id", "evidence_id", "task_id", "association_id"})
        status = subprocess.run(["git", "-C", str(original), "status", "--porcelain"], capture_output=True, text=True, check=True)
        self.assertEqual(status.stdout, "")
        shutil.rmtree(original)
        replacement = self.git_worktree("replacement")
        self.invoke(self.request("restore", {"record_ids": [saved["record_id"]], "worktree": str(replacement)}))
        self.assertTrue((replacement / ".learning-evidence" / "manifest.json").is_file())
        self.assertEqual(self.get(saved["record_id"])["record"]["requirement_baseline"], FIXTURE["requirement_baseline"])

    def test_tracked_or_unexpected_manifest_and_relative_paths_are_rejected(self):
        worktree = self.git_worktree()
        evidence = worktree / ".learning-evidence"
        evidence.mkdir()
        (evidence / "manifest.json").write_text('{"answers": "business data"}', encoding="utf-8")
        response = self.invoke(self.request("save", {"record": copy.deepcopy(FIXTURE), "worktree": str(worktree)}), "error")
        self.assertEqual(response["errors"][0]["code"], "manifest_conflict")
        subprocess.run(["git", "-C", str(worktree), "add", ".learning-evidence/manifest.json"], check=True, capture_output=True)
        self.assertEqual(self.invoke(self.request("save", {"record": copy.deepcopy(FIXTURE), "worktree": str(worktree)}), "blocked")["errors"][0]["code"], "tracked_manifest")
        relative = self.request("save", {"record": copy.deepcopy(FIXTURE)})
        relative["library_root"] = "relative-library"
        self.assertEqual(self.invoke(relative, "error")["errors"][0]["code"], "unsafe_path")
        self.assertFalse(list((self.library / "records").glob("*.json")))

    def test_process_interruption_recovers_same_allocated_ids(self):
        request = self.request("save", {"record": copy.deepcopy(FIXTURE)}, "interrupted-save")
        code = """import sys,os,json
sys.path.insert(0, sys.argv[1])
import storage
original=storage.atomic_bytes
def interrupted(path,raw):
    original(path,raw)
    if path.parent.name == 'records': os._exit(75)
storage.atomic_bytes=interrupted
storage.dispatch(json.load(sys.stdin))
"""
        process = subprocess.run([sys.executable, "-c", code, str(PACKAGE)], input=json.dumps(request), text=True, capture_output=True, cwd=self.unrelated, timeout=15)
        self.assertEqual(process.returncode, 75)
        durable = list((self.library / "records").glob("*.json"))
        self.assertEqual(len(durable), 1)
        first_record_id = durable[0].stem
        recovered = self.invoke(request)
        self.assertEqual(recovered["data"]["record_id"], first_record_id)
        self.assertEqual(len(list((self.library / "records").glob("*.json"))), 1)
        self.assertEqual(self.invoke(request), recovered)

    def test_recover_regenerates_only_derived_files_and_receipts(self):
        saved = self.save()["data"]
        markdown = self.library / "markdown" / f"{saved['record_id']}.md"
        markdown.unlink()
        save_receipt = next((self.library / "receipts").glob("*.json"))
        save_receipt.unlink()
        dry = self.invoke(self.request("recover", {"dry_run": True}))
        self.assertFalse(markdown.exists())
        self.assertEqual(len(dry["data"]["rebuilt"]), 2)
        request = self.request("recover", {}, "recover-1")
        result = self.invoke(request)
        self.assertEqual(self.invoke(request), result)
        self.assertTrue(markdown.exists())
        self.assertTrue(save_receipt.exists())
        record_path = self.library / "records" / f"{saved['record_id']}.json"
        record_path.unlink()
        failure = self.invoke(self.request("recover", {}), "partial")
        self.assertTrue(any(gap["code"] == "missing_authority" for gap in failure["gaps"]))
        self.assertFalse(record_path.exists())

    def prepared_journal(self, request):
        code = """import sys,os,json
sys.path.insert(0,sys.argv[1])
import storage
storage.Library._apply=lambda self,transaction: os._exit(76)
storage.dispatch(json.load(sys.stdin))
"""
        process = subprocess.run([sys.executable, "-c", code, str(PACKAGE)], input=json.dumps(request), text=True,
                                 capture_output=True, cwd=self.unrelated, timeout=15)
        self.assertEqual(process.returncode, 76)
        path = self.library / "transactions" / (digest(request["request_id"]) + ".json")
        return path, json.loads(path.read_text(encoding="utf-8"))

    def library_snapshot(self):
        return {str(path.relative_to(self.library)): path.read_bytes() for path in self.library.rglob("*") if path.is_file()}

    def test_recovery_dry_run_preflights_changed_prepared_targets_without_writing(self):
        import base64
        request = self.request("save", {"record": copy.deepcopy(FIXTURE)}, "prepared-target-conflict")
        journal_path, transaction = self.prepared_journal(request)
        step = next(entry for entry in transaction["writes"] if entry["target"].startswith("records/"))
        changed = json.loads(base64.b64decode(step["content"]))
        changed["observations"][0]["response"] = "A changed prepared target must block both dry and actual recovery"
        target = self.library / step["target"]
        target.write_bytes(canonical_bytes(changed))
        before = self.library_snapshot()
        dry = self.invoke(self.request("recover", {"dry_run": True}), "partial")
        self.assertEqual(self.library_snapshot(), before)
        self.assertNotIn(request["request_id"], dry["data"]["reconciled"])
        self.assertTrue(any(gap["code"] == "recovery_conflict" and gap.get("request_id") == request["request_id"] for gap in dry["gaps"]))
        actual = self.invoke(self.request("recover", {}), "partial")
        self.assertNotIn(request["request_id"], actual["data"]["reconciled"])
        self.assertEqual(dry["gaps"], actual["gaps"])
        self.assertEqual(target.read_bytes(), canonical_bytes(changed))
        self.assertEqual(json.loads(journal_path.read_text(encoding="utf-8"))["state"], "prepared")

    def test_recovery_dry_run_rejects_damaged_prepared_plan_without_writing(self):
        for label, damaged_content in (("invalid-base64", "!!!damaged-base64!!!"), ("digest-mismatch", "e30=")):
            with self.subTest(label=label):
                self.library = self.directory / f"isolated-{label}"
                request = self.request("save", {"record": copy.deepcopy(FIXTURE)}, f"prepared-content-{label}")
                journal_path, transaction = self.prepared_journal(request)
                transaction["writes"][0]["content"] = damaged_content
                journal_path.write_bytes(canonical_bytes(transaction))
                before = self.library_snapshot()
                dry = self.invoke(self.request("recover", {"dry_run": True}), "partial")
                self.assertEqual(self.library_snapshot(), before)
                self.assertEqual(dry["data"]["reconciled"], [])
                self.assertTrue(any(gap["code"] == "recovery_conflict" for gap in dry["gaps"]))
                actual = self.invoke(self.request("recover", {}), "partial")
                self.assertEqual(dry["gaps"], actual["gaps"])
                self.assertEqual(actual["data"]["reconciled"], [])
                self.assertFalse(list((self.library / "records").glob("*.json")))
                self.assertEqual(json.loads(journal_path.read_text(encoding="utf-8"))["state"], "prepared")

    def test_recovery_reports_corruption_without_rewriting_original(self):
        saved = self.save()["data"]
        path = self.library / "records" / f"{saved['record_id']}.json"
        corrupted = json.loads(path.read_text(encoding="utf-8"))
        corrupted["observations"][0]["response"] = "Changed bytes after immutable save"
        path.write_bytes(canonical_bytes(corrupted))
        self.assertEqual(self.invoke(self.request("get", {"record_id": saved["record_id"]}), "error")["errors"][0]["code"], "corruption")
        self.invoke(self.request("recover", {}), "partial")
        self.assertEqual(json.loads(path.read_text(encoding="utf-8")), corrupted)

    def test_pending_and_question_limits_do_not_manufacture_completion(self):
        record = copy.deepcopy(FIXTURE)
        record["quiz_status"] = "pending"
        record["observations"][0].update(response=None, answer_status="pending", feedback=None)
        saved = self.save(record)["data"]
        self.assertEqual(self.get(saved["record_id"])["record"]["quiz_status"], "pending")
        self.invoke(self.request("check_record", {"record_id": saved["record_id"]}), "partial")
        record["quiz_status"] = "completed"
        self.invoke(self.request("save", {"record": record}), "error")
        record = copy.deepcopy(FIXTURE)
        record["observations"] = [{**record["observations"][0], "id": f"obs-{number}", "question": f"Question {number}"} for number in range(6)]
        self.invoke(self.request("save", {"record": record}), "error")

    def test_second_ku_requires_explicit_continue(self):
        record = copy.deepcopy(FIXTURE)
        second = copy.deepcopy(record["knowledge_units"][0])
        second["id"] = "KU-2"
        record["knowledge_units"].append(second)
        self.invoke(self.request("save", {"record": record}), "error")
        record["provenance"]["second_ku_continuation"] = {"confirmed": True, "reference": "synthetic-explicit-continue"}
        self.save(record)

    def test_concurrent_mutation_lock_and_automatic_release(self):
        marker = self.directory / "locked"
        code = """import sys,time,pathlib
sys.path.insert(0,sys.argv[1])
from storage import Library
with Library(sys.argv[2]).locked():
    pathlib.Path(sys.argv[3]).write_text('held')
    time.sleep(10)
"""
        holder = subprocess.Popen([sys.executable, "-c", code, str(PACKAGE), str(self.library), str(marker)], cwd=self.unrelated)
        try:
            import time
            deadline = time.monotonic() + 5
            while not marker.exists() and time.monotonic() < deadline:
                time.sleep(0.02)
            self.assertTrue(marker.exists())
            self.assertEqual(self.invoke(self.request("save", {"record": copy.deepcopy(FIXTURE)}), "blocked")["errors"][0]["code"], "library_busy")
            self.assertFalse(list((self.library / "records").glob("*.json")))
        finally:
            holder.terminate()
            holder.wait(timeout=5)
        self.save()

    def test_reusing_learning_event_cannot_create_another_original(self):
        saved = self.save()["data"]
        another = self.get(saved["record_id"])["record"]
        another["record_id"] = None
        response = self.invoke(self.request("save", {"record": another}), "error")
        self.assertEqual(response["errors"][0]["code"], "evidence_conflict")
        listing = self.invoke(self.request("list", {}))["data"]
        self.assertEqual(len(listing["records"]), 1)
        self.assertEqual(listing["unique_learning_events"], 1)

    def test_global_request_key_conflicts_across_local_and_remote_operations(self):
        request = self.request("publish", {"record_id": "rec-synthetic", "pr": {"repository": "synthetic-owner/example", "number": 1}}, "global-shared-key")
        code = """import sys,json
sys.path.insert(0,sys.argv[1])
from storage import Library
request=json.load(sys.stdin)
with Library(request['library_root']).locked() as library:
    library.bind_request(request, {'record_id':'rec-synthetic'})
"""
        reserved = subprocess.run([sys.executable, "-c", code, str(PACKAGE)], input=json.dumps(request), text=True, capture_output=True, cwd=self.unrelated, timeout=15)
        self.assertEqual(reserved.returncode, 0, reserved.stderr)
        local = self.request("save", {"record": copy.deepcopy(FIXTURE)}, "global-shared-key")
        self.assertEqual(self.invoke(local, "error")["errors"][0]["code"], "request_conflict")
        self.assertFalse(list((self.library / "records").glob("*.json")))

    def test_record_export_includes_flow_dependencies_without_other_scope_records(self):
        saved = self.save()["data"]
        from storage import Library
        library = Library(str(self.library))
        with library.locked():
            library.append_event("collections/snapshots", "snap-selected", {"schema_version": 1, "body": "Exact synthetic raw source", "snapshot_id": "snap-selected"})
            library.append_event("collections/assembled", "assembled-selected", {"schema_version": 1, "record_ids": [saved["record_id"]], "snapshot_ids": ["snap-selected"]})
            library.append_event("collections", "flow-selected", {"schema_version": 1, "record_ids": [saved["record_id"]], "operation": "collect", "assembled_ids": ["assembled-selected"], "snapshot_ids": ["snap-selected"], "gaps": ["Historical synthetic coverage gap"]})
            library.append_event("collections/scopes", "scope-multi-person", {"schema_version": 1, "record_ids": [saved["record_id"], "unselected-other-person"], "known": {"other": "other-snapshot"}})
            library.append_event("collections", "bulk-flow", {"schema_version": 1, "record_ids": [saved["record_id"], "unselected-other-person"], "snapshot_ids": ["other-snapshot"]})
        destination = self.directory / "flow-export.zip"
        self.invoke(self.request("export", {"record_ids": [saved["record_id"]], "destination": str(destination)}))
        with zipfile.ZipFile(destination) as package:
            names = set(package.namelist())
            self.assertIn("collections/snapshots/snap-selected.json", names)
            self.assertIn("collections/assembled/assembled-selected.json", names)
            self.assertIn("collections/flow-selected.json", names)
            self.assertNotIn("collections/bulk-flow.json", names)
            self.assertFalse(any(name.startswith("collections/scopes/") for name in names))
        target = self.directory / "flow-imported"
        self.invoke(self.request("import", {"source": str(destination)}, root=target))
        self.assertTrue((target / "collections" / "snapshots" / "snap-selected.json").exists())
        def remove_snapshot(contents):
            name = "collections/snapshots/snap-selected.json"
            contents.pop(name)
            manifest = json.loads(contents["manifest.json"])
            manifest["members"].pop(name)
            contents["manifest.json"] = canonical_bytes(manifest)
        incomplete = self.repack(destination, "missing-flow-dependency.zip", remove_snapshot)
        response = self.invoke(self.request("import", {"source": str(incomplete)}, root=self.directory / "incomplete-flow"), "error")
        self.assertEqual(response["errors"][0]["code"], "invalid_import")

    def test_export_related_history_and_malicious_types_with_matching_digest(self):
        original = self.save()["data"]
        correction = self.get(original["record_id"])["record"]
        correction.update(record_id=None, kind="correction", related_record_ids=[original["record_id"]])
        correction["limitations"].append("Synthetic correction clarifies interpretation without deleting the original")
        corrected = self.save(correction)["data"]
        destination = self.directory / "related-history.zip"
        result = self.invoke(self.request("export", {"record_ids": [corrected["record_id"]], "destination": str(destination)}))
        self.assertEqual(set(result["data"]["record_ids"]), {original["record_id"], corrected["record_id"]})
        def malicious_type(contents):
            path = f"records/{original['record_id']}.json"
            entry = json.loads(contents[path])
            entry["identity"] = "injected wrong type"
            contents[path] = canonical_bytes(entry)
            manifest = json.loads(contents["manifest.json"])
            manifest["members"][path] = {"sha256": digest(contents[path]), "size": len(contents[path])}
            contents["manifest.json"] = canonical_bytes(manifest)
        hostile = self.repack(destination, "typed-hostile.zip", malicious_type)
        target = self.directory / "rejected-typed-import"
        self.invoke(self.request("import", {"source": str(hostile)}, root=target), "error")
        self.assertFalse(list((target / "records").glob("*.json")))

    def test_selected_record_export_restores_without_leaking_other_record_or_batch_receipt(self):
        first = self.save()["data"]
        other = copy.deepcopy(FIXTURE)
        other["observations"][0]["response"] = "Unselected private synthetic response"
        second = self.save(other)["data"]
        destination = self.directory / "one-record.zip"
        self.invoke(self.request("export", {"record_ids": [first["record_id"]], "destination": str(destination)}))
        with zipfile.ZipFile(destination) as package:
            self.assertNotIn(f"records/{second['record_id']}.json", package.namelist())
            for name in package.namelist():
                self.assertNotIn(b"Unselected private synthetic response", package.read(name))
        restored = self.directory / "one-record-restored"
        self.invoke(self.request("import", {"source": str(destination)}, root=restored))
        self.assertEqual(len(self.invoke(self.request("list", {}, root=restored))["data"]["records"]), 1)
        self.invoke(self.request("archive", {"record_ids": [first["record_id"], second["record_id"]], "reason": "A synthetic batch operation"}))
        blocked_destination = self.directory / "unapproved-batch-scope.zip"
        blocked = self.invoke(self.request("export", {"record_ids": [first["record_id"]], "destination": str(blocked_destination)}), "blocked")
        self.assertEqual(blocked["errors"][0]["code"], "export_scope_conflict")
        self.assertFalse(blocked_destination.exists())

    def test_structural_types_unknown_schema_and_incomplete_baseline_fail(self):
        mutations = [lambda record: record.update(schema_version=2), lambda record: record.update(schema_version=True),
                     lambda record: record.update(observations={}), lambda record: record.update(record_version=True),
                     lambda record: record["requirement_baseline"].update(content="Only a live path", sha256="0" * 64),
                     lambda record: record["task"].update(issue="123"), lambda record: record.update(record_id="../escape"),
                     lambda record: record.update(occurred_at="2026-10-12T04Z"),
                     lambda record: record.pop("operator")]
        for mutate in mutations:
            with self.subTest(mutation=mutate):
                record = copy.deepcopy(FIXTURE)
                mutate(record)
                self.invoke(self.request("save", {"record": record}), "error")
        self.assertFalse(list((self.library / "records").glob("*.json")))

    def test_application_requires_actual_explanation_and_existing_materials(self):
        original = self.save()["data"]
        check = self.get(original["record_id"])["record"]
        check.update(record_id=None, kind="application_check", quiz_status="not_applicable", related_record_ids=[original["record_id"]])
        check["application"] = {"scope": {"task_id": check["task"]["task_id"], "repository": "synthetic-owner/example", "number": 100},
                                "explanation": None, "respondent_id": "synthetic-person-1", "expectations": [], "materials": [],
                                "code_version": check["code_version"], "affected_ku_ids": ["KU-1"]}
        check["conclusions"]["knowledge_application"].update(status="supported", rationale="Expected to be supported")
        self.invoke(self.request("save", {"record": check}), "error")
        check["conclusions"]["knowledge_application"]["status"] = "not_run"
        self.save(check)
        check["record_id"] = None
        check["application"]["explanation"] = "Synthetic explanation of actual choices and limits"
        check["application"]["scope"].update(base=check["code_version"]["base"], head=check["code_version"]["head"])
        check["application"]["materials"] = [{"locator": "fixture:test-result", "version": "synthetic-head", "observed_result": "Synthetic checks passed", "content": "Retained synthetic result content"}]
        check["conclusions"]["knowledge_application"]["status"] = "supported"
        self.save(check)

    def test_repeated_question_text_counts_new_ids_but_supported_repeat_reuses_id(self):
        record = copy.deepcopy(FIXTURE)
        record["observations"] = [{**record["observations"][0], "id": f"observation-{number}", "question_id": f"question-{number}"} for number in range(6)]
        self.invoke(self.request("save", {"record": record}), "error")
        record["observations"] = record["observations"][:5]
        repeat = copy.deepcopy(record["observations"][0])
        repeat.update(id="supported-repeat", stage="supported", response="A response after help", support=[{"kind": "hint", "provider": "synthetic-agent", "content": "Synthetic hint"}])
        record["observations"].append(repeat)
        self.save(record)

    def test_application_version_mismatch_or_unknown_head_cannot_be_supported(self):
        original = self.save()["data"]
        check = self.get(original["record_id"])["record"]
        check.update(record_id=None, kind="application_check", quiz_status="not_applicable", related_record_ids=[original["record_id"]])
        check["application"] = {"scope": {"task_id": check["task"]["task_id"], "repository": check["code_version"]["repository"], "base": check["code_version"]["base"], "head": check["code_version"]["head"]},
                                "explanation": "Actual synthetic explanation", "respondent_id": "synthetic-person-1", "expectations": [],
                                "materials": [{"locator": "fixture:test", "version": "synthetic-head", "observed_result": "passed", "content": "Synthetic result"}],
                                "code_version": copy.deepcopy(check["code_version"]), "affected_ku_ids": ["KU-1"]}
        check["conclusions"]["knowledge_application"].update(status="supported", rationale="Synthetic supported range")
        changed = copy.deepcopy(check)
        changed["application"]["code_version"]["head"] = "different-head"
        self.invoke(self.request("save", {"record": changed}), "error")
        changed = copy.deepcopy(check)
        changed["application"]["scope"]["head"] = "different-head"
        self.invoke(self.request("save", {"record": changed}), "error")
        changed = copy.deepcopy(check)
        changed["application"]["code_version"]["head"] = None
        changed["code_version"]["head"] = None
        changed["application"]["scope"]["head"] = None
        self.invoke(self.request("save", {"record": changed}), "error")

    def test_check_record_applicability_is_separate_from_learning_verdict(self):
        saved = self.save()["data"]
        response = self.invoke(self.request("check_record", {"record_id": saved["record_id"], "responsible_person_id": "someone-else", "task_id": "task-other", "ku_ids": ["KU-other"], "code_version": {"repository": "synthetic-owner/example", "base": "changed", "head": "changed", "paths": []}}), "partial")
        self.assertEqual({gap["code"] for gap in response["gaps"]}, {"identity_mismatch", "task_mismatch", "ku_mismatch", "version_review_required"})
        self.assertEqual(response["data"]["knowledge_application"], "not_inferred")

    def test_archive_retains_history_and_full_export_import(self):
        saved = self.save()["data"]
        self.invoke(self.request("archive", {"record_ids": [saved["record_id"]], "reason": "Synthetic case completed"}))
        self.assertEqual(self.invoke(self.request("list", {}))["data"]["records"], [])
        self.assertEqual(len(self.invoke(self.request("list", {"include_archived": True}))["data"]["records"]), 1)
        destination = self.directory / "complete-backup.zip"
        exported = self.invoke(self.request("export", {"record_ids": [saved["record_id"]], "destination": str(destination)}))
        self.assertEqual(hashlib.sha256(destination.read_bytes()).hexdigest(), exported["data"]["sha256"])
        restored_root = self.directory / "restored-user-data"
        imported = self.invoke(self.request("import", {"source": str(destination)}, root=restored_root))
        self.assertEqual(imported["data"]["record_ids"], [saved["record_id"]])
        restored = self.invoke(self.request("get", {"record_id": saved["record_id"]}, root=restored_root))["data"]
        self.assertEqual(restored["record"], self.get(saved["record_id"])["record"])
        self.assertTrue(restored["archives"])
        self.invoke(self.request("import", {"source": str(destination)}, root=restored_root))

    def repack(self, original, name, mutate):
        with zipfile.ZipFile(original) as source:
            contents = {entry.filename: source.read(entry) for entry in source.infolist()}
        mutate(contents)
        destination = self.directory / name
        with zipfile.ZipFile(destination, "w", compression=zipfile.ZIP_DEFLATED) as package:
            for path, raw in contents.items():
                package.writestr(path, raw)
        return destination

    def test_import_rejects_traversal_symlink_digest_schema_and_conflict_before_writes(self):
        saved = self.save()["data"]
        original = self.directory / "original.zip"
        self.invoke(self.request("export", {"record_ids": [saved["record_id"]], "destination": str(original)}))
        malicious = self.repack(original, "traversal.zip", lambda content: content.update({"../outside.json": b"{}"}))
        corrupt = self.repack(original, "digest.zip", lambda content: content.update({f"records/{saved['record_id']}.json": b"{}"}))
        def unknown(content):
            manifest = json.loads(content["manifest.json"])
            manifest["schema_version"] = 99
            content["manifest.json"] = canonical_bytes(manifest)
        unknown_zip = self.repack(original, "unknown.zip", unknown)
        symlink_zip = self.directory / "symlink.zip"
        with zipfile.ZipFile(symlink_zip, "w") as package:
            info = zipfile.ZipInfo("records/link.json")
            info.create_system = 3
            info.external_attr = 0o120777 << 16
            package.writestr(info, b"../outside")
        for source in (malicious, corrupt, unknown_zip, symlink_zip):
            root = self.directory / f"reject-{source.stem}"
            self.invoke(self.request("import", {"source": str(source)}, root=root), "error")
            self.assertFalse(list((root / "records").glob("*.json")))
        conflict_root = self.directory / "conflicting-user-data"
        record = self.get(saved["record_id"])["record"]
        record["observations"][0]["response"] = "Another original at the same ID"
        self.invoke(self.request("save", {"record": record}, root=conflict_root))
        response = self.invoke(self.request("import", {"source": str(original)}, root=conflict_root), "error")
        self.assertEqual(response["errors"][0]["code"], "import_conflict")

    def test_import_rejects_second_original_learning_root_from_another_library(self):
        first = copy.deepcopy(FIXTURE)
        first.update(record_id="rec-first-root", evidence_id="ev-shared-event")
        first["task"]["task_id"] = "task-shared"
        self.save(first)
        second = copy.deepcopy(first)
        second["record_id"] = "rec-second-root"
        second["observations"][0]["response"] = "A different original observation in another isolated library"
        other_library = self.directory / "other-synthetic-library"
        self.invoke(self.request("save", {"record": second}, root=other_library))
        package = self.directory / "other-root.zip"
        self.invoke(self.request("export", {"record_ids": [second["record_id"]], "destination": str(package)}, root=other_library))
        before = {path.name: path.read_bytes() for path in (self.library / "records").glob("*.json")}
        response = self.invoke(self.request("import", {"source": str(package)}), "error")
        self.assertEqual(response["errors"][0]["code"], "import_conflict")
        self.assertEqual({path.name: path.read_bytes() for path in (self.library / "records").glob("*.json")}, before)
        self.assertEqual(self.invoke(self.request("list", {}))["data"]["unique_learning_events"], 1)
        self.assertEqual(len(self.invoke(self.request("list", {}))["data"]["records"]), 1)
        self.assertEqual(self.get(first["record_id"])["record"], first)

    def test_import_rejects_save_receipt_digest_even_with_valid_zip_member_digest(self):
        saved = self.save()["data"]
        package = self.directory / "valid-receipt-package.zip"
        self.invoke(self.request("export", {"record_ids": [saved["record_id"]], "destination": str(package)}))
        def corrupt_save_receipt(contents):
            for name, raw in contents.items():
                if name.startswith("receipts/") and name.count("/") == 1:
                    event = json.loads(raw)
                    if event.get("operation") == "save":
                        event["sha256"] = "0" * 64
                        contents[name] = canonical_bytes(event)
                        manifest = json.loads(contents["manifest.json"])
                        manifest["members"][name] = {"sha256": digest(contents[name]), "size": len(contents[name])}
                        contents["manifest.json"] = canonical_bytes(manifest)
                        return
            self.fail("Complete export lacks its original save receipt")
        corrupt = self.repack(package, "dishonest-save-receipt.zip", corrupt_save_receipt)
        destination = self.directory / "reject-receipt-library"
        response = self.invoke(self.request("import", {"source": str(corrupt)}, root=destination), "error")
        self.assertEqual(response["errors"][0]["code"], "invalid_import")
        self.assertFalse(list((destination / "records").glob("*.json")))
        self.invoke(self.request("import", {"source": str(package)}, root=destination))
        restored = self.invoke(self.request("get", {"record_id": saved["record_id"]}, root=destination))["data"]["record"]
        self.assertEqual(restored, self.get(saved["record_id"])["record"])

    def test_one_json_contract_duplicate_keys_and_unavailable_github(self):
        for raw in ('{}{}', '{"schema_version":1,"schema_version":1,"operation":"list","input":{}}'):
            process = subprocess.run([sys.executable, str(LEK)], input=raw, text=True, capture_output=True, cwd=self.unrelated, timeout=15)
            response = json.loads(process.stdout)
            self.assertEqual(process.returncode, 1)
            self.assertEqual(response["errors"][0]["code"], "invalid_json")
        if not (PACKAGE / "github_flow.py").exists():
            self.assertEqual(self.invoke(self.request("publish", {}), "blocked")["errors"][0]["code"], "operation_unavailable")


if __name__ == "__main__":
    assert sys.version_info[:2] == (3, 12)
    unittest.main(verbosity=2)
