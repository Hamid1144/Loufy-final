import re

with open('push_supabase.ps1', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the inner Prefer header add
content = content.replace("$headers.Add('Prefer', 'return=representation,resolution=merge-duplicates')", "")

# Add it outside the loop
content = content.replace(
    "$success = $false",
    "$headers.Add('Prefer', 'return=representation,resolution=merge-duplicates')\n            $success = $false"
)

with open('push_supabase.ps1', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed push_supabase.ps1 headers bug!")
