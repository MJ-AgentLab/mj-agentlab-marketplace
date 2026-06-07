<#
.SYNOPSIS
    Bulk validator for marketplace commit subjects (PowerShell parity for validate-commits.sh).

.DESCRIPTION
    Validates commit message subjects in a given git range against the canonical
    PATTERN regex. PATTERN is kept in sync with scripts/install-hooks.ps1 +
    .github/workflows/ci.yml + docs/rule/[STANDARD]_Commit_Message_Convention.md
    §3 / §4. Single-source consolidation is tracked as a future P2 refactor;
    for now, 4 sites must match.

.PARAMETER Range
    Git range to validate. Default: origin/develop..HEAD

.EXAMPLE
    pwsh .\scripts\validate-commits.ps1
    pwsh .\scripts\validate-commits.ps1 origin/main..HEAD
    pwsh .\scripts\validate-commits.ps1 HEAD~5..HEAD

.OUTPUTS
    Exit code 0 = all pass; 1 = >= 1 failure.
#>

param(
    [string]$Range = "origin/develop..HEAD"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Force UTF-8 console output so '§' and Chinese suggestion text render correctly
# on Windows PowerShell hosts where default encoding may be cp936 / cp1252.
try {
    [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
    $OutputEncoding = [System.Text.UTF8Encoding]::new($false)
} catch {
    # Older PS hosts may not allow this; non-fatal — fall through with default encoding
}

# Canonical PATTERN — verbatim from install-hooks.ps1 line 52 + ci.yml line 32
$Pattern = '^(feat|fix|perf|refactor|test|docs|infra)\((learn-kit|diagram-kit|marketplace|ci|scripts|deps|infra|docs-rule|docs-adr|docs-guide|docs-runbook|docs-spec|release)\): .{1,72}$'
$AllowedTypes = 'feat | fix | perf | refactor | test | docs | infra'
$AllowedScopes = 'learn-kit | diagram-kit | marketplace | ci | scripts | deps | infra | docs-rule | docs-adr | docs-guide | docs-runbook | docs-spec | release'
$AllowedTypesRegex = '^(feat|fix|perf|refactor|test|docs|infra)$'
$AllowedScopesRegex = '^(learn-kit|diagram-kit|marketplace|ci|scripts|deps|infra|docs-rule|docs-adr|docs-guide|docs-runbook|docs-spec|release)$'

# Fetch commits in range (skip merges per CI convention)
# Wrap in @(...) to force array (PowerShell deflates single-line output to scalar string)
$Lines = @(& git log --no-merges --format='%H%x09%s' $Range 2>$null)
if (-not $Lines -or $Lines.Count -eq 0) {
    Write-Host "validate-commits: no commits in range '$Range' (or range invalid)"
    exit 0
}

$Total = 0
$Failed = 0
$FailEntries = @()

foreach ($Line in $Lines) {
    if ([string]::IsNullOrWhiteSpace($Line)) { continue }
    $Parts = $Line -split "`t", 2
    if ($Parts.Count -lt 2) { continue }
    $Sha = $Parts[0]
    $Subject = $Parts[1]
    $Total++

    if ($Subject -match $Pattern) {
        continue
    }

    $Failed++
    $Short = $Sha.Substring(0, 7)
    $Reasons = New-Object System.Collections.Generic.List[string]

    # Reason 1: type not in allowed enum
    if ($Subject -match '^([a-z]+)\(') {
        $Type = $Matches[1]
        if ($Type -notmatch $AllowedTypesRegex) {
            $Reasons.Add("        Reason: type '$Type' not in allowed enum")
            $Reasons.Add("                Allowed: $AllowedTypes")
            if ($Type -eq 'chore') {
                $Reasons.Add("                Suggest: 'chore' is NOT in marketplace's 7-type enum; use 'docs', 'refactor', or 'infra'")
            }
        }
    }

    # Reason 2: scope not in whitelist
    if ($Subject -match '^[a-z]+\(([^)]+)\):') {
        $Scope = $Matches[1]
        if ($Scope -notmatch $AllowedScopesRegex) {
            $Reasons.Add("        Reason: scope '$Scope' not in allowed whitelist")
            $Reasons.Add("                Allowed: $AllowedScopes")
            if ($Scope -eq 'docs') {
                $Reasons.Add("                Suggest: 'docs' is a TYPE not a SCOPE; pick 'docs-rule' / 'docs-adr' / 'docs-guide' / 'docs-runbook' / 'docs-spec' based on which subdir you're editing")
            }
        }
    }

    # Reason 3: summary length (after ": ")
    if ($Subject -match '^[a-z]+\([^)]+\): (.*)$') {
        $Summary = $Matches[1]
        $Len = $Summary.Length
        if ($Len -gt 72) {
            $Over = $Len - 72
            $Reasons.Add("        Reason: summary length $Len chars > 72 limit")
            $Reasons.Add("                (PATTERN .{1,72} counts every char; Chinese / § / → each = 1 char)")
            $Reasons.Add("                Suggest: shorten by $Over chars; aim <= 60 when mixing Chinese for safety margin")
        }
    }

    # Fallback if no specific reason detected
    if ($Reasons.Count -eq 0) {
        $Reasons.Add("        Reason: subject does not match overall '<type>(<scope>): <summary>' format")
        $Reasons.Add("                Check: leading lowercase type, parens around scope, ': ' separator (colon + space), non-empty summary")
    }

    $Entry = "  FAIL  $Short  $Subject`n" + ($Reasons -join "`n")
    $FailEntries += $Entry
}

# Final report
if ($Failed -eq 0) {
    Write-Host "[OK] $Total commit(s) validated in range '$Range'; 0 failures"
    exit 0
}

Write-Host "[FAIL] $Failed of $Total commit(s) failed PATTERN validation in range '$Range'"
foreach ($Entry in $FailEntries) {
    Write-Host ""
    Write-Host $Entry
}
Write-Host ""
Write-Host "See docs/rule/[STANDARD]_Commit_Message_Convention.md §3 / §4 / §11 for canonical whitelists + common-mistakes guidance."
Write-Host "Fix locally before push: 'git rebase -i <base> --reword <commit>' OR cherry-pick onto fresh branch."
exit 1
