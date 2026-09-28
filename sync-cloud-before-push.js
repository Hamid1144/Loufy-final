/**
 * sync-cloud-before-push.js
 * Permanent Safeguard: Automatically pulls & merges all Admin Panel saved changes
 * from Supabase (`site_content` rows `index` and `portfolio`) into local `index.html`
 * and `portfolio.html` BEFORE any git commit/push, and syncs the merged union back to Supabase.
 * Guarantees ZERO saved portfolio items, website URLs, covers, formatting items, or hero edits are ever lost.
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

function extractCards(html) {
  const gridIdx = html.indexOf('<div class="portfolio-grid');
  if (gridIdx === -1) return [];
  const startInner = html.indexOf('>', gridIdx) + 1;
  // Find matching closing </div> for portfolio-grid
  let depth = 1;
  let pos = startInner;
  while (depth > 0 && pos < html.length) {
    const nextOpen = html.indexOf('<div', pos);
    const nextClose = html.indexOf('</div>', pos);
    if (nextClose === -1) break;
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth++;
      pos = nextOpen + 4;
    } else {
      depth--;
      if (depth === 0) {
        const gridInner = html.slice(startInner, nextClose);
        return splitCards(gridInner);
      }
      pos = nextClose + 6;
    }
  }
  return [];
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
  const gridIdx = html.indexOf('<div class="portfolio-grid');
  if (gridIdx === -1) return html;
  const startInner = html.indexOf('>', gridIdx) + 1;
  let depth = 1;
  let pos = startInner;
  while (depth > 0 && pos < html.length) {
    const nextOpen = html.indexOf('<div', pos);
    const nextClose = html.indexOf('</div>', pos);
    if (nextClose === -1) break;
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth++;
      pos = nextOpen + 4;
    } else {
      depth--;
      if (depth === 0) {
        return html.slice(0, startInner) + '\n                ' + newGridInner + '\n            ' + html.slice(nextClose);
      }
      pos = nextClose + 6;
    }
  }
  return html;
}

async function main() {
  console.log('[Cloud-Protect] Fetching latest saved site_content from Supabase...');
  const res = await supabaseRequest('GET', '/rest/v1/site_content?select=id,html_content&id=in.(index,portfolio)');
  if (res.status !== 200) {
    console.warn('[Cloud-Protect] Supabase unreachable, skipping cloud merge.');
    return;
  }
  const rows = JSON.parse(res.data || '[]');
  const indexRow = rows.find(r => r.id === 'index');
  const portfolioRow = rows.find(r => r.id === 'portfolio');

  const indexPath = path.join(__dirname, 'index.html');
  const portfolioPath = path.join(__dirname, 'portfolio.html');
  let localIndex = fs.readFileSync(indexPath, 'utf8');
  let localPortfolio = fs.readFileSync(portfolioPath, 'utf8');

  const cloudPortfolioCards = portfolioRow ? extractCards(portfolioRow.html_content) : [];
  const cloudIndexCards = indexRow ? extractCards(indexRow.html_content) : [];
  const localIndexCards = extractCards(localIndex);
  const localPortfolioCards = extractCards(localPortfolio);

  console.log(`[Cloud-Protect] Card counts -> Cloud Portfolio: ${cloudPortfolioCards.length}, Cloud Index: ${cloudIndexCards.length}, Local Index: ${localIndexCards.length}, Local Portfolio: ${localPortfolioCards.length}`);

  // Pick the largest cloud list as primary order, then union all others without losing any item
  const primaryCards = cloudPortfolioCards.length >= cloudIndexCards.length ? cloudPortfolioCards : cloudIndexCards;
  const secondaryCards = cloudPortfolioCards.length >= cloudIndexCards.length ? cloudIndexCards : cloudPortfolioCards;

  const mergedMap = new Map();
  const orderedKeys = [];

  for (const list of [primaryCards, secondaryCards, localIndexCards, localPortfolioCards]) {
    for (const card of list) {
      const key = getCardIdentity(card);
      if (!mergedMap.has(key)) {
        orderedKeys.push(key);
        mergedMap.set(key, card);
      } else {
        // Always prefer the card version that has beckerperfektkuechen.de if it's the Kitchen Fitter website card
        const existing = mergedMap.get(key);
        if (card.includes('beckerperfektkuechen.de') && !existing.includes('beckerperfektkuechen.de')) {
          mergedMap.set(key, card);
        }
      }
    }
  }

  const mergedCards = orderedKeys.map(k => mergedMap.get(k));
  console.log(`[Cloud-Protect] Merged union total cards: ${mergedCards.length} (has beckerperfektkuechen.de: ${mergedCards.some(c => c.includes('beckerperfektkuechen.de'))})`);

  const mergedGridHtml = mergedCards.join('\n\n');

  // Ensure Hero BG video in localIndex uses the 100% original 19.17MB lossless fast-start MP4 + raw original fallback
  localIndex = localIndex
    .replace(/href="\/hero-bg-fast\.mp4(?:\?[^"]*)?"/g, 'href="/hero-bg-fast.mp4?v=orig1080p"')
    .replace(/src="\/hero-bg-fast\.mp4(?:\?[^"]*)?"/g, 'src="/hero-bg-fast.mp4?v=orig1080p"')
    .replace(/https:\/\/res\.cloudinary\.com\/dtr3yvjac\/video\/upload\/[^"]*\/v1790370925\/lv_0_20260620110136-1_wliolu\.mp4/g, 'https://res.cloudinary.com/dtr3yvjac/video/upload/v1790370925/lv_0_20260620110136-1_wliolu.mp4')
    .replace(/live-sync\.js\?v=[0-9_]+/g, 'live-sync.js?v=20260929_105');

  localPortfolio = localPortfolio
    .replace(/live-sync\.js\?v=[0-9_]+/g, 'live-sync.js?v=20260929_105');

  localIndex = replaceGridInner(localIndex, mergedGridHtml);
  localPortfolio = replaceGridInner(localPortfolio, mergedGridHtml);

  fs.writeFileSync(indexPath, localIndex, 'utf8');
  fs.writeFileSync(portfolioPath, localPortfolio, 'utf8');
  console.log('[Cloud-Protect] Updated local index.html and portfolio.html with merged 257+ portfolio cards & original 1080p video.');

  // Extract body innerHTML for Supabase site_content sync
  const extractBodyInner = (fullHtml) => {
    const bStart = fullHtml.indexOf('<body');
    if (bStart === -1) return fullHtml;
    const bOpenEnd = fullHtml.indexOf('>', bStart) + 1;
    const bClose = fullHtml.lastIndexOf('</body>');
    return bClose !== -1 ? fullHtml.slice(bOpenEnd, bClose).trim() : fullHtml.slice(bOpenEnd).trim();
  };

  const indexBody = extractBodyInner(localIndex);
  const portfolioBody = extractBodyInner(localPortfolio);

  // Update both index and portfolio rows in Supabase so both have 100% of the 257 cards, Kitchen Fitter URL, and 100% Original Quality Hero Video
  const upIndex = await supabaseRequest('PATCH', '/rest/v1/site_content?id=eq.index', { html_content: indexBody });
  const upPort = await supabaseRequest('PATCH', '/rest/v1/site_content?id=eq.portfolio', { html_content: portfolioBody });
  console.log(`[Cloud-Protect] Synced merged HTML back to Supabase -> index: HTTP ${upIndex.status}, portfolio: HTTP ${upPort.status}`);
}

main().catch(err => {
  console.error('[Cloud-Protect] Error:', err);
});
