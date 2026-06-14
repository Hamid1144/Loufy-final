# analyze_all_images.ps1
$ProgressPreference = 'SilentlyContinue'

$files = @("index.html", "portfolio.html")

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "=== ANALYZING $file ===" -ForegroundColor Green
        $html = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
        
        $imgMatches = [regex]::Matches($html, '(?i)<img\s+[^>]+>')
        Write-Host "Found $($imgMatches.Count) img tags"
        
        $count = 0
        foreach ($m in $imgMatches) {
            $count++
            $tag = $m.Value
            
            $src = "Unknown"
            $srcMatch = [regex]::Match($tag, '(?i)\bsrc="([^"]+)"')
            if ($srcMatch.Success) {
                $src = $srcMatch.Groups[1].Value
            }
            
            $isCloudinary = $src -like "*cloudinary*"
            $hasAuto = $src -like "*f_auto,q_auto*"
            
            # Find title
            $pos = $m.Index
            $context = $html.Substring($pos, [Math]::Min(1500, $html.Length - $pos))
            $title = "Unknown"
            if ($context -match '(?i)<h3[^>]*>([^<]+)</h3>') {
                $title = $Matches[1].Trim()
            }
            
            Write-Host "  $count. Title: $title"
            Write-Host "     Src: $src"
            
            if ($isCloudinary) {
                if ($hasAuto) {
                    Write-Host "     Cloudinary: YES | f_auto,q_auto: YES" -ForegroundColor Gray
                } else {
                    Write-Host "     Cloudinary: YES | [WARNING] f_auto,q_auto: NO" -ForegroundColor Yellow
                }
            } else {
                Write-Host "     [WARNING] Non-Cloudinary image!" -ForegroundColor Red
            }
        }
    }
}
