$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$supabaseUrl = 'https://pgictinimttptsxbvngg.supabase.co'
$supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc'

$headers = @{
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
}

$pages = @(
    @{ id = "index"; path = ".\index.html" },
    @{ id = "portfolio"; path = ".\portfolio.html" }
)

foreach ($page in $pages) {
    $id = $page.id
    $filePath = $page.path
    
    Write-Host "Fetching live body content for '$id' from Supabase..."
    $fetchUri = "$supabaseUrl/rest/v1/site_content?id=eq.$id&select=html_content"
    
    try {
        $liveData = Invoke-RestMethod -Uri $fetchUri -Headers $headers -Method Get -UseBasicParsing
        if ($liveData -and $liveData.Count -gt 0 -and $liveData[0].html_content) {
            $liveBody = $liveData[0].html_content
            
            if (Test-Path $filePath) {
                $fileContent = Get-Content -Path $filePath -Raw -Encoding UTF8
                
                # Replace content inside <body>...</body>
                if ($fileContent -match '(?s)(<body[^>]*>)(.*?)(</body>)') {
                    $openTag = $Matches[1]
                    $closeTag = $Matches[3]
                    
                    # Construct replacement safely
                    $escapedLiveBody = $liveBody.Replace('$', '$$')
                    $newContent = $fileContent -replace '(?s)<body[^>]*>.*?</body>', "$openTag`r`n$escapedLiveBody`r`n$closeTag"
                    
                    [IO.File]::WriteAllText((Resolve-Path $filePath), $newContent, [System.Text.Encoding]::UTF8)
                    Write-Host "Successfully synced local $filePath with live Supabase content!"
                } else {
                    Write-Warning "Could not find body tags in $filePath"
                }
            } else {
                Write-Warning "Local file $filePath not found!"
            }
        } else {
            Write-Warning "No content found in database for '$id'"
        }
    } catch {
        Write-Error "Failed to sync '$id': $_"
    }
}
