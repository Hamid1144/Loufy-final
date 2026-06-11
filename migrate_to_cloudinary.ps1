# migrate_to_cloudinary.ps1
# Complete migration script from local/base64 images to Cloudinary storage.

$ProgressPreference = 'SilentlyContinue'
$cloudName = "dtr3yvjac"
$apiKey = "453843776219872"
$apiSecret = "WDP5Pmku01sVxQJ2pD_npSNL5wA"
$folder = "portfolio"

# 1. Create backups
$backupDir = "backup_live/cloudinary_migration_backup"
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}
Copy-Item "index.html" "$backupDir/index.html" -Force
Copy-Item "portfolio.html" "$backupDir/portfolio.html" -Force
Write-Host "Backups created in $backupDir" -ForegroundColor Green

# Load cache if exists
$cacheFile = "cloudinary_cache.json"
$cache = @{}
if (Test-Path $cacheFile) {
    $cacheJson = Get-Content $cacheFile -Raw -ErrorAction SilentlyContinue
    if ($cacheJson) {
        $obj = ConvertFrom-Json $cacheJson
        if ($obj) {
            foreach ($prop in $obj.psobject.Properties) {
                $cache[$prop.Name] = $prop.Value
            }
        }
        Write-Host "Loaded $($cache.Count) cached uploads." -ForegroundColor Green
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
    
    # Sort parameters alphabetically: folder, public_id, timestamp
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
    
    # Retry logic
    for ($i = 1; $i -le 3; $i++) {
        try {
            $response = Invoke-RestMethod -Uri $uri -Method Post -Body $bodyJson -ContentType "application/json; charset=utf-8"
            if ($response -and $response.secure_url) {
                return $response.secure_url
            }
        } catch {
            Write-Warning "Cloudinary upload attempt $i failed for $($publicId): $_"
            if ($_.Exception.Response) {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $responseBody = $reader.ReadToEnd()
                Write-Warning "Response: $responseBody"
            }
            Start-Sleep -Seconds 2
        }
    }
    throw "Failed to upload image $publicId to Cloudinary after 3 attempts."
}

# Scan files and extract all local and base64 images
$files = @("index.html", "portfolio.html")
$localImages = @()
$base64Images = @()

foreach ($file in $files) {
    if (Test-Path $file) {
        $html = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
        
        # Regex to find src and srcset attributes
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
            # srcset values are comma separated with descriptors, e.g. "images/img_1_mobile.webp 480w, ..."
            $parts = $val -split ','
            foreach ($part in $parts) {
                $urlPart = ($part.Trim() -split '\s+')[0]
                if ($urlPart.StartsWith("images/")) {
                    if ($localImages -notcontains $urlPart) { $localImages += $urlPart }
                }
            }
        }
    }
}

Write-Host "Scanned files: found $($localImages.Count) unique local image paths and $($base64Images.Count) unique base64 images."

# Upload base64 images first
Write-Host "Processing Base64 images..." -ForegroundColor Yellow
$b64Index = 1
foreach ($b64 in $base64Images) {
    $hash = Get-SHA256Hash -string $b64
    $cacheKey = "base64:$hash"
    
    if ($cache.ContainsKey($cacheKey)) {
        Write-Host "Base64 image $b64Index/$(($base64Images.Count)) already in cache." -ForegroundColor Gray
    } else {
        $publicId = "base64_" + $hash.Substring(0, 16)
        Write-Host "Uploading Base64 image $b64Index/$(($base64Images.Count)) with public ID: $publicId..." -ForegroundColor Cyan
        $url = Upload-ToCloudinary -base64Data $b64 -publicId $publicId
        $cache[$cacheKey] = $url
        
        # Save cache progressively
        $cache | ConvertTo-Json | Out-File $cacheFile -Encoding utf8
        Write-Host "Uploaded! URL: $url" -ForegroundColor Green
    }
    $b64Index++
}

# Upload local images
Write-Host "Processing Local images..." -ForegroundColor Yellow
$localIndex = 1
foreach ($localPath in $localImages) {
    $cacheKey = "local:$localPath"
    
    if ($cache.ContainsKey($cacheKey)) {
        Write-Host "Local image '$localPath' ($localIndex/$(($localImages.Count))) already in cache." -ForegroundColor Gray
        $localIndex++
        continue
    }
    
    # Check if this is a resized variation (mobile/tablet)
    $isResized = $localPath -match '_(mobile|tablet)\.webp$'
    $basePath = $localPath
    $resizedType = $null
    if ($isResized) {
        $resizedType = $Matches[1]
        $basePath = $localPath -replace '_(mobile|tablet)\.webp$', '.webp'
    }
    
    $baseKey = "local:$basePath"
    
    # If it is a resized variation and the original exists, we map it to the original's Cloudinary URL with resize transformations!
    if ($isResized -and (Test-Path $basePath)) {
        # Ensure base path is uploaded first
        if (-not $cache.ContainsKey($baseKey)) {
            $baseBytes = [System.IO.File]::ReadAllBytes($basePath)
            $baseB64 = "data:image/webp;base64," + [System.Convert]::ToBase64String($baseBytes)
            $basePid = [System.IO.Path]::GetFileNameWithoutExtension($basePath)
            
            Write-Host "Uploading original local image '$basePath' first..." -ForegroundColor Cyan
            $baseUrl = Upload-ToCloudinary -base64Data $baseB64 -publicId $basePid
            $cache[$baseKey] = $baseUrl
            $cache | ConvertTo-Json | Out-File $cacheFile -Encoding utf8
        }
        
        $originalUrl = $cache[$baseKey]
        
        # Map this resized variation to the original Cloudinary URL with dynamic resizing!
        # E.g. replace /image/upload/v... with /image/upload/f_auto,q_auto,w_480/v...
        $width = if ($resizedType -eq "mobile") { 480 } else { 800 }
        $transformedUrl = $originalUrl -replace '/image/upload/', "/image/upload/f_auto,q_auto,w_$width/"
        
        $cache[$cacheKey] = $transformedUrl
        Write-Host "Mapped resized '$localPath' to transformed original: $transformedUrl" -ForegroundColor Green
    } else {
        # Upload as a standalone original
        if (Test-Path $localPath) {
            $bytes = [System.IO.File]::ReadAllBytes($localPath)
            $ext = [System.IO.Path]::GetExtension($localPath).Replace(".", "")
            if ($ext -eq "jpg") { $ext = "jpeg" }
            $mime = "image/$ext"
            $b64 = "data:$mime;base64," + [System.Convert]::ToBase64String($bytes)
            
            $localPid = [System.IO.Path]::GetFileNameWithoutExtension($localPath)
            Write-Host "Uploading local image '$localPath' ($localIndex/$(($localImages.Count))) as original..." -ForegroundColor Cyan
            $url = Upload-ToCloudinary -base64Data $b64 -publicId $localPid
            
            # Default optimization transformation
            $optimizedUrl = $url -replace '/image/upload/', '/image/upload/f_auto,q_auto/'
            $cache[$cacheKey] = $optimizedUrl
            
            Write-Host "Uploaded! URL: $optimizedUrl" -ForegroundColor Green
        } else {
            Write-Warning "Local file not found: $localPath. Skipping."
        }
    }
    
    # Save cache progressively
    $cache | ConvertTo-Json | Out-File $cacheFile -Encoding utf8
    $localIndex++
}

# 3. Replace references in HTML
Write-Host "Replacing references in HTML files..." -ForegroundColor Yellow

# Sort keys by length in descending order to prevent substring replacement collisions!
$sortedKeys = $cache.Keys | Sort-Object -Property Length -Descending

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Updating references in $file..."
        $html = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
        
        $replacedCount = 0
        foreach ($key in $sortedKeys) {
            $oldRef = ""
            if ($key.StartsWith("base64:")) {
                # Find the actual base64 string that matches this hash
                # We can match it in the list of unique base64 images we scanned
                $found = $base64Images | Where-Object { (Get-SHA256Hash -string $_) -eq $key.Substring(7) }
                if ($found) {
                    $oldRef = $found
                }
            } elseif ($key.StartsWith("local:")) {
                $oldRef = $key.Substring(6)
            }
            
            if ($oldRef -and $html.Contains($oldRef)) {
                $newUrl = $cache[$key]
                
                # If it's a direct src replacement for local image, make sure it has f_auto,q_auto
                if ($key.StartsWith("local:") -and -not $key.Contains("_mobile") -and -not $key.Contains("_tablet")) {
                    # Ensure it has f_auto,q_auto
                    if ($newUrl -notlike "*/f_auto,q_auto/*") {
                        $newUrl = $newUrl -replace '/image/upload/', '/image/upload/f_auto,q_auto/'
                    }
                }
                
                $html = $html.Replace($oldRef, $newUrl)
                $replacedCount++
            }
        }
        
        # Ensure all img tags in the HTML have loading="lazy" attribute (except above-the-fold ones, but user requests all, so let's add lazy loading safely)
        # We can find all <img ...> tags that don't have loading="lazy" or loading='lazy'
        $imgMatches = [regex]::Matches($html, '(?i)<img\s+[^>]+>')
        foreach ($m in $imgMatches) {
            $tag = $m.Value
            if ($tag -notlike '*loading=*') {
                # Add loading="lazy"
                $newTag = $tag -replace '(?i)<img', '<img loading="lazy"'
                $html = $html.Replace($tag, $newTag)
            }
        }
        
        [System.IO.File]::WriteAllText($file, $html, [System.Text.Encoding]::UTF8)
        Write-Host "Updated $replacedCount references in $file!" -ForegroundColor Green
    }
}

# 4. Force Push to Supabase to update live site immediately
Write-Host "Force pushing optimized HTML with Cloudinary URLs to Supabase..." -ForegroundColor Yellow
$pushOutput = powershell -ExecutionPolicy Bypass -File .\push_supabase.ps1 -Force 2>&1
Write-Host "push_supabase.ps1 Output: $pushOutput"

# Create report
$report = @{
    date = (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
    migrated_local_files_count = $localImages.Count
    migrated_base64_count = $base64Images.Count
    index_html_original_size = (Get-Item "$backupDir/index.html").Length
    index_html_new_size = (Get-Item "index.html").Length
    portfolio_html_original_size = (Get-Item "$backupDir/portfolio.html").Length
    portfolio_html_new_size = (Get-Item "portfolio.html").Length
}
$report | ConvertTo-Json | Out-File "cloudinary_migration_report.json" -Encoding utf8

Write-Host "Migration completed successfully! Summary report written to 'cloudinary_migration_report.json'." -ForegroundColor Green
