import re

with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the save logic completely to be perfectly foolproof
old_logic_start = "            try {"
old_logic_end = """            } finally {
                dsSaveBtn.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Save to Cloud`;
                dsSaveBtn.disabled = false;
            }"""

match = re.search(re.escape(old_logic_start) + r"[\s\S]*?" + re.escape(old_logic_end), content)

if match:
    old_logic = match.group(0)
    
    new_logic = """            try {
                const sbUrl = 'https://pgictinimttptsxbvngg.supabase.co';
                const sbKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc';
                const sbClient = window.supabase.createClient(sbUrl, sbKey);
                
                let newHtml = `<button class="sub-filter-btn active" data-subcat="all">All</button>\\n`;
                dsSubcats.forEach(sub => {
                    newHtml += `<button class="sub-filter-btn" data-subcat="${sub.slug}">${sub.name}</button>\\n`;
                });
                
                if (typeof portfolioDoc !== 'undefined' && portfolioDoc) {
                    const pContainer = portfolioDoc.getElementById('book-covers-sub-filters');
                    if (pContainer) {
                        pContainer.innerHTML = newHtml;
                        await sbClient.from('site_content').update({ html_content: '<!DOCTYPE html>\\n' + portfolioDoc.documentElement.outerHTML }).eq('id', 'portfolio');
                    }
                }
                
                if (typeof indexDoc !== 'undefined' && indexDoc) {
                    const iContainer = indexDoc.getElementById('book-covers-sub-filters');
                    if (iContainer) {
                        iContainer.innerHTML = newHtml;
                        await sbClient.from('site_content').update({ html_content: '<!DOCTYPE html>\\n' + indexDoc.documentElement.outerHTML }).eq('id', 'index');
                    }
                }
                
                if (typeof CATEGORY_KEYWORDS !== 'undefined') {
                    CATEGORY_KEYWORDS['covers'] = dsSubcats.map(s => s.name);
                }
                
                if (typeof window.validSubcats !== 'undefined' || typeof validSubcats !== 'undefined') {
                    const targetObj = window.validSubcats || validSubcats;
                    // Clear the object properties without reassignment just in case
                    for (const prop of Object.keys(targetObj)) {
                        delete targetObj[prop];
                    }
                    dsSubcats.forEach(s => targetObj[s.name] = s.slug);
                    if (typeof window.validSubcats !== 'undefined') window.validSubcats = targetObj;
                }
                
                if (typeof renderKeywordPills === 'function') renderKeywordPills();
                
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
            }"""

    content = content.replace(old_logic, new_logic)
    
    with open('admin.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully fixed Save to Cloud logic!")
else:
    print("Could not find the logic block to replace!")
