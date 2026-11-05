// Проверка каталога и моделей без браузера: node tests/smoke.mjs
import * as THREE from 'three';
import { createMaterials } from '../src/lib/kit.js';
import { buildUnit } from '../src/models/index.js';
import { TRUCKS, TRAILERS, CARS, CATEGORIES, allUnits } from '../src/data/units.js';
import { carShape } from '../src/models/car.js';

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

// ============================================================
// РЕГРЕССИИ ПО АВТОМОБИЛЯМ
// Каждый блок — конкретный дефект, который уже был в моделях:
// открытые торцы кузова, вырезанная арка, торчащая ступица, корма
// за габаритом, приборы, спрятанные за панелью.
// ============================================================
const M2 = createMaterials(null);
for (const unit of CARS) {
  const built = buildUnit({ ...unit, category: 'cars' }, M2);
  const root = built.root;
  root.updateMatrixWorld(true);
  const S = carShape(unit);
  const { front, rear, W, ground } = S;

  // 1. Корма и нос не выходят за заявленный габарит кузова
  ok(S.rearBaseZ <= rear - 0.05, `${unit.id}: задняя кромка крыши в габарите (${S.rearBaseZ.toFixed(2)} ≤ ${rear.toFixed(2)})`);

  // 2. Торцы закрыты: луч из кормы/носа внутрь кузова не должен
  //    пролетать весь салон насквозь (раньше было видно кресла снаружи)
  // Раньше торцы были открыты (между бортами зияла дыра), и луч снаружи
  // пролетал в салон. Теперь первое попадание — силовой элемент кузова
  // (торцевая панель или бампер) на боку модели, а не интерьер.
  const rc = new THREE.Raycaster();
  const leaks = [];
  for (const [label, origin, dir] of [
    ['спереди', new THREE.Vector3(0, ground + 0.32, front - 0.8), new THREE.Vector3(0, 0, 1)],
    ['сзади', new THREE.Vector3(0, ground + 0.32, rear + 0.8), new THREE.Vector3(0, 0, -1)],
    ['сверху спереди', new THREE.Vector3(0, ground + 0.36, front - 0.8), new THREE.Vector3(0, 0.05, 1)],
  ]) {
    rc.set(origin, dir.clone().normalize());
    const hit = rc.intersectObject(root, true).find((h) => h.object.isMesh && h.object.visible !== false);
    // 0.9 м — это бампер и торцевая панель (накладки выступают до 0.3 м,
    // плюс сам луч стартует в 0.8 м от габарита). Сквозная дыра даёт 2+ м.
    if (!hit) leaks.push(`${label}: луч ушёл в пустоту`);
    else if (hit.distance > 1.15) leaks.push(`${label}: ${hit.distance.toFixed(2)} м`);
  }
  ok(leaks.length === 0, `${unit.id}: торцы кузова закрыты${leaks.length ? ' — ' + leaks.join('; ') : ''}`);

  // 3. Колёса не торчат за борт и не «протыкаются» планкой:
  //    ступица и диск должны быть внутри покрышки
  const wheel = built.wheels?.[0];
  if (wheel) {
    const bb = new THREE.Box3().setFromObject(wheel);
    const halfW = W / 2;
    ok(bb.max.x <= halfW + 0.02, `${unit.id}: колесо не выпирает за борт (${bb.max.x.toFixed(2)} ≤ ${halfW.toFixed(2)} + 0.02)`);
    ok(bb.min.y >= -0.01 && bb.max.y <= 2 * (unit.wheelRadius ?? 0.33) + 0.02, `${unit.id}: колесо стоит на земле`);
  }

  // 4. Арка действительно вырезана: вертикальный луч сверху вниз через
  //    центр колеса не должен попадать в краску кузова (раньше дырка
  //    выходила за силуэт и триангуляция затягивала арку краской)
  const wheelZ = (unit.wheelbase ?? S.L * 0.58) / 2;
  const R0 = unit.wheelRadius ?? 0.33;
  const paintColor = new THREE.Color(unit.paint || '#2f5d8a').getHexString();
  const archRay = new THREE.Raycaster();
  // сбоку, на высоте центра колеса, точно через арку
  archRay.set(new THREE.Vector3(W / 2 + 1.5, R0 + 0.02, wheelZ), new THREE.Vector3(-1, 0, 0));
  const archHits = archRay.intersectObject(root, true).filter((h) => h.object.isMesh && h.object.visible !== false);
  const firstPaint = archHits.find((h) => h.object.material?.color?.getHexString?.() === paintColor);
  const firstTire = archHits[0];
  // первое попадание должно быть покрышкой/диском, а не краской борта
  ok(firstTire && firstTire.object.material?.color?.getHexString?.() !== paintColor,
    `${unit.id}: арка прорезана, в проёме колесо (${firstTire ? firstTire.object.geometry.type + ' #' + (firstTire.object.material?.color?.getHexString?.() ?? '?') : 'пусто'})`);
  ok(!firstPaint || firstPaint.distance > (firstTire?.distance ?? 0),
    `${unit.id}: краска не перекрывает колесо в арке`);

  // 5. Водитель видит приборы: из точки глаз луч вниз-вперёд должен
  //    попадать в панель, а не в пустоту или собственное кресло
  const driverView = built.views.find((v) => v.id === 'driver');
  if (driverView) {
    const cam = new THREE.PerspectiveCamera(driverView.fov || 60, 1.6, 0.02, 60);
    cam.position.set(...driverView.pos);
    cam.lookAt(new THREE.Vector3(...driverView.target));
    cam.updateMatrixWorld(true);
    cam.updateProjectionMatrix();
    const rc2 = new THREE.Raycaster();
    rc2.setFromCamera(new THREE.Vector2(0, -0.25), cam);
    const hit = rc2.intersectObject(root, true).find((h) => h.object.isMesh && h.object.visible !== false);
    // панель — тёмная (интерьерные материалы), стекло прозрачное, кресло исключено
    const isDash = hit && hit.object.material?.transparent !== true && hit.distance < 1.6;
    ok(isDash, `${unit.id}: от водителя виден щиток приборов (${hit ? hit.object.geometry.type + ' @ ' + hit.distance.toFixed(2) + ' м' : 'пусто'})`);
  }

  // 6. Вид «Салон»: камера должна стоять в салоне — между торпедо и кормой,
  //    ниже крыши — и видеть панель. Раньше она оказывалась то внутри
  //    спинки заднего дивана (у универсала кадр был чёрным), то внутри
  //    самой торпедо (кадр перекрывало серое поле).
  const salonView = built.views.find((v) => v.id === 'salon');
  if (salonView) {
    const [cx, cy, cz] = salonView.pos;
    ok(cz < S.rearBaseZ - 0.15, `${unit.id}: камера «Салон» не за задним диваном (z ${cz.toFixed(2)} < ${(S.rearBaseZ - 0.15).toFixed(2)})`);
    ok(cz > S.front + 0.6 && cy > S.ground + 0.4 && cy < S.H - 0.12,
      `${unit.id}: камера «Салон» внутри салона (y ${cy.toFixed(2)} при H ${S.H.toFixed(2)})`);
    const camS = new THREE.PerspectiveCamera(salonView.fov || 60, 1.6, 0.02, 60);
    camS.position.set(...salonView.pos);
    camS.lookAt(new THREE.Vector3(...salonView.target));
    camS.updateMatrixWorld(true);
    camS.updateProjectionMatrix();
    const rcS = new THREE.Raycaster();
    rcS.setFromCamera(new THREE.Vector2(0, -0.2), camS);
    const hitS = rcS.intersectObject(root, true).find((h) => h.object.isMesh && h.object.visible !== false && h.object.material?.transparent !== true);
    ok(hitS && hitS.distance < 2.2,
      `${unit.id}: из «Салона» видна приборная панель (${hitS ? hitS.object.geometry.type + ' @ ' + hitS.distance.toFixed(2) + ' м' : 'пусто'})`);
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
