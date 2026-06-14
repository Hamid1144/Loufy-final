$brainDir = 'C:\Users\razah\.gemini\antigravity\brain\85f97f71-7d8b-4ce1-ab1d-ca9cf01d8f73'
$images = @('base64_8ffa221224572bbd.webp', 'base64_c66ccad9a81c5e6f.webp', 'base64_8d2b98fcd72dccbe.webp', 'base64_31dcb4482ba62266.webp')
foreach ($img in $images) {
    $filePath = Join-Path $brainDir $img
    if (Test-Path $filePath) {
        $hashObj = Get-FileHash -Path $filePath -Algorithm MD5
        $length = (Get-Item $filePath).Length
        Write-Host "$img - Size: $length bytes, MD5: $($hashObj.Hash)"
    } else {
        Write-Host "$img not found"
    }
}
