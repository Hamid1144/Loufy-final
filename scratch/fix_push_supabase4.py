import re

with open('push_supabase.ps1', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the post/upsert logic in push_supabase.ps1 with delete-then-insert
# Let's see what is currently in push_supabase.ps1. We can replace from $updateUri = "$supabaseUrl/rest/v1/site_content" to the end of Invoke-WebRequest.

# Let's inspect push_supabase.ps1 content first to replace it precisely.
# Wait, I know the exact code to replace.

old_block = """            Write-Host "Uploading body content to Supabase..."
            $updateUri = "$supabaseUrl/rest/v1/site_content"
            
            $bodyObj = @{
                id = $id
                html_content = $bodyContent
            }
            $bodyJson = ConvertTo-Json -InputObject $bodyObj -Compress
            
            $maxRetries = 3
            $retryCount = 0
            $success = $false
            
            while (-not $success -and $retryCount -lt $maxRetries) {
                $retryCount++
                try {
                    $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($bodyJson)
                    $headers['Prefer'] = 'return=representation,resolution=merge-duplicates'
                    $response = Invoke-WebRequest -Uri $updateUri -Headers $headers -Method Post -Body $bodyBytes -UseBasicParsing"""

new_block = """            Write-Host "Uploading body content to Supabase (Delete then Insert Workaround)..."
            $deleteUri = "$supabaseUrl/rest/v1/site_content?id=eq.$id"
            $insertUri = "$supabaseUrl/rest/v1/site_content"
            
            $bodyObj = @{
                id = $id
                html_content = $bodyContent
            }
            $bodyJson = ConvertTo-Json -InputObject $bodyObj -Compress
            
            $maxRetries = 3
            $retryCount = 0
            $success = $false
            
            while (-not $success -and $retryCount -lt $maxRetries) {
                $retryCount++
                try {
                    # 1. Delete existing row
                    try {
                        $null = Invoke-RestMethod -Uri $deleteUri -Headers $headers -Method Delete -UseBasicParsing
                    } catch {
                        Write-Warning "Delete failed, attempting insert anyway: $_"
                    }
                    
                    # 2. Insert new row
                    $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($bodyJson)
                    if ($headers.ContainsKey('Prefer')) { $headers.Remove('Prefer') }
                    $headers.Add('Prefer', 'return=representation')
                    $response = Invoke-WebRequest -Uri $insertUri -Headers $headers -Method Post -Body $bodyBytes -UseBasicParsing"""

# Let's write a python script that does a simple string replace.
content = content.replace(old_block, new_block)

with open('push_supabase.ps1', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated push_supabase.ps1 with delete-then-insert workaround!")
