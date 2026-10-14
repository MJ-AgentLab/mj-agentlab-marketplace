param([Parameter(Mandatory=$true)][string]$PacketRoot)
$ErrorActionPreference='Stop'
$hgIndex=Get-Content -LiteralPath (Join-Path $PacketRoot 'index.json') -Raw | ConvertFrom-Json
$hgUtf8=[System.Text.UTF8Encoding]::new($false,$true)
$hgFiles=0
$hgBytes=0L
foreach($hgPacket in $hgIndex.packets){
    $hgFile=Join-Path $PacketRoot $hgPacket.file
    $hgPacketBytes=[System.IO.File]::ReadAllBytes($hgFile)
    $hgPacketHash=[Convert]::ToHexString([System.Security.Cryptography.SHA256]::HashData($hgPacketBytes)).ToLowerInvariant()
    if($hgPacketBytes.Length -ne $hgPacket.bytes -or $hgPacketHash -ne $hgPacket.sha256){throw 'Packet raw hash mismatch'}
    $hgDocument=$hgUtf8.GetString($hgPacketBytes) | ConvertFrom-Json
    foreach($hgEntry in $hgDocument.entries){
        [byte[]]$hgRestored=[byte[]]::new(0)
        if($hgEntry.encoding -eq 'base64'){$hgRestored=[Convert]::FromBase64String($hgEntry.content)}else{$hgRestored=$hgUtf8.GetBytes($hgEntry.content)}
        $hgHash=[Convert]::ToHexString([System.Security.Cryptography.SHA256]::HashData([byte[]]$hgRestored)).ToLowerInvariant()
        if($hgRestored.Length -ne $hgEntry.bytes -or $hgHash -ne $hgEntry.sha256){throw 'Original bytes restoration mismatch'}
        $hgFiles++
        $hgBytes+=$hgRestored.Length
    }
}
if($hgFiles -ne $hgIndex.fileCount -or $hgBytes -ne $hgIndex.originalBytes){throw 'Restored inventory total mismatch'}
[ordered]@{verifier='PowerShell/.NET independent restoration';verifiedAt=[DateTimeOffset]::UtcNow.ToString('o');files=$hgFiles;originalBytes=$hgBytes;allPacketAndRestoredHashes='PASS';sourceIndex=$hgIndex.sourceInventorySha256} | ConvertTo-Json
