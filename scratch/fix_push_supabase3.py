import re

with open('push_supabase.ps1', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix headers.Add to assignment
content = content.replace(
    "$headers.Add('Prefer', 'return=representation,resolution=merge-duplicates')",
    "$headers['Prefer'] = 'return=representation,resolution=merge-duplicates'"
)

# Fix bodyObj to include id
content = content.replace(
    """            $bodyObj = @{
                html_content = $bodyContent
            }""",
    """            $bodyObj = @{
                id = $id
                html_content = $bodyContent
            }"""
)

with open('push_supabase.ps1', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed push_supabase.ps1 bodyObj and headers assignment!")
