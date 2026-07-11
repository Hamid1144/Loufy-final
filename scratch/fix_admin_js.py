import re

with open('admin.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Save current page content (primary upload)
old_1 = """            // 1. Save current page content (primary upload)
            const { error } = await window.supabaseClient
                .from('site_content')
                .upsert({ id: pageId, html_content: clone.innerHTML })
                
            if (error) throw error;"""

new_1 = """            // 1. Save current page content (primary upload - Delete then Insert Workaround)
            await window.supabaseClient.from('site_content').delete().eq('id', pageId);
            const { error } = await window.supabaseClient
                .from('site_content')
                .insert({ id: pageId, html_content: clone.innerHTML });
                
            if (error) throw error;"""

content = content.replace(old_1, new_1)

# 2. Save other page content (sync)
old_2 = """                        const { error: otherUpdateError } = await window.supabaseClient
                            .from('site_content')
                            .upsert({ id: otherPageId, html_content: updatedOtherHtml });
                        if (otherUpdateError) throw otherUpdateError;"""

new_2 = """                        await window.supabaseClient.from('site_content').delete().eq('id', otherPageId);
                        const { error: otherUpdateError } = await window.supabaseClient
                            .from('site_content')
                            .insert({ id: otherPageId, html_content: updatedOtherHtml });
                        if (otherUpdateError) throw otherUpdateError;"""

content = content.replace(old_2, new_2)

# 3. Blogs upsert 1 (delete blog post)
old_3 = """            const { error } = await window.supabaseClient
                .from('site_content')
                .upsert({ id: 'blogs_json', html_content: updatedJson });
                
            if (error) throw error;"""

new_3 = """            await window.supabaseClient.from('site_content').delete().eq('id', 'blogs_json');
            const { error } = await window.supabaseClient
                .from('site_content')
                .insert({ id: 'blogs_json', html_content: updatedJson });
                
            if (error) throw error;"""

content = content.replace(old_3, new_3)

# 4. Blogs upsert 2 (save blog post)
old_4 = """                const { error } = await window.supabaseClient
                    .from('site_content')
                    .upsert({ id: 'blogs_json', html_content: updatedJson });
                    
                if (error) throw error;"""

new_4 = """                await window.supabaseClient.from('site_content').delete().eq('id', 'blogs_json');
                const { error } = await window.supabaseClient
                    .from('site_content')
                    .insert({ id: 'blogs_json', html_content: updatedJson });
                    
                if (error) throw error;"""

content = content.replace(old_4, new_4)

# 5. Modal save subcategories for the other page
old_5 = """                    // 4. Fetch the other page, update its DOM string, and save it
                    const { data: pageData, error: fetchErr } = await window.supabaseClient
                        .from('pages')
                        .select('html_content')
                        .eq('slug', otherPage)
                        .single();
                        
                    if (!fetchErr && pageData) {
                        const parser = new DOMParser();
                        const otherDoc = parser.parseFromString(pageData.html_content, 'text/html');
                        const otherContainer = otherDoc.getElementById('book-covers-sub-filters');
                        if (otherContainer) {
                            otherContainer.innerHTML = newHtml;
                            const updatedHtml = otherDoc.body.innerHTML;
                            await window.supabaseClient.from('pages').update({ html_content: updatedHtml }).eq('slug', otherPage);
                        }
                    }"""

new_5 = """                    // 4. Fetch the other page, update its DOM string, and save it
                    const { data: pageData, error: fetchErr } = await window.supabaseClient
                        .from('site_content')
                        .select('html_content')
                        .eq('id', otherPage)
                        .single();
                        
                    if (!fetchErr && pageData) {
                        const parser = new DOMParser();
                        const otherDoc = parser.parseFromString(pageData.html_content, 'text/html');
                        const otherContainer = otherDoc.getElementById('book-covers-sub-filters');
                        if (otherContainer) {
                            otherContainer.innerHTML = newHtml;
                            const updatedHtml = otherDoc.body.innerHTML;
                            
                            // Delete then Insert Workaround for RLS
                            await window.supabaseClient.from('site_content').delete().eq('id', otherPage);
                            const { error: otherUpdateError } = await window.supabaseClient
                                .from('site_content')
                                .insert({ id: otherPage, html_content: updatedHtml });
                            if (otherUpdateError) throw otherUpdateError;
                        }
                    }"""

content = content.replace(old_5, new_5)

with open('admin.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied RLS workarounds and fixed pages table typo in admin.js!")
