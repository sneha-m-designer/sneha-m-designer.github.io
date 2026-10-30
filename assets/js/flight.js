/* Sneha M — "Fly with Proto": a plane flies between stops; arrows, keys, swipes or stop clicks navigate. */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- Behance strip ---------- */
  var IMG = 'https://framerusercontent.com/images/';
  var BE = 'https://www.behance.net/gallery/';
  var shots = [
    ['Medicare', 'ffp4Ukth3aHcGcnmyIiGwYr7w', '174043145/MediCare-Medical-Application'],
    ['Outdoor Nuptials', 'CsluJ62hafQ38e07bIiangXiQPU', '174064003/Outdoor-Nuptials'],
    ['Enhancing Duolingo UX', 'y7uCmEya065zdaDtXqbDSMEFhqY', '176358781/Enhancing-Duolingo-UX-Case-study'],
    ['Twitter UI Evaluation', 'Als8PJKpMxirwpVgn3J0xbATM', '173895575/Twitter-UI-Evaluation-A-Heuristic-Approach-Case-Study'],
    ['The Self-Care Gap', '2SHZeuIIlZL5ZKi7zAQE4LLUk', '198405761/Assignment-The-self-Care-Gap-(Research)'],
    ['Celebrare', 'Q6ceRBqrZZUzGfN2qb08mZN4pIg', '178916893/Landing-Page-Redesign'],
    ['Thulasi Siddha Clinic', '4yi6H3iBVQi9KdgrwgfSGbFv3k', '198401225/Landing-Page-Design-Thulasi-Siddha-Clinic'],
    ['PixZap', 'usBLE8ZOCG6SScmkiXwCoWnaY', '177688347/Landing-page-Pop-art-style'],
    ['QuickTrek', 'pU8MgmgBQOLS0FC696UJtMC8f0', '177286753/Landing-Page-QuickTrek'],
    ['Business Page', 'IyzTlBxeAjSwv6lo2dUAf5pSh60', '168710363/Landing-Page'],
    ['Candyz', 'pu8lQ4I9GAiqtxMijGFaqfZcgM', '168888963/Landing-page'],
    ['Daily UI', 'w6cTDpBL71GT41U9LWAT6IxMaA', '173900743/Landing-PageDaily-UI'],
    ['100 Days Design Challenge', 'hvnH4R7Ys4CSuEo4wFWT3lEHI', '174372279/Daily-UI-100-Days-Designs'],
    ['Email Campaign Designs', 'KCGlXql3SuNemDz0Eui8AvPfew', '174361479/Email-Campaign']
  ];
  var shotsEl = $('#shots');
  if (shotsEl) shotsEl.innerHTML = shots.map(function (p) {
    return '<a class="shot" href="' + BE + p[2] + '" target="_blank" rel="noopener"><div class="thumb"><img loading="lazy" src="' + IMG + p[1] +
      '.png?scale-down-to=512" alt="" width="160" height="120"></div><b>' + p[0] + '</b></a>';
  }).join('');

  /* ---------- Theme / toast / copy ---------- */
  var saved = store.get('theme');
  if (saved) root.dataset.theme = saved;
  $('#themeBtn').addEventListener('click', function () {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    store.set('theme', root.dataset.theme);
  });
  var toastEl = $('#toast'), toastT = 0;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('show'); }, 2400);
  }
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = b.dataset.copy, ok = function () { toast('Email copied — Sneha will be happy to hear from you! ✉️'); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok, function () { toast(t); });
      else toast(t);
    });
  });

  /* ---------- World ---------- */
  var slides = $$('.slide');
  var slidesEl = $('#slides');
  var stopsEl = $('#stops'), route = $('#route'), plane = $('#plane'), planeTilt = $('#planeTilt'), bubble = $('#bubble');
  var progress = $('#progress'), prevBtn = $('#prevBtn'), nextBtn = $('#nextBtn');
  var stars = [$('#stars1'), $('#stars2'), $('#stars3')], planets = $('#planets'), warp = $('#warp');
  var n = slides.length;
  slides.forEach(function (s, k) { s.style.setProperty('--k', k); });

  stopsEl.innerHTML = slides.map(function (s, i) {
    return '<li><button type="button" class="stop" data-i="' + i + '" style="left:' + (i / (n - 1) * 100) + '%"' +
      ' aria-label="Stop ' + (i + 1) + ': ' + s.dataset.label + '"><i></i><span>' + s.dataset.label + '</span></button></li>';
  }).join('');
  var stopBtns = $$('.stop', stopsEl);

  /* Motion: one continuous position (in sections) that eases from stop to stop —
     speeding up, cruising, then slowing to land exactly on the stop. The camera, the plane
     and the star layers are all drawn from this one value, so they always move together. */
  var pos = 0, vel = 0, current = -1, raf = 0, facing = 1;
  var tw = null; // { p0, v0, p1, T, t0 }

  function render() {
    var W = innerWidth, rw = route.clientWidth;
    slidesEl.style.transform = 'translate3d(' + (-pos * W) + 'px,0,0)';
    plane.style.transform = 'translate3d(' + (pos / (n - 1) * rw) + 'px,0,0)';
    progress.style.transform = 'scaleX(' + (pos / (n - 1)) + ')';
    var speeds = [0.06, 0.14, 0.26];
    stars.forEach(function (el, k) { el.style.backgroundPosition = (-pos * W * speeds[k]) + 'px 0'; });
    planets.style.transform = 'translate3d(' + (-pos * W * 0.42) + 'px,0,0)';
    warp.style.opacity = Math.min(Math.abs(vel) * 0.22, 0.5).toFixed(3);
    // Gentle bank with speed: nose up while accelerating, level when cruising/stopped.
    var tilt = Math.max(-7, Math.min(7, -vel * 3.2));
    planeTilt.style.transform = 'rotate(' + tilt.toFixed(2) + 'deg)';
  }

  function tick(now) {
    var t = Math.min((now - tw.t0) / tw.T, 1), T = tw.T / 1000;
    // Cubic Hermite: starts at the current speed (so changing your mind mid-flight is smooth), ends at rest.
    var t2 = t * t, t3 = t2 * t;
    pos = (2 * t3 - 3 * t2 + 1) * tw.p0 + (t3 - 2 * t2 + t) * T * tw.v0 + (-2 * t3 + 3 * t2) * tw.p1;
    vel = ((6 * t2 - 6 * t) * tw.p0 + (-6 * t2 + 6 * t) * tw.p1) / T + (3 * t2 - 4 * t + 1) * tw.v0;
    render();
    if (t < 1) { raf = requestAnimationFrame(tick); return; }
    pos = tw.p1; vel = 0; render(); raf = 0; tw = null; arrive();
  }
  function flyTo(p1) {
    var dist = Math.abs(p1 - pos);
    tw = { p0: pos, v0: vel, p1: p1, T: 700 + Math.sqrt(dist) * 380, t0: performance.now() };
    plane.classList.add('moving');
    bubble.classList.remove('show');
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(tick);
  }

  function arrive() {
    plane.classList.remove('moving');
    say(current);
  }

  function stopX(i) { return route.clientWidth * i / (n - 1); }
  function placeBubble() {
    var r = route.getBoundingClientRect();
    var px = r.left + stopX(current);
    var w = bubble.offsetWidth, pad = 12;
    var left = Math.max(pad, Math.min(px - w / 2, innerWidth - pad - w));
    var flight = bubble.offsetParent.getBoundingClientRect();
    bubble.style.left = (left - flight.left) + 'px';
    bubble.style.setProperty('--tail', Math.max(18, Math.min(w - 18, px - left)) + 'px');
  }
  function say(i) {
    bubble.innerHTML = '<span class="who">Proto</span>' + slides[i].dataset.say;
    placeBubble();
    requestAnimationFrame(function () { bubble.classList.add('show'); });
  }

  function go(i, instant) {
    i = Math.max(0, Math.min(n - 1, i));
    if (i === current && !instant) return;
    if (i !== current) {
      facing = i > (current < 0 ? i : current) ? 1 : i < current ? -1 : facing;
      plane.classList.toggle('left', facing < 0);
    }
    current = i;
    slides.forEach(function (s, k) {
      s.toggleAttribute('inert', k !== i);
      s.setAttribute('aria-hidden', String(k !== i));
    });
    slides[i].scrollTop = 0;
    stopBtns.forEach(function (b, k) {
      b.classList.toggle('here', k === i);
      b.classList.toggle('done', k < i);
      if (k === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    prevBtn.disabled = i === 0;
    nextBtn.disabled = i === n - 1;
    nextBtn.classList.toggle('nudge', i === 0);
    try { history.replaceState(null, '', location.pathname + (i === 0 ? '' : '#' + slides[i].id)); } catch (e) {}

    if (instant || reduceMotion) {
      cancelAnimationFrame(raf); raf = 0; tw = null;
      pos = i; vel = 0; render(); arrive();
    } else flyTo(i);
  }

  prevBtn.addEventListener('click', function () { go(current - 1); });
  nextBtn.addEventListener('click', function () { go(current + 1); });
  stopBtns.forEach(function (b) { b.addEventListener('click', function () { go(+b.dataset.i); }); });
  $$('[data-go]').forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); go(+el.dataset.go); });
  });

  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey || e.target.closest('input, textarea, select')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); go(current + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(current - 1); }
    else if (e.key === 'Home') { e.preventDefault(); go(0); }
    else if (e.key === 'End') { e.preventDefault(); go(n - 1); }
  });

  // Touch: drag the world live with a finger, then glide to the nearest stop.
  var stage = $('#stage'), drag = null;
  stage.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1 || e.target.closest('.shots')) return;
    drag = { x: e.touches[0].clientX, y: e.touches[0].clientY, pos: pos, t: performance.now(), lock: null };
  }, { passive: true });
  stage.addEventListener('touchmove', function (e) {
    if (!drag) return;
    var dx = e.touches[0].clientX - drag.x, dy = e.touches[0].clientY - drag.y;
    if (drag.lock === null && Math.abs(dx) + Math.abs(dy) > 8) drag.lock = Math.abs(dx) > Math.abs(dy) * 1.2 ? 'x' : 'y';
    if (drag.lock !== 'x') return;
    cancelAnimationFrame(raf); raf = 0; tw = null;
    pos = Math.max(-0.15, Math.min(n - 0.85, drag.pos - dx / innerWidth));
    vel = 0;
    plane.classList.add('moving');
    bubble.classList.remove('show');
    render();
  }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    if (!drag) return;
    var d = drag; drag = null;
    if (d.lock !== 'x') return;
    var dx = e.changedTouches[0].clientX - d.x;
    var flick = Math.abs(dx) > 40 && Math.abs(dx) / Math.max(performance.now() - d.t, 1) > 0.3;
    var i = flick ? current + (dx < 0 ? 1 : -1) : Math.round(pos);
    if (i === current) flyTo(current); else go(i);
  }, { passive: true });

  addEventListener('resize', function () { render(); if (!raf) placeBubble(); });
  addEventListener('hashchange', function () {
    var k = slides.findIndex(function (s) { return '#' + s.id === location.hash; });
    if (k >= 0) go(k);
  });

  // Which stop to open: ?stop=projects (used by the case-study back links) or #projects.
  function requestedStop() {
    var m = /[?&]stop=([\w-]+)/.exec(location.search);
    var id = m ? m[1] : location.hash.slice(1);
    return Math.max(0, slides.findIndex(function (s) { return s.id === id; }));
  }
  // Browsers (Safari especially) try to scroll to #anchors themselves; the world is
  // positioned by transform, so keep every scroll offset pinned at zero.
  function unscroll() {
    if (stage.scrollLeft || stage.scrollTop) { stage.scrollLeft = 0; stage.scrollTop = 0; }
    if (slidesEl.scrollLeft) slidesEl.scrollLeft = 0;
    if (scrollX || scrollY) scrollTo(0, 0);
  }
  stage.addEventListener('scroll', unscroll);
  slidesEl.addEventListener('scroll', unscroll);
  addEventListener('scroll', unscroll);

  // Coming back via the browser's Back button can restore this page from memory: resync.
  addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    unscroll();
    current = -1;
    go(requestedStop(), true);
  });

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  unscroll();
  go(requestedStop(), true);
  setTimeout(unscroll, 0);
})();
