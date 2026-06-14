# Map original formatting cards from backup to Cloudinary URLs using cache

$cachePath = "cloudinary_cache.json"
$cache = Get-Content -Raw $cachePath | ConvertFrom-Json

function Get-SHA256Hash($string) {
    $sha = [System.Security.Cryptography.SHA256]::Create()
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($string)
    $hashBytes = $sha.ComputeHash($bytes)
    return ($hashBytes | ForEach-Object { $_.ToString("x2") }) -join ""
}

$filePath = Join-Path "backup_live" "supabase_index.html"
if (-not (Test-Path $filePath)) {
    Write-Error "supabase_index.html does not exist"
    exit 1
}

$html = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
$matches = [regex]::Matches($html, '(?s)<div[^>]*class="[^"]*portfolio-card[^"]*"[^>]*data-cat="formatting"[\s\S]*?</div>\s*</div>')
Write-Host "Found $($matches.Count) formatting cards in supabase_index.html"

$mappedCards = @()
$count = 1
foreach ($m in $matches) {
    $cardHtml = $m.Value
    
    $titleMatch = [regex]::Match($cardHtml, '<h3[^>]*>(.*?)</h3>')
    $title = if ($titleMatch.Success) { $titleMatch.Groups[1].Value.Trim() } else { "Formatting" }
    
    $tagsMatch = [regex]::Matches($cardHtml, '<span[^>]*>(.*?)</span>')
    $tags = @()
    foreach ($t in $tagsMatch) {
        $tags += $t.Groups[1].Value.Trim()
    }
    $tagStr = $tags -join ", "
    
    $imgMatch = [regex]::Match($cardHtml, '<img[^>]*src="data:image/jpeg;base64,([^"]+)"')
    if ($imgMatch.Success) {
        $b64 = $imgMatch.Groups[1].Value
        $hash = Get-SHA256Hash -string $b64
        $cacheKey = "base64:$hash"
        
        $cloudinaryUrl = $cache.$cacheKey
        if ($null -eq $cloudinaryUrl) {
            Write-Warning "No Cloudinary URL found in cache for card $count (hash: $hash)"
            # Let's see if we can look up by shorter hash prefix or something similar
            # Let's search cache keys
            foreach ($k in $cache.psobject.Properties) {
                if ($k.Name -like "*$($hash.Substring(0,10))*") {
                    $cloudinaryUrl = $k.Value
                    Write-Host "Matched by prefix: $($k.Name) -> $cloudinaryUrl"
                }
            }
        }
        
        if ($null -ne $cloudinaryUrl) {
            Write-Host "Card $count`:"
            Write-Host "  Title: $title"
            Write-Host "  Tags: $tagStr"
            Write-Host "  Cloudinary URL: $cloudinaryUrl"
            
            $mappedCards += [PSCustomObject]@{
                Index = $count
                Title = $title
                Tags = $tags
                Url = $cloudinaryUrl
            }
        } else {
            Write-Error "Could not find Cloudinary URL for card $count"
        }
    } else {
        Write-Warning "Card $count has no base64 image!"
    }
    $count++
}

# Now let's generate the HTML block for these cards
$htmlOutput = ""
foreach ($card in $mappedCards) {
    $tagSpans = ""
    foreach ($t in $card.Tags) {
        $tagSpans += "<span data-admin-text=`"true`">$t</span>"
    }
    $htmlOutput += @"
<div class="portfolio-card reveal" data-cat="formatting" data-layout="full-width" style="">
                    <div class="portfolio-thumb">
                        <img loading="lazy" data-optimized="true" src="$($card.Url)" alt="$($card.Title)">
                    </div>
                    <div class="portfolio-info">
                        <div class="tags">$tagSpans</div>
                        <h3 data-admin-text="true">$($card.Title)</h3>
                    </div>
                </div>

"@
}

Set-Content -Path "scratch/mapped_formatting_cards.html" -Value $htmlOutput
Write-Host "Generated HTML output saved to scratch/mapped_formatting_cards.html"
