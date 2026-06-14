# Replace the 4 formatting cards with the 15 original formatting cards in index.html and portfolio.html

$cardsFile = "scratch/extracted_formatting_cards.html"
$newCardsHtml = [System.IO.File]::ReadAllText($cardsFile, [System.Text.Encoding]::UTF8).Trim()

$files = @("index.html", "portfolio.html")

foreach ($file in $files) {
    if (Test-Path $file) {
        $html = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
        
        # 1. Remove the first single formatting card
        # We search for it by matching its specific image URL
        $firstCardPattern = '(?s)<div[^>]*class="[^"]*portfolio-card[^"]*"[^>]*data-cat="formatting"[^>]*>[\s\S]*?base64_8ffa221224572bbd\.webp[\s\S]*?</div>\s*</div>\s*'
        if ($html -match $firstCardPattern) {
            $html = [regex]::Replace($html, $firstCardPattern, '')
            Write-Host "Removed first formatting card from $file"
        } else {
            Write-Warning "Could not find first formatting card in $file"
        }
        
        # 2. Replace the remaining three formatting cards with the new 15 cards
        # We look for the block containing base64_c66ccad9a81c5e6f.webp, base64_8d2b98fcd72dccbe.webp, and base64_31dcb4482ba62266.webp
        $threeCardsPattern = '(?s)<div[^>]*class="[^"]*portfolio-card[^"]*"[^>]*data-cat="formatting"[^>]*>[\s\S]*?base64_c66ccad9a81c5e6f\.webp[\s\S]*?</div>\s*</div>\s*<div[^>]*class="[^"]*portfolio-card[^"]*"[^>]*data-cat="formatting"[^>]*>[\s\S]*?base64_8d2b98fcd72dccbe\.webp[\s\S]*?</div>\s*</div>\s*<div[^>]*class="[^"]*portfolio-card[^"]*"[^>]*data-cat="formatting"[^>]*>[\s\S]*?base64_31dcb4482ba62266\.webp[\s\S]*?</div>\s*</div>'
        
        if ($html -match $threeCardsPattern) {
            $html = [regex]::Replace($html, $threeCardsPattern, $newCardsHtml)
            Write-Host "Successfully replaced formatting cards block in $file"
        } else {
            Write-Warning "Could not find formatting cards block in $file"
        }
        
        # Write changes back
        [System.IO.File]::WriteAllText($file, $html, [System.Text.Encoding]::UTF8)
    } else {
        Write-Error "$file does not exist!"
    }
}
