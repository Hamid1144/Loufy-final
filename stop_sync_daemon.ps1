# stop_sync_daemon.ps1
# Terminate Hamid Raza Portfolio Sync Daemon processes.

if ($PSScriptRoot) {
    Set-Location $PSScriptRoot
}

Write-Host "==================================================" -ForegroundColor Green
Write-Host "         STOPPING HAMID RAZA SYNC DAEMON" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""

$proc = Get-CimInstance Win32_Process -Filter "Name = 'powershell.exe'" | Where-Object { $_.CommandLine -like "*sync_daemon.ps1*" -and $_.CommandLine -notlike "*stop_sync_daemon*" -and $_.CommandLine -notlike "*install_sync_daemon*" -and $_.CommandLine -notlike "*-Command*" }

if ($proc) {
    $proc | ForEach-Object {
        Stop-Process -Id $_.ProcessId -Force
        Write-Host "Stopped daemon process ID: $($_.ProcessId)" -ForegroundColor Green
    }
} else {
    Write-Host "No active sync daemon process found." -ForegroundColor Yellow
}
Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
