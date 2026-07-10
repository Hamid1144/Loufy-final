import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add sub-filter logic inside the .filter-btn click event handler
sub_filter_display_logic = """      const isEdit = document.body.classList.contains('edit-mode');
      
      const subFilters = document.getElementById('book-covers-sub-filters');
      if (subFilters) {
        if (cat === 'covers') {
          subFilters.style.display = 'flex';
        } else {
          subFilters.style.display = 'none';
        }
      }"""

content = content.replace("const isEdit = document.body.classList.contains('edit-mode');", sub_filter_display_logic)

# 2. Add the check for activeSubCat in the portfolio-grid loop
card_check_logic = """        let shouldShow = false;

        if (cat === 'all' || cardCat === cat) {
          const activeSubCatBtn = document.querySelector('.sub-filter-btn.active');
          const activeSubCat = activeSubCatBtn ? activeSubCatBtn.dataset.subcat : 'all';
          if (cat === 'covers' && activeSubCat !== 'all' && card.dataset.subcat !== activeSubCat) {
            shouldShow = false;
          } else {
            if ((cardCat === 'covers' || cardCat === 'formatting' || cardCat === 'paperback-covers') && isMainPage && !isEdit) {"""

# Replace the specific lines inside the loop
old_card_check = """        let shouldShow = false;

        if (cat === 'all' || cardCat === cat) {
          if ((cardCat === 'covers' || cardCat === 'formatting' || cardCat === 'paperback-covers') && isMainPage && !isEdit) {"""

content = content.replace(old_card_check, card_check_logic)

# Since we added an "else {", we need to add a closing brace "}" for it.
# The old code had:
old_card_close = """                shouldShow = true;
              }
            }
          }
        }

        if (shouldShow && !isMainPage && cat !== 'all' && limit > 0) {"""

new_card_close = """                shouldShow = true;
              }
            }
          }
          } // Close the new else block
        }

        if (shouldShow && !isMainPage && cat !== 'all' && limit > 0) {"""

content = content.replace(old_card_close, new_card_close)

# 3. Add the .sub-filter-btn click listeners
sub_filter_listeners = """
  // Sub-category filters
  document.querySelectorAll('.sub-filter-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      document.querySelectorAll('.sub-filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const activeMainFilter = document.querySelector('.filter-btn.active');
      if (activeMainFilter) activeMainFilter.click();
    });
  });
"""

# Let's insert this just before `// Initial load`
content = content.replace("// Initial load", sub_filter_listeners + "\n  // Initial load")

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated script.js")
