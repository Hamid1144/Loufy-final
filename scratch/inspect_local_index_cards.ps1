# Map formatting cards in backup_live/local_index.html to Cloudinary URLs using cache

$cache = Get-Content -Raw cloudinary_cache.json | ConvertFrom-Json
$filePath = Join-Path "backup_live" "local_index.html"
$html = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
$matches = [regex]::Matches($html, '(?s)<div[^>]*class="[^"]*portfolio-card[^"]*"[^>]*data-cat="formatting"[\s\S]*?</div>\s*</div>')
Write-Host "Found $($matches.Count) formatting cards in local_index.html"

function Get-SHA256Hash($string) {
    $sha = [System.Security.Cryptography.SHA256]::Create()
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($string)
    $hashBytes = $sha.ComputeHash($bytes)
    return ($hashBytes | ForEach-Object { $_.ToString("x2") }) -join ""
}

$count = 1
foreach ($m in $matches) {
    $cardHtml = $m.Value
    
    $titleMatch = [regex]::Match($cardHtml, '<h3[^>]*>(.*?)</h3>')
    $title = if ($titleMatch.Success) { $titleMatch.Groups[1].Value.Trim() } else { "Formatting" }
    
    $imgMatch = [regex]::Match($cardHtml, '<img[^>]*src="data:image/jpeg;base64,([^"]+)"')
    if ($imgMatch.Success) {
        $b64 = $imgMatch.Groups[1].Value
        $hash = Get-SHA256Hash -string $b64
        $cacheKey = "base64:$hash"
        $cloudinaryUrl = $cache.$cacheKey
        
        Write-Host "Card $count : Title: $title"
        Write-Host "  Hash: $hash"
        if ($null -ne $cloudinaryUrl) {
            Write-Host "  Cloudinary URL: $cloudinaryUrl"
        } else {
            Write-Host "  Not in cache!"
            # Let's search by prefix of hash
            $prefix = $hash.Substring(0, 16)
            $foundKey = $null
            foreach ($key in $cache.psobject.Properties.Name) {
                if ($key -like "*$prefix*") {
                    $foundKey = $key
                    break
                }
            }
            if ($null -ne $foundKey) {
                Write-Host "  Found prefix match: $foundKey -> $($cache.$foundKey)"
            }
        }
    } else {
        Write-Host "Card $count has no base64 image!"
    }
    $count++
}
