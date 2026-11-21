/* Страж правила «нечисло после игры».
   Infinity в настройках камеры — это норма библиотеки, а NaN в игровых
   числах — настоящий баг. Тест фиксирует разницу, чтобы ослабление правила
   не спрятало реальные поломки. */
const LIMIT_NAME = /^(min|max)[A-Z]/;
const isLibraryLimit = (name, value) => typeof value === 'number'
  && Number.isFinite(value) === false && !Number.isNaN(value)
  && LIMIT_NAME.test(name);
const cases = [
  ['maxDistance', Infinity, false, 'лимит камеры — норма'],
  ['minAzimuthAngle', -Infinity, false, 'лимит камеры — норма'],
  ['maxTargetRadius', Infinity, false, 'лимит камеры — норма'],
  ['time', NaN, true, 'NaN в игровом времени — баг'],
  ['money', Infinity, true, 'бесконечные деньги — баг'],
  ['maxMoney', Infinity, false, 'явный лимит — норма'],
  ['time', 12, false, 'обычное число — норма'],
];
let bad = 0;
for (const [name, value, shouldReport, why] of cases) {
  const reported = typeof value === 'number' && !Number.isFinite(value) && !isLibraryLimit(name, value);
  const ok = reported === shouldReport;
  if (!ok) bad++;
  console.log((ok ? '  ✓ ' : '  ✗ ') + name + ' = ' + value + ' → ' + (reported ? 'находка' : 'норма') + ' (' + why + ')');
}
console.log(bad ? `\n✗ провалов: ${bad}` : '\n✓ правило различает баг и норму');
process.exit(bad ? 1 : 0);
