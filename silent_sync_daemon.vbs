Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
psScript = fso.BuildPath(scriptDir, "sync_daemon.ps1")

Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = scriptDir
WshShell.Run "cmd.exe /c powershell.exe -ExecutionPolicy Bypass -File """ & psScript & """ > daemon_debug.log 2>&1", 0, False
