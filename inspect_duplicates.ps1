# inspect_duplicates.ps1
$i = [System.IO.File]::ReadAllText("index.html", [System.Text.Encoding]::UTF8)
$matches = [regex]::Matches($i, '(?s)<div\s+[^>]*class="[^"]*portfolio-card[^"]*"[^>]*data-cat="covers".*?</div>')
foreach ($m in $matches) {
    if ($m.Value -like '*data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAUEBAQEAwUEBAQGBQUGCA0IC*') {
        # Print a short summary of the card
        $summary = [regex]::Replace($m.Value, 'data:image/[^;]+;base64,[^"]+', 'data:image/...[TRUNCATED]...')
        Write-Host "--------------------"
        Write-Host $summary
    }
}
