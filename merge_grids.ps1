param (
    [string]$OrderSource = "portfolio"
)

# merge_grids.ps1
# Helper to extract card contents
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
            
            if ($next_close -eq -1) {
                break
            }
            
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

$indexCards = Get-Cards "index.html"
$portfolioCards = Get-Cards "portfolio.html"

Write-Host "Local index.html has $($indexCards.Count) cards."
Write-Host "Local portfolio.html has $($portfolioCards.Count) cards."

# Let's find the union of cards.
# We'll normalize the cards by removing style, bis_skin_checked, and whitespace to compare them.
function Get-NormalizedCard($card) {
    $normalized = [regex]::Replace($card, '\s+', ' ')
    $normalized = [regex]::Replace($normalized, '(?i)\s*bis_skin_checked="[^"]*"', '')
    $normalized = [regex]::Replace($normalized, '(?i)\s*style="[^"]*"', '')
    $normalized = [regex]::Replace($normalized, '(?i)\s*class="[^"]*"', '')
    $normalized = [regex]::Replace($normalized, '(?i)\s*data-optimized="[^"]*"', '')
    $normalized = [regex]::Replace($normalized, '(?i)\s*data-admin-text="[^"]*"', '')
    $normalized = [regex]::Replace($normalized, '(?i)\s*contenteditable="[^"]*"', '')
    $normalized = [regex]::Replace($normalized, '(?i)\s*data-show-on-home="[^"]*"', '')
    $normalized = $normalized.Trim()
    return $normalized
}

$script:uniqueCards = @()
$script:uniqueNormalized = @{}

# Helper to add a card if it is unique
function Add-IfUnique($card) {
    $norm = Get-NormalizedCard $card
    # We can match uniquely by extracting the img tag src or first 100 characters of normalized string
    # Let's extract the image source:
    $key = $norm
    
    if (-not $script:uniqueNormalized.ContainsKey($key)) {
        $script:uniqueNormalized[$key] = $true
        # Make sure the card style is displayed block and clean classes
        # Set style to style="display: block;" or clear hidden styles
        $endOfFirstTag = $card.IndexOf('>')
        if ($endOfFirstTag -gt 0) {
            $firstTag = $card.Substring(0, $endOfFirstTag + 1)
            $restOfCard = $card.Substring($endOfFirstTag + 1)
            $firstTag = $firstTag -replace 'style="display:\s*none;"', 'style="display: block;"'
            $firstTag = $firstTag -replace 'style="display:none;"', 'style="display: block;"'
            if ($firstTag -notlike '*style=*') {
                $firstTag = $firstTag.Replace('class="portfolio-card reveal"', 'class="portfolio-card reveal" style="display: block;"')
            }
            $clean_card = $firstTag + $restOfCard
        } else {
            $clean_card = $card
        }
        $script:uniqueCards += $clean_card
    }
}

if ($OrderSource -eq "index") {
    # Prioritize index.html card order
    foreach ($c in $indexCards) {
        Add-IfUnique $c
    }
    foreach ($c in $portfolioCards) {
        Add-IfUnique $c
    }
} else {
    # Prioritize portfolio.html card order (default)
    foreach ($c in $portfolioCards) {
        Add-IfUnique $c
    }
    foreach ($c in $indexCards) {
        Add-IfUnique $c
    }
}

Write-Host "Total unique merged cards: $($script:uniqueCards.Count)"

# Let's reconstruct the portfolio-grid content.
# We will join them with newlines.
$script:mergedGridHTML = $script:uniqueCards -join "`n`n"

# Re-read index.html and portfolio.html
$indexContent = [System.IO.File]::ReadAllText("index.html", [System.Text.Encoding]::UTF8)
$portfolioContent = [System.IO.File]::ReadAllText("portfolio.html", [System.Text.Encoding]::UTF8)

# Replaces the portfolio-grid content in a file
function Replace-GridInFile($filePath, $content) {
    $gridStartTag = '<div class="portfolio-grid"'
    $gridStart = $content.IndexOf($gridStartTag)
    if ($gridStart -eq -1) {
        Write-Error "Could not find .portfolio-grid in $filePath"
        return $content
    }
    
    # Track nesting
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
    
    # Create the new grid tag with style="display: grid;"
    $gridStartTagFull = $content.Substring($gridStart, $content.IndexOf('>', $gridStart) - $gridStart + 1)
    
    # Replace the inner grid HTML
    $newGridHTML = "<div class=""portfolio-grid"" bis_skin_checked=""1"" style=""display: grid;"">`n`n$script:mergedGridHTML`n`n</div>"
    
    $newContent = $content.Substring(0, $gridStart) + $newGridHTML + $content.Substring($gridEnd)
    return $newContent
}

# Also synchronize the portfolio-filters in both files to make sure they have a-plus-content
# index.html filter:
$filtersStartTag = '<div class="portfolio-filters"'
$indexFiltersStart = $indexContent.IndexOf($filtersStartTag)
$indexFiltersEnd = $indexContent.IndexOf('</div>', $indexFiltersStart) + 6
$indexFiltersHTML = $indexContent.Substring($indexFiltersStart, $indexFiltersEnd - $indexFiltersStart)

# Make sure "All" filter button is active in portfolio.html and a-plus-content is active or not
$portfolioFiltersHTML = $indexFiltersHTML -replace 'style="display:\s*none;?"', ''
$portfolioFiltersHTML = $portfolioFiltersHTML -replace '(?s)<button[^>]*data-cat="all"[^>]*>All</button>\s*', ''
$portfolioFiltersHTML = $portfolioFiltersHTML -replace 'class="filter-btn active"', 'class="filter-btn"'
$portfolioFiltersHTML = $portfolioFiltersHTML -replace 'data-cat="covers"', 'class="filter-btn active" data-cat="covers"'
$portfolioFiltersHTML = $portfolioFiltersHTML -replace 'class="filter-btn" class="filter-btn active"', 'class="filter-btn active"'

# Replace index.html grid and filters
$newIndexContent = Replace-GridInFile "index.html" $indexContent
# Make sure the "a-plus-content" is active in index.html filters or whichever was active
# actually let's just keep the filters as they were in index.html
$indexFiltersStart = $newIndexContent.IndexOf($filtersStartTag)
$indexFiltersEnd = $newIndexContent.IndexOf('</div>', $indexFiltersStart) + 6
$newIndexContent = $newIndexContent.Substring(0, $indexFiltersStart) + $indexFiltersHTML + $newIndexContent.Substring($indexFiltersEnd)

# Replace portfolio.html grid and filters
$newPortfolioContent = Replace-GridInFile "portfolio.html" $portfolioContent
$portfolioFiltersStart = $newPortfolioContent.IndexOf($filtersStartTag)
$portfolioFiltersEnd = $newPortfolioContent.IndexOf('</div>', $portfolioFiltersStart) + 6
$newPortfolioContent = $newPortfolioContent.Substring(0, $portfolioFiltersStart) + $portfolioFiltersHTML + $newPortfolioContent.Substring($portfolioFiltersEnd)

# Save both files
[System.IO.File]::WriteAllText("index.html", $newIndexContent, [System.Text.Encoding]::UTF8)
[System.IO.File]::WriteAllText("portfolio.html", $newPortfolioContent, [System.Text.Encoding]::UTF8)

Write-Host "Successfully merged and saved index.html and portfolio.html!"
