/* Sneha M — "Rally with Sneha": conversational reveal, shuttle rallies, scoreboard. */
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
  // Reveals are queued; when several are waiting (fast scrolling), play them faster.
  var backlog = 0;
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, reduceMotion ? 0 : ms / (1 + backlog * 2)); }); };
  var queue = Promise.resolve();

  /* ---------- Behance strip ---------- */
  var IMG = 'https://framerusercontent.com/images/';
  var BE = 'https://www.behance.net/gallery/';
  var shots = [
    ['Medicare', 'Case study', 'ffp4Ukth3aHcGcnmyIiGwYr7w', '174043145/MediCare-Medical-Application'],
    ['Outdoor Nuptials', 'Case study', 'CsluJ62hafQ38e07bIiangXiQPU', '174064003/Outdoor-Nuptials'],
    ['Enhancing Duolingo UX', 'Case study', 'y7uCmEya065zdaDtXqbDSMEFhqY', '176358781/Enhancing-Duolingo-UX-Case-study'],
    ['Twitter UI Evaluation', 'Heuristic evaluation', 'Als8PJKpMxirwpVgn3J0xbATM', '173895575/Twitter-UI-Evaluation-A-Heuristic-Approach-Case-Study'],
    ['The Self-Care Gap', 'Research', '2SHZeuIIlZL5ZKi7zAQE4LLUk', '198405761/Assignment-The-self-Care-Gap-(Research)'],
    ['Celebrare', 'Landing page', 'Q6ceRBqrZZUzGfN2qb08mZN4pIg', '178916893/Landing-Page-Redesign'],
    ['Thulasi Siddha Clinic', 'Landing page', '4yi6H3iBVQi9KdgrwgfSGbFv3k', '198401225/Landing-Page-Design-Thulasi-Siddha-Clinic'],
    ['PixZap', 'Landing page', 'usBLE8ZOCG6SScmkiXwCoWnaY', '177688347/Landing-page-Pop-art-style'],
    ['QuickTrek', 'Landing page', 'pU8MgmgBQOLS0FC696UJtMC8f0', '177286753/Landing-Page-QuickTrek'],
    ['Business Page', 'Landing page', 'IyzTlBxeAjSwv6lo2dUAf5pSh60', '168710363/Landing-Page'],
    ['Candyz', 'Landing page', 'pu8lQ4I9GAiqtxMijGFaqfZcgM', '168888963/Landing-page'],
    ['Daily UI', 'Landing page', 'w6cTDpBL71GT41U9LWAT6IxMaA', '173900743/Landing-PageDaily-UI'],
    ['100 Days Design Challenge', 'Daily UI', 'hvnH4R7Ys4CSuEo4wFWT3lEHI', '174372279/Daily-UI-100-Days-Designs'],
    ['Email Campaign Designs', 'Visual design', 'KCGlXql3SuNemDz0Eui8AvPfew', '174361479/Email-Campaign']
  ];
  $('#shots').innerHTML = shots.map(function (p) {
    return '<a class="shot" href="' + BE + p[3] + '" target="_blank" rel="noopener">' +
      '<div class="thumb"><img loading="lazy" src="' + IMG + p[2] + '.png?scale-down-to=512" alt="" width="170" height="128"></div>' +
      '<b>' + p[0] + '</b><small>' + p[1] + '</small></a>';
  }).join('');

  /* ---------- Theme ---------- */
  var saved = store.get('theme');
  if (saved) root.dataset.theme = saved;
  $('#themeBtn').addEventListener('click', function () {
    var dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    store.set('theme', root.dataset.theme);
  });

  /* ---------- Toast ---------- */
  var toastEl = $('#toast'), toastT = 0;
  function toast(msg, ms) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('show'); }, ms || 2600);
  }

  /* ---------- Copy email ---------- */
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = b.dataset.copy;
      var ok = function () { toast('Email copied — talk soon! ✉️'); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok, function () { toast(t); });
      else toast(t);
    });
  });

  /* ---------- Scoreboard ---------- */
  var scoreSneha = $('#scoreSneha'), scoreYou = $('#scoreYou');
  var pts = { sneha: 0, you: 0 };
  function point(who) {
    pts[who]++;
    var el = who === 'sneha' ? scoreSneha : scoreYou;
    el.textContent = pts[who];
    el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
  }

  /* ---------- Shuttle flight ---------- */
  var flyer = $('#flyer');
  function fly(fromEl, toEl) {
    if (reduceMotion || !flyer.animate || !fromEl || !toEl) return;
    var a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect();
    if (a.bottom < 0 || b.top > innerHeight || a.top > innerHeight) return;
    var x0 = a.left + 6, y0 = a.top + a.height / 2 - 17;
    var x1 = b.left + b.width / 2 - 17, y1 = b.top + b.height / 2 - 17;
    var lift = Math.max(90, Math.abs(x1 - x0) * 0.35);
    var frames = [], N = 18;
    for (var i = 0; i <= N; i++) {
      var t = i / N;
      var x = x0 + (x1 - x0) * t;
      var y = y0 + (y1 - y0) * t - lift * 4 * t * (1 - t);
      var dx = (x1 - x0), dy = (y1 - y0) - lift * 4 * (1 - 2 * t);
      var ang = Math.atan2(dy, dx) * 180 / Math.PI + 135;
      frames.push({ transform: 'translate(' + x + 'px,' + y + 'px) rotate(' + ang + 'deg) scale(' + (1 + 0.35 * Math.sin(Math.PI * t)) + ')', opacity: t > 0.94 ? 0 : 1 });
    }
    flyer.animate(frames, { duration: 650, easing: 'cubic-bezier(.3,.1,.3,1)' });
  }

  /* ---------- Conversational reveal ---------- */
  var turns = $$('.turn');
  var progressive = 'IntersectionObserver' in window && !reduceMotion;
  if (progressive) root.classList.add('js');

  function typingEl() {
    var t = document.createElement('div');
    t.className = 'typing';
    t.setAttribute('aria-hidden', 'true');
    t.innerHTML = '<i></i><i></i><i></i>';
    return t;
  }

  function play(turn, instant) {
    if (turn._played) return;
    turn._played = true;
    var ask = $('.ask-bubble', turn);
    var msgs = $('.msgs', turn);
    var items = msgs ? Array.prototype.slice.call(msgs.children) : [];
    var ava = $('.reply .ava', turn);
    var navLink = $('.ask a[href="#' + turn.id + '"]');
    if (navLink) navLink.classList.add('read');

    if (instant) {
      if (ask) { turn.classList.add('asked'); point('you'); }
      turn.classList.add('live');
      items.forEach(function () { point('sneha'); });
      return Promise.resolve();
    }

    items.forEach(function (el) { el.classList.add('wait'); });
    var seq = Promise.resolve();
    if (ask) {
      seq = seq.then(function () { turn.classList.add('asked'); point('you'); return wait(200); })
        .then(function () { fly(ask, ava); return wait(450); });
    }
    var typing = typingEl();
    return seq.then(function () {
      turn.classList.add('live');
      if (msgs) msgs.insertBefore(typing, msgs.firstChild);
      return wait(ask ? 420 : 520);
    }).then(function () {
      typing.remove();
      return items.reduce(function (p, el, i) {
        return p.then(function () {
          el.classList.remove('wait');
          point('sneha');
          return wait(i === 0 ? 160 : 140);
        });
      }, Promise.resolve());
    });
  }

  if (progressive) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        // If someone jumps or scrolls fast past it, don't make them wait.
        var instant = en.boundingClientRect.bottom < innerHeight * 0.45;
        if (instant) { play(en.target, true); return; }
        backlog++;
        queue = queue.then(function () { return play(en.target, false); }).then(function () { backlog--; });
      });
    }, { rootMargin: '0px 0px -18% 0px', threshold: 0.01 });
    turns.forEach(function (t) { io.observe(t); });
    // Anchor jumps: reveal the target and everything above it instantly.
    var revealUpTo = function (id) {
      var idx = turns.findIndex(function (t) { return t.id === id; });
      if (idx < 0) return;
      turns.slice(0, idx).forEach(function (t) { io.unobserve(t); play(t, true); });
    };
    if (location.hash) revealUpTo(location.hash.slice(1));
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (a && a.getAttribute('href').length > 1) revealUpTo(a.getAttribute('href').slice(1));
    });
  } else {
    turns.forEach(function (t) { play(t, true); });
  }

  /* ---------- Active question + progress ---------- */
  var navLinks = $$('.ask a');
  var chips = $('#composerChips');
  var questions = turns.filter(function (t) { return $('.ask-bubble', t); });
  var activeId = 'hello';

  function renderChips() {
    var idx = turns.findIndex(function (t) { return t.id === activeId; });
    var nextTurn = turns.slice(idx + 1).find(function (t) { return $('.ask-bubble', t); });
    var html = '';
    if (nextTurn) html += '<span class="hint" aria-hidden="true">ask me →</span><button type="button" data-goto="' + nextTurn.id + '">' + $('.ask-bubble', nextTurn).textContent.replace(/\s*🏸\s*/, '') + '</button>';
    if (activeId !== 'talk' && (!nextTurn || nextTurn.id !== 'talk')) html += '<button type="button" data-goto="talk">Let’s talk</button>';
    if (!nextTurn) html = '<span class="hint" aria-hidden="true">your serve →</span>';
    chips.innerHTML = html;
  }
  chips.addEventListener('click', function (e) {
    var b = e.target.closest('[data-goto]');
    if (!b) return;
    var t = document.getElementById(b.dataset.goto);
    t.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  });

  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        activeId = en.target.id;
        navLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + activeId); });
        renderChips();
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    turns.forEach(function (t) { spy.observe(t); });
  }
  renderChips();

  var bar = $('#progress'), ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(scrollY / max, 1) : 0) + ')';
      ticking = false;
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Composer: message Sneha ---------- */
  var form = $('#composer'), input = $('#msg');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text) { input.focus(); toast('Type a message first 🙂'); return; }
    var talk = $('#talk .msgs');
    var mine = document.createElement('p');
    mine.className = 'ask-bubble sent';
    mine.textContent = text;
    var thanks = document.createElement('div');
    thanks.className = 'reply';
    thanks.innerHTML = '<span class="ava xs"><img src="' + IMG + 'PUOseOOuIhQYyte1bZlqY66GBYo.png?scale-down-to=128" alt="" width="34" height="34"></span>' +
      '<div class="msgs"><p class="bubble">Thank you! 💌 Your email app should be opening with your message — just hit send there.</p></div>';
    var sign = $('#talk .signoff');
    talk.closest('.turn').insertBefore(mine, sign);
    talk.closest('.turn').insertBefore(thanks, sign);
    point('you'); point('sneha');
    mine.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    fly(mine, $('.ava', thanks));
    input.value = '';
    var subject = encodeURIComponent('Hi Sneha — from your portfolio');
    setTimeout(function () {
      location.href = 'mailto:snehauxdesigner@gmail.com?subject=' + subject + '&body=' + encodeURIComponent(text);
    }, reduceMotion ? 0 : 700);
  });

  /* ---------- Opening serve ---------- */
  $('#year').textContent = new Date().getFullYear();
  if (!location.hash) {
    setTimeout(function () { fly($('#score .shuttle-ico'), $('#hello .ava')); }, 250);
  }
})();
