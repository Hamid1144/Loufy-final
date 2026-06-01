// Initialize Supabase Client
const supabaseUrl = 'https://pgictinimttptsxbvngg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc';

// We store the client instance on the window object so other scripts can access it
window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// Web3Forms Access Key for automatic email notifications on contact form submission.
// Get a free key instantly from https://web3forms.com and paste it here!
window.web3formsAccessKey = '70aec444-7db9-467f-9739-68deb0c1385f';
