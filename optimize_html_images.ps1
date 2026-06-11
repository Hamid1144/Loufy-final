# optimize_html_images.ps1
# Shorthand Cloudinary optimizer run by the background sync daemon.
# Detects base64 or new local images, uploads them to Cloudinary, and updates HTML references.

$ProgressPreference = 'SilentlyContinue'
$cloudName = "dtr3yvjac"
$apiKey = "453843776219872"
$apiSecret = "WDP5Pmku01sVxQJ2pD_npSNL5wA"
$folder = "portfolio"

$cacheFile = "cloudinary_cache.json"
$cache = @{}

# Load cache if exists
if (Test-Path $cacheFile) {
    $cacheJson = Get-Content $cacheFile -Raw -ErrorAction SilentlyContinue
    if ($cacheJson) {
        $obj = ConvertFrom-Json $cacheJson
        if ($obj) {
            foreach ($prop in $obj.psobject.Properties) {
                $cache[$prop.Name] = $prop.Value
            }
        }
    }
}

function Get-SHA256Hash($string) {
    $sha = [System.Security.Cryptography.SHA256]::Create()
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($string)
    $hashBytes = $sha.ComputeHash($bytes)
    return ($hashBytes | ForEach-Object { $_.ToString("x2") }) -join ""
}

function Upload-ToCloudinary($base64Data, $publicId) {
    $timestamp = [int][datetimeoffset]::Now.ToUnixTimeSeconds()
    $stringToSign = "folder=$folder&public_id=$publicId&timestamp=$timestamp$apiSecret"
    $sha1 = [System.Security.Cryptography.SHA1]::Create()
    $stringBytes = [System.Text.Encoding]::UTF8.GetBytes($stringToSign)
    $hashBytes = $sha1.ComputeHash($stringBytes)
    $signature = ($hashBytes | ForEach-Object { $_.ToString("x2") }) -join ""
    
    $uri = "https://api.cloudinary.com/v1_1/$cloudName/image/upload"
    $body = @{
        api_key   = $apiKey
        timestamp = $timestamp
        folder    = $folder
        public_id = $publicId
        signature = $signature
        file      = $base64Data
    }
    $bodyJson = ConvertTo-Json -InputObject $body -Compress
    
    for ($i = 1; $i -le 3; $i++) {
        try {
            $response = Invoke-RestMethod -Uri $uri -Method Post -Body $bodyJson -ContentType "application/json; charset=utf-8"
            if ($response -and $response.secure_url) {
                return $response.secure_url
            }
        } catch {
            Write-Warning "Cloudinary upload attempt $i failed for $($publicId): $_"
            Start-Sleep -Seconds 2
        }
    }
    throw "Failed to upload $publicId to Cloudinary."
}

$files = @("index.html", "portfolio.html")
$hasChanges = $false

foreach ($file in $files) {
    if (Test-Path $file) {
        $html = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
        
        $localImages = @()
        $base64Images = @()
        
        $srcMatches = [regex]::Matches($html, '(?i)\bsrc="([^"]+)"')
        foreach ($m in $srcMatches) {
            $val = $m.Groups[1].Value
            if ($val.StartsWith("data:")) {
                if ($base64Images -notcontains $val) { $base64Images += $val }
            } elseif ($val.StartsWith("images/")) {
                if ($localImages -notcontains $val) { $localImages += $val }
            }
        }
        
        $srcsetMatches = [regex]::Matches($html, '(?i)\bsrcset="([^"]+)"')
        foreach ($m in $srcsetMatches) {
            $val = $m.Groups[1].Value
            $parts = $val -split ','
            foreach ($part in $parts) {
                $urlPart = ($part.Trim() -split '\s+')[0]
                if ($urlPart.StartsWith("images/")) {
                    if ($localImages -notcontains $urlPart) { $localImages += $urlPart }
                }
            }
        }
        
        if ($base64Images.Count -eq 0 -and $localImages.Count -eq 0) {
            continue
        }
        
        Write-Host "Sync Daemon Optimizer: Found $($base64Images.Count) base64 and $($localImages.Count) local images in $file. Optimizing..." -ForegroundColor Cyan
        
        # Upload base64
        foreach ($b64 in $base64Images) {
            $hash = Get-SHA256Hash -string $b64
            $cacheKey = "base64:$hash"
            if (-not $cache.ContainsKey($cacheKey)) {
                $pid = "base64_" + $hash.Substring(0, 16)
                $url = Upload-ToCloudinary -base64Data $b64 -publicId $pid
                $cache[$cacheKey] = $url
                $hasChanges = $true
            }
        }
        
        # Upload local
        foreach ($localPath in $localImages) {
            $cacheKey = "local:$localPath"
            if (-not $cache.ContainsKey($cacheKey)) {
                $isResized = $localPath -match '_(mobile|tablet)\.webp$'
                $basePath = $localPath
                $resizedType = $null
                if ($isResized) {
                    $resizedType = $Matches[1]
                    $basePath = $localPath -replace '_(mobile|tablet)\.webp$', '.webp'
                }
                $baseKey = "local:$basePath"
                
                if ($isResized -and (Test-Path $basePath)) {
                    if (-not $cache.ContainsKey($baseKey)) {
                        $baseBytes = [System.IO.File]::ReadAllBytes($basePath)
                        $baseB64 = "data:image/webp;base64," + [System.Convert]::ToBase64String($baseBytes)
                        $basePid = [System.IO.Path]::GetFileNameWithoutExtension($basePath)
                        $baseUrl = Upload-ToCloudinary -base64Data $baseB64 -publicId $basePid
                        $cache[$baseKey] = $baseUrl
                    }
                    $width = if ($resizedType -eq "mobile") { 480 } else { 800 }
                    $cache[$cacheKey] = $cache[$baseKey] -replace '/image/upload/', "/image/upload/f_auto,q_auto,w_$width/"
                } else {
                    if (Test-Path $localPath) {
                        $bytes = [System.IO.File]::ReadAllBytes($localPath)
                        $ext = [System.IO.Path]::GetExtension($localPath).Replace(".", "")
                        if ($ext -eq "jpg") { $ext = "jpeg" }
                        $mime = "image/$ext"
                        $b64 = "data:$mime;base64," + [System.Convert]::ToBase64String($bytes)
                        $pid = [System.IO.Path]::GetFileNameWithoutExtension($localPath)
                        $url = Upload-ToCloudinary -base64Data $b64 -publicId $pid
                        $cache[$cacheKey] = $url -replace '/image/upload/', '/image/upload/f_auto,q_auto/'
                    }
                }
                $hasChanges = $true
            }
        }
        
        # Save cache
        $cache | ConvertTo-Json | Out-File $cacheFile -Encoding utf8
        
        # Replace refs
        $sortedKeys = $cache.Keys | Sort-Object -Property Length -Descending
        foreach ($key in $sortedKeys) {
            $oldRef = ""
            if ($key.StartsWith("base64:")) {
                $found = $base64Images | Where-Object { (Get-SHA256Hash -string $_) -eq $key.Substring(7) }
                if ($found) { $oldRef = $found }
            } elseif ($key.StartsWith("local:")) {
                $oldRef = $key.Substring(6)
            }
            if ($oldRef -and $html.Contains($oldRef)) {
                $newUrl = $cache[$key]
                if ($key.StartsWith("local:") -and -not $key.Contains("_mobile") -and -not $key.Contains("_tablet")) {
                    if ($newUrl -notlike "*/f_auto,q_auto/*") {
                        $newUrl = $newUrl -replace '/image/upload/', '/image/upload/f_auto,q_auto/'
                    }
                }
                $html = $html.Replace($oldRef, $newUrl)
            }
        }
        
        # Add loading="lazy" safely
        $imgMatches = [regex]::Matches($html, '(?i)<img\s+[^>]+>')
        foreach ($m in $imgMatches) {
            $tag = $m.Value
            if ($tag -notlike '*loading=*') {
                $newTag = $tag -replace '(?i)<img', '<img loading="lazy"'
                $html = $html.Replace($tag, $newTag)
            }
        }
        
        [System.IO.File]::WriteAllText($file, $html, [System.Text.Encoding]::UTF8)
        Write-Host "Sync Daemon Optimizer: Successfully optimized $file and saved changes!" -ForegroundColor Green
    }
}
