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
match = re.search(r'id="book-covers-sub-filters"[^>]*>(.*?)</div>', html, re.DOTALL)
if match:
    print("MATCH FOUND:")
    print(match.group(1).strip())
else:
    print("NO MATCH FOUND")
