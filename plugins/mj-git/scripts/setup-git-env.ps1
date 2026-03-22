<#
.SYNOPSIS
    Decrypt secrets and set OS environment variables for mj-git plugin

.DESCRIPTION
    Decrypts config/secrets-git.enc using a team-shared password,
    writes secrets to .env in the plugin root, and sets each variable
    as a User-level OS environment variable.

    The decrypted secrets-git.conf is automatically deleted after use.

    Two modes:
      Default  — decrypt -> write .env -> set OS env vars
      -Reload  — read existing .env -> set OS env vars (no password needed)

.PARAMETER Force
    Overwrite .env and OS env vars without confirmation

.PARAMETER Reload
    Skip decryption; reload OS env vars from the existing .env file

.EXAMPLE
    .\scripts\setup-git-env.ps1
    .\scripts\setup-git-env.ps1 -Force
    .\scripts\setup-git-env.ps1 -Reload
#>

param(
    [switch]$Force,
    [switch]$Reload
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ── Locate plugin root ────────────────────────────────────────────────
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$PluginRoot = Split-Path -Parent $ScriptDir

# Verify we are inside the mj-git plugin
if (-not (Test-Path (Join-Path $PluginRoot ".claude-plugin"))) {
    Write-Host "[ERROR] .claude-plugin not found in $PluginRoot — script must live in scripts/." -ForegroundColor Red
    exit 1
}

# ── Paths ─────────────────────────────────────────────────────────────
$EncFile  = Join-Path $PluginRoot "config\secrets-git.enc"
$ConfFile = Join-Path $PluginRoot "config\secrets-git.conf"
$EnvFile  = Join-Path $PluginRoot ".env"

# ── OpenSSL lookup ────────────────────────────────────────────────────
function Find-OpenSSL {
    $cmd = Get-Command openssl -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    $gitOpenSSL = "C:\Program Files\Git\usr\bin\openssl.exe"
    if (Test-Path $gitOpenSSL) { return $gitOpenSSL }
    Write-Host "[ERROR] openssl not found. Install Git for Windows or add openssl to PATH." -ForegroundColor Red
    exit 1
}
$OpenSSL = Find-OpenSSL

# ── Helper: mask value for display ────────────────────────────────────
function Format-MaskedValue([string]$Value) {
    if ($Value.Length -le 4) { return "****" }
    return $Value.Substring(0, 4) + "****"
}

# ── Helper: parse KEY=VALUE file into hashtable ───────────────────────
function Read-EnvFile([string]$Path) {
    $vars = @{}
    foreach ($line in Get-Content $Path -Encoding UTF8) {
        $trimmed = $line.Trim()
        if ($trimmed -eq "" -or $trimmed.StartsWith("#")) { continue }
        $eqIdx = $trimmed.IndexOf("=")
        if ($eqIdx -gt 0) {
            $key = $trimmed.Substring(0, $eqIdx).Trim()
            $val = $trimmed.Substring($eqIdx + 1).Trim()
            if (($val.StartsWith("'") -and $val.EndsWith("'")) -or
                ($val.StartsWith('"') -and $val.EndsWith('"'))) {
                $val = $val.Substring(1, $val.Length - 2)
            }
            $vars[$key] = $val
        }
    }
    return $vars
}

# ── Header ────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "MJ-Git Plugin — Environment Setup" -ForegroundColor Cyan
Write-Host ("-" * 60)

# ══════════════════════════════════════════════════════════════════════
# Reload mode: read existing .env and set OS env vars
# ══════════════════════════════════════════════════════════════════════
if ($Reload) {
    if (-not (Test-Path $EnvFile)) {
        Write-Host "[ERROR] $EnvFile not found. Run without -Reload first." -ForegroundColor Red
        exit 1
    }

    Write-Host "[Reload] Loading OS env vars from existing .env" -ForegroundColor Yellow
    $Secrets = Read-EnvFile $EnvFile

    $setCount = 0
    foreach ($key in $Secrets.Keys | Sort-Object) {
        $newVal = $Secrets[$key]
        $oldVal = [Environment]::GetEnvironmentVariable($key, "User")

        if ($null -eq $oldVal) {
            Write-Host "  [NEW]     $key = $(Format-MaskedValue $newVal)" -ForegroundColor Green
        } elseif ($oldVal -eq $newVal) {
            Write-Host "  [SKIP]    $key = $(Format-MaskedValue $newVal)" -ForegroundColor DarkGray
        } else {
            Write-Host "  [CHANGED] $key = $(Format-MaskedValue $oldVal) -> $(Format-MaskedValue $newVal)" -ForegroundColor Yellow
        }
        [Environment]::SetEnvironmentVariable($key, $newVal, "User")
        $setCount++
    }

    Write-Host ""
    Write-Host ("=" * 60)
    Write-Host "[Done] $setCount OS env vars set from .env (Reload mode)." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor White
    Write-Host "  Restart terminal / IDE for env vars to take effect." -ForegroundColor White
    Write-Host ("=" * 60)
    return
}

# ══════════════════════════════════════════════════════════════════════
# Default mode: decrypt -> write .env -> set OS env vars
# ══════════════════════════════════════════════════════════════════════
if (-not (Test-Path $EncFile)) {
    Write-Host "[ERROR] $EncFile not found. Ask the team admin for the encrypted file." -ForegroundColor Red
    exit 1
}

# ── Password prompt ───────────────────────────────────────────────────
$SecurePassword = Read-Host "Enter team decryption password" -AsSecureString
$Password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecurePassword))

# ── Decrypt ───────────────────────────────────────────────────────────
try {
    $Password | & $OpenSSL enc -aes-256-cbc -pbkdf2 -d -in $EncFile -out $ConfFile -pass stdin 2>&1
    if ($LASTEXITCODE -ne 0) { throw "Decryption failed" }

    # ── Parse secrets ─────────────────────────────────────────────────
    $Secrets = Read-EnvFile $ConfFile

    if ($Secrets.Count -eq 0) {
        Write-Host "[ERROR] No secrets found in decrypted file." -ForegroundColor Red
        exit 1
    }

    Write-Host "[OK] Decrypted $($Secrets.Count) secrets." -ForegroundColor Green

    # ── Existing .env comparison ──────────────────────────────────────
    if ((Test-Path $EnvFile) -and -not $Force) {
        Write-Host ""
        Write-Host "Existing .env detected — comparing variables:" -ForegroundColor Yellow

        $ExistingVars = Read-EnvFile $EnvFile
        $Changes = @()
        foreach ($key in $Secrets.Keys | Sort-Object) {
            $newVal = $Secrets[$key]
            if ($ExistingVars.ContainsKey($key)) {
                $oldVal = $ExistingVars[$key]
                if ($oldVal -eq $newVal) {
                    Write-Host "  [SKIP]    $key = $(Format-MaskedValue $newVal)" -ForegroundColor DarkGray
                } else {
                    Write-Host "  [CHANGED] $key = $(Format-MaskedValue $oldVal) -> $(Format-MaskedValue $newVal)" -ForegroundColor Yellow
                    $Changes += $key
                }
            } else {
                Write-Host "  [NEW]     $key = $(Format-MaskedValue $newVal)" -ForegroundColor Green
                $Changes += $key
            }
        }

        if ($Changes.Count -eq 0) {
            Write-Host ""
            Write-Host "[SKIP] .env is already up-to-date. Reloading OS env vars..." -ForegroundColor DarkGray
        } else {
            Write-Host ""
            $confirm = Read-Host "Overwrite .env with $($Changes.Count) change(s)? [y/N]"
            if ($confirm -notin @("y", "Y", "yes", "Yes")) {
                Write-Host "[ABORT] No changes made." -ForegroundColor Yellow
                return
            }
        }
    }

    # ── Write .env ────────────────────────────────────────────────────
    $envLines = @()
    $envLines += "# MJ-Git Plugin — auto-generated by setup-git-env.ps1"
    $envLines += "# $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    $envLines += ""
    foreach ($key in $Secrets.Keys | Sort-Object) {
        $envLines += "$key=$($Secrets[$key])"
    }
    $envContent = ($envLines -join "`n") + "`n"

    [System.IO.File]::WriteAllText($EnvFile, $envContent, [System.Text.UTF8Encoding]::new($false))
    Write-Host "[OK] .env written with $($Secrets.Count) variables." -ForegroundColor Green

    # ── Set OS env vars ───────────────────────────────────────────────
    Write-Host ""
    Write-Host "Setting OS environment variables (User level):" -ForegroundColor White
    $setCount = 0
    foreach ($key in $Secrets.Keys | Sort-Object) {
        $newVal = $Secrets[$key]
        $oldVal = [Environment]::GetEnvironmentVariable($key, "User")

        if ($null -eq $oldVal) {
            Write-Host "  [NEW]     $key = $(Format-MaskedValue $newVal)" -ForegroundColor Green
        } elseif ($oldVal -eq $newVal) {
            Write-Host "  [SKIP]    $key = $(Format-MaskedValue $newVal)" -ForegroundColor DarkGray
        } else {
            Write-Host "  [CHANGED] $key = $(Format-MaskedValue $oldVal) -> $(Format-MaskedValue $newVal)" -ForegroundColor Yellow
        }
        [Environment]::SetEnvironmentVariable($key, $newVal, "User")
        $setCount++
    }

    # ── Summary ───────────────────────────────────────────────────────
    Write-Host ""
    Write-Host ("=" * 60)
    Write-Host "[Done] .env written + $setCount OS env vars set." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor White
    Write-Host "  1. Restart terminal / IDE for env vars to take effect." -ForegroundColor White
    Write-Host "  2. Use -Reload to refresh OS env vars from .env later." -ForegroundColor White
    Write-Host ("=" * 60)

} catch {
    Write-Host "[ERROR] Decryption failed — wrong password or corrupted file." -ForegroundColor Red
    exit 1
} finally {
    if (Test-Path $ConfFile) { Remove-Item $ConfFile -Force }
}
