# verify_db.ps1
$ProgressPreference = 'SilentlyContinue'
$supabaseUrl = 'https://pgictinimttptsxbvngg.supabase.co'
$supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc'

$headers = @{
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
}

$res = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/site_content?select=id,html_content" -Headers $headers -Method Get

foreach ($row in $res) {
    $id = $row.id
    $c = $row.html_content
    $card_matches = [regex]::Matches($c, '(?s)<div\s+[^>]*class="[^"]*portfolio-card[^"]*"[^>]*data-cat="([^"]+)"')
    Write-Host "Row: $id - total cards: $($card_matches.Count)"
    $groups = $card_matches | Group-Object { $_.Groups[1].Value }
    foreach ($g in $groups) {
        Write-Host "    Category '$($g.Name)': $($g.Count)"
    }
}
