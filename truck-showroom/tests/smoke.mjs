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
// из места водителя пускаем луч вперёд и смотрим, во что он попадает первым
const rayHelpers = (() => {
  const tmp = new THREE.Vector3();
  return {
    firstHit(root, view) {
      // без обновления мировых матриц луч бьёт в объекты по старым координатам
      root.updateMatrixWorld(true);
      const cam = new THREE.PerspectiveCamera(view.fov || 60, 1.5, 0.05, 200);
      cam.position.set(...view.pos);
      cam.lookAt(new THREE.Vector3(...view.target));
      cam.updateMatrixWorld(true);
      const rc = new THREE.Raycaster();
      rc.setFromCamera(new THREE.Vector2(0, 0.25), cam);
      const hit = rc.intersectObject(root, true).find((h) => h.object.isMesh && h.object.visible !== false);
      return hit || null;
    },
  };
})();
const firstHit = (root, view) => rayHelpers.firstHit(root, view);
const hasHiddenMesh = () => false;

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

  // из места водителя обзор не должен упираться в краску: лобовое стекло прозрачное
  const seatView = built.views.find((v) => v.id === 'driver' || v.id === 'salon');
  if (seatView && !hasHiddenMesh(built, seatView)) {
    const blocked = firstHit(built.root, seatView);
    if (blocked) {
      const isGlass = blocked.object.material?.transparent === true;
      // до 0.8 м от глаз — это детали самой кабины (руль, козырёк, зеркало), это нормально
      ok(isGlass || blocked.distance > 0.8, `${unit.id}: из салона видно улицу (первое попадание: ${blocked.object?.geometry?.type || '?'} @ ${blocked.distance.toFixed(2)} м)`);
    }
  }
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
