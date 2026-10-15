param(
  [Parameter(Mandatory=$true)][string]$Target,
  [Parameter(Mandatory=$true)][string]$ReviewerRoot
)
$ErrorActionPreference = 'Stop'
$targetRoot = [IO.Path]::GetFullPath($Target)
$reviewRoot = [IO.Path]::GetFullPath($ReviewerRoot)
$expectedTarget = [IO.Path]::GetFullPath((Join-Path $reviewRoot '../develop/docs/runbook/evidence/html-guide-kit/pr3-reviewer/patch-043-stopped'))
if ($targetRoot -cne $expectedTarget) { throw 'Only the authorized new patch-043-stopped archive may be verified.' }
function Get-RawSha([byte[]]$Bytes) {
  $algorithm = [Security.Cryptography.SHA256]::Create()
  try { return [BitConverter]::ToString($algorithm.ComputeHash($Bytes)).Replace('-','').ToLowerInvariant() }
  finally { $algorithm.Dispose() }
}
function Get-OwnedPath([string]$Base,[string]$Relative) {
  if ([IO.Path]::IsPathRooted($Relative) -or $Relative.Contains('\') -or $Relative -match '(^|/)\.{1,2}(/|$)' -or $Relative -match '(^/|//$|/$)') { throw 'Invalid archive relative path.' }
  $full = [IO.Path]::GetFullPath((Join-Path $Base $Relative))
  if (-not $full.StartsWith($Base.TrimEnd('\','/')+[IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase)) { throw 'Archive path escapes its root.' }
  $walk = $Base
  foreach ($part in $Relative.Split('/')) {
    if (-not $part) { throw 'Empty archive path component.' }
    $walk = Join-Path $walk $part
    if (([IO.File]::GetAttributes($walk) -band [IO.FileAttributes]::ReparsePoint) -ne 0) { throw 'Reparse-linked archive evidence is forbidden.' }
  }
  return $full
}
function Read-JsonBytes([string]$File) { return ([Text.Encoding]::UTF8.GetString([IO.File]::ReadAllBytes($File)) | ConvertFrom-Json -Depth 100) }
$index = Read-JsonBytes (Get-OwnedPath $targetRoot 'index.json')
if ($index.kind -ne 'lossless-reviewer-evidence-index' -or $index.schemaVersion -ne 1) { throw 'Unsupported archive index.' }
if ($index.actualAccounting.distinctRealUuidCount -ne 13 -or $index.actualAccounting.rawInputFileCount -ne 27) { throw 'Actual source accounting mismatch.' }
$identityBytes = [IO.File]::ReadAllBytes((Get-OwnedPath $targetRoot 'identities.json'))
if ((Get-RawSha $identityBytes) -cne $index.identityEvidenceSha256) { throw 'Identity hash mismatch.' }
$identities = [Text.Encoding]::UTF8.GetString($identityBytes) | ConvertFrom-Json -Depth 100
if ($identities.runIdentities.Count -ne 3 -or @($identities.runIdentities | Where-Object { $_.source.canonicalSha -cne '696da5df4faedd239783764e59b6832b5884f5e1' }).Count) { throw 'Three exact source30 stopped/core identities required.' }
$mapped = [Collections.Generic.Dictionary[string,object]]::new([StringComparer]::Ordinal)
foreach ($row in $index.files) { if ($mapped.ContainsKey($row.relativeOriginalPath)) { throw 'Duplicate index entry.' }; $mapped.Add($row.relativeOriginalPath,$row) }
if ($mapped.Count -ne $index.fileCount) { throw 'Index count mismatch.' }
$seen = [Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
$totalBytes = [long]0
foreach ($packet in $index.packets) {
  $packetBytes = [IO.File]::ReadAllBytes((Get-OwnedPath $targetRoot $packet.file))
  if ($packetBytes.Length -ge 2097152 -or $packetBytes.Length -ne $packet.bytes -or (Get-RawSha $packetBytes) -cne $packet.sha256) { throw 'Packet size/hash mismatch or 2MiB limit exceeded.' }
  $document = [Text.Encoding]::UTF8.GetString($packetBytes) | ConvertFrom-Json -Depth 100
  if ($document.entries.Count -ne $packet.fileCount) { throw 'Packet entry count mismatch.' }
  $position = 0
  foreach ($entry in $document.entries) {
    if (-not $seen.Add($entry.relativeOriginalPath) -or -not $mapped.ContainsKey($entry.relativeOriginalPath)) { throw 'Duplicate or unmapped original file.' }
    $row = $mapped[$entry.relativeOriginalPath]
    if ($row.packet -cne $packet.file -or $row.entryIndex -ne $position -or $row.sha256 -cne $entry.sha256 -or $row.bytes -ne $entry.bytes -or $row.encoding -cne $entry.encoding -or $row.originalAbsolutePath -cne $entry.originalAbsolutePath) { throw 'Index packet mapping mismatch.' }
    if ($entry.encoding -eq 'utf8') { $restored = [Text.Encoding]::UTF8.GetBytes([string]$entry.content) }
    elseif ($entry.encoding -eq 'base64') { $restored = [Convert]::FromBase64String([string]$entry.content) }
    else { throw 'Unsupported original byte encoding.' }
    if ($restored.Length -ne $entry.bytes -or (Get-RawSha $restored) -cne $entry.sha256) { throw 'Restored original byte length/hash mismatch.' }
    $original = [IO.File]::ReadAllBytes((Get-OwnedPath $reviewRoot $entry.relativeOriginalPath))
    if ($original.Length -ne $restored.Length -or (Get-RawSha $original) -cne (Get-RawSha $restored)) { throw 'Original comparison mismatch.' }
    for ($i=0;$i -lt $original.Length;$i++) { if ($original[$i] -ne $restored[$i]) { throw 'Exact original byte mismatch.' } }
    $totalBytes += $restored.Length
    $position++
  }
}
if ($seen.Count -ne $index.fileCount -or $totalBytes -ne $index.originalBytes) { throw 'Complete byte restoration counts mismatch.' }
[string[]]$ordered = @($mapped.Keys)
[Array]::Sort($ordered,[StringComparer]::Ordinal)
$inventory = [Text.StringBuilder]::new()
foreach ($relative in $ordered) {
  $row = $mapped[$relative]
  [void]$inventory.Append($relative).Append([char]0).Append($row.sha256).Append([char]0).Append([string]$row.bytes).Append([char]10)
}
$inventorySha = Get-RawSha ([Text.Encoding]::UTF8.GetBytes($inventory.ToString()))
if ($inventorySha -cne $index.sourceInventorySha256) { throw 'Full source inventory hash mismatch.' }
foreach ($property in $index.pinnedOriginalByteSha256.psobject.Properties) { if (-not $mapped.ContainsKey($property.Name) -or $mapped[$property.Name].sha256 -cne $property.Value) { throw 'Original control pin mismatch.' } }
[pscustomobject]@{method='.NET exact raw byte restoration';target=$targetRoot;files=$seen.Count;originalBytes=$totalBytes;sourceInventorySha256=$inventorySha;allPacketHashesVerified=$true;allOriginalFilesComparedByteForByte=$true;identityHashVerified=$true;packetLimitBytes=2097151;noSourceOrRepositoryWrite=$true} | ConvertTo-Json -Depth 4
