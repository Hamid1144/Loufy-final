import re
with open('scratch/portfolio_html.html', 'r', encoding='utf-8') as f:
    html = f.read()
matches = re.findall(r'data-cat="covers"', html)
print(f"Number of 'covers' in backup: {len(matches)}")

with open('index.html', 'r', encoding='utf-8') as f:
    html2 = f.read()
matches2 = re.findall(r'data-cat="covers"', html2)
print(f"Number of 'covers' in local index.html: {len(matches2)}")
