// live-sync.js
// Instantaneous + Real-time Supabase Content Synchronizer (Zero Flash + Non-Destructive Cloud Merge)

(function() {
    const pageId = window.location.pathname.includes("portfolio.html") ? 'portfolio' : 'index';
    const CACHE_KEY = 'loufy_live_snapshot_v6_' + pageId;
    try { localStorage.removeItem('loufy_live_snapshot_v5_' + pageId); } catch(e) {}
    try { localStorage.removeItem('loufy_live_snapshot_v4_' + pageId); } catch(e) {}
    try { localStorage.removeItem('loufy_live_snapshot_v3_' + pageId); } catch(e) {}
    try { localStorage.removeItem('loufy_live_snapshot_v2_' + pageId); } catch(e) {}

    // Clear legacy conflicting cache keys
    try {
        localStorage.removeItem('loufy_draft_index');
        localStorage.removeItem('loufy_draft_portfolio');
    } catch (e) {}

    // Build a complete signature of a portfolio card including URL, images, PDF, title, and category
    function getFullCardSig(c) {
        const img = c.querySelector('img');
        const h3 = c.querySelector('h3');
        const link = c.querySelector('a[href]');
        const urlBar = c.querySelector('.browser-url-bar');
        return [
            c.getAttribute('data-cat') || '',
            c.getAttribute('data-subcat') || '',
            c.getAttribute('data-website-url') || '',
            urlBar ? urlBar.textContent.trim() : '',
            img ? (img.getAttribute('src') || '') : '',
            h3 ? h3.textContent.trim() : '',
            link ? (link.getAttribute('href') || '') : '',
            c.getAttribute('data-images') || '',
            c.getAttribute('data-pdf') || ''
        ].join('::');
    }

    // Build an identity key for matching the same logical card across grids (to update its URL/details or union new cards)
    function getCardIdentityKey(c) {
        const cat = c.getAttribute('data-cat') || '';
        const img = c.querySelector('img');
        const h3 = c.querySelector('h3');
        const imgSrc = img ? (img.getAttribute('src') || '').split('?')[0] : '';
        const title = h3 ? h3.textContent.trim().toLowerCase() : '';
        // For websites, match by image + category so URL changes update the existing card rather than duplicating
        if (cat === 'websites' && imgSrc) {
            return `websites::${imgSrc}`;
        }
        return `${cat}::${imgSrc}::${title}`;
    }

    // Merge multiple portfolio-grid elements so no cloud-saved Formatting/Covers/Websites are ever lost
    function mergePortfolioGrids(baseGrid, primaryCloudGrid, secondaryCloudGrid) {
        if (!primaryCloudGrid && !secondaryCloudGrid) return null;
        // Pick the cloud grid with the most items as the primary order source
        const pCards = primaryCloudGrid ? Array.from(primaryCloudGrid.querySelectorAll('.portfolio-card')) : [];
        const sCards = secondaryCloudGrid ? Array.from(secondaryCloudGrid.querySelectorAll('.portfolio-card')) : [];
        const bCards = baseGrid ? Array.from(baseGrid.querySelectorAll('.portfolio-card')) : [];

        const mainList = (sCards.length > pCards.length) ? sCards : pCards;
        const otherCloudList = (sCards.length > pCards.length) ? pCards : sCards;

        const mergedMap = new Map();
        const orderedKeys = [];

        // 1. Seed from main cloud list (contains user's latest saved order & items)
        mainList.forEach(card => {
            const key = getCardIdentityKey(card);
            if (!mergedMap.has(key)) {
                orderedKeys.push(key);
            }
            mergedMap.set(key, card.cloneNode(true));
        });

        // 2. Merge any cards from the other cloud row that weren't in mainList
        otherCloudList.forEach(card => {
            const key = getCardIdentityKey(card);
            if (!mergedMap.has(key)) {
                orderedKeys.push(key);
                mergedMap.set(key, card.cloneNode(true));
            } else {
                const existing = mergedMap.get(key);
                const cardUrl = card.getAttribute('data-website-url') || '';
                const existUrl = existing.getAttribute('data-website-url') || '';
                if (cardUrl && cardUrl.includes('beckerperfektkuechen.de') && !existUrl.includes('beckerperfektkuechen.de')) {
                    mergedMap.set(key, card.cloneNode(true));
                }
            }
        });

        // 3. Ensure any newly added static HTML cards (from git push) that aren't in cloud yet are also retained
        bCards.forEach(card => {
            const key = getCardIdentityKey(card);
            if (!mergedMap.has(key)) {
                orderedKeys.push(key);
                mergedMap.set(key, card.cloneNode(true));
            }
        });

        const wrapper = document.createElement('div');
        orderedKeys.forEach(key => {
            const card = mergedMap.get(key);
            if (card) wrapper.appendChild(card);
        });
        return wrapper;
    }

    function syncDocumentFromParsedHTML(doc, secondaryDoc, isFromInstantCache) {
        if (document.body && document.body.classList.contains('edit-mode')) return false;
        let modified = false;

        // 1. Sync custom theme styles & permanent yellow pricing styles
        ['custom-theme-styles', 'permanent-yellow-pricing-css'].forEach(styleId => {
            const liveStyle = doc.getElementById(styleId);
            const curStyle = document.getElementById(styleId);
            if (liveStyle) {
                if (curStyle) {
                    if (curStyle.innerHTML.trim() !== liveStyle.innerHTML.trim()) {
                        curStyle.innerHTML = liveStyle.innerHTML;
                        modified = true;
                    }
                } else {
                    const st = document.createElement('style');
                    st.id = styleId;
                    st.innerHTML = liveStyle.innerHTML;
                    document.head.appendChild(st);
                    modified = true;
                }
            }
        });

        // 1b. Sync Hero Background Video URL only if explicitly changed to a brand-new custom video
        const liveVid = doc.getElementById('hero-bg-video');
        const curVid = document.getElementById('hero-bg-video');
        if (liveVid && curVid) {
            const liveSrc = liveVid.getAttribute('src') || liveVid.querySelector('source')?.getAttribute('src');
            const curSrc = curVid.getAttribute('src') || '';
            const isDefaultFastVid = (
                curSrc.indexOf('/hero-bg-fast.mp4') !== -1 &&
                liveSrc &&
                (liveSrc.includes('lv_0_20260620110136-1_wliolu') || liveSrc.includes('/hero-bg-fast.mp4'))
            );
            if (liveSrc && liveSrc !== curSrc && !isDefaultFastVid) {
                curVid.setAttribute('src', liveSrc);
                const sTag = curVid.querySelector('source');
                if (sTag) sTag.setAttribute('src', liveSrc);
                curVid.muted = true;
                curVid.play().catch(() => {});
                modified = true;
            }
        }

        // 2. Sync Hero Floating Cards (both Desktop & Mobile logos + Top Floating Banner)
        ['hero-floating-cards', 'hero-floating-cards-mobile'].forEach(floatId => {
            const liveFloat = doc.getElementById(floatId);
            const curFloat = document.getElementById(floatId);
            if (liveFloat && curFloat) {
                const sanitizedHtml = liveFloat.innerHTML
                    .replace(/--hero-float-card-scale:\s*2\b/g, '--hero-float-card-scale: 1')
                    .replace(/animation-delay:\s*([1-9][0-9.]*s)/g, 'animation-delay: -$1');
                if (curFloat.innerHTML.trim() !== sanitizedHtml.trim()) {
                    curFloat.innerHTML = sanitizedHtml;
                    modified = true;
                }
            }
        });

        // Ensure mobile floating card logos match desktop floating card logos
        const deskFloat = document.getElementById('hero-floating-cards');
        const mobFloat = document.getElementById('hero-floating-cards-mobile');
        if (deskFloat && mobFloat) {
            deskFloat.querySelectorAll('.hero-float-card[data-card-id]').forEach(dCard => {
                const cid = dCard.getAttribute('data-card-id');
                const dImg = dCard.querySelector('img');
                const mImg = mobFloat.querySelector(`.hero-float-card[data-card-id="${cid}"] img`);
                if (dImg && mImg && dImg.getAttribute('src') && mImg.getAttribute('src') !== dImg.getAttribute('src')) {
                    mImg.setAttribute('src', dImg.getAttribute('src'));
                }
            });
            const dBadge = deskFloat.querySelector('.badge-like');
            const mBadge = mobFloat.querySelector('.badge-like');
            if (dBadge && mBadge && dBadge.innerHTML !== mBadge.innerHTML) {
                mBadge.innerHTML = dBadge.innerHTML;
            }
        }

        // 3. Sync Major Content Containers directly so headline, About bio, Services, Pricing, FAQ, Contact, and Footer ALWAYS update 100%
        const sectionContainers = [
            '.hero-content',
            '.hero-visual',
            '.marquee .marquee-track',
            '#services .container',
            '#about .container',
            '#tools .container',
            'section.timeline .container',
            '#testimonials .testimonial-track',
            '#faq .container',
            '#contact .container',
            'footer.footer .container'
        ];

        sectionContainers.forEach(sel => {
            const liveEl = doc.querySelector(sel);
            const curEl = document.querySelector(sel);
            if (liveEl && curEl) {
                const cleanLive = liveEl.innerHTML.replace(/\s+/g, ' ').trim();
                const cleanCur = curEl.innerHTML.replace(/\s+/g, ' ').trim();
                if (cleanLive && cleanLive !== cleanCur) {
                    curEl.innerHTML = liveEl.innerHTML;
                    curEl.querySelectorAll('.reveal').forEach(r => r.classList.add('active'));
                    modified = true;
                }
            }
        });

        // 4. Non-Destructive Union Merge for Portfolio Grid & Filters across index + portfolio cloud rows + static DOM
        const liveGrid = doc.querySelector('.portfolio-grid');
        const secGrid = secondaryDoc ? secondaryDoc.querySelector('.portfolio-grid') : null;
        const currentGrid = document.querySelector('.portfolio-grid');
        if ((liveGrid || secGrid) && currentGrid) {
            const mergedGridWrapper = mergePortfolioGrids(currentGrid, liveGrid, secGrid);
            if (mergedGridWrapper) {
                const curSigs = Array.from(currentGrid.querySelectorAll('.portfolio-card')).map(getFullCardSig).join('|');
                const mergedSigs = Array.from(mergedGridWrapper.querySelectorAll('.portfolio-card')).map(getFullCardSig).join('|');
                if (curSigs !== mergedSigs) {
                    const activeFilterBtn = document.querySelector('.filter-btn.active');
                    const activeCat = activeFilterBtn ? activeFilterBtn.dataset.cat : null;
                    currentGrid.innerHTML = mergedGridWrapper.innerHTML;
                    currentGrid.querySelectorAll('.reveal').forEach(r => r.classList.add('active'));
                    if (activeCat && activeCat !== 'all') {
                        currentGrid.querySelectorAll('.portfolio-card').forEach(card => {
                            if (card.dataset.cat !== activeCat) card.style.display = 'none';
                        });
                    }
                    modified = true;
                }
            }
        }

        // 5. Sync Section Visibility
        doc.querySelectorAll('section[id]').forEach(liveSec => {
            const curSec = document.getElementById(liveSec.id);
            if (!curSec) return;
            const isHidden = liveSec.classList.contains('hidden-section');
            if (isHidden !== curSec.classList.contains('hidden-section')) {
                curSec.classList.toggle('hidden-section', isHidden);
                const navLink = document.querySelector(`.nav-links a[href="#${liveSec.id}"]`);
                if (navLink && navLink.parentElement) {
                    navLink.parentElement.style.display = isHidden ? 'none' : '';
                }
                modified = true;
            }
        });

        return modified;
    }

    // STEP A: Apply Instant Local Snapshot on DOMContentLoaded (0ms network wait = zero 2-3s flash)
    document.addEventListener('DOMContentLoaded', () => {
        try {
            const cachedHtml = localStorage.getItem(CACHE_KEY);
            if (cachedHtml) {
                const parser = new DOMParser();
                const cachedDoc = parser.parseFromString(cachedHtml, 'text/html');
                syncDocumentFromParsedHTML(cachedDoc, null, true);
            }
        } catch (e) {}

        // STEP B: Fetch latest from Supabase Cloud (both 'index' and 'portfolio' rows) in background and merge non-destructively
        const runCloudSync = async () => {
            let elapsed = 0;
            while (!window.supabaseClient && elapsed < 4000) {
                await new Promise(r => setTimeout(r, 40));
                elapsed += 40;
            }
            if (!window.supabaseClient) return;
            if (document.body && document.body.classList.contains('edit-mode')) return;

            try {
                const { data: rows, error } = await window.supabaseClient
                    .from('site_content')
                    .select('id, html_content')
                    .in('id', ['index', 'portfolio']);
                if (error || !rows || rows.length === 0) return;

                const primaryRow = rows.find(r => r.id === pageId) || rows[0];
                const secondaryRow = rows.find(r => r.id !== pageId) || null;

                if (!primaryRow || !primaryRow.html_content) return;

                const parser = new DOMParser();
                const liveDoc = parser.parseFromString(primaryRow.html_content, 'text/html');
                const secDoc = (secondaryRow && secondaryRow.html_content)
                    ? parser.parseFromString(secondaryRow.html_content, 'text/html')
                    : null;

                const changed = syncDocumentFromParsedHTML(liveDoc, secDoc, false);

                // Cache the merged state so next load is 0ms with all merged items
                try {
                    const mergedGrid = document.querySelector('.portfolio-grid');
                    if (mergedGrid && liveDoc.querySelector('.portfolio-grid')) {
                        liveDoc.querySelector('.portfolio-grid').innerHTML = mergedGrid.innerHTML;
                    }
                    localStorage.setItem(CACHE_KEY, liveDoc.body.innerHTML);
                } catch (qe) {}

                if (changed && window.initSiteLogic) {
                    window.initSiteLogic();
                    if (window.initFlipbooks) window.initFlipbooks();
                    if (window.initCoversMarquee) window.initCoversMarquee();
                }
            } catch (err) {
                console.warn('Live sync error:', err);
            }
        };

        runCloudSync();
    });
})();
