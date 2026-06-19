$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$supabaseUrl = 'https://pgictinimttptsxbvngg.supabase.co'
$supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc'

# Headers
$headers = @{
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
    "Content-Type" = "application/json; charset=utf-8"
}

Write-Host "Fetching live content from Supabase..."
try {
    $res = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/site_content?select=id,html_content" -Headers $headers -Method Get
} catch {
    Write-Error "Failed to fetch live content: $_"
    exit 1
}

foreach ($row in $res) {
    $id = $row.id
    $liveBody = $row.html_content.Trim()
    
    $filePath = ""
    if ($id -eq "index") {
        $filePath = ".\index.html"
    } elseif ($id -eq "portfolio") {
        $filePath = ".\portfolio.html"
    }
    
    if ($filePath -and (Test-Path $filePath)) {
        Write-Host "Syncing live '$id' body content (safe method) to $filePath..."
        
        # Read the file
        $htmlContent = Get-Content -Path $filePath -Raw -Encoding UTF8
        
        # Using regex to find the body content boundaries
        $pattern = '(?s)(<body[^>]*>)(.*?)(</body>)'
        if ($htmlContent -match $pattern) {
            $startTag = $Matches[1]
            $bodyContent = $Matches[2]
            $endTag = $Matches[3]
            
            # Find index of body content and replace it safely
            $index = $htmlContent.IndexOf($bodyContent)
            if ($index -ge 0) {
                $newHtmlContent = $htmlContent.Substring(0, $index) + "`r`n" + $liveBody + "`r`n" + $htmlContent.Substring($index + $bodyContent.Length)
                [System.IO.File]::WriteAllText($filePath, $newHtmlContent, [System.Text.Encoding]::UTF8)
                Write-Host "Successfully synced local $filePath with live database (safe method)!"
            } else {
                Write-Warning "Could not locate body content index in $filePath"
            }
        } else {
            Write-Warning "Could not find body tags in $filePath"
        }
    }
}
