/* ═════════════════════════════════════════
   UI — 看板 Dashboard (indices + watchlist overview)
   ═════════════════════════════════════════ */
window.GXB = window.GXB || {};
GXB.views = GXB.views || {};

GXB.views.dashboard = (function () {
  var d = GXB.data;

  var INDICES = [
    { code: 'sh000001', name: '上证指数' },
    { code: 'sz399001', name: '深证成指' },
    { code: 'sz399006', name: '创业板指' }
  ];

  function render(root, ctx) {
    var quotes = ctx.quotes || {};
    var wl = GXB.store.getWatchlist();

    var h = '';

    /* ── Index cards ── */
    h += '<div class="section-title">\u5927\u76d8\u6307\u6570</div>'; /* 大盘指数 */
    h += '<div class="index-grid">';
    INDICES.forEach(function (idx) {
      var q = quotes[idx.code];
      if (q) {
        var up = q.changePct >= 0;
        h += '<div class="card index-card">' +
          '<div class="index-name">' + idx.name + '</div>' +
          '<div class="index-price ' + (up ? 'up' : 'down') + '">' + d.fmtPrice(q.price) + '</div>' +
          '<div class="index-change ' + (up ? 'up' : 'down') + '">' + d.fmtPct(q.changePct) + '</div>' +
          '</div>';
      } else {
        h += '<div class="card index-card">' +
          '<div class="index-name">' + idx.name + '</div>' +
          '<div class="index-price">--</div>' +
          '<div class="index-change">--</div>' +
          '</div>';
      }
    });
    h += '</div>';

    /* ── Watchlist mini-strip ── */
    if (wl.length > 0) {
      h += '<div class="section-title">\u6211\u7684\u81ea\u9009\u6982\u89c8</div>'; /* 我的自选概览 */
      wl.forEach(function (s) {
        var q = quotes[s.code];
        if (q) {
          var up = q.changePct >= 0;
          h += '<div class="stock-row gxb-nav-detail" data-code="' + s.code + '">' +
            '<div class="stock-info">' +
            '<div class="stock-name">' + (q.name || s.name) + '</div>' +
            '<div class="stock-code">' + s.code + '</div>' +
            '</div>' +
            '<div class="stock-price-group">' +
            '<div class="stock-price ' + (up ? 'up' : 'down') + '">' + d.fmtPrice(q.price) + '</div>' +
            '<div class="stock-pct ' + (up ? 'up' : 'down') + '">' + d.fmtPct(q.changePct) + '</div>' +
            '</div></div>';
        } else {
          h += '<div class="stock-row gxb-nav-detail" data-code="' + s.code + '">' +
            '<div class="stock-info"><div class="stock-name">' + s.name + '</div>' +
            '<div class="stock-code">' + s.code + '</div></div>' +
            '<div class="stock-price-group"><div class="stock-price">--</div><div class="stock-pct">--</div></div></div>';
        }
      });
    } else {
      h += '<div class="empty-state"><p>\u8fd8\u6ca1\u6709\u6dfb\u52a0\u81ea\u9009\u80a1\uff0c\u53bb\u300c\u81ea\u9009\u300d\u680f\u6dfb\u52a0\u5427\uff01</p></div>'; /* 还没添加自选股，去「自选」栏添加吧！ */
    }

    root.innerHTML = h;

    /* tap mini-row → navigate to watchlist detail */
    root.querySelectorAll('.gxb-nav-detail').forEach(function (el) {
      el.addEventListener('click', function () {
        if (ctx && ctx.navigate) ctx.navigate('watchlist', this.dataset.code);
      });
    });
  }

  return { render: render };
})();
