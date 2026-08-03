$loaderHtml = @"
<!-- GLOBAL LOADING SCREEN -->
<div id="global-loader" class="global-loader">
  <div class="loader-spinner"></div>
  <img src="https://res.cloudinary.com/dtr3yvjac/image/upload/f_auto,q_auto/v1781714238/portfolio/logo.png" alt="Logo" class="loader-logo">
</div>
"@

$htmlFiles = Get-ChildItem -Path . -Filter *.html -File | Where-Object { $_.Name -notmatch "supabase_index_raw" -and $_.Name -notmatch "portfolio_html" }

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    if ($content -match '<div id="global-loader"') {
        Write-Host "Loader already exists in $($file.Name)"
        continue
    }

    # Insert right after the opening <body> tag
    $newContent = [regex]::Replace($content, '(?i)(<body[^>]*>)', "`$1`n$loaderHtml")
    Set-Content $file.FullName -Value $newContent -NoNewline -Encoding UTF8
    Write-Host "Added loader to $($file.Name)"
}
