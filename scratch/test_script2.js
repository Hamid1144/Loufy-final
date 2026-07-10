
    // Subcategory Manager Dashboard Logic
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

    window.openDashboardSubcatModal = async function() {
        const btnManage = document.getElementById('manage-subcats-dashboard-btn');
        if (btnManage) btnManage.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Loading...';
        
        dsSubcats = [];
        let source = "none";
        
        try {
            // Strategy 1: Try validSubcats (populated on load)
            if (typeof validSubcats !== 'undefined' && Object.keys(validSubcats).length > 0) {
                Object.keys(validSubcats).forEach(name => {
                    dsSubcats.push({ name: name, slug: validSubcats[name] });
                });
                source = "validSubcats";
            }
            
            // Strategy 2: Try portfolioDoc (parsed on load)
            if (dsSubcats.length === 0 && typeof portfolioDoc !== 'undefined' && portfolioDoc) {
                const btns = portfolioDoc.querySelectorAll('#book-covers-sub-filters .sub-filter-btn:not([data-subcat="all"])');
                if (btns.length > 0) {
                    btns.forEach(b => {
                        dsSubcats.push({ name: b.textContent.trim(), slug: b.getAttribute('data-subcat') });
                    });
                    source = "portfolioDoc";
                }
            }
            
            // Strategy 3: Try Supabase Fetch (bypass cache)
            if (dsSubcats.length === 0) {
                const portRes = await supabase.from('site_content').select('html_content').eq('id', 'portfolio').single();
                if (portRes && portRes.data) {
                    const parser = new DOMParser();
                    const tempDoc = parser.parseFromString(portRes.data.html_content, 'text/html');
                    const btns = tempDoc.querySelectorAll('#book-covers-sub-filters .sub-filter-btn:not([data-subcat="all"])');
                    if (btns.length > 0) {
                        btns.forEach(b => {
                            dsSubcats.push({ name: b.textContent.trim(), slug: b.getAttribute('data-subcat') });
                        });
                        source = "supabase";
                        if (typeof portfolioDoc !== 'undefined') portfolioDoc = tempDoc;
                    }
                }
            }
        } catch(err) {
            console.error('Failed to load subcategories:', err);
            alert("Error loading subcategories: " + err.message);
        }
        
        // If STILL empty, show an alert to the user so they can tell me what's wrong!
        if (dsSubcats.length === 0) {
            alert("DEBUG INFO: Subcategories are empty. Checked validSubcats, portfolioDoc, and Supabase site_content. All returned 0 items. Please take a screenshot of this alert and send it to the developer.");
        }
        
        renderDsList();
        if (btnManage) btnManage.innerHTML = '<i class="fa-solid fa-list-ul"></i> Manage Covers Subcategories';
        
        const modal = document.getElementById('dashboard-subcat-modal');
        if (modal) modal.classList.add('active');
    };

    document.body.addEventListener('click', async (e) => {
        
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
                let newHtml = `<button class="sub-filter-btn active" data-subcat="all">All</button>\n`;
                dsSubcats.forEach(sub => {
                    newHtml += `<button class="sub-filter-btn" data-subcat="${sub.slug}">${sub.name}</button>\n`;
                });
                
                if (typeof portfolioDoc !== 'undefined' && portfolioDoc) {
                    const pContainer = portfolioDoc.getElementById('book-covers-sub-filters');
                    if (pContainer) {
                        pContainer.innerHTML = newHtml;
                        await supabase.from('site_content').update({ html_content: portfolioDoc.body.innerHTML }).eq('id', 'portfolio');
                    }
                }
                
                if (typeof indexDoc !== 'undefined' && indexDoc) {
                    const iContainer = indexDoc.getElementById('book-covers-sub-filters');
                    if (iContainer) {
                        iContainer.innerHTML = newHtml;
                        await supabase.from('site_content').update({ html_content: indexDoc.body.innerHTML }).eq('id', 'index');
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
  