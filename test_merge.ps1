# test_merge.ps1
$i = [System.IO.File]::ReadAllText("index.html", [System.Text.Encoding]::UTF8)
$p = [System.IO.File]::ReadAllText("portfolio.html", [System.Text.Encoding]::UTF8)

function Get-Cards($content) {
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

$indexCards = Get-Cards $i
$portfolioCards = Get-Cards $p

Write-Host "Index Cards: $($indexCards.Count)"
Write-Host "Portfolio Cards: $($portfolioCards.Count)"

$uniqueNormalized = @{}
$uniqueCards = @()

function Add-Card($card, $source) {
    # Extract src
    $src_match = [regex]::Match($card, 'src="([^"]+)"')
    if (-not $src_match.Success) {
        Write-Warning "Card has no src: $card"
        return
    }
    $src = $src_match.Groups[1].Value
    $key = $src
    
    # Extract cat
    $cat_match = [regex]::Match($card, 'data-cat="([^"]+)"')
    $cat = if ($cat_match.Success) { $cat_match.Groups[1].Value } else { "unknown" }
    
    # Extract title
    $title_match = [regex]::Match($card, '<h3[^>]*>(.*?)</h3>')
    $title = if ($title_match.Success) { $title_match.Groups[1].Value.Trim() } else { "no title" }
    
    if (-not $uniqueNormalized.ContainsKey($key)) {
        $uniqueNormalized[$key] = $true
        $global:uniqueCards += $card
        Write-Host "  Added unique card from $source - $cat - $title (src: $($src.Substring(0, [math]::Min(50, $src.Length)))...)"
    } else {
        Write-Host "  Skipped duplicate card from $source - $cat - $title"
    }
}

Write-Host "`nProcessing Index Cards..."
foreach ($c in $indexCards) {
    Add-Card $c "Index"
}

Write-Host "`nProcessing Portfolio Cards..."
foreach ($c in $portfolioCards) {
    Add-Card $c "Portfolio"
}

Write-Host "`nTotal unique cards: $($uniqueCards.Count)"
