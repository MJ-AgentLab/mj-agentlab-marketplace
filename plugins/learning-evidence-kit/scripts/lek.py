#!/usr/bin/env python3
"""One JSON request in, one JSON receipt out; Python 3.12 standard library only."""
from __future__ import annotations

import json
import sys

from common import LekError, parse_json, receipt, validate_request


def main():
    request = {}
    try:
        if sys.version_info[:2] != (3, 12):
            raise LekError("interpreter_version", "Learning Evidence Kit requires an actual Python 3.12 interpreter")
        raw = sys.stdin.buffer.read(32 * 1024 * 1024 + 1)
        if len(raw) > 32 * 1024 * 1024:
            raise LekError("request_too_large", "Request exceeds 32 MiB")
        request = parse_json(raw.decode("utf-8"))
        validate_request(request)
        if request["operation"] in ("publish", "collect"):
            try:
                import github_flow
            except ImportError as error:
                raise LekError("operation_unavailable", "GitHub flow module has not been delivered in this stage", "blocked") from error
            result = github_flow.dispatch(request)
        else:
            from storage import dispatch
            result = dispatch(request)
    except LekError as error:
        result = receipt(request if isinstance(request, dict) else {}, status=error.status, gaps=error.gaps,
                         errors=[{"code": error.code, "message": error.message}])
    except (OSError, ValueError, TypeError, KeyError, UnicodeError, RecursionError) as error:
        result = receipt(request if isinstance(request, dict) else {}, status="error",
                         errors=[{"code": "operational_error", "message": str(error)}])
    sys.stdout.buffer.write(json.dumps(result, ensure_ascii=False, allow_nan=False).encode("utf-8") + b"\n")
    return 1 if result["status"] in ("blocked", "error") else 0


if __name__ == "__main__":
    raise SystemExit(main())
