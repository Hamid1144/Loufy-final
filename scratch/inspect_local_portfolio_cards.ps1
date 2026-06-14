# Inspect formatting cards in backup_live/local_portfolio.html

$filePath = Join-Path "backup_live" "local_portfolio.html"
if (-not (Test-Path $filePath)) {
    Write-Error "local_portfolio.html does not exist"
    exit 1
}

$html = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
$matches = [regex]::Matches($html, '(?s)<div[^>]*class="[^"]*portfolio-card[^"]*"[^>]*data-cat="formatting"[\s\S]*?</div>\s*</div>')
Write-Host "Found $($matches.Count) formatting cards in local_portfolio.html"

function Get-SHA256Hash($string) {
    $sha = [System.Security.Cryptography.SHA256]::Create()
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($string)
    $hashBytes = $sha.ComputeHash($bytes)
    return ($hashBytes | ForEach-Object { $_.ToString("x2") }) -join ""
}

$count = 1
foreach ($m in $matches) {
    $cardHtml = $m.Value
    $imgMatch = [regex]::Match($cardHtml, '<img[^>]*src="data:image/jpeg;base64,([^"]+)"')
    if ($imgMatch.Success) {
        $b64 = $imgMatch.Groups[1].Value
        $bytes = [System.Convert]::FromBase64String($b64)
        Write-Host "Card $count - Size: $($bytes.Length) bytes"
    } else {
        Write-Host "Card $count has no base64 image."
    }
    $count++
}
