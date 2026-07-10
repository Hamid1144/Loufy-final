import re

with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Manage Subcategories button under tags selector
old_tags_div = """          <div id="portfolio-tags-selector" style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px;"></div>
        </div>"""
new_tags_div = """          <div id="portfolio-tags-selector" style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px;"></div>
          <div id="manage-subcats-dashboard-container" style="display:none; margin-top:15px; border-top:1px solid #333; padding-top:10px;">
              <button type="button" id="manage-subcats-dashboard-btn" style="padding:6px 12px; border-radius:6px; background:#dc3545; color:#fff; border:none; cursor:pointer; font-size:0.8rem; width:100%;"><i class="fa-solid fa-list-ul"></i> Manage Covers Subcategories</button>
          </div>
        </div>"""
content = content.replace(old_tags_div, new_tags_div)


# 2. Toggle button visibility in renderKeywordPills
old_render_pills = """      const cat = document.getElementById('form-portfolio-cat').value;
      const keywords = CATEGORY_KEYWORDS[cat] || [];"""

new_render_pills = """      const cat = document.getElementById('form-portfolio-cat').value;
      const keywords = CATEGORY_KEYWORDS[cat] || [];
      
      const subcatContainer = document.getElementById('manage-subcats-dashboard-container');
      if (subcatContainer) {
          subcatContainer.style.display = (cat === 'covers') ? 'block' : 'none';
      }"""
content = content.replace(old_render_pills, new_render_pills)


# 3. Add Modal HTML and JS Logic just before closing body tag
manager_html_js = """
  <!-- Subcategory Manager Modal (Dashboard) -->
  <div id="dashboard-subcat-modal" class="modal-overlay" style="display:none; z-index:999999;">
    <div class="modal-content" style="max-height: 80vh; overflow-y: auto; width:90%; max-width:500px;">
      <div class="modal-header" style="border-bottom:1px solid #333; padding-bottom:12px;">
        <h3 style="color:#dc3545; display:flex; align-items:center; gap:8px;"><i class="fa-solid fa-list-ul"></i> Manage Subcategories</h3>
        <button class="modal-close-btn close-dashboard-subcat">&times;</button>
      </div>
      <div class="modal-body">
        <p style="font-size:0.85rem; color:#bbb; margin-top:0;">Changes will directly update your live Portfolio and Homepage!</p>
        <div style="display:flex; gap:10px; margin-bottom:15px;">
            <input type="text" id="ds-new-subcat-input" class="form-control" placeholder="New subcategory..." style="flex:1;">
            <button type="button" id="ds-add-subcat-btn" class="btn btn-primary" style="background:#20c997; border:none;">Add</button>
        </div>
        <div id="ds-subcat-list" style="display:flex; flex-direction:column; gap:8px; background:#111; padding:15px; border-radius:8px; border:1px solid #333; min-height:100px;">
        </div>
      </div>
      <div class="modal-footer" style="border-top:1px solid #333; padding-top:15px; margin-top:15px;">
        <button type="button" class="btn btn-secondary close-dashboard-subcat">Cancel</button>
        <button type="button" id="ds-save-subcat-btn" class="btn btn-primary" style="background:#dc3545; border:none;"><i class="fa-solid fa-cloud-arrow-up"></i> Save to Cloud</button>
      </div>
    </div>
  </div>

  <script>
    // Subcategory Manager Dashboard Logic
    document.addEventListener('DOMContentLoaded', () => {
        const dsBtn = document.getElementById('manage-subcats-dashboard-btn');
        const dsModal = document.getElementById('dashboard-subcat-modal');
        const dsCloseBtns = document.querySelectorAll('.close-dashboard-subcat');
        const dsAddBtn = document.getElementById('ds-add-subcat-btn');
        const dsInput = document.getElementById('ds-new-subcat-input');
        const dsList = document.getElementById('ds-subcat-list');
        const dsSaveBtn = document.getElementById('ds-save-subcat-btn');
        
        let dsSubcats = [];

        function renderDsList() {
            dsList.innerHTML = '';
            dsSubcats.forEach((sub, index) => {
                const item = document.createElement('div');
                item.style.cssText = "display:flex; justify-content:space-between; align-items:center; background:#222; padding:8px 12px; border-radius:6px; border:1px solid #444;";
                
                const input = document.createElement('input');
                input.type = "text";
                input.value = sub.name;
                input.className = "form-control";
                input.style.cssText = "background:transparent; border:none; color:#fff; font-size:0.85rem; padding:0; flex:1; outline:none; box-shadow:none;";
                input.addEventListener('change', (e) => {
                    dsSubcats[index].name = e.target.value.trim();
                });
                
                const delBtn = document.createElement('button');
                delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
                delBtn.style.cssText = "background:none; border:none; color:#dc3545; cursor:pointer; font-size:0.9rem; margin-left:10px;";
                delBtn.onclick = () => {
                    dsSubcats.splice(index, 1);
                    renderDsList();
                };
                
                item.appendChild(input);
                item.appendChild(delBtn);
                dsList.appendChild(item);
            });
        }

        if (dsBtn && dsModal) {
            dsBtn.addEventListener('click', () => {
                // Initialize array from current DOM
                dsSubcats = [];
                if (portfolioDoc) {
                    const btns = portfolioDoc.querySelectorAll('#book-covers-sub-filters .sub-filter-btn:not([data-subcat="all"])');
                    btns.forEach(b => {
                        dsSubcats.push({ name: b.textContent.trim(), slug: b.getAttribute('data-subcat') });
                    });
                }
                renderDsList();
                dsModal.style.display = 'flex';
            });
            
            dsCloseBtns.forEach(b => b.addEventListener('click', () => dsModal.style.display = 'none'));
            
            dsAddBtn.addEventListener('click', () => {
                const val = dsInput.value.trim();
                if (!val) return;
                const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                if (dsSubcats.find(s => s.slug === slug)) {
                    showToast('Subcategory already exists!', 'error');
                    return;
                }
                dsSubcats.push({ name: val, slug: slug });
                dsInput.value = '';
                renderDsList();
            });
            
            dsSaveBtn.addEventListener('click', async () => {
                dsSaveBtn.innerHTML = "Syncing...";
                dsSaveBtn.disabled = true;
                
                try {
                    let newHtml = `<button class="sub-filter-btn active" data-subcat="all">All</button>\\n`;
                    dsSubcats.forEach(sub => {
                        newHtml += `<button class="sub-filter-btn" data-subcat="${sub.slug}">${sub.name}</button>\\n`;
                    });
                    
                    // Update portfolioDoc
                    const pContainer = portfolioDoc.getElementById('book-covers-sub-filters');
                    if (pContainer) {
                        pContainer.innerHTML = newHtml;
                        await supabase.from('pages').update({ html_content: portfolioDoc.body.innerHTML }).eq('slug', 'portfolio');
                    }
                    
                    // Update indexDoc
                    const iContainer = indexDoc.getElementById('book-covers-sub-filters');
                    if (iContainer) {
                        iContainer.innerHTML = newHtml;
                        await supabase.from('pages').update({ html_content: indexDoc.body.innerHTML }).eq('slug', 'index');
                    }
                    
                    // Update local keyword arrays
                    const names = dsSubcats.map(s => s.name);
                    CATEGORY_KEYWORDS['covers'] = names;
                    validSubcats = {};
                    dsSubcats.forEach(s => validSubcats[s.name] = s.slug);
                    
                    // Refresh tags picker if modal is open
                    if (typeof renderKeywordPills === 'function') renderKeywordPills();
                    
                    showToast('Subcategories Synced successfully!', 'success');
                    dsModal.style.display = 'none';
                } catch(e) {
                    console.error(e);
                    showToast('Failed to sync subcategories', 'error');
                } finally {
                    dsSaveBtn.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Save to Cloud`;
                    dsSaveBtn.disabled = false;
                }
            });
        }
    });
  </script>
</body>"""
content = content.replace("</body>", manager_html_js)

with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated admin.html with dashboard subcategory manager")
