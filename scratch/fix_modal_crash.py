import re

with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace openDashboardSubcatModal completely
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
        
        try {
            // Guarantee we have a valid client instance without relying on global variables!
            const myUrl = 'https://pgictinimttptsxbvngg.supabase.co';
            const myKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc';
            
            if (!window.supabase) {
                throw new Error("Supabase library not loaded. Check your internet connection or ad blocker.");
            }
            
            const sbClient = window.supabase.createClient(myUrl, myKey);
            
            // Strategy 1: Try validSubcats (populated on load)
            if (typeof validSubcats !== 'undefined' && validSubcats && Object.keys(validSubcats).length > 0) {
                Object.keys(validSubcats).forEach(name => {
                    dsSubcats.push({ name: name, slug: validSubcats[name] });
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
    };"""

    content = content.replace(old_fn, new_fn)
    with open('admin.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully replaced openDashboardSubcatModal with fully encapsulated logic!")
else:
    print("Could not find the function block to replace!")
