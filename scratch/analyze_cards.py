import json
import re

# Load filtered missing covers
with open('scratch/missing_covers_filtered.json', 'r') as f:
    all_missing = json.load(f)

# Filter for July 11 covers only (the 64 covers user uploaded today)
july11_covers = [r for r in all_missing if r['created_at'].startswith('2026-07-11')]
print(f"July 11 covers to add: {len(july11_covers)}")

# Read existing index.html
with open('index.html', 'r', encoding='utf-8') as f:
    index_html = f.read()

# Read existing portfolio.html
with open('portfolio.html', 'r', encoding='utf-8') as f:
    portfolio_html = f.read()

# Find the existing cover card template by examining one existing card
# Extract a sample card to understand the structure
sample_match = re.search(r'(<div class="portfolio-card"[^>]*data-cat="covers".*?</div>\s*</div>\s*</div>)', index_html, re.DOTALL)
if sample_match:
    print("\nSample existing card found:")
    sample = sample_match.group(1)
    # Show first 500 chars
    print(sample[:500])
else:
    print("NO SAMPLE CARD FOUND!")

# Let's also check exactly what attributes a cover card has
cover_cards = re.findall(r'<div class="portfolio-card"([^>]*)data-cat="covers"([^>]*)>', index_html)
print(f"\nFound {len(cover_cards)} existing cover cards")
for i, (before, after) in enumerate(cover_cards[:3]):
    print(f"  Card {i+1} attrs: ...{before}data-cat=\"covers\"{after}")
