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
    }
    h.addEventListener('click', function () { act('object'); });
    h.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act('object'); } });
    h.addEventListener('mouseenter', function () { showTip(h); });
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
    if (pan.scrollWidth > pan.clientWidth + 4) pan.scrollLeft = (pan.scrollWidth - pan.clientWidth) * .5;
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
  var h = location.hash.slice(1);
  if (LABELS[h]) {
    var prev = reduce; reduce = true;
    open(h, 'hash');
    reduce = prev;
  }
})();
