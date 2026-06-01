# check_git_head.ps1
$i = (git show HEAD:index.html) -join "`n"
$p = (git show HEAD:portfolio.html) -join "`n"

function Get-CoverSrcs($content) {
    $matches = [regex]::Matches($content, '(?s)<div\s+[^>]*class="[^"]*portfolio-card[^"]*"[^>]*data-cat="covers".*?</div>')
    $srcs = @()
    foreach ($m in $matches) {
        $src_match = [regex]::Match($m.Value, 'src="([^"]+)"')
        if ($src_match.Success) {
            $srcs += $src_match.Groups[1].Value
        }
    }
    return $srcs
}

$i_srcs = Get-CoverSrcs $i
$p_srcs = Get-CoverSrcs $p

Write-Host "index.html Cover Srcs ($($i_srcs.Count)):"
$i_srcs | Group-Object | Sort-Object Count -Descending | ForEach-Object { Write-Host "  $($_.Count) x $($_.Name.Substring(0, [math]::Min(80, $_.Name.Length)))" }

Write-Host "`nportfolio.html Cover Srcs ($($p_srcs.Count)):"
$p_srcs | Group-Object | Sort-Object Count -Descending | ForEach-Object { Write-Host "  $($_.Count) x $($_.Name.Substring(0, [math]::Min(80, $_.Name.Length)))" }

