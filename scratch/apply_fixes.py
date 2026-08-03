import glob
import re

files = glob.glob('*.html')
for file in files:
    if 'supabase_index_raw' in file or 'portfolio_html' in file:
        continue
        
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # cache buster
    content = re.sub(r'href="style\.css(\?v=\d+)?"', 'href="style.css?v=2"', content)
    
    # Text truncation
    old_text = 'Publish your book with confidence on Amazon KDP, IngramSpark, Barnes & Noble, Lulu, and other major platforms. We handle everything from setup to launch, ensuring your book is professionally prepared for worldwide distribution.</p>'
    new_text = 'Publish your book with confidence on major platforms. We handle everything from setup to launch, ensuring your book is professionally prepared.</p>'
    
    content = content.replace(old_text, new_text)
    
    # CTA fix
    old_cta = '<a href="#" class="learn-more" data-admin-text="true">Start Publishing →</a>'
    new_cta = '<a href="#" class="learn-more" data-admin-text="true">Learn More →</a>'
    
    content = content.replace(old_cta, new_cta)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("Fixed successfully")
