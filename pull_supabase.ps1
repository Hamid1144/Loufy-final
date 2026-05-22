$supabaseUrl = 'https://pgictinimttptsxbvngg.supabase.co'
$supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc'

# Headers
$headers = @{
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
    "Content-Type" = "application/json; charset=utf-8"
}

Write-Host "Fetching live content from Supabase..."
$uri = "$supabaseUrl/rest/v1/site_content?select=id,html_content"

try {
    $res = Invoke-RestMethod -Uri $uri -Headers $headers -Method Get
} catch {
    Write-Error "Failed to fetch live content: $_"
    exit 1
}

foreach ($row in $res) {
    $id = $row.id
    $liveBody = $row.html_content.Trim()
    
    $filePath = ""
    if ($id -eq "index") {
        $filePath = "c:\Users\razah\.gemini\antigravity\scratch\hamid-raza-portfolio\index.html"
    } elseif ($id -eq "portfolio") {
        $filePath = "c:\Users\razah\.gemini\antigravity\scratch\hamid-raza-portfolio\portfolio.html"
    }
    
    if ($filePath -and (Test-Path $filePath)) {
        Write-Host "Syncing live '$id' body content to $filePath..."
        
        # Read the file
        $htmlContent = Get-Content -Path $filePath -Raw -Encoding UTF8
        
        # Replace the body content while preserving <body> and </body> tags
        # Using regex to find the body tags and replace the inner content
        $pattern = '(?s)(<body[^>]*>)(.*?)(</body>)'
        if ($htmlContent -match $pattern) {
            # Construct the new HTML content
            # Ensure $liveBody doesn't have regex replacement issues by replacing special characters if needed
            # We construct it using match groups to keep original body attributes
            $startTag = $Matches[1]
            $endTag = $Matches[3]
            $newHtmlContent = $htmlContent -replace '(?s)<body[^>]*>.*?</body>', "$startTag`r`n$liveBody`r`n$endTag"
            
            # Save the file using UTF-8 encoding
            [System.IO.File]::WriteAllText($filePath, $newHtmlContent, [System.Text.Encoding]::UTF8)
            Write-Host "Successfully synced local $filePath with live database!"
        } else {
            Write-Warning "Could not find body tags in $filePath"
        }
    }
}
