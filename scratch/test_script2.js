
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
            // Guarantee we have a valid client instance without relying on global variables!
            const myUrl = 'https://pgictinimttptsxbvngg.supabase.co';
            const myKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc';
            
            if (!window.supabase) {
                throw new Error("Supabase library not loaded. Check your internet connection or ad blocker.");
            }
            
            const sbClient = window.supabase.createClient(myUrl, myKey);
            
            // Strategy 1: Try validSubcats (populated on load)
            if (typeof window.validSubcats !== 'undefined' && validSubcats && Object.keys(validSubcats).length > 0) {
                Object.keys(validSubcats).forEach(name => {
                    dsSubcats.push({ name: name, slug: window.validSubcats[name] });
                });
                source = "validSubcats";
            }
            
            // Strategy 2: Try portfolioDoc (parsed on load)
            if (dsSubcats.length === 0 && typeof portfolioDoc !== 'undefined' && portfolioDoc) {
                const btns = portfolioDoc.querySelectorAll('#book-covers-sub-filters .sub-filter-btn:not([data-subcat="all"])');
                if (btns && btns.length > 0) {
                    btns.forEach(b => {
                        dsSubcats.push({ name: b.textContent.trim(), slug: b.getAttribute('data-subcat') });
                    });
                    source = "portfolioDoc";
                }
            }
            
            // Strategy 3: Try Supabase Fetch (bypass cache)
            if (dsSubcats.length === 0) {
                const portRes = await sbClient.from('site_content').select('html_content').eq('id', 'portfolio').single();
                if (portRes && portRes.data) {
                    const parser = new DOMParser();
                    const tempDoc = parser.parseFromString(portRes.data.html_content, 'text/html');
                    const btns = tempDoc.querySelectorAll('#book-covers-sub-filters .sub-filter-btn:not([data-subcat="all"])');
                    if (btns && btns.length > 0) {
                        btns.forEach(b => {
                            dsSubcats.push({ name: b.textContent.trim(), slug: b.getAttribute('data-subcat') });
                        });
                        source = "supabase";
                        if (typeof portfolioDoc !== 'undefined') portfolioDoc = tempDoc;
                    }
                }
            }
            
            // If STILL empty, show an alert to the user so they can tell me what's wrong!
            if (dsSubcats.length === 0) {
                alert("DEBUG INFO: Subcategories are empty. Checked validSubcats, portfolioDoc, and Supabase site_content. All returned 0 items. Please take a screenshot of this alert and send it to the developer.");
            }
            
            renderDsList();
            
            const modal = document.getElementById('dashboard-subcat-modal');
            if (modal) modal.classList.add('active');
            
        } catch(err) {
            console.error('Failed to load subcategories:', err);
            alert("Error loading subcategories: " + err.message);
        } finally {
            if (btnManage) btnManage.innerHTML = '<i class="fa-solid fa-list-ul"></i> Manage Covers Subcategories';
        }
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
                const sbUrl = 'https://pgictinimttptsxbvngg.supabase.co';
                const sbKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc';
                const sbClient = window.supabase.createClient(sbUrl, sbKey);
                
                let newHtml = `<button class="sub-filter-btn active" data-subcat="all">All</button>\n`;
                dsSubcats.forEach(sub => {
                    newHtml += `<button class="sub-filter-btn" data-subcat="${sub.slug}">${sub.name}</button>\n`;
                });
                
                if (typeof portfolioDoc !== 'undefined' && portfolioDoc) {
                    const pContainer = portfolioDoc.getElementById('book-covers-sub-filters');
                    if (pContainer) {
                        pContainer.innerHTML = newHtml;
                        await sbClient.from('site_content').update({ html_content: '<!DOCTYPE html>\n' + portfolioDoc.documentElement.outerHTML }).eq('id', 'portfolio');
                    }
                }
                
                if (typeof indexDoc !== 'undefined' && indexDoc) {
                    const iContainer = indexDoc.getElementById('book-covers-sub-filters');
                    if (iContainer) {
                        iContainer.innerHTML = newHtml;
                        await sbClient.from('site_content').update({ html_content: '<!DOCTYPE html>\n' + indexDoc.documentElement.outerHTML }).eq('id', 'index');
                    }
                }
                
                if (typeof window.CATEGORY_KEYWORDS !== 'undefined') {
                    window.CATEGORY_KEYWORDS['covers'] = dsSubcats.map(s => s.name);
                }
                
                if (typeof window.validSubcats !== 'undefined' || typeof window.validSubcats !== 'undefined') {
                    const targetObj = window.validSubcats || validSubcats;
                    // Clear the object properties without reassignment just in case
                    for (const prop of Object.keys(targetObj)) {
                        delete targetObj[prop];
                    }
                    dsSubcats.forEach(s => targetObj[s.name] = s.slug);
                    if (typeof window.validSubcats !== 'undefined') window.validSubcats = targetObj;
                }
                
                if (typeof window.renderKeywordPills === 'function') window.renderKeywordPills();
                
                if(typeof showToast === 'function') showToast('Subcategories Synced successfully!', 'success');
                const modal = document.getElementById('dashboard-subcat-modal');
                if (modal) modal.classList.remove('active');
            } catch(err) {
                console.error('Save to Cloud Error:', err);
                alert("Failed to sync subcategories: " + err.message);
                if(typeof showToast === 'function') showToast('Failed to sync subcategories', 'error');
            } finally {
                dsSaveBtn.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Save to Cloud`;
                dsSaveBtn.disabled = false;
            }
            return;
        }
    });
  