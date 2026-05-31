@echo off
title Stop Hamid Raza Sync Daemon
echo ==================================================
echo         STOPPING HAMID RAZA SYNC DAEMON
echo ==================================================
echo.
powershell -ExecutionPolicy Bypass -Command "$proc = Get-CimInstance Win32_Process -Filter \"Name = 'powershell.exe'\" | Where-Object { $_.CommandLine -like '*sync_daemon.ps1*' -and $_.CommandLine -notlike '*-Command*' }; if ($proc) { $proc | ForEach-Object { Stop-Process -Id $_.ProcessId -Force; Write-Host 'Successfully stopped sync daemon process:' $_.ProcessId -ForegroundColor Green } } else { Write-Host 'No running sync daemon was found.' -ForegroundColor Yellow }"
echo.
echo ==================================================
pause
