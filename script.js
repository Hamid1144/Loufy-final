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

  // ── Hero Frame-by-Frame Animation ──────────────────────────
  (function initHeroFrameAnimation() {
    const canvas = document.getElementById('hero-bg-canvas');
    const fallbackImg = document.getElementById('hero-bg-image');
    if (!canvas || !fallbackImg) return;

    const ctx = canvas.getContext('2d');
    const TOTAL_FRAMES = 150;
    const TARGET_FPS = 25;
    const FRAME_INTERVAL = 1000 / TARGET_FPS;
    const BASE_URL = 'https://res.cloudinary.com/dtr3yvjac/image/upload/f_auto,q_85,w_1920/portfolio/hero_frames/frame_';

    const frames = [];
    let loadedCount = 0;
    let currentFrame = 0;
    let animationRunning = false;
    let lastFrameTime = 0;

    // Generate all frame URLs
    const frameUrls = [];
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      frameUrls.push(BASE_URL + String(i).padStart(3, '0'));
    }

    // Draw an image on canvas with "cover" fit
    function drawCover(img) {
      const zoom = parseFloat(canvas.getAttribute('data-zoom')) || 1.0;
      const cw = canvas.width;
      const ch = canvas.height;
      const iw = img.naturalWidth || img.width;
      const ih = img.naturalHeight || img.height;
      const imgRatio = iw / ih;
      const canvasRatio = cw / ch;
      let dw, dh, dx, dy;
      if (canvasRatio > imgRatio) {
        dw = cw; dh = cw / imgRatio;
      } else {
        dh = ch; dw = ch * imgRatio;
      }
      dw *= zoom;
      dh *= zoom;
      dx = (cw - dw) / 2;
      dy = (ch - dh) / 2;
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, dx, dy, dw, dh);
    }

    // Resize canvas to match hero container at full retina resolution
    function resizeCanvas() {
      const hero = canvas.closest('.hero');
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
    }

    // Animation loop using requestAnimationFrame for smooth playback
    function animate(timestamp) {
      if (!animationRunning) return;
      if (timestamp - lastFrameTime >= FRAME_INTERVAL) {
        lastFrameTime = timestamp - ((timestamp - lastFrameTime) % FRAME_INTERVAL);
        
        // Only draw and advance if the frame is actually fully loaded
        if (frames[currentFrame] && frames[currentFrame].complete && frames[currentFrame].naturalWidth > 0) {
          drawCover(frames[currentFrame]);
          currentFrame = (currentFrame + 1) % TOTAL_FRAMES;
        }
      }
      requestAnimationFrame(animate);
    }

    // Start animation once initial frames are loaded
    function startAnimation() {
      if (animationRunning) return;
      resizeCanvas();
      canvas.style.display = 'block';
      fallbackImg.style.display = 'none';
      animationRunning = true;
      lastFrameTime = 0;
      requestAnimationFrame(animate);
    }

    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (animationRunning) {
          resizeCanvas();
          if (frames[currentFrame] && frames[currentFrame].complete) drawCover(frames[currentFrame]);
        }
      }, 150);
    }, { passive: true });

    // Preload frames progressively (batch loading for speed)
    const BATCH_SIZE = 10;
    let batchIndex = 0;

    function loadBatch() {
      const start = batchIndex * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, TOTAL_FRAMES);
      if (start >= TOTAL_FRAMES) return;

      for (let i = start; i < end; i++) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          loadedCount++;
          // Start animation super early (after 3 frames) instead of waiting for all 150!
          if (loadedCount === 3) {
            startAnimation();
          }
        };
        img.onerror = () => {
          loadedCount++;
        };
        img.src = frameUrls[i];
        frames[i] = img;
      }

      batchIndex++;
      if (end < TOTAL_FRAMES) {
        setTimeout(loadBatch, 50);
      }
    }

    // Kick off preloading
    loadBatch();
  })();

  // Navbar scroll
  let navbarNode = document.querySelector('.navbar');
  const navScroll = () => {
    // Navbar is now permanently in the "scrolled" state
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
      document.querySelector('.hamburger')?.classList.remove('active');
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
  const isMainPage = !window.location.pathname.includes('portfolio');
  document.querySelectorAll('.filter-btn').forEach(btn => {
    const oldBtn = btn.cloneNode(true); btn.parentNode.replaceChild(oldBtn, btn);
    oldBtn.addEventListener('click', function () {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const cat = this.dataset.cat;
      
      const marquee = document.querySelector('.covers-marquee-container');
      const pbMarquee = document.querySelector('.paperback-covers-marquee-container');
      const fmtMarquee = document.querySelector('.formatting-marquee-container');
      const aplusMarquee = document.querySelector('.aplus-marquee-container');
      const grid = document.querySelector('.portfolio-grid');
      const isEdit = document.body.classList.contains('edit-mode');
      
      const subFilters = document.getElementById('book-covers-sub-filters');
      if (subFilters) {
        if (cat === 'covers') {
          subFilters.style.display = 'flex';
        } else {
          subFilters.style.display = 'none';
        }
      }
      
      if (marquee) {
        if (isMainPage && !isEdit && (cat === 'all' || cat === 'covers')) {
          marquee.style.display = 'flex';
        } else {
          marquee.style.display = 'none';
        }
      }

      if (pbMarquee) {
        if (isMainPage && !isEdit && (cat === 'all' || cat === 'paperback-covers')) {
          pbMarquee.style.display = 'flex';
        } else {
          pbMarquee.style.display = 'none';
        }
      }
      
      if (fmtMarquee) {
        if (isMainPage && !isEdit && (cat === 'all' || cat === 'formatting')) {
          fmtMarquee.style.display = 'flex';
        } else {
          fmtMarquee.style.display = 'none';
        }
      }
      
      if (aplusMarquee) {
        if (isMainPage && !isEdit && (cat === 'all' || cat === 'a-plus-content')) {
          aplusMarquee.style.display = 'flex';
        } else {
          aplusMarquee.style.display = 'none';
        }
      }
      
      if (grid) {
        if (isMainPage && !isEdit && (cat === 'covers' || cat === 'formatting' || cat === 'paperback-covers' || cat === 'a-plus-content')) {
          grid.style.display = 'none';
        } else {
          grid.style.display = 'grid';
        }

        // Dynamic columns override
        grid.classList.remove('cols-1', 'cols-2', 'cols-3', 'cols-4');
        let cols = this.dataset.cols;
        if (!cols && (cat === 'paperback-covers' || cat === 'formatting')) {
          cols = '2';
        }
        if (cols) {
          grid.classList.add('cols-' + cols);
        }
      }

      const colsVal = parseInt(this.dataset.cols) || ( (cat === 'paperback-covers' || cat === 'formatting') ? 2 : 3 );
      const rowsVal = parseInt(this.dataset.rows) || 0;
      const limit = colsVal * rowsVal;
      let activeCatFilteredCount = 0;

      const categoryShowCounts = {};

      document.querySelectorAll('.portfolio-grid > .portfolio-card').forEach(card => {
        const cardCat = card.dataset.cat;
        let shouldShow = false;

        if (cat === 'all' || cardCat === cat) {
          const activeSubCatBtn = document.querySelector('.sub-filter-btn.active');
          const activeSubCat = activeSubCatBtn ? activeSubCatBtn.dataset.subcat : 'all';
          const cardSubcats = card.dataset.subcat ? card.dataset.subcat.split(',') : [];
          if (cat === 'covers' && activeSubCat !== 'all' && !cardSubcats.includes(activeSubCat)) {
            shouldShow = false;
          } else {
            if ((cardCat === 'covers' || cardCat === 'formatting' || cardCat === 'paperback-covers') && isMainPage && !isEdit) {
            shouldShow = false;
          } else {
            if (!isMainPage || isEdit) {
              shouldShow = true;
            } else {
              if (cat === 'all' && cardCat !== 'covers' && cardCat !== 'formatting' && cardCat !== 'paperback-covers') {
                if (!categoryShowCounts[cardCat]) {
                  categoryShowCounts[cardCat] = 0;
                }
                if (categoryShowCounts[cardCat] < 1) {
                  shouldShow = true;
                  categoryShowCounts[cardCat]++;
                }
              } else {
                shouldShow = true;
              }
            }
          }
          } // Close the new else block
        }

        if (shouldShow && !isMainPage && cat !== 'all' && limit > 0) {
          if (activeCatFilteredCount >= limit) {
            shouldShow = false;
          } else {
            activeCatFilteredCount++;
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

  // Sub-category filters
  document.querySelectorAll('.sub-filter-btn').forEach(btn => {
    const oldBtn = btn.cloneNode(true); btn.parentNode.replaceChild(oldBtn, btn);
    oldBtn.addEventListener('click', function(e) {
      e.preventDefault();
      document.querySelectorAll('.sub-filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const activeMainFilter = document.querySelector('.filter-btn.active');
      if (activeMainFilter) activeMainFilter.click();
    });
  });

  // Ensure correct category is selected by default on load
  let defaultFilter;
  if (!isMainPage) {
    // Separate portfolio page: select the first visible (non-all) category filter
    defaultFilter = document.querySelector('.filter-btn:not([data-cat="all"])');
  } else {
    // Homepage: select "All" if it exists, otherwise fallback to first
    defaultFilter = document.querySelector('.filter-btn[data-cat="all"]') || document.querySelector('.filter-btn');
  }

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
      // Close mobile menu and reset hamburger state
      document.querySelector('.nav-links')?.classList.remove('open');
      document.querySelector('.hamburger')?.classList.remove('active');
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

        // Send email notification using Web3Forms if key is set
        if (window.web3formsAccessKey && window.web3formsAccessKey !== 'YOUR_WEB3FORMS_ACCESS_KEY') {
          try {
            await fetch('https://api.web3forms.com/submit', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({
                access_key: window.web3formsAccessKey,
                name: name,
                email: email,
                phone: phone,
                subject: `New Message from ${name} - ${project_type}`,
                message: `You have received a new contact message from your portfolio website:\n\n` +
                         `Name: ${name}\n` +
                         `Email: ${email}\n` +
                         `Phone: ${phone}\n` +
                         `Project Type: ${project_type}\n` +
                         `Budget Range: ${budget}\n\n` +
                         `Message:\n${message}\n\n` +
                         `--- \nThis message has also been saved to your Supabase database.`
              })
            });
          } catch (emailErr) {
            console.warn("Database save succeeded, but email notification failed: ", emailErr);
          }
        }

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

  // Initialize Blog Section
  if (window.initBlogSection) {
    window.initBlogSection();
  }
};


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

    /* ── Helper to optimize Cloudinary widths ── */
    function optUrl(src) {
      if (src && src.indexOf('res.cloudinary.com') !== -1 && src.indexOf('/image/upload/') !== -1 && src.indexOf(',w_') === -1 && src.indexOf('/w_') === -1) {
        if (src.indexOf('f_auto,q_auto') !== -1) {
          return src.replace('f_auto,q_auto', 'f_auto,q_auto,w_600');
        } else {
          return src.replace('/image/upload/', '/image/upload/f_auto,q_auto,w_600/');
        }
      }
      return src;
    }

    /* ── 1. Resolve pages ─────────────────────────────────────── */
    var pages = null;
    var htmlStore = card.querySelector('[id$="-pages"]');
    if (htmlStore) {
      var h = Array.from(htmlStore.querySelectorAll('.flipbook-page img')).map(function(i){return optUrl(i.src);}).filter(function(s){return s && !s.endsWith('/');});
      if (h.length) pages = h;
      htmlStore.remove(); // Clean up old store so it doesn't duplicate
    }

    if (!pages) {
      try {
        var ls = JSON.parse(localStorage.getItem('flipbook_pages_' + n) || 'null');
        if (ls && ls.length) pages = ls.map(optUrl);
      } catch(e) {}
    }
    
    if (!pages || !pages.length) pages = FLIPBOOK_DEFAULTS.map(optUrl);
    if (pages.length % 2 !== 0) pages.push(pages[pages.length - 1]);
    try { localStorage.setItem('flipbook_pages_' + n, JSON.stringify(pages)); } catch(e) {}

    /* ── 2. Resolve size ──────────────────────────────────────── */
    var size = '6x9';
    var sceneEl = card.querySelector('.book-scene');
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
    store.innerHTML = pages.map(function(src,i){
      var opt = (src && src.indexOf('data:image/') === 0) ? ' data-optimized="true"' : '';
      return '<div class="flipbook-page"><img src="'+src+'" alt="Page '+(i+1)+'" loading="lazy"' + opt + '></div>';
    }).join('');

    // Book HTML — flip-face divs are DIRECT children of flip-layer (no flip-card wrapper)
    var opt0 = (pages[0] && pages[0].indexOf('data:image/') === 0) ? ' data-optimized="true"' : '';
    var opt1 = (pages[1] && pages[1].indexOf('data:image/') === 0) ? ' data-optimized="true"' : '';
    thumb.innerHTML =
      '<div class="book-scene" id="'+sId+'" data-size="'+size+'">' +
        '<div class="book-3d-wrap">' +
          '<div class="book-body">' +
            '<div class="bp-left"><img class="bp-img" id="'+sId+'-li" src="'+pages[0]+'" alt="Left page"' + opt0 + '></div>' +
            '<div class="bp-right"><img class="bp-img" id="'+sId+'-ri" src="'+pages[1]+'" alt="Right page"' + opt1 + '></div>' +

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
    var scene    = card.querySelector('.book-scene');
    var leftImg  = card.querySelector('.bp-left img');
    var rightImg = card.querySelector('.bp-right img');
    var flipLayer= card.querySelector('.flip-layer');   // This element has transform-origin at spine
    var flipFront= card.querySelector('.flip-face-f img');
    var flipBack = card.querySelector('.flip-face-b img');
    var counter  = card.querySelector('.bc-counter');
    var prevBtn  = card.querySelector('.bc-prev');
    var nextBtn  = card.querySelector('.bc-next');


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
  if (window.initPaperbackCoversMarquee) window.initPaperbackCoversMarquee();
  if (window.initFormattingMarquee) window.initFormattingMarquee();
  if (window.initAPlusMarquee) window.initAPlusMarquee();

  // ── Service Detail Modal Logic ──────────────────────────
  (function initServiceModal() {
    const modal = document.getElementById('service-detail-modal');
    if (!modal) return;

    const modalClose = modal.querySelector('.service-modal-close');
    const modalIcon = document.getElementById('service-modal-icon');
    const modalTitle = document.getElementById('service-modal-title');
    const modalDesc = document.getElementById('service-modal-desc');
    const modalList = document.getElementById('service-modal-list');
    const modalCta = document.getElementById('service-modal-cta');

    const serviceDetailsData = {
      "Book Cover Design": {
        icon: "fa-solid fa-book-open",
        desc: "Eye-catching covers for fiction, non-fiction, romance, thriller, and more that grab reader attention.",
        bullets: [
          "Custom front, back, and spine designs tailormade for you.",
          "High-resolution print-ready files (PDF, JPEG, PNG).",
          "Free 3D book mockups for marketing & promotions.",
          "Complete source files (PSD/AI) with commercial rights.",
          "100% compliant layouts for KDP, IngramSpark, and Lulu.",
          "Unlimited revisions until you are completely satisfied."
        ]
      },
      "Amazon KDP Formatting": {
        icon: "fa-solid fa-box-open",
        desc: "Professional interior formatting, manuscript layout, and KDP-ready files for seamless publishing.",
        bullets: [
          "Perfect margins, gutters, page size, and bleed setup.",
          "Beautiful custom typography and chapter heading designs.",
          "Professional drop caps, running headers, and footers.",
          "Clickable Table of Contents (TOC) and hyperlinks for eBooks.",
          "Guaranteed validation pass for KDP print and eBook formats.",
          "Reflowable EPUB / fixed-layout formats ready to upload."
        ]
      },
      "A+ Content Design": {
        icon: "fa-solid fa-star",
        desc: "Premium Amazon A+ content modules that boost conversions and enhance your product listing.",
        bullets: [
          "Custom banner designs and comparison charts.",
          "Highlights of key book features and chapter concepts.",
          "Inside-the-book previews and beautiful 3D mockups.",
          "Optimized layout assets targeting desktop and mobile.",
          "Increases your conversion rate, sales, and reviews.",
          "Complies fully with Amazon KDP A+ Content Guidelines."
        ]
      },
      "Children Book Illustration": {
        icon: "fa-solid fa-palette",
        desc: "Colorful, engaging illustrations and layouts for children's books that captivate young readers.",
        bullets: [
          "Vibrant, story-driven character designs and backgrounds.",
          "Illustrations tailormade for kids of all age groups.",
          "Full layout formatting (integrating text and illustrations).",
          "Print-ready CMYK files with correct bleed and trim size.",
          "Storyboarding and revisions to match your manuscript.",
          "Kindle-ready format optimized for children's tablets."
        ]
      },
      "Social Media Design": {
        icon: "fa-solid fa-thumbs-up",
        desc: "Scroll-stopping social media graphics, banners, and promotional materials for your brand.",
        bullets: [
          "Stunning 3D book cover mockups and marketing assets.",
          "Custom banners for Facebook, Twitter, and LinkedIn.",
          "Engaging post graphics, reels templates, and stories.",
          "High-converting ad designs for Amazon & Meta Ads.",
          "Consistent branding across all social platforms.",
          "Promo graphics for book launches, pre-orders, and sales."
        ]
      },
      "Author Website": {
        icon: "fa-solid fa-globe",
        desc: "Professional, responsive, and stunning websites tailored specifically for authors to showcase books and build email lists.",
        bullets: [
          "Stunning custom portfolio designs tailored to your brand.",
          "Dedicated book showcase page with buy links.",
          "Integration with newsletter list building tools (Mailchimp, etc.).",
          "Fully responsive design optimized for mobile and desktop.",
          "SEO-optimized structure to rank higher on search engines.",
          "Fast page load speed and secure contact form integration."
        ]
      }
    };

    const fallbackIndexData = [
      serviceDetailsData["Book Cover Design"],
      serviceDetailsData["Amazon KDP Formatting"],
      serviceDetailsData["A+ Content Design"],
      serviceDetailsData["Children Book Illustration"],
      serviceDetailsData["Social Media Design"],
      serviceDetailsData["Author Website"]
    ];

    // Handle card clicks
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach((card, index) => {
      const learnMoreBtn = card.querySelector('.learn-more');
      if (!learnMoreBtn) return;

      learnMoreBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        // Try to match by title
        const titleEl = card.querySelector('h3');
        const titleText = titleEl ? titleEl.textContent.trim() : "";
        let data = serviceDetailsData[titleText];

        // Fallback to index if no matching title found (e.g. if title is edited)
        if (!data && index < fallbackIndexData.length) {
          data = fallbackIndexData[index];
        }

        if (!data) return;

        // Populate modal content
        if (modalIcon) modalIcon.className = data.icon;
        if (modalTitle) modalTitle.textContent = titleText || "Service Details";
        if (modalDesc) modalDesc.textContent = data.desc;

        if (modalList) {
          modalList.innerHTML = "";
          data.bullets.forEach(bullet => {
            const li = document.createElement('li');
            li.textContent = bullet;
            modalList.appendChild(li);
          });
        }

        // Open modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Lock background scrolling
      });
    });

    // Close modal helpers
    function closeModal() {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (modalClose) {
      modalClose.addEventListener('click', closeModal);
    }

    if (modalCta) {
      modalCta.addEventListener('click', closeModal);
    }

    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeModal();
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });
  })();
};

// 4. Implement covers marquee (headline style)
window.initCoversMarquee = function() {
  const isMainPage = !window.location.pathname.includes('portfolio');
  if (!isMainPage) return;

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
    
    // Fill the track to ensure it spans at least the width of the screen
    const singleHTMLs = [...rowHTMLs];
    while (singleHTMLs.length < 24) {
      singleHTMLs.push(...rowHTMLs);
    }
    
    const rowClass = r % 2 === 0 ? 'row-ltr' : 'row-rtl';
    html += `
      <div class="covers-marquee ${rowClass}">
        <div class="covers-marquee-track">
          ${singleHTMLs.map(innerHtml => `
            <div class="covers-marquee-item portfolio-card" data-cat="covers">
              ${innerHtml}
            </div>
          `).join('')}
        </div>
        <div class="covers-marquee-track" aria-hidden="true">
          ${singleHTMLs.map(innerHtml => `
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
  const cat = activeFilter ? activeFilter.dataset.cat : 'all';
  
  const subFilters = document.getElementById('book-covers-sub-filters');
  if (subFilters) {
    if (cat === 'covers') {
      subFilters.style.display = 'flex';
    } else {
      subFilters.style.display = 'none';
    }
  }
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
  if (window.initPaperbackCoversMarquee) window.initPaperbackCoversMarquee();
  if (window.initFormattingMarquee) window.initFormattingMarquee();
  if (window.initAPlusMarquee) window.initAPlusMarquee();
}, 800);

// 4.5 Implement paperback covers marquee (headline style)
window.initPaperbackCoversMarquee = function() {
  const isMainPage = !window.location.pathname.includes('portfolio');
  if (!isMainPage) return;

  const grid = document.querySelector('.portfolio-grid');
  if (!grid) return;

  // Reset any inline display:none on paperback-covers grid cards so we always capture all of them
  document.querySelectorAll('.portfolio-grid .portfolio-card[data-cat="paperback-covers"]').forEach(card => {
    card.style.display = '';
  });

  const paperbackCards = Array.from(document.querySelectorAll('.portfolio-grid .portfolio-card[data-cat="paperback-covers"]'));
  if (!paperbackCards.length) return;
  
  const paperbackCardsHTML = paperbackCards.map(card => card.innerHTML);
  if (!paperbackCardsHTML.length) return;
  
  let marqueeContainer = document.querySelector('.paperback-covers-marquee-container');
  if (!marqueeContainer) {
    marqueeContainer = document.createElement('div');
    marqueeContainer.className = 'paperback-covers-marquee-container';
    
    // Insert after covers marquee container if it exists, otherwise before the grid
    const coversMarquee = document.querySelector('.covers-marquee-container');
    if (coversMarquee) {
      coversMarquee.parentNode.insertBefore(marqueeContainer, coversMarquee.nextSibling);
    } else {
      grid.parentNode.insertBefore(marqueeContainer, grid);
    }
  }
  
  // Fill the track to ensure it spans at least the width of the screen
  const singleHTMLs = [...paperbackCardsHTML];
  while (singleHTMLs.length < 12) {
    singleHTMLs.push(...paperbackCardsHTML);
  }
  
  marqueeContainer.innerHTML = `
    <div class="paperback-covers-marquee row-rtl">
      <div class="paperback-covers-marquee-track">
        ${singleHTMLs.map(innerHtml => `
          <div class="paperback-covers-marquee-item portfolio-card" data-cat="paperback-covers">
            ${innerHtml}
          </div>
        `).join('')}
      </div>
      <div class="paperback-covers-marquee-track" aria-hidden="true">
        ${singleHTMLs.map(innerHtml => `
          <div class="paperback-covers-marquee-item portfolio-card" data-cat="paperback-covers">
            ${innerHtml}
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Hide the original grid paperback-covers cards (they show only in marquee, not the grid)
  document.querySelectorAll('.portfolio-grid .portfolio-card[data-cat="paperback-covers"]').forEach(card => {
    card.style.display = 'none';
  });

  // Apply correct display rules based on the active filter button
  const isEdit = document.body.classList.contains('edit-mode');
  const activeFilter = document.querySelector('.filter-btn.active');
  const cat = activeFilter ? activeFilter.dataset.cat : 'all';
  
  const subFilters = document.getElementById('book-covers-sub-filters');
  if (subFilters) {
    if (cat === 'covers') {
      subFilters.style.display = 'flex';
    } else {
      subFilters.style.display = 'none';
    }
  }
  if (activeFilter) {
    const cat = activeFilter.dataset.cat;
    if (isEdit) {
      marqueeContainer.style.display = 'none';
      document.querySelectorAll('.portfolio-grid .portfolio-card[data-cat="paperback-covers"]').forEach(card => {
        card.style.display = 'block';
      });
    } else {
      if (cat === 'all' || cat === 'paperback-covers') {
        marqueeContainer.style.display = 'flex';
      } else {
        marqueeContainer.style.display = 'none';
      }
    }
  }
};

// 5. Implement formatting marquee (headline style)
window.initFormattingMarquee = function() {
  const isMainPage = !window.location.pathname.includes('portfolio');
  if (!isMainPage) return;

  const grid = document.querySelector('.portfolio-grid');
  if (!grid) return;

  // Reset any inline display:none on formatting grid cards so we always capture all of them
  document.querySelectorAll('.portfolio-grid .portfolio-card[data-cat="formatting"]').forEach(card => {
    card.style.display = '';
  });

  const formattingCards = Array.from(document.querySelectorAll('.portfolio-grid .portfolio-card[data-cat="formatting"]'));
  if (!formattingCards.length) return;
  
  const formattingCardsHTML = formattingCards.map(card => card.innerHTML);
  if (!formattingCardsHTML.length) return;
  
  let marqueeContainer = document.querySelector('.formatting-marquee-container');
  if (!marqueeContainer) {
    marqueeContainer = document.createElement('div');
    marqueeContainer.className = 'formatting-marquee-container';
    
    // Insert after covers marquee container if it exists, otherwise before the grid
    const paperbackMarquee = document.querySelector('.paperback-covers-marquee-container');
    const coversMarquee = document.querySelector('.covers-marquee-container');
    if (paperbackMarquee) {
      paperbackMarquee.parentNode.insertBefore(marqueeContainer, paperbackMarquee.nextSibling);
    } else if (coversMarquee) {
      coversMarquee.parentNode.insertBefore(marqueeContainer, coversMarquee.nextSibling);
    } else {
      grid.parentNode.insertBefore(marqueeContainer, grid);
    }
  }
  
  // Fill the track to ensure it spans at least the width of the screen
  const singleHTMLs = [...formattingCardsHTML];
  while (singleHTMLs.length < 12) {
    singleHTMLs.push(...formattingCardsHTML);
  }
  
  marqueeContainer.innerHTML = `
    <div class="formatting-marquee row-ltr">
      <div class="formatting-marquee-track">
        ${singleHTMLs.map(innerHtml => `
          <div class="formatting-marquee-item portfolio-card" data-cat="formatting">
            ${innerHtml}
          </div>
        `).join('')}
      </div>
      <div class="formatting-marquee-track" aria-hidden="true">
        ${singleHTMLs.map(innerHtml => `
          <div class="formatting-marquee-item portfolio-card" data-cat="formatting">
            ${innerHtml}
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Hide the original grid formatting cards (they show only in marquee, not the grid)
  document.querySelectorAll('.portfolio-grid .portfolio-card[data-cat="formatting"]').forEach(card => {
    card.style.display = 'none';
  });

  // Apply correct display rules based on the active filter button
  const isEdit = document.body.classList.contains('edit-mode');
  const activeFilter = document.querySelector('.filter-btn.active');
  const cat = activeFilter ? activeFilter.dataset.cat : 'all';
  
  const subFilters = document.getElementById('book-covers-sub-filters');
  if (subFilters) {
    if (cat === 'covers') {
      subFilters.style.display = 'flex';
    } else {
      subFilters.style.display = 'none';
    }
  }
  if (activeFilter) {
    const cat = activeFilter.dataset.cat;
    if (isEdit) {
      marqueeContainer.style.display = 'none';
      document.querySelectorAll('.portfolio-grid .portfolio-card[data-cat="formatting"]').forEach(card => {
        card.style.display = 'block';
      });
    } else {
      if (cat === 'all' || cat === 'formatting') {
        marqueeContainer.style.display = 'flex';
      } else {
        marqueeContainer.style.display = 'none';
      }
    }
  }
};

// 6. Implement A+ Content marquee (headline style, right-to-left)
window.initAPlusMarquee = function() {
  const isMainPage = !window.location.pathname.includes('portfolio');
  if (!isMainPage) return;

  const grid = document.querySelector('.portfolio-grid');
  if (!grid) return;

  // Reset any inline display:none on a-plus-content grid cards so we always capture all of them
  document.querySelectorAll('.portfolio-grid .portfolio-card[data-cat="a-plus-content"]').forEach(card => {
    card.style.display = '';
  });

  const aplusCards = Array.from(document.querySelectorAll('.portfolio-grid .portfolio-card[data-cat="a-plus-content"]'));
  if (!aplusCards.length) return;
  
  const aplusCardsHTML = aplusCards.map(card => card.innerHTML);
  if (!aplusCardsHTML.length) return;
  
  let marqueeContainer = document.querySelector('.aplus-marquee-container');
  if (!marqueeContainer) {
    marqueeContainer = document.createElement('div');
    marqueeContainer.className = 'aplus-marquee-container';
    
    // Insert after formatting marquee container if it exists, otherwise before the grid
    const fmtMarquee = document.querySelector('.formatting-marquee-container');
    const paperbackMarquee = document.querySelector('.paperback-covers-marquee-container');
    const coversMarquee = document.querySelector('.covers-marquee-container');
    if (fmtMarquee) {
      fmtMarquee.parentNode.insertBefore(marqueeContainer, fmtMarquee.nextSibling);
    } else if (paperbackMarquee) {
      paperbackMarquee.parentNode.insertBefore(marqueeContainer, paperbackMarquee.nextSibling);
    } else if (coversMarquee) {
      coversMarquee.parentNode.insertBefore(marqueeContainer, coversMarquee.nextSibling);
    } else {
      grid.parentNode.insertBefore(marqueeContainer, grid);
    }
  }
  
  // Fill the track to ensure it spans at least the width of the screen
  const singleHTMLs = [...aplusCardsHTML];
  while (singleHTMLs.length < 12) {
    singleHTMLs.push(...aplusCardsHTML);
  }
  
  marqueeContainer.innerHTML = `
    <div class="aplus-marquee row-rtl">
      <div class="aplus-marquee-track">
        ${singleHTMLs.map(innerHtml => `
          <div class="aplus-marquee-item portfolio-card" data-cat="a-plus-content">
            ${innerHtml}
          </div>
        `).join('')}
      </div>
      <div class="aplus-marquee-track" aria-hidden="true">
        ${singleHTMLs.map(innerHtml => `
          <div class="aplus-marquee-item portfolio-card" data-cat="a-plus-content">
            ${innerHtml}
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Hide the original grid a-plus-content cards (they show only in marquee, not the grid)
  document.querySelectorAll('.portfolio-grid .portfolio-card[data-cat="a-plus-content"]').forEach(card => {
    card.style.display = 'none';
  });

  // Apply correct display rules based on the active filter button
  const isEdit = document.body.classList.contains('edit-mode');
  const activeFilter = document.querySelector('.filter-btn.active');
  
  if (activeFilter) {
    const cat = activeFilter.dataset.cat;
    if (isEdit) {
      marqueeContainer.style.display = 'none';
      document.querySelectorAll('.portfolio-grid .portfolio-card[data-cat="a-plus-content"]').forEach(card => {
        card.style.display = 'block';
      });
    } else {
      if (cat === 'all' || cat === 'a-plus-content') {
        marqueeContainer.style.display = 'flex';
      } else {
        marqueeContainer.style.display = 'none';
      }
    }
  }
};

// Blog Dynamic Loader & Search/Filters Implementation
window.initBlogSection = async function () {
  const previewGrid = document.getElementById('blog-preview-grid');
  const blogGrid = document.getElementById('blog-posts-grid');
  const featuredContainer = document.getElementById('featured-blog-container');
  const categoriesContainer = document.getElementById('blog-categories-filters');
  const searchInput = document.getElementById('blog-search-input');
  const paginationContainer = document.getElementById('blog-pagination-container');
  const loadMoreBtn = document.getElementById('blog-load-more-btn');

  if (window.diagLog) {
    window.diagLog(`initBlogSection called. previewGrid: ${!!previewGrid}, blogGrid: ${!!blogGrid}, URL: ${window.location.href}`);
  }

  if (!blogGrid && !previewGrid) return; // Only run on pages containing a blog section

  if (!window.supabaseClient) {
    if (window.diagLog) window.diagLog("supabaseClient not available, scheduling retry in 50ms...");
    setTimeout(window.initBlogSection, 50);
    return;
  }

  let blogPosts = [];

  // 1. Fetch from Supabase
  try {
    if (window.diagLog) window.diagLog("Starting fetch for blogs_json from Supabase...");
    const { data, error } = await window.supabaseClient
      .from('site_content')
      .select('html_content')
      .eq('id', 'blogs_json')
      .single();
    
    if (error) throw error;
    if (data && data.html_content) {
      blogPosts = JSON.parse(data.html_content);
      if (window.diagLog) window.diagLog(`Supabase fetch success. Loaded ${blogPosts.length} posts.`);
    } else {
      if (window.diagLog) window.diagLog("Supabase fetch success, but data.html_content is empty!");
    }
  } catch (err) {
    if (window.diagLog) window.diagLog(`Supabase fetch failed: ${err.message || err}`);
    console.error('Failed to load blog posts from cloud:', err);
    blogPosts = [];
  }

  window.blogPostsList = blogPosts; // Cache globally for admin reference

  // Case 1: Homepage Preview (only latest 3 posts)
  if (previewGrid) {
    if (window.diagLog) window.diagLog(`Executing Homepage Preview layout. blogPosts list size: ${blogPosts.length}`);
    // Sort by publication date descending
    const sortedPosts = [...blogPosts].sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
    const latestPosts = sortedPosts.slice(0, 3);

    if (latestPosts.length === 0) {
      if (window.diagLog) window.diagLog("latestPosts is empty, rendering 'No articles published yet.'");
      previewGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align:center; padding: 40px; color:#aaa;">
          <h3>No articles published yet.</h3>
        </div>
      `;
    } else {
      previewGrid.innerHTML = latestPosts.map(post => {
        const dateStr = new Date(post.published_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        return `
          <div class="blog-card reveal active">
            <div class="blog-thumb">
              <img src="${post.image_url || 'https://images.unsplash.com/photo-1553729459-afe8f2e2882d?w=500'}" alt="${post.title}" loading="lazy">
              <span class="blog-category-badge">${post.category}</span>
            </div>
            <div class="blog-body">
              <div class="blog-meta-line">
                <span><i class="fa-regular fa-calendar-days"></i> ${dateStr}</span>
                <span><i class="fa-regular fa-clock"></i> ${post.read_time} min read</span>
              </div>
              <h3>${post.title}</h3>
              <p>${post.summary}</p>
              <div class="blog-footer-line">
                <span class="blog-author-tag"><i class="fa-regular fa-user"></i> ${post.author_name || 'Loufy Publisher'}</span>
                <a href="${window.getBlogLink(post.slug)}" class="read-more">See More →</a>
              </div>
            </div>
          </div>
        `;
      }).join('');
      if (window.diagLog) window.diagLog(`previewGrid.innerHTML set successfully! Number of rendered cards: ${latestPosts.length}`);
    }
    return;
  }

  // Case 2: Full Directory Page
  if (blogGrid) {
    let visibleCount = 6;
    let activeCategory = 'All';
    let activeSearch = '';

    // 2. Extract and Render Category Filters
    const updateCategories = () => {
      if (!categoriesContainer) return;
      const categories = new Set(blogPosts.map(p => p.category).filter(Boolean));
      const catArray = ['All', ...Array.from(categories)];
      
      categoriesContainer.innerHTML = catArray.map(cat => `
        <button class="blog-cat-btn ${cat === activeCategory ? 'active' : ''}" data-category="${cat}">
          ${cat}
        </button>
      `).join('');

      // Add category click events
      categoriesContainer.querySelectorAll('.blog-cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          categoriesContainer.querySelectorAll('.blog-cat-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          activeCategory = btn.dataset.category;
          visibleCount = 6; // Reset pagination
          render();
        });
      });
    };

    // 3. Search Bar Event
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        activeSearch = e.target.value.toLowerCase().trim();
        visibleCount = 6; // Reset pagination
        render();
      });
    }

    // 4. Load More Event
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        visibleCount += 6;
        render();
      });
    }

    // 5. Render Function
    const render = () => {
      // Filter posts
      let filtered = blogPosts.filter(post => {
        // Category filter
        if (activeCategory !== 'All' && post.category !== activeCategory) {
          return false;
        }
        // Search query filter
        if (activeSearch) {
          const matchesTitle = post.title?.toLowerCase().includes(activeSearch);
          const matchesSummary = post.summary?.toLowerCase().includes(activeSearch);
          const matchesTags = post.tags?.some(tag => tag.toLowerCase().includes(activeSearch));
          return matchesTitle || matchesSummary || matchesTags;
        }
        return true;
      });

      // Sort by publication date descending
      filtered.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

      // Handle Featured Post (Only show on homepage when search/filter is not active)
      let featuredPost = null;
      let regularPosts = [...filtered];

      if (activeCategory === 'All' && !activeSearch) {
        featuredPost = filtered.find(p => p.is_featured) || filtered[0];
        if (featuredPost) {
          // Exclude featured post from the main grid
          regularPosts = filtered.filter(p => p.id !== featuredPost.id);
        }
      }

      // Render Featured Post
      if (featuredContainer) {
        if (featuredPost) {
          const dateStr = new Date(featuredPost.published_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          
          featuredContainer.innerHTML = `
            <div class="featured-blog-card">
              <div class="featured-blog-thumb">
                <img src="${featuredPost.image_url || 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800'}" alt="${featuredPost.title}" loading="lazy">
              </div>
              <div class="featured-blog-body">
                <div class="blog-meta-row">
                  <span class="blog-tag">${featuredPost.category}</span>
                  <span class="blog-read-time"><i class="fa-regular fa-clock"></i> ${featuredPost.read_time} min read</span>
                </div>
                <h3>${featuredPost.title}</h3>
                <p>${featuredPost.summary}</p>
                <div class="blog-author-row">
                  <div class="blog-author-info">
                    <span class="author-name"><i class="fa-regular fa-user"></i> ${featuredPost.author_name || 'Loufy Publisher'}</span>
                    <span class="publish-date"><i class="fa-regular fa-calendar-days"></i> ${dateStr}</span>
                  </div>
                  <a href="${window.getBlogLink(featuredPost.slug)}" class="read-more-btn">See More <i class="fa-solid fa-arrow-right"></i></a>
                </div>
              </div>
            </div>
          `;
          featuredContainer.style.display = 'block';
        } else {
          featuredContainer.innerHTML = '';
          featuredContainer.style.display = 'none';
        }
      }

      // Render Grid
      const displayedPosts = regularPosts.slice(0, visibleCount);
      
      if (displayedPosts.length === 0) {
        blogGrid.innerHTML = `
          <div class="blog-empty-state" style="grid-column: 1/-1; text-align:center; padding: 40px; color:#aaa;">
            <i class="fa-solid fa-folder-open" style="font-size:3rem; margin-bottom:15px; color:var(--accent);"></i>
            <h3>No articles found</h3>
            <p>Try refining your search query or choosing another category.</p>
          </div>
        `;
      } else {
        blogGrid.innerHTML = displayedPosts.map(post => {
          const dateStr = new Date(post.published_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          return `
            <div class="blog-card reveal active">
              <div class="blog-thumb">
                <img src="${post.image_url || 'https://images.unsplash.com/photo-1553729459-afe8f2e2882d?w=500'}" alt="${post.title}" loading="lazy">
                <span class="blog-category-badge">${post.category}</span>
              </div>
              <div class="blog-body">
                <div class="blog-meta-line">
                  <span><i class="fa-regular fa-calendar-days"></i> ${dateStr}</span>
                  <span><i class="fa-regular fa-clock"></i> ${post.read_time} min read</span>
                </div>
                <h3>${post.title}</h3>
                <p>${post.summary}</p>
                <div class="blog-footer-line">
                  <span class="blog-author-tag"><i class="fa-regular fa-user"></i> ${post.author_name || 'Loufy Publisher'}</span>
                  <a href="${window.getBlogLink(post.slug)}" class="read-more">See More →</a>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }

      // Handle Load More visibility
      if (paginationContainer) {
        if (regularPosts.length > visibleCount) {
          paginationContainer.style.display = 'block';
        } else {
          paginationContainer.style.display = 'none';
        }
      }
    };

    // Run initial state
    updateCategories();
    render();
  }


};

/* ════════════════════════════════════════════════════
   PORTFOLIO LIGHTBOX GALLERY WITH CATEGORY FILTERING
   ════════════════════════════════════════════════════ */
(function() {
    // 1. Inject Lightbox CSS Stylesheet
    const lightboxStyles = `
    .custom-lightbox {
        position: fixed;
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(11, 15, 25, 0.98);
        z-index: 10000;
        display: none;
        justify-content: center;
        align-items: center;
        opacity: 0;
        transition: opacity 0.3s ease;
        user-select: none;
    }
    .custom-lightbox.active {
        display: flex;
        opacity: 1;
    }
    .lightbox-content {
        position: relative;
        max-width: 90%;
        max-height: 85vh;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .lightbox-img {
        max-width: 100%;
        max-height: 85vh;
        border-radius: 6px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        user-select: none;
        pointer-events: none;
    }
    .lightbox-close {
        position: absolute;
        top: 30px; right: 30px;
        background: transparent;
        border: none;
        color: #fff;
        font-size: 2.2rem;
        cursor: pointer;
        opacity: 0.7;
        transition: opacity 0.2s, transform 0.2s;
        z-index: 10002;
        padding: 10px;
    }
    .lightbox-close:hover {
        opacity: 1;
        transform: scale(1.1);
    }
    .lightbox-nav {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        color: #fff;
        width: 50px; height: 50px;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        font-size: 1.5rem;
        transition: all 0.2s ease;
        z-index: 10001;
        user-select: none;
    }
    .lightbox-nav:hover {
        background: rgba(255,255,255,0.15);
        border-color: rgba(255,255,255,0.25);
        transform: translateY(-50%) scale(1.05);
    }
    .lightbox-nav-prev {
        left: 40px;
    }
    .lightbox-nav-next {
        right: 40px;
    }
    .lightbox-info {
        position: absolute;
        bottom: -40px;
        left: 50%;
        transform: translateX(-50%);
        color: #fff;
        font-family: sans-serif;
        font-size: 0.9rem;
        font-weight: 500;
        letter-spacing: 0.05em;
        opacity: 0.8;
        white-space: nowrap;
        text-align: center;
    }
    @media (max-width: 768px) {
        .lightbox-nav {
            width: 40px; height: 40px;
            font-size: 1.2rem;
        }
        .lightbox-nav-prev { left: 15px; }
        .lightbox-nav-next { right: 15px; }
        .lightbox-close { top: 15px; right: 15px; font-size: 1.8rem; }
    }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.innerText = lightboxStyles;
    document.head.appendChild(styleSheet);

    // 2. Inject Lightbox HTML Markup on DOMContentLoaded / load
    function injectLightboxHTML() {
        if (document.getElementById('portfolio-lightbox')) return;
        const lightboxMarkup = `
        <div class="custom-lightbox" id="portfolio-lightbox">
            <button class="lightbox-close" id="lightbox-close-btn">&times;</button>
            <div class="lightbox-nav lightbox-nav-prev" id="lightbox-prev-btn">&#10094;</div>
            <div class="lightbox-content">
                <img class="lightbox-img" id="lightbox-display-img" src="" alt="Portfolio Large View">
                <div class="lightbox-info" id="lightbox-counter-info"></div>
            </div>
            <div class="lightbox-nav lightbox-nav-next" id="lightbox-next-btn">&#10095;</div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', lightboxMarkup);
        bindLightboxEvents();
    }

    let currentItems = [];
    let currentIndex = 0;
    let currentCategory = 'covers';

    function bindLightboxEvents() {
        const lightbox = document.getElementById('portfolio-lightbox');
        const closeBtn = document.getElementById('lightbox-close-btn');
        const prevBtn = document.getElementById('lightbox-prev-btn');
        const nextBtn = document.getElementById('lightbox-next-btn');
        const displayImg = document.getElementById('lightbox-display-img');
        const counterInfo = document.getElementById('lightbox-counter-info');

        function closeLightbox() {
            lightbox.classList.remove('active');
        }

        function showItem(index) {
            if (index < 0 || index >= currentItems.length) return;
            currentIndex = index;
            
            const item = currentItems[currentIndex];
            displayImg.src = item.src;
            
            const catNames = {
                'covers': 'Book Covers',
                'paperback-covers': 'Paperback Covers',
                'children': 'Children Books & Illustration',
                'formatting': 'Interior Book Formatting',
                'a-plus-content': 'A+ Content Layout',
                'logo-branding': 'Logo & Branding'
            };
            const catLabel = catNames[currentCategory] || currentCategory.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            counterInfo.textContent = `${catLabel} — ${currentIndex + 1} of ${currentItems.length}`;
        }

        closeBtn.addEventListener('click', closeLightbox);
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showItem((currentIndex - 1 + currentItems.length) % currentItems.length);
        });
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showItem((currentIndex + 1) % currentItems.length);
        });

        // Close when clicking on background overlay
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') showItem((currentIndex - 1 + currentItems.length) % currentItems.length);
            if (e.key === 'ArrowRight') showItem((currentIndex + 1) % currentItems.length);
        });

        window.openLightboxFor = function(imgSrc, category, clickedCard) {
            currentCategory = category;
            
            // Gather all cards of the same category
            const cards = Array.from(document.querySelectorAll('.portfolio-card')).filter(c => {
                const cCat = c.getAttribute('data-cat') || 'covers';
                return cCat === category;
            });

            // Extract src and elements
            const rawItems = cards.map(c => {
                const imgEl = c.querySelector('.portfolio-thumb img') || c.querySelector('img');
                return {
                    src: imgEl ? imgEl.getAttribute('src') : '',
                    cardEl: c
                };
            }).filter(item => item.src);

            // Deduplicate to prevent marquee clone doubling
            currentItems = [];
            const seen = new Set();
            rawItems.forEach(item => {
                // Ignore base64 loaders or empty images
                if (item.src.startsWith('data:image/svg+xml')) return;
                
                if (!seen.has(item.src)) {
                    seen.add(item.src);
                    currentItems.push(item);
                }
            });

            if (currentItems.length === 0) return;

            // Find index of clicked item
            let index = currentItems.findIndex(item => item.cardEl === clickedCard);
            if (index === -1) {
                index = currentItems.findIndex(item => item.src === imgSrc);
            }
            if (index === -1) index = 0;

            showItem(index);
            lightbox.classList.add('active');
        };
    }

    // 3. Dynamic click interceptor delegator
    document.addEventListener('click', function(e) {
        const card = e.target.closest('.portfolio-card');
        if (!card) return;
        
        // Ignore if user clicked inside book control buttons or edit toolbars
        if (e.target.closest('.book-controls-row') || e.target.closest('.card-toolbar') || e.target.closest('.btn') || e.target.closest('button')) return;
        
        const img = card.querySelector('.portfolio-thumb img') || card.querySelector('img');
        if (!img) return;

        // Skip svg placeholders
        const src = img.getAttribute('src');
        if (src && src.startsWith('data:image/svg+xml')) return;

        e.preventDefault();
        const cat = card.getAttribute('data-cat') || 'covers';
        if (cat === 'children') return;
        
        if (window.openLightboxFor) {
            window.openLightboxFor(src, cat, card);
        }
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectLightboxHTML);
    } else {
        injectLightboxHTML();
    }
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', window.initSiteLogic);
} else {
  window.initSiteLogic();
}

document.addEventListener('DOMContentLoaded', () => {
  // Number counting effect on hover for stat cards
  document.querySelectorAll('.stat').forEach(stat => {
    const numEl = stat.querySelector('.num');
    if (!numEl) return;
    
    // Check if it contains an icon, if so skip
    if (numEl.querySelector('i')) return;
    
    const originalText = numEl.textContent.trim();
    const targetMatch = originalText.match(/(\d+)/);
    if (!targetMatch) return;
    
    const targetNumber = parseInt(targetMatch[0], 10);
    const suffix = originalText.replace(targetMatch[0], '');
    
    let isCounting = false;
    
    stat.addEventListener('mouseenter', () => {
      if (isCounting) return;
      isCounting = true;
      const duration = 1500; // 1.5 seconds
      const startTime = performance.now();
      
      const updateNumber = (time) => {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOutQuad = t => t * (2 - t);
        const currentNum = Math.floor(easeOutQuad(progress) * targetNumber);
        
        numEl.textContent = Math.max(1, currentNum) + suffix;
        
        if (progress < 1) {
          requestAnimationFrame(updateNumber);
        } else {
          numEl.textContent = originalText;
          isCounting = false;
        }
      };
      
      requestAnimationFrame(updateNumber);
    });
  });
});
