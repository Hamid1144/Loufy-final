# Match base64 strings from local_index.html/supabase_index.html with cache hashes

$cache = Get-Content -Raw cloudinary_cache.json | ConvertFrom-Json
$localFile = Join-Path "backup_live" "local_index.html"
$localHtml = [System.IO.File]::ReadAllText($localFile, [System.Text.Encoding]::UTF8)
$localMatches = [regex]::Matches($localHtml, '(?s)<div[^>]*class="[^"]*portfolio-card[^"]*"[^>]*data-cat="formatting"[\s\S]*?</div>\s*</div>')
Write-Host "Found $($localMatches.Count) formatting cards in local_index.html"

$supabaseFile = Join-Path "backup_live" "supabase_index.html"
$supabaseHtml = [System.IO.File]::ReadAllText($supabaseFile, [System.Text.Encoding]::UTF8)
$supabaseMatches = [regex]::Matches($supabaseHtml, '(?s)<div[^>]*class="[^"]*portfolio-card[^"]*"[^>]*data-cat="formatting"[\s\S]*?</div>\s*</div>')
Write-Host "Found $($supabaseMatches.Count) formatting cards in supabase_index.html"

function Get-SHA256Hash($string) {
    $sha = [System.Security.Cryptography.SHA256]::Create()
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($string)
    $hashBytes = $sha.ComputeHash($bytes)
    return ($hashBytes | ForEach-Object { $_.ToString("x2") }) -join ""
}

# Let's inspect the first card from local_index.html
$localCard = $localMatches[0].Value
$localImgMatch = [regex]::Match($localCard, '<img[^>]*src="data:image/jpeg;base64,([^"]+)"')
if ($localImgMatch.Success) {
    $localB64 = $localImgMatch.Groups[1].Value
    Write-Host "Local Card 1 base64 length: $($localB64.Length)"
    
    # Try hashing it raw
    $hRaw = Get-SHA256Hash -string $localB64
    Write-Host "  Raw Hash: $hRaw"
    
    # Try hashing it trimmed/cleaned
    $hClean = Get-SHA256Hash -string ($localB64.Replace("`r", "").Replace("`n", "").Replace(" ", "").Replace("`t", "").Trim())
    Write-Host "  Clean Hash: $hClean"
    
    # Let's see if either hash is in the cache keys
    foreach ($key in $cache.psobject.Properties.Name) {
        if ($key -like "*$($hRaw.Substring(0,10))*") {
            Write-Host "  Found raw hash match in cache! Key: $key"
        }
        if ($key -like "*$($hClean.Substring(0,10))*") {
            Write-Host "  Found clean hash match in cache! Key: $key"
        }
    }
}
