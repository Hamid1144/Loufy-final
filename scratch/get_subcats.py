import re
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()
print(set(re.findall(r'data-subcat="([^"]+)"', html)))
