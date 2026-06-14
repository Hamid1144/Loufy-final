# start_local_server.ps1
# Simple static web server using pure PowerShell .NET HttpListener.

$port = 8000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

$projectRoot = Split-Path $PSScriptRoot -Parent
if (-not $projectRoot) { $projectRoot = Get-Location }

try {
    $listener.Start()
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host "     LOCAL WEB SERVER STARTED SUCCESSFULLY" -ForegroundColor Green
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host "Url: http://localhost:$port/" -ForegroundColor Cyan
    Write-Host "Serving files from: $projectRoot" -ForegroundColor Gray
    Write-Host "Press Ctrl+C to stop the server." -ForegroundColor Yellow
    Write-Host "==================================================" -ForegroundColor Green
} catch {
    Write-Error "Failed to start HttpListener: $_"
    exit 1
}

# Keep track of active listener to close on exit/sigint
$sysCleanup = {
    if ($listener.IsListening) {
        $listener.Stop()
        $listener.Close()
        Write-Host "Server stopped." -ForegroundColor Red
    }
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        # Log request
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $($request.HttpMethod) $($request.Url.LocalPath)" -ForegroundColor Gray
        
        # Path resolution
        $rawPath = $request.Url.LocalPath
        if ($rawPath -eq "/") {
            $rawPath = "/index.html"
        }
        
        $filePath = Join-Path $projectRoot $rawPath.TrimStart('/')
        
        if (Test-Path $filePath -PathType Leaf) {
            try {
                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                
                # Content type mapping
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $contentType = switch ($ext) {
                    ".html" { "text/html; charset=utf-8" }
                    ".css"  { "text/css" }
                    ".js"   { "application/javascript" }
                    ".png"  { "image/png" }
                    ".jpg"  { "image/jpeg" }
                    ".jpeg" { "image/jpeg" }
                    ".webp" { "image/webp" }
                    ".svg"  { "image/svg+xml" }
                    ".ico"  { "image/x-icon" }
                    default { "application/octet-stream" }
                }
                
                $response.ContentType = $contentType
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } catch {
                $response.StatusCode = 500
                $msg = [System.Text.Encoding]::UTF8.GetBytes("500 Internal Server Error: $_")
                $response.OutputStream.Write($msg, 0, $msg.Length)
            }
        } else {
            $response.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.OutputStream.Write($msg, 0, $msg.Length)
        }
        
        $response.Close()
    }
} finally {
    & $sysCleanup
}
