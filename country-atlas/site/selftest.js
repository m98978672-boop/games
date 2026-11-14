/* Проверка ядра без браузера: node site/selftest.js */
require('./core.js');
const C = globalThis.RatgradCore;
const res = C.tests();
let bad = 0;
for (const r of res) {
  const ok = r.passed === 20;
  if (!ok) bad++;
  console.log((ok ? 'OK  ' : 'FAIL') + ' ' + r.id.padEnd(5) + ' ' + String(r.passed).padStart(2) + '/20  ' + r.name);
}
const total = res.reduce((s, r) => s + r.passed, 0);
console.log('---');
console.log('формул: ' + res.length + ', проверок: ' + total + '/' + (res.length * 20) + ', провалов: ' + bad);
const rec1 = C.columnOf(C.BUILDINGS[0]).rec, rec2 = C.columnOf(C.BUILDINGS[1]).rec;
console.log('B1: ' + rec1 + ' → ' + (C.parseColumn(rec1).ok ? 'корректна' : 'ошибка'));
console.log('B2: ' + rec2 + ' → ' + (C.parseColumn(rec2).ok ? 'корректна' : 'ошибка'));
const m2 = C.columnMath(C.columnOf(C.BUILDINGS[1]), C.BUILDINGS[1].floors * C.BUILDINGS[1].layerH);
console.log('B2 дрейф D=' + m2.D + ' м, длина h=' + m2.h + ' м, наклон θ=' + m2.theta + '°');
const id = C.packID({ s: 0, i: 100, j: 200, k: 18, t: 5, n: 2 });
console.log('ID грани (0;100;200;18;5;2) = ' + id.toString() + ' → ' + JSON.stringify(C.unpackID(id)));
process.exit(bad ? 1 : 0);
