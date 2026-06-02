# check_local.ps1
function Count-Cards($filePath) {
    $c = Get-Content -Raw -Encoding utf8 $filePath
    $matches = [regex]::Matches($c, '(?s)<div\s+[^>]*class="[^"]*portfolio-card[^"]*"[^>]*data-cat="([^"]+)"')
    Write-Host "$filePath - total cards: $($matches.Count)"
    foreach ($m in $matches) {
        $sub = $m.Value
        $title_match = [regex]::Match($sub, '<h3[^>]*>(.*?)</h3>')
        $title = if ($title_match.Success) { $title_match.Groups[1].Value.Trim() } else { "no title" }
        Write-Host "  - Cat: $($m.Groups[1].Value), Title: $title"
    }
}

Count-Cards "index.html"

