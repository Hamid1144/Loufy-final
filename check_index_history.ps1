# check_index_history.ps1
$commits = git log --oneline | ForEach-Object { $_.Split(' ')[0] }

foreach ($commit in $commits) {
    # Get index.html from this commit
    $file_content = git show "${commit}:index.html" 2>$null
    if ($file_content) {
        # Count formatting cards
        $matches = [regex]::Matches($file_content, '(?s)<div\s+[^>]*class="[^"]*portfolio-card[^"]*"[^>]*data-cat="a-plus-content".*?</div>')
        $count = $matches.Count
        Write-Host "Commit $commit - A+ Content Cards in index.html: $count"
    }
}
