const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://pgictinimttptsxbvngg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaWN0aW5pbXR0cHRzeGJ2bmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjE5NjAsImV4cCI6MjA5MjE5Nzk2MH0.XTQQ9CUQTxJ93ndn93cHzwTjjc1vVWBLcKpWczqnkpc';

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function toOptimalOgImageUrl(rawUrl) {
  const fallback = 'https://res.cloudinary.com/dtr3yvjac/image/upload/w_1200,h_630,c_fill,q_auto,f_jpg/v1792352606/portfolio/hoqzk0a9ghaxafhte4wy.jpg';
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

function loadLocalBlogs() {
  try {
    const blogsPath = path.join(process.cwd(), 'blogs.json');
    if (fs.existsSync(blogsPath)) {
      return JSON.parse(fs.readFileSync(blogsPath, 'utf8'));
    }
  } catch (e) {}
  return [];
}

async function getAllPosts() {
  const localPosts = loadLocalBlogs();
  const localMap = new Map(localPosts.map(p => [p.slug, p]));

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/site_content?id=eq.blogs_json&select=html_content`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    );
    if (res.ok) {
      const data = await res.json();
      if (data && data[0] && data[0].html_content) {
        const cloudPosts = JSON.parse(data[0].html_content);
        if (Array.isArray(cloudPosts)) {
          for (const cp of cloudPosts) {
            if (cp && cp.slug && !localMap.has(cp.slug)) {
              localPosts.push(cp);
              localMap.set(cp.slug, cp);
            }
          }
        }
      }
    }
  } catch (e) {}

  return localPosts;
}

module.exports = async (req, res) => {
  const rawSlug = req.query.slug || '';
  const slug = String(rawSlug).replace(/\.html$/i, '').trim();

  const postsList = await getAllPosts();
  const post = postsList.find(p => p && p.slug === slug) || null;

  // Return true HTTP 404 if slug does not exist (eliminates Soft 404s)
  if (!slug || !post) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    return res.status(404).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>404 — Article Not Found | Loufy Publisher</title>
  <link rel="stylesheet" href="/style.css?v=99.13">
</head>
<body style="font-family:'Poppins',sans-serif;text-align:center;padding:100px 20px;background:#f8fafc;color:#0f172a;">
  <h1 style="font-size:2.4rem;margin-bottom:16px;">404 — Article Not Found</h1>
  <p style="color:#475569;max-width:520px;margin:0 auto 28px;">The requested blog article does not exist or has been moved. Explore our complete library of self-publishing and Amazon KDP guides below.</p>
  <a href="/blogs" class="btn btn-primary" style="display:inline-flex;padding:12px 28px;text-decoration:none;">Browse All Articles</a>
</body>
</html>`);
  }

  const seoTitle = post.seo_title || `${post.title} | Loufy Publisher`;
  const seoDesc = post.seo_description || post.summary || 'Expert guide on book cover design, Amazon KDP formatting, and self-publishing by Hamid Raza at Loufy Publisher.';
  const canonicalUrl = `https://loufypublisher.com/blog/${encodeURIComponent(post.slug)}`;
  const rawImage = post.image_url || post.featured_image || post.image || '';
  const ogImage = toOptimalOgImageUrl(rawImage);
  const authorName = post.author_name || 'Hamid Raza';
  const pubDate = new Date(post.published_at || Date.now());
  const dateFormatted = pubDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Process article HTML headings for TOC and ensure all images have alt attributes
  let headingIdx = 0;
  const tocItems = [];
  let processedContent = String(post.content || '').replace(/<(h[23])([^>]*)>([\s\S]*?)<\/\1>/gi, (full, tag, attrs, inner) => {
    const id = `heading-${headingIdx++}`;
    const cleanText = inner.replace(/<[^>]+>/g, '').trim();
    const isSub = tag.toLowerCase() === 'h3';
    tocItems.push(`<li style="${isSub ? 'padding-left:15px; font-size:0.85rem;' : ''}"><a href="#${id}">${escapeHtml(cleanText)}</a></li>`);
    if (/\bid=/i.test(attrs)) {
      return full;
    }
    return `<${tag}${attrs} id="${id}">${inner}</${tag}>`;
  });

  processedContent = processedContent.replace(/<img\b([^>]*)>/gi, (full, attrs) => {
    if (!/\balt=/i.test(attrs) || /\balt=["']\s*["']/i.test(attrs)) {
      const cleaned = attrs.replace(/\balt=["']\s*["']/i, '');
      return `<img alt="${escapeHtml(post.title)}" loading="lazy"${cleaned}>`;
    }
    return full;
  });

  // Build FAQ HTML
  const faqs = Array.isArray(post.faqs) ? post.faqs : [];
  const faqHtml = faqs.map(faq => `
    <div class="faq-item">
      <div class="faq-q">${escapeHtml(faq.question)} <span class="icon">+</span></div>
      <div class="faq-a" style="max-height:0; overflow:hidden; padding:0 24px; transition:all 0.4s ease;"><p>${escapeHtml(faq.answer)}</p></div>
    </div>
  `).join('');

  // Build Related Articles HTML (up to 3 related articles)
  const postTags = Array.isArray(post.tags) ? post.tags : [];
  const related = postsList
    .filter(p => p && p.slug !== post.slug && (p.category === post.category || (Array.isArray(p.tags) && p.tags.some(t => postTags.includes(t)))))
    .slice(0, 3);

  const relatedHtml = related.map(r => {
    const rDate = new Date(r.published_at || Date.now()).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    return `
      <div class="blog-card reveal active">
        <div class="blog-thumb">
          <img src="${escapeHtml(r.image_url)}" alt="${escapeHtml(r.title)}" loading="lazy">
          <span class="blog-category-badge">${escapeHtml(r.category)}</span>
        </div>
        <div class="blog-body">
          <div class="blog-meta-line">
            <span><i class="fa-regular fa-calendar-days"></i> ${escapeHtml(rDate)}</span>
            <span><i class="fa-regular fa-clock"></i> ${escapeHtml(r.read_time)} min read</span>
          </div>
          <h3>${escapeHtml(r.title)}</h3>
          <p>${escapeHtml(r.summary)}</p>
          <div class="blog-footer-line">
            <span class="blog-author-tag"><i class="fa-regular fa-user"></i> ${escapeHtml(r.author_name || 'Loufy Publisher')}</span>
            <a href="/blog/${encodeURIComponent(r.slug)}" class="read-more">Read More →</a>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Prev & Next Navigation
  const sortedPosts = [...postsList].sort((a, b) => new Date(a.published_at) - new Date(b.published_at));
  const currentIndex = sortedPosts.findIndex(p => p.slug === post.slug);
  const prevPost = currentIndex > 0 ? sortedPosts[currentIndex - 1] : null;
  const nextPost = currentIndex >= 0 && currentIndex < sortedPosts.length - 1 ? sortedPosts[currentIndex + 1] : null;

  // JSON-LD Schemas
  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    image: ogImage,
    datePublished: post.published_at,
    dateModified: post.published_at,
    author: {
      '@type': 'Person',
      name: authorName
    },
    publisher: {
      '@type': 'Organization',
      name: 'Loufy Publisher',
      logo: {
        '@type': 'ImageObject',
        url: 'https://loufypublisher.com/favicon.png'
      }
    },
    isPartOf: {
      '@type': 'WebSite',
      '@id': 'https://loufypublisher.com/#website',
      name: 'Loufy Publisher',
      url: 'https://loufypublisher.com/'
    },
    description: seoDesc,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl
    }
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Loufy Publisher',
        item: 'https://loufypublisher.com/'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://loufypublisher.com/blogs'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: canonicalUrl
      }
    ]
  };

  let schemasHtml = `<script type="application/ld+json">${JSON.stringify(blogPostingSchema)}</script>\n  <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`;
  if (faqs.length > 0) {
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(f => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.answer
        }
      }))
    };
    schemasHtml += `\n  <script type="application/ld+json">${JSON.stringify(faqSchema)}</script>`;
  }

  // Read blog.html template and inject SSR content
  const templatePath = path.join(process.cwd(), 'blog.html');
  let html = fs.readFileSync(templatePath, 'utf8');

  html = html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(seoTitle)}</title>`)
    .replace(/<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${escapeHtml(canonicalUrl)}">`)
    .replace(/<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${escapeHtml(seoDesc)}">`)
    .replace(/<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${escapeHtml(canonicalUrl)}">`)
    .replace(/<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${escapeHtml(seoTitle)}">`)
    .replace(/<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${escapeHtml(seoDesc)}">`)
    .replace(/<meta\s+property=["']og:image["'][^>]*>/i, `<meta property="og:image" content="${escapeHtml(ogImage)}">`)
    .replace(/<meta\s+property=["']og:image:secure_url["'][^>]*>/i, `<meta property="og:image:secure_url" content="${escapeHtml(ogImage)}">`)
    .replace(/<meta\s+name=["']twitter:url["'][^>]*>/i, `<meta name="twitter:url" content="${escapeHtml(canonicalUrl)}">`)
    .replace(/<meta\s+name=["']twitter:title["'][^>]*>/i, `<meta name="twitter:title" content="${escapeHtml(seoTitle)}">`)
    .replace(/<meta\s+name=["']twitter:description["'][^>]*>/i, `<meta name="twitter:description" content="${escapeHtml(seoDesc)}">`)
    .replace(/<meta\s+name=["']twitter:image["'][^>]*>/i, `<meta name="twitter:image" content="${escapeHtml(ogImage)}">`)
    .replace('</head>', `  ${schemasHtml}\n</head>`)
    .replace('<body class="blog-detail-page">', `<body class="blog-detail-page loaded" data-ssr-slug="${escapeHtml(post.slug)}">`)
    .replace(/<span class="blog-hero-category" id="post-hero-category">[\s\S]*?<\/span>/, `<span class="blog-hero-category" id="post-hero-category">${escapeHtml(post.category)}</span>`)
    .replace(/<h1 id="post-hero-title">[\s\S]*?<\/h1>/, `<h1 id="post-hero-title">${escapeHtml(post.title)}</h1>`)
    .replace(/<span id="post-hero-author">[\s\S]*?<\/span>/, `<span id="post-hero-author">${escapeHtml(authorName)}</span>`)
    .replace(/<span id="post-hero-date">[\s\S]*?<\/span>/, `<span id="post-hero-date">${escapeHtml(dateFormatted)}</span>`)
    .replace(/<span id="post-hero-read-time">[\s\S]*?<\/span>/, `<span id="post-hero-read-time">${escapeHtml(post.read_time)}</span>`)
    .replace(/<div class="blog-hero-bg" id="post-hero-bg-img"[^>]*><\/div>/, `<div class="blog-hero-bg" id="post-hero-bg-img" style="background-image: url('${escapeHtml(rawImage)}');"></div>`)
    .replace(/<ul id="toc-list">[\s\S]*?<\/ul>/, `<ul id="toc-list">${tocItems.join('')}</ul>`)
    .replace(/<div class="blog-body-text" id="post-body-content">[\s\S]*?<\/div>/, `<div class="blog-body-text" id="post-body-content">${processedContent}</div>`);

  if (faqs.length > 0) {
    html = html
      .replace('<div class="blog-faq-section" id="post-faq-wrapper" style="display:none;">', '<div class="blog-faq-section" id="post-faq-wrapper" style="display:block;">')
      .replace(/<div class="blog-faq-list" id="post-faq-list">[\s\S]*?<\/div>/, `<div class="blog-faq-list" id="post-faq-list">${faqHtml}</div>`);
  }

  if (prevPost || nextPost) {
    html = html.replace('<div class="blog-nav-row" id="post-nav-navigation" style="display:none;">', '<div class="blog-nav-row" id="post-nav-navigation" style="display:grid;">');
    if (prevPost) {
      html = html
        .replace(/<a href="[^"]*" class="blog-nav-btn prev" id="blog-nav-prev-btn">/, `<a href="/blog/${encodeURIComponent(prevPost.slug)}" class="blog-nav-btn prev" id="blog-nav-prev-btn" style="display:flex;">`)
        .replace(/<span class="nav-title" id="blog-nav-prev-title">[\s\S]*?<\/span>/, `<span class="nav-title" id="blog-nav-prev-title">${escapeHtml(prevPost.title)}</span>`);
    } else {
      html = html.replace(/<a href="[^"]*" class="blog-nav-btn prev" id="blog-nav-prev-btn">/, '<a href="/blogs" class="blog-nav-btn prev" id="blog-nav-prev-btn" style="display:none;">');
    }
    if (nextPost) {
      html = html
        .replace(/<a href="[^"]*" class="blog-nav-btn next" id="blog-nav-next-btn">/, `<a href="/blog/${encodeURIComponent(nextPost.slug)}" class="blog-nav-btn next" id="blog-nav-next-btn" style="display:flex;">`)
        .replace(/<span class="nav-title" id="blog-nav-next-title">[\s\S]*?<\/span>/, `<span class="nav-title" id="blog-nav-next-title">${escapeHtml(nextPost.title)}</span>`);
    } else {
      html = html.replace(/<a href="[^"]*" class="blog-nav-btn next" id="blog-nav-next-btn">/, '<a href="/blogs" class="blog-nav-btn next" id="blog-nav-next-btn" style="display:none;">');
    }
  }

  if (related.length > 0) {
    html = html
      .replace('<section class="blog-related-section" id="blog-related-articles" style="display:none;">', '<section class="blog-related-section" id="blog-related-articles" style="display:block;">')
      .replace(/<div class="blog-grid" id="blog-related-grid">[\s\S]*?<\/div>/, `<div class="blog-grid" id="blog-related-grid">${relatedHtml}</div>`);
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=600');
  return res.status(200).send(html);
};
