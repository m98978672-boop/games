#!/usr/bin/env node
/* Стык редактора с движком (mesh-studio/tests/engine.mjs)

   Проверяем не «вызвалось без ошибки», а что движок действительно отдал
   геометрию и картинку: треугольники, габариты, сцену, кадр в пикселях.
   Отдельно ловим молчаливую подмену формы — именно так тор раньше
   превращался в сферу.

   Запуск: node mesh-studio/tests/engine.mjs                          */
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
  SHAPES, createShape, createLathe, createExtrude, createLayer,
  moveItem, recolorItem, removeItem, capture, exportScene,
} from '../engine-adapter.js';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');

global.window = global;
global.document = {
  createElement: () => ({ getContext: () => null, style: {}, addEventListener() {} }),
  addEventListener() {},
  querySelector: () => null,
  createElementNS: () => ({ style: {} }),
  body: { appendChild() {}, removeChild() {} },
};
require(path.join(root, 'ratcore/ratcore.bundle.js'));

const engine = global.RatCore.createEngine({});

let passed = 0;
let failed = 0;
function check(name, ok, detail = '') {
  if (ok) { passed++; console.log('  ✓', name); }
  else { failed++; console.log('  ✗', name, detail); }
}
const size = (b, axis) => b[`max${axis}`] - b[`min${axis}`];

console.log('Формы: каждая даёт свою геометрию');
const made = {};
{
  for (const s of SHAPES) {
    const item = createShape(engine, s.id);
    made[s.id] = item;
    check(`${s.label}: треугольники есть`, item.triCount > 0, String(item.triCount));
    check(`${s.label}: габариты не пустые`,
      size(item.bounds, 'X') > 0 && size(item.bounds, 'Z') > 0,
      JSON.stringify(item.bounds));
    check(`${s.label}: попала в сцену движка`, Boolean(item.entityId), String(item.entityId));
  }

  const sig = (id) => `${made[id].triCount}/${size(made[id].bounds, 'X').toFixed(2)}/${size(made[id].bounds, 'Y').toFixed(2)}`;
  const sigs = SHAPES.map((s) => sig(s.id));
  check('все формы различаются по геометрии',
    new Set(sigs).size === sigs.length, sigs.join(' | '));

  check('тор — кольцо, а не шар',
    size(made.torus.bounds, 'X') > 1.2 && size(made.torus.bounds, 'Y') < 0.5,
    `X=${size(made.torus.bounds, 'X').toFixed(2)} Y=${size(made.torus.bounds, 'Y').toFixed(2)}`);

  check('плоскость плоская по высоте',
    size(made.plane.bounds, 'Y') < 1e-6,
    `Y=${size(made.plane.bounds, 'Y')}`);

  check('куб — ровно 12 треугольников', made.box.triCount === 12, String(made.box.triCount));

  let bad = 0;
  for (const s of SHAPES) {
    const b = made[s.id].bounds;
    for (const k of ['minX', 'minY', 'minZ', 'maxX', 'maxY', 'maxZ']) {
      if (!Number.isFinite(b[k])) bad++;
    }
  }
  check('нет NaN и бесконечностей в габаритах', bad === 0, `плохих значений: ${bad}`);

  let badPos = 0;
  for (const s of SHAPES) for (const v of made[s.id].position) if (!Number.isFinite(v)) badPos++;
  check('позиции моделей числовые', badPos === 0);
}

console.log('Неизвестная форма отвергается');
{
  let threw = false;
  let msg = '';
  try { createShape(engine, 'нет-такой'); } catch (e) { threw = true; msg = e.message; }
  check('неизвестный id формы — понятная ошибка', threw && /Неизвестная форма/.test(msg), msg);

  const direct = engine.tools.build.primitive({ kind: 'что-угодно' });
  check('движок отвергает неизвестный вид примитива',
    direct.ok === false && direct.error && direct.error.code === 'RC-202',
    JSON.stringify(direct.error && direct.error.code));
}

console.log('Тело вращения');
{
  const profile = [[0, 0], [0.6, 0], [0.6, 0.4], [0.35, 1.2], [0.15, 1.6], [0, 1.6]];
  const item = createLathe(engine, profile, 16);
  check('профиль дал треугольники', item.triCount > 0, String(item.triCount));
  check('высота совпадает с профилем',
    Math.abs(size(item.bounds, 'Y') - 1.6) < 0.02,
    `Y=${size(item.bounds, 'Y').toFixed(3)}`);
  check('радиус совпадает с профилем',
    Math.abs(size(item.bounds, 'X') - 1.2) < 0.05,
    `X=${size(item.bounds, 'X').toFixed(3)}`);
  const coarse = createLathe(engine, profile, 6);
  check('меньше сегментов — меньше треугольников',
    coarse.triCount < item.triCount, `${coarse.triCount} < ${item.triCount}`);

  let threw = false;
  try { createLathe(engine, [[0, 0]], 12); } catch { threw = true; }
  check('профиль из одной точки отвергается', threw);
}

console.log('Экструзия');
{
  const contour = [[0, 0], [1, 0], [1, 0.6], [0.5, 1], [0, 0.6]];
  const item = createExtrude(engine, contour, 1);
  check('контур выдавился', item.triCount > 0, String(item.triCount));
  check('глубина стала высотой',
    Math.abs(size(item.bounds, 'Y') - 1) < 0.02,
    `Y=${size(item.bounds, 'Y').toFixed(3)}`);

  let threw = false;
  try { createExtrude(engine, [[0, 0], [1, 1]], 1); } catch { threw = true; }
  check('вырожденный контур отвергается, а не даёт мусор', threw);

  let threw2 = false;
  try { createExtrude(engine, [[0, 0], [1, 0], [2, 0]], 1); } catch { threw2 = true; }
  check('контур нулевой площади отвергается', threw2);
}

console.log('Воксельный слой');
{
  const one = createLayer(engine, '(0;0)H1()', 0.5);
  check('один воксель дал 12 треугольников', one.triCount === 12, String(one.triCount));
  check('размер вокселя соблюдён',
    Math.abs(size(one.bounds, 'X') - 0.5) < 1e-6 && Math.abs(size(one.bounds, 'Y') - 0.5) < 1e-6,
    JSON.stringify(one.bounds));

  const slope = createLayer(engine, '(0;0)h3(1,0;0,1)', 0.5);
  check('наклонный слой собрался', slope.triCount > one.triCount,
    `${slope.triCount} > ${one.triCount}`);
  check('наклонный слой шире одного вокселя',
    size(slope.bounds, 'X') > size(one.bounds, 'X'),
    `X=${size(slope.bounds, 'X').toFixed(2)}`);

  let threw = false;
  try { createLayer(engine, 'каша', 0.25); } catch { threw = true; }
  check('мусорное обозначение слоя отвергается', threw);
}

console.log('Сцена: перенос, перекраска, удаление');
{
  const item = createShape(engine, 'box', { position: [1, 1, 0] });
  const moved = moveItem(engine, item, [3, 3, 0.5]);
  check('перенос меняет позицию', moved.position[0] === 3 && moved.position[1] === 3,
    JSON.stringify(moved.position));
  check('перенос сохраняет ту же модель', moved.entityId === item.entityId);

  const recolored = recolorItem(engine, moved, '#ff8844');
  check('перекраска меняет цвет', recolored.color === '#ff8844', recolored.color);
  check('перекраска сохраняет позицию',
    JSON.stringify(recolored.position) === JSON.stringify(moved.position),
    JSON.stringify(recolored.position));
  check('перекраска даёт новый меш', recolored.mesh.id !== moved.mesh.id);

  const removed = removeItem(engine, recolored);
  check('удаление возвращает модель', Boolean(removed.id));

  let double = true;
  try { removeItem(engine, recolored); } catch { double = false; }
  check('повторное удаление не роняет редактор', double);
}

console.log('Кадр');
{
  engine.tools.look.at({ x: 0, y: 0, h: 0, targetX: 0, targetY: 0, targetH: 0 });
  const empty = capture(engine, { x: 0, y: -6, h: 2, targetX: 0, targetY: 0, targetH: 1.5 }, 160, 120);
  check('кадр нужного размера', empty.width === 160 && empty.height === 120);
  check('пиксели пришли', empty.pixels && empty.pixels.length === 160 * 120,
    String(empty.pixels && empty.pixels.length));
  check('программный рендер доступен без GPU',
    empty.backend === 'software' || empty.backend === 'webgl2', String(empty.backend));

  const filledEmpty = empty.filled;
  createShape(engine, 'box', { args: { width: 3, height: 3, depth: 3 } });
  const shot = capture(engine, { x: 0, y: -6, h: 2, targetX: 0, targetY: 0, targetH: 1.5 }, 160, 120);
  check('модель увеличила заполнение кадра',
    shot.filled > filledEmpty,
    `${filledEmpty} → ${shot.filled}`);
  check('треугольники попали в отрисовку', shot.tris > 0, String(shot.tris));

  // Куб симметричен, поэтому одинаковые виды слева и справа дали бы одно и
  // то же. Ставим вторую модель со сдвигом — тогда вид честно зависит от камеры.
  createShape(engine, 'cylinder', { position: [2.2, 0, 0] });
  const camA = capture(engine, { x: -5, y: -5, h: 3, targetX: 0, targetY: 0, targetH: 1 }, 120, 90);
  const camB = capture(engine, { x: 5, y: -5, h: 3, targetX: 0, targetY: 0, targetH: 1 }, 120, 90);
  let differ = 0;
  for (let i = 0; i < camA.pixels.length; i++) if (camA.pixels[i] !== camB.pixels[i]) differ++;
  check('смена камеры меняет картинку', differ > 0, `различий: ${differ}`);
}

console.log('Экспорт сцены');
{
  const scene = [createShape(engine, 'box'), createShape(engine, 'sphere')];
  const saved = exportScene(engine, scene);
  check('формат указан', saved.schema === 'mesh-studio/1', saved.schema);
  check('обе модели в файле', saved.models.length === 2);
  check('треугольники записаны', saved.models.every((m) => m.tris > 0));
  check('итог по треугольникам сходится',
    saved.totals.tris === scene[0].triCount + scene[1].triCount,
    String(saved.totals.tris));
  check('данные сериализуются в JSON',
    (() => { try { JSON.stringify(saved); return true; } catch { return false; } })());
  check('имена форм сохранены',
    saved.models[0].name && saved.models[1].name,
    saved.models.map((m) => m.name).join(', '));
}

console.log('Адаптер устойчив к пустому движку');
{
  let threw = false;
  try { createShape({}, 'box'); } catch (e) { threw = /tools\.build/.test(e.message); }
  check('без движка — понятная ошибка, а не падение', threw);
}

console.log(`\n${passed} пройдено, ${failed} провалено`);
if (failed) process.exit(1);
