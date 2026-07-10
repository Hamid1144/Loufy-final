import re

with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the DOMContentLoaded wrapper with an IIFE or just inline
old_js_start = """  <script>
    // Subcategory Manager Dashboard Logic
    document.addEventListener('DOMContentLoaded', () => {"""

new_js_start = """  <script>
    // Subcategory Manager Dashboard Logic
    (function() {"""
content = content.replace(old_js_start, new_js_start)

old_js_end = """        }
    });
  </script>
</body>"""

new_js_end = """        }
    })();
  </script>
</body>"""
content = content.replace(old_js_end, new_js_end)

with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated admin.html to remove DOMContentLoaded wrapper")
