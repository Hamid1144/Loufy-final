# start_server.ps1
# Simple native PowerShell Web Server for local preview.
# Runs on http://localhost:8000

$port = 8000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "==================================================" -ForegroundColor Green
Write-Host "  HAMID RAZA PORTFOLIO - LOCAL DEV SERVER STARTED" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host "Local Server running at: http://localhost:$port/" -ForegroundColor Cyan
Write-Host "Press Ctrl+C in this terminal window to stop the server." -ForegroundColor Yellow
Write-Host ""

$rootPath = Get-Location

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $urlPath = $request.Url.LocalPath
        if ($urlPath -eq "/") {
            $urlPath = "/index.html"
        }

        # Resolve local file path
        # Normalize slashes
        $relPath = $urlPath.TrimStart('/')
        $localPath = Join-Path $rootPath $relPath

        # Security check (ensure it is within root directory)
        try {
            $normalizedLocalPath = [System.IO.Path]::GetFullPath($localPath)
            $normalizedRoot = [System.IO.Path]::GetFullPath($rootPath)
            if (-not $normalizedLocalPath.StartsWith($normalizedRoot)) {
                $response.StatusCode = 403
                $response.Close()
                continue
            }
        } catch {
            $response.StatusCode = 400
            $response.Close()
            continue
        }

        if (Test-Path $localPath -PathType Leaf) {
            # Map Content Type
            $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
            $contentType = "application/octet-stream"
            switch ($ext) {
                ".html" { $contentType = "text/html; charset=utf-8" }
                ".css"  { $contentType = "text/css; charset=utf-8" }
                ".js"   { $contentType = "application/javascript; charset=utf-8" }
                ".png"  { $contentType = "image/png" }
                ".jpg"  { $contentType = "image/jpeg" }
                ".jpeg" { $contentType = "image/jpeg" }
                ".webp" { $contentType = "image/webp" }
                ".svg"  { $contentType = "image/svg+xml" }
                ".ico"  { $contentType = "image/x-icon" }
                ".json" { $contentType = "application/json; charset=utf-8" }
            }

            $bytes = [System.IO.File]::ReadAllBytes($localPath)
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] 200 OK: $urlPath" -ForegroundColor Gray
        } else {
            $response.StatusCode = 404
            $errMsg = "404 File Not Found"
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes($errMsg)
            $response.ContentType = "text/plain"
            $response.ContentLength64 = $errBytes.Length
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] 404 Not Found: $urlPath" -ForegroundColor Red
        }

        $response.Close()
    }
} catch {
    # If standard interruption occurs
} finally {
    $listener.Stop()
    Write-Host "Server stopped." -ForegroundColor Red
}
