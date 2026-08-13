/* ═════════════════════════════════════════
   Store — localStorage wrapper
   ═════════════════════════════════════════ */
window.GXB = window.GXB || {};
GXB.store = (function () {
  var K = {
    wl: 'gxb_watchlist',
    set: 'gxb_settings',
    risk: 'gxb_risk_acked',
    a2hs: 'gxb_a2hs_seen',
    snap: 'gxb_snapshot'
  };

  var DEFAULT_WL = [
    { code: 'sh600519', name: '贵州茅台' },
    { code: 'sz000001', name: '平安银行' },
    { code: 'sz300750', name: '宁德时代' },
    { code: 'sh600036', name: '招商银行' },
    { code: 'sz000858', name: '五粮液' }
  ];

  function getWatchlist() {
    try { return JSON.parse(localStorage.getItem(K.wl)) || []; } catch (e) { return []; }
  }

  function saveWatchlist(list) {
    localStorage.setItem(K.wl, JSON.stringify(list));
  }

  function addStock(code, name) {
    var list = getWatchlist();
    if (list.some(function (s) { return s.code === code; })) return false;
    list.push({ code: code, name: name || '', added: Date.now() });
    saveWatchlist(list);
    return true;
  }

  function removeStock(code) {
    var list = getWatchlist().filter(function (s) { return s.code !== code; });
    saveWatchlist(list);
  }

  function getSettings() {
    try { return JSON.parse(localStorage.getItem(K.set)) || {}; } catch (e) { return {}; }
  }

  function setSetting(key, val) {
    var s = getSettings();
    s[key] = val;
    localStorage.setItem(K.set, JSON.stringify(s));
  }

  function isRiskAcked() { return localStorage.getItem(K.risk) === '1'; }
  function setRiskAcked() { localStorage.setItem(K.risk, '1'); }
  function isA2HSSeen() { return localStorage.getItem(K.a2hs) === '1'; }
  function setA2HSSeen() { localStorage.setItem(K.a2hs, '1'); }

  function saveSnapshot(data) {
    data._ts = Date.now();
    localStorage.setItem(K.snap, JSON.stringify(data));
  }

  function loadSnapshot() {
    try { return JSON.parse(localStorage.getItem(K.snap)); } catch (e) { return null; }
  }

  if (!localStorage.getItem(K.wl)) saveWatchlist(DEFAULT_WL.slice());

  return {
    getWatchlist: getWatchlist,
    addStock: addStock,
    removeStock: removeStock,
    getSettings: getSettings,
    setSetting: setSetting,
    isRiskAcked: isRiskAcked,
    setRiskAcked: setRiskAcked,
    isA2HSSeen: isA2HSSeen,
    setA2HSSeen: setA2HSSeen,
    saveSnapshot: saveSnapshot,
    loadSnapshot: loadSnapshot
  };
})();
