const fs = require('fs');

async function test() {
    const url = 'https://pgictinimttptsxbvngg.supabase.co/rest/v1/site_content';
    const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc';
    
    const portHTML = fs.readFileSync('./portfolio.html', 'utf8');
    const match = portHTML.match(/<body[^>]*>(.*?)<\/body>/s);
    if (!match) {
        console.error("No body found");
        return;
    }
    const htmlContent = match[1];

    // POST to insert
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'apikey': key,
            'Authorization': 'Bearer ' + key,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify({ id: 'portfolio', html_content: htmlContent })
    });
    
    const data = await res.json();
    console.log("POST response:", res.status, data.length > 0 ? "Inserted successfully" : data);
}
test();
