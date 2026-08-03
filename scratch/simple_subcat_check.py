import re
import subprocess

# The regex might be too strict. Let me use a simpler approach:
# Just find ALL lines with data-cat="covers" and data-subcat in any commit

commits = [
    '8455e09',  # Save website before subcategory manager (Jul 10 22:22)
    '1b9bd26',  # Save website before adding manage subcategories (Jul 10 22:52)
    'd58bb4a',  # Replace subcategories with exact 20
    'a1dc6cb',  # Add Health & Fitness and Technology
]

for commit in commits:
    msg_result = subprocess.run(['git', 'log', '-1', '--format=%h %cd %s', commit], capture_output=True, text=True, encoding='utf-8')
    msg = msg_result.stdout.strip()
    
    result = subprocess.run(['git', 'show', f'{commit}:index.html'], capture_output=True, text=True, encoding='utf-8')
    html = result.stdout
    
    # Count total cover cards
    total = len(re.findall(r'data-cat="covers"', html))
    # Find lines with both data-cat="covers" AND data-subcat
    subcat_lines = re.findall(r'data-cat="covers"[^>]*data-subcat="([^"]+)"', html)
    
    print(f"\n=== {msg} ===")
    print(f"  Lines with data-cat=covers: {total}")
    print(f"  Lines with data-subcat: {len(subcat_lines)}")
    if subcat_lines:
        from collections import Counter
        print(f"  Subcats: {dict(Counter(subcat_lines))}")
    
    # Also check if subcat comes BEFORE data-cat
    subcat_before = re.findall(r'data-subcat="([^"]+)"[^>]*data-cat="covers"', html)
    if subcat_before:
        print(f"  Subcats (before data-cat): {len(subcat_before)}")
