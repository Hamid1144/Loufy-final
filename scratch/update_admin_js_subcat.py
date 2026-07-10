import re

with open('admin.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Clear hardcoded subcategories in HTML modal
old_subcat_html = """                    <select id="add-item-subcategory" style="padding:10px; border-radius:6px; border:1px solid #444; background:#111; color:#fff; font-size:0.85rem; cursor:pointer; width:100%;">
                        <option value="business">Business</option>
                        <option value="childrens">Children's</option>
                        <option value="crime">Crime</option>
                        <option value="cooking">Cooking</option>
                        <option value="educational">Educational</option>
                        <option value="fantasy">Fantasy</option>
                        <option value="fitness">Fitness</option>
                        <option value="historical-fiction">Historical Fiction</option>
                        <option value="horror">Horror</option>
                        <option value="mystery">Mystery</option>
                        <option value="paranormal">Paranormal</option>
                        <option value="poetry">Poetry</option>
                        <option value="psychology">Psychology</option>
                        <option value="religious">Religious</option>
                        <option value="romance">Romance</option>
                        <option value="science-fiction">Science Fiction</option>
                        <option value="spiritual">Spiritual</option>
                        <option value="technology">Technology</option>
                        <option value="travel">Travel</option>
                        <option value="wildlife">Wildlife</option>
                    </select>"""

new_subcat_html = """                    <select id="add-item-subcategory" style="padding:10px; border-radius:6px; border:1px solid #444; background:#111; color:#fff; font-size:0.85rem; cursor:pointer; width:100%;">
                        <!-- Populated dynamically -->
                    </select>"""
content = content.replace(old_subcat_html, new_subcat_html)

# 2. Add populateAddItemSubcategories function
populate_subcat_func = """
    function populateAddItemSubcategories() {
        const subcatSelect = document.getElementById("add-item-subcategory");
        if (!subcatSelect) return;
        subcatSelect.innerHTML = '';
        
        const subButtons = document.querySelectorAll('#book-covers-sub-filters .sub-filter-btn:not([data-subcat="all"])');
        if (subButtons && subButtons.length > 0) {
            subButtons.forEach(btn => {
                const name = btn.textContent.trim();
                const slug = btn.getAttribute('data-subcat');
                if (name && slug) {
                    const opt = document.createElement('option');
                    opt.value = slug;
                    opt.textContent = name;
                    subcatSelect.appendChild(opt);
                }
            });
        }
    }
"""

old_pop_cat = """    function populateAddItemCategories() {"""
new_pop_cat = populate_subcat_func + "\n    function populateAddItemCategories() {"
content = content.replace(old_pop_cat, new_pop_cat)

# 3. Call populateAddItemSubcategories
old_call = """            populateAddItemCategories();
            
            // Set defaults"""

new_call = """            populateAddItemCategories();
            populateAddItemSubcategories();
            
            // Set defaults"""
content = content.replace(old_call, new_call)


with open('admin.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated admin.js")
