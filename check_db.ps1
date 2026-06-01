# check_db.ps1
$supabaseUrl = 'https://pgictinimttptsxbvngg.supabase.co'
$supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc'

$headers = @{
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
}

Write-Host "Fetching site_content rows from Supabase..."
$res = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/site_content?select=id,html_content" -Headers $headers -Method Get

foreach ($row in $res) {
    $id = $row.id
    $c = $row.html_content
    # Find all data-cat matches
    $matches = [regex]::Matches($c, 'data-cat="([^"]+)"')
    Write-Host "Row: $id"
    Write-Host "  Total data-cat matches: $($matches.Count)"
    
    # Let's count portfolio-cards in particular
    $card_matches = [regex]::Matches($c, '(?s)<div\s+[^>]*class="[^"]*portfolio-card[^"]*"[^>]*data-cat="([^"]+)"')
    Write-Host "  Total portfolio-card elements: $($card_matches.Count)"
    $groups = $card_matches | Group-Object { $_.Groups[1].Value }
    foreach ($g in $groups) {
        Write-Host "    Category '$($g.Name)': $($g.Count)"
    }
}
