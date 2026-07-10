import re

with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "await sbClient.from('site_content').update({ html_content: portfolioDoc.body.innerHTML }).eq('id', 'portfolio');",
    "await sbClient.from('site_content').upsert({ id: 'portfolio', html_content: portfolioDoc.body.innerHTML });"
)

content = content.replace(
    "await sbClient.from('site_content').update({ html_content: indexDoc.body.innerHTML }).eq('id', 'index');",
    "await sbClient.from('site_content').upsert({ id: 'index', html_content: indexDoc.body.innerHTML });"
)

with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Replaced update with upsert!")
