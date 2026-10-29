/* Sneha M — portfolio canvas: pan, zoom, fly-to frames, tour, inspector. */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  var root = document.documentElement;
  root.classList.add('js');
  var reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  var viewport = $('#viewport');
  var world = $('#world');
  var frames = $$('.frame', world);
  var byId = {};
  frames.forEach(function (f) { byId[f.id] = f; });

  /* ------------------------------------------------------------------
     Projects on Behance
     ------------------------------------------------------------------ */
  var IMG = 'https://framerusercontent.com/images/';
  var BE = 'https://www.behance.net/gallery/';
  var shots = [
    ['Medicare', 'Team project · Case study', 'case', 'ffp4Ukth3aHcGcnmyIiGwYr7w', '174043145/MediCare-Medical-Application'],
    ['Outdoor Nuptials', 'Individual project · Case study', 'case', 'CsluJ62hafQ38e07bIiangXiQPU', '174064003/Outdoor-Nuptials'],
    ['Enhancing Duolingo UX', 'Case study', 'case', 'y7uCmEya065zdaDtXqbDSMEFhqY', '176358781/Enhancing-Duolingo-UX-Case-study'],
    ['Twitter UI Evaluation', 'Heuristic evaluation', 'case', 'Als8PJKpMxirwpVgn3J0xbATM', '173895575/Twitter-UI-Evaluation-A-Heuristic-Approach-Case-Study'],
    ['Celebrare', 'Landing page redesign', 'landing', 'Q6ceRBqrZZUzGfN2qb08mZN4pIg', '178916893/Landing-Page-Redesign'],
    ['Thulasi Siddha Clinic', 'Landing page', 'landing', '4yi6H3iBVQi9KdgrwgfSGbFv3k', '198401225/Landing-Page-Design-Thulasi-Siddha-Clinic'],
    ['PixZap', 'Landing page · Pop-art style', 'landing', 'usBLE8ZOCG6SScmkiXwCoWnaY', '177688347/Landing-page-Pop-art-style'],
    ['QuickTrek', 'Landing page', 'landing', 'pU8MgmgBQOLS0FC696UJtMC8f0', '177286753/Landing-Page-QuickTrek'],
    ['Business Page', 'Landing page', 'landing', 'IyzTlBxeAjSwv6lo2dUAf5pSh60', '168710363/Landing-Page'],
    ['Candyz', 'Landing page', 'landing', 'pu8lQ4I9GAiqtxMijGFaqfZcgM', '168888963/Landing-page'],
    ['Daily UI', 'Landing page', 'landing', 'w6cTDpBL71GT41U9LWAT6IxMaA', '173900743/Landing-PageDaily-UI'],
    ['100 Days Design Challenge', 'Daily UI', 'other', 'hvnH4R7Ys4CSuEo4wFWT3lEHI', '174372279/Daily-UI-100-Days-Designs'],
    ['The Self-Care Gap', 'Research assignment', 'other', '2SHZeuIIlZL5ZKi7zAQE4LLUk', '198405761/Assignment-The-self-Care-Gap-(Research)'],
    ['Email Campaign Designs', 'Visual design', 'other', 'KCGlXql3SuNemDz0Eui8AvPfew', '174361479/Email-Campaign']
  ];
  var shotsEl = $('#shots');
  shotsEl.innerHTML = shots.map(function (p) {
    return '<a class="shot" data-cat="' + p[2] + '" href="' + BE + p[4] + '" target="_blank" rel="noopener">' +
      '<div class="thumb"><img loading="lazy" draggable="false" src="' + IMG + p[3] + '.png?scale-down-to=512" alt="' + p[0] + ' preview" width="400" height="300"></div>' +
      '<div class="cap"><span><b>' + p[0] + '</b><small>' + p[1] + '</small></span><span class="go" aria-hidden="true">↗</span></div></a>';
  }).join('');

  $$('.filters button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.dataset.filter;
      $$('.filters button').forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      $$('.shot', shotsEl).forEach(function (el) { el.hidden = f !== 'all' && el.dataset.cat !== f; });
      relayoutSoon();
    });
  });

  /* ------------------------------------------------------------------
     Frame chrome: labels, selection handles, menu
     ------------------------------------------------------------------ */
  var menu = $('#menu');
  frames.forEach(function (f, i) {
    var label = document.createElement('button');
    label.type = 'button';
    label.className = 'frame-label';
    label.textContent = f.dataset.label;
    label.tabIndex = -1;
    label.addEventListener('click', function () { go(i); });
    f.insertBefore(label, f.firstChild);
    var h = document.createElement('span');
    h.className = 'handles';
    h.setAttribute('aria-hidden', 'true');
    h.innerHTML = '<i></i><i></i><i></i><i></i>';
    f.appendChild(h);

    var li = document.createElement('li');
    li.innerHTML = '<button type="button"><span>' + String(i + 1).padStart(2, '0') + '</span>' + f.dataset.label + '</button>';
    li.firstChild.addEventListener('click', function () { closeMenu(); go(i); });
    menu.appendChild(li);
  });

  /* ------------------------------------------------------------------
     State
     ------------------------------------------------------------------ */
  var ROWS = [['hello', 'story', 'toolkit'], ['experience', 'certs'], ['work', 'more'], ['about', 'contact']];
  var GAP = 140;
  var cam = { x: 0, y: 0, z: 1 };
  var bounds = { w: 1, h: 1 };
  var current = 0;
  var reader = false;
  var mobile = false;
  var anim = 0;
  var MIN_Z = 0.12, MAX_Z = 2.5;

  /* ------------------------------------------------------------------
     Layout
     ------------------------------------------------------------------ */
  function layout() {
    mobile = innerWidth < 760;
    root.classList.toggle('m', mobile);
    if (reader) return;
    if (mobile) {
      var w = Math.min(innerWidth - 24, 560), y = 0;
      frames.forEach(function (f) {
        f.style.width = w + 'px';
        place(f, 0, y, w);
        y += f._h + 90;
      });
      bounds = { w: w, h: y - 90 };
    } else {
      var yy = 0, maxW = 0;
      ROWS.forEach(function (row) {
        var x = 0, rowH = 0;
        row.forEach(function (id) {
          var f = byId[id], fw = +f.dataset.w;
          f.style.width = fw + 'px';
          place(f, x, yy, fw);
          x += fw + GAP;
          rowH = Math.max(rowH, f._h);
        });
        maxW = Math.max(maxW, x - GAP);
        yy += rowH + GAP;
      });
      bounds = { w: maxW, h: yy - GAP };
    }
    buildMinimap();
  }
  function place(f, x, y, w) {
    f.style.left = x + 'px';
    f.style.top = y + 'px';
    f._x = x; f._y = y; f._w = w; f._h = f.offsetHeight;
  }

  // Usable screen area (minus top bar and toolbar)
  function area() {
    var t = mobile ? 64 : 76, b = mobile ? 74 : 84, s = mobile ? 12 : 28;
    return { l: s, t: t, w: innerWidth - s * 2, h: innerHeight - t - b };
  }

  function frameCam(f) {
    var a = area();
    if (mobile) {
      return { z: 1, x: (innerWidth - f._w) / 2 - f._x, y: a.t + 30 - f._y };
    }
    var pad = 56;
    var zW = Math.min(a.w / (f._w + pad * 2), 1.1);
    var zH = a.h / (f._h + pad * 2);
    var z = Math.min(zW, Math.max(zH, zW * 0.8));
    var x = a.l + (a.w - f._w * z) / 2 - f._x * z;
    var y = f._h * z <= a.h - 40
      ? a.t + (a.h - f._h * z) / 2 - f._y * z
      : a.t + 40 - f._y * z;
    return { x: x, y: y, z: z };
  }

  function overviewCam() {
    var a = area();
    var z = Math.min(a.w / bounds.w, a.h / bounds.h) * 0.94;
    return { z: z, x: a.l + (a.w - bounds.w * z) / 2, y: a.t + (a.h - bounds.h * z) / 2 };
  }

  /* ------------------------------------------------------------------
     Camera
     ------------------------------------------------------------------ */
  var zoomPct = $('#zoomPct');
  function apply() {
    world.style.transform = 'translate3d(' + cam.x + 'px,' + cam.y + 'px,0) scale(' + cam.z + ')';
    world.style.setProperty('--inv', (1 / cam.z).toFixed(4));
    var g = 24 * cam.z;
    while (g < 12) g *= 2;
    viewport.style.backgroundSize = g + 'px ' + g + 'px';
    viewport.style.backgroundPosition = cam.x + 'px ' + cam.y + 'px';
    zoomPct.textContent = Math.round(cam.z * 100) + '%';
    markSeen();
    drawMinimapView();
  }

  function stopAnim() { cancelAnimationFrame(anim); anim = 0; }

  function flyTo(t, dur, done) {
    stopAnim(); stopInertia();
    if (reduceMotion || dur === 0) { cam = t; apply(); if (done) done(); return; }
    var s = { x: cam.x, y: cam.y, z: cam.z }, a = area();
    var vcx = a.l + a.w / 2, vcy = a.t + a.h / 2;
    var sc = { x: (vcx - s.x) / s.z, y: (vcy - s.y) / s.z };
    var tc = { x: (vcx - t.x) / t.z, y: (vcy - t.y) / t.z };
    var dist = Math.hypot(tc.x - sc.x, tc.y - sc.y) * Math.min(s.z, t.z);
    var bump = Math.min(dist / (a.w * 2.2), 0.38);
    if (dur == null) dur = clamp(620 + dist * 0.32, 620, 1300);
    var t0 = performance.now();
    var step = function (now) {
      var p = Math.min((now - t0) / dur, 1);
      var e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      var z = Math.exp(Math.log(s.z) + (Math.log(t.z) - Math.log(s.z)) * e) * (1 - bump * Math.sin(Math.PI * e));
      var cx = sc.x + (tc.x - sc.x) * e, cy = sc.y + (tc.y - sc.y) * e;
      cam = { z: z, x: vcx - cx * z, y: vcy - cy * z };
      apply();
      if (p < 1) anim = requestAnimationFrame(step);
      else { anim = 0; cam = t; apply(); if (done) done(); }
    };
    anim = requestAnimationFrame(step);
  }

  function clampCam() {
    var W = bounds.w * cam.z, H = bounds.h * cam.z, m = 140;
    if (mobile && cam.z > 0.92) cam.x = (innerWidth - W) / 2;
    else cam.x = clamp(cam.x, m - W, innerWidth - m);
    cam.y = clamp(cam.y, m - H, innerHeight - m);
  }
  function pan(dx, dy) { cam.x += dx; cam.y += dy; clampCam(); apply(); }
  function zoomAt(px, py, factor) {
    var z = clamp(cam.z * factor, MIN_Z, MAX_Z);
    var wx = (px - cam.x) / cam.z, wy = (py - cam.y) / cam.z;
    cam = { z: z, x: px - wx * z, y: py - wy * z };
    clampCam(); apply();
  }
  function zoomBy(factor) {
    var a = area(), px = a.l + a.w / 2, py = a.t + a.h / 2;
    var z = clamp(cam.z * factor, MIN_Z, MAX_Z);
    var wx = (px - cam.x) / cam.z, wy = (py - cam.y) / cam.z;
    flyTo({ z: z, x: px - wx * z, y: py - wy * z }, 260, settle);
  }

  /* ------------------------------------------------------------------
     Current frame tracking
     ------------------------------------------------------------------ */
  var frameNum = $('#frameNum'), frameName = $('#frameName'), live = $('#live');
  var prevBtn = $('#prevBtn'), nextBtn = $('#nextBtn');

  function setCurrent(i, announce) {
    current = i;
    frames.forEach(function (f, j) { f.classList.toggle('is-current', j === i && !reader); });
    frameNum.textContent = (i + 1) + '/' + frames.length;
    frameName.textContent = frames[i].dataset.label;
    prevBtn.disabled = i === 0;
    nextBtn.disabled = i === frames.length - 1;
    $$('button', menu).forEach(function (b, j) { b.setAttribute('aria-current', String(j === i)); });
    $$('i', mmWorld).forEach(function (r, j) { r.classList.toggle('on', j === i); });
    try { history.replaceState(null, '', i === 0 ? location.pathname + location.search : '#' + frames[i].id); } catch (e) {}
    if (announce) live.textContent = 'Frame ' + (i + 1) + ' of ' + frames.length + ': ' + frames[i].dataset.label;
  }

  // Which frame is under the middle of the screen?
  function settle() {
    if (reader) return;
    var a = area();
    var wx = (a.l + a.w / 2 - cam.x) / cam.z, wy = (a.t + a.h / 2 - cam.y) / cam.z;
    var best = current, bestD = Infinity;
    frames.forEach(function (f, i) {
      var dx = Math.max(f._x - wx, 0, wx - (f._x + f._w));
      var dy = Math.max(f._y - wy, 0, wy - (f._y + f._h));
      var d = Math.hypot(dx, dy);
      if (d < bestD) { bestD = d; best = i; }
    });
    if (best !== current) setCurrent(best, true);
    if (cam.z > 0.45) showHint(frames[best]);
  }

  function markSeen() {
    var vw = innerWidth, vh = innerHeight;
    frames.forEach(function (f) {
      if (f.classList.contains('seen')) return;
      var sx = f._x * cam.z + cam.x, sy = f._y * cam.z + cam.y, sw = f._w * cam.z, sh = f._h * cam.z;
      var ox = Math.min(sx + sw, vw) - Math.max(sx, 0), oy = Math.min(sy + sh, vh) - Math.max(sy, 0);
      if (ox > 0 && oy > Math.min(sh, vh) * 0.25 && sw > vw * (mobile ? 0.6 : 0.4)) f.classList.add('seen');
    });
  }

  function go(i, dur) {
    i = clamp(i, 0, frames.length - 1);
    closeInspector(true);
    if (reader) {
      frames[i].scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      setCurrent(i, true);
      return;
    }
    setCurrent(i, true);
    flyTo(frameCam(frames[i]), dur, function () { settle(); });
  }
  function next() { go(current + 1); }
  function prev() { go(current - 1); }

  /* ------------------------------------------------------------------
     Collaborator cursor hints
     ------------------------------------------------------------------ */
  var buddy = $('#buddy'), buddySay = $('#buddySay'), hintTimer = 0;
  var touchy = !finePointer;
  function showHint(f) {
    if (reader || f._hinted || anim) return;
    f._hinted = true;
    var target = (f.dataset.hintAt && $(f.dataset.hintAt, f)) || f;
    var r = target.getBoundingClientRect();
    var wx = (r.left - cam.x) / cam.z + Math.min(r.width / cam.z * 0.5, 200);
    var wy = (r.bottom - cam.y) / cam.z - 6;
    wx = Math.min(wx, f._x + f._w - 260 / cam.z);
    buddy.style.transform = 'translate(' + wx + 'px,' + wy + 'px)';
    buddySay.textContent = (touchy && f.dataset.hintTouch) || f.dataset.hint;
    buddy.classList.add('on');
    clearTimeout(hintTimer);
    buddy.classList.remove('talk');
    hintTimer = setTimeout(function () {
      buddy.classList.add('talk');
      hintTimer = setTimeout(function () { buddy.classList.remove('talk'); }, 5200);
    }, reduceMotion ? 0 : 900);
  }

  /* ------------------------------------------------------------------
     Pointer: pan, pinch, sticky notes
     ------------------------------------------------------------------ */
  var pts = new Map();
  var drag = null, holdTimer = 0, suppressClick = false, zTop = 10;
  var vel = { x: 0, y: 0 }, lastMove = 0, inertiaRAF = 0;

  function stopInertia() { cancelAnimationFrame(inertiaRAF); inertiaRAF = 0; }
  function inertia() {
    var step = function () {
      vel.x *= 0.92; vel.y *= 0.92;
      pan(vel.x, vel.y);
      if (Math.hypot(vel.x, vel.y) > 0.4) inertiaRAF = requestAnimationFrame(step);
      else { inertiaRAF = 0; settle(); }
    };
    inertiaRAF = requestAnimationFrame(step);
  }

  function pinchInfo() {
    var p = Array.from(pts.values());
    return { d: Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) || 1, mx: (p[0].x + p[1].x) / 2, my: (p[0].y + p[1].y) / 2 };
  }

  function startNote(note) {
    drag.type = 'note';
    drag.note = note;
    drag.nx = parseFloat(note.style.getPropertyValue('--dx')) || 0;
    drag.ny = parseFloat(note.style.getPropertyValue('--dy')) || 0;
    note.classList.add('dragging');
    note.style.zIndex = ++zTop;
    try { viewport.setPointerCapture(drag.id); } catch (e) {}
  }

  viewport.addEventListener('pointerdown', function (e) {
    if (reader || (e.pointerType === 'mouse' && e.button !== 0)) return;
    stopTour(); stopAnim(); stopInertia();
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    suppressClick = false;
    if (pts.size === 2) {
      clearTimeout(holdTimer);
      if (drag && drag.note) drag.note.classList.remove('dragging');
      var pi = pinchInfo();
      drag = { type: 'pinch', d0: pi.d, z0: cam.z, wx: (pi.mx - cam.x) / cam.z, wy: (pi.my - cam.y) / cam.z };
      return;
    }
    if (pts.size > 2) return;
    drag = { type: 'pending', id: e.pointerId, sx: e.clientX, sy: e.clientY, lx: e.clientX, ly: e.clientY };
    var note = e.target.closest('.board .note');
    if (note) {
      if (e.pointerType !== 'touch') startNote(note);
      else holdTimer = setTimeout(function () {
        if (drag && drag.type === 'pending') { startNote(note); if (navigator.vibrate) navigator.vibrate(12); }
      }, 220);
    }
  });

  viewport.addEventListener('pointermove', function (e) {
    if (!pts.has(e.pointerId) || !drag) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (drag.type === 'pinch') {
      if (pts.size < 2) return;
      var pi = pinchInfo(), z = clamp(drag.z0 * pi.d / drag.d0, MIN_Z, MAX_Z);
      cam = { z: z, x: pi.mx - drag.wx * z, y: pi.my - drag.wy * z };
      suppressClick = true;
      apply();
      return;
    }
    if (e.pointerId !== drag.id) return;
    var dx = e.clientX - drag.lx, dy = e.clientY - drag.ly;
    if (drag.type === 'pending') {
      if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 6) return;
      clearTimeout(holdTimer);
      drag.type = 'pan';
      viewport.classList.add('panning');
      try { viewport.setPointerCapture(e.pointerId); } catch (err) {}
    }
    drag.lx = e.clientX; drag.ly = e.clientY;
    if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 5) suppressClick = true;
    if (drag.type === 'pan') {
      var now = performance.now(), dt = Math.max(now - lastMove, 1);
      vel = { x: dx / dt * 16, y: dy / dt * 16 };
      lastMove = now;
      pan(dx, dy);
    } else if (drag.type === 'note') {
      drag.nx += dx / cam.z; drag.ny += dy / cam.z;
      drag.note.style.setProperty('--dx', drag.nx + 'px');
      drag.note.style.setProperty('--dy', drag.ny + 'px');
    }
  });

  function endPointer(e) {
    if (!pts.has(e.pointerId)) return;
    pts.delete(e.pointerId);
    clearTimeout(holdTimer);
    if (!drag) return;
    if (drag.type === 'pinch') {
      if (pts.size === 0) { drag = null; clampCam(); apply(); settle(); }
      return;
    }
    if (e.pointerId !== drag.id) return;
    if (drag.type === 'pan') {
      viewport.classList.remove('panning');
      if (performance.now() - lastMove < 60 && !reduceMotion) inertia(); else settle();
    } else if (drag.type === 'note') {
      drag.note.classList.remove('dragging');
    }
    drag = null;
  }
  viewport.addEventListener('pointerup', endPointer);
  viewport.addEventListener('pointercancel', endPointer);
  viewport.addEventListener('click', function (e) {
    if (suppressClick) { e.preventDefault(); e.stopPropagation(); suppressClick = false; }
  }, true);
  viewport.addEventListener('dragstart', function (e) { if (!reader) e.preventDefault(); });
  // Focus can scroll an overflow:hidden box; keep it pinned.
  viewport.addEventListener('scroll', function () { if (!reader) { viewport.scrollTop = 0; viewport.scrollLeft = 0; } });

  var wheelT = 0;
  viewport.addEventListener('wheel', function (e) {
    if (reader) return;
    e.preventDefault();
    stopTour(); stopAnim(); stopInertia();
    var k = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1;
    if (e.ctrlKey || e.metaKey) zoomAt(e.clientX, e.clientY, Math.exp(-clamp(e.deltaY * k, -60, 60) * 0.01));
    else pan(-e.deltaX * k, -e.deltaY * k);
    clearTimeout(wheelT);
    wheelT = setTimeout(settle, 180);
  }, { passive: false });

  // Keyboard users: fly to the frame that receives focus.
  world.addEventListener('focusin', function (e) {
    if (reader || drag) return;
    var f = e.target.closest('.frame');
    var i = frames.indexOf(f);
    var visible = false;
    try { visible = e.target.matches(':focus-visible'); } catch (err) {}
    if (i >= 0 && i !== current && visible) go(i);
  });

  /* "You" multiplayer cursor label */
  var you = $('#you');
  if (finePointer) {
    viewport.addEventListener('pointermove', function (e) {
      if (reader || e.pointerType !== 'mouse') return;
      you.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
      you.classList.add('on');
    });
    viewport.addEventListener('pointerleave', function () { you.classList.remove('on'); });
  }

  /* ------------------------------------------------------------------
     Toolbar, menu, tour
     ------------------------------------------------------------------ */
  var menuBtn = $('#menuBtn');
  function openMenu() { menu.hidden = false; menuBtn.setAttribute('aria-expanded', 'true'); var b = $('[aria-current="true"]', menu) || $('button', menu); b.focus(); }
  function closeMenu() { if (menu.hidden) return; menu.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); }
  menuBtn.addEventListener('click', function () { menu.hidden ? openMenu() : closeMenu(); });
  $('#frameLabel').addEventListener('click', function () { menu.hidden ? openMenu() : closeMenu(); });
  document.addEventListener('pointerdown', function (e) { if (!e.target.closest('.toolbar')) closeMenu(); });
  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);
  $('#zoomIn').addEventListener('click', function () { zoomBy(1.25); });
  $('#zoomOut').addEventListener('click', function () { zoomBy(0.8); });
  zoomPct.addEventListener('click', function () { go(current); });
  $('#fitAll').addEventListener('click', function () { flyTo(overviewCam(), null, settle); });

  var tourBtn = $('#tourBtn'), tourTimer = 0, touring = false, TOUR_MS = 5200;
  root.style.setProperty('--tour-ms', TOUR_MS + 'ms');
  function tickTour() {
    tourBtn.classList.remove('ticking');
    void tourBtn.offsetWidth;
    tourBtn.classList.add('ticking');
    tourTimer = setTimeout(function () {
      if (current >= frames.length - 1) { stopTour(); toast('That’s the whole board — thanks for visiting! 💙'); return; }
      next(); tickTour();
    }, TOUR_MS);
  }
  function startTour() {
    if (reader) setReader(false);
    touring = true;
    tourBtn.setAttribute('aria-pressed', 'true');
    tourBtn.setAttribute('aria-label', 'Pause guided tour');
    go(current >= frames.length - 1 ? 0 : current === 0 && cam.z > 0.5 ? 1 : current);
    tickTour();
  }
  function stopTour() {
    if (!touring) return;
    touring = false;
    clearTimeout(tourTimer);
    tourBtn.classList.remove('ticking');
    tourBtn.setAttribute('aria-pressed', 'false');
    tourBtn.setAttribute('aria-label', 'Play guided tour');
  }
  tourBtn.addEventListener('click', function () { touring ? stopTour() : startTour(); });
  $$('[data-action="tour"]').forEach(function (b) { b.addEventListener('click', startTour); });
  $$('[data-go]').forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); stopTour(); go(+el.dataset.go); });
  });

  document.addEventListener('keydown', function (e) {
    if (!inspector.hidden) { if (e.key === 'Escape') closeInspector(); return; }
    if (e.key === 'Escape') { closeMenu(); stopTour(); return; }
    if (reader || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.closest('input, textarea, select, [role="tablist"], .menu')) return;
    var handled = true;
    switch (e.key) {
      case 'ArrowRight': case 'PageDown': stopTour(); next(); break;
      case 'ArrowLeft': case 'PageUp': stopTour(); prev(); break;
      case 'ArrowDown': stopTour(); flyTo({ x: cam.x, y: cam.y - innerHeight * 0.35, z: cam.z }, 260, settle); break;
      case 'ArrowUp': stopTour(); flyTo({ x: cam.x, y: cam.y + innerHeight * 0.35, z: cam.z }, 260, settle); break;
      case '+': case '=': zoomBy(1.25); break;
      case '-': case '_': zoomBy(0.8); break;
      case '0': flyTo(overviewCam(), null, settle); break;
      case 'Home': go(0); break;
      case 'End': go(frames.length - 1); break;
      default: handled = false;
    }
    if (handled) e.preventDefault();
  });

  /* ------------------------------------------------------------------
     Minimap
     ------------------------------------------------------------------ */
  var minimap = $('#minimap'), mmWorld = $('#mmWorld'), mmView = null, mmS = 1;
  function buildMinimap() {
    mmS = 150 / bounds.w;
    mmWorld.style.width = bounds.w * mmS + 'px';
    mmWorld.style.height = bounds.h * mmS + 'px';
    mmWorld.innerHTML = frames.map(function (f, i) {
      return '<i class="' + (i === current ? 'on' : '') + '" style="left:' + f._x * mmS + 'px;top:' + f._y * mmS + 'px;width:' + f._w * mmS + 'px;height:' + f._h * mmS + 'px"></i>';
    }).join('') + '<b class="mm-view"></b>';
    mmView = $('.mm-view', mmWorld);
  }
  function drawMinimapView() {
    if (!mmView) return;
    var x = -cam.x / cam.z, y = -cam.y / cam.z, w = innerWidth / cam.z, h = innerHeight / cam.z;
    var W = bounds.w, H = bounds.h;
    var x0 = clamp(x, 0, W), y0 = clamp(y, 0, H), x1 = clamp(x + w, 0, W), y1 = clamp(y + h, 0, H);
    mmView.style.cssText = 'left:' + x0 * mmS + 'px;top:' + y0 * mmS + 'px;width:' + Math.max(x1 - x0, 0) * mmS + 'px;height:' + Math.max(y1 - y0, 0) * mmS + 'px';
  }
  minimap.addEventListener('click', function (e) {
    var r = mmWorld.getBoundingClientRect();
    var wx = (e.clientX - r.left) / mmS, wy = (e.clientY - r.top) / mmS;
    var hit = frames.findIndex(function (f) { return wx >= f._x && wx <= f._x + f._w && wy >= f._y && wy <= f._y + f._h; });
    if (hit >= 0) go(hit);
  });

  /* ------------------------------------------------------------------
     Inspector
     ------------------------------------------------------------------ */
  var inspector = $('#inspector'), inspBody = $('#inspBody'), inspTitle = $('#inspTitle'), scrim = $('#scrim');
  var lastFocus = null;
  function openInspector(item) {
    stopTour();
    var details = $('.details', item);
    if (!details) return;
    inspBody.innerHTML = '';
    var cover = $('.cover', item);
    if (cover) {
      var wrap = document.createElement('div');
      wrap.className = 'insp-cover';
      wrap.appendChild(cover.cloneNode(true));
      inspBody.appendChild(wrap);
    }
    inspBody.appendChild(details.cloneNode(true));
    inspTitle.textContent = ($('h3', details) || {}).textContent || 'Details';
    lastFocus = document.activeElement;
    inspector.hidden = false; scrim.hidden = false;
    inspBody.scrollTop = 0;
    requestAnimationFrame(function () { requestAnimationFrame(function () { inspector.classList.add('open'); scrim.classList.add('open'); }); });
    $('#inspClose').focus({ preventScroll: true });
  }
  function closeInspector(silent) {
    if (inspector.hidden) return;
    inspector.classList.remove('open'); scrim.classList.remove('open');
    setTimeout(function () { inspector.hidden = true; scrim.hidden = true; }, reduceMotion ? 0 : 420);
    if (!silent && lastFocus) lastFocus.focus({ preventScroll: true });
  }
  $$('[data-inspect]').forEach(function (b) {
    b.addEventListener('click', function () { openInspector(b.closest('.case, .job')); });
  });
  $('#inspClose').addEventListener('click', function () { closeInspector(); });
  scrim.addEventListener('click', function () { closeInspector(); });
  inspector.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var f = $$('button, a[href]', inspector);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });

  /* ------------------------------------------------------------------
     Toolkit tabs + dock magnification
     ------------------------------------------------------------------ */
  var tabs = $$('[role="tab"]');
  function selectTab(t) {
    tabs.forEach(function (x) {
      var on = x === t;
      x.setAttribute('aria-selected', String(on));
      x.tabIndex = on ? 0 : -1;
      document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
    });
    relayoutSoon();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(t); });
    t.addEventListener('keydown', function (e) {
      var n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null;
      if (n === null) return;
      e.preventDefault();
      var tt = tabs[(n + tabs.length) % tabs.length];
      selectTab(tt); tt.focus();
    });
  });

  var dock = $('.dock'), tiles = $$('li', dock);
  if (finePointer && !reduceMotion) {
    dock.addEventListener('pointermove', function (e) {
      var z = reader ? 1 : cam.z;
      tiles.forEach(function (t) {
        var r = t.getBoundingClientRect();
        var d = Math.abs(e.clientX - (r.left + r.width / 2)) / z;
        t.style.setProperty('--s', (1 + 0.45 * Math.max(0, 1 - d / 120)).toFixed(3));
      });
    });
    dock.addEventListener('pointerleave', function () { tiles.forEach(function (t) { t.style.setProperty('--s', 1); }); });
  }

  /* ------------------------------------------------------------------
     Copy email, toast, theme, view mode
     ------------------------------------------------------------------ */
  var toastEl = $('#toast'), toastT = 0;
  function toast(msg, ms) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('show'); }, ms || 2600);
  }
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var text = b.dataset.copy;
      var ok = function () { toast('Email copied — talk soon! ✉️'); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, function () { toast(text); });
      else toast(text);
    });
  });

  var saved = store.get('theme');
  if (saved) root.dataset.theme = saved;
  $('#themeBtn').addEventListener('click', function () {
    var dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    store.set('theme', root.dataset.theme);
  });

  var io = null;
  function setReader(on, persist) {
    reader = on;
    root.classList.toggle('reader', on);
    $$('[data-view]').forEach(function (b) { b.setAttribute('aria-pressed', String((b.dataset.view === 'reader') === on)); });
    if (persist !== false) store.set('view', on ? 'reader' : 'canvas');
    stopTour(); stopAnim(); stopInertia();
    if (on) {
      world.style.transform = '';
      frames.forEach(function (f) { f.style.left = f.style.top = f.style.width = ''; f.classList.remove('is-current'); });
      buddy.classList.remove('on', 'talk');
      you.classList.remove('on');
      if (!io && 'IntersectionObserver' in window) {
        io = new IntersectionObserver(function (es) {
          es.forEach(function (en) {
            if (en.isIntersecting) en.target.classList.add('seen');
            if (reader && en.isIntersecting && en.intersectionRatio > 0.3) setCurrent(frames.indexOf(en.target));
          });
        }, { threshold: [0.05, 0.3] });
        frames.forEach(function (f) { io.observe(f); });
      } else if (!io) frames.forEach(function (f) { f.classList.add('seen'); });
      frames[current].scrollIntoView({ block: 'start' });
    } else {
      window.scrollTo(0, 0);
      layout();
      setCurrent(current);
      flyTo(frameCam(frames[current]), 0);
      settle();
    }
  }
  $$('[data-view]').forEach(function (b) {
    b.addEventListener('click', function () { var r = b.dataset.view === 'reader'; if (r !== reader) setReader(r); });
  });

  /* ------------------------------------------------------------------
     Resize / relayout
     ------------------------------------------------------------------ */
  var relayoutT = 0;
  function relayoutSoon() {
    if (reader) return;
    clearTimeout(relayoutT);
    relayoutT = setTimeout(function () {
      layout();
      drawMinimapView();
    }, 60);
  }
  var resizeT = 0;
  addEventListener('resize', function () {
    clearTimeout(resizeT);
    resizeT = setTimeout(function () {
      var wasMobile = mobile;
      layout();
      if (!reader) {
        if (wasMobile !== mobile) frames.forEach(function (f) { f._hinted = false; });
        flyTo(frameCam(frames[current]), 0);
      }
    }, 150);
  });

  /* ------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------ */
  $('#year').textContent = new Date().getFullYear();
  var introPending = false;
  var startIdx = Math.max(0, frames.findIndex(function (f) { return '#' + f.id === location.hash; }));

  current = startIdx;
  if (store.get('view') === 'reader') {
    setReader(true, false);
  } else {
    root.classList.remove('reader');
    layout();
    setCurrent(startIdx);
    if (startIdx > 0 || reduceMotion) {
      flyTo(frameCam(frames[startIdx]), 0);
      settle();
    } else {
      // Intro: reveal the whole board, then dive into the first frame.
      cam = overviewCam(); apply();
      introPending = true;
      setTimeout(function () {
        introPending = false;
        go(0, 1400);
        setTimeout(function () {
          toast(mobile ? 'Drag to explore · pinch to zoom · tap › for next' : 'Drag to explore · Ctrl/⌘ + scroll to zoom · ← → between frames', 4200);
        }, 1500);
      }, 900);
    }
  }

  // Re-measure once web fonts and images settle.
  var remeasure = function () {
    if (reader || anim) return;
    layout();
    if (introPending) { cam = overviewCam(); apply(); return; }
    flyTo(frameCam(frames[current]), 0);
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setTimeout(remeasure, 50); });
})();
