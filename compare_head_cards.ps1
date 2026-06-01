# compare_head_cards.ps1
$i = (git show HEAD:index.html) -join "`n"
$p = (git show HEAD:portfolio.html) -join "`n"

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

Write-Host "HEAD index.html cards count: $($indexCards.Count)"
Write-Host "HEAD portfolio.html cards count: $($portfolioCards.Count)"

function Get-NormalizedCard($card) {
    $normalized = [regex]::Replace($card, '\s+', ' ')
    $normalized = [regex]::Replace($normalized, '\s*bis_skin_checked="[^"]*"', '')
    $normalized = [regex]::Replace($normalized, '\s*style="[^"]*"', '')
    $normalized = [regex]::Replace($normalized, '\s*class="[^"]*"', '')
    $normalized = $normalized.Trim()
    return $normalized
}

$i_norms = @{}
$i_dups = @()
foreach ($c in $indexCards) {
    $norm = Get-NormalizedCard $c
    if ($i_norms.ContainsKey($norm)) {
        $i_dups += $c
    } else {
        $i_norms[$norm] = $c
    }
}

$p_norms = @{}
$p_dups = @()
foreach ($c in $portfolioCards) {
    $norm = Get-NormalizedCard $c
    if ($p_norms.ContainsKey($norm)) {
        $p_dups += $c
    } else {
        $p_norms[$norm] = $c
    }
}

Write-Host "Unique cards in index.html: $($i_norms.Count) (duplicates: $($i_dups.Count))"
foreach ($d in $i_dups) {
    $title_match = [regex]::Match($d, '<h3[^>]*>(.*?)</h3>')
    $title = if ($title_match.Success) { $title_match.Groups[1].Value.Trim() } else { "no title" }
    Write-Host "  Duplicate in index: $title"
}

Write-Host "Unique cards in portfolio.html: $($p_norms.Count) (duplicates: $($p_dups.Count))"
foreach ($d in $p_dups) {
    $title_match = [regex]::Match($d, '<h3[^>]*>(.*?)</h3>')
    $title = if ($title_match.Success) { $title_match.Groups[1].Value.Trim() } else { "no title" }
    Write-Host "  Duplicate in portfolio: $title"
}

Write-Host "`nCards only in HEAD index.html:"
$only_in_index = 0
foreach ($k in $i_norms.Keys) {
    if (-not $p_norms.ContainsKey($k)) {
        $card = $i_norms[$k]
        $cat_match = [regex]::Match($card, 'data-cat="([^"]+)"')
        $cat = if ($cat_match.Success) { $cat_match.Groups[1].Value } else { "unknown" }
        $title_match = [regex]::Match($card, '<h3[^>]*>(.*?)</h3>')
        $title = if ($title_match.Success) { $title_match.Groups[1].Value.Trim() } else { "no title" }
        Write-Host "  Category: $cat, Title: $title"
        $only_in_index++
    }
}
Write-Host "Total: $only_in_index"

Write-Host "`nCards only in HEAD portfolio.html:"
$only_in_portfolio = 0
foreach ($k in $p_norms.Keys) {
    if (-not $i_norms.ContainsKey($k)) {
        $card = $p_norms[$k]
        $cat_match = [regex]::Match($card, 'data-cat="([^"]+)"')
        $cat = if ($cat_match.Success) { $cat_match.Groups[1].Value } else { "unknown" }
        $title_match = [regex]::Match($card, '<h3[^>]*>(.*?)</h3>')
        $title = if ($title_match.Success) { $title_match.Groups[1].Value.Trim() } else { "no title" }
        Write-Host "  Category: $cat, Title: $title"
        $only_in_portfolio++
    }
}
Write-Host "Total: $only_in_portfolio"
