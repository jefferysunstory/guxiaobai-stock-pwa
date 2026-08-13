/* ═════════════════════════════════════════
   UI — 资讯 News (evergreen lessons + live headlines)
   ═════════════════════════════════════════ */
window.GXB = window.GXB || {};
GXB.views = GXB.views || {};

GXB.views.news = (function () {

  /* Evergreen educational cards (always available, offline-safe) */
  var LESSONS = [
    {
      t: '\u4ec0\u4e48\u662f\u201c\u6da8\u505c\u201d\u548c\u201c\u8dcc\u505c\u201d\uff1f', /* 什么是"涨停"和"跌停"？ */
      d: 'A\u80a1\u6bcf\u65e5\u6da8\u8dcc\u5e45\u5ea6\u4e0d\u8d85\u8fc710%\uff0c\u5230\u8fbe\u6da8\u505c/\u8dcc\u505c\u540e\u8be5\u80a1\u5f53\u5929\u505c\u6b62\u4ea4\u6613\u3002ST/*ST\u80a1\u4e3a5%\u3002\u6da8\u505c\u901a\u5e38\u8868\u793a\u5e02\u573a\u70ed\u60c5\u9ad8\uff0c\u4f46\u4e5f\u53ef\u80fd\u662f\u62a4\u76d8\u8d44\u91d1\u5927\u5e45\u62c9\u5347\u3002'
      /* A股每日涨跌幅度不超过10%，达到涨停/跌停后该股当天停止交易。ST/*ST股为5%。涨停通常表示市场热情高，但也可能是护盘资金大幅拉升。 */
    },
    {
      t: '\u201cT+1\u201d\u4ea4\u6613\u89c4\u5219\u662f\u600e\u4e48\u56de\u4e8b\uff1f',
      d: '\u4eca\u5929\u4e70\u5165\u7684\u80a1\u7968\uff0c\u8981\u5230\u660e\u5929\u624d\u80fd\u5356\u51fa\u3002\u8fd9\u662f\u4e2d\u56fdA\u80a1\u7684\u57fa\u672c\u89c4\u5219\uff0c\u9632\u6b62\u77ed\u7ebf\u517b\u6b8a\u548c\u8fc7\u5ea6\u6295\u673a\u3002\u521a\u5165\u5e02\u7684\u5c0f\u767d\u5efa\u8bae\u5148\u4e86\u89e3\u8fd9\u4e00\u89c4\u5219\uff0c\u907f\u514d\u64cd\u4f5c\u9519\u8bef\u3002'
      /* 今天买入的股票，要到明天才能卖出。这是中国A股的基本规则，防止短线炒作和过度投机。刚入市的小白建议先了解这一规则，避免操作错误。 */
    },
    {
      t: '\u5e02\u76c8\u7387(PE)\u662f\u4ec0\u4e48\uff1f\u600e\u6837\u770b\u8d35\u4e0d\u8d35\uff1f',
      d: 'PE = \u80a1\u4ef7 \u00f7 \u6bcf\u80a1\u6536\u76ca\u3002PE=15\u610f\u5473\u7740\u6309\u5f53\u524d\u5229\u6da6\u8ba1\u7b97\uff0c15\u5e74\u56de\u672c\u3002\u4e00\u822c\u6765\u8bf4\uff0cPE\u8d8a\u4f4e\u8d8a\u201c\u4fbf\u5b9c\u201d\uff0c\u4f46\u8981\u7ed3\u5408\u884c\u4e1a\u589e\u901f\u770b\u3002\u9ad8\u589e\u957f+低PE=\u53ef\u80fd\u88ab\u4f4e\u4f30\u3002'
      /* PE = 股价 ÷ 每股收益。PE=15意味着按当前利润计算，15年回本。一般来说，PE越低越"便宜"，但要结合行业增速看。高增长+低PE=可能被低估。 */
    },
    {
      t: '\u5206\u6563\u6295\u8d44\u4e3a\u4ec0\u4e48\u91cd\u8981\uff1f',
      d: '\u201c\u4e0d\u8981\u628a\u9e21\u86cb\u653e\u5728\u4e00\u4e2a\u7bee\u5b50\u91cc\u201d\u3002\u5206\u6563\u6295\u8d44\u5c31\u662f\u4e0d\u8981\u628a\u94b1\u5168\u90e8\u4e70\u4e00\u53ea\u80a1\uff0c\u800c\u662f\u5206\u914d\u5230\u591a\u53ea\u4e0d\u540c\u7684\u80a1\u7968\u6216\u8d44\u4ea7\u54c1\u4e0a\uff0c\u964d\u4f4e\u5355\u4e00\u6295\u8d44\u7684\u98ce\u9669\u3002\u5bf9\u5c0f\u767d\u6765\u8bf4\uff0c\u6301\u67092-5\u53ea\u5206\u6563\u7684\u7ec4\u5408\u662f\u5e38\u89c1\u9009\u62e9\u3002'
      /* "不要把鸡蛋放在一个篮子里"。分散投资就是不要把钱全买一只股票，而是分配到多只不同的股票或资产上，降低单一投资的风险。对小白来说，持有2-5只分散的组合是常见选择。 */
    },
    {
      t: '\u725b\u5e02\u3001\u718a\u5e02\u3001\u970d\u5e02\u662f\u4ec0\u4e48\uff1f',
      d: '\u725b\u5e02=\u5927\u5e42\u4e0a\u6da8\u7684\u5e02\u573a\uff0c\u5927\u90e8\u5206\u80a1\u7968\u90fd\u5728\u6da8\uff0c\u4eba\u4eba\u90fd\u60f3\u8fdb\u573a\u3002\u718a\u5e02=\u6301\u7eed\u4e0b\u8dcc\u7684\u5e02\u573a\uff0c\u4fe1\u5fc3\u8584\u5f31\u3002\u970d\u5e02=\u4e0a\u4e0b\u5e45\u5ea6\u5267\u70c8\u632f\u8361\u3002\u5c0f\u767d\u5efa\u8bae\uff1a\u725b\u5e02\u4e2d\u540e\u671f\u8981\u8c28\u61d2\u8ffd\u9ad8\uff0c\u718a\u5e02\u5e95\u90e8\u53ef\u80fd\u8fd8\u672a\u5230\uff0c\u970d\u5e02\u5219\u66f4\u96be\u64cd\u4f5c\u3002'
      /* 牛市=大幅上涨的市场，大部分股票都在涨，人人都想进场。熊市=持续下跌的市场，信心薄弱。震荡市=上下幅度剧烈振荡。小白建议：牛市中后期要谨慎追高，熊市底部可能还未到，震荡市则更难操作。 */
    },
    {
      t: '\u600e\u6837\u770b\u61c2\u8d22\u62a5\u4e2d\u7684\u201c\u5f52\u6bcd\u51c0\u5229\u6da6\u201d\uff1f',
      d: '\u5f52\u6bcd\u51c0\u5229\u6da6=\u516c\u53f8\u5c06\u5229\u6da6\u6309\u80a1\u4efd\u5206\u7ed9\u80a1\u4e1c\u7684\u94b1\u3002\u5982\u679c\u4e00\u5bb6\u516c\u53f8\u8d5a\u4e861\u4ebf\uff0c\u5206\u7ed9\u4f601\u5143/\u80a1\uff0c\u4f60\u7684\u80a1\u606f\u7387\u5c31\u662f10%\u3002\u8fd9\u662f\u5224\u65ad\u4e00\u53ea\u80a1\u662f\u5426\u503c\u5f97\u6295\u8d44\u7684\u91cd\u8981\u6307\u6807\u4e4b\u4e00\uff0c\u4f46\u8981\u6ce8\u610f\u516c\u53f8\u662f\u5426\u771f\u6b63\u7206\u53d1\u8fd9\u4e9b\u5229\u6da6\u3002'
      /* 归母净利润=公司将利润按股份分给股东的钱。如果一家公司赚了1亿，分给你1元/股，你的股息率就是10%。这是判断一只股是否值得投资的重要指标之一，但要注意公司是否真正爆发这些利润。 */
    },
    {
      t: '\u524d\u590d\u6743\u3001\u540e\u590d\u6743\u662f\u4ec0\u4e48\uff1f\u4e3a\u4ec0\u4e48\u8981\u590d\u6743\uff1f',
      d: '\u80a1\u7968\u5386\u53f2\u4ef7\u683c\u4f1a\u56e0\u4e3a\u914d\u80a1\u3001\u9001\u80a1\u800c\u53d8\u5316\u3002\u524d\u590d\u6743=\u628a\u5386\u53f2\u4ef7\u683c\u8c03\u6574\u5230\u5f53\u524d\u4ef7\u683c\u6c34\u5e73\uff0c\u770b\u6da8\u8dcc\u3002\u540e\u590d\u6743=\u628a\u5f53\u524d\u4ef7\u683c\u8c03\u6574\u5230\u5386\u53f2\u4ef7\u683c\u6c34\u5e73\uff0c\u770b\u957f\u671f\u8d8b\u52bf\u3002\u5c0f\u767d\u770bK\u7ebf\u65f6\u9ed8\u8ba4\u7528\u524d\u590d\u6743\uff0c\u66f4\u5bb9\u6613\u770b\u51fa\u8d8a\u52bf\u3002'
      /* 股票历史价格会因配股、送股而变化。前复权=把历史价格调整到当前价格水平，看涨跌。后复权=把当前价格调整到历史价格水平，看长期趋势。小白看K线时默认用前复权，更容易看出趋势。 */
    },
    {
      t: '\u6b63\u5e38\u7684\u4ea4\u6613\u65f6\u95f4\u662f\u51e0\u70b9\u5230\u51e0\u70b9\uff1f',
      d: 'A\u80a1\u4ea4\u6613\u65f5\uff1a\u5468\u4e00\u81f3\u5468\u4e94\uff08\u56fd\u5b9a\u5047\u671f\u9664\u5916\uff09\u3002' +
      '\u4e0a\u5348\uff1a9:15-11:30\uff08\u5176\u4e2d9:15-9:25\u4e3a\u96c6\u5408\u7ade\u4ef7\uff09\u3002' +
      '\u5348\u95f4\u4f11\u5e02\uff1a11:30-13:00\u3002' +
      '\u4e0b\u5348\uff1a13:00-15:00\u3002' +
      '\u5c0f\u767d\u5efa\u8bae\u5728\u76d8\u4e2d\u64cd\u4f5c\uff0c\u907f\u514d\u5728\u975e\u4ea4\u6613\u65f6\u95f4\u4e0b\u5355\u591a\u4ed6\u4eec\u7684\u6307\u4ee4\u65e0\u6cd5\u6210\u4ea4\u3002'
      /* A股交易日：周一至周五（国定假期除外）。上午：9:15-11:30（其中9:30-9:25为集合竞价）。午间休市：11:30-13:00。下午：13:00-15:00。小白建议在盘中操作，避免在非交易时间下单导致指令无法成交。 */
    }
  ];

  function render(root, ctx) {
    var h = '';

    /* ── Section A: 理财小课堂 (evergreen) ── */
    h += '<div class="section-title">\ud83c\udf93 \u7406\u8d22\u5c0f\u8bfe\u5802</div>'; /* 📚 理财小课堂 */
    LESSONS.forEach(function (l) {
      h += '<div class="lesson-card"><h3>' + l.t + '</h3><p>' + l.d + '</p></div>';
    });

    /* ── Section B: 市场快讯 (live, best-effort) ── */
    h += '<div class="section-title">\ud83d\udcf0 \u5e02\u573a\u5feb\u8baf<span id="gxb-news-status" style="font-size:11px;color:#aaa;font-weight:400;margin-left:6px;"></span></div>'; /* 📰 市场快讯 */

    var liveNews = ctx.liveNews || [];
    if (liveNews.length > 0) {
      liveNews.forEach(function (item) {
        h += '<div class="news-item">';
        h += '<div class="news-title">' + escHtml(item.title) + '</div>';
        h += '<div class="news-meta">';
        h += '<span>' + escHtml(item.source || '') + '</span>';
        if (item.pubDate) h += '<span>' + item.pubDate.slice(0, 10) + '</span>';
        h += '</div>';
        if (item.link) {
          h += '<a href="' + item.link + '" target="_blank" rel="noopener" style="font-size:12px;color:var(--c-blue);text-decoration:none;display:inline-block;margin-top:4px;">\u9605\u8bfb\u539f\u6587 &rarr;</a>'; /* 阅读原文 → */
        }
        h += '</div>';
      });
    } else {
      h += '<p style="font-size:13px;color:#999;padding:12px 0;" id="gxb-news-loading">\u6b63\u5728\u83b7\u53d6\u8d44\u8baf...</p>'; /* 正在获取资讯... */
    }

    root.innerHTML = h;

    /* If no live news yet, try fetching async */
    if (!liveNews.length) {
      GXB.data.fetchNews().then(function (items) {
        if (items && items.length) {
          ctx.liveNews = items;
          var statusEl = document.getElementById('gxb-news-status');
          if (statusEl) statusEl.textContent = ' (\u5b9e\u65f6)';
          render(root, ctx); // re-render with data
        } else {
          var loadingEl = document.getElementById('gxb-news-loading');
          if (loadingEl) loadingEl.textContent =
            '\u5b9e\u65f6\u5feb\u8baf\u6682\u65f6\u4e0d\u53ef\u7528\uff0c\u5148\u770b\u4e0a\u9762\u7684\u7406\u8d22\u5c0f\u8bfe\u5427\uff5e'; /* 实时快讯暂时不可用，先看看上面的理财小课堂吧～ */
          var st = document.getElementById('gxb-news-status');
          if (st) st.textContent = ' (\u79bb\u7ebf)'; /* (离线) */
        }
      }).catch(function () {
        var el = document.getElementById('gxb-news-loading');
        if (el) el.textContent =
          '\u5b9e\u65f6\u5feb\u8baf\u52a0\u8f7d\u5931\u8d25\uff0c\u8bf7\u68c0\u67e5\u7f51\u7edc\u8fde\u63a5'; /* 实时快讯加载失败，请检查网络连接 */
      });
    }
  }

  function escHtml(s) {
    if (!s) return '';
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  return { render: render };
})();
