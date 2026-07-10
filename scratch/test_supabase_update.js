const fs = require('fs');

async function test() {
    const url = 'https://pgictinimttptsxbvngg.supabase.co/rest/v1/site_content?id=eq.portfolio&select=html_content';
    const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc';
    
    // First let's fetch to see if it exists
    let res = await fetch(url, { headers: { 'apikey': key, 'Authorization': 'Bearer ' + key } });
    let data = await res.json();
    console.log("Fetch portfolio:", data.length > 0 ? "Exists" : "Does not exist");
    
    if (data.length > 0) {
        // Let's try to update it using PATCH as Supabase update does
        const updateUrl = 'https://pgictinimttptsxbvngg.supabase.co/rest/v1/site_content?id=eq.portfolio';
        res = await fetch(updateUrl, {
            method: 'PATCH',
            headers: {
                'apikey': key,
                'Authorization': 'Bearer ' + key,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({ html_content: data[0].html_content + '<!-- test -->' })
        });
        const patchData = await res.json();
        console.log("Update response:", res.status, patchData);
    }
}
test();
