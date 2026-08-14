/* ═════════════════════════════════════════
   Data layer — Tencent JSONP quotes/kline + RSS news
   Field indices VERIFIED against live API (2026-08-13):
     [1]=name [2]=code [3]=price [4]=prevClose [5]=open
     [31]=change [32]=changePct [33]=high [34]=low
     [37]=amount(万) [38]=turnover% [39]=PE(TTM) [30]=time
   K-line: data[code].qfqday = [[date,open,close,high,low,volume]]
   ═════════════════════════════════════════ */
window.GXB = window.GXB || {};
GXB.data = (function () {
  var store = GXB.store;

  /* ─────────────── JSONP loader ─────────────── */
  function jsonp(url, timeoutMs) {
    timeoutMs = timeoutMs || 8000;
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.charset = 'gbk';               // Tencent quotes are GBK-encoded
      var timer = setTimeout(function () {
        cleanup(); reject(new Error('timeout'));
      }, timeoutMs);
      script.onerror = function () {
        clearTimeout(timer); cleanup(); reject(new Error('network error'));
      };
      script.onload = function () {
        clearTimeout(timer); resolve(); cleanup();
      };
      script.src = url;
      document.head.appendChild(script);
      function cleanup() {
        if (script.parentNode) script.parentNode.removeChild(script);
      }
    });
  }

  /* ─────────────── Parse quote string ─────────── */
  function parseQuote(raw) {
    if (!raw) return null;
    var p = raw.split('~');
    if (p.length < 35) return null;
    var price = parseFloat(p[3]);
    if (isNaN(price)) return null;
    return {
      code: p[2], name: p[1], price: price,
      prevClose: parseFloat(p[4]) || 0,
      open: parseFloat(p[5]) || 0,
      change: parseFloat(p[31]) || 0,
      changePct: parseFloat(p[32]) || 0,
      high: parseFloat(p[33]) || 0,
      low: parseFloat(p[34]) || 0,
      amount: parseFloat(p[37]) || 0,   // 成交额(万元)
      turnover: parseFloat(p[38]) || 0,  // 换手率(%)
      pe: parseFloat(p[39]) || 0,        // 市盈率(TTM)
      time: p[30] || ''
    };
  }

  /* ─────────────── Fetch quotes ─────────────── */
  function fetchQuotes(codes) {
    if (!codes || !codes.length) return Promise.resolve({});
    var url = 'https://qt.gtimg.cn/q=' + codes.join(',') + '&_t=' + Date.now();

    return jsonp(url).then(function () {
      var map = {};
      codes.forEach(function (code) {
        var key = 'v_' + code;
        var raw = window[key];
        if (raw) {
          var q = parseQuote(raw);
          if (q) map[code] = q;
          try { delete window[key]; } catch (e) { window[key] = undefined; }
        }
      });
      return map;
    });
  }

  /* ─────────────── Fetch K-line ─────────────── */
  function fetchKline(code, count) {
    count = count || 120;
    var vn = '_gxb_k_' + code.replace(/[^a-zA-Z0-9]/g, '');
    var url = 'https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=' +
      code + ',day,,,,' + count + ',qfq&_var=' + vn;

    return jsonp(url).then(function () {
      var obj = window[vn];
      try { delete window[vn]; } catch (e) { window[vn] = undefined; }
      if (!obj || !obj.data || !obj.data[code]) return null;
      var days = obj.data[code].qfqday || obj.data[code].day;
      if (!days || !Array.isArray(days)) return null;
      var closes = [], klines = [];
      days.forEach(function (d) {
        var it = {
          date: d[0], open: +d[1], close: +d[2],
          high: +d[3], low: +d[4], volume: +d[5]
        };
        klines.push(it); closes.push(it.close);
      });
      return { klines: klines, closes: closes };
    });
  }

  /* ─────────────── News (新浪财经 JSONP，国内直连) ───────── */
  var NEWS_URL = 'https://feed.mix.sina.com.cn/api/roll/get?pageid=153&lid=2516&num=20&page=1';

  function fetchNews() {
    return new Promise(function (resolve) {
      var cbName = '_gxb_news_' + Date.now();
      var done = false;
      var script = document.createElement('script');
      var timer = setTimeout(function () { finish([]); }, 10000);

      function finish(items) {
        if (done) return;
        done = true;
        clearTimeout(timer);
        try { delete window[cbName]; } catch (e) { window[cbName] = undefined; }
        if (script.parentNode) script.parentNode.removeChild(script);
        resolve(items || []);
      }

      window[cbName] = function (payload) {
        finish(_mapSinaNews(payload));
      };
      script.onerror = function () { finish([]); };
      script.src = NEWS_URL + '&callback=' + cbName;
      document.head.appendChild(script);
    });
  }

  function _mapSinaNews(payload) {
    var data = payload && payload.result && payload.result.data;
    if (!data || !Array.isArray(data)) return [];
    return data.slice(0, 25).map(function (it) {
      return {
        title: it.title || '',
        link: it.url || '',
        pubDate: it.ctime ? _tsToISO(it.ctime) : '',
        description: (it.intro || '').slice(0, 90),
        source: '新浪财经'
      };
    });
  }

  function _tsToISO(sec) {
    var d = new Date(sec * 1000);
    return isNaN(d.getTime()) ? '' : d.toISOString();
  }

  /* ─────────────── Trading hours ────────────── */
  function isTradingNow() {
    var d = new Date(), dow = d.getDay();
    if (dow === 0 || dow === 6) return false;
    var m = d.getHours() * 60 + d.getMinutes();
    return (m >= 570 && m <= 690) || (m >= 780 && m <= 900); // 9:30-11:30, 13:00-15:00
  }

  function marketStatusText() {
    if (isTradingNow()) return '交易中';
    var d = new Date(), m = d.getHours() * 60 + d.getMinutes();
    if (m >= 555 && m < 570) return '集合竞价';
    if (m >= 690 && m < 780) return '午间休市';
    if (m >= 900) return '已收盘';
    if (m < 555) return '未开盘';
    return '休市';
  }

  /* ─────────────── Formatters ───────────────── */
  function fmtPrice(v) { return v == null ? '--' : (+v).toFixed(2); }
  function fmtPct(v) {
    if (v == null) return '--%';
    return ((v >= 0 ? '+' : '') + (+v).toFixed(2) + '%');
  }
  function fmtTime(ts) {
    if (!ts) return '';
    var s = String(ts);
    return s.length === 14 ? s.slice(8, 10) + ':' + s.slice(10, 12) + ':' + s.slice(12, 14) : s;
  }
  function fmtAmt(w) {
    if (!w || w < 1) return '--';
    if (w >= 10000) return (w / 10000).toFixed(2) + '亿';
    if (w >= 100) return (w / 100).toFixed(1) + '万';
    return w.toFixed(0) + '元';
  }

  return {
    fetchQuotes: fetchQuotes,
    fetchKline: fetchKline,
    fetchNews: fetchNews,
    isTradingNow: isTradingNow,
    marketStatusText: marketStatusText,
    fmtPrice: fmtPrice,
    fmtPct: fmtPct,
    fmtTime: fmtTime,
    fmtAmt: fmtAmt
  };
})();
