$path = 'C:\Users\razah\.gemini\antigravity\brain\aba73f00-27c9-436d-928c-d9f8448f8e80\.system_generated\logs\transcript.jsonl'
$content = Get-Content -Raw -Encoding UTF8 $path

$regex = [regex]'https?://(?:www\.)?(?:instagram|facebook|linkedin|tiktok|twitter)\.com/[^\s"''\\]+'
$matches = $regex.Matches($content)

$urls = @()
foreach ($m in $matches) {
    $urls += $m.Value
}

Write-Host "Unique Social URLs in Transcript:"
$urls | Sort-Object -Unique | Out-String | Write-Host
