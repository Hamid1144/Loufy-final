const fs = require('fs');

async function test() {
    const url = 'https://pgictinimttptsxbvngg.supabase.co/rest/v1/site_content';
    const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc';
    
    // First, let's just GET index
    const getRes = await fetch(url + '?id=eq.index&select=updated_at', { headers: { 'apikey': key, 'Authorization': 'Bearer ' + key } });
    console.log("Before UPSERT index:", await getRes.json());
    
    // Upsert index
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'apikey': key,
            'Authorization': 'Bearer ' + key,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation,resolution=merge-duplicates'
        },
        body: JSON.stringify({ id: 'index', html_content: '<!-- upsert test index -->' })
    });
    
    const data = await res.json();
    console.log("Upsert response index updated_at:", data[0].updated_at);
    
    // GET again
    const getRes2 = await fetch(url + '?id=eq.index&select=updated_at', { headers: { 'apikey': key, 'Authorization': 'Bearer ' + key } });
    console.log("After UPSERT index:", await getRes2.json());
}
test();
