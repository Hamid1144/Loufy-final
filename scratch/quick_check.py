import re
html = open('index.html','r',encoding='utf-8').read()
s = re.findall(r'data-cat="covers"[^>]*data-subcat="([^"]+)"', html)
print(f'Current covers with subcats: {len(s)}')
print(s)

# Also count total covers
total = len(re.findall(r'data-cat="covers"', html)) - 1  # -1 for filter button
print(f'Total cover cards: {total}')
print(f'Covers WITHOUT subcats: {total - len(s)}')
