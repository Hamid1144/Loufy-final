import re

with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract the part between <script> // Subcategory Manager Dashboard Logic ... </script>
start_marker = "    // Subcategory Manager Dashboard Logic"
end_marker = "  </script>\n</body>"

if start_marker in content and end_marker in content:
    pre_script = content.split(start_marker)[0]
    
    new_script = """    // Subcategory Manager Dashboard Logic
    let dsSubcats = [];
    
    function renderDsList() {
        const dsList = document.getElementById('ds-subcat-list');
        if (!dsList) return;
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

    document.body.addEventListener('click', async (e) => {
        const btnManage = e.target.closest('#manage-subcats-dashboard-btn');
        if (btnManage) {
            dsSubcats = [];
            if (typeof portfolioDoc !== 'undefined' && portfolioDoc) {
                const btns = portfolioDoc.querySelectorAll('#book-covers-sub-filters .sub-filter-btn:not([data-subcat="all"])');
                btns.forEach(b => {
                    dsSubcats.push({ name: b.textContent.trim(), slug: b.getAttribute('data-subcat') });
                });
            }
            renderDsList();
            const modal = document.getElementById('dashboard-subcat-modal');
            if (modal) modal.classList.add('active');
            return;
        }
        
        if (e.target.closest('.close-dashboard-subcat')) {
            const modal = document.getElementById('dashboard-subcat-modal');
            if (modal) modal.classList.remove('active');
            return;
        }
        
        if (e.target.closest('#ds-add-subcat-btn')) {
            const dsInput = document.getElementById('ds-new-subcat-input');
            if (!dsInput) return;
            const val = dsInput.value.trim();
            if (!val) return;
            const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            if (dsSubcats.find(s => s.slug === slug)) {
                if(typeof showToast === 'function') showToast('Subcategory already exists!', 'error');
                return;
            }
            dsSubcats.push({ name: val, slug: slug });
            dsInput.value = '';
            renderDsList();
            return;
        }
        
        const dsSaveBtn = e.target.closest('#ds-save-subcat-btn');
        if (dsSaveBtn) {
            dsSaveBtn.innerHTML = "Syncing...";
            dsSaveBtn.disabled = true;
            
            try {
                let newHtml = `<button class="sub-filter-btn active" data-subcat="all">All</button>\\n`;
                dsSubcats.forEach(sub => {
                    newHtml += `<button class="sub-filter-btn" data-subcat="${sub.slug}">${sub.name}</button>\\n`;
                });
                
                if (typeof portfolioDoc !== 'undefined' && portfolioDoc) {
                    const pContainer = portfolioDoc.getElementById('book-covers-sub-filters');
                    if (pContainer) {
                        pContainer.innerHTML = newHtml;
                        await supabase.from('pages').update({ html_content: portfolioDoc.body.innerHTML }).eq('slug', 'portfolio');
                    }
                }
                
                if (typeof indexDoc !== 'undefined' && indexDoc) {
                    const iContainer = indexDoc.getElementById('book-covers-sub-filters');
                    if (iContainer) {
                        iContainer.innerHTML = newHtml;
                        await supabase.from('pages').update({ html_content: indexDoc.body.innerHTML }).eq('slug', 'index');
                    }
                }
                
                if (typeof CATEGORY_KEYWORDS !== 'undefined') {
                    CATEGORY_KEYWORDS['covers'] = dsSubcats.map(s => s.name);
                }
                if (typeof validSubcats !== 'undefined') {
                    // We must update the global validSubcats object without reassigning if it's const, 
                    // but it's let in admin.js
                    window.validSubcats = {};
                    dsSubcats.forEach(s => window.validSubcats[s.name] = s.slug);
                }
                
                if (typeof renderKeywordPills === 'function') renderKeywordPills();
                
                if(typeof showToast === 'function') showToast('Subcategories Synced successfully!', 'success');
                const modal = document.getElementById('dashboard-subcat-modal');
                if (modal) modal.classList.remove('active');
            } catch(err) {
                console.error(err);
                if(typeof showToast === 'function') showToast('Failed to sync subcategories', 'error');
            } finally {
                dsSaveBtn.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Save to Cloud`;
                dsSaveBtn.disabled = false;
            }
            return;
        }
    });
"""
    
    new_content = pre_script + new_script + "  </script>\n</body>"
    with open('admin.html', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Replaced JS with event delegation")
else:
    print("Could not find markers")
