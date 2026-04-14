/*!
 * Kenai Showcase — index.js
 * Interactive behaviors for the documentation page
 */
(function () {
  'use strict';

  /* ── Scroll-spy app bar ───────────────────────────── */
  const appBar = document.getElementById('appBar');
  window.addEventListener('scroll', function () {
    appBar.classList.toggle('scrolled', window.scrollY > 8);
  }, { passive: true });


  /* ── Nav active link highlight ───────────────────── */
  const sections = document.querySelectorAll('.doc-section, .hero');
  const navLinks = document.querySelectorAll('.nav-link');

  function updateActiveLink() {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) {
        current = sec.id || '';
      }
    });
    navLinks.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      link.classList.toggle('active', href === current);
    });
  }
  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();


  /* ── Mobile drawer ───────────────────────────────── */
  const drawer    = document.getElementById('mobileDrawer');
  const drawerScrim = document.getElementById('drawerScrim');
  const openBtn   = document.getElementById('mobileMenuBtn');
  const closeBtn  = document.getElementById('closeDrawerBtn');

  function openDrawer() {
    drawer.classList.add('open');
    drawerScrim.classList.remove('hidden');
    drawer.removeAttribute('aria-hidden');
    KENAI.ScrollLock.lock();
  }
  function closeDrawer() {
    drawer.classList.remove('open');
    drawerScrim.classList.add('hidden');
    drawer.setAttribute('aria-hidden', 'true');
    KENAI.ScrollLock.unlock();
  }
  openBtn.addEventListener('click', openDrawer);
  closeBtn.addEventListener('click', closeDrawer);
  drawerScrim.addEventListener('click', closeDrawer);
  drawer.querySelectorAll('.drawer-link').forEach(a => a.addEventListener('click', closeDrawer));


  /* ── Scroll reveal ───────────────────────────────── */
  function addRevealClasses() {
    document.querySelectorAll('.component-block, .demo-area, .card, .type-table, .tokens-grid, .color-lab, .grid-demo-12').forEach((el, i) => {
      if (!el.classList.contains('reveal')) {
        el.classList.add('reveal');
        el.classList.add('reveal-delay-' + ((i % 4) + 1));
      }
    });
  }
  addRevealClasses();

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -60px 0px', threshold: 0.08 });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


  /* ── Hero stat counters ──────────────────────────── */
  function animateCount(el, target, suffix, duration) {
    const start = performance.now();
    function step(now) {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const val = Math.round(ease * target);
      el.textContent = val + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const statObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const count = parseInt(el.dataset.count, 10);
      const suffix = count === 0 ? 'KB' : count > 90 ? '+' : '';
      animateCount(el, count, suffix, 1200);
      statObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach(el => statObserver.observe(el));


  /* ── Motion token demos ──────────────────────────── */
  const motionBall = document.getElementById('motionBall');
  let   ballDir    = false;
  let   ballLocked = false;

  document.querySelectorAll('.motion-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      if (ballLocked) return;
      ballLocked = true;
      const duration = parseInt(this.dataset.duration, 10);
      const easing   = this.dataset.easing;
      motionBall.style.transition = `left ${duration}ms ${easing}`;
      ballDir = !ballDir;
      motionBall.style.left = ballDir ? 'calc(100% - 30px)' : '2px';
      setTimeout(() => { ballLocked = false; }, duration + 50);
    });
  });


  /* ── Filter chip group ───────────────────────────── */
  const filterGroup = document.getElementById('filterChips');
  if (filterGroup) {
    filterGroup.addEventListener('click', e => {
      const btn = e.target.closest('[data-filter]');
      if (!btn) return;
      filterGroup.querySelectorAll('[data-filter]').forEach(b => {
        b.classList.remove('selected');
        b.removeAttribute('aria-pressed');
      });
      btn.classList.add('selected');
      btn.setAttribute('aria-pressed', 'true');
    });
  }


  /* ── Input chip remove ───────────────────────────── */
  const inputChipGroup = document.getElementById('inputChips');
  if (inputChipGroup) {
    inputChipGroup.addEventListener('click', e => {
      const remove = e.target.closest('.chip-remove');
      if (!remove) return;
      const chip = remove.closest('.chip');
      if (chip) {
        chip.style.transition = 'opacity 150ms ease, transform 150ms ease';
        chip.style.opacity = '0';
        chip.style.transform = 'scale(0.8)';
        setTimeout(() => chip.remove(), 160);
      }
    });
  }


  /* ── Progress bar controls ───────────────────────── */
  let progValue = 65;
  const progBar   = document.getElementById('progressDet');
  const progLabel = document.getElementById('progLabel');

  function updateProg() {
    if (!progBar) return;
    progBar.style.width = progValue + '%';
    if (progLabel) progLabel.textContent = progValue + '%';
  }

  const progPlus  = document.getElementById('progPlus');
  const progMinus = document.getElementById('progMinus');
  if (progPlus)  progPlus.addEventListener('click',  () => { progValue = Math.min(100, progValue + 10); updateProg(); });
  if (progMinus) progMinus.addEventListener('click', () => { progValue = Math.max(0,   progValue - 10); updateProg(); });


  /* ── Color palette generator ─────────────────────── */
  const presets      = document.querySelectorAll('.color-preset');
  const colorPicker  = document.getElementById('seedColorPicker');
  const resetBtn     = document.getElementById('resetColorBtn');
  let   activePreset = document.querySelector('.color-preset[data-color="#1B6EF3"]');

  function applyColor(hex) {
    KENAI.Color.applyPalette(hex);
    if (colorPicker) colorPicker.value = hex;
  }

  presets.forEach(btn => {
    btn.addEventListener('click', function () {
      presets.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      applyColor(this.dataset.color);
      KENAI.Snackbar.show('Theme updated to ' + this.getAttribute('title') + '!', { duration: 2500 });
    });
  });

  if (colorPicker) {
    colorPicker.addEventListener('input', function () {
      presets.forEach(b => b.classList.remove('active'));
      applyColor(this.value);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      KENAI.Color.reset();
      presets.forEach(b => b.classList.remove('active'));
      if (activePreset) activePreset.classList.add('active');
      if (colorPicker) colorPicker.value = '#1B6EF3';
      KENAI.Snackbar.show('Reset to Pixel Blue.', { duration: 2000 });
    });
  }

  if (activePreset) activePreset.classList.add('active');

  // Reapply palette on theme toggle to stay coherent
  document.documentElement.addEventListener('kenai:themechange', function () {
    if (colorPicker && colorPicker.value !== '#1B6EF3') {
      KENAI.Color.applyPalette(colorPicker.value);
    }
  });


  /* ── Icon button toggle ──────────────────────────── */
  document.querySelectorAll('.icon-btn[aria-pressed]').forEach(btn => {
    btn.addEventListener('click', function () {
      const pressed = this.getAttribute('aria-pressed') === 'true';
      this.setAttribute('aria-pressed', String(!pressed));
    });
  });


  /* ── Smooth scroll for nav links ─────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
