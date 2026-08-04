$content = Get-Content index.html -Raw -Encoding UTF8

$oldBlock = '(?s)<div class="service-icon"[^>]*><i class="fa-solid fa-thumbs-up"></i></div>\s*<h3 data-admin-text="true">Social Media Design</h3>\s*<p data-admin-text="true">Scroll-stopping social media graphics, banners, and promotional materials for your brand.</p>'
$newBlock = '<div class="service-icon" bis_skin_checked="1"><i class="fa-solid fa-book-open"></i></div>' + "`r`n" + '<h3 data-admin-text="true">Book Publishing</h3>' + "`r`n" + '<p data-admin-text="true">Publish your book with confidence on major platforms. We handle everything from setup to launch, ensuring your book is professionally prepared.</p>'

$content = $content -replace $oldBlock, $newBlock
$content = $content.Replace('>Social Media Design<', '>Book Publishing<')

Set-Content index.html -Value $content -NoNewline -Encoding UTF8
Write-Host "Replaced content in index.html"
