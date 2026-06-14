# move_to_top.ps1
# Rearranges the cards in portfolio.html to place "Kids Story Book Design" at the top, then runs merge_grids.ps1.

function Get-Cards($filePath) {
    $content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
    $pos = 0
    $cards = @()
    while ($true) {
        $match = [regex]::Match($content.Substring($pos), '<div\s+[^>]*class="[^"]*portfolio-card[^"]*"')
        if (-not $match.Success) {
            break
        }
        $start_idx = $pos + $match.Index
        $nesting = 1
        $ptr = $pos + $match.Index + $match.Length
        while ($nesting -gt 0 -and $ptr -lt $content.Length) {
            $next_open = $content.IndexOf('<div', $ptr)
            $next_close = $content.IndexOf('</div>', $ptr)
            if ($next_close -eq -1) { break }
            if ($next_open -ne -1 -and $next_open -lt $next_close) {
                $nesting += 1
                $ptr = $next_open + 4
            } else {
                $nesting -= 1
                $ptr = $next_close + 6
            }
        }
        $end_idx = $ptr
        $card_content = $content.Substring($start_idx, $end_idx - $start_idx)
        $cards += $card_content
        $pos = $end_idx
    }
    return $cards
}

$portfolioCards = Get-Cards "portfolio.html"

# Find the Kids Story Book Design card
$targetIndex = -1
for ($i = 0; $i -lt $portfolioCards.Count; $i++) {
    if ($portfolioCards[$i] -match 'Kids Story Book Design') {
        $targetIndex = $i
        break
    }
}

if ($targetIndex -eq -1) {
    Write-Error "Could not find Kids Story Book Design card in portfolio.html"
    exit 1
}

$targetCard = $portfolioCards[$targetIndex]
Write-Host "Found target card: Kids Story Book Design"

# Create a new array with target card first
$newCards = @($targetCard)
for ($i = 0; $i -lt $portfolioCards.Count; $i++) {
    if ($i -ne $targetIndex) {
        $newCards += $portfolioCards[$i]
    }
}

# Re-read portfolio.html content
$portfolioContent = [System.IO.File]::ReadAllText("portfolio.html", [System.Text.Encoding]::UTF8)

# Replace the grid in portfolio.html
# Let's write a helper to replace grid
function Replace-GridInContent($content, $newCardsHTML) {
    $gridStartTag = '<div class="portfolio-grid"'
    $gridStart = $content.IndexOf($gridStartTag)
    if ($gridStart -eq -1) {
        throw "Could not find .portfolio-grid"
    }
    
    $nesting = 1
    $ptr = $content.IndexOf('>', $gridStart) + 1
    while ($nesting -gt 0 -and $ptr -lt $content.Length) {
        $next_open = $content.IndexOf('<div', $ptr)
        $next_close = $content.IndexOf('</div>', $ptr)
        if ($next_close -eq -1) { break }
        if ($next_open -ne -1 -and $next_open -lt $next_close) {
            $nesting += 1
            $ptr = $next_open + 4
        } else {
            $nesting -= 1
            $ptr = $next_close + 6
        }
    }
    $gridEnd = $ptr
    
    $newGridHTML = "<div class=""portfolio-grid"" bis_skin_checked=""1"" style=""display: grid;"">`n`n$newCardsHTML`n`n</div>"
    $newContent = $content.Substring(0, $gridStart) + $newGridHTML + $content.Substring($gridEnd)
    return $newContent
}

$newCardsHTML = $newCards -join "`n`n"
$newPortfolioContent = Replace-GridInContent $portfolioContent $newCardsHTML

# Save portfolio.html
[System.IO.File]::WriteAllText("portfolio.html", $newPortfolioContent, [System.Text.Encoding]::UTF8)
Write-Host "Reordered portfolio.html successfully!"

# Run merge_grids.ps1 to propagate changes to index.html
Write-Host "Running merge_grids.ps1..."
powershell -ExecutionPolicy Bypass -File .\merge_grids.ps1
