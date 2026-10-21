#!/usr/bin/env python3
"""Run bounded layout checks and save real viewport screenshots with local Chromium.

Python standard library only. The browser is an explicit prerequisite; never
download it. No input files are changed. Screenshots go to a new external folder.
"""
from __future__ import annotations

import argparse
import base64
from contextlib import contextmanager
from datetime import datetime, timezone
import errno
from hashlib import sha1, sha256
import json
import os
from pathlib import Path
import re
import shutil
import signal
import socket
import struct
import subprocess
import sys
import tempfile
import time
from urllib.parse import urlsplit
from urllib.request import build_opener, ProxyHandler


class DevTools:
    """Small RFC 6455 client for a browser's loopback-only DevTools endpoint."""
    def __init__(self, url, timeout=20):
        parts = urlsplit(url)
        if parts.scheme != "ws" or parts.hostname not in ("127.0.0.1", "localhost"):
            raise ValueError("DevTools must use a local ws endpoint")
        self.socket = socket.create_connection((parts.hostname, parts.port), timeout=timeout)
        self.socket.settimeout(timeout)
        self.buffer = b""
        self.next_id = 0
        key = base64.b64encode(os.urandom(16)).decode()
        request = (f"GET {parts.path} HTTP/1.1\r\nHost: {parts.hostname}:{parts.port}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n")
        self.socket.sendall(request.encode("ascii"))
        while b"\r\n\r\n" not in self.buffer:
            block = self.socket.recv(4096)
            if not block:
                raise OSError("DevTools closed during handshake")
            self.buffer += block
        headers, self.buffer = self.buffer.split(b"\r\n\r\n", 1)
        accept = base64.b64encode(sha1((key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11").encode()).digest())
        if not headers.startswith(b"HTTP/1.1 101") or accept.lower() not in headers.lower():
            raise OSError("DevTools WebSocket handshake failed")

    def read(self, size):
        while len(self.buffer) < size:
            block = self.socket.recv(max(4096, size - len(self.buffer)))
            if not block:
                raise OSError("DevTools connection closed")
            self.buffer += block
        data, self.buffer = self.buffer[:size], self.buffer[size:]
        return data

    def send(self, data, opcode=1):
        mask = os.urandom(4)
        length = len(data)
        header = bytes((0x80 | opcode, 0x80 | (length if length < 126 else 126 if length < 65536 else 127)))
        if length >= 126:
            header += struct.pack("!H" if length < 65536 else "!Q", length)
        self.socket.sendall(header + mask + bytes(value ^ mask[i % 4] for i, value in enumerate(data)))

    def receive(self):
        chunks = []
        while True:
            first, second = self.read(2)
            opcode, length = first & 15, second & 127
            if length == 126:
                length = struct.unpack("!H", self.read(2))[0]
            elif length == 127:
                length = struct.unpack("!Q", self.read(8))[0]
            if length > 64 * 1024 * 1024:
                raise ValueError("DevTools frame exceeds bounded response size")
            mask = self.read(4) if second & 128 else None
            payload = self.read(length)
            if mask:
                payload = bytes(value ^ mask[i % 4] for i, value in enumerate(payload))
            if opcode == 8:
                raise OSError("DevTools sent a close frame")
            if opcode == 9:
                self.send(payload, 10)
                continue
            if opcode in (1, 0):
                chunks.append(payload)
                if first & 128:
                    return json.loads(b"".join(chunks))

    def call(self, method, params=None):
        self.next_id += 1
        identifier = self.next_id
        self.send(json.dumps({"id": identifier, "method": method, "params": params or {}}).encode())
        while True:
            message = self.receive()
            if message.get("id") == identifier:
                if "error" in message:
                    raise RuntimeError(f"DevTools {method}: {message['error'].get('message')}")
                return message.get("result", {})

    def close(self):
        self.socket.close()


GEOMETRY = r"""
(async () => {
  if (document.readyState !== 'complete') await new Promise(resolve => addEventListener('load', resolve, {once:true}));
  await Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve, 1500))]);
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const issues = [], root = document.documentElement;
  const label = el => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}`;
  const visible = el => {const s=getComputedStyle(el), r=el.getBoundingClientRect(); return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.height > 0;};
  if (Math.max(root.scrollWidth, document.body.scrollWidth) > innerWidth + 2)
    issues.push({code:'horizontal-overflow', detail:{viewport:innerWidth, documentWidth:Math.max(root.scrollWidth,document.body.scrollWidth)}});
  for (const el of document.body.querySelectorAll('*')) {
    if (!visible(el) || ['SCRIPT','STYLE','SVG','PATH'].includes(el.tagName)) continue;
    const s=getComputedStyle(el), r=el.getBoundingClientRect();
    if (['hidden','clip'].includes(s.overflowX) && el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 3)
      issues.push({code:'severe-horizontal-clipping', element:label(el), detail:{client:el.clientWidth, scroll:el.scrollWidth}});
    if (['hidden','clip'].includes(s.overflowY) && el.clientHeight > 0 && el.scrollHeight > el.clientHeight + 3)
      issues.push({code:'severe-vertical-clipping', element:label(el), detail:{client:el.clientHeight, scroll:el.scrollHeight}});
    // Detect only extreme prose wrapping: at least five line fragments, each
    // narrower than roughly two characters. CJK normal line wrapping is valid.
    if (['P','LI','H1','H2','H3','H4','LABEL','BUTTON','TD','TH'].includes(el.tagName) && !el.closest('pre,code,svg')) {
      const text=el.textContent.trim(), range=document.createRange(); range.selectNodeContents(el);
      const lines=[...range.getClientRects()].filter(x=>x.width>0 && x.height>0), font=parseFloat(s.fontSize);
      if (text.length >= 10 && lines.length >= 5 && lines.every(x=>x.width < font * 2.2) && r.width < font*2.5)
        issues.push({code:'extreme-text-wrapping',element:label(el),detail:{width:r.width,lineFragments:lines.length,fontSize:font}});
    }
  }
  return {viewport:{width:innerWidth,height:innerHeight},document:{width:root.scrollWidth,height:root.scrollHeight},userAgent:navigator.userAgent,issues};
})()
"""


def find_browser(explicit):
    if explicit:
        target = Path(explicit).expanduser()
        return target.resolve() if target.is_file() else None
    if os.environ.get("HTML_SITE_BROWSER"):
        target = Path(os.environ["HTML_SITE_BROWSER"]).expanduser()
        return target.resolve() if target.is_file() else None
    candidates = []
    for executable in ("google-chrome", "google-chrome-stable", "chromium", "chromium-browser", "msedge"):
        found = shutil.which(executable)
        if found:
            candidates.append(Path(found))
    for variable in ("PROGRAMFILES", "PROGRAMFILES(X86)", "LOCALAPPDATA"):
        base = os.environ.get(variable)
        if base:
            candidates += [Path(base) / "Google/Chrome/Application/chrome.exe", Path(base) / "Microsoft/Edge/Application/msedge.exe"]
    return next((p.resolve() for p in candidates if p.is_file()), None)


def viewport(value):
    match = re.fullmatch(r"(\d+)x(\d+)", value)
    if not match or not (240 <= int(match[1]) <= 4096 and 240 <= int(match[2]) <= 4096):
        raise argparse.ArgumentTypeError("viewport must be WIDTHxHEIGHT with dimensions 240–4096")
    return int(match[1]), int(match[2])


def cleanup_workspace(directory, lifecycle, attempts=6, delay=0.1):
    """Delete only this checker's exact temporary root; transient writes retry."""
    directory = Path(directory)
    expected_parent = Path(tempfile.gettempdir()).resolve()
    if directory.is_symlink() or directory.parent.resolve() != expected_parent or not directory.name.startswith("html-site-layout-") or directory.resolve().parent != expected_parent:
        raise ValueError("refusing cleanup outside the owned browser QA temporary root")
    retryable = {errno.ENOTEMPTY, errno.EBUSY, errno.EACCES, errno.EPERM}
    for attempt in range(1, attempts + 1):
        try:
            if directory.exists():
                shutil.rmtree(directory)
            lifecycle.append({"phase": "temporary-cleanup", "status": "PASS", "attempts": attempt})
            return
        except OSError as error:
            if error.errno not in retryable or attempt == attempts:
                lifecycle.append({"phase": "temporary-cleanup", "status": "FAIL", "attempts": attempt, "errno": error.errno})
                raise
            time.sleep(min(delay * attempt, 0.5))


@contextmanager
def owned_workspace(lifecycle, cleanup_allowed=None):
    directory = Path(tempfile.mkdtemp(prefix="html-site-layout-"))
    try:
        yield directory
    finally:
        if cleanup_allowed is not None and not cleanup_allowed():
            lifecycle.append({"phase": "temporary-cleanup", "status": "BLOCKED", "reason": "owned Windows job emptiness was not established", "preservedRoot": str(directory)})
            if sys.exc_info()[0] is None:
                raise RuntimeError("refusing workspace cleanup before owned Windows job exit")
        else:
            cleanup_workspace(directory, lifecycle)


def live_session_groups(identifier):
    """Read every Linux process entry; group changes do not escape ownership."""
    if sys.platform != "linux" or not Path("/proc/self/stat").is_file():
        raise RuntimeError("complete owned-session inspection requires readable Linux /proc; this POSIX platform is unsupported")
    groups = {}
    try:
        entries = list(Path("/proc").iterdir())
        for entry in entries:
            if not entry.name.isdigit():
                continue
            try:
                # comm may itself contain spaces, parentheses or non-UTF8 bytes.
                fields = (entry / "stat").read_text(encoding="utf-8", errors="replace").rsplit(")", 1)[1].split()
                group, session = int(fields[2]), int(fields[3])
                if session == identifier and fields[0] not in ("Z", "X"):
                    groups.setdefault(group, []).append(int(entry.name))
            except (FileNotFoundError, ProcessLookupError):
                # A process which disappeared during this scan cannot write.
                continue
    except (OSError, ValueError, IndexError) as error:
        raise RuntimeError("cannot completely inspect the owned Linux session: " + str(error)) from error
    return groups


def live_group_members(identifier):
    """All live members of the owned session, including separate process groups."""
    return [pid for members in live_session_groups(identifier).values() for pid in members]


def signal_owned_session(identifier, signum):
    groups = live_session_groups(identifier)
    for group, members in groups.items():
        # A group cannot span POSIX sessions. Recheck a current member before
        # signalling that group; never signal a group only because its ID was
        # observed in an earlier snapshot or because it resembles the launcher.
        verified = False
        for member in members:
            try:
                if os.getsid(member) == identifier and os.getpgid(member) == group:
                    verified = True
                    break
            except ProcessLookupError:
                continue
        if verified:
            try:
                os.killpg(group, signum)
            except ProcessLookupError:
                pass


def wait_session_exit(identifier, seconds):
    deadline = time.monotonic() + seconds
    empty_scans = 0
    while time.monotonic() < deadline:
        empty_scans = empty_scans + 1 if not live_session_groups(identifier) else 0
        if empty_scans >= 2:
            return True
        time.sleep(0.05)
    return False


class _WindowsJobAPI:
    """Bound Win32 functions; no browser discovery or global process signalling."""
    def __init__(self):
        import ctypes
        from ctypes import wintypes as w
        self.ctypes, self.w = ctypes, w
        ptr = ctypes.c_size_t
        class Limits(ctypes.Structure):
            _fields_ = [("user", ctypes.c_longlong), ("job", ctypes.c_longlong), ("flags", w.DWORD),
                        ("minimum", ptr), ("maximum", ptr), ("active", w.DWORD), ("affinity", ptr),
                        ("priority", w.DWORD), ("scheduling", w.DWORD)]
        class IO(ctypes.Structure):
            _fields_ = [(name, ctypes.c_ulonglong) for name in ("read", "write", "other", "readBytes", "writeBytes", "otherBytes")]
        class Extended(ctypes.Structure):
            _fields_ = [("basic", Limits), ("io", IO), ("processMemory", ptr), ("jobMemory", ptr), ("peakProcess", ptr), ("peakJob", ptr)]
        class Accounting(ctypes.Structure):
            _fields_ = [(name, ctypes.c_longlong) for name in ("user", "kernel", "periodUser", "periodKernel")] + [(name, w.DWORD) for name in ("faults", "total", "active", "terminated")]
        class Startup(ctypes.Structure):
            _fields_ = [("cb", w.DWORD), ("reserved", w.LPWSTR), ("desktop", w.LPWSTR), ("title", w.LPWSTR)] + [(name, w.DWORD) for name in ("x", "y", "xSize", "ySize", "xChars", "yChars", "fill", "flags")] + [("show", w.WORD), ("reservedBytes", w.WORD), ("reservedPointer", ctypes.POINTER(ctypes.c_byte)), ("stdin", w.HANDLE), ("stdout", w.HANDLE), ("stderr", w.HANDLE)]
        class StartupEx(ctypes.Structure):
            _fields_ = [("startup", Startup), ("attributes", ctypes.c_void_p)]
        class Process(ctypes.Structure):
            _fields_ = [("process", w.HANDLE), ("thread", w.HANDLE), ("pid", w.DWORD), ("tid", w.DWORD)]
        class Security(ctypes.Structure):
            _fields_ = [("length", w.DWORD), ("descriptor", ctypes.c_void_p), ("inherit", w.BOOL)]
        self.Extended, self.Accounting, self.StartupEx, self.Process, self.Security = Extended, Accounting, StartupEx, Process, Security
        kernel = ctypes.WinDLL("kernel32", use_last_error=True)
        signatures = {
            "CreateJobObjectW": (w.HANDLE, [ctypes.c_void_p, w.LPCWSTR]),
            "SetInformationJobObject": (w.BOOL, [w.HANDLE, ctypes.c_int, ctypes.c_void_p, w.DWORD]),
            "QueryInformationJobObject": (w.BOOL, [w.HANDLE, ctypes.c_int, ctypes.c_void_p, w.DWORD, ctypes.POINTER(w.DWORD)]),
            "CreateFileW": (w.HANDLE, [w.LPCWSTR, w.DWORD, w.DWORD, ctypes.c_void_p, w.DWORD, w.DWORD, w.HANDLE]),
            "InitializeProcThreadAttributeList": (w.BOOL, [ctypes.c_void_p, w.DWORD, w.DWORD, ctypes.POINTER(ptr)]),
            "UpdateProcThreadAttribute": (w.BOOL, [ctypes.c_void_p, w.DWORD, ptr, ctypes.c_void_p, ptr, ctypes.c_void_p, ctypes.c_void_p]),
            "DeleteProcThreadAttributeList": (None, [ctypes.c_void_p]),
            "CreateProcessW": (w.BOOL, [w.LPCWSTR, w.LPWSTR, ctypes.c_void_p, ctypes.c_void_p, w.BOOL, w.DWORD, ctypes.c_void_p, w.LPCWSTR, ctypes.c_void_p, ctypes.POINTER(Process)]),
            "AssignProcessToJobObject": (w.BOOL, [w.HANDLE, w.HANDLE]),
            "ResumeThread": (w.DWORD, [w.HANDLE]),
            "WaitForSingleObject": (w.DWORD, [w.HANDLE, w.DWORD]),
            "GetExitCodeProcess": (w.BOOL, [w.HANDLE, ctypes.POINTER(w.DWORD)]),
            "TerminateProcess": (w.BOOL, [w.HANDLE, w.UINT]),
            "TerminateJobObject": (w.BOOL, [w.HANDLE, w.UINT]),
            "CloseHandle": (w.BOOL, [w.HANDLE]),
        }
        for name, (result, args) in signatures.items():
            function = getattr(kernel, name)
            function.restype, function.argtypes = result, args
            setattr(self, name, function)

    def error(self, operation):
        code = self.ctypes.get_last_error()
        return OSError(code, operation + ": " + self.ctypes.FormatError(code))


class WindowsBrowserScope:
    """Own the browser from suspended birth, even after its launcher exits.

    Only this private job is terminated. KILL_ON_JOB_CLOSE contains controller
    crashes; normal cleanup still requires observable empty membership.
    """
    def __init__(self, lifecycle, api=None):
        self.api = api or _WindowsJobAPI()
        self.lifecycle = lifecycle
        self.job = self.process = None
        self.pid = None
        self.returncode = None
        self.assigned = False
        self.cleanup_permitted = True
        self._pid_capacity = 16

    def start(self, command):
        api, c, w = self.api, self.api.ctypes, self.api.w
        self.command = command
        self.job = api.CreateJobObjectW(None, None)
        if not self.job:
            raise api.error("CreateJobObjectW")
        limits = api.Extended()
        limits.basic.flags = 0x2000  # KILL_ON_JOB_CLOSE, neither breakaway flag.
        if not api.SetInformationJobObject(self.job, 9, c.byref(limits), c.sizeof(limits)):
            raise api.error("SetInformationJobObject")
        security = api.Security(c.sizeof(api.Security), None, True)
        null = api.CreateFileW("NUL", 0xC0000000, 3, c.byref(security), 3, 0x80, None)
        if null in (None, c.c_void_p(-1).value):
            raise api.error("CreateFileW(NUL)")
        attributes = None
        thread = None
        try:
            size = c.c_size_t()
            sized = api.InitializeProcThreadAttributeList(None, 1, 0, c.byref(size))
            if sized or c.get_last_error() != 122 or not size.value:
                raise api.error("InitializeProcThreadAttributeList(size)")
            attributes = c.create_string_buffer(size.value)
            if not api.InitializeProcThreadAttributeList(attributes, 1, 0, c.byref(size)):
                attributes = None
                raise api.error("InitializeProcThreadAttributeList")
            handles = (w.HANDLE * 1)(null)
            if not api.UpdateProcThreadAttribute(attributes, 0, 0x20002, handles, c.sizeof(handles), None, None):
                raise api.error("UpdateProcThreadAttribute(handle list)")
            startup, info = api.StartupEx(), api.Process()
            startup.startup.cb = c.sizeof(startup)
            startup.startup.flags = 0x101  # USESTDHANDLES | USESHOWWINDOW (hidden).
            startup.startup.stdin = startup.startup.stdout = startup.startup.stderr = null
            startup.attributes = c.cast(attributes, c.c_void_p)
            # Same list2cmdline quoting as Popen on Windows, no shell/search.
            line = c.create_unicode_buffer(subprocess.list2cmdline(command))
            flags = 0x4 | 0x80000 | 0x8000000  # SUSPENDED | EXTENDED_STARTUPINFO | NO_WINDOW.
            if not api.CreateProcessW(command[0], line, None, None, True, flags, None, None, c.byref(startup), c.byref(info)):
                raise api.error("CreateProcessW")
            self.process, thread, self.pid = info.process, info.thread, info.pid
            self.cleanup_permitted = False
            if not api.AssignProcessToJobObject(self.job, self.process):
                raise api.error("AssignProcessToJobObject")
            self.assigned = True
            if api.ResumeThread(thread) != 1:
                raise api.error("ResumeThread")
            self.lifecycle.append({"phase": "owned-windows-job-start", "status": "PASS", "launcherPid": self.pid,
                                   "suspendedBeforeAssignment": True, "killOnClose": True, "breakaway": False,
                                   "profile": next((arg.split("=", 1)[1] for arg in command if arg.startswith("--user-data-dir=")), None)})
        finally:
            original_error = sys.exc_info()[1]
            close_errors = []
            if thread and not api.CloseHandle(thread):
                close_errors.append(str(api.error("CloseHandle(thread)")))
            if attributes is not None:
                api.DeleteProcThreadAttributeList(attributes)
            if not api.CloseHandle(null):
                close_errors.append(str(api.error("CloseHandle(NUL)")))
            if close_errors:
                raise RuntimeError("; ".join(([str(original_error)] if original_error else []) + close_errors)) from original_error

    def poll(self):
        if not self.process or self.returncode is not None:
            return self.returncode
        status = self.api.WaitForSingleObject(self.process, 0)
        if status == 258:
            return None
        if status != 0:
            raise self.api.error("WaitForSingleObject(process)")
        code = self.api.w.DWORD()
        if not self.api.GetExitCodeProcess(self.process, self.api.ctypes.byref(code)):
            raise self.api.error("GetExitCodeProcess")
        self.returncode = code.value
        return self.returncode

    def members(self):
        api, c, w = self.api, self.api.ctypes, self.api.w
        accounting = api.Accounting()
        if not api.QueryInformationJobObject(self.job, 1, c.byref(accounting), c.sizeof(accounting), None):
            raise api.error("QueryInformationJobObject(accounting)")
        capacity = self._pid_capacity
        while capacity <= 65536:
            data = c.create_string_buffer(8 + capacity * c.sizeof(c.c_size_t))
            okay = api.QueryInformationJobObject(self.job, 3, data, len(data), None)
            error = c.get_last_error() if not okay else 0
            assigned, returned = (w.DWORD * 2).from_buffer(data)
            if not okay and error != 234:
                raise api.error("QueryInformationJobObject(PID list)")
            if okay and returned <= capacity and returned == assigned:
                pids = list((c.c_size_t * returned).from_buffer(data, 8))
                return {"active": accounting.active, "pids": pids}
            capacity = max(capacity * 2, assigned)
        raise RuntimeError("owned job PID inventory exceeded its bounded buffer")

    def has_live_members(self):
        state = self.members()
        return bool(state["active"] or state["pids"])

    def stop_and_confirm_empty(self, graceful_seconds=5, kill_seconds=5):
        if not self.process:
            return
        if not self.assigned:
            # It never ran: CreateProcess was suspended and assignment failed.
            if not self.api.TerminateProcess(self.process, 1):
                raise self.api.error("TerminateProcess(unresumed owned launcher)")
            if self.api.WaitForSingleObject(self.process, 5000) != 0:
                raise RuntimeError("unresumed owned launcher did not terminate")
        deadline = time.monotonic() + graceful_seconds
        while self.has_live_members() and time.monotonic() < deadline:
            time.sleep(0.05)
        if self.has_live_members() and not self.api.TerminateJobObject(self.job, 1):
            raise self.api.error("TerminateJobObject")
        deadline, empty = time.monotonic() + kill_seconds, 0
        observations = []
        while time.monotonic() < deadline:
            state = self.members()
            observations.append(state)
            empty = empty + 1 if state == {"active": 0, "pids": []} else 0
            if empty >= 2:
                self.poll()
                self.cleanup_permitted = True
                self.lifecycle.append({"phase": "browser-process-exit", "status": "PASS", "returnCode": self.returncode})
                self.lifecycle.append({"phase": "owned-windows-job-exit", "status": "PASS", "launcherPid": self.pid,
                                       "emptyObservations": observations[-2:], "method": "complete Job PID list and ActiveProcesses, two empty observations"})
                return
            time.sleep(0.05)
        raise RuntimeError("owned Windows browser job still has running processes")

    def release_handles(self):
        errors = []
        for name in ("job", "process"):
            handle = getattr(self, name)
            if handle:
                if not self.api.CloseHandle(handle):
                    errors.append(str(self.api.error("CloseHandle(" + name + ")")))
                setattr(self, name, None)
        if errors:
            raise RuntimeError("; ".join(errors))


def wait_browser_endpoint(process, profile, timeout):
    """Use the owned Windows scope, not an exited relauncher, for liveness."""
    port_file = profile / "DevToolsActivePort"
    deadline = time.monotonic() + min(timeout, 15)
    opener = build_opener(ProxyHandler({}))
    targets = []
    last_error = "endpoint not yet available"
    # File readability and a responding endpoint establish startup completion.
    while (process.has_live_members() if isinstance(process, WindowsBrowserScope) else process.poll() is None) and time.monotonic() < deadline:
        try:
            port = int(port_file.read_text(encoding="utf-8").splitlines()[0])
            with opener.open(f"http://127.0.0.1:{port}/json/list", timeout=min(timeout, 2)) as response:
                targets = json.load(response)
            if any(entry.get("type") == "page" for entry in targets):
                break
        except (OSError, ValueError, IndexError) as error:
            last_error = str(error)
        time.sleep(0.05)
    if not targets:
        raise RuntimeError("browser did not provide a readable local DevTools endpoint: " + last_error)
    return targets


def close_browser(process, connection, lifecycle):
    if isinstance(process, WindowsBrowserScope):
        errors = []
        if connection:
            try:
                connection.call("Browser.close")
                lifecycle.append({"phase": "Browser.close", "status": "REQUESTED"})
            except (OSError, RuntimeError, ValueError):
                lifecycle.append({"phase": "Browser.close", "status": "CONNECTION_CLOSED_OR_FAILED"})
            finally:
                try:
                    connection.close()
                except (OSError, RuntimeError, ValueError) as error:
                    lifecycle.append({"phase": "DevTools.close", "status": "FAIL", "reason": str(error)})
                    errors.append("DevTools transport close failed: " + str(error))
        try:
            process.stop_and_confirm_empty()
        except (OSError, RuntimeError) as error:
            lifecycle.append({"phase": "owned-windows-job-exit", "status": "FAIL", "reason": str(error)})
            errors.append(str(error))
        finally:
            try:
                process.release_handles()
            except (OSError, RuntimeError) as error:
                errors.append(str(error))
        if errors:
            raise RuntimeError("; ".join(errors))
        return
    if connection:
        try:
            connection.call("Browser.close")
            lifecycle.append({"phase": "Browser.close", "status": "REQUESTED"})
        except (OSError, RuntimeError, ValueError):
            # A closed socket can mean shutdown already happened. Process/tree
            # exit and actual cleanup below must still succeed before PASS.
            lifecycle.append({"phase": "Browser.close", "status": "CONNECTION_CLOSED_OR_FAILED"})
        finally:
            connection.close()
    if not process:
        return
    try:
        process.wait(timeout=5)
    except subprocess.TimeoutExpired:
        if os.name == "posix":
            signal_owned_session(process.pid, signal.SIGTERM)
        else:
            taskkill = Path(os.environ["SystemRoot"]) / "System32/taskkill.exe"
            stopped = subprocess.run([str(taskkill), "/PID", str(process.pid), "/T", "/F"], capture_output=True, timeout=5, creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
            if stopped.returncode and process.poll() is None:
                raise RuntimeError("owned browser process tree could not be stopped")
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            if os.name == "posix":
                signal_owned_session(process.pid, signal.SIGKILL)
            else:
                process.kill()
            process.wait(timeout=5)
    lifecycle.append({"phase": "browser-process-exit", "status": "PASS", "returnCode": process.returncode})
    if os.name == "posix":
        # The launcher can exit while writers remain, and descendants may form
        # additional groups inside the same owned session. Inspect all groups.
        exited = False
        for signum in (signal.SIGTERM, signal.SIGKILL):
            signal_owned_session(process.pid, signum)
            if wait_session_exit(process.pid, 2):
                exited = True
                break
        if not exited:
            raise RuntimeError("owned browser session still has running processes")
        lifecycle.append({"phase": "owned-browser-session-exit", "status": "PASS", "method": "complete Linux /proc session scan, all owned groups, two consecutive empty scans"})


def run_checks(root, browser, screenshots, viewports, timeout, results, lifecycle):
    process = None
    connection = None
    # Copy only the explicitly selected artifact; never alter installation/input.
    for item in root.rglob("*"):
        if item.is_symlink():
            raise ValueError("artifact symbolic links are not supported")
    with owned_workspace(lifecycle, lambda: not isinstance(process, WindowsBrowserScope) or process.cleanup_permitted) as temporary:
        temporary = Path(temporary)
        page_root = temporary / "artifact"
        shutil.copytree(root, page_root)
        profile = temporary / "browser-profile"
        command = [str(browser), "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check", "--remote-debugging-address=127.0.0.1", "--remote-debugging-port=0", "--user-data-dir=" + str(profile), "--allow-file-access-from-files", "about:blank"]
        # Containers commonly run as root; this flag applies only to this isolated
        # QA process, whose input must already pass the local static checker.
        if hasattr(os, "geteuid") and os.geteuid() == 0:
            command.insert(1, "--no-sandbox")
        try:
            if os.name == "nt":
                process = WindowsBrowserScope(lifecycle)
                process.start(command)
            else:
                process = subprocess.Popen(command, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
            targets = wait_browser_endpoint(process, profile, timeout)
            target = next((entry for entry in targets if entry.get("type") == "page"), None)
            if not target:
                raise RuntimeError("browser has no inspectable page target")
            connection = DevTools(target["webSocketDebuggerUrl"], timeout)
            connection.call("Page.enable")
            for width, height in viewports:
                connection.call("Emulation.setDeviceMetricsOverride", {"width": width, "height": height, "deviceScaleFactor": 1, "mobile": False})
                navigation = connection.call("Page.navigate", {"url": (page_root / "index.html").as_uri()})
                if navigation.get("errorText"):
                    raise RuntimeError("browser navigation failed: " + navigation["errorText"])
                # Wait for the actual navigation, rather than measuring about:blank.
                deadline = time.monotonic() + timeout
                while True:
                    state = connection.call("Runtime.evaluate", {"expression": "({url:location.href,ready:document.readyState})", "returnByValue": True}).get("result", {}).get("value", {})
                    if state.get("url") == (page_root / "index.html").as_uri() and state.get("ready") == "complete":
                        break
                    if time.monotonic() > deadline:
                        raise TimeoutError("page did not finish loading")
                    time.sleep(0.05)
                evaluated = connection.call("Runtime.evaluate", {"expression": GEOMETRY, "awaitPromise": True, "returnByValue": True})
                if evaluated.get("exceptionDetails"):
                    raise RuntimeError("layout probe failed in the browser")
                result = evaluated.get("result", {}).get("value")
                if not isinstance(result, dict) or result.get("viewport") != {"width": width, "height": height}:
                    raise RuntimeError("actual browser viewport differs from the requested viewport")
                screenshot = connection.call("Page.captureScreenshot", {"format": "png", "fromSurface": True, "captureBeyondViewport": False})
                pixels = base64.b64decode(screenshot["data"], validate=True)
                if not pixels.startswith(b"\x89PNG\r\n\x1a\n") or struct.unpack("!II", pixels[16:24]) != (width, height):
                    raise RuntimeError("browser screenshot is not a PNG at the actual viewport size")
                filename = f"viewport-{width}x{height}.png"
                (screenshots / filename).write_bytes(pixels)
                result.update({"status": "FAIL" if result["issues"] else "PASS", "screenshot": filename, "screenshotSha256": sha256(pixels).hexdigest()})
                results.append(result)
        finally:
            original_error = sys.exc_info()[1]
            try:
                close_browser(process, connection, lifecycle)
            except (OSError, RuntimeError, ValueError, subprocess.SubprocessError) as error:
                if original_error:
                    raise RuntimeError(str(original_error) + "; browser cleanup failed: " + str(error)) from original_error
                raise


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--screenshots", required=True, type=Path, help="New directory outside the artifact")
    parser.add_argument("--output", type=Path, help="New JSON report outside the artifact")
    parser.add_argument("--browser", help="Explicit Chrome/Edge/Chromium executable; invalid path does not fall back")
    parser.add_argument("--viewport", action="append", type=viewport)
    parser.add_argument("--timeout", type=int, default=20, help="Browser operation timeout, 5–60 seconds")
    args = parser.parse_args()
    requested = args.viewport or [(1366, 900), (390, 844)]
    result = {"schemaVersion": 1, "checker": "artifact-browser-layout", "executedAt": datetime.now(timezone.utc).isoformat(), "pythonVersion": sys.version.split()[0], "status": "NOT_RUN", "requestedViewports": [{"width": w, "height": h} for w, h in requested], "viewports": [], "lifecycle": [], "limitations": ["Bounded geometry heuristics cover document horizontal overflow, overflow:hidden/clip containers with overflowing content, and extreme narrow prose wrapping. They are not a complete visual, responsive or accessibility audit.", "Screenshots show the initial viewport state; visually review them. No copy/export/answer/retry/reset interaction, keyboard/focus, touch, print or learning-effect evaluation was performed.", "Local browser results do not verify deployed Sites identity, access scope, version or remote behavior. Understanding effects remain NOT_MEASURED."]}
    root = args.input.resolve()
    writable_output = False
    try:
        if not root.is_dir() or args.input.is_symlink() or not (root / "index.html").is_file():
            raise ValueError("input must be an ordinary artifact directory containing index.html")
        if not 5 <= args.timeout <= 60:
            raise ValueError("timeout must be 5–60 seconds")
        if len(requested) != len(set(requested)):
            raise ValueError("duplicate viewports would overwrite screenshot evidence")
        if args.screenshots.resolve().is_relative_to(root) or args.screenshots.exists():
            raise ValueError("screenshots require a new directory outside the artifact")
        if args.output and (args.output.exists() or args.output.resolve().is_relative_to(root)):
            raise ValueError("report requires a new path outside the artifact")
        writable_output = True
        browser = find_browser(args.browser)
        if not browser:
            raise FileNotFoundError("Chrome/Edge/Chromium browser unavailable; layout and screenshots NOT_RUN")
        args.screenshots.mkdir(parents=True, exist_ok=False)
        result["browser"] = str(browser)
        result["inputHashes"] = {name: sha256((root / name).read_bytes()).hexdigest() for name in ("artifact.json", "artifact-manifest.json", "index.html", "theme.css", "learning.js") if (root / name).is_file() and not (root / name).is_symlink()}
        result["screenshotDirectory"] = str(args.screenshots.resolve())
        run_checks(root, browser, args.screenshots, requested, args.timeout, result["viewports"], result["lifecycle"])
        result["status"] = "FAIL" if any(v["status"] == "FAIL" for v in result["viewports"]) else "PASS"
    except (OSError, ValueError, RuntimeError, KeyError, StopIteration, subprocess.SubprocessError) as error:
        result["reason"] = f"{type(error).__name__}: {error}"
    rendered = json.dumps(result, ensure_ascii=False, indent=2) + "\n"
    if args.output and writable_output:
        try:
            with args.output.open("x", encoding="utf-8") as handle:
                handle.write(rendered)
        except OSError as error:
            print(json.dumps({"status": "NOT_RUN", "reason": str(error)}, ensure_ascii=False))
            return 2
    print(rendered, end="")
    return {"PASS": 0, "FAIL": 1, "NOT_RUN": 2}[result["status"]]


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    sys.exit(main())
