/* Sneha M — road trip portfolio: a car drives one continuous road as you scroll. */
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
  $('#shots').innerHTML = shots.map(function (p) {
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
  $('#year').textContent = new Date().getFullYear();

  /* ---------- Road geometry ---------- */
  var journey = $('#journey');
  var road = $('#road');
  var paths = $$('path', road);
  var trail = $('.r-trail', road);
  var startLine = $('#startLine');
  var car = $('#car'), carBody = $('.car-body', car), carSay = $('#carSay');
  var stops = $$('.stop', journey);
  var finish = $('#finish');
  var navLinks = $$('.stops a');
  var tripBar = $('#tripBar');

  var samples = { x: [], y: [], s: [] };
  var total = 1, startY = 0, endY = 0, W = 0;
  var bands = [];

  function rel(el) {
    var j = journey.getBoundingClientRect(), r = el.getBoundingClientRect();
    return { left: r.left - j.left, right: r.right - j.left, top: r.top - j.top, bottom: r.bottom - j.top, width: r.width, height: r.height };
  }

  function build() {
    W = journey.clientWidth;
    var d = '';
    startY = 24;
    var first = rel($('.card', stops[0]));
    var xL0 = first.left / 2;
    d += 'M' + xL0 + ' ' + startY;
    bands = [];
    var side = 'L';
    stops.forEach(function (stop, i) {
      var card = rel($('.card', stop));
      var xL = card.left / 2, xR = (W + card.right) / 2;
      var top = stop.offsetTop, band = $('.band', stop).offsetHeight;
      var xFrom = side === 'L' ? xL : xR, xTo = side === 'L' ? xR : xL;
      var y0 = top + 14, y1 = top + band - 14, k = (y1 - y0) * 0.55;
      d += ' L' + xFrom + ' ' + y0;
      d += ' C' + xFrom + ' ' + (y0 + k) + ' ' + xTo + ' ' + (y1 - k) + ' ' + xTo + ' ' + y1;
      stop.classList.toggle('arrive-right', side === 'L');
      stop.classList.toggle('arrive-left', side === 'R');
      bands.push({ top: top, bottom: top + band, stop: stop });
      side = side === 'L' ? 'R' : 'L';
    });
    // Final approach into the finish flag.
    var last = rel($('.card', stops[stops.length - 1]));
    var xEnd = side === 'L' ? last.left / 2 : (W + last.right) / 2;
    var fTop = finish.offsetTop;
    var a = fTop - 100;
    d += ' L' + xEnd + ' ' + a + ' C' + xEnd + ' ' + (a + 50) + ' ' + (W / 2) + ' ' + (fTop - 60) + ' ' + (W / 2) + ' ' + (fTop - 8);
    endY = fTop - 8;

    paths.forEach(function (p) { p.setAttribute('d', d); });
    road.setAttribute('viewBox', '0 0 ' + W + ' ' + journey.offsetHeight);
    road.setAttribute('width', W);
    road.setAttribute('height', journey.offsetHeight);
    startLine.style.left = xL0 + 'px';
    startLine.style.top = startY + 'px';

    // Sample the path once; y never decreases along it, so we can look up by y.
    total = paths[0].getTotalLength();
    samples = { x: [], y: [], s: [] };
    for (var s = 0; s <= total; s += 4) {
      var pt = paths[0].getPointAtLength(s);
      samples.x.push(pt.x); samples.y.push(pt.y); samples.s.push(s);
    }
    trail.style.strokeDasharray = total + ' ' + total;
    update(true);
  }

  function lookup(y) {
    var ys = samples.y, lo = 0, hi = ys.length - 1;
    if (y <= ys[0]) return 0;
    if (y >= ys[hi]) return hi;
    while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (ys[mid] < y) lo = mid; else hi = mid; }
    return hi;
  }

  /* ---------- Driving ---------- */
  var lastX = null, lastY = null, lastI = 0, moveT = 0, lastPuff = 0, angle = 0;
  function update(force) {
    if (!samples.y.length) return;
    var jTop = journey.getBoundingClientRect().top;
    var y = innerHeight * 0.55 - jTop;
    var i = lookup(Math.max(startY, Math.min(y, endY)));
    var x = samples.x[i], py = samples.y[i];
    var a = Math.max(0, i - 3), b = Math.min(samples.x.length - 1, i + 3);
    var dx = samples.x[b] - samples.x[a], dy = samples.y[b] - samples.y[a];
    if (dx || dy) angle = Math.atan2(dy, dx) * 180 / Math.PI;
    car.style.transform = 'translate(' + x + 'px,' + py + 'px)';
    carBody.style.transform = 'rotate(' + angle + 'deg)';
    trail.style.strokeDashoffset = String(total - samples.s[i]);
    tripBar.style.transform = 'scaleX(' + (samples.s[i] / total).toFixed(4) + ')';

    // Speech bubble while crossing between stops.
    var say = '';
    if (py < bands[0].top) say = 'Vroom! Let’s go 🚗';
    bands.forEach(function (bd) { if (py >= bd.top - 10 && py <= bd.bottom + 30) say = bd.stop.dataset.say; });
    if (py >= endY - 2) say = 'We made it! 🏁';
    if (say) carSay.textContent = say;
    car.classList.toggle('talking', !!say);
    car.classList.toggle('edge-l', x < 150);
    car.classList.toggle('edge-r', x > W - 150);

    // Arrivals reveal each stop's card; the nav shows where we are.
    var atBottom = innerHeight + scrollY >= document.documentElement.scrollHeight - 4;
    var here = -1;
    bands.forEach(function (bd, k) {
      var arrived = atBottom || py >= bd.top + (bd.bottom - bd.top) * 0.55;
      if (arrived) { bd.stop.classList.add('arrived'); here = k; }
    });
    navLinks.forEach(function (l, k) { l.classList.toggle('here', k === here); l.classList.toggle('passed', k < here); });

    if (!force && lastX !== null && (Math.abs(x - lastX) + Math.abs(py - lastY)) > 0.5) {
      car.classList.add('moving');
      clearTimeout(moveT);
      moveT = setTimeout(function () { car.classList.remove('moving'); }, 160);
      var now = performance.now();
      if (!reduceMotion && now - lastPuff > 110) {
        lastPuff = now;
        var p = document.createElement('span');
        p.className = 'puff';
        var back = i >= lastI ? Math.max(0, i - 8) : Math.min(samples.x.length - 1, i + 8);
        p.style.left = samples.x[back] + 'px';
        p.style.top = samples.y[back] + 'px';
        journey.appendChild(p);
        setTimeout(function () { p.remove(); }, 800);
      }
    }
    lastX = x; lastY = py; lastI = i;
  }

  var ticking = false;
  addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; update(); });
  }, { passive: true });

  var buildT = 0;
  function rebuildSoon() { clearTimeout(buildT); buildT = setTimeout(build, 80); }
  addEventListener('resize', rebuildSoon);
  if ('ResizeObserver' in window) new ResizeObserver(rebuildSoon).observe(journey);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(rebuildSoon);
  addEventListener('load', rebuildSoon);
  build();
})();
