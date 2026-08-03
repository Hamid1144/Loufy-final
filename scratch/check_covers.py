import re
with open('scratch/portfolio_html.html', 'r', encoding='utf-8') as f:
    html = f.read()
matches = re.findall(r'<div class="portfolio-card', html)
print(f"Number of covers in backup: {len(matches)}")

with open('portfolio.html', 'r', encoding='utf-8') as f:
    html2 = f.read()
matches2 = re.findall(r'<div class="portfolio-card', html2)
print(f"Number of covers in local portfolio.html: {len(matches2)}")

with open('index.html', 'r', encoding='utf-8') as f:
    html3 = f.read()
matches3 = re.findall(r'<div class="portfolio-card', html3)
print(f"Number of covers in local index.html: {len(matches3)}")
