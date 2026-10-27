// v0.16: обводки моделей из невидимых треугольников (F3 → Ж), разные оттенки
// почвы, новые породы деревьев, ровные площадки под постройки, новые звери и рыбы.
// Запуск: node tests/v016.mjs (нужен npm run test:build)
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve(import.meta.dirname, '..');
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const dom = new JSDOM(html, { url: 'https://example.com/', pretendToBeVisual: true, runScripts: 'outside-only' });
const { window } = dom;
globalThis.window = window;
globalThis.document = window.document;
Object.defineProperty(globalThis, 'navigator', { value: window.navigator, configurable: true });
globalThis.HTMLElement = window.HTMLElement;
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 16);
globalThis.localStorage = window.localStorage;
window.requestAnimationFrame = globalThis.requestAnimationFrame;

new Function(fs.readFileSync(path.join(dir, 'tests/.harness-bundle.js'), 'utf8'))();
window.document.dispatchEvent(new window.Event('DOMContentLoaded', { bubbles: true }));
window.document.getElementById('btn-start').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
await new Promise((r) => setTimeout(r, 300));

const game = window.__game;
const w = game.world;
const key = (code) => window.dispatchEvent(new window.KeyboardEvent('keydown', { code, bubbles: true }));

// --- 1. у каждой модели своя обводка, сквозь неё не пройти ---
const kinds = {};
for (const p of w.shells.prisms) kinds[p.kind] = (kinds[p.kind] || 0) + 1;
w.shells.buildDebug();
const tris = w.shells.stats.triangles;
const tree = w.treeList.find((t) => t.shell && t.collider && !t.collider.disabled && !t.collider.soft);
const pos = { x: tree.x + 5, z: tree.z };
const vel = { x: -6, z: 0 };
let pushes = 0;
for (let i = 0; i < 250; i++) {
  pos.x += vel.x * 0.016;
  pushes += w.shells.resolve(pos, 0.35, vel, w.heightAt(pos.x, pos.z));
}
console.log('обводки:', w.shells.stats.prisms, 'моделей ·', tris, 'треугольников ·',
  Object.entries(kinds).map(([k, v]) => `${k} ${v}`).join(', '));
console.log('  герой шёл в дерево: остановился в', (pos.x - tree.x).toFixed(2),
  'м · выталкиваний', pushes, '· сквозь модель не прошёл:', pos.x - tree.x > 0.3);

// обводка убирается вместе с моделью
const was = tree.collider.disabled;
tree.collider.disabled = true;
const inside = { x: tree.x, z: tree.z };
w.shells.resolve(inside, 0.35, null, w.heightAt(inside.x, inside.z));
console.log('  спиленное дерево обводку снимает:', Math.abs(inside.x - tree.x) < 1e-6);
tree.collider.disabled = was;

// --- 2. F3 → Ж показывает обводки ---
key('F3');
const armed = game.debugArmed;
key('Semicolon');
const shown = w.shells.debug && w.shells.group.visible && !!w.shells.lines;
key('F3');
key('Semicolon');
const hidden = !w.shells.debug && !w.shells.group.visible;
console.log('F3 → Ж: обводки включились:', armed && shown, '· выключились:', hidden);

// --- 3. почва и трава — разные оттенки ---
{
  const geo = w.terrain.geometry;
  const col = geo.attributes.color;
  const posAttr = geo.attributes.position;
  const grassHues = new Set();
  const soilHues = new Set();
  for (let i = 0; i < posAttr.count; i += 3) {
    const y = posAttr.getY(i);
    const r = col.getX(i);
    const g = col.getY(i);
    const b = col.getZ(i);
    const key2 = `${r.toFixed(2)},${g.toFixed(2)},${b.toFixed(2)}`;
    if (y > 2.6 && y < 14) grassHues.add(key2);
    if (y > 1.2 && y < 2.6) soilHues.add(key2);
  }
  console.log('оттенки: травяных', grassHues.size, '· песчаных/почвенных', soilHues.size,
    '· растительность и почва не одной заливкой:', grassHues.size > 40 && soilHues.size > 20);
}

// --- 4. новые породы деревьев ---
console.log('деревья: сосны', w.pineList.length, '· мангры', w.mangroveList.length,
  '· сухостой', w.deadList.length);
const pine = w.pineList[0];
const mang = w.mangroveList[0];
const dead = w.deadList[0];
const shapes = [pine, mang, dead].map((t) => t && `${t.bbox.h.toFixed(1)}×${t.bbox.w.toFixed(1)}`);
console.log('  силуэты (высота × ширина):', shapes.join(' · '), '· все разные:',
  new Set(shapes).size === 3);

// --- 5. постройка встаёт на ровную площадку ---
{
  const p = game.player.position;
  let spot = null;
  for (let r = 4; r <= 22 && !spot; r += 1.5) {
    for (let i = 0; i < 16 && !spot; i++) {
      const a = (i / 16) * Math.PI * 2;
      const x = p.x + Math.cos(a) * r;
      const z = p.z + Math.sin(a) * r;
      if (w.heightAt(x, z) > 3 && w.slopeAt(x, z) > 0.12 && w.isFree(x, z, 2.2)) spot = { x, z };
    }
  }
  const before = w.slopeAt(spot.x, spot.z);
  const y = w.levelSpot(spot.x, spot.z, 1.7);
  let dev = 0;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    for (const d of [0.2, 0.5, 0.8]) {
      dev = Math.max(dev, Math.abs(w.heightAt(spot.x + Math.cos(a) * d, spot.z + Math.sin(a) * d) - y));
    }
  }
  console.log('площадка: уклон был', before.toFixed(2), '→ стал', w.slopeAt(spot.x, spot.z).toFixed(2),
    '· перепад по площадке', dev.toFixed(3), 'м · ровно:', dev < 0.05);
}

// --- 6. новые звери и рыбы ---
const counts = {};
for (const m of game.mobs.list) counts[m.type] = (counts[m.type] || 0) + 1;
console.log('звери:', Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(' · '));
const fishes = game.mobs.list.filter((m) => m.type === 'fish');
const inWater = fishes.every((f) => w.heightAt(f.x, f.z) < -0.5);
const monkey = game.mobs.list.find((m) => m.type === 'monkey');
const turtle = game.mobs.list.find((m) => m.type === 'turtle');
const fish = fishes[0];
const moved = (mob, part) => {
  if (!part) return false;
  const before = part.rotation.x + part.rotation.y + part.rotation.z;
  mob.speedNow = 1.5;
  mob.phase += 1.1;
  game.mobs._animate(mob, 0.1);
  mob.phase += 1.1;
  game.mobs._animate(mob, 0.1);
  return Math.abs(part.rotation.x + part.rotation.y + part.rotation.z - before) > 1e-4;
};
console.log('  анимация: обезьяна лапы', moved(monkey, monkey.parts.legs[0]),
  '· руки', moved(monkey, monkey.parts.arms[0]),
  '· черепаха лапы', moved(turtle, turtle.parts.legs[0]),
  '· рыба хвост', moved(fish, fish.parts.tail));
console.log('  рыбы в воде:', inWater, '· плавают под поверхностью:',
  Math.abs(fish.group.position.y) < 2 || fish.group.position.y < 0);

console.log('ошибок нет');
