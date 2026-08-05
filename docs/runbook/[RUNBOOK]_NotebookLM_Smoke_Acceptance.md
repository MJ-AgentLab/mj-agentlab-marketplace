---
type: runbook
scope: marketplace
summary: Real end-to-end NotebookLM smoke acceptance for three-views (plan §6 "Real NotebookLM smoke")
owner: marketplace-maintainers
created: 2026-07-23
updated: 2026-07-24
state: active
version: v1.1
last-verified: 2026-07-24
domain: release
related:
  - ./[RUNBOOK]_Codex_Dual_Native_Manual_Acceptance.md
  - ../adr/[ADR]_Codex_Dual_Native_Plugin_Support.md
  - ../rule/[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md
  - ../INDEX.md
---

# [RUNBOOK] NotebookLM Smoke Acceptance

> **What this is.** The one **write-path** deliverable the plan `§6 Acceptance Matrix` calls
> **"Real NotebookLM smoke"**: a single, minimal, end-to-end run of `/learn-kit:three-views` that
> actually creates a notebook, uploads one source, and generates one **mind_map** against a **real**
> personal NotebookLM account. It exercises the full `local → Gate A → discovery → Gate B → mutation`
> pipeline (`SKILL.md:410`) with real credentials and real data.
>
> **Sibling deliverable, not this one.** The **local + consent-gate** behavior (every gate reached by
> **declining**, zero mutations) lives in
> [`[RUNBOOK]_Codex_Dual_Native_Manual_Acceptance.md`](./[RUNBOOK]_Codex_Dual_Native_Manual_Acceptance.md)
> §2.8. This runbook is the opposite: it **requires** `nlm login` and produces exactly **one** real
> artifact, then deletes the notebook by hand. Read §2.8 there first — it establishes the decline path;
> this runbook establishes the accept path.

> [!IMPORTANT]
> **First real run completed 2026-07-24 (v1.1) — `last-verified: 2026-07-24` now records a genuine
> end-to-end pass, not just repo-grounding.** The v1.0 authoring date (2026-07-23) was only *grounded
> against the repo* (`develop @ 15d4749` — each command / path / tool / parameter confirmed present); no
> human had driven the smoke then, and the NLM write path had **never** been exercised end-to-end (dead
> code until learn-kit 4.0.1 wired `--nlm-preflight`; see §1.1). The 2026-07-24 run exercised it for the
> first time — against develop's 4.0.1 via `claude --plugin-dir` (`learn-kit@inline`), since the installed
> release was still 4.0.0 — with the full outcome + 12-key fingerprint recorded in §5.

> [!WARNING]
> **This runbook mutates a real Google/NotebookLM account.** It uploads a local Markdown file to
> Google's servers and creates a real artifact. Do **not** use a source containing anything you would not
> upload. The gates are a **behavioral workflow**, not an unbypassable security boundary
> (`SKILL.md:490-491`). An AI agent must **not** run this smoke on the user's behalf — real login + real
> data + real mutation are human-gated.

## §1 Preconditions

### §1.1 Surfaces under test (measured `develop @ 15d4749`, 2026-07-23)

| Thing | Value | Evidence |
|-------|-------|----------|
| marketplace VERSION | `7.0.1` | `VERSION` |
| learn-kit plugin | `4.0.1` | `plugins/learn-kit/.claude-plugin/plugin.json` version |
| diagram-kit plugin | `0.2.0` | `plugins/diagram-kit/.claude-plugin/plugin.json` version |
| bridge **wheel** the installer targets | `4.0.0` (release `v7.0.0`, wheel + `.sha256`) | `install-nlm-bridge.mjs:44-53` |
| connector pinned inside the wheel | `notebooklm-mcp-cli==0.8.7` | `install-nlm-bridge.mjs:45` |
| preflight `--nlm-preflight` becomes reachable | learn-kit **4.0.1** (was a dead fail-closed stub in 4.0.0) | `hash-upload-corpus.mjs:417-515` |

> ⚠ **TRAP (version skew — read before recording anything).** The plugin is **4.0.1** but the bridge
> **wheel** and the `--nlm-preflight` fingerprint's `bridge_version` are **`4.0.0`** — this is
> **correct, not drift**. 4.0.1 changed only the helper `.mjs` (it wired the preflight); it did **not**
> rebuild the wheel or move the installer's canonical URL off `v7.0.0`. A preflight that reports
> `bridge_version: 4.0.0` on a 4.0.1 plugin is a **PASS**. *`install-nlm-bridge.mjs:44,46,48`;
> `contract.py:40` (`BRIDGE_VERSION = __version__  # 4.0.0`); `hash-upload-corpus.mjs:513` (helper
> projects the bridge's contract keys verbatim).*

### §1.2 Toolchain (record exact versions in §5)

- [ ] **Node 22+** (`node --version`). The Node-22 floor is the skill's `--self-check`, not the installer.
  *`hash-upload-corpus.mjs:28,56-65`.*
- [ ] **uv == 0.11.21** exact (`uv --version`). The installer's gate is `=== "0.11.21"`, **not** `>=`.
  *`install-nlm-bridge.mjs` uv-version gate.*
- [ ] A **Python 3.12** interpreter uv can resolve (installer never downloads it).
- [ ] **Claude Code** (or Codex CLI) host with the learn-kit plugin installed.

### §1.3 Bridge installed + on PATH + logged in (this smoke REQUIRES all three)

Unlike the sibling runbook, this one only runs once the NLM branch is fully live. Do these **once**, by
hand, in a terminal — the skill/agent/installer never do them for you (`SKILL.md:617,638-640`):

- [ ] **P1 — Install the bridge.** Run the installer manually (single line; the canonical URLs must match
  byte-for-byte — the installer refuses anything else). *`SKILL.md:625-631`; `install-nlm-bridge.mjs:44-53`.*
  ```
  node "<abs-plugin-root>/scripts/install-nlm-bridge.mjs" install --wheel-url https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases/download/v7.0.0/learn_kit_nlm_bridge-4.0.0-py3-none-any.whl --checksum-url https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases/download/v7.0.0/learn_kit_nlm_bridge-4.0.0-py3-none-any.whl.sha256
  ```
  `<abs-plugin-root>` = the installed learn-kit plugin root (render it from the skill locator; the README
  shows the same template with a placeholder that must **not** be run verbatim).
- [ ] **P2 — Add the fixed public bin to the PATH that launches the host, then RESTART the host.**
  *`SKILL.md:633-636`.*
  - Windows: `%LOCALAPPDATA%\MJ-AgentLab\bin`
  - Ubuntu: `${XDG_BIN_HOME:-$HOME/.local/bin}`
- [ ] **P3 — `nlm login`.** Complete an interactive login in a terminal so a personal NotebookLM session
  exists. Render it as the logical `nlm login` **or** the receipt-owned absolute shim (Windows
  `& "<abs-nlm.cmd>" login`; Ubuntu `"<abs-nlm>" login`). The skill/bridge **never** log in for you.
  *`SKILL.md:512-516`.*
  > ⚠ **TRAP.** `nlm login` opens a **browser**; only a *user-initiated* login may do so. If you skip P3,
  > the smoke does **not** silently authenticate — discovery returns `AUTH_REQUIRED`, the run stops, and
  > you are sent back here (§2.5-I / `SKILL.md:512-518`). That is correct behavior, not a bug.

### §1.4 Source material — keep it trivial and non-sensitive

- [ ] **P4 — Pick a throwaway topic** whose generated Markdown you are content to upload to Google (e.g. a
  public concept like "idempotency"). The single generated tier's `.md` file is the **only** thing that
  leaves your machine (`SKILL.md:128-129,455-459`). Never point this smoke at a private/sensitive source.

### §1.5 How to read each check

- `[ ]` → record **PASS** / **FAIL** / **N/A** in §5.
- **Grounding:** every check cites the on-disk fact it verifies (`file:line`). If the running software
  disagrees with a citation, the **software is authoritative** — record the delta, don't "fix" this doc.
- **⚠ TRAP:** a specific false-pass / false-fail. Read it before recording.
- **Record, but never for account identity.** You will record the exact Node version and the **full local
  bridge/receipt contract** (the 12-key preflight fingerprint). You must **not** record or surface any
  Google **account / profile** — the fingerprint deliberately contains none (`SKILL.md:468,481-482`).

## §2 Steps

### §2.1 Freeze the plan: single tier + one mind_map (before any staging or remote contact)

The mandatory quota right-sizing (`SKILL.md:422`, 5B.1) runs entirely locally — there is no API for prior
same-day Studio usage, so you size the batch yourself. Target the **minimal** set: **1 uploaded tier + 1
mind_map = 1 `source_add` + 1 `studio_create`**.

- [ ] **A1 — At Step 1.3, select exactly ONE tier.** Recommend `structural` (most self-contained). This
  makes `generated_tiers = [structural]`, so only one `.md` is written and only one source can upload.
  *`SKILL.md:78,394-405`.*
- [ ] **A2 — At Step 4, check ONLY the mind_map cell** (no HTML, no audio/video/slide_deck). This makes
  `selected_view_cycled_types = {}` and `mind_map_selected = true`, so `N = 0×1 + 1 = 1`.
  *`SKILL.md:397-405`.*
- [ ] **A3 — At the 5B.1 quota gate, choose "Confirm all N" (N = 1)** and freeze the set.
  *`SKILL.md:427-447`.*
  > ⚠ **TRAP (why the single tier is chosen at Step 1.3, not the quota gate).** The 5B.1 **"Pick single
  > tier"** option is **hidden** when `selected_view_cycled_types == {}` — i.e. for a mind-map-only
  > selection tier-picking is moot, because the mind_map is view-agnostic and built from the whole
  > uploaded corpus (`SKILL.md:441-442,670-672`). So you cannot narrow to one tier *at the quota gate*
  > if you generated all three. The single-source outcome must come from **A1** (generate one tier). If
  > you generated 3 tiers and only mind_map, all **3** would upload as sources for the one mind_map — a
  > heavier run, not the minimal smoke.

### §2.2 Local pre-checks (standalone, still zero remote contact)

Run these by hand to confirm the environment is live **before** driving the skill. They spawn **no** upstream
and reach **no** network (`--nlm-preflight` runs the bridge's local `--contract-json` only;
`hash-upload-corpus.mjs:401-410`).

- [ ] **B1 — `--self-check` exits 0.** *`hash-upload-corpus.mjs:579-587`.*
  ```
  node "<abs-skill-dir>/scripts/hash-upload-corpus.mjs" --self-check
  ```
- [ ] **B2 — `--nlm-preflight` exits 0 and prints the 12-key fingerprint.** This is the step that was a
  dead fail-closed stub before learn-kit 4.0.1; it now runs the receipt-owned bridge shim's
  `--contract-json`. *`hash-upload-corpus.mjs:417-515`; `contract.py:392-420`.*
  ```
  node "<abs-skill-dir>/scripts/hash-upload-corpus.mjs" --nlm-preflight
  ```
  Record the JSON verbatim in §5. Its keys, in order: `bridge_version`, `connector_version`,
  `python_version`, `install_receipt_sha256`, `environment_sha256`, `public_schema_sha256`,
  `upstream_schema_sha256`, `auth_guard_sha256`, `base_url`, `transport`, `tools`, `instructions_policy`.
  Expect `bridge_version:"4.0.0"` (§1.1 trap), `connector_version:"0.8.7"`,
  `base_url:"https://notebooklm.google.com"`, `transport:"stdio"`,
  `instructions_policy:"prompt-user-only"`, and `tools` = exactly the 6 (below).
  *`contract.py:42-44,408-419`; `hash-upload-corpus.mjs:352-354,359-372`.*
- [ ] **B3 (optional) — Probe `--mode bootstrap`, if you have the repo checked out.** Asserts the bridge
  answers `initialize` / `ping` / `tools/list` locally with the 6 tools, spawns **no** threat child, and
  opens **no** external connection. *`scripts/probe-learn-kit-nlm-bridge.mjs:6,51,471-594`.*
  ```
  node scripts/probe-learn-kit-nlm-bridge.mjs --config plugins/learn-kit/.mcp.json --server notebooklm-mcp --mode bootstrap
  ```
  > ⚠ **TRAP (never run the default smoke script).** `npm run smoke:nlm-contract` is `--mode all`
  > (`package.json:13`), which includes `upstream-contract` + `auth-required` — those **drive the real
  > upstream** and are **forbidden** here (plan §6). Run the **raw** command with `--mode bootstrap`
  > only. The probe script lives at repo `scripts/probe-learn-kit-nlm-bridge.mjs`, **not** under
  > `plugins/learn-kit/`, so it is absent from an installed plugin — B3 is **N/A** if you only have the
  > plugin installed. *(ship-location grounded by that path; `--mode all` at `package.json:13`.)*

**The 6 tools** (`mcp__plugin_learn-kit_notebooklm-mcp__<tool>`): `notebook_list`, `notebook_get`,
`notebook_create`, `source_add`, `studio_create`, `studio_status`. `refresh_auth` / `server_info` /
`source_delete` are absent by design (`SKILL.md:418-420`).

### §2.3 Drive the skill up to Gate A

- [ ] **C1 — Invoke** `/learn-kit:three-views <topic>` and walk Step 1 → Step 3 (§2.1 selections), so the
  skill writes the single tier's Markdown, stages it (`--stage`, `SKILL.md:455-459`), and runs
  `--self-check` → `--nlm-preflight` (`SKILL.md:451-468`). Capture from the skill's staging: `manifest_path`,
  `manifest_sha256`, `corpus_sha256` (the skill computes these; **you never guess a SHA** —
  `hash-upload-corpus.mjs:18-20`).
  > ⚠ **TRAP (title composition).** The skill composes `planned_new_title = learn-kit:<topic>`
  > (`SKILL.md:486`). To get a UTC-stamped, unambiguously-a-smoke title that you can later find + delete,
  > choose the **topic** to carry the stamp. Compute it in PowerShell (plan §6):
  > ```
  > "[SMOKE]_learn-kit_" + (Get-Date).ToUniversalTime().ToString("yyyyMMdd_HHmmss")
  > ```
  > Whatever title the skill proposes, **read it back verbatim at Gate B (§2.6) and record it in §5** —
  > it is the handle you use to delete the notebook in §2.9.

### §2.4 Gate A — remote-network consent (`SKILL.md:470-498`)

The first 6-tool call is the first moment the bridge may reach Google. Before giving consent, confirm the
disclosure is **complete** — all six points (`SKILL.md:475-491`):

- [ ] **I2a** — guarded bridge **+** third-party/experimental risk: connector `notebooklm-mcp-cli v0.8.7`
  over **undocumented** NotebookLM APIs; local cookies; may refresh CSRF/session tokens; runner disables
  upstream headless-auth; never exposes/calls `refresh_auth`.
- [ ] **I2b** — **personal** endpoint `https://notebooklm.google.com`; "uses whatever personal login is
  currently the default" and **never enumerates/displays/selects/requires/binds a Google account/profile**.
- [ ] **I2c** — preflight fingerprint: bridge / connector / Python versions + the **five SHAs**.
- [ ] **I2d** — plan: `planned_new_title`, upload corpus + `corpus_sha256`, ordered artifact set (here: 1
  mind_map) **and** "sensitive-source risk — uploaded content leaves your machine".
- [ ] **I2e** — pinned upstream docs (v0.8.7 `AUTHENTICATION.md` / `MCP_GUIDE.md`).
- [ ] **I2f** — **"behavioral workflow gate, not an unbypassable authorization boundary."**
- [ ] **I3 — Give an explicit YES.** Only a direct affirmative proceeds; a default / silence / vague reply
  / timeout / earlier "pre-consent" is a **refusal** (which would run `--cleanup-manifest` and keep local
  artifacts). *`SKILL.md:496-498`.* For this smoke, consent.

### §2.5 Discovery — `notebook_list({})` exactly once (`SKILL.md:500-523`)

- [ ] **D1 — Exactly one `notebook_list({})`** freezes the discovery snapshot. For a fresh smoke there is
  no reuse candidate, so **no** `notebook_get` / `studio_status` runs yet. *`SKILL.md:504-508`.*
- [ ] **D2 (fallback) — AUTH_REQUIRED handling.** If discovery returns `AUTH_REQUIRED` (fresh-none / stale
  / 400 / 401 / 403 / RPC16): the run **stops at zero mutations**, prompts **you** to `nlm login` (logical
  command + receipt-owned absolute shim), and does **no** auto headless/login/account/profile action.
  Complete §1.3-P3, then restart from a fresh preflight → new Gate A. *`SKILL.md:512-518`.*
  > ⚠ **TRAP.** AUTH_REQUIRED is the **expected** outcome if you skipped `nlm login`. It is a
  > **precondition gap**, not a smoke FAIL — fix P3 and restart. A real FAIL here is a *mutation* or a
  > *remote browser/login* happening automatically.

### §2.6 Gate B — mutation consent + exact ordered plan (`SKILL.md:525-567`)

Before any mutation, the skill presents the complete, strictly-ordered plan. Verify it is **exactly** this
(new-target branch, `SKILL.md:531-543`), each step exactly once:

- [ ] **E1 — The ordered plan reads (in order):**
  1. `notebook_create(title=<planned_new_title>)` — once.
  2. `source_add(notebook_id=<derived from step 1>, source_type=file, file_path=<exact staged .md path>, wait=true)` — once (count = `len(nlm_upload_tiers)` = **1**). *`SKILL.md:534-536,84`.*
  3. `notebook_get(<derived>)` — source checkpoint once, **interval 0 / timeout 30s**, verify source count = **1**. *`SKILL.md:537-538`; plan §6.*
  4. `studio_create(notebook_id=<derived>, source_ids=[<derived source id>], artifact_type=mind_map, title=<display title>, confirm=true)` — once. *`SKILL.md:539-541,577-578`.*
  5. `studio_status(<derived>)` — final checkpoint once, **interval 0 / timeout 30s**. *`SKILL.md:543`; plan §6.*
- [ ] **E2 — mind_map payload is minimal:** `source_ids` + `title` + `confirm=true` (+ `artifact_type=mind_map`) **only** — **NO** `focus_prompt`, **NO** `language`. The connector v0.8.7 ignores both for mind maps and the contract **rejects** them if sent. *`SKILL.md:577-578,670-672`.*
- [ ] **E3 — Give one explicit confirmation** authorizing exactly this plan. Any **extra / repeated /
  missing / reordered** mutation, any non-staged file, or any drift in `source_type` / target / title /
  argument / derived ID / contract / manifest / corpus / artifact **voids** the authorization → stop and
  demand a fresh Gate B. *`SKILL.md:558-562`.*
  > ⚠ **TRAP (TOCTOU — state it, don't overclaim it).** The upstream `source_add` has no
  > conditional-write / version token, so a residual race remains between the last local verify and the
  > moment the MCP server opens the file. Gate B must disclose this; the per-mutation recheck only
  > **shrinks** the window and fails closed on already-observed drift — it is **not** an atomic upload.
  > *`SKILL.md:564-567`; plan §6 assumptions.*

### §2.7 Watch the mutations execute, with per-mutation re-verification (`SKILL.md:551-556,569-584`)

- [ ] **F1 — Before EVERY mutation** (steps 1, 2, 4 above), the skill re-runs the helper `--nlm-preflight`
  **and** a full `--verify-manifest <manifest_path> --expected-manifest-sha256 <manifest_sha256>
  --expected-corpus-sha256 <corpus_sha256>`, with **no** file write and **no** other remote call between
  those two checks and the mutation they gate. *`SKILL.md:551-556`.*
- [ ] **F2 — `notebook_create`** runs once; the returned notebook ID is bound and reused verbatim for all
  later steps (never re-derived). *`SKILL.md:533,558`.*
- [ ] **F3 — `source_add`** runs once with `source_type=file`, the **exact staged path** (never the
  original output file), `wait=true`; the returned source ID is bound. *`SKILL.md:534-536`.*
- [ ] **F4 — `notebook_get`** confirms **source count = 1** (interval 0 / timeout 30s). *`SKILL.md:537-538`
  (source count); interval/timeout per plan §6.*
- [ ] **F5 — `studio_create(mind_map)`** runs once (E2 payload). *`SKILL.md:539-541,577-578`.*
- [ ] **F6 — `studio_status`** runs once (interval 0 / timeout 30s); record the artifact/record ID.
  *`SKILL.md:543`.*
  > ⚠ **TRAP (mind_map is not polled like audio/video).** Async artifacts poll every 10s ≤12× ≤120s;
  > the **mind_map** gets a **single** status checkpoint (interval 0, timeout 30s). If the mind_map is
  > still "pending" at that single check, that is a **status you record**, not a reason to loop.
  > *`SKILL.md:542-543,603`.*

### §2.8 Cleanup the local staging root

- [ ] **G1 — `--cleanup-manifest` removes the staging root and reports no residue.** The skill runs it on
  success/termination; you can also run it by hand. It refuses to widen the deletion on any hash mismatch.
  *`SKILL.md:586-590`; `hash-upload-corpus.mjs:334-345`.*
  ```
  node "<abs-skill-dir>/scripts/hash-upload-corpus.mjs" --cleanup-manifest <manifest_path> --expected-manifest-sha256 <manifest_sha256>
  ```
- [ ] **G2 — Confirm the staging root (`<os-temp>/learn-kit-upload-*`) is gone.**
  *`hash-upload-corpus.mjs:92-104,317-345`.*

### §2.9 NotebookLM Web UI — manual verification + manual delete (automation deletes nothing)

- [ ] **W1 — The mind_map is grounded on THE one source only.** Open notebooklm.google.com, find the
  notebook by the recorded title (§2.3 trap), open the generated mind_map, and confirm it reflects only
  the single uploaded `.md`. *Plan §6.*
  > ⚠ **TRAP.** Do **not** count any `focus`/`language` steering effect as a pass condition — v0.8.7
  > mind_map ignores both (E2). The only claim is "one source in, mind_map reflects it".
- [ ] **W2 — Delete the test notebook in the Web UI, by hand.** This skill/bridge has **no**
  `notebook_delete` / `source_delete` and never deletes remotely — cleanup of the remote artifact is
  **manual**. *`SKILL.md:794`; `public-tools-v1.json` (6 tools).*

## §3 Verification

The pass is complete when **every** `[ ]` above is PASS or a justified N/A, and §5 records: exact Node
version, the full `--nlm-preflight` fingerprint (12 keys, no account/profile), the exact notebook title,
and the mind_map artifact/record ID.

- [ ] §2.1 Freeze (A1–A3) — single tier + mind_map frozen
- [ ] §2.2 Local pre-checks (B1–B3) — `--self-check` / `--nlm-preflight` exit 0; probe bootstrap clean (or N/A)
- [ ] §2.3 Drive to Gate A (C1) — staging hashes captured
- [ ] §2.4 Gate A (I2a–I3) — disclosure complete, explicit consent
- [ ] §2.5 Discovery (D1–D2) — one `notebook_list`, AUTH path understood
- [ ] §2.6 Gate B (E1–E3) — exact ordered plan, mind_map payload minimal, one confirmation
- [ ] §2.7 Mutations (F1–F6) — per-mutation re-verify; 5 calls exactly once each
- [ ] §2.8 Local cleanup (G1–G2) — staging removed
- [ ] §2.9 Web UI (W1–W2) — mind_map grounded; notebook deleted by hand

> A **remote contact before Gate A** (§2.4), a **mutation not in the Gate-B plan** (§2.6/§2.7), or an
> **auto login/headless/account action** (§2.5) is a **release blocker** — escalate, don't waive.

## §4 Rollback

The only durable side effects are the **remote notebook** and the **installed bridge**:

```bash
# 1. Remote: delete the test notebook by hand in the NotebookLM web UI (§2.9-W2). There is no CLI delete.

# 2. Local staging: normally auto-removed (§2.8); if it lingered, run --cleanup-manifest (never rm -rf).
node "<abs-skill-dir>/scripts/hash-upload-corpus.mjs" --cleanup-manifest <manifest_path> --expected-manifest-sha256 <manifest_sha256>

# 3. Bridge (only if you want to remove it after the smoke; ownership-checked, leaves foreign files alone):
node "<abs-plugin-root>/scripts/install-nlm-bridge.mjs" uninstall
```

- If `uninstall` legitimately leaves a shim (bytes drifted from the receipt, or a file outside the managed
  bin), that is **correct fail-closed behavior**, not an error.
- Leaving `nlm login` credentials in place is fine; the smoke never stored anything beyond the normal
  connector session. To fully sign out, use `nlm` / the NotebookLM web UI yourself.

## §5 Change History

| Version | Date | last-verified | Summary |
|---------|------|---------------|---------|
| v1.0 | 2026-07-23 | 2026-07-23 | Initial version. Grounded against `develop @ 15d4749` (learn-kit 4.0.1, bridge wheel 4.0.0). End-to-end run **pending** — `last-verified` is the repo-grounding date, not a completed pass (see banner). First real run should append a row here with: Node version, the 12-key preflight fingerprint, the exact notebook title, the mind_map record ID, and PASS/FAIL per §3. |
| v1.1 | 2026-07-24 | 2026-07-24 | **First real end-to-end run — PASS** (§2.1–§2.8; §2.9 W1 grounded + W2 deleted, owner-completed). Node `v22.18.0`. Preflight fingerprint (12-key, no account/profile): bridge `4.0.0` · connector `0.8.7` · Python `3.12.13`; five SHAs — receipt `ba3e8c0c…`, env `4593e190…`, public-schema `cad6561f…`, upstream-schema `bf1f384f…`, auth-guard `898311e2…`; `base_url https://notebooklm.google.com` / `stdio` / `prompt-user-only` / 6 tools. Notebook `learn-kit:[SMOKE]_learn-kit_20260724_033341` (id `084518eb-c814-4f76-ba6f-0caabbf5c18a`); 1 source `85c664f9-2882-407b-a76b-767973294aa0`; mind_map artifact `5a3a0d80-d1d6-4968-af20-6ec6bd76e24d` (status completed); manifest `a3566a80…` / corpus `6bbc1c28…`. All 5 mutations ran once, in order, with per-mutation contract+manifest re-verification; staging cleaned. Run against develop 4.0.1 via `claude --plugin-dir` (`learn-kit@inline`) — the installed release was still 4.0.0, so this validated the to-be-released code through a local override. Also fixed the §2.2-B3 `probe:602-603` misgrounded citation. |

## Appendix A — Exact strings (copy-paste)

```
# UTC smoke title stamp (PowerShell) — feed into the TOPIC so planned_new_title carries it
"[SMOKE]_learn-kit_" + (Get-Date).ToUniversalTime().ToString("yyyyMMdd_HHmmss")

# The 5 real mutations, in order (each exactly once)
notebook_create(title=<planned_new_title>)
source_add(notebook_id=<derived>, source_type=file, file_path=<exact staged .md>, wait=true)
notebook_get(<derived>)                       # source checkpoint, interval 0 / timeout 30s, source count = 1
studio_create(notebook_id=<derived>, source_ids=[<derived source id>], artifact_type=mind_map, title=<display>, confirm=true)
studio_status(<derived>)                      # final checkpoint, interval 0 / timeout 30s
# mind_map studio_create sends NO focus_prompt, NO language.

# 6 pre-authorized NLM tools / 3 denied (mcp__plugin_learn-kit_notebooklm-mcp__<tool>)
allow:  notebook_list  notebook_get  notebook_create  source_add  studio_create  studio_status
deny :  server_info    refresh_auth  source_delete

# Helper (staging/hash/preflight; abs-skill-dir = three-views skill dir)
node "<abs-skill-dir>/scripts/hash-upload-corpus.mjs" --self-check
node "<abs-skill-dir>/scripts/hash-upload-corpus.mjs" --nlm-preflight
node "<abs-skill-dir>/scripts/hash-upload-corpus.mjs" --cleanup-manifest <manifest.json> --expected-manifest-sha256 <hex>

# Optional local probe (repo only) — bootstrap ONLY. NEVER `npm run smoke:nlm-contract` (that is --mode all).
node scripts/probe-learn-kit-nlm-bridge.mjs --config plugins/learn-kit/.mcp.json --server notebooklm-mcp --mode bootstrap

# Installer (public bin: Win %LOCALAPPDATA%\MJ-AgentLab\bin · Ubuntu ${XDG_BIN_HOME:-$HOME/.local/bin})
node "<abs-plugin-root>/scripts/install-nlm-bridge.mjs" install \
  --wheel-url    https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases/download/v7.0.0/learn_kit_nlm_bridge-4.0.0-py3-none-any.whl \
  --checksum-url https://github.com/MJ-AgentLab/mj-agentlab-marketplace/releases/download/v7.0.0/learn_kit_nlm_bridge-4.0.0-py3-none-any.whl.sha256
# NOTE: real argv is a single line, one space between tokens; the backslashes above are display only.

# nlm login (user-run only; opens a browser)
nlm login          # or receipt-owned absolute shim: Windows  & "<abs-nlm.cmd>" login   ·   Ubuntu  "<abs-nlm>" login
```

## Appendix B — Honest limitations

- **One artifact, one shape.** This smoke exercises `mind_map` only (minimal quota). The three view-cycled
  paths (audio / video / slide_deck), multi-tier upload, and reuse (`corpus_sha256`-matched) are **not**
  exercised here — their per-mutation verification is covered structurally by
  `tests/hash-upload-corpus.test.mjs` and `SKILL.md:551-562`, but not by a real write.
- **The gates are not a trusted security boundary.** Per Gate A bullet 6 and plan §7: the bridge holds no
  user-signed token and cannot prove a human confirmed. §2.4/§2.6 verify the **behavioral workflow**, not an
  unbypassable control.
- **TOCTOU residue is real.** §2.6-E3 trap: the recheck shrinks but does not close the last-verify-to-open
  race; the upstream has no conditional upload.
- **Judgment calls.** "Disclosure complete" (§2.4), "mind_map grounded on the one source" (§2.9-W1) are
  human judgments — no exit code. Read the grounding and decide.
- **Automated coverage is local-only.** CI's `smoke:nlm-contract` (bootstrap / upstream-contract /
  auth-required) proves the bridge is safe **without** real credentials; it deliberately never logs in or
  writes. Only this human-run smoke proves the real end-to-end write path.

---

*Authored from `develop @ 15d4749` (2026-07-23). Every check cites its on-disk grounding; if the running
software diverges from a cited fact, record the divergence — the shipped software is authoritative.*
