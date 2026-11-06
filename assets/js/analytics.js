/* Sneha M — PostHog analytics for the portfolio and case studies.
   Visit any page with ?me=1 to stop tracking your own browser (?me=0 to resume). */
(function () {
  'use strict';

  var KEY = 'phc_ztHsnEvLWoKAUKRe6i5vWGVHFeGXdWGpwxLpvNNQ2SKs';
  var HOST = 'https://us.i.posthog.com'; // EU projects: https://eu.i.posthog.com

  // Official PostHog loader snippet.
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

  posthog.init(KEY, {
    api_host: HOST,
    person_profiles: 'identified_only',
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: true,
    session_recording: { maskAllInputs: true }
  });

  // Exclude Sneha's own visits.
  var me = /[?&]me=([01])/.exec(location.search);
  if (me) {
    if (me[1] === '1') posthog.opt_out_capturing(); else posthog.opt_in_capturing();
    try { localStorage.setItem('ph_me', me[1]); } catch (e) {}
  }

  var page = /\/work\/([\w-]+)\.html/.exec(location.pathname);
  var pageType = page ? 'case_study' : 'portfolio';
  posthog.register({ site_section: pageType, case_study: page ? page[1] : undefined });

  function capture(name, props, leaving) { try { posthog.capture(name, props || {}, leaving ? { transport: 'sendBeacon' } : undefined); } catch (e) {} }
  window.track = capture;

  // Flight stops (fired by flight.js).
  var stopsSeen = {};
  document.addEventListener('portfolio:stop', function (e) {
    var d = e.detail;
    stopsSeen[d.id] = true;
    capture('stop_viewed', { stop: d.id, stop_label: d.label, stop_index: d.index, via: d.via, stops_seen: Object.keys(stopsSeen).length });
    if (d.id === 'contact') capture('reached_contact', { via: d.via, stops_seen: Object.keys(stopsSeen).length });
  });

  // Clicks worth naming: case studies, Behance, contact, socials, certificates, awards.
  var SOCIAL = { 'linkedin.com': 'linkedin', 'behance.net': 'behance', 'medium.com': 'medium', 'x.com': 'x', 'instagram.com': 'instagram' };
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a, button');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var text = (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80);

    if (a.classList.contains('feature')) return capture('case_study_opened', { case_study: (/work\/([\w-]+)/.exec(href) || [])[1], from: 'projects_stop' }, true);
    if (/^work\/|\/work\//.test(href) || (page && /^[\w-]+\.html$/.test(href))) return capture('case_study_opened', { case_study: (/([\w-]+)\.html/.exec(href) || [])[1], from: pageType }, true);
    if (a.classList.contains('shot')) return capture('behance_project_clicked', { project: text });
    if (a.closest('.certs')) return capture('certificate_clicked', { certificate: text });
    if (a.closest('.wins')) return capture('award_clicked', { award: text });
    if (href.indexOf('mailto:') === 0) return capture('contact_clicked', { method: 'email', placement: a.closest('.slide, section, header, nav') ? (a.closest('.slide, section, header, nav').id || pageType) : pageType });
    if (a.hasAttribute('data-copy')) return capture('contact_clicked', { method: 'copy_email' });
    for (var host in SOCIAL) {
      if (href.indexOf(host) > -1) return capture('contact_clicked', { method: SOCIAL[host], placement: a.closest('.socials') ? 'contact' : pageType });
    }
    if (a.classList.contains('back') || /index\.html\?stop=/.test(href)) return capture('back_to_flight', { from: page ? page[1] : pageType }, true);
    if (a.id === 'themeBtn') return capture('theme_toggled', { to: document.documentElement.dataset.theme === 'light' ? 'dark' : 'light' });
  }, true);

  // Experience roles a visitor opens (clicks only, not the one open by default).
  document.addEventListener('click', function (e) {
    var sum = e.target.closest('.xp-card > summary');
    if (!sum || sum.parentElement.open) return;
    var t = sum.querySelector('b');
    capture('experience_expanded', { role: t ? t.textContent : '' });
  }, true);

  // Case studies: how far people read.
  if (page) {
    var marks = [25, 50, 75, 100], sent = {}, t0 = Date.now();
    addEventListener('scroll', function () {
      var max = document.documentElement.scrollHeight - innerHeight;
      var pct = max > 0 ? Math.round(scrollY / max * 100) : 100;
      marks.forEach(function (m) {
        if (pct >= m && !sent[m]) { sent[m] = true; capture('case_study_scrolled', { depth: m, seconds: Math.round((Date.now() - t0) / 1000) }); }
      });
    }, { passive: true });
  }
})();
