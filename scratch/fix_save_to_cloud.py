import re

with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace body.innerHTML with documentElement.outerHTML
content = content.replace(
    "await window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY).from('site_content').update({ html_content: portfolioDoc.body.innerHTML }).eq('id', 'portfolio');",
    "await window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY).from('site_content').update({ html_content: '<!DOCTYPE html>\\n' + portfolioDoc.documentElement.outerHTML }).eq('id', 'portfolio');"
)

content = content.replace(
    "await window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY).from('site_content').update({ html_content: indexDoc.body.innerHTML }).eq('id', 'index');",
    "await window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY).from('site_content').update({ html_content: '<!DOCTYPE html>\\n' + indexDoc.documentElement.outerHTML }).eq('id', 'index');"
)

with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed Save to Cloud logic!")
