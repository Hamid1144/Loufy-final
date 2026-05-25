/* =============================================================
   PREMIUM ANTIGRAVITY PARTICLE BACKGROUND SYSTEM
   Ultra-smooth, interactive physics & 3D parallax scrolling.
   Controlled via localStorage key 'bg_anim'.
   Public API: window.bgAnim.enable() / disable() / isOn()
   ============================================================= */
(function () {
  'use strict';

  var KEY = 'bg_anim';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Canvas state variables ───────────────────────────────────── */
  var canvas = null;
  var ctx = null;
  var particles = [];
  var animationFrameId = null;
  var width = window.innerWidth;
  var height = window.innerHeight;
  var mouse = { x: 0, y: 0, active: false, targetX: 0, targetY: 0 };
  var scrollY = window.scrollY;

  /* ── Background soft ambient glow definitions ─────────────────── */
  var GLOW_ORBS = [
    { xRatio: 0.1, yRatio: 0.2, size: 700, c: 'rgba(99, 102, 241, 0.03)', speedX: 0.002, speedY: 0.003, angleX: 0, angleY: 0 },
    { xRatio: 0.8, yRatio: 0.7, size: 800, c: 'rgba(167, 139, 250, 0.03)', speedX: 0.001, speedY: 0.002, angleX: 0, angleY: 0 },
    { xRatio: 0.4, yRatio: 0.5, size: 600, c: 'rgba(45, 212, 191, 0.02)', speedX: 0.003, speedY: 0.001, angleX: 0, angleY: 0 }
  ];

  /* ── Inject global CSS rules for stacking layers ──────────────── */
  function injectStyles() {
    if (document.getElementById('bg-anim-styles')) return;
    var s = document.createElement('style');
    s.id = 'bg-anim-styles';
    s.textContent = [
      '#bg-anim-canvas {',
        'position:fixed;inset:0;z-index:0;pointer-events:none;background:transparent;will-change:transform;',
      '}',
      '#bg-hero-glow {',
        'position:fixed;top:0;left:0;right:0;height:100vh;z-index:0;pointer-events:none;',
        'background:radial-gradient(circle at 50% 30%, rgba(99,102,241,0.02) 0%, rgba(167,139,250,0.015) 50%, transparent 100%);',
      '}',
      '.navbar, .hero, .services, .portfolio, .about, .tools, .testimonials, .pricing, .contact, footer {',
        'position:relative;z-index:1;',
      '}'
    ].join('');
    document.head.appendChild(s);
  }

  /* ── Particle Class ───────────────────────────────────────────── */
  function Particle() {
    this.reset(true);
  }

  Particle.prototype.reset = function (init) {
    this.bx = Math.random() * width;
    this.by = init ? Math.random() * height : height + 20;
    this.x = this.bx;
    this.y = this.by;
    this.lastX = this.x;
    this.lastY = this.y;
    
    // Depth/parallax coefficient (0.5 to 1.5)
    // Larger z means closer, faster, larger, and more responsive to mouse
    this.z = 0.5 + Math.random() * 1.0;
    this.r = (0.5 + Math.random() * 0.9) * this.z;

    // Drifting velocity
    this.vx = (Math.random() - 0.5) * 0.16 * (1 / this.z);
    this.vy = -(0.05 + Math.random() * 0.12) * this.z;

    // Drifting sinusoidal oscillation values
    this.angleX = Math.random() * Math.PI * 2;
    this.angleY = Math.random() * Math.PI * 2;
    this.speedX = 0.003 + Math.random() * 0.007;
    this.speedY = 0.003 + Math.random() * 0.007;
    this.ampX = (5 + Math.random() * 12) * this.z;
    this.ampY = (5 + Math.random() * 12) * this.z;

    // Base opacity
    this.baseAlpha = 0.06 + Math.random() * 0.16;
    this.alpha = this.baseAlpha;
    
    this.colorSeed = Math.random();
    this.isHighlight = false;
    this.highlightRatio = 0;
  };

  Particle.prototype.update = function () {
    this.lastX = this.x;
    this.lastY = this.y;

    // 1. Update basic drift position
    this.bx += this.vx;
    this.by += this.vy;

    // Recycle particle if it floats off-screen
    if (this.by < -10 || this.bx < -20 || this.bx > width + 20) {
      this.reset(false);
      return;
    }

    // Sine-wave noise drifting offsets
    this.angleX += this.speedX;
    this.angleY += this.speedY;
    var driftX = this.bx + Math.sin(this.angleX) * this.ampX;
    var driftY = this.by + Math.cos(this.angleY) * this.ampY;

    // Apply scroll parallax offset (closer particles scroll faster)
    var scrollOffset = scrollY * (this.z - 0.8) * 0.15;
    var targetX = driftX;
    var targetY = driftY - scrollOffset;
    var targetAlpha = this.baseAlpha;

    this.isHighlight = false;
    this.highlightRatio = 0;

    // 2. Mouse cursor interactive physics
    if (mouse.active) {
      var dx = driftX - mouse.x;
      var dy = (driftY - scrollOffset) - mouse.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var radius = 200 * this.z; // Closer particles have a larger interaction zone

      if (dist < radius) {
        var force = (radius - dist) / radius; // 0 (edge) to 1 (cursor center)
        
        // Repulsion force vector
        var angle = Math.atan2(dy, dx);
        var repelDistance = 75 * this.z; // repulsion strength
        var repelX = Math.cos(angle) * force * repelDistance;
        var repelY = Math.sin(angle) * force * repelDistance;

        // Tangential orbit swirl vector (luxury tech fluid motion)
        var swirlAngle = angle + Math.PI / 2;
        var swirlDistance = 35 * (1 / this.z) * force;
        var swirlX = Math.cos(swirlAngle) * swirlDistance;
        var swirlY = Math.sin(swirlAngle) * swirlDistance;

        targetX += repelX + swirlX;
        targetY += repelY + swirlY;
        
        // Boost visibility when interacting
        targetAlpha = this.baseAlpha + force * 0.65;

        this.isHighlight = true;
        this.highlightRatio = force;
      }
    }

    // 3. Easing: Interpolate current position to target coordinate (lerp)
    var ease = 0.08;
    this.x += (targetX - this.x) * ease;
    this.y += (targetY - this.y) * ease;
    this.alpha += (targetAlpha - this.alpha) * 0.1;
  };

  Particle.prototype.draw = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);

    if (this.isHighlight) {
      var ratio = this.highlightRatio;
      
      // Interpolate Slate-900 (15,23,42) to AI purple (139, 92, 246) or blue (99, 102, 241)
      var targetR = this.colorSeed > 0.5 ? 99 : 139;
      var targetG = this.colorSeed > 0.5 ? 102 : 92;
      var targetB = this.colorSeed > 0.5 ? 241 : 246;

      var r = Math.round(15 + (targetR - 15) * ratio);
      var g = Math.round(23 + (targetG - 23) * ratio);
      var b = Math.round(42 + (targetB - 42) * ratio);

      ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + this.alpha + ')';

      // Subtle drop glow shadow for highlighted particles
      if (ratio > 0.4) {
        ctx.shadowColor = 'rgba(' + targetR + ',' + targetG + ',' + targetB + ',' + (ratio * 0.3) + ')';
        ctx.shadowBlur = 4;
      }
    } else {
      ctx.fillStyle = 'rgba(15,23,42,' + this.alpha + ')';
    }

    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Draw subtle motion vector trails
    if (this.isHighlight && this.highlightRatio > 0.2) {
      ctx.beginPath();
      ctx.moveTo(this.lastX, this.lastY);
      ctx.lineTo(this.x, this.y);
      ctx.strokeStyle = 'rgba(99,102,241,' + (this.alpha * 0.25) + ')';
      ctx.lineWidth = this.r * 0.8;
      ctx.stroke();
    }
  };

  /* ── Canvas Initialization ────────────────────────────────────── */
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function initCanvas() {
    if (reduced) return;
    
    canvas = document.createElement('canvas');
    canvas.id = 'bg-anim-canvas';
    document.body.insertBefore(canvas, document.body.firstChild);
    ctx = canvas.getContext('2d');

    resize();
    window.addEventListener('resize', resize);

    // Dynamic density particle count (based on screen pixels)
    var count = Math.min(1000, Math.floor((width * height) / 1600));
    particles = [];
    for (var i = 0; i < count; i++) {
      particles.push(new Particle());
    }

    // Interactive mouse positioning trackers
    document.addEventListener('mousemove', function (e) {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
    });

    document.addEventListener('mouseleave', function () {
      mouse.active = false;
    });

    window.addEventListener('scroll', function () {
      scrollY = window.scrollY;
    }, { passive: true });

    // Loop
    function loop() {
      if (!canvas || canvas.style.display === 'none') return;
      
      ctx.clearRect(0, 0, width, height);

      // 1. Draw smooth interactive radial cursor bloom
      if (mouse.active) {
        // Interpolate mouse coordinates to avoid stuttering
        mouse.x += (mouse.targetX - mouse.x) * 0.12;
        mouse.y += (mouse.targetY - mouse.y) * 0.12;

        var radialGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 240);
        radialGlow.addColorStop(0, 'rgba(139,92,246,0.035)');
        radialGlow.addColorStop(0.5, 'rgba(99,102,241,0.015)');
        radialGlow.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = radialGlow;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Draw extremely soft floating background shapes
      GLOW_ORBS.forEach(function (orb) {
        orb.angleX += orb.speedX;
        orb.angleY += orb.speedY;
        
        var ox = width * orb.xRatio + Math.sin(orb.angleX) * 40;
        var oy = height * orb.yRatio - (scrollY * 0.12) + Math.cos(orb.angleY) * 30;

        var rad = ctx.createRadialGradient(ox, oy, 0, ox, oy, orb.size);
        rad.addColorStop(0, orb.c);
        rad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = rad;
        ctx.beginPath();
        ctx.arc(ox, oy, orb.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Update & render particles
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.update();
        p.draw();
      }

      animationFrameId = requestAnimationFrame(loop);
    }

    loop();
  }

  /* ── Build / Tear Down Background DOM ─────────────────────────── */
  function build() {
    // Evict stale versions
    ['bg-anim-canvas', 'bg-hero-glow'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.parentNode.removeChild(el);
    });

    injectStyles();

    // 1. Ambient preloader glow overlay
    var glow = document.createElement('div');
    glow.id = 'bg-hero-glow';
    document.body.insertBefore(glow, document.body.firstChild);

    // 2. Interactive canvas
    initCanvas();
  }

  function show() {
    ['bg-anim-canvas', 'bg-hero-glow'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.style.display = '';
    });
    // Restart animation loop if canvas exists but loops were paused
    if (canvas && !animationFrameId) {
      build();
    }
  }

  function hide() {
    ['bg-anim-canvas', 'bg-hero-glow'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  /* ── Enable / Disable System ──────────────────────────────────── */
  function enable() {
    localStorage.setItem(KEY, '1');
    if (!document.getElementById('bg-anim-canvas')) {
      build();
    } else {
      show();
    }
    updateAdminToggle(true);
  }

  function disable() {
    localStorage.setItem(KEY, '0');
    hide();
    updateAdminToggle(false);
  }

  function isOn() {
    return localStorage.getItem(KEY) !== '0';
  }

  /* ── Admin Toggle Interface updates ────────────────────────────── */
  function updateAdminToggle(on) {
    var btn = document.getElementById('bg-anim-admin-toggle');
    if (!btn) return;
    btn.innerHTML = on ? '<i class="fa-solid fa-wand-magic-sparkles"></i> Antigravity BG: ON' : '<i class="fa-solid fa-ban"></i> Antigravity BG: OFF';
    btn.style.background = on ? '#20c997' : '#555';
  }

  function injectAdminToggle() {
    var panel = document.getElementById('super-admin-panel');
    if (!panel) return;
    var controls = panel.querySelector('.admin-controls');
    if (!controls) return;
    if (document.getElementById('bg-anim-admin-toggle')) return;

    var btn = document.createElement('button');
    btn.id = 'bg-anim-admin-toggle';
    btn.className = 'admin-btn';
    btn.style.cssText = 'background:' + (isOn() ? '#20c997' : '#555') + ';';
    btn.innerHTML = isOn() ? '<i class="fa-solid fa-wand-magic-sparkles"></i> Antigravity BG: ON' : '<i class="fa-solid fa-ban"></i> Antigravity BG: OFF';
    
    btn.addEventListener('click', function () {
      if (isOn()) disable(); else enable();
    });

    var danger = controls.querySelector('.danger');
    controls.insertBefore(btn, danger || null);
  }

  /* ── Public API ───────────────────────────────────────────────── */
  window.bgAnim = {
    enable: enable,
    disable: disable,
    isOn: isOn,
    init: init
  };

  /* ── Initialization ───────────────────────────────────────────── */
  function init() {
    if (isOn()) {
      build();
    } else {
      hide();
    }

    if (!document.getElementById('bg-anim-admin-toggle')) {
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
