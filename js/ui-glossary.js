/* ═════════════════════════════════════════
   UI — 科普 Glossary (searchable term encyclopedia)
   ═════════════════════════════════════════ */
window.GXB = window.GXB || {};
GXB.views = GXB.views || {};

GXB.views.glossary = (function () {

  /* Load terms from JSON or fallback to embedded data */
  var TERMS = [];

  function loadTerms() {
    if (TERMS.length) return TERMS;
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', 'data/glossary.json', false); // sync for simplicity
      xhr.send();
      if (xhr.status === 200) TERMS = JSON.parse(xhr.responseText);
    } catch (e) { /* use fallback */ }
    if (!TERMS.length) TERMS = FALLBACK_TERMS;
    return TERMS;
  }

  /* Fallback embedded terms (only used if glossary.json fails to load;
     the authoritative, SW-cached data lives in data/glossary.json) */
  var FALLBACK_TERMS = [
    { t: 'A股', c: '基础概念', d: '在中国大陆注册、在沪深京交易所上市、以人民币交易的股票。', tip: '小白入门首选A股。' },
    { t: '涨停/跌停', c: '交易规则', d: '当天涨跌幅达到上限（主板10%、创业板/科创板20%）即停止交易。', tip: '涨停不代表一定买得到，跌停也不一定卖得出。' },
    { t: 'T+1', c: '交易规则', d: '今天买的股票，明天才能卖出；资金卖出当天可用、次日可取。', tip: '新手必知的交易制度，当天买入无法当天止损。' },
    { t: '市盈率(PE)', c: '行情与价格', d: 'PE=股价÷每股收益，越低通常越“便宜”，但要结合行业与增速看。', tip: 'PE不是越低越好，亏损公司PE无意义。' },
    { t: '支撑位/压力位', c: '技术指标', d: '股价回落时买盘多的位置叫支撑位；上涨时卖盘多的位置叫压力位。', tip: '支撑位是多头的底线，压力位是空头的城墙。' },
    { t: '止损', c: '风险与心态', d: '预先设定一个能接受的亏损价，到了就卖出，防止越亏越多。', tip: '止损是控制回撤最有效的工具。' }
  ];

  function render(root, ctx) {
    var terms = loadTerms();
    var cats = {};
    terms.forEach(function (t) {
      var cat = t.c || '其他'; /* 其他 */
      if (!cats[cat]) cats[cat] = [];
      cats[cat].push(t);
    });
    var catNames = Object.keys(cats);

    var h = '';

    /* search bar */
    h += '<div class="search-bar">' +
      '<input class="search-input gxb-gls-search" type="text" placeholder="搜索术语（如涨停、PE、换手）" />' + /* 搜索术语（如涨停、PE、换手） */
      '</div>';

    /* category pills */
    h += '<div class="chip-list gls-cat-chips">';
    catNames.forEach(function (cn) {
      h += '<span class="chip gls-cat active" data-cat="' + cn + '">' + cn + '</span>';
    });
    h += '</div>';

    /* term list */
    var activeCat = catNames[0] || '';
    h += '<div id="gbx-term-list">';
    h += _renderTerms((cats[activeCat] || []));
    h += '</div>';

    root.innerHTML = h;

    /* search handler */
    var searchInput = root.querySelector('.gxb-gls-search');
    searchInput.addEventListener('input', function () {
      var kw = this.value.trim().toLowerCase();
      var listEl = document.getElementById('gbx-term-list');
      if (!kw) {
        listEl.innerHTML = _renderTerms((cats[activeCat] || []));
        return;
      }
      var filtered = terms.filter(function (t) {
        return t.t.toLowerCase().indexOf(kw) !== -1 ||
          (t.d || '').toLowerCase().indexOf(kw) !== -1;
      });
      listEl.innerHTML = _renderTerms(filtered);
    });

    /* category switch */
    root.querySelectorAll('.gls-cat').forEach(function (el) {
      el.addEventListener('click', function () {
        root.querySelectorAll('.gls-cat').forEach(function (e) { e.classList.remove('active'); });
        this.classList.add('active');
        activeCat = this.dataset.cat;
        document.getElementById('gbx-term-list').innerHTML = _renderTerms((cats[activeCat] || []));
      });
    });

    /* term expand/collapse */
    root.addEventListener('click', function (e) {
      var row = e.target.closest('.gxb-term-row');
      if (!row) return;
      var code = row.dataset.term;
      var existing = document.getElementById('gxb-detail-' + code);
      if (existing) { existing.remove(); return; }

      var term = terms.find(function (t) { return t.t === code; });
      if (!term) return;

      var div = document.createElement('div');
      div.id = 'gxb-detail-' + code;
      div.className = 'term-detail';
      div.innerHTML = '<p>' + term.d + '</p>' +
        (term.tip ? '<div class="term-tip">💡 小白提醒：' + term.tip + '</div>' : ''); /* 💡 小白提醒： */
      row.parentNode.insertBefore(div, row.nextSibling);
    });
  }

  function _renderTerms(arr) {
    if (!arr.length) return '<div class="empty-state"><p>没有匹配的术语</p></div>'; /* 没有匹配的术语 */
    return arr.map(function (t) {
      return '<div class="term-row gxb-term-row" data-term="' + esc(t.t) + '">' +
        '<span class="term-name">' + t.t + '</span>' +
        '<span class="term-cat">' + (t.c || '') + '</span>' +
        '</div>';
    }).join('');
  }

  function esc(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  return { render: render };
})();
