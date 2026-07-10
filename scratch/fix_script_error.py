import re

# 1. Fix script.js syntax error (ReferenceError: cat is not defined)
with open('script.js', 'r', encoding='utf-8') as f:
    script_content = f.read()

bad_code = """        const isEdit = document.body.classList.contains('edit-mode');
      
      const subFilters = document.getElementById('book-covers-sub-filters');
      if (subFilters) {
        if (cat === 'covers') {
          subFilters.style.display = 'flex';
        } else {
          subFilters.style.display = 'none';
        }
      }
  const activeFilter = document.querySelector('.filter-btn.active');"""

good_code = """  const isEdit = document.body.classList.contains('edit-mode');
  const activeFilter = document.querySelector('.filter-btn.active');
  const cat = activeFilter ? activeFilter.dataset.cat : 'all';
  
  const subFilters = document.getElementById('book-covers-sub-filters');
  if (subFilters) {
    if (cat === 'covers') {
      subFilters.style.display = 'flex';
    } else {
      subFilters.style.display = 'none';
    }
  }"""

script_content = script_content.replace(bad_code, good_code)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(script_content)
print("Fixed script.js ReferenceError")
