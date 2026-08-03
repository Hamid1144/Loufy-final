import re, urllib.request, json

SUBCATS = {
    'Business & Money': 'business-money',
    "Children's Books": 'childrens-books',
    'Cookbooks, Food & Wine': 'cookbooks-food-wine',
    'Education & Teaching': 'education-teaching',
    'Science Fiction & Fantasy': 'science-fiction-fantasy',
    'Science Fiction': 'science-fiction',
    'Historical Fiction': 'historical-fiction',
    'Horror': 'horror',
    'Mystery': 'mystery',
    'Thrillers & Suspense': 'thrillers-suspense',
    'Romance': 'romance',
    'Crime Fiction': 'crime-fiction',
    'Biographies & Memoirs': 'biographies-memoirs',
    'Self Help': 'self-help',
    'Psychology': 'psychology',
    'Religion & Spirituality': 'religion-spirituality',
    'Islamic Books': 'islamic-books',
    'Poetry': 'poetry',
    'Travel': 'travel',
    'Animals & Wildlife': 'animals-wildlife',
    'Health & Fitness': 'health-fitness',
    'Technology': 'technology'
}

def fix_multi_subcats(html):
    parts = html.split('<div class="portfolio-card')
    new_parts = [parts[0]]
    fixed = 0
    
    for part in parts[1:]:
        attr_m = re.match(r'^([^>]+)>(.*)', part, re.DOTALL)
        if not attr_m:
            new_parts.append(part)
            continue
        
        attrs, rest = attr_m.groups()
        
        if 'data-cat="covers"' not in attrs:
            new_parts.append(f'{attrs}>{rest}')
            continue
        
        # Parse tags from card
        tags_m = re.search(r'<div class="tags">(.*?)</div>', rest, re.DOTALL)
        if not tags_m:
            new_parts.append(f'{attrs}>{rest}')
            continue
        
        tags = [t.strip() for t in re.findall(r'<span[^>]*>(.*?)</span>', tags_m.group(1))]
        
        # Find ALL matching subcategory slugs from tags
        matched_slugs = []
        tags_lower = [t.lower() for t in tags]
        
        for name, slug in SUBCATS.items():
            if name.lower() in tags_lower:
                matched_slugs.append(slug)
        
        if len(matched_slugs) > 0:
            # Remove old data-subcat
            attrs = re.sub(r'\s*data-subcat="[^"]*"', '', attrs)
            # Add new comma-separated data-subcat
            attrs += f' data-subcat="{",".join(matched_slugs)}"'
            if len(matched_slugs) > 1:
                fixed += 1
                print(f"  Fixed: tags={tags} -> data-subcat=\"{','.join(matched_slugs)}\"")
        
        new_parts.append(f'{attrs}>{rest}')
    
    print(f"  Total cards with multiple subcats fixed: {fixed}")
    return '<div class="portfolio-card'.join(new_parts)


for filename in ['portfolio.html', 'index.html']:
    print(f"\nProcessing: {filename}")
    with open(filename, 'r', encoding='utf-8') as f:
        html = f.read()
    fixed = fix_multi_subcats(html)
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(fixed)

# Upload to Supabase
print("\n--- Syncing to Supabase ---")
supabaseUrl = 'https://pgictinimttptsxbvngg.supabase.co'
supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc'

def update_page(page_id, filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    body_m = re.search(r'(?s)<body[^>]*>(.*?)</body>', content)
    if not body_m:
        print(f"  Error: body not found in {filepath}")
        return
    body_html = body_m.group(1).strip()
    print(f"  Uploading '{page_id}' ({len(body_html)} chars)...")
    
    # Delete
    del_req = urllib.request.Request(
        f'{supabaseUrl}/rest/v1/site_content?id=eq.{page_id}',
        method='DELETE',
        headers={'apikey': supabaseKey, 'Authorization': f'Bearer {supabaseKey}'}
    )
    try: urllib.request.urlopen(del_req)
    except: pass
    
    # Insert
    data = json.dumps({'id': page_id, 'html_content': body_html}).encode('utf-8')
    ins_req = urllib.request.Request(
        f'{supabaseUrl}/rest/v1/site_content',
        method='POST', data=data,
        headers={'apikey': supabaseKey, 'Authorization': f'Bearer {supabaseKey}', 'Content-Type': 'application/json; charset=utf-8'}
    )
    try:
        urllib.request.urlopen(ins_req)
        print(f"  Uploaded '{page_id}' successfully!")
    except Exception as e:
        print(f"  Upload failed: {e}")

update_page('index', 'index.html')
update_page('portfolio', 'portfolio.html')
print("\nDone!")
