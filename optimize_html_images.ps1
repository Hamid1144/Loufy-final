Add-Type -AssemblyName System.Drawing

function Optimize-Base64Image {
    param (
        [string]$dataUri,
        [int]$maxDim = 2560,
        [int]$quality = 90
    )

    if (-not $dataUri.StartsWith("data:image/")) {
        return $dataUri
    }

    # Extract format and base64 string
    $pattern = '^data:image/([^;]+);base64,(.+)$'
    if ($dataUri -match $pattern) {
        $mime = $Matches[1]
        $base64Data = $Matches[2]
    } else {
        return $dataUri
    }

    # If it's already tiny (e.g. less than 5KB), don't compress
    if ($base64Data.Length -lt 8000) {
        return $dataUri
    }

    try {
        $bytes = [System.Convert]::FromBase64String($base64Data)
        $ms = New-Object System.IO.MemoryStream(,$bytes)
        $originalBmp = New-Object System.Drawing.Bitmap($ms)
        
        $w = $originalBmp.Width
        $h = $originalBmp.Height
        
        # Calculate new dimensions
        if ($w -gt $maxDim -or $h -gt $maxDim) {
            $ratio = $w / $h
            if ($w -gt $h) {
                $newW = [int]$maxDim
                $newH = [int][Math]::Round($maxDim / $ratio)
            } else {
                $newH = [int]$maxDim
                $newW = [int][Math]::Round($maxDim * $ratio)
            }
        } else {
            $newW = [int]$w
            $newH = [int]$h
        }

        # Create new resized bitmap with explicit [int] types
        $newBmp = New-Object System.Drawing.Bitmap([int]$newW, [int]$newH)
        $g = [System.Drawing.Graphics]::FromImage($newBmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        
        $isPng = $dataUri.StartsWith("data:image/png")
        if (-not $isPng) {
            $g.Clear([System.Drawing.Color]::White)
        }
        $g.DrawImage($originalBmp, 0, 0, $newW, $newH)
        
        $outMs = New-Object System.IO.MemoryStream
        $mimeTypeOut = "image/jpeg"
        
        if ($isPng) {
            $pngCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/png" }
            $newBmp.Save($outMs, $pngCodec, $null)
            $mimeTypeOut = "image/png"
        } else {
            $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
            $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
            $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, $quality)
            $newBmp.Save($outMs, $jpegCodec, $encoderParams)
        }
        
        $outBytes = $outMs.ToArray()
        $newBase64 = [System.Convert]::ToBase64String($outBytes)
        
        # Cleanup
        $g.Dispose()
        $newBmp.Dispose()
        $originalBmp.Dispose()
        $ms.Dispose()
        $outMs.Dispose()
        
        $newUri = "data:$mimeTypeOut;base64,$newBase64"
        if ($newUri.Length -lt $dataUri.Length) {
            return $newUri
        } else {
            return $dataUri
        }
    } catch {
        Write-Warning "Failed to optimize image: $_"
        return $dataUri
    }
}

$files = @("index.html", "portfolio.html")
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Optimizing Base64 images in $file..."
        $html = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
        
        # Regex to find <img ... src="data:image/..." ...> tags
        $matches = [regex]::Matches($html, '(?i)<img\s+[^>]*src="(data:image/[^"]+)"[^>]*>')
        Write-Host "Found $($matches.Count) base64 images in $file."
        
        $optimizedCount = 0
        $replacedHtml = $html
        
        foreach ($match in $matches) {
            $imgTag = $match.Value
            $dataUri = $match.Groups[1].Value
            
            # Skip if already optimized
            if ($imgTag -match 'data-optimized') {
                continue
            }
            
            # Only compress large ones
            if ($dataUri.Length -gt 15000) {
                Write-Host "Compressing image of length $($dataUri.Length) chars..."
                $optUri = Optimize-Base64Image -dataUri $dataUri -maxDim 2560 -quality 90
                Write-Host "New length: $($optUri.Length) chars (Saved $([Math]::Round((1 - ($optUri.Length / $dataUri.Length)) * 100))%)"
                
                # Replace dataUri and add data-optimized="true" attribute inside the tag
                $newTag = $imgTag.Replace($dataUri, $optUri)
                if ($newTag -match '(?i)<img\s+') {
                    $newTag = $newTag -replace '(?i)<img', '<img data-optimized="true"'
                }
                
                # Replace original tag in HTML
                $replacedHtml = $replacedHtml.Replace($imgTag, $newTag)
                $optimizedCount++
            }
        }
        
        if ($optimizedCount -gt 0) {
            [System.IO.File]::WriteAllText($file, $replacedHtml, [System.Text.Encoding]::UTF8)
            Write-Host "Successfully optimized $optimizedCount images in $file!"
        } else {
            Write-Host "No large images to optimize in $file."
        }
    }
}
