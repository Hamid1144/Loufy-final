param (
    [switch]$Force
)

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

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
        
        $pattern = '(?s)<body[^>]*>(.*?)</body>'
        if ($htmlContent -match $pattern) {
            $bodyContent = $Matches[1].Trim()
            
            # Clean background elements
            if ($bodyContent -match 'bg-anim-wrap' -or $bodyContent -match 'bg-anim-canvas' -or $bodyContent -match 'bg-hero-glow') {
                Write-Warning "Found serialized background elements in local $id body content. Cleaning before upload..."
                $bodyContent = $bodyContent -replace '^(?s).*?(?=<!-- NAVBAR -->)', ''
                $bodyContent = $bodyContent -replace '(?s)<div id="bg-hero-glow"[^>]*>.*?</div>', ''
                $bodyContent = $bodyContent -replace '(?s)<canvas id="bg-anim-canvas"[^>]*>.*?</canvas>', ''
                $bodyContent = $bodyContent -replace '(?s)<div id="bg-anim-wrap"[^>]*>(?:\s*<div class="bg-orb"[^>]*></div>)*\s*</div>', ''
            }

            # Smart Merge Logic
            if (-not $Force) {
                Write-Host "Checking for existing live content in Supabase to perform safe merge..."
                $fetchUri = "$supabaseUrl/rest/v1/site_content?id=eq.$id&select=html_content"
                $liveData = $null
                try {
                    $liveData = Invoke-RestMethod -Uri $fetchUri -Headers $headers -Method Get -UseBasicParsing
                } catch {
                    Write-Warning "Could not fetch live content for '$id': $_"
                }

                if ($liveData -and $liveData.Count -gt 0 -and $liveData[0].html_content) {
                    $liveBodyContent = $liveData[0].html_content
                    $mergedContent = $liveBodyContent
                    
                    # Extract local navbar
                    $localNavbar = ""
                    if ($bodyContent -match '(?s)(<nav\s+class="navbar.*?">.*?</nav>)') {
                        $localNavbar = $Matches[1]
                    }
                    
                    # Extract local footer
                    $localFooter = ""
                    if ($bodyContent -match '(?s)(<footer\s+class="footer.*?">.*?</footer>)') {
                        $localFooter = $Matches[1]
                    }

                    $mergedAny = $false
                    if ($localNavbar -and ($liveBodyContent -match '(?s)<nav\s+class="navbar.*?">.*?</nav>')) {
                        Write-Host "Merging local navbar into live '$id' database content..."
                        $mergedContent = $mergedContent -replace '(?s)<nav\s+class="navbar.*?">.*?</nav>', $localNavbar
                        $mergedAny = $true
                    }
                    if ($localFooter -and ($liveBodyContent -match '(?s)<footer\s+class="footer.*?">.*?</footer>')) {
                        Write-Host "Merging local footer into live '$id' database content..."
                        $mergedContent = $mergedContent -replace '(?s)<footer\s+class="footer.*?">.*?</footer>', $localFooter
                        $mergedAny = $true
                    }

                    if ($mergedAny) {
                        $bodyContent = $mergedContent
                        Write-Host "Smart merge complete! Live content preserved except for navbar/footer."
                    } else {
                        Write-Warning "No matches for navbar/footer in live content. Pushing local version directly."
                    }
                }
            } else {
                Write-Warning "Force flag enabled. Overwriting live '$id' database content completely with local file!"
            }
            
            Write-Host "Uploading body content to Supabase..."
            $updateUri = "$supabaseUrl/rest/v1/site_content?id=eq.$id"
            
            $bodyObj = @{
                html_content = $bodyContent
            }
            $bodyJson = ConvertTo-Json -InputObject $bodyObj -Compress
            
            $maxRetries = 3
            $retryCount = 0
            $success = $false
            
            while (-not $success -and $retryCount -lt $maxRetries) {
                $retryCount++
                try {
                    $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($bodyJson)
                    $response = Invoke-WebRequest -Uri $updateUri -Headers $headers -Method Patch -Body $bodyBytes -UseBasicParsing
                    
                    if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 300) {
                        Write-Host "Successfully pushed '$id' body to Supabase!"
                        $success = $true
                    } else {
                        Write-Error "Failed to push '$id' body to Supabase. Status: $($response.StatusCode). Response: $($response.Content)"
                    }
                } catch {
                    Write-Warning "Attempt $retryCount of $maxRetries failed: $_"
                    if ($retryCount -lt $maxRetries) {
                        Write-Host "Waiting 2 seconds before retrying..."
                        Start-Sleep -Seconds 2
                    } else {
                        Write-Error "Failed to push '$id' body to Supabase after $maxRetries attempts: $_"
                        if ($_.Exception.Response) {
                            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                            $responseBody = $reader.ReadToEnd()
                            Write-Error "Response Details: $responseBody"
                        }
                    }
                }
            }
        } else {
            Write-Warning "Could not find body tags in $filePath"
        }
    } else {
        Write-Warning "File not found: $filePath"
    }
}
