[CmdletBinding()]
param()

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$pidFile = Join-Path $projectRoot ".local-server.pid"

if (-not (Test-Path $pidFile)) {
  Write-Host "No PID file found. Nothing to stop."
  exit 0
}

$pidText = (Get-Content $pidFile -ErrorAction SilentlyContinue | Select-Object -First 1)
if (-not $pidText -or -not ($pidText -match '^\d+$')) {
  Write-Host "PID file is invalid. Removing it."
  Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
  exit 0
}

$serverPid = [int]$pidText
$process = Get-Process -Id $serverPid -ErrorAction SilentlyContinue

if (-not $process) {
  Write-Host "Process $serverPid is not running. Removing stale PID file."
  Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
  exit 0
}

Stop-Process -Id $serverPid -Force
Remove-Item $pidFile -Force -ErrorAction SilentlyContinue

Write-Host "Stopped local server (PID $serverPid)."
