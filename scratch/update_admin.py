import re

with open('admin.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update addItemCategory change listener
old_listener = """            if (typeof updateAddItemLayoutHighlights === 'function') {
                updateAddItemLayoutHighlights();
            }
        });
    }"""

new_listener = """            if (typeof updateAddItemLayoutHighlights === 'function') {
                updateAddItemLayoutHighlights();
            }
            
            const subContainer = document.getElementById('add-item-subcategory-container');
            if (subContainer) {
                if (val === 'covers') {
                    subContainer.style.display = 'flex';
                } else {
                    subContainer.style.display = 'none';
                }
            }
        });
    }"""

content = content.replace(old_listener, new_listener)

# 2. Update confirmAddItemBtn logic
old_confirm = """            const cat = addItemCategory ? addItemCategory.value : 'covers';
            const layoutRadio = addItemModal ? addItemModal.querySelector('input[name="add-item-layout"]:checked') : null;"""

new_confirm = """            const cat = addItemCategory ? addItemCategory.value : 'covers';
            const subcatSelect = document.getElementById('add-item-subcategory');
            const subcat = (subcatSelect && cat === 'covers') ? subcatSelect.value : '';
            const layoutRadio = addItemModal ? addItemModal.querySelector('input[name="add-item-layout"]:checked') : null;"""

content = content.replace(old_confirm, new_confirm)


old_setattr = """            newItem.className = 'portfolio-card reveal active';
            newItem.setAttribute('data-cat', cat.toLowerCase());
            
            if (layout === 'full-width') {"""

new_setattr = """            newItem.className = 'portfolio-card reveal active';
            newItem.setAttribute('data-cat', cat.toLowerCase());
            if (subcat) {
                newItem.setAttribute('data-subcat', subcat);
            }
            
            if (layout === 'full-width') {"""

content = content.replace(old_setattr, new_setattr)

with open('admin.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated admin.js")
