import re

with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the button to include onclick
old_btn = '<button type="button" id="manage-subcats-dashboard-btn" style="padding:6px 12px; border-radius:6px; background:#dc3545; color:#fff; border:none; cursor:pointer; font-size:0.8rem; width:100%;"><i class="fa-solid fa-list-ul"></i> Manage Covers Subcategories</button>'
new_btn = '<button type="button" id="manage-subcats-dashboard-btn" onclick="openDashboardSubcatModal()" style="padding:6px 12px; border-radius:6px; background:#dc3545; color:#fff; border:none; cursor:pointer; font-size:0.8rem; width:100%;"><i class="fa-solid fa-list-ul"></i> Manage Covers Subcategories</button>'
content = content.replace(old_btn, new_btn)

# Add openDashboardSubcatModal function to script
script_to_add = """
    window.openDashboardSubcatModal = function() {
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
    };
"""

# Replace the event delegation for btnManage
bad_listener = """    document.body.addEventListener('click', async (e) => {
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
        }"""

good_listener = "    " + script_to_add.strip() + "\n\n    document.body.addEventListener('click', async (e) => {"

if bad_listener in content:
    content = content.replace(bad_listener, good_listener)
    with open('admin.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Replaced with inline onclick")
else:
    print("Could not find bad listener block.")
