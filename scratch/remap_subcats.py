import re

mapping = {
    'childrens': 'childrens-books',
    'cooking': 'cookbooks-food-wine',
    'educational': 'education-teaching',
    'fantasy': 'science-fiction-fantasy',
    'fitness': 'health-fitness',
    'paranormal': 'horror',
    'business': 'business-money',
    'crime': 'crime-fiction',
    'spiritual': 'religion-spirituality',
    'religious': 'religion-spirituality',
    'wildlife': 'animals-wildlife'
}

def remap_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for old, new in mapping.items():
        # Replace data-subcat="..."
        content = re.sub(rf'data-subcat="{old}"', f'data-subcat="{new}"', content)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

remap_file('index.html')
remap_file('portfolio.html')
print("Done remapping!")
