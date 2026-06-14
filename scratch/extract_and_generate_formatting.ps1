# Extract original 15 formatting cards from local_index.html and map images to Cloudinary WebP URLs

$localFile = Join-Path "backup_live" "local_index.html"
$html = [System.IO.File]::ReadAllText($localFile, [System.Text.Encoding]::UTF8)

# Regex to find formatting cards
$matches = [regex]::Matches($html, '(?s)<div[^>]*class="[^"]*portfolio-card[^"]*"[^>]*data-cat="formatting"[\s\S]*?</div>\s*</div>')
Write-Host "Found $($matches.Count) formatting cards in local_index.html"

# Image mappings based on decoded JPEG sizes
# original_card_1 (414184 bytes) -> base64_31dcb4482ba62266.webp
# original_card_2 (489391 bytes) -> base64_c66ccad9a81c5e6f.webp
# original_card_3 (520757 bytes) -> base64_8d2b98fcd72dccbe.webp
# original_card_4 (406135 bytes) -> base64_8ffa221224572bbd.webp

$imgMap = @{
    414184 = "https://res.cloudinary.com/dtr3yvjac/image/upload/v1781205988/portfolio/base64_31dcb4482ba62266.webp"
    489391 = "https://res.cloudinary.com/dtr3yvjac/image/upload/v1781205985/portfolio/base64_c66ccad9a81c5e6f.webp"
    520757 = "https://res.cloudinary.com/dtr3yvjac/image/upload/v1781205987/portfolio/base64_8d2b98fcd72dccbe.webp"
    406135 = "https://res.cloudinary.com/dtr3yvjac/image/upload/v1781205983/portfolio/base64_8ffa221224572bbd.webp"
}

$htmlOutput = ""
$count = 1
foreach ($m in $matches) {
    $cardHtml = $m.Value
    
    # Extract image src pattern
    $imgMatch = [regex]::Match($cardHtml, '<img[^>]*src="data:image/jpeg;base64,([^"]+)"')
    if ($imgMatch.Success) {
        $base64 = $imgMatch.Groups[1].Value
        $bytes = [System.Convert]::FromBase64String($base64)
        $size = $bytes.Length
        
        $cloudinaryUrl = $imgMap[$size]
        if ($null -eq $cloudinaryUrl) {
            # Let's search for nearest size just in case of tiny encoding differences
            $found = $false
            foreach ($key in $imgMap.Keys) {
                if ([Math]::Abs($key - $size) -lt 100) {
                    $cloudinaryUrl = $imgMap[$key]
            Write-Host "Card $count - size $size matched with key $key (Cloundinary URL: $cloudinaryUrl)"
                    $found = $true
                    break
                }
            }
            if (-not $found) {
                Write-Error "Could not map card $count with size $size bytes"
                continue
            }
        } else {
            Write-Host "Card $count - size $size mapped exactly."
        }
        
        # Replace base64 src with Cloudinary URL in the card HTML
        # Also clean up the img tag attributes to look like the optimized version
        $newCardHtml = $cardHtml -replace '<img[^>]*src="data:image/jpeg;base64,[^"]+"[^>]*>', "<img loading=`"lazy`" data-optimized=`"true`" src=`"$cloudinaryUrl`" alt=`"Formatting`">"
        
        # Format alignment/spacing cleanly
        $htmlOutput += $newCardHtml + "`n`n"
    } else {
        Write-Warning "Card $count has no base64 image"
        $htmlOutput += $cardHtml + "`n`n"
    }
    $count++
}

Set-Content -Path "scratch/extracted_formatting_cards.html" -Value $htmlOutput
Write-Host "Successfully generated and saved cards to scratch/extracted_formatting_cards.html"
