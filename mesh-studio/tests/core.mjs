#!/usr/bin/env node
/* Тесты ядра MESH STUDIO (mesh-studio/tests/core.mjs)

   Проверяем то, что легко сломать и трудно заметить глазами:
   имена без дублей, отмена и повтор, габариты для камеры, разбор ввода
   и корректность OBJ. Движок и браузер здесь не нужны.

   Запуск: node mesh-studio/tests/core.mjs                          */
import {
  nextName, addItem, removeItem, replaceItem, duplicateItem,
  createHistory, sceneStats, sceneBounds,
  parsePoints, parseLayer, toRecipe, fileName,
} from '../core.js';

let passed = 0;
let failed = 0;
function check(name, ok, detail = '') {
  if (ok) { passed++; console.log('  ✓', name); }
  else { failed++; console.log('  ✗', name, detail); }
}

const item = (name, id, tri = 12, pos = [0, 0, 0], b) => ({
  id, name, base: name.replace(/\s+\d+$/, ''), color: '#8fb8d8',
  position: pos, triCount: tri,
  bounds: b || { minX: -1, minY: 0, minZ: -1, maxX: 1, maxY: 2, maxZ: 1 },
  mesh: { id: `mesh-${id}`, triCount: tri },
  entityId: `ent-${id}`, op: 'primitive', args: { kind: 'box' },
});

console.log('Имена');
{
  const scene = [item('Куб 1', 'a'), item('Куб 2', 'b')];
  check('следующее имя продолжает нумерацию', nextName(scene, 'Куб') === 'Куб 3',
    nextName(scene, 'Куб'));
  check('первое имя начинается с единицы', nextName([], 'Сфера') === 'Сфера 1');
  check('пустое основание не даёт « 1»', nextName([], '') === 'Модель 1', nextName([], ''));
  check('пробелы в основании не ломают имя', nextName([], '  Кузов  ') === 'Кузов 1');
}

console.log('Сцена');
{
  const a = item('Куб 1', 'a');
  const b = item('Куб 2', 'b');
  let scene = addItem(addItem([], a), b);
  check('добавление сохраняет порядок', scene.map((x) => x.id).join(',') === 'a,b');

  const after = removeItem(scene, 'a');
  check('удаление убирает только нужное', after.length === 1 && after[0].id === 'b');
  check('удаление не мутирует исходную сцену', scene.length === 2);

  const patched = replaceItem(scene, 'b', { color: '#ff0000' });
  check('правка меняет только выбранную', patched[1].color === '#ff0000' && patched[0].color === '#8fb8d8');
  check('правка не мутирует исходную сцену', scene[1].color === '#8fb8d8');

  let n = 0;
  const dup = duplicateItem(scene, 'a', () => `id-${++n}`);
  check('дубликат получает новый id', dup.copy.id === 'id-1');
  check('дубликат получает свободное имя', dup.copy.name === 'Куб 3', dup.copy.name);
  check('дубликат добавляется в конец', dup.scene.length === 3 && dup.scene[2].id === 'id-1');
  check('дубликат делит проверенную геометрию',
    dup.scene[2].mesh.id === scene[0].mesh.id,
    'меш неизменяемый, копия должна ссылаться на тот же');

  const missing = duplicateItem(scene, 'нет-такого', () => 'x');
  check('дубликат несуществующего не ломает сцену', missing.copy === null && missing.scene === scene);
}

console.log('Отмена и повтор');
{
  const h = createHistory(5);
  h.init([]);
  check('в начале отменять нечего', !h.canUndo && !h.canRedo);

  h.push([item('Куб 1', 'a')]);
  h.push([item('Куб 1', 'a'), item('Куб 2', 'b')]);
  check('после двух действий отмена доступна', h.canUndo);
  check('текущее состояние — два предмета', h.state.length === 2);

  const u1 = h.undo();
  check('отмена возвращает предыдущее состояние', u1.length === 1);
  check('повтор стал доступен', h.canRedo);

  const r1 = h.redo();
  check('повтор возвращает вперёд', r1.length === 2);

  h.undo(); h.undo();
  check('глубже начала отмена не идёт', h.undo() === null);

  const h2 = createHistory(100);
  h2.init([]);
  for (let i = 0; i < 80; i++) h2.push([item(`Куб ${i + 1}`, `id${i}`)]);
  check('история не растёт бесконечно', h2.depth <= 100, `глубина ${h2.depth}`);

  const h3 = createHistory(3);
  h3.init([]);
  for (let i = 0; i < 10; i++) h3.push([item(`Куб ${i + 1}`, `id${i}`)]);
  check('история ограничена заданным размером', h3.depth === 3, `глубина ${h3.depth}`);

  // Новое действие после отмены должно сбрасывать «вперёд».
  const h4 = createHistory();
  h4.init([]);
  h4.push([item('Куб 1', 'a')]);
  h4.undo();
  h4.push([item('Куб 1', 'b')]);
  check('новое действие после отмены сбрасывает повтор', !h4.canRedo);
}

console.log('Статистика и габариты');
{
  const scene = [item('Куб 1', 'a', 12), item('Куб 2', 'b', 8)];
  const s = sceneStats(scene);
  check('треугольники суммируются', s.tris === 20, String(s.tris));
  check('модели считаются', s.meshes === 2);

  const empty = sceneBounds([]);
  check('пустая сцена даёт безопасные габариты', empty.empty && empty.radius > 0);

  const one = sceneBounds([item('Куб 1', 'a', 12, [0, 0, 0])]);
  check('центр одного куба посчитан', Math.abs(one.center[1] - 1) < 1e-9, String(one.center[1]));

  const two = sceneBounds([
    item('Куб 1', 'a', 12, [0, 0, 0]),
    item('Куб 2', 'b', 12, [10, 0, 0]),
  ]);
  check('смещение расширяет габариты', Math.abs(two.center[0] - 5) < 1e-9, String(two.center[0]));
  check('радиус растёт при разбросе', two.radius > one.radius);

  const noBounds = sceneBounds([{ id: 'x', mesh: null, triCount: 0 }]);
  check('модель без габаритов не ломает расчёт', noBounds.empty);
}

console.log('Разбор ввода');
{
  const pts = parsePoints('0,0; 0.6,0; 0.6,1.2');
  check('точки разобраны', pts.length === 3 && pts[1][0] === 0.6);
  check('пробелы не мешают', JSON.stringify(parsePoints(' 0 , 0 ; 1 , 0 ; 1 , 1 ')) === '[[0,0],[1,0],[1,1]]');
  check('отрицательные координаты допустимы', parsePoints('-1,-1; 1,-1; 0,1')[0][0] === -1);

  let threw = false;
  try { parsePoints('что-то'); } catch { threw = true; }
  check('мусор отвергается', threw);

  threw = false;
  try { parsePoints('0,0; 1,1'); } catch { threw = true; }
  check('двух точек мало для контура', threw);

  check('вертикальный слой разобран', parseLayer('(0;0)H1()') === '(0;0)H1()');
  check('наклонный слой разобран', parseLayer('(0;0)h3(1,0;0,1)') === '(0;0)h3(1,0;0,1)');
  check('отрицательные координаты слоя допустимы', parseLayer('(-2;3)H1()') === '(-2;3)H1()');
  const spaced = parseLayer('( 0 ; 0 )H1( )');
  check('пробелы внутри записи не ломают разбор', spaced === '( 0 ; 0 )H1( )', spaced);
  check('разбор с пробелами движок принимает', (() => {
    try { parseLayer(spaced); return true; } catch { return false; }
  })());

  threw = false;
  try { parseLayer('1x1, 3x3'); } catch { threw = true; }
  check('старый формат отвергается с подсказкой', threw);

  threw = false;
  try { parseLayer(''); } catch { threw = true; }
  check('пустой слой отвергается', threw);

  threw = false;
  try { parseLayer('(0;0)H2(1,0)'); } catch (e) { threw = /вертикальн/.test(e.message); }
  check('смещения при заглавной H отвергаются', threw);

  threw = false;
  try { parseLayer('(0;0)h2(каша)'); } catch { threw = true; }
  check('мусор в смещениях отвергается', threw);
}

console.log('Рецепт сцены');
{
  const scene = [
    item('Куб 1', 'a'),
    { ...item('Куб 2', 'b'), position: [2, 0, 0], op: 'lathe', args: { profile: [[0, 0], [1, 1], [0, 1]] } },
  ];
  const recipe = toRecipe(scene);
  check('рецепт содержит все модели', recipe.length === 2);
  check('операция сохранена', recipe[1].op === 'lathe', recipe[1].op);
  check('аргументы сохранены', Array.isArray(recipe[1].args.profile));
  check('позиция сохранена', JSON.stringify(recipe[1].position) === '[2,0,0]');
  check('рецепт сериализуется', (() => { try { JSON.stringify(recipe); return true; } catch { return false; } })());
  check('нет NaN в рецепте', !/NaN|undefined/.test(JSON.stringify(recipe)));
}

console.log('Имя файла');
{
  const f = fileName('mesh-studio', 'obj', new Date(2026, 10, 20, 9, 5));
  check('имя содержит дату и время', f === 'mesh-studio-20261120-0905.obj', f);
  check('расширение на месте', fileName('x', 'json').endsWith('.json'));
}

console.log(`\n${passed} пройдено, ${failed} провалено`);
if (failed) process.exit(1);
