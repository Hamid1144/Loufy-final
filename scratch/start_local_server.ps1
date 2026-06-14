# Native PowerShell Simple Web Server for Hamid Raza Portfolio

$port = 8080
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
try {
    $listener.Start()
    Write-Host "Local server successfully started at http://localhost:$port/" -ForegroundColor Green
    Write-Host "Press Ctrl+C in terminal (or kill the task) to stop the server." -ForegroundColor Yellow
    
    # Open the browser automatically
    Start-Process "http://localhost:$port/"
    
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        # Determine the request path
        $rawPath = $request.Url.LocalPath
        if ($rawPath -eq "/") {
            $localPath = Join-Path $PSScriptRoot "..\index.html"
        } else {
            $localPath = Join-Path $PSScriptRoot "..$rawPath"
        }
        
        if (Test-Path $localPath -PathType Leaf) {
            # Set content-type
            $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
            $contentType = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css" { "text/css; charset=utf-8" }
                ".js" { "application/javascript; charset=utf-8" }
                ".png" { "image/png" }
                ".jpg" { "image/jpeg" }
                ".jpeg" { "image/jpeg" }
                ".webp" { "image/webp" }
                ".svg" { "image/svg+xml" }
                ".json" { "application/json; charset=utf-8" }
                default { "application/octet-stream" }
            }
            
            $response.ContentType = $contentType
            $response.StatusCode = 200
            
            # Read and send file bytes
            $bytes = [System.IO.File]::ReadAllBytes($localPath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            # 404 Not Found
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $rawPath")
            $response.ContentType = "text/plain"
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $response.OutputStream.Close()
    }
} catch {
    Write-Error "Server error: $_"
} finally {
    $listener.Stop()
}
