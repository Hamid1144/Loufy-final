import re

with open('push_supabase.ps1', 'r', encoding='utf-8') as f:
    content = f.read()

# We want to replace the whole block inside foreach ($page in $pages) { ... } starting from Write-Host "Uploading body content to Supabase..." to the end of the while loop.
pattern = r'Write-Host "Uploading body content to Supabase\.\.\.".*?(?=else \{\s*Write-Warning "Could not find body tags)'
# Let's see if we can do a simpler replace.
# Let's locate lines 94 to 135 and replace them.

lines = content.split('\n')
# Let's inspect where "Uploading body content to Supabase..." is
for idx, line in enumerate(lines):
    if 'Uploading body content to Supabase...' in line:
        start_idx = idx
        break

# The loop ends before "} else {" which is line 136 in the previous output.
for idx in range(start_idx, len(lines)):
    if '} else {' in lines[idx]:
        end_idx = idx
        break

print(f"Replacing from line {start_idx} to {end_idx}")

new_lines = lines[:start_idx] + [
    '            Write-Host "Uploading body content to Supabase (Delete then Insert Workaround)..."',
    '            $deleteUri = "$supabaseUrl/rest/v1/site_content?id=eq.$id"',
    '            $insertUri = "$supabaseUrl/rest/v1/site_content"',
    '            ',
    '            $bodyObj = @{',
    '                id = $id',
    '                html_content = $bodyContent',
    '            }',
    '            $bodyJson = ConvertTo-Json -InputObject $bodyObj -Compress',
    '            ',
    '            $maxRetries = 3',
    '            $retryCount = 0',
    '            $success = $false',
    '            ',
    '            while (-not $success -and $retryCount -lt $maxRetries) {',
    '                $retryCount++',
    '                try {',
    '                    # 1. Delete existing row',
    '                    try {',
    '                        $null = Invoke-RestMethod -Uri $deleteUri -Headers $headers -Method Delete -UseBasicParsing',
    '                    } catch {',
    '                        Write-Warning "Delete failed, attempting insert anyway: $_"',
    '                    }',
    '                    ',
    '                    # 2. Insert new row',
    '                    $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($bodyJson)',
    '                    $headers[\'Prefer\'] = \'return=representation\'',
    '                    $response = Invoke-WebRequest -Uri $insertUri -Headers $headers -Method Post -Body $bodyBytes -UseBasicParsing',
    '                    ',
    '                    if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 300) {',
    '                        Write-Host "Successfully pushed \'$id\' body to Supabase!"',
    '                        $success = $true',
    '                    } else {',
    '                        Write-Error "Failed to push \'$id\' body to Supabase. Status: $($response.StatusCode). Response: $($response.Content)"',
    '                    }',
    '                } catch {',
    '                    Write-Warning "Attempt $retryCount of $maxRetries failed: $_"',
    '                    if ($retryCount -lt $maxRetries) {',
    '                        Write-Host "Waiting 2 seconds before retrying..."',
    '                        Start-Sleep -Seconds 2',
    '                    } else {',
    '                        Write-Error "Failed to push \'$id\' body to Supabase after $maxRetries attempts: $_"',
    '                        if ($_.Exception.Response) {',
    '                            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())',
    '                            $responseBody = $reader.ReadToEnd()',
    '                            Write-Error "Response Details: $responseBody"',
    '                        }',
    '                    }',
    '                }',
    '            }'
] + lines[end_idx:]

with open('push_supabase.ps1', 'w', encoding='utf-8') as f:
    f.write('\n'.join(new_lines))
print("Successfully replaced with line-based replacement!")
