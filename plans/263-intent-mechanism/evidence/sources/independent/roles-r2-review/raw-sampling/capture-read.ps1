param(
  [Parameter(Mandatory=$true)][string]$DocPath,
  [Parameter(Mandatory=$true)][string]$Sequence
)
$ErrorActionPreference = 'Stop'
$taskCandidate = 'C:\Users\Admin\.codex\worktrees\intent-contract\develop'
$taskCommit = 'def81915ed5fe70daf9129256b9fd816f0e4a79c'
$taskEvidence = 'C:\Users\Admin\AppData\Local\Temp\mj-intent-delivery\synthetic-agent-r2'
$taskGit = 'C:\Program Files\Git\cmd\git.exe'
$taskObject = [string]::Concat($taskCommit, ':', $DocPath)
$taskStartInfo = [System.Diagnostics.ProcessStartInfo]::new()
$taskStartInfo.FileName = $taskGit
$taskStartInfo.WorkingDirectory = $taskCandidate
$taskStartInfo.UseShellExecute = $false
$taskStartInfo.CreateNoWindow = $true
$taskStartInfo.RedirectStandardOutput = $true
$taskStartInfo.RedirectStandardError = $true
$taskStartInfo.ArgumentList.Add('show')
$taskStartInfo.ArgumentList.Add($taskObject)
$taskProcess = [System.Diagnostics.Process]::new()
$taskProcess.StartInfo = $taskStartInfo
$taskStdout = [System.IO.MemoryStream]::new()
$taskStderr = [System.IO.MemoryStream]::new()
$taskStarted = [DateTime]::UtcNow.ToString('o')
$null = $taskProcess.Start()
$taskOutCopy = $taskProcess.StandardOutput.BaseStream.CopyToAsync($taskStdout)
$taskErrCopy = $taskProcess.StandardError.BaseStream.CopyToAsync($taskStderr)
$taskProcess.WaitForExit()
[System.Threading.Tasks.Task]::WaitAll(@($taskOutCopy,$taskErrCopy))
$taskEnded = [DateTime]::UtcNow.ToString('o')
$taskOutBytes = $taskStdout.ToArray()
$taskErrBytes = $taskStderr.ToArray()
$taskOutPath = Join-Path $taskEvidence ('rawfiles/' + $Sequence + '.stdout.bin')
$taskErrPath = Join-Path $taskEvidence ('rawfiles/' + $Sequence + '.stderr.bin')
[System.IO.File]::WriteAllBytes($taskOutPath,$taskOutBytes)
[System.IO.File]::WriteAllBytes($taskErrPath,$taskErrBytes)
$taskRecord = [ordered]@{
  sequence = $Sequence
  commit = $taskCommit
  path = $DocPath
  cwd = $taskCandidate
  argv = @($taskGit,'show',$taskObject)
  tool_shell_invocation = $MyInvocation.Line.Trim()
  wrapper_script = $PSCommandPath
  started_at_utc = $taskStarted
  ended_at_utc = $taskEnded
  utc_source = 'System.DateTime.UtcNow, sampled immediately before process start and after stream completion'
  exit_code = $taskProcess.ExitCode
  stdout = [ordered]@{ path=$taskOutPath; byte_length=$taskOutBytes.Length; sha256=(Get-FileHash -LiteralPath $taskOutPath -Algorithm SHA256).Hash.ToLowerInvariant() }
  stderr = [ordered]@{ path=$taskErrPath; byte_length=$taskErrBytes.Length; sha256=(Get-FileHash -LiteralPath $taskErrPath -Algorithm SHA256).Hash.ToLowerInvariant() }
}
$taskRecordPath = Join-Path $taskEvidence ('read-records/' + $Sequence + '.json')
[System.IO.File]::WriteAllText($taskRecordPath,($taskRecord | ConvertTo-Json -Depth 8),[System.Text.UTF8Encoding]::new($false))
$taskDisplay = [ordered]@{ read_record=$taskRecord; stdout_utf8=[System.Text.Encoding]::UTF8.GetString($taskOutBytes); stderr_utf8=[System.Text.Encoding]::UTF8.GetString($taskErrBytes) }
$taskDisplay | ConvertTo-Json -Depth 10
if ($taskProcess.ExitCode -ne 0) { exit $taskProcess.ExitCode }
