import re, urllib.request, json

# Subcategory mapping
SUBCATS = {
    'business-money': 'Business & Money',
    'childrens-books': "Children's Books",
    'cookbooks-food-wine': 'Cookbooks, Food & Wine',
    'education-teaching': 'Education & Teaching',
    'science-fiction-fantasy': 'Science Fiction & Fantasy',
    'science-fiction': 'Science Fiction',
    'historical-fiction': 'Historical Fiction',
    'horror': 'Horror',
    'mystery': 'Mystery',
    'thrillers-suspense': 'Thrillers & Suspense',
    'romance': 'Romance',
    'crime-fiction': 'Crime Fiction',
    'biographies-memoirs': 'Biographies & Memoirs',
    'self-help': 'Self Help',
    'psychology': 'Psychology',
    'religion-spirituality': 'Religion & Spirituality',
    'islamic-books': 'Islamic Books',
    'poetry': 'Poetry',
    'travel': 'Travel',
    'animals-wildlife': 'Animals & Wildlife',
    'health-fitness': 'Health & Fitness',
    'technology': 'Technology'
}

def fix_html_cards(html):
    # Split by '<div class="portfolio-card'
    parts = html.split('<div class="portfolio-card')
    new_parts = [parts[0]]
    
    fixed_count = 0
    
    for part in parts[1:]:
        attr_match = re.match(r'^([^>]+)>(.*)', part, re.DOTALL)
        if not attr_match:
            new_parts.append(part)
            continue
            
        attrs_str, rest = attr_match.groups()
        
        # We only process cards that are book covers (data-cat="covers")
        if 'data-cat="covers"' in attrs_str:
            # 1. Parse current tags in this card
            tags_match = re.search(r'<div class="tags">(.*?)</div>', rest, re.DOTALL)
            if tags_match:
                tags_inner = tags_match.group(1)
                tags = [t.strip() for t in re.findall(r'<span[^>]*>(.*?)</span>', tags_inner)]
                
                # Check for split tags and clean them
                lower_tags = [t.lower() for t in tags]
                
                # Merge cookbooks tags if split
                if ('cookbooks' in lower_tags and 'food & wine' in lower_tags) or \
                   ('cookbooks' in lower_tags and 'food' in lower_tags and 'wine' in lower_tags):
                    tags = [t for t in tags if t.lower() not in ['cookbooks', 'food & wine', 'food', 'wine', 'cook book', 'wine & food']]
                    tags.append('Cookbooks, Food & Wine')
                    lower_tags = [t.lower() for t in tags]
                    fixed_count += 1
                
                # Merge health & fitness tags if split
                if ('health' in lower_tags and 'fitness' in lower_tags):
                    tags = [t for t in tags if t.lower() not in ['health', 'fitness']]
                    tags.append('Health & Fitness')
                    lower_tags = [t.lower() for t in tags]
                    fixed_count += 1
                
                # Determine subcategory slug from tags
                subcat_slug = None
                for slug, name in SUBCATS.items():
                    # check if name or name with comma is in tags
                    if name.lower() in lower_tags:
                        subcat_slug = slug
                        break
                    # Fallback check for parts of "Cookbooks, Food & Wine" or "Health & Fitness"
                    if slug == 'cookbooks-food-wine' and ('cookbooks' in lower_tags or 'food & wine' in lower_tags):
                        subcat_slug = slug
                        if 'Cookbooks, Food & Wine' not in tags:
                            tags.append('Cookbooks, Food & Wine')
                        break
                    if slug == 'health-fitness' and ('health & fitness' in lower_tags or 'health' in lower_tags or 'fitness' in lower_tags):
                        subcat_slug = slug
                        if 'Health & Fitness' not in tags:
                            tags.append('Health & Fitness')
                        break
                
                # If we found a subcat, update the card attributes
                if subcat_slug:
                    # Remove any existing data-subcat attribute
                    attrs_str = re.sub(r'\s*data-subcat="[^"]*"', '', attrs_str)
                    # Add correct data-subcat attribute
                    attrs_str += f' data-subcat="{subcat_slug}"'
                    
                    # Reconstruct tags HTML
                    new_tags_html = "".join([f'<span data-admin-text="true">{t}</span>' for t in tags])
                    rest = re.sub(r'<div class="tags">.*?</div>', f'<div class="tags">{new_tags_html}</div>', rest, count=1, flags=re.DOTALL)
                    fixed_count += 1
        
        new_parts.append(f'{attrs_str}>{rest}')
        
    print(f"Fixed/Updated {fixed_count} cards.")
    return '<div class="portfolio-card'.join(new_parts)

def fix_file(filepath):
    print(f"\nProcessing file: {filepath}")
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    
    fixed_html = fix_html_cards(html)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(fixed_html)
    print(f"Finished: {filepath}")

# Run local file fix
fix_file('index.html')
fix_file('portfolio.html')

# Clean Supabase database content
print("\n--- Syncing updated local HTML files to Supabase site_content ---")
supabaseUrl = 'https://pgictinimttptsxbvngg.supabase.co'
supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc'

def update_supabase_page(page_id, local_filepath):
    with open(local_filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    body_match = re.search(r'(?s)<body[^>]*>(.*?)</body>', content)
    if not body_match:
        print(f"Error: body not found in {local_filepath}")
        return
        
    cleaned_body_html = body_match.group(1).strip()
    
    print(f"Uploading body for '{page_id}' ({len(cleaned_body_html)} chars)...")
    
    # Delete
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
    except Exception as e:
        print(f"Delete failed: {e}")
        
    # Insert
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
        print(f"Successfully uploaded '{page_id}' to Supabase!")
    except Exception as e:
        print(f"Upload failed: {e}")

update_supabase_page('index', 'index.html')
update_supabase_page('portfolio', 'portfolio.html')
