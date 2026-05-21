/* =============================================================
   PREMIUM BACKGROUND ANIMATION SYSTEM
   Reversible — controlled via localStorage key 'bg_anim'
   Public API: window.bgAnim.enable() / disable() / isOn()
   ============================================================= */
(function () {
  'use strict';

  var KEY     = 'bg_anim';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Orb definitions (position in %, size in px) ─────────────── */
  var ORBS = [
    { w:720, h:600, top:-10, left:-8,   c:'rgba(24,76,58,0.08)',    blur:110, dur:18, delay:0,  amp:28 },
    { w:500, h:500, top:10,  left:62,   c:'rgba(240,180,41,0.08)',  blur: 85, dur:14, delay:3,  amp:20 },
    { w:580, h:480, top:42,  left:-12,  c:'rgba(180,220,195,0.09)', blur:100, dur:22, delay:7,  amp:24 },
    { w:420, h:420, top:68,  left:72,   c:'rgba(24,76,58,0.06)',    blur: 70, dur:16, delay:2,  amp:18 },
    { w:540, h:380, top:28,  left:38,   c:'rgba(255,238,190,0.10)', blur:115, dur:20, delay:9,  amp:26 },
    { w:360, h:360, top:82,  left:18,   c:'rgba(240,180,41,0.06)',  blur: 65, dur:12, delay:5,  amp:14 },
    { w:300, h:300, top:55,  left:50,   c:'rgba(255,255,255,0.06)', blur: 80, dur:25, delay:11, amp:16 },
  ];

  var PARTICLE_COLORS = [
    'rgba(24,76,58,',
    'rgba(240,180,41,',
    'rgba(180,210,190,',
    'rgba(255,255,255,',
  ];

  /* ── Inject global styles ─────────────────────────────────────── */
  function injectStyles() {
    if (document.getElementById('bg-anim-styles')) return;
    var s = document.createElement('style');
    s.id = 'bg-anim-styles';
    s.textContent = [
      /* Wrapper — fixed behind everything, no pointer events */
      '#bg-anim-wrap{',
        'position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;',
      '}',
      /* Individual orbs */
      '.bg-orb{',
        'position:absolute;border-radius:50%;pointer-events:none;',
        'will-change:transform;',
      '}',
      /* Float keyframes — each orb uses inline animation-duration/delay */
      '@keyframes bgOrbFloat{',
        '0%,100%{transform:translateY(0px) scale(1);}',
        '33%{transform:translateY(-28px) scale(1.04) rotate(2deg);}',
        '66%{transform:translateY(-14px) scale(0.98) rotate(-1deg);}',
      '}',
      /* Particle canvas */
      '#bg-anim-canvas{',
        'position:fixed;inset:0;z-index:0;pointer-events:none;',
      '}',
      /* Radial highlight behind hero */
      '#bg-hero-glow{',
        'position:fixed;top:0;left:0;right:0;height:80vh;z-index:0;pointer-events:none;',
        'background:radial-gradient(ellipse 70% 55% at 60% 40%,',
          'rgba(240,180,41,0.05) 0%,rgba(24,76,58,0.04) 45%,transparent 75%);',
        reduced ? '' : 'animation:heroGlowPulse 8s ease-in-out infinite;',
      '}',
      '@keyframes heroGlowPulse{',
        '0%,100%{opacity:0.7;}50%{opacity:1;}',
      '}',
      /* Ensure page content stacks above background */
      '.navbar,.hero,.services,.portfolio,.about,.tools,.testimonials,',
      '.pricing,.contact,footer{',
        'position:relative;z-index:1;',
      '}',
    ].join('');
    document.head.appendChild(s);
  }

  /* ── Build orb DOM ────────────────────────────────────────────── */
  function buildOrbs(wrap) {
    ORBS.forEach(function (o, i) {
      var el = document.createElement('div');
      el.className = 'bg-orb';
      el.id = 'bg-orb-' + i;
      var anim = reduced ? 'none'
        : ('bgOrbFloat ' + o.dur + 's ease-in-out ' + o.delay + 's infinite');
      el.style.cssText = [
        'width:'      + o.w    + 'px',
        'height:'     + o.h    + 'px',
        'top:'        + o.top  + '%',
        'left:'       + o.left + '%',
        'background:' + o.c,
        'filter:blur(' + o.blur + 'px)',
        'animation:'  + anim,
        'opacity:1',
        'transform-origin:center center',
      ].join(';');
      wrap.appendChild(el);
    });
  }

  /* ── Particle canvas ──────────────────────────────────────────── */
  var _canvasRaf = null;
  function initCanvas() {
    if (reduced) return;
    var canvas = document.createElement('canvas');
    canvas.id = 'bg-anim-canvas';
    document.body.insertBefore(canvas, document.body.firstChild);

    var ctx = canvas.getContext('2d');
    var W, H, particles = [];

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function mkPt(random) {
      return {
        x:   Math.random() * (W || 800),
        y:   random ? Math.random() * (H || 600) : (H || 600) + 5,
        r:   0.5 + Math.random() * 1.8,
        vy: -(0.06 + Math.random() * 0.18),
        vx:  (Math.random() - 0.5) * 0.10,
        op:  0.06 + Math.random() * 0.18,
        col: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      };
    }
    for (var i = 0; i < 48; i++) particles.push(mkPt(true));

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.y < -6) particles[i] = mkPt(false);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.col + p.op + ')';
        ctx.fill();
      }
      _canvasRaf = requestAnimationFrame(draw);
    }
    draw();
  }

  /* ── Mouse parallax ───────────────────────────────────────────── */
  var _parallaxRaf = null;
  function initParallax(wrap) {
    if (reduced) return;
    var mx = 0, my = 0;
    var cx = window.innerWidth  / 2;
    var cy = window.innerHeight / 2;
    var strengths = [0.016, 0.011, 0.014, 0.009, 0.007, 0.013, 0.018];
    var cur = ORBS.map(function () { return { x: 0, y: 0 }; });
    var orbs = wrap.querySelectorAll('.bg-orb');

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX - cx; my = e.clientY - cy;
    });
    window.addEventListener('resize', function () {
      cx = window.innerWidth / 2; cy = window.innerHeight / 2;
    });

    function tick() {
      orbs.forEach(function (el, i) {
        var tx = mx * strengths[i] * 14;
        var ty = my * strengths[i] * 14;
        cur[i].x += (tx - cur[i].x) * 0.035;
        cur[i].y += (ty - cur[i].y) * 0.035;
        el.style.marginLeft = cur[i].x.toFixed(2) + 'px';
        el.style.marginTop  = cur[i].y.toFixed(2) + 'px';
      });
      _parallaxRaf = requestAnimationFrame(tick);
    }
    tick();
  }

  /* ── Scroll parallax (subtle vertical drift on orbs) ─────────── */
  function initScrollParallax(wrap) {
    if (reduced) return;
    var orbs = wrap.querySelectorAll('.bg-orb');
    var speeds = [0.12, 0.08, 0.10, 0.06, 0.05, 0.09, 0.14];
    window.addEventListener('scroll', function () {
      var sy = window.scrollY;
      orbs.forEach(function (el, i) {
        el.style.transform = el.style.transform
          ? el.style.transform.replace(/translateY\([^)]+\)\s?/, '')
            + ' translateY(' + (sy * speeds[i]).toFixed(1) + 'px)'
          : 'translateY(' + (sy * speeds[i]).toFixed(1) + 'px)';
      });
    }, { passive: true });
  }

  /* ── Build everything ─────────────────────────────────────────── */
  function build() {
    if (document.getElementById('bg-anim-wrap')) return;
    injectStyles();

    // Hero glow overlay
    var glow = document.createElement('div');
    glow.id = 'bg-hero-glow';
    document.body.insertBefore(glow, document.body.firstChild);

    // Orb container
    var wrap = document.createElement('div');
    wrap.id = 'bg-anim-wrap';
    buildOrbs(wrap);
    document.body.insertBefore(wrap, document.body.firstChild);

    initCanvas();
    initParallax(wrap);
    initScrollParallax(wrap);
  }

  /* ── Enable / Disable ─────────────────────────────────────────── */
  function show() {
    ['bg-anim-wrap','bg-anim-canvas','bg-hero-glow'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.style.display = '';
    });
    if (_canvasRaf === null) {
      var canvas = document.getElementById('bg-anim-canvas');
      if (canvas) { /* RAF resumes via requestAnimationFrame from build */ }
    }
  }

  /* ── Hero Video Helpers ───────────────────────────────────────── */
  function showHeroVideo() {
    var video = document.getElementById('hero-bg-video');
    if (video) {
      video.style.display = 'block';
      video.play().catch(function (err) {
        console.log('Hero video play failed or interrupted', err);
      });
    }
  }

  function hideHeroVideo() {
    var video = document.getElementById('hero-bg-video');
    if (video) {
      video.style.display = 'none';
      video.pause();
    }
  }

  function enable() {
    localStorage.setItem(KEY, '1');
    if (!document.getElementById('bg-anim-wrap')) build();
    else show();
    showHeroVideo();
    updateAdminToggle(true);
  }

  function disable() {
    localStorage.setItem(KEY, '0');
    ['bg-anim-wrap','bg-anim-canvas','bg-hero-glow'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    hideHeroVideo();
    updateAdminToggle(false);
  }

  function isOn() {
    return localStorage.getItem(KEY) !== '0';
  }

  /* ── Admin toggle button update ───────────────────────────────── */
  function updateAdminToggle(on) {
    var btn = document.getElementById('bg-anim-admin-toggle');
    if (!btn) return;
    btn.textContent = on ? '🌟 BG Animation: ON' : '⬜ BG Animation: OFF';
    btn.style.background = on ? '#20c997' : '#555';
  }

  /* ── Inject admin toggle into admin panel ─────────────────────── */
  function injectAdminToggle() {
    // Wait for admin panel to exist
    var panel = document.getElementById('super-admin-panel');
    if (!panel) return;
    var controls = panel.querySelector('.admin-controls');
    if (!controls) return;
    if (document.getElementById('bg-anim-admin-toggle')) return;

    var btn = document.createElement('button');
    btn.id = 'bg-anim-admin-toggle';
    btn.className = 'admin-btn';
    btn.style.cssText = 'background:' + (isOn() ? '#20c997' : '#555') + ';';
    btn.textContent = isOn() ? '🌟 BG Animation: ON' : '⬜ BG Animation: OFF';
    btn.addEventListener('click', function () {
      if (isOn()) disable(); else enable();
    });

    // Insert before the danger "Reset" button
    var danger = controls.querySelector('.danger');
    controls.insertBefore(btn, danger || null);
  }

  /* ── Public API ───────────────────────────────────────────────── */
  window.bgAnim = { enable: enable, disable: disable, isOn: isOn, init: init };

  /* ── Auto-init ────────────────────────────────────────────────── */
  function init() {
    if (isOn()) {
      build();
      showHeroVideo();
    } else {
      hideHeroVideo();
    }

    if (!document.getElementById('bg-anim-admin-toggle')) {
      // Poll for admin panel to inject toggle (it renders dynamically)
      var tries = 0;
      var poll = setInterval(function () {
        injectAdminToggle();
        if (document.getElementById('bg-anim-admin-toggle') || tries++ > 40) {
          clearInterval(poll);
        }
      }, 300);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
