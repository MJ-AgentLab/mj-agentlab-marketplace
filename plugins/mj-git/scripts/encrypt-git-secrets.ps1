<#
.SYNOPSIS
    Encrypt secrets-git.conf into secrets-git.enc for mj-git plugin

.DESCRIPTION
    Encrypts config/secrets-git.conf into config/secrets-git.enc using
    AES-256-CBC with PBKDF2. The encrypted file is safe to commit
    to the repository.

    After encrypting, delete secrets-git.conf and share the password
    with the team through a secure channel.

.EXAMPLE
    .\scripts\encrypt-git-secrets.ps1
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ── Locate plugin root ────────────────────────────────────────────────
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$PluginRoot = Split-Path -Parent $ScriptDir

# ── Paths ─────────────────────────────────────────────────────────────
$ConfFile = Join-Path $PluginRoot "config\secrets-git.conf"
$EncFile  = Join-Path $PluginRoot "config\secrets-git.enc"

# ── Pre-flight checks ────────────────────────────────────────────────
if (-not (Test-Path $ConfFile)) {
    Write-Host "[ERROR] $ConfFile not found." -ForegroundColor Red
    Write-Host ""
    Write-Host "To create it:" -ForegroundColor White
    Write-Host "  1. Copy config\secrets-git.example -> config\secrets-git.conf" -ForegroundColor White
    Write-Host "  2. Fill in all values" -ForegroundColor White
    Write-Host "  3. Run this script again" -ForegroundColor White
    exit 1
}

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

# ── Password prompt (double input) ───────────────────────────────────
Write-Host ""
Write-Host "MJ-Git Plugin — Encrypt Secrets" -ForegroundColor Cyan
Write-Host ("-" * 60)

$SecurePassword1 = Read-Host "Enter encryption password" -AsSecureString
$SecurePassword2 = Read-Host "Confirm encryption password" -AsSecureString

$Password1 = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecurePassword1))
$Password2 = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecurePassword2))

if ($Password1 -ne $Password2) {
    Write-Host "[ERROR] Passwords do not match." -ForegroundColor Red
    exit 1
}
$Password = $Password1

# ── Encrypt ───────────────────────────────────────────────────────────
$Password | & $OpenSSL enc -aes-256-cbc -pbkdf2 -md sha256 -salt -in $ConfFile -out $EncFile -pass stdin 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Encryption failed." -ForegroundColor Red
    exit 1
}

# ── Summary ───────────────────────────────────────────────────────────
Write-Host ""
Write-Host ("=" * 60)
Write-Host "[Done] Encrypted successfully: config\secrets-git.enc" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  1. git add config\secrets-git.enc" -ForegroundColor White
Write-Host "  2. Delete config\secrets-git.conf (NEVER commit plaintext)" -ForegroundColor White
Write-Host "  3. Share the password with the team via a secure channel" -ForegroundColor White
Write-Host ("=" * 60)
