# PowerShell script to automatically generate sitemap.xml
$ErrorActionPreference = 'Stop'

$baseUrl = "https://hamid1144.github.io/Loufy-final"

# Determine the last modification dates in YYYY-MM-DD format
$indexLastMod = (Get-Item "index.html").LastWriteTime.ToString("yyyy-MM-dd")
$portfolioLastMod = (Get-Item "portfolio.html").LastWriteTime.ToString("yyyy-MM-dd")

Write-Host "Index LastMod: $indexLastMod"
Write-Host "Portfolio LastMod: $portfolioLastMod"

# Build the Sitemap XML content
$xml = @"
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>$baseUrl/</loc>
    <lastmod>$indexLastMod</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>$baseUrl/portfolio.html</loc>
    <lastmod>$portfolioLastMod</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
"@

# Save the sitemap with UTF-8 encoding
[System.IO.File]::WriteAllText("sitemap.xml", $xml, [System.Text.Encoding]::UTF8)
Write-Host "sitemap.xml generated successfully!"
