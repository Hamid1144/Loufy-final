$supabaseUrl = 'https://pgictinimttptsxbvngg.supabase.co'
$supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc'

$headers = @{
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
    "Content-Type" = "application/json; charset=utf-8"
}

Write-Host "Fetching live content from Supabase to clean..."
$uri = "$supabaseUrl/rest/v1/site_content?select=id,html_content"

try {
    $res = Invoke-RestMethod -Uri $uri -Headers $headers -Method Get
} catch {
    Write-Error "Failed to fetch live content: $_"
    exit 1
}

foreach ($row in $res) {
    $id = $row.id
    $html = $row.html_content
    
    if ([string]::IsNullOrEmpty($html)) {
        continue
    }
    
    Write-Host "Checking page '$id' for background elements..."
    
    # Check if there are background animation elements
    if ($html -match 'bg-anim-wrap' -or $html -match 'bg-anim-canvas' -or $html -match 'bg-hero-glow') {
        Write-Host "Found serialized background elements in '$id'. Cleaning..."
        
        # Remove everything from start of string up to <!-- NAVBAR --> (preserving the comment)
        $cleanHtml = $html -replace '^(?s).*?(?=<!-- NAVBAR -->)', ''
        
        Write-Host "Original length: $($html.Length), Cleaned length: $($cleanHtml.Length)"
        
        if ($cleanHtml.Length -lt 100) {
            Write-Error "Cleaned HTML is too short ($($cleanHtml.Length) chars). Aborting database write to protect content."
            continue
        }
        
        # Push cleaned content back to Supabase
        Write-Host "Uploading cleaned '$id' HTML to Supabase..."
        $updateUri = "$supabaseUrl/rest/v1/site_content?id=eq.$id"
        
        $bodyObj = @{
            html_content = $cleanHtml
        }
        $bodyJson = ConvertTo-Json -InputObject $bodyObj -Compress
        
        # Convert JSON string to UTF-8 bytes to ensure correct content-length and encoding
        $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($bodyJson)
        
        try {
            $updateRes = Invoke-RestMethod -Uri $updateUri -Headers $headers -Method Patch -Body $bodyBytes
            Write-Host "Successfully updated '$id' in Supabase!"
        } catch {
            # Inspect response details
            if ($_.Exception.Response) {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $responseBody = $reader.ReadToEnd()
                Write-Error "Failed to update '$id' in Supabase. Response: $responseBody"
            } else {
                Write-Error "Failed to update '$id' in Supabase: $_"
            }
        }
    } else {
        Write-Host "No serialized background elements found in '$id'."
    }
}
