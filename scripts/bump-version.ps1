<#
.SYNOPSIS
    MJ AgentLab Marketplace version bump script

.DESCRIPTION
    Update version numbers at every version-bearing site, using ANCHORED field updates.
    Never a whole-file string replace: descriptions and README's «历史版本记录» legitimately
    contain other version numbers, and rewriting those fabricates release history.

    Sites by scope (6-site invariant since the Codex dual-host wrapper):
      - marketplace: VERSION
                     .claude-plugin/marketplace.json  (metadata.version)
                     README.md                        (version badge, line 3)
      - plugin:      plugins/<name>/.claude-plugin/plugin.json   (root version)
                     plugins/<name>/.codex-plugin/plugin.json    (root version — MUST match the
                                                                  legacy one; validate-dual-host.mjs
                                                                  asserts they are identical)
                     .claude-plugin/marketplace.json  (plugins[name].version)
                     README.md                        (that plugin's table row Version cell)
                     CLAUDE.md                        (`<name>` v<X.Y.Z> prose line)

    .agents/plugins/marketplace.json (the Codex native catalog) is deliberately NOT a site:
    it carries no version, so a bump must never add one there.

    Every site asserts EXACTLY ONE anchor match and exits 1 otherwise. A wrong -From, a drifted
    file shape, or a missing required file fails loudly rather than silently SKIPping — the
    failure mode behind the v4.4.9 → v4.5.0 postmortem (README + CLAUDE.md drifted across 4
    releases) and Issue #110.

.PARAMETER From
    Current version, bare X.Y.Z (e.g. "1.0.0")

.PARAMETER To
    Target version, bare X.Y.Z (e.g. "1.1.0")

.PARAMETER Scope
    Target scope: "marketplace" (default) or a plugin name. The marketplace has shipped 2
    plugins since v6.3.0 (learn-kit + diagram-kit). When adding a plugin, append its name to
    the ValidateSet here and to the install-hooks.ps1 commit-msg regex.

.PARAMETER DryRun
    Preview mode: show what would change without modifying files

.EXAMPLE
    .\scripts\bump-version.ps1 -From "4.3.0" -To "4.3.1" -DryRun
    .\scripts\bump-version.ps1 -From "4.3.0" -To "4.3.1"
    .\scripts\bump-version.ps1 -From "1.0.0" -To "1.1.0" -Scope "learn-kit" -DryRun
    .\scripts\bump-version.ps1 -From "1.0.0" -To "1.1.0" -Scope "learn-kit"
#>

param(
    # Both must be a bare X.Y.Z. -To is interpolated into .NET regex REPLACEMENT strings, where
    # `$0` / `$1` / `$&` are substitution tokens rather than literals — a -To of '$0-x' wrote
    # invalid JSON across five files and still exited 0. Validating the shape removes that class
    # entirely, and also rejects ordinary typos ('v4.0.0', '4.0', a trailing space) before any
    # file is opened.
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^\d+\.\d+\.\d+$')]
    [string]$From,

    [Parameter(Mandatory = $true)]
    [ValidatePattern('^\d+\.\d+\.\d+$')]
    [string]$To,

    [Parameter(Mandatory = $false)]
    [ValidateSet("marketplace", "learn-kit", "diagram-kit")]
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

# Locate project root (script lives in scripts/)
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

# Build target file list based on scope
# Note: CLAUDE.md is plugin-scope only — its `plugins/` section names plugin versions
# (e.g. `learn-kit` v1.2.0), which only change on plugin bumps. Marketplace-scope bumps
# don't touch the plugin version, so CLAUDE.md isn't a target there.
if ($Scope -eq "marketplace") {
    $TargetFiles = @(
        "VERSION",
        ".claude-plugin/marketplace.json",
        "README.md"
    )
    $MarketplaceJsonMode = "metadata"
} else {
    # Dual-host: BOTH plugin manifests carry the root `version` and validate-dual-host.mjs
    # asserts they are character-identical. Bumping only the legacy one produces
    # MANIFEST_FIELD_DRIFT and fails CI, so the native manifest is a mandatory target.
    $TargetFiles = @(
        "plugins/$Scope/.claude-plugin/plugin.json",
        "plugins/$Scope/.codex-plugin/plugin.json",
        ".claude-plugin/marketplace.json",
        "README.md",
        "CLAUDE.md"
    )
    $MarketplaceJsonMode = "plugin:$Scope"
}

# Plugin manifests get an anchored field update, never a whole-file string replace: their
# descriptions legitimately contain other version numbers (the legacy one narrates v3.0.0 /
# v3.1.0 / v3.2.0 history; the native one names the NLM bridge 4.0.0 and connector 0.8.7).
# A naive replace of `-From 4.0.0` would rewrite the bridge version inside prose.
$PluginManifestPaths = @(
    "plugins/$Scope/.claude-plugin/plugin.json",
    "plugins/$Scope/.codex-plugin/plugin.json"
)

Write-Host ""
if ($DryRun) {
    Write-Host "[DryRun] Preview mode - no files will be modified" -ForegroundColor Yellow
} else {
    Write-Host "[Execute] Will modify files" -ForegroundColor Cyan
}
Write-Host "Scope: $Scope" -ForegroundColor White
Write-Host "Version: $From -> $To" -ForegroundColor White
Write-Host "Project root: $ProjectRoot" -ForegroundColor White
Write-Host ("-" * 60)

# ---------------------------------------------------------------------------
# PHASE 1 — PREFLIGHT (read-only)
#
# Derive and validate the anchor for EVERY target before writing ANY of them. The previous
# shape validated and wrote each target in turn, so a failure on a later target (CLAUDE.md is
# last) left the earlier ones already bumped — a half-bumped repo, which is strictly worse than
# the silent SKIP it replaced. Nothing below opens a file for writing until every target has
# been proven to have exactly one anchor match.
# ---------------------------------------------------------------------------

$EscFrom = [regex]::Escape($From)
$Plan = @()
$Failures = @()

foreach ($RelPath in $TargetFiles) {
    $FilePath = Join-Path $ProjectRoot $RelPath

    # Every entry in $TargetFiles is required. A missing one previously SKIPped and exited 0 —
    # which is how the "mandatory" native manifest could silently not be bumped.
    if (-not (Test-Path $FilePath)) {
        $Failures += "  [FAIL] $RelPath - required file not found (every target in scope '$Scope' must exist)"
        continue
    }

    $Content = Get-Content -Path $FilePath -Raw -Encoding UTF8
    $Pattern = $null
    $Replacement = $null
    $What = $null

    if ($RelPath -eq ".claude-plugin/marketplace.json") {
        if ($MarketplaceJsonMode -eq "metadata") {
            # Tempered gap (not `[^}]*`): the description legitimately contains `}`, which the
            # negated class stopped at; and it must not cross into the plugins array, so the gap
            # refuses to pass a `"name":` key (metadata has none before its own version).
            $Pattern = '("metadata"\s*:\s*\{(?:(?!"name"\s*:)[\s\S])*?"version"\s*:\s*")' + $EscFrom + '"'
            $Replacement = '${1}' + $To + '"'
            $What = "metadata.version"
        } else {
            # Only this plugin's entry.
            #
            # History: the original `[^}]*` negated-class stopped at the FIRST `}` between
            # "name" and "version" — including a `}` inside a description string — so the entry
            # regex silently failed and marketplace.json was SKIPped for every plugin bump whose
            # description contained literal braces (Issue #110 era).
            #
            # Then `[\s\S]*?` fixed that but introduced a worse one: a lazy quantifier
            # BACKTRACKS. If the scoped plugin's catalog version is not $From, the gap expands
            # past its own entry and matches a LATER plugin's version. Reproduced: with
            # learn-kit drifted to 3.2.0 and diagram-kit sitting at 3.2.1,
            # `-Scope learn-kit -From 3.2.1` matched 3697 chars spanning into diagram-kit and
            # rewrote DIAGRAM-KIT's version — with MatchCount 1, so a count check missed it.
            #
            # Now: temper the gap so it can never cross a following `"name":` key (the entry
            # boundary). A drifted entry matches 0 times and fails preflight.
            $PluginName = $MarketplaceJsonMode -replace "^plugin:", ""
            $Pattern = '("name"\s*:\s*"' + [regex]::Escape($PluginName) + '"(?:(?!"name"\s*:)[\s\S])*?"version"\s*:\s*")' + $EscFrom + '"'
            $Replacement = '${1}' + $To + '"'
            $What = "plugins[$PluginName].version"
        }
    } elseif ($PluginManifestPaths -contains $RelPath) {
        # The ROOT version key, which in both manifests immediately follows "name".
        $Pattern = '("name"\s*:\s*"' + [regex]::Escape($Scope) + '"\s*,\s*"version"\s*:\s*")' + $EscFrom + '"'
        $Replacement = '${1}' + $To + '"'
        $What = "root version"
    } elseif ($RelPath -eq "README.md") {
        # README's «历史版本记录» lists every past release; those lines must never move. A naive
        # replace rewrote the marketplace's own "- v3.2.1 — plugin.json schema 修复" history
        # entry into a fabricated "v4.0.0" one, directly above the real v4.0.0 line.
        if ($Scope -eq "marketplace") {
            $Pattern = '(badge/version-)' + $EscFrom + '(-blue)'
            $Replacement = '${1}' + $To + '${2}'
            $What = "version badge"
        } else {
            $Pattern = '(\| \[\*\*' + [regex]::Escape($Scope) + '\*\*\][^\r\n]*?\| \*\*)' + $EscFrom + '(\*\* \|)'
            $Replacement = '${1}' + $To + '${2}'
            $What = "plugin table row Version cell for $Scope"
        }
    } elseif ($RelPath -eq "CLAUDE.md") {
        # The `plugins/` section line, identified by backtick-wrapped name + ' v' + version.
        # Scoped so «历史版本记录» and doc-tree narrative that incidentally contain $From stay put.
        $Pattern = '(`' + [regex]::Escape($Scope) + '` v)' + $EscFrom
        $Replacement = '${1}' + $To
        $What = "``$Scope`` plugin line"
    } elseif ($RelPath -eq "VERSION") {
        # The file holds nothing but the version.
        $Pattern = '\b' + $EscFrom + '\b'
        $Replacement = $To
        $What = "the version"
    } else {
        $Failures += "  [FAIL] $RelPath - no anchor rule defined for this target"
        continue
    }

    $MatchCount = ([regex]::Matches($Content, $Pattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)).Count
    if ($MatchCount -ne 1) {
        $Failures += "  [FAIL] $RelPath - expected exactly 1 anchor ($What) at '$From', found $MatchCount"
        continue
    }

    # Produce the new content NOW, during preflight, so a replacement that silently no-ops is
    # caught before anything is written rather than after.
    $NewContent = [regex]::Replace($Content, $Pattern, $Replacement, [System.Text.RegularExpressions.RegexOptions]::Singleline)
    if ($NewContent -eq $Content) {
        $Failures += "  [FAIL] $RelPath - anchor ($What) matched but the replacement changed nothing"
        continue
    }

    $Plan += [PSCustomObject]@{
        RelPath    = $RelPath
        FilePath   = $FilePath
        Content    = $Content
        NewContent = $NewContent
        What       = $What
    }
}

if ($Failures.Count -gt 0) {
    Write-Host ""
    foreach ($f in $Failures) { Write-Host $f -ForegroundColor Red }
    Write-Host ""
    Write-Host "Refusing to bump: $($Failures.Count) target(s) failed preflight. NOTHING was written." -ForegroundColor Red
    Write-Host "Either the version is not $From, or a file's shape drifted from what the anchors expect." -ForegroundColor Red
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
    Write-Host "Next: verify with 'npm run validate:dual-host' and update CHANGELOG entries." -ForegroundColor Cyan
}
Write-Host ""
