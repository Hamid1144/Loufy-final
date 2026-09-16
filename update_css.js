const fs = require('fs');

let css = fs.readFileSync('./style.css', 'utf-8');

const startIndex = css.indexOf('/* ── WEBSITES I CREATED SHOWCASE CARDS (STACKED 1-COLUMN) ── */');
const endIndex = css.indexOf('/* ── WEBSITE PROJECT DETAIL POPUP MODAL ── */');

if (startIndex !== -1 && endIndex !== -1) {
    const newCss = `/* ── WEBSITES I CREATED SHOWCASE CARDS (STACKED 1-COLUMN) ── */
.portfolio-card[data-cat="websites"] {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.7) !important;
  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
  border-radius: 20px !important;
  overflow: hidden !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05) !important;
  transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1), box-shadow 0.4s ease, border-color 0.4s ease !important;
  margin-bottom: 40px !important;
  width: 100% !important;
  position: relative !important;
  cursor: pointer !important;
}

.portfolio-card[data-cat="websites"]::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent, #F4B400), var(--primary, #184C3A), var(--accent, #F4B400));
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: 10;
}

.portfolio-card[data-cat="websites"][style*="display: none"],
.portfolio-card[data-cat="websites"][style*="display:none"],
.portfolio-card[data-cat="websites"].card-hidden {
  display: none !important;
}

.portfolio-card[data-cat="websites"]:hover {
  transform: translateY(-6px) !important;
  box-shadow: 0 24px 50px rgba(0, 0, 0, 0.12) !important;
  border-color: rgba(var(--primary-rgb, 24, 76, 58), 0.2) !important;
}

.portfolio-card[data-cat="websites"]:hover::before {
  opacity: 1;
}

/* Browser mockup top bar */
.portfolio-card[data-cat="websites"] .browser-bar {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  padding: 10px 20px !important;
  background: rgba(240, 244, 248, 0.8) !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06) !important;
}

.portfolio-card[data-cat="websites"] .browser-dots {
  display: flex !important;
  gap: 7px !important;
}

.portfolio-card[data-cat="websites"] .browser-dot {
  width: 11px !important;
  height: 11px !important;
  border-radius: 50% !important;
  display: inline-block !important;
  opacity: 0.9;
}

.portfolio-card[data-cat="websites"]:hover .browser-dot {
  opacity: 1;
}

.portfolio-card[data-cat="websites"] .browser-dot.red { background: #ff5f56 !important; }
.portfolio-card[data-cat="websites"] .browser-dot.yellow { background: #ffbd2e !important; }
.portfolio-card[data-cat="websites"] .browser-dot.green { background: #27c93f !important; }

.portfolio-card[data-cat="websites"] .browser-url-bar {
  flex: 1 !important;
  max-width: 450px !important;
  background: rgba(255, 255, 255, 0.95) !important;
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
  border-radius: 20px !important;
  padding: 5px 16px !important;
  font-size: 0.78rem !important;
  color: #64748b !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  margin-left: 12px !important;
  transition: all 0.3s ease !important;
}

.portfolio-card[data-cat="websites"]:hover .browser-url-bar {
  border-color: rgba(var(--primary-rgb, 24, 76, 58), 0.2) !important;
  color: #334155 !important;
}

/* Card inner content (Desktop) */
@media (min-width: 900px) {
  .portfolio-card[data-cat="websites"] .website-card-body {
    display: grid !important;
    grid-template-columns: 1.35fr 1fr !important;
    gap: 36px !important;
    padding: 32px !important;
    align-items: center !important;
  }
}

@media (max-width: 899px) and (min-width: 769px) {
  .portfolio-card[data-cat="websites"] .website-card-body {
    display: flex !important;
    flex-direction: column !important;
    padding: 24px !important;
    gap: 22px !important;
  }
}

.portfolio-card[data-cat="websites"] .portfolio-thumb {
  width: 100% !important;
  height: auto !important;
  aspect-ratio: 16 / 10 !important;
  border-radius: 12px !important;
  overflow: hidden !important;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08) !important;
  border: 1px solid rgba(0, 0, 0, 0.06) !important;
  background: #f8fafc !important;
  position: relative !important;
}

.portfolio-card[data-cat="websites"] .portfolio-thumb img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  object-position: top center !important;
  transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1) !important;
  display: block !important;
}

.portfolio-card[data-cat="websites"]:hover .portfolio-thumb img {
  transform: scale(1.03) !important;
}

/* Ensure info and buttons are completely visible and interactive */
.portfolio-card[data-cat="websites"] .portfolio-info {
  position: static !important;
  width: 100% !important;
  background: transparent !important;
  color: inherit !important;
  padding: 0 !important;
  opacity: 1 !important;
  transform: none !important;
  pointer-events: auto !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  z-index: 2 !important;
}

.portfolio-card[data-cat="websites"] .portfolio-info .tags {
  margin-bottom: 16px !important;
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 8px !important;
}

.portfolio-card[data-cat="websites"] .portfolio-info .tags span {
  background: rgba(var(--primary-rgb, 24, 76, 58), 0.08) !important;
  color: var(--primary, #184C3A) !important;
  border: 1px solid rgba(var(--primary-rgb, 24, 76, 58), 0.15) !important;
  font-size: 0.75rem !important;
  font-weight: 600 !important;
  padding: 5px 14px !important;
  border-radius: 20px !important;
  letter-spacing: 0.3px;
}

.portfolio-card[data-cat="websites"] .portfolio-info h3 {
  font-size: 1.55rem !important;
  font-weight: 800 !important;
  margin-bottom: 12px !important;
  color: var(--dark, #111827) !important;
  line-height: 1.3 !important;
}

.portfolio-card[data-cat="websites"] .portfolio-desc {
  color: #475569 !important;
  font-size: 0.95rem !important;
  line-height: 1.7 !important;
  margin-bottom: 26px !important;
}

.portfolio-card[data-cat="websites"] .website-card-actions {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 12px !important;
  align-items: center !important;
  margin-top: 4px !important;
}

.portfolio-card[data-cat="websites"] .btn-open-website-details {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
  padding: 12px 24px !important;
  font-size: 0.9rem !important;
  font-weight: 700 !important;
  border-radius: 50px !important;
  background: #f1f5f9 !important;
  border: 1px solid #cbd5e1 !important;
  color: #1e293b !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
}

.portfolio-card[data-cat="websites"] .btn-open-website-details:hover {
  background: var(--primary, #184C3A) !important;
  border-color: var(--primary, #184C3A) !important;
  color: #ffffff !important;
  transform: translateY(-2px) !important;
}

.portfolio-card[data-cat="websites"] .btn-visit-website {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
  padding: 12px 28px !important;
  font-size: 0.9rem !important;
  font-weight: 800 !important;
  border-radius: 50px !important;
  width: fit-content !important;
  text-decoration: none !important;
  background: var(--accent, #F4B400) !important;
  color: #111 !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 4px 15px rgba(var(--accent-rgb, 244, 180, 0), 0.3) !important;
  border: 1px solid transparent !important;
}

.portfolio-card[data-cat="websites"] .btn-visit-website:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 10px 25px rgba(var(--accent-rgb, 244, 180, 0), 0.45) !important;
  background: var(--primary, #184C3A) !important;
  color: #fff !important;
}

/* ── MOBILE VIEW OPTIMIZATIONS FOR WEBSITE CARD (< 768px) ── */
@media (max-width: 768px) {
  .portfolio-card[data-cat="websites"] {
    margin-bottom: 24px !important;
    border-radius: 16px !important;
  }

  .portfolio-card[data-cat="websites"] .browser-bar {
    padding: 8px 14px !important;
  }

  .portfolio-card[data-cat="websites"] .browser-dot {
    width: 8px !important;
    height: 8px !important;
  }

  .portfolio-card[data-cat="websites"] .browser-url-bar {
    padding: 4px 12px !important;
    font-size: 0.72rem !important;
    max-width: 220px !important;
  }

  .portfolio-card[data-cat="websites"] .website-card-body {
    display: flex !important;
    flex-direction: column !important;
    padding: 16px !important;
    gap: 16px !important;
  }

  .portfolio-card[data-cat="websites"] .portfolio-thumb {
    border-radius: 10px !important;
  }

  .portfolio-card[data-cat="websites"] .portfolio-info .tags {
    margin-bottom: 10px !important;
  }

  .portfolio-card[data-cat="websites"] .portfolio-info h3 {
    font-size: 1.25rem !important;
    margin-bottom: 8px !important;
  }

  .portfolio-card[data-cat="websites"] .portfolio-desc {
    font-size: 0.88rem !important;
    line-height: 1.6 !important;
    margin-bottom: 18px !important;
    -webkit-line-clamp: 4 !important;
  }

  .portfolio-card[data-cat="websites"] .website-card-actions {
    grid-template-columns: 1fr 1fr !important;
    gap: 8px !important;
  }

  .portfolio-card[data-cat="websites"] .btn-open-website-details,
  .portfolio-card[data-cat="websites"] .btn-visit-website {
    padding: 10px 8px !important;
    font-size: 0.82rem !important;
  }
}

`;

    css = css.substring(0, startIndex) + newCss + css.substring(endIndex);
}

// Add the mobile CSS for sub-categories
if (!css.includes('/* Mobile Sub-categories Fix */')) {
    css += `\n/* Mobile Sub-categories Fix */\n@media (max-width: 768px) {\n  .sub-filter-buttons {\n    gap: 6px !important;\n    margin: -10px 0 20px !important;\n  }\n  .sub-filter-btn {\n    padding: 4px 10px !important;\n    font-size: 0.68rem !important;\n  }\n}\n`;
}

fs.writeFileSync('./style.css', css, 'utf-8');
console.log('Successfully updated style.css with light glassmorphism and mobile subcategory sizes.');
