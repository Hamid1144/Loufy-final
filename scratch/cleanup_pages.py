import re, urllib.request, json

def clean_html_content(html):
    # 1. Strip UTF-8 BOM
    html = html.lstrip('\ufeff')
    
    # 2. Find the navbar/main content start
    # We look for <nav class="navbar or <!-- NAVBAR -->
    nav_idx = html.find('<nav class="navbar')
    comment_idx = html.find('<!-- NAVBAR -->')
    
    start_idx = -1
    if nav_idx != -1 and comment_idx != -1:
        start_idx = min(nav_idx, comment_idx)
    elif nav_idx != -1:
        start_idx = nav_idx
    elif comment_idx != -1:
        start_idx = comment_idx
        
    if start_idx != -1:
        cleaned = html[start_idx:]
    else:
        cleaned = html
        
    # 3. Clean up the trailing repeated </body></html> tags
    # Remove any sequence of closing body/html tags and whitespace at the end
    cleaned = re.sub(r'(?:\s*<\/body>\s*<\/html>\s*)+$', '', cleaned, flags=re.I)
    cleaned = cleaned.strip()
    
    return cleaned

def clean_file(filepath):
    print(f"\nCleaning file: {filepath}")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Find head and body tags
    body_match = re.search(r'(?s)(.*?<body[^>]*>)(.*?)(</body>.*)', content)
    if not body_match:
        print("Error: Could not find body tags in file!")
        return
        
    head_and_body_start = body_match.group(1)
    body_content = body_match.group(2)
    body_end_and_html_end = body_match.group(3)
    
    cleaned_body = clean_html_content(body_content)
    
    # Reconstruct clean file
    new_content = head_and_body_start + "\n" + cleaned_body + "\n</body>\n</html>"
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"File cleaned successfully. Length: {len(content)} -> {len(new_content)}")

# Clean local files
clean_file('index.html')
clean_file('portfolio.html')

# Clean Supabase database content
print("\n--- Cleaning Supabase content ---")
supabaseUrl = 'https://pgictinimttptsxbvngg.supabase.co'
supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc'

def update_supabase_page(page_id, local_filepath):
    # Read the cleaned body content from the local file
    with open(local_filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    body_match = re.search(r'(?s)<body[^>]*>(.*?)</body>', content)
    if not body_match:
        print(f"Error: body not found in {local_filepath}")
        return
        
    cleaned_body_html = body_match.group(1).strip()
    
    print(f"Uploading cleaned body for '{page_id}' ({len(cleaned_body_html)} chars)...")
    
    # We do a Delete then Insert workaround as per admin.js to avoid RLS issue
    # 1. Delete
    del_req = urllib.request.Request(
        f'{supabaseUrl}/rest/v1/site_content?id=eq.{page_id}',
        method='DELETE',
        headers={
            'apikey': supabaseKey,
            'Authorization': f'Bearer {supabaseKey}'
        }
    )
    try:
        urllib.request.urlopen(del_req)
        print(f"Deleted old '{page_id}' row.")
    except Exception as e:
        print(f"Delete failed for '{page_id}': {e}")
        
    # 2. Insert
    insert_data = {
        'id': page_id,
        'html_content': cleaned_body_html
    }
    insert_json = json.dumps(insert_data).encode('utf-8')
    
    insert_req = urllib.request.Request(
        f'{supabaseUrl}/rest/v1/site_content',
        method='POST',
        data=insert_json,
        headers={
            'apikey': supabaseKey,
            'Authorization': f'Bearer {supabaseKey}',
            'Content-Type': 'application/json; charset=utf-8'
        }
    )
    try:
        urllib.request.urlopen(insert_req)
        print(f"Successfully inserted clean '{page_id}' row to Supabase!")
    except Exception as e:
        print(f"Insert failed for '{page_id}': {e}")

update_supabase_page('index', 'index.html')
update_supabase_page('portfolio', 'portfolio.html')
