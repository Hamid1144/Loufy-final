import re

with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "return clone.body.innerHTML;",
    "return clone.querySelector('body') ? clone.querySelector('body').innerHTML : clone.innerHTML;"
)

with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed cleanDocHTML body.innerHTML error!")
