$cache = Get-Content -Raw cloudinary_cache.json | ConvertFrom-Json
$filePath = Join-Path 'backup_live' 'supabase_index.html'
$html = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
$matches = [regex]::Matches($html, '(?s)<div[^>]*class="[^"]*portfolio-card[^"]*"[^>]*data-cat="formatting"[\s\S]*?</div>\s*</div>')
Write-Host "Found $($matches.Count) formatting cards"
$cardHtml = $matches[0].Value
$imgMatch = [regex]::Match($cardHtml, '<img[^>]*src="data:image/jpeg;base64,([^"]+)"')
if ($imgMatch.Success) {
    # Let's clean the base64 string
    $b64 = $imgMatch.Groups[1].Value.Replace("`r", "").Replace("`n", "").Replace(" ", "").Replace("`t", "").Trim()
    $sha = [System.Security.Cryptography.SHA256]::Create()
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($b64)
    $hashBytes = $sha.ComputeHash($bytes)
    $hash = ($hashBytes | ForEach-Object { $_.ToString('x2') }) -join ''
    Write-Host "Cleaned Hash: $hash"
    $key = "base64:$hash"
    $val = $cache.$key
    Write-Host "Cache lookup for $key : $val"
} else {
    Write-Host "No image match"
}
