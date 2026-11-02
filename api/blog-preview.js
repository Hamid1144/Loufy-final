const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://pgictinimttptsxbvngg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc';

let cachedBlogs = null;
let cachedTime = 0;

function toOptimalOgUrl(rawUrl) {
  if (!rawUrl) return 'https://res.cloudinary.com/dtr3yvjac/image/upload/w_1200,h_630,c_fill,q_auto,f_jpg/v1792352606/portfolio/hoqzk0a9ghaxafhte4wy.jpg';
  let url = rawUrl.trim();
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    url = url.replace(/\/upload\/(?:(?:[a-z0-9_,:-]+)\/)?(v\d+\/[^.]+)\.[a-z0-9]+$/i, '/upload/w_1200,h_630,c_fill,q_auto,f_jpg/$1.jpg');
    if (!url.includes('/upload/w_1200,h_630,c_fill,q_auto,f_jpg/')) {
      url = url.replace(/\/upload\//, '/upload/w_1200,h_630,c_fill,q_auto,f_jpg/');
      url = url.replace(/\.(png|webp|avif)$/i, '.jpg');
    }
  } else if (url.includes('images.unsplash.com')) {
    url = url.replace(/\?(.*)$/, '?w=1200&h=630&fit=crop&q=80&fm=jpg');
  }
  return url;
}

async function getBlogsList() {
  const now = Date.now();
  if (cachedBlogs && (now - cachedTime < 60000)) {
    return cachedBlogs;
  }
  return new Promise((resolve) => {
    const url = new URL(SUPABASE_URL + '/rest/v1/site_content?id=eq.blogs_json&select=html_content');
    https.get(url, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed && parsed[0] && parsed[0].html_content) {
            cachedBlogs = JSON.parse(parsed[0].html_content);
            cachedTime = now;
            resolve(cachedBlogs);
            return;
          }
        } catch (e) {}
        // Fallback to local blogs.json
        try {
          const localPath = path.join(__dirname, '..', 'blogs.json');
          if (fs.existsSync(localPath)) {
            const localData = JSON.parse(fs.readFileSync(localPath, 'utf8'));
            resolve(localData);
            return;
          }
        } catch (e) {}
        resolve([]);
      });
    }).on('error', () => resolve([]));
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = async (req, res) => {
  const slug = (req.query && req.query.slug) ? String(req.query.slug).toLowerCase().trim() : '';
  const blogs = await getBlogsList();

  let post = null;
  if (slug && Array.isArray(blogs)) {
    post = blogs.find(b => (b.slug && b.slug.toLowerCase() === slug) || (b.id && String(b.id).toLowerCase() === slug));
  }

  let title = 'Loufy Publisher Blog | Self-Publishing & KDP Expert Insights';
  let desc = 'Read expert tips, guides and tutorials about book cover design, KDP formatting, self-publishing, Amazon A+ content, and children\'s book illustration by Loufy Publisher.';
  let img = 'https://res.cloudinary.com/dtr3yvjac/image/upload/w_1200,h_630,c_fill,q_auto,f_jpg/v1792352606/portfolio/hoqzk0a9ghaxafhte4wy.jpg';
  let pageUrl = 'https://loufypublisher.com/blog';

  if (post) {
    title = (post.title ? `${post.title} | Loufy Publisher Blog` : title);
    desc = post.excerpt || post.description || desc;
    if (post.featured_image || post.image) {
      img = toOptimalOgUrl(post.featured_image || post.image);
    }
    pageUrl = `https://loufypublisher.com/blog/${encodeURIComponent(post.slug || slug)}`;
  }

  const destinationUrl = slug ? `/blog.html?slug=${encodeURIComponent(slug)}` : '/blogs.html';
  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(desc);
  const safeImg = escapeHtml(img);
  const safeUrl = escapeHtml(pageUrl);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDesc}">
  <link rel="canonical" href="${safeUrl}">

  <!-- Open Graph / Facebook / WhatsApp -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${safeUrl}">
  <meta property="og:site_name" content="Loufy Publisher">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDesc}">
  <meta property="og:image" content="${safeImg}">
  <meta property="og:image:secure_url" content="${safeImg}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${safeUrl}">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeDesc}">
  <meta name="twitter:image" content="${safeImg}">

  <!-- Fast Meta Refresh & Instant JS Redirect for real users -->
  <meta http-equiv="refresh" content="0;url=${destinationUrl}">
  <script>window.location.replace('${destinationUrl}');</script>
</head>
<body style="background:#0F3528;color:#FFFFFF;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
  <div style="text-align:center;">
    <p>Opening article...</p>
    <a href="${destinationUrl}" style="color:#F4B400;text-decoration:none;">Click here if not redirected</a>
  </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=120');
  res.status(200).send(html);
};
