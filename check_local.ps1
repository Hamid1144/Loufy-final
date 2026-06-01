# check_local.ps1
function Count-Cards($filePath) {
    $c = Get-Content -Raw -Encoding utf8 $filePath
    $matches = [regex]::Matches($c, '(?s)<div\s+[^>]*class="[^"]*portfolio-card[^"]*"[^>]*data-cat="([^"]+)"')
    Write-Host "$filePath - total cards: $($matches.Count)"
    $groups = $matches | Group-Object { $_.Groups[1].Value }
    foreach ($g in $groups) {
        Write-Host "  Category '$($g.Name)': $($g.Count)"
    }
}

Count-Cards "index.html"
Count-Cards "portfolio.html"
