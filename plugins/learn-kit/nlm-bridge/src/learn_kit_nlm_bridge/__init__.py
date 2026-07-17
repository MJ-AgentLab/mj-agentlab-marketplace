# learn-kit NLM bridge — a local MCP server that stands between a host (Claude Code / Codex)
# and the pinned, third-party NotebookLM connector.
#
# The whole package exists to be the ONLY thing that ever launches notebooklm-mcp-cli, and to
# do so on the bridge's terms: a narrowed 6-tool surface, a scrubbed child environment, an
# auth-recovery path that can reload cookies from disk but can never open a browser, and safe
# initialize instructions that never tell an agent to run `nlm login`. It answers MCP
# initialize / ping / tools/list entirely from checked-in snapshots and only lazily starts the
# guarded upstream child on the first real tools/call.
#
# See plan §2.3.1. `contract.py` holds the constants and the local contract; `bridge.py` is the
# host-facing MCP host; `upstream_runner.py` is the guarded child; `login.py` is the restricted
# login module the installer's shim points at.

__version__ = "4.0.0"
