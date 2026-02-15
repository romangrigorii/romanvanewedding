[CmdletBinding()]
param(
  [int]$Port = 5500,
  [string]$HostName = "localhost"
)

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$pidFile = Join-Path $projectRoot ".local-server.pid"

if (Test-Path $pidFile) {
  $existingPidText = (Get-Content $pidFile -ErrorAction SilentlyContinue | Select-Object -First 1)
  if ($existingPidText -and ($existingPidText -match '^\d+$')) {
    $existingPid = [int]$existingPidText
    $existingProcess = Get-Process -Id $existingPid -ErrorAction SilentlyContinue
    if ($existingProcess) {
      Write-Host "Local server already running (PID $existingPid)."
      Write-Host "Stop it with: .\stop-local.ps1"
      exit 0
    }
  }
  Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
}

$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCmd) {
  $pythonCmd = Get-Command py -ErrorAction SilentlyContinue
}

if (-not $pythonCmd) {
  Write-Error "Could not find 'python' or 'py' in PATH."
  exit 1
}

$arguments = @("-m", "http.server", "$Port", "--bind", $HostName)
$process = Start-Process -FilePath $pythonCmd.Source -ArgumentList $arguments -WorkingDirectory $projectRoot -PassThru

Set-Content -Path $pidFile -Value $process.Id

Write-Host "Local server started."
Write-Host "PID: $($process.Id)"
Write-Host "URL: http://$HostName`:$Port/"
Write-Host "Stop with: .\stop-local.ps1"
