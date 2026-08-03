import urllib.request, json, re

def inspect_page(page_id):
    print(f"\n================ INSPECTING SUPABASE '{page_id}' ================")
    req = urllib.request.Request(
        f'https://pgictinimttptsxbvngg.supabase.co/rest/v1/site_content?id=eq.{page_id}&select=html_content',
        headers={
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc'
        }
    )
    try:
        res = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))
        if not res:
            print("No page found")
            return
        html = res[0]['html_content']
        # Strip BOM
        html = html.lstrip('\ufeff')
        print(f"Total HTML length: {len(html)}")
        print("\n--- FIRST 800 CHARACTERS ---")
        first_800 = html[:800].encode('ascii', errors='ignore').decode('ascii')
        print(first_800)
        print("\n--- LAST 800 CHARACTERS ---")
        last_800 = html[-800:].encode('ascii', errors='ignore').decode('ascii')
        print(last_800)
        
        # Check for multiple body or head closing tags
        body_closes = len(re.findall(r'</body>', html, re.I))
        html_closes = len(re.findall(r'</html>', html, re.I))
        print(f"\nNumber of </body> tags: {body_closes}")
        print(f"Number of </html> tags: {html_closes}")
        
    except Exception as e:
        print(f"Error inspecting page: {e}")

inspect_page('index')
inspect_page('portfolio')
