import re

with open('portfolio.html', 'r', encoding='utf-8') as f:
    p = f.read()

# Extract all 4 paperback-covers cards from portfolio.html
cards = re.findall(r'<div class="portfolio-card reveal" data-cat="paperback-covers".*?</div>\s*</div>\s*</div>', p, re.DOTALL)

if len(cards) >= 4:
    with open('index.html', 'r', encoding='utf-8') as f:
        i = f.read()
    
    old_cards = re.findall(r'<div class="portfolio-card reveal" data-cat="paperback-covers".*?</div>\s*</div>\s*</div>', i, re.DOTALL)
    if old_cards:
        # replace the first old card with the 4 cards
        new_content = '\n\n'.join(cards[:4])
        i = i.replace(old_cards[0], new_content)
        
        # if there are any other old cards of paperback-covers in index.html, remove them to avoid duplicates
        for old_c in old_cards[1:]:
            i = i.replace(old_c, '')
            
        with open('index.html', 'w', encoding='utf-8') as f:
            f.write(i)
        print(f"Replaced successfully, found {len(cards)} cards.")
    else:
        print("Failed to find old cards in index.html")
else:
    print(f"Failed to extract 4 cards from portfolio.html, found {len(cards)}")
