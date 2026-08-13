/* ═════════════════════════════════════════
   App — bootstrap, router, polling, modals, SW
   ═════════════════════════════════════════ */
(function () {
  var store = GXB.store;
  var d = GXB.data;

  /* ─────────────── Shared State ─────────────── */
  var S = {
    tab: 'dashboard',
    detailCode: null,
    quotes: {},
    klines: {},
    liveNews: [],
    timer: null
  };

  /* ─────────────── Bootstrap ────────────────── */
  function boot() {
    regSW();
    if (!store.isRiskAcked()) riskModal();
    else if (!store.isA2HSSeen()) a2hsGuide();
    bindTabs();
    renderCurrent();
    doRefresh();
    schedulePoll();
  }

  function regSW() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    }
  }

  /* ─────────────── Modals ──────────────────── */
  function modal(html, acts) {
    var ov = document.getElementById('modal-overlay'),
      c = document.getElementById('modal-content'), a = document.getElementById('modal-actions');
    c.innerHTML = html;
    a.innerHTML = '';
    acts.forEach(function (x) {
      var b = document.createElement('button');
      b.className = 'btn ' + (x.cls || 'btn-secondary');
      b.textContent = x.label;
      b.onclick = function () { ov.classList.add('hidden'); if (x.fn) x.fn(); };
      a.appendChild(b);
    });
    ov.classList.remove('hidden');
  }

  function riskModal() {
    modal(
      '<h2>\u26a0 \u91cd\u8981\u63d0\u793a</h2>' +
      '<p>\u300c\u80a1\u5c0f\u767d\u300d\u662f\u4e00\u4e2a<b>\u5b66\u4e60\u5de5\u5177</b>\uff0c<b>\u4e0d\u662f\u6295\u8d44\u5e73\u53f0</b>\u3002</p>' +
      '<p>\u6240\u6709\u884c\u60c5\u6570\u636e\u5747\u6765\u81ea\u516c\u5f00\u514d\u8d39\u63a5\u53e3\uff0c\u53ef\u80fd\u5b58\u5728\u5ef6\u8fdf\u6216\u8bef\u5dee\u3002</p>' +
      '<p>\u6280\u672f\u4fe1\u53f7\u4ec5\u4f9b\u53c2\u8003\uff0c<b>\u4e0d\u6784\u6210\u6295\u8d44\u5efa\u8bae</b>\u3002\u771f\u5b9e\u64cd\u4f5c\u8bf7\u54a8\u8be2\u6301\u724c\u673a\u6784\u3002</p>',
      [{ label: '\u6211\u5df2\u77e5\u6089\uff0c\u4ec5\u505a\u5b66\u4e60', cls: 'btn-primary', fn: function () { store.setRiskAcked(); if (!store.isA2HSSeen()) a2hsGuide(); } }]
    );
  }

  function a2hsGuide() {
    modal(
      '<h2>\ud83d\udce6 \u6dfb\u52a0\u5230\u4e3b\u5c4f\u5e55</h2>' +
      '<div class="a2hs-guide"><ol>' +
      '<li>\u7528 Safari \u6253\u5f00\u672c\u9875\u9762</li>' +
      '<li>\u70b9\u51fb\u5e95\u90e8\u5206\u4eab\u56fe\u6807 <b>\u2197</b></li>' +
      '<li>\u9009\u62e9\u201c\u6dfb\u52a0\u5230\u4e3b\u5c4f\u5e55\u201d</li>' +
      '<li>\u70b9\u201c\u6dfb\u52a0\u201d\u5373\u53ef</li></ol>' +
      '<p style="font-size:12px;color:#999;margin-top:10px;">\u6dfb\u52a0\u540e\u53ef\u4ee5\u50cf App \u4e00\u6837\u5168\u5c4f\u6253\u5f01\uff01</p>',
      [{ label: '\u6211\u77e5\u9053\u4e86', cls: 'btn-primary', fn: function () { store.setA2HSSeen(); } },
       { label: '\u7a0d\u540e\u518d\u770b', cls: 'btn-secondary', fn: function () { store.setA2HSSeen(); } }]
    );
  }

  /* ─────────────── Tab Bar ─────────────────── */
  function bindTabs() {
    document.querySelectorAll('#tabbar .tab').forEach(function (t) {
      t.addEventListener('click', function () { go(this.dataset.tab); });
    });
  }

  function go(name) {
    S.tab = name;
    S.detailCode = null;
    document.querySelectorAll('#tabbar .tab').forEach(function (t) {
      t.classList.toggle('active', t.dataset.tab === name);
    });
    renderCurrent();
  }

  /* ─────────────── Public Navigate ─────────── */
  GXB.navigate = function (name, code) {
    if (name !== S.tab) {
      S.tab = name;
      document.querySelectorAll('#tabbar .tab').forEach(function (t) {
        t.classList.toggle('active', t.dataset.tab === name);
      });
    }
    S.detailCode = code || null;
    renderCurrent();
  };

  /* ─────────────── Render ──────────────────── */
  function renderCurrent() {
    var el = document.getElementById('view');
    var ctx = {
      quotes: S.quotes,
      klines: S.klines,
      liveNews: S.liveNews,
      detailCode: S.detailCode,
      navigate: GXB.navigate,
      refresh: doRefresh
    };
    var v = GXB.views[S.tab];
    if (v && v.render) v.render(el, ctx);
    else el.innerHTML = '<div class="empty-state"><p>\u6a21\u5757\u52a0\u8f7d\u4e2d...</p></div>';
  }

  /* ─────────────── Data Refresh ─────────────── */
  function doRefresh() {
    var wl = store.getWatchlist();
    var codes = wl.map(function (s) { return s.code; });
    var allCodes = ['sh000001', 'sz399001', 'sz399006'].concat(codes);

    return d.fetchQuotes(allCodes).then(function (q) {
      S.quotes = q || {};
      store.saveSnapshot({ quotes: S.quotes, _ts: Date.now() });
      hdr();
      renderCurrent();
      bgKline(codes);
      if (S.tab === 'news') {
        d.fetchNews().then(function (items) { S.liveNews = items || []; renderCurrent(); }).catch(function () {});
      }
    }).catch(function () {
      var sp = store.loadSnapshot();
      if (sp && sp.quotes) { S.quotes = sp.quotes; hdr(); renderCurrent(); }
    });
  }

  function bgKline(codes) {
    codes.forEach(function (code) {
      d.fetchKline(code, 120).then(function (kl) { if (kl) S.klines[code] = kl; }).catch(function () {});
    });
  }

  function hdr() {
    var e1 = document.getElementById('market-status');
    var e2 = document.getElementById('update-time');
    if (e1) e1.textContent = d.marketStatusText();
    if (e2) e2.textContent = '\u66f4\u65b0 ' + new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }

  /* ─────────────── Polling ────────────────── */
  function schedulePoll() {
    kick();
    setInterval(function () {
      if (d.isTradingNow() && !S.timer) kick();
      else if (!d.isTradingNow() && S.timer) { clearInterval(S.timer); S.timer = null; }
    }, 60000);
  }
  function kick() {
    if (S.timer) clearInterval(S.timer);
    if (d.isTradingNow()) S.timer = setInterval(doRefresh, 20000);
  }

  /* ─────────────── Start ──────────────────── */
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
