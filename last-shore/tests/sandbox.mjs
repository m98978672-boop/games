// v0.12: песочница механик — животные лицом вперёд, хитбоксы по модели,
// зазор 5 см, креатив (F2→F), копание слоя, осыпание и вода, ранения.
// Запуск: node tests/sandbox.mjs (нужен npm run test:build)
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';
import * as THREE from '../node_modules/three/build/three.module.js';

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

const code = fs.readFileSync(path.join(dir, 'tests/.harness-bundle.js'), 'utf8');
new Function(code)();
window.document.dispatchEvent(new window.Event('DOMContentLoaded', { bubbles: true }));
window.document.getElementById('btn-start').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
await new Promise((r) => setTimeout(r, 300));

const game = window.__game;
if (!game) throw new Error('game not created');
const log = (...a) => console.log(...a);

// --- 1. животные смотрят туда, куда идут (не боком) ---
const boar = game.mobs.list.find((m) => m.type === 'boar');
boar.facing = 0.8;
game.mobs._place(boar, 0.016);
const rotOff = Math.abs(((boar.group.rotation.y - boar.facing + Math.PI / 2) % (Math.PI * 2)));
log('зверь: facing', boar.facing.toFixed(2), '· поворот модели', boar.group.rotation.y.toFixed(2),
  '· поправка 90°:', rotOff < 0.001);

// --- 2. хитбокс совпадает с габаритами модели ---
const meshBox = new THREE.Box3();
boar.group.traverse((o) => {
  if (o.isMesh && o.name !== 'hitbox') meshBox.expandByObject(o);
});
const size = new THREE.Vector3();
meshBox.getSize(size);
const hb = boar.hitboxSize;
const diff = Math.max(Math.abs(size.x - hb.w), Math.abs(size.y - hb.h), Math.abs(size.z - hb.d));
log('коробка зверя: модель', `${size.x.toFixed(2)}×${size.y.toFixed(2)}×${size.z.toFixed(2)}`,
  '· хитбокс', `${hb.w.toFixed(2)}×${hb.h.toFixed(2)}×${hb.d.toFixed(2)}`,
  '· расхождение', diff.toFixed(3), 'м · по модели:', diff < 0.05);

// --- 3. камней на поверхности меньше, руда — редкость ---
const rockOre = game.world.rockList.filter((r) => r.kind === 'ore').length;
log('камней на поверхности:', game.world.rockList.length, '· рудных:', rockOre,
  '· меньше прежнего:', game.world.rockList.length < 300);

// --- 4. зазор 5 см между хитбоксами ---
let tooClose = 0;
const cols = game.world.colliders.filter((c) => !c.soft && !c.disabled);
for (let i = 0; i < Math.min(400, cols.length); i++) {
  for (let j = i + 1; j < Math.min(400, cols.length); j++) {
    const a = cols[i];
    const b = cols[j];
    const d = Math.hypot(a.x - b.x, a.z - b.z);
    if (d < a.r + b.r + 0.049) tooClose++;
  }
}
log('пересечений статики ближе 5 см:', tooClose, '· зазор соблюдён:', tooClose === 0);

// --- 5. копание слоя: песок осыпается, глубина растёт ---
const shore = (() => {
  for (let a = 0; a < Math.PI * 2; a += 0.05) {
    for (let r = 20; r < 130; r += 2) {
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      const h = game.world.heightAt(x, z);
      if (h > 0.7 && h < 2.2) return { x, z, h };
    }
  }
  return null;
})();
const beforeH = game.world.heightAt(shore.x, shore.z);
const dig1 = game.world.dig(shore.x, shore.z, { radius: 1.2, depth: 0.38 });
const afterH = game.world.heightAt(shore.x, shore.z);
log('копка: слой', dig1.layer, '· глубина', (beforeH - afterH).toFixed(2), 'м · опустилось:', afterH < beforeH);

// копаем до воды: несколько слоёв подряд в одной точке
let flooded = false;
for (let i = 0; i < 14 && !flooded; i++) {
  const r = game.world.dig(shore.x, shore.z, { radius: 1.2, depth: 0.45 });
  if (r && r.flooded) flooded = true;
}
log('вода залила яму:', flooded, '· высота дна', game.world.heightAt(shore.x, shore.z).toFixed(2));

// --- 6. креатив (F2 → F) ---
game.toggleCreative();
const creativeOn = game.creative && game.player.fly && (game.state.inventory.wood || 0) >= 999;
const hpBefore = game.state.health;
game.takeDamage(40, 'клыки кабана', boar);
const ignoreDamage = game.state.health === hpBefore;
log('креатив:', creativeOn, '· полёт:', game.player.fly, '· неуязвимость:', ignoreDamage,
  '· метка в HUD:', !document.getElementById('hud-creative').classList.contains('hidden'));
game.toggleCreative();
log('креатив выключен:', !game.creative && !game.player.fly);

// --- 7. ранения по частям тела ---
game.state.health = 100;
game.wounds = [];
const mob = game.mobs.list.find((m) => m.alive);
mob.x = game.player.position.x + 1.2;
mob.z = game.player.position.z + 1.2;
game.takeDamage(18, 'клыки кабана', mob);
const wound = game.wounds[0];
log('ранение:', wound ? wound.label : 'нет', '· частей тела с раной:', game.wounds.length,
  '· эффект:', game.player.speedMul < 1 || (game.armPenalty || 1) < 1 || wound.severity > 0);
game.addItem('bandage', 1);
game.consume('bandage');
log('бинт перевязал рану:', game.wounds.length === 0);

// --- 8. шахта: выход и копание вглубь ---
const entrance = game.mine.entrances[0];
game.enterMine(entrance);
const levelsBefore = game.mine.levels.length;
const deepSpot = game.mine.digDown();
const levelAfter = game.mine.levels.length;
log('шахта: слоёв было', levelsBefore, '· стало', levelAfter,
  '· новый слой глубже:', !!(deepSpot && game.mine.level && game.mine.level.y <= -32));
game.exitMine();
log('выход из шахты:', !game.underground, '· на поверхности y =', game.player.position.y.toFixed(1));
log('ошибок нет');
