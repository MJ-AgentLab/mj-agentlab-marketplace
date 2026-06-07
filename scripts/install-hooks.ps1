<#
.SYNOPSIS
    Install git hooks for mj-agentlab-marketplace

.DESCRIPTION
    Installs two hooks:
      1. commit-msg — validates a SINGLE commit subject at commit time
         (inline PATTERN regex; legacy)
      2. pre-push   — validates ALL about-to-push commit subjects in
         batch by delegating to scripts/validate-commits.sh (catches
         violations introduced via amend / cherry-pick / rebase that
         bypassed commit-msg, AND batches that aren't caught one-by-one)

    Handles both regular .git directory and bare repo + worktree
    setup (where .git is a pointer file).

.EXAMPLE
    .\scripts\install-hooks.ps1
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

# Resolve hooks directory (handle bare repo + worktree)
$GitPath = Join-Path $ProjectRoot ".git"
if (Test-Path $GitPath -PathType Leaf) {
    # .git is a file (pointer to bare repo)
    $GitDir = (Get-Content $GitPath).Trim() -replace "^gitdir:\s*", ""
    if (-not [System.IO.Path]::IsPathRooted($GitDir)) {
        $GitDir = Join-Path $ProjectRoot $GitDir
    }
    $HooksDir = Join-Path $GitDir "hooks"
} else {
    $HooksDir = Join-Path $GitPath "hooks"
}

if (-not (Test-Path $HooksDir)) {
    New-Item -ItemType Directory -Path $HooksDir -Force | Out-Null
}

$HookFile = Join-Path $HooksDir "commit-msg"

$HookContent = @'
#!/bin/sh
# commit-msg hook: validate commit message format
# Format: <type>(<scope>): <summary>

MSG=$(head -1 "$1")

# Allow merge commits
if echo "$MSG" | grep -qE "^Merge "; then
  exit 0
fi

PATTERN='^(feat|fix|perf|refactor|test|docs|infra)\((learn-kit|diagram-kit|marketplace|ci|scripts|deps|infra|docs-rule|docs-adr|docs-guide|docs-runbook|docs-spec|release)\): .{1,72}$'

if ! echo "$MSG" | grep -qE "$PATTERN"; then
  echo ""
  echo "ERROR: Commit message does not match required format."
  echo ""
  echo "  Expected: <type>(<scope>): <summary>"
  echo ""
  echo "  Types:  feat | fix | perf | refactor | test | docs | infra"
  echo "  Scopes (v4.x): learn-kit | diagram-kit | marketplace | ci | scripts | deps | infra | docs-rule | docs-adr | docs-guide | docs-runbook | docs-spec | release"
  echo ""
  echo "  See docs/rule/[STANDARD]_Commit_Message_Convention.md for the canonical whitelist."
  echo ""
  echo "  Your message: $MSG"
  echo ""
  exit 1
fi
'@

Set-Content -Path $HookFile -Value $HookContent -Encoding UTF8 -NoNewline

# ============================================================================
# pre-push hook — batch validation via scripts/validate-commits.sh
# ============================================================================
$PrePushFile = Join-Path $HooksDir "pre-push"

$PrePushContent = @'
#!/bin/sh
# pre-push hook: validate ALL about-to-push commit subjects in batch.
# Delegates to scripts/validate-commits.sh — single source of validation logic
# (so PATTERN never drifts between hooks and the standalone validator).
#
# git pre-push stdin format (one line per ref):
#   <local ref> <local sha> <remote ref> <remote sha>
# For a brand-new branch (no remote yet), <remote sha> is 0000000000...

REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
VALIDATOR="$REPO_ROOT/scripts/validate-commits.sh"

if [ ! -x "$VALIDATOR" ] && [ ! -r "$VALIDATOR" ]; then
  # Script missing — skip hook (don't block push). User likely on an
  # older revision pre-dating this hook installer.
  exit 0
fi

ZERO='0000000000000000000000000000000000000000'
EXIT=0

while read -r LOCAL_REF LOCAL_SHA REMOTE_REF REMOTE_SHA; do
  # Skip deletions (local sha = 0)
  if [ "$LOCAL_SHA" = "$ZERO" ]; then
    continue
  fi

  if [ "$REMOTE_SHA" = "$ZERO" ]; then
    # New branch — validate against upstream develop as fallback base.
    # Use 3-dot to find the merge-base implicitly.
    RANGE="origin/develop..$LOCAL_SHA"
  else
    # Existing branch — validate only the newly added commits
    RANGE="$REMOTE_SHA..$LOCAL_SHA"
  fi

  # Run validator; if it exits non-zero, fail the push
  sh "$VALIDATOR" "$RANGE"
  if [ $? -ne 0 ]; then
    EXIT=1
  fi
done

if [ $EXIT -ne 0 ]; then
  echo ""
  echo "pre-push hook: validation failed. To bypass (NOT recommended):"
  echo "  git push --no-verify"
  echo "Better: fix the offending commit(s) per the suggestions above, then re-push."
fi

exit $EXIT
'@

Set-Content -Path $PrePushFile -Value $PrePushContent -Encoding UTF8 -NoNewline

Write-Host "Installed commit-msg hook to: $HookFile" -ForegroundColor Green
Write-Host "Installed pre-push  hook to: $PrePushFile" -ForegroundColor Green
Write-Host ""
Write-Host "Validation format: <type>(<scope>): <summary>" -ForegroundColor White
Write-Host "  Types:  feat | fix | perf | refactor | test | docs | infra" -ForegroundColor White
Write-Host "  Scopes (v4.x): learn-kit | diagram-kit | marketplace | ci | scripts | deps | infra | docs-rule | docs-adr | docs-guide | docs-runbook | docs-spec | release" -ForegroundColor White
Write-Host "  Canonical: docs/rule/[STANDARD]_Commit_Message_Convention.md" -ForegroundColor White
Write-Host ""
Write-Host "Hook semantics:" -ForegroundColor White
Write-Host "  commit-msg : validates 1 commit subject inline (PATTERN duplicated in hook)" -ForegroundColor White
Write-Host "  pre-push   : validates ALL push-range commits via scripts/validate-commits.sh" -ForegroundColor White
Write-Host "               (batch check; catches amend/cherry-pick/rebase slips)" -ForegroundColor White
