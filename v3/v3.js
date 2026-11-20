/* Sneha M — v3 "Ride with Sneha": scroll drives a scooty along a road of stops. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  // Inline the rider so its wheels and ponytail can animate.
  var sym = $('#rider'), scooty = $('#scooty');
  scooty.setAttribute('viewBox', sym.getAttribute('viewBox'));
  scooty.innerHTML = sym.innerHTML;
  var wheels = $$('.wheel', scooty);

  var scene = $('#scene'), world = $('#world'), scroller = $('#scroller'), rider = $('#rider'), say = $('#say');
  var stops = $$('.stop', world), props = $('#props');
  var layers = $$('.layer'), tripFill = $('#tripFill'), tripList = $('#tripStops');
  var n = stops.length;

  var vw, vh, boardW, gap, arrival = [], dwellStart = [], dwell, travel = [], total, riderX;

  /* ---------- Layout ---------- */
  function layout() {
    vw = innerWidth; vh = innerHeight;
    var mobile = vw <= 640;
    var riderW = mobile ? 118 : Math.min(Math.max(vw * 0.15, 130), 200);
    riderX = mobile ? vw * 0.06 : vw * 0.06;
    rider.style.setProperty('--rider-x', riderX + 'px');
    boardW = mobile ? Math.round(vw * 0.88) : Math.round(Math.min(600, vw - (riderX + riderW + 80) - 40));
    var screenLeft = mobile ? (vw - boardW) / 2 : Math.max((vw - boardW) / 2, riderX + riderW + 60);
    gap = boardW + Math.max(vw * 0.5, 360);
    dwell = vh * 0.55;
    var x0 = screenLeft;
    stops.forEach(function (s, i) {
      var x = x0 + i * gap;
      s.style.left = x + 'px';
      s.style.setProperty('--board-w', boardW + 'px');
      arrival[i] = x - screenLeft;       // camera position when this stop is in place
    });
    // Scroll ranges: travel to a stop (1:1 with distance), then dwell there.
    var s = 0;
    for (var i = 0; i < n; i++) {
      travel[i] = i === 0 ? 0 : arrival[i] - arrival[i - 1];
      s += travel[i];
      dwellStart[i] = s;
      s += dwell;
    }
    total = s;
    scroller.style.height = (total + vh) + 'px';
    world.style.width = (arrival[n - 1] + vw + 400) + 'px';
    buildScenery();
    buildTrip();
  }

  function camFromScroll(y) {
    for (var i = 0; i < n; i++) {
      if (y <= dwellStart[i]) {
        var into = travel[i] - (dwellStart[i] - y);
        return i === 0 ? 0 : arrival[i - 1] + Math.max(0, into);
      }
      if (y <= dwellStart[i] + dwell) return arrival[i];
    }
    return arrival[n - 1];
  }
  function scrollForStop(i) { return dwellStart[i] + dwell * 0.25; }

  /* ---------- Scenery (seeded so it is the same every visit) ---------- */
  var seed = 7;
  function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
  function buildScenery() {
    seed = 7;
    var worldW = arrival[n - 1] + vw + 400;
    // Trees and lamps along the road
    var html = '';
    for (var x = 40; x < worldW; x += 140 + rnd() * 220) {
      html += rnd() < 0.62 ? '<span class="tree" style="left:' + x.toFixed(0) + 'px;transform:scale(' + (0.75 + rnd() * 0.6).toFixed(2) + ');transform-origin:bottom"></span>'
                           : '<span class="lamp" style="left:' + x.toFixed(0) + 'px"></span>';
    }
    props.innerHTML = html;
    layers.forEach(function (L) {
      var speed = +L.dataset.speed, w = worldW * speed + vw + 200;
      L.style.width = w + 'px';
      if (L.id === 'city') {
        var h = '';
        for (var bx = 0; bx < w; bx += 50 + rnd() * 70) {
          var bw = 40 + rnd() * 70, bh = 18 + rnd() * 62;
          h += '<span class="bld" style="left:' + bx.toFixed(0) + 'px;width:' + bw.toFixed(0) + 'px;height:' + bh.toFixed(0) + '%"></span>';
        }
        L.innerHTML = h;
      } else if (L.id === 'clouds') {
        var c = '';
        for (var cx = 60; cx < w; cx += 260 + rnd() * 380) {
          c += '<span class="cloud" style="left:' + cx.toFixed(0) + 'px;top:' + (rnd() * 70).toFixed(0) + '%;width:' + (90 + rnd() * 110).toFixed(0) + 'px"></span>';
        }
        L.innerHTML = c;
      } else {
        var amp = L.id === 'hillsFar' ? 0.55 : 0.42, step = L.id === 'hillsFar' ? 420 : 300;
        var d = 'M0 100 L0 ' + (100 - amp * 60).toFixed(1);
        for (var hx = 0; hx <= w + step; hx += step) {
          var peak = 100 - amp * (40 + rnd() * 60);
          d += ' Q' + (hx + step / 2).toFixed(0) + ' ' + peak.toFixed(1) + ' ' + (hx + step).toFixed(0) + ' ' + (100 - amp * (30 + rnd() * 40)).toFixed(1);
        }
        d += ' L' + (w + step).toFixed(0) + ' 100 Z';
        L.innerHTML = '<svg viewBox="0 0 ' + w.toFixed(0) + ' 100" preserveAspectRatio="none" style="width:' + w.toFixed(0) + 'px"><path d="' + d + '"/></svg>';
      }
    });
  }

  /* ---------- Trip bar ---------- */
  var tripItems = [];
  function buildTrip() {
    tripList.innerHTML = stops.map(function (s, i) {
      return '<li style="left:' + (scrollForStop(i) / total * 100).toFixed(2) + '%"><button type="button" data-i="' + i + '" aria-label="Ride to ' + s.dataset.label + '"><i></i><span>' + s.dataset.label + '</span></button></li>';
    }).join('');
    tripItems = $$('li', tripList);
    $$('button', tripList).forEach(function (b) { b.addEventListener('click', function () { jump(+b.dataset.i, 'trip_bar'); }); });
  }

  /* ---------- Sky ---------- */
  var SKY = [
    [0.00, [255, 217, 194], [243, 232, 255]],   // morning
    [0.35, [196, 181, 253], [245, 243, 255]],   // day
    [0.68, [167, 139, 250], [253, 186, 116]],   // sunset
    [0.88, [46, 16, 101], [109, 40, 217]],      // dusk
    [1.00, [20, 8, 44], [46, 16, 101]]          // night
  ];
  function mix(a, b, t) { return a.map(function (v, k) { return Math.round(v + (b[k] - v) * t); }); }
  function sky(p) {
    var i = 0; while (i < SKY.length - 2 && p > SKY[i + 1][0]) i++;
    var A = SKY[i], B = SKY[i + 1], t = Math.min(Math.max((p - A[0]) / (B[0] - A[0]), 0), 1);
    var top = mix(A[1], B[1], t), bot = mix(A[2], B[2], t);
    root.style.setProperty('--sky-top', 'rgb(' + top + ')');
    root.style.setProperty('--sky-bot', 'rgb(' + bot + ')');
    var night = Math.min(Math.max((p - 0.74) / 0.2, 0), 1);
    root.style.setProperty('--night', night.toFixed(3));
    var sun = $('#sun');
    sun.style.transform = 'translateY(' + (p * 46).toFixed(1) + 'vh)';
    sun.style.opacity = (1 - night).toFixed(2);
  }

  /* ---------- Frame loop ---------- */
  var cam = 0, target = 0, lastCam = 0, raf = 0, facing = 1, lastPuff = 0, current = -1, viaNext = 'scroll';
  function onScroll() { target = camFromScroll(scrollY); if (!raf) raf = requestAnimationFrame(tick); }
  function tick(now) {
    raf = 0;
    cam = reduce ? target : cam + (target - cam) * 0.14;
    if (Math.abs(target - cam) < 0.3) cam = target;
    var v = cam - lastCam; lastCam = cam;
    world.style.transform = 'translate3d(' + (-cam).toFixed(1) + 'px,0,0)';
    layers.forEach(function (L) { L.style.transform = 'translate3d(' + (-cam * L.dataset.speed).toFixed(1) + 'px,0,0)'; });
    var deg = (cam / 20) * (180 / Math.PI);
    wheels.forEach(function (w) { w.style.transform = 'rotate(' + deg.toFixed(1) + 'deg)'; });
    var moving = Math.abs(v) > 0.4;
    rider.classList.toggle('moving', moving);
    if (moving) facing = v > 0 ? 1 : -1;
    scooty.style.transform = facing < 0 ? 'scaleX(-1)' : '';
    if (moving && v > 0 && !reduce && now - lastPuff > 160) { lastPuff = now; puff(); }

    var p = arrival[n - 1] ? cam / arrival[n - 1] : 0;
    sky(p);
    tripFill.style.transform = 'scaleX(' + Math.min(scrollY / total, 1).toFixed(4) + ')';

    // Which stop are we at?
    var idx = 0, best = Infinity;
    arrival.forEach(function (a, i) { var d = Math.abs(cam - a); if (d < best) { best = d; idx = i; } });
    stops.forEach(function (s, i) { s.classList.toggle('near', Math.abs(cam - arrival[i]) < gap * 0.42); });
    tripItems.forEach(function (li, i) { li.classList.toggle('here', i === idx); li.classList.toggle('done', i < idx); });
    var parked = best < 4 && !moving;
    if (parked) {
      if (say.dataset.i !== String(idx)) { say.textContent = stops[idx].dataset.say; say.dataset.i = idx; }
      say.classList.add('show');
      if (idx !== current) {
        current = idx;
        try { history.replaceState(null, '', idx ? '#' + stops[idx].id : location.pathname); } catch (e) {}
        try { document.dispatchEvent(new CustomEvent('portfolio:stop', { detail: { id: stops[idx].id.replace('stop-', ''), label: stops[idx].dataset.label, index: idx, via: viaNext } })); } catch (e) {}
        viaNext = 'scroll';
      }
    } else if (best > 40) say.classList.remove('show');

    if (cam !== target) raf = requestAnimationFrame(tick);
    else if (moving) raf = requestAnimationFrame(tick);
  }
  function puff() {
    var e = document.createElement('span'); e.className = 'puff';
    $('#exhaust').appendChild(e); setTimeout(function () { e.remove(); }, 900);
  }

  /* ---------- Jumping ---------- */
  function jump(i, via) {
    i = Math.max(0, Math.min(n - 1, i));
    viaNext = via || 'button';
    scrollTo({ top: scrollForStop(i), behavior: reduce ? 'auto' : 'smooth' });
  }
  function nearestIndex() {
    var idx = 0, best = Infinity;
    arrival.forEach(function (a, i) { var d = Math.abs(target - a); if (d < best) { best = d; idx = i; } });
    return { i: idx, at: best < 4 };
  }
  addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey || e.target.closest('input, textarea')) return;
    var k = nearestIndex();
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); jump(k.at || target < arrival[k.i] ? k.i + (k.at ? 1 : 0) : k.i + 1, 'keyboard'); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); jump(k.at || target > arrival[k.i] ? k.i - (k.at ? 1 : 0) : k.i - 1, 'keyboard'); }
    else if (e.key === 'Home') { e.preventDefault(); jump(0, 'keyboard'); }
    else if (e.key === 'End') { e.preventDefault(); jump(n - 1, 'keyboard'); }
  });
  $$('[data-jump]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); jump(a.dataset.jump === 'last' ? n - 1 : +a.dataset.jump, 'button'); });
  });
  // Tabbing into a board rides to it.
  world.addEventListener('focusin', function (e) {
    var s = e.target.closest('.stop'); if (!s) return;
    scene.scrollLeft = 0; world.parentNode.scrollLeft = 0;
    var i = stops.indexOf(s); if (Math.abs(target - arrival[i]) > 4) jump(i, 'keyboard');
  });

  /* ---------- Copy email ---------- */
  var toast = $('#toast'), tT = 0;
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var done = function () { toast.textContent = 'Email copied — talk soon! ✉️'; toast.classList.add('show'); clearTimeout(tT); tT = setTimeout(function () { toast.classList.remove('show'); }, 2200); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(b.dataset.copy).then(done, done); else done();
    });
  });

  /* ---------- Boot ---------- */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  layout();
  addEventListener('scroll', onScroll, { passive: true });
  var rT = 0;
  addEventListener('resize', function () {
    clearTimeout(rT);
    rT = setTimeout(function () { var k = current < 0 ? 0 : current; layout(); scrollTo(0, scrollForStop(k)); target = cam = lastCam = camFromScroll(scrollY); onScroll(); }, 150);
  });
  var hash = location.hash.slice(1), start = 0;
  if (hash === 'work') hash = 'stop-work';
  stops.forEach(function (s, i) { if (s.id === hash || s.id === 'stop-' + hash) start = i; });
  scrollTo(0, start ? scrollForStop(start) : 0);
  target = cam = lastCam = camFromScroll(scrollY);
  viaNext = start ? 'link' : 'landing';
  onScroll();
  setTimeout(onScroll, 60);
})();
