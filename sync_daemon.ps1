# sync_daemon.ps1
# Background synchronization daemon for Hamid Raza Portfolio.
# Periodically pulls live edits from Supabase, optimizes new Base64 images, and pushes commits to GitHub.

$ProgressPreference = 'SilentlyContinue'

if ($PSScriptRoot) {
    Set-Location $PSScriptRoot
}

$sleepSeconds = 15

# Custom Logging Function
function Log-Message {
    param (
        [string]$Message,
        [string]$Type = "INFO"
    )
    $logLine = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] [$Type] $Message"
    Write-Host $logLine
    try {
        $logPath = Join-Path $PSScriptRoot "daemon_run.log"
        # Check size of log file and truncate if > 2MB
        if (Test-Path $logPath) {
            $size = (Get-Item $logPath).Length
            if ($size -gt 2MB) {
                Clear-Content $logPath
            }
        }
        Add-Content -Path $logPath -Value $logLine -Encoding UTF8 -ErrorAction SilentlyContinue
    } catch {}
}

# Initial sync on startup to guarantee local files are in sync immediately
Log-Message "Performing initial sync on startup..." "WARN"
try {
    Log-Message "Invoking pull_supabase.ps1..."
    $pullOutput = powershell -ExecutionPolicy Bypass -File .\pull_supabase.ps1 2>&1
    Log-Message "pull_supabase.ps1 Output: $pullOutput"
    
    if ($LASTEXITCODE -ne 0) {
        throw "pull_supabase.ps1 failed with exit code $LASTEXITCODE"
    }

    Log-Message "Invoking merge_grids.ps1..."
    $mergeOutput = powershell -ExecutionPolicy Bypass -File .\merge_grids.ps1 2>&1
    Log-Message "merge_grids.ps1 Output: $mergeOutput"
    
    if ($LASTEXITCODE -ne 0) {
        throw "merge_grids.ps1 failed with exit code $LASTEXITCODE"
    }

    Log-Message "Invoking optimize_html_images.ps1..."
    $optOutput = powershell -ExecutionPolicy Bypass -File .\optimize_html_images.ps1 2>&1
    Log-Message "optimize_html_images.ps1 Output: $optOutput"
    
    if ($LASTEXITCODE -ne 0) {
        throw "optimize_html_images.ps1 failed with exit code $LASTEXITCODE"
    }

    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Log-Message "Local changes detected on startup. Committing and pushing to GitHub..." "WARN"
        git add .
        git commit -m "Auto-sync from live website (daemon startup)"
        git push
        Log-Message "Successfully committed and pushed startup changes to GitHub!" "SUCCESS"
        
        Log-Message "Invoking push_supabase.ps1 -Force to push unified/optimized content back to Supabase..."
        $pushOutput = powershell -ExecutionPolicy Bypass -File .\push_supabase.ps1 -Force 2>&1
        Log-Message "push_supabase.ps1 Output: $pushOutput"
    } else {
        Log-Message "Startup check complete. Local files and GitHub are in sync."
    }
} catch {
    Log-Message "Initial startup sync failed: $_" "ERROR"
}

$supabaseUrl = 'https://pgictinimttptsxbvngg.supabase.co'
$supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc'

$headers = @{
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
    "Content-Type" = "application/json; charset=utf-8"
}

Log-Message "============================================="
Log-Message "  HAMID RAZA PORTFOLIO - GITHUB SYNC DAEMON  "
Log-Message "============================================="
Log-Message "Polling Supabase every $sleepSeconds seconds for live edits..."
Log-Message "Press Ctrl+C to stop the sync daemon."

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
                Log-Message "Change detected in Supabase! Syncing..." "WARN"
                
                # Determine ordering master
                $orderSource = "portfolio"
                if ($indexChanged -and -not $portfolioChanged) {
                    $orderSource = "index"
                    Log-Message "Homepage 'index' changed. Using 'index' as merge order source."
                } elseif ($portfolioChanged -and -not $indexChanged) {
                    $orderSource = "portfolio"
                    Log-Message "Portfolio page changed. Using 'portfolio' as merge order source."
                } else {
                    Log-Message "Both pages changed or startup check. Using 'portfolio' as default merge order source."
                }
                
                # Run pull script to pull Supabase changes to local HTML files
                Log-Message "Running pull_supabase.ps1..."
                $pullRes = powershell -ExecutionPolicy Bypass -File .\pull_supabase.ps1 2>&1
                Log-Message "pull_supabase.ps1 result: $pullRes"
                
                # Run merge script with specified OrderSource
                Log-Message "Running merge_grids.ps1 -OrderSource $orderSource..."
                $mergeRes = powershell -ExecutionPolicy Bypass -File .\merge_grids.ps1 -OrderSource $orderSource 2>&1
                Log-Message "merge_grids.ps1 result: $mergeRes"
                
                # Run image optimizer to compress any heavy Base64 data URLs
                Log-Message "Running optimize_html_images.ps1..."
                $optRes = powershell -ExecutionPolicy Bypass -File .\optimize_html_images.ps1 2>&1
                Log-Message "optimize_html_images.ps1 result: $optRes"
                
                # Check if there are any git changes to push
                $gitStatus = git status --porcelain
                if ($gitStatus) {
                    Log-Message "Local changes detected. Committing and pushing to GitHub..." "WARN"
                    git add .
                    git commit -m "Auto-sync from live website"
                    $gitPushRes = git push 2>&1
                    Log-Message "git push result: $gitPushRes"
                    Log-Message "Successfully committed and pushed changes to GitHub!" "SUCCESS"
                    
                    # Self-heal back to Supabase since local merge modified files
                    Log-Message "Pushing unified grids back to Supabase..."
                    $pushRes = powershell -ExecutionPolicy Bypass -File .\push_supabase.ps1 -Force 2>&1
                    Log-Message "push_supabase.ps1 result: $pushRes"
                } else {
                    Log-Message "No local file changes detected after pull (in sync)."
                }
            }
            
            $lastIndexHash = $currentIndexHash
            $lastPortfolioHash = $currentPortfolioHash
        }
    } catch {
        Log-Message "Sync iteration failed: $_" "ERROR"
    }
    
    Start-Sleep -Seconds $sleepSeconds
}
