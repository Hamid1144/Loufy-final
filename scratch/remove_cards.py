import re

filepath = 'index.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

new_content = re.sub(r'(?s)<div class="[^"]*portfolio-card[^"]*"[^>]*data-cat="a-plus-content"[^>]*>.*?<div class="portfolio-info">.*?</div>\s*</div>\s*', '', content)

print(f"Original length: {len(content)}, New length: {len(new_content)}")

with open(filepath, 'w', encoding='utf-8', newline='') as f:
    f.write(new_content)
