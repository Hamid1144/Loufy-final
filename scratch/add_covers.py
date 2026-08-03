import json
import re

# Load the 64 July 11 covers
with open('scratch/missing_covers_filtered.json', 'r') as f:
    all_missing = json.load(f)

july11_covers = [r for r in all_missing if r['created_at'].startswith('2026-07-11')]
print(f"Adding {len(july11_covers)} covers from July 11")

# Generate HTML cards for each cover
def make_card(public_id, fmt):
    pid = public_id  # e.g. "portfolio/emztizw2oplmgi9a0rz9"
    ext = fmt  # e.g. "jpg"
    url = f"https://res.cloudinary.com/dtr3yvjac/image/upload/f_auto,q_auto/{pid}.{ext}"
    srcset_480 = f"https://res.cloudinary.com/dtr3yvjac/image/upload/f_auto,q_auto,w_480/{pid}.{ext} 480w"
    srcset_800 = f"https://res.cloudinary.com/dtr3yvjac/image/upload/f_auto,q_auto,w_800/{pid}.{ext} 800w"
    srcset_1200 = f"https://res.cloudinary.com/dtr3yvjac/image/upload/f_auto,q_auto,w_1200/{pid}.{ext} 1200w"
    
    return f'''<div class="portfolio-card reveal" data-cat="covers" data-layout="default" style="">
                    <div class="portfolio-thumb">
                        <img src="{url}" alt="Book Cover" data-optimized="true" srcset="{srcset_480}, {srcset_800}, {srcset_1200}">
                    </div>
                    <div class="portfolio-info">
                        <div class="tags"><span data-admin-text="true">Book Cover</span></div>
                        <h3 data-admin-text="true">Book Cover</h3>
                    </div>
                </div>
'''

# Generate all new cards HTML
new_cards_html = "\n"
for cover in july11_covers:
    new_cards_html += make_card(cover['public_id'], cover['format'])

print(f"Generated {len(july11_covers)} card HTML blocks")

# Insert into index.html - right before the first formatting card
# The last cover card ends at line 968 with </div>, and line 969 is blank
# Line 970 starts the first formatting card

for filename in ['index.html', 'portfolio.html']:
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the position: insert before the first data-cat="formatting" card
    # We'll find the first <div class="portfolio-card reveal" data-cat="formatting"
    match = re.search(r'\n(<div class="portfolio-card reveal" data-cat="formatting")', content)
    if match:
        insert_pos = match.start()
        new_content = content[:insert_pos] + new_cards_html + content[insert_pos:]
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        # Count total covers now
        total_covers = len(re.findall(r'data-cat="covers"', new_content)) - 1  # minus the filter button
        print(f"Updated {filename}: now has {total_covers} cover cards")
    else:
        print(f"WARNING: Could not find formatting card insertion point in {filename}")
        # Try alternative: insert after the last covers card
        # Find all cover card blocks and insert after the last one
        last_cover = None
        for m in re.finditer(r'(<div class="portfolio-card reveal" data-cat="covers".*?</div>\s*</div>\s*</div>)', content, re.DOTALL):
            last_cover = m
        
        if last_cover:
            insert_pos = last_cover.end()
            new_content = content[:insert_pos] + new_cards_html + content[insert_pos:]
            
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            total_covers = len(re.findall(r'data-cat="covers"', new_content)) - 1
            print(f"Updated {filename} (alt method): now has {total_covers} cover cards")
        else:
            print(f"ERROR: Could not find any cover cards in {filename}!")

print("\nDone! Now commit and push.")
