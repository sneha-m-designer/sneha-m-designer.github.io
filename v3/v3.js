/* Sneha M — v3 "Fix This Page". Visitors find and fix 6 UX problems to reveal the portfolio. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var track = function (n, p) { if (window.track) window.track(n, p); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  var FIXES = {
    nav: { label: 'Mystery-meat navigation', chip: 'Labelled navigation',
      problem: 'Unlabelled icons and a file name for a logo. You had to guess where things were.',
      fix: 'Plain-word links, my name and role, and one clear "Let\'s talk" action.',
      why: 'If people have to guess, they leave.' },
    hero: { label: 'Jargon headline', chip: 'Clear value proposition',
      problem: 'Buzzwords, low contrast and a tiny "click here". In 5 seconds you couldn\'t tell what I do.',
      fix: 'One plain line on what I do, high contrast, two clear actions and my results up front.',
      why: 'Say what you do. Then prove it.' },
    popup: { label: 'Guilt-trip popup', chip: 'Popup removed',
      problem: 'A popup interrupted you, and its "no" button tried to make you feel bad.',
      fix: 'Removed it. Nothing here asks for something before giving something.',
      why: 'Earn attention before asking for it.' },
    about: { label: 'Wall of text', chip: 'Scannable timeline',
      problem: 'Four roles and a degree crammed into one 200-word sentence at 12px.',
      fix: 'A timeline: role, company, dates and one line each, with the current role highlighted.',
      why: 'People scan. Design for scanning.' },
    work: { label: 'Outputs without outcomes', chip: 'Results first',
      problem: '"Project 1", lorem ipsum and broken images. No problem, no result, no reason to click.',
      fix: 'Every case study now leads with the problem it solved and the measured result.',
      why: 'Show the outcome, not just the output.' },
    contact: { label: 'Too many form fields', chip: 'One-tap contact',
      problem: '10 required fields, a fax number and a captcha just to say hello.',
      fix: 'One tap to email me, a copy button, and where else to find me.',
      why: 'Every extra step is a reason to quit.' }
  };
  var ORDER = ['nav', 'hero', 'popup', 'about', 'work', 'contact'];
  var TOTAL = ORDER.length;
  var fixed = {};
  var t0 = Date.now();
  var blocks = {};
  $$('.fx').forEach(function (el) { blocks[el.dataset.fix] = el; });

  var hud = $('#hud'), pct = $('#hudPct'), bar = $('#hudBar'), msg = $('#hudMsg');
  var beforeBtn = $('#beforeBtn'), fixAllBtn = $('#fixAllBtn'), popup = blocks.popup;

  function count() { return Object.keys(fixed).length; }
  function save() { try { sessionStorage.setItem('v3fixed', JSON.stringify(Object.keys(fixed))); } catch (e) {} }

  // Pins
  ORDER.forEach(function (id, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'pin';
    b.setAttribute('aria-label', 'Fix problem ' + (i + 1) + ': ' + FIXES[id].label);
    b.innerHTML = (i + 1) + '<span class="pin-tip" aria-hidden="true">' + FIXES[id].label + '</span>';
    b.addEventListener('click', function () { fix(id, 'pin'); });
    blocks[id].appendChild(b);
  });

  // Design note left behind after each fix
  function addNote(id, open) {
    if (id === 'popup') return;
    var f = FIXES[id], n = ORDER.indexOf(id) + 1;
    var note = document.createElement('aside');
    note.className = 'note';
    note.innerHTML =
      '<button class="note-chip" type="button" aria-expanded="false"><i>✓</i><span>' + n + ' · ' + f.chip + '</span><em>▾</em></button>' +
      '<div class="note-body"><p><b>Problem</b>' + f.problem + '</p><p><b>Fix</b>' + f.fix + '</p><p class="why">' + f.why + '</p></div>';
    var chip = note.querySelector('.note-chip');
    function set(o) { note.classList.toggle('open', o); chip.setAttribute('aria-expanded', o); }
    chip.addEventListener('click', function () {
      var o = !note.classList.contains('open');
      set(o);
      if (o) track('design_note_opened', { fix: id });
    });
    var host = id === 'nav' ? blocks[id] : blocks[id].querySelector('.good');
    if (id === 'nav') host.appendChild(note); else host.insertBefore(note, host.firstChild);
    if (open) {
      set(true);
      var hovering = false;
      note.addEventListener('mouseenter', function () { hovering = true; });
      note.addEventListener('mouseleave', function () { hovering = false; });
      setTimeout(function close() { if (hovering) return setTimeout(close, 1500); set(false); }, 6500);
    }
  }

  function render(lastId) {
    var c = count(), left = TOTAL - c, p = Math.round(left / TOTAL * 100);
    pct.textContent = p + '%';
    bar.style.width = Math.max(p, 0) + '%';
    if (!left) {
      hud.classList.add('clear');
      msg.innerHTML = '<b>0% friction 🎉</b> That\'s what I do on real products. <a href="#process">See how I work ↓</a>';
      fixAllBtn.hidden = true;
      beforeBtn.hidden = false;
    } else if (lastId) {
      msg.innerHTML = '✓ Fixed: ' + FIXES[lastId].label.toLowerCase() + '. <b>' + left + '</b> to go.';
    }
    if (lastId && !reduce) { hud.classList.remove('bump'); void hud.offsetWidth; hud.classList.add('bump'); }
  }

  function fix(id, method, silent) {
    if (fixed[id]) return;
    fixed[id] = true;
    var el = blocks[id];
    if (id === 'popup') {
      if (!silent && popup.classList.contains('show')) {
        popup.classList.add('leaving');
        setTimeout(function () { popup.classList.remove('leaving', 'show'); }, 420);
      } else popup.classList.remove('show');
      if (!silent && method === 'pin') toast('✓ Popup removed. ' + FIXES.popup.why);
    }
    el.classList.add('fixed');
    if (!silent && !reduce && id !== 'popup') {
      el.classList.add('fixing');
      setTimeout(function () { el.classList.remove('fixing'); }, 900);
    }
    addNote(id, !silent && method === 'pin');
    observe(el);
    save();
    render(silent ? null : id);
    if (!silent) track('friction_fixed', { fix: id, fixed_count: count(), method: method });
    if (count() === TOTAL && !silent) {
      track('friction_cleared', { method: method, seconds: Math.round((Date.now() - t0) / 1000) });
      setTimeout(confetti, method === 'pin' ? 500 : 900);
    }
  }

  function fixAll(method, silent) {
    var todo = ORDER.filter(function (id) { return !fixed[id]; });
    if (silent || reduce) { todo.forEach(function (id) { fix(id, method, silent); }); return; }
    todo.forEach(function (id, i) { setTimeout(function () { fix(id, method); }, i * 140); });
  }
  $$('[data-fixall]').forEach(function (b) {
    b.addEventListener('click', function () {
      fixAll('fix_all');
      if (b.classList.contains('skip-link')) { var h = $('#top'); if (h) h.focus && h.scrollIntoView(); }
    });
  });

  // Before / after comparison once everything is fixed
  beforeBtn.addEventListener('click', function () {
    var on = document.body.classList.toggle('before');
    beforeBtn.setAttribute('aria-pressed', on);
    beforeBtn.textContent = on ? 'Show after' : 'Show before';
    if (on) popup.classList.add('show'); else popup.classList.remove('show');
    track('before_after_toggled', { to: on ? 'before' : 'after' });
  });

  // The popup ambushes after the first fix, or after a few seconds.
  var popTimer = setTimeout(showPopup, 7000);
  function showPopup() {
    clearTimeout(popTimer);
    if (!fixed.popup) popup.classList.add('show');
  }
  document.addEventListener('click', function (e) {
    if (e.target.closest('.pin') && !fixed.popup && count() >= 1) setTimeout(showPopup, 1100);
  });

  // Toast + copy email
  var toastEl = $('#toast'), toastT;
  function toast(t) {
    toastEl.textContent = t;
    toastEl.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('show'); }, 2600);
  }
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = b.dataset.copy;
      (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).then(function () { toast('Email copied ✓'); }, function () { toast(v); });
    });
  });

  // Confetti
  function confetti() {
    if (reduce) return;
    var box = document.createElement('div');
    box.className = 'confetti';
    var colors = ['#7c3aed', '#a78bfa', '#facc15', '#22c55e', '#38bdf8', '#f97316'];
    for (var i = 0; i < 90; i++) {
      var p = document.createElement('i');
      p.style.left = Math.random() * 100 + '%';
      p.style.background = colors[i % colors.length];
      p.style.animationDuration = 1.8 + Math.random() * 1.6 + 's';
      p.style.animationDelay = Math.random() * .5 + 's';
      p.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
      box.appendChild(p);
    }
    document.body.appendChild(box);
    setTimeout(function () { box.remove(); }, 4500);
  }

  // Gentle reveal for clean content
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: .1 }) : null;
  function observe(root) {
    var items = $$('.roles li, .cs, .proc li, .tools, .wins li, .stats li', root);
    items.forEach(function (el) {
      if (!io || el.classList.contains('in')) return;
      el.classList.add('rv');
      io.observe(el);
    });
  }
  $$('.plain').forEach(observe);

  document.getElementById('year').textContent = new Date().getFullYear();

  // Restore: returning visitors, deep links and ?fixed skip the game.
  var saved = [];
  try { saved = JSON.parse(sessionStorage.getItem('v3fixed') || '[]'); } catch (e) {}
  var deep = /^#(work|process|experience|contact)$/.test(location.hash) || /[?&]fixed=1/.test(location.search);
  if (deep) fixAll('deep_link', true);
  else saved.forEach(function (id) { if (FIXES[id]) fix(id, 'restore', true); });
  if (count()) {
    render(null);
    if (count() < TOTAL) msg.innerHTML = 'Welcome back. <b>' + (TOTAL - count()) + '</b> problems left to fix.';
  }
  if (deep && location.hash) {
    var target = document.getElementById(location.hash.slice(1));
    if (target) requestAnimationFrame(function () { target.scrollIntoView(); });
  }
})();
