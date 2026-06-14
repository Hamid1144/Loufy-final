# Replace formatting cards with only the 4 unique ones in index.html and portfolio.html

$cardsFile = "scratch/extracted_formatting_cards.html"
$allCardsHtml = [System.IO.File]::ReadAllText($cardsFile, [System.Text.Encoding]::UTF8)

# Parse out only the first 4 cards
# We can split by "<div class="portfolio-card reveal"" and keep the first 4 blocks
$blocks = $allCardsHtml -split '(?=<div class="portfolio-card reveal")'
$uniqueCardsHtml = ($blocks[1..4] -join "`n`n").Trim()

$files = @("index.html", "portfolio.html")

foreach ($file in $files) {
    if (Test-Path $file) {
        $html = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
        
        # Match from the first formatting card up to the a-plus-content card
        $pattern = '(?s)<div class="portfolio-card reveal" data-cat="formatting"[\s\S]*?(?=<div class="portfolio-card reveal" data-cat="a-plus-content")'
        
        if ($html -match $pattern) {
            $html = [regex]::Replace($html, $pattern, $uniqueCardsHtml + "`n`n")
            [System.IO.File]::WriteAllText($file, $html, [System.Text.Encoding]::UTF8)
            Write-Host "Successfully cleaned up formatting cards in $file"
        } else {
            Write-Error "Could not find formatting cards block in $file"
        }
    } else {
        Write-Error "$file does not exist!"
    }
}
