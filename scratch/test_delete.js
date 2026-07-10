const fs = require('fs');

async function test() {
    const url = 'https://pgictinimttptsxbvngg.supabase.co/rest/v1/site_content?id=eq.portfolio';
    const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc';
    
    // DELETE portfolio
    const res = await fetch(url, {
        method: 'DELETE',
        headers: {
            'apikey': key,
            'Authorization': 'Bearer ' + key,
            'Prefer': 'return=representation'
        }
    });
    
    const data = await res.json();
    console.log("DELETE response:", res.status, data);
}
test();
