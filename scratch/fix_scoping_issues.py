import re

with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Expose CATEGORY_KEYWORDS
content = content.replace("const CATEGORY_KEYWORDS = {", "window.CATEGORY_KEYWORDS = {\n    const CATEGORY_KEYWORDS = window.CATEGORY_KEYWORDS; // legacy alias\n    window.CATEGORY_KEYWORDS = {")
content = content.replace("    const CATEGORY_KEYWORDS = {\n      'covers': [],", "    window.CATEGORY_KEYWORDS = {\n      'covers': [],")

# Expose validSubcats
content = content.replace("let validSubcats = {};", "window.validSubcats = {};")

# Expose renderKeywordPills
content = content.replace("function renderKeywordPills() {", "window.renderKeywordPills = function() {")

# Fix all internal references
content = content.replace("CATEGORY_KEYWORDS[", "window.CATEGORY_KEYWORDS[")
content = content.replace("renderKeywordPills(", "window.renderKeywordPills(")
content = content.replace("validSubcats[", "window.validSubcats[")

# Fix the checks in the save logic
content = content.replace("typeof CATEGORY_KEYWORDS", "typeof window.CATEGORY_KEYWORDS")
content = content.replace("typeof validSubcats", "typeof window.validSubcats")
content = content.replace("typeof renderKeywordPills", "typeof window.renderKeywordPills")

# Clean up any potential validSubcats re-assignments in loadPortfolioItems
content = content.replace("validSubcats = {};", "window.validSubcats = {};")

with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Exposed scoped variables to window!")
