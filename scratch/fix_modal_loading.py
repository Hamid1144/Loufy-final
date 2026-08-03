import re

with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

old_fn_start = "    window.openDashboardSubcatModal = async function() {"
old_fn_end = "        } finally {\n            if (btnManage) btnManage.innerHTML = '<i class=\"fa-solid fa-list-ul\"></i> Manage Covers Subcategories';\n        }\n    };"

# Find the block
start_idx = content.find(old_fn_start)
if start_idx != -1:
    end_idx = content.find(old_fn_end, start_idx) + len(old_fn_end)
    
    new_fn = """    window.openDashboardSubcatModal = async function() {
        const btnManage = document.getElementById('manage-subcats-dashboard-btn');
        if (btnManage) btnManage.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Loading...';
        
        dsSubcats = [];
        let source = "none";
        
        try {
            // Strategy 1: Try validSubcats (populated on load)
            const globalSubcats = window.validSubcats || (typeof validSubcats !== 'undefined' ? validSubcats : {});
            if (Object.keys(globalSubcats).length > 0) {
                Object.keys(globalSubcats).forEach(name => {
                    dsSubcats.push({ name: name, slug: globalSubcats[name] });
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
            
            // Strategy 3: Try Supabase Fetch via existing window.supabaseClient (bypass cache)
            if (dsSubcats.length === 0 && window.supabaseClient) {
                // Add a timeout to the fetch so it doesn't hang forever
                const fetchPromise = window.supabaseClient.from('site_content').select('html_content').eq('id', 'portfolio').single();
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Supabase fetch timeout")), 5000));
                
                const portRes = await Promise.race([fetchPromise, timeoutPromise]);
                
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
            
            // If STILL empty, show toast instead of alert to prevent blocking
            if (dsSubcats.length === 0) {
                if(typeof showToast === 'function') showToast("Warning: Subcategories are empty. Starting fresh.", "error");
                console.warn("DEBUG INFO: Subcategories are empty. Checked validSubcats, portfolioDoc, and Supabase site_content.");
            }
            
            renderDsList();
            
            const modal = document.getElementById('dashboard-subcat-modal');
            if (modal) {
                modal.classList.add('active');
            } else {
                if(typeof showToast === 'function') showToast("Error: Modal element not found in DOM.", "error");
            }
            
        } catch(err) {
            console.error('Failed to load subcategories:', err);
            if(typeof showToast === 'function') showToast("Error loading subcategories: " + err.message, "error");
        } finally {
            if (btnManage) btnManage.innerHTML = '<i class="fa-solid fa-list-ul"></i> Manage Covers Subcategories';
        }
    };"""
    
    content = content[:start_idx] + new_fn + content[end_idx:]
    
    with open('admin.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed openDashboardSubcatModal successfully!")
else:
    print("Could not find openDashboardSubcatModal in admin.html!")
