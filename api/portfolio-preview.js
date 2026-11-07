const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://pgictinimttptsxbvngg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc';

const DEFAULTS = {
  covers: {
    title: 'Book Cover Design Portfolio | Loufy Publisher by Hamid Raza',
    description: 'Explore bestselling eBook and print book cover designs created by Hamid Raza at Loufy Publisher. Custom typography, genre art, and KDP-ready covers.',
    image: 'https://res.cloudinary.com/dtr3yvjac/image/upload/w_1200,h_630,c_fill,q_auto,f_jpg/v1792352137/portfolio/fctmkpmwx0gmucljreyd.jpg'
  },
  'paperback-covers': {
    title: 'Paperback & Full-Wrap Cover Portfolio | Loufy Publisher',
    description: 'View full-wrap paperback and hardcover print covers with precision spine widths, back cover blurbs, and barcode placement for Amazon KDP & IngramSpark.',
    image: 'https://res.cloudinary.com/dtr3yvjac/image/upload/w_1200,h_630,c_fill,q_auto,f_jpg/v1789681515/portfolio/k02863e76xux116c2c3z.jpg'
  },
  children: {
    title: 'Children Book Illustration & Layout Portfolio | Loufy',
    description: 'Discover magical children picture books, activity books, and coloring book interiors illustrated and formatted by Hamid Raza at Loufy Publisher.',
    image: 'https://res.cloudinary.com/dtr3yvjac/image/upload/w_1200,h_630,c_fill,q_auto,f_jpg/v1783828258/portfolio/b7npef6h4q920d3669r5.jpg'
  },
  formatting: {
    title: 'Amazon KDP Interior Book Formatting Portfolio | Loufy',
    description: 'Browse interactive flipbook samples of print-ready PDF and reflowable Kindle EPUB book interiors formatted by Hamid Raza. View our layouts today!',
    image: 'https://res.cloudinary.com/dtr3yvjac/image/upload/w_1200,h_630,c_fill,q_auto,f_jpg/v1783553142/portfolio/qxwvlirtqkmemdx4uxod.jpg'
  },
  'a-plus': {
    title: 'Amazon A+ Content & Book Marketing Portfolio | Loufy',
    description: 'High-converting Amazon KDP A+ Content modules, comparison charts, and 3D promotional graphics designed to boost your book sales on Amazon.',
    image: 'https://res.cloudinary.com/dtr3yvjac/image/upload/w_1200,h_630,c_fill,q_auto,f_jpg/v1783828499/portfolio/q0qelhs2gx53ve7wiq55.jpg'
  },
  websites: {
    title: 'Author Websites & Web Design Portfolio | Loufy Publisher',
    description: 'Explore modern, fast-loading custom websites built for authors, publishers, and creative brands by Hamid Raza at Loufy Publisher. View live demos!',
    image: 'https://res.cloudinary.com/dtr3yvjac/image/upload/w_1200,h_630,c_fill,q_auto,f_jpg/v1789569869/portfolio/wavbrytzs6vo4hp7jtvw.jpg'
  }
};

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function toOptimalOgImageUrl(rawUrl, fallbackUrl) {
  const fallback = fallbackUrl || 'https://res.cloudinary.com/dtr3yvjac/image/upload/w_1200,h_630,c_fill,q_auto,f_jpg/v1792352137/portfolio/fctmkpmwx0gmucljreyd.jpg';
  if (!rawUrl || typeof rawUrl !== 'string') return fallback;
  let url = rawUrl.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://loufypublisher.com' + (url.startsWith('/') ? '' : '/') + url;
  }
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    url = url.replace(/\/upload\/(?:f_auto,q_auto\/)?/, '/upload/w_1200,h_630,c_fill,q_auto,f_jpg/');
    url = url.replace(/\.(webp|png|avif)(\?.*)?$/i, '.jpg$2');
  } else if (url.includes('images.unsplash.com')) {
    const base = url.split('?')[0];
    url = `${base}?w=1200&h=630&fit=crop&q=80&fm=jpg`;
  }
  return url;
}

module.exports = async (req, res) => {
  const category = (req.query.category || 'covers').toLowerCase().trim();
  if (!DEFAULTS[category]) {
    // Unknown portfolio sub-category: return 404
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    return res.status(404).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="robots" content="noindex, nofollow">
  <title>404 — Portfolio Category Not Found | Loufy Publisher</title>
  <link rel="stylesheet" href="/style.css?v=99.13">
</head>
<body style="font-family:'Poppins',sans-serif;text-align:center;padding:100px 20px;">
  <h1>404 — Portfolio Category Not Found</h1>
  <p style="margin:16px 0 28px;"><a href="/portfolio" class="btn btn-primary">View Full Portfolio</a></p>
</body>
</html>`);
  }

  let meta = { ...DEFAULTS[category] };

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/site_content?id=eq.og_images_json&select=html_content`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    );
    if (response.ok) {
      const rows = await response.json();
      if (rows && rows[0] && rows[0].html_content) {
        const ogConfig = JSON.parse(rows[0].html_content);
        if (ogConfig && ogConfig.portfolio && ogConfig.portfolio[category]) {
          const custom = ogConfig.portfolio[category];
          if (custom.title) meta.title = custom.title;
          if (custom.description) meta.description = custom.description;
          if (custom.image) meta.image = custom.image;
        }
      }
    }
  } catch (err) {}

  const ogImage = toOptimalOgImageUrl(meta.image, DEFAULTS[category].image);
  // Intentional canonical pointing to the main /portfolio hub so category filter views don't compete as duplicate pages
  const canonicalUrl = 'https://loufypublisher.com/portfolio';
  const shareUrl = `https://loufypublisher.com/portfolio/${encodeURIComponent(category)}`;

  const templatePath = path.join(process.cwd(), 'portfolio.html');
  let html = fs.readFileSync(templatePath, 'utf8');

  html = html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`)
    .replace(/<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${escapeHtml(canonicalUrl)}">`)
    .replace(/<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${escapeHtml(meta.description)}">`)
    .replace(/<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${escapeHtml(shareUrl)}">`)
    .replace(/<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${escapeHtml(meta.title)}">`)
    .replace(/<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${escapeHtml(meta.description)}">`)
    .replace(/<meta\s+property=["']og:image["'][^>]*>/i, `<meta property="og:image" content="${escapeHtml(ogImage)}">`)
    .replace(/<meta\s+property=["']og:image:secure_url["'][^>]*>/i, `<meta property="og:image:secure_url" content="${escapeHtml(ogImage)}">`)
    .replace(/<meta\s+name=["']twitter:url["'][^>]*>/i, `<meta name="twitter:url" content="${escapeHtml(shareUrl)}">`)
    .replace(/<meta\s+name=["']twitter:title["'][^>]*>/i, `<meta name="twitter:title" content="${escapeHtml(meta.title)}">`)
    .replace(/<meta\s+name=["']twitter:description["'][^>]*>/i, `<meta name="twitter:description" content="${escapeHtml(meta.description)}">`)
    .replace(/<meta\s+name=["']twitter:image["'][^>]*>/i, `<meta name="twitter:image" content="${escapeHtml(ogImage)}">`);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=600');
  return res.status(200).send(html);
};
