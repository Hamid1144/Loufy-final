$supabaseUrl = 'https://pgictinimttptsxbvngg.supabase.co'
$supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc'

# Headers
$headers = @{
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
    "Content-Type" = "application/json; charset=utf-8"
}

$pages = @(
    @{ id = "index"; path = "c:\Users\razah\.gemini\antigravity\scratch\hamid-raza-portfolio\index.html" },
    @{ id = "portfolio"; path = "c:\Users\razah\.gemini\antigravity\scratch\hamid-raza-portfolio\portfolio.html" }
)

foreach ($page in $pages) {
    $id = $page.id
    $filePath = $page.path
    
    if (Test-Path $filePath) {
        Write-Host "Reading local body content from $filePath..."
        $htmlContent = Get-Content -Path $filePath -Raw -Encoding UTF8
        
        # Extract content between <body> and </body> tags
        $pattern = '(?s)<body[^>]*>(.*?)</body>'
        if ($htmlContent -match $pattern) {
            $bodyContent = $Matches[1].Trim()
            
            # Double check to prevent pushing static background elements to the database
            if ($bodyContent -match 'bg-anim-wrap' -or $bodyContent -match 'bg-anim-canvas' -or $bodyContent -match 'bg-hero-glow') {
                Write-Warning "Found serialized background elements in local $id body content. Cleaning before upload..."
                $bodyContent = $bodyContent -replace '^(?s).*?(?=<!-- NAVBAR -->)', ''
                
                # Check for remaining parts
                $bodyContent = $bodyContent -replace '(?s)<div id="bg-hero-glow"[^>]*>.*?</div>', ''
                $bodyContent = $bodyContent -replace '(?s)<canvas id="bg-anim-canvas"[^>]*>.*?</canvas>', ''
                $bodyContent = $bodyContent -replace '(?s)<div id="bg-anim-wrap"[^>]*>(?:\s*<div class="bg-orb"[^>]*></div>)*\s*</div>', ''
            }
            
            Write-Host "Uploading cleaned '$id' body content to Supabase..."
            $updateUri = "$supabaseUrl/rest/v1/site_content?id=eq.$id"
            
            $bodyObj = @{
                html_content = $bodyContent
            }
            $bodyJson = ConvertTo-Json -InputObject $bodyObj -Compress
            
            # Convert JSON string to UTF-8 bytes to ensure correct content-length and encoding
            $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($bodyJson)
            
            try {
                $updateRes = Invoke-RestMethod -Uri $updateUri -Headers $headers -Method Patch -Body $bodyBytes
                Write-Host "Successfully pushed '$id' body to Supabase!"
            } catch {
                if ($_.Exception.Response) {
                    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                    $responseBody = $reader.ReadToEnd()
                    Write-Error "Failed to push '$id' body to Supabase. Response: $responseBody"
                } else {
                    Write-Error "Failed to push '$id' body to Supabase: $_"
                }
            }
        } else {
            Write-Warning "Could not find body tags in $filePath"
        }
    } else {
        Write-Warning "File not found: $filePath"
    }
}
