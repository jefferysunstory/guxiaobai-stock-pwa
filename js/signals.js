/* ═════════════════════════════════════════
   Signals — translate indicators → plain-language
   All signals are EDUCATIONAL only, not investment advice.
   ═════════════════════════════════════════ */
window.GXB = window.GXB || {};
GXB.signals = (function () {
  var ind = GXB.indicators;

  /**
   * Compute a simple composite signal.
   * @param {{closes?:number[],klines?:Array}} klineData
   * @param {Object} quote
   * @returns {{label:string,tone:string,reasons:string[],metrics:Object}}
   */
  function compute(klineData, quote) {
    if (!klineData || !klineData.closes || klineData.closes.length < 30) {
      return {
        label: '观望', tone: 'neutral',
        reasons: ['数据不足（需至少 30 个交易日），暂无信号'],
        metrics: {}
      };
    }

    var closes = klineData.closes;
    var bs = 0, br = 0;       // bull-score, bear-score
    var reasons = [];
    var metrics = {};

    // ── MA5 / MA20 ──
    var ma5 = ind.sma(closes, 5);
    var ma20 = ind.sma(closes, 20);
    if (ma5.length >= 2 && ma20.length >= 2) {
      var l5 = ma5[ma5.length - 1], p5 = ma5[ma5.length - 2];
      var l20 = ma20[ma20.length - 1], p20 = ma20[ma20.length - 2];

      metrics.ma5 = l5.toFixed(2);
      metrics.ma20 = l20.toFixed(2);

      if (p5 <= p20 && l5 > l20) {
        bs += 2; reasons.push('MA5 上穿 MA20（金叉），短期走强');
      } else if (p5 >= p20 && l5 < l20) {
        br += 2; reasons.push('MA5 下穿 MA20（死叉），短期转弱');
      } else if (l5 > l20) {
        bs += 1; reasons.push('MA5 在 MA20 上方，趋势偏多');
      } else {
        br += 1; reasons.push('MA5 在 MA20 下方，趋势偏空');
      }
    }

    // ── RSI(14) ──
    var rsiArr = ind.rsi(closes, 14);
    if (rsiArr.length > 0) {
      var rv = rsiArr[rsiArr.length - 1];
      metrics.rsi = rv.toFixed(1);

      if (rv > 70) { br += 2; reasons.push('RSI(' + rv.toFixed(1) + ') 超买区，注意回调风险'); }
      else if (rv < 30) { bs += 2; reasons.push('RSI(' + rv.toFixed(1) + ') 超卖区，可能存在反弹机会'); }
      else if (rv > 55) { bs += 1; reasons.push('RSI(' + rv.toFixed(1) + ') 偏强'); }
      else if (rv < 45) { br += 1; reasons.push('RSI(' + rv.toFixed(1) + ') 偏弱'); }
      else { reasons.push('RSI(' + rv.toFixed(1) + ') 中性区间'); }
    }

    // ── MACD histogram ──
    var mc = ind.macd(closes);
    if (mc.hist.length > 0) {
      var lh = mc.hist[mc.hist.length - 1];
      var ph = mc.hist[mc.hist.length - 2] || 0;
      metrics.macdHist = lh.toFixed(2);

      if (lh > 0 && ph <= 0) { bs += 1; reasons.push('MACD 柱由负转正，动能转多'); }
      else if (lh < 0 && ph >= 0) { br += 1; reasons.push('MACD 柱由正转负，动能转空'); }
      else if (lh > 0) { bs += 0.5; reasons.push('MACD 柱为正，多头占优'); }
      else { br += 0.5; reasons.push('MACD 柱为负，空头占优'); }
    }

    // ── Final verdict ──
    var label, tone;
    if (bs >= br + 1.5) { label = '偏多'; tone = 'bullish'; }
    else if (br >= bs + 1.5) { label = '偏空'; tone = 'bearish'; }
    else { label = '观望'; tone = 'neutral'; }

    return { label: label, tone: tone, reasons: reasons, metrics: metrics };
  }

  return { compute: compute };
})();
