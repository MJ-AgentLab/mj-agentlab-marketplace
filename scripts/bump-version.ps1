param(
    # Both must be a bare X.Y.Z. -To is interpolated into .NET regex REPLACEMENT strings, where
    # `$0` / `$1` / `$&` are substitution tokens rather than literals — a -To of '$0-x' wrote
    # invalid JSON across five files and still exited 0. Validating the shape removes that class
    # entirely, and also rejects ordinary typos ('v4.0.0', '4.0', a trailing space) before any
    # file is opened.
    [Parameter(Mandatory = $true)]
    [ValidatePattern('\A(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\z')]
    [string]$From,

    [Parameter(Mandatory = $true)]
    [ValidatePattern('\A(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\z')]
    [string]$To,

    [Parameter(Mandatory = $false)]
    [ValidateSet("marketplace", "diagram-kit", "explain-kit")]
    [string]$Scope = "marketplace",

    [switch]$DryRun,

    # TEST-ONLY fault injector: after the Nth (1-based) file write in the commit phase, throw, so a
    # test can prove the transactional rollback restores every target byte-for-byte. Honoured ONLY
    # when MP_BUMP_TESTING=1; in a real bump its presence is a hard error. 0 (the default) never fires.
    [int]$TestFailAfterReplace = 0,

    # TEST-ONLY: after all writes, corrupt the Nth target's on-disk bytes so the post-write re-read
    # (step 3) must catch it and roll back. Same MP_BUMP_TESTING=1 gate; 0 (default) never fires.
    [int]$TestCorruptAfterWrite = 0,

    # TEST-ONLY: simulate a success-path backup-cleanup failure (leave the .bump-backup files) so a
    # test can prove a cleanup failure NEVER rolls back an already-committed bump. Same gate.
    [switch]$TestFailCleanup
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# The test-only injectors must be unreachable in a real bump: presence without the test env var is a
# hard stop, and the defaults (0 / off) never fire.
if (($TestFailAfterReplace -ne 0 -or $TestCorruptAfterWrite -ne 0 -or $TestFailCleanup) -and $env:MP_BUMP_TESTING -ne "1") {
    Write-Host "ERROR: -TestFailAfterReplace / -TestCorruptAfterWrite / -TestFailCleanup are test-only injectors and require MP_BUMP_TESTING=1." -ForegroundColor Red
    exit 1
}
if ($TestFailAfterReplace -lt 0 -or $TestCorruptAfterWrite -lt 0) {
    Write-Host "ERROR: -TestFailAfterReplace / -TestCorruptAfterWrite must be >= 0." -ForegroundColor Red
    exit 1
}

# Only VERSION and the portable root manifest are authoritative; README is derived.
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$TargetFiles = if ($Scope -eq 'marketplace') { @('VERSION', 'README.md') } else { @("plugins/$Scope/plugin.json") }
$Plan = @()
$Failures = @()
foreach ($RelPath in $TargetFiles) {
    $FilePath = Join-Path $ProjectRoot $RelPath
    if (-not (Test-Path -LiteralPath $FilePath -PathType Leaf)) {
        $Failures += "  [FAIL] $RelPath - required file missing"
        continue
    }
    $Content = [System.IO.File]::ReadAllText($FilePath)
    $EscapedFrom = [regex]::Escape($From)
    if ($RelPath -eq 'VERSION') {
        $Pattern = "^$EscapedFrom\s*$"
        $Replacement = "$To" + [Environment]::NewLine
        $What = 'authoritative marketplace version'
    } elseif ($RelPath -eq 'README.md') {
        $Pattern = "badge/version-$EscapedFrom-blue"
        $Replacement = "badge/version-$To-blue"
        $What = 'derived version badge'
    } else {
        try { $Manifest = $Content | ConvertFrom-Json -ErrorAction Stop } catch { $Failures += "[FAIL] invalid manifest JSON"; continue }
        if ($Manifest.name -ne $Scope -or $Manifest.version -ne $From) { $Failures += "[FAIL] manifest identity/version does not match Scope/From"; continue }
        $Pattern = '(?m)^  "version": "' + $EscapedFrom + '",'
        $Replacement = '  "version": "' + $To + '",'
        $What = 'authoritative plugin version'
    }
    $MatchCount = ([regex]::Matches($Content, $Pattern)).Count
    if ($MatchCount -ne 1) { $Failures += "[FAIL] $RelPath - expected exactly 1 anchor, found $MatchCount"; continue }
    $NewContent = [regex]::Replace($Content, $Pattern, $Replacement)
    if ($Scope -ne 'marketplace' -and ($NewContent | ConvertFrom-Json).version -ne $To) { $Failures += "[FAIL] replacement did not update root manifest version"; continue }
    if ($NewContent -eq $Content) { $Failures += "[FAIL] replacement changed nothing"; continue }
    $Plan += [PSCustomObject]@{ RelPath=$RelPath; FilePath=$FilePath; Content=$Content; NewContent=$NewContent; What=$What }
}
if ($Failures.Count -gt 0) {
    $Failures | ForEach-Object { Write-Host $_ }
    Write-Host 'Refusing to bump. NOTHING was written.'
    exit 1
}

# ---------------------------------------------------------------------------
# PHASE 2 — REPORT
# ---------------------------------------------------------------------------

# Report by DIFFING old against new content. Re-deriving a display regex from the anchor was
# how an invalid pattern crept in; the authoritative answer to "what changes" is simply which
# lines differ.
foreach ($Item in $Plan) {
    Write-Host ""
    Write-Host "  [MATCH] $($Item.RelPath) (scoped: $($Item.What))" -ForegroundColor Green
    $Old = $Item.Content -split "`r?`n"
    $New = $Item.NewContent -split "`r?`n"
    for ($i = 0; $i -lt [Math]::Min($Old.Count, $New.Count); $i++) {
        if ($Old[$i] -ne $New[$i]) {
            $LineNum = $i + 1
            $Show = { param($s) if ($s.Length -gt 140) { $s.Substring(0, 140) + " …" } else { $s } }
            Write-Host "    L${LineNum}: $(& $Show $Old[$i].Trim())" -ForegroundColor Red
            Write-Host "      -> $(& $Show $New[$i].Trim())" -ForegroundColor Green
        }
    }
}

$TotalMatches = $Plan.Count

# ---------------------------------------------------------------------------
# PHASE 3 — COMMIT (two-phase, transactional)
#
# Preflight proved every target has exactly one anchor and a non-noop replacement. Now write them
# as a unit: back up every target in place first, then write all new content. If ANY write, the
# injected test fault, or the post-write re-read fails, restore EVERY original from its backup and
# exit 1 — the tree is left byte-identical to how it started. This closes the physical half-bump the
# previous shape admitted (a mid-write I/O failure) it could not.
#
# Two subtleties the rollback path gets right: (a) success-path backup cleanup runs AFTER the
# try/catch, never inside it — a benign "couldn't delete a backup" (a transient AV/indexer lock)
# must never be mistaken for a commit failure and trigger a rollback of an already-succeeded bump;
# (b) each restore is independent, so one un-restorable (locked) target cannot abort the rollback of
# the rest — those it cannot restore are reported and their backups kept for manual recovery.
# ---------------------------------------------------------------------------

if (-not $DryRun) {
    $Backups = @()
    try {
        # 1. Same-directory backup of every target, before touching any of them.
        foreach ($Item in $Plan) {
            $BackupPath = "$($Item.FilePath).bump-backup"
            [System.IO.File]::Copy($Item.FilePath, $BackupPath, $true)
            $Backups += [PSCustomObject]@{ FilePath = $Item.FilePath; BackupPath = $BackupPath }
        }
        # 2. Write every target; optionally inject a fault after the Nth write (test-only).
        for ($i = 0; $i -lt $Plan.Count; $i++) {
            [System.IO.File]::WriteAllText($Plan[$i].FilePath, $Plan[$i].NewContent)
            if ($TestFailAfterReplace -gt 0 -and ($i + 1) -eq $TestFailAfterReplace) {
                throw "MP_BUMP_TESTING: injected fault after write #$TestFailAfterReplace"
            }
        }
        # 2b. Test-only: corrupt one just-written target's on-disk bytes so step 3 must catch it.
        if ($TestCorruptAfterWrite -gt 0 -and $TestCorruptAfterWrite -le $Plan.Count) {
            $t = $Plan[$TestCorruptAfterWrite - 1]
            [System.IO.File]::WriteAllText($t.FilePath, $t.NewContent + "MP_BUMP_CORRUPT")
        }
        # 3. Post-write validation: every target on disk must equal what we intended to write.
        foreach ($Item in $Plan) {
            if ([System.IO.File]::ReadAllText($Item.FilePath) -ne $Item.NewContent) {
                throw "post-write validation failed for $($Item.RelPath)"
            }
        }
    }
    catch {
        # Roll back every target independently: a single locked/unrestorable target must not abort
        # the rollback of the others. Keep the backups of any we could not restore.
        $Unrestored = @()
        foreach ($b in $Backups) {
            if (-not (Test-Path -LiteralPath $b.BackupPath)) { continue }
            try {
                [System.IO.File]::Copy($b.BackupPath, $b.FilePath, $true)
            } catch {
                $Unrestored += $b.FilePath
                continue  # keep this backup for manual recovery
            }
            Remove-Item -LiteralPath $b.BackupPath -Force -ErrorAction SilentlyContinue
        }
        Write-Host ""
        Write-Host "Commit failed: $($_.Exception.Message)" -ForegroundColor Red
        if ($Unrestored.Count -eq 0) {
            Write-Host "All $($Plan.Count) target(s) were restored to their original bytes. NOTHING changed." -ForegroundColor Red
        } else {
            Write-Host ("Rolled back, but could NOT restore $($Unrestored.Count) target(s): " +
                "$($Unrestored -join ', '). Their .bump-backup files were kept for manual recovery.") -ForegroundColor Red
        }
        exit 1
    }

    # Success — the bump is committed. Backup cleanup gets its OWN try/catch, OUTSIDE the commit try,
    # so a cleanup failure warns and leaves a harmless .bump-backup in git status but can NEVER divert
    # into the rollback catch above and revert a committed bump. -TestFailCleanup forces that failure
    # path for a test; a real transient lock behaves the same.
    try {
        if ($TestFailCleanup) { throw "MP_BUMP_TESTING: simulated backup-cleanup failure" }
        foreach ($b in $Backups) { Remove-Item -LiteralPath $b.BackupPath -Force -ErrorAction SilentlyContinue }
    }
    catch {
        Write-Host "Note: the bump committed; a backup-cleanup step failed ($($_.Exception.Message)). Leftover .bump-backup file(s) are harmless — remove them by hand." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host ("-" * 60)
if ($DryRun) {
    Write-Host "[DryRun] Found $TotalMatches anchored target(s) in scope '$Scope'" -ForegroundColor Yellow
    Write-Host "[DryRun] No files were modified. Re-run without -DryRun to apply." -ForegroundColor Yellow
} else {
    Write-Host "[Done] Modified $TotalMatches file(s) at $TotalMatches anchor(s)" -ForegroundColor Cyan
    Write-Host "Next: verify with 'npm run validate' and update CHANGELOG entries." -ForegroundColor Cyan
}
Write-Host ""
