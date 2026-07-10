import re

with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update CATEGORY_KEYWORDS to be an empty array for covers initially
old_kw = "'covers': ['Business', \"Children's\", 'Crime', 'Cooking', 'Educational', 'Fantasy', 'Fitness', 'Historical Fiction', 'Horror', 'Mystery', 'Paranormal', 'Poetry', 'Psychology', 'Religious', 'Romance', 'Science Fiction', 'Spiritual', 'Technology', 'Travel', 'Wildlife'],"
new_kw = "'covers': [], // Will be populated dynamically"
content = content.replace(old_kw, new_kw)

# 2. Add global validSubcats mapping near CATEGORY_KEYWORDS
old_cat_kw_decl = "const CATEGORY_KEYWORDS = {"
new_cat_kw_decl = "let validSubcats = {};\n    const CATEGORY_KEYWORDS = {"
content = content.replace(old_cat_kw_decl, new_cat_kw_decl)

# 3. Add logic in loadPortfolioItems to populate covers and validSubcats
old_load_items = """    function loadPortfolioItems() {
      portfolioItems = [];
      const grid = portfolioDoc.querySelector('.portfolio-grid');"""

new_load_items = """    function loadPortfolioItems() {
      portfolioItems = [];
      
      const subButtons = portfolioDoc.querySelectorAll('#book-covers-sub-filters .sub-filter-btn:not([data-subcat="all"])');
      const coversKWs = [];
      validSubcats = {};
      if (subButtons) {
        subButtons.forEach(btn => {
           const name = btn.textContent.trim();
           const slug = btn.getAttribute('data-subcat');
           if (name && slug) {
               coversKWs.push(name);
               validSubcats[name] = slug;
           }
        });
      }
      CATEGORY_KEYWORDS['covers'] = coversKWs;
      
      const grid = portfolioDoc.querySelector('.portfolio-grid');"""

content = content.replace(old_load_items, new_load_items)

# 4. Remove the hardcoded validSubcats in the save handler
old_hardcoded_subcats = """         const validSubcats = {
            'Business': 'business',
            "Children's": 'childrens',
            'Crime': 'crime',
            'Cooking': 'cooking',
            'Educational': 'educational',
            'Fantasy': 'fantasy',
            'Fitness': 'fitness',
            'Historical Fiction': 'historical-fiction',
            'Horror': 'horror',
            'Mystery': 'mystery',
            'Paranormal': 'paranormal',
            'Poetry': 'poetry',
            'Psychology': 'psychology',
            'Religious': 'religious',
            'Romance': 'romance',
            'Science Fiction': 'science-fiction',
            'Spiritual': 'spiritual',
            'Technology': 'technology',
            'Travel': 'travel',
            'Wildlife': 'wildlife'
         };"""

new_hardcoded_subcats = """         // validSubcats is now populated globally in loadPortfolioItems()"""
content = content.replace(old_hardcoded_subcats, new_hardcoded_subcats)

with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated admin.html")
