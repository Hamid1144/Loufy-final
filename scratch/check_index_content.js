const fs = require('fs');

async function test() {
    const url = 'https://pgictinimttptsxbvngg.supabase.co/rest/v1/site_content?id=eq.index&select=html_content';
    const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc';
    
    let res = await fetch(url, { headers: { 'apikey': key, 'Authorization': 'Bearer ' + key } });
    let data = await res.json();
    console.log(data[0].html_content.substring(0, 100));
}
test();
