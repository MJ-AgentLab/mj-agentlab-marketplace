"""The restricted login shim target (plan §2.3.1).

The installer creates a public `nlm` shim that runs `python -m learn_kit_nlm_bridge.login %*`.
This module accepts exactly two mutually-exclusive argv shapes and nothing else:

  login             -> run the upstream `nlm login` flow. This is the ONLY path that imports the
                       connector, and the ONLY sanctioned place a browser may open — because a
                       human ran it in a terminal. The skill, the agent and the bridge never
                       reach this branch.
  --contract-json   -> return the receipt / interpreter / shim-ownership subset, stdlib-only,
                       importing no upstream and reading no auth material.

Everything else — `--version`, extra arguments, `login switch`, and any profile/account
command — is refused BEFORE anything upstream is touched. Because `nlm login switch x` arrives
here as ["login", "switch", "x"], the exact-match on ["login"] is what blocks profile switching
without ever handing it to the connector.
"""

from __future__ import annotations

import sys

from . import contract


def main(argv: list[str]) -> int:
    if argv == ["--contract-json"]:
        try:
            payload = contract.build_login_contract()
        except contract.ContractError as e:
            sys.stderr.write(f"learn-kit-nlm-bridge login: {e}\n")
            return 1
        sys.stdout.write(contract.canonical_json(payload))
        return 0

    if argv == ["login"]:
        # The single upstream-touching path. Fixed argv so only the bare `login` callback runs;
        # `login switch` and profile commands can never be reached from here because they would
        # have been a different argv and rejected above.
        from notebooklm_tools.cli.main import cli_main

        sys.argv = ["nlm", "login"]
        cli_main()
        return 0  # cli_main normally raises SystemExit first; this is a fallback.

    sys.stderr.write(
        "learn-kit-nlm-bridge login: accepts exactly `login` or `--contract-json`. "
        "Profile, account and `login switch` commands, `--version`, and any extra arguments "
        "are refused.\n"
    )
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
