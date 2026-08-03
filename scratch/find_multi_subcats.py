import re

subcat_names = [
    'Business & Money', 'Horror', 'Romance', 'Science Fiction',
    'Science Fiction & Fantasy', 'Education & Teaching', 'Poetry',
    'Health & Fitness', 'Cookbooks, Food & Wine', 'Technology',
    "Children's Books", 'Historical Fiction', 'Mystery',
    'Thrillers & Suspense', 'Crime Fiction', 'Biographies & Memoirs',
    'Self Help', 'Psychology', 'Religion & Spirituality',
    'Islamic Books', 'Travel', 'Animals & Wildlife'
]

for filename in ['portfolio.html', 'index.html']:
    print(f"\n=== {filename} ===")
    with open(filename, 'r', encoding='utf-8') as f:
        html = f.read()
    parts = html.split('<div class="portfolio-card')
    for i, part in enumerate(parts[1:], 1):
        attr_m = re.match(r'^([^>]+)>', part)
        if not attr_m:
            continue
        attrs = attr_m.group(1)
        if 'data-cat="covers"' not in attrs:
            continue
        tags_m = re.search(r'<div class="tags">(.*?)</div>', part, re.DOTALL)
        if not tags_m:
            continue
        tags = re.findall(r'<span[^>]*>(.*?)</span>', tags_m.group(1))
        subcat_m = re.search(r'data-subcat="([^"]+)"', attrs)
        subcat = subcat_m.group(1) if subcat_m else 'NONE'
        
        matched = [t for t in tags if any(t.lower() == s.lower() for s in subcat_names)]
        if len(matched) >= 2:
            print(f"  Card {i}: data-subcat=\"{subcat}\", tags={tags}, matched_subcats={matched}")
    
    # Also count how many covers have each subcat
    print(f"\n  Subcat counts:")
    subcat_counts = {}
    no_subcat = 0
    for part in parts[1:]:
        attr_m = re.match(r'^([^>]+)>', part)
        if not attr_m:
            continue
        attrs = attr_m.group(1)
        if 'data-cat="covers"' not in attrs:
            continue
        subcat_m = re.search(r'data-subcat="([^"]+)"', attrs)
        if subcat_m:
            s = subcat_m.group(1)
            subcat_counts[s] = subcat_counts.get(s, 0) + 1
        else:
            no_subcat += 1
    for k, v in sorted(subcat_counts.items()):
        print(f"    {k}: {v}")
    print(f"    NO SUBCAT: {no_subcat}")
