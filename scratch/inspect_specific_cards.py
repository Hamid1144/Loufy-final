import re

def inspect_file(filepath):
    print(f"\n================ INSPECTING {filepath} ================")
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Let's find all divs with portfolio-card class and print the ones matching our categories
    pattern = r'(<div class="portfolio-card[^"]*"[^>]*data-cat="covers"[^>]*data-subcat="(?:cookbooks-food-wine|health-fitness)"[^>]*>.*?</div>\s*</div>\s*</div>)'
    matches = re.findall(pattern, html, re.DOTALL)
    print(f"Found {len(matches)} matching cards:")
    for i, card in enumerate(matches):
        print(f"\n--- Card {i+1} ---")
        print(card)

inspect_file('portfolio.html')
