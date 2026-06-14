# Check category sequence of all cards in the current index.html portfolio grid

$filePath = "index.html"
$html = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

# Find the portfolio grid section
$gridMatch = [regex]::Match($html, '(?s)<div[^>]*class="[^"]*portfolio-grid[^"]*"[^>]*>([\s\S]*?)</div>\s*<!--')
if (-not $gridMatch.Success) {
    $gridMatch = [regex]::Match($html, '(?s)<div[^>]*class="[^"]*portfolio-grid[^"]*"[^>]*>([\s\S]*?)(<section|</footer)')
}

if ($gridMatch.Success) {
    $gridContent = $gridMatch.Groups[1].Value
    $cardMatches = [regex]::Matches($gridContent, '(?s)<div[^>]*class="[^"]*portfolio-card[^"]*"[^>]*data-cat="([^"]+)"')
    Write-Host "Found $($cardMatches.Count) cards in current index.html portfolio-grid."
    $count = 1
    foreach ($cm in $cardMatches) {
        $cat = $cm.Groups[1].Value
        Write-Host "Card $count - Category: $cat"
        $count++
    }
} else {
    Write-Error "Could not find portfolio-grid section in index.html"
}
