$indexHtml = Get-Content -Path "index.html" -Raw

$urlMatch = $indexHtml -match 'supabaseUrl\s*=\s*[''"]([^''"]+)[''"]'
if ($urlMatch) {
    $supabaseUrl = $matches[1]
}

$keyMatch = $indexHtml -match 'supabaseAnonKey\s*=\s*[''"]([^''"]+)[''"]'
if ($keyMatch) {
    $supabaseKey = $matches[1]
}

if (-not $supabaseUrl -or -not $supabaseKey) {
    Write-Host "Supabase credentials not found in index.html"
    exit 1
}

$headers = @{
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
    "Content-Type" = "application/json"
    "Prefer" = "return=minimal"
}

function Push-Page($slug, $filename) {
    Write-Host "Pushing $slug from $filename..."
    $html = Get-Content -Path $filename -Raw
    
    # Extract body content
    if ($html -match '(?si)<body[^>]*>(.*?)</body>') {
        $bodyContent = $matches[1]
    } else {
        $bodyContent = $html
    }
    
    # Remove script injections and admin panels if any
    $bodyContent = $bodyContent -replace '(?si)<div id="super-admin-panel".*?</div>\s*</div>', ''
    $bodyContent = $bodyContent -replace '(?si)<div id="admin-crop-modal".*?</div>\s*</div>', ''
    $bodyContent = $bodyContent -replace '(?si)<div id="admin-subcat-modal".*?</div>\s*</div>', ''
    $bodyContent = $bodyContent -replace '(?si)<div id="custom-toast".*?</div>', ''
    $bodyContent = $bodyContent -replace '(?si)<script src="admin\.js".*?</script>', ''
    
    $payload = @{
        "html_content" = $bodyContent
    } | ConvertTo-Json -Depth 10
    
    $url = "$supabaseUrl/rest/v1/site_content?id=eq.$slug"
    
    try {
        Invoke-RestMethod -Uri $url -Method Patch -Headers $headers -Body $payload
        Write-Host "Successfully pushed $slug to Supabase!"
    } catch {
        Write-Host "Failed to push $slug : $_"
    }
}

Push-Page "index" "index.html"
Push-Page "portfolio" "portfolio.html"
