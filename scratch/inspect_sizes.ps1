# Inspect sizes of original decoded cards and cache images

$dir = "C:\Users\razah\.gemini\antigravity\brain\85f97f71-7d8b-4ce1-ab1d-ca9cf01d8f73"

Write-Host "--- Decoded JPEG Cards ---"
1..4 | ForEach-Object {
    $file = Join-Path $dir "original_card_$_.jpg"
    if (Test-Path $file) {
        $bytes = [System.IO.File]::ReadAllBytes($file)
        Write-Host "original_card_$_.jpg : Size $($bytes.Length) bytes"
    } else {
        Write-Host "original_card_$_.jpg : NOT FOUND"
    }
}

Write-Host "`n--- Cached WebP Images ---"
$webpFiles = Get-ChildItem -Path $dir -Filter "base64_*.webp"
foreach ($wf in $webpFiles) {
    Write-Host "$($wf.Name) : Size $($wf.Length) bytes"
}
