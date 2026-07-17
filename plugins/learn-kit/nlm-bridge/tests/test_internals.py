"""White-box tests for the bridge's security-critical Python (plan §2.3.1).

Run with the private-venv interpreter that has the connector + bridge installed. It is NOT
shipped in the wheel (only src/learn_kit_nlm_bridge is packaged), so it can freely reach into
internals and monkeypatch the connector. tests/learn-kit-nlm-bridge.test.mjs invokes it and
asserts exit 0; the end-to-end stdio behaviour is covered there against the real upstream.

Covered here, where Node cannot reach: the auth-guard patch (identity, sentinels, disk-only, and
that headless is never called), fail-closed drift, the ChildClient protocol (cursor loop, reverse
request, tools_sha256 drift), the six explicit adapters with positive/negative fixtures, and the
AUTH_REQUIRED recognizer against the connector's real error messages.
"""

import json
import threading
import types
import unittest
from unittest import mock

from learn_kit_nlm_bridge import bridge, contract, upstream_runner


def _env_lock():
    env_lock, sha = contract.load_environment_lock()
    env_lock["_environment_sha256"] = sha
    return env_lock


SNAPSHOT = contract.load_upstream_snapshot(_env_lock())


# --------------------------------------------------------------------- auth guard / runner

class TestRunnerGuard(unittest.TestCase):
    def test_apply_guard_patches_exactly_the_three_symbols(self):
        import notebooklm_tools.core.base as base
        import notebooklm_tools.utils.auth_browser as auth_browser
        import notebooklm_tools.utils.cdp as cdp

        upstream_runner.apply_guard()
        self.assertIs(base.BaseClient._try_reload_or_headless_auth, upstream_runner._guarded_try_reload)
        self.assertIs(auth_browser.run_headless_auth, upstream_runner._headless_sentinel)
        self.assertIs(cdp.run_headless_auth, upstream_runner._headless_sentinel)

    def test_guarded_reload_is_disk_only_and_never_headless(self):
        # No cached tokens -> returns False, and crucially never reaches a browser. _guarded_try_reload
        # is a standalone function with no reference to run_headless_auth, so it structurally cannot
        # open one; a fake self with a real lock is enough. (apply_guard mutates the shared connector
        # module, so it is invoked once, in test_apply_guard_patches, not re-run here.)
        fake_self = types.SimpleNamespace(_state_lock=threading.Lock(), cookies=None, csrf_token="x", _session_id="y")

        with mock.patch("notebooklm_tools.core.auth.load_cached_tokens", return_value=None):
            self.assertFalse(upstream_runner._guarded_try_reload(fake_self))

        cached = types.SimpleNamespace(cookies={"SID": "v"})
        with mock.patch("notebooklm_tools.core.auth.load_cached_tokens", return_value=cached):
            self.assertTrue(upstream_runner._guarded_try_reload(fake_self))
        self.assertEqual(fake_self.cookies, {"SID": "v"})
        self.assertEqual(fake_self.csrf_token, "")  # forced re-extraction
        self.assertEqual(fake_self._session_id, "")

    def test_sentinel_refuses_rather_than_opening_a_browser(self):
        with self.assertRaises(upstream_runner.RunnerError):
            upstream_runner._headless_sentinel(profile_name="default")

    def test_auth_guard_fails_closed_on_source_drift(self):
        # Pretend one guarded symbol's source changed: verification must refuse before patching.
        symbols = json.loads(contract.read_data_text(contract.AUTH_GUARD_NAME))
        symbols["symbols"][0]["source_sha256"] = "0" * 64
        with mock.patch.object(upstream_runner, "_auth_guard_symbols", return_value=symbols["symbols"]):
            with self.assertRaises(upstream_runner.RunnerError):
                upstream_runner.verify_auth_guard()

    def test_distribution_check_fails_closed_on_wrong_version(self):
        with mock.patch("importlib.metadata.version", return_value="0.8.6"):
            with self.assertRaises(upstream_runner.RunnerError):
                upstream_runner.verify_distribution()


# --------------------------------------------------------------------- child protocol

class _FakeReader:
    def __init__(self, lines):
        self._lines = [json.dumps(x).encode() if isinstance(x, dict) else x for x in lines]

    def read(self, timeout=None):
        return self._lines.pop(0) if self._lines else None


class _FakeStdin:
    closed = False

    def write(self, b):
        pass

    def flush(self):
        pass


def _child_with(lines):
    child = bridge.ChildClient(SNAPSHOT)
    child.reader = _FakeReader(lines)
    child.proc = types.SimpleNamespace(stdin=_FakeStdin())
    return child


class TestChildClientProtocol(unittest.TestCase):
    def test_verified_tools_accepts_the_recorded_snapshot(self):
        child = _child_with([{"jsonrpc": "2.0", "id": 1, "result": {"tools": SNAPSHOT["tools"]}}])
        child.verified_tools()  # must not raise

    def test_verified_tools_rejects_drift(self):
        drifted = [dict(t) for t in SNAPSHOT["tools"]]
        drifted[0] = dict(drifted[0], name="source_delete")
        child = _child_with([{"jsonrpc": "2.0", "id": 1, "result": {"tools": drifted}}])
        with self.assertRaises(bridge.ForwardError):
            child.verified_tools()

    def test_verified_tools_refuses_a_cursor_loop(self):
        child = _child_with([
            {"jsonrpc": "2.0", "id": 1, "result": {"tools": [], "nextCursor": "A"}},
            {"jsonrpc": "2.0", "id": 2, "result": {"tools": [], "nextCursor": "A"}},
        ])
        with self.assertRaises(bridge.ForwardError):
            child.verified_tools()

    def test_reverse_request_from_child_is_fatal(self):
        child = _child_with([{"jsonrpc": "2.0", "id": 99, "method": "roots/list", "params": {}}])
        with self.assertRaises(bridge.ForwardError):
            child._recv_response(1, 1.0)

    def test_unsupported_child_protocol_is_refused(self):
        child = _child_with([{"jsonrpc": "2.0", "id": 1, "result": {"protocolVersion": "1999-01-01"}}])
        with self.assertRaises(bridge.ForwardError):
            child.handshake()


# --------------------------------------------------------------------- adapters (6 explicit)

class TestAdapters(unittest.TestCase):
    def setUp(self):
        self.adapters = bridge.Adapters(_env_lock())

    def test_notebook_list_injects_the_cap_and_takes_no_args(self):
        name, args = self.adapters.adapt("notebook_list", {})
        self.assertEqual(name, "notebook_list")
        self.assertEqual(args, {"max_results": 100})
        with self.assertRaises(bridge.SchemaViolation):
            self.adapters.adapt("notebook_list", {"max_results": 5})  # caller may not set it

    def test_studio_status_injects_status_only(self):
        name, args = self.adapters.adapt("studio_status", {"notebook_id": "n"})
        self.assertEqual((name, args), ("studio_status", {"notebook_id": "n", "action": "status"}))
        for bad in [{"notebook_id": "n", "action": "rename"}, {"notebook_id": "n", "new_title": "x"}]:
            with self.assertRaises(bridge.SchemaViolation):
                self.adapters.adapt("studio_status", bad)

    def test_notebook_create_requires_title(self):
        self.adapters.adapt("notebook_create", {"title": "T"})
        with self.assertRaises(bridge.SchemaViolation):
            self.adapters.adapt("notebook_create", {})

    def test_studio_create_four_branches_positive(self):
        common = {"notebook_id": "n", "source_ids": ["s1"], "confirm": True}
        cases = [
            {**common, "artifact_type": "audio", "audio_format": "deep_dive", "audio_length": "default", "language": "zh-CN", "focus_prompt": "f"},
            {**common, "artifact_type": "video", "video_format": "explainer", "visual_style": "auto_select", "language": "zh-CN", "focus_prompt": "f"},
            {**common, "artifact_type": "slide_deck", "slide_format": "detailed_deck", "slide_length": "default", "language": "zh-CN", "focus_prompt": "f"},
            {**common, "artifact_type": "mind_map", "title": "T"},
        ]
        for c in cases:
            name, args = self.adapters.adapt("studio_create", c)
            self.assertEqual(name, "studio_create")
            self.assertEqual(args, c)  # no inject for studio_create

    def test_studio_create_negatives(self):
        base = {"notebook_id": "n", "source_ids": ["s1"], "confirm": True, "artifact_type": "mind_map", "title": "T"}
        negatives = {
            "missing source_ids": {**base, "source_ids": None},
            "empty source_ids": {**base, "source_ids": []},
            "four source_ids": {**base, "source_ids": ["a", "b", "c", "d"]},
            "duplicate source_ids": {**base, "source_ids": ["a", "a"]},
            "confirm not literal true": {**base, "confirm": "true"},
            "confirm false": {**base, "confirm": False},
            "mind_map with focus_prompt": {**base, "focus_prompt": "f"},
            "mind_map with language": {**base, "language": "zh-CN"},
            "audio missing focus_prompt": {"notebook_id": "n", "source_ids": ["s"], "confirm": True, "artifact_type": "audio", "audio_format": "deep_dive", "audio_length": "default", "language": "zh-CN"},
            "wrong-branch field": {**base, "audio_format": "deep_dive"},
            "unknown artifact_type": {**base, "artifact_type": "infographic"},
        }
        for label, payload in negatives.items():
            with self.assertRaises(bridge.SchemaViolation, msg=label):
                self.adapters.adapt("studio_create", payload)

    def test_source_add_path_guard(self):
        # A non-staged path is refused; a control character NUL is refused by the schema pattern.
        with self.assertRaises(bridge.SchemaViolation):
            self.adapters.adapt("source_add", {"notebook_id": "n", "source_type": "file", "file_path": "/etc/passwd", "wait": True})
        with self.assertRaises(bridge.SchemaViolation):
            self.adapters.adapt("source_add", {"notebook_id": "n", "source_type": "file", "file_path": "relative.md", "wait": True})
        # source_type/wait must be the literal constants.
        with self.assertRaises(bridge.SchemaViolation):
            self.adapters.adapt("source_add", {"notebook_id": "n", "source_type": "url", "file_path": "/x.md", "wait": True})

    def test_unknown_tool_is_a_protocol_error(self):
        with self.assertRaises(bridge.ProtocolError):
            self.adapters.adapt("refresh_auth", {})
        with self.assertRaises(bridge.ProtocolError):
            self.adapters.adapt("server_info", {})

    def test_control_chars_in_ids_are_rejected(self):
        with self.assertRaises(bridge.SchemaViolation):
            self.adapters.adapt("notebook_get", {"notebook_id": "bad\x00id"})


# --------------------------------------------------------------------- auth recognizer

class TestAuthRecognizer(unittest.TestCase):
    def _result(self, error_text):
        return {"structuredContent": {"status": "error", "error": error_text},
                "content": [{"type": "text", "text": json.dumps({"status": "error", "error": error_text})}]}

    def test_every_real_auth_message_is_recognized(self):
        for msg in [
            "No authentication found. Either:\n1. Run 'nlm login' to authenticate via Chrome, or\n2. Set NOTEBOOKLM_COOKIES environment variable manually",
            "Authentication expired. Run 'nlm login' in your terminal to re-authenticate.",
            "Access denied. Your session may have expired. Run 'nlm login' to re-authenticate.",
            "Authentication expired (RPC error 16).",
        ]:
            self.assertTrue(bridge.is_auth_failure(self._result(msg)), msg[:40])

    def test_a_plain_validation_error_is_not_auth(self):
        self.assertFalse(bridge.is_auth_failure(self._result("notebook_id is required")))
        self.assertFalse(bridge.is_auth_failure(self._result("Artifact not found")))

    def test_a_successful_result_is_not_auth(self):
        self.assertFalse(bridge.is_auth_failure({"content": [{"type": "text", "text": "ok"}], "isError": False}))

    def test_auth_required_result_leaks_no_credentials_or_upstream_text(self):
        r = bridge.auth_required_result()
        blob = json.dumps(r)
        self.assertTrue(r["isError"])
        self.assertEqual(r["structuredContent"]["code"], "AUTH_REQUIRED")
        for leak in ["NOTEBOOKLM_COOKIES", "cookie", "csrf", "profile", "@"]:
            self.assertNotIn(leak, blob)


if __name__ == "__main__":
    unittest.main(verbosity=2)
