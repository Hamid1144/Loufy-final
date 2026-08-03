$oldTextStr = "Start Publishing →"
$newTextStr = "Learn More →"
$oldDescStr = "Publish your book with confidence on Amazon KDP, IngramSpark, Barnes & Noble, Lulu, and other major platforms. We handle everything from setup to launch, ensuring your book is professionally prepared for worldwide distribution.</p>"
$newDescStr = "Publish your book with confidence on major platforms. We handle everything from setup to launch, ensuring your book is professionally prepared.</p>"

$htmlFiles = Get-ChildItem -Path . -Filter *.html -File | Where-Object { $_.Name -notmatch "supabase_index_raw" -and $_.Name -notmatch "portfolio_html" }

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    
    # Update style.css cache buster
    $content = $content -replace 'href="style\.css(\?v=\d+)?"', 'href="style.css?v=3"'
    
    # Revert CTA and fix desc length
    $content = $content.Replace($oldTextStr, $newTextStr)
    $content = $content.Replace($oldDescStr, $newDescStr)
    
    Set-Content $file.FullName -Value $content -NoNewline -Encoding UTF8
}
Write-Host "Done applying fixes safely!"
