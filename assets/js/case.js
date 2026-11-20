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

  // Visitors who came from v2 or v3 go back there, not to the flight.
  var from = (/\/(v\d+)\//.exec(document.referrer) || [])[1] || '';
  try {
    if (from) sessionStorage.setItem('portfolio', from);
    else if (document.referrer && !/\/work\//.test(document.referrer)) sessionStorage.setItem('portfolio', 'flight');
    from = /^v\d+$/.test(sessionStorage.getItem('portfolio') || '') ? sessionStorage.getItem('portfolio') : '';
  } catch (e) {}
  if (from) {
    $$('a[href^="../index.html"]').forEach(function (a) {
      a.setAttribute('href', '../' + from + '/#work');
      var label = a.querySelector('span');
      if (label && /flight/i.test(label.textContent)) label.textContent = 'Back to portfolio';
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
