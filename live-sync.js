// live-sync.js
// Client-side dynamic loader to fetch the latest portfolio grid and theme from Supabase on page load.
// This bypasses Vercel/GitHub build latency for real-time visibility, keeping static files as SEO fallback.

document.addEventListener('DOMContentLoaded', () => {
    const pageId = window.location.pathname.includes("portfolio.html") ? 'portfolio' : 'index';
    
    // We run in a delayed block to let script.js load and compile first
    setTimeout(async () => {
        const getSupabase = () => {
            return new Promise((resolve) => {
                if (window.supabaseClient) return resolve(window.supabaseClient);
                let elapsed = 0;
                const interval = setInterval(() => {
                    elapsed += 50;
                    if (window.supabaseClient) {
                        clearInterval(interval);
                        resolve(window.supabaseClient);
                    } else if (elapsed >= 5000) {
                        clearInterval(interval);
                        resolve(null);
                    }
                }, 50);
            });
        };

        const client = await getSupabase();
        if (!client) return;

        try {
            // Check if admin is currently in edit mode (don't overwrite their live edits in the DOM!)
            if (document.body.classList.contains('edit-mode')) {
                return;
            }

            const { data, error } = await client
                .from('site_content')
                .select('html_content')
                .eq('id', pageId)
                .single();

            if (error || !data || !data.html_content) return;

            const parser = new DOMParser();
            const doc = parser.parseFromString(data.html_content, 'text/html');
            
            const liveGrid = doc.querySelector('.portfolio-grid');
            const liveFilters = doc.querySelector('.portfolio-filters');
            const liveThemeStyle = doc.querySelector('#custom-theme-styles');

            const currentGrid = document.querySelector('.portfolio-grid');
            const currentFilters = document.querySelector('.portfolio-filters');
            const currentThemeStyle = document.querySelector('#custom-theme-styles');

            let modified = false;

            // 1. Sync custom theme styles
            if (liveThemeStyle) {
                if (currentThemeStyle) {
                    if (currentThemeStyle.innerHTML.trim() !== liveThemeStyle.innerHTML.trim()) {
                        currentThemeStyle.innerHTML = liveThemeStyle.innerHTML;
                        modified = true;
                    }
                } else {
                    const newStyle = document.createElement('style');
                    newStyle.id = 'custom-theme-styles';
                    newStyle.innerHTML = liveThemeStyle.innerHTML;
                    document.head.appendChild(newStyle);
                    modified = true;
                }
            } else if (currentThemeStyle) {
                currentThemeStyle.remove();
                modified = true;
            }

            // 2. Sync portfolio grid intelligently (Semantic signature comparison)
            if (liveGrid && currentGrid) {
                const getCardSignature = (card) => {
                    const img = card.querySelector('img');
                    const title = card.querySelector('h3');
                    const desc = card.querySelector('.portfolio-desc');
                    const visitBtn = card.querySelector('.btn-visit-website');
                    const cat = card.getAttribute('data-cat') || '';
                    const subcat = card.getAttribute('data-subcat') || '';
                    const imgSrc = img ? (img.getAttribute('src') || '') : '';
                    const titleText = title ? title.textContent.trim() : '';
                    const descText = desc ? desc.textContent.trim() : '';
                    const visitHref = visitBtn ? (visitBtn.getAttribute('href') || '') : '';
                    return `${cat}:::${subcat}:::${imgSrc}:::${titleText}:::${descText}:::${visitHref}`;
                };

                const currentCards = Array.from(currentGrid.querySelectorAll('.portfolio-card'));
                const liveCards = Array.from(liveGrid.querySelectorAll('.portfolio-card'));

                const currentSigs = currentCards.map(getCardSignature).join('|||');
                const liveSigs = liveCards.map(getCardSignature).join('|||');

                // Only update DOM if the actual cards changed in database
                if (currentSigs !== liveSigs) {
                    const activeFilterBtn = document.querySelector('.filter-btn.active');
                    const activeCat = activeFilterBtn ? activeFilterBtn.dataset.cat : null;

                    currentGrid.innerHTML = liveGrid.innerHTML;
                    modified = true;

                    // Immediately re-apply active filter to prevent unstyled flash of cards
                    if (activeCat && activeCat !== 'all') {
                        currentGrid.querySelectorAll('.portfolio-card').forEach(card => {
                            if (card.dataset.cat !== activeCat) {
                                card.style.display = 'none';
                            }
                        });
                    }
                }
            }

            // 3. Sync portfolio filters intelligently
            if (liveFilters && currentFilters) {
                const getFilterSignature = (filtersEl) => {
                    const btns = Array.from(filtersEl.querySelectorAll('.filter-btn, .sub-filter-btn'));
                    return btns.map(b => `${b.dataset.cat || ''}:::${b.dataset.subcat || ''}:::${b.textContent.trim()}`).join('|||');
                };

                if (getFilterSignature(currentFilters) !== getFilterSignature(liveFilters)) {
                    const activeFilterBtn = currentFilters.querySelector('.filter-btn.active');
                    const activeCat = activeFilterBtn ? activeFilterBtn.dataset.cat : null;

                    currentFilters.innerHTML = liveFilters.innerHTML;
                    modified = true;

                    if (activeCat) {
                        currentFilters.querySelectorAll('.filter-btn').forEach(b => {
                            if (b.dataset.cat === activeCat) b.classList.add('active');
                            else b.classList.remove('active');
                        });
                    }
                }
            }

            // 4. Sync section visibility classes and navigation links display state
            const liveSections = doc.querySelectorAll('section');
            liveSections.forEach(liveSec => {
                const id = liveSec.id;
                if (!id) return;
                const currentSec = document.getElementById(id);
                if (currentSec) {
                    const isHiddenLive = liveSec.classList.contains('hidden-section');
                    const isHiddenCurrent = currentSec.classList.contains('hidden-section');
                    
                    if (isHiddenLive !== isHiddenCurrent) {
                        if (isHiddenLive) {
                            currentSec.classList.add('hidden-section');
                        } else {
                            currentSec.classList.remove('hidden-section');
                        }
                        modified = true;
                    }
                    
                    if (currentSec.className !== liveSec.className) {
                        currentSec.className = liveSec.className;
                        modified = true;
                    }

                    // Sync corresponding navigation link visibility
                    const navLink = document.querySelector(`.nav-links a[href="#${id}"]`);
                    if (navLink && navLink.parentElement) {
                        const currentDisplay = navLink.parentElement.style.display;
                        const targetDisplay = isHiddenLive ? 'none' : '';
                        if (currentDisplay !== targetDisplay) {
                            navLink.parentElement.style.display = targetDisplay;
                            modified = true;
                        }
                    }
                }
            });

            // 5. Sync all editable text elements
            const currentTextEls = document.querySelectorAll('[data-admin-text="true"]');
            const liveTextEls = doc.querySelectorAll('[data-admin-text="true"]');
            if (currentTextEls.length > 0 && currentTextEls.length === liveTextEls.length) {
                for (let i = 0; i < currentTextEls.length; i++) {
                    const currentEl = currentTextEls[i];
                    const liveEl = liveTextEls[i];
                    
                    if (currentEl.innerHTML !== liveEl.innerHTML) {
                        currentEl.innerHTML = liveEl.innerHTML;
                        modified = true;
                    }
                    if (liveEl.hasAttribute('href') && currentEl.getAttribute('href') !== liveEl.getAttribute('href')) {
                        currentEl.setAttribute('href', liveEl.getAttribute('href'));
                        modified = true;
                    }
                }
            }

            // 6. Sync hero image and other standalone images if changed
            const currentImgs = document.querySelectorAll('img[id], img.hero-bg-image');
            const liveImgs = doc.querySelectorAll('img[id], img.hero-bg-image');
            currentImgs.forEach(currentImg => {
                const idOrClass = currentImg.id ? `#${currentImg.id}` : `.${currentImg.className.split(' ').join('.')}`;
                const liveImg = doc.querySelector(idOrClass);
                if (liveImg && currentImg.src !== liveImg.src) {
                    currentImg.src = liveImg.src;
                    if (liveImg.hasAttribute('data-optimized')) {
                        currentImg.setAttribute('data-optimized', liveImg.getAttribute('data-optimized'));
                    }
                    modified = true;
                }
            });

            // 7. Sync Footer and Contact globally without active link conflicts
            const globalSelectors = ['.footer', '#contact'];
            globalSelectors.forEach(selector => {
                const currentEl = document.querySelector(selector);
                const liveEl = doc.querySelector(selector);
                if (currentEl && liveEl && currentEl.innerHTML.trim() !== liveEl.innerHTML.trim()) {
                    currentEl.innerHTML = liveEl.innerHTML;
                    modified = true;
                }
            });

            // Re-initialize site logic ONLY if changes were actually applied
            if (modified && window.initSiteLogic) {
                window.initSiteLogic();
                if (window.initFlipbooks) window.initFlipbooks();
            }

        } catch (e) {
            console.warn("Live sync background update failed:", e);
        }
    }, 100);
});
