import re

with open('admin.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Manage Subcategories button
old_manage_filters = """            <button id="manage-filters" class="admin-btn" style="background:#fd7e14;"><i class="fa-solid fa-tags"></i> Manage Categories</button>"""
new_manage_filters = """            <button id="manage-filters" class="admin-btn" style="background:#fd7e14;"><i class="fa-solid fa-tags"></i> Manage Categories</button>
            <button id="manage-subcategories-btn" class="admin-btn" style="background:#dc3545; color:#fff;"><i class="fa-solid fa-list-ul"></i> Manage Subcategories</button>"""
content = content.replace(old_manage_filters, new_manage_filters)

# 2. Add Subcategory Modal HTML
subcat_modal_html = """
    <!-- Subcategory Manager Modal -->
    <div id="admin-subcat-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.75); z-index:199999; justify-content:center; align-items:center; font-family:'Poppins', sans-serif;">
        <div style="background:#1e1e1e; border:1px solid #333; color:#fff; width:90%; max-width:600px; border-radius:12px; padding:24px; box-shadow:0 20px 60px rgba(0,0,0,0.5); display:flex; flex-direction:column; gap:20px; max-height:80vh; overflow-y:auto;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #333; padding-bottom:12px;">
                <h3 style="margin:0; font-size:1.25rem; color:#dc3545; display:flex; align-items:center; gap:8px;"><i class="fa-solid fa-list-ul"></i> Manage Subcategories</h3>
                <button type="button" class="close-subcat-modal" style="background:none; border:none; color:#aaa; font-size:1.5rem; cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>
            </div>
            
            <p style="font-size:0.85rem; color:#bbb; margin:0;">Add, rename, or delete Book Cover subcategories. Changes will sync to both Portfolio and Homepage.</p>
            
            <div style="display:flex; gap:10px;">
                <input type="text" id="new-subcat-input" placeholder="New subcategory name..." style="flex:1; padding:10px; border-radius:6px; border:1px solid #444; background:#111; color:#fff; font-size:0.85rem;">
                <button type="button" id="add-subcat-btn" style="padding:10px 15px; border-radius:6px; border:none; background:#20c997; color:#fff; font-weight:600; cursor:pointer; font-size:0.85rem;">Add</button>
            </div>
            
            <div id="subcat-list-container" style="display:flex; flex-direction:column; gap:8px; background:#111; padding:15px; border-radius:8px; border:1px solid #333; min-height:100px;">
                <!-- List populated dynamically -->
            </div>
            
            <div style="display:flex; gap:10px; border-top:1px solid #333; padding-top:15px; margin-top:5px;">
                <button type="button" class="close-subcat-modal-btn" style="flex:1; padding:10px; border-radius:6px; border:1px solid #444; background:transparent; color:#ccc; cursor:pointer; font-weight:600; font-size:0.9rem;">Cancel</button>
                <button type="button" id="save-subcat-btn" style="flex:2; padding:10px; border-radius:6px; border:none; background:#dc3545; color:#fff; font-weight:700; cursor:pointer; font-size:0.9rem;"><i class="fa-solid fa-cloud-arrow-up"></i> Save to Cloud</button>
            </div>
        </div>
    </div>
"""

# Append the modal before the final backticks in adminHTML
content = content.replace("    </div>\n    `;\n    document.body.insertAdjacentHTML('beforeend', adminHTML);", subcat_modal_html + "\n    </div>\n    `;\n    document.body.insertAdjacentHTML('beforeend', adminHTML);")

# 3. Add JS logic for the modal
subcat_logic = """
    // --- Subcategory Manager Logic ---
    const manageSubcatBtn = document.getElementById("manage-subcategories-btn");
    const subcatModal = document.getElementById("admin-subcat-modal");
    const closeSubcatBtn = subcatModal ? subcatModal.querySelector(".close-subcat-modal") : null;
    const closeSubcatBtn2 = subcatModal ? subcatModal.querySelector(".close-subcat-modal-btn") : null;
    const addSubcatBtn = document.getElementById("add-subcat-btn");
    const newSubcatInput = document.getElementById("new-subcat-input");
    const subcatListContainer = document.getElementById("subcat-list-container");
    const saveSubcatBtn = document.getElementById("save-subcat-btn");
    
    let currentSubcats = [];

    function renderSubcatList() {
        if (!subcatListContainer) return;
        subcatListContainer.innerHTML = '';
        currentSubcats.forEach((sub, index) => {
            const item = document.createElement('div');
            item.style.cssText = "display:flex; justify-content:space-between; align-items:center; background:#222; padding:8px 12px; border-radius:6px; border:1px solid #444;";
            
            const input = document.createElement('input');
            input.type = "text";
            input.value = sub.name;
            input.style.cssText = "background:transparent; border:none; color:#fff; font-size:0.85rem; font-family:'Poppins', sans-serif; flex:1; outline:none;";
            input.addEventListener('change', (e) => {
                currentSubcats[index].name = e.target.value.trim();
                // re-generate slug if needed? Let's just keep the old slug so existing cards don't break, unless it's new
            });
            
            const delBtn = document.createElement('button');
            delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
            delBtn.style.cssText = "background:none; border:none; color:#dc3545; cursor:pointer; font-size:0.9rem; margin-left:10px;";
            delBtn.onclick = () => {
                currentSubcats.splice(index, 1);
                renderSubcatList();
            };
            
            item.appendChild(input);
            item.appendChild(delBtn);
            subcatListContainer.appendChild(item);
        });
    }

    if (manageSubcatBtn && subcatModal) {
        manageSubcatBtn.addEventListener('click', () => {
            // Read current subcategories from the DOM
            currentSubcats = [];
            const existingBtns = document.querySelectorAll('#book-covers-sub-filters .sub-filter-btn:not([data-subcat="all"])');
            existingBtns.forEach(btn => {
                currentSubcats.push({
                    name: btn.textContent.trim(),
                    slug: btn.getAttribute('data-subcat')
                });
            });
            renderSubcatList();
            subcatModal.style.display = 'flex';
        });
        
        const closeMod = () => { subcatModal.style.display = 'none'; };
        if (closeSubcatBtn) closeSubcatBtn.addEventListener('click', closeMod);
        if (closeSubcatBtn2) closeSubcatBtn2.addEventListener('click', closeMod);
        
        if (addSubcatBtn && newSubcatInput) {
            addSubcatBtn.addEventListener('click', () => {
                const val = newSubcatInput.value.trim();
                if (!val) return;
                const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                if (currentSubcats.find(s => s.slug === slug)) {
                    window.showToast('Subcategory already exists!', 'error');
                    return;
                }
                currentSubcats.push({ name: val, slug: slug });
                newSubcatInput.value = '';
                renderSubcatList();
            });
        }
        
        if (saveSubcatBtn) {
            saveSubcatBtn.addEventListener('click', async () => {
                saveSubcatBtn.innerText = "Syncing...";
                saveSubcatBtn.disabled = true;
                
                try {
                    // 1. Build new HTML for sub-filters
                    let newHtml = `<button class="sub-filter-btn active" data-subcat="all">All</button>\\n`;
                    currentSubcats.forEach(sub => {
                        newHtml += `<button class="sub-filter-btn" data-subcat="${sub.slug}">${sub.name}</button>\\n`;
                    });
                    
                    // 2. Update current DOM
                    const localContainer = document.getElementById('book-covers-sub-filters');
                    if (localContainer) {
                        localContainer.innerHTML = newHtml;
                    }
                    
                    // Re-bind listeners locally so they work without refresh
                    if (typeof window.bindSubcatListeners === 'function') {
                        window.bindSubcatListeners(); 
                    } else {
                        // inline listener bind
                        document.querySelectorAll('.sub-filter-btn').forEach(btn => {
                            btn.addEventListener('click', function(e) {
                                e.preventDefault();
                                document.querySelectorAll('.sub-filter-btn').forEach(b => b.classList.remove('active'));
                                this.classList.add('active');
                                const activeMainFilter = document.querySelector('.filter-btn.active');
                                if (activeMainFilter) activeMainFilter.click();
                            });
                        });
                    }
                    
                    // 3. Save current page
                    const currentPage = window.location.pathname.includes('portfolio') ? 'portfolio' : 'index';
                    const otherPage = currentPage === 'portfolio' ? 'index' : 'portfolio';
                    
                    // trigger standard save for current page
                    await new Promise(resolve => setTimeout(resolve, 500));
                    document.getElementById('save-changes').click();
                    
                    // 4. Fetch the other page, update its DOM string, and save it
                    const { data: pageData, error: fetchErr } = await window.supabaseClient
                        .from('pages')
                        .select('html_content')
                        .eq('slug', otherPage)
                        .single();
                        
                    if (!fetchErr && pageData) {
                        const parser = new DOMParser();
                        const otherDoc = parser.parseFromString(pageData.html_content, 'text/html');
                        const otherContainer = otherDoc.getElementById('book-covers-sub-filters');
                        if (otherContainer) {
                            otherContainer.innerHTML = newHtml;
                            const updatedHtml = otherDoc.body.innerHTML;
                            await window.supabaseClient.from('pages').update({ html_content: updatedHtml }).eq('slug', otherPage);
                        }
                    }
                    
                    window.showToast('Subcategories Synced successfully!', 'success');
                    subcatModal.style.display = 'none';
                    populateAddItemSubcategories(); // update dropdown
                } catch(e) {
                    console.error(e);
                    window.showToast('Failed to sync subcategories', 'error');
                } finally {
                    saveSubcatBtn.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Save to Cloud`;
                    saveSubcatBtn.disabled = false;
                }
            });
        }
    }
"""

content = content + "\n" + subcat_logic

# Also ensure it ignores removing #admin-subcat-modal during save sweep
old_remove = """const adminElements = clone.querySelectorAll('#super-admin-panel, #admin-crop-modal, #admin-add-item-modal, #admin-text-toolbar, #admin-blog-modal, #admin-hero-bg-modal');"""
new_remove = """const adminElements = clone.querySelectorAll('#super-admin-panel, #admin-crop-modal, #admin-add-item-modal, #admin-text-toolbar, #admin-blog-modal, #admin-hero-bg-modal, #admin-subcat-modal');"""
content = content.replace(old_remove, new_remove)

with open('admin.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated admin.js with Subcategory Manager")
