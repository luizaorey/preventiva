/* Preventiva — motor de cálculo (sem DOM; navegador e Node). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PV = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  // fator para Pa
  const UNITS = {
    'Pa': 1, 'kPa': 1000, 'MPa': 1e6, 'mbar': 100, 'bar': 1e5, 'kgf/cm²': 98066.5,
    'psi': 6894.757, 'atm': 101325, 'mmHg': 133.322, 'mmH₂O': 9.80665, 'cmH₂O': 98.0665,
    'inH₂O': 249.082, 'mca': 9806.65,
  };
  const conv = (v, a, b) => (UNITS[a] && UNITS[b] ? (v * UNITS[a]) / UNITS[b] : NaN);

  function parseNum(x) {
    if (typeof x === 'number') return isFinite(x) ? x : null;
    if (x == null) return null;
    let t = String(x).trim().replace(/\s/g, '');
    if (t === '') return null;
    if (/^-?[1-9]\d{0,2}(\.\d{3})+(,\d+)?$/.test(t)) t = t.replace(/\./g, '').replace(',', '.');
    else t = t.replace(',', '.');
    if (!/^-?(\d+\.?\d*|\.\d+)$/.test(t)) return null;
    return Number(t);
  }
  function fmt(n, d) {
    if (n == null || !isFinite(n)) return '—';
    if (Math.abs(n) < 1e-9) n = 0;
    const a = Math.abs(n), dig = d != null ? d : a >= 100 ? 1 : a >= 10 ? 2 : 3;
    return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: dig }).format(n);
  }

  /* p: {lo, hi, unit (instrumento), gen (unidade do gerador),
         saida: 'dp' (linear em ΔP) | 'vazao' (raiz no transmissor),
         pLo, pHi (faixa do painel), trat: 'linear' | 'raiz'}
     pct: fração 0..100 da faixa de PRESSÃO aplicada. */
  function ponto(p, pct) {
    const f = pct / 100;
    const press = p.lo + f * (p.hi - p.lo);              // na unidade do instrumento
    const aplicar = conv(press, p.unit, p.gen);          // na unidade do gerador
    const s = p.saida === 'vazao' ? Math.sqrt(f) : f;    // fração do sinal 4–20 mA
    const mA = 4 + 16 * s;
    const sp = p.trat === 'raiz' ? Math.sqrt(s) : s;     // fração do painel
    const painel = p.pLo + sp * (p.pHi - p.pLo);
    return { pct, press, aplicar, mA, trex: press, painel, painelPct: sp * 100 };
  }
  function avisos(p) {
    const w = [];
    if (p.saida === 'vazao' && p.trat === 'raiz') w.push('Raiz dupla: o transmissor já extrai a raiz e o painel também. O painel deveria estar em Linear.');
    if (p.saida === 'dp' && p.trat === 'linear') w.push('Saída linear em ΔP com painel em Linear: o painel mostra a pressão diferencial como se fosse vazão. Para indicar vazão, use Raiz quadrada.');
    return w;
  }
  return { UNITS, conv, parseNum, fmt, ponto, avisos, PCTS: [0, 25, 50, 75, 100] };
});
