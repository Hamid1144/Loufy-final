/* =============================================================
   PREMIUM CUSTOMIZABLE ANTIGRAVITY PARTICLE BACKGROUND SYSTEM
   Ultra-smooth, interactive physics & 3D parallax scrolling.
   Controlled via localStorage and script serialization.
   ============================================================= */
(function () {
  'use strict';

  var KEY = 'bg_anim';
  var CONFIG_KEY = 'particle_settings';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Default Configurations ───────────────────────────────────────
  var DEFAULT_CONFIG = {
    enabled: true,
    size: 1.5,            // Slider: 0.5 to 10
    density: 350,         // Slider: 50 to 1200
    color1: '#6366f1',    // Accent color 1 (Indigo)
    color2: '#a78bfa',    // Accent color 2 (Violet)
    color3: '#0f172a',    // Base color (Slate-900)
    style: 'glow',        // 'solid', 'glow', 'blur', 'star', 'gradient', 'connected'
    speed: 1.0,           // Slider: 0.1 to 3.0
    interaction: 'repel', // 'repel', 'attract', 'follow', 'wave', 'magnetic'
    glowIntensity: 4,     // Slider: 0 to 15
    blendMode: 'adaptive', // 'adaptive', 'light', 'dark'
    opacity: 0.22,        // Slider: 0.05 to 1.0
    randomness: 4.0,      // Slider: 0.0 to 10.0
    zoom: 1.0,            // Slider: 0.5 to 2.0
  };

  var pConfig = Object.assign({}, DEFAULT_CONFIG);

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

  /* ── Helper: Hex color parser to RGB ─────────────────────────── */
  function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 15, g: 23, b: 42 };
  }

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

  /* ── Get theme context ────────────────────────────────────────── */
  function isDarkThemeActive() {
    if (pConfig.blendMode === 'dark') return true;
    if (pConfig.blendMode === 'light') return false;
    // Adaptive
    return window.matchMedia('(prefers-color-scheme: dark)').matches || document.body.classList.contains('dark-theme');
  }

  /* ── Star Drawing Helper ──────────────────────────────────────── */
  function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius, fillStyle) {
    var rot = Math.PI / 2 * 3;
    var x = cx;
    var y = cy;
    var step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (var i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fillStyle = fillStyle;
    ctx.fill();
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
    
    // Depth parallax coefficient (0.5 to 1.5)
    this.z = 0.5 + Math.random() * 1.0;
    this.r = (pConfig.size / 2 + Math.random() * (pConfig.size / 2)) * this.z;

    // Drifting velocity
    var speedMult = pConfig.speed;
    this.vx = (Math.random() - 0.5) * 0.16 * (1 / this.z) * speedMult;
    this.vy = -(0.05 + Math.random() * 0.12) * this.z * speedMult;

    // Sinusoidal noise drift parameters
    this.angleX = Math.random() * Math.PI * 2;
    this.angleY = Math.random() * Math.PI * 2;
    this.speedX = (0.003 + Math.random() * 0.007) * speedMult;
    this.speedY = (0.003 + Math.random() * 0.007) * speedMult;
    this.ampX = (5 + Math.random() * 12) * this.z * pConfig.randomness;
    this.ampY = (5 + Math.random() * 12) * this.z * pConfig.randomness;

    // Opacity
    this.baseAlpha = pConfig.opacity * (0.3 + Math.random() * 0.7);
    this.alpha = this.baseAlpha;
    
    this.colorSeed = Math.random();
    this.isHighlight = false;
    this.highlightRatio = 0;
  };

  Particle.prototype.update = function () {
    this.lastX = this.x;
    this.lastY = this.y;

    // 1. Update basic drift coordinates
    var speedMult = pConfig.speed;
    this.bx += this.vx;
    this.by += this.vy;

    // Recycle if out of view
    if (this.by < -20 || this.bx < -30 || this.bx > width + 30 || this.by > height + 30) {
      this.reset(false);
      return;
    }

    this.angleX += this.speedX;
    this.angleY += this.speedY;
    var driftX = this.bx + Math.sin(this.angleX) * this.ampX;
    var driftY = this.by + Math.cos(this.angleY) * this.ampY;

    // Parallax scrolling offset
    var scrollOffset = scrollY * (this.z - 0.8) * 0.15;
    var targetX = driftX;
    var targetY = driftY - scrollOffset;
    var targetAlpha = this.baseAlpha;

    this.isHighlight = false;
    this.highlightRatio = 0;

    // 2. Interactive physics modes
    if (mouse.active) {
      var dx = driftX - mouse.x;
      var dy = (driftY - scrollOffset) - mouse.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var radius = 200 * this.z;

      if (dist < radius) {
        var force = (radius - dist) / radius; // 0 to 1
        var angle = Math.atan2(dy, dx);
        
        if (pConfig.interaction === 'repel') {
          // Repel away with circular swirl
          var repelDistance = 75 * this.z;
          var repelX = Math.cos(angle) * force * repelDistance;
          var repelY = Math.sin(angle) * force * repelDistance;

          var swirlAngle = angle + Math.PI / 2;
          var swirlDistance = 35 * (1 / this.z) * force;
          var swirlX = Math.cos(swirlAngle) * swirlDistance;
          var swirlY = Math.sin(swirlAngle) * swirlDistance;

          targetX += repelX + swirlX;
          targetY += repelY + swirlY;
        } 
        else if (pConfig.interaction === 'attract') {
          // Attract towards cursor
          var attractDistance = 60 * this.z;
          targetX += -Math.cos(angle) * force * attractDistance;
          targetY += -Math.sin(angle) * force * attractDistance;
        }
        else if (pConfig.interaction === 'follow') {
          // Direct follow pull
          targetX += -dx * force * 0.55;
          targetY += -dy * force * 0.55;
        }
        else if (pConfig.interaction === 'wave') {
          // Wave distortion field
          var waveFreq = 0.04;
          var waveAmp = 25 * force;
          var waveOffset = Math.sin(dist * waveFreq - (Date.now() * 0.008)) * waveAmp;
          targetX += Math.cos(angle) * waveOffset;
          targetY += Math.sin(angle) * waveOffset;
        }
        else if (pConfig.interaction === 'magnetic') {
          // High gravity vacuum pull
          targetX += -dx * force * 0.85;
          targetY += -dy * force * 0.85;
        }

        // Boost opacity
        targetAlpha = pConfig.opacity + force * 0.65;
        this.isHighlight = true;
        this.highlightRatio = force;
      }
    }

    // 3. Smooth Lerp positioning
    var ease = 0.08;
    this.x += (targetX - this.x) * ease;
    this.y += (targetY - this.y) * ease;
    this.alpha += (targetAlpha - this.alpha) * 0.1;
  };

  Particle.prototype.draw = function () {
    // Determine colors
    var baseRGB = hexToRgb(pConfig.color3);
    var acc1RGB = hexToRgb(pConfig.color1);
    var acc2RGB = hexToRgb(pConfig.color2);
    
    // Resolve base adaptive color swap if color3 is default Slate-900 and theme is dark
    var isDark = isDarkThemeActive();
    if (pConfig.color3 === '#0f172a' && isDark) {
      baseRGB = { r: 226, g: 232, b: 240 }; // Slate-200
    }

    var colStr = '';
    if (this.isHighlight) {
      var ratio = this.highlightRatio;
      var targetR = this.colorSeed > 0.5 ? acc1RGB.r : acc2RGB.r;
      var targetG = this.colorSeed > 0.5 ? acc1RGB.g : acc2RGB.g;
      var targetB = this.colorSeed > 0.5 ? acc1RGB.b : acc2RGB.b;

      var r = Math.round(baseRGB.r + (targetR - baseRGB.r) * ratio);
      var g = Math.round(baseRGB.g + (targetG - baseRGB.g) * ratio);
      var b = Math.round(baseRGB.b + (targetB - baseRGB.b) * ratio);

      colStr = 'rgba(' + r + ',' + g + ',' + b + ',' + this.alpha + ')';

      // Drop shadow glow effect for highlights
      if (ratio > 0.4 && pConfig.glowIntensity > 0 && pConfig.style === 'glow') {
        ctx.shadowColor = 'rgba(' + targetR + ',' + targetG + ',' + targetB + ',' + (ratio * 0.4) + ')';
        ctx.shadowBlur = pConfig.glowIntensity;
      }
    } else {
      colStr = 'rgba(' + baseRGB.r + ',' + baseRGB.g + ',' + baseRGB.b + ',' + this.alpha + ')';
    }

    // Styles rendering
    if (pConfig.style === 'star') {
      drawStar(ctx, this.x, this.y, 4, this.r * 2, this.r * 0.5, colStr);
    } 
    else if (pConfig.style === 'blur') {
      var rad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 2.2);
      rad.addColorStop(0, colStr);
      rad.addColorStop(0.4, colStr);
      rad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = rad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    else if (pConfig.style === 'gradient') {
      var rad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
      var innerCol = isDark ? '#ffffff' : 'rgba(255,255,255,0.9)';
      rad.addColorStop(0, innerCol);
      rad.addColorStop(0.4, colStr);
      rad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = rad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
    }
    else {
      // Solid or glow dots
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = colStr;
      ctx.fill();
    }

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Render motion vectors if highlighting
    if (this.isHighlight && this.highlightRatio > 0.25 && pConfig.style !== 'connected') {
      ctx.beginPath();
      ctx.moveTo(this.lastX, this.lastY);
      ctx.lineTo(this.x, this.y);
      var trailTarget = this.colorSeed > 0.5 ? acc1RGB : acc2RGB;
      ctx.strokeStyle = 'rgba(' + trailTarget.r + ',' + trailTarget.g + ',' + trailTarget.b + ',' + (this.alpha * 0.25) + ')';
      ctx.lineWidth = this.r * 0.8;
      ctx.stroke();
    }
  };

  /* ── Canvas Loop & Drawing ─────────────────────────────────────── */
  function resize() {
    if (!canvas || !ctx) return;
    // Enhanced HD/Supersampling: use devicePixelRatio, but force at least 2.0 on lower resolution screens for crisp quality!
    var dpr = Math.max(window.devicePixelRatio || 1, 2.0);
    var zoom = pConfig.zoom || 1.0;
    width = window.innerWidth / zoom;
    height = window.innerHeight / zoom;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.scale(dpr * zoom, dpr * zoom);
  }

  function initCanvas() {
    if (reduced) return;
    
    canvas = document.createElement('canvas');
    canvas.id = 'bg-anim-canvas';
    document.body.insertBefore(canvas, document.body.firstChild);
    ctx = canvas.getContext('2d');

    resize();
    window.addEventListener('resize', resize);

    // Populate particles based on config density
    particles = [];
    for (var i = 0; i < pConfig.density; i++) {
      particles.push(new Particle());
    }

    document.addEventListener('mousemove', function (e) {
      var zoom = pConfig.zoom || 1.0;
      mouse.targetX = e.clientX / zoom;
      mouse.targetY = e.clientY / zoom;
      mouse.active = true;
    });

    document.addEventListener('mouseleave', function () {
      mouse.active = false;
    });

    window.addEventListener('scroll', function () {
      scrollY = window.scrollY;
    }, { passive: true });

    function loop() {
      if (!canvas || canvas.style.display === 'none') return;
      
      ctx.clearRect(0, 0, width, height);
      var isDarkTheme = isDarkThemeActive();

      // 1. Draw smooth interactive radial cursor glow
      if (mouse.active) {
        mouse.x += (mouse.targetX - mouse.x) * 0.12;
        mouse.y += (mouse.targetY - mouse.y) * 0.12;

        var radialGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 250);
        
        var radialColor1 = 'rgba(139,92,246,0.035)';
        var radialColor2 = 'rgba(99,102,241,0.015)';
        if (isDarkTheme) {
          radialColor1 = 'rgba(139,92,246,0.08)';
          radialColor2 = 'rgba(99,102,241,0.03)';
        }

        radialGlow.addColorStop(0, radialColor1);
        radialGlow.addColorStop(0.5, radialColor2);
        radialGlow.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = radialGlow;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Draw extremely soft floating background radial backdrop shapes
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

      // 3. Update particles
      for (var i = 0; i < particles.length; i++) {
        particles[i].update();
      }

      // 4. Draw connected line constellation style
      if (pConfig.style === 'connected') {
        var maxDistance = 75;
        for (var i = 0; i < particles.length; i++) {
          for (var j = i + 1; j < particles.length; j++) {
            var pi = particles[i];
            var pj = particles[j];
            var dx = pi.x - pj.x;
            var dy = pi.y - pj.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < maxDistance) {
              var connAlpha = (maxDistance - dist) / maxDistance * 0.15;
              ctx.strokeStyle = isDarkTheme ? 'rgba(255,255,255,' + connAlpha + ')' : 'rgba(15,23,42,' + connAlpha + ')';
              ctx.lineWidth = 0.55;
              ctx.beginPath();
              ctx.moveTo(pi.x, pi.y);
              ctx.lineTo(pj.x, pj.y);
              ctx.stroke();
            }
          }
        }
      }

      // 5. Draw particles
      for (var i = 0; i < particles.length; i++) {
        particles[i].draw();
      }

      animationFrameId = requestAnimationFrame(loop);
    }

    loop();
  }

  /* ── Persistence Configuration ─────────────────────────────────── */
  function getConfig() {
    // 1. Read from DOM store script tag (which represents Supabase database template)
    var script = document.getElementById('particle-config');
    if (script) {
      try {
        var parsed = JSON.parse(script.textContent);
        if (parsed && typeof parsed === 'object') {
          return Object.assign({}, DEFAULT_CONFIG, parsed);
        }
      } catch (e) {
        console.warn("Failed to parse particle-config script tag:", e);
      }
    }
    
    // 2. Fallback to localStorage
    try {
      var raw = localStorage.getItem(CONFIG_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return Object.assign({}, DEFAULT_CONFIG, parsed);
        }
      }
    } catch (e) {}

    return Object.assign({}, DEFAULT_CONFIG);
  }

  function saveConfig(c) {
    // 1. Save to localStorage
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(c));
    } catch(e) {}

    // 2. Write to DOM store script tag so it gets serialized when saving to Supabase
    var script = document.getElementById('particle-config');
    if (!script) {
      script = document.createElement('script');
      script.id = 'particle-config';
      script.type = 'application/json';
      document.body.appendChild(script);
    }
    script.textContent = JSON.stringify(c);

    // Apply the active settings immediately
    applySettingsToEngine(c);
  }

  function applySettingsToEngine(c) {
    if (!c.enabled || reduced) {
      hide();
      return;
    }
    show();

    // Recalculate zoom and resolution bounds dynamically
    resize();

    // Adjust particle array density length dynamically (no flickering)
    var targetCount = c.density;
    if (particles.length !== targetCount) {
      if (particles.length < targetCount) {
        var diff = targetCount - particles.length;
        for (var i = 0; i < diff; i++) {
          particles.push(new Particle());
        }
      } else {
        particles.length = targetCount;
      }
    }

    // Refresh particle styles/velocities instantly
    particles.forEach(function (p) {
      p.r = (c.size / 2 + Math.random() * (c.size / 2)) * p.z;
      p.baseAlpha = c.opacity * (0.3 + Math.random() * 0.7);
      
      var speedMult = c.speed;
      p.vx = (Math.random() - 0.5) * 0.16 * (1 / p.z) * speedMult;
      p.vy = -(0.05 + Math.random() * 0.12) * p.z * speedMult;
      
      p.speedX = (0.003 + Math.random() * 0.007) * speedMult;
      p.speedY = (0.003 + Math.random() * 0.007) * speedMult;
      p.ampX = (5 + Math.random() * 12) * p.z * c.randomness;
      p.ampY = (5 + Math.random() * 12) * p.z * c.randomness;
    });
  }

  /* ── Build / Tear Down Background DOM ─────────────────────────── */
  function build() {
    ['bg-anim-canvas', 'bg-hero-glow'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.parentNode.removeChild(el);
    });

    injectStyles();

    var glow = document.createElement('div');
    glow.id = 'bg-hero-glow';
    document.body.insertBefore(glow, document.body.firstChild);

    initCanvas();
  }

  function show() {
    ['bg-anim-canvas', 'bg-hero-glow'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.style.display = '';
    });
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
    pConfig.enabled = true;
    saveConfig(pConfig);
    updateAdminToggle(true);
  }

  function disable() {
    localStorage.setItem(KEY, '0');
    pConfig.enabled = false;
    saveConfig(pConfig);
    updateAdminToggle(false);
  }

  function isOn() {
    return localStorage.getItem(KEY) !== '0';
  }

  /* ── Admin Customization Panel injection ────────────────────────── */
  function updateAdminToggle(on) {
    var btn = document.getElementById('bg-anim-admin-toggle');
    if (!btn) return;
    btn.innerHTML = on ? '<i class="fa-solid fa-wand-magic-sparkles"></i> Antigravity BG: ON' : '<i class="fa-solid fa-ban"></i> Antigravity BG: OFF';
    btn.style.background = on ? '#20c997' : '#555';
    
    var enabledInput = document.getElementById('part-enabled');
    if (enabledInput) enabledInput.checked = on;
  }

  function buildPanelHTML() {
    var c = pConfig;
    return [
      '<div style="background:#1a1a1a; padding:15px; border-radius:8px; border:1px solid #333; color:#fff; font-family:\'Poppins\', sans-serif;">',
        '<h4 style="margin:0 0 12px; color:#20c997; font-size:0.92rem; text-transform:uppercase; letter-spacing:0.05em; display:flex; align-items:center; gap:8px;"><i class="fa-solid fa-circle-nodes"></i> Particle Customization</h4>',
        
        '<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px; margin-bottom:15px;">',
          // Column 1
          '<div>',
            '<div style="margin-bottom:10px;">',
              '<label style="display:flex; align-items:center; gap:6px; font-size:0.75rem; color:#aaa; font-weight:600; cursor:pointer;"><input type="checkbox" id="part-enabled"' + (c.enabled ? ' checked' : '') + '> Enable Particle Canvas</label>',
            '</div>',
            
            '<div style="margin-bottom:10px;">',
              '<label style="display:block; font-size:0.72rem; color:#aaa; margin-bottom:4px; font-weight:600;">Particle Style</label>',
              '<select id="part-style" style="width:100%; padding:6px; border-radius:4px; border:1px solid #444; background:#111; color:#fff; font-size:0.8rem; cursor:pointer;">',
                '<option value="solid"' + (c.style === 'solid' ? ' selected' : '') + '>Solid Dots</option>',
                '<option value="glow"' + (c.style === 'glow' ? ' selected' : '') + '>Glow Dots</option>',
                '<option value="blur"' + (c.style === 'blur' ? ' selected' : '') + '>Blur Dots</option>',
                '<option value="star"' + (c.style === 'star' ? ' selected' : '') + '>Star Particles</option>',
                '<option value="gradient"' + (c.style === 'gradient' ? ' selected' : '') + '>Gradient Particles</option>',
                '<option value="connected"' + (c.style === 'connected' ? ' selected' : '') + '>Connected Lines</option>',
              '</select>',
            '</div>',

            '<div style="margin-bottom:10px;">',
              '<label style="display:block; font-size:0.72rem; color:#aaa; margin-bottom:4px; font-weight:600;">Interaction Mode</label>',
              '<select id="part-interact" style="width:100%; padding:6px; border-radius:4px; border:1px solid #444; background:#111; color:#fff; font-size:0.8rem; cursor:pointer;">',
                '<option value="repel"' + (c.interaction === 'repel' ? ' selected' : '') + '>Repel</option>',
                '<option value="attract"' + (c.interaction === 'attract' ? ' selected' : '') + '>Attract</option>',
                '<option value="follow"' + (c.interaction === 'follow' ? ' selected' : '') + '>Follow Mouse</option>',
                '<option value="wave"' + (c.interaction === 'wave' ? ' selected' : '') + '>Sine Wave Ripple</option>',
                '<option value="magnetic"' + (c.interaction === 'magnetic' ? ' selected' : '') + '>Magnetic Gravity</option>',
              '</select>',
            '</div>',

            '<div style="margin-bottom:10px;">',
              '<label style="display:block; font-size:0.72rem; color:#aaa; margin-bottom:4px; font-weight:600;">Background Blend</label>',
              '<select id="part-blend" style="width:100%; padding:6px; border-radius:4px; border:1px solid #444; background:#111; color:#fff; font-size:0.8rem; cursor:pointer;">',
                '<option value="adaptive"' + (c.blendMode === 'adaptive' ? ' selected' : '') + '>Adaptive Theme</option>',
                '<option value="light"' + (c.blendMode === 'light' ? ' selected' : '') + '>Light Mode (Dark dots)</option>',
                '<option value="dark"' + (c.blendMode === 'dark' ? ' selected' : '') + '>Dark Mode (Light dots)</option>',
              '</select>',
            '</div>',
          '</div>',

          // Column 2
          '<div>',
            '<div style="margin-bottom:8px;">',
              '<label style="display:flex; justify-content:space-between; font-size:0.72rem; color:#aaa; margin-bottom:2px; font-weight:600;"><span>Particle Size</span><span id="lbl-part-size">' + c.size + 'px</span></label>',
              '<input type="range" id="val-part-size" min="0.5" max="10" step="0.5" value="' + c.size + '" style="width:100%; cursor:pointer;">',
            '</div>',
            
            '<div style="margin-bottom:8px;">',
              '<label style="display:flex; justify-content:space-between; font-size:0.72rem; color:#aaa; margin-bottom:2px; font-weight:600;"><span>Density (Count)</span><span id="lbl-part-dens">' + c.density + '</span></label>',
              '<input type="range" id="val-part-dens" min="50" max="1200" step="50" value="' + c.density + '" style="width:100%; cursor:pointer;">',
            '</div>',

            '<div style="margin-bottom:8px;">',
              '<label style="display:flex; justify-content:space-between; font-size:0.72rem; color:#aaa; margin-bottom:2px; font-weight:600;"><span>Speed Multiplier</span><span id="lbl-part-speed">' + c.speed + 'x</span></label>',
              '<input type="range" id="val-part-speed" min="0.1" max="3" step="0.1" value="' + c.speed + '" style="width:100%; cursor:pointer;">',
            '</div>',
            
            '<div style="margin-bottom:8px;">',
              '<label style="display:flex; justify-content:space-between; font-size:0.72rem; color:#aaa; margin-bottom:2px; font-weight:600;"><span>Base Opacity</span><span id="lbl-part-opac">' + c.opacity + '</span></label>',
              '<input type="range" id="val-part-opac" min="0.05" max="1" step="0.05" value="' + c.opacity + '" style="width:100%; cursor:pointer;">',
            '</div>',
            
            '<div style="margin-bottom:8px;">',
              '<label style="display:flex; justify-content:space-between; font-size:0.72rem; color:#aaa; margin-bottom:2px; font-weight:600;"><span>Viewport Zoom</span><span id="lbl-part-zoom">' + c.zoom + 'x</span></label>',
              '<input type="range" id="val-part-zoom" min="0.5" max="2.0" step="0.1" value="' + c.zoom + '" style="width:100%; cursor:pointer;">',
            '</div>',
          '</div>',

          // Column 3
          '<div>',
            '<div style="margin-bottom:8px;">',
              '<label style="display:flex; justify-content:space-between; font-size:0.72rem; color:#aaa; margin-bottom:2px; font-weight:600;"><span>Glow Intensity</span><span id="lbl-part-glow">' + c.glowIntensity + '</span></label>',
              '<input type="range" id="val-part-glow" min="0" max="15" step="1" value="' + c.glowIntensity + '" style="width:100%; cursor:pointer;">',
            '</div>',

            '<div style="margin-bottom:8px;">',
              '<label style="display:flex; justify-content:space-between; font-size:0.72rem; color:#aaa; margin-bottom:2px; font-weight:600;"><span>Motion Randomness</span><span id="lbl-part-rand">' + c.randomness + '</span></label>',
              '<input type="range" id="val-part-rand" min="0" max="10" step="0.5" value="' + c.randomness + '" style="width:100%; cursor:pointer;">',
            '</div>',

            '<div style="margin-bottom:8px; display:flex; gap:10px;">',
              '<div style="flex:1;">',
                '<label style="display:block; font-size:0.65rem; color:#aaa; margin-bottom:2px; font-weight:600;">Base Color</label>',
                '<input type="color" id="col-part-base" value="' + c.color3 + '" style="width:100%; height:26px; border:none; padding:0; background:transparent; cursor:pointer;">',
              '</div>',
              '<div style="flex:1;">',
                '<label style="display:block; font-size:0.65rem; color:#aaa; margin-bottom:2px; font-weight:600;">Accent 1</label>',
                '<input type="color" id="col-part-acc1" value="' + c.color1 + '" style="width:100%; height:26px; border:none; padding:0; background:transparent; cursor:pointer;">',
              '</div>',
              '<div style="flex:1;">',
                '<label style="display:block; font-size:0.65rem; color:#aaa; margin-bottom:2px; font-weight:600;">Accent 2</label>',
                '<input type="color" id="col-part-acc2" value="' + c.color2 + '" style="width:100%; height:26px; border:none; padding:0; background:transparent; cursor:pointer;">',
              '</div>',
            '</div>',
          '</div>',
        '</div>',

        '<div style="display:flex; gap:10px; border-top:1px solid #333; padding-top:12px;">',
          '<button id="btn-part-reset" class="admin-btn danger" style="margin:0; padding:8px 16px; font-size:0.75rem; flex:1;"><i class="fa-solid fa-rotate-left"></i> Reset to Default</button>',
          '<button id="btn-part-apply" class="admin-btn" style="margin:0; padding:8px 16px; font-size:0.75rem; background:#20c997; flex:1;"><i class="fa-solid fa-check"></i> Apply & Save Settings</button>',
        '</div>',
      '</div>'
    ].join('');
  }

  function wirePanelEvents(panel) {
    var inputs = {
      enabled: panel.querySelector('#part-enabled'),
      style: panel.querySelector('#part-style'),
      interaction: panel.querySelector('#part-interact'),
      blendMode: panel.querySelector('#part-blend'),
      size: panel.querySelector('#val-part-size'),
      density: panel.querySelector('#val-part-dens'),
      speed: panel.querySelector('#val-part-speed'),
      opacity: panel.querySelector('#val-part-opac'),
      zoom: panel.querySelector('#val-part-zoom'),
      glowIntensity: panel.querySelector('#val-part-glow'),
      randomness: panel.querySelector('#val-part-rand'),
      color3: panel.querySelector('#col-part-base'),
      color1: panel.querySelector('#col-part-acc1'),
      color2: panel.querySelector('#col-part-acc2')
    };

    var labels = {
      size: panel.querySelector('#lbl-part-size'),
      density: panel.querySelector('#lbl-part-dens'),
      speed: panel.querySelector('#lbl-part-speed'),
      opacity: panel.querySelector('#lbl-part-opac'),
      zoom: panel.querySelector('#lbl-part-zoom'),
      glowIntensity: panel.querySelector('#lbl-part-glow'),
      randomness: panel.querySelector('#lbl-part-rand')
    };

    function updateLive() {
      pConfig.enabled = inputs.enabled.checked;
      pConfig.style = inputs.style.value;
      pConfig.interaction = inputs.interaction.value;
      pConfig.blendMode = inputs.blendMode.value;
      pConfig.size = parseFloat(inputs.size.value);
      pConfig.density = parseInt(inputs.density.value);
      pConfig.speed = parseFloat(inputs.speed.value);
      pConfig.opacity = parseFloat(inputs.opacity.value);
      pConfig.zoom = parseFloat(inputs.zoom.value);
      pConfig.glowIntensity = parseInt(inputs.glowIntensity.value);
      pConfig.randomness = parseFloat(inputs.randomness.value);
      pConfig.color3 = inputs.color3.value;
      pConfig.color1 = inputs.color1.value;
      pConfig.color2 = inputs.color2.value;

      // Update label displays
      labels.size.textContent = pConfig.size + 'px';
      labels.density.textContent = pConfig.density;
      labels.speed.textContent = pConfig.speed + 'x';
      labels.opacity.textContent = pConfig.opacity;
      labels.zoom.textContent = pConfig.zoom + 'x';
      labels.glowIntensity.textContent = pConfig.glowIntensity;
      labels.randomness.textContent = pConfig.randomness;

      // Update background status in localStorage as well to keep toggles aligned
      localStorage.setItem(KEY, pConfig.enabled ? '1' : '0');
      updateAdminToggle(pConfig.enabled);

      // Re-apply to rendering system
      applySettingsToEngine(pConfig);
    }

    // Attach immediate input triggers for sliders & colors, change for dropdowns/checks
    Object.keys(inputs).forEach(function(key) {
      var input = inputs[key];
      if (!input) return;
      var evName = (input.type === 'range' || input.type === 'color') ? 'input' : 'change';
      input.addEventListener(evName, updateLive);
    });

    // Reset settings
    var resetBtn = panel.querySelector('#btn-part-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        if (!confirm("Reset particle settings to defaults?")) return;
        pConfig = Object.assign({}, DEFAULT_CONFIG);
        
        inputs.enabled.checked = pConfig.enabled;
        inputs.style.value = pConfig.style;
        inputs.interaction.value = pConfig.interaction;
        inputs.blendMode.value = pConfig.blendMode;
        inputs.size.value = pConfig.size;
        inputs.density.value = pConfig.density;
        inputs.speed.value = pConfig.speed;
        inputs.opacity.value = pConfig.opacity;
        inputs.zoom.value = pConfig.zoom;
        inputs.glowIntensity.value = pConfig.glowIntensity;
        inputs.randomness.value = pConfig.randomness;
        inputs.color3.value = pConfig.color3;
        inputs.color1.value = pConfig.color1;
        inputs.color2.value = pConfig.color2;

        updateLive();
      });
    }

    // Apply & Save Config
    var applyBtn = panel.querySelector('#btn-part-apply');
    if (applyBtn) {
      applyBtn.addEventListener('click', function() {
        updateLive();
        saveConfig(pConfig);
        if (window.showToast) {
          window.showToast("Settings applied! Click 'Save to Cloud' to persist to live site.", "success");
        }
      });
    }
  }

  function injectAdminControls() {
    var adminPanel = document.getElementById('super-admin-panel');
    if (!adminPanel) return;
    var controls = adminPanel.querySelector('.admin-controls');
    if (!controls) return;

    // Toggle button (exists)
    if (!document.getElementById('bg-anim-admin-toggle')) {
      var btnToggle = document.createElement('button');
      btnToggle.id = 'bg-anim-admin-toggle';
      btnToggle.className = 'admin-btn';
      btnToggle.style.cssText = 'background:' + (isOn() ? '#20c997' : '#555') + ';';
      btnToggle.innerHTML = isOn() ? '<i class="fa-solid fa-wand-magic-sparkles"></i> Antigravity BG: ON' : '<i class="fa-solid fa-ban"></i> Antigravity BG: OFF';
      
      btnToggle.addEventListener('click', function () {
        if (isOn()) disable(); else enable();
      });
      var danger = controls.querySelector('.danger');
      controls.insertBefore(btnToggle, danger || null);
    }

    // Customization config button (NEW)
    if (document.getElementById('manage-particles')) return;
    var btnConfig = document.createElement('button');
    btnConfig.id = 'manage-particles';
    btnConfig.className = 'admin-btn';
    btnConfig.style.cssText = 'background:#4c566a; color:#fff;';
    btnConfig.innerHTML = '<i class="fa-solid fa-circle-nodes"></i> Particles Config';
    
    var panel = document.createElement('div');
    panel.id = 'particle-panel';
    panel.style.cssText = 'display:none; margin-top:15px; border-top:1px solid #333; padding-top:15px;';
    panel.innerHTML = buildPanelHTML();

    var clearBtn = controls.querySelector('#clear-storage') || controls.querySelector('.danger');
    controls.insertBefore(btnConfig, clearBtn || null);
    controls.parentNode.insertBefore(panel, controls.nextSibling);

    // Toggle sub-panel visibility
    btnConfig.addEventListener('click', function (e) {
      e.stopPropagation();
      var isHidden = panel.style.display === 'none';
      document.querySelectorAll('#social-links-panel, #pricing-links-panel, #sections-panel, #filters-panel, #theme-panel, #flipbook-panel, #hero-card-panel').forEach(function(p) {
        p.style.display = 'none';
      });
      panel.style.display = isHidden ? 'block' : 'none';
    });

    // Automatically close panel if other control buttons are pressed
    document.addEventListener('click', function (e) {
      var btnClick = e.target.closest('.admin-btn');
      if (btnClick && btnClick.id !== 'manage-particles') {
        panel.style.display = 'none';
      }
    });

    wirePanelEvents(panel);
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
    pConfig = getConfig();
    
    // Keep standard localStorage key aligned
    localStorage.setItem(KEY, pConfig.enabled ? '1' : '0');

    if (pConfig.enabled) {
      build();
      applySettingsToEngine(pConfig);
    } else {
      hide();
    }

    if (!document.getElementById('bg-anim-admin-toggle')) {
      var tries = 0;
      var poll = setInterval(function () {
        injectAdminControls();
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
