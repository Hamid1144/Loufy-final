import urllib.request, json, re

req = urllib.request.Request(
    'https://pgictinimttptsxbvngg.supabase.co/rest/v1/site_content?id=eq.portfolio&select=html_content',
    headers={
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc'
    }
)
res = json.loads(urllib.request.urlopen(req).read().decode())
html = res[0]['html_content']

parts = html.split('<div class="portfolio-card')
print(f"Total cards found in Supabase HTML: {len(parts) - 1}")

subcats = {}
no_subcat_covers = 0
total_covers = 0

for part in parts[1:]:
    attr_match = re.match(r'^([^>]+)>', part)
    if attr_match:
        attrs = attr_match.group(1)
        if 'data-cat="covers"' in attrs:
            total_covers += 1
            subcat_match = re.search(r'data-subcat="([^"]*)"', attrs)
            if subcat_match:
                subcat = subcat_match.group(1)
                subcats[subcat] = subcats.get(subcat, 0) + 1
            else:
                no_subcat_covers += 1

print(f"Total covers: {total_covers}")
print(f"Covers with NO subcategory: {no_subcat_covers}")
print("Subcategory breakdown in Supabase:")
for k, v in sorted(subcats.items()):
    print(f"  {k}: {v}")
