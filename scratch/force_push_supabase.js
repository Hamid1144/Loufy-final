const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Extract config from index.html
const indexContent = fs.readFileSync('index.html', 'utf-8');
const urlMatch = indexContent.match(/supabaseUrl\s*=\s*['"]([^'"]+)['"]/);
const keyMatch = indexContent.match(/supabaseAnonKey\s*=\s*['"]([^'"]+)['"]/);

if (!urlMatch || !keyMatch) {
    console.error("Could not find Supabase credentials in index.html");
    process.exit(1);
}

const supabaseUrl = urlMatch[1];
const supabaseAnonKey = keyMatch[1];
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function pushPage(filename, slug) {
    console.log(`Pushing ${slug} to Supabase...`);
    const html = fs.readFileSync(filename, 'utf-8');
    
    // Extract body content
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    let bodyContent = bodyMatch ? bodyMatch[1] : html;
    
    // Clean up serialized elements
    bodyContent = bodyContent.replace(/<div id="super-admin-panel"[\s\S]*?<\/div>\s*<\/div>/g, '');
    bodyContent = bodyContent.replace(/<div id="admin-crop-modal"[\s\S]*?<\/div>\s*<\/div>/g, '');
    bodyContent = bodyContent.replace(/<div id="admin-subcat-modal"[\s\S]*?<\/div>\s*<\/div>/g, '');
    
    const { error } = await supabase
        .from('pages')
        .update({ html_content: bodyContent })
        .eq('slug', slug);
        
    if (error) {
        console.error(`Error pushing ${slug}:`, error);
    } else {
        console.log(`Successfully restored ${slug} to Supabase!`);
    }
}

async function main() {
    await pushPage('index.html', 'index');
    await pushPage('portfolio.html', 'portfolio');
}

main();
