<#
.SYNOPSIS
    MJ AgentLab Marketplace version bump script

.DESCRIPTION
    Batch-replace version numbers across project files (Version Quintangle).
    Supports two scopes:
      - marketplace: updates VERSION, marketplace.json (metadata.version), README.md
      - plugin:      updates plugin.json (version), marketplace.json (plugins[name].version),
                     README.md (badge area string-match), CLAUDE.md (`<name>` v<X.Y.Z> prose line — scoped regex)

    Closes Issue #110 (CLAUDE.md plugin line coverage) so plugin bumps no longer
    need a separate manual step to keep CLAUDE.md in sync (postmortem: README +
    CLAUDE.md drifted 4 releases v4.4.9 → v4.5.0 when bumps were done manually).

.PARAMETER From
    Current version (e.g. "1.0.0")

.PARAMETER To
    Target version (e.g. "1.1.0")

.PARAMETER Scope
    Target scope: "marketplace" (default) or plugin name. As of v4.0.0+ the
    marketplace contains a single plugin ("learn-kit"); the ValidateSet is
    extensible — when adding a new plugin, append its name here and to the
    install-hooks.ps1 commit-msg regex.

.PARAMETER DryRun
    Preview mode: show what would change without modifying files

.EXAMPLE
    .\scripts\bump-version.ps1 -From "4.3.0" -To "4.3.1" -DryRun
    .\scripts\bump-version.ps1 -From "4.3.0" -To "4.3.1"
    .\scripts\bump-version.ps1 -From "1.0.0" -To "1.1.0" -Scope "learn-kit" -DryRun
    .\scripts\bump-version.ps1 -From "1.0.0" -To "1.1.0" -Scope "learn-kit"
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$From,

    [Parameter(Mandatory = $true)]
    [string]$To,

    [Parameter(Mandatory = $false)]
    [ValidateSet("marketplace", "learn-kit", "diagram-kit")]
    [string]$Scope = "marketplace",

    [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

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

$TotalMatches = 0
$ModifiedFiles = 0

foreach ($RelPath in $TargetFiles) {
    $FilePath = Join-Path $ProjectRoot $RelPath

    if (-not (Test-Path $FilePath)) {
        Write-Host "  [SKIP] $RelPath - file not found" -ForegroundColor DarkGray
        continue
    }

    $Content = Get-Content -Path $FilePath -Raw -Encoding UTF8

    # Special handling for marketplace.json to avoid replacing wrong version fields
    if ($RelPath -eq ".claude-plugin/marketplace.json") {
        if ($MarketplaceJsonMode -eq "metadata") {
            # Only replace version in the metadata block
            $Pattern = '("metadata"\s*:\s*\{[^}]*"version"\s*:\s*")' + [regex]::Escape($From) + '"'
            $Replacement = '${1}' + $To + '"'
        } else {
            # Only replace version for the specific plugin entry.
            #
            # Bug fix (discovered while implementing #110): the previous `[^}]*`
            # negated-class stops at the FIRST `}` anywhere between "name" and
            # "version" — including `}` inside the description string (e.g.,
            # marketplace v4.5.0's description mentions
            # `[GUIDE]_LearnKit_{Pedagogy,Design}.md` which contains `}`),
            # so the plugin entry regex silently failed to match and the
            # script SKIPped marketplace.json for every plugin bump where the
            # description contained literal braces.
            #
            # Fix: use `[\s\S]*?` (non-greedy match-any-incl-newlines) which
            # walks past description content but lazily stops at the FIRST
            # `"version"` after this plugin's name — correct for multi-plugin
            # arrays since lazy matching anchors to the immediately-following
            # `"version"`, not any later plugin's `"version"`. The pattern
            # tolerates `}` inside string values (the previous one didn't).
            $PluginName = $MarketplaceJsonMode -replace "^plugin:", ""
            $Pattern = '("name"\s*:\s*"' + [regex]::Escape($PluginName) + '"[\s\S]*?"version"\s*:\s*")' + [regex]::Escape($From) + '"'
            $Replacement = '${1}' + $To + '"'
        }

        $MatchCount = ([regex]::Matches($Content, $Pattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)).Count

        if ($MatchCount -eq 0) {
            Write-Host "  [SKIP] $RelPath - no match for '$From' in scope '$Scope'" -ForegroundColor DarkGray
            continue
        }

        Write-Host ""
        Write-Host "  [MATCH] $RelPath ($MatchCount occurrences, scoped: $Scope)" -ForegroundColor Green

        $Lines = @(Get-Content -Path $FilePath -Encoding UTF8)
        $EscapedFrom = [regex]::Escape($From)
        for ($i = 0; $i -lt $Lines.Count; $i++) {
            if ($Lines[$i] -match $EscapedFrom) {
                $LineNum = $i + 1
                $Before = $Lines[$i].Trim()
                $After = $Before -replace $EscapedFrom, $To
                Write-Host "    L${LineNum}: $Before" -ForegroundColor Red
                Write-Host "      -> $After" -ForegroundColor Green
            }
        }

        $TotalMatches += $MatchCount

        if (-not $DryRun) {
            $NewContent = [regex]::Replace($Content, $Pattern, $Replacement, [System.Text.RegularExpressions.RegexOptions]::Singleline)
            [System.IO.File]::WriteAllText($FilePath, $NewContent)
            $ModifiedFiles++
        }
    } elseif ($PluginManifestPaths -contains $RelPath) {
        # Anchor on the ROOT version key, which in both manifests immediately follows "name".
        # Assert exactly one match: 0 means the manifest drifted from the expected shape and
        # 2+ means the anchor is no longer unique — either way, fail loudly rather than write
        # a half-correct file.
        $Pattern = '("name"\s*:\s*"' + [regex]::Escape($Scope) + '"\s*,\s*"version"\s*:\s*")' + [regex]::Escape($From) + '"'
        $Replacement = '${1}' + $To + '"'
        $MatchCount = ([regex]::Matches($Content, $Pattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)).Count

        if ($MatchCount -ne 1) {
            Write-Host "  [FAIL] $RelPath - expected exactly 1 root version anchor for '$Scope' at '$From', found $MatchCount" -ForegroundColor Red
            Write-Host "         Refusing to bump: the manifest shape drifted, or the version is not $From." -ForegroundColor Red
            exit 1
        }

        Write-Host ""
        Write-Host "  [MATCH] $RelPath (root version anchor, scoped: $Scope)" -ForegroundColor Green

        $Lines = @(Get-Content -Path $FilePath -Encoding UTF8)
        $EscapedFrom = [regex]::Escape($From)
        for ($i = 0; $i -lt $Lines.Count; $i++) {
            if ($Lines[$i] -match ('"version"\s*:\s*"' + $EscapedFrom + '"')) {
                $LineNum = $i + 1
                $Before = $Lines[$i].Trim()
                $After = $Before -replace $EscapedFrom, $To
                Write-Host "    L${LineNum}: $Before" -ForegroundColor Red
                Write-Host "      -> $After" -ForegroundColor Green
            }
        }

        $TotalMatches += $MatchCount

        if (-not $DryRun) {
            $NewContent = [regex]::Replace($Content, $Pattern, $Replacement, [System.Text.RegularExpressions.RegexOptions]::Singleline)
            [System.IO.File]::WriteAllText($FilePath, $NewContent)
            $ModifiedFiles++
        }
    } elseif ($RelPath -eq "README.md") {
        # README gets an anchored update, never a whole-file string replace. The «历史版本记录»
        # section lists past releases by number, and those lines must never move: bumping
        # learn-kit 3.2.1 -> 4.0.0 with a naive replace rewrote the marketplace's own
        # "- v3.2.1 — plugin.json schema 修复" history entry into a fabricated "v4.0.0" one,
        # directly above the real v4.0.0 line. Same class of bug as the CLAUDE.md branch below.
        if ($Scope -eq "marketplace") {
            # Only the version badge on line 3.
            $Pattern = '(badge/version-)' + [regex]::Escape($From) + '(-blue)'
            $Replacement = '${1}' + $To + '${2}'
            $What = "version badge"
        } else {
            # Only this plugin's table row Version cell: anchor from the row's bold plugin link
            # to the bold version cell, without crossing a line boundary.
            $Pattern = '(\| \[\*\*' + [regex]::Escape($Scope) + '\*\*\][^\r\n]*?\| \*\*)' + [regex]::Escape($From) + '(\*\* \|)'
            $Replacement = '${1}' + $To + '${2}'
            $What = "plugin table row Version cell for $Scope"
        }

        $MatchCount = ([regex]::Matches($Content, $Pattern)).Count

        if ($MatchCount -ne 1) {
            Write-Host "  [FAIL] $RelPath - expected exactly 1 $What at '$From', found $MatchCount" -ForegroundColor Red
            Write-Host "         Refusing to bump: README shape drifted, or the version is not $From." -ForegroundColor Red
            exit 1
        }

        Write-Host ""
        Write-Host "  [MATCH] $RelPath (1 occurrence, scoped: $What)" -ForegroundColor Green

        $Lines = @(Get-Content -Path $FilePath -Encoding UTF8)
        for ($i = 0; $i -lt $Lines.Count; $i++) {
            if ($Lines[$i] -match $Pattern) {
                $LineNum = $i + 1
                Write-Host "    L${LineNum}: (matched $What)" -ForegroundColor Green
                Write-Host "      -> $From becomes $To in that cell only" -ForegroundColor Green
            }
        }

        $TotalMatches += $MatchCount

        if (-not $DryRun) {
            $NewContent = [regex]::Replace($Content, $Pattern, $Replacement)
            [System.IO.File]::WriteAllText($FilePath, $NewContent)
            $ModifiedFiles++
        }
    } elseif ($RelPath -eq "CLAUDE.md") {
        # CLAUDE.md `plugins/` section plugin line — uniquely identified by
        # backtick-wrapped plugin name + ' v' + version. Scoped regex (not naive
        # string replace) to avoid clobbering version mentions in «历史版本记录»
        # or doc-tree narrative that incidentally match the bare $From string.
        # Pattern example: `learn-kit` v1.0.0  →  `learn-kit` v1.1.0
        $PluginName = $Scope
        $Pattern = '(`' + [regex]::Escape($PluginName) + '` v)' + [regex]::Escape($From)
        $Replacement = '${1}' + $To

        $MatchCount = ([regex]::Matches($Content, $Pattern)).Count

        if ($MatchCount -eq 0) {
            Write-Host "  [SKIP] $RelPath - no match for plugin line '`${PluginName}` v$From'" -ForegroundColor DarkGray
            continue
        }

        Write-Host ""
        Write-Host "  [MATCH] $RelPath ($MatchCount occurrences, scoped: plugin line for $PluginName)" -ForegroundColor Green

        $Lines = @(Get-Content -Path $FilePath -Encoding UTF8)
        $LinePattern = '`' + [regex]::Escape($PluginName) + '` v' + [regex]::Escape($From)
        for ($i = 0; $i -lt $Lines.Count; $i++) {
            if ($Lines[$i] -match $LinePattern) {
                $LineNum = $i + 1
                $Before = $Lines[$i].Trim()
                $After = $Before -replace $LinePattern, ('`' + $PluginName + '` v' + $To)
                Write-Host "    L${LineNum}: $Before" -ForegroundColor Red
                Write-Host "      -> $After" -ForegroundColor Green
            }
        }

        $TotalMatches += $MatchCount

        if (-not $DryRun) {
            $NewContent = [regex]::Replace($Content, $Pattern, $Replacement)
            [System.IO.File]::WriteAllText($FilePath, $NewContent)
            $ModifiedFiles++
        }
    } else {
        # Simple string replacement for VERSION, plugin.json, README.md
        $EscapedFrom = [regex]::Escape($From)
        $MatchCount = ([regex]::Matches($Content, $EscapedFrom)).Count

        if ($MatchCount -eq 0) {
            Write-Host "  [SKIP] $RelPath - no match for '$From'" -ForegroundColor DarkGray
            continue
        }

        Write-Host ""
        Write-Host "  [MATCH] $RelPath ($MatchCount occurrences)" -ForegroundColor Green

        $Lines = @(Get-Content -Path $FilePath -Encoding UTF8)
        for ($i = 0; $i -lt $Lines.Count; $i++) {
            if ($Lines[$i] -match $EscapedFrom) {
                $LineNum = $i + 1
                $Before = $Lines[$i].Trim()
                $After = $Before -replace $EscapedFrom, $To
                Write-Host "    L${LineNum}: $Before" -ForegroundColor Red
                Write-Host "      -> $After" -ForegroundColor Green
            }
        }

        $TotalMatches += $MatchCount

        if (-not $DryRun) {
            $NewContent = $Content -replace $EscapedFrom, $To
            [System.IO.File]::WriteAllText($FilePath, $NewContent)
            $ModifiedFiles++
        }
    }
}

Write-Host ""
Write-Host ("-" * 60)
if ($DryRun) {
    Write-Host "[DryRun] Found $TotalMatches matches in scope '$Scope'" -ForegroundColor Yellow
    Write-Host "[DryRun] Remove -DryRun to apply changes" -ForegroundColor Yellow
} else {
    Write-Host "[Done] Modified $ModifiedFiles files, replaced $TotalMatches occurrences" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor White
    Write-Host '  1. git diff  (review changes)' -ForegroundColor White
    Write-Host '  2. Update CHANGELOG.md (move [Unreleased] to [X.Y.Z])' -ForegroundColor White
    Write-Host '  3. git add ... then git commit' -ForegroundColor White
}
Write-Host ""
