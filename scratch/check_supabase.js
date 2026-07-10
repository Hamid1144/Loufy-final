const url = 'https://pgictinimttptsxbvngg.supabase.co/rest/v1/site_content?id=eq.portfolio&select=html_content';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc';
fetch(url, { headers: { 'apikey': key, 'Authorization': 'Bearer ' + key } })
  .then(res => res.json())
  .then(data => {
    const html = data[0].html_content;
    const match = html.match(/id=\"book-covers-sub-filters\"[^>]*>([\s\S]*?)<\/div>/);
    console.log(match ? match[1] : 'NOT FOUND');
  });
