---
type: standard
scope: marketplace
summary: Commit message format v1.1 — type(scope) header, 7 types, marketplace scope whitelist, branch-type matrix, §11 common mistakes from v4.5.0 post-mortem
owner: marketplace-maintainers
created: 2026-05-15
updated: 2026-05-18
state: active
version: v1.1
domain: governance
tags:
  - commit
  - convention
  - git
related:
  - ./[STANDARD]_Documentation_Framework.md
  - ./[STANDARD]_GitHub_Markdown.md
  - ./[STANDARD]_AI_Engineering_Execution_HITL_Prompt.md
  - ../guide/[GUIDE]_Contributing.md
revision: |
  2026-05-18 — v1.1: §11 Common Mistakes 新章（4 个 v4.5.0 后失败模式 + remediation）；companion scripts/validate-commits.{sh,ps1} + install-hooks.ps1 pre-push hook + 3 skill integrations（mp-git-commit / mp-git-push / mp-flow-self-review）；§9.3 Future CI Gates 更新指向新脚本；PATTERN regex 无变化（向后兼容）
  2026-05-15 — v1.0: Initial canonical commit convention
---

# [STANDARD] Commit Message Convention

## §1 Scope

This STANDARD applies to every commit on the `mj-agentlab-marketplace` repository, regardless of branch type or contributor (human or AI agent).

`docs/CONTRIBUTING.md` carries a 5-line summary plus a link here; this STANDARD is the canonical source. CI hooks and `/mp-git-commit` skill enforce this format.

## §2 Format

```
<type>(<scope>): <summary>

[optional body — explain why; max 72 chars per line]

[optional footer — standard git trailers only]
```

**Header rules**:

- `type` is one of 7 enum values (§3); lowercase
- `scope` is one of the marketplace whitelist (§4); lowercase; required when applicable
- `:` followed by exactly one space
- `summary` is imperative mood (e.g., "add" not "added" / "adds"), no period at end, ≤ 72 characters total header length
- 中文摘要 acceptable; mixing 中英 also OK

**Body rules** (when present):

- Blank line separates header from body
- Wrap at ≤ 72 characters per line
- Focus on **why**, not **what** (the diff already shows what)

**Footer rules** (when present):

- Standard git trailers only: `Co-Authored-By:`, `Refs:`, `Closes:`, `Fixes:`, `BREAKING CHANGE:`, `Signed-off-by:`
- No custom trailers

## §3 Commit Types (7 enum values)

| Type | When | Example |
|------|------|---------|
| `feat` | New feature, new plugin, new skill, new user-facing capability | `feat(marketplace): add 18 mp-* workflow skills` |
| `fix` | Bug fix in existing behavior | `fix(learn-kit): plugin.json repository must be string` |
| `perf` | Performance optimization, no behavior change | `perf(marketplace): batch INDEX rebuild` |
| `refactor` | Code/doc reorganization, no behavior change | `refactor(marketplace): split HITL Standard §4 into per-stage files` |
| `test` | Test additions / fixes | `test(scripts): add bump-version dry-run coverage` |
| `docs` | Documentation-only change | `docs(marketplace): integrate mp-* skills into HITL Standard v1.1` |
| `infra` | CI / scripts / deps / Docker / `.gitignore` / `.gitattributes` / `.github/` templates | `infra(release): bump marketplace 4.0.0 → 4.1.0` |

**Single type per commit**. If a change spans multiple types (e.g., feat + docs + infra), split into separate commits (see §6).

## §4 Scope Whitelist (marketplace v4.x)

| Scope | Range | Notes |
|-------|-------|-------|
| `marketplace` | top-level files (`VERSION`, `marketplace.json`, root `CLAUDE.md`, root `CHANGELOG.md`, `.gitignore`, `LICENSE`, `README.md`) | catch-all for marketplace-level metadata |
| `learn-kit` | `plugins/learn-kit/**` | the sole plugin since v4.0.0 |
| `ci` | `.github/workflows/`, `.github/PULL_REQUEST_TEMPLATE/`, `.github/ISSUE_TEMPLATE/` | CI / templates |
| `scripts` | `scripts/**` | infrastructure scripts (`bump-version.ps1` etc.) |
| `deps` | `package.json`, `package-lock.json`, `pyproject.toml`, `uv.lock`, lockfiles | dependency manifests |
| `infra` | `.gitattributes`, `.editorconfig`, `Dockerfile`, container/build configs | repo infrastructure that doesn't fit other scopes |
| `docs-rule` | `docs/rule/**` (post-PR 2; will be in use from v4.2.0 onward) | STANDARDs |
| `docs-adr` | `docs/adr/**` (post-PR 2) | ADRs |
| `docs-guide` | `docs/guide/**` (post-PR 2) | GUIDEs |
| `docs-runbook` | `docs/runbook/**` (post-PR 2) | RUNBOOKs |
| `docs-spec` | `docs/spec/**` (post-PR 2) | SPECs |
| `release` | combined commits during release PRs (typically with `infra` type for VERSION bumps) | special — see §4.1 |

**Rules**:

- Scope is a **closed allowlist**. Introducing a new scope **MUST** be done via a minor bump of this STANDARD (with rationale in §8 Change History).
- Scope is omitted for cross-domain commits (e.g., `docs:` with no scope when a docs change spans multiple `docs/` subdirs).
- For commits primarily of `docs` type, prefer the most specific `docs-*` scope (e.g., `docs(docs-rule):` for a STANDARD change). For multi-area docs changes, use `docs(marketplace):`.

### §4.1 Special: `release` scope

`infra(release)` is conventionally used for VERSION-bump commits in release PRs. The `release` scope signals "this commit triggers the release.yml workflow upon merge to main" — reviewers should treat it with care. The historical commit `infra(release): bump marketplace 3.2.1 → 4.0.0` (77a0c9d) is the canonical example.

## §5 Branch-Type × Commit-Type Matrix

Marketplace uses 6 branch types (per `docs/CONTRIBUTING.md`). Each branch type allows a specific set of commit types:

| Branch Type | Allowed Commit Types | Common Misuse |
|-------------|---------------------|---------------|
| `feature/*` | `feat`, `perf`, `refactor`, `test`, `docs`, `infra` | overusing `fix` (use `bugfix/*` branch) |
| `bugfix/*` | `fix`, `test`, `docs` | adding `feat` (cleanly split to feature/* branch) |
| `documentation/*` | `docs` only | mixing `feat` or `fix` (must split) |
| `maintain/*` | `infra`, `docs` | mixing `feat` or `fix` |
| `hotfix/*` | `fix` only (occasionally `test`) | broad `feat` work; hotfix should be minimal |
| `release/*` | `infra` (typically `infra(release)`), optionally `docs` for CHANGELOG promotion | implementing new features in a release branch |

**Why this matters**: branch type signals reviewer expectations (e.g., a `documentation/*` PR should be quickly reviewable since no code touches; a `hotfix/*` PR is critical and should be small). Commit types that don't match the branch type confuse reviewers and break the CI 6-step assumption.

The `/mp-git-commit` skill validates this matrix at commit time.

## §6 Commit Splitting Guidance

**Split when**:

| Signal | Reason |
|--------|--------|
| Different `scope` values | each scope reviews separately |
| Mixed `feat` + `refactor` | feature additions and structural cleanup deserve separate diffs |
| Schema change + app code using the schema | schema bisection / rollback easier when isolated |
| > 300 lines + > 5 files | sheer cognitive load |
| `infra` + `feat` in same change | infrastructure changes (gitignore, CI) shouldn't bundle with feature work |

**Do NOT split when**:

| Signal | Reason |
|--------|--------|
| Code + its unit test | tests are the contract; commit together |
| Guardrail (validation) + its immediate user (caller) | rollback boundary |
| < 5 files + < 100 lines | overhead outweighs benefit |

**Suggested commit ordering** (when splitting):

```
contract / schema  →  code  →  tests  →  docs  →  infra
```

This lets bisect identify breaking changes in the dependency direction.

## §7 Examples

### §7.1 Compliant Examples

```text
feat(marketplace): add 18 mp-* workflow skills under .claude/skills/

Adds 18 project-local Track C workflow skills covering the 11-stage AI
engineering loop. Naming follows the same-source symmetric pattern.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

```text
fix(learn-kit): plugin.json repository must be string per spec
```

```text
docs(docs-rule): bump Commit_Message_Convention to v1.1 with new release scope
```

```text
infra(release): bump marketplace 4.1.0 → 4.2.0
```

### §7.2 Non-Compliant Examples (with reason)

```text
feat: Add 18 skills.                               # ❌ no scope; period at end; PascalCase summary
FIX(learn-kit): plugin.json repository fix         # ❌ uppercase type
feat(learn-kit): added new skill                   # ❌ past tense (use imperative "add")
chore(marketplace): tidy up                        # ❌ "chore" is not in §3 enum
fix(my-marketplace): typo in README                # ❌ "my-marketplace" not in §4 whitelist
docs(skill): update intake                          # ❌ "skill" not in §4 whitelist (use marketplace or learn-kit)
feat(marketplace): add 18 mp-* workflow skills under .claude/skills/ — see PR for details   # ❌ header > 72 chars
```

## §8 Co-Authored-By Pattern (AI collaboration)

When a commit is produced via AI collaboration (Claude Code, etc.), include a `Co-Authored-By:` trailer:

```
Co-Authored-By: <Model Display Name> <noreply@anthropic.com>
```

Canonical model display names for marketplace work (as of 2026-05-15):

- `Claude Opus 4.7 (1M context)` (current default)
- `Claude Opus 4.6`
- `Claude Sonnet 4.6`
- `Claude Haiku 4.5`

Replace as needed when the model rotates. The trailer goes **after** any `Refs:` / `Closes:` / `Fixes:` lines.

## §9 Verification

### §9.1 Manual

Before pushing, run `git log --oneline -5` and inspect:

- Each header matches `<type>(<scope>): <summary>` regex
- Each summary uses imperative mood, no period, ≤ 72 chars total
- Footer trailers (if present) are standard
- Branch-type × commit-type matrix respected

### §9.2 Skill-Backed

`/mp-git-commit` (Stage 8) enforces format at commit time. If a commit slips through, `/mp-flow-self-review` (Stage 7) catches it pre-push.

### §9.3 Future CI Gates

v1.1 added standalone batch validator: `scripts/validate-commits.{sh,ps1}` (callable from CLI, mp-* skills, and pre-push hook). v1.2+ may add a `.github/workflows/comment-on-pr.yml` bot that posts per-commit failure details as PR comments (deferred — see P2 in v1.1 post-mortem). Current CI (`.github/workflows/ci.yml` `Validate Structure` job) already enforces PATTERN on every PR.

## §11 Common Mistakes (post-v4.5.0 lessons)

These 4 patterns caught real PRs — PR #102 was closed for exactly these violations before successful PR #103 rebuild. Each is now diagnosed automatically by `scripts/validate-commits.{sh,ps1}` with a targeted suggestion.

### §11.1 `chore` type rejected

Conventional Commits 1.0 defines `chore`, but marketplace's §3 enum does **not** include it. The 7 allowed types are: `feat | fix | perf | refactor | test | docs | infra`.

Substitution guide:
- Documentation-only changes (incl. deletes / renames / archive of docs): `docs(<scope>): ...`
- Restructuring without behavior change: `refactor(<scope>): ...`
- Build / CI / scripts / dependencies: `infra(<scope>): ...`

Bad: `chore(docs-adr): archive old exemption-review ADR`
Good: `docs(docs-adr): archive old exemption-review ADR`

### §11.2 `docs` is a TYPE not a SCOPE

A common mistake: using `docs` as the scope name. The canonical doc-related scopes per §4 are: `docs-rule` / `docs-adr` / `docs-guide` / `docs-runbook` / `docs-spec` — pick based on which `docs/` subdirectory is being edited.

Bad: `refactor(docs): rename CONTRIBUTING.md to ...`
Good: `refactor(docs-guide): rename CONTRIBUTING.md to ...`

If the change spans multiple `docs/` subdirs, use `docs(marketplace): ...` (broader marketplace-wide scope).

### §11.3 Summary > 72 chars (Chinese + symbols count as 1 char each)

PATTERN `.{1,72}` counts every grapheme regardless of byte width:
- `§` = 1 char (not 2 despite UTF-8 being 2 bytes)
- `→` = 1 char
- Each CJK character = 1 char
- Combining accents = 1 char each

Tip: when mixing Chinese / symbols, target 50-60 char summary to leave headroom.

Bad (75 chars): `feat(docs-rule): HITL STANDARD v1.3 -> v1.4 §0 Universal Skeleton + 内化 generic HITL workflow`
Good (64 chars): `feat(docs-rule): HITL STANDARD v1.3 -> v1.4 §0 universal skeleton internalization`

### §11.4 `documentation/*` branch PR template recommendation vs CI hook reality

The `.github/PULL_REQUEST_TEMPLATE/documentation.md` self-check item 8 suggests «documentation/* branches use only `docs` type». This is a **stylistic recommendation**, not a hook-enforced rule. CI's PATTERN accepts the wider type set (`feat`/`refactor`/`infra`/etc.) on any branch.

Reviewers may choose stricter convention during PR review (e.g., asking for `docs(marketplace): ...` instead of `feat(marketplace): ...` on a documentation/* branch). CI will **not** auto-reject for type-vs-branch-type mismatch.

If unsure, prefer the more specific semantic type (`feat` for new file, `refactor` for restructuring, `chore` → use `docs`/`refactor`/`infra` per §11.1).

### §11.5 Local validation before push (highly recommended)

Run `scripts/validate-commits.{sh,ps1}` **before** `git push`:

```bash
./scripts/validate-commits.sh                       # default: origin/develop..HEAD
./scripts/validate-commits.sh origin/main..HEAD     # custom range
```

```powershell
pwsh ./scripts/validate-commits.ps1
```

Catches violations BEFORE CI rejection — saves the close-PR / delete-branch / cherry-pick rebuild cycle (~30 min on a real failure batch).

Alternative: install the pre-push hook once (auto-validates every push):
```powershell
pwsh ./scripts/install-hooks.ps1
```

This installs both `commit-msg` (per-commit validation at commit time) and `pre-push` (batch validation at push time) hooks. The latter catches violations introduced via `git commit --amend` / `git cherry-pick` / `git rebase` that bypass `commit-msg`.

## §10 Change History

| Version | Date | Summary |
|---------|------|---------|
| v1.1 | 2026-05-18 | Add §11 Common Mistakes — 4 v4.5.0 failure patterns documented + remediation (chore type rejected / docs as type-not-scope / 72-char summary with CJK / branch-template vs CI reality / local validation workflow). Companion: scripts/validate-commits.{sh,ps1} + install-hooks.ps1 pre-push hook + 3 skill integrations (mp-git-commit Step 8 / mp-git-push 8th checklist item / mp-flow-self-review item 8). §9.3 updated to point to new validator. Backward compatible — PATTERN regex unchanged. |
| v1.0 | 2026-05-15 | Initial canonical commit convention. Extracted + expanded from `docs/CONTRIBUTING.md` § 提交规范. Replaces stale legacy `*-sys-*` scope whitelist with marketplace v4.x scopes (`learn-kit`, `marketplace`, `docs-*`, `release` etc.). Adopted in PR #75 (v4.2.0). Preserves Conventional Commits 1.0 base + 7-type enum; marketplace-specific 12-item scope whitelist. |
