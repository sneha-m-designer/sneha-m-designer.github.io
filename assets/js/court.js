/* Sneha M — "On Court": shots into service boxes, panels, and a rally mini-game. */
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

  var court = $('#court');
  var shuttle = $('#shuttle');
  var land = $('#land');
  var rMe = $('#rMe');
  var boxes = $$('.box');
  var panels = $$('.panel');
  var order = panels.map(function (p) { return p.dataset.key; });
  panels.forEach(function (p) { p.setAttribute('aria-hidden', 'true'); });

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
  $('#shots').innerHTML = shots.map(function (p) {
    return '<a class="shot" href="' + BE + p[2] + '" target="_blank" rel="noopener"><div class="thumb"><img loading="lazy" src="' + IMG + p[1] +
      '.png?scale-down-to=512" alt="" width="160" height="120"></div><b>' + p[0] + '</b></a>';
  }).join('');

  /* ---------- Theme / toast / copy ---------- */
  var saved = store.get('theme');
  if (saved) root.dataset.theme = saved;
  $('#themeBtn').addEventListener('click', function () {
    var dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    store.set('theme', root.dataset.theme);
  });
  var toastEl = $('#toast'), toastT = 0;
  function toast(msg, ms) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('show'); }, ms || 2400);
  }
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = b.dataset.copy, ok = function () { toast('Email copied — talk soon! ✉️'); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok, function () { toast(t); });
      else toast(t);
    });
  });

  /* ---------- Scoreboard ---------- */
  var sbShots = $('#sbShots'), sbRally = $('#sbRally'), sbBest = $('#sbBest');
  var visited = {};
  var best = +store.get('bestRally') || 0;
  sbBest.textContent = best;
  function bump(el) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
  function setShots() {
    var n = Object.keys(visited).length;
    sbShots.innerHTML = n + '<span>/6</span>';
    bump(sbShots);
    if (n === 6) toast('All six boxes — that’s a clean sweep! 🏸', 3000);
  }

  /* ---------- Geometry helpers ---------- */
  function center(el, fx, fy) {
    var c = court.getBoundingClientRect(), r = el.getBoundingClientRect();
    return { x: r.left - c.left + r.width * (fx == null ? 0.5 : fx), y: r.top - c.top + r.height * (fy == null ? 0.5 : fy) };
  }
  function place(x, y, rot, scale) {
    shuttle.style.transform = 'translate(' + (x - 19) + 'px,' + (y - 19) + 'px) rotate(' + rot + 'deg) scale(' + (scale || 1) + ')';
  }
  function arcPoint(a, b, t, lift) {
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t - lift * 4 * t * (1 - t) };
  }
  function angleAt(a, b, t, lift) {
    var dx = b.x - a.x, dy = (b.y - a.y) - lift * 4 * (1 - 2 * t);
    return Math.atan2(dy, dx) * 180 / Math.PI + 135;
  }
  function liftFor(a, b) { return Math.max(70, Math.hypot(b.x - a.x, b.y - a.y) * 0.32); }

  // One-off shot: Sneha's racket → target element.
  function shoot(target, done) {
    if (reduceMotion || !shuttle.animate) { if (done) done(); return; }
    swing(rMe, 'swing');
    var a = center(rMe, 0.5, 0.25), b = center(target);
    var lift = liftFor(a, b), N = 22, kf = [];
    for (var i = 0; i <= N; i++) {
      var t = i / N, p = arcPoint(a, b, t, lift);
      kf.push({ transform: 'translate(' + (p.x - 19) + 'px,' + (p.y - 19) + 'px) rotate(' + angleAt(a, b, t, lift) + 'deg) scale(' + (1 + 0.5 * Math.sin(Math.PI * t)) + ')', opacity: 1 });
    }
    kf[kf.length - 1].opacity = 0;
    var anim = shuttle.animate(kf, { duration: 620, easing: 'cubic-bezier(.35,.1,.35,1)' });
    anim.onfinish = function () {
      land.style.left = b.x + 'px'; land.style.top = b.y + 'px';
      land.classList.remove('pop'); void land.offsetWidth; land.classList.add('pop');
      if (done) done();
    };
  }
  function swing(el, cls) { el.classList.remove(cls); void el.getBoundingClientRect(); el.classList.add(cls); }

  /* ---------- Panels ---------- */
  var scrim = $('#scrim'), openKey = null, lastFocus = null, busy = false;
  panels.forEach(function (p, i) {
    var nav = $('.p-nav', p);
    nav.innerHTML =
      '<button type="button" data-step="-1" aria-label="Previous section"><svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg></button>' +
      '<button type="button" data-step="1" aria-label="Next section"><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></button>' +
      '<button type="button" data-close aria-label="Back to the court"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>';
    nav.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      if (b.hasAttribute('data-close')) close();
      else show(order[(i + +b.dataset.step + order.length) % order.length]);
    });
  });

  function show(key) {
    var p = $('#p-' + key);
    if (!p) return;
    panels.forEach(function (x) { x.classList.toggle('open', x === p); x.setAttribute('aria-hidden', String(x !== p)); });
    scrim.hidden = false;
    requestAnimationFrame(function () { scrim.classList.add('open'); });
    $('.p-body', p).scrollTop = 0;
    openKey = key;
    if (!visited[key]) { visited[key] = true; setShots(); }
    var box = $('.box[data-open="' + key + '"]');
    if (box) box.classList.add('visited');
    try { history.replaceState(null, '', '#' + key); } catch (e) {}
    setTimeout(function () { var c = $('[data-close]', p); if (c) c.focus({ preventScroll: true }); }, reduceMotion ? 0 : 60);
  }
  function close() {
    if (!openKey) return;
    panels.forEach(function (x) { x.classList.remove('open'); x.setAttribute('aria-hidden', 'true'); });
    scrim.classList.remove('open');
    setTimeout(function () { if (!openKey) scrim.hidden = true; }, reduceMotion ? 0 : 350);
    openKey = null;
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  }
  function open(key, from) {
    if (busy) return;
    if (playing) stopRally();
    lastFocus = from || document.activeElement;
    var box = $('.box[data-open="' + key + '"]');
    if (openKey || !box || reduceMotion) { show(key); return; }
    busy = true;
    if (innerWidth <= 820) box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    shoot(box, function () { setTimeout(function () { busy = false; show(key); }, 160); });
  }
  scrim.addEventListener('click', close);
  $$('[data-open]').forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); open(el.dataset.open, el); });
  });
  // Keep focus inside an open panel.
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab' || !openKey) return;
    var f = $$('button, a[href]', $('#p-' + openKey));
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });

  /* ---------- Rally mini-game ---------- */
  var rally = $('#rally'), rYou = $('#rYou'), rallyCount = $('#rallyCount'), rallyTip = $('#rallyTip');
  var factEl = $('#fact'), result = $('#result');
  var FACTS = [
    ['🔍', 'I started my design career in UX research'],
    ['🤖', 'I design AI-powered products at GoX.ai'],
    ['🚀', 'Helped ship Illustrations AI in just 5 months'],
    ['✨', 'Designed an AI marketing hub from scratch'],
    ['🧩', 'Built Lucify’s design system'],
    ['🛡️', 'Spent 14 months in cybersecurity at HCL'],
    ['🏆', 'Won a Design Hackathon'],
    ['📜', 'Hold 9 design & AI certifications'],
    ['🏸', 'Was Sports House Captain in college'],
    ['🎓', 'Studied Computer Science — CGPA 8.25'],
    ['📍', 'Based in Chennai, India'],
    ['💬', 'Psst… you’re really good at this. Let’s talk?']
  ];
  var playing = false, raf = 0, ring = null;
  var state = null;

  function startRally() {
    close();
    playing = true;
    court.classList.add('playing');
    if (innerWidth <= 820) court.scrollIntoView({ block: 'start' });
    rally.hidden = false;
    result.hidden = true;
    rallyTip.hidden = false;
    if (!ring) { ring = document.createElement('div'); ring.className = 'hit-ring'; ring.setAttribute('aria-hidden', 'true'); rally.appendChild(ring); }
    var b = center(rYou, 0.5, 0.25);
    ring.style.left = b.x + 'px'; ring.style.top = b.y + 'px';
    shuttle.style.opacity = 1;
    state = { count: 0, dir: 'you', t0: performance.now() + 500, dur: 1250, missed: false };
    setCount(0);
    swing(rMe, 'swing');
    rally.focus({ preventScroll: true });
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(tick);
  }
  function setCount(n) {
    rallyCount.textContent = n;
    sbRally.textContent = n;
    if (n) { bump(rallyCount); bump(sbRally); }
  }
  function ends() {
    var a = center(rMe, 0.5, 0.25), b = center(rYou, 0.5, 0.25);
    return state.dir === 'you' ? [a, b] : [b, a];
  }
  function tick(now) {
    if (!playing) return;
    var e = ends(), a = e[0], b = e[1];
    var p = (now - state.t0) / state.dur;
    if (p < 0) { place(a.x, a.y, 0, 1); raf = requestAnimationFrame(tick); return; }
    var lift = liftFor(a, b) * 1.2;
    var pt = arcPoint(a, b, Math.min(p, 1.15), lift);
    place(pt.x, pt.y, angleAt(a, b, Math.min(p, 1), lift), 1 + 0.4 * Math.sin(Math.PI * Math.min(p, 1)));
    if (state.dir === 'you') {
      ring.classList.toggle('hot', p > 0.78);
      if (p > 1.14) return miss(pt);
    } else if (p >= 1) {
      // Sneha always returns it — a little faster each time.
      swing(rMe, 'swing');
      state.dir = 'you';
      state.t0 = now;
      state.dur = Math.max(560, state.dur * 0.93);
    }
    raf = requestAnimationFrame(tick);
  }
  function hit() {
    if (!playing || !state || state.missed) return;
    swing(rYou, 'swing');
    var p = (performance.now() - state.t0) / state.dur;
    if (state.dir !== 'you' || p < 0.78) {
      if (state.dir === 'you' && p > 0.4) { rallyTip.textContent = 'A bit early — wait for the ring to light up!'; }
      return;
    }
    rallyTip.hidden = true;
    state.count++;
    setCount(state.count);
    showFact(FACTS[(state.count - 1) % FACTS.length]);
    ring.classList.remove('hot');
    state.dir = 'me';
    state.t0 = performance.now();
  }
  function showFact(f) {
    factEl.innerHTML = '<em>' + f[0] + '</em>' + f[1];
    factEl.classList.remove('show'); void factEl.offsetWidth; factEl.classList.add('show');
  }
  function miss(pt) {
    state.missed = true;
    cancelAnimationFrame(raf);
    ring.classList.remove('hot');
    var n = state.count;
    if (n > best) { best = n; store.set('bestRally', best); sbBest.textContent = best; bump(sbBest); }
    var drop = shuttle.animate ? shuttle.animate([
      { transform: shuttle.style.transform },
      { transform: 'translate(' + (pt.x - 19) + 'px,' + (pt.y + 90 - 19) + 'px) rotate(200deg) scale(.9)' }
    ], { duration: 420, easing: 'cubic-bezier(.5,0,.9,.6)', fill: 'forwards' }) : null;
    setTimeout(function () {
      if (drop) drop.cancel();
      shuttle.style.opacity = 0;
      $('#resultTitle').textContent = n === 0 ? 'Out! 🏸' : n < 4 ? 'Nice rally! 🏸' : n < 8 ? 'Great rally! 🔥' : 'Champion! 🏆';
      $('#resultSub').textContent = n === 0
        ? 'Tap when the shuttle reaches your racket — give it another go!'
        : 'You returned ' + n + ' shot' + (n === 1 ? '' : 's') + ' and unlocked ' + Math.min(n, FACTS.length) + ' fact' + (n === 1 ? '' : 's') + ' about me.' + (n >= best && n > 0 ? ' New best!' : '');
      result.hidden = false;
      $('#againBtn').focus({ preventScroll: true });
    }, 520);
  }
  function stopRally() {
    playing = false;
    cancelAnimationFrame(raf);
    court.classList.remove('playing');
    rally.hidden = true;
    shuttle.style.opacity = 0;
    sbRally.textContent = 0;
  }
  rally.tabIndex = -1;
  rally.addEventListener('pointerdown', function (e) {
    if (e.target.closest('button, .result')) return;
    e.preventDefault();
    hit();
  });
  $('#playBtn').addEventListener('click', startRally);
  $('#againBtn').addEventListener('click', startRally);
  $('#quitBtn').addEventListener('click', function () { stopRally(); $('#playBtn').focus(); });
  $('#rallyClose').addEventListener('click', function () { stopRally(); $('#playBtn').focus(); });

  /* ---------- Keyboard ---------- */
  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (playing) {
      if (e.key === ' ' || e.key === 'Enter') {
        if (!result.hidden && e.target.closest('button')) return;
        e.preventDefault(); hit();
      } else if (e.key === 'Escape') { stopRally(); $('#playBtn').focus(); }
      return;
    }
    if (openKey) {
      var i = order.indexOf(openKey);
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') show(order[(i + 1) % order.length]);
      else if (e.key === 'ArrowLeft') show(order[(i - 1 + order.length) % order.length]);
      return;
    }
    if (/^[1-6]$/.test(e.key) && !e.target.closest('input, textarea')) {
      var box = boxes[+e.key - 1];
      open(box.dataset.open, box);
    }
  });

  /* ---------- Opening serve ---------- */
  boxes.forEach(function (b, i) { setTimeout(function () { b.classList.add('in'); }, reduceMotion ? 0 : 250 + i * 70); });
  var initial = location.hash.slice(1);
  if (order.indexOf(initial) >= 0) {
    show(initial);
  } else if (!reduceMotion && innerWidth > 820) {
    setTimeout(function () {
      var first = boxes[0];
      shoot(first, function () { first.classList.add('target'); });
    }, 1000);
  }
})();
