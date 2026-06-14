param (
    [string]$Commit = "HEAD"
)

$content = (git show "${Commit}:index.html") -join "`n"

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

$cards = Get-Cards $content
Write-Host "Commit: $Commit - Total Cards: $($cards.Count)"
$count = 0
foreach ($card in $cards) {
    $count++
    $title = "Unknown"
    if ($card -match '<h3[^>]*>(.*?)</h3>') {
        $title = $Matches[1]
    }
    $cat = "Unknown"
    if ($card -match 'data-cat="([^"]+)"') {
        $cat = $Matches[1]
    }
    Write-Host "  $count. $title (Category: $cat)"
}
