/* ═════════════════════════════════════════
   Indicators — SMA / RSI / MACD pure functions
   ═════════════════════════════════════════ */
window.GXB = window.GXB || {};
GXB.indicators = (function () {

  /** SMA (simple moving average) */
  function sma(arr, period) {
    var r = [];
    for (var i = period - 1; i < arr.length; i++) {
      var sum = 0;
      for (var j = i - period + 1; j <= i; j++) sum += arr[j];
      r.push(sum / period);
    }
    return r;
  }

  /** EMA (exponential moving average) */
  function ema(arr, period) {
    var k = 2 / (period + 1);
    var r = [arr[0]];
    for (var i = 1; i < arr.length; i++) {
      r.push(arr[i] * k + r[i - 1] * (1 - k));
    }
    return r;
  }

  /**
   * RSI (Relative Strength Index, Wilder's smoothing)
   * @param {number[]} closes – closing prices
   * @param {number} [period=14]
   * @returns {number[]}
   */
  function rsi(closes, period) {
    period = period || 14;
    if (closes.length < period + 1) return [];

    var gains = [], losses = [];
    for (var i = 1; i < closes.length; i++) {
      var d = closes[i] - closes[i - 1];
      gains.push(d > 0 ? d : 0);
      losses.push(d < 0 ? -d : 0);
    }

    var ag = 0, al = 0;
    for (var k = 0; k < period; k++) { ag += gains[k]; al += losses[k]; }
    ag /= period; al /= period;

    var out = [];
    for (var m = period; m < gains.length; m++) {
      ag = (ag * (period - 1) + gains[m]) / period;
      al = (al * (period - 1) + losses[m]) / period;
      var rs = al === 0 ? 100 : ag / al;
      out.push(100 - 100 / (1 + rs));
    }
    return out;
  }

  /**
   * MACD (12, 26, 9)
   * @returns {{ line:number[], signal:number[], hist:number[] }}
   */
  function macd(closes, fast, slow, sig) {
    fast = fast || 12; slow = slow || 26; sig = sig || 9;
    var fEma = ema(closes, fast);
    var sEma = ema(closes, slow);

    var len = Math.min(fEma.length, sEma.length);
    var macdLine = [];
    for (var i = 0; i < len; i++) macdLine.push(fEma[i] - sEma[i]);

    var sigEma = ema(macdLine, sig);
    var hist = [];
    var off = macdLine.length - sigEma.length;
    for (var j = 0; j < sigEma.length; j++)
      hist.push(macdLine[j + off] - sigEma[j]);

    return { line: macdLine, signal: sigEma, hist: hist };
  }

  return { sma: sma, ema: ema, rsi: rsi, macd: macd };
})();
