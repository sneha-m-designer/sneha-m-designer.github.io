/* Sneha M — case study pages: theme, reading progress, reveals, screenshot slots. */
(function () {
  'use strict';
  var root = document.documentElement;
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  try { var t = localStorage.getItem('theme'); if (t) root.dataset.theme = t; } catch (e) {}
  document.getElementById('themeBtn').addEventListener('click', function () {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
  });
  document.getElementById('year').textContent = new Date().getFullYear();

  // Back link: return visitors to the portfolio version they came from (the desk is the default).
  var ref = document.referrer || '';
  var from = /\/flight\//.test(ref) ? 'flight' : /\/v2\//.test(ref) ? 'v2' : '';
  try {
    if (from) sessionStorage.setItem('portfolio', from);
    else if (ref && !/\/work\//.test(ref)) sessionStorage.setItem('portfolio', 'desk');
    from = sessionStorage.getItem('portfolio') || '';
  } catch (e) {}
  var BACK = { flight: ['../flight/?stop=projects', 'Back to the flight'], v2: ['../v2/#work', 'Back to portfolio'] };
  if (BACK[from]) {
    $$('a.back').forEach(function (a) {
      a.setAttribute('href', BACK[from][0]);
      var label = a.querySelector('span');
      if (label) label.textContent = BACK[from][1];
    });
  }

  // Screenshot slots: show the image once it exists at its path, otherwise keep the placeholder.
  $$('.shot[data-img]').forEach(function (fig) {
    var img = fig.querySelector('img');
    img.addEventListener('load', function () { fig.classList.add('has-img'); });
    img.src = fig.dataset.img;
  });

  var bar = document.getElementById('readBar'), ticking = false;
  addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(scrollY / max, 1) : 0) + ')';
      ticking = false;
    });
  }, { passive: true });

  var targets = $$('.reveal, .stat');
  if (!('IntersectionObserver' in window)) { targets.forEach(function (el) { el.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  targets.forEach(function (el) { io.observe(el); });
})();
