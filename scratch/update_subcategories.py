import re
import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

categories = [
    ("Business & Money", "business-money"),
    ("Children's Books", "childrens-books"),
    ("Cookbooks, Food & Wine", "cookbooks-food-wine"),
    ("Education & Teaching", "education-teaching"),
    ("Science Fiction & Fantasy", "science-fiction-fantasy"),
    ("Science Fiction", "science-fiction"),
    ("Historical Fiction", "historical-fiction"),
    ("Horror", "horror"),
    ("Mystery", "mystery"),
    ("Thrillers & Suspense", "thrillers-suspense"),
    ("Romance", "romance"),
    ("Crime Fiction", "crime-fiction"),
    ("Biographies & Memoirs", "biographies-memoirs"),
    ("Self Help", "self-help"),
    ("Psychology", "psychology"),
    ("Religion & Spirituality", "religion-spirituality"),
    ("Islamic Books", "islamic-books"),
    ("Poetry", "poetry"),
    ("Travel", "travel"),
    ("Animals & Wildlife", "animals-wildlife"),
    ("Health & Fitness", "health-fitness"),
    ("Technology", "technology")
]

new_html_content = '<button class="sub-filter-btn active" data-subcat="all">All</button>\n'
for name, slug in categories:
    new_html_content += f'<button class="sub-filter-btn" data-subcat="{slug}">{name}</button>\n'

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Use regex to replace the content inside #book-covers-sub-filters
    pattern = r'(id="book-covers-sub-filters"[^>]*>).*?(</div>)'
    new_content = re.sub(pattern, r'\g<1>\n' + new_html_content + r'\g<2>', content, flags=re.DOTALL)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    return new_content

# Update local files
index_html = replace_in_file('index.html')
portfolio_html = replace_in_file('portfolio.html')

# Update Supabase
url = 'https://pgictinimttptsxbvngg.supabase.co/rest/v1/site_content'
headers = {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

def update_supabase(page_id, html_content):
    # PATCH request
    data = json.dumps({"html_content": html_content}).encode('utf-8')
    req = urllib.request.Request(f"{url}?id=eq.{page_id}", data=data, headers=headers, method='PATCH')
    try:
        res = urllib.request.urlopen(req, context=ctx)
        print(f"Updated {page_id} in Supabase")
    except Exception as e:
        print(f"Error updating {page_id}: {e}")

update_supabase('index', index_html)
update_supabase('portfolio', portfolio_html)

print("Done replacing subcategories.")
