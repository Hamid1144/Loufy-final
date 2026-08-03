import re
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()
print("Cards:", len(re.findall(r'<div class="portfolio-card', html)))
