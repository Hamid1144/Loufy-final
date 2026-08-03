$htmlFiles = Get-ChildItem -Path . -Filter *.html -File | Where-Object { $_.Name -notmatch "supabase_index_raw" -and $_.Name -notmatch "portfolio_html" }

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    
    # 1. Update style.css cache buster
    $content = $content -replace 'href="style.css(\?v=\d+)?"', 'href="style.css?v=2"'
    
    # 2. Shorten Book Publishing text and change Start Publishing back to Learn More
    $oldText = 'Publish your book with confidence on Amazon KDP, IngramSpark, Barnes & Noble, Lulu, and other major platforms. We handle everything from setup to launch, ensuring your book is professionally prepared for worldwide distribution.</p>\s*<a href="#" class="learn-more" data-admin-text="true">Start Publishing →</a>'
    $newText = 'Publish your book with confidence on major platforms. We handle everything from setup to launch for worldwide distribution.</p>' + "`n" + '<a href="#" class="learn-more" data-admin-text="true">Learn More →</a>'
    
    $content = [regex]::Replace($content, $oldText, $newText)
    
    Set-Content $file.FullName -Value $content -NoNewline -Encoding UTF8
}
Write-Host "Fixes applied!"
