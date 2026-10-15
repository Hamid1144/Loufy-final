const https = require('https');

const SUPABASE_URL = 'https://pgictinimttptsxbvngg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc';

// Cache in memory across warm serverless invocations (60s TTL)
let cachedOgData = null;
let cachedTime = 0;

async function getOgData() {
  const now = Date.now();
  if (cachedOgData && (now - cachedTime < 60000)) {
    return cachedOgData;
  }
  return new Promise((resolve) => {
    const url = new URL(SUPABASE_URL + '/rest/v1/site_content?id=eq.og_images_json&select=html_content');
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
            cachedOgData = JSON.parse(parsed[0].html_content);
            cachedTime = now;
            resolve(cachedOgData);
            return;
          }
        } catch (e) {}
        resolve(null);
      });
    }).on('error', () => resolve(null));
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
  const ogData = await getOgData();
  const categoryKey = (req.query && req.query.category) ? String(req.query.category).toLowerCase().trim() : '';

  // Defaults
  let title = 'Book Cover Design & Formatting Portfolio | Loufy Publisher';
  let desc = "Explore Hamid Raza's design portfolio. Premium book covers, children's coloring books, KDP interior formatting, A+ content, and branding. View projects.";
  let img = 'https://res.cloudinary.com/dtr3yvjac/image/upload/f_auto,q_auto/v1781206025/portfolio/img_1aa66a3171fba529fd10242f008e6a2a.webp';
  let pageUrl = 'https://loufypublisher.com/portfolio';

  const categoryTitles = {
    'covers': 'Book Cover Design Portfolio | Loufy Publisher',
    'paperback-covers': 'Paperback Book Covers Portfolio | Loufy Publisher',
    'children': 'Children Books & Illustration Portfolio | Loufy Publisher',
    'formatting': 'KDP Interior Formatting & Layout Portfolio | Loufy Publisher',
    'websites': 'Websites I Created Portfolio | Loufy Publisher',
    'a-plus-content': 'Amazon A+ Content Design Portfolio | Loufy Publisher',
    'logo-branding': 'Logo & Author Branding Portfolio | Loufy Publisher'
  };

  const categoryDescriptions = {
    'covers': 'Browse premium custom book covers designed by Hamid Raza for Kindle, Amazon KDP, and IngramSpark across all genres.',
    'paperback-covers': 'Full wrap paperback and hardcover book cover designs formatted perfectly for Amazon KDP and print-on-demand publishers.',
    'children': 'Playful, vibrant children book covers, interior formatting, and coloring books created by Hamid Raza (Loufy Publisher).',
    'formatting': 'Professional KDP paperback and eBook interior formatting with pristine typography, drop caps, and chapter styling.',
    'websites': 'Custom high-converting author websites, e-commerce stores, and business websites designed & coded by Hamid Raza.',
    'a-plus-content': 'High-converting Amazon A+ Content layouts and brand story banners that boost book sales and page conversions.',
    'logo-branding': 'Distinctive logos, typography marks, and author brand identity design by Loufy Publisher.'
  };

  if (categoryKey && categoryTitles[categoryKey]) {
    title = categoryTitles[categoryKey];
    desc = categoryDescriptions[categoryKey] || desc;
    pageUrl = `https://loufypublisher.com/portfolio/${categoryKey}`;
  }

  // Check custom user configuration from Supabase og_images_json
  if (ogData) {
    if (categoryKey && ogData.categories && ogData.categories[categoryKey] && ogData.categories[categoryKey].image) {
      img = ogData.categories[categoryKey].image;
    } else if (!categoryKey && ogData.main && ogData.main.portfolio && ogData.main.portfolio.image) {
      img = ogData.main.portfolio.image;
    }
  }

  // Ensure absolute HTTPS URL for crawler
  if (img.startsWith('/')) {
    img = 'https://loufypublisher.com' + img;
  }

  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(desc);
  const safeImg = escapeHtml(img);
  const safeUrl = escapeHtml(pageUrl);
  const destinationUrl = categoryKey ? `/portfolio.html?category=${encodeURIComponent(categoryKey)}` : '/portfolio.html';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDesc}">
  <link rel="canonical" href="${safeUrl}">

  <!-- Open Graph / Facebook / WhatsApp -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${safeUrl}">
  <meta property="og:site_name" content="Loufy Publisher">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDesc}">
  <meta property="og:image" content="${safeImg}">
  <meta property="og:image:secure_url" content="${safeImg}">
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
    <p>Opening portfolio...</p>
    <a href="${destinationUrl}" style="color:#F4B400;text-decoration:none;">Click here if not redirected</a>
  </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=120');
  res.status(200).send(html);
};
