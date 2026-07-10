import re

with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Add a debug alert to the modal save button
debug_injection = """
                        if (!portfolioDoc.body || !portfolioDoc.body.innerHTML) {
                            alert("DEBUG: portfolioDoc.body is empty!");
                        }
                        const pUp = await sbClient.from('site_content').upsert({ id: 'portfolio', html_content: portfolioDoc.body.innerHTML });
"""
content = content.replace(
    "const pUp = await sbClient.from('site_content').upsert({ id: 'portfolio', html_content: portfolioDoc.body.innerHTML });",
    debug_injection
)

with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Added debug alert to modal save button!")
