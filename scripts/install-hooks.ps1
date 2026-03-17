<#
.SYNOPSIS
    Install git hooks for mj-agentlab-marketplace

.DESCRIPTION
    Installs commit-msg hook that validates commit message format.
    Format: <type>(<scope>): <summary>

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

PATTERN='^(feat|fix|perf|refactor|test|docs|infra)\((mj-git|mj-doc|mj-n8n|mj-ops|ci|deps|scripts|marketplace)\): .{1,72}$'

if ! echo "$MSG" | grep -qE "$PATTERN"; then
  echo ""
  echo "ERROR: Commit message does not match required format."
  echo ""
  echo "  Expected: <type>(<scope>): <summary>"
  echo ""
  echo "  Types:  feat | fix | perf | refactor | test | docs | infra"
  echo "  Scopes: mj-git | mj-doc | mj-n8n | mj-ops | ci | deps | scripts | marketplace"
  echo ""
  echo "  Your message: $MSG"
  echo ""
  exit 1
fi
'@

Set-Content -Path $HookFile -Value $HookContent -Encoding UTF8 -NoNewline

Write-Host "Installed commit-msg hook to: $HookFile" -ForegroundColor Green
Write-Host ""
Write-Host "Validation format: <type>(<scope>): <summary>" -ForegroundColor White
Write-Host "  Types:  feat | fix | perf | refactor | test | docs | infra" -ForegroundColor White
Write-Host "  Scopes: mj-git | mj-doc | mj-n8n | mj-ops | ci | deps | scripts | marketplace" -ForegroundColor White
