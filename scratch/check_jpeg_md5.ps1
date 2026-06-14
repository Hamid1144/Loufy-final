$dir = 'C:\Users\razah\.gemini\antigravity\brain\85f97f71-7d8b-4ce1-ab1d-ca9cf01d8f73'
1..15 | ForEach-Object {
    $filePath = Join-Path $dir "original_card_$_.jpg"
    if (Test-Path $filePath) {
        $hashObj = Get-FileHash -Path $filePath -Algorithm MD5
        $length = (Get-Item $filePath).Length
        Write-Host "original_card_$_.jpg - Size: $length bytes, MD5: $($hashObj.Hash)"
    } else {
        Write-Host "original_card_$_.jpg not found"
    }
}
