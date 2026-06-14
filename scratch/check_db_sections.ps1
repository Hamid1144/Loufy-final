# Query site_content from Supabase and check for hidden-section class on sections

$supabaseUrl = 'https://pgictinimttptsxbvngg.supabase.co'
$supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc'

$headers = @{
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
}

Write-Host "Fetching rows from site_content table..."
try {
    $res = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/site_content?select=id,html_content" -Headers $headers -Method Get -UseBasicParsing
    Write-Host "Found $($res.Count) rows."
    foreach ($row in $res) {
        $id = $row.id
        $html = $row.html_content
        
        Write-Host "Page: $id"
        # Find all <section> elements
        $matches = [regex]::Matches($html, '<section\s+[^>]*class="([^"]+)"\s+[^>]*id="([^"]+)"')
        if ($matches.Count -eq 0) {
            $matches = [regex]::Matches($html, '(?s)<section\s+([^>]*?)>')
        }
        
        Write-Host "  Found $($matches.Count) sections:"
        foreach ($m in $matches) {
            $tag = $m.Value
            Write-Host "    $tag"
        }
    }
} catch {
    Write-Error "Error: $_"
}
