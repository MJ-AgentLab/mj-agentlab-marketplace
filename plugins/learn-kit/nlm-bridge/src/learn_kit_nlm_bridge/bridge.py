"""The host-facing MCP host (plan §2.3.1).

To the host (Claude Code / Codex) this is an MCP server over line-delimited JSON-RPC on stdio.
State machine: NEW -> INITIALIZE_RESPONDED -> READY -> CLOSED.

  * initialize, ping, and the single-page tools/list are answered LOCALLY from the checked-in
    snapshot. No upstream process, no network, no credential access, and the bridge returns its
    own safe instructions, dropping upstream's `nlm login` advice.
  * Only the first legal tools/call lazily starts the guarded upstream_runner. Before spawning,
    the bridge re-verifies the local contract (closure / receipt / env-lock / contract SHAs).
    The child re-hashes the auth path and patches out headless auth; the parent then compares the
    child's full tools/list to the snapshot's tools_sha256 and refuses to forward on any drift.
  * Every tool call is validated by a fixed-subset adapter against the checked-in schema (not a
    generic JSON-Schema engine), the pinned constants are injected, and an upstream auth failure
    is normalized to a credential-free AUTH_REQUIRED before the child is terminated.

The child's environment is built from scratch — only OS/home/temp/locale plus the snapshot's
pinned NOTEBOOKLM_* — so no inherited NLM_*/PYTHON*/proxy/browser value can change what it does.
None of this is a trusted authorization boundary; it only fails closed on drift and never opens
a browser on the tool path.
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import tempfile
import threading
from collections import deque

from . import contract

# ------------------------------------------------------------------------- limits

MAX_LINE_BYTES = 16 * 1024 * 1024      # a single JSON-RPC message; larger is refused, not buffered
HANDSHAKE_TIMEOUT_S = 30.0
CALL_TIMEOUT_S = 300.0                 # source_add(wait=true) can take a while to process
CHILD_CLOSE_TIMEOUT_S = 10.0
STDERR_RING = 64                       # bounded, redacted upstream stderr lines kept for diagnostics
MAX_PAGES = 64                         # tools/list pagination guard

# The child negotiates its own protocol; only versions measured against pinned fixtures are
# accepted. v0.8.7 negotiates 2025-06-18.
ALLOWED_CHILD_PROTOCOLS = frozenset({"2025-06-18"})

PROTOCOL_VERSION = contract.PROTOCOL_VERSION
SERVER_INFO = {"name": "learn-kit-nlm-bridge", "version": contract.BRIDGE_VERSION}

# JSON-RPC error codes.
PARSE_ERROR = -32700
INVALID_REQUEST = -32600
METHOD_NOT_FOUND = -32601
INVALID_PARAMS = -32602
INTERNAL_ERROR = -32603

AUTH_REQUIRED_MESSAGE = (
    "AUTH_REQUIRED: NotebookLM is not authenticated. Run `nlm login` in a terminal, then retry. "
    "This bridge never logs in, refreshes tokens, or switches accounts for you."
)

# Substrings (matched case-insensitively) that mark an upstream error as an auth failure. Taken
# from the connector's own messages: not-configured, recovery-failed, 401/403, and RPC16 all
# surface one of these. A plain validation error carries none of them, so it passes through as a
# non-auth error rather than misleading the user into logging in.
_AUTH_SIGNALS = (
    "nlm login",
    "no authentication found",
    "authentication expired",
    "authentication failed",
    "authentication required",
    "not authenticated",
    "session has expired",
    "session may have expired",
    "session expired",
    "cookies have expired",
    "re-authenticate",
    "reauthenticate",
    "notebooklm_cookies",
    "refresh_auth",
)

# Sentinels redacted out of any diagnostic before it can be logged or surfaced.
_REDACT = re.compile(
    r"(?i)(cookie|csrf|session[-_ ]?id|token|bearer|authorization|@[\w.-]+\.\w+)"
)


def _redact(text: str) -> str:
    return _REDACT.sub("[redacted]", text)


class ProtocolError(Exception):
    """A host message that must become a JSON-RPC error response."""

    def __init__(self, code: int, message: str):
        super().__init__(message)
        self.code = code


class ForwardError(Exception):
    """The guarded child could not be brought up or spoke off-contract; fail closed."""


# ------------------------------------------------------------------- fixed-subset validator

# The exact set of JSON-Schema keywords the checked-in policy uses. The validator refuses any
# keyword outside this set, so a schema edit that reached for an unhandled keyword would fail
# closed rather than pass unchecked — this is what keeps it from being a lax generic engine.
_OBJECT_KEYWORDS = {"type", "additionalProperties", "properties", "required", "oneOf", "title", "description"}
_LEAF_KEYWORDS = {
    "type", "const", "enum", "minLength", "maxLength", "pattern",
    "minItems", "maxItems", "uniqueItems", "items", "description", "title",
}


class SchemaViolation(Exception):
    pass


def _validate_leaf(schema: dict, value, where: str) -> None:
    for kw in schema:
        if kw not in _LEAF_KEYWORDS:
            raise ForwardError(f"schema uses unhandled keyword {kw!r} at {where}")
    if "const" in schema:
        if value != schema["const"]:
            raise SchemaViolation(f"{where}: must equal {schema['const']!r}")
        return
    if "enum" in schema and value not in schema["enum"]:
        raise SchemaViolation(f"{where}: must be one of {schema['enum']}")
    t = schema.get("type")
    if t == "string":
        if not isinstance(value, str):
            raise SchemaViolation(f"{where}: must be a string")
        if "minLength" in schema and len(value) < schema["minLength"]:
            raise SchemaViolation(f"{where}: too short")
        if "maxLength" in schema and len(value) > schema["maxLength"]:
            raise SchemaViolation(f"{where}: too long")
        if "pattern" in schema and re.search(schema["pattern"], value) is None:
            raise SchemaViolation(f"{where}: does not match pattern")
    elif t == "array":
        if not isinstance(value, list):
            raise SchemaViolation(f"{where}: must be an array")
        if "minItems" in schema and len(value) < schema["minItems"]:
            raise SchemaViolation(f"{where}: too few items")
        if "maxItems" in schema and len(value) > schema["maxItems"]:
            raise SchemaViolation(f"{where}: too many items")
        if schema.get("uniqueItems") and len(value) != len({json.dumps(v, sort_keys=True) for v in value}):
            raise SchemaViolation(f"{where}: items must be unique")
        item_schema = schema.get("items")
        if item_schema:
            for i, item in enumerate(value):
                _validate_leaf(item_schema, item, f"{where}[{i}]")
    elif t is not None:
        raise ForwardError(f"schema uses unhandled type {t!r} at {where}")


def _validate_object(schema: dict, value, where: str) -> None:
    for kw in schema:
        if kw not in _OBJECT_KEYWORDS:
            raise ForwardError(f"schema uses unhandled object keyword {kw!r} at {where}")
    if not isinstance(value, dict):
        raise SchemaViolation(f"{where}: must be an object")
    if schema.get("additionalProperties") is not False:
        raise ForwardError(f"{where}: schema must close additionalProperties")
    props = schema.get("properties", {})
    for key in value:
        if key not in props:
            raise SchemaViolation(f"{where}: unknown property {key!r}")
    for key in schema.get("required", []):
        if key not in value:
            raise SchemaViolation(f"{where}: missing required {key!r}")
    for key, sub in props.items():
        if key in value:
            if sub.get("type") == "object":
                _validate_object(sub, value[key], f"{where}.{key}")
            else:
                _validate_leaf(sub, value[key], f"{where}.{key}")


def validate_arguments(schema: dict, value) -> None:
    """Validate call arguments against one tool's checked-in schema. `oneOf` (studio_create) must
    match exactly one closed branch — closed branches with a const artifact_type make that
    unambiguous. Raises SchemaViolation for bad input, ForwardError for an un-modelled schema."""
    if "oneOf" in schema:
        for kw in schema:
            if kw not in {"type", "oneOf"}:
                raise ForwardError(f"schema uses unhandled keyword {kw!r} at top level")
        matches = 0
        last: SchemaViolation | None = None
        for branch in schema["oneOf"]:
            try:
                _validate_object(branch, value, f"oneOf[{branch.get('title', '?')}]")
                matches += 1
            except SchemaViolation as e:
                last = e
        if matches != 1:
            raise SchemaViolation(str(last) if last and matches == 0 else "must match exactly one artifact shape")
        return
    _validate_object(schema, value, "arguments")


# ------------------------------------------------------------------------- adapters

class Adapters:
    """One adapter per advertised tool, built from the SHA-verified policy. `adapt` validates the
    arguments, runs the tool's business guard, then merges only the tool's allowlisted inject
    constants, returning the exact (upstream_name, arguments) to forward."""

    def __init__(self, env_lock: dict):
        self.by_name: dict[str, dict] = {}
        for tool in contract.load_policy_raw()["tools"]:
            if tool["name"] not in contract.PUBLIC_TOOL_NAMES:
                raise ForwardError(f"policy advertises unexpected tool {tool['name']!r}")
            self.by_name[tool["name"]] = tool
        if set(self.by_name) != set(contract.PUBLIC_TOOL_NAMES):
            raise ForwardError("policy does not advertise exactly the six pinned tools")

    def adapt(self, name: str, arguments) -> tuple[str, dict]:
        tool = self.by_name.get(name)
        if tool is None:
            raise ProtocolError(METHOD_NOT_FOUND, f"unknown tool {name!r}")
        if not isinstance(arguments, dict):
            raise SchemaViolation("arguments must be an object")

        validate_arguments(tool["inputSchema"], arguments)
        if name == "source_add":
            _guard_source_add(arguments)

        # Merge the pinned inject constants; the generator already proved these are exactly the
        # tool's allowlisted keys and never collide with a caller-supplied property.
        inject = tool.get("upstream", {}).get("inject", {})
        allowed = set(contract.INJECT_ALLOWLIST.get(name, ()))
        if set(inject) - allowed:
            raise ForwardError(f"{name}: inject map carries a non-allowlisted key")
        merged = dict(arguments)
        for key, val in inject.items():
            if key in merged:
                raise ForwardError(f"{name}: injected {key!r} collides with a caller argument")
            merged[key] = val
        return tool["upstream"]["tool"], merged


_STAGING_PREFIX = "learn-kit-upload-"


def _guard_source_add(arguments: dict) -> None:
    """Format/path guard for source_add: the file must be an existing .md whose realpath is inside
    a helper-owned OS-temp `learn-kit-upload-*` staging root, with no symlink escape. This is only
    a path guard (the plan is explicit it is not a trusted Gate token); the manifest/sentinel SHA
    cross-check is owned by the §2.5 staging helper and wired in with it."""
    file_path = arguments.get("file_path")
    if not isinstance(file_path, str) or not file_path:
        raise SchemaViolation("source_add: file_path is required")
    if not os.path.isabs(file_path):
        raise SchemaViolation("source_add: file_path must be absolute")
    if not file_path.lower().endswith(".md"):
        raise SchemaViolation("source_add: only .md files may be uploaded")
    try:
        real = os.path.realpath(file_path)
    except OSError as e:
        raise SchemaViolation(f"source_add: cannot resolve file_path: {e}") from e
    if not os.path.isfile(real):
        raise SchemaViolation("source_add: file_path does not point at a regular file")
    temp_root = os.path.realpath(tempfile.gettempdir())
    # The staged file must live under some `learn-kit-upload-*` dir directly inside OS temp.
    parts = os.path.relpath(real, temp_root).split(os.sep)
    if parts[0] == ".." or not parts[0].startswith(_STAGING_PREFIX):
        raise SchemaViolation("source_add: file is not inside a helper-owned staging root")


# ------------------------------------------------------------------- child env + IO

def build_child_env(snapshot: dict) -> dict:
    """The child's environment, built from scratch (plan §2.3.1). Only platform-launch, home,
    temp and locale keys are carried over; PATH is a trusted OS dir with neither the public bin nor
    the venv Scripts/bin on it; then the snapshot's pinned NOTEBOOKLM_* is the whole upstream
    contract. No inherited NLM_*/NOTEBOOKLM_*/PYTHON*/proxy/browser value survives."""
    parent = os.environ
    env: dict[str, str] = {}
    for key in (
        "SystemRoot", "WINDIR", "SYSTEMDRIVE", "COMSPEC", "PROCESSOR_ARCHITECTURE",
        "HOME", "USERPROFILE", "APPDATA", "LOCALAPPDATA", "XDG_CONFIG_HOME",
        "TEMP", "TMP", "TMPDIR", "LANG", "LC_ALL", "LC_CTYPE", "TZ",
    ):
        if key in parent:
            env[key] = parent[key]
    if os.name == "nt":
        env["PATH"] = os.path.join(parent.get("SystemRoot", r"C:\Windows"), "System32")
    else:
        env["PATH"] = "/usr/bin:/bin"
    env["PYTHONUTF8"] = "1"
    for key, val in snapshot["pinned_env"].items():
        env[key] = val
    return env


class _LineReader:
    """Reads length-bounded, newline-delimited messages from a binary stream on a background
    thread, so a slow or hostile peer cannot block the main loop and an over-long line is refused
    rather than buffered without bound."""

    def __init__(self, stream, max_bytes: int):
        self.stream = stream
        self.max_bytes = max_bytes
        self.queue: "deque" = deque()
        self.cv = threading.Condition()
        self.eof = False
        self.error: str | None = None
        threading.Thread(target=self._run, daemon=True).start()

    def _run(self):
        buf = bytearray()
        try:
            while True:
                # read1, not read: return as soon as any bytes are available rather than blocking
                # for a full buffer, so a single small line is delivered without waiting for EOF.
                chunk = self.stream.read1(65536)
                if not chunk:
                    break
                buf.extend(chunk)
                if len(buf) > self.max_bytes and b"\n" not in buf:
                    with self.cv:
                        self.error = "message exceeded the maximum line length"
                        self.eof = True
                        self.cv.notify_all()
                    return
                while True:
                    nl = buf.find(b"\n")
                    if nl < 0:
                        break
                    line = bytes(buf[:nl])
                    del buf[: nl + 1]
                    with self.cv:
                        self.queue.append(line)
                        self.cv.notify_all()
        finally:
            with self.cv:
                self.eof = True
                self.cv.notify_all()

    def read(self, timeout: float | None = None) -> bytes | None:
        with self.cv:
            while not self.queue and not self.eof:
                if not self.cv.wait(timeout):
                    return None  # timeout
            if self.queue:
                return self.queue.popleft()
            if self.error:
                raise ForwardError(self.error)
            return None  # EOF


# ------------------------------------------------------------------------- child client

class ChildClient:
    """Owns the guarded upstream_runner subprocess and acts as its MCP client. Serial: one call in
    flight at a time. Drains the child's stderr into a bounded, redacted ring and never passes it
    through."""

    def __init__(self, snapshot: dict, audit_path: str | None = None):
        self.snapshot = snapshot
        self.audit_path = audit_path
        self.proc: subprocess.Popen | None = None
        self.reader: _LineReader | None = None
        self.stderr_ring: deque = deque(maxlen=STDERR_RING)
        self._req_id = 0

    def _child_argv(self) -> list[str]:
        # Same interpreter the bridge runs under — the private venv python — never a PATH lookup.
        argv = [sys.executable, "-I", "-X", "utf8", "-m", "learn_kit_nlm_bridge.upstream_runner"]
        if self.audit_path:
            argv += ["--audit", self.audit_path]
        return argv

    def spawn(self):
        env = build_child_env(self.snapshot)
        cwd = env.get("TEMP") or env.get("TMP") or tempfile.gettempdir()
        self.proc = subprocess.Popen(
            self._child_argv(),
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            env=env,
            cwd=cwd if os.path.isdir(cwd) else tempfile.gettempdir(),
            close_fds=True,
        )
        self.reader = _LineReader(self.proc.stdout, MAX_LINE_BYTES)
        threading.Thread(target=self._drain_stderr, daemon=True).start()

    def _drain_stderr(self):
        for raw in iter(self.proc.stderr.readline, b""):
            try:
                line = raw.decode("utf-8", "replace").rstrip("\n")
            except Exception:
                line = "<undecodable>"
            self.stderr_ring.append(_redact(line)[:500])

    def _send(self, obj: dict):
        self.proc.stdin.write((json.dumps(obj) + "\n").encode("utf-8"))
        self.proc.stdin.flush()

    def _next_id(self) -> int:
        self._req_id += 1
        return self._req_id

    def _recv_response(self, expected_id: int, timeout: float) -> dict:
        """Read until the response with expected_id. Notifications are ignored; a reverse REQUEST
        from the child (method + id) is a protocol violation and fails closed, since the bridge
        advertised no client capabilities that would invite one."""
        while True:
            line = self.reader.read(timeout)
            if line is None:
                raise ForwardError("upstream child timed out or closed unexpectedly")
            try:
                msg = json.loads(line)
            except json.JSONDecodeError as e:
                raise ForwardError(f"upstream child sent malformed JSON: {e}") from e
            if not isinstance(msg, dict):
                raise ForwardError("upstream child sent a non-object message")
            if "method" in msg:
                if "id" in msg:
                    raise ForwardError(f"upstream child sent a reverse request ({msg.get('method')!r})")
                continue  # a notification / log; ignore
            if msg.get("id") == expected_id:
                return msg

    def _rpc(self, method: str, params: dict, timeout: float) -> dict:
        rid = self._next_id()
        self._send({"jsonrpc": "2.0", "id": rid, "method": method, "params": params})
        msg = self._recv_response(rid, timeout)
        if "error" in msg:
            raise ForwardError(f"upstream child returned an error for {method}")
        return msg.get("result", {})

    def handshake(self):
        result = self._rpc(
            "initialize",
            {
                # Minimal client capabilities — never roots/sampling/elicitation.
                "protocolVersion": PROTOCOL_VERSION,
                "capabilities": {},
                "clientInfo": {"name": "learn-kit-nlm-bridge", "version": contract.BRIDGE_VERSION},
            },
            HANDSHAKE_TIMEOUT_S,
        )
        negotiated = result.get("protocolVersion")
        if negotiated not in ALLOWED_CHILD_PROTOCOLS:
            raise ForwardError(f"upstream child negotiated an unsupported protocol {negotiated!r}")
        self._send({"jsonrpc": "2.0", "method": "notifications/initialized"})

    def verified_tools(self):
        """Collect the child's full, paginated tools/list and confirm it reproduces the snapshot's
        tools_sha256 exactly. Any drift — extra tool, widened schema, cursor loop — fails closed."""
        tools: list = []
        cursor = None
        seen = set()
        for _ in range(MAX_PAGES):
            params = {"cursor": cursor} if cursor else {}
            result = self._rpc("tools/list", params, HANDSHAKE_TIMEOUT_S)
            tools.extend(result.get("tools", []))
            cursor = result.get("nextCursor")
            if not cursor:
                break
            if cursor in seen:
                raise ForwardError("upstream child repeated a tools/list cursor — refusing to loop")
            seen.add(cursor)
        else:
            raise ForwardError("upstream child paginated tools/list past the page limit")

        tools_sorted = sorted(tools, key=lambda t: t.get("name", ""))
        digest = contract.sha256_text(contract.canonical_json(tools_sorted))
        if digest != self.snapshot["tools_sha256"]:
            raise ForwardError("upstream child tools/list drifted from the recorded snapshot")

    def call(self, upstream_name: str, arguments: dict) -> dict:
        return self._rpc("tools/call", {"name": upstream_name, "arguments": arguments}, CALL_TIMEOUT_S)

    def close(self):
        if not self.proc:
            return
        try:
            if self.proc.stdin and not self.proc.stdin.closed:
                self.proc.stdin.close()
            try:
                self.proc.wait(timeout=CHILD_CLOSE_TIMEOUT_S)
            except subprocess.TimeoutExpired:
                self.proc.terminate()
                try:
                    self.proc.wait(timeout=CHILD_CLOSE_TIMEOUT_S)
                except subprocess.TimeoutExpired:
                    self.proc.kill()
        except Exception:
            try:
                self.proc.kill()
            except Exception:
                pass
        finally:
            self.proc = None


# --------------------------------------------------------------- auth normalization

def _collect_error_text(result: dict) -> str | None:
    """Pull any error text out of an upstream CallToolResult: isError content, a
    structuredContent.status=='error' payload, or an error string inside a TextContent JSON blob."""
    texts: list[str] = []
    structured = result.get("structuredContent")
    if isinstance(structured, dict):
        if structured.get("status") == "error":
            texts.append(str(structured.get("error", "")))
    for item in result.get("content", []) or []:
        if isinstance(item, dict) and item.get("type") == "text":
            text = str(item.get("text", ""))
            texts.append(text)
            # Upstream often embeds {"status":"error","error":...} as the text body.
            try:
                inner = json.loads(text)
                if isinstance(inner, dict) and inner.get("status") == "error":
                    texts.append(str(inner.get("error", "")))
            except (json.JSONDecodeError, ValueError):
                pass
    is_error = result.get("isError") is True
    joined = "\n".join(t for t in texts if t)
    if joined or is_error:
        return joined
    return None


def is_auth_failure(result: dict) -> bool:
    text = _collect_error_text(result)
    if text is None:
        return False
    low = text.lower()
    return any(signal in low for signal in _AUTH_SIGNALS)


def auth_required_result() -> dict:
    return {
        "content": [{"type": "text", "text": AUTH_REQUIRED_MESSAGE}],
        "structuredContent": {"status": "error", "code": "AUTH_REQUIRED", "message": AUTH_REQUIRED_MESSAGE},
        "isError": True,
    }


# ------------------------------------------------------------------------- the host

class Host:
    def __init__(self, stdin_buf, stdout_buf):
        self.stdin = _LineReader(stdin_buf, MAX_LINE_BYTES)
        self.stdout = stdout_buf
        self.state = "NEW"
        self.env_lock = None
        self.snapshot = None
        self.adapters = None
        self.tools = None

    # --- framing ---------------------------------------------------------
    def _write(self, obj: dict):
        self.stdout.write((json.dumps(obj) + "\n").encode("utf-8"))
        self.stdout.flush()

    def _reply(self, mid, result: dict):
        self._write({"jsonrpc": "2.0", "id": mid, "result": result})

    def _error(self, mid, code: int, message: str):
        self._write({"jsonrpc": "2.0", "id": mid, "error": {"code": code, "message": message}})

    # --- lazy local contract --------------------------------------------
    def _ensure_local(self):
        """Load the SHA-verified snapshot + tools once, for initialize/tools/list. Receipt/closure
        are NOT required here — those are checked at forward time — so the bridge can always
        advertise its narrowed surface, then fail closed before ever contacting upstream."""
        if self.env_lock is not None:
            return
        env_lock, environment_sha256 = contract.load_environment_lock()
        env_lock["_environment_sha256"] = environment_sha256
        self.env_lock = env_lock
        self.snapshot = contract.load_upstream_snapshot(env_lock)
        self.tools = contract.load_public_tools(env_lock)
        self.adapters = Adapters(env_lock)

    # --- dispatch --------------------------------------------------------
    def serve(self) -> int:
        while True:
            line = self.stdin.read(None)
            if line is None:
                break  # EOF
            if not line.strip():
                continue
            try:
                msg = json.loads(line)
            except json.JSONDecodeError:
                self._error(None, PARSE_ERROR, "invalid JSON")
                continue
            if not isinstance(msg, dict):
                self._error(None, INVALID_REQUEST, "message must be an object")
                continue
            try:
                self._dispatch(msg)
            except ProtocolError as e:
                self._error(msg.get("id"), e.code, str(e))
        return 0

    def _dispatch(self, msg: dict):
        method = msg.get("method")
        mid = msg.get("id")
        is_request = "id" in msg

        if method == "initialize":
            if not is_request or self.state != "NEW":
                raise ProtocolError(INVALID_REQUEST, "initialize is only valid once, first")
            self._ensure_local()
            self.state = "INITIALIZE_RESPONDED"
            self._reply(mid, {
                "protocolVersion": PROTOCOL_VERSION,
                "capabilities": {"tools": {"listChanged": False}},
                "serverInfo": SERVER_INFO,
                "instructions": contract.SAFE_INSTRUCTIONS,
            })
            return

        if method == "notifications/initialized":
            if self.state == "INITIALIZE_RESPONDED":
                self.state = "READY"
            return  # a notification: never answered

        if method == "ping":
            self._require_ready(is_request)
            self._reply(mid, {})
            return

        if method == "tools/list":
            self._require_ready(is_request)
            params = msg.get("params") or {}
            if params.get("cursor"):
                raise ProtocolError(INVALID_PARAMS, "tools/list is single-page; no cursor is issued")
            self._reply(mid, {"tools": self.tools})
            return

        if method == "tools/call":
            self._require_ready(is_request)
            self._handle_call(mid, msg.get("params") or {})
            return

        if is_request:
            raise ProtocolError(METHOD_NOT_FOUND, f"unknown method {method!r}")
        # unknown notification: ignore

    def _require_ready(self, is_request: bool):
        if not is_request:
            raise ProtocolError(INVALID_REQUEST, "expected a request")
        if self.state != "READY":
            raise ProtocolError(INVALID_REQUEST, "server is not initialized")

    # --- the forwarding path --------------------------------------------
    def _handle_call(self, mid, params: dict):
        name = params.get("name")
        arguments = params.get("arguments", {})
        if not isinstance(name, str):
            raise ProtocolError(INVALID_PARAMS, "tools/call requires a tool name")

        # Local validation first: a schema/guard failure returns an error result and never spawns
        # a child. Only an UNKNOWN tool is a JSON-RPC error.
        try:
            upstream_name, upstream_args = self.adapters.adapt(name, arguments)
        except ProtocolError:
            raise
        except SchemaViolation as e:
            self._reply(mid, _error_result(str(e)))
            return

        # The environment must be exactly the pinned one before anything talks to Google.
        try:
            contract.build_bridge_contract()
        except contract.ContractError as e:
            self._reply(mid, _error_result(f"bridge environment verification failed: {e}"))
            return

        child = ChildClient(self.snapshot)
        try:
            child.spawn()
            child.handshake()
            child.verified_tools()
            result = child.call(upstream_name, upstream_args)
        except ForwardError as e:
            self._reply(mid, _error_result(f"upstream unavailable: {_redact(str(e))}"))
            child.close()
            return
        finally:
            pass

        if is_auth_failure(result):
            self._reply(mid, auth_required_result())
            child.close()
            return

        self._reply(mid, result)
        child.close()


def _error_result(message: str) -> dict:
    return {
        "content": [{"type": "text", "text": message}],
        "structuredContent": {"status": "error", "error": message},
        "isError": True,
    }


def run_server() -> int:
    return Host(sys.stdin.buffer, sys.stdout.buffer).serve()


# ------------------------------------------------------------------- conformance driver

# A schema-valid studio_create used only by --verify-auth-required. With no credentials it must
# still normalize to AUTH_REQUIRED, which exercises studio_create's independent credential gate.
_VERIFY_STUDIO_CALL = {
    "notebook_id": "verify-notebook",
    "artifact_type": "mind_map",
    "source_ids": ["verify-source"],
    "confirm": True,
    "title": "verify",
}


def run_verify(mode: str) -> int:
    """Isolated conformance driver for `learn-kit-nlm-bridge --verify-*` (CI / manual only, never
    granted to the skill). The caller (probe) supplies the isolated, credential-free environment;
    this drives the guarded child inside it and asserts the contract. Result JSON goes to stdout;
    returns 0 on conformance, 1 on failure, 2 on unknown mode."""
    if mode not in ("upstream-contract", "auth-required"):
        sys.stderr.write(f"learn-kit-nlm-bridge: unknown verify mode {mode!r}\n")
        return 2

    try:
        env_lock, environment_sha256 = contract.load_environment_lock()
        env_lock["_environment_sha256"] = environment_sha256
        snapshot = contract.load_upstream_snapshot(env_lock)
    except contract.ContractError as e:
        sys.stderr.write(f"learn-kit-nlm-bridge: {e}\n")
        return 1

    audit_dir = tempfile.mkdtemp(prefix="nlm-verify-audit-")
    audit_path = os.path.join(audit_dir, "audit.json")
    child = ChildClient(snapshot, audit_path=audit_path)
    report: dict = {"mode": mode}
    try:
        child.spawn()
        child.handshake()
        child.verified_tools()
        report["tools_verified"] = True

        if mode == "auth-required":
            list_result = child.call("notebook_list", {"max_results": 100})
            studio_result = child.call("studio_create", dict(_VERIFY_STUDIO_CALL))
            report["notebook_list_auth_required"] = is_auth_failure(list_result)
            report["studio_create_auth_required"] = is_auth_failure(studio_result)
            if not (report["notebook_list_auth_required"] and report["studio_create_auth_required"]):
                sys.stdout.write(contract.canonical_json(report))
                return 1
    except ForwardError as e:
        report["error"] = _redact(str(e))
        sys.stdout.write(contract.canonical_json(report))
        child.close()
        return 1
    finally:
        child.close()

    try:
        with open(audit_path, encoding="utf-8") as f:
            report["audit"] = json.load(f)
    except (OSError, json.JSONDecodeError):
        report["audit"] = None
    sys.stdout.write(contract.canonical_json(report))
    return 0
