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
$vbsProc = Get-CimInstance Win32_Process -Filter "Name = 'cscript.exe'" | Where-Object { $_.CommandLine -like "*silent_sync_daemon.vbs*" }
$cmdProc = Get-CimInstance Win32_Process -Filter "Name = 'cmd.exe'" | Where-Object { $_.CommandLine -like "*sync_daemon.ps1*" -and $_.CommandLine -like "*daemon_debug.log*" }

$stoppedAny = $false

if ($proc) {
    $proc | ForEach-Object {
        Stop-Process -Id $_.ProcessId -Force
        Write-Host "Stopped daemon PowerShell process ID: $($_.ProcessId)" -ForegroundColor Green
        $stoppedAny = $true
    }
}

if ($vbsProc) {
    $vbsProc | ForEach-Object {
        Stop-Process -Id $_.ProcessId -Force
        Write-Host "Stopped daemon VBS script process ID: $($_.ProcessId)" -ForegroundColor Green
        $stoppedAny = $true
    }
}

if ($cmdProc) {
    $cmdProc | ForEach-Object {
        Stop-Process -Id $_.ProcessId -Force
        Write-Host "Stopped daemon CMD wrapper process ID: $($_.ProcessId)" -ForegroundColor Green
        $stoppedAny = $true
    }
}

if (-not $stoppedAny) {
    Write-Host "No active sync daemon processes found." -ForegroundColor Yellow
}
Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
