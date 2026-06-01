# find_dup_details.ps1
$i = [System.IO.File]::ReadAllText("index.html", [System.Text.Encoding]::UTF8)
$matches = [regex]::Matches($i, '(?s)<div\s+[^>]*class="[^"]*portfolio-card[^"]*"[^>]*data-cat="covers".*?</div>')
$idx = 1
foreach ($m in $matches) {
    if ($m.Value -like '*data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAUEBAQEAwUEBAQGBQUGCA0IC*') {
        # Extract title and tags
        $title_match = [regex]::Match($m.Value, '<h3[^>]*>(.*?)</h3>')
        $title = if ($title_match.Success) { $title_match.Groups[1].Value.Trim() } else { "no title" }
        
        $tags_match = [regex]::Matches($m.Value, '<span[^>]*>(.*?)</span>')
        $tags = @()
        foreach ($t in $tags_match) {
            $tags += $t.Groups[1].Value.Trim()
        }
        $tag_str = $tags -join ", "
        
        Write-Host "Card $idx - Title: $title, Tags: $tag_str"
        $idx++
    }
}
