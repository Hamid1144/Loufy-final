$htmlFiles = Get-ChildItem -Path . -Filter *.html -File | Where-Object { $_.Name -notmatch 'supabase_index_raw' }
foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $content = $content -replace 'style\.css\?v=3', 'style.css?v=4'
    $content = $content -replace 'style\.css\?v=2', 'style.css?v=4'
    $content = $content -replace 'style\.css\?v=1', 'style.css?v=4'
    Set-Content $file.FullName -Value $content -NoNewline -Encoding UTF8
}
Write-Host "Updated CSS cache buster to v=4"
