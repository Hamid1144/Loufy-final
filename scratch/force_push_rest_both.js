const fs = require('fs');

const supabaseUrl = 'https://pgictinimttptsxbvngg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc';

async function pushPage(slug, filename) {
    console.log(`Pushing ${slug} from ${filename}...`);
    const html = fs.readFileSync(filename, 'utf-8');
    
    // Extract body content
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    let bodyContent = bodyMatch ? bodyMatch[1] : html;
    
    // Clean up serialized elements
    bodyContent = bodyContent.replace(/<div id="super-admin-panel"[\s\S]*?<\/div>\s*<\/div>/g, '');
    bodyContent = bodyContent.replace(/<div id="admin-crop-modal"[\s\S]*?<\/div>\s*<\/div>/g, '');
    bodyContent = bodyContent.replace(/<div id="admin-subcat-modal"[\s\S]*?<\/div>\s*<\/div>/g, '');
    bodyContent = bodyContent.replace(/<div id="custom-toast"[\s\S]*?<\/div>/g, '');
    bodyContent = bodyContent.replace(/<script src="admin\.js"[\s\S]*?<\/script>/g, '');
    
    // 1. Push to site_content
    const urlSiteContent = `${supabaseUrl}/rest/v1/site_content?id=eq.${slug}`;
    const resSiteContent = await fetch(urlSiteContent, {
        method: 'PATCH',
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ html_content: bodyContent })
    });
    
    if (!resSiteContent.ok) {
        console.error(`Error pushing ${slug} to site_content:`, await resSiteContent.text());
    } else {
        console.log(`Successfully pushed ${slug} to site_content`);
    }

    // 2. Push to pages
    const urlPages = `${supabaseUrl}/rest/v1/pages?slug=eq.${slug}`;
    const resPages = await fetch(urlPages, {
        method: 'PATCH',
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ html_content: bodyContent })
    });
    
    if (!resPages.ok) {
        console.error(`Error pushing ${slug} to pages:`, await resPages.text());
    } else {
        console.log(`Successfully pushed ${slug} to pages`);
    }
}

async function main() {
    await pushPage('index', 'index.html');
    await pushPage('portfolio', 'portfolio.html');
}

main();
