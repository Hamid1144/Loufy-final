import re

def check_file(filepath):
    print(f"\n--- Checking {filepath} ---")
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Find all portfolio cards
    cards = re.findall(r'<div class="portfolio-card[^"]*"([^>]*)>', html)
    print(f"Total cards: {len(cards)}")
    
    # Analyze covers
    covers_subcats = {}
    for card_attr in cards:
        if 'data-cat="covers"' in card_attr:
            subcat_match = re.search(r'data-subcat="([^"]*)"', card_attr)
            subcat = subcat_match.group(1) if subcat_match else "MISSING"
            covers_subcats[subcat] = covers_subcats.get(subcat, 0) + 1
            
            # Print if it has some subcats
            if subcat in ['cookbooks-food-wine', 'cooking', 'health-fitness', 'fitness', 'cookbooks', 'cook-books']:
                print(f"Cover with subcat '{subcat}': {card_attr}")
                
    print("Covers subcategory breakdown:")
    for subcat, count in covers_subcats.items():
        print(f"  - {subcat}: {count}")

check_file('index.html')
check_file('portfolio.html')
