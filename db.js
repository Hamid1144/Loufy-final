// Diag log helper
window.diagLog = function(msg) {
  try {
    const arr = JSON.parse(localStorage.getItem('supabase_diag_logs') || '[]');
    arr.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
    localStorage.setItem('supabase_diag_logs', JSON.stringify(arr));
    console.log("[DIAG] " + msg);
  } catch(e) {}
};

// Routing helper for dynamic blog posts link
window.getBlogLink = function(slug) {
  const hn = window.location.hostname;
  if (window.location.protocol === 'file:' || hn.includes('github.io') || hn === 'localhost' || hn === '127.0.0.1' || hn.startsWith('192.168.')) {
    return `blog.html?slug=${slug}`;
  }
  return `/blog/${slug}`;
};

// Initialize Supabase Client
const supabaseUrl = 'https://pgictinimttptsxbvngg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc';

// We store the client instance on the window object so other scripts can access it
try {
  if (window.supabase) {
    window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
  } else {
    console.warn("Supabase library not loaded yet.");
    // We will poll for it in case of slow script execution
    const interval = setInterval(() => {
      if (window.supabase) {
        clearInterval(interval);
        window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
      }
    }, 50);
  }
} catch (e) {
  console.error("Failed to initialize Supabase client:", e);
}

// Web3Forms Access Key for automatic email notifications on contact form submission.
// Get a free key instantly from https://web3forms.com and paste it here!
window.web3formsAccessKey = '70aec444-7db9-467f-9739-68deb0c1385f';


