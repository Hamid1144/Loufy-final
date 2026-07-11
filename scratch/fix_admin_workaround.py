import re

with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace main save button upserts
old_main = """        // Upload Index
        const indexUp = await supabase.from('site_content').upsert({ id: 'index', html_content: finalIndexHTML });
        if (indexUp.error) throw indexUp.error;
        
        // Upload Portfolio
        const portUp = await supabase.from('site_content').upsert({ id: 'portfolio', html_content: finalPortHTML });
        if (portUp.error) throw portUp.error;
        
        // Upload Blogs JSON
        const blogsUp = await supabase.from('site_content').upsert({ id: 'blogs_json', html_content: JSON.stringify(blogsList) });
        if (blogsUp.error) throw blogsUp.error;"""

new_main = """        // Upload Index (Delete then Insert Workaround)
        await supabase.from('site_content').delete().eq('id', 'index');
        const indexUp = await supabase.from('site_content').insert({ id: 'index', html_content: finalIndexHTML });
        if (indexUp.error) throw indexUp.error;
        
        // Upload Portfolio (Delete then Insert Workaround)
        await supabase.from('site_content').delete().eq('id', 'portfolio');
        const portUp = await supabase.from('site_content').insert({ id: 'portfolio', html_content: finalPortHTML });
        if (portUp.error) throw portUp.error;
        
        // Upload Blogs JSON (Delete then Insert Workaround)
        await supabase.from('site_content').delete().eq('id', 'blogs_json');
        const blogsUp = await supabase.from('site_content').insert({ id: 'blogs_json', html_content: JSON.stringify(blogsList) });
        if (blogsUp.error) throw blogsUp.error;"""

content = content.replace(old_main, new_main)

# 2. Replace modal save button upserts
# First, the portfolio block
old_modal_port = """                        if (!portfolioDoc.body || !portfolioDoc.body.innerHTML) {
                            alert("DEBUG: portfolioDoc.body is empty!");
                        }
                        const pUp = await sbClient.from('site_content').upsert({ id: 'portfolio', html_content: portfolioDoc.body.innerHTML });
 if (pUp.error) throw pUp.error;"""

new_modal_port = """                        await sbClient.from('site_content').delete().eq('id', 'portfolio');
                        const pUp = await sbClient.from('site_content').insert({ id: 'portfolio', html_content: portfolioDoc.body.innerHTML });
                        if (pUp.error) throw pUp.error;"""

content = content.replace(old_modal_port, new_modal_port)

# Then the index block
old_modal_index = """                        const iUp = await sbClient.from('site_content').upsert({ id: 'index', html_content: indexDoc.body.innerHTML }); if (iUp.error) throw iUp.error;"""

new_modal_index = """                        await sbClient.from('site_content').delete().eq('id', 'index');
                        const iUp = await sbClient.from('site_content').insert({ id: 'index', html_content: indexDoc.body.innerHTML });
                        if (iUp.error) throw iUp.error;"""

content = content.replace(old_modal_index, new_modal_index)

with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Finished applying delete-then-insert workarounds to admin.html!")
