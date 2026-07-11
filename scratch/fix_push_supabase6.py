import re

with open('push_supabase.ps1', 'r', encoding='utf-8') as f:
    content = f.read()

old_block = """            Write-Host "Uploading body content to Supabase..."
            $updateUri = "$supabaseUrl/rest/v1/site_content"
            
            $bodyObj = @{
                id = $id
                html_content = $bodyContent
            }
            $bodyJson = ConvertTo-Json -InputObject $bodyObj -Compress
            
            $maxRetries = 3
            $retryCount = 0
            $headers['Prefer'] = 'return=representation,resolution=merge-duplicates'
            $success = $false
            
            while (-not $success -and $retryCount -lt $maxRetries) {
                $retryCount++
                try {
                    $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($bodyJson)
                    
                    $response = Invoke-WebRequest -Uri $updateUri -Headers $headers -Method Post -Body $bodyBytes -UseBasicParsing
                    
                    if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 300) {
                        Write-Host "Successfully pushed '$id' body to Supabase!"
                        $success = $true
                    } else {
                        Write-Error "Failed to push '$id' body to Supabase. Status: $($response.StatusCode). Response: $($response.Content)"
                    }
                } catch {
                    Write-Warning "Attempt $retryCount of $maxRetries failed: $_"
                    if ($retryCount -lt $maxRetries) {
                        Write-Host "Waiting 2 seconds before retrying..."
                        Start-Sleep -Seconds 2
                    } else {
                        Write-Error "Failed to push '$id' body to Supabase after $maxRetries attempts: $_"
                        if ($_.Exception.Response) {
                            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                            $responseBody = $reader.ReadToEnd()
                            Write-Error "Response Details: $responseBody"
                        }
                    }
                }
            }"""

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
                    $headers['Prefer'] = 'return=representation'
                    $response = Invoke-WebRequest -Uri $insertUri -Headers $headers -Method Post -Body $bodyBytes -UseBasicParsing
                    
                    if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 300) {
                        Write-Host "Successfully pushed '$id' body to Supabase!"
                        $success = $true
                    } else {
                        Write-Error "Failed to push '$id' body to Supabase. Status: $($response.StatusCode). Response: $($response.Content)"
                    }
                } catch {
                    Write-Warning "Attempt $retryCount of $maxRetries failed: $_"
                    if ($retryCount -lt $maxRetries) {
                        Write-Host "Waiting 2 seconds before retrying..."
                        Start-Sleep -Seconds 2
                    } else {
                        Write-Error "Failed to push '$id' body to Supabase after $maxRetries attempts: $_"
                        if ($_.Exception.Response) {
                            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                            $responseBody = $reader.ReadToEnd()
                            Write-Error "Response Details: $responseBody"
                        }
                    }
                }
            }"""

if old_block in content:
    content = content.replace(old_block, new_block)
    with open('push_supabase.ps1', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully replaced!")
else:
    print("Could not find the exact old block!")
