import re

def simulate_filter(filepath, cat, activeSubCat, isMainPage=False, isEdit=False):
    print(f"\n--- Simulating filter on {filepath} (cat: {cat}, subcat: {activeSubCat}) ---")
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
        
    parts = html.split('<div class="portfolio-card')
    shown_count = 0
    hidden_count = 0
    
    # colsVal = 3, rowsVal = 0 (limit = 0)
    limit = 0
    activeCatFilteredCount = 0
    
    for part in parts[1:]:
        attr_match = re.match(r'^([^>]+)>', part)
        if not attr_match:
            continue
        attrs = attr_match.group(1)
        
        # Get cardCat
        cardCat_match = re.search(r'data-cat="([^"]*)"', attrs)
        cardCat = cardCat_match.group(1) if cardCat_match else ''
        
        # Get cardSubcat
        cardSubcat_match = re.search(r'data-subcat="([^"]*)"', attrs)
        cardSubcat = cardSubcat_match.group(1) if cardSubcat_match else ''
        
        # Get card title
        title_match = re.search(r'<h3[^>]*>(.*?)</h3>', part)
        title = title_match.group(1).strip() if title_match else 'no-title'
        
        # JS Logic simulation
        shouldShow = False
        if cat == 'all' or cardCat == cat:
            if cat == 'covers' and activeSubCat != 'all' and cardSubcat != activeSubCat:
                shouldShow = False
            else:
                if (cardCat == 'covers' or cardCat == 'formatting' or cardCat == 'paperback-covers') and isMainPage and not isEdit:
                    shouldShow = False
                else:
                    if not isMainPage or isEdit:
                        shouldShow = True
                    else:
                        if cat == 'all' and cardCat != 'covers' and cardCat != 'formatting' and cardCat != 'paperback-covers':
                            shouldShow = True
                        else:
                            shouldShow = True
                            
        if shouldShow and not isMainPage and cat != 'all' and limit > 0:
            if activeCatFilteredCount >= limit:
                shouldShow = False
            else:
                activeCatFilteredCount += 1
                
        if shouldShow:
            shown_count += 1
            if activeSubCat != 'all':
                print(f"  [SHOW] Title: '{title}', subcat: '{cardSubcat}'")
        else:
            hidden_count += 1
            
    print(f"Result: Shown: {shown_count}, Hidden: {hidden_count}")

# Simulate for portfolio.html
simulate_filter('portfolio.html', 'covers', 'cookbooks-food-wine')
simulate_filter('portfolio.html', 'covers', 'health-fitness')
simulate_filter('portfolio.html', 'covers', 'all')
