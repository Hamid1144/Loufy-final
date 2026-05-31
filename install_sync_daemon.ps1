# install_sync_daemon.ps1
# Installer script for Hamid Raza Portfolio Sync Daemon.
# Terminates existing instances, sets up a Windows Startup shortcut, and starts the service silently.

$ErrorActionPreference = "Stop"

Write-Host "=============================================" -ForegroundColor Green
Write-Host " INSTALLING HAMID RAZA SYNC DAEMON " -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

# 1. Stop any existing daemon processes
Write-Host "Checking for existing sync daemon processes..." -ForegroundColor Yellow
$proc = Get-CimInstance Win32_Process -Filter "Name = 'powershell.exe'" | Where-Object { $_.CommandLine -like "*sync_daemon.ps1*" -and $_.CommandLine -notlike "*install_sync_daemon*" -and $_.CommandLine -notlike "*status_sync_daemon*" -and $_.CommandLine -notlike "*stop_sync_daemon*" -and $_.CommandLine -notlike "*-Command*" }
if ($proc) {
    Write-Host "Found existing sync daemon process(es). Stopping them..." -ForegroundColor Cyan
    $proc | ForEach-Object {
        Stop-Process -Id $_.ProcessId -Force
        Write-Host "Stopped process ID: $($_.ProcessId)" -ForegroundColor Green
    }
} else {
    Write-Host "No existing sync daemon process running." -ForegroundColor Gray
}

# 2. Paths configuration
$scriptDir = $PSScriptRoot
if (-not $scriptDir) {
    $scriptDir = Get-Location
}
$vbsPath = Join-Path $scriptDir "silent_sync_daemon.vbs"
$startupFolder = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup"
$shortcutPath = Join-Path $startupFolder "HamidRazaSyncDaemon.lnk"

# Ensure the VBS wrapper exists
if (-not (Test-Path $vbsPath)) {
    Write-Error "silent_sync_daemon.vbs not found at $vbsPath! Please ensure it is in the same directory."
    exit 1
}

# 3. Create Windows Startup shortcut
Write-Host "Creating startup shortcut..." -ForegroundColor Yellow
try {
    $WshShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($shortcutPath)
    $cscriptPath = Join-Path $env:SystemRoot "System32\cscript.exe"
    $Shortcut.TargetPath = $cscriptPath
    $Shortcut.Arguments = "//B //Nologo ""$vbsPath"""
    $Shortcut.WorkingDirectory = "$scriptDir"
    $Shortcut.Description = "Hamid Raza Portfolio GitHub Sync Daemon"
    $Shortcut.Save()
    Write-Host "Startup shortcut created successfully at:" -ForegroundColor Green
    Write-Host "  $shortcutPath" -ForegroundColor Gray
} catch {
    Write-Error "Failed to create startup shortcut: $_"
    exit 1
}

# 4. Start the silent daemon immediately
Write-Host "Launching sync daemon in background..." -ForegroundColor Yellow
try {
    $cscriptPath = Join-Path $env:SystemRoot "System32\cscript.exe"
    Start-Process $cscriptPath -ArgumentList "//B //Nologo ""$vbsPath""" -WindowStyle Hidden
    Start-Sleep -Seconds 2
    
    # Check if the process is now running
    $newProc = Get-CimInstance Win32_Process -Filter "Name = 'powershell.exe'" | Where-Object { $_.CommandLine -like "*sync_daemon.ps1*" -and $_.CommandLine -notlike "*install_sync_daemon*" -and $_.CommandLine -notlike "*status_sync_daemon*" -and $_.CommandLine -notlike "*stop_sync_daemon*" -and $_.CommandLine -notlike "*-Command*" }
    if ($newProc) {
        Write-Host "Sync daemon has been successfully started and is running silently!" -ForegroundColor Green
        Write-Host "Process ID(s): $(($newProc | Select-Object -ExpandProperty ProcessId) -join ', ')" -ForegroundColor Gray
    } else {
        Write-Warning "Sync daemon launched, but could not verify running process. Please run status_sync_daemon.bat to check."
    }
} catch {
    Write-Error "Failed to launch sync daemon: $_"
    exit 1
}

Write-Host ""
Write-Host "Installation completed successfully!" -ForegroundColor Green
Write-Host "Use status_sync_daemon.bat to check status and stop_sync_daemon.bat to stop it." -ForegroundColor Cyan
