/* ═════════════════════════════════════════
   UI — 信号 Signals (risk banner + per-stock signals)
   ═════════════════════════════════════════ */
window.GXB = window.GXB || {};
GXB.views = GXB.views || {};

GXB.views.signals = (function () {
  var d = GXB.data;
  var signals = GXB.signals;

  /* mandatory disclaimer text (per wb-finance-skill) */
  var DISCLAIMER =
    '\u514d\u8d23\u58f0\u660e\uff1a\u4ee5\u4e0a\u5185\u5bb9\u57fa\u4e8e\u516c\u5f00\u6570\u636e\u4e0e\u91cf\u5316\u5206\u6790\uff0c\u4ec5\u4f9b\u53c2\u8003\uff0c\u4e0d\u6784\u6210\u6295\u8d44\u5efa\u8bae\u3002\u5e02\u573a\u6709\u98ce\u9669\uff0c\u6295\u8d44\u9700\u8c28\u614e\u3002\u4efb\u4f55\u6295\u8d44\u51b3\u7b56\u5e94\u7ed3\u5408\u4e2a\u4eba\u98ce\u9669\u627f\u53d7\u80fd\u529b\u3001\u8d44\u91d1\u72b6\u51b5\u548c\u6295\u8d44\u76ee\u6807\u72ec\u7acb\u5224\u65ad\uff0c\u5fc5\u8981\u65f6\u54a8\u8be2\u6301\u724c\u4e13\u4e1a\u673a\u6784\u3002\u8fc7\u53bb\u8868\u73b0\u4e0d\u9884\u793a\u672a\u6765\u6536\u76ca\u3002';
  /* 免责声明：以上内容基于公开数据与量化分析，仅供参考，不构成投资建议。市场有风险，投资需谨慎。任何投资决策应结合个人风险承受能力、资金状况和投资目标独立判断，必要时咨询持牌专业机构。过往表现不预示未来收益。 */

  function render(root, ctx) {
    var wl = GXB.store.getWatchlist();
    var klines = ctx.klines || {};
    var quotes = ctx.quotes || {};
    var h = '';

    /* risk banner */
    h += '<div class="risk-banner">' +
      '<strong>\u26a0 \u98ce\u9669\u63d0\u793a</strong><br>' + /* ⚠ 风险提示 */
      '\u672c\u9875\u4fe1\u53f7\u57fa\u4e8e\u6280\u672f\u6307\u6807\u8ba1\u7b97\uff0c<strong>\u4ec5\u4f9b\u5b66\u4e60\u53c2\u8003\uff0c\u4e0d\u662f\u6295\u8d44\u5efa\u8bae</strong>\u3002' + /* 本页信号基于技术指标计算，<strong>仅供学习参考，不是投资建议</strong>。 */
      '\u771f\u5b9e\u64cd\u4f5c\u8bf7\u7ed3\u5408\u81ea\u8eab\u60c5\u51b5\u72ec\u7acb\u5224\u65ad\u3002' + /* 真实操作请结合自身情况独立判断。 */
      '</div>';

    if (wl.length === 0) {
      h += '<div class="empty-state"><p>\u8bf7\u5148\u5728\u300c\u81ea\u9009\u300d\u680f\u6dfb\u52a0\u80a1\u7968\uff0c\u5373\u53ef\u5728\u6b64\u67e5\u770b\u4fe1\u53f7</p></div>'; /* 请先在「自选」栏添加股票，即可在此查看信号 */
      root.innerHTML = h;
      return;
    }

    /* per-stock signals */
    wl.forEach(function (s) {
      var q = quotes[s.code];
      var kl = klines[s.code];
      var sig = (kl && kl.closes) ? signals.compute(kl, q) : null;

      h += '<div class="card">';
      h += '<div class="card-header">';
      h += '<h2>' + (q ? q.name : s.name) + '</h2>';
      h += '<span class="stock-code">' + s.code + '</span>';
      if (sig) {
        h += '<span class="signal-badge signal-' + sig.tone + '">' + sig.label + '</span>';
      } else {
        h += '<span class="signal-badge signal-neutral">\u89c2\u671b</span>'; /* 观望 */
      }
      h += '</div>';

      if (sig && sig.reasons.length) {
        h += '<ul style="padding-left:18px;font-size:13px;color:#555;line-height:1.75;">';
        sig.reasons.slice(0, 3).forEach(function (r) { h += '<li>' + r + '</li>'; });
        h += '</ul>';
      } else if (!kl || !kl.closes) {
        h += '<p style="font-size:13px;color:#999;">\u6570\u636e\u52a0\u8f7d\u4e2d\uff0c\u8bf7\u7a0d\u5019...</p>'; /* 数据加载中，请稍候... */
      }

      /* price reference */
      if (q) {
        var up = q.changePct >= 0;
        h += '<div style="margin-top:8px;display:flex;justify-content:space-between;font-size:13px;">';
        h += '<span>\u73b0\u4ef7 <b class="' + (up ? 'up' : 'down') + '">' + d.fmtPrice(q.price) + '</b></span>'; /* 现价 */
        h += '<span class="' + (up ? 'up' : 'down') + '">' + d.fmtPct(q.changePct) + '</span>';
        h += '</div>';
      }
      h += '</div>';
    });

    /* disclaimer footer */
    h += '<div class="disclaimer-footer">' + DISCLAIMER + '</div>';

    root.innerHTML = h;
  }

  return { render: render };
})();
