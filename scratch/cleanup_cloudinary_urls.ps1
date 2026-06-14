# cleanup_cloudinary_urls.ps1
$ProgressPreference = 'SilentlyContinue'

$files = @("index.html", "portfolio.html")

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Optimizing Cloudinary URLs in $file..." -ForegroundColor Cyan
        $html = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
        
        # Regex replacement: find image/upload/ followed by vXXXX or portfolio, and insert f_auto,q_auto/
        $pattern = 'https://res.cloudinary.com/dtr3yvjac/image/upload/(v\d+|portfolio)'
        $replacement = 'https://res.cloudinary.com/dtr3yvjac/image/upload/f_auto,q_auto/$1'
        
        $newHtml = [regex]::Replace($html, $pattern, $replacement)
        
        # Save file
        [System.IO.File]::WriteAllText($file, $newHtml, [System.Text.Encoding]::UTF8)
        Write-Host "Completed cleanup of $file!" -ForegroundColor Green
    }
}
