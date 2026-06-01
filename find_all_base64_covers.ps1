# find_all_base64_covers.ps1
$i = [System.IO.File]::ReadAllText("index.html", [System.Text.Encoding]::UTF8)
$matches = [regex]::Matches($i, '(?s)<div\s+[^>]*class="[^"]*portfolio-card[^"]*"[^>]*data-cat="covers".*?</div>')
$idx = 1
foreach ($m in $matches) {
    $src_match = [regex]::Match($m.Value, 'src="([^"]+)"')
    if ($src_match.Success) {
        $src = $src_match.Groups[1].Value
        if ($src -like 'data:*') {
            Write-Host "Card $idx - Length: $($src.Length) - Starts: $($src.Substring(0, 80))"
        } else {
            Write-Host "Card $idx - Image file: $src"
        }
        $idx++
    }
}
