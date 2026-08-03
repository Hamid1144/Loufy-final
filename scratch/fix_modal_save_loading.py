import re

with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

old_fn_start = "        const dsSaveBtn = e.target.closest('#ds-save-subcat-btn');"
old_fn_end = "                if(typeof showToast === 'function') showToast('Subcategories Synced successfully!', 'success');\n            } catch (err) {\n                console.error(err);\n                if(typeof showToast === 'function') showToast('Error saving subcategories: ' + err.message, 'error');\n            } finally {\n                dsSaveBtn.innerHTML = '<i class=\"fa-solid fa-cloud-arrow-up\"></i> Save to Cloud';\n                dsSaveBtn.disabled = false;\n            }\n        }"

start_idx = content.find(old_fn_start)
if start_idx != -1:
    end_idx = content.find(old_fn_end, start_idx) + len(old_fn_end)
    
    new_fn = """        const dsSaveBtn = e.target.closest('#ds-save-subcat-btn');
        if (dsSaveBtn) {
            dsSaveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Syncing...';
            dsSaveBtn.disabled = true;
            
            try {
                // Use the existing client if available
                const sbClient = window.supabaseClient || window.supabase.createClient(
                    'https://pgictinimttptsxbvngg.supabase.co',
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc'
                );
                
                let newHtml = `<button class="sub-filter-btn active" data-subcat="all">All</button>\\n`;
                dsSubcats.forEach(sub => {
                    newHtml += `<button class="sub-filter-btn" data-subcat="${sub.slug}">${sub.name}</button>\\n`;
                });
                
                if (typeof portfolioDoc !== 'undefined' && portfolioDoc) {
                    const pContainer = portfolioDoc.getElementById('book-covers-sub-filters');
                    if (pContainer) {
                        pContainer.innerHTML = newHtml;
                        
                        await sbClient.from('site_content').delete().eq('id', 'portfolio');
                        const pUp = await sbClient.from('site_content').insert({ id: 'portfolio', html_content: portfolioDoc.body.innerHTML });
                        if (pUp.error) throw pUp.error;
                    }
                }
                
                if (typeof indexDoc !== 'undefined' && indexDoc) {
                    const iContainer = indexDoc.getElementById('book-covers-sub-filters');
                    if (iContainer) {
                        iContainer.innerHTML = newHtml;
                        await sbClient.from('site_content').delete().eq('id', 'index');
                        const iUp = await sbClient.from('site_content').insert({ id: 'index', html_content: indexDoc.body.innerHTML });
                        if (iUp.error) throw iUp.error;
                    }
                }
                
                // Use the exposed references from DOMContentLoaded
                if (window.CATEGORY_KEYWORDS_ref) {
                    window.CATEGORY_KEYWORDS_ref['covers'] = dsSubcats.map(s => s.name);
                }
                
                if (window.validSubcats_ref) {
                    const targetObj = window.validSubcats_ref;
                    for (const prop of Object.keys(targetObj)) {
                        delete targetObj[prop];
                    }
                    dsSubcats.forEach(s => targetObj[s.name] = s.slug);
                }
                
                if (window.renderKeywordPills_ref) {
                    window.renderKeywordPills_ref();
                }
                
                if(typeof showToast === 'function') showToast('Subcategories Synced successfully!', 'success');
                
                // Also close the modal on success
                const modal = document.getElementById('dashboard-subcat-modal');
                if (modal) modal.classList.remove('active');
                
            } catch (err) {
                console.error('Failed to save ds subcategories:', err);
                if(typeof showToast === 'function') showToast('Error saving subcategories: ' + err.message, 'error');
            } finally {
                dsSaveBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Save to Cloud';
                dsSaveBtn.disabled = false;
            }
        }"""
    
    content = content[:start_idx] + new_fn + content[end_idx:]
    with open('admin.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed dsSaveBtn successfully!")
else:
    print("Could not find dsSaveBtn block in admin.html")
