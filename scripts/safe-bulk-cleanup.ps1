<#
.SYNOPSIS
    Safe bulk cleanup of merged Git branches (local + optional remote)

.DESCRIPTION
    Wraps the 4-check pre-flight + 3-trap-aware deletion logic per
    `.claude/skills/mp-git-cleanup/SKILL.md` §Bulk Cleanup Mode.

    Pre-flight checks (all must pass; otherwise STOP):
      1. No unmerged branches vs integration branch (default: develop)
      2. No open PRs (gh)
      3. Only protected worktrees exist (.bare + integration worktree)
      4. Candidate list dry-printed for human inspection

    Then deletes candidates with safety:
      - Uses `git for-each-ref refs/heads/` (no prefix; Trap #1-safe)
      - Multi-layer protected-branch refusal (main, develop, current HEAD)
      - DRY-RUN by default; -Apply flag required to execute
      - Remote cleanup opt-in via -IncludeRemote (Trap #2 explicit)

    Born from 2026-05-18 incident — see
    docs/postmortem/[POSTMORTEM]_2026-05-18_Bulk_Cleanup_Trap_Analysis.md

.PARAMETER Apply
    Execute deletions. Without this flag, runs in DRY-RUN mode (default).

.PARAMETER IncludeRemote
    Also delete remote orphan branches (branches in origin/* not in local
    after local cleanup, excluding protected). Only meaningful with -Apply.

.PARAMETER IntegrationBranch
    Base branch used for merge check. Defaults to "develop".

.PARAMETER Repo
    GitHub repo for `gh pr list` check. Defaults to
    "MJ-AgentLab/mj-agentlab-marketplace".

.EXAMPLE
    pwsh ./scripts/safe-bulk-cleanup.ps1
    # Dry-run; print candidates and predicted commands; modify nothing.

.EXAMPLE
    pwsh ./scripts/safe-bulk-cleanup.ps1 -Apply
    # Delete local candidates after pre-flight passes.

.EXAMPLE
    pwsh ./scripts/safe-bulk-cleanup.ps1 -Apply -IncludeRemote
    # Delete local + remote orphans.
#>

param(
    [switch]$Apply,
    [switch]$IncludeRemote,
    [string]$IntegrationBranch = "develop",
    [string]$Repo = "MJ-AgentLab/mj-agentlab-marketplace"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $ProjectRoot

$ProtectedPattern = '^(main|develop)$'

function Write-Section($title) {
    Write-Host ""
    Write-Host ("=" * 60) -ForegroundColor DarkGray
    Write-Host $title -ForegroundColor Cyan
    Write-Host ("=" * 60) -ForegroundColor DarkGray
}

function Stop-WithError($msg) {
    Write-Host ""
    Write-Host "STOP: $msg" -ForegroundColor Red
    exit 1
}

Write-Section "safe-bulk-cleanup.ps1"
Write-Host "Mode:               $(if ($Apply) { 'EXECUTE' } else { 'DRY-RUN (default; use -Apply to execute)' })" -ForegroundColor $(if ($Apply) { 'Yellow' } else { 'Green' })
Write-Host "IncludeRemote:      $IncludeRemote"
Write-Host "IntegrationBranch:  $IntegrationBranch"
Write-Host "Repo:               $Repo"
Write-Host "ProjectRoot:        $ProjectRoot"

# ============ Pre-flight Check 1: No unmerged branches ============
Write-Section "Pre-flight 1: unmerged branches vs $IntegrationBranch"

$unmerged = & git branch --no-merged $IntegrationBranch 2>&1
if ($LASTEXITCODE -ne 0) {
    Stop-WithError "git branch --no-merged failed: $unmerged"
}
$unmergedList = @($unmerged | Where-Object { $_ -match '\S' })
if ($unmergedList.Count -gt 0) {
    Write-Host "Unmerged branches found:" -ForegroundColor Red
    $unmergedList | ForEach-Object { Write-Host "  $_" }
    Stop-WithError "Pre-flight 1 FAILED: $($unmergedList.Count) unmerged branch(es). Resolve before bulk cleanup."
}
Write-Host "OK: no unmerged branches" -ForegroundColor Green

# ============ Pre-flight Check 2: No open PRs ============
Write-Section "Pre-flight 2: open PRs on $Repo"

$openPRs = & gh pr list -R $Repo --state open --json number,headRefName 2>&1
if ($LASTEXITCODE -ne 0) {
    Stop-WithError "gh pr list failed: $openPRs"
}
$openPRsParsed = @($openPRs | ConvertFrom-Json)
if ($openPRsParsed.Count -gt 0) {
    Write-Host "Open PRs found:" -ForegroundColor Red
    $openPRsParsed | ForEach-Object { Write-Host "  PR #$($_.number): $($_.headRefName)" }
    Stop-WithError "Pre-flight 2 FAILED: $($openPRsParsed.Count) open PR(s). Wait for merge/close or skip cleanup."
}
Write-Host "OK: 0 open PRs" -ForegroundColor Green

# ============ Pre-flight Check 3: Worktrees ============
Write-Section "Pre-flight 3: active worktrees"

$worktreesRaw = & git worktree list 2>&1
$worktrees = @($worktreesRaw | Where-Object { $_ -match '\S' })
Write-Host "Current worktrees ($($worktrees.Count)):"
$worktrees | ForEach-Object { Write-Host "  $_" }

$extraWorktrees = @($worktrees | Where-Object {
    $_ -notmatch '\.bare\s+\(bare\)$' -and
    $_ -notmatch "[\\/]$IntegrationBranch\s+[0-9a-f]+\s+\[$IntegrationBranch\]$"
})
if ($extraWorktrees.Count -gt 0) {
    Write-Host "Extra worktrees beyond .bare + $IntegrationBranch detected:" -ForegroundColor Yellow
    $extraWorktrees | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
    Stop-WithError "Pre-flight 3 FAILED: clean up extra worktrees via /mp-git-cleanup single-PR mode first, then re-run."
}
Write-Host "OK: only .bare + $IntegrationBranch worktrees" -ForegroundColor Green

# ============ Build candidate list (Trap #1-safe via for-each-ref) ============
Write-Section "Pre-flight 4: candidate list (Trap #1-safe via for-each-ref)"

$allLocal = @(& git for-each-ref refs/heads/ --format='%(refname:short)')
$candidates = @($allLocal | Where-Object { $_ -notmatch $ProtectedPattern })

Write-Host "Local branches total:      $($allLocal.Count)"
Write-Host "Protected (skip):          $($allLocal.Count - $candidates.Count) [$(($allLocal | Where-Object { $_ -match $ProtectedPattern }) -join ', ')]"
Write-Host "Candidates for deletion:   $($candidates.Count)"

if ($candidates.Count -eq 0) {
    Write-Host ""
    Write-Host "No local cleanup candidates. Repo is clean." -ForegroundColor Green
    if (-not $IncludeRemote) {
        exit 0
    }
}

Write-Host ""
Write-Host "Candidate branches:" -ForegroundColor Yellow
$candidates | ForEach-Object { Write-Host "  $_" }

# Defense-in-depth: re-check no protected name leaked into candidates
$leaked = @($candidates | Where-Object { $_ -match $ProtectedPattern })
if ($leaked.Count -gt 0) {
    Stop-WithError "Internal sanity check FAILED: protected branch leaked into candidates: $($leaked -join ', '). Aborting."
}

# ============ Local deletion ============
Write-Section "Local deletion"

if (-not $Apply) {
    Write-Host "[DRY-RUN] would execute:" -ForegroundColor DarkGray
    $candidates | ForEach-Object { Write-Host "  git branch -d $_" -ForegroundColor DarkGray }
} else {
    foreach ($branch in $candidates) {
        $result = & git branch -d $branch 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  Deleted: $branch" -ForegroundColor Green
        } else {
            Write-Host "  FAILED: $branch  ($result)" -ForegroundColor Red
        }
    }
}

# ============ Remote deletion (opt-in) ============
if ($IncludeRemote) {
    Write-Section "Remote deletion (-IncludeRemote)"

    & git fetch --prune origin 2>&1 | Out-Null

    $allRemote = @(& git for-each-ref refs/remotes/origin/ --format='%(refname:short)')
    $remoteCandidates = @(
        $allRemote |
        Where-Object { $_ -ne 'origin/HEAD' } |
        ForEach-Object { $_ -replace '^origin/', '' } |
        Where-Object { $_ -notmatch $ProtectedPattern }
    )

    Write-Host "Remote branches total:     $($allRemote.Count)"
    Write-Host "Remote candidates:         $($remoteCandidates.Count)"

    if ($remoteCandidates.Count -eq 0) {
        Write-Host "No remote orphans." -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "Remote candidates:" -ForegroundColor Yellow
        $remoteCandidates | ForEach-Object { Write-Host "  origin/$_" }

        $leakedRemote = @($remoteCandidates | Where-Object { $_ -match $ProtectedPattern })
        if ($leakedRemote.Count -gt 0) {
            Stop-WithError "Internal sanity check FAILED: protected branch leaked into remote candidates: $($leakedRemote -join ', '). Aborting."
        }

        if (-not $Apply) {
            Write-Host ""
            Write-Host "[DRY-RUN] would execute:" -ForegroundColor DarkGray
            Write-Host "  git push origin --delete $($remoteCandidates -join ' ')" -ForegroundColor DarkGray
        } else {
            Write-Host ""
            Write-Host "Deleting $($remoteCandidates.Count) remote branches..." -ForegroundColor Cyan
            $deleteArgs = @('push', 'origin', '--delete') + $remoteCandidates
            & git @deleteArgs
        }
    }
}

# ============ Summary ============
Write-Section "Summary"

if (-not $Apply) {
    Write-Host "DRY-RUN complete. Re-run with -Apply to execute." -ForegroundColor Yellow
    Write-Host "  pwsh ./scripts/safe-bulk-cleanup.ps1 -Apply $(if ($IncludeRemote) { '-IncludeRemote' })"
} else {
    Write-Host "Cleanup applied. Verify with:" -ForegroundColor Cyan
    Write-Host "  git branch                          # expect only $IntegrationBranch + main"
    Write-Host "  git branch -r                       # expect only origin/$IntegrationBranch + origin/main + HEAD pointer"
    Write-Host "  git worktree list                   # expect .bare + $IntegrationBranch only"
}

Write-Host ""
