/* ═════════════════════════════════════════
   UI — 自选 Watchlist (list / add / detail + sparkline)
   ═════════════════════════════════════════ */
window.GXB = window.GXB || {};
GXB.views = GXB.views || {};

GXB.views.watchlist = (function () {
  var d = GXB.data;
  var store = GXB.store;

  /* Load quick-add chips from data/popular.json (single source of truth).
     Falls back to a curated list if the file can't be read. */
  function loadPopular() {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', 'data/popular.json', false);
      xhr.send();
      if (xhr.status === 200) {
        var arr = JSON.parse(xhr.responseText);
        if (Array.isArray(arr) && arr.length) return arr;
      }
    } catch (e) { /* fall through to fallback */ }
    return [
      { c: '600519', n: '贵州茅台' }, { c: '000001', n: '平安银行' },
      { c: '300750', n: '宁德时代' }, { c: '600036', n: '招商银行' },
      { c: '000858', n: '五粮液' }, { c: '601318', n: '中国平安' },
      { c: '600276', n: '恒瑞医药' }, { c: '002475', n: '立讯精密' }
    ];
  }

  /* ─────────────── List View ─────────────── */
  function renderList(root, ctx) {
    var wl = store.getWatchlist();
    var quotes = ctx.quotes || {};
    var h = '';

    /* search & add */
    h += '<div class="card">';
    h += '<div class="search-bar">' +
      '<input class="search-input gxb-add-input" type="text" placeholder="\u8f93\u51656\u4f4d\u80a1\u7968\u4ee3\u7801\uff0c\u56de\u8f66\u6dfb\u52a0" maxlength="6" inputmode="numeric" />' + /* 输入6位股票代码，回车添加 */
      '<button class="search-btn gxb-add-btn">\u6dfb\u52a0</button></div>'; /* 添加 */

    /* popular quick-add */
    h += '<div style="margin-top:10px;font-size:12px;color:#999;">\u70ed\u95e8\u5feb\u6377\u6dfb\u52a0\uff1a</div>'; /* 热门快捷添加： */
    h += '<div class="chip-list">';
    var POPULAR = loadPopular();
    POPULAR.forEach(function (p) {
      h += '<span class="chip gxb-chip" data-code="' + p.c + '" data-name="' + p.n + '">' + p.n + '(' + p.c + ')</span>';
    });
    h += '</div></div>';

    /* stock list */
    if (wl.length > 0) {
      wl.forEach(function (s) {
        var q = quotes[s.code];
        if (q) {
          var up = q.changePct >= 0;
          h += '<div class="stock-row gxb-row-detail" data-code="' + s.code + '">' +
            '<div class="stock-info"><div class="stock-name">' + (q.name || s.name) + '</div>' +
            '<div class="stock-code">' + s.code + '</div></div>' +
            '<div class="stock-price-group">' +
            '<div class="stock-price ' + (up ? 'up' : 'down') + '">' + d.fmtPrice(q.price) + '</div>' +
            '<div class="stock-pct ' + (up ? 'up' : 'down') + '">' + d.fmtPct(q.changePct) + '</div>' +
            '</div></div>';
        } else {
          h += '<div class="stock-row gxb-row-detail" data-code="' + s.code + '">' +
            '<div class="stock-info"><div class="stock-name">' + s.name + '</div>' +
            '<div class="stock-code">' + s.code + '</div></div>' +
            '<div class="stock-price-group"><div class="stock-price">--</div><div class="stock-pct">--</div></div></div>';
        }
      });
    } else {
      h += '<div class="empty-state"><p>\u8fd8\u6ca1\u6709\u81ea\u9009\u80a1\uff0c\u8f93\u5166\u4ee3\u7801\u6216\u70b9\u51fb\u70ed\u95e8\u6dfb\u52a0</p></div>'; /* 还没有自选股，输入代码或点击热门添加 */
    }

    root.innerHTML = h;

    /* bind events */
    root.querySelector('.gxb-add-btn').addEventListener('click', function () {
      var val = (root.querySelector('.gxb-add-input').value || '').trim().replace(/\D/g, '');
      if (!val || val.length !== 6) return;
      var prefix = val.startsWith('6') || val.startsWith('9') ? 'sh' : 'sz';
      var fullCode = prefix + val;
      if (store.addStock(fullCode, '')) {
        root.querySelector('.gxb-add-input').value = '';
        if (ctx.refresh) ctx.refresh();
      }
    });

    root.querySelector('.gxb-add-input').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') root.querySelector('.gxb-add-btn').click();
    });

    root.querySelectorAll('.gxb-chip').forEach(function (el) {
      el.addEventListener('click', function () {
        var prefix = this.dataset.code.startsWith('6') ? 'sh' : 'sz';
        if (store.addStock(prefix + this.dataset.code, this.dataset.name)) {
          if (ctx.refresh) ctx.refresh();
        }
      });
    });

    root.querySelectorAll('.gxb-row-detail').forEach(function (el) {
      el.addEventListener('click', function () {
        if (ctx.navigate) ctx.navigate('watchlist', this.dataset.code);
      });
    });
  }

  /* ─────────────── Detail View ────────────── */
  function renderDetail(root, ctx, code) {
    var q = (ctx.quotes || {})[code];
    var kl = (ctx.klines || {})[code];

    if (!q) {
      root.innerHTML = '<div class="empty-state"><p>\u65e0\u6cd5\u83b7\u53d6\u8be5\u80a1\u6570\u636e</p>' + /* 无法获取该股数据 */
        '<button class="btn btn-primary gxb-back" style="margin-top:12px">\u8fd4\u56de</button></div>'; /* 返回 */
      root.querySelector('.gxb-back').addEventListener('click', function () {
        if (ctx.navigate) ctx.navigate('watchlist');
      });
      return;
    }

    var up = q.changePct >= 0;
    var sig = kl ? GXB.signals.compute(kl, q) : null;

    var h = '';
    h += '<button class="back-btn gxb-back">\u2190 \u8fd4\u56de\u81ea\u9009\u5217\u8868</button>'; /* ← 返回自选列表 */

    /* quote card */
    h += '<div class="card">';
    h += '<div class="card-header"><h2>' + q.name + '</h2><span class="stock-code">' + code + '</span></div>';
    h += '<div style="display:flex;align-items:baseline;gap:12px;margin:8px 0;">';
    h += '<span class="stock-price" style="font-size:28px;' + (up ? 'color:var(--c-red)' : 'color:var(--c-green)') + '">' + d.fmtPrice(q.price) + '</span>';
    h += '<span class="stock-pct ' + (up ? 'up' : 'down') + '" style="font-size:18px;">' + d.fmtPct(q.changePct) + '</span>';
    h += '</div>';
    h += '<div style="display:flex;gap:16px;flex-wrap:wrap;font-size:13px;color:#666;">';
    h += '<span>\u4eca\u5f00 ' + d.fmtPrice(q.open) + '</span>'; /* 今开 */
    h += '<span>\u6700\u9ad8 ' + d.fmtPrice(q.high) + '</span>'; /* 最高 */
    h += '<span>\u6700\u4f4e ' + d.fmtPrice(q.low) + '</span>'; /* 最低 */
    h += '<span>\u6210\u4ea4\u989d ' + d.fmtAmt(q.amount) + '</span>'; /* 成交额 */
    if (q.pe) h += '<span>PE(TTM) ' + q.pe.toFixed(1) + '</span>';
    if (q.turnover) h += '<span>\u6362\u624b ' + q.turnover.toFixed(2) + '%</span>'; /* 换手 */
    h += '</div></div>';

    /* sparkline */
    if (kl && kl.klines && kl.klines.length > 0) {
      h += '<div class="sparkline-wrap"><canvas id="gxb-spark"></canvas></div>';
    }

    /* signal summary */
    if (sig) {
      h += '<div class="card">';
      h += '<div class="card-header"><h2>\u6280\u672f\u4fe1\u53f7</h2>' + /* 技术信号 */
        '<span class="signal-badge signal-' + sig.tone + '">' + sig.label + '</span></div>';
      h += '<ul style="padding-left:18px;font-size:13px;color:#555;line-height:1.8;">';
      sig.reasons.forEach(function (r) { h += '<li>' + r + '</li>'; });
      h += '</ul>';
      if (sig.metrics.rsi) h += '<p style="margin-top:8px;font-size:12px;color:#888;">RSI=' + sig.metrics.rsi + ' | MA5=' + sig.metrics.ma5 + ' | MA20=' + sig.metrics.ma20 + (sig.metrics.macdHist != null ? ' | MACD\u67f1=' + sig.metrics.macdHist : '') + '</p>';
      h += '</div>';
    }

    /* delete button */
    h += '<div style="margin-top:10px;text-align:center;">';
    h += '<button class="btn btn-secondary gxb-del-btn" style="background:#fee;color:#c00;border-color:#fcc;">\u2261 \u4ece\u81ea\u9009\u79fb\u9664</button>'; /* ≡ 从自选移除 */
    h += '</div>';

    root.innerHTML = h;

    /* draw sparkline after DOM insert */
    if (kl && kl.klines && kl.klines.length > 0) {
      setTimeout(function () {
        var cvs = document.getElementById('gxb-spark');
        if (cvs) drawSpark(cvs, kl.klines, up);
      }, 50);
    }

    root.querySelector('.gxb-back').addEventListener('click', function () {
      if (ctx.navigate) ctx.navigate('watchlist');
    });
    root.querySelector('.gxb-del-btn').addEventListener('click', function () {
      store.removeStock(code);
      if (ctx.navigate) ctx.navigate('watchlist');
    });
  }

  /* ─────────────── Sparkline Canvas ───────── */
  function drawSpark(canvas, klines, isUp) {
    var W = canvas.parentElement.clientWidth || 340;
    var H = 120;
    canvas.width = W * (devicePixelRatio || 1);
    canvas.height = H * (devicePixelRatio || 1);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    var ctx = canvas.getContext('2d');
    ctx.scale(devicePixelRatio || 1, devicePixelRatio || 1);

    var closes = klines.map(function (k) { return k.close; });
    var lo = Math.min.apply(null, closes), hi = Math.max.apply(null, closes);
    var pad = (hi - lo) * 0.05 || 1;
    lo -= pad; hi += pad;

    var color = isUp ? '#e23b3b' : '#00b36b';
    var fill = isUp ? 'rgba(226,59,59,0.12)' : 'rgba(0,179,107,0.12)';

    /* area fill */
    ctx.beginPath();
    var stepX = W / (closes.length - 1 || 1);
    closes.forEach(function (v, i) {
      var x = i * stepX, y = H - ((v - lo) / (hi - lo)) * (H - 16) - 8;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.lineTo(W, H); ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();

    /* line */
    ctx.beginPath();
    closes.forEach(function (v, i) {
      var x = i * stepX, y = H - ((v - lo) / (hi - lo)) * (H - 16) - 8;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    /* last dot */
    var lx = (closes.length - 1) * stepX;
    var ly = H - ((closes[closes.length - 1] - lo) / (hi - lo)) * (H - 16) - 8;
    ctx.beginPath(); ctx.arc(lx, ly, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.fill();
  }

  /* ─────────────── Public API ─────────────── */
  function render(root, ctx) {
    if (ctx.detailCode) {
      renderDetail(root, ctx, ctx.detailCode);
    } else {
      renderList(root, ctx);
    }
  }

  return { render: render, drawSparkline: drawSpark };
})();
