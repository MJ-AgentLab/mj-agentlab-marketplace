$ErrorActionPreference = 'Stop'
$TaskEvidence = 'C:/Users/Admin/.codex/task-evidence/html-learning-274-post290-20261020/actual-develop-local'
$TaskLaunch = Get-Content -LiteralPath (Join-Path $TaskEvidence 'launch.json') -Raw | ConvertFrom-Json
$TaskRoot = [System.IO.Path]::GetFullPath('D:/t290u-lup84lq6')
$TaskCache = [System.IO.Path]::GetFullPath((Join-Path $TaskRoot 'node-compile-cache'))
$TaskReceiptPath = Join-Path $TaskEvidence 'temp-cleanup-receipt.json'
$TaskBeforePath = Join-Path $TaskEvidence 'temp-cleanup-before.json'
if (Test-Path -LiteralPath $TaskReceiptPath) { throw 'Refusing to overwrite cleanup receipt.' }
if (Test-Path -LiteralPath $TaskBeforePath) { throw 'Refusing to overwrite cleanup inventory.' }
if ([System.IO.Path]::GetFullPath($TaskLaunch.temporaryRoot) -cne $TaskRoot) { throw 'Launch ownership root mismatch.' }
if ($TaskLaunch.temporaryRootOwnership -notlike 'Fresh process-owned mkdtemp*') { throw 'Missing batch ownership proof.' }
if ($TaskRoot -cne 'D:\t290u-lup84lq6') { throw 'Unexpected absolute task root.' }
if (-not $TaskCache.StartsWith($TaskRoot + '\', [System.StringComparison]::OrdinalIgnoreCase)) { throw 'Cache escaped intended root.' }
$TaskRootItem = Get-Item -LiteralPath $TaskRoot -Force
$TaskCacheItem = Get-Item -LiteralPath $TaskCache -Force
if (($TaskRootItem.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) { throw 'Task root is a reparse point.' }
if (($TaskCacheItem.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) { throw 'Cache is a reparse point.' }
$TaskTopEntries = @(Get-ChildItem -LiteralPath $TaskRoot -Force)
if ($TaskTopEntries.Count -ne 1 -or $TaskTopEntries[0].Name -cne 'node-compile-cache') { throw 'Unexpected other entries in owned root.' }
$TaskEntries = @($TaskCacheItem) + @(Get-ChildItem -LiteralPath $TaskCache -Recurse -Force)
$TaskInventory = @()
foreach ($TaskEntry in $TaskEntries) {
    $TaskAbsolute = [System.IO.Path]::GetFullPath($TaskEntry.FullName)
    if ($TaskAbsolute -cne $TaskCache -and -not $TaskAbsolute.StartsWith($TaskCache + '\', [System.StringComparison]::OrdinalIgnoreCase)) { throw 'Inventory path escaped cache.' }
    if (($TaskEntry.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) { throw 'Cache contains a reparse point.' }
    $TaskRow = [ordered]@{ path = $TaskAbsolute; isDirectory = [bool]$TaskEntry.PSIsContainer; lastWriteTimeUtc = $TaskEntry.LastWriteTimeUtc.ToString('o') }
    if (-not $TaskEntry.PSIsContainer) {
        $TaskRow.bytes = $TaskEntry.Length
        $TaskRow.sha256 = (Get-FileHash -LiteralPath $TaskAbsolute -Algorithm SHA256).Hash.ToLowerInvariant()
    }
    $TaskInventory += $TaskRow
}
$TaskBefore = [ordered]@{ capturedAtUtc = [DateTime]::UtcNow.ToString('o'); root = $TaskRoot; target = $TaskCache; rootInitiallyAbsent = $false; ownershipVerified = $true; allPathsInsideOwnedRoot = $true; noReparsePoints = $true; entries = $TaskInventory }
$TaskBefore | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $TaskBeforePath -Encoding utf8
$TaskReceipt = [ordered]@{ startedAtUtc = [DateTime]::UtcNow.ToString('o'); shell = 'PowerShell native cmdlets only'; root = $TaskRoot; target = $TaskCache; initialLaunchAbsenceFalsePreserved = $true; recursiveTargetVerifiedInsideOwnedRoot = $true; outcome = 'RUNNING'; countsAsCanonicalRoot = $false; countsAsTestAutomaticCleanup = $false }
try {
    Remove-Item -LiteralPath $TaskCache -Recurse -Force -ErrorAction Stop
    $TaskReceipt.cacheAbsentAfterRemoval = -not (Test-Path -LiteralPath $TaskCache)
    $TaskRemaining = @(Get-ChildItem -LiteralPath $TaskRoot -Force)
    if ($TaskRemaining.Count -ne 0) { throw 'Root not empty after removing the owned cache.' }
    Remove-Item -LiteralPath $TaskRoot -Force -ErrorAction Stop
    $TaskReceipt.rootAbsentAfterRemoval = -not (Test-Path -LiteralPath $TaskRoot)
    $TaskReceipt.rootAbsentSecondObservation = -not (Test-Path -LiteralPath $TaskRoot)
    if (-not $TaskReceipt.cacheAbsentAfterRemoval -or -not $TaskReceipt.rootAbsentAfterRemoval -or -not $TaskReceipt.rootAbsentSecondObservation) { throw 'Physical absence not confirmed.' }
    $TaskReceipt.outcome = 'PASS_CONTROLLED_AGENT_CLEANUP'
} catch {
    $TaskReceipt.outcome = 'FAIL_PRESERVED'
    $TaskReceipt.error = $_.Exception.Message
    throw
} finally {
    $TaskReceipt.completedAtUtc = [DateTime]::UtcNow.ToString('o')
    $TaskReceipt | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $TaskReceiptPath -Encoding utf8
}
[ordered]@{ outcome = $TaskReceipt.outcome; inventoryEntries = $TaskInventory.Count; cacheAbsent = $TaskReceipt.cacheAbsentAfterRemoval; rootAbsent = $TaskReceipt.rootAbsentAfterRemoval; rootAbsentSecondObservation = $TaskReceipt.rootAbsentSecondObservation; countsAsCanonicalRoot = $false; countsAsTestAutomaticCleanup = $false } | ConvertTo-Json
