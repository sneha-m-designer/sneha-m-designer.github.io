/* Sneha M — portfolio v2 motion: eyes that follow, parallax, magnetic buttons, reveals. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  $('#year').textContent = new Date().getFullYear();

  /* Split headings into words for the reveal. */
  $$('.split').forEach(function (el) {
    var d = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var parts = n.textContent.split(/(\s+)/), frag = document.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
            var w = document.createElement('span'); w.className = 'w';
            var i = document.createElement('i'); i.textContent = p; i.style.setProperty('--d', d++);
            w.appendChild(i); frag.appendChild(w);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'svg') walk(n);
      });
    })(el);
  });

  /* Scroll reveals. */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); if (e.target.classList.contains('stat')) count(e.target); } });
  }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' }) : null;
  var targets = $$('.reveal, .split, .stat');
  if (io && !reduce) targets.forEach(function (t) { io.observe(t); });
  else targets.forEach(function (t) { t.classList.add('in'); if (t.classList.contains('stat')) count(t); });
  // Hero animates right away.
  setTimeout(function () { $('.hero').classList.add('in'); $('.hero .split').classList.add('in'); $$('.hero .reveal').forEach(function (r) { r.classList.add('in'); }); }, 120);

  /* Count-up numbers. */
  function count(stat) {
    var el = $('.count', stat); if (!el || el._done) return; el._done = true;
    var to = +el.dataset.to, dec = +(el.dataset.dec || 0), suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = to.toFixed(dec) + suf; return; }
    var t0 = performance.now(), dur = 1400;
    (function step(now) {
      var p = Math.min((now - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (to * e).toFixed(dec) + suf;
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* Proto's eyes follow the cursor (or the scroll on touch screens) and blink. */
  var pupils = $$('.pupil'), eyes = $$('.eye'), bot = $('#bot'), art = $('#heroArt');
  var floats = $$('.float');
  function lookAt(x, y) {
    pupils.forEach(function (p, k) {
      var r = eyes[k].getBoundingClientRect();
      var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      var a = Math.atan2(y - cy, x - cx), dist = Math.min(Math.hypot(x - cx, y - cy) / 14, r.width * 0.26);
      p.style.transform = 'translate(' + (Math.cos(a) * dist).toFixed(1) + 'px,' + (Math.sin(a) * dist).toFixed(1) + 'px)';
    });
  }
  if (!reduce) {
    (function blink() {
      setTimeout(function () { eyes.forEach(function (e) { e.classList.remove('blink'); void e.offsetWidth; e.classList.add('blink'); }); blink(); }, 2400 + Math.random() * 3200);
    })();
  }

  /* Cursor spotlight, parallax and eye tracking share one frame loop. */
  var mx = innerWidth / 2, my = innerHeight / 3, ticking = false;
  var spot = $('#spot');
  function frame() {
    ticking = false;
    lookAt(mx, my);
    if (fine) spot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
    var nx = mx / innerWidth - 0.5, ny = my / innerHeight - 0.5;
    if (!reduce) {
      bot.style.transform = 'rotateY(' + (nx * 14).toFixed(2) + 'deg) rotateX(' + (-ny * 10).toFixed(2) + 'deg) translate(' + (nx * 10).toFixed(1) + 'px,' + (ny * 8).toFixed(1) + 'px)';
      floats.forEach(function (f) { var d = +f.dataset.depth; f.style.transform = 'translate(' + (nx * d).toFixed(1) + 'px,' + (ny * d).toFixed(1) + 'px)'; });
    }
  }
  function queue() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse' || fine) { mx = e.clientX; my = e.clientY; queue(); } }, { passive: true });
  if (!fine) {
    // On touch screens the eyes follow your scroll, glancing down at the content.
    addEventListener('scroll', function () { var r = art.getBoundingClientRect(); mx = r.left + r.width / 2 + Math.sin(scrollY / 140) * 120; my = r.bottom + 200; queue(); }, { passive: true });
    addEventListener('touchstart', function (e) { mx = e.touches[0].clientX; my = e.touches[0].clientY; queue(); }, { passive: true });
  }
  if (art) art.parentNode.style.perspective = '900px';
  queue();

  /* Magnetic buttons. */
  if (fine && !reduce) {
    $$('.magnetic').forEach(function (b) {
      var label = b.querySelector('span');
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        b.style.transform = 'translate(' + dx * 0.22 + 'px,' + dy * 0.3 + 'px)';
        if (label) label.style.transform = 'translate(' + dx * 0.12 + 'px,' + dy * 0.16 + 'px)';
      });
      b.addEventListener('pointerleave', function () {
        b.style.transition = 'transform .5s var(--spring)'; b.style.transform = '';
        if (label) { label.style.transition = 'transform .5s var(--spring)'; label.style.transform = ''; }
        setTimeout(function () { b.style.transition = ''; if (label) label.style.transition = ''; }, 500);
      });
    });
  }

  /* Scroll-driven: nav state, process line, stacking cards, active link. */
  var nav = $('#nav'), procPath = $('#procPath'), procWrap = $('.proc-wrap'), cards = $$('.cs');
  var plen = procPath ? procPath.getTotalLength() : 0;
  if (procPath) { procPath.style.strokeDasharray = plen; procPath.style.strokeDashoffset = reduce ? 0 : plen; }
  var sections = $$('main section[id]'), links = $$('.links a');
  var sTick = false;
  function onScroll() {
    sTick = false;
    nav.classList.toggle('scrolled', scrollY > 20);
    if (procPath && !reduce) {
      var r = procWrap.getBoundingClientRect(), p = Math.min(Math.max((innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35), 0), 1);
      procPath.style.strokeDashoffset = (plen * (1 - p)).toFixed(1);
    }
    if (!reduce && innerWidth > 860) {
      cards.forEach(function (c, i) {
        var next = cards[i + 1]; if (!next) { c.style.transform = ''; return; }
        var a = c.getBoundingClientRect(), b = next.getBoundingClientRect();
        var overlap = Math.min(Math.max((a.bottom - b.top) / a.height, 0), 1);
        c.style.transform = 'scale(' + (1 - overlap * 0.06).toFixed(3) + ')';
        c.style.filter = 'brightness(' + (1 - overlap * 0.35).toFixed(2) + ')';
      });
    }
    var cur = '';
    sections.forEach(function (s) { if (s.getBoundingClientRect().top < innerHeight * 0.4) cur = s.id; });
    links.forEach(function (l) { l.classList.toggle('on', l.getAttribute('href') === '#' + cur); });
  }
  addEventListener('scroll', function () { if (!sTick) { sTick = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* Copy email. */
  var toast = $('#toast'), tT = 0;
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = b.dataset.copy;
      var done = function () { toast.textContent = 'Email copied — talk soon! ✉️'; toast.classList.add('show'); clearTimeout(tT); tT = setTimeout(function () { toast.classList.remove('show'); }, 2200); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, done); else done();
    });
  });
})();
