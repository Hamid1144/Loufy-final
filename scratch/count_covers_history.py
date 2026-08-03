import re
import subprocess

# Check ALL commits in reflog from today to find maximum cover count
commits_to_check = [
    '4511fe7',  # perf: optimize all cover and formatting images (Jun 15)
    '5268891',  # Add Book Covers subcategories filter (Jul 10 21:38)
    '6483375',  # Fix portfolio subcategory clickability (Jul 10 21:47)
    '20b3419',  # Save website before adding subcategories (Jul 10 21:28)
    '8455e09',  # Save website before subcategory manager (Jul 10 22:22)
    '1b9bd26',  # Save website before adding manage subcategories (Jul 10 22:52)
    'd58bb4a',  # Replace subcategories with exact 20 (Jul 11 06:07)
    'a1dc6cb',  # Add Health & Fitness and Technology (Jul 11 06:55)
]

for commit in commits_to_check:
    try:
        msg_result = subprocess.run(['git', 'log', '-1', '--format=%h %cd %s', commit], capture_output=True, text=True, encoding='utf-8')
        msg = msg_result.stdout.strip()
        
        result = subprocess.run(['git', 'show', f'{commit}:index.html'], capture_output=True, text=True, encoding='utf-8')
        html = result.stdout
        
        covers = len(re.findall(r'data-cat="covers"', html))
        total_cards = len(re.findall(r'<div class="portfolio-card', html))
        
        print(f"{msg}  =>  Covers: {covers}, Total cards: {total_cards}")
    except Exception as e:
        print(f"{commit}: ERROR - {e}")
