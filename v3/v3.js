/* Sneha M — v3 "Sneha's Desk": click objects in the desk scene to explore the portfolio. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var stage = $('#stage'), scene = $('#scene'), pan = $('#pan'), tip = $('#tip'), toastEl = $('#toast');
  var LABELS = { work: 'Work', process: 'How I work', experience: 'Experience', about: 'About', wins: 'Wins', tools: 'Toolkit', contact: 'Contact' };
  var INDEX = { work: 1, process: 2, experience: 3, about: 4, wins: 5, tools: 6, contact: 7 };
  function track(n, p) { if (window.track) window.track(n, p); }

  // ---------- Hotspots ----------
  $$('.hs').forEach(function (h) {
    function act(via) {
      if (h.dataset.open) open(h.dataset.open, via, h);
      else if (h.dataset.act === 'plant') waterPlant();
      else if (h.dataset.act === 'lamp') lampClicked();
      else if (h.dataset.act === 'proto') protoMenu();
    }
    h.addEventListener('click', function () { act('object'); });
    h.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act('object'); } });
    h.addEventListener('mouseenter', function () { if (!bubble.classList.contains('show')) showTip(h); });
    h.addEventListener('focus', function () { showTip(h); });
    h.addEventListener('mouseleave', hideTip);
    h.addEventListener('blur', hideTip);
  });
  function showTip(h) {
    if (root.classList.contains('zoomed')) return;
    var r = h.getBoundingClientRect();
    tip.textContent = h.dataset.label;
    tip.style.left = Math.min(Math.max(r.left + r.width / 2, 90), innerWidth - 90) + 'px';
    tip.style.top = Math.max(r.top - 10, 74) + 'px';
    tip.classList.add('show');
  }
  function hideTip() { tip.classList.remove('show'); }

  function toast(t) {
    toastEl.textContent = t;
    toastEl.classList.add('show');
    clearTimeout(toast.t);
    toast.t = setTimeout(function () { toastEl.classList.remove('show'); }, 2800);
  }
  var GROWTH = ['🌱 Still learning: new tools every month', '🌿 Still growing: AI-assisted workflows', '🪴 And certifications from IBM, Google and more'];
  var water = 0;
  function waterPlant() {
    toast(GROWTH[water % GROWTH.length]);
    water++;
    track('plant_watered', { level: water });
  }

  // ---------- Lights: the room starts dark, lit only by the desk lamp ----------
  function isDark() { return root.hasAttribute('data-night'); }
  function setNight(on, save) {
    if (on) root.setAttribute('data-night', ''); else root.removeAttribute('data-night');
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', on ? '#241b33' : '#9e8fae');
    if (save) track('theme_toggled', { to: on ? 'night' : 'day' });
  }
  // Every visit starts with the room lights off; only the visitor turns them on.
  try { localStorage.removeItem('deskNight'); } catch (e) {}

  // ---------- Proto: Sneha's AI assistant ----------
  var eyes = $('#eyes'), bubble = $('#bubble'), protoEl = $('.hs[data-act="proto"]'), bubbleT;
  var EYE = { x: 1826, y: 1186 }; // between Proto's eyes, in scene coordinates (2720 x 1680)

  // Speech bubble: text plus optional buttons [{label, yes, fn}]
  function say(html, actions, ms) {
    clearTimeout(bubbleT);
    hideTip();
    bubble.innerHTML = '<button class="bx" type="button" aria-label="Close">✕</button><span class="who">🤖 Proto</span>' + html + (actions && actions.length ? '<div class="acts"></div>' : '');
    $('.bx', bubble).addEventListener('click', hush);
    (actions || []).forEach(function (a) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = a.label;
      if (a.yes) btn.className = 'yes';
      btn.addEventListener('click', function () { hush(); a.fn(); });
      $('.acts', bubble).appendChild(btn);
    });
    placeBubble();
    bubble.classList.add('show');
    if (ms) bubbleT = setTimeout(hush, ms);
  }
  function hush() { clearTimeout(bubbleT); bubble.classList.remove('show'); }
  function placeBubble() {
    var r = protoEl.getBoundingClientRect(), bw = bubble.offsetWidth || 260, bh = bubble.offsetHeight || 80;
    var visible = r.left > 0 && r.right < innerWidth && r.bottom > 60 && r.top < innerHeight;
    if (innerWidth <= 760 || matchMedia('(max-aspect-ratio: 1/1)').matches) {
      // Phones: float over the wall near the top, so the laptop stays visible.
      var st = stage.getBoundingClientRect();
      bubble.classList.remove('flip');
      bubble.style.left = Math.max(12, (innerWidth - bw) / 2) + 'px';
      bubble.style.top = Math.max(130, st.top + 12) + 'px';
    } else if (visible) {
      // Sit to the right of Proto so the laptop stays visible; flip left only if there's no room.
      var right = r.right - r.width * .2, left = right + bw > innerWidth - 12 ? r.left + r.width * .2 - bw : right;
      bubble.classList.toggle('flip', left < right);
      bubble.style.left = Math.max(12, Math.min(left, innerWidth - bw - 12)) + 'px';
      bubble.style.top = Math.max(70, r.top - bh + r.height * .25) + 'px';
    } else {
      bubble.style.left = Math.max(12, (innerWidth - bw) / 2) + 'px';
      bubble.style.top = (innerHeight - bh - 24) + 'px';
    }
  }
  addEventListener('resize', function () { if (bubble.classList.contains('show')) placeBubble(); });
  // Clicking anywhere outside the bubble (except Proto or the lamp) closes it.
  document.addEventListener('click', function (e) {
    if (bubble.classList.contains('show') && !e.target.closest('#bubble, .hs[data-act="proto"], .hs[data-act="lamp"]')) hush();
  });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') hush(); });
  if (pan) pan.addEventListener('scroll', function () { if (bubble.classList.contains('show')) placeBubble(); }, { passive: true });

  function lightsOn(via) {
    setNight(false, true);
    say('Ahh, much better ☀️ Click anything on the desk to explore.', null, 3500);
    track('lights_answer', { answer: 'yes', via: via });
  }
  function lightsOff(via) {
    setNight(true, true);
    say('Lights off 🌙 Late-night design mode.', null, 3000);
    track('lights_answer', { answer: 'off', via: via });
  }
  var asked = false;
  function askLights(via) {
    if (!isDark()) return;
    asked = true;
    say('It\'s a bit dark in here. Should I turn on the lights?', [
      { label: 'Yes, please', yes: true, fn: function () { lightsOn(via); } },
      { label: 'Not now', fn: function () { track('lights_answer', { answer: 'no', via: via }); } }
    ]);
  }
  function protoMenu() {
    var light = isDark()
      ? { label: '💡 Turn on the lights', yes: true, fn: function () { lightsOn('menu'); } }
      : { label: '🌙 Turn off the lights', fn: function () { lightsOff('menu'); } };
    say('Hi, I\'m Proto, Sneha\'s AI assistant 👋 How can I help?', [
      light,
      { label: '💻 Show her work', fn: function () { open('work', 'proto'); } },
      { label: '☕ Contact Sneha', fn: function () { open('contact', 'proto'); } }
    ]);
    track('proto_clicked', {});
  }
  // The lamp asks Proto to handle the lights, too.
  // Clicking the lamp only ever asks about the lights.
  function lampClicked() {
    if (isDark()) { askLights('lamp'); return; }
    say('Should I turn off the lights?', [
      { label: 'Yes, turn off', yes: true, fn: function () { lightsOff('lamp'); } },
      { label: 'No, keep them on', fn: function () { track('lights_answer', { answer: 'keep_on', via: 'lamp' }); } }
    ]);
  }

  // Greet every visitor, then (on touch screens, which have no cursor) offer the lights.
  setTimeout(function () {
    if (current) return;
    say('Hi! 👋 I\'m Proto, Sneha\'s AI assistant. Welcome to her desk.', null, 4200);
    if (!matchMedia('(hover: hover)').matches) setTimeout(function () { if (!asked && !current) askLights('auto'); }, 4600);
  }, 900);

  // Moving the cursor into the dark part of the room makes Proto offer the lights.
  // Hovering in the dark part of the room for 2 seconds makes Proto offer the lights.
  var darkTimer = null;
  function cancelDark() { clearTimeout(darkTimer); darkTimer = null; }
  stage.addEventListener('pointermove', function (e) {
    if (asked || !isDark() || current || e.pointerType !== 'mouse') { cancelDark(); return; }
    var r = stage.getBoundingClientRect(), k = r.width / 2720;
    var x = (e.clientX - r.left) / k, y = (e.clientY - r.top) / k;
    var nearLamp = Math.hypot(x - 380, (y - 1050) * .8) < 520;
    if (nearLamp) { cancelDark(); return; }
    if (!darkTimer) darkTimer = setTimeout(function () {
      darkTimer = null;
      if (!asked && isDark() && !current) askLights('dark_area');
    }, 2000);
  });
  stage.addEventListener('pointerleave', cancelDark);

  // Eyes follow the cursor and blink; on touch screens Proto glances around.
  function look(dx, dy) { if (eyes) eyes.setAttribute('transform', 'translate(' + dx.toFixed(1) + ' ' + dy.toFixed(1) + ')'); }
  function lookAt(px, py) {
    var r = stage.getBoundingClientRect();
    if (!r.width) return;
    var k = r.width / 2720, ex = r.left + EYE.x * k, ey = r.top + EYE.y * k;
    var dx = px - ex, dy = py - ey, d = Math.hypot(dx, dy) || 1, m = Math.min(1, d / 260);
    look(dx / d * 10 * m, dy / d * 5.5 * m);
  }
  var lastMove = 0;
  addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse') { lastMove = Date.now(); lookAt(e.clientX, e.clientY); } }, { passive: true });
  setInterval(function () {
    if (Date.now() - lastMove < 2500) return;
    look((Math.random() * 2 - 1) * 10, (Math.random() * 2 - 1) * 5);
  }, 2200);
  (function blink() {
    setTimeout(function () {
      if (eyes && !reduce) { eyes.classList.add('blink'); setTimeout(function () { eyes.classList.remove('blink'); }, 140); }
      blink();
    }, 2500 + Math.random() * 3500);
  })();

  // ---------- Open / close sheets ----------
  var overlay = $('#overlay'), current = null, lastFocus = null, explored = false;
  function hotspotFor(id) { return $('.hs[data-open="' + id + '"]'); }
  function zoomTo(el) {
    if (!el || reduce) return;
    var r = el.getBoundingClientRect(), sr = scene.getBoundingClientRect();
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    var top = Math.max(sr.top, 0), bottom = Math.min(innerHeight, sr.bottom);
    scene.style.transformOrigin = (cx - sr.left) + 'px ' + (cy - sr.top) + 'px';
    scene.style.transform = 'translate(' + (innerWidth / 2 - cx) + 'px,' + ((top + bottom) / 2 - cy) + 'px) scale(1.8)';
  }
  function open(id, via, el) {
    var sheet = $('[data-sheet="' + id + '"]');
    if (!sheet) return;
    $$('[data-sheet]').forEach(function (s) { s.hidden = true; });
    lastFocus = lastFocus || document.activeElement;
    hideTip();
    hush();
    if (!explored) { explored = true; stage.classList.add('explored'); }
    var wasOpen = !!current;
    current = id;
    root.classList.add('zoomed');
    zoomTo(el || hotspotFor(id));
    setTimeout(function () {
      if (current !== id) return;
      overlay.hidden = false;
      sheet.hidden = false;
      sheet.scrollTop = 0;
      var x = $('.x', sheet);
      if (x) x.focus({ preventScroll: true });
    }, reduce || wasOpen ? 0 : 380);
    if (location.hash !== '#' + id) history.replaceState(null, '', '#' + id);
    document.dispatchEvent(new CustomEvent('portfolio:stop', { detail: { id: id, label: LABELS[id], index: INDEX[id], via: via } }));
  }
  function close() {
    if (!current) return;
    current = null;
    overlay.hidden = true;
    $$('[data-sheet]').forEach(function (s) { s.hidden = true; });
    root.classList.remove('zoomed');
    scene.style.transform = '';
    history.replaceState(null, '', location.pathname + location.search);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    lastFocus = null;
  }
  $$('[data-close]').forEach(function (b) { b.addEventListener('click', close); });
  addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
    if (e.key === 'Tab' && current) {
      var f = $$('a[href], button:not([disabled])', $('[data-sheet="' + current + '"]'));
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  $$('button[data-open]').forEach(function (b) {
    b.addEventListener('click', function () {
      lastFocus = b;
      var isPrint = b.classList.contains('print');
      open(b.dataset.open, isPrint ? 'object' : b.closest('.bar') ? 'header' : 'quick_nav', isPrint ? b : null);
    });
  });

  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = b.dataset.copy;
      (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).then(function () { toast('Email copied ✓'); }, function () { toast(v); });
    });
  });

  // ---------- Phones: start the pan on the laptop ----------
  var swipe = $('#swipe');
  function centerPan() {
    if (pan.scrollWidth > pan.clientWidth + 4) pan.scrollLeft = (pan.scrollWidth - pan.clientWidth) * .42;
  }
  centerPan();
  addEventListener('load', centerPan);
  ['touchstart', 'pointerdown', 'wheel'].forEach(function (ev) {
    pan.addEventListener(ev, function () { if (swipe) swipe.classList.add('gone'); }, { passive: true });
  });
  var resizeT;
  addEventListener('resize', function () {
    clearTimeout(resizeT);
    resizeT = setTimeout(function () { if (current) { scene.style.transform = ''; zoomTo(hotspotFor(current)); } }, 150);
  });

  // Deep links (#work etc.), e.g. returning from a case study.
  var STOPS = { projects: 'work', experience: 'experience', about: 'about', contact: 'contact', achievements: 'wins', certifications: 'wins', toolkit: 'tools' };
  var stopQ = (/[?&]stop=([\w-]+)/.exec(location.search) || [])[1];
  var h = STOPS[stopQ] || location.hash.slice(1);
  if (LABELS[h]) {
    var prev = reduce; reduce = true;
    open(h, 'hash');
    reduce = prev;
  }
})();
