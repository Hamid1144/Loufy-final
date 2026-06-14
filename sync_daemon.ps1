# sync_daemon.ps1
# Background synchronization daemon for Hamid Raza Portfolio.
# Periodically pulls live edits from Supabase, optimizes new Base64 images, and pushes commits to GitHub.

$ProgressPreference = 'SilentlyContinue'

if ($PSScriptRoot) {
    Set-Location $PSScriptRoot
}

$sleepSeconds = 15

# Initial sync on startup to guarantee local files are in sync immediately
Write-Host "Performing initial sync on startup..." -ForegroundColor Yellow
try {
    Write-Host "Invoking pull_supabase.ps1..." -ForegroundColor Yellow
    $pullOutput = powershell -ExecutionPolicy Bypass -File .\pull_supabase.ps1 2>&1
    Write-Host "pull_supabase.ps1 Output: $pullOutput"
    
    if ($LASTEXITCODE -ne 0) {
        throw "pull_supabase.ps1 failed with exit code $LASTEXITCODE"
    }

    Write-Host "Invoking merge_grids.ps1..." -ForegroundColor Yellow
    $mergeOutput = powershell -ExecutionPolicy Bypass -File .\merge_grids.ps1 2>&1
    Write-Host "merge_grids.ps1 Output: $mergeOutput"
    
    if ($LASTEXITCODE -ne 0) {
        throw "merge_grids.ps1 failed with exit code $LASTEXITCODE"
    }

    Write-Host "Invoking optimize_html_images.ps1..." -ForegroundColor Yellow
    $optOutput = powershell -ExecutionPolicy Bypass -File .\optimize_html_images.ps1 2>&1
    Write-Host "optimize_html_images.ps1 Output: $optOutput"
    
    if ($LASTEXITCODE -ne 0) {
        throw "optimize_html_images.ps1 failed with exit code $LASTEXITCODE"
    }

    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Host "Local changes detected on startup. Committing and pushing to GitHub..." -ForegroundColor Yellow
        git add .
        git commit -m "Auto-sync from live website (daemon startup)"
        git push
        Write-Host "Successfully committed and pushed startup changes to GitHub!" -ForegroundColor Green
        
        Write-Host "Invoking push_supabase.ps1 -Force to push unified/optimized content back to Supabase..." -ForegroundColor Yellow
        $pushOutput = powershell -ExecutionPolicy Bypass -File .\push_supabase.ps1 -Force 2>&1
        Write-Host "push_supabase.ps1 Output: $pushOutput"
    } else {
        Write-Host "Startup check complete. Local files and GitHub are in sync." -ForegroundColor Gray
    }
} catch {
    Write-Warning "Initial startup sync failed: $_"
}
$supabaseUrl = 'https://pgictinimttptsxbvngg.supabase.co'
$supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc'

$headers = @{
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
    "Content-Type" = "application/json; charset=utf-8"
}

Write-Host "=============================================" -ForegroundColor Green
Write-Host "  HAMID RAZA PORTFOLIO - GITHUB SYNC DAEMON  " -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host "Polling Supabase every $sleepSeconds seconds for live edits..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the sync daemon." -ForegroundColor Red
Write-Host ""

$lastIndexHash = ""
$lastPortfolioHash = ""

while ($true) {
    try {
        # 1. Fetch site content from Supabase
        $fetchUri = "$supabaseUrl/rest/v1/site_content?select=id,html_content"
        $res = Invoke-RestMethod -Uri $fetchUri -Headers $headers -Method Get -UseBasicParsing
        
        if ($res -and $res.Count -gt 0) {
            $currentIndexHash = ""
            $currentPortfolioHash = ""
            
            foreach ($row in $res) {
                $bytes = [System.Text.Encoding]::UTF8.GetBytes($row.html_content)
                $sha = [System.Security.Cryptography.SHA256]::Create()
                $hashBytes = $sha.ComputeHash($bytes)
                $hashStr = [System.BitConverter]::ToString($hashBytes) -replace '-'
                
                if ($row.id -eq "index") {
                    $currentIndexHash = $hashStr
                } elseif ($row.id -eq "portfolio") {
                    $currentPortfolioHash = $hashStr
                }
            }
            
            $indexChanged = ($lastIndexHash -ne "" -and $currentIndexHash -ne $lastIndexHash)
            $portfolioChanged = ($lastPortfolioHash -ne "" -and $currentPortfolioHash -ne $lastPortfolioHash)
            
            if ($indexChanged -or $portfolioChanged) {
                Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Change detected in Supabase! Syncing..." -ForegroundColor Cyan
                
                # Determine ordering master
                $orderSource = "portfolio"
                if ($indexChanged -and -not $portfolioChanged) {
                    $orderSource = "index"
                    Write-Host "Homepage 'index' changed. Using 'index' as merge order source." -ForegroundColor Yellow
                } elseif ($portfolioChanged -and -not $indexChanged) {
                    $orderSource = "portfolio"
                    Write-Host "Portfolio page changed. Using 'portfolio' as merge order source." -ForegroundColor Yellow
                } else {
                    Write-Host "Both pages changed or startup check. Using 'portfolio' as default merge order source." -ForegroundColor Gray
                }
                
                # Run pull script to pull Supabase changes to local HTML files
                Write-Host "Running pull_supabase.ps1..."
                powershell -ExecutionPolicy Bypass -File .\pull_supabase.ps1
                
                # Run merge script with specified OrderSource
                Write-Host "Running merge_grids.ps1 -OrderSource $orderSource..."
                powershell -ExecutionPolicy Bypass -File .\merge_grids.ps1 -OrderSource $orderSource
                
                # Run image optimizer to compress any heavy Base64 data URLs
                Write-Host "Running optimize_html_images.ps1..."
                powershell -ExecutionPolicy Bypass -File .\optimize_html_images.ps1
                
                # Check if there are any git changes to push
                $gitStatus = git status --porcelain
                if ($gitStatus) {
                    Write-Host "Local changes detected. Committing and pushing to GitHub..." -ForegroundColor Yellow
                    git add .
                    git commit -m "Auto-sync from live website"
                    git push
                    Write-Host "Successfully committed and pushed changes to GitHub!" -ForegroundColor Green
                    
                    # Self-heal back to Supabase since local merge modified files
                    Write-Host "Pushing unified grids back to Supabase..." -ForegroundColor Yellow
                    powershell -ExecutionPolicy Bypass -File .\push_supabase.ps1 -Force
                } else {
                    Write-Host "No local file changes detected after pull (in sync)." -ForegroundColor Gray
                }
            }
            
            $lastIndexHash = $currentIndexHash
            $lastPortfolioHash = $currentPortfolioHash
        }
    } catch {
        Write-Warning "Sync iteration failed: $_"
    }
    
    Start-Sleep -Seconds $sleepSeconds
}
