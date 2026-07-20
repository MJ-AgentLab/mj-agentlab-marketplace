"""The guarded upstream child (plan §2.3.1, §2.5).

bridge.py spawns this as `sys.executable -I -X utf8 -m learn_kit_nlm_bridge.upstream_runner` on
the first legal tools/call. Before it lets a single byte reach the network it:

  1. confirms notebooklm-mcp-cli is exactly 0.8.7 (importlib.metadata);
  2. re-hashes the canonical-LF source of the four auth-recovery symbols and matches them against
     the checked-in upstream-auth-guard snapshot — the same fingerprints the snapshot tool took;
  3. only on an exact match, replaces BaseClient._try_reload_or_headless_auth with a
     disk-reload-only implementation and BOTH run_headless_auth entry points with fail-closed
     sentinels, so a stale / none / 401 / 403 / RPC16 recovery can reload cookies a user saved
     with `nlm login`, but can NEVER open a browser;
  4. runpy-launches notebooklm_tools.mcp.server, which reads the pinned NOTEBOOKLM_* env the
     parent injected and speaks MCP over this process's stdio.

Any drift — wrong version, a changed symbol, a missing module — fails closed here, before the
server is launched. Both call sites of run_headless_auth import it lazily inside the function, so
replacing the module attribute before any call is what makes the guard bite.

In --audit mode (CI / manual conformance only) it installs a record-only audit hook BEFORE
importing upstream, so a probe can attest zero browser / subprocess / network. Enforcement is the
patch and the sentinels; the audit is evidence, and the probe's OS-level monitor is authoritative.
"""

from __future__ import annotations

import hashlib
import importlib
import importlib.metadata
import inspect
import json
import runpy
import sys

from . import contract

CONNECTOR_DIST = "notebooklm-mcp-cli"


class RunnerError(Exception):
    """A pre-launch guard failed. The child must exit before any upstream network call."""


def _canonical_source(fn: object) -> str:
    """Source with line endings normalized to LF, matching canonical_source() in the snapshot
    tool — so the fingerprint describes the code, not the checkout that unpacked the wheel."""
    return inspect.getsource(fn).replace("\r\n", "\n").replace("\r", "\n")


def _resolve(module_name: str, dotted: str) -> object:
    obj = importlib.import_module(module_name)
    for part in dotted.split("."):
        obj = getattr(obj, part, None)
        if obj is None:
            raise RunnerError(f"{module_name}.{dotted} is missing from the installed connector")
    return obj


def _auth_guard_symbols() -> list[dict]:
    doc = json.loads(contract.read_data_text(contract.AUTH_GUARD_NAME))
    symbols = doc.get("symbols")
    if not isinstance(symbols, list) or not symbols:
        raise RunnerError("auth-guard snapshot has no symbols")
    return symbols


def verify_distribution() -> None:
    try:
        version = importlib.metadata.version(CONNECTOR_DIST)
    except importlib.metadata.PackageNotFoundError as e:
        raise RunnerError(f"{CONNECTOR_DIST} is not installed in this environment") from e
    if version != contract.CONNECTOR_VERSION:
        raise RunnerError(f"{CONNECTOR_DIST} {version} != pinned {contract.CONNECTOR_VERSION}")


def verify_auth_guard() -> None:
    """Re-hash the four auth-recovery symbols and match the checked-in snapshot, or fail closed."""
    for sym in _auth_guard_symbols():
        fn = _resolve(sym["module"], sym["qualname"])
        actual = hashlib.sha256(_canonical_source(fn).encode("utf-8")).hexdigest()
        if actual != sym.get("source_sha256"):
            raise RunnerError(
                f"{sym['module']}.{sym['qualname']} source has drifted "
                f"({actual} != {sym.get('source_sha256')}); refusing to patch a changed auth path"
            )


def _guarded_try_reload(self) -> bool:
    """Replacement for BaseClient._try_reload_or_headless_auth: disk reload only, never headless.

    Keeps the connector's legitimate recovery — reload cookies a user saved with `nlm login` and
    force a fresh CSRF/session extraction — but drops the headless-Chrome fallback entirely. It
    relies on load_cached_tokens staying disk-only, which verify_auth_guard fingerprints.
    """
    from notebooklm_tools.core.auth import load_cached_tokens

    cached = load_cached_tokens()
    if cached and cached.cookies:
        with self._state_lock:
            self.cookies = cached.cookies
            self.csrf_token = ""
            self._session_id = ""
        return True
    return False


def _headless_sentinel(*args, **kwargs):
    """Fail-closed stand-in for run_headless_auth. It must never run in normal operation; if it
    is ever reached, it refuses rather than opening a browser."""
    raise RunnerError("headless auth is disabled by the learn-kit NLM bridge")


def apply_guard() -> None:
    """Verify, then patch. Fingerprints are taken on the originals, before any swap."""
    verify_distribution()
    verify_auth_guard()

    import notebooklm_tools.core.base as base
    import notebooklm_tools.utils.auth_browser as auth_browser
    import notebooklm_tools.utils.cdp as cdp

    base.BaseClient._try_reload_or_headless_auth = _guarded_try_reload
    auth_browser.run_headless_auth = _headless_sentinel
    cdp.run_headless_auth = _headless_sentinel


# --------------------------------------------------------------- audit (conformance only)

class AuditRecorder:
    """Record-only sys.audit hook: names of network / process / browser events, never their
    arguments (which could carry cookies or paths). Evidence for a conformance probe, installed
    before upstream is imported. It does not block — the probe's OS-level monitor does."""

    INTEREST = (
        "socket.", "subprocess.", "os.exec", "os.fork", "os.posix_spawn", "os.spawn",
        "urllib.", "http.client.", "ssl.", "webbrowser",
    )

    def __init__(self) -> None:
        self.events: list[str] = []

    def _hook(self, event: str, args: tuple) -> None:
        if event.startswith(self.INTEREST):
            self.events.append(event)

    def install(self) -> None:
        sys.addaudithook(self._hook)

    def dump(self, path: str) -> None:
        import collections

        counts = collections.Counter(self.events)
        with open(path, "w", encoding="utf-8", newline="\n") as f:
            f.write(contract.canonical_json({"events": dict(sorted(counts.items()))}))


def run_guarded_server(audit_path: str | None = None) -> int:
    audit = None
    if audit_path:
        audit = AuditRecorder()
        audit.install()  # before importing upstream, so nothing escapes the record

    try:
        apply_guard()
    except RunnerError as e:
        sys.stderr.write(f"learn-kit-nlm-bridge upstream_runner: {e}\n")
        if audit:
            audit.dump(audit_path)
        return 1

    # Clean argv so the server's argparse sees no stray runner arguments; it reads the transport
    # from NOTEBOOKLM_MCP_TRANSPORT (stdio) that the parent injected.
    sys.argv = ["notebooklm-mcp-server"]
    try:
        runpy.run_module("notebooklm_tools.mcp.server", run_name="__main__", alter_sys=True)
    finally:
        if audit:
            audit.dump(audit_path)
    return 0


def main(argv: list[str]) -> int:
    rest = list(argv)
    audit_path = None
    if len(rest) >= 2 and rest[0] == "--audit":
        audit_path = rest[1]
        rest = rest[2:]
    if rest:
        sys.stderr.write("learn-kit-nlm-bridge upstream_runner: unexpected arguments\n")
        return 2
    return run_guarded_server(audit_path)


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
