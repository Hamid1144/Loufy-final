# PowerShell script to automatically generate sitemap.xml
$ErrorActionPreference = 'Stop'

$baseUrl = "https://loufypublish.vercel.app"
$supabaseUrl = 'https://pgictinimttptsxbvngg.supabase.co'
$supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc'

# Determine the last modification dates in YYYY-MM-DD format
$indexLastMod = (Get-Item "index.html").LastWriteTime.ToString("yyyy-MM-dd")
$portfolioLastMod = (Get-Item "portfolio.html").LastWriteTime.ToString("yyyy-MM-dd")

Write-Host "Index LastMod: $indexLastMod"
Write-Host "Portfolio LastMod: $portfolioLastMod"

# Fetch blogs from Supabase
$headers = @{
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
}
$blogsXml = ""
try {
    $res = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/site_content?id=eq.blogs_json&select=html_content" -Headers $headers -Method Get
    if ($res -and $res.Count -gt 0 -and $res[0].html_content) {
        $posts = ConvertFrom-Json -InputObject $res[0].html_content
        foreach ($post in $posts) {
            $pubDate = [DateTime]::Parse($post.published_at).ToString("yyyy-MM-dd")
            $blogsXml += "  <url>`r`n"
            $blogsXml += "    <loc>$baseUrl/blog/$($post.slug)</loc>`r`n"
            $blogsXml += "    <lastmod>$pubDate</lastmod>`r`n"
            $blogsXml += "    <changefreq>monthly</changefreq>`r`n"
            $blogsXml += "    <priority>0.7</priority>`r`n"
            $blogsXml += "  </url>`r`n"
        }
    }
} catch {
    Write-Warning "Could not fetch blogs from Supabase for sitemap: $_"
}

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
$blogsXml</urlset>
"@

# Save the sitemap with UTF-8 encoding
[System.IO.File]::WriteAllText("sitemap.xml", $xml, [System.Text.Encoding]::UTF8)
Write-Host "sitemap.xml generated successfully!"
