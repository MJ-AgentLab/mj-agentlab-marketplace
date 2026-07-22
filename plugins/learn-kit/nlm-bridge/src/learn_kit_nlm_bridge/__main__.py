"""Entry point for `python -m learn_kit_nlm_bridge` (plan §2.3.1).

Dispatch:

  (no args)                    run the stdio MCP host — what the public shim runs.
  --contract-json              print the local preflight fingerprint (stdlib only), exit 0/1.
  --verify-upstream-contract   CI / manual isolated conformance: drive the guarded runner and
  --verify-auth-required       assert the upstream contract or the AUTH_REQUIRED path. Never
                               granted to the skill; not a user runtime path.

Imports are lazy per branch so `--contract-json` stays provably stdlib-only and never pulls in
FastMCP or the connector.
"""

from __future__ import annotations

import sys

from . import contract

_VERIFY_MODES = {
    "--verify-upstream-contract": "upstream-contract",
    "--verify-auth-required": "auth-required",
}


def main(argv: list[str]) -> int:
    if not argv:
        from . import bridge

        return bridge.run_server()

    if argv == ["--contract-json"]:
        try:
            payload = contract.build_bridge_contract()
        except contract.ContractError as e:
            sys.stderr.write(f"learn-kit-nlm-bridge: {e}\n")
            return 1
        sys.stdout.write(contract.canonical_json(payload))
        return 0

    if len(argv) == 1 and argv[0] in _VERIFY_MODES:
        from . import bridge

        return bridge.run_verify(_VERIFY_MODES[argv[0]])

    sys.stderr.write(
        "learn-kit-nlm-bridge: accepts no arguments (run the server), `--contract-json`, "
        "`--verify-upstream-contract`, or `--verify-auth-required`.\n"
    )
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
