Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
psScript = fso.BuildPath(scriptDir, "sync_daemon.ps1")
logFile = fso.BuildPath(scriptDir, "daemon_debug.log")

WScript.Echo "scriptDir: " & scriptDir
WScript.Echo "psScript: " & psScript
WScript.Echo "logFile: " & logFile

Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = scriptDir
exitCode = WshShell.Run("cmd.exe /c powershell.exe -ExecutionPolicy Bypass -File """ & psScript & """ > """ & logFile & """ 2>&1", 0, True)
WScript.Echo "Exit code: " & exitCode
