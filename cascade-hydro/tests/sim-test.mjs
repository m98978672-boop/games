import assert from 'node:assert/strict';
import { HydroSimulation } from '../src/hydro.js';
import { EconomyAndCities } from '../src/economy.js';

console.log('1. Инициализация долины и гидродинамики (160×160)...');
const hydro = new HydroSimulation(160);
const eco = new EconomyAndCities(hydro);

assert.ok(hydro.totalWaterVolumeM3 > 1000, 'В реке со старта должна течь вода');
assert.ok(hydro.activeTileCount < hydro.totalTiles, 'Оптимизация активных тайлов пропускает сухие горы');

// Прогон 40 кадров физики
for (let i = 0; i < 40; i++) {
  hydro.step(1 / 60, 8);
}
for (let i = 0; i < hydro.count; i++) {
  assert.ok(Number.isFinite(hydro.h[i]) && hydro.h[i] >= 0, 'Глубина воды конечна и неотрицательна');
  assert.ok(Number.isFinite(hydro.u[i]) && Number.isFinite(hydro.v[i]), 'Скорости конечны');
}
console.log(`   OK! Время шага воды: ${hydro.lastStepMs.toFixed(2)} мс, активные тайлы: ${hydro.activeTileCount}/${hydro.totalTiles}`);

// 2. Возводим бетонную плотину в теснине «Ворота Грома» вокруг (10, -124) и ставим турбину Фрэнсиса
console.log('2. Строительство бетонной плотины, копка канала и пуск турбины...');
for (let wx = -22; wx <= 42; wx += 4) {
  hydro.buildConcreteDam(wx, -124, 9, 36.0, 1e9, true);
}
const turbRes = hydro.placeTurbine('francis', 10, -124, Math.PI * 0.5, 1e9, true);
assert.equal(turbRes.ok, true, 'Турбина успешно установлена в створе плотины');

// Копаем собственный канал и облицовываем бетоном
const digRes = hydro.excavateCanal(-12, -40, 8, 2.5, 19.0, 1e9, true);
assert.ok(digRes.excavatedM3 > 50, 'Экскаватор вынул грунт под канал');
const lineRes = hydro.lineCanalConcrete(-12, -40, 8, 1e9, true);
assert.ok(lineRes.count > 0, 'Бетонная облицовка уложена');

// Подключаем все города, копим напор и проверяем выработку МВт и самостоятельный рост городов
for (const c of eco.cities) {
  if (!c.connected) eco.connectCityGrid(c.id);
}
const initialBuildings = eco.allBuildings.length;
const initialPop = eco.getSummary().totalPopulation;

for (let step = 0; step < 360; step++) {
  hydro.step(1 / 20, 8);
  eco.update(0.25);
}

console.log(`   Напор на турбине: ${turbRes.structure.netHead.toFixed(2)} м, расход Q: ${turbRes.structure.flowQ.toFixed(2)} м³/с, мощность: ${turbRes.structure.powerMW.toFixed(2)} МВт`);
console.log(`   Зданий в городах: ${initialBuildings} -> ${eco.allBuildings.length}, население: ${initialPop} -> ${eco.getSummary().totalPopulation}`);
console.log(`   Казна: ${Math.round(eco.cash).toLocaleString('ru-RU')} ₽`);

assert.ok(turbRes.structure.powerMW > 0.5, 'Турбина вырабатывает реальные мегаватты от напора плотины');
assert.ok(eco.allBuildings.length > initialBuildings, 'Города самостоятельно строят новые здания при подаче энергии');
assert.ok(eco.getSummary().totalPopulation > initialPop, 'Население городов растёт');

console.log('✅ ВСЕ ТЕСТЫ ФИЗИКИ ВОДЫ, ГЭС И САМОРАСТУЩИХ ГОРОДОВ ПРОЙДЕНЫ!');
