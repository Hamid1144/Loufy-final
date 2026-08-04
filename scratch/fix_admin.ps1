$content = Get-Content admin.html -Raw -Encoding UTF8
$content = $content -replace '(?s)<!-- GLOBAL LOADING SCREEN -->.*?</div>\s*', ''
Set-Content admin.html -Value $content -NoNewline -Encoding UTF8
Write-Host "Removed loader from admin.html"
