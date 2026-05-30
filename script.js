if (history.scrollRestoration) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

window.showToast = function (message, type = 'success') {
  let toast = document.getElementById('custom-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'custom-toast';
    document.body.appendChild(toast);
  }
  toast.className = type === 'error' ? 'error' : '';
  const icon = type === 'success' ? '✅' : '⚠️';
  toast.innerHTML = `<span class="toast-icon">${icon}</span> <span>${message}</span>`;
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => toast.classList.remove('show'), 3000);
};

window.initSiteLogic = function () {
  // Navbar scroll
  let navbarNode = document.querySelector('.navbar');
  const navScroll = () => {
    if (!navbarNode) navbarNode = document.querySelector('.navbar');
    navbarNode?.classList.toggle('scrolled', window.scrollY > 50);
  };
  window.removeEventListener('scroll', navScroll);
  window.addEventListener('scroll', navScroll, { passive: true });

  // Hamburger
  const hamburger = document.querySelector('.hamburger');
  if (hamburger) {
    const oldHam = hamburger.cloneNode(true);
    hamburger.parentNode.replaceChild(oldHam, hamburger);
    oldHam.addEventListener('click', function () {
      document.querySelector('.nav-links')?.classList.toggle('open');
      this.classList.toggle('active');
    });
  }

  // Close menu on link click
  document.querySelectorAll('.nav-links a').forEach(a => {
    const oldA = a.cloneNode(true);
    a.parentNode.replaceChild(oldA, a);
    oldA.addEventListener('click', () => {
      document.querySelector('.nav-links')?.classList.remove('open');
    });
  });

  // Scroll reveal with IntersectionObserver
  document.querySelectorAll(
    '.hero-content, .hero-visual, .section-tag, .section-title, .section-sub, ' +
    '.service-card, .tool-card, .portfolio-card, .timeline-col, .timeline-item, .pricing-card, ' +
    '.testimonial-slider, .blog-card, .faq-list, .faq-item, .footer-grid > div, ' +
    '.contact-info, .about-img-wrap, .about-content'
  ).forEach(el => {
    if (!el.classList.contains('reveal')) el.classList.add('reveal');
  });
 
  const revealObserver = window.revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.02,
    rootMargin: '0px 0px -80px 0px'
  });
 
  document.querySelectorAll('.reveal').forEach(el => {
    revealObserver.observe(el);
  });

  // Testimonial slider (Swiper)
  const tSlider = document.querySelector('.testimonial-slider');
  if (tSlider) {
    tSlider.classList.add('swiper');
    const tTrack = tSlider.querySelector('.testimonial-track');
    if (tTrack) {
      tTrack.classList.add('swiper-wrapper');
      tTrack.style.transform = '';
      tTrack.style.transition = '';
    }
    tSlider.querySelectorAll('.testimonial-card').forEach(c => c.classList.add('swiper-slide'));
    if (window.testimonialSwiper) {
      window.testimonialSwiper.destroy(true, true);
    }
    window.testimonialSwiper = new Swiper('.testimonial-slider', {
      effect: 'coverflow',
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: 'auto',
      loop: true,
      loopedSlides: 3,
      coverflowEffect: { rotate: 0, stretch: 0, depth: 250, modifier: 1, slideShadows: false },
      navigation: { nextEl: '.slider-next', prevEl: '.slider-prev' },
      autoplay: { delay: 3500, disableOnInteraction: false }
    });
  }

  // FAQ accordion
  document.querySelectorAll('.faq-q').forEach(q => {
    const oldQ = q.cloneNode(true); q.parentNode.replaceChild(oldQ, q);
    oldQ.addEventListener('click', function () {
      const item = this.parentElement;
      document.querySelectorAll('.faq-item').forEach(i => { if (i !== item) i.classList.remove('open') });
      item.classList.toggle('open');
    });
  });

  // Portfolio filter
  const isMainPage = !window.location.pathname.includes('portfolio.html');
  document.querySelectorAll('.filter-btn').forEach(btn => {
    const oldBtn = btn.cloneNode(true); btn.parentNode.replaceChild(oldBtn, btn);
    oldBtn.addEventListener('click', function () {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const cat = this.dataset.cat;
      
      const marquee = document.querySelector('.covers-marquee-container');
      const grid = document.querySelector('.portfolio-grid');
      const isEdit = document.body.classList.contains('edit-mode');
      
      if (marquee) {
        if (!isEdit && (cat === 'all' || cat === 'covers')) {
          marquee.style.display = 'flex';
        } else {
          marquee.style.display = 'none';
        }
      }
      
      if (grid) {
        if (!isEdit && cat === 'covers') {
          grid.style.display = 'none';
        } else {
          grid.style.display = 'grid';
        }
      }
      
      let childrenCount = 0;
      let formattingCount = 0;

      document.querySelectorAll('.portfolio-card').forEach(card => {
        const cardCat = card.dataset.cat;
        let shouldShow = false;
        
        if (cat === 'all' || cardCat === cat) {
          if (cardCat === 'covers' && !isEdit) {
            shouldShow = false;
          } else {
            if (!isMainPage || isEdit) {
              shouldShow = true;
            } else {
              if (cardCat === 'children') {
                if (childrenCount < 1) {
                  shouldShow = true;
                  childrenCount++;
                }
              } else if (cardCat === 'formatting') {
                if (formattingCount < 1) {
                  shouldShow = true;
                  formattingCount++;
                }
              } else {
                shouldShow = true;
              }
            }
          }
        }
        
        if (shouldShow) {
          card.style.display = 'block';
          card.classList.remove('active');
          card.style.opacity = '';
          void card.offsetWidth; // Force reflow
          if (window.revealObserver) {
            window.revealObserver.observe(card);
          } else {
            card.classList.add('active');
          }
        } else {
          card.classList.remove('active');
          card.style.opacity = '';
          card.style.display = 'none';
        }
      });
    });
  });

  // Ensure "All" category is selected by default on load
  const defaultFilter = document.querySelector('.filter-btn[data-cat="all"]');
  if (defaultFilter) {
    defaultFilter.click();
  }

  // Tool circle animation - smooth premium hover interactive system
  const initToolAnimations = () => {
    document.querySelectorAll('.tool-card').forEach(card => {
      const prog = card.querySelector('.tool-circle .prog');
      const pctText = card.querySelector('.tool-pct');
      if (!prog || !pctText) return;

      const targetPct = parseFloat(prog.dataset.pct) || 0;
      const circ = 2 * Math.PI * 44; // 276.46

      // Initialize state to 0% immediately on load
      prog.style.strokeDasharray = circ;
      prog.style.strokeDashoffset = circ;
      pctText.textContent = '0%';

      let currentPct = 0;
      let animId = null;

      const animate = (target) => {
        if (animId) cancelAnimationFrame(animId);

        const step = () => {
          const diff = target - currentPct;
          if (Math.abs(diff) < 0.05) {
            currentPct = target;
            prog.style.strokeDashoffset = circ - (currentPct / 100) * circ;
            pctText.textContent = Math.round(currentPct) + '%';
            animId = null;
          } else {
            currentPct += diff * 0.12; // Premium smooth easing
            prog.style.strokeDashoffset = circ - (currentPct / 100) * circ;
            pctText.textContent = Math.round(currentPct) + '%';
            animId = requestAnimationFrame(step);
          }
        };

        animId = requestAnimationFrame(step);
      };

      // Wire up hover event listeners
      card.addEventListener('mouseenter', () => animate(targetPct));
      card.addEventListener('mouseleave', () => animate(0));
    });
  };
  initToolAnimations();

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    if (a.hasAttribute('data-social') || a.hasAttribute('data-pricing')) return;
    const oldA = a.cloneNode(true); a.parentNode.replaceChild(oldA, a);
    oldA.addEventListener('click', function (e) {
      if (this.getAttribute('href') === '#') return;
      const targetId = this.getAttribute('href');
      const t = document.querySelector(targetId);
      if (t) {
        e.preventDefault();
        t.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = 'index.html' + targetId;
      }
    });
  });

  // Contact form
  const form = document.querySelector('.contact-form');
  if (form) {
    const oldForm = form.cloneNode(true); form.parentNode.replaceChild(oldForm, form);
    oldForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (!window.supabaseClient) {
        window.showToast("Database connection not ready yet.", "error");
        return;
      }
      const btn = this.querySelector('button[type="submit"]');
      const originalText = btn.innerText;
      btn.innerText = "Sending...";
      btn.disabled = true;
      try {
        const name = this.querySelector('input[placeholder="Your Name"]').value;
        const email = this.querySelector('input[type="email"]').value;
        const phone = this.querySelector('input[type="tel"]').value;
        const project_type = this.querySelector('select').value;
        const budget = this.querySelector('input[placeholder="Budget Range"]').value;
        const message = this.querySelector('textarea').value;
        const { error } = await window.supabaseClient
          .from('contact_messages')
          .insert([{ name, email, phone, project_type, budget, message }]);
        if (error) throw error;
        window.showToast('Thank you! Your message has been sent directly to the database.', 'success');
        this.reset();
      } catch (error) {
        console.error(error);
        window.showToast('Oops! Something went wrong: ' + error.message, 'error');
      } finally {
        btn.innerText = originalText;
        btn.disabled = false;
      }
    });
  }

  // Sync grids initially or on page updates
  if (window.syncPortfolioGrids) {
    window.syncPortfolioGrids();
  }
};
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', window.initSiteLogic);
} else {
  window.initSiteLogic();
}

// Parallax on hero shapes (optimized & throttled)
(function () {
  let heroShapes = null;
  let mx = 0, my = 0;
  let ticking = false;

  window.addEventListener('mousemove', (e) => {
    mx = (e.clientX / window.innerWidth - 0.5) * 20;
    my = (e.clientY / window.innerHeight - 0.5) * 20;
    if (!ticking) {
      requestAnimationFrame(updateShapes);
      ticking = true;
    }
  });

  function updateShapes() {
    if (!heroShapes) {
      heroShapes = document.querySelectorAll('.hero-shape');
    }
    heroShapes.forEach((s, i) => {
      const f = i === 0 ? 1 : -1;
      s.style.transform = `translate3d(${(mx * f).toFixed(1)}px,${(my * f).toFixed(1)}px,0)`;
    });
    ticking = false;
  }
})();

/* =============================================================
   REALISTIC FLIPBOOK ENGINE  – Single-Page CSS 3D Flip
   ============================================================= */

var FLIPBOOK_DEFAULTS = [
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=800&fit=crop',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=800&fit=crop',
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&h=800&fit=crop',
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=800&fit=crop',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=800&fit=crop',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&h=800&fit=crop',
  'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?w=600&h=800&fit=crop',
  'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&h=800&fit=crop'
];

window.initFlipbooks = function () {

  document.querySelectorAll('.portfolio-card[data-cat="children"], .portfolio-card[data-flipbook="true"]').forEach(function(card, idx) {
    var n      = idx + 1;
    var sId    = 'book-scene-' + n;
    var storeId= 'flipbook-' + n + '-pages';

    card.setAttribute('data-flipbook', 'true');

    /* ── 1. Resolve pages ─────────────────────────────────────── */
    var pages = null;
    var htmlStore = document.getElementById(storeId) || card.querySelector('[id$="-pages"]');
    if (htmlStore) {
      var h = Array.from(htmlStore.querySelectorAll('.flipbook-page img')).map(function(i){return i.src;}).filter(function(s){return s && !s.endsWith('/');});
      if (h.length) pages = h;
    }

    if (!pages) {
      try {
        var ls = JSON.parse(localStorage.getItem('flipbook_pages_' + n) || 'null');
        if (ls && ls.length) pages = ls;
      } catch(e) {}
    }
    
    if (!pages || !pages.length) pages = FLIPBOOK_DEFAULTS.slice();
    if (pages.length % 2 !== 0) pages.push(pages[pages.length - 1]);
    try { localStorage.setItem('flipbook_pages_' + n, JSON.stringify(pages)); } catch(e) {}

    /* ── 2. Resolve size ──────────────────────────────────────── */
    var size = '6x9';
    var sceneEl = document.getElementById(sId) || card.querySelector('.book-scene');
    if (sceneEl && sceneEl.getAttribute('data-size')) {
      size = sceneEl.getAttribute('data-size');
    } else {
      try { size = localStorage.getItem('flipbook_size_' + n) || '6x9'; } catch(e) {}
    }

    /* ── 3. Build DOM ─────────────────────────────────────────── */
    var thumb = card.querySelector('.portfolio-thumb');
    if (!thumb) { thumb = document.createElement('div'); thumb.className = 'portfolio-thumb'; card.insertBefore(thumb, card.firstChild); }
    thumb.style.cssText = 'overflow:visible;height:auto;min-height:0;position:relative;aspect-ratio:unset;background:none;';
    thumb.innerHTML = '';

    // Hidden store for admin compatibility
    var store = document.createElement('div');
    store.id = storeId; store.style.display = 'none';
    store.innerHTML = pages.map(function(src,i){ return '<div class="flipbook-page"><img src="'+src+'" alt="Page '+(i+1)+'" loading="lazy"></div>'; }).join('');

    // Book HTML — flip-face divs are DIRECT children of flip-layer (no flip-card wrapper)
    thumb.innerHTML =
      '<div class="book-scene" id="'+sId+'" data-size="'+size+'">' +
        '<div class="book-3d-wrap">' +
          '<div class="book-body">' +
            '<div class="bp-left"><img class="bp-img" id="'+sId+'-li" src="'+pages[0]+'" alt="Left page"></div>' +
            '<div class="bp-right"><img class="bp-img" id="'+sId+'-ri" src="'+pages[1]+'" alt="Right page"></div>' +

            '<div class="flip-layer" id="'+sId+'-fl">' +
              '<div class="flip-face flip-face-f"><img class="bp-img" id="'+sId+'-ff" src="" alt=""></div>' +
              '<div class="flip-face flip-face-b"><img class="bp-img" id="'+sId+'-fb" src="" alt=""></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="book-controls-row">' +
          '<button class="bc-btn bc-prev" id="'+sId+'-prev">&#8249;</button>' +
          '<span class="bc-counter" id="'+sId+'-cnt">Pages 1–2 of '+pages.length+'</span>' +
          '<button class="bc-btn bc-next" id="'+sId+'-next">&#8250;</button>' +
        '</div>' +
      '</div>';
    thumb.appendChild(store);

    /* ── 4. Wire interaction ──────────────────────────────────── */
    var scene    = document.getElementById(sId);
    var leftImg  = document.getElementById(sId+'-li');
    var rightImg = document.getElementById(sId+'-ri');
    var flipLayer= document.getElementById(sId+'-fl');   // This element has transform-origin at spine
    var flipFront= document.getElementById(sId+'-ff');
    var flipBack = document.getElementById(sId+'-fb');
    var counter  = document.getElementById(sId+'-cnt');
    var prevBtn  = document.getElementById(sId+'-prev');
    var nextBtn  = document.getElementById(sId+'-next');

    var spread  = 0;    // index of left page of current spread (always even)
    var busy    = false;
    var FLIP_MS = 700;  // ms for full page sweep

    // Tell CSS keyframes the duration via custom property
    flipLayer.style.setProperty('--flip-dur', FLIP_MS + 'ms');

    function getPages() {
      if (pages && pages.length) return pages;
      try {
        var r = JSON.parse(localStorage.getItem('flipbook_pages_' + n));
        if (r && r.length) { if (r.length % 2 !== 0) r.push(r[r.length-1]); return r; }
      } catch(e) {}
      return pages;
    }

    function setCounter(s, total) {
      if (counter) counter.textContent = 'Pages '+(s+1)+'\u2013'+Math.min(s+2,total)+' of '+total;
    }

    function preload(src) { var i = new Image(); i.src = src; }

    function resetLayer() {
      flipLayer.style.display    = 'none';
      flipLayer.style.transition = 'none';
      flipLayer.style.transform  = 'rotateY(0deg)';
      flipLayer.className        = 'flip-layer';
    }

    function flip(direction) {
      if (busy) return;
      var pg    = getPages();
      var total = pg.length;
      var nextS = direction === 'next' ? spread + 2 : spread - 2;
      if (nextS >= total) nextS = 0;
      if (nextS < 0)      nextS = total - 2;
      if (nextS === spread) return;

      busy = true;

      if (direction === 'next') {
        /* RIGHT PAGE sweeps LEFT
           Front face = current right page (pg[spread+1]) — peels away
           Back  face = next left page    (pg[nextS])     — revealed as it lands
           Static right = PRE-SET to next right (hidden under front face → zero flash)
           Static left  = updated at mid-point (edge-on, imperceptible)               */

        flipFront.src = pg[spread + 1] || '';
        flipBack.src  = pg[nextS]      || '';
        // PRE-UPDATE right panel — covered by flip-layer front, user sees nothing
        rightImg.src  = pg[nextS + 1]  || '';

        flipLayer.classList.add('flip-right');
        flipLayer.style.display = 'block';
        flipLayer.style.transition = 'none';
        flipLayer.style.transform  = 'rotateY(0deg)';
        void flipLayer.offsetHeight;

        flipLayer.style.transition = 'transform ' + FLIP_MS + 'ms cubic-bezier(0.37,0,0.63,1)';
        flipLayer.style.transform  = 'rotateY(-180deg)';

        // Left panel not covered — swap at edge-on moment (imperceptible at 90deg)
        setTimeout(function() { leftImg.src = pg[nextS] || ''; }, FLIP_MS / 2);

        setTimeout(function() {
          spread = nextS;
          setCounter(spread, total);
          resetLayer();
          busy = false;
        }, FLIP_MS + 16);

      } else {
        /* PREV: LEFT PAGE sweeps RIGHT — real book physics
           With flip-left (left:0, transform-origin: right center):
             0deg   = layer on LEFT half, front face visible
             90deg  = edge-on at spine
             180deg = layer on RIGHT half, back face visible
           So 0°↞180° correctly sweeps LEFT → RIGHT  ✔

           Front face = current left page (pg[spread])   — peels off the left stack
           Back  face = prev right page  (pg[nextS+1])   — revealed on right as it lands
           Static left  = PRE-SET to prev left (pg[nextS])  — hidden under front face
           Static right = updated at mid-point (edge-on, imperceptible)               */

        flipFront.src = pg[spread]    || '';   // front = current left (peeling away)
        flipBack.src  = pg[nextS + 1] || '';   // back  = prev right   (revealed on right)
        // PRE-UPDATE left panel — hidden under flip-layer front face at 0°, zero flash
        leftImg.src   = pg[nextS]     || '';

        flipLayer.classList.add('flip-left');
        flipLayer.style.display = 'block';
        flipLayer.style.transition = 'none';
        flipLayer.style.transform  = 'rotateY(0deg)';   // START: front visible on LEFT
        void flipLayer.offsetHeight;

        flipLayer.style.transition = 'transform ' + FLIP_MS + 'ms cubic-bezier(0.37,0,0.63,1)';
        flipLayer.style.transform  = 'rotateY(180deg)'; // SWEEP: left → right

        // Right panel not covered at start — swap at edge-on moment (90°, imperceptible)
        setTimeout(function() { rightImg.src = pg[nextS + 1] || ''; }, FLIP_MS / 2);

        setTimeout(function() {
          spread = nextS;
          setCounter(spread, total);
          resetLayer();
          busy = false;
        }, FLIP_MS + 16);
      }
    }


    setCounter(0, getPages().length);

    // Button events
    ;(function(){
      var b = prevBtn.cloneNode(true); prevBtn.parentNode.replaceChild(b,prevBtn);
      b.addEventListener('click', function(e){ e.stopPropagation(); flip('prev'); });
    })();
    ;(function(){
      var b = nextBtn.cloneNode(true); nextBtn.parentNode.replaceChild(b,nextBtn);
      b.addEventListener('click', function(e){ e.stopPropagation(); flip('next'); });
    })();

    // Swipe
    var tx = 0;
    scene.addEventListener('touchstart', function(e){ tx = e.touches[0].clientX; }, { passive:true });
    scene.addEventListener('touchend', function(e){
      var dx = e.changedTouches[0].clientX - tx;
      if (dx < -40) flip('next');
      if (dx >  40) flip('prev');
    }, { passive:true });
  });
};




// Body always becomes visible within 4.5 s (fallback if Supabase is slow)
setTimeout(() => {
  if (!document.body.classList.contains('loaded')) {
    document.body.classList.add('loaded');
    const loader = document.getElementById('loading-screen');
    if (loader) {
      loader.style.opacity = '0';
      loader.style.visibility = 'hidden';
      setTimeout(() => loader.remove(), 500);
    }
  }
}, 4500);

// Auto-run
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', window.initFlipbooks);
} else {
  window.initFlipbooks();
}

/* ================================================================
   PORTFOLIO GRID SYNC — keeps homepage + portfolio.html identical
   Reads the same localStorage keys that admin.js writes to.
   ================================================================ */
window.syncPortfolioGrids = function () {
  // 1. Sync flipbook size data-attributes so CSS presets apply correctly
  document.querySelectorAll('.portfolio-card[data-cat="children"]').forEach(function(card, idx) {
    var n = idx + 1;
    var scene = card.querySelector('.book-scene');
    if (scene) {
      var size = scene.getAttribute('data-size');
      if (!size) {
        try { size = localStorage.getItem('flipbook_size_' + n) || '6x9'; } catch(e) { size = '6x9'; }
      }
      scene.setAttribute('data-size', size);
    }
  });

  // 2. Sync admin-added non-flipbook portfolio cards
  var grid = document.querySelector('.portfolio-grid');
  if (!grid) return;
  var adminCards = [];
  try {
    var raw = localStorage.getItem('portfolio_cards');
    if (raw) adminCards = JSON.parse(raw) || [];
  } catch(e) {}

  adminCards.forEach(function(item) {
    // Skip if a card with this data-id already exists (avoid duplicates)
    if (item.id && grid.querySelector('[data-admin-id="' + item.id + '"]')) return;
    var card = document.createElement('div');
    card.className = 'portfolio-card reveal';
    card.setAttribute('data-cat', item.cat || 'covers');
    if (item.id) card.setAttribute('data-admin-id', item.id);
    card.innerHTML =
      '<div class="portfolio-thumb"><img src="' + (item.thumb || '') + '" alt="' + (item.title || '') + '" loading="lazy"></div>' +
      '<div class="portfolio-info">' +
        '<div class="tags">' + (item.tags || []).map(function(t){ return '<span>' + t + '</span>'; }).join('') + '</div>' +
        '<h3>' + (item.title || 'Untitled') + '</h3>' +
      '</div>';
    grid.appendChild(card);
    if (window.revealObserver) {
      window.revealObserver.observe(card);
    }
  });

  // 3. Re-run reveal so any new cards animate in
  document.querySelectorAll('.reveal').forEach(function(el) {
    if (el.getBoundingClientRect().top < window.innerHeight - 80) el.classList.add('active');
  });

  if (window.initCoversMarquee) window.initCoversMarquee();
};

// 4. Implement covers marquee (headline style)
window.initCoversMarquee = function() {
  const grid = document.querySelector('.portfolio-grid');
  if (!grid) return;

  // Reset any inline display:none on covers grid cards so we always capture all of them
  // (they may have been saved with display:none from a previous filter state)
  document.querySelectorAll('.portfolio-grid .portfolio-card[data-cat="covers"]').forEach(card => {
    card.style.display = '';
  });

  const coversCards = Array.from(document.querySelectorAll('.portfolio-grid .portfolio-card[data-cat="covers"]'));
  if (!coversCards.length) return;
  
  // Extract the entire inner HTML of each card so they retain their titles, tags, and structure
  const coverCardsHTML = coversCards.map(card => card.innerHTML);
  
  if (!coverCardsHTML.length) return;
  
  // Group covers into 3 rows
  const rowCount = 3;
  const rows = [[], [], []];
  coverCardsHTML.forEach((htmlContent, idx) => {
    rows[idx % rowCount].push(htmlContent);
  });
  
  let marqueeContainer = document.querySelector('.covers-marquee-container');
  if (!marqueeContainer) {
    marqueeContainer = document.createElement('div');
    marqueeContainer.className = 'covers-marquee-container';
    grid.parentNode.insertBefore(marqueeContainer, grid);
  }
  
  let html = '';
  for (let r = 0; r < rowCount; r++) {
    const rowHTMLs = rows[r];
    if (!rowHTMLs.length) continue;
    
    // Duplicate items to ensure seamless marquee scrolling
    const doubleHTMLs = [...rowHTMLs, ...rowHTMLs];
    while (doubleHTMLs.length < 12) {
      doubleHTMLs.push(...rowHTMLs);
    }
    
    const rowClass = r % 2 === 0 ? 'row-ltr' : 'row-rtl';
    html += `
      <div class="covers-marquee ${rowClass}">
        <div class="covers-marquee-track">
          ${doubleHTMLs.map(innerHtml => `
            <div class="covers-marquee-item portfolio-card" data-cat="covers">
              ${innerHtml}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  marqueeContainer.innerHTML = html;

  // Now hide the grid covers cards (they show only in marquee, not the grid)
  document.querySelectorAll('.portfolio-grid .portfolio-card[data-cat="covers"]').forEach(card => {
    card.style.display = 'none';
  });

  // Apply correct display rules based on the active filter button
  const isEdit = document.body.classList.contains('edit-mode');
  const activeFilter = document.querySelector('.filter-btn.active');
  if (activeFilter) {
    const cat = activeFilter.dataset.cat;
    if (isEdit) {
      marqueeContainer.style.display = 'none';
      document.querySelectorAll('.portfolio-grid .portfolio-card[data-cat="covers"]').forEach(card => {
        card.style.display = 'block';
      });
    } else {
      if (cat === 'all' || cat === 'covers') {
        marqueeContainer.style.display = 'flex';
      } else {
        marqueeContainer.style.display = 'none';
      }
    }
    if (grid) {
      if (!isEdit && cat === 'covers') {
        grid.style.display = 'none';
      } else {
        grid.style.display = 'grid';
      }
    }
  }
};

// Run sync after flipbooks are built (initial run)
setTimeout(window.syncPortfolioGrids, 200);
// Run again after flipbooks fully settle to ensure marquee is built correctly
setTimeout(function() {
  if (window.initCoversMarquee) window.initCoversMarquee();
}, 800);
