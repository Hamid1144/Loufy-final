document.addEventListener("DOMContentLoaded", () => {
    
    const isPortfolioPage = window.location.pathname.split('/').pop().includes("portfolio.html") || !document.querySelector('.hero');
    const storageKey = isPortfolioPage ? "savedPortfolioPageContent" : "savedIndexPageContent";

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
            <button id="manage-theme" class="admin-btn" style="background:#00bcd4; color:#fff;"><i class="fa-solid fa-palette"></i> Customize Theme</button>
            <button id="manage-hero-card" class="admin-btn" style="background:#ff5722; color:#fff;"><i class="fa-solid fa-wand-magic-sparkles"></i> Edit Hero Content</button>
            <button id="change-hero-bg" class="admin-btn" style="background:#7209b7;"><i class="fa-solid fa-image"></i> Change Hero Image</button>
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
            <p style="font-size:0.75rem; color:#aaa; margin-bottom:10px;">Customize layout and content of the hero glass card.</p>
            
            <!-- Positioning & Styles -->
            <div style="margin-bottom:12px; padding:10px; background:#1a1a1a; border-radius:6px; border:1px solid #333; display:flex; flex-direction:column; gap:8px;">
                <label style="font-size:0.72rem; color:#ff5722; font-weight:700; text-transform:uppercase; letter-spacing:.05em; display:block;"><i class="fa-solid fa-sliders"></i> Layout & Style</label>
                
                <div>
                    <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#ccc; margin-bottom:2px;">
                        <span>Horizontal Offset</span>
                        <span id="hero-offset-x-val">-40px</span>
                    </div>
                    <input type="range" id="hero-offset-x" min="-150" max="150" value="-40" style="width:100%;">
                </div>
                <div>
                    <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#ccc; margin-bottom:2px;">
                        <span>Vertical Offset</span>
                        <span id="hero-offset-y-val">0px</span>
                    </div>
                    <input type="range" id="hero-offset-y" min="-150" max="150" value="0" style="width:100%;">
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
    const heroCardWidthVal = document.getElementById("hero-card-width-val");
    const heroCardRadiusVal = document.getElementById("hero-card-radius-val");
    const heroCardBlurVal = document.getElementById("hero-card-blur-val");
    const heroCardOpacityVal = document.getElementById("hero-card-opacity-val");

    const heroButtonsEditorList = document.getElementById("hero-buttons-editor-list");
    const heroAddButtonBtn = document.getElementById("hero-add-button-btn");
    const heroTagsEditorList = document.getElementById("hero-tags-editor-list");
    const heroAddTagBtn = document.getElementById("hero-add-tag-btn");

    const heroBadgeTextInput = document.getElementById("hero-badge-text-input");
    const heroTitleTextInput = document.getElementById("hero-title-text-input");
    const heroDescTextInput = document.getElementById("hero-desc-text-input");
    const heroExpTextInput = document.getElementById("hero-exp-text-input");
    const heroProjTextInput = document.getElementById("hero-proj-text-input");
    
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
            if (p) p.classList.toggle("active");
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
            document.querySelectorAll('#social-links-panel, #pricing-links-panel, #sections-panel, #filters-panel, #flipbook-panel, #hero-card-panel').forEach(p => p.style.display = 'none');
            
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
                } else {
                    window.showToast("Hero image not found on this page.", "error");
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
                const linkVal = existingBtn && existingBtn.getAttribute('href') !== '#' ? existingBtn.getAttribute('href') : '';

                const div = document.createElement('div');
                div.style.background = '#222';
                div.style.padding = '8px';
                div.style.borderRadius = '4px';
                
                div.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                        <span style="font-size:0.85rem;">${soc.icon} ${soc.name}</span>
                        <input type="checkbox" id="check-${soc.id}" ${isEnabled ? 'checked' : ''}>
                    </div>
                    <input type="text" id="input-${soc.id}" value="${linkVal}" placeholder="URL..." style="width:100%; padding:4px; border-radius:4px; border:1px solid #555; background:#111; color:#fff; font-size:0.75rem;">
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
                        newIcon.href = input.value.trim() || "#";
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
                document.querySelectorAll('#social-links-panel,#pricing-links-panel,#sections-panel,#filters-panel,#theme-panel,#hero-card-panel').forEach(p => p.style.display = 'none');
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
    function applyReplacement() {
        if (!_rpUrl) return;
        var latest = getFlipbookPagesLS(_rpN);
        if (_rpIdx < 0 || _rpIdx >= latest.length) { window.showToast('Page not found.','error'); return; }
        latest[_rpIdx] = _rpUrl;
        setFlipbookPagesLS(_rpN, latest);
        closeReplaceModal();
        refreshFlipbook();
        window.showToast('Page ' + (_rpIdx+1) + ' replaced!', 'success');
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
        cropToBookRatio(src, size, function(cropped) {
            var latest = getFlipbookPagesLS(n);
            if (idx < 0 || idx >= latest.length) return;
            latest[idx] = cropped;
            setFlipbookPagesLS(n, latest);
            refreshFlipbook();
            window.showToast('Page ' + (idx+1) + ' replaced!', 'success');
        });
    }

    function addFlipbookPage(src) {
        var n    = getFlipbookN();
        var size = getCurrentSize();
        cropToBookRatio(src, size, function(cropped) {
            var latest = getFlipbookPagesLS(n);
            latest.push(cropped);
            setFlipbookPagesLS(n, latest);
            refreshFlipbook();
            window.showToast('Page added & auto-fitted to ' + SIZE_PRESETS[size].label + '!', 'success');
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
        document.querySelectorAll('#social-links-panel,#pricing-links-panel,#sections-panel,#filters-panel,#theme-panel,#hero-card-panel').forEach(p => p.style.display = 'none');
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
            if (!el.closest('#super-admin-panel') && !el.closest('#admin-crop-modal')) {
                // If it's a link, setup the toolbar so they can edit the URL too
                if (el.tagName === 'A' && !el.hasAttribute('data-pricing')) {
                    setupContainerToolbar(el);
                }
                
                // Allow the entire element (even with mixed children) to be edited
                el.setAttribute("data-admin-text", "true");
            }
        });

        document.querySelectorAll('.service-card, .portfolio-card, .pricing-card, .faq-item, .testimonial-card, img:not(.portfolio-thumb img)').forEach(el => {
            if (!el.closest('.editable-container') && !el.closest('#super-admin-panel') && !el.closest('#admin-crop-modal')) {
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

    saveCropBtn.addEventListener('click', () => {
        if (!currentImageTarget) return;

        if (cropperInstance) {
            let canvas = cropperInstance.getCroppedCanvas({
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high'
            });
            if (canvas) {
                // Determine target parameters based on the currentImageTarget
                let maxDim = 2560;
                let quality = 0.90;
                if (currentImageTarget.closest('.portfolio-card[data-cat="covers"]')) {
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
                    
                    const isPng = /^data:image\/png/i.test(previewImage.src) || /\.png(\?|$)/i.test(previewImage.src);
                    if (!isPng) {
                        resizedCtx.fillStyle = '#ffffff';
                        resizedCtx.fillRect(0, 0, w, h);
                    }
                    resizedCtx.drawImage(canvas, 0, 0, w, h);
                    canvas = resizedCanvas;
                }
                
                const isPng = /^data:image\/png/i.test(previewImage.src) || /\.png(\?|$)/i.test(previewImage.src);
                const mimeType = isPng ? 'image/png' : 'image/jpeg';
                const outQuality = isPng ? undefined : quality;
                const base64Data = canvas.toDataURL(mimeType, outQuality);
                currentImageTarget.src = base64Data;
                currentImageTarget.setAttribute('data-optimized', 'webp');
            }
        } else {
            // Bypass cropper, but still compress!
            const src = previewImage.src;
            if (src && src.startsWith('data:image/')) {
                let maxDim = 2560;
                let quality = 0.90;
                if (currentImageTarget.closest('.portfolio-card[data-cat="covers"]')) {
                    maxDim = 2560;
                    quality = 0.98;
                } else if (currentImageTarget.closest('.portfolio-card[data-cat="children"], .portfolio-card[data-flipbook="true"], .flipbook-page')) {
                    maxDim = 2560;
                    quality = 0.98;
                } else if (currentImageTarget.closest('.testimonial-card, .testimonial-author, .testimonial-img')) {
                    maxDim = 800;
                    quality = 0.98;
                }
                compressBase64Image(src, maxDim, quality).then(compressed => {
                    currentImageTarget.src = compressed;
                    currentImageTarget.setAttribute('data-optimized', 'webp');
                });
            } else {
                currentImageTarget.src = src;
                currentImageTarget.removeAttribute('data-optimized');
            }
        }
        closeCropModalHandler();
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
                    if (w <= maxDim && h <= maxDim) {
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
                    
                    const isPng = base64Str.startsWith('data:image/png');
                    if (!isPng) {
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, w, h);
                    }
                    
                    ctx.drawImage(img, 0, 0, w, h);
                    
                    const mimeType = isPng ? 'image/png' : 'image/jpeg';
                    const outQuality = isPng ? undefined : 0.98;
                    const compressedData = canvas.toDataURL(mimeType, outQuality);
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
            // Compress all base64 images in the live DOM
            const allImgs = Array.from(document.querySelectorAll('img'));
            const compressionPromises = allImgs.map(async (img) => {
                try {
                    const src = img.src;
                    if (src && src.startsWith('data:image/')) {
                        if (img.getAttribute('data-optimized') === 'webp') {
                            return; // Already optimized, bypass!
                        }
                        let maxDim = 2560;
                        let quality = 0.98;
                        if (img.closest('.portfolio-card[data-cat="covers"]')) {
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
                        img.src = compressed;
                        img.setAttribute('data-optimized', 'true');
                    }
                } catch (innerErr) {
                    console.error("Failed to compress image in save sweep:", innerErr);
                }
            });
            await Promise.all(compressionPromises);

            saveBtn.innerText = "Saving to Cloud...";

            const clone = document.body.cloneNode(true);
            const adminElements = clone.querySelectorAll('#super-admin-panel, #admin-crop-modal, #admin-add-item-modal, #admin-text-toolbar');
            adminElements.forEach(el => el.remove());

            clone.querySelectorAll('.admin-element-toolbar').forEach(tb => tb.remove());
            clone.querySelectorAll('.editable-container').forEach(c => c.classList.remove('editable-container'));
            clone.querySelectorAll('.flipbook-live-edit-btn').forEach(b => b.remove());
            clone.querySelectorAll('#fp-rp-overlay, #fp-rp-modal').forEach(el => el.remove()); // don't save replace modal
            clone.querySelectorAll('#custom-toast').forEach(toast => toast.remove()); // don't save stuck toast messages
            
            // Ensure background animation elements are not serialized into database
            clone.querySelectorAll('#bg-anim-wrap, #bg-anim-canvas, #bg-hero-glow').forEach(el => el.remove());

            // Clean up marquee container from clone so it's not serialized
            clone.querySelectorAll('.covers-marquee-container').forEach(el => el.remove());
            
            // Reset inline display style on covers grid cards so they save in a neutral state
            // (they may have display:none from the marquee mode — this ensures fresh load always works)
            clone.querySelectorAll('.portfolio-grid .portfolio-card[data-cat="covers"]').forEach(card => {
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
                .upsert({ id: pageId, html_content: clone.innerHTML });
                
            if (error) throw error;

            // Update local cache safely (ignore quota errors)
            try {
                localStorage.setItem('supabase_cached_html_' + pageId, clone.innerHTML);
            } catch (cacheErr) {
                console.warn("Local storage cache quota exceeded on save:", cacheErr);
            }
            
            // Notify user immediately that the save succeeded! No waiting for background sync.
            window.showToast("Changes saved successfully!", "success");
            
            window.hasUnsavedChanges = false;
            const saveBtnEl = document.getElementById('save-changes');
            if (saveBtnEl) {
                saveBtnEl.style.boxShadow = ''; // Clear highlight
            }
            
            // 2. Synchronize portfolio grid and filters to the other page in the background (ASYNCHRONOUS)
            (async () => {
                try {
                    const { data: otherData, error: otherFetchError } = await window.supabaseClient
                        .from('site_content')
                        .select('html_content')
                        .eq('id', otherPageId)
                        .single();

                    if (!otherFetchError && otherData && otherData.html_content) {
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
                            await window.supabaseClient
                                .from('site_content')
                                .upsert({ id: otherPageId, html_content: updatedOtherHtml });
                        }
                    }
                } catch (syncErr) {
                    console.error("Background portfolio sync failed:", syncErr);
                }
            })();

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

        renderHeroButtonsList();
        renderHeroTagsList();
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

    if (manageHeroCardBtn) {
        if (isPortfolioPage) {
            manageHeroCardBtn.style.display = 'none';
        } else {
            manageHeroCardBtn.addEventListener("click", () => {
                document.querySelectorAll('#social-links-panel, #pricing-links-panel, #sections-panel, #filters-panel, #theme-panel, #flipbook-panel').forEach(p => p.style.display = 'none');
                
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

        const isAdmin = localStorage.getItem('admin_mode') === 'true' || 
                        window.location.search.includes('admin=true') || 
                        window.location.search.includes('edit=true') || 
                        window.location.hash === '#admin';

        if (!isAdmin || !window.supabaseClient) {
            const panel = document.getElementById('super-admin-panel');
            if (panel) panel.remove();
            const textToolbar = document.getElementById('admin-text-toolbar');
            if (textToolbar) textToolbar.remove();
            
            document.body.classList.add('loaded');
            hideLoader();
            return;
        }
        
        try {
            const pageId = isPortfolioPage ? 'portfolio' : 'index';
            const fetchPromise = window.supabaseFetchPromise || window.supabaseClient
                .from('site_content')
                .select('html_content')
                .eq('id', pageId)
                .single();
            const { data, error } = await fetchPromise;
                
            if (error && error.code !== 'PGRST116') throw error;

            if (data && data.html_content) {
                const cacheKey = `supabase_cached_html_${pageId}`;
                const cachedHTML = localStorage.getItem(cacheKey);
                
                // Always update the cache with the latest content safely
                try {
                    localStorage.setItem(cacheKey, data.html_content);
                } catch (cacheErr) {
                    console.warn("Local storage cache quota exceeded on load:", cacheErr);
                }
                
                // Helper to clean a DOM body for comparison
                const getCleanBodyHTML = (bodyEl) => {
                    const clone = bodyEl.cloneNode(true);
                    clone.querySelectorAll('#super-admin-panel, #admin-crop-modal, #admin-add-item-modal, #admin-text-toolbar').forEach(el => el.remove());
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

                // If we loaded from cache and the fetched content matches the cache, or currently loaded static HTML matches exactly, do nothing!
                if ((window.contentLoadedFromCache && cachedHTML === data.html_content) || currentCleanHTML === fetchedCleanHTML) {
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
        } catch (err) {
            console.error("Error loading cloud content:", err);
        } finally {
            document.body.classList.add('loaded');
            hideLoader();
            initChangeObserver();
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
        
        // Remove admin control panels and modals
        cloneDoc.querySelectorAll('#super-admin-panel, #admin-crop-modal, #admin-add-item-modal, #admin-category-selector-modal, #admin-text-toolbar, .admin-element-toolbar, #fp-rp-overlay, #fp-rp-modal, #custom-toast').forEach(el => el.remove());
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
                    target.closest('.admin-element-toolbar')
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

    initTextToolbarEvents();
    loadSavedContent();
});
