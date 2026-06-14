$supabaseUrl = 'https://pgictinimttptsxbvngg.supabase.co'
$supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc'

$headers = @{
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
}

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

$res = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/site_content?select=id,html_content" -Headers $headers -Method Get

foreach ($r in $res) {
    Write-Host "Row: $($r.id)"
    $cards = Get-Cards $r.html_content
    Write-Host "  Total cards: $($cards.Count)"
    $count = 0
    foreach ($cardHTML in $cards) {
        $count++
        $title = "Unknown"
        if ($cardHTML -match '<h3[^>]*>(.*?)</h3>') {
            $title = $Matches[1]
        }
        $cat = "Unknown"
        if ($cardHTML -match 'data-cat="([^"]+)"') {
            $cat = $Matches[1]
        }
        Write-Host "    $count. Title: $title (Category: $cat)"
        if ($count -ge 10) { break }
    }
}
