// Проверка каталога и моделей без браузера: node tests/smoke.mjs
import * as THREE from 'three';
import { createMaterials } from '../src/lib/kit.js';
import { buildUnit } from '../src/models/index.js';
import { TRUCKS, TRAILERS, CARS, CATEGORIES, allUnits } from '../src/data/units.js';

let fails = 0;
const ok = (cond, msg) => {
  if (!cond) { console.error('✗', msg); fails++; } else console.log('✓', msg);
};

ok(TRUCKS.length === 10, 'тягачей ровно 10');
ok(TRAILERS.length === 20, 'прицепов ровно 20');
ok(CARS.length === 10, 'автомобилей ровно 10');
ok(new Set(allUnits().map((u) => u.category + ":" + u.id)).size === 40, 'у всех 40 моделей уникальные id');
ok(CATEGORIES.length === 3, 'три категории');

// у каждого тягача и авто есть вид из салона
for (const u of [...TRUCKS, ...CARS]) {
  const views = u.category ? u.views : null;
}
const M = createMaterials(null);
const report = { trucks: [], trailers: [], cars: [] };
for (const unit of allUnits()) {
  let built;
  try {
    built = buildUnit(unit, M);
  } catch (e) {
    console.error('✗', unit.id, 'не собрался:', e.message);
    fails++;
    continue;
  }
  const interior = built.views.filter((v) => v.group === 'interior');
  const exterior = built.views.filter((v) => v.group === 'exterior');
  let tris = 0;
  built.root.traverse((o) => {
    if (o.isMesh && o.geometry) {
      const g = o.geometry;
      tris += (g.index ? g.index.count : g.attributes.position.count) / 3;
    }
  });
  report[unit.category].push({ id: unit.id, tris: Math.round(tris), interior: interior.length, exterior: exterior.length, anchors: built.anchors.length });
  if (unit.category !== 'trailers') {
    ok(interior.length >= 1, `${unit.id}: есть вид из салона (${interior.length})`);
  }
  ok(exterior.length >= 2, `${unit.id}: минимум 2 наружных ракурса (${exterior.length})`);
  ok(tris > 2000, `${unit.id}: геометрия собрана (${Math.round(tris)} треугольников)`);
  ok(built.views.every((v) => Array.isArray(v.pos) && v.pos.length === 3), `${unit.id}: у всех видов корректная позиция камеры`);
}

const avg = (arr, k) => Math.round(arr.reduce((s, x) => s + x[k], 0) / arr.length);
console.log('\nСредняя детализация: тягачи', avg(report.trucks, 'tris'), '· прицепы', avg(report.trailers, 'tris'), '· авто', avg(report.cars, 'tris'), 'треугольников');
const need = 40;
const builtCount = report.trucks.length + report.trailers.length + report.cars.length;
ok(builtCount === need, `собраны все ${need} моделей`);

if (fails) {
  console.error(`\n${fails} проверок не прошло`);
  process.exit(1);
}
console.log('\nВсе проверки пройдены.');
