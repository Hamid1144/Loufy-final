@echo off
title Hamid Raza Sync Daemon Status
powershell -ExecutionPolicy Bypass -File "%~dp0status_sync_daemon.ps1"
pause
