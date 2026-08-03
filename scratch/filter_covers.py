import json

with open('scratch/missing_covers.json', 'r') as f:
    all_missing = json.load(f)

# Filter OUT hero_frames, logos, test images, and small images
# Book covers uploaded by user are typically 2560x1920, 2560x1440, 2560x2027, etc.
# Exclude hero_frames subfolder
# Exclude very small images (logos, icons)

book_covers = []
for r in all_missing:
    pid = r['public_id']
    w = r['width']
    h = r['height']
    
    # Skip hero_frames
    if 'hero_frames' in pid:
        continue
    
    # Skip test images
    if 'test_pixel' in pid:
        continue
    
    # Skip base64 images (already in site as inline)
    if 'base64_' in pid:
        continue
    
    # Skip small images (logos, icons) - book covers are at least 1000px on one side
    if w < 1000 and h < 1000:
        continue
    
    book_covers.append(r)

print(f"Filtered book covers (excluding hero_frames, logos, test): {len(book_covers)}")

# Group by date
from collections import defaultdict
by_date = defaultdict(list)
for r in book_covers:
    date = r['created_at'][:10]  # YYYY-MM-DD
    by_date[date].append(r)

print("\n=== By upload date ===")
for date in sorted(by_date.keys()):
    items = by_date[date]
    print(f"  {date}: {len(items)} covers")
    for r in items:
        print(f"    - {r['public_id']} ({r['width']}x{r['height']})")

# Save filtered list
with open('scratch/missing_covers_filtered.json', 'w') as f:
    json.dump(book_covers, f, indent=2)

print(f"\nTotal filtered missing covers: {len(book_covers)}")
print(f"Saved to scratch/missing_covers_filtered.json")
