import re

with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "await sbClient.from('site_content').upsert({ id: 'portfolio', html_content: portfolioDoc.body.innerHTML });",
    "const pUp = await sbClient.from('site_content').upsert({ id: 'portfolio', html_content: portfolioDoc.body.innerHTML }); if (pUp.error) throw pUp.error;"
)

content = content.replace(
    "await sbClient.from('site_content').upsert({ id: 'index', html_content: indexDoc.body.innerHTML });",
    "const iUp = await sbClient.from('site_content').upsert({ id: 'index', html_content: indexDoc.body.innerHTML }); if (iUp.error) throw iUp.error;"
)

with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Added error checks to modal save button!")
