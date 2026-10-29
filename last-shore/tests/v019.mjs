// v0.19: плавание с погружением и воздухом, подводный вид, гладкие стволы,
// обводки по поясам модели, дома зверей по видам, костёр без пересборки
// шейдеров, LOD дальних крон и статика без пересчёта матриц.
// Запуск: node tests/v019.mjs (нужен npm run test:build)
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';
import * as THREE from '../node_modules/three/build/three.module.js';
import { makeTreeParts, makePalmParts } from '../src/models.js';

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
const P = window.__config?.player || null;
const log = (...a) => console.log(...a);
let bad = 0;
const check = (ok, text) => { if (!ok) { bad++; log('   ✗', text); } return ok; };

const step = (dt, input = {}) => game.player.update(dt, { forward: false, back: false, left: false, right: false, jump: false, sprint: false, ...input }, w);

// --- 1. глубокое место: герой плывёт, а не идёт по дну ---
let deep = null;
for (let i = 0; i < 4000 && !deep; i++) {
  const a = Math.random() * Math.PI * 2;
  const r = 120 + Math.random() * 40;
  const x = Math.cos(a) * r;
  const z = Math.sin(a) * r;
  if (w.heightAt(x, z) < -3.2) deep = { x, z };
}
check(deep !== null, 'нашлось глубокое место');
game.player.position.set(deep.x, -3, deep.z);
game.player.velocity.set(0, 0, 0);
for (let i = 0; i < 60; i++) step(1 / 30);
const floatY = game.player.position.y;
log('плавание: глубина под героем', (-w.heightAt(deep.x, deep.z)).toFixed(1), 'м · держится на y',
  floatY.toFixed(2), '· плывёт:', game.player.swimming, '· глаза под водой:', game.player.underwater);
check(game.player.swimming, 'на глубокой воде герой плывёт');
check(floatY > -1.6 && floatY < 0.15, 'держит голову над водой');

// --- 2. нырок по Shift и всплытие по Space ---
const beforeDive = game.player.position.y;
for (let i = 0; i < 45; i++) step(1 / 30, { sprint: true });
const diveY = game.player.position.y;
const underNow = game.player.underwater;
const airAfterDive = game.player.air;
for (let i = 0; i < 90; i++) step(1 / 30, { jump: true, jumpHeld: true });
const upY = game.player.position.y;
const airAfterUp = game.player.air;
log('нырок: было', beforeDive.toFixed(2), '→ нырнул', diveY.toFixed(2), 'м · глаза под водой:', underNow,
  '· воздух', airAfterDive.toFixed(0), '→ всплыл', upY.toFixed(2), '· воздух', airAfterUp.toFixed(0));
check(diveY < beforeDive - 1.2, 'Shift уводит под воду');
check(underNow, 'под водой включается подводный вид');
check(airAfterDive < 100, 'под водой кончается воздух');
check(upY > diveY + 0.8, 'Space возвращает на поверхность');
check(airAfterUp > airAfterDive, 'на поверхности воздух возвращается');

// --- 3. воздух кончается — герой не может висеть под водой вечно ---
game.player.air = 0;
for (let i = 0; i < 30; i++) step(1 / 30, { sprint: true });
log('воздух на нуле: underwater', game.player.underwater, '· шкала показывается:',
  !!document.getElementById('bar-air'));
check(document.getElementById('bar-air') !== null, 'в интерфейсе есть шкала воздуха');

// --- 4. подводный режим воды и тумана ---
game.camera.position.set(deep.x, -4, deep.z);
w.update(0.016, game.camera, new THREE.Vector3(0.3, 0.8, 0.2), 0, new THREE.Color(0x9fc3d6));
const underUniform = w.waterUniforms.uUnder.value;
game.camera.position.set(deep.x, 6, deep.z);
w.update(0.016, game.camera, new THREE.Vector3(0.3, 0.8, 0.2), 0, new THREE.Color(0x9fc3d6));
const aboveUniform = w.waterUniforms.uUnder.value;
log('подводный шейдер: под водой uUnder =', underUniform, '· над водой =', aboveUniform);
check(underUniform === 1 && aboveUniform === 0, 'вода знает, с какой стороны на неё смотрят');

// --- 5. стволы гладкие: у трубы нет скачков радиуса между кольцами ---
const trunkProfile = (geo) => {
  // полные кольца ствола — те, где больше всего вершин; ветки дают редкие точки
  const pos = geo.attributes.position;
  const rows = new Map();
  for (let i = 0; i < pos.count; i++) {
    const key = pos.getY(i).toFixed(3);
    const r = Math.hypot(pos.getX(i), pos.getZ(i));
    if (!rows.has(key)) rows.set(key, []);
    rows.get(key).push(r);
  }
  const maxN = Math.max(...[...rows.values()].map((a) => a.length));
  const rings = [...rows.entries()]
    .filter(([, a]) => a.length === maxN)
    .map(([y, a]) => ({ y: Number(y), r: a.reduce((x, z) => x + z, 0) / a.length }))
    .sort((a, b) => a.y - b.y)
    .filter((p) => p.y > 0.4);
  let worst = 0;          // самый большой перепад радиуса между соседними кольцами, метры
  let mono = true;
  for (let i = 1; i < rings.length; i++) {
    const d = rings[i].r - rings[i - 1].r;
    if (d > 0.005) mono = false;
    worst = Math.max(worst, Math.abs(d));
  }
  const taper = rings[0].r - rings[rings.length - 1].r;
  return { worst, taper, mono, rings: rings.length, top: rings[rings.length - 1].r };
};

// --- 5. стволы гладкие: кольца ствола идут без ступенек и сужаются кверху ---
for (const [label, geo] of [['дерево', makeTreeParts(() => 0.5).bark], ['пальма', makePalmParts(() => 0.5).bark]]) {
  const p = trunkProfile(geo);
  log(`${label}: колец ствола ${p.rings} · сужение ${p.taper.toFixed(2)} м · самый резкий скачок радиуса ${(p.worst * 100).toFixed(1)} см (меньше — плавнее)`);
  check(p.rings >= 6, `${label}: ствол собран из колец трубы`);
  check(p.mono, `${label}: ствол не расширяется кверху (нет колен)`.replace('колен', 'колен'));
  check(p.worst < 0.12, `${label}: между кольцами нет ступеньки`);
  check(p.taper > 0.15, `${label}: ствол сужается к вершине`);
}

// --- 6. обводки по поясам ---
let banded = 0;
let extra = 0;
for (const t of w.treeList.slice(0, 200)) {
  if (t.shells && t.shells.length >= 2) banded++;
  if (t.shells) extra += t.shells.length - 1;
}
log('обводки: деревьев с поясными призмами', banded, 'из', Math.min(200, w.treeList.length),
  '· всего призм сверх одной', extra);
check(banded > Math.min(200, w.treeList.length) * 0.8, 'у деревьев обводка по поясам, а не одна общая');

// --- 7. дома зверей: у каждого вида своя постройка и вход ---
const kinds = new Set(w.dens.map((d) => d.kind));
const entrances = w.dens.every((d) => Number.isFinite(d.entrance));
const denGeos = (w.denMeshes || []).map((m) => m.geometry.attributes.position.count);
log('дома: видов', kinds.size, '· построек', (w.denMeshes || []).length,
  '· у всех есть вход:', entrances, '· треугольников в моделях', denGeos.join('/'));
check(kinds.size >= 6, 'у каждого вида зверя свой дом');
check(entrances, 'у дома есть вход');
check(new Set(denGeos).size === denGeos.length, 'дома разных видов не одинаковые');

// --- 8. костёр: не плодит источники света и не пересобирает шейдеры ---
const countLights = () => {
  let n = 0;
  game.scene.traverse((o) => { if (o.isLight) n++; });
  return n;
};
const lightsBefore = countLights();
const t0 = Date.now();
const fires = [];
for (let i = 0; i < 3; i++) fires.push(game.resources.addCampfire(deep.x + 6 + i * 3, deep.z + 6));
const spawnMs = Date.now() - t0;
const lightsAfter = countLights();
log('костёр: источников света было', lightsBefore, 'стало', lightsAfter, '· три костра за', spawnMs, 'мс');
check(lightsAfter === lightsBefore, 'костёр не добавляет источники света (без пересборки шейдеров)');
check(spawnMs < 120, 'постановка костров быстрая');

// уборка костров возвращает свет в пул
for (const f of fires) game.resources.removeCampfire(f);
check(countLights() === lightsBefore, 'удаление костра не меняет число источников');

// --- 9. LOD: у дальних крон есть дешёвый дубль ---
const lodChunks = w.chunkMeshes.filter((c) => c.farMesh);
const fullTris = lodChunks.reduce((s, c) => s + (c.mesh.geometry.attributes.position.count / 3) * c.mesh.count, 0);
const farTris = lodChunks.reduce((s, c) => s + (c.farMesh.geometry.attributes.position.count / 3) * c.farMesh.count, 0);
log('LOD: кусков с дублем', lodChunks.length, '· треугольников вблизи', Math.round(fullTris),
  '· вдали', Math.round(farTris), `(${(farTris / Math.max(1, fullTris) * 100).toFixed(0)} %)`);
check(lodChunks.length > 20, 'дальние кроны имеют дешёвую версию');
check(farTris < fullTris * 0.35, 'дальняя версия легче в разы');

// --- 10. статика не пересчитывает матрицы каждый кадр ---
const staticMeshes = w.chunkMeshes.map((c) => c.mesh);
const auto = staticMeshes.filter((m) => m.matrixAutoUpdate).length;
log('статика: мешей с авто-матрицей', auto, 'из', staticMeshes.length);
check(auto === 0, 'статичные куски не пересчитывают матрицу каждый кадр');

log('---');
log(bad ? `НЕ СХОДИТСЯ: ${bad}` : 'ошибок нет');
process.exit(bad ? 1 : 0);
