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
                    if (currentThemeStyle.innerHTML !== liveThemeStyle.innerHTML) {
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

            // 2. Sync portfolio grid
            if (liveGrid && currentGrid) {
                const norm = s => s.replace(/\s+/g, ' ').trim();
                if (norm(currentGrid.innerHTML) !== norm(liveGrid.innerHTML)) {
                    currentGrid.innerHTML = liveGrid.innerHTML;
                    modified = true;
                }
            }

            // 3. Sync portfolio filters
            if (liveFilters && currentFilters) {
                const norm = s => s.replace(/\s+/g, ' ').trim();
                if (norm(currentFilters.innerHTML) !== norm(liveFilters.innerHTML)) {
                    currentFilters.innerHTML = liveFilters.innerHTML;
                    modified = true;
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

            // Re-initialize site logic if we modified anything
            if (modified && window.initSiteLogic) {
                window.initSiteLogic();
                // If Swiper or other components need re-initialization
                if (window.initFlipbooks) window.initFlipbooks();
            }

        } catch (e) {
            console.warn("Live sync background update failed:", e);
        }
    }, 100);
});
