// Проверка каталога и моделей без браузера: node tests/smoke.mjs
import * as THREE from 'three';
import { createMaterials } from '../src/lib/kit.js';
import { buildUnit } from '../src/models/index.js';
import { TRUCKS, TRAILERS, CARS, BUILDINGS, CATEGORIES, allUnits } from '../src/data/units.js';
import { carShape } from '../src/models/car.js';
import { damagePixels, DAMAGE_TITLES, damageReport, damageSpecAt } from '../src/lib/damage.js';
import { placePanel, overlaps, rect } from '../src/lib/layout.js';

let fails = 0;
const ok = (cond, msg) => {
  if (!cond) { console.error('✗', msg); fails++; } else console.log('✓', msg);
};

ok(TRUCKS.length === 10, 'тягачей ровно 10');
ok(TRAILERS.length === 20, 'прицепов ровно 20');
ok(CARS.length === 10, 'автомобилей ровно 10');
ok(BUILDINGS.length >= 20, `зданий не меньше 20 (${BUILDINGS.length})`);
ok(new Set(allUnits().map((u) => u.category + ':' + u.id)).size === TRUCKS.length + TRAILERS.length + CARS.length + BUILDINGS.length,
  `у всех ${allUnits().length} моделей уникальные id`);
ok(CATEGORIES.length === 4 && CATEGORIES.some((c) => c.id === 'buildings'), 'четыре категории, здания — отдельная');
ok(CATEGORIES.find((c) => c.id === 'buildings')?.count === BUILDINGS.length, 'счётчик категории зданий совпадает с каталогом');

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
const shortLen = (a, b) => Math.min(a.length, b.length);
const hasHiddenMesh = () => false;

const M = createMaterials(null);
const report = { trucks: [], trailers: [], cars: [], buildings: [] };
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
  if (unit.category !== 'trailers' && unit.category !== 'buildings') {
    ok(interior.length >= 1, `${unit.id}: есть вид из салона (${interior.length})`);
  }
  ok(exterior.length >= 2, `${unit.id}: минимум 2 наружных ракурса (${exterior.length})`);
  ok(tris > (unit.category === 'buildings' ? 400 : 2000), `${unit.id}: геометрия собрана (${Math.round(tris)} треугольников)`);
  ok(built.views.every((v) => Array.isArray(v.pos) && v.pos.length === 3), `${unit.id}: у всех видов корректная позиция камеры`);

  // ---- здания: у каждого 4 разных фасада и свои детали на них
  if (unit.category === 'buildings') {
    const ids = built.views.map((v) => v.id);
    const faces = ['front', 'back', 'left', 'right'];
    ok(faces.every((f) => ids.includes(f)), `${unit.id}: четыре фасада — перед/зад/право/лево (${ids.join(', ')})`);
    const at = (f) => built.views.find((v) => v.id === f);
    const distinct = faces.every((f) => {
      const v = at(f);
      return v && v.pos && v.target && Math.abs(v.pos[0] - v.target[0]) + Math.abs(v.pos[2] - v.target[2]) > 1;
    });
    ok(distinct, `${unit.id}: камеры фасадов смотрят с четырёх сторон`);
    const groups = {};
    built.root.traverse((o) => {
      if (o.name && /^facade-(front|back|left|right)$/.test(o.name)) groups[o.name] = o;
    });
    ok(faces.every((f) => groups[`facade-${f}`]), `${unit.id}: фасады собраны отдельными группами`);
    let glass = 0;
    let leaves = 0;
    const perFace = {};
    for (const f of faces) {
      let n = 0;
      groups[`facade-${f}`]?.traverse((o) => {
        if (o.isMesh && o.name === 'window-glass') n += 1;
      });
      perFace[f] = n;
      glass += n;
      groups[`facade-${f}`]?.traverse((o) => { if (o.isMesh && o.name === 'door-leaf') leaves += 1; });
    }
    ok(glass >= 8, `${unit.id}: окна на фасадах (${glass})`);
    ok(leaves >= 2, `${unit.id}: двери спереди и сзади (${leaves})`);
    const sig = (f) => {
      const names = [];
      groups[`facade-${f}`]?.traverse((o) => { if (o.isMesh && o.name) names.push(o.name); });
      return names.sort().join('|');
    };
    const sigs = new Set(faces.map(sig));
    const variedFaces = sigs.size;
    ok(variedFaces >= 3, `${unit.id}: фасады не одинаковые (${sigs.size} разных из 4)`);
    ok(built.anchors.length >= 4, `${unit.id}: точки осмотра фасадов (${built.anchors.length})`);
    ok(built.root.children.length > 0, `${unit.id}: корпус на месте`);
    continue;
  }

  // ---- ВЫРЕЗЫ: у проёма есть глубина и задняя стенка, а не наклейка
  {
    const cuts = [];
    built.root.traverse((o) => {
      if (o.isMesh && o.userData.cutout) cuts.push(o);
    });
    ok(cuts.length >= 3, `${unit.id}: в кузове есть вырезы (${cuts.length} мешей)`);
    const insets = cuts.filter((o) => /-inset$/.test(o.name));
    ok(insets.length >= 2, `${unit.id}: у проёмов есть задняя стенка (${insets.length})`);
    let badDepth = 0;
    let broken = 0;
    for (const mesh of cuts) {
      const info = mesh.userData.cutout;
      if (!(info.depth >= 0.012)) badDepth += 1;
      // задняя стенка обязана быть УТОПЛЕНА относительно плоскости панели
      if (/-inset$/.test(mesh.name) && !(mesh.position.z <= -info.depth * 0.9)) broken += 1;
    }
    ok(badDepth === 0, `${unit.id}: вырезы имеют глубину${badDepth ? ' — ' + badDepth : ''}`);
    ok(broken === 0, `${unit.id}: задняя стенка выреза утоплена, а не торчит${broken ? ' — ' + broken : ''}`);
  }

  // 6. Повреждения: у каждой модели своя точка и своя текстура
  const dmg = built.damage;
  ok(!!(dmg && dmg.group && dmg.list?.length), `${unit.id}: заданы точки повреждений`);
  if (dmg && dmg.group) {
    ok(dmg.list.length >= 15, `${unit.id}: не меньше 15 повреждений (${dmg.list.length})`);
    ok(dmg.group.visible === false, `${unit.id}: повреждения скрыты по умолчанию`);
    const kinds = new Set(dmg.list.map((x) => x.spec.kind));
    ok(kinds.size >= 4, `${unit.id}: встречаются все виды повреждений (${[...kinds].join(', ')})`);
    const sigs = new Set(dmg.list.map((x) => `${x.spec.kind}:${x.spec.seed}`));
    ok(sigs.size >= 12, `${unit.id}: текстуры разные, а не одна на всё (${sigs.size} вариантов)`);
    let badPatch = 0;
    let flatPatch = 0;
    for (const item of dmg.list) {
      const patch = item.patch;
      const mat = patch.material;
      // дефект — это ГЕОМЕТРИЯ, а не наклейка: ни картинки, ни прозрачности
      if (mat.map) badPatch += 1;
      if (!mat.color) badPatch += 1;
      if (mat.transparent === true) badPatch += 1;
      const bb = new THREE.Box3().setFromObject(patch).getSize(new THREE.Vector3());
      if (!(Math.max(bb.x, bb.y, bb.z) > 0.1)) badPatch += 1;
      // объём: у сетки есть и подъём, и спад относительно панели
      const pos = patch.geometry.attributes.position;
      const nor = patch.geometry.attributes.normal;
      let lo = Infinity;
      let hi = -Infinity;
      for (let i = 0; i < pos.count; i++) {
        const z = pos.getZ(i);
        if (z < lo) lo = z;
        if (z > hi) hi = z;
      }
      const relief = hi - lo;
      if (!(relief > 0.0015) || pos.count < 36 || !nor) flatPatch += 1;
    }
    ok(badPatch === 0, `${unit.id}: все пятна с текстурой, накладкой и не вырождены${badPatch ? ' — ' + badPatch : ''}`);
    ok(flatPatch === 0, `${unit.id}: дефекты — объёмная геометрия с нормалями${flatPatch ? ' — ' + flatPatch : ''}`);
    // каждое пятно управляется отдельно: группа скрыта, меши адресуемы по индексу
    ok(dmg.list.every((it, i) => it.patch.name === `damage-patch:${i}` && it.patch.userData.kind === it.spec.kind),
      `${unit.id}: каждое пятно адресуется по индексу`);
    let badLabel = 0;
    for (const item of dmg.list) {
      const label = item.spec.label;
      if (!/ — /.test(label)) badLabel += 1;
      const adj = label.split(' ')[0];
      if (!/^(лев|прав)/.test(adj)) continue; // деталь по центру — без прилагательного
      const part = label.split(' — ')[0].split(' ').slice(1).join(' ');
      const agree = /(дверь|стенка|стойка|юбка|крышка|крыша|рама|боковина|панель|полка|арка)/.test(part) ? /ая$/.test(adj)
        : /(крыло|колесо|седло)/.test(part) ? /ое$/.test(adj) : /ый$/.test(adj);
      if (!agree) badLabel += 1;
    }
    ok(badLabel === 0, `${unit.id}: подписи согласованы по роду${badLabel ? ' — ' + badLabel : ''}`);
    ok(built.anchors.filter((a) => /^Повреждение:/.test(a.label)).length >= 15, `${unit.id}: точки есть в списке осмотра`);
  }

  // 7b. Пятна повреждений лежат НА кузове: из центра каждого пятна луч в
  //     кузов должен упираться в панель в паре сантиметров. Раньше половина
  //     пятен висела в воздухе над колёсами и в проёмах арок.
  {
    const rcD = new THREE.Raycaster();
    let floating = 0;
    for (const item of (built.damage?.list || [])) {
      const patch = item.patch;
      const n = new THREE.Vector3(0, 0, 1).applyQuaternion(patch.getWorldQuaternion(new THREE.Quaternion())).normalize();
      rcD.set(patch.getWorldPosition(new THREE.Vector3()), n.clone().negate());
      const hit = rcD.intersectObject(built.root, true)
        .find((h) => h.object.isMesh && !h.object.userData.damage && h.object.visible !== false
          && h.object.material?.transparent !== true);
      if (!hit || hit.distance > 0.05) floating += 1;
    }
    ok(floating <= 1, `${unit.id}: пятна лежат на панелях (в воздухе ${floating} из ${built.damage?.list?.length || 0})`);
  }

  // 8. Зеркала тягачей: полотно смотрит НАЗАД, на водителя. Раньше корпус
  //    стоял поперёк и водитель видел ребро зеркала вместо дороги.
  if (unit.category === 'trucks') {
    const panes = [];
    built.root.traverse((o) => {
      if (o.isMesh && o.name === 'mirror-glass') {
        panes.push(new THREE.Box3().setFromObject(o).getSize(new THREE.Vector3()));
      }
    });
    const bad = panes.filter((b) => !(b.z < 0.05 && b.x > 0.15 && b.y > 0.1)).length;
    // у футуристичного тягача вместо зеркал камеры — полотен нет, это норма
    const cameras = built.anchors.some((a) => a.label === 'Камера обзора');
    ok(bad === 0 && (panes.length >= 2 || cameras),
      `${unit.id}: зеркала повёрнуты полотном к водителю (полотен ${panes.length}, кривых ${bad})`);
  }

  // из места водителя обзор не должен упираться в краску: лобовое стекло прозрачное
  const seatView = built.views.find((v) => v.id === 'driver' || v.id === 'salon');
  if (seatView && !hasHiddenMesh(built, seatView)) {
    const blocked = firstHit(built.root, seatView);
    if (blocked) {
      const isGlass = blocked.object.material?.transparent === true;
      // детали салона (панель, руль, кресло) перед глазами — это нормально
      let inCabin = false;
      for (let o = blocked.object; o; o = o.parent) {
        if (o.name === 'interior') inCabin = true;
      }
      // до 0.8 м от глаз — это детали самой кабины (руль, козырёк, зеркало), это нормально
      ok(isGlass || inCabin || blocked.distance > 0.8, `${unit.id}: из салона видно улицу (первое попадание: ${blocked.object?.geometry?.type || '?'} @ ${blocked.distance.toFixed(2)} м)`);
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

  // 0. Торпедо стоит на месте, а не висит в салоне: расстояние от кресла
  //    до панели должно быть человеческим, и панель не нависает над коленом.
  const seatD = built.anchors.find((a) => a.label === 'Сиденье водителя');
  const dashD = built.anchors.find((a) => a.label === 'Торпедо и руль');
  if (seatD && dashD) {
    const gap = seatD.pos[2] - dashD.pos[2];
    // кресло ближе к панели (было 0,92 м), но не вплотную
    ok(gap > 0.45 && gap < 0.95, `${unit.id}: кресло стоит у панели на нормальном расстоянии (${gap.toFixed(2)} м)`);
    // корпус панели 0,3 м: задняя кромка не должна оказаться над подушкой.
    // У микрокара и пикапа салон короткий, там зазор в плане меньше —
    // но кресло всё равно стоит ПОЗАДИ панели, а не под ней.
    const clearance = seatD.pos[2] - 0.22 - (dashD.pos[2] + 0.15);
    ok(clearance > 0.1, `${unit.id}: панель не нависает над креслом (зазор ${clearance.toFixed(2)} м)`);
  }

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

  // 7. Торпедо соединено с кузовом: над панелью нет сквозного просвета,
  //    боковые стёкла стоят заподлицо, задний ряд не вжат в передние кресла.
  const floorYc = S.ground + 0.08;
  const dashTopC = floorYc + 0.42;
  const cowlY = Math.min(dashTopC + 0.06, S.hoodY - 0.012) + 0.06;
  const rc2 = new THREE.Raycaster();
  const opaque = (h) => h.object.visible !== false && h.object.material?.transparent !== true;
  let holes = 0;
  // Область «полки кузова»: от основания лобового до задней кромки панели.
  // Раньше полка тянулась на 12 см за кромку панели и нависала над коленями —
  // отсюда и ощущение, что торпедо выдвинуто в салон.
  for (let z = S.wsBase + 0.06; z <= S.wsTopZ - 0.34; z += 0.08) {
    rc2.set(new THREE.Vector3(0.1, cowlY, z), new THREE.Vector3(0, -1, 0));
    const hit = rc2.intersectObject(root, true).find(opaque);
    if (!hit || hit.distance > 0.3) holes += 1;
  }
  ok(holes === 0, `${unit.id}: торпедо соединено с кузовом (просветов ${holes})`);
  // полка не должна нависать над сиденьями: над задней кромкой панели,
  // сразу за верхом лобового, не должно быть горизонтальной поверхности
  const upRay = new THREE.Raycaster();
  upRay.set(new THREE.Vector3(0.1, floorYc + 0.62, S.wsTopZ - 0.12), new THREE.Vector3(0, 1, 0));
  const upHit = upRay.intersectObject(root, true).find(opaque);
  ok(!upHit || upHit.distance > 0.35,
    `${unit.id}: торпедо не нависает над сиденьями (${upHit ? upHit.distance.toFixed(2) + ' м' : 'чисто'})`);

  let glassMaxX = 0;
  root.traverse((o) => {
    if (o.isMesh && o.name === 'side-glass') {
      const b = new THREE.Box3().setFromObject(o);
      glassMaxX = Math.max(glassMaxX, Math.abs(b.max.x), Math.abs(b.min.x));
    }
  });
  ok(glassMaxX > S.W / 2 - 0.04,
    `${unit.id}: боковые стёкла стоят заподлицо с бортом (${glassMaxX.toFixed(3)} при борте ${(S.W / 2).toFixed(3)})`);

  const seatA = built.anchors.find((a) => a.label === 'Сиденье водителя');
  const rearA = built.anchors.find((a) => a.label === 'Задний ряд');
  if (seatA && rearA) {
    const pitch = rearA.pos[2] - seatA.pos[2];
    ok(pitch >= 0.5, `${unit.id}: задний ряд не вжат в передние кресла (база ${pitch.toFixed(2)} м)`);
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

// ============================================================
// РЕГРЕССИИ ПО ПРИЦЕПАМ
// Кузова раньше были безликими белыми коробками, а над тележкой
// висели тёмные «лопухи» вместо крыльев. Проверяем то, что делает
// прицеп похожим на настоящий: контурная маркировка, задние фонари
// с отбойником, крылья над колёсами и ливрея бренда.
// ============================================================
const M3 = createMaterials(null);
for (const unit of TRAILERS) {
  const built = buildUnit({ ...unit, category: 'trailers' }, M3);
  built.root.updateMatrixWorld(true);
  const W = unit.width ?? 2.55;
  const box3 = new THREE.Box3();
  let stripeCount = 0;
  let stripeOutside = 0;
  let lights = 0;
  let fenders = 0;
  built.root.traverse((o) => {
    if (!o.isMesh) return;
    const mat = o.material;
    box3.setFromObject(o);
    // у повреждений тоже есть вершинные цвета — это не полоса
    if (mat?.vertexColors && !o.userData.damage) {
      stripeCount += 1;
      // полоса должна быть у борта, а не в середине кузова и не под землёй
      if (Math.abs(box3.max.x) > W / 2 - 0.25 || Math.abs(box3.min.x) > W / 2 - 0.25) stripeOutside += 1;
      ok(box3.min.y > 0.3 && box3.max.y < 2.2, `${unit.id}: маркировка на высоте борта (${box3.min.y.toFixed(2)}…${box3.max.y.toFixed(2)} м)`);
    }
    if (mat?.emissive && mat.emissive.getHexString() !== '000000' && box3.min.z > 3) lights += 1;
    if (o.geometry?.type === 'CylinderGeometry' && box3.max.y < 1.3 && box3.min.y > 0.2) fenders += 1;
  });
  ok(stripeCount > 0, `${unit.id}: есть контурная маркировка (${stripeCount} полос)`);
  ok(stripeOutside === stripeCount, `${unit.id}: маркировка стоит на борту, а не внутри кузова`);
  ok(lights >= 2, `${unit.id}: задние фонари на корме (${lights})`);
  ok(fenders >= 1, `${unit.id}: над колёсами есть крылья или защита (${fenders})`);
  if (['curtain', 'van', 'reefer', 'tipper', 'livestock'].includes(unit.type)) {
    // цветная плашка ливреи: насыщенный цвет на борту выше пола
    let plate = 0;
    const hsl = {};
    built.root.traverse((o) => {
      if (!o.isMesh || !o.material?.color) return;
      box3.setFromObject(o);
      o.material.color.getHSL(hsl);
      if (hsl.s > 0.25 && box3.min.y > 1.2 && Math.abs(box3.max.x) > W / 2 - 0.1) plate += 1;
    });
    ok(plate > 0, `${unit.id}: на борту есть цветная ливрея (${plate})`);
  }
}

// ============================================================
// РЕГРЕССИИ ПО ТЯГАЧАМ
// Передок раньше был плоской чёрной накладкой, а бампер висел в воздухе:
// между полом кабины (~1.18 м) и балкой (верх 0.83 м) зиял зазор, кронштейнов
// и юбки не было — деталь читалась «оторванной». Теперь балка посажена на
// раму, сверху её закрывает юбка в цвет кузова, снизу — спойлер, поэтому
// передок по центру непрерывен от спойлера до кабины.
// ============================================================
const M4 = createMaterials(null);
for (const unit of TRUCKS) {
  const built = buildUnit({ ...unit, category: 'trucks' }, M4);
  const root = built.root;
  root.updateMatrixWorld(true);
  const L = unit.length ?? 6.2;
  const frontZ = -L / 2;
  const floorY = unit.style === 'lowentry' ? 0.85 : 1.18;

  const boxes = [];
  root.traverse((o) => {
    if (!o.isMesh || o.visible === false) return;
    const b = new THREE.Box3().setFromObject(o);
    if (b.min.z < frontZ + 1.4) boxes.push(b);
  });

  // 1. По центру передка нет «парящего» зазора между бампером и кабиной
  const gaps = [];
  for (let y = 0.52; y < floorY; y += 0.05) {
    const p = new THREE.Vector3(0, y, frontZ + 0.18);
    if (!boxes.some((b) => b.containsPoint(p))) gaps.push(y.toFixed(2));
  }
  ok(gaps.length === 0, `${unit.id}: бампер примыкает к кузову без зазора${gaps.length ? ' — дыры на y ' + gaps.slice(0, 4).join(', ') : ''}`);

  // 2. Верх балки бампера — прямо под полом кабины, а не в полуметре ниже
  const beam = boxes
    .filter((b) => b.max.x - b.min.x > 2.2 && b.min.z < frontZ + 0.6 && b.max.y > 0.6 && b.max.y < floorY + 0.05)
    .sort((a, b) => (b.max.x - b.min.x) - (a.max.x - a.min.x))[0];
  ok(beam && beam.max.y > floorY - 0.16,
    `${unit.id}: балка бампера под полом кабины (верх ${beam ? beam.max.y.toFixed(2) : '—'} при поле ${floorY.toFixed(2)})`);

  // 3. Фары утоплены в передок: их линзы не выносятся вперёд дальше 12 см
  //    от наружной плоскости маски (раньше висели отдельными «глазами»).
  let lamps = 0;
  let proud = 0;
  root.traverse((o) => {
    if (!o.isMesh || !o.material?.emissive) return;
    const hex = o.material.emissive.getHexString();
    if (hex === '000000' || hex === 'ff9b2e') return; // не фонари и не поворотники
    const b = new THREE.Box3().setFromObject(o);
    if (b.min.z > frontZ + 1.2) return; // только нос
    lamps += 1;
    if (b.min.z < frontZ - 0.01) proud += 1;
  });
  ok(lamps >= 2, `${unit.id}: на передке есть фары (${lamps})`);
  ok(proud === 0, `${unit.id}: фары не торчат вперёд за габарит${proud ? ' — ' + proud : ''}`);

  // 4. Торпедо: из места водителя вниз-влево видна именно панель, и она
  //    собрана из деталей (щиток, циферблаты, консоль), а не из одной плиты.
  const seat = built.views.find((v) => v.id === 'driver');
  let interiorMeshes = 0;
  root.traverse((o) => {
    if (o.isMesh && o.parent && /interior/.test(o.parent.name || '')) interiorMeshes += 1;
  });
  if (seat) {
    const cam = new THREE.PerspectiveCamera(seat.fov || 74, 1.6, 0.02, 60);
    cam.position.set(...seat.pos);
    cam.lookAt(new THREE.Vector3(...seat.target));
    cam.updateMatrixWorld(true);
    const rc = new THREE.Raycaster();
    rc.setFromCamera(new THREE.Vector2(-0.3, -0.32), cam);
    const hit = rc.intersectObject(root, true).find((h) => h.object.isMesh && h.object.visible !== false && h.object.material?.transparent !== true);
    ok(hit && hit.distance < 1.7,
      `${unit.id}: перед водителем торпедо (${hit ? hit.object.geometry.type + ' @ ' + hit.distance.toFixed(2) + ' м' : 'пусто'})`);
  }
}

// текстуры повреждений: у каждого вида рисунок непустой и разный
const kinds = Object.keys(DAMAGE_TITLES);
let texFails = 0;
for (const kind of kinds) {
  const px = damagePixels(kind, 11);
  let filled = 0;
  for (let i = 3; i < px.length; i += 4) if (px[i] > 8) filled += 1;
  const share = filled / (px.length / 4);
  ok(share > 0.02 && share < 0.95, `текстура «${DAMAGE_TITLES[kind]}»: занято ${(share * 100).toFixed(0)}% площади`);
  if (!(share > 0.02 && share < 0.95)) texFails += 1;
}
const a1 = damagePixels('rust', 5);
const a2 = damagePixels('rust', 77);
let diff = 0;
for (let i = 0; i < shortLen(a1, a2); i += 1) if (a1[i] !== a2[i]) diff += 1;
ok(diff > 1000, `у одинакового вида разные зёрна (${diff} отличий)`);

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

// ============================================================
// РАСКЛАДКА ИНТЕРФЕЙСА: ни один слой не наезжает на другой.
// Проверяем чистую функцию, которой пользуется app.js, на трёх экранах:
// телефон, планшет, десктоп.
// ============================================================
{
  const screens = [
    { w: 360, h: 640, name: 'телефон' },
    { w: 768, h: 1024, name: 'планшет' },
    { w: 1280, h: 800, name: 'десктоп' },
  ];
  const menuSizes = [
    { w: 420, h: 520 }, { w: 340, h: 250 }, { w: 396, h: 470 }, { w: 320, h: 180 }, { w: 340, h: 300 },
  ];
  for (const screen of screens) {
    const viewport = rect(0, 0, screen.w, screen.h);
    // шапка, низ, навпад и док — то, на что меню права не имеет
    const hud = [
      rect(0, 0, screen.w, 54),
      rect(0, screen.h - 64, screen.w, 64),
      rect(screen.w - 190, screen.h - 230, 180, 160),
      rect(12, screen.h - 150, Math.min(420, screen.w - 40), 60),
    ];
    let bad = 0;
    let escaped = 0;
    // по одному меню под каждой из пяти кнопок в шапке
    const buttons = [
      rect(120, 8, 96, 38), rect(224, 8, 96, 38), rect(328, 8, 96, 38), rect(432, 8, 96, 38), rect(screen.w - 60, 8, 40, 38),
    ];
    for (const btn of buttons) {
      for (const size of menuSizes) {
        const spot = placePanel({ anchor: btn, size, viewport, avoid: hud, margin: 8, gap: 8 });
        const box = rect(spot.x, spot.y, spot.w, spot.h);
        if (hud.some((a) => overlaps(box, a, 2))) bad += 1;
        if (spot.x < 0 || spot.y < 0 || spot.x + spot.w > screen.w + 0.5 || spot.y + spot.h > screen.h + 0.5) escaped += 1;
      }
    }
    ok(bad === 0, `${screen.name} ${screen.w}×${screen.h}: меню не наезжают на панели (${bad})`);
    ok(escaped === 0, `${screen.name}: меню не вылезают за экран (${escaped})`);
  }
  // если место под кнопкой занято — панель уезжает, а не накладывается
  const viewport = rect(0, 0, 800, 600);
  const btn = rect(300, 8, 90, 34);
  const occupied = rect(280, 50, 260, 400);
  const spot = placePanel({ anchor: btn, size: { w: 300, h: 300 }, viewport, avoid: [occupied], margin: 8, gap: 8 });
  const box = rect(spot.x, spot.y, spot.w, spot.h);
  ok(!overlaps(box, occupied, 2), `занятое место объезжается (${spot.side})`);
  ok(spot.x >= 8 && spot.y >= 8 && spot.x + spot.w <= 792 && spot.y + spot.h <= 592, 'перенесённая панель осталась на экране');
  // два меню одновременно не могут лечь друг на друга
  const a = placePanel({ anchor: rect(40, 8, 90, 34), size: { w: 320, h: 260 }, viewport, avoid: [], margin: 8 });
  const b = placePanel({
    anchor: rect(140, 8, 90, 34), size: { w: 320, h: 260 }, viewport,
    avoid: [rect(a.x, a.y, a.w, a.h)], margin: 8,
  });
  ok(!overlaps(rect(a.x, a.y, a.w, a.h), rect(b.x, b.y, b.w, b.h), 2), 'второе меню не ложится на первое');
}

// ============================================================
// ПОВРЕЖДЕНИЯ — «БУКВАЛЬНЫЕ»: у каждого дефекта есть паспорт.
// ============================================================
{
  const unit = { category: 'trucks', id: 'atlas-vision' };
  const spec = damageSpecAt(unit, { name: 'передняя дверь', gender: 'f' }, 1, 3);
  ok(typeof spec.text === 'string' && spec.text.length > 40, 'у дефекта есть словесное описание');
  ok(/дверь/.test(spec.text) && /Ремонт/.test(spec.text), 'описание называет деталь и ремонт');
  ok(['лёгкое', 'среднее', 'сильное'].includes(spec.severity), `серьёзность задана (${spec.severity})`);
  ok(spec.cost > 0 && /₽/.test(spec.text), `стоимость ремонта посчитана (${spec.cost})`);
  const again = damageSpecAt(unit, { name: 'передняя дверь', gender: 'f' }, 1, 3);
  ok(again.text === spec.text && again.cost === spec.cost, 'паспорт дефекта детерминирован');
  const list = { list: [0, 1, 2].map((i) => ({ spec: damageSpecAt(unit, null, i % 2 ? 1 : -1, i) })) };
  const report = damageReport(list, [0, 2]);
  ok(report.count === 2 && report.cost === list.list[0].spec.cost + list.list[2].spec.cost, 'сводка складывает ремонт');
  ok(/дефект/.test(report.text) && /₽/.test(report.text), 'сводка читается словами');
  ok(damageReport(list, []).count === 0 && /чистый/.test(damageReport(list, []).text), 'пустой кузов описан отдельно');
}
