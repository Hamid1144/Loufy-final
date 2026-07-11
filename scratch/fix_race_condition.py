import re

with open('admin.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_block = """                    // 3. Save current page
                    const currentPage = window.location.pathname.includes('portfolio') ? 'portfolio' : 'index';
                    const otherPage = currentPage === 'portfolio' ? 'index' : 'portfolio';
                    
                    // trigger standard save for current page
                    await new Promise(resolve => setTimeout(resolve, 500));
                    document.getElementById('save-changes').click();
                    
                    // 4. Fetch the other page, update its DOM string, and save it
                    const { data: pageData, error: fetchErr } = await window.supabaseClient
                        .from('site_content')
                        .select('html_content')
                        .eq('id', otherPage)
                        .single();"""

new_block = """                    // 3. Save current page
                    const currentPage = window.location.pathname.includes('portfolio') ? 'portfolio' : 'index';
                    const otherPage = currentPage === 'portfolio' ? 'index' : 'portfolio';
                    
                    // trigger standard save for current page
                    document.getElementById('save-changes').click();
                    
                    // Wait for the main save changes process to fully complete to avoid race conditions
                    await new Promise(resolve => setTimeout(resolve, 500));
                    const mainSaveBtn = document.getElementById('save-changes');
                    await new Promise(resolve => {
                        const interval = setInterval(() => {
                            if (!mainSaveBtn || !mainSaveBtn.disabled) {
                                clearInterval(interval);
                                resolve();
                            }
                        }, 200);
                    });
                    
                    // 4. Fetch the other page, update its DOM string, and save it
                    const { data: pageData, error: fetchErr } = await window.supabaseClient
                        .from('site_content')
                        .select('html_content')
                        .eq('id', otherPage)
                        .single();"""

content = content.replace(old_block, new_block)

with open('admin.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully fixed race condition in admin.js!")
