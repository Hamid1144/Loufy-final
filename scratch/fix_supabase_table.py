import re

with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the table name and identifier for portfolio
content = content.replace("supabase.from('pages').update({ html_content: portfolioDoc.body.innerHTML }).eq('slug', 'portfolio')",
                          "supabase.from('site_content').update({ html_content: portfolioDoc.body.innerHTML }).eq('id', 'portfolio')")

# Fix the table name and identifier for index
content = content.replace("supabase.from('pages').update({ html_content: indexDoc.body.innerHTML }).eq('slug', 'index')",
                          "supabase.from('site_content').update({ html_content: indexDoc.body.innerHTML }).eq('id', 'index')")

with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed table names in admin.html")
