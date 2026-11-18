const test = require('node:test'), assert = require('node:assert');
const PV = require('../calc.js');
const base = { lo: 0, hi: 400, unit: 'mmH₂O', gen: 'mmH₂O', saida: 'dp', pLo: 0, pHi: 200, trat: 'raiz' };
const near = (a, b, e = 0.05) => assert.ok(Math.abs(a - b) <= e, a + ' ≠ ' + b);

test('saída linear em ΔP + painel Raiz: 25% → 100, 50% → 141,4', () => {
  near(PV.ponto(base, 25).painel, 100);
  near(PV.ponto(base, 50).painel, 141.42);
  near(PV.ponto(base, 0).painel, 0); near(PV.ponto(base, 100).painel, 200);
});
test('transmissor já extrai raiz + painel Linear: mesmos valores', () => {
  const p = Object.assign({}, base, { saida: 'vazao', trat: 'linear' });
  near(PV.ponto(p, 25).painel, 100); near(PV.ponto(p, 50).painel, 141.42);
  near(PV.ponto(p, 25).mA, 12);
});
test('linear/linear: painel proporcional à pressão', () => {
  const p = Object.assign({}, base, { trat: 'linear' });
  near(PV.ponto(p, 25).painel, 50); near(PV.ponto(p, 25).mA, 8);
});
test('conversão de pressão: psi → mmH₂O e Pa', () => {
  const p = Object.assign({}, base, { unit: 'psi', lo: 0, hi: 1, gen: 'mmH₂O' });
  near(PV.ponto(p, 100).aplicar, 703.07, 0.1);
  near(PV.conv(1, 'mmH₂O', 'Pa'), 9.80665, 1e-6);
  const q = Object.assign({}, p, { gen: 'Pa' }); near(PV.ponto(q, 50).aplicar, 3447.4, 0.1);
});
test('faixa não zero e trex na unidade do instrumento', () => {
  const p = Object.assign({}, base, { lo: 100, hi: 500, unit: 'mmH₂O' });
  const r = PV.ponto(p, 25); near(r.press, 200); near(r.trex, 200);
});
test('avisos de raiz dupla e linear/linear', () => {
  assert.equal(PV.avisos(Object.assign({}, base, { saida: 'vazao', trat: 'raiz' })).length, 1);
  assert.equal(PV.avisos(Object.assign({}, base, { trat: 'linear' })).length, 1);
  assert.equal(PV.avisos(base).length, 0);
});
test('porcentagem no painel', () => {
  near(PV.ponto(base, 25).painelPct, 50); near(PV.ponto(base, 50).painelPct, 70.71);
  near(PV.ponto(Object.assign({}, base, { trat: 'linear' }), 25).painelPct, 25);
});
