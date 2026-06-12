$url = "https://pgictinimttptsxbvngg.supabase.co/rest/v1/site_content?select=*"
$headers = @{
  "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc"
  "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc"
}

try {
  $resp = Invoke-WebRequest -Uri $url -Headers $headers -Method Get -UseBasicParsing
  $content = $resp.Content | ConvertFrom-Json
  foreach ($row in $content) {
    if ($row.id -eq 'portfolio') {
      Write-Output "=== DATABASE PORTFOLIO CONTENT ==="
      $html = $row.html_content
      # Parse using HTML matching regex
      $matches = [regex]::Matches($html, '(?s)<div[^>]*class="[^"]*portfolio-card[^"]*"[^>]*data-cat="formatting"[^>]*>.*?</div>\s*</div>')
      Write-Output "Found $($matches.Count) formatting cards in database HTML"
      foreach ($match in $matches) {
        $val = $match.Value
        Write-Output "--- RAW CARD HTML ---"
        Write-Output $val
      }
    }
  }
} catch {
  Write-Output "Error: $_"
}
