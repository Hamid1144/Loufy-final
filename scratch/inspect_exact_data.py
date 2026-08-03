import re

with open('portfolio.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Print all sub-filter buttons in portfolio.html
print("=== Sub-filter buttons in portfolio.html ===")
btns = re.findall(r'<button class="sub-filter-btn"[^>]*data-subcat="([^"]*)"[^>]*>(.*?)</button>', html)
for subcat, text in btns:
    print(f"  subcat: '{subcat}', text: '{text}'")

# 2. Print all portfolio cards with subcats in portfolio.html
print("\n=== Cover cards with subcategories in portfolio.html ===")
# Let's split by card class and look inside
parts = html.split('<div class="portfolio-card')
count = 0
for part in parts[1:]:
    attr_match = re.match(r'^([^>]+)>', part)
    if attr_match:
        attrs = attr_match.group(1)
        if 'data-cat="covers"' in attrs:
            subcat_match = re.search(r'data-subcat="([^"]*)"', attrs)
            if subcat_match:
                subcat = subcat_match.group(1)
                count += 1
                # Find image source
                img_match = re.search(r'src="([^"]*)"', part)
                img = img_match.group(1) if img_match else 'no image'
                # Find title
                title_match = re.search(r'<h3[^>]*>(.*?)</h3>', part)
                title = title_match.group(1) if title_match else 'no title'
                print(f"  {count}. Title: '{title}', Subcat: '{subcat}', Image: '{img}'")
