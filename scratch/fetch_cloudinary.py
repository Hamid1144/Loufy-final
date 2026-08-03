import urllib.request
import json
import re
import ssl
import base64

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

cloud_name = "dtr3yvjac"
api_key = "453843776219872"
api_secret = "WDP5Pmku01sVxQJ2pD_npSNL5wA"

# Step 1: Get all existing cover image public_ids from current index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Find ALL cloudinary URLs in the entire page
all_existing_ids = set()
for m in re.finditer(r'res\.cloudinary\.com/dtr3yvjac/image/upload/[^"\']*?/portfolio/([^"\'.\s]+)', html):
    all_existing_ids.add('portfolio/' + m.group(1))

print(f"Found {len(all_existing_ids)} unique Cloudinary public_ids already in index.html")

# Step 2: Fetch ALL resources from Cloudinary portfolio folder
credentials = base64.b64encode(f"{api_key}:{api_secret}".encode()).decode()
all_resources = []
next_cursor = None

while True:
    url = f"https://api.cloudinary.com/v1_1/{cloud_name}/resources/image?type=upload&prefix=portfolio/&max_results=500"
    if next_cursor:
        url += f"&next_cursor={next_cursor}"
    
    req = urllib.request.Request(url, headers={
        'Authorization': f'Basic {credentials}'
    })
    
    res = urllib.request.urlopen(req, context=ctx)
    data = json.loads(res.read().decode())
    
    resources = data.get('resources', [])
    all_resources.extend(resources)
    
    next_cursor = data.get('next_cursor')
    if not next_cursor:
        break

print(f"Total Cloudinary resources: {len(all_resources)}")

# Step 3: Filter for images uploaded on July 11 (today) that look like book covers
# Book covers are typically mockup images with dimensions like 2560x1920, 2560x1440, 2560x2027, etc.
# Small images like logos (546x143, 1x1, etc.) should be excluded

not_in_site = []
for r in all_resources:
    pid = r['public_id']
    if pid not in all_existing_ids:
        w = r.get('width', 0)
        h = r.get('height', 0)
        created = r.get('created_at', '')
        fmt = r.get('format', '')
        not_in_site.append({
            'public_id': pid,
            'width': w,
            'height': h,
            'created_at': created,
            'format': fmt,
            'url': r.get('secure_url', '')
        })

print(f"\nTotal images NOT in site: {len(not_in_site)}")

# Filter for likely book covers (large images, not tiny logos/icons)
# Book cover mockups are typically at least 800px wide
book_covers = [r for r in not_in_site if r['width'] >= 800 and r['height'] >= 800]
print(f"Likely book covers (>=800x800): {len(book_covers)}")

# Sort by creation date
book_covers.sort(key=lambda x: x['created_at'])

print("\n=== LIKELY BOOK COVERS NOT IN SITE ===")
for i, r in enumerate(book_covers, 1):
    print(f"  {i}. {r['public_id']} ({r['format']}, {r['width']}x{r['height']}, {r['created_at']})")

# Save the list for the next script
with open('scratch/missing_covers.json', 'w') as f:
    json.dump(book_covers, f, indent=2)

print(f"\nSaved {len(book_covers)} missing covers to scratch/missing_covers.json")
