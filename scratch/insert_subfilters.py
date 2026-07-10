import re

subcats = [
    ('all', 'All'), ('business', 'Business'), ('childrens', "Children's"),
    ('crime', 'Crime'), ('cooking', 'Cooking'), ('educational', 'Educational'),
    ('fantasy', 'Fantasy'), ('fitness', 'Fitness'), ('historical-fiction', 'Historical Fiction'),
    ('horror', 'Horror'), ('mystery', 'Mystery'), ('paranormal', 'Paranormal'),
    ('poetry', 'Poetry'), ('psychology', 'Psychology'), ('religious', 'Religious'),
    ('romance', 'Romance'), ('science-fiction', 'Science Fiction'), ('spiritual', 'Spiritual'),
    ('technology', 'Technology'), ('travel', 'Travel'), ('wildlife', 'Wildlife')
]

buttons_html = '\n'.join([f'<button class="sub-filter-btn{" active" if k=="all" else ""}" data-subcat="{k}">{v}</button>' for k, v in subcats])

sub_filters_html = f'''
<div class="sub-filter-buttons" style="display: none;" id="book-covers-sub-filters">
{buttons_html}
</div>
'''

for filepath in ['index.html', 'portfolio.html']:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    parts = re.split(r'(<div class="portfolio-grid)', content, maxsplit=1)
    if len(parts) > 1:
        new_content = parts[0] + sub_filters_html + parts[1] + parts[2]
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")
    else:
        print(f"Could not find portfolio-grid in {filepath}")
