document.addEventListener("DOMContentLoaded", () => {
    
    const isPortfolioPage = window.location.pathname.split('/').pop().includes("portfolio.html") || window.location.pathname.endsWith("/portfolio");
    const isBlogPage = window.location.pathname.includes("blog.html") || window.location.pathname.includes("/blog/");
    const isBlogsPage = window.location.pathname.includes("blogs.html") || window.location.pathname.includes("/blogs");
    const isBlogSystem = isBlogPage || isBlogsPage;
    const storageKey = isPortfolioPage ? "savedPortfolioPageContent" : "savedIndexPageContent";

    // Set page indicator body class
    if (isPortfolioPage) {
        document.body.classList.add("portfolio-page");
    } else {
        document.body.classList.add("home-page");
    }

    // Theme Customizer Presets and Helpers
    const THEME_PRESETS = {
        'default': {
            primary: '#184C3A',
            accent: '#F4B400',
            dark: '#111111',
            light: '#f5f5f5',
            cardBg: '#ffffff'
        },
        'midnight-amber': {
            primary: '#0f172a',
            accent: '#f59e0b',
            dark: '#f8fafc',
            light: '#020617',
            cardBg: '#1e293b'
        },
        'burgundy-rose': {
            primary: '#581c2f',
            accent: '#e11d48',
            dark: '#1e1b1c',
            light: '#faf5f6',
            cardBg: '#ffffff'
        },
        'sleek-slate': {
            primary: '#14b8a6',
            accent: '#f43f5e',
            dark: '#f8fafc',
            light: '#0f172a',
            cardBg: '#1e293b'
        },
        'indigo-cyan': {
            primary: '#4f46e5',
            accent: '#06b6d4',
            dark: '#0f172a',
            light: '#f8fafc',
            cardBg: '#ffffff'
        }
    };

    function hexToRgb(hex) {
        hex = hex.replace(/^#/, '');
        if (hex.length === 3) {
            hex = hex.split('').map(c => c + c).join('');
        }
        const num = parseInt(hex, 16);
        return {
            r: (num >> 16) & 255,
            g: (num >> 8) & 255,
            b: num & 255
        };
    }

    function rgbToString(rgb) {
        return `${rgb.r},${rgb.g},${rgb.b}`;
    }

    function adjustBrightness(hex, percent) {
        const rgb = hexToRgb(hex);
        const r = Math.min(255, Math.max(0, rgb.r + Math.round(percent * 255)));
        const g = Math.min(255, Math.max(0, rgb.g + Math.round(percent * 255)));
        const b = Math.min(255, Math.max(0, rgb.b + Math.round(percent * 255)));
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    function generateThemeCSS(colors) {
        const primaryRgb = hexToRgb(colors.primary);
        const accentRgb = hexToRgb(colors.accent);
        const darkRgb = hexToRgb(colors.dark);
        const lightRgb = hexToRgb(colors.light);
        const cardBgRgb = hexToRgb(colors.cardBg);

        const primaryDark = adjustBrightness(colors.primary, -0.2);
        const primaryDarkRgb = hexToRgb(primaryDark);
        
        const primaryLight = adjustBrightness(colors.primary, 0.15);
        const primaryLightRgb = hexToRgb(primaryLight);

        const accentDark = adjustBrightness(colors.accent, -0.2);
        const accentDarkRgb = hexToRgb(accentDark);

        const accentLight = adjustBrightness(colors.accent, 0.15);
        const accentLightRgb = hexToRgb(accentLight);

        return `:root {
    --primary: ${colors.primary};
    --primary-rgb: ${rgbToString(primaryRgb)};
    --primary-dark: ${primaryDark};
    --primary-dark-rgb: ${rgbToString(primaryDarkRgb)};
    --primary-light: ${primaryLight};
    --primary-light-rgb: ${rgbToString(primaryLightRgb)};
    
    --accent: ${colors.accent};
    --accent-rgb: ${rgbToString(accentRgb)};
    --accent-dark: ${accentDark};
    --accent-dark-rgb: ${rgbToString(accentDarkRgb)};
    --accent-light: ${colors.accent};
    --accent-light-rgb: ${rgbToString(accentRgb)};

    --dark: ${colors.dark};
    --light: ${colors.light};
    --card-bg: ${colors.cardBg};
}`;
    }

    function applyCustomThemeColors(colors) {
        let styleEl = document.getElementById('custom-theme-styles');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'custom-theme-styles';
            document.body.insertBefore(styleEl, document.body.firstChild);
        }
        styleEl.innerHTML = generateThemeCSS(colors);
    }

    async function generateSignature(params, apiSecret) {
        const sortedKeys = Object.keys(params).sort();
        const paramString = sortedKeys.map(key => `${key}=${params[key]}`).join('&');
        const signatureString = paramString + apiSecret;
        const encoder = new TextEncoder();
        const data = encoder.encode(signatureString);
        const hashBuffer = await crypto.subtle.digest('SHA-1', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async function uploadToCloudinary(fileData) {
        const cloudName = "dtr3yvjac";
        const apiKey = "453843776219872";
        const apiSecret = "WDP5Pmku01sVxQJ2pD_npSNL5wA";
        const folder = "portfolio";
        
        const timestamp = Math.round(Date.now() / 1000);
        const params = {
            folder: folder,
            timestamp: timestamp
        };
        
        const signature = await generateSignature(params, apiSecret);
        
        const formData = new FormData();
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp);
        formData.append("folder", folder);
        formData.append("signature", signature);
        formData.append("file", fileData);
        
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: "POST",
            body: formData
        });
        
        if (!response.ok) {
            const errText = await response.text();
            throw new Error("Cloudinary upload failed: " + errText);
        }
        
        const result = await response.json();
        return result.secure_url;
    }



    function updateImageSource(imgElement, newUrl) {
        imgElement.src = newUrl;
        imgElement.setAttribute('data-optimized', 'true');
        
        // Handle responsive srcset if it's a Cloudinary URL
        if (newUrl.includes('/image/upload/')) {
            const baseUrl = newUrl.replace('/image/upload/f_auto,q_auto/', '/image/upload/');
            const newSrcset = [480, 800, 1200].map(w => `${baseUrl.replace('/image/upload/', `/image/upload/f_auto,q_auto,w_${w}/`)} ${w}w`).join(', ');
            imgElement.setAttribute('srcset', newSrcset);
        } else if (imgElement.hasAttribute('srcset')) {
            imgElement.removeAttribute('srcset');
        }
        
        // Handle hero background image specific LCP preload link
        if (imgElement.id === 'hero-bg-image') {
            const preloadLink = document.getElementById('hero-preload');
            if (preloadLink) {
                preloadLink.setAttribute('href', newUrl);
                if (newUrl.includes('/image/upload/')) {
                    const baseUrl = newUrl.replace('/image/upload/f_auto,q_auto/', '/image/upload/');
                    const newImagesrcset = [480, 800, 1200].map(w => `${baseUrl.replace('/image/upload/', `/image/upload/f_auto,q_auto,w_${w}/`)} ${w}w`).join(', ');
                    preloadLink.setAttribute('imagesrcset', newImagesrcset);
                } else if (preloadLink.hasAttribute('imagesrcset')) {
                    preloadLink.removeAttribute('imagesrcset');
                }
            }
        }
    }

    // Predefined socials list
    const predefinedSocials = [
        { id: 'twitter', name: 'Twitter (X)', icon: '<i class="fa-brands fa-x-twitter"></i>' },
        { id: 'facebook', name: 'Facebook', icon: '<i class="fa-brands fa-facebook-f"></i>' },
        { id: 'instagram', name: 'Instagram', icon: '<i class="fa-brands fa-instagram"></i>' },
        { id: 'linkedin', name: 'LinkedIn', icon: '<i class="fa-brands fa-linkedin-in"></i>' },
        { id: 'behance', name: 'Behance', icon: '<i class="fa-brands fa-behance"></i>' },
        { id: 'dribbble', name: 'Dribbble', icon: '<i class="fa-brands fa-dribbble"></i>' },
        { id: 'youtube', name: 'YouTube', icon: '<i class="fa-brands fa-youtube"></i>' },
        { id: 'tiktok', name: 'TikTok', icon: '<i class="fa-brands fa-tiktok"></i>' },
        { id: 'whatsapp', name: 'WhatsApp', icon: '<i class="fa-brands fa-whatsapp"></i>' },
        { id: 'github', name: 'GitHub', icon: '<i class="fa-brands fa-github"></i>' }
    ];

    function repairSocialIcons() {
        document.querySelectorAll('.social-icons a[data-social]').forEach(a => {
            const socialId = a.getAttribute('data-social');
            const found = predefinedSocials.find(s => s.id === socialId);
            if (found) {
                a.innerHTML = found.icon;
            }
        });
    }

    // Repair static icons immediately on script load
    repairSocialIcons();

    // 1. Inject Admin UI & Crop Modal into the DOM
    const adminHTML = `
    <div id="super-admin-panel">
        <h3>Super Admin <button class="close-admin"><i class="fa-solid fa-xmark"></i></button></h3>
        <p style="font-size: 0.85rem; color: #aaa; margin-bottom: 15px;">Advanced Panel. Hover over elements (images, icons, cards) to edit them directly.</p>
        <div class="admin-controls">
            <button id="toggle-edit-mode" class="admin-btn"><i class="fa-solid fa-pen-to-square"></i> Enable Edit Mode</button>
            <button id="add-portfolio-item" class="admin-btn" style="background:#17a2b8;"><i class="fa-solid fa-plus"></i> Add Portfolio Item</button>
            <button id="add-review" class="admin-btn" style="background:#28a745;"><i class="fa-solid fa-plus"></i> Add Review</button>
            <button id="add-package" class="admin-btn" style="background:#b5179e;"><i class="fa-solid fa-plus"></i> Add Pricing Package</button>
            <button id="manage-flipbook" class="admin-btn" style="background:#20c997;"><i class="fa-solid fa-book-open"></i> Manage Flipbook Pages</button>
            <button id="manage-social" class="admin-btn" style="background:#007bff;"><i class="fa-solid fa-share-nodes"></i> Manage Social Icons</button>
            <button id="manage-pricing" class="admin-btn" style="background:#6f42c1;"><i class="fa-solid fa-dollar-sign"></i> Manage Pricing Links</button>
            <button id="manage-sections" class="admin-btn" style="background:#e83e8c;"><i class="fa-solid fa-layer-group"></i> Manage Sections</button>
            <button id="manage-filters" class="admin-btn" style="background:#fd7e14;"><i class="fa-solid fa-tags"></i> Manage Categories</button>
            <button id="manage-blogs-btn" class="admin-btn" style="background:#ff9f43; color:#fff;"><i class="fa-solid fa-blog"></i> Manage Blog Posts</button>
            <button id="manage-theme" class="admin-btn" style="background:#00bcd4; color:#fff;"><i class="fa-solid fa-palette"></i> Customize Theme</button>
            <button id="manage-hero-card" class="admin-btn" style="background:#ff5722; color:#fff;"><i class="fa-solid fa-wand-magic-sparkles"></i> Edit Hero Content</button>
            <button id="change-hero-bg" class="admin-btn" style="background:#7209b7;"><i class="fa-solid fa-image"></i> Change Hero Image</button>
            <button id="bg-anim-admin-toggle" class="admin-btn" style="background:#20c997;"><i class="fa-solid fa-wand-magic-sparkles"></i> Antigravity BG: ON</button>
            <button id="manage-particles" class="admin-btn" style="background:#4c566a; color:#fff;"><i class="fa-solid fa-circle-nodes"></i> Particles Config</button>
            <button id="save-changes" class="admin-btn"><i class="fa-solid fa-cloud-arrow-up"></i> Save to Cloud (Supabase)</button>
            <button id="export-html" class="admin-btn" style="background:#F4B400; color:#111;"><i class="fa-solid fa-file-code"></i> Export Final HTML</button>
            <button id="clear-storage" class="admin-btn danger"><i class="fa-solid fa-rotate-left"></i> Reset Changes</button>
            <button id="exit-admin-mode" class="admin-btn" style="background:#6c757d; color:#fff;"><i class="fa-solid fa-right-from-bracket"></i> Exit Admin Mode</button>
        </div>

        <div id="social-links-panel" style="display:none; margin-top:15px; border-top:1px solid #333; padding-top:15px;">
            <p style="font-size:0.75rem; color:#ccc; margin-bottom:10px;">Select icons to show and add their links.</p>
            <div id="social-list" style="display:flex; flex-direction:column; gap:8px; margin-bottom:12px;"></div>
            <button id="save-social-links" class="admin-btn" style="width:100%; background:#28a745;"><i class="fa-solid fa-check"></i> Apply Social Links</button>
        </div>

        <div id="pricing-links-panel" style="display:none; margin-top:15px; border-top:1px solid #333; padding-top:15px;">
            <div style="margin-bottom:8px;">
                <label style="font-size:0.75rem; color:#ccc;">Basic Package Link</label>
                <input type="text" id="pricing-input-basic" style="width:100%; padding:6px; border-radius:4px; border:1px solid #555; background:#222; color:#fff;" placeholder="#contact or URL...">
            </div>
            <div style="margin-bottom:8px;">
                <label style="font-size:0.75rem; color:#ccc;">Standard Package Link</label>
                <input type="text" id="pricing-input-standard" style="width:100%; padding:6px; border-radius:4px; border:1px solid #555; background:#222; color:#fff;" placeholder="#contact or URL...">
            </div>
            <div style="margin-bottom:12px;">
                <label style="font-size:0.75rem; color:#ccc;">Premium Package Link</label>
                <input type="text" id="pricing-input-premium" style="width:100%; padding:6px; border-radius:4px; border:1px solid #555; background:#222; color:#fff;" placeholder="#contact or URL...">
            </div>
            <button id="save-pricing-links" class="admin-btn" style="width:100%; background:#28a745;"><i class="fa-solid fa-check"></i> Apply Pricing Links</button>
        </div>

        <div id="sections-panel" style="display:none; margin-top:15px; border-top:1px solid #333; padding-top:15px;">
            <p style="font-size:0.75rem; color:#ccc; margin-bottom:10px;">Toggle sections on or off to add/delete them from the page.</p>
            <div id="sections-list" style="display:flex; flex-direction:column; gap:8px;"></div>
        </div>

        <div id="filters-panel" style="display:none; margin-top:15px; border-top:1px solid #333; padding-top:15px;">
            <p style="font-size:0.75rem; color:#aaa; margin-bottom:10px;">Add, duplicate, or remove portfolio category filter buttons.</p>
            <div id="filters-list" style="display:flex; flex-direction:column; gap:6px; margin-bottom:10px;"></div>
            <div style="display:flex; gap:5px;">
                <input type="text" id="new-filter-name" placeholder="Label, e.g. Logos" style="flex:1; padding:6px; border-radius:4px; border:1px solid #555; background:#222; color:#fff; font-size:0.75rem;">
                <input type="text" id="new-filter-id" placeholder="ID e.g. logos" style="width:80px; padding:6px; border-radius:4px; border:1px solid #555; background:#222; color:#fff; font-size:0.75rem;">
                <button id="add-filter-btn" class="admin-btn" style="background:#28a745; margin:0; padding:6px 12px; height:auto;"><i class="fa-solid fa-plus"></i> Add</button>
            </div>
        </div>

        <div id="theme-panel" style="display:none; margin-top:15px; border-top:1px solid #333; padding-top:15px;">
            <p style="font-size:0.75rem; color:#aaa; margin-bottom:10px;">Select a preset or customize colors below.</p>
            
            <div style="margin-bottom:12px; padding:10px; background:#1a1a1a; border-radius:6px; border:1px solid #333;">
                <label style="font-size:0.72rem; color:#00bcd4; font-weight:700; text-transform:uppercase; letter-spacing:.05em; display:block; margin-bottom:6px;"><i class="fa-solid fa-wand-magic-sparkles"></i> Theme Presets</label>
                <select id="theme-preset-select" style="width:100%; padding:7px 10px; border-radius:4px; border:1px solid #444; background:#111; color:#fff; font-size:0.82rem; cursor:pointer;">
                    <option value="default">Forest Green & Gold (Default)</option>
                    <option value="midnight-amber">Midnight Amber (Dark Mode)</option>
                    <option value="burgundy-rose">Burgundy Rose (Elegant)</option>
                    <option value="sleek-slate">Sleek Dark Slate (Modern Dark)</option>
                    <option value="indigo-cyan">Indigo Cyan (Vibrant)</option>
                    <option value="custom" disabled>Custom Colors</option>
                </select>
            </div>

            <div style="margin-bottom:12px; padding:10px; background:#1a1a1a; border-radius:6px; border:1px solid #333; display:flex; flex-direction:column; gap:8px;">
                <label style="font-size:0.72rem; color:#00bcd4; font-weight:700; text-transform:uppercase; letter-spacing:.05em; display:block;"><i class="fa-solid fa-sliders"></i> Custom Colors</label>
                
                <div style="display:flex; align-items:center; justify-content:space-between;">
                    <span style="font-size:0.78rem; color:#ccc;">Primary Color</span>
                    <input type="color" id="theme-picker-primary" value="#184C3A" style="border:none; width:40px; height:24px; cursor:pointer; background:none;">
                </div>
                <div style="display:flex; align-items:center; justify-content:space-between;">
                    <span style="font-size:0.78rem; color:#ccc;">Accent Color</span>
                    <input type="color" id="theme-picker-accent" value="#F4B400" style="border:none; width:40px; height:24px; cursor:pointer; background:none;">
                </div>
                <div style="display:flex; align-items:center; justify-content:space-between;">
                    <span style="font-size:0.78rem; color:#ccc;">Dark Text / Icons</span>
                    <input type="color" id="theme-picker-dark" value="#111111" style="border:none; width:40px; height:24px; cursor:pointer; background:none;">
                </div>
                <div style="display:flex; align-items:center; justify-content:space-between;">
                    <span style="font-size:0.78rem; color:#ccc;">Light Background</span>
                    <input type="color" id="theme-picker-light" value="#f5f5f5" style="border:none; width:40px; height:24px; cursor:pointer; background:none;">
                </div>
                <div style="display:flex; align-items:center; justify-content:space-between;">
                    <span style="font-size:0.78rem; color:#ccc;">Card Container BG</span>
                    <input type="color" id="theme-picker-card-bg" value="#ffffff" style="border:none; width:40px; height:24px; cursor:pointer; background:none;">
                </div>
            </div>

            <button id="reset-theme-btn" class="admin-btn danger" style="width:100%; margin:0;"><i class="fa-solid fa-rotate-left"></i> Revert to Default Preset</button>
        </div>

        <div id="hero-card-panel" style="display:none; margin-top:15px; border-top:1px solid #333; padding-top:15px;">
            <!-- Visibility Toggle -->
            <div style="margin-bottom:12px; padding:10px; background:#1a1a1a; border-radius:6px; border:1px solid #333; display:flex; align-items:center; justify-content:space-between;">
                <label style="font-size:0.75rem; color:#ccc; display:flex; align-items:center; gap:8px; cursor:pointer; font-weight:600;">
                    <input type="checkbox" id="hero-card-visible-toggle" checked style="cursor:pointer; width:16px; height:16px; accent-color:#20c997;">
                    <i class="fa-solid fa-eye" style="color:#20c997;"></i> Show Hero Card on Page
                </label>
            </div>
            <p style="font-size:0.75rem; color:#aaa; margin-bottom:10px;">Customize layout and content of the hero glass card.</p>
            
            <!-- Positioning & Styles -->
            <div style="margin-bottom:12px; padding:10px; background:#1a1a1a; border-radius:6px; border:1px solid #333; display:flex; flex-direction:column; gap:8px;">
                <label style="font-size:0.72rem; color:#ff5722; font-weight:700; text-transform:uppercase; letter-spacing:.05em; display:block;"><i class="fa-solid fa-sliders"></i> Layout & Style</label>
                
                <div>
                    <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#ccc; margin-bottom:2px;">
                        <span>Horizontal Offset</span>
                        <span id="hero-offset-x-val">-40px</span>
                    </div>
                    <input type="range" id="hero-offset-x" min="-800" max="800" value="-40" style="width:100%;">
                </div>
                <div>
                    <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#ccc; margin-bottom:2px;">
                        <span>Vertical Offset</span>
                        <span id="hero-offset-y-val">0px</span>
                    </div>
                    <input type="range" id="hero-offset-y" min="-400" max="400" value="0" style="width:100%;">
                </div>
                <div>
                    <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#ccc; margin-bottom:2px;">
                        <span>Hero Section Height (px)</span>
                        <span id="hero-height-val">650px</span>
                    </div>
                    <input type="range" id="hero-height-slider" min="300" max="1200" value="650" style="width:100%;">
                </div>
                <div>
                    <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#ccc; margin-bottom:2px;">
                        <span>Hero Vertical Padding (px)</span>
                        <span id="hero-padding-val">60px</span>
                    </div>
                    <input type="range" id="hero-padding-slider" min="0" max="250" value="60" style="width:100%;">
                </div>
                <div>
                    <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#ccc; margin-bottom:2px;">
                        <span>Card Width (px)</span>
                        <span id="hero-card-width-val">720px</span>
                    </div>
                    <input type="range" id="hero-card-width-slider" min="300" max="1000" value="720" style="width:100%;">
                </div>
                <div>
                    <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#ccc; margin-bottom:2px;">
                        <span>Card Height (px/auto)</span>
                        <span id="hero-card-height-val">auto</span>
                    </div>
                    <input type="range" id="hero-card-height-slider" min="150" max="1000" value="400" style="width:100%;">
                    <label style="font-size:0.65rem; color:#aaa; display:flex; align-items:center; gap:4px; margin-top:2px; cursor:pointer;">
                        <input type="checkbox" id="hero-card-height-auto" checked style="width:12px; height:12px; cursor:pointer;"> Use Auto Height
                    </label>
                </div>
                <div>
                    <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#ccc; margin-bottom:2px;">
                        <span>Card Padding (px)</span>
                        <span id="hero-card-padding-val">30px</span>
                    </div>
                    <input type="range" id="hero-card-padding-slider" min="10" max="100" value="30" style="width:100%;">
                </div>
                <div>
                    <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#ccc; margin-bottom:2px;">
                        <span>Border Radius</span>
                        <span id="hero-card-radius-val">8px</span>
                    </div>
                    <input type="range" id="hero-card-radius-slider" min="0" max="50" value="8" style="width:100%;">
                </div>
                <div>
                    <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#ccc; margin-bottom:2px;">
                        <span>Backdrop Blur</span>
                        <span id="hero-card-blur-val">16px</span>
                    </div>
                    <input type="range" id="hero-card-blur-slider" min="0" max="40" value="16" style="width:100%;">
                </div>
                <div>
                    <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#ccc; margin-bottom:2px;">
                        <span>Glass Opacity</span>
                        <span id="hero-card-opacity-val">0.45</span>
                    </div>
                    <input type="range" id="hero-card-opacity-slider" min="10" max="95" value="45" style="width:100%;">
                </div>
                <div>
                    <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#ccc; margin-bottom:2px;">
                        <span>Video BG Zoom</span>
                        <span id="hero-video-zoom-val">1.0x</span>
                    </div>
                    <input type="range" id="hero-video-zoom-slider" min="50" max="250" value="100" style="width:100%;">
                </div>
            </div>

            <!-- Content Settings -->
            <div style="margin-bottom:12px; padding:10px; background:#1a1a1a; border-radius:6px; border:1px solid #333; display:flex; flex-direction:column; gap:8px;">
                <label style="font-size:0.72rem; color:#ff5722; font-weight:700; text-transform:uppercase; letter-spacing:.05em; display:block;"><i class="fa-solid fa-pen-to-square"></i> Hero Content</label>
                
                <div>
                    <label style="font-size:0.75rem; color:#ccc; display:block; margin-bottom:2px;">Hello There Badge</label>
                    <input type="text" id="hero-badge-text-input" style="width:100%; padding:6px; border-radius:4px; border:1px solid #555; background:#222; color:#fff; font-size:0.75rem;">
                </div>
                <div>
                    <label style="font-size:0.75rem; color:#ccc; display:block; margin-bottom:2px;">Main Headline (H1)</label>
                    <textarea id="hero-title-text-input" rows="3" style="width:100%; padding:6px; border-radius:4px; border:1px solid #555; background:#222; color:#fff; font-size:0.75rem; font-family:sans-serif; resize:vertical;"></textarea>
                </div>
                <div>
                    <label style="font-size:0.75rem; color:#ccc; display:block; margin-bottom:2px;">Description Paragraph</label>
                    <textarea id="hero-desc-text-input" rows="3" style="width:100%; padding:6px; border-radius:4px; border:1px solid #555; background:#222; color:#fff; font-size:0.75rem; font-family:sans-serif; resize:vertical;"></textarea>
                </div>
                <div>
                    <label style="font-size:0.75rem; color:#ccc; display:block; margin-bottom:2px;">Experience Badge</label>
                    <input type="text" id="hero-exp-text-input" style="width:100%; padding:6px; border-radius:4px; border:1px solid #555; background:#222; color:#fff; font-size:0.75rem;">
                </div>
                <div>
                    <label style="font-size:0.75rem; color:#ccc; display:block; margin-bottom:2px;">Projects Badge</label>
                    <input type="text" id="hero-proj-text-input" style="width:100%; padding:6px; border-radius:4px; border:1px solid #555; background:#222; color:#fff; font-size:0.75rem;">
                </div>
                <div style="display:flex; gap:15px; margin-top:5px; padding-top:5px; border-top:1px solid #333;">
                    <label style="font-size:0.75rem; color:#ccc; display:flex; align-items:center; gap:6px; cursor:pointer;">
                        <input type="checkbox" id="hero-show-exp" checked style="cursor:pointer;"> Show Experience Badge
                    </label>
                    <label style="font-size:0.75rem; color:#ccc; display:flex; align-items:center; gap:6px; cursor:pointer;">
                        <input type="checkbox" id="hero-show-proj" checked style="cursor:pointer;"> Show Projects Badge
                    </label>
                </div>
            </div>

            <!-- Action Buttons Editor -->
            <div style="margin-bottom:12px; padding:10px; background:#1a1a1a; border-radius:6px; border:1px solid #333;">
                <label style="font-size:0.72rem; color:#ff5722; font-weight:700; text-transform:uppercase; letter-spacing:.05em; display:block; margin-bottom:8px;"><i class="fa-solid fa-link"></i> Action Buttons</label>
                <div id="hero-buttons-editor-list" style="display:flex; flex-direction:column; gap:8px; margin-bottom:10px;"></div>
                <button id="hero-add-button-btn" class="admin-btn" style="width:100%; background:#28a745; font-size:0.75rem; padding:6px; margin:0;"><i class="fa-solid fa-plus"></i> Add New Button</button>
            </div>

            <!-- Skill Tags Editor -->
            <div style="margin-bottom:12px; padding:10px; background:#1a1a1a; border-radius:6px; border:1px solid #333;">
                <label style="font-size:0.72rem; color:#ff5722; font-weight:700; text-transform:uppercase; letter-spacing:.05em; display:block; margin-bottom:8px;"><i class="fa-solid fa-tags"></i> Skill Tags</label>
                <div id="hero-tags-editor-list" style="display:flex; flex-direction:column; gap:8px; margin-bottom:10px;"></div>
                <button id="hero-add-tag-btn" class="admin-btn" style="width:100%; background:#28a745; font-size:0.75rem; padding:6px; margin:0;"><i class="fa-solid fa-plus"></i> Add New Tag</button>
            </div>

            <!-- Floating Logo Cards Editor -->
            <div style="margin-bottom:12px; padding:10px; background:#1a1a1a; border-radius:6px; border:1px solid #333;">
                <label style="font-size:0.72rem; color:#ff5722; font-weight:700; text-transform:uppercase; letter-spacing:.05em; display:block; margin-bottom:8px;"><i class="fa-solid fa-wand-magic-sparkles"></i> Floating Logo Cards</label>
                <p style="font-size:0.7rem; color:#aaa; margin-bottom:8px;">Add/delete floating cards. Drag cards on the page in Edit Mode to place them.</p>
                <div id="hero-floating-cards-list" style="display:flex; flex-direction:column; gap:6px; margin-bottom:10px;"></div>
                
                <!-- Inline form for adding/editing card -->
                <div id="float-card-form" style="display:none; padding:10px; background:#222; border:1px solid #444; border-radius:6px; margin-top:10px; flex-direction:column; gap:8px;">
                    <h4 style="font-size:0.75rem; color:#ffc107; margin:0;" id="float-card-form-title">Add New Floating Card</h4>
                    <div>
                        <label style="font-size:0.7rem; color:#ccc; display:block; margin-bottom:2px;">Card Text</label>
                        <input type="text" id="float-card-text" style="width:100%; padding:6px; border-radius:4px; border:1px solid #555; background:#333; color:#fff; font-size:0.75rem;">
                    </div>
                    <div>
                        <label style="font-size:0.7rem; color:#ccc; display:block; margin-bottom:2px;">Logo Image</label>
                        <div style="display:flex; gap:6px; margin-bottom:4px;">
                            <input type="file" id="float-card-file" accept="image/*" style="display:none;">
                            <button type="button" id="float-card-file-btn" class="admin-btn" style="margin:0; padding:6px; font-size:0.7rem; flex:1; background:#333; color:#fff;"><i class="fa-solid fa-upload"></i> Upload</button>
                            <input type="text" id="float-card-img-url" placeholder="or Image URL" style="flex:1.5; padding:6px; border-radius:4px; border:1px solid #555; background:#333; color:#fff; font-size:0.75rem;">
                        </div>
                        <div id="float-card-img-preview-container" style="display:none; align-items:center; gap:8px;">
                            <img id="float-card-img-preview" src="" style="height:32px; max-width:60px; object-fit:contain; background:#333; padding:2px; border-radius:2px;" />
                            <span style="font-size:0.7rem; color:#aaa; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:120px;" id="float-card-img-filename"></span>
                        </div>
                    </div>
                    <div style="display:flex; gap:8px;">
                        <div style="flex:1;">
                            <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:#ccc; margin-bottom:2px;">
                                <span>Left Position</span>
                                <span id="float-card-left-val">50%</span>
                            </div>
                            <input type="range" id="float-card-left" min="0" max="100" value="50" style="width:100%;">
                        </div>
                        <div style="flex:1;">
                            <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:#ccc; margin-bottom:2px;">
                                <span>Top Position</span>
                                <span id="float-card-top-val">50%</span>
                            </div>
                            <input type="range" id="float-card-top" min="0" max="100" value="50" style="width:100%;">
                        </div>
                    </div>
                    <!-- Sizing and styling per card -->
                    <div style="border-top:1px solid #444; padding-top:8px; display:flex; flex-direction:column; gap:6px;">
                        <label style="font-size:0.65rem; color:#ff5722; font-weight:700; text-transform:uppercase; display:block;">Card Sizing & Style</label>
                        
                        <div style="display:flex; gap:8px; margin-bottom:4px;">
                            <div style="flex:1;">
                                <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:#ccc; margin-bottom:2px;">
                                    <span>Width (px)</span>
                                    <span id="float-card-width-val">auto</span>
                                </div>
                                <input type="range" id="float-card-width-input" min="80" max="400" value="150" style="width:100%;">
                                <label style="font-size:0.65rem; color:#aaa; display:flex; align-items:center; gap:4px; margin-top:2px; cursor:pointer;">
                                    <input type="checkbox" id="float-card-width-auto" checked style="width:12px; height:12px; cursor:pointer;"> Auto
                                </label>
                            </div>
                            <div style="flex:1;">
                                <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:#ccc; margin-bottom:2px;">
                                    <span>Height (px)</span>
                                    <span id="float-card-height-val">auto</span>
                                </div>
                                <input type="range" id="float-card-height-input" min="30" max="250" value="50" style="width:100%;">
                                <label style="font-size:0.65rem; color:#aaa; display:flex; align-items:center; gap:4px; margin-top:2px; cursor:pointer;">
                                    <input type="checkbox" id="float-card-height-auto" checked style="width:12px; height:12px; cursor:pointer;"> Auto
                                </label>
                            </div>
                        </div>
                        <div style="display:flex; gap:8px; margin-bottom:4px;">
                            <div style="flex:1;">
                                <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:#ccc; margin-bottom:2px;">
                                    <span>Padding</span>
                                    <span id="float-card-padding-val">10px</span>
                                </div>
                                <input type="range" id="float-card-padding-input" min="2" max="30" value="10" style="width:100%;">
                            </div>
                            <div style="flex:1;">
                                <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:#ccc; margin-bottom:2px;">
                                    <span>Radius</span>
                                    <span id="float-card-radius-val">12px</span>
                                </div>
                                <input type="range" id="float-card-radius-input" min="0" max="40" value="12" style="width:100%;">
                            </div>
                        </div>
                        <div style="display:flex; gap:8px;">
                            <div style="flex:1;">
                                <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:#ccc; margin-bottom:2px;">
                                    <span>Blur</span>
                                    <span id="float-card-blur-val">12px</span>
                                </div>
                                <input type="range" id="float-card-blur-input" min="0" max="40" value="12" style="width:100%;">
                            </div>
                            <div style="flex:1;">
                                <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:#ccc; margin-bottom:2px;">
                                    <span>Opacity</span>
                                    <span id="float-card-opacity-val">0.45</span>
                                </div>
                                <input type="range" id="float-card-opacity-input" min="10" max="95" value="45" style="width:100%;">
                            </div>
                        </div>
                        <div style="display:flex; gap:8px; margin-top:4px;">
                            <div style="flex:1;">
                                <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:#ccc; margin-bottom:2px;">
                                    <span>Card Scale</span>
                                    <span id="float-card-scale-val">1x</span>
                                </div>
                                <input type="range" id="float-card-scale-input" min="50" max="250" value="100" style="width:100%;">
                            </div>
                            <div style="flex:1;">
                                <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:#ccc; margin-bottom:2px;">
                                    <span>Image Size</span>
                                    <span id="float-card-imgsize-val">24px</span>
                                </div>
                                <input type="range" id="float-card-imgsize-input" min="14" max="80" value="24" style="width:100%;">
                            </div>
                        </div>
                    </div>
                    <div style="display:flex; gap:6px; margin-top:4px;">
                        <button type="button" id="float-card-save-btn" class="admin-btn" style="margin:0; padding:6px; font-size:0.75rem; background:#28a745; flex:1; color:#fff;">Save Card</button>
                        <button type="button" id="float-card-cancel-btn" class="admin-btn danger" style="margin:0; padding:6px; font-size:0.75rem; flex:1; color:#fff;">Cancel</button>
                    </div>
                </div>
                <button id="float-card-add-btn" class="admin-btn" style="width:100%; background:#28a745; font-size:0.75rem; padding:6px; margin:0;"><i class="fa-solid fa-plus"></i> Add New Card</button>
            </div>
        </div>

        <div id="flipbook-panel" style="display:none; margin-top:15px; border-top:1px solid #333; padding-top:15px;">
            <p style="font-size:0.75rem; color:#aaa; margin-bottom:10px;">Manage pages for each flipbook independently.</p>

            <!-- ── Which Flipbook Selector ── -->
            <div style="margin-bottom:12px; padding:10px; background:#0d1f17; border-radius:6px; border:1px solid #1a3a2a;">
                <label style="font-size:0.72rem; color:#20c997; font-weight:700; text-transform:uppercase; letter-spacing:.05em; display:block; margin-bottom:6px;"><i class="fa-solid fa-book"></i> Select Flipbook</label>
                <select id="flipbook-which-select" style="width:100%; padding:7px 10px; border-radius:4px; border:1px solid #444; background:#111; color:#fff; font-size:0.82rem; cursor:pointer;">
                    <option value="1">Flipbook 1</option>
                </select>
            </div>

            <!-- ── Book Size Preset Selector ── -->
            <div style="margin-bottom:14px; padding:10px; background:#1a1a1a; border-radius:6px; border:1px solid #333;">
                <label style="font-size:0.72rem; color:#20c997; font-weight:700; text-transform:uppercase; letter-spacing:.05em; display:block; margin-bottom:6px;"><i class="fa-solid fa-ruler-combined"></i> Book Size Preset</label>
                <select id="flipbook-size-select" style="width:100%; padding:7px 10px; border-radius:4px; border:1px solid #444; background:#111; color:#fff; font-size:0.82rem; cursor:pointer;">
                    <option value="6x9">6 × 9 in — Portrait Novel / Chapter Book</option>
                    <option value="8.5x8.5">8.5 × 8.5 in — Square Picture Book</option>
                    <option value="8.5x11">8.5 × 11 in — Tall Portrait / Activity Book</option>
                </select>
                <div id="flipbook-size-preview" style="margin-top:8px; display:flex; align-items:center; gap:10px; font-size:0.72rem; color:#aaa;"></div>
            </div>

            <!-- ── Page list ── -->
            <div id="flipbook-pages-list" style="display:flex; flex-direction:column; gap:6px; margin-bottom:12px;"></div>

            <!-- ── Add + Duplicate controls ── -->
            <div style="display:flex; gap:5px; margin-bottom:8px;">
                <button id="flipbook-add-img" class="admin-btn" style="flex:1; background:#20c997; margin:0;"><i class="fa-solid fa-upload"></i> Add Page (Upload)</button>
                <button id="flipbook-duplicate" class="admin-btn" style="background:#6f42c1; margin:0; padding:10px 12px; white-space:nowrap;"><i class="fa-solid fa-copy"></i> Duplicate Flipbook</button>
            </div>
            <div style="display:flex; gap:5px;">
                <input type="text" id="flipbook-url-input" placeholder="or paste image URL..." style="flex:1; padding:6px; border-radius:4px; border:1px solid #555; background:#222; color:#fff; font-size:0.75rem;">
                <button id="flipbook-add-url" class="admin-btn" style="background:#20c997; margin:0; padding:6px 10px; height:auto;"><i class="fa-solid fa-plus"></i> Add</button>
            </div>
            <input type="file" id="flipbook-file-input" accept="image/*" style="display:none;">
            <!-- hidden file input for per-page replacement -->
            <input type="file" id="flipbook-replace-input" accept="image/*" style="display:none;">
        </div>

        <div id="particle-panel" style="display:none; margin-top:15px; border-top:1px solid #333; padding-top:15px;"></div>
    </div>

    <!-- Flipbook Replace Page Modal -->
    <div id="fp-rp-overlay" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:199998;"></div>
    <div id="fp-rp-modal" style="display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#161616;border:1px solid #333;border-radius:14px;padding:22px;width:340px;max-width:94vw;z-index:199999;box-shadow:0 28px 80px rgba(0,0,0,0.9);font-family:'Poppins',sans-serif;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <span id="fp-rp-title" style="color:#fff;font-size:1rem;font-weight:700;">Replace Page 1</span>
            <button id="fp-rp-close" style="background:none;border:none;color:#888;font-size:1.5rem;cursor:pointer;line-height:1;"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div id="fp-rp-szlbl" style="font-size:0.7rem;color:#20c997;font-weight:600;margin-bottom:12px;letter-spacing:.04em;"></div>
        <!-- Drop zone -->
        <div id="fp-rp-dz" style="border:2px dashed #444;border-radius:8px;padding:26px 16px;text-align:center;cursor:pointer;transition:border-color .2s,background .2s;margin-bottom:14px;background:#111;">
            <div style="font-size:2rem;margin-bottom:8px;"><i class="fa-solid fa-image"></i></div>
            <div style="color:#777;font-size:0.8rem;margin-bottom:10px;">Drag &amp; drop image here, or</div>
            <button id="fp-rp-browse" type="button" style="background:#20c997;color:#fff;border:none;border-radius:6px;padding:7px 18px;cursor:pointer;font-size:0.8rem;font-weight:700;"><i class="fa-solid fa-folder-open"></i> Browse File</button>
            <input type="file" id="fp-rp-file" accept="image/*" style="display:none;">
        </div>
        <!-- Status -->
        <div id="fp-rp-status" style="display:none;padding:8px 12px;background:#0d2e24;border-radius:6px;color:#20c997;font-size:0.78rem;margin-bottom:12px;text-align:center;"><i class="fa-solid fa-spinner fa-spin"></i> Processing image...</div>
        <!-- Canvas preview -->
        <div id="fp-rp-preview" style="display:none;text-align:center;margin-bottom:14px;">
            <div style="font-size:0.68rem;color:#888;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">Cropped Preview</div>
            <canvas id="fp-rp-canvas" style="border-radius:6px;box-shadow:0 6px 24px rgba(0,0,0,0.5);max-width:100%;"></canvas>
            <div style="font-size:0.68rem;color:#20c997;margin-top:6px;"><i class="fa-solid fa-circle-check"></i> Auto-cropped &amp; centered</div>
        </div>
        <!-- Buttons -->
        <div style="display:flex;gap:8px;">
            <button id="fp-rp-cancel" type="button" style="flex:1;padding:9px;border-radius:6px;border:1px solid #444;background:transparent;color:#ccc;cursor:pointer;font-weight:600;">Cancel</button>
            <button id="fp-rp-apply" type="button" style="display:none;flex:2;padding:9px;border-radius:6px;border:none;background:#20c997;color:#fff;font-weight:700;cursor:pointer;"><i class="fa-solid fa-check"></i> Apply</button>
        </div>
    </div>

    <!-- Image Cropper Modal -->
    <div id="admin-crop-modal">
        <div class="crop-modal-content">
            <div class="crop-modal-header">
                <h2>Edit Image</h2>
                <button class="close-crop-modal"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="crop-input-area">
                <input type="text" id="crop-url-input" placeholder="Paste Direct Image URL here...">
                <span style="font-weight:bold; color:#666;">OR</span>
                <input type="file" id="crop-file-input" accept="image/png, image/jpeg, image/webp">
            </div>
            <div class="crop-workspace">
                <img id="crop-preview-image" src="" style="display:none;">
            </div>
            <div class="crop-aspect-selector">
                <span class="crop-aspect-label">Aspect Ratio:</span>
                <button type="button" class="crop-aspect-btn active" data-ratio="NaN">Free (Original)</button>
                <button type="button" class="crop-aspect-btn" data-ratio="1">Square (1:1)</button>
                <button type="button" class="crop-aspect-btn" data-ratio="0.6667">Book Cover (2:3)</button>
                <button type="button" class="crop-aspect-btn" data-ratio="1.7778">Landscape (16:9)</button>
            </div>
            <div class="crop-actions">
                <button class="crop-btn crop-btn-cancel">Cancel</button>
                <button class="crop-btn crop-btn-save">Apply Image</button>
            </div>
        </div>
    </div>

    <!-- Add Portfolio Item Modal -->
    <div id="admin-add-item-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.75); z-index:199999; justify-content:center; align-items:center; font-family:\'Poppins\', sans-serif;">
        <div style="background:#1e1e1e; border:1px solid #333; color:#fff; width:90%; max-width:500px; border-radius:12px; padding:24px; box-shadow:0 20px 60px rgba(0,0,0,0.5); display:flex; flex-direction:column; gap:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #333; padding-bottom:12px;">
                <h3 style="margin:0; font-size:1.25rem; color:#20c997; display:flex; align-items:center; gap:8px;"><i class="fa-solid fa-circle-plus"></i> Add Portfolio Item</h3>
                <button type="button" class="close-add-item-modal" style="background:none; border:none; color:#aaa; font-size:1.5rem; cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>
            </div>
            
            <div style="display:flex; flex-direction:column; gap:12px;">
                <!-- Category Select -->
                <div style="display:flex; flex-direction:column; gap:5px;">
                    <label style="font-size:0.8rem; color:#aaa; font-weight:600;">Category</label>
                    <select id="add-item-category" style="padding:10px; border-radius:6px; border:1px solid #444; background:#111; color:#fff; font-size:0.85rem; cursor:pointer; width:100%;">
                        <!-- Will be populated dynamically -->
                    </select>
                </div>
                
                <!-- Layout/Type Choice -->
                <div style="display:flex; flex-direction:column; gap:5px;">
                    <label style="font-size:0.8rem; color:#aaa; font-weight:600;">Item Type / Layout</label>
                    <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px;">
                        <label style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:12px; border:1px solid #444; border-radius:6px; background:#111; cursor:pointer; text-align:center; font-size:0.75rem; transition:0.2s; min-height:85px;">
                            <input type="radio" name="add-item-layout" value="standard" checked style="display:none;">
                            <i class="fa-solid fa-image" style="font-size:1.2rem; color:#20c997;"></i>
                            <span>Standard / Square</span>
                        </label>
                        <label style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:12px; border:1px solid #444; border-radius:6px; background:#111; cursor:pointer; text-align:center; font-size:0.75rem; transition:0.2s; min-height:85px;">
                            <input type="radio" name="add-item-layout" value="full-width" style="display:none;">
                            <i class="fa-solid fa-arrows-left-right" style="font-size:1.2rem; color:#F4B400;"></i>
                            <span>Full-Width Layout</span>
                        </label>
                        <label style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:12px; border:1px solid #444; border-radius:6px; background:#111; cursor:pointer; text-align:center; font-size:0.75rem; transition:0.2s; min-height:85px;">
                            <input type="radio" name="add-item-layout" value="flipbook" style="display:none;">
                            <i class="fa-solid fa-book-open" style="font-size:1.2rem; color:#17a2b8;"></i>
                            <span>3D Flipbook</span>
                        </label>
                    </div>
                </div>
                
                <!-- Title Input -->
                <div style="display:flex; flex-direction:column; gap:5px;">
                    <label style="font-size:0.8rem; color:#aaa; font-weight:600;">Title</label>
                    <input type="text" id="add-item-title" placeholder="e.g. Fantasy Book Cover Design" style="padding:10px; border-radius:6px; border:1px solid #444; background:#111; color:#fff; font-size:0.85rem; width:100%; box-sizing:border-box;">
                </div>
                
                <!-- Tags Input -->
                <div style="display:flex; flex-direction:column; gap:5px;">
                    <label style="font-size:0.8rem; color:#aaa; font-weight:600;">Tags (comma separated)</label>
                    <input type="text" id="add-item-tags" placeholder="e.g. Book Cover, Fantasy, Fiction" style="padding:10px; border-radius:6px; border:1px solid #444; background:#111; color:#fff; font-size:0.85rem; width:100%; box-sizing:border-box;">
                </div>
            </div>
            
            <div style="display:flex; gap:10px; border-top:1px solid #333; padding-top:15px; margin-top:5px;">
                <button type="button" class="cancel-add-item-modal" style="flex:1; padding:10px; border-radius:6px; border:1px solid #444; background:transparent; color:#ccc; cursor:pointer; font-weight:600; font-size:0.9rem;">Cancel</button>
                <button type="button" id="confirm-add-item-btn" style="flex:2; padding:10px; border-radius:6px; border:none; background:#20c997; color:#fff; font-weight:700; cursor:pointer; font-size:0.9rem;"><i class="fa-solid fa-plus"></i> Add Item</button>
            </div>
        </div>
    </div>

    <!-- Floating Text Styling & Color Toolbar -->
    <div id="admin-text-toolbar" style="display:none; position:absolute; background:#111; border:1px solid #333; border-radius:8px; padding:6px 10px; box-shadow:0 8px 30px rgba(0,0,0,0.6); z-index:100002; gap:8px; align-items:center; font-family:\'Poppins\', sans-serif; user-select:none; pointer-events:auto;">
        <div style="font-size:0.75rem; color:#888; font-weight:600; padding:0 4px; display:flex; align-items:center; gap:4px; border-right:1px solid #333; margin-right:4px; padding-right:8px;">
            <i class="fa-solid fa-font"></i> Text
        </div>
        <!-- Presets -->
        <div style="display:flex; gap:6px; align-items:center;">
            <button class="text-color-preset" data-color="#ffffff" title="White" style="width:20px; height:20px; border-radius:50%; border:1px solid #555; background:#ffffff; cursor:pointer; padding:0; box-sizing:border-box;"></button>
            <button class="text-color-preset" data-color="#184C3A" title="Primary Green" style="width:20px; height:20px; border-radius:50%; border:1px solid #555; background:#184C3A; cursor:pointer; padding:0; box-sizing:border-box;"></button>
            <button class="text-color-preset" data-color="#F4B400" title="Accent Gold" style="width:20px; height:20px; border-radius:50%; border:1px solid #555; background:#F4B400; cursor:pointer; padding:0; box-sizing:border-box;"></button>
            <button class="text-color-preset" data-color="#FFE066" title="Light Yellow" style="width:20px; height:20px; border-radius:50%; border:1px solid #555; background:#FFE066; cursor:pointer; padding:0; box-sizing:border-box;"></button>
            <button class="text-color-preset" data-color="#333333" title="Dark Gray" style="width:20px; height:20px; border-radius:50%; border:1px solid #555; background:#333333; cursor:pointer; padding:0; box-sizing:border-box;"></button>
        </div>
        <!-- Custom Color Droplet -->
        <label title="Custom Color" style="display:inline-flex; align-items:center; justify-content:center; cursor:pointer; width:22px; height:22px; border-radius:50%; background:linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet); border:1px solid #555; position:relative; overflow:hidden; margin-left:2px; box-sizing:border-box;">
            <input type="color" id="text-toolbar-color-picker" style="position:absolute; top:-10px; left:-10px; width:40px; height:40px; border:none; padding:0; cursor:pointer; opacity:0;">
            <i class="fa-solid fa-droplet" style="font-size:0.6rem; color:#fff; text-shadow:0 1px 2px rgba(0,0,0,0.8); pointer-events:none;"></i>
        </label>
        <div style="width:1px; height:18px; background:#333; margin:0 4px;"></div>
        <!-- Style Controls -->
        <button class="admin-toolbar-btn bold-btn" title="Toggle Bold" style="padding:4px 8px; font-size:0.75rem; background:#222; color:#fff; border:1px solid #333; border-radius:4px; cursor:pointer; font-weight:bold; height:24px; display:inline-flex; align-items:center; justify-content:center; box-sizing:border-box;"><i class="fa-solid fa-bold"></i></button>
        <button class="admin-toolbar-btn italic-btn" title="Toggle Italic" style="padding:4px 8px; font-size:0.75rem; background:#222; color:#fff; border:1px solid #333; border-radius:4px; cursor:pointer; font-style:italic; height:24px; display:inline-flex; align-items:center; justify-content:center; box-sizing:border-box;"><i class="fa-solid fa-italic"></i></button>
        <!-- Size Controls -->
        <button class="admin-toolbar-btn fs-inc-btn" title="Increase Size" style="padding:4px 8px; font-size:0.75rem; background:#222; color:#fff; border:1px solid #333; border-radius:4px; cursor:pointer; height:24px; display:inline-flex; align-items:center; justify-content:center; box-sizing:border-box;"><i class="fa-solid fa-plus" style="font-size:0.65rem; margin-right:2px;"></i> A</button>
        <button class="admin-toolbar-btn fs-dec-btn" title="Decrease Size" style="padding:4px 8px; font-size:0.75rem; background:#222; color:#fff; border:1px solid #333; border-radius:4px; cursor:pointer; height:24px; display:inline-flex; align-items:center; justify-content:center; box-sizing:border-box;"><i class="fa-solid fa-minus" style="font-size:0.65rem; margin-right:2px;"></i> A</button>
        <div style="width:1px; height:18px; background:#333; margin:0 4px;"></div>
        <!-- Reset -->
        <button class="admin-toolbar-btn reset-text-btn" title="Reset Styles" style="padding:4px 8px; font-size:0.75rem; background:#dc3545; color:#fff; border:none; border-radius:4px; cursor:pointer; height:24px; display:inline-flex; align-items:center; justify-content:center; font-weight:600; box-sizing:border-box;"><i class="fa-solid fa-rotate-left" style="font-size:0.7rem; margin-right:3px;"></i> Reset</button>
    </div>

    <!-- Blog Manager Modal -->
    <div id="admin-blog-modal" style="display:none; position:fixed; inset:0; background:rgba(10,15,10,0.85); backdrop-filter:blur(10px); z-index:199999; justify-content:center; align-items:center; font-family:'Poppins', sans-serif;">
        <div style="background:#1e1e1e; border:1px solid #333; color:#fff; width:95%; max-width:900px; height:85vh; border-radius:16px; padding:28px; box-shadow:0 20px 60px rgba(0,0,0,0.6); display:flex; flex-direction:column; gap:20px; box-sizing:border-box; overflow:hidden;">
            <!-- Modal Header -->
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #333; padding-bottom:15px; flex-shrink:0;">
                <h3 style="margin:0; font-size:1.4rem; color:#ff9f43; display:flex; align-items:center; gap:10px;"><i class="fa-solid fa-blog"></i> Blog Posts Manager</h3>
                <button type="button" class="close-blog-modal" style="background:none; border:none; color:#aaa; font-size:1.8rem; cursor:pointer; transition:color 0.2s;" onmouseover="this.style.color='#ff4a4a'" onmouseout="this.style.color='#aaa'"><i class="fa-solid fa-xmark"></i></button>
            </div>
            
            <!-- List View -->
            <div id="blog-list-view" style="display:flex; flex-direction:column; gap:15px; height:100%; overflow:hidden;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-shrink:0;">
                    <span style="font-size:0.9rem; color:#aaa;">Manage articles in the blog section</span>
                    <button type="button" id="admin-add-blog-btn" style="padding:10px 16px; border-radius:6px; border:none; background:#28a745; color:#fff; font-weight:700; cursor:pointer; font-size:0.85rem; display:flex; align-items:center; gap:6px; transition:0.2s;"><i class="fa-solid fa-plus"></i> Add New Post</button>
                </div>
                
                <div style="flex:1; overflow-y:auto; border:1px solid #333; border-radius:8px; background:#111; padding:10px;">
                    <table style="width:100%; border-collapse:collapse; text-align:left; font-size:0.85rem; color:#eee;">
                        <thead>
                            <tr style="border-bottom:2px solid #333; color:#aaa; font-weight:600;">
                                <th style="padding:12px 10px;">Title</th>
                                <th style="padding:12px 10px; width:140px;">Category</th>
                                <th style="padding:12px 10px; width:120px;">Publish Date</th>
                                <th style="padding:12px 10px; width:80px; text-align:center;">Featured</th>
                                <th style="padding:12px 10px; width:120px; text-align:right;">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="blog-posts-table-body">
                            <!-- Populated dynamically -->
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Editor View -->
            <div id="blog-editor-view" style="display:none; flex-direction:column; gap:15px; height:100%; overflow:hidden;">
                <!-- Editor Header -->
                <div style="display:flex; align-items:center; gap:12px; flex-shrink:0; border-bottom:1px solid #333; padding-bottom:10px;">
                    <button type="button" id="blog-editor-back" style="background:none; border:none; color:#ccc; cursor:pointer; font-size:1rem; display:flex; align-items:center; gap:6px;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#ccc'"><i class="fa-solid fa-arrow-left"></i> Back to List</button>
                    <span style="color:#666;">|</span>
                    <h4 id="blog-editor-title" style="margin:0; font-size:1.1rem; color:#ff9f43;">Add New Blog Post</h4>
                </div>
                
                <!-- Editor Scrollable Body -->
                <div style="flex:1; overflow-y:auto; padding-right:10px; display:flex; flex-direction:column; gap:18px;">
                    <input type="hidden" id="blog-edit-id">
                    
                    <!-- Basic Information Row -->
                    <div style="display:grid; grid-template-columns: 2fr 1fr; gap:15px;">
                        <div style="display:flex; flex-direction:column; gap:6px;">
                            <label style="font-size:0.8rem; color:#aaa; font-weight:600;">Post Title <span style="color:#ff4a4a;">*</span></label>
                            <input type="text" id="blog-edit-title" placeholder="e.g. Amazon KDP Publishing Guide for Self-Publishers" style="padding:10px; border-radius:6px; border:1px solid #444; background:#111; color:#fff; font-size:0.85rem; width:100%; box-sizing:border-box;">
                        </div>
                        <div style="display:flex; flex-direction:column; gap:6px;">
                            <label style="font-size:0.8rem; color:#aaa; font-weight:600;">Slug (SEO URL path) <span style="color:#ff4a4a;">*</span></label>
                            <input type="text" id="blog-edit-slug" placeholder="e.g. amazon-kdp-publishing-guide" style="padding:10px; border-radius:6px; border:1px solid #444; background:#111; color:#fff; font-size:0.85rem; width:100%; box-sizing:border-box;">
                        </div>
                    </div>
                    
                    <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:15px;">
                        <div style="display:flex; flex-direction:column; gap:6px;">
                            <label style="font-size:0.8rem; color:#aaa; font-weight:600;">Category <span style="color:#ff4a4a;">*</span></label>
                            <select id="blog-edit-category" style="padding:10px; border-radius:6px; border:1px solid #444; background:#111; color:#fff; font-size:0.85rem; cursor:pointer;">
                                <option value="Book Formatting">Book Formatting</option>
                                <option value="Book Cover Design">Book Cover Design</option>
                                <option value="KDP Publishing">KDP Publishing</option>
                                <option value="Self-Publishing">Self-Publishing</option>
                                <option value="Other">Other (Type below)</option>
                            </select>
                            <input type="text" id="blog-edit-category-custom" placeholder="Or enter custom category" style="padding:8px 10px; border-radius:6px; border:1px solid #444; background:#111; color:#fff; font-size:0.8rem; margin-top:5px; display:none;">
                        </div>
                        <div style="display:flex; flex-direction:column; gap:6px;">
                            <label style="font-size:0.8rem; color:#aaa; font-weight:600;">Author Name</label>
                            <select id="blog-edit-author" style="padding:10px; border-radius:6px; border:1px solid #444; background:#111; color:#fff; font-size:0.85rem; cursor:pointer;">
                                <option value="Hamid Raza (KDP Expert)">Hamid Raza (KDP Expert)</option>
                                <option value="Loufy Publisher">Loufy Publisher</option>
                                <option value="Loufy Book Formatting">Loufy Book Formatting</option>
                                <option value="Loufy Publishing Services">Loufy Publishing Services</option>
                            </select>
                        </div>
                        <div style="display:flex; flex-direction:column; gap:6px;">
                            <label style="font-size:0.8rem; color:#aaa; font-weight:600;">Publish Date <span style="color:#ff4a4a;">*</span></label>
                            <input type="datetime-local" id="blog-edit-date" style="padding:10px; border-radius:6px; border:1px solid #444; background:#111; color:#fff; font-size:0.85rem; box-sizing:border-box; width:100%;">
                        </div>
                    </div>
                    
                    <div style="display:grid; grid-template-columns: 2fr 1fr 1fr; gap:15px; align-items: center;">
                        <div style="display:flex; flex-direction:column; gap:6px;">
                            <label style="font-size:0.8rem; color:#aaa; font-weight:600;">Featured Image URL</label>
                            <div style="display:flex; gap:8px; align-items: center;">
                                <input type="text" id="blog-edit-image" placeholder="https://images.unsplash.com/... or /images/..." style="padding:10px; border-radius:6px; border:1px solid #444; background:#111; color:#fff; font-size:0.85rem; flex:1; box-sizing:border-box; min-width: 0;">
                                <button type="button" id="blog-image-upload-trigger" style="padding:10px 14px; border-radius:6px; border:none; background:#ff9f43; color:#fff; font-weight:700; cursor:pointer; font-size:0.85rem; display:flex; align-items:center; gap:6px; white-space:nowrap; height:38px; box-sizing:border-box;"><i class="fa-solid fa-cloud-arrow-up"></i> Upload</button>
                                <input type="file" id="blog-edit-image-file" accept="image/*" style="display:none;">
                            </div>
                            <img id="blog-edit-image-preview" src="" style="display:none; max-width:120px; max-height:80px; border-radius:6px; border:1px solid #333; margin-top:8px; object-fit:cover;">
                        </div>
                        <div style="display:flex; flex-direction:column; gap:6px;">
                            <label style="font-size:0.8rem; color:#aaa; font-weight:600;">Reading Time (mins)</label>
                            <input type="number" id="blog-edit-readtime" min="1" max="60" value="5" style="padding:10px; border-radius:6px; border:1px solid #444; background:#111; color:#fff; font-size:0.85rem; width:100%; box-sizing:border-box;">
                        </div>
                        <div style="display:flex; align-items:center; gap:8px; margin-top:20px; cursor:pointer; user-select:none;">
                            <input type="checkbox" id="blog-edit-featured" style="width:18px; height:18px; cursor:pointer;">
                            <label for="blog-edit-featured" style="font-size:0.85rem; color:#fff; cursor:pointer; font-weight:600;">Featured Post</label>
                        </div>
                    </div>
                    
                    <div style="display:flex; flex-direction:column; gap:6px;">
                        <label style="font-size:0.8rem; color:#aaa; font-weight:600;">Tags (comma-separated)</label>
                        <input type="text" id="blog-edit-tags" placeholder="Amazon KDP Publishing, Book Formatting, Kindle Formatting" style="padding:10px; border-radius:6px; border:1px solid #444; background:#111; color:#fff; font-size:0.85rem; width:100%; box-sizing:border-box;">
                    </div>
                    
                    <div style="display:flex; flex-direction:column; gap:6px;">
                        <label style="font-size:0.8rem; color:#aaa; font-weight:600;">Summary / Excerpt (shown on cards) <span style="color:#ff4a4a;">*</span></label>
                        <textarea id="blog-edit-summary" rows="2" placeholder="Brief 2-sentence description of the article..." style="padding:10px; border-radius:6px; border:1px solid #444; background:#111; color:#fff; font-size:0.85rem; font-family:inherit; resize:vertical; width:100%; box-sizing:border-box;"></textarea>
                    </div>
                    
                    <!-- Content (HTML Editor textarea) -->
                    <div style="display:flex; flex-direction:column; gap:6px;">
                        <label style="font-size:0.8rem; color:#aaa; font-weight:600;">Article Body Content (HTML allowed) <span style="color:#ff4a4a;">*</span></label>
                        <div style="display:flex; gap:8px; margin-bottom:5px; flex-wrap:wrap;">
                            <button type="button" class="blog-tool-btn" data-tag="h2" style="padding:4px 8px; font-size:0.75rem; background:#333; color:#fff; border:1px solid #444; border-radius:4px; cursor:pointer;">H2</button>
                            <button type="button" class="blog-tool-btn" data-tag="h3" style="padding:4px 8px; font-size:0.75rem; background:#333; color:#fff; border:1px solid #444; border-radius:4px; cursor:pointer;">H3</button>
                            <button type="button" class="blog-tool-btn" data-tag="p" style="padding:4px 8px; font-size:0.75rem; background:#333; color:#fff; border:1px solid #444; border-radius:4px; cursor:pointer;">Paragraph</button>
                            <button type="button" class="blog-tool-btn" data-tag="bold" style="padding:4px 8px; font-size:0.75rem; background:#333; color:#fff; border:1px solid #444; border-radius:4px; cursor:pointer; font-weight:bold;">B</button>
                            <button type="button" class="blog-tool-btn" data-tag="italic" style="padding:4px 8px; font-size:0.75rem; background:#333; color:#fff; border:1px solid #444; border-radius:4px; cursor:pointer; font-style:italic;">I</button>
                            <button type="button" class="blog-tool-btn" data-tag="link" style="padding:4px 8px; font-size:0.75rem; background:#333; color:#fff; border:1px solid #444; border-radius:4px; cursor:pointer; text-decoration:underline;">Link</button>
                            <button type="button" class="blog-tool-btn" data-tag="ul" style="padding:4px 8px; font-size:0.75rem; background:#333; color:#fff; border:1px solid #444; border-radius:4px; cursor:pointer;">Bullet List</button>
                        </div>
                        <textarea id="blog-edit-content" rows="12" placeholder="<h2>Your Heading</h2><p>Write your blog post body content here using paragraphs, lists, and headings.</p>" style="padding:10px; border-radius:6px; border:1px solid #444; background:#111; color:#fff; font-size:0.85rem; font-family:monospace; resize:vertical; width:100%; box-sizing:border-box; line-height:1.4;"></textarea>
                    </div>
                    
                    <!-- SEO Fields Accordion -->
                    <div style="border:1px solid #333; border-radius:8px; overflow:hidden;">
                        <button type="button" id="blog-seo-accordion-toggle" style="width:100%; padding:12px; background:#222; border:none; color:#fff; font-weight:600; text-align:left; cursor:pointer; display:flex; justify-content:space-between; align-items:center; font-size:0.85rem;">
                            <span><i class="fa-solid fa-search"></i> SEO Configuration (Meta Tags & Title)</span>
                            <i class="fa-solid fa-chevron-down" id="blog-seo-chevron"></i>
                        </button>
                        <div id="blog-seo-accordion-content" style="display:none; padding:15px; background:#1a1a1a; border-top:1px solid #333; flex-direction:column; gap:12px;">
                            <div style="display:flex; flex-direction:column; gap:6px;">
                                <label style="font-size:0.8rem; color:#aaa; font-weight:600;">SEO Meta Title</label>
                                <input type="text" id="blog-edit-seo-title" placeholder="Meta title for Google search results (recommended < 60 chars)" style="padding:10px; border-radius:6px; border:1px solid #444; background:#111; color:#fff; font-size:0.85rem; width:100%; box-sizing:border-box;">
                            </div>
                            <div style="display:flex; flex-direction:column; gap:6px;">
                                <label style="font-size:0.8rem; color:#aaa; font-weight:600;">SEO Meta Description</label>
                                <textarea id="blog-edit-seo-description" rows="3" placeholder="Meta description snippet for search results (recommended < 160 chars)" style="padding:10px; border-radius:6px; border:1px solid #444; background:#111; color:#fff; font-size:0.85rem; font-family:inherit; resize:vertical; width:100%; box-sizing:border-box;"></textarea>
                            </div>
                        </div>
                    </div>
                    
                    <!-- FAQ Builder Section -->
                    <div style="border:1px solid #333; border-radius:8px; overflow:hidden;">
                        <button type="button" id="blog-faq-accordion-toggle" style="width:100%; padding:12px; background:#222; border:none; color:#fff; font-weight:600; text-align:left; cursor:pointer; display:flex; justify-content:space-between; align-items:center; font-size:0.85rem;">
                            <span><i class="fa-solid fa-circle-question"></i> Collapsible FAQ Accordions (FAQ Schema)</span>
                            <i class="fa-solid fa-chevron-down" id="blog-faq-chevron"></i>
                        </button>
                        <div id="blog-faq-accordion-content" style="display:none; padding:15px; background:#1a1a1a; border-top:1px solid #333; flex-direction:column; gap:15px;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-size:0.8rem; color:#aaa;">Add questions and answers that will appear at the bottom of the article.</span>
                                <button type="button" id="blog-add-faq-row" style="padding:6px 12px; border-radius:4px; border:none; background:#ff9f43; color:#111; font-weight:700; cursor:pointer; font-size:0.75rem; display:flex; align-items:center; gap:4px;"><i class="fa-solid fa-plus"></i> Add Q&A</button>
                            </div>
                            <div id="blog-faq-list-container" style="display:flex; flex-direction:column; gap:12px;">
                                <!-- FAQ Rows loaded dynamically -->
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Editor Footer Controls -->
                <div style="display:flex; gap:12px; border-top:1px solid #333; padding-top:15px; margin-top:5px; flex-shrink:0;">
                    <button type="button" id="blog-editor-cancel" style="flex:1; padding:12px; border-radius:6px; border:1px solid #444; background:transparent; color:#ccc; cursor:pointer; font-weight:600; font-size:0.9rem; transition:0.2s;" onmouseover="this.style.background='#2a2a2a'" onmouseout="this.style.background='transparent'">Cancel</button>
                    <button type="button" id="blog-editor-save-btn" style="flex:2; padding:12px; border-radius:6px; border:none; background:#28a745; color:#fff; font-weight:700; cursor:pointer; font-size:0.9rem; display:flex; align-items:center; justify-content:center; gap:8px; transition:0.2s;"><i class="fa-solid fa-check"></i> Save & Sync to Supabase</button>
                </div>
            </div>
        </div>
    </div>


    `;
    document.body.insertAdjacentHTML('beforeend', adminHTML);

    const adminPanel = document.getElementById("super-admin-panel");
    const textToolbar = document.getElementById("admin-text-toolbar");
    const textColorPicker = document.getElementById("text-toolbar-color-picker");
    const toggleBtn = document.getElementById("toggle-edit-mode");
    const addPortfolioBtn = document.getElementById("add-portfolio-item");
    const addReviewBtn = document.getElementById("add-review");
    const addPackageBtn = document.getElementById("add-package");
    const manageSocialBtn = document.getElementById("manage-social");
    const managePricingBtn = document.getElementById("manage-pricing");
    const manageSectionsBtn = document.getElementById("manage-sections");
    const manageFiltersBtn = document.getElementById("manage-filters");
    const manageFlipbookBtnEl = document.getElementById("manage-flipbook");
    const saveBtn = document.getElementById("save-changes");
    const exportBtn = document.getElementById("export-html");
    const clearBtn = document.getElementById("clear-storage");
    const exitAdminBtn = document.getElementById("exit-admin-mode");
    const closeBtn = document.querySelector(".close-admin");
    const changeHeroBgBtn = document.getElementById("change-hero-bg");

    // Social Links Elements
    const pricingPanel = document.getElementById("pricing-links-panel");
    const savePricingBtn = document.getElementById("save-pricing-links");

    // Sections Panel
    const sectionsPanel = document.getElementById("sections-panel");
    const sectionsList = document.getElementById("sections-list");

    // Social Panel
    const socialPanel = document.getElementById("social-links-panel");
    const socialList = document.getElementById("social-list");
    const saveSocialBtn = document.getElementById("save-social-links");

    // Modal Elements
    const cropModal = document.getElementById("admin-crop-modal");
    const closeCropBtn = document.querySelector(".close-crop-modal");
    const cancelCropBtn = document.querySelector(".crop-btn-cancel");
    const saveCropBtn = document.querySelector(".crop-btn-save");


    const fileInput = document.getElementById("crop-file-input");
    const urlInput = document.getElementById("crop-url-input");
    const previewImage = document.getElementById("crop-preview-image");
    
    // Theme Customizer Elements
    const manageThemeBtn = document.getElementById("manage-theme");
    const themePanel = document.getElementById("theme-panel");
    const themePresetSelect = document.getElementById("theme-preset-select");
    const resetThemeBtn = document.getElementById("reset-theme-btn");
    
    const pickerPrimary = document.getElementById("theme-picker-primary");
    const pickerAccent = document.getElementById("theme-picker-accent");
    const pickerDark = document.getElementById("theme-picker-dark");
    const pickerLight = document.getElementById("theme-picker-light");
    const pickerCardBg = document.getElementById("theme-picker-card-bg");

    // Hero Card Panel Elements
    const manageHeroCardBtn = document.getElementById("manage-hero-card");
    const heroCardPanel = document.getElementById("hero-card-panel");
    const heroOffsetX = document.getElementById("hero-offset-x");
    const heroOffsetY = document.getElementById("hero-offset-y");
    const heroCardWidthSlider = document.getElementById("hero-card-width-slider");
    const heroCardRadiusSlider = document.getElementById("hero-card-radius-slider");
    const heroCardBlurSlider = document.getElementById("hero-card-blur-slider");
    const heroCardOpacitySlider = document.getElementById("hero-card-opacity-slider");

    const heroOffsetXVal = document.getElementById("hero-offset-x-val");
    const heroOffsetYVal = document.getElementById("hero-offset-y-val");
    const heroHeightSlider = document.getElementById("hero-height-slider");
    const heroHeightVal = document.getElementById("hero-height-val");
    const heroPaddingSlider = document.getElementById("hero-padding-slider");
    const heroPaddingVal = document.getElementById("hero-padding-val");
    const heroCardWidthVal = document.getElementById("hero-card-width-val");
    const heroCardHeightSlider = document.getElementById("hero-card-height-slider");
    const heroCardHeightVal = document.getElementById("hero-card-height-val");
    const heroCardHeightAuto = document.getElementById("hero-card-height-auto");
    const heroCardPaddingSlider = document.getElementById("hero-card-padding-slider");
    const heroCardPaddingVal = document.getElementById("hero-card-padding-val");
    const heroCardRadiusVal = document.getElementById("hero-card-radius-val");
    const heroCardBlurVal = document.getElementById("hero-card-blur-val");
    const heroCardOpacityVal = document.getElementById("hero-card-opacity-val");
    const heroVideoZoomSlider = document.getElementById("hero-video-zoom-slider");
    const heroVideoZoomVal = document.getElementById("hero-video-zoom-val");



    const heroButtonsEditorList = document.getElementById("hero-buttons-editor-list");
    const heroAddButtonBtn = document.getElementById("hero-add-button-btn");
    const heroTagsEditorList = document.getElementById("hero-tags-editor-list");
    const heroAddTagBtn = document.getElementById("hero-add-tag-btn");

    const heroBadgeTextInput = document.getElementById("hero-badge-text-input");
    const heroTitleTextInput = document.getElementById("hero-title-text-input");
    const heroDescTextInput = document.getElementById("hero-desc-text-input");
    const heroExpTextInput = document.getElementById("hero-exp-text-input");
    const heroProjTextInput = document.getElementById("hero-proj-text-input");
    const heroShowExpCheckbox = document.getElementById("hero-show-exp");
    const heroShowProjCheckbox = document.getElementById("hero-show-proj");
    
    // Add Portfolio Item Modal Elements
    const addItemModal = document.getElementById("admin-add-item-modal");
    const addItemCategory = document.getElementById("add-item-category");
    const addItemTitle = document.getElementById("add-item-title");
    const addItemTags = document.getElementById("add-item-tags");
    const confirmAddItemBtn = document.getElementById("confirm-add-item-btn");
    const closeAddItemModalBtn = addItemModal ? addItemModal.querySelector(".close-add-item-modal") : null;
    const cancelAddItemModalBtn = addItemModal ? addItemModal.querySelector(".cancel-add-item-modal") : null;

    let isEditMode = false;
    let cropperInstance = null;
    let currentImageTarget = null; 

    function updateAddItemLayoutHighlights() {
        if (!addItemModal) return;
        addItemModal.querySelectorAll('input[name="add-item-layout"]').forEach(radio => {
            const label = radio.closest('label');
            if (!label) return;
            if (radio.checked) {
                label.style.borderColor = '#20c997';
                label.style.background = 'rgba(32, 201, 151, 0.1)';
                label.style.boxShadow = '0 0 10px rgba(32, 201, 151, 0.2)';
            } else {
                label.style.borderColor = '#444';
                label.style.background = '#111';
                label.style.boxShadow = 'none';
            }
        });
    }

    if (addItemModal) {
        addItemModal.querySelectorAll('input[name="add-item-layout"]').forEach(radio => {
            radio.addEventListener('change', updateAddItemLayoutHighlights);
        });
    }

    function populateAddItemCategories() {
        if (!addItemCategory) return;
        addItemCategory.innerHTML = '';
        
        const filterContainer = document.querySelector('.portfolio-filters');
        const categories = [];
        if (filterContainer) {
            filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
                const cat = btn.getAttribute('data-cat');
                if (cat && cat !== 'all') {
                    categories.push({ id: cat, name: btn.innerText.trim() });
                }
            });
        }
        
        if (categories.length === 0) {
            categories.push(
                { id: 'covers', name: 'Book Covers' },
                { id: 'children', name: 'Children Books' },
                { id: 'kdp', name: 'Amazon KDP' },
                { id: 'branding', name: 'Branding' },
                { id: 'social', name: 'Social Media' },
                { id: 'formatting', name: 'Formatting' }
            );
        }
        
        categories.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = c.name;
            addItemCategory.appendChild(opt);
        });
    }

    if (addItemCategory) {
        addItemCategory.addEventListener('change', (e) => {
            const val = e.target.value;
            const fullRadio = document.querySelector('input[name="add-item-layout"][value="full-width"]');
            const stdRadio = document.querySelector('input[name="add-item-layout"][value="standard"]');
            const flipRadio = document.querySelector('input[name="add-item-layout"][value="flipbook"]');
            
            if (val === 'formatting' || val === 'a-plus-content') {
                if (fullRadio) fullRadio.checked = true;
            } else if (val === 'children') {
                if (flipRadio) flipRadio.checked = true;
            } else {
                if (stdRadio) stdRadio.checked = true;
            }
            if (typeof updateAddItemLayoutHighlights === 'function') {
                updateAddItemLayoutHighlights();
            }
        });
    }

    if (closeAddItemModalBtn) {
        closeAddItemModalBtn.addEventListener('click', () => {
            if (addItemModal) addItemModal.style.display = 'none';
        });
    }
    if (cancelAddItemModalBtn) {
        cancelAddItemModalBtn.addEventListener('click', () => {
            if (addItemModal) addItemModal.style.display = 'none';
        });
    }

    if (addPortfolioBtn && !document.querySelector('.portfolio-grid')) {
        addPortfolioBtn.style.display = 'none';
    }
    if (addReviewBtn && !document.querySelector('.testimonial-track')) {
        addReviewBtn.style.display = 'none';
    }
    if (addPackageBtn && !document.querySelector('.pricing')) {
        addPackageBtn.style.display = 'none';
    }
    if (managePricingBtn && !document.querySelector('.pricing')) {
        managePricingBtn.style.display = 'none';
    }

    // 2. Triggers & Drag Logic
    // NOTE: Always query by ID — after Supabase replaces body.innerHTML,
    // the adminPanel closure variable becomes a stale detached node.
    // getElementById always returns the currently-live element.
    window.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && (e.key === 'y' || e.key === 'Y')) {
            e.preventDefault();
            const p = document.getElementById('super-admin-panel');
            if (p) {
                p.classList.toggle("active");
            } else {
                localStorage.setItem('admin_mode', 'true');
                try {
                    sessionStorage.setItem('open_admin_panel', 'true');
                } catch (err) {}
                const url = new URL(window.location.href);
                url.searchParams.set('admin', 'true');
                window.location.href = url.toString();
            }
        }
    });
    closeBtn.addEventListener("click", () => {
        const p = document.getElementById('super-admin-panel');
        if (p) p.classList.remove("active");
    });

    const adminHeader = adminPanel.querySelector('h3');
    adminHeader.style.cursor = 'move';
    adminHeader.style.userSelect = 'none';

    let isDragging = false;
    let dragOffsetX, dragOffsetY;

    adminHeader.addEventListener('mousedown', (e) => {
        if (e.target.tagName.toLowerCase() === 'button') return;
        isDragging = true;
        const rect = adminPanel.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', onStopDrag);
    });

    function onDrag(e) {
        if (!isDragging) return;
        e.preventDefault();
        adminPanel.style.right = 'auto';
        adminPanel.style.left = (e.clientX - dragOffsetX) + 'px';
        adminPanel.style.top = (e.clientY - dragOffsetY) + 'px';
    }

    function onStopDrag() {
        isDragging = false;
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup', onStopDrag);
    }

    // 2.5 Theme Customizer Logic

    function initAdminThemePanelFromDOM() {
        const styleEl = document.getElementById('custom-theme-styles');
        if (!styleEl) {
            // No custom styles, select default preset and set pickers to default colors
            if (themePresetSelect) themePresetSelect.value = 'default';
            const defaultColors = THEME_PRESETS['default'];
            if (pickerPrimary) pickerPrimary.value = defaultColors.primary;
            if (pickerAccent) pickerAccent.value = defaultColors.accent;
            if (pickerDark) pickerDark.value = defaultColors.dark;
            if (pickerLight) pickerLight.value = defaultColors.light;
            if (pickerCardBg) pickerCardBg.value = defaultColors.cardBg;
            return;
        }

        const css = styleEl.innerHTML;
        const primary = (css.match(/--primary:\s*(#[a-fA-F0-9]{3,8})/i) || [, ''])[1];
        const accent = (css.match(/--accent:\s*(#[a-fA-F0-9]{3,8})/i) || [, ''])[1];
        const dark = (css.match(/--dark:\s*(#[a-fA-F0-9]{3,8})/i) || [, ''])[1];
        const light = (css.match(/--light:\s*(#[a-fA-F0-9]{3,8})/i) || [, ''])[1];
        const cardBg = (css.match(/--card-bg:\s*(#[a-fA-F0-9]{3,8})/i) || [, ''])[1];

        // Update pickers
        if (pickerPrimary && primary) pickerPrimary.value = primary;
        if (pickerAccent && accent) pickerAccent.value = accent;
        if (pickerDark && dark) pickerDark.value = dark;
        if (pickerLight && light) pickerLight.value = light;
        if (pickerCardBg && cardBg) pickerCardBg.value = cardBg;

        // Try to match preset
        let matchedPreset = 'custom';
        for (const [key, preset] of Object.entries(THEME_PRESETS)) {
            if (
                preset.primary.toLowerCase() === (primary || '').toLowerCase() &&
                preset.accent.toLowerCase() === (accent || '').toLowerCase() &&
                preset.dark.toLowerCase() === (dark || '').toLowerCase() &&
                preset.light.toLowerCase() === (light || '').toLowerCase() &&
                preset.cardBg.toLowerCase() === (cardBg || '').toLowerCase()
            ) {
                matchedPreset = key;
                break;
            }
        }

        if (themePresetSelect) {
            const customOpt = themePresetSelect.querySelector('option[value="custom"]');
            if (matchedPreset === 'custom') {
                if (customOpt) customOpt.removeAttribute('disabled');
            } else {
                if (customOpt) customOpt.setAttribute('disabled', 'true');
            }
            themePresetSelect.value = matchedPreset;
        }
    }

    if (manageThemeBtn) {
        manageThemeBtn.addEventListener("click", () => {
            // Close other panels
            document.querySelectorAll('#social-links-panel, #pricing-links-panel, #sections-panel, #filters-panel, #flipbook-panel, #hero-card-panel, #particle-panel').forEach(p => p.style.display = 'none');
            
            const isHidden = themePanel.style.display === 'none';
            themePanel.style.display = isHidden ? 'block' : 'none';
            
            if (isHidden) {
                initAdminThemePanelFromDOM();
            }
        });
    }

    if (changeHeroBgBtn) {
        if (isPortfolioPage) {
            changeHeroBgBtn.style.display = "none";
        } else {
            changeHeroBgBtn.addEventListener("click", () => {
                const heroImg = document.getElementById("hero-bg-image");
                if (heroImg) {
                    openCropModal(heroImg);
                }
            });
        }
    }

    function onPickerChange() {
        const customColors = {
            primary: pickerPrimary.value,
            accent: pickerAccent.value,
            dark: pickerDark.value,
            light: pickerLight.value,
            cardBg: pickerCardBg.value
        };
        
        if (themePresetSelect) {
            const customOpt = themePresetSelect.querySelector('option[value="custom"]');
            if (customOpt) customOpt.removeAttribute('disabled');
            themePresetSelect.value = 'custom';
        }
        
        applyCustomThemeColors(customColors);
    }

    [pickerPrimary, pickerAccent, pickerDark, pickerLight, pickerCardBg].forEach(picker => {
        if (picker) picker.addEventListener('input', onPickerChange);
    });

    if (themePresetSelect) {
        themePresetSelect.addEventListener('change', function () {
            const val = this.value;
            if (val === 'custom') return;
            
            const preset = THEME_PRESETS[val];
            if (preset) {
                if (pickerPrimary) pickerPrimary.value = preset.primary;
                if (pickerAccent) pickerAccent.value = preset.accent;
                if (pickerDark) pickerDark.value = preset.dark;
                if (pickerLight) pickerLight.value = preset.light;
                if (pickerCardBg) pickerCardBg.value = preset.cardBg;
                
                applyCustomThemeColors(preset);
                
                const customOpt = themePresetSelect.querySelector('option[value="custom"]');
                if (customOpt) customOpt.setAttribute('disabled', 'true');
            }
        });
    }

    if (resetThemeBtn) {
        resetThemeBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to revert to the default preset?")) {
                const styleEl = document.getElementById('custom-theme-styles');
                if (styleEl) styleEl.remove();
                
                const defaultColors = THEME_PRESETS['default'];
                if (pickerPrimary) pickerPrimary.value = defaultColors.primary;
                if (pickerAccent) pickerAccent.value = defaultColors.accent;
                if (pickerDark) pickerDark.value = defaultColors.dark;
                if (pickerLight) pickerLight.value = defaultColors.light;
                if (pickerCardBg) pickerCardBg.value = defaultColors.cardBg;
                
                if (themePresetSelect) {
                    themePresetSelect.value = 'default';
                    const customOpt = themePresetSelect.querySelector('option[value="custom"]');
                    if (customOpt) customOpt.setAttribute('disabled', 'true');
                }
                
                window.showToast("Theme reverted to default preset.", "success");
            }
        });
    }

    // 3. Social Icons Logic

    manageSocialBtn.addEventListener("click", () => {
        pricingPanel.style.display = 'none';
        sectionsPanel.style.display = 'none';
        if (filtersPanel) filtersPanel.style.display = 'none';
        if (flipbookPanel) flipbookPanel.style.display = 'none';
        if (themePanel) themePanel.style.display = 'none';
        if (heroCardPanel) heroCardPanel.style.display = 'none';
        const isHidden = socialPanel.style.display === 'none';
        socialPanel.style.display = isHidden ? 'block' : 'none';

        if (isHidden) {
            socialList.innerHTML = '';
            predefinedSocials.forEach(soc => {
                const existingBtn = document.querySelector(`a[data-social="${soc.id}"]`);
                const isEnabled = !!existingBtn;
                let linkVal = existingBtn && existingBtn.getAttribute('href') !== '#' ? existingBtn.getAttribute('href') : '';

                if (soc.id === 'whatsapp' && linkVal) {
                    const waMatch = linkVal.match(/(?:wa\.me\/|phone=)([\d\+\-\s]+)/);
                    if (waMatch) {
                        linkVal = waMatch[1].replace(/[^\d]/g, '').trim();
                    } else if (linkVal.includes('whatsapp.com')) {
                        linkVal = linkVal.replace(/[^\d]/g, '').trim();
                    } else {
                        linkVal = linkVal.replace(/[^\d]/g, '').trim();
                    }
                }

                const div = document.createElement('div');
                div.style.background = '#222';
                div.style.padding = '8px';
                div.style.borderRadius = '4px';
                
                let placeholderText = "URL...";
                if (soc.id === 'whatsapp') {
                    placeholderText = "WhatsApp Number (with country code, e.g., 923001234567)...";
                }
                
                div.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                        <span style="font-size:0.85rem;">${soc.icon} ${soc.name}</span>
                        <input type="checkbox" id="check-${soc.id}" ${isEnabled ? 'checked' : ''}>
                    </div>
                    <input type="text" id="input-${soc.id}" value="${linkVal}" placeholder="${placeholderText}" style="width:100%; padding:4px; border-radius:4px; border:1px solid #555; background:#111; color:#fff; font-size:0.75rem;">
                `;
                socialList.appendChild(div);
            });
        }
    });

    saveSocialBtn.addEventListener("click", () => {
        const socialContainers = document.querySelectorAll('.social-icons');
        if (socialContainers.length > 0) {
            socialContainers.forEach(container => {
                container.innerHTML = ''; // clear old icons
                const isFooter = container.closest('.footer-brand');
                
                predefinedSocials.forEach(soc => {
                    const checkbox = document.getElementById(`check-${soc.id}`);
                    const input = document.getElementById(`input-${soc.id}`);
                    
                    if (checkbox && checkbox.checked) {
                        const newIcon = document.createElement('a');
                        let hrefVal = input.value.trim() || "#";
                        
                        if (soc.id === 'whatsapp' && hrefVal !== '#') {
                            const digits = hrefVal.replace(/[^\d]/g, '');
                            if (digits) {
                                hrefVal = `https://wa.me/${digits}`;
                            } else {
                                hrefVal = '#';
                            }
                        }
                        
                        newIcon.href = hrefVal;
                        newIcon.innerHTML = soc.icon;
                        newIcon.setAttribute("data-social", soc.id);
                        
                        if (isFooter) {
                            newIcon.style.background = "rgba(255,255,255,.1)";
                            newIcon.style.color = "var(--white)";
                        }
                        
                        if (newIcon.href !== "#") {
                            newIcon.setAttribute("target", "_blank");
                        }
                        
                        container.appendChild(newIcon);
                    }
                });
            });
            window.showToast("Social icons applied!", "success");
            socialPanel.style.display = 'none';
        }
    });


    // 4. Pricing Links Logic
    managePricingBtn.addEventListener("click", () => {
        socialPanel.style.display = 'none';
        sectionsPanel.style.display = 'none';
        if (filtersPanel) filtersPanel.style.display = 'none';
        if (flipbookPanel) flipbookPanel.style.display = 'none';
        if (themePanel) themePanel.style.display = 'none';
        if (heroCardPanel) heroCardPanel.style.display = 'none';
        const isHidden = pricingPanel.style.display === 'none';
        pricingPanel.style.display = isHidden ? 'block' : 'none';
        
        if (isHidden) {
            const packages = ['basic', 'standard', 'premium'];
            packages.forEach(pkg => {
                const btn = document.querySelector(`a[data-pricing="${pkg}"]`);
                const input = document.getElementById(`pricing-input-${pkg}`);
                if (btn && input) {
                    input.value = btn.getAttribute('href');
                }
            });
        }
    });

    savePricingBtn.addEventListener("click", () => {
        const packages = ['basic', 'standard', 'premium'];
        packages.forEach(pkg => {
            const val = document.getElementById(`pricing-input-${pkg}`).value.trim();
            if (val !== '') {
                document.querySelectorAll(`a[data-pricing="${pkg}"]`).forEach(btn => {
                    btn.setAttribute('href', val);
                    if (val.startsWith('http')) {
                        btn.setAttribute('target', '_blank');
                    } else {
                        btn.removeAttribute('target');
                    }
                });
            }
        });
        window.showToast("Pricing links updated! Click 'Save to Cloud' when done.", "success");
        pricingPanel.style.display = 'none';
    });

    // 4b. Manage Sections Logic
    manageSectionsBtn.addEventListener("click", () => {
        socialPanel.style.display = 'none';
        pricingPanel.style.display = 'none';
        if (filtersPanel) filtersPanel.style.display = 'none';
        if (flipbookPanel) flipbookPanel.style.display = 'none';
        if (themePanel) themePanel.style.display = 'none';
        if (heroCardPanel) heroCardPanel.style.display = 'none';
        const isHidden = sectionsPanel.style.display === 'none';
        sectionsPanel.style.display = isHidden ? 'block' : 'none';

        if (isHidden) {
            sectionsList.innerHTML = '';
            const sections = document.querySelectorAll('section');
            sections.forEach((sec, idx) => {
                const secName = sec.className.split(' ')[0] || sec.id || `Section ${idx+1}`;
                const isHiddenSec = sec.classList.contains('hidden-section');
                
                const div = document.createElement('div');
                div.style.display = 'flex';
                div.style.justifyContent = 'space-between';
                div.style.alignItems = 'center';
                div.style.background = '#222';
                div.style.padding = '8px';
                div.style.borderRadius = '4px';

                div.innerHTML = `
                    <span style="font-size:0.85rem; text-transform:capitalize;">${secName}</span>
                    <label style="cursor:pointer; display:flex; align-items:center; gap:5px;">
                        <input type="checkbox" ${isHiddenSec ? '' : 'checked'} style="cursor:pointer;">
                        <span style="font-size:0.75rem; color:${isHiddenSec ? '#dc3545' : '#28a745'};">${isHiddenSec ? 'Hidden' : 'Visible'}</span>
                    </label>
                `;

                const checkbox = div.querySelector('input');
                const statusTxt = div.querySelector('span:last-child');
                
                checkbox.addEventListener('change', (e) => {
                    const secId = sec.id || sec.className.split(' ')[0];
                    const navLink = document.querySelector(`.nav-links a[href="#${secId}"]`);
                    
                    if (e.target.checked) {
                        sec.classList.remove('hidden-section');
                        statusTxt.innerText = 'Visible';
                        statusTxt.style.color = '#28a745';
                        if (navLink && navLink.parentElement) navLink.parentElement.style.display = '';
                    } else {
                        sec.classList.add('hidden-section');
                        statusTxt.innerText = 'Hidden';
                        statusTxt.style.color = '#dc3545';
                        if (navLink && navLink.parentElement) navLink.parentElement.style.display = 'none';
                    }
                });
                
                sectionsList.appendChild(div);
            });
        }
    });

    // 4c. Manage Filters Logic
    const filtersPanel = document.getElementById("filters-panel");
    const filtersList = document.getElementById("filters-list");
    const newFilterInput = document.getElementById("new-filter-name");
    const addFilterBtn = document.getElementById("add-filter-btn");

    function renderFilters() {
        filtersList.innerHTML = '';
        const filterContainer = document.querySelector('.portfolio-filters');
        if (!filterContainer) return;

        filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
            const cat  = btn.getAttribute('data-cat');
            const text = btn.innerText.trim();
            const isAll = cat === 'all';

            const div = document.createElement('div');
            div.style.cssText = 'display:flex;align-items:center;gap:5px;background:#222;padding:7px;border-radius:4px;';

            // Editable label
            const labelSpan = document.createElement('span');
            labelSpan.contentEditable = !isAll;
            labelSpan.style.cssText = 'flex:1;font-size:0.82rem;color:#fff;padding:2px 4px;border-radius:3px;' + (!isAll ? 'cursor:text;border:1px dashed #444;' : 'color:#aaa;');
            labelSpan.title = isAll ? '"All" cannot be renamed' : 'Click to rename';
            labelSpan.textContent = text + (isAll ? '' : '  ') ;
            labelSpan.innerHTML = isAll
                ? '<span style="color:#aaa;">All <small style="color:#555;">(all)</small></span>'
                : text + ' <small style="color:#555;font-size:0.65rem;">('+cat+')</small>';

            if (!isAll) {
                labelSpan.addEventListener('blur', () => {
                    // strip small tag for new label
                    var newText = labelSpan.innerText.split('(')[0].trim();
                    if (newText) { btn.innerText = newText; saveFiltersToLocal(); }
                    renderFilters();
                });
            }
            div.appendChild(labelSpan);

            if (!isAll) {
                // Duplicate button
                const dupBtn = document.createElement('button');
                dupBtn.innerHTML = '<i class="fa-solid fa-copy"></i> Dup';
                dupBtn.style.cssText = 'background:#6f42c1;color:#fff;border:none;border-radius:4px;padding:3px 7px;font-size:0.7rem;cursor:pointer;white-space:nowrap;display:inline-flex;align-items:center;gap:4px;';
                dupBtn.title = 'Duplicate this category';
                dupBtn.addEventListener('click', () => {
                    var newLabel = text + ' Copy';
                    var newCat   = cat + '-copy';
                    var dupBtn2  = document.createElement('button');
                    dupBtn2.className = 'filter-btn';
                    dupBtn2.setAttribute('data-cat', newCat);
                    dupBtn2.innerText = newLabel;
                    btn.insertAdjacentElement('afterend', dupBtn2);
                    saveFiltersToLocal();
                    if (window.initSiteLogic) window.initSiteLogic();
                    renderFilters();
                    window.showToast('"' + newLabel + '" duplicated!', 'success');
                });
                div.appendChild(dupBtn);

                // Delete button
                const delBtn = document.createElement('button');
                delBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i> Del';
                delBtn.className = 'admin-toolbar-btn del';
                delBtn.style.cssText = 'position:static;margin:0;';
                delBtn.addEventListener('click', () => {
                    if (confirm('Remove "' + text + '" category?')) {
                        btn.remove();
                        saveFiltersToLocal();
                        renderFilters();
                    }
                });
                div.appendChild(delBtn);
            }

            filtersList.appendChild(div);
        });
    }

    function saveFiltersToLocal() {
        const filterContainer = document.querySelector('.portfolio-filters');
        if (!filterContainer) return;
        const filters = [];
        filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
            filters.push({ cat: btn.getAttribute('data-cat'), text: btn.innerText });
        });
        localStorage.setItem('shared_portfolio_filters', JSON.stringify(filters));
    }

    function loadFiltersFromLocal() {
        const saved = localStorage.getItem('shared_portfolio_filters');
        if (saved) {
            const filterContainer = document.querySelector('.portfolio-filters');
            if (!filterContainer) return;
            try {
                const filters = JSON.parse(saved);
                filterContainer.innerHTML = '';
                filters.forEach(f => {
                    const btn = document.createElement('button');
                    btn.className = 'filter-btn';
                    if (f.cat === 'all') btn.classList.add('active');
                    btn.setAttribute('data-cat', f.cat);
                    btn.innerText = f.text;
                    filterContainer.appendChild(btn);
                });
                if (window.initSiteLogic) window.initSiteLogic();
            } catch (e) {
                console.error("Error loading shared filters", e);
            }
        }
    }
    
    // Load filters on startup
    loadFiltersFromLocal();

    manageFiltersBtn.addEventListener("click", () => {
        socialPanel.style.display = 'none';
        pricingPanel.style.display = 'none';
        sectionsPanel.style.display = 'none';
        if (flipbookPanel) flipbookPanel.style.display = 'none';
        if (themePanel) themePanel.style.display = 'none';
        if (heroCardPanel) heroCardPanel.style.display = 'none';
        const isHidden = filtersPanel.style.display === 'none';
        filtersPanel.style.display = isHidden ? 'block' : 'none';

        if (isHidden) {
            renderFilters();
        }
    });

    addFilterBtn.addEventListener("click", () => {
        const label = newFilterInput.value.trim();
        const idInput = document.getElementById('new-filter-id');
        if (!label) { window.showToast('Enter a category label first.', 'error'); return; }

        const filterContainer = document.querySelector('.portfolio-filters');
        if (!filterContainer) {
            window.showToast("Portfolio section not found on this page.", "error");
            return;
        }

        const catId = (idInput && idInput.value.trim())
            ? idInput.value.trim().toLowerCase().replace(/[^a-z0-9]/g, '-')
            : label.toLowerCase().replace(/[^a-z0-9]/g, '-');

        const newBtn = document.createElement('button');
        newBtn.className = 'filter-btn';
        newBtn.setAttribute('data-cat', catId);
        newBtn.innerText = label;
        filterContainer.appendChild(newBtn);
        newFilterInput.value = '';
        if (idInput) idInput.value = '';

        saveFiltersToLocal();
        if (window.initSiteLogic) window.initSiteLogic();
        renderFilters();
        window.showToast('"' + label + '" category added!', 'success');
    });

 // ═══════════════════════════════════════════
    // 4d. Flipbook Manager Logic
    // ═══════════════════════════════════════════
    const flipbookPanel    = document.getElementById('flipbook-panel');
    const flipbookPageList = document.getElementById('flipbook-pages-list');
    const flipbookAddImg   = document.getElementById('flipbook-add-img');
    const flipbookFileInp  = document.getElementById('flipbook-file-input');
    const flipbookAddUrl   = document.getElementById('flipbook-add-url');
    const flipbookUrlInp   = document.getElementById('flipbook-url-input');
    const manageFlipbookBtn = document.getElementById('manage-flipbook');

    // ── Live-Website "Edit Flipbook" floating button ──────────────────────────────
    // Injects a persistent "📖 Edit Pages" button directly on the book card
    // so the user can click it from the live page without opening admin first.
    function injectFlipbookLiveButton() {
        // Remove any previously injected buttons (avoid duplicates on re-init)
        document.querySelectorAll('.flipbook-live-edit-btn').forEach(b => b.remove());

        document.querySelectorAll('.portfolio-card[data-cat="children"], .portfolio-card[data-flipbook="true"]').forEach((card, idx) => {
            var scene = card.querySelector('.book-scene');
            if (!scene) return;

            var btn = document.createElement('button');
            btn.className = 'flipbook-live-edit-btn';
            btn.innerHTML = '<i class="fa-solid fa-book-open"></i> Edit Flipbook';
            btn.title = 'Open Flipbook Manager';
            btn.style.cssText = [
                'position:absolute',
                'top:12px',
                'left:50%',
                'transform:translateX(-50%)',
                'z-index:9999',
                'background:rgba(32,201,151,0.95)',
                'color:#fff',
                'border:none',
                'border-radius:20px',
                'padding:7px 18px',
                'font-size:0.78rem',
                'font-weight:700',
                'cursor:pointer',
                'box-shadow:0 4px 16px rgba(0,0,0,0.22)',
                'letter-spacing:0.04em',
                'transition:background 0.2s,transform 0.2s',
                'white-space:nowrap'
            ].join(';');
            btn.addEventListener('mouseenter', () => {
                btn.style.background = 'rgba(16,160,120,1)';
                btn.style.transform  = 'translateX(-50%) scale(1.05)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.background = 'rgba(32,201,151,0.95)';
                btn.style.transform  = 'translateX(-50%)';
            });
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                // Set active flipbook to THIS card's index before opening panel
                _activeFlipbookN = idx + 1;
                // Open admin panel
                var panel = document.getElementById('super-admin-panel');
                if (panel) panel.classList.add('active');
                // Close other sub-panels, open flipbook panel
                document.querySelectorAll('#social-links-panel,#pricing-links-panel,#sections-panel,#filters-panel,#theme-panel,#hero-card-panel,#particle-panel').forEach(p => p.style.display = 'none');
                if (flipbookPanel) {
                    flipbookPanel.style.display = 'block';
                    refreshFlipbookSelector(idx + 1); // pre-select this book
                    renderFlipbookPages();
                }
                // Scroll admin panel to flipbook section
                setTimeout(() => {
                    if (flipbookPanel) flipbookPanel.scrollIntoView({behavior:'smooth',block:'nearest'});
                }, 100);
            });

            // Make scene position:relative so button positions correctly
            scene.style.position = 'relative';
            scene.appendChild(btn);
        });
    }


    // ── Book size presets ─────────────────────────────────────────────────────
    var SIZE_PRESETS = {
        '6x9':     { label:'6×9 in',       ratio: 6/9,    icon:'<i class="fa-solid fa-book-open"></i>', desc:'Portrait Novel / Chapter Book' },
        '8.5x8.5': { label:'8.5×8.5 in',   ratio: 1,      icon:'<i class="fa-solid fa-square"></i>', desc:'Square Picture Book' },
        '8.5x11':  { label:'8.5×11 in',    ratio: 8.5/11, icon:'<i class="fa-solid fa-file-lines"></i>', desc:'Tall Portrait / Activity Book' }
    };

    // ── Active flipbook index (which book the admin is currently editing) ──────
    var _activeFlipbookN = 1;

    const flipbookSizeSelect  = document.getElementById('flipbook-size-select');
    const flipbookSizePreview = document.getElementById('flipbook-size-preview');
    const flipbookReplaceInp  = document.getElementById('flipbook-replace-input');
    const flipbookWhichSelect = document.getElementById('flipbook-which-select');
    var   _replacePageIndex   = -1;

    // Populate the "which flipbook" dropdown based on current children cards
    function refreshFlipbookSelector(preferN) {
        if (!flipbookWhichSelect) return;
        var count = document.querySelectorAll('.portfolio-card[data-cat="children"], .portfolio-card[data-flipbook="true"]').length || 1;
        flipbookWhichSelect.innerHTML = '';
        for (var i = 1; i <= count; i++) {
            var opt = document.createElement('option');
            opt.value = i;
            opt.textContent = 'Flipbook ' + i;
            flipbookWhichSelect.appendChild(opt);
        }
        var setTo = preferN || _activeFlipbookN;
        if (setTo > count) setTo = 1;
        flipbookWhichSelect.value = setTo;
        _activeFlipbookN = setTo;
    }
    if (flipbookWhichSelect) {
        flipbookWhichSelect.addEventListener('change', function() {
            _activeFlipbookN = parseInt(this.value) || 1;
            renderFlipbookPages(); // reload page list for the newly selected book
        });
    }

    function getCurrentSize() {
        var scene = document.getElementById('book-scene-' + _activeFlipbookN);
        if (scene && scene.getAttribute('data-size')) {
            return scene.getAttribute('data-size');
        }
        try { return localStorage.getItem('flipbook_size_' + _activeFlipbookN) || '6x9'; } catch(e) { return '6x9'; }
    }
    function saveBookSize(size) {
        var scene = document.getElementById('book-scene-' + _activeFlipbookN);
        if (scene) {
            scene.setAttribute('data-size', size);
        }
        try { localStorage.setItem('flipbook_size_' + _activeFlipbookN, size); } catch(e) {}
        applyBookSizeToScene(size);
    }
    function applyBookSizeToScene(size) {
        // CSS handles sizing via data-size + width/aspect-ratio rules.
        // Target the scene for the ACTIVE flipbook.
        var scene = document.getElementById('book-scene-' + _activeFlipbookN);
        if (scene) scene.setAttribute('data-size', size);
    }
    function renderSizePreview(size) {
        if (!flipbookSizePreview) return;
        var p = SIZE_PRESETS[size];
        if (!p) return;
        var ar = p.ratio;
        var bh = 44, bw = Math.round(bh * ar);
        flipbookSizePreview.innerHTML =
            '<div style="width:' + bw + 'px;height:' + bh + 'px;background:#20c997;border-radius:3px;flex-shrink:0;"></div>' +
            '<span>' + p.icon + ' <strong style="color:#fff;">' + p.label + '</strong> — ' + p.desc + '</span>';
    }

    // Canvas-based auto-fit crop (no stretching, center-crop to ratio)
    function cropToBookRatio(src, size, callback) {
        var ratio = (SIZE_PRESETS[size] || SIZE_PRESETS['6x9']).ratio;
        var img   = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function() {
            var srcR = img.naturalWidth / img.naturalHeight;
            var sx, sy, sw, sh;
            if (srcR > ratio) {
                sh = img.naturalHeight;
                sw = sh * ratio;
                sx = (img.naturalWidth - sw) / 2;
                sy = 0;
            } else {
                sw = img.naturalWidth;
                sh = sw / ratio;
                sx = 0;
                sy = (img.naturalHeight - sh) / 2;
            }
            var outW = Math.round(sw);
            var outH = Math.round(sh);
            
            // Performance optimization: downscale massive page images to max 3840px dimension
            var maxDim = 3840;
            if (outW > maxDim || outH > maxDim) {
                if (outW > outH) {
                    outH = Math.round(maxDim / ratio);
                    outW = maxDim;
                } else {
                    outW = Math.round(maxDim * ratio);
                    outH = maxDim;
                }
            }
            
            var c = document.createElement('canvas');
            c.width = outW; c.height = outH;
            var ctx = c.getContext('2d');
            // PNG transparency fix: don't fill background for PNGs — preserve alpha
            var isPng = /^data:image\/png/i.test(src) || /\.png(\?|$)/i.test(src);
            if (!isPng) { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, outW, outH); }
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
            try {
                // Compress JPEGs to 0.98 quality to preserve original high resolution
                callback(c.toDataURL(isPng ? 'image/png' : 'image/jpeg', isPng ? undefined : 0.98));
            }
            catch(e) { callback(src); }
        };
        img.onerror = function() { callback(src); };
        img.src = src;
    }

    // Get the hidden pages store for the first flipbook card
    function getFlipbookStore() {
        return document.querySelector('[data-flipbook="true"] #flipbook-1-pages') ||
               document.querySelector('[data-flipbook="true"] [id$="-pages"]');
    }


    // localStorage helpers — SINGLE SOURCE OF TRUTH
    function getFlipbookPagesLS(n) {
        // Read DOM store first (master source of truth)
        var s = document.getElementById('flipbook-' + n + '-pages');
        if (s) {
            var imgs = Array.from(s.querySelectorAll('.flipbook-page img')).map(i => i.src).filter(src => src && !src.endsWith('/'));
            if (imgs.length) return imgs;
        }
        // Fallback to localStorage cache
        try {
            var raw = localStorage.getItem('flipbook_pages_' + n);
            if (raw) { var a = JSON.parse(raw); if (Array.isArray(a) && a.length) return a; }
        } catch(e) {}
        return [];
    }
    function setFlipbookPagesLS(n, arr) {
        // Update DOM store first
        var s = document.getElementById('flipbook-' + n + '-pages');
        if (s) {
            s.innerHTML = arr.map((src, i) => `<div class="flipbook-page"><img src="${src}" alt="Page ${i+1}" loading="lazy"></div>`).join('');
        }
        // Sync with localStorage cache safely
        try { localStorage.setItem('flipbook_pages_' + n, JSON.stringify(arr)); } catch(e) {}
    }
    function getFlipbookN() { return _activeFlipbookN; }

    function renderFlipbookPages() {
        if (!flipbookPageList) return;
        flipbookPageList.innerHTML = '';
        var curSize = getCurrentSize();
        if (flipbookSizeSelect) { flipbookSizeSelect.value = curSize; renderSizePreview(curSize); }

        var n = getFlipbookN();
        var pages = getFlipbookPagesLS(n);
        if (!pages.length) {
            flipbookPageList.innerHTML = '<p style="color:#888;font-size:0.75rem;">No pages yet. Add one below!</p>';
            return;
        }
        var ratio = (SIZE_PRESETS[curSize] || SIZE_PRESETS['6x9']).ratio;
        var thW = Math.round(40 * ratio), thH = 40;
        pages.forEach((src, i) => {
            var row = document.createElement('div');
            row.style.cssText = 'display:flex;align-items:center;gap:8px;background:#222;padding:6px;border-radius:4px;';
            row.innerHTML = `
                <img src="${src}" style="width:${thW}px;height:${thH}px;object-fit:cover;border-radius:3px;flex-shrink:0;border:1px solid #444;">
                <span style="flex:1;font-size:0.8rem;color:#ccc;">Page ${i+1}</span>
                <button class="fp-rep" style="background:#17a2b8;color:#fff;border:none;border-radius:4px;padding:4px 8px;font-size:0.72rem;cursor:pointer;display:inline-flex;align-items:center;gap:4px;"><i class="fa-solid fa-pen-to-square"></i> Replace</button>
                <button class="fp-del" style="background:#dc3545;color:#fff;border:none;border-radius:4px;padding:4px 8px;font-size:0.72rem;cursor:pointer;font-weight:700;display:inline-flex;align-items:center;gap:4px;"><i class="fa-solid fa-trash-can"></i> Del</button>
            `;
            // DEL: pure localStorage operation
            row.querySelector('.fp-del').addEventListener('click', () => {
                if (!confirm('Delete Page ' + (i+1) + ' of ' + pages.length + '?')) return;
                var latest = getFlipbookPagesLS(n);
                latest.splice(i, 1);
                setFlipbookPagesLS(n, latest);
                refreshFlipbook();
            });
            // REPLACE: open the preview modal
            row.querySelector('.fp-rep').addEventListener('click', () => openReplaceModal(n, i));
            flipbookPageList.appendChild(row);
        });
    }

    // ── Replace Modal ────────────────────────────────────────────────
    var _rpN   = 1, _rpIdx = -1, _rpUrl = null;
    var rpOvl    = document.getElementById('fp-rp-overlay');
    var rpModal  = document.getElementById('fp-rp-modal');
    var rpTitle  = document.getElementById('fp-rp-title');
    var rpSzLbl  = document.getElementById('fp-rp-szlbl');
    var rpDz     = document.getElementById('fp-rp-dz');
    var rpFileIn = document.getElementById('fp-rp-file');
    var rpCanvas = document.getElementById('fp-rp-canvas');
    var rpPrev   = document.getElementById('fp-rp-preview');
    var rpStatus = document.getElementById('fp-rp-status');
    var rpApply  = document.getElementById('fp-rp-apply');
    var rpCancel = document.getElementById('fp-rp-cancel');
    var rpClose  = document.getElementById('fp-rp-close');

    function openReplaceModal(n, idx) {
        _rpN = n; _rpIdx = idx; _rpUrl = null;
        // Live DOM lookups — elements may have been re-attached after cloud reload
        var _ovl   = document.getElementById('fp-rp-overlay');
        var _mod   = document.getElementById('fp-rp-modal');
        var _title = document.getElementById('fp-rp-title');
        var _szlbl = document.getElementById('fp-rp-szlbl');
        var _prev  = document.getElementById('fp-rp-preview');
        var _stat  = document.getElementById('fp-rp-status');
        var _apply = document.getElementById('fp-rp-apply');
        var _finp  = document.getElementById('fp-rp-file');
        if (!_ovl || !_mod) { console.error('Replace modal not in DOM'); return; }
        var size = getCurrentSize(), p = SIZE_PRESETS[size] || SIZE_PRESETS['6x9'];
        if (_title) _title.textContent = 'Replace Page ' + (idx + 1);
        if (_szlbl) _szlbl.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Auto-fit: ' + p.label + ' &mdash; ' + p.desc;
        if (_prev)  _prev.style.display  = 'none';
        if (_stat)  _stat.style.display  = 'none';
        if (_apply) _apply.style.display = 'none';
        if (_finp)  _finp.value = '';
        _ovl.style.display = _mod.style.display = 'block';
    }
    function closeReplaceModal() {
        var _ovl = document.getElementById('fp-rp-overlay');
        var _mod = document.getElementById('fp-rp-modal');
        if (_ovl) _ovl.style.display = 'none';
        if (_mod) _mod.style.display = 'none';
        _rpUrl = null;
    }
    function processRpImage(src) {
        var _stat  = document.getElementById('fp-rp-status');
        var _prev  = document.getElementById('fp-rp-preview');
        var _apply = document.getElementById('fp-rp-apply');
        var _canvas= document.getElementById('fp-rp-canvas');
        if (_stat)  { _stat.style.display = 'block'; _stat.textContent = 'Cropping & fitting...'; }
        if (_prev)  _prev.style.display  = 'none';
        if (_apply) _apply.style.display = 'none';
        var size = getCurrentSize(), p = SIZE_PRESETS[size] || SIZE_PRESETS['6x9'];
        cropToBookRatio(src, size, function(cropped) {
            _rpUrl = cropped;
            if (!_canvas) return;
            var h = 180, w = Math.round(h * p.ratio);
            _canvas.width = w; _canvas.height = h;
            var ctx = _canvas.getContext('2d');
            var img = new Image();
            img.onload = function() {
                ctx.drawImage(img, 0, 0, w, h);
                var prev2  = document.getElementById('fp-rp-preview');
                var apply2 = document.getElementById('fp-rp-apply');
                var stat2  = document.getElementById('fp-rp-status');
                if (prev2)  prev2.style.display  = 'block';
                if (apply2) apply2.style.display = 'block';
                if (stat2)  stat2.style.display  = 'none';
            };
            img.src = cropped;
        });
    }
    async function applyReplacement() {
        if (!_rpUrl) return;
        
        const applyBtn = document.getElementById('fp-rp-apply');
        const originalText = applyBtn ? applyBtn.innerHTML : 'Apply';
        if (applyBtn) {
            applyBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading...';
            applyBtn.disabled = true;
        }
        
        try {
            let finalUrl = _rpUrl;
            if (_rpUrl.startsWith('data:image/')) {
                const cloudinaryUrl = await uploadToCloudinary(_rpUrl);
                finalUrl = cloudinaryUrl.replace('/image/upload/', '/image/upload/f_auto,q_auto/');
            }
            
            var latest = getFlipbookPagesLS(_rpN);
            if (_rpIdx < 0 || _rpIdx >= latest.length) { window.showToast('Page not found.','error'); return; }
            latest[_rpIdx] = finalUrl;
            setFlipbookPagesLS(_rpN, latest);
            closeReplaceModal();
            refreshFlipbook();
            window.showToast('Page ' + (_rpIdx+1) + ' replaced!', 'success');
        } catch (err) {
            console.error("Flipbook page upload failed:", err);
            window.showToast('Failed to upload page to Cloudinary: ' + err.message, 'error');
        } finally {
            if (applyBtn) {
                applyBtn.innerHTML = originalText;
                applyBtn.disabled = false;
            }
        }
    }
    // Modal events
    if (rpApply)  rpApply.addEventListener('click',  applyReplacement);
    if (rpCancel) rpCancel.addEventListener('click',  closeReplaceModal);
    if (rpClose)  rpClose.addEventListener('click',   closeReplaceModal);
    if (rpOvl)    rpOvl.addEventListener('click',     closeReplaceModal);
    if (rpFileIn) rpFileIn.addEventListener('change', e => {
        var f = e.target.files[0]; if (!f) return;
        var rd = new FileReader(); rd.onload = ev => processRpImage(ev.target.result); rd.readAsDataURL(f);
        e.target.value = '';
    });
    if (rpDz) {
        var rpBrowse = document.getElementById('fp-rp-browse');
        if (rpBrowse) rpBrowse.addEventListener('click', e => { e.stopPropagation(); rpFileIn.click(); });
        rpDz.addEventListener('click', () => rpFileIn.click());
        rpDz.addEventListener('dragover',  e => { e.preventDefault(); rpDz.style.borderColor='#20c997'; rpDz.style.background='#0d2e24'; });
        rpDz.addEventListener('dragleave', () => { rpDz.style.borderColor='#444'; rpDz.style.background='#111'; });
        rpDz.addEventListener('drop', e => {
            e.preventDefault(); rpDz.style.borderColor='#444'; rpDz.style.background='#111';
            var f = e.dataTransfer.files[0]; if (!f || !f.type.startsWith('image/')) return;
            var rd = new FileReader(); rd.onload = ev => processRpImage(ev.target.result); rd.readAsDataURL(f);
        });
    }

    // Replace a page: pure localStorage, no DOM store dependency
    function replaceFlipbookPage(idx, src) {
        var n = getFlipbookN();
        var size = getCurrentSize();
        window.showToast('Uploading page to Cloudinary...', 'info');
        cropToBookRatio(src, size, async function(cropped) {
            try {
                const cloudinaryUrl = await uploadToCloudinary(cropped);
                const optimizedUrl = cloudinaryUrl.replace('/image/upload/', '/image/upload/f_auto,q_auto/');
                var latest = getFlipbookPagesLS(n);
                if (idx < 0 || idx >= latest.length) return;
                latest[idx] = optimizedUrl;
                setFlipbookPagesLS(n, latest);
                refreshFlipbook();
                window.showToast('Page ' + (idx+1) + ' replaced!', 'success');
            } catch (err) {
                console.error("Failed to replace flipbook page:", err);
                window.showToast('Failed to upload page: ' + err.message, 'error');
            }
        });
    }

    function addFlipbookPage(src) {
        var n    = getFlipbookN();
        var size = getCurrentSize();
        window.showToast('Uploading page to Cloudinary...', 'info');
        cropToBookRatio(src, size, async function(cropped) {
            try {
                const cloudinaryUrl = await uploadToCloudinary(cropped);
                const optimizedUrl = cloudinaryUrl.replace('/image/upload/', '/image/upload/f_auto,q_auto/');
                var latest = getFlipbookPagesLS(n);
                latest.push(optimizedUrl);
                setFlipbookPagesLS(n, latest);
                refreshFlipbook();
                window.showToast('Page added & auto-fitted to ' + SIZE_PRESETS[size].label + '!', 'success');
            } catch (err) {
                console.error("Failed to add flipbook page:", err);
                window.showToast('Failed to upload page: ' + err.message, 'error');
            }
        });
    }

    // ── Write current page list to localStorage so BOTH pages stay in sync ─────
    function saveFlipbookToLocalStorage() {
        const store = getFlipbookStore();
        if (!store) return;
        const srcs = Array.from(store.querySelectorAll('.flipbook-page img')).map(i => i.src);
        // Determine which flipbook number this is (1-based) — default 1
        const storeId = store.id || 'flipbook-1-pages';
        const num = (storeId.match(/flipbook-([0-9]+)-pages/) || [,'1'])[1];
        try { localStorage.setItem('flipbook_pages_' + num, JSON.stringify(srcs)); } catch(e) {}
    }

    function refreshFlipbook() {
        if (window.initFlipbooks) {
            // Rebuild the visual flipbook from the updated localStorage data.
            // After initFlipbooks re-creates the DOM, we re-render the admin panel
            // list (150ms later) so all page-reference closures are always fresh.
            setTimeout(() => {
                window.initFlipbooks();
                setTimeout(() => renderFlipbookPages(), 80);
            }, 80);
        }
    }

    manageFlipbookBtn.addEventListener('click', () => {
        const isHidden = flipbookPanel.style.display === 'none';
        document.querySelectorAll('#social-links-panel,#pricing-links-panel,#sections-panel,#filters-panel,#theme-panel,#hero-card-panel,#particle-panel').forEach(p => p.style.display = 'none');
        flipbookPanel.style.display = isHidden ? 'block' : 'none';
        if (isHidden) {
            refreshFlipbookSelector(); // populate dropdown with current book count
            renderFlipbookPages();
        }
    });

    // ── Duplicate Flipbook ────────────────────────────────────────────────────
    function duplicateFlipbook() {
        // Duplicate the ACTIVE flipbook (not always #1)
        var activeN   = _activeFlipbookN;
        var srcs      = getFlipbookPagesLS(activeN);
        if (!srcs.length) { window.showToast('Add pages before duplicating.', 'error'); return; }
        var curSize   = getCurrentSize(); // reads from active N

        var existingCount = document.querySelectorAll('.portfolio-card[data-cat="children"], .portfolio-card[data-flipbook="true"]').length;
        var newN = existingCount + 1;

        // Save to localStorage for the new flipbook
        try {
            localStorage.setItem('flipbook_pages_' + newN, JSON.stringify(srcs));
            localStorage.setItem('flipbook_size_'  + newN, curSize);
        } catch(e) {}

        // Find the portfolio grid and add a new card
        var grid = document.querySelector('.portfolio-grid');
        if (!grid) { window.showToast('Portfolio grid not found on this page.', 'error'); return; }

        // Get info from original card to copy title/description
        var origCard = document.querySelector('.portfolio-card[data-cat="children"], .portfolio-card[data-flipbook="true"]');
        var origTitle = origCard ? (origCard.querySelector('h3')?.innerText || 'Children\'s Book') : 'Children\'s Book';
        var origDesc  = origCard ? (origCard.querySelector('p')?.innerText  || 'Flipbook portfolio item') : 'Flipbook portfolio item';

        var newCard = document.createElement('div');
        newCard.className = 'portfolio-card reveal active';
        newCard.setAttribute('data-cat', 'children');
        newCard.innerHTML = `
            <div class="portfolio-thumb">
                <div id="flipbook-${newN}-pages" style="display:none;">
                    ${srcs.map((src, i) => `<div class="flipbook-page"><img src="${src}" alt="Page ${i+1}" loading="lazy"></div>`).join('')}
                </div>
            </div>
            <div class="portfolio-info">
                <span class="portfolio-badge children">Children Books</span>
                <h3>${origTitle} (Copy)</h3>
                <p>${origDesc}</p>
                <div class="portfolio-tags">
                    <span class="tag">Children</span>
                    <span class="tag">Illustration</span>
                </div>
                <a href="portfolio.html" class="btn btn-outline">View Details</a>
            </div>
        `;
        grid.appendChild(newCard);

        // Build the new flipbook
        setTimeout(() => {
            if (window.initFlipbooks) window.initFlipbooks();
            setTimeout(() => {
                injectFlipbookLiveButton();
                window.showToast('Flipbook duplicated as Flipbook #' + newN + '!', 'success');
            }, 150);
        }, 80);
    }

    var flipbookDupBtn = document.getElementById('flipbook-duplicate');
    if (flipbookDupBtn) flipbookDupBtn.addEventListener('click', duplicateFlipbook);

    // Inject live edit button immediately (and again after 1.5s for safety)
    injectFlipbookLiveButton();
    setTimeout(injectFlipbookLiveButton, 1500);


    // Book size selector
    if (flipbookSizeSelect) {
        flipbookSizeSelect.addEventListener('change', function() {
            var size = this.value;
            saveBookSize(size);
            renderSizePreview(size);
            renderFlipbookPages();
            window.showToast('Book size set to ' + SIZE_PRESETS[size].label + '. New uploads will auto-fit to this ratio.', 'success');
        });
    }

    // Add page via upload
    flipbookAddImg.addEventListener('click', () => flipbookFileInp.click());
    flipbookFileInp.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => addFlipbookPage(ev.target.result);
        reader.readAsDataURL(file);
        e.target.value = '';
    });

    // Replace specific page via upload
    if (flipbookReplaceInp) {
        flipbookReplaceInp.addEventListener('change', e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = ev => replaceFlipbookPage(_replacePageIndex, ev.target.result);
            reader.readAsDataURL(file);
            e.target.value = '';
        });
    }

    // URL button
    flipbookAddUrl.addEventListener('click', () => {
        const url = flipbookUrlInp.value.trim();
        if (!url) return;
        addFlipbookPage(url);
        flipbookUrlInp.value = '';
    });


    addPortfolioBtn.addEventListener("click", () => {
        if (addItemModal) {
            populateAddItemCategories();
            if (addItemTitle) addItemTitle.value = '';
            if (addItemTags) addItemTags.value = '';
            
            // Default to standard layout
            const standardRadio = addItemModal.querySelector('input[name="add-item-layout"][value="standard"]');
            if (standardRadio) {
                standardRadio.checked = true;
            }
            updateAddItemLayoutHighlights();
            
            addItemModal.style.display = 'flex';
        }
    });

    if (confirmAddItemBtn) {
        confirmAddItemBtn.addEventListener('click', () => {
            const grid = document.querySelector('.portfolio-grid');
            if (!grid) {
                window.showToast('Portfolio grid not found on this page.', 'error');
                if (addItemModal) addItemModal.style.display = 'none';
                return;
            }
            
            const cat = addItemCategory ? addItemCategory.value : 'covers';
            const layoutRadio = addItemModal ? addItemModal.querySelector('input[name="add-item-layout"]:checked') : null;
            const layout = layoutRadio ? layoutRadio.value : 'standard';
            const title = addItemTitle ? addItemTitle.value.trim() : '';
            const tagsStr = addItemTags ? addItemTags.value.trim() : '';
            
            if (!title) {
                window.showToast("Please enter a title", "error");
                return;
            }
            
            // Build tags
            let tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [];
            if (tags.length === 0) {
                if (layout === 'flipbook') {
                    tags.push('Children', 'Interior Preview');
                } else if (layout === 'full-width') {
                    tags.push('KDP Interior', 'Book Formatting', 'Layout');
                } else {
                    const capCat = cat.charAt(0).toUpperCase() + cat.slice(1);
                    tags.push(capCat);
                }
            }
            const tagsHTML = tags.map(t => `<span>${t}</span>`).join('');
            
            // Create the card element
            const newItem = document.createElement('div');
            newItem.className = 'portfolio-card reveal active';
            newItem.setAttribute('data-cat', cat.toLowerCase());
            
            if (layout === 'full-width') {
                newItem.setAttribute('data-layout', 'full-width');
                newItem.innerHTML = `
                    <div class="portfolio-thumb">
                        <img src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=1200&h=675&fit=crop" alt="${title}">
                    </div>
                    <div class="portfolio-info">
                        <div class="tags">${tagsHTML}</div>
                        <h3>${title}</h3>
                    </div>
                `;
            } else if (layout === 'flipbook') {
                newItem.setAttribute('data-flipbook', 'true');
                
                // Get next flipbook number
                const existingCount = document.querySelectorAll('.portfolio-card[data-cat="children"], .portfolio-card[data-flipbook="true"]').length;
                const newN = existingCount + 1;
                
                const defaultFlipbookPages = [
                    "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=800&fit=crop",
                    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=800&fit=crop",
                    "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&h=800&fit=crop",
                    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=800&fit=crop",
                    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=800&fit=crop",
                    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&h=800&fit=crop",
                    "https://images.unsplash.com/photo-1474932430478-367dbb6832c1?w=600&h=800&fit=crop",
                    "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&h=800&fit=crop"
                ];
                
                try {
                    localStorage.setItem('flipbook_pages_' + newN, JSON.stringify(defaultFlipbookPages));
                    localStorage.setItem('flipbook_size_' + newN, '6x9');
                } catch(e) {}
                
                newItem.innerHTML = `
                    <div class="portfolio-thumb"></div>
                    <div id="flipbook-${newN}-pages" style="display: none;">
                        ${defaultFlipbookPages.map((src, i) => `<div class="flipbook-page"><img src="${src}" alt="Page ${i+1}" loading="lazy"></div>`).join('')}
                    </div>
                    <div class="portfolio-info">
                        <div class="tags">${tagsHTML}</div>
                        <h3>${title}</h3>
                    </div>
                `;
            } else {
                newItem.innerHTML = `
                    <div class="portfolio-thumb">
                        <img src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop" alt="${title}">
                    </div>
                    <div class="portfolio-info">
                        <div class="tags">${tagsHTML}</div>
                        <h3>${title}</h3>
                    </div>
                `;
            }
            
            // Prepend new item
            grid.insertBefore(newItem, grid.firstChild);
            
            if (isEditMode) {
                setupContainerToolbar(newItem);
                newItem.querySelectorAll('h3, span').forEach(el => {
                    el.setAttribute("data-admin-text", "true");
                    el.setAttribute("contenteditable", "true");
                });
            }
            
            // If it's a flipbook, initialize it
            if (layout === 'flipbook') {
                setTimeout(() => {
                    if (window.initFlipbooks) window.initFlipbooks();
                    setTimeout(() => {
                        injectFlipbookLiveButton();
                        window.showToast("New flipbook added! Click live edit button to customize pages.", "success");
                    }, 150);
                }, 80);
            } else {
                window.showToast("New portfolio item added! Hover to edit.", "success");
            }
            
            // Rebuild covers marquee
            if (window.initCoversMarquee) window.initCoversMarquee();
            
            // Re-trigger the active filter so display visibility rules are reapplied
            const activeFilter = document.querySelector('.filter-btn.active');
            if (activeFilter) activeFilter.click();
            
            if (addItemModal) addItemModal.style.display = 'none';
        });
    }

    // 5b. Add Review Logic
    addReviewBtn.addEventListener("click", () => {
        const track = document.querySelector('.testimonial-track');
        if (track) {
            const newReview = document.createElement('div');
            newReview.className = 'testimonial-card';
            newReview.innerHTML = `
                <div class="testimonial-inner">
                    <div class="testimonial-stars"><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i></div>
                    <p>"Write your amazing client review here. This is a placeholder text to show you how it looks!"</p>
                    <div class="testimonial-author">
                        <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop" alt="Client Name">
                        <div>
                            <h4>Client Name</h4>
                            <span>CEO, Company</span>
                        </div>
                    </div>
                </div>
            `;
            if (window.testimonialSwiper) {
                window.testimonialSwiper.destroy(true, true);
            }
            
            track.insertBefore(newReview, track.children[0]);
            
            if (isEditMode) {
                newReview.querySelectorAll('p, h4, span').forEach(el => {
                    el.setAttribute("data-admin-text", "true");
                    el.setAttribute("contenteditable", "true");
                });
                const img = newReview.querySelector('img');
                img.classList.add('editable-container');
                setupContainerToolbar(img);
            }
            
            if (window.initSiteLogic) window.initSiteLogic();
            window.showToast("New review added! Swipe to see it.", "success");
        }
    });

    // 5c. Add Pricing Package Logic
    if (addPackageBtn) {
        addPackageBtn.addEventListener("click", () => {
            const grid = document.querySelector('.pricing-grid');
            if (grid) {
                const newCard = document.createElement('div');
                newCard.className = 'pricing-card reveal active';
                newCard.innerHTML = `
                    <h3>New Package</h3>
                    <div class="price">$99<small>/project</small></div>
                    <ul>
                        <li>Feature 1</li>
                        <li>Feature 2</li>
                        <li>Feature 3</li>
                    </ul>
                    <a href="#contact" data-pricing="custom" class="btn btn-outline" style="width:100%;justify-content:center;border-color:rgba(255,255,255,.3);color:var(--white)">Get Started</a>
                `;
                grid.appendChild(newCard);
                
                if (isEditMode) {
                    setupContainerToolbar(newCard);
                    newCard.querySelectorAll('h3, .price, li, a.btn').forEach(el => {
                        el.setAttribute("data-admin-text", "true");
                        el.setAttribute("contenteditable", "true");
                    });
                }
                
                window.showToast("New package added! Hover to edit/delete, or click text to customize.", "success");
            }
        });
    }

    // 6. Setup Editable Elements
    function setupEditableElements() {
        const textSelectors = 'h1, h2, h3, h4, h5, h6, p, .hero-badge, .float-badge, .skill-tag, .about-float-tag, .stat .num, .stat span, .marquee-track span, .timeline-item span.year, .price, .faq-q, .contact-detail span, .footer-bottom, a.btn, a.learn-more, a.read-more, .tags span, .logo, .footer-col a, .pricing-card li';
        
        document.querySelectorAll(textSelectors).forEach(el => {
            if (!el.closest('#super-admin-panel') && !el.closest('#admin-crop-modal') && !el.closest('#admin-blog-modal') && !el.closest('#admin-hero-bg-modal')) {
                // If it's a link, setup the toolbar so they can edit the URL too
                if (el.tagName === 'A' && !el.hasAttribute('data-pricing')) {
                    setupContainerToolbar(el);
                }
                
                // Allow the entire element (even with mixed children) to be edited
                el.setAttribute("data-admin-text", "true");
            }
        });

        document.querySelectorAll('.service-card, .portfolio-card, .pricing-card, .faq-item, .testimonial-card, img:not(.portfolio-thumb img)').forEach(el => {
            if (!el.closest('.editable-container') && !el.closest('#super-admin-panel') && !el.closest('#admin-crop-modal') && !el.closest('#admin-blog-modal') && !el.closest('#admin-hero-bg-modal')) {
                setupContainerToolbar(el);
            }
        });
    }

    function setupContainerToolbar(el) {
        let container = el;
        
        if (el.tagName === 'IMG' && el.closest('.hero-img-wrap')) {
            container = el.closest('.hero-img-wrap'); 
        } else if (el.tagName === 'IMG' && el.closest('.about-img-wrap')) {
            container = el.closest('.about-img-wrap');
        } else if (el.tagName === 'IMG' && el.closest('.blog-thumb, .testimonial-author')) {
            container = el.closest('.blog-thumb, .testimonial-author');
        } else if (el.closest('.service-card')) { container = el.closest('.service-card'); }
        else if (el.closest('.portfolio-card')) { container = el.closest('.portfolio-card'); }
        else if (el.closest('.pricing-card')) { container = el.closest('.pricing-card'); }
        else if (el.closest('.testimonial-card')) { container = el.closest('.testimonial-card'); }
        else if (el.closest('.faq-item')) { container = el.closest('.faq-item'); }

        if (container.tagName === 'IMG') {
            container = container.parentElement;
        }

        // Skip adding toolbars to dedicated panel elements
        if (container.hasAttribute('data-pricing')) return;

        if (!container.classList.contains('editable-container') && !container.closest('#super-admin-panel')) {
            container.classList.add('editable-container');
            
            const toolbar = document.createElement('div');
            toolbar.className = 'admin-element-toolbar';
            toolbar.setAttribute('contenteditable', 'false'); 
            
            const delBtn = document.createElement('button');
            delBtn.className = 'admin-toolbar-btn del';
            delBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
            delBtn.title = 'Delete Element';
            delBtn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); container.remove(); };
            toolbar.appendChild(delBtn);

            // Toggle show on home page button for portfolio cards
            const portCard = container.closest('.portfolio-card') || (container.classList.contains('portfolio-card') ? container : null);
            if (portCard) {
                const homeToggleBtn = document.createElement('button');
                homeToggleBtn.className = 'admin-toolbar-btn home-toggle';
                
                const isHiddenOnHome = portCard.getAttribute('data-show-on-home') === 'false';
                if (isHiddenOnHome) {
                    homeToggleBtn.innerHTML = '<i class="fa-solid fa-house-chimney-crack"></i>';
                    homeToggleBtn.title = 'Show on Home Page';
                    homeToggleBtn.style.color = '#ff4a4a';
                } else {
                    homeToggleBtn.innerHTML = '<i class="fa-solid fa-house"></i>';
                    homeToggleBtn.title = 'Hide from Home Page';
                    homeToggleBtn.style.color = '#28a745';
                }
                
                homeToggleBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const currentState = portCard.getAttribute('data-show-on-home') === 'false';
                    if (currentState) {
                        portCard.removeAttribute('data-show-on-home');
                        homeToggleBtn.innerHTML = '<i class="fa-solid fa-house"></i>';
                        homeToggleBtn.title = 'Hide from Home Page';
                        homeToggleBtn.style.color = '#28a745';
                        window.showToast("Visible on Home Page. Save changes to make it live.", "success");
                    } else {
                        portCard.setAttribute('data-show-on-home', 'false');
                        homeToggleBtn.innerHTML = '<i class="fa-solid fa-house-chimney-crack"></i>';
                        homeToggleBtn.title = 'Show on Home Page';
                        homeToggleBtn.style.color = '#ff4a4a';
                        window.showToast("Hidden from Home Page. Save changes to make it live.", "success");
                    }
                };
                toolbar.appendChild(homeToggleBtn);

                // Move to Top Button (Make Latest)
                const moveTopBtn = document.createElement('button');
                moveTopBtn.className = 'admin-toolbar-btn move-top';
                moveTopBtn.innerHTML = '<i class="fa-solid fa-circle-arrow-up"></i>';
                moveTopBtn.title = 'Move to Top (Make Latest)';
                moveTopBtn.style.color = '#F4B400';
                
                moveTopBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const grid = portCard.parentElement;
                    if (grid) {
                        grid.insertBefore(portCard, grid.firstChild);
                        window.showToast("Moved item to the top. Save changes to make it live.", "success");
                    }
                };
                toolbar.appendChild(moveTopBtn);
            }

            const linkTarget = container.tagName === 'A' ? container : container.querySelector('a');
            if (linkTarget) {
                const editLinkBtn = document.createElement('button');
                editLinkBtn.className = 'admin-toolbar-btn edit-link';
                editLinkBtn.innerHTML = '<i class="fa-solid fa-link"></i>';
                editLinkBtn.title = 'Edit Link URL';
                editLinkBtn.onclick = (e) => { 
                    e.preventDefault(); e.stopPropagation();
                    const newHref = prompt("Enter new Link URL:", linkTarget.getAttribute('href') || '#');
                    if (newHref !== null) {
                        linkTarget.setAttribute('href', newHref);
                        if(newHref.startsWith('http')) linkTarget.setAttribute('target', '_blank');
                    }
                };
                toolbar.appendChild(editLinkBtn);
            }

            const imgTarget = container.tagName === 'IMG' ? container : container.querySelector('img');
            if (imgTarget) {
                const editImgBtn = document.createElement('button');
                editImgBtn.className = 'admin-toolbar-btn edit-img';
                editImgBtn.innerHTML = '<i class="fa-solid fa-image"></i>';
                editImgBtn.title = 'Edit Image / Crop';
                editImgBtn.onclick = (e) => { 
                    e.preventDefault(); e.stopPropagation();
                    openCropModal(imgTarget);
                };
                toolbar.appendChild(editImgBtn);
            }

            container.appendChild(toolbar);
        }
    }

    // 7. Image Crop Modal Logic
    function openCropModal(imgElement) {
        currentImageTarget = imgElement;
        cropModal.classList.add('active');
        fileInput.value = '';
        urlInput.value = '';
        if(cropperInstance) { cropperInstance.destroy(); cropperInstance = null; }
        previewImage.src = imgElement.src;
        previewImage.style.display = 'block';
        
        // Auto-select the default aspect ratio button
        let defaultRatio = "NaN"; // Default to Free crop
        if (imgElement) {
            if (imgElement.closest('.portfolio-card')) {
                const card = imgElement.closest('.portfolio-card');
                const cat = card.getAttribute('data-cat');
                if (cat === 'covers') {
                    defaultRatio = "0.6667"; // Book cover 2:3
                } else if (cat === 'formatting') {
                    defaultRatio = "1.7778"; // Landscape 16:9
                } else {
                    defaultRatio = "1"; // Square for other standard portfolio items
                }
            } else if (imgElement.closest('.testimonial-img')) {
                defaultRatio = "1"; // 1:1 for testimonial avatars
            }
        }
        
        const aspectButtons = cropModal.querySelectorAll('.crop-aspect-btn');
        aspectButtons.forEach(btn => {
            if (btn.getAttribute('data-ratio') === defaultRatio) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        initCropper();
    }

    function closeCropModalHandler() {
        cropModal.classList.remove('active');
        if(cropperInstance) { cropperInstance.destroy(); cropperInstance = null; }
        currentImageTarget = null;
    }

    closeCropBtn.addEventListener('click', closeCropModalHandler);
    cancelCropBtn.addEventListener('click', closeCropModalHandler);

    // Setup click handlers for the aspect ratio buttons in the crop modal
    const aspectButtons = cropModal.querySelectorAll('.crop-aspect-btn');
    aspectButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            aspectButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const rawRatio = btn.getAttribute('data-ratio');
            const newRatio = rawRatio === 'NaN' ? NaN : parseFloat(rawRatio);
            
            if (cropperInstance) {
                cropperInstance.setAspectRatio(newRatio);
            }
        });
    });

    function initCropper() {
        if(cropperInstance) cropperInstance.destroy();
        
        let targetRatio = NaN;
        const activeBtn = cropModal.querySelector('.crop-aspect-btn.active');
        if (activeBtn) {
            const rawRatio = activeBtn.getAttribute('data-ratio');
            if (rawRatio !== 'NaN') {
                targetRatio = parseFloat(rawRatio);
            }
        }

        if(typeof Cropper !== 'undefined') {
            cropperInstance = new Cropper(previewImage, {
                aspectRatio: targetRatio,
                viewMode: 1,
                dragMode: 'move',
                autoCropArea: 1,
                restore: false,
                guides: true,
                center: true,
                highlight: false,
                cropBoxMovable: true,
                cropBoxResizable: true,
                toggleDragModeOnDblclick: false,
            });
        }
    }

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                previewImage.src = event.target.result;
                initCropper();
            };
            reader.readAsDataURL(file);
        }
    });

    urlInput.addEventListener('change', (e) => {
        if (e.target.value.trim() !== '') {
            previewImage.src = e.target.value.trim();
            previewImage.onload = initCropper; 
        }
    });

    saveCropBtn.addEventListener('click', async () => {
        if (!currentImageTarget) return;

        const originalText = saveCropBtn.innerHTML;
        saveCropBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading...';
        saveCropBtn.disabled = true;

        try {
            if (cropperInstance) {
                let canvas = cropperInstance.getCroppedCanvas({
                    imageSmoothingEnabled: true,
                    imageSmoothingQuality: 'high'
                });
                if (canvas) {
                    // Determine target parameters based on the currentImageTarget
                    let maxDim = 2560;
                    let quality = 0.90;
                    if (currentImageTarget.closest('.portfolio-card[data-cat="covers"], .portfolio-card[data-cat="paperback-covers"]')) {
                        maxDim = 2560;
                        quality = 0.98;
                    } else if (currentImageTarget.closest('.portfolio-card[data-cat="children"], .portfolio-card[data-flipbook="true"], .flipbook-page')) {
                        maxDim = 2560;
                        quality = 0.98;
                    } else if (currentImageTarget.closest('.testimonial-card, .testimonial-author, .testimonial-img')) {
                        maxDim = 800;
                        quality = 0.98;
                    }
                    
                    // Downscale if canvas dimensions exceed maxDim
                    let w = canvas.width;
                    let h = canvas.height;
                    if (w > maxDim || h > maxDim) {
                        const ratio = w / h;
                        if (w > h) {
                            w = maxDim;
                            h = Math.round(maxDim / ratio);
                        } else {
                            h = maxDim;
                            w = Math.round(maxDim * ratio);
                        }
                        
                        const resizedCanvas = document.createElement('canvas');
                        resizedCanvas.width = w;
                        resizedCanvas.height = h;
                        const resizedCtx = resizedCanvas.getContext('2d');
                        resizedCtx.imageSmoothingEnabled = true;
                        resizedCtx.imageSmoothingQuality = 'high';
                        
                        const isPng = false; // Always use JPEG for cropped images to save space
                        if (!isPng) {
                            resizedCtx.fillStyle = '#ffffff';
                            resizedCtx.fillRect(0, 0, w, h);
                        }
                        resizedCtx.drawImage(canvas, 0, 0, w, h);
                        canvas = resizedCanvas;
                    }
                    
                    const isPng = false; // Always use JPEG for cropped images to save space
                    const mimeType = isPng ? 'image/png' : 'image/jpeg';
                    const outQuality = isPng ? undefined : quality;
                    const base64Data = canvas.toDataURL(mimeType, outQuality);
                    
                    const cloudinaryUrl = await uploadToCloudinary(base64Data);
                    const optimizedUrl = cloudinaryUrl.replace('/image/upload/', '/image/upload/f_auto,q_auto/');
                    
                    updateImageSource(currentImageTarget, optimizedUrl);
                }
            } else {
                // Bypass cropper, but still compress!
                const src = previewImage.src;
                if (src && src.startsWith('data:image/')) {
                    let maxDim = 2560;
                    let quality = 0.90;
                    if (currentImageTarget.closest('.portfolio-card[data-cat="covers"], .portfolio-card[data-cat="paperback-covers"]')) {
                        maxDim = 2560;
                        quality = 0.98;
                    } else if (currentImageTarget.closest('.portfolio-card[data-cat="children"], .portfolio-card[data-flipbook="true"], .flipbook-page')) {
                        maxDim = 2560;
                        quality = 0.98;
                    } else if (currentImageTarget.closest('.testimonial-card, .testimonial-author, .testimonial-img')) {
                        maxDim = 800;
                        quality = 0.98;
                    }
                    const compressed = await compressBase64Image(src, maxDim, quality);
                    const cloudinaryUrl = await uploadToCloudinary(compressed);
                    const optimizedUrl = cloudinaryUrl.replace('/image/upload/', '/image/upload/f_auto,q_auto/');
                    
                    updateImageSource(currentImageTarget, optimizedUrl);
                } else {
                    currentImageTarget.src = src;
                    currentImageTarget.removeAttribute('data-optimized');
                    if (currentImageTarget.hasAttribute('srcset')) {
                        currentImageTarget.removeAttribute('srcset');
                    }
                }
            }
            window.showToast('Image uploaded and optimized!', 'success');
            closeCropModalHandler();
        } catch (err) {
            console.error("Failed to save crop:", err);
            window.showToast('Failed to upload image: ' + err.message, 'error');
        } finally {
            saveCropBtn.innerHTML = originalText;
            saveCropBtn.disabled = false;
        }
    });

    // 8. Edit Mode Toggle
    toggleBtn.addEventListener("click", () => {
        isEditMode = !isEditMode;
        if (isEditMode) {
            document.body.classList.add("edit-mode");
            toggleBtn.innerText = "Disable Edit Mode";
            toggleBtn.style.background = "#dc3545";
            setupEditableElements();
            document.querySelectorAll('[data-admin-text="true"]').forEach(el => el.setAttribute("contenteditable", "true"));
            
            // Re-trigger active filter to hide marquee and show covers in standard grid
            const activeFilter = document.querySelector('.filter-btn.active');
            if (activeFilter) activeFilter.click();
        } else {
            document.body.classList.remove("edit-mode");
            toggleBtn.innerText = "Enable Edit Mode";
            toggleBtn.style.background = "#184C3A";
            document.querySelectorAll('[contenteditable="true"]').forEach(el => el.removeAttribute("contenteditable"));
            hideTextToolbar();
            
            // Rebuild covers marquee from the current state of grid covers
            if (window.initCoversMarquee) window.initCoversMarquee();
            
            // Re-trigger active filter to restore marquee display
            const activeFilter = document.querySelector('.filter-btn.active');
            if (activeFilter) activeFilter.click();
        }
    });

    document.body.addEventListener('click', (e) => {
        if (isEditMode && e.target.tagName === 'A' && !e.target.classList.contains('admin-toolbar-btn') && !e.target.closest('#admin-text-toolbar')) {
            e.preventDefault();
        }
    });

    // Floating Text Formatting Toolbar Logic
    let currentTextTarget = null;
    let savedRange = null;

    function saveSelection() {
        if (!currentTextTarget) return;
        const sel = window.getSelection();
        if (sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            if (currentTextTarget.contains(range.commonAncestorContainer)) {
                savedRange = range.cloneRange();
            }
        }
    }

    function restoreSelection() {
        if (savedRange) {
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(savedRange);
        }
    }

    // Save selection whenever selection changes in the document
    document.addEventListener('selectionchange', () => {
        if (isEditMode && currentTextTarget) {
            saveSelection();
        }
    });

    function initTextToolbarEvents() {
        if (!textToolbar) return;

        // Position & Show Toolbar when focused/clicked on editable text
        document.body.addEventListener('focusin', (e) => {
            if (!isEditMode) return;
            const target = e.target;
            if (target.hasAttribute('contenteditable') && target.getAttribute('contenteditable') === 'true') {
                currentTextTarget = target;
                savedRange = null; // Clear previous saved selection
                showTextToolbar(target);
            }
        });

        document.body.addEventListener('click', (e) => {
            if (!isEditMode) return;
            
            // Check if clicking inside an editable element
            const target = e.target.closest('[contenteditable="true"]');
            if (target) {
                currentTextTarget = target;
                showTextToolbar(target);
                return;
            }

            // Hide if clicking outside toolbar and not editing
            if (!e.target.closest('#admin-text-toolbar')) {
                hideTextToolbar();
            }
        });

        // Reposition toolbar when scrolling
        window.addEventListener('scroll', () => {
            if (isEditMode && currentTextTarget) {
                showTextToolbar(currentTextTarget);
            }
        }, { passive: true });

        // Handle color preset click (using mousedown to prevent blur)
        textToolbar.querySelectorAll('.text-color-preset').forEach(btn => {
            btn.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!currentTextTarget) return;
                const color = btn.getAttribute('data-color');
                applyTextColor(color);
            });
        });

        // Handle custom color picker input
        if (textColorPicker) {
            textColorPicker.parentElement.addEventListener('mousedown', (e) => {
                saveSelection();
            });

            textColorPicker.addEventListener('input', (e) => {
                if (!currentTextTarget) return;
                applyTextColor(e.target.value);
            });
            
            textColorPicker.addEventListener('change', (e) => {
                if (!currentTextTarget) return;
                applyTextColor(e.target.value);
            });
        }

        // Handle style buttons
        const boldBtn = textToolbar.querySelector('.bold-btn');
        if (boldBtn) {
            boldBtn.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!currentTextTarget) return;
                
                restoreSelection();
                const selection = window.getSelection();
                if (selection && selection.toString().length > 0 && currentTextTarget.contains(selection.anchorNode)) {
                    document.execCommand('bold', false, null);
                } else {
                    const currentWeight = currentTextTarget.style.fontWeight;
                    currentTextTarget.style.fontWeight = (currentWeight === 'bold' || currentWeight === '700') ? 'normal' : 'bold';
                }
                saveSelection();
            });
        }

        const italicBtn = textToolbar.querySelector('.italic-btn');
        if (italicBtn) {
            italicBtn.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!currentTextTarget) return;
                
                restoreSelection();
                const selection = window.getSelection();
                if (selection && selection.toString().length > 0 && currentTextTarget.contains(selection.anchorNode)) {
                    document.execCommand('italic', false, null);
                } else {
                    const currentStyle = currentTextTarget.style.fontStyle;
                    currentTextTarget.style.fontStyle = (currentStyle === 'italic') ? 'normal' : 'italic';
                }
                saveSelection();
            });
        }

        // Handle Font Size buttons
        const fsIncBtn = textToolbar.querySelector('.fs-inc-btn');
        if (fsIncBtn) {
            fsIncBtn.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!currentTextTarget) return;
                
                const currentSize = window.getComputedStyle(currentTextTarget).fontSize;
                const sizeVal = parseFloat(currentSize);
                currentTextTarget.style.fontSize = (sizeVal + 2) + 'px';
                
                currentTextTarget.querySelectorAll('*').forEach(child => {
                    const childSize = window.getComputedStyle(child).fontSize;
                    const childVal = parseFloat(childSize);
                    child.style.fontSize = (childVal + 2) + 'px';
                });
            });
        }

        const fsDecBtn = textToolbar.querySelector('.fs-dec-btn');
        if (fsDecBtn) {
            fsDecBtn.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!currentTextTarget) return;
                
                const currentSize = window.getComputedStyle(currentTextTarget).fontSize;
                const sizeVal = parseFloat(currentSize);
                currentTextTarget.style.fontSize = Math.max(8, sizeVal - 2) + 'px';
                
                currentTextTarget.querySelectorAll('*').forEach(child => {
                    const childSize = window.getComputedStyle(child).fontSize;
                    const childVal = parseFloat(childSize);
                    child.style.fontSize = Math.max(8, childVal - 2) + 'px';
                });
            });
        }

        // Handle Reset styles button
        const resetTextBtn = textToolbar.querySelector('.reset-text-btn');
        if (resetTextBtn) {
            resetTextBtn.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!currentTextTarget) return;
                
                // Clear inline style overrides
                currentTextTarget.style.color = '';
                currentTextTarget.style.webkitTextFillColor = '';
                currentTextTarget.style.fontSize = '';
                currentTextTarget.style.fontWeight = '';
                currentTextTarget.style.fontStyle = '';
                
                // Clear children styles
                currentTextTarget.querySelectorAll('*').forEach(child => {
                    child.style.color = '';
                    child.style.webkitTextFillColor = '';
                    child.style.fontSize = '';
                    child.style.fontWeight = '';
                    child.style.fontStyle = '';
                });
                
                restoreSelection();
                const selection = window.getSelection();
                if (selection && selection.toString().length > 0 && currentTextTarget.contains(selection.anchorNode)) {
                    document.execCommand('removeFormat', false, null);
                }
                
                updateToolbarState(currentTextTarget);
                saveSelection();
                window.showToast("Text styles reset to defaults.", "info");
            });
        }
    }

    function showTextToolbar(el) {
        if (!textToolbar) return;
        
        textToolbar.style.display = 'flex';
        
        // Calculate position
        const rect = el.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
        
        const toolbarHeight = textToolbar.offsetHeight || 42;
        const toolbarWidth = textToolbar.offsetWidth || 340;
        
        let top = rect.top + scrollTop - toolbarHeight - 12;
        let left = rect.left + scrollLeft + (rect.width - toolbarWidth) / 2;
        
        if (top < scrollTop + 10) {
            top = rect.bottom + scrollTop + 12; // place below if not enough room above
        }
        if (left < 10) left = 10;
        const maxLeft = window.innerWidth - toolbarWidth - 10;
        if (left > maxLeft) left = maxLeft;
        
        textToolbar.style.top = top + 'px';
        textToolbar.style.left = left + 'px';
        
        updateToolbarState(el);
    }

    function hideTextToolbar() {
        if (textToolbar) {
            textToolbar.style.display = 'none';
        }
        currentTextTarget = null;
        savedRange = null;
    }

    function applyTextColor(color) {
        if (!currentTextTarget) return;
        
        restoreSelection();
        
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0 && currentTextTarget.contains(selection.anchorNode)) {
            // Apply to selected text only
            document.execCommand('foreColor', false, color);
            
            // Clean webkitTextFillColor inside selected nodes to ensure custom color applies
            currentTextTarget.querySelectorAll('font, span').forEach(el => {
                el.style.webkitTextFillColor = 'inherit';
            });
        } else {
            // Apply to whole element and WebkitTextFill override (for gradients)
            currentTextTarget.style.color = color;
            currentTextTarget.style.webkitTextFillColor = color;
            
            // Clean nested children's custom colors to cascade nicely
            currentTextTarget.querySelectorAll('*').forEach(child => {
                child.style.color = color;
                child.style.webkitTextFillColor = 'inherit';
            });
        }
        
        saveSelection();
    }

    function updateToolbarState(el) {
        if (!textColorPicker) return;
        const computedStyle = window.getComputedStyle(el);
        const currentColor = el.style.color || computedStyle.color;
        textColorPicker.value = rgbToHex(currentColor) || '#ffffff';
    }

    function rgbToHex(rgb) {
        if (!rgb) return null;
        if (rgb.startsWith('#')) return rgb;
        const match = rgb.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
        if (match) {
            return "#" + ("0" + parseInt(match[1], 10).toString(16)).slice(-2) +
                         ("0" + parseInt(match[2], 10).toString(16)).slice(-2) +
                         ("0" + parseInt(match[3], 10).toString(16)).slice(-2);
        }
        return null;
    }

    // Helper to asynchronously compress base64 images
    function compressBase64Image(base64Str, maxDim, quality) {
        return new Promise((resolve) => {
            if (!base64Str || !base64Str.startsWith('data:image/')) {
                return resolve(base64Str);
            }
            // Ignore very small images (e.g. spacer or loading gif)
            if (base64Str.length < 10000) {
                return resolve(base64Str);
            }

            // Safety fallback: if compression doesn't complete in 8 seconds, proceed with original image
            const timeoutId = setTimeout(() => {
                console.warn("Image compression timed out, proceeding with original source.");
                resolve(base64Str);
            }, 8000);

            const img = new Image();
            img.onload = function() {
                clearTimeout(timeoutId);
                try {
                    let w = img.naturalWidth;
                    let h = img.naturalHeight;
                    if (w === 0 || h === 0) {
                        return resolve(base64Str);
                    }
                    
                    // If within bounds, do NOT compress or redraw, return original
                    // EXCEPT if it is a large PNG (over ~750KB) where we want to convert to JPEG to save space
                    const isPng = base64Str.startsWith('data:image/png');
                    const isLargePng = isPng && base64Str.length > 1000000;
                    
                    if (w <= maxDim && h <= maxDim && !isLargePng) {
                        return resolve(base64Str);
                    }
                    
                    const ratio = w / h;
                    if (w > h) {
                        w = maxDim;
                        h = Math.round(maxDim / ratio);
                    } else {
                        h = maxDim;
                        w = Math.round(maxDim * ratio);
                    }
                    
                    const canvas = document.createElement('canvas');
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    
                    let outMime = isPng ? 'image/png' : 'image/jpeg';
                    let outQuality = isPng ? undefined : 0.98;
                    
                    if (isLargePng) {
                        outMime = 'image/jpeg';
                        outQuality = 0.98;
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, w, h);
                    } else if (!isPng) {
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, w, h);
                    }
                    
                    ctx.drawImage(img, 0, 0, w, h);
                    
                    const compressedData = canvas.toDataURL(outMime, outQuality);
                    if (compressedData.length < base64Str.length) {
                        resolve(compressedData);
                    } else {
                        resolve(base64Str);
                    }
                } catch (e) {
                    console.error("Compression error:", e);
                    resolve(base64Str);
                }
            };
            img.onerror = function() {
                clearTimeout(timeoutId);
                resolve(base64Str);
            };
            img.src = base64Str;
        });
    }

    // 9. Saving and Loading via Supabase
    saveBtn.addEventListener("click", async () => {
        const wasEditMode = isEditMode;
        if (wasEditMode) toggleBtn.click(); 
        
        if (socialPanel.style.display !== 'none') manageSocialBtn.click();
        if (pricingPanel.style.display !== 'none') managePricingBtn.click();
        if (heroCardPanel && heroCardPanel.style.display !== 'none') manageHeroCardBtn.click();

        const originalText = saveBtn.innerText;
        saveBtn.innerText = "Optimizing Images...";
        saveBtn.disabled = true;

        try {
            // Upload all base64 images in the live DOM to Cloudinary
            const allImgs = Array.from(document.querySelectorAll('img'));
            const uploadPromises = allImgs.map(async (img) => {
                try {
                    const src = img.src;
                    if (src && src.startsWith('data:image/')) {
                        let maxDim = 2560;
                        let quality = 0.98;
                        if (img.closest('.portfolio-card[data-cat="covers"], .portfolio-card[data-cat="paperback-covers"]')) {
                            maxDim = 2560;
                            quality = 0.98;
                        } else if (img.closest('.portfolio-card[data-cat="children"], .portfolio-card[data-flipbook="true"], .flipbook-page')) {
                            maxDim = 2560;
                            quality = 0.98;
                        } else if (img.closest('.testimonial-card, .testimonial-author, .testimonial-img')) {
                            maxDim = 800;
                            quality = 0.98;
                        }
                        const compressed = await compressBase64Image(src, maxDim, quality);
                        const cloudinaryUrl = await uploadToCloudinary(compressed);
                        const optimizedUrl = cloudinaryUrl.replace('/image/upload/', '/image/upload/f_auto,q_auto/');
                        
                        img.src = optimizedUrl;
                        img.setAttribute('data-optimized', 'true');
                    }
                } catch (innerErr) {
                    console.error("Failed to upload image in save sweep:", innerErr);
                }
            });
            await Promise.all(uploadPromises);

            saveBtn.innerText = "Saving to Cloud...";

            const clone = document.body.cloneNode(true);
            const adminElements = clone.querySelectorAll('#super-admin-panel, #admin-crop-modal, #admin-add-item-modal, #admin-text-toolbar, #admin-blog-modal, #admin-hero-bg-modal');
            adminElements.forEach(el => el.remove());

            clone.querySelectorAll('.admin-element-toolbar').forEach(tb => tb.remove());
            clone.querySelectorAll('.editable-container').forEach(c => c.classList.remove('editable-container'));
            clone.querySelectorAll('.flipbook-live-edit-btn').forEach(b => b.remove());
            clone.querySelectorAll('#fp-rp-overlay, #fp-rp-modal').forEach(el => el.remove()); // don't save replace modal
            clone.querySelectorAll('#custom-toast').forEach(toast => toast.remove()); // don't save stuck toast messages
            
            // Ensure background animation elements are not serialized into database
            clone.querySelectorAll('#bg-anim-wrap, #bg-anim-canvas, #bg-hero-glow').forEach(el => el.remove());

            // Clean up marquee container from clone so it's not serialized
            clone.querySelectorAll('.covers-marquee-container, .paperback-covers-marquee-container, .formatting-marquee-container').forEach(el => el.remove());
            
            // Reset inline display style on all grid cards so they save in a neutral state
            clone.querySelectorAll('.portfolio-grid .portfolio-card').forEach(card => {
                card.style.display = '';
            });

            // Ensure scroll reveal elements do not save with 'active' class
            clone.querySelectorAll('.reveal').forEach(el => el.classList.remove('active'));

            if (!window.supabaseClient) throw new Error("Database not connected");
            const pageId = isPortfolioPage ? 'portfolio' : 'index';
            const otherPageId = isPortfolioPage ? 'index' : 'portfolio';
            
            // 1. Save current page content (primary upload)
            const { error } = await window.supabaseClient
                .from('site_content')
                .upsert({ id: pageId, html_content: clone.innerHTML })
                
            if (error) throw error;

            // Save custom theme style cache
            try {
                const styleEl = document.getElementById('custom-theme-styles');
                if (styleEl) {
                    localStorage.setItem('supabase_cached_theme', styleEl.innerHTML);
                }
            } catch (cacheErr) {
                console.warn("Local storage cache quota exceeded on save theme:", cacheErr);
            }
            
            // 2. Synchronize portfolio grid and filters to the other page (AWAITED)
            saveBtn.innerText = "Syncing other page...";
            try {
                const { data: otherData, error: otherFetchError } = await window.supabaseClient
                    .from('site_content')
                    .select('html_content')
                    .eq('id', otherPageId)
                    .single();

                if (otherFetchError) {
                    console.error("Failed to fetch other page for sync:", otherFetchError);
                } else if (otherData && otherData.html_content) {
                    const parser = new DOMParser();
                    const otherDoc = parser.parseFromString(otherData.html_content, 'text/html');
                    
                    const otherGrid = otherDoc.querySelector('.portfolio-grid');
                    const otherFilters = otherDoc.querySelector('.portfolio-filters');
                    
                    const currentGrid = clone.querySelector('.portfolio-grid');
                    const currentFilters = clone.querySelector('.portfolio-filters');
                    
                    let needsUpdate = false;
                    if (otherGrid && currentGrid) {
                        otherGrid.innerHTML = currentGrid.innerHTML;
                        needsUpdate = true;
                    }
                    if (otherFilters && currentFilters) {
                        otherFilters.innerHTML = currentFilters.innerHTML;
                        needsUpdate = true;
                    }

                    // Synchronize custom theme styles to the other page
                    const otherThemeStyle = otherDoc.querySelector('#custom-theme-styles');
                    const currentThemeStyle = clone.querySelector('#custom-theme-styles');
                    
                    if (currentThemeStyle) {
                        if (otherThemeStyle) {
                            otherThemeStyle.innerHTML = currentThemeStyle.innerHTML;
                        } else {
                            const newStyle = otherDoc.createElement('style');
                            newStyle.id = 'custom-theme-styles';
                            newStyle.innerHTML = currentThemeStyle.innerHTML;
                            otherDoc.body.insertBefore(newStyle, otherDoc.body.firstChild);
                        }
                        needsUpdate = true;
                    } else if (otherThemeStyle) {
                        otherThemeStyle.remove();
                        needsUpdate = true;
                    }
                    
                    if (needsUpdate) {
                        const updatedOtherHtml = otherDoc.body.innerHTML;
                        const { error: otherUpdateError } = await window.supabaseClient
                            .from('site_content')
                            .upsert({ id: otherPageId, html_content: updatedOtherHtml });
                        if (otherUpdateError) throw otherUpdateError;
                    }
                }
            } catch (syncErr) {
                console.error("Background portfolio sync failed:", syncErr);
                window.showToast("Warning: Changes saved, but sync to other page failed.", "warning");
            }

            // Notify user that the save succeeded across both pages!
            window.showToast("Changes saved successfully across both pages!", "success");
            
            window.hasUnsavedChanges = false;
            const saveBtnEl = document.getElementById('save-changes');
            if (saveBtnEl) {
                saveBtnEl.style.boxShadow = ''; // Clear highlight
            }

        } catch (err) {
            console.error(err);
            window.showToast("Failed to save to cloud: " + err.message, "error");
        } finally {
            saveBtn.innerText = "Save to Cloud (Supabase)";
            saveBtn.disabled = false;
            if (wasEditMode) toggleBtn.click(); 
        }
    });

    // ── Hero Card Settings Logic ──────────────────────────────────────────────
    function initHeroCardPanelFromDOM() {
        const heroContent = document.querySelector('.hero-content');
        if (!heroContent) return;

        // Sync hero card visibility toggle
        const visToggle = document.getElementById('hero-card-visible-toggle');
        const heroSection = document.querySelector('.hero');
        if (visToggle && heroSection) {
            visToggle.checked = !heroSection.classList.contains('hero-card-hidden');
        }

        let heroHeight = 650;
        let heroPadding = 60;
        if (heroSection) {
            const hStyle = heroSection.style;
            const heightStr = hStyle.getPropertyValue('--hero-min-height');
            if (heightStr && heightStr !== 'auto') {
                heroHeight = parseInt(heightStr) || 650;
            } else {
                const computed = window.getComputedStyle(heroSection);
                heroHeight = parseInt(computed.minHeight || computed.height) || 650;
            }
            const paddingStr = hStyle.getPropertyValue('--hero-padding-y');
            if (paddingStr) {
                heroPadding = parseInt(paddingStr) || 60;
            } else {
                const computed = window.getComputedStyle(heroSection);
                heroPadding = parseInt(computed.paddingTop) || 60;
            }
        }

        if (heroHeightSlider) {
            heroHeightSlider.value = heroHeight;
            if (heroHeightVal) heroHeightVal.innerText = heroHeight + 'px';
        }
        if (heroPaddingSlider) {
            heroPaddingSlider.value = heroPadding;
            if (heroPaddingVal) heroPaddingVal.innerText = heroPadding + 'px';
        }

        const style = heroContent.style;
        const offsetX = parseInt(style.getPropertyValue('--hero-card-offset-x') || '-40');
        const offsetY = parseInt(style.getPropertyValue('--hero-card-offset-y') || '0');
        const cardWidthStr = style.getPropertyValue('--hero-card-width') || '720px';
        const cardWidth = parseInt(cardWidthStr) || 720;
        const cardRadius = parseInt(style.getPropertyValue('--hero-card-radius') || '8');
        const cardBlur = parseInt(style.getPropertyValue('--hero-card-blur') || '16');
        const cardOpacity = parseFloat(style.getPropertyValue('--hero-card-opacity') || '0.45');

        if (heroOffsetX) {
            heroOffsetX.value = offsetX;
            heroOffsetXVal.innerText = offsetX + 'px';
        }
        if (heroOffsetY) {
            heroOffsetY.value = offsetY;
            heroOffsetYVal.innerText = offsetY + 'px';
        }
        if (heroCardWidthSlider) {
            heroCardWidthSlider.value = cardWidth;
            heroCardWidthVal.innerText = cardWidth + 'px';
        }
        const cardPaddingStr = style.getPropertyValue('--hero-card-padding') || '30px';
        const cardPadding = parseInt(cardPaddingStr) || 30;

        const cardHeightStr = style.getPropertyValue('--hero-card-height') || 'auto';
        const isHeightAuto = cardHeightStr === 'auto' || !cardHeightStr;
        const cardHeight = isHeightAuto ? 400 : (parseInt(cardHeightStr) || 400);

        if (heroCardPaddingSlider) {
            heroCardPaddingSlider.value = cardPadding;
            heroCardPaddingVal.innerText = cardPadding + 'px';
        }
        if (heroCardHeightSlider) {
            heroCardHeightSlider.value = cardHeight;
            heroCardHeightVal.innerText = isHeightAuto ? 'auto' : cardHeight + 'px';
            heroCardHeightSlider.disabled = isHeightAuto;
        }
        if (heroCardHeightAuto) {
            heroCardHeightAuto.checked = isHeightAuto;
        }
        if (heroCardRadiusSlider) {
            heroCardRadiusSlider.value = cardRadius;
            heroCardRadiusVal.innerText = cardRadius + 'px';
        }
        if (heroCardBlurSlider) {
            heroCardBlurSlider.value = cardBlur;
            heroCardBlurVal.innerText = cardBlur + 'px';
        }
        if (heroCardOpacitySlider) {
            heroCardOpacitySlider.value = Math.round(cardOpacity * 100);
            heroCardOpacityVal.innerText = cardOpacity;
        }

        const canvasEl = document.getElementById('hero-bg-canvas');
        let videoZoom = 1.0;
        if (canvasEl) {
            videoZoom = parseFloat(canvasEl.getAttribute('data-zoom')) || 1.0;
        }
        if (heroVideoZoomSlider) {
            heroVideoZoomSlider.value = Math.round(videoZoom * 100);
            if (heroVideoZoomVal) heroVideoZoomVal.innerText = videoZoom.toFixed(1) + 'x';
        }



        // Update content inputs
        const badgeEl = document.querySelector('.hero-badge');
        if (badgeEl && heroBadgeTextInput) {
            const clone = badgeEl.cloneNode(true);
            const span = clone.querySelector('span');
            if (span) span.remove();
            heroBadgeTextInput.value = clone.innerText.trim();
        }
        const titleEl = document.querySelector('.hero-content h1');
        if (titleEl && heroTitleTextInput) {
            heroTitleTextInput.value = titleEl.innerHTML.trim();
        }
        const descEl = document.querySelector('.hero-content p');
        if (descEl && heroDescTextInput) {
            heroDescTextInput.value = descEl.innerHTML.trim();
        }
        const expEl = document.querySelector('.float-badge.exp');
        if (expEl && heroExpTextInput) {
            heroExpTextInput.value = expEl.innerHTML.trim();
        }
        const projEl = document.querySelector('.float-badge.proj');
        if (projEl && heroProjTextInput) {
            heroProjTextInput.value = projEl.innerHTML.trim();
        }

        if (expEl && heroShowExpCheckbox) {
            heroShowExpCheckbox.checked = expEl.style.display !== 'none';
        }
        if (projEl && heroShowProjCheckbox) {
            heroShowProjCheckbox.checked = projEl.style.display !== 'none';
        }

        renderHeroButtonsList();
        renderHeroTagsList();
        if (typeof initFloatingCardsPanelLogic === 'function') {
            initFloatingCardsPanelLogic();
        }
    }

    function updateHeroCardStyle(prop, val) {
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.style.setProperty(prop, val);
        }
    }



    if (heroOffsetX) {
        heroOffsetX.addEventListener('input', (e) => {
            const val = e.target.value;
            heroOffsetXVal.innerText = val + 'px';
            updateHeroCardStyle('--hero-card-offset-x', val + 'px');
        });
    }
    if (heroOffsetY) {
        heroOffsetY.addEventListener('input', (e) => {
            const val = e.target.value;
            heroOffsetYVal.innerText = val + 'px';
            updateHeroCardStyle('--hero-card-offset-y', val + 'px');
        });
    }
    if (heroCardWidthSlider) {
        heroCardWidthSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            heroCardWidthVal.innerText = val + 'px';
            updateHeroCardStyle('--hero-card-width', val + 'px');
        });
    }
    if (heroCardPaddingSlider) {
        heroCardPaddingSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            if (heroCardPaddingVal) heroCardPaddingVal.innerText = val + 'px';
            updateHeroCardStyle('--hero-card-padding', val + 'px');
            window.hasUnsavedChanges = true;
            const saveBtnEl = document.getElementById('save-changes');
            if (saveBtnEl) {
                saveBtnEl.style.boxShadow = '0 0 15px #20c997';
            }
        });
    }
    if (heroCardHeightSlider) {
        heroCardHeightSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            if (heroCardHeightVal) heroCardHeightVal.innerText = val + 'px';
            updateHeroCardStyle('--hero-card-height', val + 'px');
            window.hasUnsavedChanges = true;
            const saveBtnEl = document.getElementById('save-changes');
            if (saveBtnEl) {
                saveBtnEl.style.boxShadow = '0 0 15px #20c997';
            }
        });
    }
    if (heroCardHeightAuto) {
        heroCardHeightAuto.addEventListener('change', (e) => {
            const checked = e.target.checked;
            if (checked) {
                if (heroCardHeightSlider) heroCardHeightSlider.disabled = true;
                if (heroCardHeightVal) heroCardHeightVal.innerText = 'auto';
                updateHeroCardStyle('--hero-card-height', 'auto');
            } else {
                if (heroCardHeightSlider) {
                    heroCardHeightSlider.disabled = false;
                    const val = heroCardHeightSlider.value;
                    if (heroCardHeightVal) heroCardHeightVal.innerText = val + 'px';
                    updateHeroCardStyle('--hero-card-height', val + 'px');
                }
            }
            window.hasUnsavedChanges = true;
            const saveBtnEl = document.getElementById('save-changes');
            if (saveBtnEl) {
                saveBtnEl.style.boxShadow = '0 0 15px #20c997';
            }
        });
    }
    if (heroCardRadiusSlider) {
        heroCardRadiusSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            heroCardRadiusVal.innerText = val + 'px';
            updateHeroCardStyle('--hero-card-radius', val + 'px');
        });
    }
    if (heroCardBlurSlider) {
        heroCardBlurSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            heroCardBlurVal.innerText = val + 'px';
            updateHeroCardStyle('--hero-card-blur', val + 'px');
        });
    }
    if (heroCardOpacitySlider) {
        heroCardOpacitySlider.addEventListener('input', (e) => {
            const val = e.target.value / 100;
            heroCardOpacityVal.innerText = val;
            updateHeroCardStyle('--hero-card-opacity', val);
        });
    }

    if (heroHeightSlider) {
        heroHeightSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            if (heroHeightVal) heroHeightVal.innerText = val + 'px';
            const heroSection = document.querySelector('.hero');
            if (heroSection) {
                heroSection.style.setProperty('--hero-min-height', val + 'px');
            }
            window.dispatchEvent(new Event('resize'));
            window.hasUnsavedChanges = true;
            const saveBtnEl = document.getElementById('save-changes');
            if (saveBtnEl) {
                saveBtnEl.style.boxShadow = '0 0 15px #20c997';
            }
        });
    }
    if (heroPaddingSlider) {
        heroPaddingSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            if (heroPaddingVal) heroPaddingVal.innerText = val + 'px';
            const heroSection = document.querySelector('.hero');
            if (heroSection) {
                heroSection.style.setProperty('--hero-padding-y', val + 'px');
            }
            window.dispatchEvent(new Event('resize'));
            window.hasUnsavedChanges = true;
            const saveBtnEl = document.getElementById('save-changes');
            if (saveBtnEl) {
                saveBtnEl.style.boxShadow = '0 0 15px #20c997';
            }
        });
    }
    if (heroVideoZoomSlider) {
        heroVideoZoomSlider.addEventListener('input', (e) => {
            const zoomVal = e.target.value / 100;
            if (heroVideoZoomVal) heroVideoZoomVal.innerText = zoomVal.toFixed(1) + 'x';
            
            const canvasEl = document.getElementById('hero-bg-canvas');
            if (canvasEl) {
                canvasEl.setAttribute('data-zoom', zoomVal);
            }
            const fallbackImg = document.getElementById('hero-bg-image');
            if (fallbackImg) {
                fallbackImg.style.transform = `scale(${zoomVal})`;
            }
            window.hasUnsavedChanges = true;
            const saveBtnEl = document.getElementById('save-changes');
            if (saveBtnEl) {
                saveBtnEl.style.boxShadow = '0 0 15px #20c997';
            }
        });
    }

    // Hero Card Visibility Toggle
    const heroCardVisibleToggle = document.getElementById('hero-card-visible-toggle');
    if (heroCardVisibleToggle) {
        heroCardVisibleToggle.addEventListener('change', (e) => {
            const heroSection = document.querySelector('.hero');
            if (heroSection) {
                if (e.target.checked) {
                    heroSection.classList.remove('hero-card-hidden');
                } else {
                    heroSection.classList.add('hero-card-hidden');
                }
            }
        });
    }

    if (heroBadgeTextInput) {
        heroBadgeTextInput.addEventListener('input', (e) => {
            const badgeEl = document.querySelector('.hero-badge');
            if (badgeEl) {
                const span = badgeEl.querySelector('span');
                badgeEl.innerHTML = '';
                if (span) badgeEl.appendChild(span);
                badgeEl.appendChild(document.createTextNode(' ' + e.target.value));
            }
        });
    }
    if (heroTitleTextInput) {
        heroTitleTextInput.addEventListener('input', (e) => {
            const titleEl = document.querySelector('.hero-content h1');
            if (titleEl) {
                titleEl.innerHTML = e.target.value;
            }
        });
    }
    if (heroDescTextInput) {
        heroDescTextInput.addEventListener('input', (e) => {
            const descEl = document.querySelector('.hero-content p');
            if (descEl) {
                descEl.innerHTML = e.target.value;
            }
        });
    }
    if (heroExpTextInput) {
        heroExpTextInput.addEventListener('input', (e) => {
            const expEl = document.querySelector('.float-badge.exp');
            if (expEl) {
                expEl.innerHTML = e.target.value;
            }
        });
    }
    if (heroProjTextInput) {
        heroProjTextInput.addEventListener('input', (e) => {
            const projEl = document.querySelector('.float-badge.proj');
            if (projEl) {
                projEl.innerHTML = e.target.value;
            }
        });
    }

    if (heroShowExpCheckbox) {
        heroShowExpCheckbox.addEventListener('change', (e) => {
            const expEl = document.querySelector('.float-badge.exp');
            if (expEl) {
                expEl.style.display = e.target.checked ? '' : 'none';
            }
        });
    }
    if (heroShowProjCheckbox) {
        heroShowProjCheckbox.addEventListener('change', (e) => {
            const projEl = document.querySelector('.float-badge.proj');
            if (projEl) {
                projEl.style.display = e.target.checked ? '' : 'none';
            }
        });
    }

    function renderHeroButtonsList() {
        if (!heroButtonsEditorList) return;
        heroButtonsEditorList.innerHTML = '';
        
        const heroBtnsContainer = document.querySelector('.hero-btns');
        if (!heroBtnsContainer) {
            heroButtonsEditorList.innerHTML = '<p style="font-size:0.75rem; color:#f44336;">.hero-btns container not found</p>';
            return;
        }

        const buttons = heroBtnsContainer.querySelectorAll('a');
        buttons.forEach((btn, idx) => {
            const labelText = btn.innerText.replace(/↗|→/g, '').trim();
            const hrefVal = btn.getAttribute('href') || '';
            const btnClass = btn.className || '';

            const itemDiv = document.createElement('div');
            itemDiv.style.cssText = 'border:1px solid #444; padding:8px; border-radius:6px; background:#222; display:flex; flex-direction:column; gap:6px; margin-bottom:4px;';
            itemDiv.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:0.72rem; color:#888; font-weight:bold;">Button #${idx + 1}</span>
                    <button class="admin-btn danger btn-delete-hero-btn" data-index="${idx}" style="padding:2px 6px; font-size:0.7rem; margin:0;"><i class="fa-solid fa-trash"></i></button>
                </div>
                <input type="text" class="btn-text-input" data-index="${idx}" value="${labelText}" placeholder="Button Text" style="padding:4px; font-size:0.75rem; background:#111; color:#fff; border:1px solid #555; border-radius:4px;">
                <input type="text" class="btn-href-input" data-index="${idx}" value="${hrefVal}" placeholder="Link / Href" style="padding:4px; font-size:0.75rem; background:#111; color:#fff; border:1px solid #555; border-radius:4px;">
                <select class="btn-class-input" data-index="${idx}" style="padding:4px; font-size:0.75rem; background:#111; color:#fff; border:1px solid #555; border-radius:4px;">
                    <option value="btn btn-primary" ${btnClass.includes('btn-primary') ? 'selected' : ''}>Primary (Dark Green)</option>
                    <option value="btn btn-accent" ${btnClass.includes('btn-accent') ? 'selected' : ''}>Accent (Gold)</option>
                    <option value="btn btn-outline" ${btnClass.includes('btn-outline') ? 'selected' : ''}>Outline</option>
                </select>
            `;
            heroButtonsEditorList.appendChild(itemDiv);
        });

        // Add event listeners
        heroButtonsEditorList.querySelectorAll('.btn-text-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const idx = parseInt(e.target.dataset.index);
                const val = e.target.value;
                const targetBtn = heroBtnsContainer.querySelectorAll('a')[idx];
                if (targetBtn) {
                    const arrow = targetBtn.querySelector('.btn-arrow') ? targetBtn.querySelector('.btn-arrow').outerHTML : '';
                    targetBtn.innerHTML = val + (arrow ? ' ' + arrow : '');
                }
            });
        });

        heroButtonsEditorList.querySelectorAll('.btn-href-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const idx = parseInt(e.target.dataset.index);
                const val = e.target.value;
                const targetBtn = heroBtnsContainer.querySelectorAll('a')[idx];
                if (targetBtn) {
                    targetBtn.setAttribute('href', val);
                }
            });
        });

        heroButtonsEditorList.querySelectorAll('.btn-class-input').forEach(select => {
            select.addEventListener('change', (e) => {
                const idx = parseInt(e.target.dataset.index);
                const val = e.target.value;
                const targetBtn = heroBtnsContainer.querySelectorAll('a')[idx];
                if (targetBtn) {
                    targetBtn.className = val + ' editable-container';
                }
            });
        });

        heroButtonsEditorList.querySelectorAll('.btn-delete-hero-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.dataset.index);
                const targetBtn = heroBtnsContainer.querySelectorAll('a')[idx];
                if (targetBtn) {
                    targetBtn.remove();
                    renderHeroButtonsList();
                }
            });
        });
    }

    if (heroAddButtonBtn) {
        heroAddButtonBtn.addEventListener('click', () => {
            const heroBtnsContainer = document.querySelector('.hero-btns');
            if (!heroBtnsContainer) {
                window.showToast("Hero buttons container not found.", "error");
                return;
            }
            
            const newBtn = document.createElement('a');
            newBtn.setAttribute('href', '#contact');
            newBtn.className = 'btn btn-primary editable-container';
            newBtn.setAttribute('data-admin-text', 'true');
            newBtn.innerHTML = 'New Button <span class="btn-arrow">→</span>';
            
            heroBtnsContainer.appendChild(newBtn);
            
            renderHeroButtonsList();
            
            if (isEditMode) {
                setupEditableElements();
                document.querySelectorAll('[data-admin-text="true"]').forEach(el => el.setAttribute("contenteditable", "true"));
            }
        });
    }

    function renderHeroTagsList() {
        if (!heroTagsEditorList) return;
        heroTagsEditorList.innerHTML = '';

        const skillTagsContainer = document.querySelector('.skill-tags');
        if (!skillTagsContainer) {
            heroTagsEditorList.innerHTML = '<p style="font-size:0.75rem; color:#f44336;">.skill-tags container not found</p>';
            return;
        }

        const tags = skillTagsContainer.querySelectorAll('.skill-tag');
        tags.forEach((tag, idx) => {
            const iconEl = tag.querySelector('i');
            const iconClass = iconEl ? iconEl.className : '';
            const labelText = tag.innerText.trim();

            const itemDiv = document.createElement('div');
            itemDiv.style.cssText = 'border:1px solid #444; padding:8px; border-radius:6px; background:#222; display:flex; flex-direction:column; gap:6px; margin-bottom:4px;';
            itemDiv.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:0.72rem; color:#888; font-weight:bold;">Tag #${idx + 1}</span>
                    <button class="admin-btn danger btn-delete-hero-tag" data-index="${idx}" style="padding:2px 6px; font-size:0.7rem; margin:0;"><i class="fa-solid fa-trash"></i></button>
                </div>
                <input type="text" class="tag-text-input" data-index="${idx}" value="${labelText}" placeholder="Tag Text" style="padding:4px; font-size:0.75rem; background:#111; color:#fff; border:1px solid #555; border-radius:4px;">
                <input type="text" class="tag-icon-input" data-index="${idx}" value="${iconClass}" placeholder="Icon CSS e.g. fa-solid fa-star" style="padding:4px; font-size:0.75rem; background:#111; color:#fff; border:1px solid #555; border-radius:4px;">
            `;
            heroTagsEditorList.appendChild(itemDiv);
        });

        // Add event listeners
        heroTagsEditorList.querySelectorAll('.tag-text-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const idx = parseInt(e.target.dataset.index);
                const val = e.target.value;
                const targetTag = skillTagsContainer.querySelectorAll('.skill-tag')[idx];
                if (targetTag) {
                    const iconHTML = targetTag.querySelector('i') ? targetTag.querySelector('i').outerHTML : '';
                    targetTag.innerHTML = iconHTML + ' ' + val;
                }
            });
        });

        heroTagsEditorList.querySelectorAll('.tag-icon-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const idx = parseInt(e.target.dataset.index);
                const val = e.target.value;
                const targetTag = skillTagsContainer.querySelectorAll('.skill-tag')[idx];
                if (targetTag) {
                    const iconEl = targetTag.querySelector('i');
                    if (iconEl) {
                        iconEl.className = val;
                    } else if (val) {
                        const newIcon = document.createElement('i');
                        newIcon.className = val;
                        targetTag.insertBefore(newIcon, targetTag.firstChild);
                    }
                }
            });
        });

        heroTagsEditorList.querySelectorAll('.btn-delete-hero-tag').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.dataset.index);
                const targetTag = skillTagsContainer.querySelectorAll('.skill-tag')[idx];
                if (targetTag) {
                    targetTag.remove();
                    renderHeroTagsList();
                }
            });
        });
    }

    if (heroAddTagBtn) {
        heroAddTagBtn.addEventListener('click', () => {
            const skillTagsContainer = document.querySelector('.skill-tags');
            if (!skillTagsContainer) {
                window.showToast("Skill tags container not found.", "error");
                return;
            }

            const newTag = document.createElement('span');
            newTag.className = 'skill-tag editable-container';
            newTag.setAttribute('data-admin-text', 'true');
            newTag.innerHTML = '<i class="fa-solid fa-circle-check"></i> New Skill';

            skillTagsContainer.appendChild(newTag);

            renderHeroTagsList();

            if (isEditMode) {
                setupEditableElements();
                document.querySelectorAll('[data-admin-text="true"]').forEach(el => el.setAttribute("contenteditable", "true"));
            }
        });
    }

    // Drag-and-drop repositioning logic for hero float cards and main card in edit mode
    let activeDragCard = null;
    let activeDragMainCard = null;
    let dragStartX = 0, dragStartY = 0;
    let initialLeftPercent = 0, initialTopPercent = 0;
    let initialOffsetX = 0, initialOffsetY = 0;

    document.addEventListener('mousedown', (e) => {
        if (!isEditMode) return;

        // Skip if clicked inside any admin panel/modals/forms
        if (e.target.closest('#super-admin-panel') || 
            e.target.closest('#admin-crop-modal') || 
            e.target.closest('#admin-add-item-modal') || 
            e.target.closest('#admin-text-toolbar') || 
            e.target.closest('#admin-blog-modal') || 
            e.target.closest('#admin-hero-bg-modal') ||
            e.target.closest('#float-card-form')) {
            return;
        }

        // 1. Check for floating card first
        const floatCard = e.target.closest('.hero-float-card');
        if (floatCard) {
            activeDragCard = floatCard;
            dragStartX = e.clientX;
            dragStartY = e.clientY;

            const parent = floatCard.offsetParent || document.querySelector('.hero');
            const parentWidth = parent.clientWidth || window.innerWidth;
            const parentHeight = parent.clientHeight || window.innerHeight;

            const styleLeft = floatCard.style.left;
            const styleTop = floatCard.style.top;

            if (styleLeft && styleLeft.endsWith('%')) {
                initialLeftPercent = parseFloat(styleLeft);
            } else {
                initialLeftPercent = (floatCard.offsetLeft / parentWidth) * 100;
            }

            if (styleTop && styleTop.endsWith('%')) {
                initialTopPercent = parseFloat(styleTop);
            } else {
                initialTopPercent = (floatCard.offsetTop / parentHeight) * 100;
            }

            floatCard.style.right = 'auto';
            floatCard.style.bottom = 'auto';
            floatCard.style.left = initialLeftPercent + '%';
            floatCard.style.top = initialTopPercent + '%';
            floatCard.style.cursor = 'grabbing';

            e.preventDefault();
            return;
        }

        // 2. Check for main hero card
        const heroContent = e.target.closest('.hero-content');
        if (heroContent) {
            // Avoid dragging if clicking on links, buttons, inputs, edit/delete buttons, or anything clickable
            if (e.target.closest('a') || 
                e.target.closest('button') || 
                e.target.closest('input') || 
                e.target.closest('textarea') || 
                e.target.closest('select') || 
                e.target.closest('.admin-element-toolbar') ||
                e.target.closest('[contenteditable="true"]')) {
                return;
            }

            activeDragMainCard = heroContent;
            dragStartX = e.clientX;
            dragStartY = e.clientY;

            const style = heroContent.style;
            initialOffsetX = parseInt(style.getPropertyValue('--hero-card-offset-x') || '-40');
            initialOffsetY = parseInt(style.getPropertyValue('--hero-card-offset-y') || '0');

            heroContent.style.cursor = 'grabbing';
            e.preventDefault();
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (activeDragCard) {
            const parent = activeDragCard.offsetParent || document.querySelector('.hero');
            const parentWidth = parent.clientWidth || window.innerWidth;
            const parentHeight = parent.clientHeight || window.innerHeight;

            const dx = e.clientX - dragStartX;
            const dy = e.clientY - dragStartY;

            const deltaLeftPercent = (dx / parentWidth) * 100;
            const deltaTopPercent = (dy / parentHeight) * 100;

            let newLeft = initialLeftPercent + deltaLeftPercent;
            let newTop = initialTopPercent + deltaTopPercent;

            // Keep inside bounds (0% to 95%)
            newLeft = Math.max(0, Math.min(95, newLeft));
            newTop = Math.max(0, Math.min(95, newTop));

            activeDragCard.style.left = newLeft.toFixed(2) + '%';
            activeDragCard.style.top = newTop.toFixed(2) + '%';
            return;
        }

        if (activeDragMainCard) {
            const dx = e.clientX - dragStartX;
            const dy = e.clientY - dragStartY;

            const newOffsetX = initialOffsetX + dx;
            const newOffsetY = initialOffsetY + dy;

            // Restrict to slider bounds
            const boundedX = Math.max(-800, Math.min(800, newOffsetX));
            const boundedY = Math.max(-400, Math.min(400, newOffsetY));

            activeDragMainCard.style.setProperty('--hero-card-offset-x', boundedX + 'px');
            activeDragMainCard.style.setProperty('--hero-card-offset-y', boundedY + 'px');

            if (heroOffsetX) {
                heroOffsetX.value = boundedX;
                heroOffsetXVal.innerText = boundedX + 'px';
            }
            if (heroOffsetY) {
                heroOffsetY.value = boundedY;
                heroOffsetYVal.innerText = boundedY + 'px';
            }

            window.hasUnsavedChanges = true;
            const saveBtnEl = document.getElementById('save-changes');
            if (saveBtnEl) {
                saveBtnEl.style.boxShadow = '0 0 15px #20c997';
            }
        }
    });

    document.addEventListener('mouseup', () => {
        if (activeDragCard) {
            activeDragCard.style.cursor = '';
            activeDragCard = null;
        }
        if (activeDragMainCard) {
            activeDragMainCard.style.cursor = '';
            activeDragMainCard = null;
        }
    });

    function initFloatingCardsPanelLogic() {
        const floatCardsList = document.getElementById('hero-floating-cards-list');
        const floatCardForm = document.getElementById('float-card-form');
        const floatCardText = document.getElementById('float-card-text');
        const floatCardFile = document.getElementById('float-card-file');
        const floatCardFileBtn = document.getElementById('float-card-file-btn');
        const floatCardImgUrl = document.getElementById('float-card-img-url');
        const floatCardImgPreview = document.getElementById('float-card-img-preview');
        const floatCardImgPreviewContainer = document.getElementById('float-card-img-preview-container');
        const floatCardImgFilename = document.getElementById('float-card-img-filename');
        const floatCardSaveBtn = document.getElementById('float-card-save-btn');
        const floatCardCancelBtn = document.getElementById('float-card-cancel-btn');
        const floatCardAddBtn = document.getElementById('float-card-add-btn');
        const floatCardLeft = document.getElementById('float-card-left');
        const floatCardLeftVal = document.getElementById('float-card-left-val');
        const floatCardTop = document.getElementById('float-card-top');
        const floatCardTopVal = document.getElementById('float-card-top-val');
        const floatCardWidthInput = document.getElementById('float-card-width-input');
        const floatCardWidthVal = document.getElementById('float-card-width-val');
        const floatCardWidthAuto = document.getElementById('float-card-width-auto');
        const floatCardHeightInput = document.getElementById('float-card-height-input');
        const floatCardHeightVal = document.getElementById('float-card-height-val');
        const floatCardHeightAuto = document.getElementById('float-card-height-auto');
        const floatCardPaddingInput = document.getElementById('float-card-padding-input');
        const floatCardPaddingVal = document.getElementById('float-card-padding-val');
        const floatCardRadiusInput = document.getElementById('float-card-radius-input');
        const floatCardRadiusVal = document.getElementById('float-card-radius-val');
        const floatCardBlurInput = document.getElementById('float-card-blur-input');
        const floatCardBlurVal = document.getElementById('float-card-blur-val');
        const floatCardOpacityInput = document.getElementById('float-card-opacity-input');
        const floatCardOpacityVal = document.getElementById('float-card-opacity-val');
        const floatCardScaleInput = document.getElementById('float-card-scale-input');
        const floatCardScaleVal = document.getElementById('float-card-scale-val');
        const floatCardImgsizeInput = document.getElementById('float-card-imgsize-input');
        const floatCardImgsizeVal = document.getElementById('float-card-imgsize-val');

        if (!floatCardsList) return;

        const heroFloatingCardsContainer = document.getElementById('hero-floating-cards');
        if (!heroFloatingCardsContainer) return;

        const renderList = () => {
            floatCardsList.innerHTML = '';
            const cards = heroFloatingCardsContainer.querySelectorAll('.hero-float-card');
            
            if (cards.length === 0) {
                floatCardsList.innerHTML = '<p style="font-size:0.75rem; color:#888; text-align:center; padding:10px; margin:0;">No floating cards found.</p>';
            }

            cards.forEach((card, index) => {
                let cardId = card.getAttribute('data-card-id');
                if (!cardId) {
                    cardId = 'card_' + Date.now() + '_' + index;
                    card.setAttribute('data-card-id', cardId);
                }

                const imgEl = card.querySelector('img');
                const textEl = card.querySelector('span');
                const imgUrl = imgEl ? imgEl.src : '';
                const labelText = textEl ? textEl.innerText : '';
                
                const styleLeft = card.style.left || '';
                const styleTop = card.style.top || '';
                const currentLeft = styleLeft ? parseFloat(styleLeft) : 50;
                const currentTop = styleTop ? parseFloat(styleTop) : 50;

                const itemDiv = document.createElement('div');
                itemDiv.style.cssText = 'display:flex; align-items:center; justify-content:space-between; padding:8px; background:#222; border-radius:6px; border:1px solid #444; margin-bottom:4px;';
                itemDiv.innerHTML = `
                    <div style="display:flex; align-items:center; gap:8px; overflow:hidden; flex:1;">
                        ${imgUrl ? `<img src="${imgUrl}" style="height:24px; max-width:40px; object-fit:contain; background:#333; padding:2px; border-radius:3px;" onerror="this.style.display='none'">` : '<div style="width:24px; height:24px; background:#333; border-radius:3px; display:flex; align-items:center; justify-content:center; font-size:0.6rem; color:#888;"><i class="fa-solid fa-image"></i></div>'}
                        <span style="font-size:0.75rem; color:#fff; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${labelText || '(No label)'}</span>
                    </div>
                    <div style="display:flex; gap:4px;">
                        <button type="button" class="btn-edit-float-card admin-btn" data-id="${cardId}" style="padding:4px 8px; font-size:0.7rem; margin:0; background:#ffc107; color:#111;"><i class="fa-solid fa-pencil"></i></button>
                        <button type="button" class="btn-delete-float-card admin-btn danger" data-id="${cardId}" style="padding:4px 8px; font-size:0.7rem; margin:0;"><i class="fa-solid fa-trash"></i></button>
                    </div>
                `;
                
                itemDiv.querySelector('.btn-edit-float-card').addEventListener('click', () => {
                    floatCardForm.style.display = 'flex';
                    floatCardAddBtn.style.display = 'none';
                    floatCardForm.dataset.mode = 'edit';
                    floatCardForm.dataset.targetId = cardId;
                    document.getElementById('float-card-form-title').innerText = 'Edit Floating Card';
                    
                    floatCardText.value = labelText;
                    floatCardImgUrl.value = imgUrl;
                    floatCardLeft.value = Math.round(currentLeft);
                    floatCardTop.value = Math.round(currentTop);
                    if (floatCardLeftVal) floatCardLeftVal.innerText = Math.round(currentLeft) + '%';
                    if (floatCardTopVal) floatCardTopVal.innerText = Math.round(currentTop) + '%';

                    const cardStyle = card.style;
                    
                    // Width
                    const cWidth = cardStyle.getPropertyValue('--hero-float-card-width') || 'auto';
                    const isWAuto = cWidth === 'auto' || !cWidth;
                    const wVal = isWAuto ? 150 : (parseInt(cWidth) || 150);
                    if (floatCardWidthInput) {
                        floatCardWidthInput.value = wVal;
                        floatCardWidthInput.disabled = isWAuto;
                    }
                    if (floatCardWidthVal) floatCardWidthVal.innerText = isWAuto ? 'auto' : wVal + 'px';
                    if (floatCardWidthAuto) floatCardWidthAuto.checked = isWAuto;

                    // Height
                    const cHeight = cardStyle.getPropertyValue('--hero-float-card-height') || 'auto';
                    const isHAuto = cHeight === 'auto' || !cHeight;
                    const hVal = isHAuto ? 50 : (parseInt(cHeight) || 50);
                    if (floatCardHeightInput) {
                        floatCardHeightInput.value = hVal;
                        floatCardHeightInput.disabled = isHAuto;
                    }
                    if (floatCardHeightVal) floatCardHeightVal.innerText = isHAuto ? 'auto' : hVal + 'px';
                    if (floatCardHeightAuto) floatCardHeightAuto.checked = isHAuto;
                    
                    // Padding
                    const cPadding = cardStyle.getPropertyValue('--hero-float-card-padding') || '10px 16px';
                    const pVal = parseInt(cPadding) || 10;
                    if (floatCardPaddingInput) floatCardPaddingInput.value = pVal;
                    if (floatCardPaddingVal) floatCardPaddingVal.innerText = pVal + 'px';
                    
                    // Radius
                    const cRadius = cardStyle.getPropertyValue('--hero-float-card-radius') || '12px';
                    const rVal = parseInt(cRadius) || 12;
                    if (floatCardRadiusInput) floatCardRadiusInput.value = rVal;
                    if (floatCardRadiusVal) floatCardRadiusVal.innerText = rVal + 'px';
                    
                    // Blur
                    const cBlur = cardStyle.getPropertyValue('--hero-float-card-blur') || '12px';
                    const bVal = parseInt(cBlur) || 12;
                    if (floatCardBlurInput) floatCardBlurInput.value = bVal;
                    if (floatCardBlurVal) floatCardBlurVal.innerText = bVal + 'px';
                    
                    // Opacity
                    const cOpacity = cardStyle.getPropertyValue('--hero-float-card-opacity') || '0.45';
                    const oVal = parseFloat(cOpacity) || 0.45;
                    if (floatCardOpacityInput) floatCardOpacityInput.value = Math.round(oVal * 100);
                    if (floatCardOpacityVal) floatCardOpacityVal.innerText = oVal;
                    
                    // Scale
                    const cScale = cardStyle.getPropertyValue('--hero-float-card-scale') || '1';
                    const scaleVal = Math.round(parseFloat(cScale) * 100) || 100;
                    if (floatCardScaleInput) floatCardScaleInput.value = scaleVal;
                    if (floatCardScaleVal) floatCardScaleVal.innerText = (scaleVal / 100) + 'x';
                    
                    // Image Size
                    const cImgSize = cardStyle.getPropertyValue('--hero-float-card-img-size') || '24px';
                    const imgSizeVal = parseInt(cImgSize) || 24;
                    if (floatCardImgsizeInput) floatCardImgsizeInput.value = imgSizeVal;
                    if (floatCardImgsizeVal) floatCardImgsizeVal.innerText = imgSizeVal + 'px';
                    
                    if (imgUrl) {
                        floatCardImgPreview.src = imgUrl;
                        floatCardImgPreviewContainer.style.display = 'flex';
                        floatCardImgFilename.innerText = 'Logo Image';
                    } else {
                        floatCardImgPreviewContainer.style.display = 'none';
                    }
                });

                itemDiv.querySelector('.btn-delete-float-card').addEventListener('click', () => {
                    if (confirm(`Are you sure you want to delete "${labelText || 'this card'}"?`)) {
                        card.remove();
                        renderList();
                        window.showToast('Floating card deleted locally. Save to Cloud to persist.', 'info');
                    }
                });

                floatCardsList.appendChild(itemDiv);
            });
        };

        if (floatCardFile && floatCardFileBtn) {
            floatCardFileBtn.onclick = () => floatCardFile.click();
            floatCardFile.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    floatCardImgPreview.src = reader.result;
                    floatCardImgPreviewContainer.style.display = 'flex';
                    floatCardImgFilename.innerText = file.name;
                    floatCardImgUrl.value = 'base64_pending';
                    floatCardFile.dataset.base64 = reader.result;
                };
            };
        }

        if (floatCardCancelBtn) {
            floatCardCancelBtn.onclick = () => {
                floatCardForm.style.display = 'none';
                floatCardAddBtn.style.display = 'block';
                floatCardText.value = '';
                floatCardImgUrl.value = '';
                floatCardFile.value = '';
                floatCardFile.dataset.base64 = '';
                floatCardImgPreviewContainer.style.display = 'none';
                floatCardLeft.value = '50';
                if (floatCardLeftVal) floatCardLeftVal.innerText = '50%';
                floatCardTop.value = '50';
                if (floatCardTopVal) floatCardTopVal.innerText = '50%';
                
                if (floatCardWidthInput) {
                    floatCardWidthInput.value = '150';
                    floatCardWidthInput.disabled = true;
                }
                if (floatCardWidthVal) floatCardWidthVal.innerText = 'auto';
                if (floatCardWidthAuto) floatCardWidthAuto.checked = true;
                
                if (floatCardHeightInput) {
                    floatCardHeightInput.value = '50';
                    floatCardHeightInput.disabled = true;
                }
                if (floatCardHeightVal) floatCardHeightVal.innerText = 'auto';
                if (floatCardHeightAuto) floatCardHeightAuto.checked = true;
                
                if (floatCardPaddingInput) floatCardPaddingInput.value = '10';
                if (floatCardPaddingVal) floatCardPaddingVal.innerText = '10px';
                
                if (floatCardRadiusInput) floatCardRadiusInput.value = '12';
                if (floatCardRadiusVal) floatCardRadiusVal.innerText = '12px';
                
                if (floatCardBlurInput) floatCardBlurInput.value = '12';
                if (floatCardBlurVal) floatCardBlurVal.innerText = '12px';
                
                if (floatCardOpacityInput) floatCardOpacityInput.value = '45';
                if (floatCardOpacityVal) floatCardOpacityVal.innerText = '0.45';
                if (floatCardScaleInput) floatCardScaleInput.value = '100';
                if (floatCardScaleVal) floatCardScaleVal.innerText = '1x';
                if (floatCardImgsizeInput) floatCardImgsizeInput.value = '24';
                if (floatCardImgsizeVal) floatCardImgsizeVal.innerText = '24px';
            };
        }

        if (floatCardSaveBtn) {
            floatCardSaveBtn.onclick = async () => {
                const text = floatCardText.value.trim();
                let imgUrl = floatCardImgUrl.value.trim();
                const mode = floatCardForm.dataset.mode || 'add';
                const targetId = floatCardForm.dataset.targetId;
                const leftVal = floatCardLeft.value || '50';
                const topVal = floatCardTop.value || '50';

                if (!text && !imgUrl && floatCardImgUrl.value !== 'base64_pending') {
                    window.showToast('Please enter text or choose an image.', 'warning');
                    return;
                }

                const originalBtnText = floatCardSaveBtn.innerText;
                floatCardSaveBtn.innerText = 'Saving...';
                floatCardSaveBtn.disabled = true;

                try {
                    if (imgUrl === 'base64_pending' && floatCardFile.dataset.base64) {
                        window.showToast('Uploading logo to Cloudinary...', 'info');
                        const uploadedUrl = await uploadToCloudinary(floatCardFile.dataset.base64);
                        imgUrl = uploadedUrl;
                    }

                    const isWAuto = floatCardWidthAuto ? floatCardWidthAuto.checked : true;
                    const wVal = isWAuto ? 'auto' : (floatCardWidthInput.value + 'px');

                    const isHAuto = floatCardHeightAuto ? floatCardHeightAuto.checked : true;
                    const hVal = isHAuto ? 'auto' : (floatCardHeightInput.value + 'px');

                    const pVal = floatCardPaddingInput ? (parseInt(floatCardPaddingInput.value) || 10) : 10;
                    const rVal = floatCardRadiusInput ? (parseInt(floatCardRadiusInput.value) || 12) : 12;
                    const bVal = floatCardBlurInput ? (parseInt(floatCardBlurInput.value) || 12) : 12;
                    const oVal = floatCardOpacityInput ? (parseFloat(floatCardOpacityInput.value / 100) || 0.45) : 0.45;
                    const scaleVal = floatCardScaleInput ? (parseFloat(floatCardScaleInput.value) / 100 || 1) : 1;
                    const imgSizeVal = floatCardImgsizeInput ? (parseInt(floatCardImgsizeInput.value) || 24) : 24;

                    if (mode === 'add') {
                        const newId = 'card_' + Date.now();
                        const delay = (heroFloatingCardsContainer.querySelectorAll('.hero-float-card').length * 1.5) + 's';
                        
                        const newCard = document.createElement('div');
                        newCard.className = 'hero-float-card';
                        newCard.setAttribute('data-card-id', newId);
                        newCard.style.cssText = `left: ${leftVal}%; top: ${topVal}%; animation-delay: ${delay};`;
                        newCard.style.setProperty('--hero-float-card-width', wVal);
                        newCard.style.setProperty('--hero-float-card-height', hVal);
                        newCard.style.setProperty('--hero-float-card-padding', pVal + 'px ' + Math.round(pVal * 1.6) + 'px');
                        newCard.style.setProperty('--hero-float-card-radius', rVal + 'px');
                        newCard.style.setProperty('--hero-float-card-blur', bVal + 'px');
                        newCard.style.setProperty('--hero-float-card-opacity', oVal);
                        newCard.style.setProperty('--hero-float-card-scale', scaleVal);
                        newCard.style.setProperty('--hero-float-card-img-size', imgSizeVal + 'px');
                        
                        let cardHTML = '';
                        if (imgUrl) {
                            cardHTML += `<img src="${imgUrl}" alt="${text || 'Logo'}" onerror="this.style.display='none'">`;
                        }
                        if (text) {
                            cardHTML += `<span>${text}</span>`;
                        }
                        
                        newCard.innerHTML = cardHTML;
                        heroFloatingCardsContainer.appendChild(newCard);
                        window.showToast('Card added. Enable Edit Mode and drag it to position!', 'success');
                    } else {
                        const card = heroFloatingCardsContainer.querySelector(`[data-card-id="${targetId}"]`);
                        if (card) {
                            let cardHTML = '';
                            if (imgUrl) {
                                cardHTML += `<img src="${imgUrl}" alt="${text || 'Logo'}" onerror="this.style.display='none'">`;
                            }
                            if (text) {
                                cardHTML += `<span>${text}</span>`;
                            }
                            card.innerHTML = cardHTML;
                            card.style.left = leftVal + '%';
                            card.style.top = topVal + '%';
                            card.style.setProperty('--hero-float-card-width', wVal);
                            card.style.setProperty('--hero-float-card-height', hVal);
                            card.style.setProperty('--hero-float-card-padding', pVal + 'px ' + Math.round(pVal * 1.6) + 'px');
                            card.style.setProperty('--hero-float-card-radius', rVal + 'px');
                            card.style.setProperty('--hero-float-card-blur', bVal + 'px');
                            card.style.setProperty('--hero-float-card-opacity', oVal);
                            card.style.setProperty('--hero-float-card-scale', scaleVal);
                            card.style.setProperty('--hero-float-card-img-size', imgSizeVal + 'px');
                            window.showToast('Card updated successfully.', 'success');
                        }
                    }

                    floatCardCancelBtn.click();
                    renderList();
                } catch (err) {
                    console.error(err);
                    window.showToast('Failed to save card: ' + err.message, 'error');
                } finally {
                    floatCardSaveBtn.innerText = originalBtnText;
                    floatCardSaveBtn.disabled = false;
                }
            };
        }

        if (floatCardAddBtn) {
            floatCardAddBtn.onclick = () => {
                floatCardForm.style.display = 'flex';
                floatCardAddBtn.style.display = 'none';
                floatCardForm.dataset.mode = 'add';
                document.getElementById('float-card-form-title').innerText = 'Add New Floating Card';
                
                floatCardText.value = '';
                floatCardImgUrl.value = '';
                floatCardFile.value = '';
                floatCardFile.dataset.base64 = '';
                floatCardImgPreviewContainer.style.display = 'none';
                floatCardLeft.value = '50';
                if (floatCardLeftVal) floatCardLeftVal.innerText = '50%';
                floatCardTop.value = '50';
                if (floatCardTopVal) floatCardTopVal.innerText = '50%';
                
                if (floatCardWidthInput) {
                    floatCardWidthInput.value = '150';
                    floatCardWidthInput.disabled = true;
                }
                if (floatCardWidthVal) floatCardWidthVal.innerText = 'auto';
                if (floatCardWidthAuto) floatCardWidthAuto.checked = true;
                
                if (floatCardHeightInput) {
                    floatCardHeightInput.value = '50';
                    floatCardHeightInput.disabled = true;
                }
                if (floatCardHeightVal) floatCardHeightVal.innerText = 'auto';
                if (floatCardHeightAuto) floatCardHeightAuto.checked = true;
                
                if (floatCardPaddingInput) floatCardPaddingInput.value = '10';
                if (floatCardPaddingVal) floatCardPaddingVal.innerText = '10px';
                
                if (floatCardRadiusInput) floatCardRadiusInput.value = '12';
                if (floatCardRadiusVal) floatCardRadiusVal.innerText = '12px';
                
                if (floatCardBlurInput) floatCardBlurInput.value = '12';
                if (floatCardBlurVal) floatCardBlurVal.innerText = '12px';
                
                if (floatCardOpacityInput) floatCardOpacityInput.value = '45';
                if (floatCardOpacityVal) floatCardOpacityVal.innerText = '0.45';
                if (floatCardScaleInput) floatCardScaleInput.value = '100';
                if (floatCardScaleVal) floatCardScaleVal.innerText = '1x';
                if (floatCardImgsizeInput) floatCardImgsizeInput.value = '24';
                if (floatCardImgsizeVal) floatCardImgsizeVal.innerText = '24px';
            };
        }

        const updateLiveCardStyle = (prop, val) => {
            const mode = floatCardForm.dataset.mode || 'add';
            const targetId = floatCardForm.dataset.targetId;
            if (mode === 'edit' && targetId) {
                const card = heroFloatingCardsContainer.querySelector(`[data-card-id="${targetId}"]`);
                if (card) {
                    card.style.setProperty(prop, val);
                }
            }
        };

        if (floatCardLeft) {
            floatCardLeft.addEventListener('input', (e) => {
                const val = e.target.value;
                if (floatCardLeftVal) floatCardLeftVal.innerText = val + '%';
                updateLiveCardStyle('left', val + '%');
            });
        }
        if (floatCardTop) {
            floatCardTop.addEventListener('input', (e) => {
                const val = e.target.value;
                if (floatCardTopVal) floatCardTopVal.innerText = val + '%';
                updateLiveCardStyle('top', val + '%');
            });
        }

        if (floatCardWidthInput) {
            floatCardWidthInput.addEventListener('input', (e) => {
                const val = e.target.value;
                if (floatCardWidthVal) floatCardWidthVal.innerText = val + 'px';
                updateLiveCardStyle('--hero-float-card-width', val + 'px');
            });
        }
        if (floatCardWidthAuto) {
            floatCardWidthAuto.addEventListener('change', (e) => {
                const checked = e.target.checked;
                if (floatCardWidthInput) floatCardWidthInput.disabled = checked;
                if (floatCardWidthVal) floatCardWidthVal.innerText = checked ? 'auto' : floatCardWidthInput.value + 'px';
                updateLiveCardStyle('--hero-float-card-width', checked ? 'auto' : floatCardWidthInput.value + 'px');
            });
        }

        if (floatCardHeightInput) {
            floatCardHeightInput.addEventListener('input', (e) => {
                const val = e.target.value;
                if (floatCardHeightVal) floatCardHeightVal.innerText = val + 'px';
                updateLiveCardStyle('--hero-float-card-height', val + 'px');
            });
        }
        if (floatCardHeightAuto) {
            floatCardHeightAuto.addEventListener('change', (e) => {
                const checked = e.target.checked;
                if (floatCardHeightInput) floatCardHeightInput.disabled = checked;
                if (floatCardHeightVal) floatCardHeightVal.innerText = checked ? 'auto' : floatCardHeightInput.value + 'px';
                updateLiveCardStyle('--hero-float-card-height', checked ? 'auto' : floatCardHeightInput.value + 'px');
            });
        }

        if (floatCardPaddingInput) {
            floatCardPaddingInput.addEventListener('input', (e) => {
                const val = parseInt(e.target.value) || 10;
                if (floatCardPaddingVal) floatCardPaddingVal.innerText = val + 'px';
                updateLiveCardStyle('--hero-float-card-padding', val + 'px ' + Math.round(val * 1.6) + 'px');
            });
        }
        if (floatCardRadiusInput) {
            floatCardRadiusInput.addEventListener('input', (e) => {
                const val = parseInt(e.target.value) || 12;
                if (floatCardRadiusVal) floatCardRadiusVal.innerText = val + 'px';
                updateLiveCardStyle('--hero-float-card-radius', val + 'px');
            });
        }
        if (floatCardBlurInput) {
            floatCardBlurInput.addEventListener('input', (e) => {
                const val = parseInt(e.target.value) || 12;
                if (floatCardBlurVal) floatCardBlurVal.innerText = val + 'px';
                updateLiveCardStyle('--hero-float-card-blur', val + 'px');
            });
        }
        if (floatCardOpacityInput) {
            floatCardOpacityInput.addEventListener('input', (e) => {
                const val = e.target.value / 100;
                if (floatCardOpacityVal) floatCardOpacityVal.innerText = val;
                updateLiveCardStyle('--hero-float-card-opacity', val);
            });
        }
        if (floatCardScaleInput) {
            floatCardScaleInput.addEventListener('input', (e) => {
                const val = e.target.value / 100;
                if (floatCardScaleVal) floatCardScaleVal.innerText = val + 'x';
                updateLiveCardStyle('--hero-float-card-scale', val);
            });
        }
        if (floatCardImgsizeInput) {
            floatCardImgsizeInput.addEventListener('input', (e) => {
                const val = e.target.value;
                if (floatCardImgsizeVal) floatCardImgsizeVal.innerText = val + 'px';
                updateLiveCardStyle('--hero-float-card-img-size', val + 'px');
            });
        }

        renderList();
    }

    if (manageHeroCardBtn) {
        if (isPortfolioPage) {
            manageHeroCardBtn.style.display = 'none';
        } else {
            manageHeroCardBtn.addEventListener("click", () => {
                document.querySelectorAll('#social-links-panel, #pricing-links-panel, #sections-panel, #filters-panel, #theme-panel, #flipbook-panel, #particle-panel').forEach(p => p.style.display = 'none');
                
                const isHidden = heroCardPanel.style.display === 'none';
                heroCardPanel.style.display = isHidden ? 'block' : 'none';
                
                if (isHidden) {
                    initHeroCardPanelFromDOM();
                }
            });
        }
    }

    async function loadSavedContent() {
        const hideLoader = () => {
            const loader = document.getElementById('loading-screen');
            if (loader) {
                loader.style.opacity = '0';
                loader.style.visibility = 'hidden';
                setTimeout(() => loader.remove(), 500);
            }
        };

        const checkAuthentication = () => {
            return new Promise((resolve) => {
                if (sessionStorage.getItem('admin_authenticated') === 'true') {
                    resolve(true);
                    return;
                }

                // Inject password overlay
                const overlayHTML = `
                <div id="admin-password-overlay" style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(10,15,10,0.96); backdrop-filter:blur(10px); z-index:999999; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#fff; font-family:'Outfit', 'Inter', sans-serif;">
                    <div style="background:#184C3A; padding:40px; border-radius:16px; border:1px solid rgba(255,255,255,0.1); width:90%; max-width:400px; text-align:center; box-shadow:0 20px 40px rgba(0,0,0,0.6); transition: all 0.3s ease;">
                        <div style="font-size:2.5rem; margin-bottom:15px; color:#F4B400;"><i class="fa-solid fa-lock"></i></div>
                        <h2 style="font-weight:700; margin-bottom:10px; font-size:1.5rem; color:#fff; font-family:'Outfit', sans-serif;">Admin Access</h2>
                        <p style="font-size:0.85rem; color:#ccc; margin-bottom:25px; font-family:'Inter', sans-serif;">Enter password to unlock the admin panel.</p>
                        
                        <input type="password" id="admin-pass-input" placeholder="Password" style="width:100%; padding:12px 16px; border-radius:8px; border:1px solid #333; background:#222; color:#fff; font-size:1rem; margin-bottom:20px; box-sizing:border-box; outline:none; text-align:center; font-family:'Inter', sans-serif; transition: border-color 0.2s;" />
                        
                        <div id="admin-pass-error" style="color:#ff4a4a; font-size:0.85rem; margin-top:-15px; margin-bottom:15px; display:none; font-family:'Inter', sans-serif;">Incorrect password!</div>
                        
                        <button id="admin-pass-submit" style="width:100%; padding:12px; border-radius:8px; border:none; background:#F4B400; color:#111; font-weight:700; font-size:1rem; cursor:pointer; font-family:'Outfit', sans-serif; transition: transform 0.1s, background-color 0.2s;">Unlock Panel</button>
                        
                        <button id="admin-pass-cancel" style="background:none; border:none; color:#aaa; margin-top:20px; font-size:0.85rem; cursor:pointer; text-decoration:underline; font-family:'Inter', sans-serif;">Cancel & Exit</button>
                    </div>
                </div>
                `;
                document.body.insertAdjacentHTML('beforeend', overlayHTML);
                
                const overlay = document.getElementById('admin-password-overlay');
                const input = document.getElementById('admin-pass-input');
                const error = document.getElementById('admin-pass-error');
                const submit = document.getElementById('admin-pass-submit');
                const cancel = document.getElementById('admin-pass-cancel');
                
                input.focus();
                
                const trySubmit = () => {
                    if (input.value === 'Hamidraza1144@') {
                        sessionStorage.setItem('admin_authenticated', 'true');
                        overlay.remove();
                        resolve(true);
                    } else {
                        error.style.display = 'block';
                        input.value = '';
                        input.focus();
                        
                        const container = overlay.querySelector('div');
                        container.style.transform = 'translateX(-10px)';
                        setTimeout(() => container.style.transform = 'translateX(10px)', 50);
                        setTimeout(() => container.style.transform = 'translateX(-10px)', 100);
                        setTimeout(() => container.style.transform = 'translateX(10px)', 150);
                        setTimeout(() => container.style.transform = 'translateX(0)', 200);
                    }
                };
                
                submit.addEventListener('click', trySubmit);
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') trySubmit();
                });
                
                const exitAdmin = () => {
                    localStorage.removeItem('admin_mode');
                    try {
                        sessionStorage.removeItem('open_admin_panel');
                    } catch(err) {}
                    const url = new URL(window.location.href);
                    url.searchParams.delete('admin');
                    url.searchParams.delete('edit');
                    url.hash = '';
                    window.location.href = url.toString();
                    resolve(false);
                };
                
                cancel.addEventListener('click', exitAdmin);
            });
        };

        const isAdmin = localStorage.getItem('admin_mode') === 'true' || 
                        window.location.search.includes('admin=true') || 
                        window.location.search.includes('edit=true') || 
                        window.location.hash === '#admin';

        if (!isAdmin) {
            const panel = document.getElementById('super-admin-panel');
            if (panel) panel.remove();
            const textToolbar = document.getElementById('admin-text-toolbar');
            if (textToolbar) textToolbar.remove();
            
            document.body.classList.add('loaded');
            hideLoader();
            return;
        }

        // Wait for Supabase client to be ready (up to 5 seconds)
        const waitForSupabase = () => {
            return new Promise((resolve) => {
                if (window.supabaseClient) {
                    resolve(true);
                    return;
                }
                let elapsed = 0;
                const interval = setInterval(() => {
                    elapsed += 50;
                    if (window.supabaseClient) {
                        clearInterval(interval);
                        resolve(true);
                    } else if (elapsed >= 5000) {
                        clearInterval(interval);
                        resolve(false);
                    }
                }, 50);
            });
        };

        const supabaseReady = await waitForSupabase();
        if (!supabaseReady) {
            console.error("Supabase client failed to load in time.");
            document.body.classList.add('loaded');
            hideLoader();
            return;
        }

        const authenticated = await checkAuthentication();
        if (!authenticated) return;

        if (isBlogSystem) {
            // Hide non-blog buttons on blog pages
            document.querySelectorAll('#toggle-edit-mode, #add-portfolio-item, #add-review, #add-package, #manage-flipbook, #manage-social, #manage-pricing, #manage-sections, #manage-filters, #manage-theme, #manage-hero-card, #change-hero-bg, #save-changes, #export-html, #clear-storage').forEach(el => {
                if (el) el.style.display = 'none';
            });
        }
        
        try {
            if (!isBlogSystem) {
                const pageId = isPortfolioPage ? 'portfolio' : 'index';
                const fetchPromise = window.supabaseFetchPromise || window.supabaseClient
                    .from('site_content')
                    .select('html_content')
                    .eq('id', pageId)
                    .single();
                const { data, error } = await fetchPromise;
                    
                if (error && error.code !== 'PGRST116') throw error;

                if (data && data.html_content) {
                    // Save custom theme style cache if present in the loaded HTML
                    try {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(data.html_content, 'text/html');
                        const styleEl = doc.querySelector('#custom-theme-styles');
                        if (styleEl) {
                            localStorage.setItem('supabase_cached_theme', styleEl.innerHTML);
                        }
                    } catch (cacheErr) {
                        console.warn("Local storage cache quota exceeded on load theme:", cacheErr);
                    }
                    
                    // Helper to clean a DOM body for comparison
                    const getCleanBodyHTML = (bodyEl) => {
                        const clone = bodyEl.cloneNode(true);
                        clone.querySelectorAll('#super-admin-panel, #admin-crop-modal, #admin-add-item-modal, #admin-text-toolbar, #admin-blog-modal, #admin-hero-bg-modal').forEach(el => el.remove());
                        clone.querySelectorAll('.admin-element-toolbar').forEach(tb => tb.remove());
                        clone.querySelectorAll('.editable-container').forEach(c => c.classList.remove('editable-container'));
                        clone.querySelectorAll('.flipbook-live-edit-btn').forEach(b => b.remove());
                        clone.querySelectorAll('#fp-rp-overlay, #fp-rp-modal').forEach(el => el.remove());
                        clone.querySelectorAll('#custom-toast').forEach(toast => toast.remove());
                        clone.querySelectorAll('#bg-anim-wrap, #bg-anim-canvas, #bg-hero-glow').forEach(el => el.remove());
                        clone.querySelectorAll('.reveal').forEach(el => el.classList.remove('active'));
                        return clone.innerHTML.trim();
                    };

                    const currentCleanHTML = getCleanBodyHTML(document.body);
                    const fetchedCleanHTML = data.html_content.trim();

                    // If currently loaded static HTML matches exactly, do nothing!
                    if (currentCleanHTML === fetchedCleanHTML) {
                        window.contentLoadedFromLive = true;
                        initAdminThemePanelFromDOM();
                        repairSocialIcons();
                        
                        const pricingCards = document.querySelectorAll('.pricing-card');
                        if (pricingCards.length === 3) {
                            const basicBtn = pricingCards[0].querySelector('a.btn');
                            const standardBtn = pricingCards[1].querySelector('a.btn');
                            const premiumBtn = pricingCards[2].querySelector('a.btn');
                            
                            if (basicBtn && !basicBtn.hasAttribute('data-pricing')) basicBtn.setAttribute('data-pricing', 'basic');
                            if (standardBtn && !standardBtn.hasAttribute('data-pricing')) standardBtn.setAttribute('data-pricing', 'standard');
                            if (premiumBtn && !premiumBtn.hasAttribute('data-pricing')) premiumBtn.setAttribute('data-pricing', 'premium');
                        }
                        injectFlipbookLiveButton();
                        return;
                    }

                    const panel   = document.getElementById('super-admin-panel');
                    const modal   = document.getElementById('admin-crop-modal');
                    const addItemModalEl = document.getElementById('admin-add-item-modal');
                    const textToolbarEl = document.getElementById('admin-text-toolbar');
                    const rpOvlEl = document.getElementById('fp-rp-overlay');
                    const rpModEl = document.getElementById('fp-rp-modal');

                    const blogModalEl = document.getElementById('admin-blog-modal');
                    
                    // Preserve background animation elements
                    const animWrap = document.getElementById('bg-anim-wrap');
                    const animCanvas = document.getElementById('bg-anim-canvas');
                    const heroGlow = document.getElementById('bg-hero-glow');

                    window.contentLoadedFromLive = true;
                    document.body.innerHTML = data.html_content;
                    
                    // Remove any stale background elements parsed from the cloud HTML to prevent duplicates
                    ['bg-anim-wrap', 'bg-anim-canvas', 'bg-hero-glow', 'admin-text-toolbar'].forEach(id => {
                        const el = document.getElementById(id);
                        if (el) el.remove();
                    });
                    
                    if(panel)          document.body.appendChild(panel);
                    if(modal)          document.body.appendChild(modal);
                    if(addItemModalEl) document.body.appendChild(addItemModalEl);
                    if(textToolbarEl)  document.body.appendChild(textToolbarEl);
                    if(rpOvlEl)        document.body.appendChild(rpOvlEl);
                    if(rpModEl)        document.body.appendChild(rpModEl);

                    if(blogModalEl)    document.body.appendChild(blogModalEl);

                    // Initialize the admin theme panel inputs from loaded DOM
                    initAdminThemePanelFromDOM();

                    // Restore background animation elements
                    if(animWrap)   document.body.insertBefore(animWrap, document.body.firstChild);
                    if(animCanvas) document.body.insertBefore(animCanvas, document.body.firstChild);
                    if(heroGlow)   document.body.insertBefore(heroGlow, document.body.firstChild);

                    // Legacy Caches patch
                    document.querySelectorAll('.social-icons').forEach(container => {
                        const links = container.querySelectorAll('a');
                        if (links.length === 4 && !links[0].hasAttribute('data-social')) {
                            links[0].setAttribute('data-social', 'twitter');
                            links[1].setAttribute('data-social', 'linkedin');
                            links[2].setAttribute('data-social', 'behance');
                            links[3].setAttribute('data-social', 'facebook');
                            
                            const insta = document.createElement('a');
                            insta.setAttribute('href', '#');
                            insta.setAttribute('data-social', 'instagram');
                            insta.innerHTML = '<i class="fa-brands fa-instagram"></i>';
                            if (links[0].hasAttribute('style')) insta.setAttribute('style', links[0].getAttribute('style'));
                            container.insertBefore(insta, links[1]);
                        }
                    });

                    // Repair any loaded social icons to use their correct Font Awesome vector icons
                    repairSocialIcons();

                    const pricingCards = document.querySelectorAll('.pricing-card');
                    if (pricingCards.length === 3) {
                        const basicBtn = pricingCards[0].querySelector('a.btn');
                        const standardBtn = pricingCards[1].querySelector('a.btn');
                        const premiumBtn = pricingCards[2].querySelector('a.btn');
                        
                        if (basicBtn && !basicBtn.hasAttribute('data-pricing')) basicBtn.setAttribute('data-pricing', 'basic');
                        if (standardBtn && !standardBtn.hasAttribute('data-pricing')) standardBtn.setAttribute('data-pricing', 'standard');
                        if (premiumBtn && !premiumBtn.hasAttribute('data-pricing')) premiumBtn.setAttribute('data-pricing', 'premium');
                    }
                    
                    // Re-initialize site logic after replacing innerHTML
                    if (window.initSiteLogic) window.initSiteLogic();
                    
                    // Re-initialize background animation system if active
                    if (window.bgAnim && typeof window.bgAnim.init === 'function') {
                        window.bgAnim.init();
                    }

                    // Re-initialize flipbooks — use generous delay so DOM is fully settled
                    setTimeout(() => { if (window.initFlipbooks) window.initFlipbooks(); }, 600);
                    setTimeout(() => {
                        if (window.initFlipbooks) window.initFlipbooks();
                        injectFlipbookLiveButton();   // re-inject edit button after cloud rebuild
                        // Re-build covers marquee after flipbooks settle (covers grid cards are loaded fresh from cloud)
                        if (window.initCoversMarquee) window.initCoversMarquee();
                    }, 1200);
                }
            } else {
                repairSocialIcons();
            }
        } catch (err) {
            console.error("Error loading cloud content:", err);
        } finally {
            document.body.classList.add('loaded');
            hideLoader();
            if (!isBlogSystem) {
                initChangeObserver();
            }
            
            try {
                if (sessionStorage.getItem('open_admin_panel') === 'true') {
                    sessionStorage.removeItem('open_admin_panel');
                    const p = document.getElementById('super-admin-panel');
                    if (p) p.classList.add('active');
                }
            } catch (e) {}
        }
    }

    clearBtn.addEventListener("click", async () => {
        if (confirm("Are you sure you want to revert all changes back to original for this page? This will delete the cloud save.")) {
            try {
                if (window.supabaseClient) {
                    const pageId = isPortfolioPage ? 'portfolio' : 'index';
                    await window.supabaseClient.from('site_content').delete().eq('id', pageId);
                }
            } catch (err) {
                console.error(err);
            }
            localStorage.removeItem(storageKey); // Keep local removal just in case
            localStorage.removeItem('supabase_cached_html_' + pageId);
            location.reload();
        }
    });

    // 10. Export Final HTML
    exportBtn.addEventListener("click", () => {
        const wasEditMode = isEditMode;
        if (wasEditMode) toggleBtn.click(); 

        if (socialPanel && socialPanel.style.display !== 'none') manageSocialBtn.click();
        if (pricingPanel && pricingPanel.style.display !== 'none') managePricingBtn.click();
        if (heroCardPanel && heroCardPanel.style.display !== 'none') manageHeroCardBtn.click();

        const cloneDoc = document.documentElement.cloneNode(true);
        
        // Remove admin control panels, modals, and dynamic marquee containers
        cloneDoc.querySelectorAll('#super-admin-panel, #admin-crop-modal, #admin-add-item-modal, #admin-category-selector-modal, #admin-text-toolbar, .admin-element-toolbar, #fp-rp-overlay, #fp-rp-modal, #custom-toast, .covers-marquee-container, .paperback-covers-marquee-container, .formatting-marquee-container, #admin-blog-modal, #admin-hero-bg-modal').forEach(el => el.remove());
        cloneDoc.querySelectorAll('.portfolio-grid .portfolio-card').forEach(card => {
            card.style.display = '';
        });
        cloneDoc.querySelectorAll('.editable-container').forEach(c => c.classList.remove('editable-container'));
        cloneDoc.querySelectorAll('.flipbook-live-edit-btn').forEach(b => b.remove());
        cloneDoc.querySelectorAll('#bg-anim-wrap, #bg-anim-canvas, #bg-hero-glow').forEach(el => el.remove());
        
        // Ensure scroll reveal elements do not export with 'active' class
        cloneDoc.querySelectorAll('.reveal').forEach(el => el.classList.remove('active'));
        
        // Remove admin assets
        cloneDoc.querySelectorAll('script[src*="admin.js"], link[href*="admin.css"], link[href*="cropper.min.css"], script[src*="cropper.min.js"]').forEach(el => el.remove());

        const cleanHTML = '<!DOCTYPE html>\n' + cloneDoc.outerHTML;

        const blob = new Blob([cleanHTML], { type: "text/html" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = isPortfolioPage ? "portfolio-updated.html" : "index-updated.html";
        a.click();
        
        if (wasEditMode) toggleBtn.click(); 
    });

    // Unsaved changes tracking
    window.hasUnsavedChanges = false;

    // MutationObserver to detect edits to actual site content
    function initChangeObserver() {
        const observer = new MutationObserver((mutations) => {
            if (!isEditMode) return; // Ignore mutations when not in edit mode
            if (!window.contentLoadedFromLive) return; // Ignore mutations during initial load
            
            let relevantChange = false;
            for (let mutation of mutations) {
                const target = mutation.target;
                if (target && target.closest && (
                    target.closest('#super-admin-panel') ||
                    target.closest('#admin-crop-modal') ||
                    target.closest('#admin-add-item-modal') ||
                    target.closest('#admin-text-toolbar') ||
                    target.closest('#custom-toast') ||
                    target.closest('.admin-element-toolbar') ||
                    target.closest('#admin-blog-modal') ||
                    target.closest('#admin-hero-bg-modal')
                )) {
                    continue;
                }
                relevantChange = true;
                break;
            }
            if (relevantChange) {
                window.hasUnsavedChanges = true;
                const saveBtnEl = document.getElementById('save-changes');
                if (saveBtnEl) {
                    saveBtnEl.style.boxShadow = '0 0 15px #20c997'; // Highlight save button
                }
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true
        });
    }

    window.addEventListener('beforeunload', (e) => {
        if (window.hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            return e.returnValue;
        }
    });

    if (exitAdminBtn) {
        exitAdminBtn.addEventListener("click", () => {
            localStorage.removeItem('admin_mode');
            const url = new URL(window.location.href);
            url.searchParams.delete('admin');
            url.searchParams.delete('edit');
            window.location.href = url.pathname + url.search;
        });
    }

    // ==========================================
    // 11. BLOG POSTS MANAGER CRUD
    // ==========================================
    const manageBlogsBtn = document.getElementById("manage-blogs-btn");
    const blogModal = document.getElementById("admin-blog-modal");
    const closeBlogModalBtn = blogModal ? blogModal.querySelector(".close-blog-modal") : null;
    const addBlogBtn = document.getElementById("admin-add-blog-btn");
    const blogListView = document.getElementById("blog-list-view");
    const blogEditorView = document.getElementById("blog-editor-view");
    const blogEditorBackBtn = document.getElementById("blog-editor-back");
    const blogEditorCancelBtn = document.getElementById("blog-editor-cancel");
    const blogEditorSaveBtn = document.getElementById("blog-editor-save-btn");
    
    // Blog Form Inputs
    const blogEditId = document.getElementById("blog-edit-id");
    const blogEditTitle = document.getElementById("blog-edit-title");
    const blogEditSlug = document.getElementById("blog-edit-slug");
    const blogEditCategory = document.getElementById("blog-edit-category");
    const blogEditCategoryCustom = document.getElementById("blog-edit-category-custom");
    const blogEditAuthor = document.getElementById("blog-edit-author");
    const blogEditDate = document.getElementById("blog-edit-date");
    const blogEditImage = document.getElementById("blog-edit-image");
    const blogEditReadtime = document.getElementById("blog-edit-readtime");
    const blogEditFeatured = document.getElementById("blog-edit-featured");
    const blogEditTags = document.getElementById("blog-edit-tags");
    const blogEditSummary = document.getElementById("blog-edit-summary");
    const blogEditContent = document.getElementById("blog-edit-content");
    const blogEditSeoTitle = document.getElementById("blog-edit-seo-title");
    const blogEditSeoDescription = document.getElementById("blog-edit-seo-description");
    
    // Accordion elements
    const blogSeoAccordionToggle = document.getElementById("blog-seo-accordion-toggle");
    const blogSeoAccordionContent = document.getElementById("blog-seo-accordion-content");
    const blogSeoChevron = document.getElementById("blog-seo-chevron");
    const blogFaqAccordionToggle = document.getElementById("blog-faq-accordion-toggle");
    const blogFaqAccordionContent = document.getElementById("blog-faq-accordion-content");
    const blogFaqChevron = document.getElementById("blog-faq-chevron");
    const blogAddFaqRowBtn = document.getElementById("blog-add-faq-row");
    const blogFaqListContainer = document.getElementById("blog-faq-list-container");

    let autoSlug = true;

    // Image Preview & Upload Helper for Blog CRUD
    const imagePreviewEl = document.getElementById("blog-edit-image-preview");
    function updateImagePreview() {
        if (imagePreviewEl && blogEditImage) {
            const val = blogEditImage.value.trim();
            if (val) {
                imagePreviewEl.src = val;
                imagePreviewEl.style.display = 'block';
            } else {
                imagePreviewEl.style.display = 'none';
                imagePreviewEl.src = '';
            }
        }
    }
    if (blogEditImage) {
        blogEditImage.addEventListener("input", updateImagePreview);
        blogEditImage.addEventListener("change", updateImagePreview);
    }

    const imageUploadTrigger = document.getElementById("blog-image-upload-trigger");
    const imageFileInput = document.getElementById("blog-edit-image-file");

    if (imageUploadTrigger && imageFileInput) {
        imageUploadTrigger.addEventListener("click", () => {
            imageFileInput.click();
        });

        imageFileInput.addEventListener("change", async () => {
            const file = imageFileInput.files[0];
            if (!file) return;

            if (!file.type.startsWith('image/')) {
                window.showToast("Please select an image file", "error");
                return;
            }

            try {
                window.showToast("Uploading image to Cloudinary...", "info");
                
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const base64Data = e.target.result;
                        const cloudinaryUrl = await uploadToCloudinary(base64Data);
                        const optimizedUrl = cloudinaryUrl.replace('/image/upload/', '/image/upload/f_auto,q_auto/');
                        
                        blogEditImage.value = optimizedUrl;
                        updateImagePreview();
                        window.showToast("Image uploaded successfully!", "success");
                    } catch (uploadErr) {
                        console.error("Cloudinary upload failed:", uploadErr);
                        window.showToast("Upload failed: " + uploadErr.message, "error");
                    }
                };
                reader.readAsDataURL(file);
            } catch (err) {
                console.error("Error reading file:", err);
                window.showToast("Error reading file: " + err.message, "error");
            }
        });
    }

    // Helper functions
    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function slugify(text) {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start
            .replace(/-+$/, '');            // Trim - from end
    }

    // Toggle custom category input based on select value
    if (blogEditCategory) {
        blogEditCategory.addEventListener("change", () => {
            if (blogEditCategory.value === "Other") {
                blogEditCategoryCustom.style.display = "block";
            } else {
                blogEditCategoryCustom.style.display = "none";
            }
        });
    }

    // Auto slug generation from title
    if (blogEditTitle && blogEditSlug) {
        blogEditTitle.addEventListener("input", () => {
            if (autoSlug) {
                blogEditSlug.value = slugify(blogEditTitle.value);
            }
        });
        blogEditSlug.addEventListener("input", () => {
            autoSlug = (blogEditSlug.value.trim() === '');
        });
    }

    // Accordions
    if (blogSeoAccordionToggle) {
        blogSeoAccordionToggle.addEventListener("click", () => {
            const isHidden = blogSeoAccordionContent.style.display === "none" || !blogSeoAccordionContent.style.display;
            blogSeoAccordionContent.style.display = isHidden ? "flex" : "none";
            blogSeoChevron.className = isHidden ? "fa-solid fa-chevron-up" : "fa-solid fa-chevron-down";
        });
    }
    if (blogFaqAccordionToggle) {
        blogFaqAccordionToggle.addEventListener("click", () => {
            const isHidden = blogFaqAccordionContent.style.display === "none" || !blogFaqAccordionContent.style.display;
            blogFaqAccordionContent.style.display = isHidden ? "flex" : "none";
            blogFaqChevron.className = isHidden ? "fa-solid fa-chevron-up" : "fa-solid fa-chevron-down";
        });
    }

    // HTML editor buttons
    document.querySelectorAll(".blog-tool-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const tag = btn.getAttribute("data-tag");
            if (blogEditContent) {
                insertHtmlTag(blogEditContent, tag);
            }
        });
    });

    function insertHtmlTag(textarea, tagType) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selected = text.substring(start, end);
        
        let replacement = '';
        if (tagType === 'h2') {
            replacement = `<h2>${selected || 'Heading 2'}</h2>`;
        } else if (tagType === 'h3') {
            replacement = `<h3>${selected || 'Heading 3'}</h3>`;
        } else if (tagType === 'p') {
            replacement = `<p>${selected || 'Paragraph text'}</p>`;
        } else if (tagType === 'bold') {
            replacement = `<strong>${selected || 'Bold text'}</strong>`;
        } else if (tagType === 'italic') {
            replacement = `<em>${selected || 'Italic text'}</em>`;
        } else if (tagType === 'link') {
            const url = prompt("Enter URL:", "https://");
            if (url === null) return;
            replacement = `<a href="${url}">${selected || 'Link text'}</a>`;
        } else if (tagType === 'ul') {
            replacement = `<ul>\n  <li>${selected || 'Item 1'}</li>\n  <li>Item 2</li>\n</ul>`;
        }
        
        textarea.value = text.substring(0, start) + replacement + text.substring(end);
        textarea.focus();
        textarea.selectionStart = start + replacement.length;
        textarea.selectionEnd = start + replacement.length;
    }

    // FAQ builders
    function createFaqRow(question = "", answer = "") {
        const div = document.createElement("div");
        div.className = "blog-faq-row";
        div.style = "display:flex; flex-direction:column; gap:6px; padding:12px; background:#111; border:1px solid #2a2a2a; border-radius:6px; position:relative;";
        div.innerHTML = `
            <button type="button" class="remove-faq-row-btn" style="position:absolute; top:8px; right:8px; background:none; border:none; color:#ff4a4a; cursor:pointer; font-size:1rem;" title="Remove"><i class="fa-solid fa-trash-can"></i></button>
            <div style="display:flex; flex-direction:column; gap:4px; margin-right:24px;">
                <label style="font-size:0.75rem; color:#888; font-weight:600;">Question</label>
                <input type="text" class="faq-row-q" placeholder="e.g. Can you format interior files for KDP bleed?" value="${escapeHtml(question)}" style="padding:8px; border-radius:4px; border:1px solid #444; background:#222; color:#fff; font-size:0.8rem; width:100%; box-sizing:border-box;">
            </div>
            <div style="display:flex; flex-direction:column; gap:4px; margin-right:24px;">
                <label style="font-size:0.75rem; color:#888; font-weight:600;">Answer</label>
                <textarea class="faq-row-a" rows="2" placeholder="e.g. Yes, we format books to support bleed parameters..." style="padding:8px; border-radius:4px; border:1px solid #444; background:#222; color:#fff; font-size:0.8rem; font-family:inherit; resize:vertical; width:100%; box-sizing:border-box;">${escapeHtml(answer)}</textarea>
            </div>
        `;
        div.querySelector(".remove-faq-row-btn").addEventListener("click", () => {
            div.remove();
        });
        return div;
    }

    if (blogAddFaqRowBtn) {
        blogAddFaqRowBtn.addEventListener("click", () => {
            const row = createFaqRow();
            blogFaqListContainer.appendChild(row);
        });
    }

    // Modal view toggles
    if (manageBlogsBtn) {
        manageBlogsBtn.addEventListener("click", () => {
            // Close other panels
            document.querySelectorAll('#social-links-panel, #pricing-links-panel, #sections-panel, #filters-panel, #flipbook-panel, #hero-card-panel, #theme-panel, #particle-panel').forEach(p => p.style.display = 'none');
            
            blogModal.style.display = 'flex';
            showListView();
            loadBlogsIntoTable();
        });
    }

    if (closeBlogModalBtn) {
        closeBlogModalBtn.addEventListener("click", () => {
            blogModal.style.display = 'none';
        });
    }

    if (addBlogBtn) {
        addBlogBtn.addEventListener("click", () => {
            openBlogEditor();
        });
    }

    if (blogEditorBackBtn) {
        blogEditorBackBtn.addEventListener("click", () => {
            showListView();
        });
    }

    if (blogEditorCancelBtn) {
        blogEditorCancelBtn.addEventListener("click", () => {
            showListView();
        });
    }

    function showListView() {
        blogListView.style.display = 'flex';
        blogEditorView.style.display = 'none';
    }

    function showEditorView() {
        blogListView.style.display = 'none';
        blogEditorView.style.display = 'flex';
    }

    // Load blogs for listing
    async function loadBlogsIntoTable() {
        const tbody = document.getElementById("blog-posts-table-body");
        if (!tbody) return;
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color:#aaa;"><i class="fa-solid fa-spinner fa-spin"></i> Loading posts...</td></tr>`;
        
        let posts = [];
        try {
            if (window.supabaseClient) {
                const { data, error } = await window.supabaseClient
                    .from('site_content')
                    .select('html_content')
                    .eq('id', 'blogs_json')
                    .single();
                if (error) throw error;
                if (data && data.html_content) {
                    posts = JSON.parse(data.html_content);
                }
            } else {
                throw new Error("Supabase client not connected");
            }
        } catch (err) {
            console.error("Error fetching blogs for table:", err);
            posts = window.blogPostsList || [];
        }
        
        // Cache globally
        window.blogPostsList = posts;
        
        if (posts.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color:#666;">No blog posts found. Click "Add New Post" to create one.</td></tr>`;
            return;
        }
        
        tbody.innerHTML = posts.map(post => {
            const dateStr = post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Draft';
            const featText = post.is_featured ? '<span style="color:#28a745;"><i class="fa-solid fa-circle-check"></i> Yes</span>' : '<span style="color:#666;">No</span>';
            return `
                <tr style="border-bottom:1px solid #2a2a2a; transition:background 0.2s;" onmouseover="this.style.background='#1a1a1a'" onmouseout="this.style.background='transparent'">
                    <td style="padding:12px 10px; font-weight:600; color:#fff; max-width:250px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(post.title)}</td>
                    <td style="padding:12px 10px; color:#aaa;">${escapeHtml(post.category)}</td>
                    <td style="padding:12px 10px; color:#888;">${dateStr}</td>
                    <td style="padding:12px 10px; text-align:center;">${featText}</td>
                    <td style="padding:12px 10px; text-align:right;">
                        <button type="button" class="admin-blog-edit-btn" data-id="${post.id}" style="padding:4px 8px; border:1px solid #444; border-radius:4px; background:#222; color:#fff; cursor:pointer; font-size:0.75rem; margin-right:4px;"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
                        <button type="button" class="admin-blog-delete-btn" data-id="${post.id}" style="padding:4px 8px; border:none; border-radius:4px; background:#dc3545; color:#fff; cursor:pointer; font-size:0.75rem;"><i class="fa-solid fa-trash"></i> Delete</button>
                    </td>
                </tr>
            `;
        }).join('');
        
        // Add events
        tbody.querySelectorAll(".admin-blog-edit-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id");
                openBlogEditor(id);
            });
        });
        
        tbody.querySelectorAll(".admin-blog-delete-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id");
                deleteBlogPost(id);
            });
        });
    }

    // Open editor to edit or create a post
    function openBlogEditor(id = null) {
        showEditorView();
        
        // Reset Accordions
        if (blogSeoAccordionContent) blogSeoAccordionContent.style.display = 'none';
        if (blogSeoChevron) blogSeoChevron.className = 'fa-solid fa-chevron-down';
        if (blogFaqAccordionContent) blogFaqAccordionContent.style.display = 'none';
        if (blogFaqChevron) blogFaqChevron.className = 'fa-solid fa-chevron-down';
        
        // Clear FAQ container
        if (blogFaqListContainer) blogFaqListContainer.innerHTML = '';
        
        if (id) {
            // Edit mode
            document.getElementById("blog-editor-title").innerText = "Edit Blog Post";
            const post = (window.blogPostsList || []).find(p => p.id === id);
            if (!post) {
                window.showToast("Post details not found", "error");
                showListView();
                return;
            }
            
            blogEditId.value = post.id;
            blogEditTitle.value = post.title || '';
            blogEditSlug.value = post.slug || '';
            
            // Category setup
            const knownCategories = ["Book Formatting", "Book Cover Design", "KDP Publishing", "Self-Publishing"];
            if (knownCategories.includes(post.category)) {
                blogEditCategory.value = post.category;
                blogEditCategoryCustom.style.display = "none";
                blogEditCategoryCustom.value = "";
            } else {
                blogEditCategory.value = "Other";
                blogEditCategoryCustom.value = post.category || '';
                blogEditCategoryCustom.style.display = "block";
            }
            
            blogEditAuthor.value = post.author_name || 'Loufy Publisher';
            
            // Format ISO date to datetime-local value (YYYY-MM-DDTHH:MM)
            if (post.published_at) {
                const dateObj = new Date(post.published_at);
                const offsetMs = dateObj.getTimezoneOffset() * 60 * 1000;
                const localISO = (new Date(dateObj.getTime() - offsetMs)).toISOString().slice(0, 16);
                blogEditDate.value = localISO;
            } else {
                blogEditDate.value = '';
            }
            
            blogEditImage.value = post.image_url || '';
            blogEditReadtime.value = post.read_time || 5;
            blogEditFeatured.checked = !!post.is_featured;
            blogEditTags.value = (post.tags || []).join(', ');
            blogEditSummary.value = post.summary || '';
            blogEditContent.value = post.content || '';
            blogEditSeoTitle.value = post.seo_title || '';
            blogEditSeoDescription.value = post.seo_description || '';
            
            // Load FAQs
            if (post.faqs && Array.isArray(post.faqs)) {
                post.faqs.forEach(faq => {
                    const row = createFaqRow(faq.question, faq.answer);
                    blogFaqListContainer.appendChild(row);
                });
            }
            
            autoSlug = false;
        } else {
            // Create mode
            document.getElementById("blog-editor-title").innerText = "Add New Blog Post";
            
            blogEditId.value = '';
            blogEditTitle.value = '';
            blogEditSlug.value = '';
            blogEditCategory.value = 'Book Formatting';
            blogEditCategoryCustom.value = '';
            blogEditCategoryCustom.style.display = 'none';
            blogEditAuthor.value = 'Loufy Publisher';
            
            // Set current time local
            const now = new Date();
            const offsetMs = now.getTimezoneOffset() * 60 * 1000;
            const localISO = (new Date(now.getTime() - offsetMs)).toISOString().slice(0, 16);
            blogEditDate.value = localISO;
            
            blogEditImage.value = 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&fit=crop';
            blogEditReadtime.value = 5;
            blogEditFeatured.checked = false;
            blogEditTags.value = '';
            blogEditSummary.value = '';
            blogEditContent.value = '';
            blogEditSeoTitle.value = '';
            blogEditSeoDescription.value = '';
            
            autoSlug = true;
        }
        updateImagePreview();
    }

    // Delete Blog Post
    async function deleteBlogPost(id) {
        if (!confirm("Are you sure you want to delete this blog post? This action is permanent.")) return;
        
        try {
            window.showToast("Deleting blog post...", "info");
            const posts = (window.blogPostsList || []).filter(p => p.id !== id);
            const updatedJson = JSON.stringify(posts);
            
            if (!window.supabaseClient) throw new Error("Database not connected");
            const { error } = await window.supabaseClient
                .from('site_content')
                .upsert({ id: 'blogs_json', html_content: updatedJson });
                
            if (error) throw error;
            
            window.showToast("Post deleted successfully!", "success");
            await loadBlogsIntoTable();
            if (typeof window.initBlogSection === 'function') {
                window.initBlogSection();
            }
        } catch (err) {
            console.error("Failed to delete blog post:", err);
            window.showToast("Error deleting post: " + err.message, "error");
        }
    }

    // Save Blog Post
    if (blogEditorSaveBtn) {
        blogEditorSaveBtn.addEventListener("click", async () => {
            const editId = blogEditId.value;
            const titleVal = blogEditTitle.value.trim();
            const rawSlug = blogEditSlug.value.trim();
            const catSelectVal = blogEditCategory.value;
            const catCustomVal = blogEditCategoryCustom.value.trim();
            const authorVal = blogEditAuthor.value;
            const dateVal = blogEditDate.value;
            const imageVal = blogEditImage.value.trim();
            const readTimeVal = blogEditReadtime.value;
            const featuredVal = blogEditFeatured.checked;
            const tagsVal = blogEditTags.value.trim();
            const summaryVal = blogEditSummary.value.trim();
            const contentVal = blogEditContent.value.trim();
            const seoTitleVal = blogEditSeoTitle.value.trim();
            const seoDescriptionVal = blogEditSeoDescription.value.trim();
            
            if (!titleVal) {
                window.showToast("Please enter a title", "error");
                blogEditTitle.focus();
                return;
            }
            if (!rawSlug) {
                window.showToast("Please enter a slug", "error");
                blogEditSlug.focus();
                return;
            }
            
            const cleanSlug = slugify(rawSlug);
            if (!cleanSlug) {
                window.showToast("Invalid slug. It should contain lowercase letters, numbers, and dashes.", "error");
                blogEditSlug.focus();
                return;
            }
            
            // Check for slug duplicates (excluding the post being edited itself)
            const slugExists = (window.blogPostsList || []).some(p => p.slug === cleanSlug && p.id !== editId);
            if (slugExists) {
                window.showToast("A blog post with this slug already exists. Slugs must be unique.", "error");
                blogEditSlug.focus();
                return;
            }
            
            const categoryVal = catSelectVal === "Other" ? catCustomVal : catSelectVal;
            if (!categoryVal) {
                window.showToast("Please select or enter a category", "error");
                if (catSelectVal === "Other") {
                    blogEditCategoryCustom.focus();
                } else {
                    blogEditCategory.focus();
                }
                return;
            }
            
            if (!dateVal) {
                window.showToast("Please select a publish date", "error");
                blogEditDate.focus();
                return;
            }
            
            if (!summaryVal) {
                window.showToast("Please enter a summary/excerpt", "error");
                blogEditSummary.focus();
                return;
            }
            
            if (!contentVal) {
                window.showToast("Please enter body content", "error");
                blogEditContent.focus();
                return;
            }
            
            // Build FAQ array
            const faqsArray = [];
            const faqRows = blogFaqListContainer ? blogFaqListContainer.querySelectorAll(".blog-faq-row") : [];
            faqRows.forEach(row => {
                const q = row.querySelector(".faq-row-q").value.trim();
                const a = row.querySelector(".faq-row-a").value.trim();
                if (q && a) {
                    faqsArray.push({ question: q, answer: a });
                }
            });
            
            // Construct post object
            const blogPost = {
                id: editId || Date.now().toString(),
                slug: cleanSlug,
                title: titleVal,
                summary: summaryVal,
                content: contentVal,
                image_url: imageVal || 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&fit=crop',
                category: categoryVal,
                tags: tagsVal ? tagsVal.split(',').map(t => t.trim()).filter(Boolean) : [],
                author_name: authorVal,
                published_at: new Date(dateVal).toISOString(),
                read_time: parseInt(readTimeVal) || 5,
                is_featured: featuredVal,
                seo_title: seoTitleVal || `${titleVal} | Loufy Publisher`,
                seo_description: seoDescriptionVal || summaryVal,
                faqs: faqsArray
            };
            
            blogEditorSaveBtn.disabled = true;
            blogEditorSaveBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Saving...`;
            
            try {
                const posts = [...(window.blogPostsList || [])];
                const existingIndex = posts.findIndex(p => p.id === blogPost.id);
                
                if (existingIndex > -1) {
                    posts[existingIndex] = blogPost;
                } else {
                    posts.push(blogPost);
                }
                
                if (featuredVal) {
                    // Reset is_featured on other posts
                    posts.forEach(p => {
                        if (p.id !== blogPost.id) p.is_featured = false;
                    });
                }
                
                const updatedJson = JSON.stringify(posts);
                
                if (!window.supabaseClient) throw new Error("Database not connected");
                const { error } = await window.supabaseClient
                    .from('site_content')
                    .upsert({ id: 'blogs_json', html_content: updatedJson });
                    
                if (error) throw error;
                
                window.showToast("Blog post saved and synced to Supabase successfully!", "success");
                
                // Update local memory cache
                window.blogPostsList = posts;
                
                // Go back to list view and reload table
                showListView();
                await loadBlogsIntoTable();
                
                // Trigger dynamic reload on home page if the function is active
                if (typeof window.initBlogSection === 'function') {
                    window.initBlogSection();
                }
            } catch (err) {
                console.error("Failed to save blog post:", err);
                window.showToast("Error saving post: " + err.message, "error");
            } finally {
                blogEditorSaveBtn.disabled = false;
                blogEditorSaveBtn.innerHTML = `<i class="fa-solid fa-check"></i> Save & Sync to Supabase`;
            }
        });
    }

    initTextToolbarEvents();
    loadSavedContent();
});
