# test_reorder_coloring_book.ps1
$ProgressPreference = 'SilentlyContinue'

# 1. Read index.html cards
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

$cards = Get-Cards "index.html"

# Find the Childrens Coloring Book card
$targetIndex = -1
for ($i = 0; $i -lt $cards.Count; $i++) {
    if ($cards[$i] -match 'Childrens Coloring Book') {
        $targetIndex = $i
        break
    }
}

if ($targetIndex -eq -1) {
    Write-Error "Could not find Childrens Coloring Book card!"
    exit 1
}

$targetCard = $cards[$targetIndex]
Write-Host "Found target card: Childrens Coloring Book"

# Create a new array with target card first
$newCards = @($targetCard)
for ($i = 0; $i -lt $cards.Count; $i++) {
    if ($i -ne $targetIndex) {
        $newCards += $cards[$i]
    }
}

$newCardsHTML = $newCards -join "`n`n"

# Replace the grid in index.html content
$indexContent = [System.IO.File]::ReadAllText("index.html", [System.Text.Encoding]::UTF8)

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

$newIndexContent = Replace-GridInContent $indexContent $newCardsHTML

# Save modified index.html locally
[System.IO.File]::WriteAllText("index.html", $newIndexContent, [System.Text.Encoding]::UTF8)
Write-Host "Temporarily reordered index.html locally."

# Now push this update to Supabase index row ONLY (simulating user saving homepage from admin panel)
Write-Host "Pushing index update to Supabase..."
$supabaseUrl = 'https://pgictinimttptsxbvngg.supabase.co'
$supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc'
$headers = @{
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
    "Content-Type" = "application/json; charset=utf-8"
}

# Extract body from new index content
$pattern = '(?s)<body[^>]*>(.*?)</body>'
if ($newIndexContent -match $pattern) {
    $bodyContent = $Matches[1].Trim()
    
    # clean background animation elements
    $bodyContent = $bodyContent -replace '^(?s).*?(?=<!-- NAVBAR -->)', ''
    $bodyContent = $bodyContent -replace '(?s)<div id="bg-hero-glow"[^>]*>.*?</div>', ''
    $bodyContent = $bodyContent -replace '(?s)<canvas id="bg-anim-canvas"[^>]*>.*?</canvas>', ''
    $bodyContent = $bodyContent -replace '(?s)<div id="bg-anim-wrap"[^>]*>(?:\s*<div class="bg-orb"[^>]*></div>)*\s*</div>', ''
    
    $bodyObj = @{ html_content = $bodyContent }
    $bodyJson = ConvertTo-Json -InputObject $bodyObj -Compress
    $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($bodyJson)
    
    $updateUri = "$supabaseUrl/rest/v1/site_content?id=eq.index"
    $response = Invoke-WebRequest -Uri $updateUri -Headers $headers -Method Patch -Body $bodyBytes -UseBasicParsing
    Write-Host "Supabase update status: $($response.StatusCode)"
} else {
    Write-Error "Could not find body tags in index.html"
}

# Revert local changes so we can see if the daemon fetches the new order and syncs it cleanly
git checkout index.html
Write-Host "Reverted local index.html to clean git state. Waiting 30 seconds for daemon to sync..."

# Wait 30 seconds
Start-Sleep -Seconds 30

# Verify the result!
Write-Host "Checking local card order after daemon sync..."
$newIndexCards = Get-Cards "index.html"
$newPortfolioCards = Get-Cards "portfolio.html"

Write-Host "New Local index.html first cards:"
for ($i=0; $i -lt 4; $i++) {
    if ($newIndexCards[$i] -match '<h3[^>]*>(.*?)</h3>') {
        Write-Host "  $($i+1). $($Matches[1])"
    }
}

Write-Host "New Local portfolio.html first cards:"
for ($i=0; $i -lt 4; $i++) {
    if ($newPortfolioCards[$i] -match '<h3[^>]*>(.*?)</h3>') {
        Write-Host "  $($i+1). $($Matches[1])"
    }
}
