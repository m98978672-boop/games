// ============================================================
// Тест бота стыков: он должен находить дырки там, где они есть,
// и молчать там, где поверхности закрыты.
//   node tests/seams.mjs
// ============================================================
import * as THREE from 'three';
import { analyzeSeams, seamVerdict } from '../src/lib/seams.js';
import { createMaterials } from '../src/lib/kit.js';
import { buildUnit } from '../src/models/index.js';
import { findUnit } from '../src/data/units.js';

const ok = [];
const check = (name, cond, extra = '') => ok.push(`${cond ? 'PASS' : 'FAIL'} ${name}${extra ? ' — ' + extra : ''}`);

// ---------------------------------------------------------- 1. закрытый ящик
{
  const root = new THREE.Group();
  root.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial()));
  const r = analyzeSeams(root);
  check('закрытый ящик: нет открытых рёбер', r.edges === 0, `рёбер ${r.edges}`);
  check('закрытый ящик: нет дырок', r.holeCount === 0, `дырок ${r.holeCount}`);
  check('вердикт по ящику положительный', seamVerdict(r).ok);
}

// ---------------------------------------------------------- 2. ящик без крышки
{
  const root = new THREE.Group();
  const geo = new THREE.BoxGeometry(1, 1, 1);
  // выбрасываем верхнюю грань (2 треугольника) — получаем дырку
  const idx = geo.index.array.slice();
  const trimmed = idx.slice(0, idx.length - 6);
  geo.setIndex(Array.from(trimmed));
  root.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial()));
  const r = analyzeSeams(root);
  check('ящик без крышки: открытые рёбра найдены', r.edges >= 4, `рёбер ${r.edges}`);
  check('ящик без крышки: контур замкнулся', r.loops >= 1, `контуров ${r.loops}`);
  check('ящик без крышки: это не дырка (рядом нет деталей), а открытый край',
    r.holeCount === 0 && r.openCount >= 1, `дырок ${r.holeCount}, краёв ${r.openCount}`);
}

// ---------------------------------------------------------- 3. щель между деталями
{
  const root = new THREE.Group();
  const a = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 0.1), new THREE.MeshStandardMaterial());
  a.position.set(0, 0, 0);
  root.add(a);
  // пластина с открытой гранью в 30 мм от бока ящика → незакрытый стык
  const plate = new THREE.BoxGeometry(1, 1, 0.4);
  const idx = Array.from(plate.index.array);
  plate.setIndex(idx.slice(0, idx.length - 6));
  const b = new THREE.Mesh(plate, new THREE.MeshStandardMaterial());
  b.position.set(0, 0, 0.28); // 30 мм зазора между боками
  root.add(b);
  const r = analyzeSeams(root, { gap: 0.02 });
  check('щель 30 мм: найдена дырка на стыке', r.holeCount >= 1, `дырок ${r.holeCount}`);
  check('щель 30 мм: зазор измерен', (r.holes[0]?.maxGap || 0) > 0.02,
    `${Math.round((r.holes[0]?.maxGap || 0) * 1000)} мм`);
  check('щель 30 мм: вердикт отрицательный', !seamVerdict(r).ok);
  check('у дырки есть признак «на виду / внутри»', typeof r.holes[0].exposed === 'boolean',
    String(r.holes[0].exposed));
}

// ---------------------------------------------------------- 4. плотный стык
{
  const root = new THREE.Group();
  const a = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 0.1), new THREE.MeshStandardMaterial());
  root.add(a);
  const plate = new THREE.BoxGeometry(1, 1, 0.4);
  const idx = Array.from(plate.index.array);
  plate.setIndex(idx.slice(0, idx.length - 6));
  const b = new THREE.Mesh(plate, new THREE.MeshStandardMaterial());
  b.position.set(0, 0, 0.252); // 2 мм — стык закрыт
  root.add(b);
  const r = analyzeSeams(root, { gap: 0.02 });
  check('плотный стык 2 мм не считается дыркой', r.holeCount === 0, `дырок ${r.holeCount}`);
}

// ---------------------------------------------------------- 5. настоящая модель
{
  const M = createMaterials(null);
  const built = buildUnit({ ...findUnit('trucks', 'atlas-vision'), category: 'trucks' }, M);
  const r = analyzeSeams(built.root);
  check('на модели считаются треугольники', r.tris > 1000, `треугольников ${r.tris}`);
  check('на модели есть замкнутые контуры', r.loops > 0, `контуров ${r.loops}`);
  check('в отчёте нет NaN', r.holes.every((h) => Number.isFinite(h.maxGap))
    && r.seams.every((h) => Number.isFinite(h.maxGap)));
  check('есть точка привязки у каждой дырки', r.holes.every((h) => h.center.length === 3 && h.center.every(Number.isFinite)));
}

const fails = ok.filter((l) => l.startsWith('FAIL'));
console.log(ok.join('\n'));
console.log(`\nБот стыков: ${ok.length - fails.length}/${ok.length} проверок пройдено.`);
if (fails.length) process.exit(1);
