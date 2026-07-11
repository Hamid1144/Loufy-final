const fs = require('fs');

async function test() {
    const url = 'https://pgictinimttptsxbvngg.supabase.co/rest/v1/site_content';
    const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc';
    
    // 1. DELETE index
    let delRes = await fetch(url + '?id=eq.index', {
        method: 'DELETE',
        headers: {
            'apikey': key,
            'Authorization': 'Bearer ' + key,
            'Prefer': 'return=representation'
        }
    });
    console.log("Delete index status:", delRes.status);
    
    // 2. INSERT index
    let insRes = await fetch(url, {
        method: 'POST',
        headers: {
            'apikey': key,
            'Authorization': 'Bearer ' + key,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify({ id: 'index', html_content: '<!-- deleted and re-inserted index -->' })
    });
    let data = await insRes.json();
    console.log("Insert index status:", insRes.status, "updated_at:", data[0].updated_at);
}
test();
