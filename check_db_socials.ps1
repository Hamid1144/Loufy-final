# check_db_socials.ps1
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
    
    Write-Host "Page: $id" -ForegroundColor Green
    
    # Use Regex to find all social-icons containers
    $matches = [regex]::Matches($c, '(?s)<div\s+[^>]*class="[^"]*social-icons[^"]*"[^>]*>(.*?)</div>')
    foreach ($m in $matches) {
        Write-Host "  Container:"
        $inner = $m.Groups[1].Value
        $links = [regex]::Matches($inner, '(?s)<a\s+[^>]*href="([^"]*)"[^>]*data-social="([^"]*)"[^>]*>')
        foreach ($link in $links) {
            Write-Host "    - Social: $($link.Groups[2].Value), Href: $($link.Groups[1].Value)"
        }
    }
}
