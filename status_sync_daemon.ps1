# status_sync_daemon.ps1
# Status checker for Hamid Raza Portfolio Sync Daemon.

if ($PSScriptRoot) {
    Set-Location $PSScriptRoot
}

Write-Host "==================================================" -ForegroundColor Green
Write-Host "        HAMID RAZA PORTFOLIO SYNC DAEMON STATUS" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""

$proc = Get-CimInstance Win32_Process -Filter "Name = 'powershell.exe'" | Where-Object { $_.CommandLine -like "*sync_daemon.ps1*" -and $_.CommandLine -notlike "*status_sync_daemon*" -and $_.CommandLine -notlike "*install_sync_daemon*" -and $_.CommandLine -notlike "*-Command*" }
$vbsProc = Get-CimInstance Win32_Process -Filter "Name = 'cscript.exe'" | Where-Object { $_.CommandLine -like "*silent_sync_daemon.vbs*" }
$cmdProc = Get-CimInstance Win32_Process -Filter "Name = 'cmd.exe'" | Where-Object { $_.CommandLine -like "*sync_daemon.ps1*" -and $_.CommandLine -like "*daemon_debug.log*" }

if ($proc -or $vbsProc -or $cmdProc) {
    Write-Host "[RUNNING] Sync daemon is active!" -ForegroundColor Green
    Write-Host ""
    if ($proc) {
        $proc | ForEach-Object {
            Write-Host "  PowerShell Process ID : $($_.ProcessId)" -ForegroundColor Gray
            Write-Host "  Started At            : $($_.CreationDate)" -ForegroundColor Gray
            Write-Host "  Command Line          : $($_.CommandLine)" -ForegroundColor Gray
            Write-Host ""
        }
    }
    if ($vbsProc) {
        $vbsProc | ForEach-Object {
            Write-Host "  VBS Process ID        : $($_.ProcessId)" -ForegroundColor Gray
            Write-Host "  Started At            : $($_.CreationDate)" -ForegroundColor Gray
            Write-Host "  Command Line          : $($_.CommandLine)" -ForegroundColor Gray
            Write-Host ""
        }
    }
    if ($cmdProc) {
        $cmdProc | ForEach-Object {
            Write-Host "  CMD Process ID        : $($_.ProcessId)" -ForegroundColor Gray
            Write-Host "  Started At            : $($_.CreationDate)" -ForegroundColor Gray
            Write-Host "  Command Line          : $($_.CommandLine)" -ForegroundColor Gray
            Write-Host ""
        }
    }
} else {
    Write-Host "[STOPPED] Sync daemon is NOT running." -ForegroundColor Red
    Write-Host ""
}
Write-Host "==================================================" -ForegroundColor Green
