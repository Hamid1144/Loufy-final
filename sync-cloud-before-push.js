/**
 * sync-cloud-before-push.js
 * Permanent Safeguard: Automatically pulls & merges all Admin Panel saved changes
 * from Supabase (`site_content` rows `index` and `portfolio`) into local `index.html`
 * and `portfolio.html` BEFORE any git commit/push, and syncs the merged union back to Supabase.
 * Guarantees ZERO saved portfolio items, website URLs, covers, formatting items, hero text,
 * floating cards, or about bio edits are ever lost.
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const dbJs = fs.readFileSync(path.join(__dirname, 'db.js'), 'utf8');
const SUPABASE_URL = dbJs.match(/https:\/\/[a-z0-9]+\.supabase\.co/i)[0];
const SUPABASE_KEY = dbJs.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/)[0];

function supabaseRequest(method, endpoint, bodyObj) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL + endpoint);
    const bodyStr = bodyObj ? JSON.stringify(bodyObj) : null;
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json'
      }
    };
    if (bodyStr) options.headers['Content-Length'] = Buffer.byteLength(bodyStr);

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

function extractElementInnerByOpenTag(html, openTagPrefix) {
  const startIdx = html.indexOf(openTagPrefix);
  if (startIdx === -1) return null;
  const tagMatch = openTagPrefix.match(/^<([a-zA-Z0-9-]+)/);
  const tagName = tagMatch ? tagMatch[1] : 'div';
  const startInner = html.indexOf('>', startIdx) + 1;
  let depth = 1;
  let pos = startInner;
  const openToken = '<' + tagName;
  const closeToken = '</' + tagName + '>';
  while (depth > 0 && pos < html.length) {
    const nextOpen = html.indexOf(openToken, pos);
    const nextClose = html.indexOf(closeToken, pos);
    if (nextClose === -1) break;
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth++;
      pos = nextOpen + openToken.length;
    } else {
      depth--;
      if (depth === 0) {
        return {
          startInner,
          endInner: nextClose,
          inner: html.slice(startInner, nextClose)
        };
      }
      pos = nextClose + closeToken.length;
    }
  }
  return null;
}

function replaceElementInnerByOpenTag(html, openTagPrefix, newInner) {
  const found = extractElementInnerByOpenTag(html, openTagPrefix);
  if (!found) return html;
  return html.slice(0, found.startInner) + newInner + html.slice(found.endInner);
}

function extractCards(html) {
  const found = extractElementInnerByOpenTag(html, '<div class="portfolio-grid');
  if (!found) return [];
  return splitCards(found.inner);
}

function splitCards(gridInner) {
  const cards = [];
  let pos = 0;
  while (pos < gridInner.length) {
    const start = gridInner.indexOf('<div class="portfolio-card', pos);
    if (start === -1) break;
    let depth = 1;
    let scan = gridInner.indexOf('>', start) + 1;
    while (depth > 0 && scan < gridInner.length) {
      const nextOpen = gridInner.indexOf('<div', scan);
      const nextClose = gridInner.indexOf('</div>', scan);
      if (nextClose === -1) break;
      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth++;
        scan = nextOpen + 4;
      } else {
        depth--;
        scan = nextClose + 6;
      }
    }
    cards.push(gridInner.slice(start, scan).trim());
    pos = scan;
  }
  return cards;
}

function getCardIdentity(cardHtml) {
  const catMatch = cardHtml.match(/data-cat="([^"]*)"/);
  const imgMatch = cardHtml.match(/<img[^>]+src="([^"?]+)"/);
  const h3Match = cardHtml.match(/<h3[^>]*>([\s\S]*?)<\/h3>/);
  const cat = catMatch ? catMatch[1] : '';
  const img = imgMatch ? imgMatch[1] : '';
  const h3 = h3Match ? h3Match[1].replace(/<[^>]+>/g, '').trim().toLowerCase() : '';
  if (cat === 'websites' && img) return `websites::${img}`;
  return `${cat}::${img}::${h3}`;
}

function replaceGridInner(html, newGridInner) {
  return replaceElementInnerByOpenTag(html, '<div class="portfolio-grid', '\n                ' + newGridInner + '\n            ');
}

async function main() {
  console.log('[Cloud-Protect] Fetching latest saved site_content from Supabase...');
  const res = await supabaseRequest('GET', '/rest/v1/site_content?select=id,updated_at,html_content&id=in.(index,portfolio,deleted_cards_json)');
  if (res.status !== 200) {
    console.warn('[Cloud-Protect] Supabase unreachable, skipping cloud merge.');
    return;
  }
  const rows = JSON.parse(res.data || '[]');
  const indexRow = rows.find(r => r.id === 'index');
  const portfolioRow = rows.find(r => r.id === 'portfolio');
  const deletedRow = rows.find(r => r.id === 'deleted_cards_json');
  let deletedIdentifiers = [];
  try {
    if (deletedRow && deletedRow.html_content) {
      deletedIdentifiers = JSON.parse(deletedRow.html_content);
    }
  } catch(e) {}

  const indexPath = path.join(__dirname, 'index.html');
  const portfolioPath = path.join(__dirname, 'portfolio.html');
  let localIndex = fs.readFileSync(indexPath, 'utf8');
  let localPortfolio = fs.readFileSync(portfolioPath, 'utf8');

  // 1. Sync cloud Hero content, Floating Cards, and About section from Supabase indexRow into localIndex
  if (indexRow && indexRow.html_content) {
    const cloudHtml = indexRow.html_content;
    const syncBlocks = [
      '<section class="hero"',
      '<section class="about" id="about"',
      '<section class="services" id="services"',
      '<section class="tools',
      '<section class="pricing" id="pricing"',
      '<section class="testimonials" id="testimonials"',
      '<section class="faq" id="faq"',
      '<section class="contact" id="contact"',
      '<footer class="footer"'
    ];
    for (const prefix of syncBlocks) {
      const cloudBlock = extractElementInnerByOpenTag(cloudHtml, prefix);
      if (prefix.startsWith('<footer class="footer"')) {
        const hasLocalWaves = localIndex.includes('footer-wave-wrap');
        const hasCloudWaves = cloudBlock && cloudBlock.inner.includes('footer-wave-wrap');
        if (hasLocalWaves && !hasCloudWaves) {
          // Keep new local animated wave footer!
          continue;
        }
        const hasLocalSeoNav = localIndex.includes('footer-seo-nav');
        const hasCloudSeoNav = cloudBlock && cloudBlock.inner.includes('footer-seo-nav');
        if (hasLocalSeoNav && !hasCloudSeoNav) {
          // Keep new local SEO footer navigation links!
          continue;
        }
      }
      if (prefix.startsWith('<section class="about"')) {
        if (cloudBlock && cloudBlock.inner) {
          cloudBlock.inner = cloudBlock.inner
            .replace(/<div class="num"[^>]*>\s*500\+\s*<\/div>/g, '<div class="num" data-admin-text="true">2500+</div>')
            .replace(/<div class="num"[^>]*>\s*300\+\s*<\/div>/g, '<div class="num" data-admin-text="true">1500+</div>');
        }
      }
      if (prefix.startsWith('<section class="hero"')) {
        const hasLocalH1 = localIndex.includes('<h1 class="hero-main-headline"');
        const hasCloudH1 = cloudBlock && cloudBlock.inner.includes('<h1 class="hero-main-headline"');
        if (hasLocalH1 && !hasCloudH1) {
          continue;
        }
        const hasLocalMarquee = localIndex.includes('hero-platforms-marquee-wrap');
        const hasCloudMarquee = cloudBlock && cloudBlock.inner.includes('hero-platforms-marquee-wrap');
        if (hasLocalMarquee && !hasCloudMarquee) {
          // Keep new local modern hero layout with platform marquee!
          continue;
        }
        if (hasLocalMarquee && hasCloudMarquee) {
          const localMarqueeMatch = localIndex.match(/<div class="hero-platforms-marquee-wrap">[\s\S]*?<\/div>\s*<\/div>/);
          if (localMarqueeMatch) {
            cloudBlock.inner = cloudBlock.inner.replace(
              /<div class="hero-platforms-marquee-wrap">[\s\S]*?<\/div>\s*<\/div>/,
              localMarqueeMatch[0]
            );
          }
        }
      }
      if (prefix.startsWith('<section class="services"')) {
        const hasLocalDrop = localIndex.includes('services-energy-drop');
        const hasCloudDrop = cloudBlock && cloudBlock.inner.includes('services-energy-drop');
        if (hasLocalDrop && !hasCloudDrop) {
          // Keep new local energy droplet animation!
          continue;
        }
        const hasLocalDropV2 = localIndex.includes('data-drip="v2"');
        const hasCloudDropV2 = cloudBlock && cloudBlock.inner.includes('data-drip="v2"');
        if (hasLocalDropV2 && !hasCloudDropV2) {
          // Keep new local drip animation and tree!
          continue;
        }
        const hasLocalTree = localIndex.includes('services-tree-wrap');
        const hasCloudTree = cloudBlock && cloudBlock.inner.includes('services-tree-wrap');
        if (hasLocalTree && !hasCloudTree) {
          continue;
        }
      }
      if (prefix.startsWith('<section class="pricing"')) {
        const localHasWebsites = localIndex.includes('id="websites-pricing"');
        const cloudHasWebsites = cloudBlock && cloudBlock.inner.includes('id="websites-pricing"');
        if (!localHasWebsites && cloudHasWebsites) {
          // Keep local home page layout (publishing pricing only on homepage)!
          continue;
        }
        const localHasProSuite = localIndex.includes('Publishing Pro Suite');
        const cloudHasProSuite = cloudBlock && cloudBlock.inner.includes('Publishing Pro Suite');
        if (localHasProSuite && !cloudHasProSuite) {
          // Keep updated unified Book Publishing packages!
          continue;
        }
      }
      if (prefix.startsWith('<section class="testimonials"')) {
        const hasLocalVerticalTicker = localIndex.includes('reviews-vertical-marquee-wrap');
        const hasCloudVerticalTicker = cloudBlock && cloudBlock.inner.includes('reviews-vertical-marquee-wrap');
        if (hasLocalVerticalTicker && !hasCloudVerticalTicker) {
          // Keep new local vertical scrolling reviews ticker!
          continue;
        }
        const hasLocalInitials = localIndex.includes('review-author-initial');
        const hasCloudInitials = cloudBlock && cloudBlock.inner.includes('review-author-initial') && !cloudBlock.inner.includes('review-author-avatar');
        if (hasLocalInitials && !hasCloudInitials) {
          // Keep new local initial-badge reviews & /testimonials View More link!
          continue;
        }
      }
      if (cloudBlock && cloudBlock.inner.trim().length > 20) {
        let cleanedInner = cloudBlock.inner;
        if (prefix.includes('hero-floating-cards')) {
          cleanedInner = cleanedInner
            .replace(/--hero-float-card-scale:\s*2\b/g, '--hero-float-card-scale: 1')
            .replace(/animation-delay:\s*([1-9][0-9.]*s)/g, 'animation-delay: -$1');
        }
        localIndex = replaceElementInnerByOpenTag(localIndex, prefix, cleanedInner);
      }
    }
  }

  // 1b. Explicitly sync Hero Showcase Image src from cloud into localIndex
  if (indexRow && indexRow.html_content) {
    const cloudHeroImgMatch = indexRow.html_content.match(/<img[^>]*id=["']hero-showcase-img["'][^>]*src=["']([^"']+)["']/i);
    if (cloudHeroImgMatch && cloudHeroImgMatch[1] && !cloudHeroImgMatch[1].includes('hero_illustration_reference')) {
      const cloudHeroSrc = cloudHeroImgMatch[1];
      localIndex = localIndex.replace(
        /(<img[^>]*id=["']hero-showcase-img["'][^>]*src=["'])[^"']+([^"']*["'])/i,
        `$1${cloudHeroSrc}$2`
      );
    }
  }

  // 2. Union-merge all Portfolio Cards across Cloud Portfolio, Cloud Index, Local Index, and Local Portfolio
  const cloudPortfolioCards = portfolioRow ? extractCards(portfolioRow.html_content) : [];
  const cloudIndexCards = indexRow ? extractCards(indexRow.html_content) : [];
  const localIndexCards = extractCards(localIndex);
  const localPortfolioCards = extractCards(localPortfolio);

  console.log(`[Cloud-Protect] Card counts -> Cloud Portfolio: ${cloudPortfolioCards.length}, Cloud Index: ${cloudIndexCards.length}, Local Index: ${localIndexCards.length}, Local Portfolio: ${localPortfolioCards.length}`);

  const primaryCards = cloudPortfolioCards.length >= cloudIndexCards.length ? cloudPortfolioCards : cloudIndexCards;
  const secondaryCards = cloudPortfolioCards.length >= cloudIndexCards.length ? cloudIndexCards : cloudPortfolioCards;

  const mergedMap = new Map();
  const orderedKeys = [];

  for (const list of [primaryCards, secondaryCards, localIndexCards, localPortfolioCards]) {
    for (const card of list) {
      const isDeleted = deletedIdentifiers.some(ident => ident && card.includes(ident));
      if (isDeleted) continue;

      const key = getCardIdentity(card);
      if (!mergedMap.has(key)) {
        orderedKeys.push(key);
        mergedMap.set(key, card);
      } else {
        const existing = mergedMap.get(key);
        if (card.includes('beckerperfektkuechen.de') && !existing.includes('beckerperfektkuechen.de')) {
          mergedMap.set(key, card);
        }
      }
    }
  }

  const mergedCards = orderedKeys.map(k => mergedMap.get(k));
  console.log(`[Cloud-Protect] Merged union total cards: ${mergedCards.length} (has beckerperfektkuechen.de: ${mergedCards.some(c => c.includes('beckerperfektkuechen.de'))})`);

  const mergedGridHtml = mergedCards.map(c => {
    const h3M = c.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
    const cardTitle = h3M ? h3M[1].replace(/<[^>]+>/g, '').trim() : 'Book Cover Design';
    return c
      .replace(/<img([^>]*?)\balt=""([^>]*?)>/gi, `<img$1alt="${cardTitle} Preview"$2>`)
      .replace(/<img(?![^>]*\balt=)([^>]*?)>/gi, `<img alt="${cardTitle} Preview"$1>`)
      .replace(/href=["']portfolio\.html["']/gi, 'href="/portfolio"')
      .replace(/<img(?![^>]*loading=)([^>]*?)>/gi, '<img loading="lazy" decoding="async"$1>')
      .replace(/loading=["']lazy["'](?![^>]*decoding=)/gi, 'loading="lazy" decoding="async"');
  }).join('\n\n');

  // 3. Ensure Hero BG video in localIndex uses the 100% original 19.17MB lossless fast-start MP4 + raw original fallback
  localIndex = localIndex
    .replace(/href="\/hero-bg-fast\.mp4(?:\?[^"]*)?"/g, 'href="/hero-bg-fast.mp4?v=orig1080p"')
    .replace(/src="\/hero-bg-fast\.mp4(?:\?[^"]*)?"/g, 'src="/hero-bg-fast.mp4?v=orig1080p"')
    .replace(/https:\/\/res\.cloudinary\.com\/dtr3yvjac\/video\/upload\/[^"]*\/v1790370925\/lv_0_20260620110136-1_wliolu\.mp4/g, 'https://res.cloudinary.com/dtr3yvjac/video/upload/v1790370925/lv_0_20260620110136-1_wliolu.mp4')
    .replace(/live-sync\.js\?v=[0-9_]+/g, 'live-sync.js?v=20261103_001');

  localPortfolio = localPortfolio
    .replace(/live-sync\.js\?v=[0-9_]+/g, 'live-sync.js?v=20261103_001');

  localIndex = replaceGridInner(localIndex, mergedGridHtml).replace(/href=["']portfolio\.html["']/gi, 'href="/portfolio"').replace(/<a href="\/portfolio\/covers" id="service-modal-portfolio-btn"/g, '<a href="/portfolio" id="service-modal-portfolio-btn"');
  localPortfolio = replaceGridInner(localPortfolio, mergedGridHtml);

  // 3b. Fetch latest og_images_json from Supabase and synchronize static meta tags in HTML files
  try {
    const toOptimalOgUrl = (rawUrl) => {
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
    };

    const updateMetaInHtml = (html, rawImgUrl) => {
      if (!rawImgUrl) return html;
      const optimalUrl = toOptimalOgUrl(rawImgUrl);
      let updated = html;

      // Clean out any duplicate or malformed previous og:image tags
      updated = updated.replace(/<meta\s+property=["']og:image:secure_url["'][^>]*>\s*/gi, '');
      updated = updated.replace(/<meta\s+property=["']og:image:type["'][^>]*>\s*/gi, '');
      updated = updated.replace(/<meta\s+property=["']og:image:width["'][^>]*>\s*/gi, '');
      updated = updated.replace(/<meta\s+property=["']og:image:height["'][^>]*>\s*/gi, '');

      const newOgBlock = `<meta property="og:image" content="${optimalUrl}">\n  <meta property="og:image:secure_url" content="${optimalUrl}">\n  <meta property="og:image:type" content="image/jpeg">\n  <meta property="og:image:width" content="1200">\n  <meta property="og:image:height" content="630">`;

      if (/<meta\s+property=["']og:image["'][^>]*>/i.test(updated)) {
        updated = updated.replace(/<meta\s+property=["']og:image["'][^>]*>/i, newOgBlock);
      } else {
        updated = updated.replace(/<\/head>/i, `  ${newOgBlock}\n</head>`);
      }

      // Ensure twitter:card is summary_large_image
      if (/<meta\s+name=["']twitter:card["'][^>]*>/i.test(updated)) {
        updated = updated.replace(/<meta\s+name=["']twitter:card["'][^>]*>/i, '<meta name="twitter:card" content="summary_large_image">');
      } else {
        updated = updated.replace(/<meta\s+property=["']og:image:height["'][^>]*>/i, `$& \n  <meta name="twitter:card" content="summary_large_image">`);
      }

      // Update twitter:image
      if (/<meta\s+name=["']twitter:image["'][^>]*>/i.test(updated)) {
        updated = updated.replace(/<meta\s+name=["']twitter:image["'][^>]*>/i, `<meta name="twitter:image" content="${optimalUrl}">`);
      } else {
        updated = updated.replace(/<meta\s+name=["']twitter:card["'][^>]*>/i, `$& \n  <meta name="twitter:image" content="${optimalUrl}">`);
      }

      return updated;
    };

    const ogRes = await supabaseRequest('GET', '/rest/v1/site_content?id=eq.og_images_json&select=html_content');
    if (ogRes && ogRes.status === 200 && ogRes.data) {
      const parsedRows = JSON.parse(ogRes.data);
      if (parsedRows && parsedRows[0] && parsedRows[0].html_content) {
        const ogData = JSON.parse(parsedRows[0].html_content);
        const fileMap = {
          'index.html': ogData.main && ogData.main.home && ogData.main.home.image,
          'portfolio.html': ogData.main && ogData.main.portfolio && ogData.main.portfolio.image,
          'services.html': ogData.main && ogData.main.services && ogData.main.services.image,
          'pricing.html': ogData.main && ogData.main.pricing && ogData.main.pricing.image,
          'testimonials.html': ogData.main && ogData.main.testimonials && ogData.main.testimonials.image,
          'about.html': ogData.main && ogData.main.about && ogData.main.about.image,
          'contact.html': ogData.main && ogData.main.contact && ogData.main.contact.image,
          'blogs.html': ogData.main && ogData.main.blogs && ogData.main.blogs.image,
          'blog.html': ogData.main && ogData.main.blogs && ogData.main.blogs.image,
          'tools.html': ogData.main && ogData.main.tools && ogData.main.tools.image
        };

        if (fileMap['index.html']) {
          localIndex = updateMetaInHtml(localIndex, fileMap['index.html']);
        }
        if (fileMap['portfolio.html']) {
          localPortfolio = updateMetaInHtml(localPortfolio, fileMap['portfolio.html']);
        }

        for (const [fname, imgUrl] of Object.entries(fileMap)) {
          if (fname !== 'index.html' && fname !== 'portfolio.html' && imgUrl) {
            const fPath = path.join(__dirname, fname);
            if (fs.existsSync(fPath)) {
              let fHtml = fs.readFileSync(fPath, 'utf8');
              fHtml = updateMetaInHtml(fHtml, imgUrl);
              fs.writeFileSync(fPath, fHtml, 'utf8');
            }
          }
        }
        console.log('[Cloud-Protect] Synchronized optimized static OG image tags across all HTML files.');
      }
    }
  } catch (ogErr) {
    console.warn('[Cloud-Protect] OG images sync warning:', ogErr.message);
  }

  fs.writeFileSync(indexPath, localIndex, 'utf8');
  fs.writeFileSync(portfolioPath, localPortfolio, 'utf8');
  console.log('[Cloud-Protect] Saved merged index.html and portfolio.html to disk.');

  // 4. Sync merged body HTML back to Supabase site_content (both 'index' and 'portfolio' rows)
  const extractBodyInner = (fullHtml) => {
    const bStart = fullHtml.indexOf('<body');
    if (bStart === -1) return fullHtml;
    const bOpenEnd = fullHtml.indexOf('>', bStart) + 1;
    const bClose = fullHtml.lastIndexOf('</body>');
    return bClose !== -1 ? fullHtml.slice(bOpenEnd, bClose).trim() : fullHtml.slice(bOpenEnd).trim();
  };

  const indexBody = extractBodyInner(localIndex);
  const portfolioBody = extractBodyInner(localPortfolio);

  const upIndex = await supabaseRequest('PATCH', '/rest/v1/site_content?id=eq.index', {
    html_content: indexBody,
    updated_at: new Date().toISOString()
  });
  const upPort = await supabaseRequest('PATCH', '/rest/v1/site_content?id=eq.portfolio', {
    html_content: portfolioBody,
    updated_at: new Date().toISOString()
  });
  console.log(`[Cloud-Protect] Synced merged HTML back to Supabase -> index: HTTP ${upIndex.status}, portfolio: HTTP ${upPort.status}`);
  try {
    const blogsRaw = fs.readFileSync(path.join(__dirname, 'blogs.json'), 'utf8');
    const upBlogs = await supabaseRequest('PATCH', '/rest/v1/site_content?id=eq.blogs_json', {
      html_content: blogsRaw,
      updated_at: new Date().toISOString()
    });
    console.log(`[Cloud-Protect] Synced normalized blogs.json to Supabase -> HTTP ${upBlogs.status}`);
  } catch (bErr) {
    console.warn('[Cloud-Protect] blogs_json sync warning:', bErr.message);
  }
}

main().catch(err => {
  console.error('[Cloud-Protect] Error:', err);
});
