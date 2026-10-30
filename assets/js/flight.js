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

  /* ---------- Stops ---------- */
  var slides = $$('.slide');
  var stopsEl = $('#stops'), route = $('#route'), plane = $('#plane'), bubble = $('#bubble');
  var progress = $('#progress'), prevBtn = $('#prevBtn'), nextBtn = $('#nextBtn');
  var sky = $('.sky');
  var n = slides.length;

  stopsEl.innerHTML = slides.map(function (s, i) {
    return '<li><button type="button" class="stop" data-i="' + i + '" style="left:' + (i / (n - 1) * 100) + '%"' +
      ' aria-label="Stop ' + (i + 1) + ': ' + s.dataset.label + '"><i></i><span>' + s.dataset.label + '</span></button></li>';
  }).join('');
  var stopBtns = $$('.stop', stopsEl);

  var current = -1, busy = false;

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
    bubble.classList.remove('show');
    bubble.innerHTML = '<span class="who">Proto</span>' + slides[i].dataset.say;
    placeBubble();
    requestAnimationFrame(function () { bubble.classList.add('show'); });
  }

  function go(i, instant) {
    i = Math.max(0, Math.min(n - 1, i));
    if (i === current) return;
    var dir = i > current ? 1 : -1;
    var hop = current < 0 ? 0 : Math.abs(i - current);
    var dur = instant || reduceMotion ? 0 : Math.min(600 + hop * 220, 1600);

    // Slides: the old one leaves in the flight direction, the new one arrives from the other side.
    slides.forEach(function (s, k) {
      s.style.setProperty('--from', dir);
      s.style.setProperty('--to', -dir);
      if (k === current) { s.classList.remove('on'); s.classList.add('out'); }
      else s.classList.remove('out');
      s.toggleAttribute('inert', k !== i);
      s.setAttribute('aria-hidden', String(k !== i));
    });
    slides[i].classList.add('on');
    slides[i].scrollTop = 0;

    // Plane: fly (and face) toward the next stop.
    plane.classList.toggle('left', dir < 0);
    plane.style.transitionDuration = dur + 'ms';
    plane.style.setProperty('--dur', dur + 'ms');
    plane.style.transform = 'translateX(' + stopX(i) + 'px)';
    if (dur) { plane.classList.remove('flying'); void plane.offsetWidth; plane.classList.add('flying'); }
    setTimeout(function () { plane.classList.remove('flying'); }, dur);

    progress.style.transitionDuration = dur + 'ms';
    progress.style.transform = 'scaleX(' + (i / (n - 1)) + ')';
    sky.style.setProperty('--shift', (-i * 60) + 'px');

    stopBtns.forEach(function (b, k) {
      b.classList.toggle('here', k === i);
      b.classList.toggle('done', k < i);
      if (k === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    prevBtn.disabled = i === 0;
    nextBtn.disabled = i === n - 1;
    nextBtn.classList.toggle('nudge', i === 0);

    current = i;
    bubble.classList.remove('show');
    setTimeout(function () { say(i); }, dur ? dur * 0.6 : 0);
    try { history.replaceState(null, '', i === 0 ? location.pathname + location.search : '#' + slides[i].id); } catch (e) {}
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

  // Swipe left/right on touch screens (but not inside the sideways Behance strip).
  var sx = 0, sy = 0, swiping = false;
  $('#stage').addEventListener('touchstart', function (e) {
    swiping = !e.target.closest('.shots');
    sx = e.touches[0].clientX; sy = e.touches[0].clientY;
  }, { passive: true });
  $('#stage').addEventListener('touchend', function (e) {
    if (!swiping) return;
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(current + (dx < 0 ? 1 : -1));
  }, { passive: true });

  addEventListener('resize', function () {
    plane.style.transitionDuration = '0ms';
    plane.style.transform = 'translateX(' + stopX(current) + 'px)';
    placeBubble();
  });
  addEventListener('hashchange', function () {
    var k = slides.findIndex(function (s) { return '#' + s.id === location.hash; });
    if (k >= 0) go(k);
  });

  var start = Math.max(0, slides.findIndex(function (s) { return '#' + s.id === location.hash; }));
  go(start, true);
})();
