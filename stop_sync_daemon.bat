@echo off
title Stop Hamid Raza Sync Daemon
powershell -ExecutionPolicy Bypass -File "%~dp0stop_sync_daemon.ps1"
pause
