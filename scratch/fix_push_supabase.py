import re

with open('push_supabase.ps1', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "$response = Invoke-WebRequest -Uri $updateUri -Headers $headers -Method Patch -Body $bodyBytes -UseBasicParsing",
    "$headers.Add('Prefer', 'return=representation,resolution=merge-duplicates')\n                    $response = Invoke-WebRequest -Uri $updateUri -Headers $headers -Method Post -Body $bodyBytes -UseBasicParsing"
)

content = content.replace(
    "$updateUri = \"$supabaseUrl/rest/v1/site_content?id=eq.$id\"",
    "$updateUri = \"$supabaseUrl/rest/v1/site_content\""
)

with open('push_supabase.ps1', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated push_supabase.ps1 to use POST (upsert)!")
