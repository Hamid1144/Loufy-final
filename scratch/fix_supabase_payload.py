import re

with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix the main save button (cleanDocHTML)
content = content.replace("return '<!DOCTYPE html>\\n' + clone.outerHTML;", "return clone.body.innerHTML;")

# 2. Fix the modal save button
content = content.replace(
    "await sbClient.from('site_content').update({ html_content: '<!DOCTYPE html>\\n' + portfolioDoc.documentElement.outerHTML }).eq('id', 'portfolio');",
    "await sbClient.from('site_content').update({ html_content: portfolioDoc.body.innerHTML }).eq('id', 'portfolio');"
)

content = content.replace(
    "await sbClient.from('site_content').update({ html_content: '<!DOCTYPE html>\\n' + indexDoc.documentElement.outerHTML }).eq('id', 'index');",
    "await sbClient.from('site_content').update({ html_content: indexDoc.body.innerHTML }).eq('id', 'index');"
)

with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed Supabase payload to be body.innerHTML only!")
