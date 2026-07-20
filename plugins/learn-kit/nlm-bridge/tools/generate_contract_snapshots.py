#!/usr/bin/env python3
"""Fingerprint the pinned NotebookLM connector into checked-in contract snapshots.

Invoked by scripts/generate-nlm-contract.mjs in `snapshots` mode, using the interpreter of a
throwaway venv that has the locked closure installed with --require-hashes. It writes:

  _data/upstream-tools-v0.8.7.json       what v0.8.7 really advertises under the pinned env
  _data/upstream-auth-guard-v0.8.7.json  the source fingerprints of the auth-recovery path

Both exist for exact drift detection. The bridge refuses to talk to an upstream that does not
match them, so a connector that quietly grew a tool, widened a schema, or reshaped its auth
recovery fails closed instead of being forwarded to.

  usage: python generate_contract_snapshots.py --out <dir> --connector-version 0.8.7

Exit 0 = wrote both snapshots, 2 = bad input or wrong environment.

WHY DRIVE THE REAL SERVER RATHER THAN INTROSPECT THE TOOL REGISTRY: the thing the bridge
compares against at runtime is a tools/list response over stdio, so that is what gets
recorded. Introspecting FastMCP's registry would capture a similar-looking structure that
had never been through MCP serialization, and any difference between the two would show up
as drift against a real server. Measured: initialize + tools/list on v0.8.7 needs no
credentials and makes no network call, so this stays a local, offline fingerprint.

STDLIB ONLY, and the upstream import is confined to the auth-guard pass. Nothing here runs
`nlm login`, touches a real profile, or reaches the network.
"""

from __future__ import annotations

import argparse
import hashlib
import importlib.metadata
import inspect
import json
import os
import pathlib
import queue
import subprocess
import sys
import tempfile
import threading

# The exact environment the bridge will hand its child. It is reproduced here because it is
# what decides which tools appear: all 14 upstream groups off, then exactly 6 tools back on.
# Recorded into the snapshot so the bridge can assert it is fingerprinting like-for-like —
# a snapshot taken under a different env would describe a different tool surface.
PINNED_ENV = {
    "NOTEBOOKLM_MCP_TRANSPORT": "stdio",
    "NOTEBOOKLM_MCP_DEBUG": "",
    "NOTEBOOKLM_BASE_URL": "https://notebooklm.google.com",
    "NOTEBOOKLM_RPC_TRANSPORT": "",
    "NOTEBOOKLM_RPC_OVERRIDES": "",
    "NOTEBOOKLM_COOKIES": "",
    "NOTEBOOKLM_CSRF_TOKEN": "",
    "NOTEBOOKLM_SESSION_ID": "",
    "NOTEBOOKLM_DISABLED_GROUPS": (
        "notebooks_read,notebooks_manage,sources_read,sources_manage,chat,query_multi,"
        "organization,automation,notes,auth,server,sharing,research,studio"
    ),
    "NOTEBOOKLM_ENABLED_TOOLS": (
        "notebook_list,notebook_get,notebook_create,source_add,studio_create,studio_status"
    ),
}

PUBLIC_TOOLS = (
    "notebook_create",
    "notebook_get",
    "notebook_list",
    "source_add",
    "studio_create",
    "studio_status",
)

PROTOCOL_VERSION = "2025-06-18"

# Every symbol the bridge's runner touches on the auth-recovery path, and why it cares.
#   replaced    — the runner swaps this out for a disk-reload-only implementation.
#   sentinel    — the runner replaces this with a fail-closed stub; it must never run.
#   depended_on — the runner's own replacement calls this and relies on it staying disk-only.
# A drift in any of them means the bridge's reasoning about the auth path no longer holds,
# so all four are fingerprinted and any change fails closed before the network is touched.
AUTH_GUARD_SYMBOLS = (
    ("notebooklm_tools.core.base", "BaseClient._try_reload_or_headless_auth", "replaced"),
    ("notebooklm_tools.core.auth", "load_cached_tokens", "depended_on"),
    ("notebooklm_tools.utils.auth_browser", "run_headless_auth", "sentinel"),
    ("notebooklm_tools.utils.cdp", "run_headless_auth", "sentinel"),
)

DIST = "notebooklm-mcp-cli"


class ToolError(Exception):
    """Anything that should stop generation with exit 2."""


def canonical_json(obj: object) -> str:
    """The one serialization used for every generated snapshot.

    sort_keys makes regeneration byte-stable regardless of dict insertion order; ensure_ascii
    keeps the file pure ASCII so its bytes — and therefore its SHA-256 — cannot depend on an
    encoding assumption. LF and exactly one trailing newline; .gitattributes pins that on
    checkout so the hash survives a Windows clone.
    """
    return json.dumps(obj, indent=2, sort_keys=True, ensure_ascii=True) + "\n"


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def canonical_source(fn: object) -> str:
    """Source with line endings normalized to LF.

    The fingerprint must describe the code, not the checkout that produced the wheel. Without
    this, the same connector release would fingerprint differently depending on how it was
    unpacked.
    """
    return inspect.getsource(fn).replace("\r\n", "\n").replace("\r", "\n")


def resolve_attr(module_name: str, dotted: str) -> object:
    import importlib

    obj = importlib.import_module(module_name)
    for part in dotted.split("."):
        obj = getattr(obj, part, None)
        if obj is None:
            raise ToolError(f"{module_name}.{dotted} does not exist in the installed connector")
    return obj


def verify_connector(expected: str) -> None:
    try:
        actual = importlib.metadata.version(DIST)
    except importlib.metadata.PackageNotFoundError as e:
        raise ToolError(f"{DIST} is not installed in this interpreter") from e
    if actual != expected:
        raise ToolError(f"snapshots describe {DIST}=={expected}, but {actual} is installed")


def _reader(stream, q: "queue.Queue[str | None]") -> None:
    for line in stream:
        q.put(line)
    q.put(None)


def capture_upstream_tools() -> dict:
    """Drive the real server over stdio and collect the full, paginated tools/list."""
    home = tempfile.mkdtemp(prefix="nlm-snapshot-home-")
    for sub in ("tmp", ".config", "AppData/Roaming", "AppData/Local"):
        pathlib.Path(home, sub).mkdir(parents=True, exist_ok=True)

    # Built from scratch, not inherited-then-filtered: an inherited NLM_*/PYTHON*/proxy value
    # could change what the server does and get baked into the snapshot.
    env: dict[str, str] = {}
    for key in ("SystemRoot", "WINDIR", "SYSTEMDRIVE", "COMSPEC", "PROCESSOR_ARCHITECTURE"):
        if key in os.environ:
            env[key] = os.environ[key]
    system_root = os.environ.get("SystemRoot", r"C:\Windows")
    env["PATH"] = os.path.join(system_root, "System32") if os.name == "nt" else "/usr/bin:/bin"
    env["HOME"] = home
    env["USERPROFILE"] = home
    env["APPDATA"] = os.path.join(home, "AppData", "Roaming")
    env["LOCALAPPDATA"] = os.path.join(home, "AppData", "Local")
    env["XDG_CONFIG_HOME"] = os.path.join(home, ".config")
    env["TEMP"] = os.path.join(home, "tmp")
    env["TMP"] = os.path.join(home, "tmp")
    env["PYTHONUTF8"] = "1"
    env.update(PINNED_ENV)

    proc = subprocess.Popen(
        [sys.executable, "-I", "-X", "utf8", "-m", "notebooklm_tools.mcp.server"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
        env=env,
        cwd=home,
        text=True,
        encoding="utf-8",
        bufsize=1,
    )
    q: "queue.Queue[str | None]" = queue.Queue()
    threading.Thread(target=_reader, args=(proc.stdout, q), daemon=True).start()

    def send(obj: dict) -> None:
        proc.stdin.write(json.dumps(obj) + "\n")
        proc.stdin.flush()

    def recv(timeout: float = 60.0) -> dict:
        while True:
            try:
                line = q.get(timeout=timeout)
            except queue.Empty:
                raise ToolError("timed out waiting for the connector to answer") from None
            if line is None:
                raise ToolError("the connector exited before answering")
            if line.strip():
                return json.loads(line)

    try:
        send(
            {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "initialize",
                "params": {
                    "protocolVersion": PROTOCOL_VERSION,
                    "capabilities": {},
                    "clientInfo": {"name": "learn-kit-nlm-bridge-snapshot", "version": "4.0.0"},
                },
            }
        )
        init = recv().get("result", {})
        send({"jsonrpc": "2.0", "method": "notifications/initialized"})

        tools: list[dict] = []
        cursor: str | None = None
        seen_cursors: set[str] = set()
        req_id = 2
        while True:
            params = {"cursor": cursor} if cursor else {}
            send({"jsonrpc": "2.0", "id": req_id, "method": "tools/list", "params": params})
            result = recv().get("result", {})
            tools.extend(result.get("tools", []))
            cursor = result.get("nextCursor")
            if not cursor:
                break
            # A server that keeps handing back a cursor it already used would page forever.
            if cursor in seen_cursors:
                raise ToolError(f"tools/list repeated cursor {cursor!r} — refusing to loop")
            seen_cursors.add(cursor)
            req_id += 1

        names = sorted(t["name"] for t in tools)
        if names != sorted(PUBLIC_TOOLS):
            raise ToolError(
                "the pinned env did not produce the expected 6-tool surface.\n"
                f"  expected: {sorted(PUBLIC_TOOLS)}\n  got:      {names}"
            )

        tools_sorted = sorted(tools, key=lambda t: t["name"])
        return {
            "protocol": {"requested": PROTOCOL_VERSION, "negotiated": init.get("protocolVersion")},
            "server_info": init.get("serverInfo", {}),
            "tools": tools_sorted,
        }
    finally:
        try:
            if proc.stdin and not proc.stdin.closed:
                proc.stdin.close()
            proc.wait(timeout=15)
        except Exception:
            proc.kill()


def capture_auth_guard(connector_version: str) -> dict:
    symbols = []
    for module_name, dotted, role in AUTH_GUARD_SYMBOLS:
        fn = resolve_attr(module_name, dotted)
        src = canonical_source(fn)
        symbols.append(
            {
                "module": module_name,
                "qualname": dotted,
                "role": role,
                "source_sha256": sha256_text(src),
                "source_lines": len(src.splitlines()),
            }
        )
    return {
        "format": "learn-kit-nlm-bridge/upstream-auth-guard",
        "format_version": 1,
        "connector_version": connector_version,
        "_comment": [
            "Source fingerprints of the connector's auth-recovery path.",
            "role=replaced: the runner substitutes a disk-reload-only implementation.",
            "role=sentinel: the runner substitutes a fail-closed stub that must never run.",
            "role=depended_on: the runner's replacement calls it and needs it to stay disk-only.",
            "Both call sites of run_headless_auth import it lazily inside the function, so",
            "replacing the module attribute before any call is what makes the guard effective.",
            "Any drift here fails closed before a single network call is made.",
        ],
        "symbols": sorted(symbols, key=lambda s: (s["module"], s["qualname"])),
    }


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(add_help=True)
    p.add_argument("--out", required=True, help="directory to write the two snapshots into")
    p.add_argument("--connector-version", required=True)
    try:
        args = p.parse_args(argv)
    except SystemExit:
        return 2

    try:
        verify_connector(args.connector_version)
        out = pathlib.Path(args.out)
        out.mkdir(parents=True, exist_ok=True)

        captured = capture_upstream_tools()
        tools_doc = {
            "format": "learn-kit-nlm-bridge/upstream-tools",
            "format_version": 1,
            "connector_version": args.connector_version,
            "_comment": [
                "Exactly what notebooklm-mcp-cli advertises over MCP under the pinned env below.",
                "Recorded from a real initialize + tools/list against the locked connector, with",
                "no credentials and no network. The bridge compares its child's tools/list to",
                "this and refuses to forward anything on drift.",
                "tools_sha256 covers the canonical form of the tools array alone, so the runner",
                "can check the surface with one comparison; the metadata around it can evolve",
                "without being mistaken for a schema change.",
            ],
            "pinned_env": PINNED_ENV,
            "protocol": captured["protocol"],
            "server_info": captured["server_info"],
            "tools": captured["tools"],
            "tools_sha256": sha256_text(canonical_json(captured["tools"])),
        }

        guard_doc = capture_auth_guard(args.connector_version)

        tools_path = out / f"upstream-tools-v{args.connector_version}.json"
        guard_path = out / f"upstream-auth-guard-v{args.connector_version}.json"
        tools_path.write_text(canonical_json(tools_doc), encoding="utf-8", newline="\n")
        guard_path.write_text(canonical_json(guard_doc), encoding="utf-8", newline="\n")

        # The Node caller reads this to fold both hashes into the environment lock.
        sys.stdout.write(
            json.dumps(
                {
                    "connector_version": args.connector_version,
                    "python_version": ".".join(str(v) for v in sys.version_info[:3]),
                    "outputs": [
                        {"path": tools_path.name, "sha256": sha256_text(canonical_json(tools_doc))},
                        {"path": guard_path.name, "sha256": sha256_text(canonical_json(guard_doc))},
                    ],
                }
            )
            + "\n"
        )
        return 0
    except ToolError as e:
        sys.stderr.write(f"generate_contract_snapshots: {e}\n")
        return 2
    except Exception as e:  # noqa: BLE001 - any failure here must be a hard, visible stop
        sys.stderr.write(f"generate_contract_snapshots: unexpected: {type(e).__name__}: {e}\n")
        return 2


if __name__ == "__main__":
    sys.exit(main())
