import re

def inspect_file(filepath):
    print(f"\n================ INSPECTING {filepath} ================")
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Split by '<div class="portfolio-card'
    parts = html.split('<div class="portfolio-card')
    print(f"Total parts: {len(parts)}")
    
    count = 0
    for part in parts[1:]:
        # Reconstruct the card start
        card_content = '<div class="portfolio-card' + part.split('</div\n')[0] # approximate end
        # Or even better, just find the text until the next part or up to a reasonable length
        # Let's search inside the attribute of the card (the first line/brackets)
        attr_match = re.match(r'^([^>]+)>', part)
        if attr_match:
            attrs = attr_match.group(1)
            if 'data-cat="covers"' in attrs:
                subcat_match = re.search(r'data-subcat="([^"]*)"', attrs)
                subcat = subcat_match.group(1) if subcat_match else 'none'
                if subcat in ['cookbooks-food-wine', 'health-fitness', 'fitness', 'cookbooks', 'cooking']:
                    count += 1
                    print(f"\n--- Card {count} (Subcat: {subcat}) ---")
                    # print the first 500 characters of this part
                    print('<div class="portfolio-card' + part[:600] + '...')

inspect_file('portfolio.html')
inspect_file('index.html')
