/* Sneha M — v3 "Sneha's Desk": click objects on the desk to explore the portfolio. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var INK = '#241a45', PURPLE = '#7c3aed', LAV = '#a78bfa', SOFT = '#ede7fe', DEEP = '#5b4a8b';
  var CAV = "font-family=\"Caveat, cursive\" font-weight=\"700\"";
  var SANS = "font-family=\"Inter, sans-serif\"";
  var PHOTO = 'https://framerusercontent.com/images/PUOseOOuIhQYyte1bZlqY66GBYo.png?scale-down-to=256';

  // ---------- Art: each object drawn in its own local box ----------
  function card(x, y, r, fill, t1, t3) {
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + r + ')">' +
      '<rect width="164" height="98" rx="6" fill="' + fill + '" filter="url(#soft)"/>' +
      '<circle cx="82" cy="10" r="6" fill="' + PURPLE + '"/>' +
      '<text x="82" y="52" text-anchor="middle" ' + SANS + ' font-weight="800" font-size="22" fill="' + INK + '">' + t1 + '</text>' +
      '<text x="82" y="78" text-anchor="middle" ' + SANS + ' font-weight="700" font-size="14" fill="' + PURPLE + '">' + t3 + '</text></g>';
  }
  var ART = {
    board: { w: 420, h: 320, label: '📌 My journey', open: 'experience', svg:
      '<rect width="420" height="320" rx="16" fill="' + DEEP + '"/><rect x="14" y="14" width="392" height="292" rx="8" fill="#e9e1fb"/>' +
      '<text x="210" y="50" text-anchor="middle" ' + CAV + ' font-size="32" fill="' + DEEP + '">My journey</text>' +
      card(34, 76, -3, '#fff', 'GoX.ai', '2024 – now') +
      card(222, 72, 3, '#fff', 'Lucify', '2023 – 24') +
      card(34, 192, 2, '#fff', 'HCL Tech', '2021 – 23') +
      card(222, 188, -2.5, '#fff6b8', 'B.E. CSE', 'CGPA 8.25') },

    shelf: { w: 300, h: 240, label: '🏆 Wins & certificates', open: 'wins', svg:
      '<rect x="10" y="206" width="280" height="18" rx="4" fill="#3b2f63"/><path d="M40 224 v16 h10 v-16z M250 224 v16 h10 v-16z" fill="#3b2f63"/>' +
      '<path d="M38 92 h76 v22 a38 38 0 0 1 -76 0z" fill="#f5c542"/>' +
      '<path d="M38 102 q-24 0 -20 20 q4 16 24 14 M114 102 q24 0 20 20 q-4 16 -24 14" fill="none" stroke="#f5c542" stroke-width="7"/>' +
      '<rect x="68" y="150" width="16" height="22" fill="#d9a92b"/><rect x="50" y="172" width="52" height="12" rx="3" fill="#d9a92b"/><rect x="44" y="184" width="64" height="22" rx="4" fill="' + INK + '"/>' +
      '<text x="76" y="128" text-anchor="middle" font-size="28" fill="#fff8d6">★</text>' +
      '<g transform="rotate(-3 200 150)"><rect x="146" y="92" width="112" height="114" rx="4" fill="#fff" stroke="' + INK + '" stroke-width="7"/>' +
      '<text x="202" y="130" text-anchor="middle" ' + SANS + ' font-weight="800" font-size="15" fill="' + INK + '">Google UX</text>' +
      '<rect x="166" y="142" width="72" height="5" rx="2" fill="' + LAV + '"/><rect x="176" y="154" width="52" height="5" rx="2" fill="' + SOFT + '"/>' +
      '<circle cx="202" cy="182" r="11" fill="' + PURPLE + '"/></g>' +
      '' },

    poster: { w: 300, h: 120, label: '📓 How I work', open: 'process', svg:
      '<rect width="300" height="120" rx="10" fill="' + INK + '"/><rect x="8" y="8" width="284" height="104" rx="6" fill="#fff"/>' +
      '<text x="150" y="52" text-anchor="middle" ' + SANS + ' font-weight="900" font-size="21" fill="' + INK + '">Find the friction. Fix it.</text>' +
      '<text x="150" y="88" text-anchor="middle" ' + CAV + ' font-size="34" fill="' + PURPLE + '">Prove it.</text>' },

    lamp: { w: 220, h: 360, label: '💡 Lights on / off', act: 'lamp', svg:
      '<path class="cone" d="M140 112 L40 360 H360 L178 112 Z" fill="url(#coneGrad)"/>' +
      '<ellipse cx="80" cy="346" rx="64" ry="12" fill="' + INK + '"/>' +
      '<path d="M80 342 L58 212 L150 84" fill="none" stroke="' + INK + '" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle cx="58" cy="212" r="10" fill="' + LAV + '"/><circle cx="80" cy="340" r="9" fill="' + LAV + '"/>' +
      '<g transform="rotate(28 156 92)"><path d="M118 74 Q156 30 194 74 L208 114 H104 Z" fill="' + PURPLE + '"/><ellipse cx="156" cy="114" rx="22" ry="7" fill="#fff3a3"/></g>' },

    notebook: { w: 260, h: 125, label: '📓 How I work', open: 'process', svg:
      '<ellipse cx="130" cy="114" rx="122" ry="9" fill="rgba(0,0,0,.18)"/>' +
      '<path d="M24 22 L238 10 L252 100 L12 112 Z" fill="' + PURPLE + '"/><path d="M24 22 L12 112 L32 111 L43 21 Z" fill="#5b21b6"/>' +
      '<path d="M212 12 L224 102" stroke="' + INK + '" stroke-width="5"/>' +
      '<text x="68" y="74" ' + CAV + ' font-size="30" fill="#fff" transform="rotate(-3 120 70)">How I work</text>' +
      '<g transform="rotate(-6 140 108)"><rect x="40" y="104" width="190" height="9" rx="4.5" fill="' + INK + '"/><path d="M230 104 l16 4.5 l-16 4.5z" fill="#facc15"/></g>' },

    laptop: { w: 400, h: 280, label: '💻 My work', open: 'work', hint: [372, 6], svg:
      '<ellipse cx="200" cy="270" rx="192" ry="9" fill="rgba(0,0,0,.2)"/>' +
      '<rect x="22" y="0" width="356" height="234" rx="14" fill="' + INK + '"/>' +
      '<rect class="screen" x="34" y="12" width="332" height="208" rx="6"/>' +
      '<rect x="34" y="12" width="332" height="20" rx="6" fill="#ddd3f6"/>' +
      '<circle cx="47" cy="22" r="3.5" fill="' + LAV + '"/><circle cx="58" cy="22" r="3.5" fill="#c4b5fd"/><circle cx="69" cy="22" r="3.5" fill="#ddd6fe"/>' +
      '<text x="52" y="58" ' + SANS + ' font-weight="800" font-size="15" fill="' + INK + '">Selected work</text>' +
      [['6%', 'paid plan', 52], ['6.15%', 'upgrades', 156], ['500+', 'users', 260]].map(function (c) {
        return '<rect x="' + c[2] + '" y="70" width="90" height="128" rx="8" fill="#fff" stroke="#e4ddf6"/>' +
          '<text x="' + (c[2] + 45) + '" y="140" text-anchor="middle" ' + SANS + ' font-weight="900" font-size="20" fill="' + PURPLE + '">' + c[0] + '</text>' +
          '<text x="' + (c[2] + 45) + '" y="162" text-anchor="middle" ' + SANS + ' font-size="11" fill="#5b5475">' + c[1] + '</text>';
      }).join('') +
      '<path d="M0 236 H400 L388 258 Q384 266 372 266 H28 Q16 266 12 258 Z" fill="#cfc4ee"/><rect x="168" y="236" width="64" height="7" rx="3.5" fill="#b3a5e0"/>' },

    proto: { w: 110, h: 134, label: '🤖 Proto says hi', act: 'proto', svg:
      '<ellipse cx="55" cy="128" rx="40" ry="6" fill="rgba(0,0,0,.2)"/>' +
      '<g class="proto-bob"><line x1="55" y1="10" x2="55" y2="28" stroke="' + LAV + '" stroke-width="4"/><circle cx="55" cy="9" r="7" fill="#facc15"/>' +
      '<rect x="8" y="26" width="94" height="70" rx="24" fill="' + PURPLE + '"/><rect x="20" y="42" width="70" height="34" rx="16" fill="' + INK + '"/>' +
      '<circle cx="42" cy="59" r="8" fill="#fff"/><circle cx="68" cy="59" r="8" fill="#fff"/>' +
      '<circle class="pupil" cx="42" cy="59" r="4" fill="' + INK + '"/><circle class="pupil" cx="68" cy="59" r="4" fill="' + INK + '"/>' +
      '<rect x="32" y="98" width="46" height="26" rx="10" fill="' + LAV + '"/><circle cx="55" cy="111" r="5" fill="#fff"/></g>' },

    frame: { w: 112, h: 136, label: '🖼️ About me', open: 'about', svg:
      '<path d="M70 120 L92 136 H60 Z" fill="' + INK + '"/>' +
      '<rect x="3" y="3" width="106" height="126" rx="6" fill="#fff" stroke="' + INK + '" stroke-width="6"/>' +
      '<rect x="14" y="14" width="84" height="84" fill="' + SOFT + '"/>' +
      '<image href="' + PHOTO + '" x="14" y="14" width="84" height="84" preserveAspectRatio="xMidYMid slice"/>' +
      '<text x="56" y="120" text-anchor="middle" ' + CAV + ' font-size="19" fill="' + INK + '">hi, it\'s me!</text>' },

    cup: { w: 92, h: 160, label: '🖊️ My toolkit', open: 'tools', svg:
      '<line x1="30" y1="100" x2="18" y2="14" stroke="' + INK + '" stroke-width="8" stroke-linecap="round"/>' +
      '<line x1="48" y1="100" x2="52" y2="2" stroke="' + PURPLE + '" stroke-width="9" stroke-linecap="round"/><circle cx="52" cy="4" r="5" fill="' + LAV + '"/>' +
      '<line x1="64" y1="100" x2="80" y2="22" stroke="#facc15" stroke-width="8"/><path d="M76 24 l7 -12 l2 14z" fill="' + INK + '"/>' +
      '<rect x="56" y="10" width="10" height="90" rx="2" fill="#fff" stroke="' + LAV + '" stroke-width="2" transform="rotate(-14 61 55)"/>' +
      '<path d="M6 76 H86 L78 156 H14 Z" fill="' + SOFT + '" stroke="' + LAV + '" stroke-width="3"/>' +
      '<text x="46" y="126" text-anchor="middle" ' + CAV + ' font-size="24" fill="' + PURPLE + '">tools</text>' },

    mug: { w: 116, h: 118, label: '☕ Let\'s talk', open: 'contact', hint: [100, 30], svg:
      '<g class="steam" fill="none" stroke="' + LAV + '" stroke-width="4" stroke-linecap="round">' +
      '<path d="M34 30 q-8 -9 0 -16 q8 -7 0 -14"/><path d="M50 30 q-8 -9 0 -16 q8 -7 0 -14"/><path d="M66 30 q-8 -9 0 -16 q8 -7 0 -14"/></g>' +
      '<path d="M86 52 q26 0 26 22 q0 22 -26 22" fill="none" stroke="' + INK + '" stroke-width="8"/>' +
      '<rect x="12" y="36" width="76" height="78" rx="12" fill="#fff" stroke="' + INK + '" stroke-width="5"/>' +
      '<ellipse cx="50" cy="42" rx="32" ry="5" fill="#7a5233"/>' +
      '<text x="50" y="88" text-anchor="middle" ' + CAV + ' font-size="28" fill="' + PURPLE + '">hi!</text>' },

    plant: { w: 124, h: 200, label: '🌱 Still growing', act: 'plant', svg:
      '<path class="grow-leaf" data-leaf="0" d="M60 120 C 20 110 6 70 18 52 C 40 62 58 90 60 120 Z" fill="#34c38f"/>' +
      '<path class="grow-leaf" data-leaf="1" d="M62 120 C 104 108 118 70 106 50 C 84 60 66 88 62 120 Z" fill="#22a06b"/>' +
      '<path class="grow-leaf" data-leaf="2" d="M61 120 C 52 80 58 30 64 4 C 76 30 72 80 61 120 Z" fill="#16a34a"/>' +
      '<path d="M60 128 C 30 120 20 92 30 76 C 48 86 58 104 60 128 Z" fill="#22a06b"/>' +
      '<path d="M62 128 C 96 118 104 92 96 74 C 78 84 66 104 62 128 Z" fill="#34c38f"/>' +
      '<path d="M61 128 C 52 100 56 70 62 48 C 72 70 70 100 61 128 Z" fill="#2fb47c"/>' +
      '<rect x="18" y="124" width="88" height="16" rx="4" fill="' + PURPLE + '"/><path d="M24 140 H100 L92 198 H32 Z" fill="' + LAV + '"/>' }
  };

  // Placements: [x, y, scale] in each layout's coordinate space.
  var LAYOUTS = {
    wide: { w: 1600, h: 1000, deskTop: 660, deskFront: 740, place: {
      board: [120, 130, .82], shelf: [1170, 140, .95], lamp: [80, 326, 1], notebook: [320, 588, .95],
      laptop: [600, 404, 1.02], proto: [1060, 552, 1], frame: [1200, 548, 1], mug: [1340, 568, 1],
      plant: [1468, 484, 1] },
      drawers: [[80, 770, 440, 90], [80, 876, 440, 90], [1080, 770, 440, 90], [1080, 876, 440, 90]] },
    tall: { w: 800, h: 1150, deskTop: 800, deskFront: 1010, place: {
      board: [40, 70, .82], shelf: [500, 120, .85], lamp: [20, 478, .9], laptop: [210, 552, .95],
      plant: [650, 612, .94], notebook: [40, 880, .95], proto: [330, 862, 1], frame: [480, 862, 1],
      mug: [640, 878, 1] },
      drawers: [[40, 1040, 340, 80], [420, 1040, 340, 80]] }
  };

  var stage = $('#stage'), scene, layoutName;
  function build() {
    var name = matchMedia('(max-width: 760px), (max-aspect-ratio: 1/1)').matches ? 'tall' : 'wide';
    if (name === layoutName) return;
    layoutName = name;
    var L = LAYOUTS[name];
    var s = '<svg class="scene" viewBox="0 0 ' + L.w + ' ' + L.h + '" role="group" aria-label="Sneha\'s desk. Each object opens part of the portfolio.">' +
      '<defs><filter id="soft" x="-10%" y="-10%" width="120%" height="140%"><feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#1a1033" flood-opacity=".22"/></filter>' +
      '<linearGradient id="coneGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3a3" stop-opacity=".55"/><stop offset="1" stop-color="#fff3a3" stop-opacity="0"/></linearGradient></defs>';
    if (name === 'tall') {
      s +=
        '<rect y="' + L.deskTop + '" width="' + L.w + '" height="' + (L.deskFront - L.deskTop) + '" style="fill:var(--desk-top)"/>' +
        '<rect y="' + L.deskFront + '" width="' + L.w + '" height="' + (L.h - L.deskFront) + '" style="fill:var(--desk-front)"/>';
    }
    s += '<rect y="' + (L.deskFront - 3) + '" width="' + L.w + '" height="3" fill="rgba(255,255,255,.12)"/>';
    L.drawers.forEach(function (d) {
      s += '<rect class="drawer" x="' + d[0] + '" y="' + d[1] + '" width="' + d[2] + '" height="' + d[3] + '" rx="10"/>' +
        '<rect class="handle" x="' + (d[0] + d[2] / 2 - 40) + '" y="' + (d[1] + 22) + '" width="80" height="10" rx="5"/>';
    });
    var order = ['board', 'shelf', 'lamp', 'notebook', 'laptop', 'proto', 'frame', 'mug', 'plant'];
    order.forEach(function (id) {
      var a = ART[id], p = L.place[id];
      if (!p) return;
      var hint = a.hint ? '<circle class="hint-ring" cx="' + a.hint[0] + '" cy="' + a.hint[1] + '" r="9"/><circle class="hint-dot" cx="' + a.hint[0] + '" cy="' + a.hint[1] + '" r="9"/>' : '';
      s += '<g class="obj" data-id="' + id + '" tabindex="0" role="button" aria-label="' + a.label.replace(/^\S+\s/, '') + '" transform="translate(' + p[0] + ' ' + p[1] + ') scale(' + p[2] + ')">' +
        '<g class="lift"><rect class="hit" x="-6" y="-6" width="' + (a.w + 12) + '" height="' + (a.h + 12) + '" rx="12"/>' + a.svg + hint + '</g></g>';
    });
    s += '</svg>';
    stage.innerHTML = s;
    scene = $('.scene', stage);
    if (explored) stage.classList.add('explored');
    $$('.grow-leaf', stage).forEach(function (l) { if (+l.dataset.leaf < water) l.classList.add('on'); });
    bindObjects();
  }

  // ---------- Interactions ----------
  var tip = $('#tip'), bubble = $('#bubble'), toastEl = $('#toast');
  var explored = false, water = 0, protoTip = 0;
  var LABELS = { work: 'Work', process: 'How I work', experience: 'Experience', about: 'About', wins: 'Wins', contact: 'Contact' };
  var INDEX = { work: 1, process: 2, experience: 3, about: 4, wins: 5, contact: 6 };

  function bindObjects() {
    $$('.obj', stage).forEach(function (o) {
      var a = ART[o.dataset.id];
      function act(via) {
        if (a.open) open(a.open, via, o);
        else if (a.act === 'lamp') toggleNight();
        else if (a.act === 'proto') protoSays(o);
        else if (a.act === 'plant') waterPlant(o);
      }
      o.addEventListener('click', function () { act('object'); });
      o.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act('object'); } });
      o.addEventListener('mouseenter', function () { showTip(o, a.label); });
      o.addEventListener('focus', function () { showTip(o, a.label); });
      o.addEventListener('mouseleave', hideTip);
      o.addEventListener('blur', hideTip);
    });
  }
  function showTip(o, text) {
    if (root.classList.contains('zoomed')) return;
    var r = o.getBoundingClientRect();
    tip.textContent = text;
    tip.style.left = Math.min(Math.max(r.left + r.width / 2, 90), innerWidth - 90) + 'px';
    tip.style.top = Math.max(r.top - 10, 70) + 'px';
    tip.classList.add('show');
  }
  function hideTip() { tip.classList.remove('show'); }

  function toast(t) {
    toastEl.textContent = t;
    toastEl.classList.add('show');
    clearTimeout(toast.t);
    toast.t = setTimeout(function () { toastEl.classList.remove('show'); }, 2600);
  }

  function say(o, text) {
    var r = o.getBoundingClientRect();
    bubble.textContent = text;
    var left = Math.min(r.right - 10, innerWidth - 256);
    bubble.style.left = Math.max(12, left) + 'px';
    bubble.style.top = Math.max(70, r.top - 64) + 'px';
    bubble.classList.add('show');
    clearTimeout(say.t);
    say.t = setTimeout(function () { bubble.classList.remove('show'); }, 3600);
  }
  var TIPS = [
    'Hi, I\'m Proto 👋 The laptop has Sneha\'s best work.',
    'Try the lamp if it\'s too bright in here 🌙',
    'The coffee mug is the fastest way to reach Sneha ☕',
    'Water the plant. Go on, I dare you 🌱',
    'The pinboard has her whole journey 📌',
    'Her photo frame has her toolkit too 🖼️'
  ];
  function protoSays(o) {
    say(o, TIPS[protoTip++ % TIPS.length]);
    track('proto_clicked', { tip: protoTip });
  }

  var GROWTH = ['🌱 Still learning: new tools every month', '🌿 Still growing: AI-assisted workflows', '🪴 Fully grown! Certifications from IBM, Google and more', '🪴 It\'s happy. Thanks for watering!'];
  function waterPlant() {
    if (water < 3) {
      $$('.grow-leaf[data-leaf="' + water + '"]', stage).forEach(function (l) { l.classList.add('on'); });
      water++;
    }
    toast(GROWTH[Math.min(water - 1, 3)] || GROWTH[3]);
    track('plant_watered', { level: water });
  }

  function toggleNight() {
    var on = !root.hasAttribute('data-night');
    if (on) root.setAttribute('data-night', ''); else root.removeAttribute('data-night');
    try { localStorage.setItem('deskNight', on ? '1' : '0'); } catch (e) {}
    toast(on ? '🌙 Late-night design mode' : '☀️ Good morning');
    track('theme_toggled', { to: on ? 'night' : 'day' });
  }
  try { if (localStorage.getItem('deskNight') === '1') root.setAttribute('data-night', ''); } catch (e) {}

  // Proto's eyes follow the pointer
  addEventListener('pointermove', function (e) {
    $$('.pupil', stage).forEach(function (p) {
      var r = p.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      var dx = e.clientX - cx, dy = e.clientY - cy, d = Math.hypot(dx, dy) || 1, m = Math.min(3.2, d / 40);
      p.setAttribute('transform', 'translate(' + (dx / d * m).toFixed(2) + ' ' + (dy / d * m).toFixed(2) + ')');
    });
  }, { passive: true });

  // ---------- Open / close sheets ----------
  var overlay = $('#overlay'), current = null, lastFocus = null;
  function objFor(id) {
    var key = Object.keys(ART).filter(function (k) { return ART[k].open === id; })[0];
    return key ? $('.obj[data-id="' + key + '"]', stage) : null;
  }
  function zoomTo(o) {
    if (!o || reduce) return;
    var r = o.getBoundingClientRect(), sr = scene.getBoundingClientRect();
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2, s = 1.7;
    var ox = cx - sr.left, oy = cy - sr.top;
    var vh = Math.min(innerHeight, sr.bottom);
    scene.style.transformOrigin = ox + 'px ' + oy + 'px';
    scene.style.transform = 'translate(' + (innerWidth / 2 - cx) + 'px,' + (Math.max(vh / 2, sr.top + 1) - cy) + 'px) scale(' + s + ')';
  }
  function open(id, via, o) {
    var sheet = $('[data-sheet="' + id + '"]');
    if (!sheet) return;
    if (current) $$('[data-sheet]').forEach(function (s) { s.hidden = true; });
    lastFocus = lastFocus || document.activeElement;
    hideTip();
    if (!explored) { explored = true; stage.classList.add('explored'); }
    root.classList.add('zoomed');
    zoomTo(o || objFor(id));
    var delay = reduce || current ? 0 : 380;
    current = id;
    setTimeout(function () {
      if (current !== id) return;
      overlay.hidden = false;
      sheet.hidden = false;
      sheet.scrollTop = 0;
      var x = $('.x', sheet);
      if (x) x.focus({ preventScroll: true });
    }, delay);
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
      var sheet = $('[data-sheet="' + current + '"]');
      var f = $$('a[href], button:not([disabled])', sheet);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  $$('button[data-open]').forEach(function (b) {
    b.addEventListener('click', function () { lastFocus = b; open(b.dataset.open, b.closest('.bar') ? 'header' : 'quick_nav'); });
  });

  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = b.dataset.copy;
      (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).then(function () { toast('Email copied ✓'); }, function () { toast(v); });
    });
  });

  function track(n, p) { if (window.track) window.track(n, p); }

  build();
  var resizeT;
  addEventListener('resize', function () {
    clearTimeout(resizeT);
    resizeT = setTimeout(function () { var was = current; build(); if (was) zoomTo(objFor(was)); }, 150);
  });

  // Deep links (#work etc.), e.g. returning from a case study.
  var h = location.hash.slice(1);
  if (LABELS[h]) {
    var prev = reduce; reduce = true;
    open(h, 'hash');
    reduce = prev;
  }
})();
