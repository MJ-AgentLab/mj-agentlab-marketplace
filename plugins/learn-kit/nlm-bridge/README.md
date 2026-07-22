# learn-kit-nlm-bridge

A local [MCP](https://modelcontextprotocol.io) server that stands between a host (Claude Code
or Codex) and the pinned, third-party [`notebooklm-mcp-cli`](https://github.com/jacob-bd/notebooklm-mcp-cli)
connector. It is the **only** thing that is ever meant to launch that connector, and it does so
on the bridge's terms.

This package is not published to PyPI and is not installed with `pip install` by name. It is
built into a wheel by the marketplace release, verified against a checksum, and installed into a
private, hash-locked virtual environment by
`plugins/learn-kit/scripts/install-nlm-bridge.mjs`. See the `learn-kit` plugin README for the
user-facing installation flow.

## What it does

- Answers MCP `initialize`, `ping`, and `tools/list` entirely from checked-in snapshots
  (`_data/`), with no upstream process, no network, and no credential access.
- Advertises a deliberately narrowed **6-tool** surface (`notebook_list`, `notebook_get`,
  `notebook_create`, `source_add`, `studio_create`, `studio_status`), each guarded by a
  hand-written adapter that is stricter than what the connector accepts.
- Only on the first real `tools/call` does it lazily start a guarded upstream child. That child
  runs with a scrubbed, from-scratch environment and an auth-recovery path that can reload saved
  cookies from disk but can **never** open a browser or run `nlm login`.
- Returns its own safe `initialize` instructions and drops the connector's, which would otherwise
  tell an agent to run `nlm login` / switch profiles.

## Security model in one line

The bridge lowers the risk of an accidental early upstream start and of capability creep. It is
**not** a trusted authorization boundary: it holds no user-signed unlock token and cannot prove a
human just consented, nor stop a host from calling an already-advertised tool directly. See
`docs/adr/[ADR]_Codex_Dual_Native_Plugin_Support.md` and the plan's threat model.

## Entry points

- `python -m learn_kit_nlm_bridge` — the stdio MCP host (what the shim runs).
- `python -m learn_kit_nlm_bridge --contract-json` — local-only preflight fingerprint.
- `python -m learn_kit_nlm_bridge.login login` — the restricted login shim (user-run only).

## License

MIT.
