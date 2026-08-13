/* Headless smoke test for 股小白 PWA using jsdom.
   Loads the served app, captures console/page errors, and verifies
   the module wiring + tab rendering without a real browser. */
const { JSDOM } = require('jsdom');

const BASE = 'http://localhost:8137/index.html';
const errors = [];

JSDOM.fromURL(BASE, {
  runScripts: 'dangerously',
  resources: 'usable',
  pretendToBeVisual: true,
  beforeParse(window) {
    window.addEventListener('error', e => errors.push('window.error: ' + (e.error && e.error.stack || e.message)));
    const origErr = window.console.error;
    window.console.error = (...a) => { errors.push('console.error: ' + a.join(' ')); origErr.apply(window.console, a); };
    // No real ServiceWorker in jsdom
    window.AbortSignal = window.AbortSignal || {};
  }
}).then(async dom => {
  const { window } = dom;
  const { document } = window;

  // give scripts a moment to run (boot + risk modal)
  await new Promise(r => setTimeout(r, 800));

  const G = window.GXB;
  const checks = [];
  const ok = (name, cond) => checks.push((cond ? 'PASS' : 'FAIL') + '  ' + name);

  ok('GXB namespace exists', !!G);
  ok('store module', G && !!G.store);
  ok('data module', G && !!G.data);
  ok('indicators module', G && !!G.indicators);
  ok('signals module', G && !!G.signals);
  ok('views.dashboard', G && !!G.views && !!G.views.dashboard);
  ok('views.watchlist', G && G.views && !!G.views.watchlist);
  ok('views.signals', G && G.views && !!G.views.signals);
  ok('views.news', G && G.views && !!G.views.news);
  ok('views.glossary', G && G.views && !!G.views.glossary);

  // risk modal should be visible on first load (not acked)
  const overlay = document.getElementById('modal-overlay');
  ok('risk modal visible on first load', overlay && !overlay.classList.contains('hidden'));

  // dismiss risk modal by invoking the ack (simulate button click) — this
  // should transition the SAME overlay to the A2HS guide (correct UX)
  const ackBtn = document.querySelector('#modal-actions .btn-primary');
  if (ackBtn) ackBtn.dispatchEvent(new window.Event('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 200));
  const mc = document.getElementById('modal-content');
  ok('risk ack -> A2HS guide shown (same overlay)', overlay && !overlay.classList.contains('hidden') && mc.innerHTML.includes('添加到主屏幕'));

  // switch to watchlist tab
  const wlTab = document.querySelector('#tabbar .tab[data-tab="watchlist"]');
  wlTab.dispatchEvent(new window.Event('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 200));
  const view = document.getElementById('view');
  ok('watchlist renders content', view && view.innerHTML.includes('gxb-add-input'));
  ok('watchlist default has popular chips', view && view.innerHTML.includes('gxb-chip'));

  // switch to glossary tab
  const glTab = document.querySelector('#tabbar .tab[data-tab="glossary"]');
  glTab.dispatchEvent(new window.Event('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 300));
  const glHtml = document.getElementById('view').innerHTML;
  ok('glossary renders terms', glHtml.includes('term-row') || glHtml.includes('gxb-term-row'));
  ok('glossary has search input', glHtml.includes('gxb-gls-search'));

  // switch to signals tab
  const sgTab = document.querySelector('#tabbar .tab[data-tab="signals"]');
  sgTab.dispatchEvent(new window.Event('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 200));
  const sgHtml = document.getElementById('view').innerHTML;
  ok('signals renders risk banner', sgHtml.includes('风险') || sgHtml.includes('signal'));

  // switch to news tab
  const nwTab = document.querySelector('#tabbar .tab[data-tab="news"]');
  nwTab.dispatchEvent(new window.Event('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 200));
  const nwHtml = document.getElementById('view').innerHTML;
  ok('news renders lessons', nwHtml.includes('理财小课堂') || nwHtml.includes('lesson-card'));

  // signals.compute should produce a verdict with <30 closes
  if (G && G.signals) {
    const sig = G.signals.compute({ closes: [1,2,3] }, {});
    ok('signals.compute returns object', sig && typeof sig.label === 'string');
    ok('signals.compute low-data => 观望', sig && sig.label === '观望');
  }

  console.log('\n=== SMOKE TEST RESULTS ===');
  checks.forEach(c => console.log(c));
  console.log('\n=== RUNTIME ERRORS (' + errors.length + ') ===');
  errors.slice(0, 20).forEach(e => console.log(' - ' + e));

  const failed = checks.filter(c => c.startsWith('FAIL')).length;
  console.log('\nSUMMARY: ' + (checks.length - failed) + '/' + checks.length + ' passed, ' + errors.length + ' runtime errors');
  process.exit(failed > 0 || errors.length > 0 ? 1 : 0);
}).catch(e => { console.error('FATAL', e); process.exit(2); });
