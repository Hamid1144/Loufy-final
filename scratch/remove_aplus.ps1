$content = Get-Content 'index.html' -Raw -Encoding UTF8
$content = $content -replace '(?s)<div[^>]*class="[^"]*portfolio-card[^"]*"[^>]*data-cat="a-plus-content"[^>]*>.*?</div>\s*</div>\s*</div>\s*</div>', ''
$content = $content -replace '(?s)<div class="aplus-marquee-item portfolio-card[^>]*data-cat="a-plus-content"[^>]*>.*?</div>\s*</div>\s*</div>\s*</div>', ''
$content = $content -replace '(?s)<div class="aplus-marquee-item portfolio-card" data-cat="a-plus-content">.*?</div>\s*</div>\s*</div>', ''
$content = $content -replace '(?s)<div class="aplus-marquee-item portfolio-card" data-cat="a-plus-content">.*?(?=</div>\s*<div class="aplus-marquee-item)</div>', ''

# It is safer to just replace lines containing a-plus-content, but because of newlines, we need to be careful.
# Let's just use regular expressions carefully.
# The marquee items are like:
# <div class="aplus-marquee-item portfolio-card" data-cat="a-plus-content">
#   <div class="portfolio-thumb">
#       <img ...>
#   </div>
#   <div class="portfolio-info">...</div>
# </div>

$content = $content -replace '(?s)<div[^>]*data-cat="a-plus-content"[^>]*>.*?</div>\s*</div>\s*</div>\s*</div>', ''
$content = $content -replace '(?s)<div class="aplus-marquee-item portfolio-card" data-cat="a-plus-content">.*?</div>\s*</div>', ''
$content = $content -replace '(?s)<div class="aplus-marquee-item portfolio-card reveal" data-cat="a-plus-content" style="">.*?</div>\s*</div>', ''

Set-Content 'index.html' -Value $content -Encoding UTF8
