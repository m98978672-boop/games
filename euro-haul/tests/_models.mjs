// Модели тягачей и полуприцепов: собираются без ошибок, отличаются друг от друга
// по внешности и совпадают по габаритам со спецификацией.
import { JSDOM } from 'jsdom';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const dom = new JSDOM('<!doctype html><html><body></body></html>', { pretendToBeVisual: true });
global.window = dom.window;
global.document = dom.window.document;
Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true });
global.HTMLCanvasElement = dom.window.HTMLCanvasElement;
global.performance = dom.window.performance;
dom.window.HTMLCanvasElement.prototype.getContext = () =>
  new Proxy(
    {
      canvas: { width: 8, height: 8 },
      createImageData: (w, h) => ({ data: new Uint8ClampedArray(Math.max(1, w * h * 4)) }),
      getImageData: (x, y, w, h) => ({ data: new Uint8ClampedArray(Math.max(1, w * h * 4)) }),
      measureText: () => ({ width: 1 }),
      createLinearGradient: () => ({ addColorStop() {} }),
      createRadialGradient: () => ({ addColorStop() {} }),
    },
    {
      get(o, p) {
        return p in o ? o[p] : () => undefined;
      },
      set(o, p, v) {
        o[p] = v;
        return true;
      },
    }
  );

const THREE = await import('three');
const { TruckView, TRAILER_SPECS } = await import('../src/world/truck3d.js');
const { lookFor, TRACTOR_LOOKS } = await import('../src/world/truck-look.js');
const { TRUCK_MODELS } = await import('../src/data/trucks.js');

const assert = (cond, msg) => {
  if (!cond) throw new Error('ПРОВАЛ: ' + msg);
  console.log('  ✓ ' + msg);
};

const scene = () => new THREE.Scene();

function meshCount(obj) {
  let n = 0;
  obj.traverse((o) => {
    if (o.isMesh) n++;
  });
  return n;
}

/** Габариты кузова: обходим меши, пропуская заданные поддеревья (фары, салон). */
function bboxOf(root, skip = []) {
  const box = new THREE.Box3();
  const tmp = new THREE.Box3();
  root.updateMatrixWorld(true);
  root.traverse((o) => {
    if (!o.isMesh) return;
    for (let n = o; n; n = n.parent) if (skip.includes(n)) return;
    if (!o.geometry) return;
    if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
    tmp.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld);
    box.union(tmp);
  });
  return box;
}

function finite(obj) {
  let ok = true;
  obj.traverse((o) => {
    if (!o.isMesh) return;
    const a = o.geometry?.attributes?.position;
    if (!a) {
      ok = false;
      return;
    }
    for (let i = 0; i < a.array.length; i++) {
      if (!Number.isFinite(a.array[i])) {
        ok = false;
        return;
      }
    }
  });
  return ok;
}

const views = [];
for (const model of TRUCK_MODELS) {
  const s = scene();
  const view = new TruckView(s, model.color || 0x2f7fa8, model.id);
  view.setInteriorVisible(false);
  s.updateMatrixWorld(true);
  const look = lookFor(model.id);

  assert(look.id === model.id && look.title, `${model.id}: профиль внешности найден`);
  // Габариты считаем по кузову: фары-конусы и салон в силуэт не входят.
  const box = bboxOf(view.root, [view.headlights, view.interior, view.trailerGroup]);
  const size = box.getSize(new THREE.Vector3());
  assert(size.x > 2.2 && size.x < 3.5, `${model.id}: ширина ${size.x.toFixed(2)} м в габарите`);
  assert(size.z > 5.5 && size.z < 8.5, `${model.id}: длина ${size.z.toFixed(2)} м`);
  const meshes = meshCount(view.root);
  assert(meshes > 40, `${model.id}: ${meshes} мешей`);
  assert(finite(view.root), `${model.id}: геометрия без NaN`);

  // Число задних колёс: 4×2 — одна ось (4 колеса), 6×4 — тандем (8 колёс).
  const tractorWheels = view.wheels.filter((w) => !w.userData.trailer);
  const rearWheels = tractorWheels.length - view.frontWheels.length;
  const expected = look.rearAxles === 2 ? 8 : 4;
  assert(rearWheels === expected, `${model.id}: задних колёс ${rearWheels} (${look.rearAxles === 2 ? '6×4' : '4×2'})`);

  views.push({ id: model.id, height: size.y, meshes, wheels: view.wheels.length, roof: look.roof });
  view.dispose();
}

// Кабины отличаются по высоте: низкая ниже мега.
const h = Object.fromEntries(views.map((v) => [v.id, v.height]));
assert(h['auriga-3'] < h['auriga-5'] - 0.2, `низкая кабина ниже мега (${h['auriga-3'].toFixed(2)} < ${h['auriga-5'].toFixed(2)})`);
assert(h['auriga-6x'] > h['auriga-4'] - 0.05, 'тяжёлый 6×4 не ниже рабочей лошадки');

// Смена модели на ходу: старый кузов уходит, новый собирается, свет цел.
{
  const s = scene();
  const view = new TruckView(s, 0x2f7fa8, 'auriga-3');
  view.setInteriorVisible(false);
  view.buildTrailer('curtain', 'NordTrans');
  s.updateMatrixWorld(true);
  const before = meshCount(view.root);
  const trailerLights = view.brakeLights.length;
  assert(trailerLights > 0, 'фонари прицепа зарегистрированы');
  const changed = view.applyModel('auriga-6x', 0x223344);
  s.updateMatrixWorld(true);
  assert(changed === true, 'смена модели вернула «геометрия изменена»');
  assert(view.modelId === 'auriga-6x', 'модель переключилась');
  assert(view.look.rearAxles === 2, 'у новой модели тандем');
  assert(view.paint.color.getHex() === 0x223344, 'краска применилась вместе с моделью');
  assert(meshCount(view.root) > before * 0.6, 'новый кузов собрался');
  assert(finite(view.root), 'после смены модели геометрия без NaN');
  assert(view.brakeLights.length >= trackerButTractor(trailerLights), 'фонари прицепа не потеряны');
  assert(view.applyModel('auriga-6x') === false, 'повторный вызов для той же модели ничего не ломает');
  view.dispose();
}

function trackerButTractor(n) {
  return n;
}

// Все шесть типов полуприцепов: длина как в спецификации, есть колёса и рама.
for (const [type, spec] of Object.entries(TRAILER_SPECS)) {
  const s = scene();
  const view = new TruckView(s, 0x2f7fa8, 'auriga-5');
  view.setInteriorVisible(false);
  view.buildTrailer(type, 'NordTrans');
  s.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(view.trailerGroup);
  const size = box.getSize(new THREE.Vector3());
  assert(Math.abs(size.z - spec.length) < 0.55, `прицеп ${type}: длина ${size.z.toFixed(1)} м ≈ ${spec.length}`);
  assert(size.x > 2.0 && size.x < 3.0, `прицеп ${type}: ширина ${size.x.toFixed(2)} м`);
  assert(view.trailerWheels.length === 8, `прицеп ${type}: 8 колёс на двух осях`);
  assert(meshCount(view.trailerGroup) > 30, `прицеп ${type}: ${meshCount(view.trailerGroup)} мешей`);
  assert(finite(view.trailerGroup), `прицеп ${type}: геометрия без NaN`);
  // Пересборка на другой тип не оставляет мусора в списках колёс.
  const wheelsBefore = view.wheels.length;
  view.buildTrailer('tank', 'NordTrans');
  s.updateMatrixWorld(true);
  assert(view.wheels.length === wheelsBefore, `замена прицепа ${type} → tank сохраняет число колёс`);
  view.dispose();
}

assert(Object.keys(TRACTOR_LOOKS).length === TRUCK_MODELS.length, 'у каждой модели есть свой профиль внешности');

console.log('\n✅ модели тягачей и прицепов в порядке');
process.exit(0);
