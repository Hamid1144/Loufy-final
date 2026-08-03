import re
import subprocess

# The auto-sync from GitHub Actions is from the live site but only has 2 covers
# Let me check ALL commits that have data-subcat on covers - maybe the local save commits have them

# These are the local "Save website" commits that were done from Supabase fetch
commits = [
    '1c7cb92',  # Save website: sync latest live changes from Supabase (Jul 10 04:24)
    '20b3419',  # Save website before adding subcategories (Jul 10 21:28)
    '8455e09',  # Save website before subcategory manager (Jul 10 22:22)
    '1b9bd26',  # Save website before adding manage subcategories (Jul 10 22:52)
    '52ae1e8',  # Restore subcategories missing from previous bad merge
    '0bf5cab',  # Add dynamic Subcategory Manager UI
    '5268891',  # Add Book Covers subcategories filter and admin panel integration
    '6483375',  # Fix portfolio subcategory clickability
    'd58bb4a',  # Replace subcategories with exact 20
    'a1dc6cb',  # Add Health & Fitness and Technology
]

for commit in commits:
    try:
        msg_result = subprocess.run(['git', 'log', '-1', '--format=%h %cd %s', commit], capture_output=True, text=True, encoding='utf-8')
        msg = msg_result.stdout.strip()
        
        result = subprocess.run(['git', 'show', f'{commit}:index.html'], capture_output=True, text=True, encoding='utf-8')
        html = result.stdout
        
        cover_data = []
        for m in re.finditer(r'<div class="portfolio-card[^"]*"([^>]*data-cat="covers"[^>]*)>(.*?)</div>\s*</div>\s*</div>', html, re.DOTALL):
            attrs = m.group(1)
            body = m.group(2)
            
            subcat_match = re.search(r'data-subcat="([^"]*)"', attrs)
            subcat = subcat_match.group(1) if subcat_match else 'none'
            
            img_match = re.search(r'src="([^"]+)"', body)
            img_url = img_match.group(1) if img_match else 'no-img'
            
            pid_match = re.search(r'/portfolio/([^."]+)', img_url)
            pid = pid_match.group(1) if pid_match else 'unknown'
            
            cover_data.append((pid, subcat))
        
        covers_with_subcat = [(pid, sc) for pid, sc in cover_data if sc != 'none']
        
        print(f"\n=== {msg} ===")
        print(f"  Total covers: {len(cover_data)}, With subcats: {len(covers_with_subcat)}")
        if covers_with_subcat:
            for pid, sc in covers_with_subcat:
                print(f"    {pid} => {sc}")
    except Exception as e:
        print(f"\n=== {commit}: ERROR - {e} ===")
