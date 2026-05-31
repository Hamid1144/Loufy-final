@echo off
title Hamid Raza Sync Daemon Status
echo ==================================================
echo         HAMID RAZA PORTFOLIO SYNC DAEMON STATUS
echo ==================================================
echo.
powershell -ExecutionPolicy Bypass -Command "$proc = Get-CimInstance Win32_Process -Filter \"Name = 'powershell.exe'\" | Where-Object { $_.CommandLine -like '*sync_daemon.ps1*' -and $_.CommandLine -notlike '*-Command*' }; if ($proc) { Write-Host '[RUNNING] Sync daemon is active in the background!' -ForegroundColor Green; Write-Host ''; $proc | ForEach-Object { Write-Host '  Process ID   :' $_.ProcessId -ForegroundColor Gray; Write-Host '  Started At   :' $_.CreationDate -ForegroundColor Gray; Write-Host '  Command Line :' $_.CommandLine -ForegroundColor Gray; Write-Host '' } } else { Write-Host '[STOPPED] Sync daemon is NOT running.' -ForegroundColor Red; Write-Host '' }"
echo ==================================================
pause
