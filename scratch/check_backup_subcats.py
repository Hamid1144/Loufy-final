import re
from collections import Counter

# Check the backup file for subcategory assignments
with open('scratch/portfolio_html.html', 'r', encoding='utf-8') as f:
    backup_html = f.read()

# Find all cover cards with their subcategories and image URLs
pattern = r'<div class="portfolio-card[^"]*"[^>]*data-cat="covers"[^>]*?(?:data-subcat="([^"]*)")?[^>]*>(.*?)</div>\s*</div>\s*</div>'
cards = re.findall(pattern, backup_html, re.DOTALL)

print(f"Total cover cards in backup: {len(cards)}")

# Better approach: find each cover card block individually
cover_blocks = []
for m in re.finditer(r'<div class="portfolio-card[^"]*"([^>]*data-cat="covers"[^>]*)>(.*?)</div>\s*</div>\s*</div>', backup_html, re.DOTALL):
    attrs = m.group(1)
    body = m.group(2)
    
    subcat_match = re.search(r'data-subcat="([^"]*)"', attrs)
    subcat = subcat_match.group(1) if subcat_match else 'none'
    
    img_match = re.search(r'src="([^"]+)"', body)
    img_url = img_match.group(1) if img_match else 'no-img'
    
    # Extract public_id from URL
    pid_match = re.search(r'/portfolio/([^."]+)', img_url)
    pid = 'portfolio/' + pid_match.group(1) if pid_match else img_url
    
    cover_blocks.append({
        'subcat': subcat,
        'public_id': pid,
        'img_url': img_url
    })

print(f"\nCovers found with subcats: {len(cover_blocks)}")
subcats = Counter(c['subcat'] for c in cover_blocks)
print(f"Subcategory distribution: {dict(subcats)}")

print("\n=== Each cover and its subcategory ===")
for c in cover_blocks:
    print(f"  {c['public_id']}  =>  subcat: {c['subcat']}")
