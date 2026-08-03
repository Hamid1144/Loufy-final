import re

# Load portfolio.html
with open('portfolio.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Setup simulation state
isMainPage = False
isEdit = False

# Represent buttons and cards
class Element:
    def __init__(self, tag_name, attrs, text=""):
        self.tag_name = tag_name
        self.attrs = attrs
        self.dataset = attrs
        self.text = text
        self.style = {}
        self.classes = attrs.get('class', '').split()
        
    def getAttribute(self, name):
        return self.attrs.get(name)

# Parse sub-filter buttons
sub_filters = []
btn_matches = re.finditer(r'<button class="sub-filter-btn([^"]*)"[^>]*data-subcat="([^"]*)"[^>]*>(.*?)</button>', html)
for m in btn_matches:
    class_str, subcat, text = m.groups()
    classes = "sub-filter-btn " + class_str
    sub_filters.append(Element('button', {'class': classes, 'data-subcat': subcat}, text))

# Parse cards
cards = []
# We split by '<div class="portfolio-card' to find all card elements
parts = html.split('<div class="portfolio-card')
for part in parts[1:]:
    attr_match = re.match(r'^([^>]+)>', part)
    if attr_match:
        attrs_str = attr_match.group(1)
        # Parse attributes
        attrs = {}
        for attr_m in re.finditer(r'([\w\-]+)="([^"]*)"', attrs_str):
            attrs[attr_m.group(1)] = attr_m.group(2)
        
        # Get title
        title_match = re.search(r'<h3[^>]*>(.*?)</h3>', part)
        title = title_match.group(1).strip() if title_match else ""
        
        cards.append(Element('div', attrs, title))

print(f"Parsed {len(sub_filters)} sub-filter buttons and {len(cards)} cards.")

def simulate_filter_click(active_cat, active_subcat):
    print(f"\n--- Simulating clicks: cat={active_cat}, subcat={active_subcat} ---")
    
    # Mock script.js filter logic
    cat = active_cat
    activeSubCat = active_subcat
    
    colsVal = 3 if cat == 'covers' else 2
    rowsVal = 0
    limit = colsVal * rowsVal
    activeCatFilteredCount = 0
    
    shown_cards = []
    hidden_cards = []
    
    for card in cards:
        cardCat = card.dataset.get('data-cat')
        card_subcat = card.dataset.get('data-subcat')
        
        shouldShow = False
        if cat == 'all' or cardCat == cat:
            if cat == 'covers' and activeSubCat != 'all' and card_subcat != activeSubCat:
                shouldShow = False
            else:
                if (cardCat in ['covers', 'formatting', 'paperback-covers']) and isMainPage and not isEdit:
                    shouldShow = False
                else:
                    if not isMainPage or isEdit:
                        shouldShow = True
        
        if shouldShow and not isMainPage and cat != 'all' and limit > 0:
            if activeCatFilteredCount >= limit:
                shouldShow = False
            else:
                activeCatFilteredCount += 1
                
        if shouldShow:
            card.style['display'] = 'block'
            shown_cards.append(card)
        else:
            card.style['display'] = 'none'
            hidden_cards.append(card)
            
    print(f"Total shown cards: {len(shown_cards)}")
    for idx, c in enumerate(shown_cards):
        print(f"  {idx+1}. Title: '{c.text}', Subcat: '{c.dataset.get('data-subcat')}', Cat: '{c.dataset.get('data-cat')}'")

# Simulate default load (Book Covers, All)
simulate_filter_click('covers', 'all')

# Simulate cookbooks
simulate_filter_click('covers', 'cookbooks-food-wine')

# Simulate health-fitness
simulate_filter_click('covers', 'health-fitness')
