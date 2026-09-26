// live-sync.js
// Instantaneous + Real-time Supabase Content Synchronizer (Zero Flash + Full Section Sync)

(function() {
    const pageId = window.location.pathname.includes("portfolio.html") ? 'portfolio' : 'index';
    const CACHE_KEY = 'loufy_live_snapshot_v3_' + pageId;
    try { localStorage.removeItem('loufy_live_snapshot_v2_' + pageId); } catch(e) {}

    // Clear legacy conflicting cache keys
    try {
        localStorage.removeItem('loufy_draft_index');
        localStorage.removeItem('loufy_draft_portfolio');
    } catch (e) {}

    function syncDocumentFromParsedHTML(doc, isFromInstantCache) {
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

                // 1b. Sync Hero Background Video URL if updated via Admin Panel
        const liveVid = doc.getElementById('hero-bg-video');
        const curVid = document.getElementById('hero-bg-video');
        if (liveVid && curVid) {
            const liveSrc = liveVid.getAttribute('src') || liveVid.querySelector('source')?.getAttribute('src');
            const curSrc = curVid.getAttribute('src');
            if (liveSrc && liveSrc !== curSrc) {
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
            if (liveFloat && curFloat && curFloat.innerHTML.trim() !== liveFloat.innerHTML.trim()) {
                curFloat.innerHTML = liveFloat.innerHTML;
                modified = true;
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

        // 3. Sync Major Content Containers directly so headline, About bio (even multi-paragraph), Services, Pricing, FAQ, Contact, and Footer ALWAYS update 100%
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

        // 4. Sync Portfolio Grid & Filters
        const liveGrid = doc.querySelector('.portfolio-grid');
        const currentGrid = document.querySelector('.portfolio-grid');
        if (liveGrid && currentGrid) {
            const getCardSig = (c) => {
                const img = c.querySelector('img');
                const h3 = c.querySelector('h3');
                return (c.getAttribute('data-cat') || '') + '::' + (img ? img.getAttribute('src') : '') + '::' + (h3 ? h3.textContent.trim() : '');
            };
            const curSigs = Array.from(currentGrid.querySelectorAll('.portfolio-card')).map(getCardSig).join('|');
            const liveSigs = Array.from(liveGrid.querySelectorAll('.portfolio-card')).map(getCardSig).join('|');
            if (curSigs !== liveSigs) {
                const activeFilterBtn = document.querySelector('.filter-btn.active');
                const activeCat = activeFilterBtn ? activeFilterBtn.dataset.cat : null;
                currentGrid.innerHTML = liveGrid.innerHTML;
                currentGrid.querySelectorAll('.reveal').forEach(r => r.classList.add('active'));
                if (activeCat && activeCat !== 'all') {
                    currentGrid.querySelectorAll('.portfolio-card').forEach(card => {
                        if (card.dataset.cat !== activeCat) card.style.display = 'none';
                    });
                }
                modified = true;
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
                syncDocumentFromParsedHTML(cachedDoc, true);
            }
        } catch (e) {}

        // STEP B: Fetch latest from Supabase Cloud in background and update both DOM & Local Snapshot
        const runCloudSync = async () => {
            let elapsed = 0;
            while (!window.supabaseClient && elapsed < 4000) {
                await new Promise(r => setTimeout(r, 40));
                elapsed += 40;
            }
            if (!window.supabaseClient) return;
            if (document.body && document.body.classList.contains('edit-mode')) return;

            try {
                const { data, error } = await window.supabaseClient
                    .from('site_content')
                    .select('html_content')
                    .eq('id', pageId)
                    .single();
                if (error || !data || !data.html_content) return;

                try {
                    localStorage.setItem(CACHE_KEY, data.html_content);
                } catch (qe) {}

                const parser = new DOMParser();
                const liveDoc = parser.parseFromString(data.html_content, 'text/html');
                const changed = syncDocumentFromParsedHTML(liveDoc, false);
                if (changed && window.initSiteLogic) {
                    window.initSiteLogic();
                    if (window.initFlipbooks) window.initFlipbooks();
                }
            } catch (err) {
                console.warn('Live sync error:', err);
            }
        };

        runCloudSync();
    });
})();
