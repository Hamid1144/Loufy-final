# Increment version from 3.28.4 to 3.28.5 in index.html and portfolio.html

$files = @("index.html", "portfolio.html")

foreach ($file in $files) {
    if (Test-Path $file) {
        $html = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
        
        $newHtml = $html.Replace("3.28.4", "3.28.5")
        
        [System.IO.File]::WriteAllText($file, $newHtml, [System.Text.Encoding]::UTF8)
        Write-Host "Updated version to 3.28.5 in $file"
    } else {
        Write-Error "$file not found!"
    }
}
