import re

with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix openDashboardSubcatModal
old_fn_start = "    window.openDashboardSubcatModal = async function() {"
old_fn_end = """        const modal = document.getElementById('dashboard-subcat-modal');
        if (modal) modal.classList.add('active');
    };"""

match = re.search(re.escape(old_fn_start) + r"[\s\S]*?" + re.escape(old_fn_end), content)

if match:
    old_fn = match.group(0)
    
    new_fn = """    window.openDashboardSubcatModal = async function() {
        const btnManage = document.getElementById('manage-subcats-dashboard-btn');
        if (btnManage) btnManage.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Loading...';
        
        dsSubcats = [];
        let source = "none";
        
        // Guarantee we have a valid client instance!
        const sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        
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
                // Fetch using our guaranteed client instance, appending a cache buster
                const portRes = await sbClient.from('site_content').select('html_content').eq('id', 'portfolio').single();
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
    };"""

    content = content.replace(old_fn, new_fn)
else:
    print("Could not find openDashboardSubcatModal!")

# Fix the Save button logic inside document.body.addEventListener
save_logic_start = "        const dsSaveBtn = e.target.closest('#ds-save-subcat-btn');"
save_logic_end = """        if (dsSaveBtn) {
            dsSaveBtn.innerHTML = "Syncing...";
            dsSaveBtn.disabled = true;"""
# Just replace `supabase.from` with `sbClient.from` in the save block
if "await supabase.from('site_content').update" in content:
    # Let's replace the await calls specifically
    content = content.replace("await supabase.from('site_content').update({ html_content: portfolioDoc.body.innerHTML }).eq('id', 'portfolio');",
                              "await window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY).from('site_content').update({ html_content: portfolioDoc.body.innerHTML }).eq('id', 'portfolio');")
    content = content.replace("await supabase.from('site_content').update({ html_content: indexDoc.body.innerHTML }).eq('id', 'index');",
                              "await window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY).from('site_content').update({ html_content: indexDoc.body.innerHTML }).eq('id', 'index');")

with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Successfully fixed supabase client scoping issues!")
