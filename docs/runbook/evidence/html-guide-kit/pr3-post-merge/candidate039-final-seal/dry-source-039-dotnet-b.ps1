param([Parameter(Mandatory=$true)][string]$ReviewerRoot)
$ErrorActionPreference='Stop'
$reviewRoot=[IO.Path]::GetFullPath($ReviewerRoot)
$prov=Join-Path $reviewRoot 'packer-provenance/0-1-26-stopped'
$control=([Text.Encoding]::UTF8.GetString([IO.File]::ReadAllBytes((Join-Path $reviewRoot 'archive-039-control.json')))|ConvertFrom-Json -Depth 100)
$dry=([Text.Encoding]::UTF8.GetString([IO.File]::ReadAllBytes((Join-Path $prov 'final-dry-run.stdout.log')))|ConvertFrom-Json -Depth 100)
$tokens=$null;$parseErrors=$null
$null=[Management.Automation.Language.Parser]::ParseFile((Join-Path $reviewRoot 'verify-lossless-039-dotnet.ps1'),[ref]$tokens,[ref]$parseErrors)
if($parseErrors.Count){throw 'Prepared independent.NET actual archive verifier syntax failure'}
if($dry.targetWritten -or $dry.largestPacketBytes -ge 2097152 -or $dry.oversizedPackets.Count -or $dry.secretPatternScan.findings.Count){throw 'Strict below2MiB dry gate'}
function Raw-Sha([byte[]]$bytes){$s=[Security.Cryptography.SHA256]::Create();try{return [BitConverter]::ToString($s.ComputeHash($bytes)).Replace('-','').ToLowerInvariant()}finally{$s.Dispose()}}
$pins=@{};foreach($p in $control.pinnedFinalEvidenceSha256.psobject.Properties){$pins[$p.Name]=$p.Value};$pins['archive-039-control.json']=Raw-Sha ([IO.File]::ReadAllBytes((Join-Path $reviewRoot 'archive-039-control.json')))
[string[]]$ordered=@($pins.Keys);[Array]::Sort($ordered,[StringComparer]::Ordinal)
$inventory=[Text.StringBuilder]::new();$total=[long]0;$utf8=0;$base64=0;$strict=[Text.UTF8Encoding]::new($false,$true)
foreach($relative in $ordered){
 if([IO.Path]::IsPathRooted($relative) -or $relative.Contains('\') -or $relative -match '(^|/)\.{1,2}(/|$)' -or $relative -match '(^|/)(?:home|auth|cache|sessions|config|plugins|node_modules|\.git)(/|$)' -or $relative -match '0-1-27|native-ui-private|whole-window|whole_window'){throw 'Forbidden source path'}
 $file=[IO.Path]::GetFullPath((Join-Path $reviewRoot $relative));if(-not $file.StartsWith($reviewRoot.TrimEnd('\','/')+[IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase)){throw 'Source escapes reviewer'}
 $walk=$reviewRoot;foreach($part in $relative.Split('/')){$walk=Join-Path $walk $part;if(([IO.File]::GetAttributes($walk)-band[IO.FileAttributes]::ReparsePoint)-ne0){throw 'No source reparse links'}}
 $raw=[IO.File]::ReadAllBytes($file);$hash=Raw-Sha $raw;if($hash-cne$pins[$relative]){throw 'Final source SHA drift'}
 try{$text=$strict.GetString($raw);$restored=$strict.GetBytes($text);$utf8++}catch{$restored=[Convert]::FromBase64String([Convert]::ToBase64String($raw));$base64++}
 if($restored.Length-ne$raw.Length -or (Raw-Sha $restored)-cne$hash){throw 'Independent.NET raw roundtrip'}
 for($i=0;$i-lt$raw.Length;$i++){if($raw[$i]-ne$restored[$i]){throw 'Independent.NET byte mismatch'}}
 [void]$inventory.Append($relative).Append([char]0).Append($hash).Append([char]0).Append([string]$raw.Length).Append([char]10);$total+=$raw.Length
}
$inventorySha=Raw-Sha ($strict.GetBytes($inventory.ToString()))
if($inventorySha-cne$dry.sourceInventorySha256 -or $ordered.Count-ne$dry.fileCount -or $total-ne$dry.totalOriginalBytes){throw 'Independent.NET inventory/raw bytes mismatch Node dry'}
[pscustomobject]@{mode='DRY_RUN_ONLY';method='Independent.NET source raw-byte/inventory roundtrip and prepared verifier AST';fileCount=$ordered.Count;totalOriginalBytes=$total;sourceInventorySha256=$inventorySha;rawByteRoundTrips=$ordered.Count;encodingCounts=@{utf8=$utf8;base64=$base64};packetLimitBytes=2097151;actualNodeDryLargestPacketBytes=$dry.largestPacketBytes;strictBelow2MiB=$true;preparedActualDotnetVerifierSyntaxErrors=0;actualArchiveTargetExists=(Test-Path -LiteralPath $dry.target);actualPacketArchiveRestoration='NOT_RUN_PENDING_ROOT_PACK';noSourceOrRepositoryWrite=$true}|ConvertTo-Json -Depth 6
