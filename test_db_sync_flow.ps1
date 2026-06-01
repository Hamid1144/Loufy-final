# test_db_sync_flow.ps1
# End-to-end integration test for the Hamid Raza Portfolio Sync Daemon.

$ProgressPreference = 'SilentlyContinue'
$supabaseUrl = 'https://pgictinimttptsxbvngg.supabase.co'
$supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc'

$headers = @{
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
    "Content-Type" = "application/json; charset=utf-8"
}

Write-Host "=============================================" -ForegroundColor Green
Write-Host "   RUNNING SYNC DAEMON E2E INTEGRATION TEST   " -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# 1. Fetch current index content from Supabase
Write-Host "1. Fetching current index row from Supabase..."
$fetchUri = "$supabaseUrl/rest/v1/site_content?id=eq.index&select=html_content"
$res = Invoke-RestMethod -Uri $fetchUri -Headers $headers -Method Get -UseBasicParsing
if (-not $res -or $res.Count -eq 0) {
    Write-Error "Failed to fetch index row from Supabase."
    exit 1
}

$originalHtml = $res[0].html_content

# 2. Modify one card title in the HTML content
# Let's find "Fantasy Book Cover Design" and change it to "Fantasy Book Cover Design (Sync Test)"
if ($originalHtml -like "*Fantasy Book Cover Design*") {
    Write-Host "Found target coloring book card."
} else {
    Write-Error "Target card not found in Supabase content."
    exit 1
}

$testHtml = $originalHtml.Replace("Fantasy Book Cover Design", "Fantasy Book Cover Design (Sync Test)")

# 3. Push the modified content back to Supabase index row
Write-Host "2. Pushing test modification to Supabase 'index' row..."
$updateUri = "$supabaseUrl/rest/v1/site_content?id=eq.index"
$bodyObj = @{ html_content = $testHtml }
$bodyJson = ConvertTo-Json -InputObject $bodyObj -Compress
$bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($bodyJson)
$response = Invoke-WebRequest -Uri $updateUri -Headers $headers -Method Patch -Body $bodyBytes -UseBasicParsing

if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 300) {
    Write-Host "Successfully updated Supabase index row with test data!" -ForegroundColor Green
} else {
    Write-Error "Failed to update Supabase row. Status code: $($response.StatusCode)"
    exit 1
}

# 4. Wait for daemon to poll (every 15s) and perform sync
Write-Host "3. Waiting 25 seconds for the sync daemon to poll and heal..." -ForegroundColor Yellow
for ($i = 25; $i -gt 0; $i--) {
    Write-Host -NoNewline "$i.. "
    Start-Sleep -Seconds 1
}
Write-Host ""

# 5. Check if local index.html and portfolio.html have the changes
Write-Host "4. Checking local files for updated title..."
$localIndex = Get-Content -Path "index.html" -Raw -Encoding UTF8
$localPortfolio = Get-Content -Path "portfolio.html" -Raw -Encoding UTF8

$indexSuccess = $localIndex -like "*(Sync Test)*"
$portfolioSuccess = $localPortfolio -like "*(Sync Test)*"

if ($indexSuccess) {
    Write-Host "[SUCCESS] index.html successfully updated by sync daemon!" -ForegroundColor Green
} else {
    Write-Warning "[FAILURE] index.html was not updated."
}

if ($portfolioSuccess) {
    Write-Host "[SUCCESS] portfolio.html successfully updated and grid merged!" -ForegroundColor Green
} else {
    Write-Warning "[FAILURE] portfolio.html was not updated."
}

# 6. Check Git status for modifications
Write-Host "5. Checking Git status..."
$gitStatus = git status --porcelain
Write-Host "Git Status Output:"
Write-Host $gitStatus

# 7. Restore original content in Supabase and local files (Cleanup)
Write-Host "6. Cleaning up test changes..."
# Restore in Supabase
$restoreObj = @{ html_content = $originalHtml }
$restoreJson = ConvertTo-Json -InputObject $restoreObj -Compress
$restoreBytes = [System.Text.Encoding]::UTF8.GetBytes($restoreJson)
$restoreResponse = Invoke-WebRequest -Uri $updateUri -Headers $headers -Method Patch -Body $restoreBytes -UseBasicParsing

# Run pull/merge locally to restore files
Write-Host "Running pull_supabase.ps1 to restore local files..."
powershell.exe -ExecutionPolicy Bypass -File .\pull_supabase.ps1
Write-Host "Running merge_grids.ps1 to align local files..."
powershell.exe -ExecutionPolicy Bypass -File .\merge_grids.ps1

Write-Host "Verification test complete!" -ForegroundColor Green
if ($indexSuccess -and $portfolioSuccess) {
    Write-Host "E2E Sync Verification: PASSED" -ForegroundColor Green
} else {
    Write-Host "E2E Sync Verification: FAILED" -ForegroundColor Red
}
