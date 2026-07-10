import re

with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

old_fn = """    window.openDashboardSubcatModal = function() {
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
    };"""

new_fn = """    window.openDashboardSubcatModal = async function() {
        const btnManage = document.getElementById('manage-subcats-dashboard-btn');
        if (btnManage) btnManage.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Loading...';
        
        dsSubcats = [];
        try {
            const portRes = await supabase.from('site_content').select('html_content').eq('id', 'portfolio').single();
            if (portRes && portRes.data) {
                const parser = new DOMParser();
                const tempDoc = parser.parseFromString(portRes.data.html_content, 'text/html');
                const btns = tempDoc.querySelectorAll('#book-covers-sub-filters .sub-filter-btn:not([data-subcat="all"])');
                btns.forEach(b => {
                    dsSubcats.push({ name: b.textContent.trim(), slug: b.getAttribute('data-subcat') });
                });
                
                // Update global portfolioDoc if possible
                if (typeof portfolioDoc !== 'undefined') {
                    portfolioDoc = tempDoc;
                }
            }
        } catch(err) {
            console.error('Failed to load subcategories:', err);
        }
        
        renderDsList();
        if (btnManage) btnManage.innerHTML = '<i class="fa-solid fa-list-ul"></i> Manage Covers Subcategories';
        
        const modal = document.getElementById('dashboard-subcat-modal');
        if (modal) modal.classList.add('active');
    };"""

if old_fn in content:
    content = content.replace(old_fn, new_fn)
    with open('admin.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully updated openDashboardSubcatModal!")
else:
    print("Could not find old_fn in admin.html!")
